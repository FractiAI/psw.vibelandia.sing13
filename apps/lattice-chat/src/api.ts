import { isRememberedEmailFresh } from '@/access';
import {
  buildMeasuredTokenCompare,
  hasMeasuredTokens,
} from '@/components/TokenCompare';
import {
  hasProviderApiKey,
  LATTICE_PROVIDERS,
  readProviderApiKey,
  type LatticeProvider,
} from '@/lib/providerKeys';
import {
  catalogForProvider,
  mergeProviderModels,
  LATTICE_MODEL_CATALOG,
  PROVIDER_DEFAULT_MODEL,
} from '@/modelCatalog';
import { useLatticeStore } from '@/store';
import type { AgentMode, TokenCompare, TranscriptItem } from '@/types';

type LatticeResponse = {
  reply?: string;
  runId?: string;
  agentId?: string;
  error?: string;
  detail?: string;
  code?: string;
  clearAgent?: boolean;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: AgentMode;
  recovered?: boolean;
  tokens?: TokenCompare;
  execution?: { tokens?: TokenCompare };
};

const WATCHDOG_MS = 45_000;
const RECOVER_POLL_MS = 8_000;
const STATUS_TICK_MS = 2_000;
const MAX_RECOVER_ATTEMPTS = 6;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isHardLatticeFailure(data: LatticeResponse, status: number): boolean {
  if ([401, 403, 422].includes(status)) return true;
  if (
    data.code === 'cursor_github_access' ||
    data.code === 'invalid_model' ||
    data.code === 'cursor_auth' ||
    data.code === 'missing_cursor_api_key' ||
    data.code === 'missing_provider_api_key' ||
    data.code === 'claude_auth' ||
    data.code === 'gemini_auth' ||
    data.code === 'agent_not_found'
  ) {
    return true;
  }
  return /GitHub|repository|branch|API key|access list|invalid model|cursor_github|agent not found|agent_not_found|anthropic|gemini/i.test(
    data.error || '',
  );
}

function clearStaleAgentIfNeeded(threadId: string, data: LatticeResponse): void {
  if (data.code === 'agent_not_found' || data.clearAgent) {
    useLatticeStore.getState().setAgentId(threadId, null);
  }
}

class LatticeHardFail extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'LatticeHardFail';
    this.code = code;
  }
}

/** Live status copy so the wait feels progressive, not frozen. */
export function latticeProgressHint(elapsedSec: number, phase: string): string {
  const provider = useLatticeStore.getState().provider || 'cursor';
  const label =
    provider === 'claude' ? 'Claude' : provider === 'gemini' ? 'Antigravity' : 'Lattice cloud agent';

  if (phase === 'recovering') {
    if (provider === 'claude') {
      return 'Claude has no separate cloud run to recover — wait on the live stream or resend.';
    }
    if (elapsedSec < 60) return `Looking up the active ${label} run…`;
    return `${label} still running — attaching when it finishes…`;
  }
  if (phase === 'stuck') {
    return provider === 'claude'
      ? 'Still waiting on Claude stream — keep this tab open.'
      : 'Still waiting — tap Check for reply (do not re-paste the prompt).';
  }
  if (elapsedSec < 8) return `Starting ${label}…`;
  if (elapsedSec < 25) return `${label} is up — stream of thought opening…`;
  if (elapsedSec < 50) return 'Follow the live thought stream — tools and reasoning below…';
  if (elapsedSec < 90) return `Still working — ${label} auto-checks when needed…`;
  if (elapsedSec < 150) return 'Long run — keep this tab open; Check for reply is safe';
  return 'Taking longer than usual — Check for reply, don’t re-enter the prompt';
}

export function latticeProgressStep(elapsedSec: number): number {
  if (elapsedSec < 8) return 0;
  if (elapsedSec < 25) return 1;
  if (elapsedSec < 70) return 2;
  return 3;
}

export const LATTICE_PROGRESS_STEPS = [
  'Start',
  'Repo',
  'Work',
  'Reply',
] as const;

function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message || '';
  return (
    err.name === 'TypeError' ||
    /failed to fetch|networkerror|load failed|network request failed|aborted|abort|timeout/i.test(
      m,
    )
  );
}

