import { isRememberedEmailFresh } from '@/access';
import { estimateTokenCompare } from '@/components/TokenCompare';
import { useLatticeStore } from '@/store';
import type { AgentMode, TokenCompare, TranscriptItem } from '@/types';

type LatticeResponse = {
  reply?: string;
  runId?: string;
  agentId?: string;
  error?: string;
  detail?: string;
  code?: string;
  transcript?: TranscriptItem[];
  model?: string;
  mode?: AgentMode;
  recovered?: boolean;
  tokens?: TokenCompare;
  execution?: { tokens?: TokenCompare };
};

const WATCHDOG_MS = 70_000;
const RECOVER_POLL_MS = 8_000;
const MAX_RECOVER_ATTEMPTS = 10;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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

async function postLattice(
  body: Record<string, unknown>,
  email: string,
): Promise<{ res: Response; data: LatticeResponse }> {
  const res = await fetch('/api/lattice-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lattice-email': email,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as LatticeResponse;
  return { res, data };
}

function applyAssistantReply(
  threadId: string,
  data: LatticeResponse,
  fallbackModel: string,
  fallbackMode: AgentMode,
  estimateArgs?: {
    message: string;
    history?: { role?: string; content?: string }[];
    resumed?: boolean;
  },
): void {
  const store = useLatticeStore.getState();
  const reply = (data.reply || '').trim();
  const transcript = Array.isArray(data.transcript) ? data.transcript : [];
  const content =
    reply ||
    transcript
      .filter((i) => i.type === 'assistant')
      .map((i) => ('text' in i ? i.text : ''))
      .join('\n')
      .trim() ||
    '(No reply text returned.)';

  const tokens =
    data.tokens ||
    data.execution?.tokens ||
    (estimateArgs
      ? estimateTokenCompare({
          message: estimateArgs.message,
          history: estimateArgs.history,
          reply: content,
          resumed: estimateArgs.resumed,
        })
      : undefined);

  store.appendMessage(threadId, {
    role: 'assistant',
    content,
    transcript: transcript.length ? transcript : [{ type: 'assistant', text: content }],
    model: data.model || fallbackModel,
    mode: data.mode || fallbackMode,
    tokens,
  });
  if (data.agentId) store.setAgentId(threadId, data.agentId);
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

export async function loadLatticeModels(): Promise<void> {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) return;

  try {
    const res = await fetch(
      `/api/lattice-chat?models=1&email=${encodeURIComponent(email)}`,
      { headers: { 'x-lattice-email': email } },
    );
    const data = (await res.json().catch(() => ({}))) as {
      models?: { id: string; displayName?: string; description?: string }[];
    };
    const models = (data.models || [])
      .map((m) => ({
        id: String(m.id || '').trim(),
        displayName: String(m.displayName || m.id || '').trim(),
        description: m.description,
      }))
      .filter((m) => m.id);
    if (models.length) {
      store.setModels(models);
      if (!models.some((m) => m.id === store.modelId)) {
        store.setModelId(models[0].id);
      }
    }
  } catch {
    /* keep fallback */
  }
}

async function tryRecoverOnce(
  threadId: string,
  prompt: string,
  history: { role: string; content: string }[],
  email: string,
): Promise<boolean> {
  const store = useLatticeStore.getState();
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
    },
    email,
  );
  if (data.agentId) store.setAgentId(threadId, data.agentId);
  if (!res.ok) return false;
  if (!awaitingAssistant(threadId)) return true;

  applyAssistantReply(threadId, data, store.modelId, store.agentMode, {
    message: prompt,
    history,
    resumed: true,
  });
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
    store.setSendProgress('stuck', msg);
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

  const baseBody = {
    threadId,
    message: trimmed,
    history,
    agentId: thread.agentId,
    email,
    model: store.modelId,
    mode: store.agentMode,
  };

  let settled = false;
  const startedAt = Date.now();

  const settleSuccess = (data: LatticeResponse) => {
    if (settled || !awaitingAssistant(threadId)) {
      settled = true;
      store.setSending(false);
      return;
    }
    settled = true;
    applyAssistantReply(threadId, data, store.modelId, store.agentMode, {
      message: trimmed,
      history,
      resumed: Boolean(thread.agentId),
    });
    store.setError(null);
    store.setSending(false);
  };

  const watchdog = setInterval(() => {
    void (async () => {
      if (settled) return;
      const elapsed = Date.now() - startedAt;
      if (elapsed < WATCHDOG_MS) {
        store.setSendProgress(
          'sending',
          `Working… ${Math.round(elapsed / 1000)}s (cloud agents often take 1–3 min)`,
        );
        return;
      }
      store.setSendProgress(
        elapsed > WATCHDOG_MS * 2 ? 'stuck' : 'recovering',
        elapsed > WATCHDOG_MS * 2
          ? 'Still waiting — tap Check for reply instead of re-pasting.'
          : 'Taking longer than usual — checking cloud agent…',
      );
      try {
        const ok = await tryRecoverOnce(threadId, trimmed, history, email);
        if (ok && !settled) {
          settled = true;
          clearInterval(watchdog);
          store.setError(null);
          store.setSending(false);
        }
      } catch {
        /* primary may still finish */
      }
    })();
  }, RECOVER_POLL_MS);

  try {
    store.setSendProgress('sending', 'Metabolizing prompt on Lattice cloud…');
    let { res, data } = await postLattice(baseBody, email);
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
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          data.error ||
            'This email is not on the access list yet. Request access (opens a prefilled email), then Sign in after you’re granted.',
        );
      }
      if (res.status === 503) {
        throw new Error(
          data.error || 'Lattice cloud is not configured yet (server Cursor key missing).',
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

    if (agentId && (isNetworkFailure(err) || /active run|busy/i.test(String(err)))) {
      store.setSendProgress('recovering', 'Connection hiccup — recovering cloud run…');
      for (let i = 0; i < MAX_RECOVER_ATTEMPTS && !settled; i++) {
        await sleep(2000 + i * 1200);
        const ok = await tryRecoverOnce(threadId, trimmed, history, email);
        if (ok) {
          settled = true;
          store.setSending(false);
          return;
        }
      }
    }

    if (settled) return;
    const msg = err instanceof Error ? err.message : 'Chat request failed';
    store.setError(msg);
    store.setSendProgress(
      'stuck',
      'Send interrupted — tap Check for reply before re-pasting the prompt.',
    );
    // Keep pending so Check for reply / re-paste recover works.
    store.setSending(true);
  } finally {
    clearInterval(watchdog);
    if (settled) store.setSending(false);
  }
}
