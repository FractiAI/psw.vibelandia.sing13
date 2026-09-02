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
import type { AgentMode, ReasoningLens, TokenCompare, TranscriptItem } from '@/types';
import {
  DEFAULT_REPO_ID,
  findRepository,
  LATTICE_REPOSITORIES_FALLBACK,
  type LatticeRepository,
} from '@/repositories';
import {
  isSharedCollabAgentThread,
  maybePublishCollabLive,
  newClientAgentEventId,
  publishCollabAgentMessage,
} from '@/feed/syncCollaborateAgent';
import {
  peerNameForId,
  resolveClientCollabPeerId,
} from '@/feed/seatIdentity';
import {
  LATTICE_PAYLOAD_TOO_LARGE_MESSAGE,
  LATTICE_WIRE_BUDGET_BYTES,
  formatWireSize,
  prepareLatticeWireBody,
} from '@/lib/requestBudget';

type LatticePrivilege = 'creator' | 'guest' | 'none';

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
  lens?: ReasoningLens;
  recovered?: boolean;
  tokens?: TokenCompare;
  execution?: { tokens?: TokenCompare };
  privilege?: LatticePrivilege;
  chatOnly?: boolean;
};

function applyAccessMeta(data: LatticeResponse | { privilege?: string }): void {
  const p = data.privilege;
  if (p !== 'creator' && p !== 'guest' && p !== 'none') return;
  useLatticeStore.getState().setPrivilege(p);
}

/** Email allowlist check — privilege is creator vs paid guest (shared SING13). */
export async function verifyLatticeAccess(email: string): Promise<{
  ok: boolean;
  privilege: LatticePrivilege;
  reason?: string;
  expiresAt?: string | null;
}> {
  const res = await fetch(`/api/lattice-chat?email=${encodeURIComponent(email.trim())}`);
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    privilege?: string;
    reason?: string;
    error?: string;
    expiresAt?: string | null;
  };
  const privilege: LatticePrivilege =
    data.privilege === 'creator' || data.privilege === 'guest' || data.privilege === 'none'
      ? data.privilege
      : 'none';
  applyAccessMeta({ privilege });
  return {
    ok: Boolean(data.ok ?? res.ok),
    privilege,
    reason: data.reason || data.error,
    expiresAt: data.expiresAt ?? null,
  };
}

const WATCHDOG_MS = 45_000;
/** Abort primary SSE only after this long with zero bytes (heartbeats count). */
const IDLE_ABORT_MS = 90_000;
/** Hard ceiling under Vercel maxDuration (~300s) before one recover attach. */
const PRIMARY_MAX_MS = 200_000;
const RECOVER_POLL_MS = 15_000;
const STATUS_TICK_MS = 2_000;
const HISTORY_WINDOW = 16;
const MAX_RECOVER_ATTEMPTS = 6;

/** Serialize recover so watchdog + visibility + Check don't stack attach races. */
let recoverGate: Promise<unknown> = Promise.resolve();

function withRecoverLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = recoverGate.then(fn, fn);
  recoverGate = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isHardLatticeFailure(data: LatticeResponse, status: number): boolean {
  if ([401, 403, 422, 504].includes(status)) return true;
  if (
    data.code === 'cursor_github_access' ||
    data.code === 'invalid_model' ||
    data.code === 'cursor_auth' ||
    data.code === 'missing_cursor_api_key' ||
    data.code === 'missing_provider_api_key' ||
    data.code === 'claude_auth' ||
    data.code === 'gemini_auth' ||
    data.code === 'agent_not_found' ||
    data.code === 'agent_create_timeout' ||
    data.code === 'guest_cursor_cloud_unavailable' ||
    data.code === 'sing13_write_locked'
  ) {
    return true;
  }
  return /GitHub|repository|branch|API key|access list|invalid model|cursor_github|agent not found|agent_not_found|anthropic|gemini|timed out|chat-only|plan mode|write-attach/i.test(
    data.error || '',
  );
}