function isBusyPayload(data: LatticeResponse, status: number): boolean {
  return (
    status === 409 ||
    data.code === 'agent_busy' ||
    data.code === 'nothing_to_recover' ||
    /active run|agent[_\s-]?busy/i.test(data.error || '')
  );
}

function latticeHeaders(email: string, provider?: LatticeProvider): HeadersInit {
  const active = provider || useLatticeStore.getState().provider || 'cursor';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-lattice-email': email,
    'x-lattice-provider': active,
  };
  const cursor = readProviderApiKey('cursor');
  const claude = readProviderApiKey('claude');
  const gemini = readProviderApiKey('gemini');
  if (cursor) headers['x-cursor-api-key'] = cursor;
  if (claude) headers['x-anthropic-api-key'] = claude;
  if (gemini) headers['x-gemini-api-key'] = gemini;
  return headers;
}

function parseSseChunk(
  buffer: string,
  onEvent: (event: string, data: unknown) => void,
): string {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const part of parts) {
    const lines = part.split('\n');
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    const raw = dataLines.join('\n');
    try {
      onEvent(event, JSON.parse(raw));
    } catch {
      onEvent(event, raw);
    }
  }
  return rest;
}

async function postLattice(
  body: Record<string, unknown>,
  email: string,
): Promise<{ res: Response; data: LatticeResponse }> {
  // Live stream-of-thought for Cursor, Claude, and Gemini when the pipe supports SSE.
  const wantStream = body.stream !== false;
  const headers = {
    ...(latticeHeaders(email) as Record<string, string>),
    ...(wantStream ? { Accept: 'text/event-stream' } : {}),
  };
  const res = await fetch('/api/lattice-chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(wantStream ? { ...body, stream: true } : body),
  });

  const contentType = String(res.headers.get('content-type') || '');
  if (wantStream && /text\/event-stream/i.test(contentType) && res.body) {
    const store = useLatticeStore.getState();
    // Recover/watchdog must not wipe the live thought stream from the primary SSE.
    if (!body.recover) {
      store.clearLiveTranscript();
    }
    let donePayload: LatticeResponse | null = null;
    let errorPayload: LatticeResponse | null = null;
    let buffer = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    const handleEvent = (event: string, data: unknown) => {
      const payload = (data && typeof data === 'object' ? data : {}) as LatticeResponse & {
        message?: string;
        balanceBefore?: number;
        balanceAfter?: number;
        phase?: string;
        type?: string;
      };
      if (event === 'transcript' && payload && 'type' in payload) {
        store.pushLiveTranscript(payload as TranscriptItem);
        return;
      }
      if (event === 'status') {
        const msg = payload.message || payload.error;
        if (msg) store.setSendProgress(store.sendPhase === 'idle' ? 'sending' : store.sendPhase, msg);
        if (payload.message) {
          store.pushLiveTranscript({ type: 'status', status: 'live', message: payload.message });
        }
        return;
      }
      if (event === 'agent' && payload.agentId) {
        const threadId = String(body.threadId || store.activeThreadId || '');
        if (threadId) store.setAgentId(threadId, payload.agentId);
        return;
      }
      if (event === 'balance') {
        const before = payload.balanceBefore;
        const after = payload.balanceAfter;
        if (payload.phase === 'before' && typeof before === 'number') {
          store.patchPending({ balanceBefore: before });
          store.pushLiveTranscript({
            type: 'status',
            status: 'balance',
            message: `Token balance before · ${before.toLocaleString()}`,
          });
        } else if (typeof before === 'number' && typeof after === 'number') {
          store.pushLiveTranscript({
            type: 'status',
            status: 'balance',
            message: `Token balance ${before.toLocaleString()} → ${after.toLocaleString()}`,
          });
        }
        return;
      }
      if (event === 'done') {
        donePayload = payload as LatticeResponse;
        return;
      }
      if (event === 'error') {
        errorPayload = payload as LatticeResponse;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSseChunk(buffer, handleEvent);
    }
    if (buffer.trim()) parseSseChunk(`${buffer}\n\n`, handleEvent);

    if (errorPayload) {
      return {
        res: {
          ok: false,
          status: typeof (errorPayload as { status?: number }).status === 'number'
            ? (errorPayload as { status: number }).status
            : 502,
          statusText: 'SSE Error',
        } as Response,
        data: errorPayload,
      };
    }
    return {
      res: { ok: true, status: 200, statusText: 'OK' } as Response,
      data: donePayload || {},
    };
  }

  const data = (await res.json().catch(() => ({}))) as LatticeResponse;
  return { res, data };
}

function pickMeasuredTokens(data: LatticeResponse): TokenCompare | undefined {
  const raw = data.tokens || data.execution?.tokens;
  if (raw && hasMeasuredTokens(raw)) {
    return {
      ...raw,
      latticeTokens:
        (typeof raw.measuredTokens === 'number' && raw.measuredTokens > 0
          ? raw.measuredTokens
          : null) ??
        (typeof raw.balanceDelta === 'number' ? raw.balanceDelta : null) ??
        raw.latticeTokens,
      latticeLabel: 'Tokens used',
      method:
        typeof raw.balanceBefore === 'number' && typeof raw.balanceAfter === 'number'
          ? 'Measured from provider token balances (before → after delta)'
          : 'Measured from provider run usage',
    };
  }
  return buildMeasuredTokenCompare({
    usageTokens: raw?.measuredTokens ?? raw?.latticeTokens,
    balanceBefore: raw?.balanceBefore,
    balanceAfter: raw?.balanceAfter,
  });
}

function applyAssistantReply(
  threadId: string,
  data: LatticeResponse,
  fallbackModel: string,
  fallbackMode: AgentMode,
): void {
  const store = useLatticeStore.getState();
  const reply = (data.reply || '').trim();
  const live = useLatticeStore.getState().liveTranscript;
  const transcript = Array.isArray(data.transcript) && data.transcript.length
    ? data.transcript
    : live.length
      ? live
      : [];
  const content =
    reply ||
    transcript
      .filter((i) => i.type === 'assistant')
      .map((i) => ('text' in i ? i.text : ''))
      .join('\n')
      .trim() ||
    '(No reply text returned.)';

  // Chat meter = actual balances/usage only — never chars÷4 estimates.
  const tokens = pickMeasuredTokens(data);

  store.appendMessage(threadId, {
    role: 'assistant',
    content,
    transcript: transcript.length ? transcript : [{ type: 'assistant', text: content }],
    model: data.model || fallbackModel,
    mode: data.mode || fallbackMode,
    tokens,
  });
  if (data.agentId) store.setAgentId(threadId, data.agentId);
  store.clearLiveTranscript();
  store.clearPending();
}

function lastUserPrompt(threadId: string): string | null {
  const thread = useLatticeStore.getState().threads.find((t) => t.id === threadId);
  if (!thread?.messages.length) return null;
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    if (thread.messages[i].role === 'user') return thread.messages[i].content.trim();
  }
  return null;
}

function awaitingAssistant(threadId: string): boolean {
  const thread = useLatticeStore.getState().threads.find((t) => t.id === threadId);
  if (!thread?.messages.length) return false;
  return thread.messages[thread.messages.length - 1].role === 'user';
}

export function threadAwaitingAssistant(threadId: string | null | undefined): boolean {
  if (!threadId) return false;
  return awaitingAssistant(threadId);
}

export async function loadLatticeModels(): Promise<void> {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) return;

  const provider = store.provider || 'cursor';
  // Always seed provider catalog so the picker never collapses.
  store.setModels(catalogForProvider(provider));
  if (!hasProviderApiKey(provider)) return;

  if (provider !== 'cursor') {
    const models = catalogForProvider(provider);
    store.setModels(models);
    if (!models.some((m) => m.id === store.modelId)) {
      store.setModelId(PROVIDER_DEFAULT_MODEL[provider]);
    }
    return;
  }

  try {
    const res = await fetch(
      `/api/lattice-chat?models=1&email=${encodeURIComponent(email)}&provider=cursor`,
      { headers: latticeHeaders(email, 'cursor') as Record<string, string> },
    );
    const data = (await res.json().catch(() => ({}))) as {
      models?: { id: string; displayName?: string; description?: string }[];
    };
    const live = (data.models || [])
      .map((m) => ({
        id: String(m.id || '').trim(),
        displayName: String(m.displayName || m.id || '').trim(),
        description: m.description,
      }))
      .filter((m) => m.id);
    const models = mergeProviderModels('cursor', live.length ? live : LATTICE_MODEL_CATALOG);
    store.setModels(models);
    if (!models.some((m) => m.id === store.modelId)) {
      store.setModelId(models[0]?.id || PROVIDER_DEFAULT_MODEL.cursor);
    }
  } catch {
    store.setModels(LATTICE_MODEL_CATALOG);
  }
}