function clearStaleAgentIfNeeded(threadId: string, data: LatticeResponse): void {
  if (
    data.code === 'agent_not_found' ||
    data.code === 'agent_create_timeout' ||
    data.clearAgent
  ) {
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

/** Live status copy — ship Valet voice, progressive wait. */
export function latticeProgressHint(elapsedSec: number, phase: string): string {
  const provider = useLatticeStore.getState().provider || 'cursor';
  const label =
    provider === 'claude' ? 'Claude' : provider === 'gemini' ? 'Antigravity' : 'your Valet';

  if (phase === 'recovering') {
    if (provider === 'claude') {
      return 'Claude has no separate cloud run to recover — wait on the live stream or resend.';
    }
    if (elapsedSec < 60) return `Finding the active run for ${label}…`;
    return `${label} still on deck — attaching when ready…`;
  }
  if (phase === 'stuck') {
    return provider === 'claude'
      ? 'Still waiting on Claude — keep this tab open.'
      : 'Still preparing — tap Check for reply (do not re-paste).';
  }
  if (elapsedSec < 8) return `On deck — starting ${label}…`;
  if (elapsedSec < 25) return 'Preparing — opening the thought stream…';
  if (elapsedSec < 50) return 'Your Valet is working — follow tools and reasoning below…';
  if (elapsedSec < 90) return `Still on it — ${label} will auto-check when needed…`;
  if (elapsedSec < 150) return 'Longer run — keep this tab open; Check for reply is safe';
  return 'Taking longer than usual — Check for reply, don’t re-enter the prompt';
}

export function latticeProgressStep(elapsedSec: number): number {
  if (elapsedSec < 8) return 0;
  if (elapsedSec < 25) return 1;
  if (elapsedSec < 70) return 2;
  return 3;
}

export const LATTICE_PROGRESS_STEPS = [
  'On deck',
  'Preparing',
  'Working',
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
    data.code === 'still_running' ||
    data.code === 'nothing_to_recover' ||
    /active run|agent[_\s-]?busy|still running/i.test(data.error || '')
  );
}

function latticeHeaders(email: string, provider?: LatticeProvider): HeadersInit {
  const active = provider || useLatticeStore.getState().provider || 'cursor';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-lattice-email': email,
    'x-lattice-provider': active,
  };
  const key = readProviderApiKey(active);
  if (key) {
    if (active === 'cursor') headers['x-cursor-api-key'] = key;
    else if (active === 'claude') headers['x-anthropic-api-key'] = key;
    else if (active === 'gemini') headers['x-gemini-api-key'] = key;
  }
  return headers;
}

/** Load curated + optional live repositories for the workstream switcher. */
export async function loadLatticeRepositories(): Promise<LatticeRepository[]> {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) {
    return LATTICE_REPOSITORIES_FALLBACK;
  }
  try {
    const qs = new URLSearchParams({
      repositories: '1',
      email,
      provider: store.provider,
    });
    const res = await fetch(`/api/lattice-chat?${qs}`, {
      headers: latticeHeaders(email, store.provider),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.repositories) && data.repositories.length) {
      return data.repositories as LatticeRepository[];
    }
  } catch {
    /* fallback */
  }
  return LATTICE_REPOSITORIES_FALLBACK;
}