async function tryRecoverOnce(
  threadId: string,
  prompt: string,
  history: { role: string; content: string }[],
  email: string,
): Promise<boolean> {
  const store = useLatticeStore.getState();
  // Claude Messages API has no durable cloud run to recover.
  if (store.provider === 'claude') return false;
  const thread = store.threads.find((t) => t.id === threadId);
  const agentId = store.pending?.agentId || thread?.agentId;
  if (!agentId) return false;
  if (!awaitingAssistant(threadId)) return true;

  const { res, data } = await postLattice(
    {
      threadId,
      recover: true,
      agentId,
      email,
      model: store.modelId,
      mode: store.agentMode,
      message: prompt,
      history,
      provider: store.provider,
      nestTopology: store.nestTopology,
      agentRoster: store.agentRoster,
      balanceBefore: store.pending?.balanceBefore ?? null,
    },
    email,
  );
  if (data.agentId) store.setAgentId(threadId, data.agentId);
  if (!res.ok) {
    clearStaleAgentIfNeeded(threadId, data);
    if (isHardLatticeFailure(data, res.status)) {
      throw new LatticeHardFail(
        data.error || `Recover failed (${res.status})`,
        data.code,
      );
    }
    return false;
  }
  if (!awaitingAssistant(threadId)) return true;

  applyAssistantReply(threadId, data, store.modelId, store.agentMode);
  store.setError(null);
  return true;
}

/** Manual / visibility recover — no duplicate user bubble. */
export async function checkPendingLatticeReply(): Promise<boolean> {
  const store = useLatticeStore.getState();
  const pending = store.pending;
  const threadId = pending?.threadId || store.activeThreadId || store.ensureThread();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) return false;

  const prompt = pending?.prompt || lastUserPrompt(threadId);
  if (!prompt || !awaitingAssistant(threadId)) {
    store.setSending(false);
    store.clearPending();
    return false;
  }

  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) return false;

  const history = thread.messages.map((m) => ({ role: m.role, content: m.content }));
  if (!store.pending) {
    store.setPending({
      threadId,
      prompt,
      startedAt: Date.now(),
      agentId: thread.agentId,
    });
  }

  store.setSending(true);
  store.setSendProgress('recovering', 'Looking up the active cloud run…');
  store.setError(null);

  try {
    for (let i = 0; i < MAX_RECOVER_ATTEMPTS; i++) {
      const ok = await tryRecoverOnce(threadId, prompt, history, email);
      if (ok) {
        store.setSending(false);
        return true;
      }
      store.setSendProgress(
        i > 2 ? 'stuck' : 'recovering',
        i > 2
          ? 'Still waiting on the cloud agent — check again in a moment.'
          : `Cloud agent still running… (${i + 1}/${MAX_RECOVER_ATTEMPTS})`,
      );
      await sleep(RECOVER_POLL_MS);
      if (!awaitingAssistant(threadId)) {
        store.setSending(false);
        return true;
      }
    }
    store.setError('Cloud agent is still busy. Tap Check for reply again shortly.');
    store.setSendProgress('stuck', 'No reply yet — keep this tab open and check again.');
    return false;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Recover failed';
    store.setError(msg);
    if (err instanceof LatticeHardFail) {
      store.setSendProgress('idle', null);
      store.setSending(false);
      store.clearPending();
    } else {
      store.setSendProgress('stuck', msg);
    }
    return false;
  }
}

export async function sendLatticeMessage(text: string): Promise<void> {
  const store = useLatticeStore.getState();
  const threadId = store.ensureThread();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) return;

  const trimmed = text.trim();
  if (!trimmed) return;

  // Re-paste / retry of the same waiting prompt → recover, don't duplicate.
  const samePending =
    store.pending?.prompt === trimmed ||
    (awaitingAssistant(threadId) && lastUserPrompt(threadId) === trimmed);
  if (store.sending || samePending) {
    if (samePending || store.sending) {
      await checkPendingLatticeReply();
      return;
    }
  }

  store.setError(null);
  store.setSending(true);
  store.setSendProgress('sending', 'Starting Lattice cloud agent…');
  store.appendMessage(threadId, { role: 'user', content: trimmed });
  store.setPending({
    threadId,
    prompt: trimmed,
    startedAt: Date.now(),
    agentId: thread.agentId,
  });

  const history = [
    ...thread.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: trimmed },
  ];

  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) {
    store.appendMessage(threadId, {
      role: 'assistant',
      content: [
        'Please sign in first.',
        '',
        'Enter your email / userid in the main panel (remembered 30 days on this device).',
      ].join('\n'),
    });
    store.setSending(false);
    return;
  }

  if (!hasProviderApiKey(store.provider)) {
    const meta = LATTICE_PROVIDERS.find((p) => p.id === store.provider);
    store.appendMessage(threadId, {
      role: 'assistant',
      content: [
        `Add your ${meta?.label || store.provider} API key before chatting.`,
        '',
        'Open key settings, paste the key for the active provider (saved only on this device), then send again.',
      ].join('\n'),
    });
    store.setSending(false);
    return;
  }

  const baseBody = {
    threadId,
    message: trimmed,
    history,
    agentId: thread.agentId,
    email,
    model: store.modelId,
    mode: store.agentMode,
    provider: store.provider,
    nestTopology: store.nestTopology,
    agentRoster: store.agentRoster,
  };

  let settled = false;
  let primaryStreamActive = false;
  const startedAt = Date.now();

  const settleSuccess = (data: LatticeResponse) => {
    if (settled || !awaitingAssistant(threadId)) {
      settled = true;
      store.setSending(false);
      store.clearPending();
      return;
    }
    settled = true;
    applyAssistantReply(threadId, data, store.modelId, store.agentMode);
    store.setError(null);
    store.setSending(false);
  };

  // Dual timers: frequent status ticks + recover polls (keep running until settled).
  const statusTick = setInterval(() => {
    if (settled) return;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const phase = useLatticeStore.getState().sendPhase;
    const nextPhase =
      elapsed * 1000 >= WATCHDOG_MS * 2
        ? 'stuck'
        : elapsed * 1000 >= WATCHDOG_MS
          ? 'recovering'
          : 'sending';
    store.setSendProgress(nextPhase, latticeProgressHint(elapsed, nextPhase || phase));
  }, STATUS_TICK_MS);

  const watchdog = setInterval(() => {
    void (async () => {
      if (settled) return;
      // Primary SSE still open — do not open a second recover stream that races it.
      if (primaryStreamActive) return;
      const elapsed = Date.now() - startedAt;
      if (elapsed < WATCHDOG_MS) return;
      store.setSendProgress(
        elapsed > WATCHDOG_MS * 2 ? 'stuck' : 'recovering',
        latticeProgressHint(Math.round(elapsed / 1000), elapsed > WATCHDOG_MS * 2 ? 'stuck' : 'recovering'),
      );
      try {
        const ok = await tryRecoverOnce(threadId, trimmed, history, email);
        if (ok && !settled) {
          settled = true;
          clearInterval(watchdog);
          clearInterval(statusTick);
          store.setError(null);
          store.setSending(false);
        }
      } catch (recoverErr) {
        if (recoverErr instanceof LatticeHardFail) {
          settled = true;
          clearInterval(watchdog);
          clearInterval(statusTick);
          store.setError(recoverErr.message);
          store.setSendProgress('idle', null);
          store.setSending(false);
          store.clearPending();
        }
      }
    })();
  }, RECOVER_POLL_MS);

  try {
    store.setSendProgress('sending', latticeProgressHint(0, 'sending'));
    primaryStreamActive = true;
    let { res, data } = await postLattice(baseBody, email);
    primaryStreamActive = false;
    if (settled) return;
    if (data.agentId) store.setAgentId(threadId, data.agentId);

    if (!res.ok && isBusyPayload(data, res.status) && (data.agentId || thread.agentId)) {
      store.setSendProgress('recovering', 'Agent already running — attaching to that run…');
      if (data.agentId) store.setAgentId(threadId, data.agentId);
      for (let i = 0; i < 6 && !settled; i++) {
        await sleep(2500 + i * 1000);
        const ok = await tryRecoverOnce(threadId, trimmed, history, email);
        if (ok) {
          settled = true;
          store.setSending(false);
          return;
        }
      }
      if (settled) return;
      ({ res, data } = await postLattice(
        { ...baseBody, agentId: data.agentId || thread.agentId, recover: true },
        email,
      ));
    }

    if (settled) return;

    if (!res.ok) {
      clearStaleAgentIfNeeded(threadId, data);
      if (isHardLatticeFailure(data, res.status)) {
        throw new LatticeHardFail(
          data.error ||
            (data.code === 'missing_cursor_api_key'
              ? 'Cursor API key required. Add or update your key in Lattice settings.'
              : data.code === 'agent_not_found'
                ? 'Previous cloud agent is gone (common after a new Cursor key). Send your message again.'
              : res.status === 401 || res.status === 403
                ? 'This email is not on the access list yet. Request access, then Sign in after you’re granted.'
                : `Request failed (${res.status})`),
          data.code,
        );
      }
      if (res.status === 503) {
        throw new LatticeHardFail(
          data.error || 'Lattice cloud is temporarily unavailable.',
          data.code,
        );
      }
      throw new Error(
        data.error ||
          data.detail ||
          `Request failed (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`,
      );
    }

    settleSuccess(data);
  } catch (err) {
    if (settled) return;
    const agentId =
      useLatticeStore.getState().threads.find((t) => t.id === threadId)?.agentId ||
      thread.agentId;

    const hardFail =
      err instanceof LatticeHardFail ||
      /access list|API key|GitHub|repository|branch|401|403|503|invalid model|cursor_github|agent not found|agent_not_found/i.test(
        err instanceof Error ? err.message : String(err),
      );

    if (err instanceof LatticeHardFail && err.code === 'agent_not_found') {
      store.setAgentId(threadId, null);
    }

    if (
      !hardFail &&
      agentId &&
      (isNetworkFailure(err) || /active run|busy/i.test(String(err)))
    ) {
      store.setSendProgress('recovering', 'Connection hiccup — recovering cloud run…');
      try {
        for (let i = 0; i < MAX_RECOVER_ATTEMPTS && !settled; i++) {
          await sleep(2000 + i * 1200);
          const ok = await tryRecoverOnce(threadId, trimmed, history, email);
          if (ok) {
            settled = true;
            store.setSending(false);
            return;
          }
        }
      } catch (recoverErr) {
        if (recoverErr instanceof LatticeHardFail) {
          store.setError(recoverErr.message);
          store.setSendProgress('idle', null);
          store.setSending(false);
          store.clearPending();
          return;
        }
      }
    }

    if (settled) return;
    const msg = err instanceof Error ? err.message : 'Chat request failed';
    store.setError(msg);
    if (hardFail) {
      store.setSendProgress('idle', null);
      store.setSending(false);
      store.clearPending();
      return;
    }
    store.setSendProgress(
      'stuck',
      'Send interrupted — tap Check for reply before re-pasting the prompt.',
    );
    store.setSending(true);
    // Soft hang only — auto-check without hammering on hard GitHub/auth failures.
    void (async () => {
      for (let i = 0; i < MAX_RECOVER_ATTEMPTS && awaitingAssistant(threadId); i++) {
        await sleep(RECOVER_POLL_MS);
        if (!awaitingAssistant(threadId)) return;
        store.setSendProgress(
          'recovering',
          latticeProgressHint(Math.round((Date.now() - startedAt) / 1000), 'recovering'),
        );
        try {
          const ok = await tryRecoverOnce(threadId, trimmed, history, email);
          if (ok) {
            store.setError(null);
            store.setSending(false);
            return;
          }
        } catch (recoverErr) {
          if (recoverErr instanceof LatticeHardFail) {
            store.setError(recoverErr.message);
            store.setSendProgress('idle', null);
            store.setSending(false);
            store.clearPending();
            return;
          }
        }
      }
      store.setSendProgress(
        'stuck',
        latticeProgressHint(Math.round((Date.now() - startedAt) / 1000), 'stuck'),
      );
    })();
  } finally {
    primaryStreamActive = false;
    clearInterval(watchdog);
    clearInterval(statusTick);
    if (settled) store.setSending(false);
  }
}