function buildHistoryWindow(
  messages: { role: string; content: string }[],
  limit = HISTORY_WINDOW,
): { role: string; content: string }[] {
  return messages.slice(-limit).map((m) => ({ role: m.role, content: m.content }));
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
  opts?: { signal?: AbortSignal; onActivity?: () => void },
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
    signal: opts?.signal,
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
    const bump = () => {
      try {
        opts?.onActivity?.();
      } catch {
        /* ignore */
      }
    };

    const handleEvent = (event: string, data: unknown) => {
      bump();
      const payload = (data && typeof data === 'object' ? data : {}) as LatticeResponse & {
        message?: string;
        balanceBefore?: number;
        balanceAfter?: number;
        phase?: string;
        type?: string;
      };
      if (event === 'transcript' && payload && 'type' in payload) {
        store.pushLiveTranscript(payload as TranscriptItem);
        maybePublishCollabLive();
        return;
      }
      if (event === 'status') {
        const msg = payload.message || payload.error;
        if (msg) {
          // Keep phase on sending while primary is live — don't flip to recovering from status alone.
          const phase = store.sendPhase === 'recovering' || store.sendPhase === 'stuck'
            ? store.sendPhase
            : 'sending';
          store.setSendProgress(phase === 'idle' ? 'sending' : phase, msg);
        }
        if (payload.message) {
          store.pushLiveTranscript({ type: 'status', status: 'live', message: payload.message });
          maybePublishCollabLive();
        }
        return;
      }
      if (event === 'agent' && payload.agentId) {
        const threadId = String(body.threadId || store.activeThreadId || '');
        if (threadId) store.setAgentId(threadId, payload.agentId);
        store.patchPending({ agentId: payload.agentId });
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
      // Any bytes (including `: keepalive` comments) count as live activity.
      bump();
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

  applyAccessMeta(data);
  store.appendMessage(threadId, {
    role: 'assistant',
    content,
    transcript: transcript.length ? transcript : [{ type: 'assistant', text: content }],
    model: data.model || fallbackModel,
    mode: data.mode || fallbackMode,
    lens: data.lens || 'engine',
    tokens,
  });
  if (data.agentId) store.setAgentId(threadId, data.agentId);
  store.clearLiveTranscript();
  store.clearPending();

  if (isSharedCollabAgentThread(threadId)) {
    const thread = useLatticeStore.getState().threads.find((t) => t.id === threadId);
    const last = thread?.messages[thread.messages.length - 1];
    if (last?.role === 'assistant') {
      publishCollabAgentMessage(last);
    }
  }
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
  _prompt: string,
  _history: { role: string; content: string }[],
  email: string,
): Promise<boolean> {
  return withRecoverLock(async () => {
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
        provider: store.provider,
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
  });
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

  const history = buildHistoryWindow(thread.messages);
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

export async function sendLatticeMessage(
  text: string,
  attachments: Array<{
    name: string;
    mime: string;
    kind: 'image' | 'doc';
    text?: string;
    dataBase64?: string;
  }> = [],
): Promise<void> {
  const store = useLatticeStore.getState();
  const threadId = store.ensureThread();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) return;

  const trimmed = text.trim();
  const hasAttach = Array.isArray(attachments) && attachments.length > 0;
  if (!trimmed && !hasAttach) return;
  const displayContent = hasAttach
    ? trimmed
      ? `${trimmed}\n\nAttached: ${attachments.map((a) => a.name).join(', ')}`
      : `Attached: ${attachments.map((a) => a.name).join(', ')}`
    : trimmed;
  const wireMessage = trimmed || (hasAttach ? '(See attached files.)' : '');

  // Re-paste / retry of the same waiting prompt → recover, don't duplicate.
  const samePending =
    !hasAttach &&
    (store.pending?.prompt === wireMessage ||
      (awaitingAssistant(threadId) && lastUserPrompt(threadId) === wireMessage));
  if (store.sending || samePending) {
    if (samePending || store.sending) {
      await checkPendingLatticeReply();
      return;
    }
  }

  store.setError(null);
  store.setSending(true);
  store.setSendProgress('sending', 'Starting Lattice cloud agent…');
  const myPeerId = resolveClientCollabPeerId(store.userEmail);
  const senderName = myPeerId ? peerNameForId(myPeerId) : undefined;
  const userMsgId =
    isSharedCollabAgentThread(threadId) ? newClientAgentEventId('ca') : undefined;
  const appendedUserId = store.appendMessage(threadId, {
    role: 'user',
    content: displayContent,
    id: userMsgId,
    senderPeerId: myPeerId || undefined,
    senderName,
  });
  if (isSharedCollabAgentThread(threadId)) {
    const threadNow = useLatticeStore.getState().threads.find((t) => t.id === threadId);
    const userMsg = threadNow?.messages.find((m) => m.id === appendedUserId);
    if (userMsg) publishCollabAgentMessage(userMsg);
  }
  store.setPending({
    threadId,
    prompt: wireMessage,
    startedAt: Date.now(),
    agentId: thread.agentId,
  });

  const history = buildHistoryWindow([
    ...thread.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: displayContent },
  ]);

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

  const baseBody: Record<string, unknown> = {
    threadId,
    message: wireMessage,
    history,
    agentId: thread.agentId,
    email,
    model: store.modelId,
    mode: store.agentMode,
    provider: store.provider,
    nestTopology: store.nestTopology,
    repoId: store.activeRepoId || DEFAULT_REPO_ID,
    repoUrl:
      findRepository(store.activeRepoId || DEFAULT_REPO_ID, store.repositories)?.url ||
      findRepository(store.activeRepoId || DEFAULT_REPO_ID)?.url ||
      undefined,
  };
  if (store.agentRoster.trim()) {
    baseBody.agentRoster = store.agentRoster;
  }
  if (hasAttach) {
    baseBody.attachments = attachments;
  }

  const wirePack = prepareLatticeWireBody(baseBody);
  if (wirePack.bytes > LATTICE_WIRE_BUDGET_BYTES) {
    store.setError(
      `${LATTICE_PAYLOAD_TOO_LARGE_MESSAGE} (about ${formatWireSize(wirePack.bytes)}).`,
    );
    store.setSendProgress('idle', null);
    store.setSending(false);
    store.clearPending();
    return;
  }
  const wireBody = wirePack.body;

  let settled = false;
  let primaryStreamActive = false;
  const startedAt = Date.now();
  let lastActivityAt = Date.now();
  const primaryAbort = new AbortController();
  const markActivity = () => {
    lastActivityAt = Date.now();
  };

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

  // Status ticks: while primary SSE is live, stay on "sending" — do not fake recover/stuck.
  const statusTick = setInterval(() => {
    if (settled) return;
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    if (primaryStreamActive) {
      const phase = useLatticeStore.getState().sendPhase;
      if (phase === 'sending' || phase === 'idle') {
        store.setSendProgress('sending', latticeProgressHint(elapsed, 'sending'));
      }
      return;
    }
    const nextPhase =
      elapsed * 1000 >= WATCHDOG_MS * 2
        ? 'stuck'
        : elapsed * 1000 >= WATCHDOG_MS
          ? 'recovering'
          : 'sending';
    store.setSendProgress(nextPhase, latticeProgressHint(elapsed, nextPhase));
  }, STATUS_TICK_MS);

  const watchdog = setInterval(() => {
    void (async () => {
      if (settled) return;
      const now = Date.now();
      const elapsed = now - startedAt;
      const idleFor = now - lastActivityAt;

      // Never open a recover stream while the primary SSE is still alive and active.
      if (primaryStreamActive) {
        const idleDead = idleFor >= IDLE_ABORT_MS;
        const hardCap = elapsed >= PRIMARY_MAX_MS;
        if (idleDead || hardCap) {
          try {
            primaryAbort.abort();
          } catch {
            /* ignore */
          }
          primaryStreamActive = false;
          store.setSendProgress(
            'stuck',
            hardCap
              ? 'Long cloud run — attaching to finish the reply…'
              : 'Stream went quiet — attaching to the cloud run…',
          );
        }
        return;
      }

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
    markActivity();
    let { res, data } = await postLattice(wireBody, email, {
      signal: primaryAbort.signal,
      onActivity: markActivity,
    });
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
        { ...wireBody, agentId: data.agentId || thread.agentId, recover: true },
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
              : data.code === 'agent_create_timeout' || data.code === 'guest_cursor_cloud_unavailable'
                ? data.error ||
                  'Cursor cloud timed out. Send again, or switch to Claude / Gemini.'
              : data.code === 'sing13_write_locked'
                ? 'Could not attach SING13 for this seat. Hard refresh and send again, or switch to Claude / Gemini.'
              : res.status === 413
                ? LATTICE_PAYLOAD_TOO_LARGE_MESSAGE
              : res.status === 401
                ? 'This email is not on the access list yet. Request access, then Sign in after you’re granted.'
              : res.status === 403
                ? data.error || 'Request blocked. Try Claude or Gemini, or ask the creator if this is unexpected.'
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
          (res.status === 413
            ? LATTICE_PAYLOAD_TOO_LARGE_MESSAGE
            : `Request failed (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`),
      );
    }

    settleSuccess(data);
  } catch (err) {
    if (settled) return;
    const agentId =
      useLatticeStore.getState().pending?.agentId ||
      useLatticeStore.getState().threads.find((t) => t.id === threadId)?.agentId ||
      thread.agentId;

    const aborted =
      (err instanceof Error && err.name === 'AbortError') ||
      /aborted|The user aborted|AbortError/i.test(err instanceof Error ? err.message : String(err));

    // Abort during Agent.create (no agentId yet) used to soft-hang forever — fail loud instead.
    if (aborted && !agentId) {
      settled = true;
      const tip =
        store.provider === 'cursor'
          ? 'Cursor cloud did not finish spinning up. Send again, or switch provider to Claude / Gemini.'
          : 'The chat stream stalled before a reply. Send again, or switch provider.';
      store.setError(tip);
      store.setSendProgress('idle', null);
      store.setSending(false);
      store.clearPending();
      return;
    }

    const hardFail =
      err instanceof LatticeHardFail ||
      /access list|API key|GitHub|repository|branch|401|403|503|504|invalid model|cursor_github|agent not found|agent_not_found|timed out|chat-only|plan mode|write-attach/i.test(
        err instanceof Error ? err.message : String(err),
      );

    if (
      err instanceof LatticeHardFail &&
      (err.code === 'agent_not_found' ||
        err.code === 'agent_create_timeout' ||
        err.code === 'guest_cursor_cloud_unavailable')
    ) {
      store.setAgentId(threadId, null);
    }

    if (
      !hardFail &&
      agentId &&
      (isNetworkFailure(err) ||
        /active run|busy|aborted|The user aborted|AbortError/i.test(String(err)))
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
    if (hardFail || !agentId) {
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
    // Soft recover only when we already have a cloud agent id to attach to.
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
      store.setSending(false);
    })();
  } finally {
    primaryStreamActive = false;
    clearInterval(watchdog);
    clearInterval(statusTick);
    if (settled) store.setSending(false);
  }
}
