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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message || '';
  return (
    err.name === 'TypeError' ||
    /failed to fetch|networkerror|load failed|network request failed|aborted|abort/i.test(m)
  );
}

function isBusyPayload(data: LatticeResponse, status: number): boolean {
  return (
    status === 409 ||
    data.code === 'agent_busy' ||
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
    // Keep the request alive across brief backgrounding when the browser allows it.
    keepalive: true,
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

export async function loadLatticeModels(): Promise<void> {
  const store = useLatticeStore.getState();
  const email = store.userEmail.trim();
  if (!isRememberedEmailFresh(email, store.emailRememberedAt)) return;

  try {
    const res = await fetch(
      `/api/lattice-chat?models=1&email=${encodeURIComponent(email)}`,
      {
        headers: { 'x-lattice-email': email },
      },
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
    /* keep fallback models */
  }
}

export async function sendLatticeMessage(text: string): Promise<void> {
  const store = useLatticeStore.getState();
  const threadId = store.ensureThread();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) return;

  const trimmed = text.trim();
  if (!trimmed || store.sending) return;

  store.setError(null);
  store.setSending(true);
  store.appendMessage(threadId, { role: 'user', content: trimmed });

  const history = [
    ...thread.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: trimmed },
  ];

  const email = store.userEmail.trim();
  const remembered = isRememberedEmailFresh(email, store.emailRememberedAt);

  if (!remembered) {
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

  try {
    let { res, data } = await postLattice(baseBody, email);

    // Active-run conflict: recover the in-flight cloud run instead of failing.
    if (!res.ok && isBusyPayload(data, res.status) && (data.agentId || thread.agentId)) {
      store.setError('Agent still working — recovering the active run…');
      if (data.agentId) store.setAgentId(threadId, data.agentId);
      await sleep(2500);
      ({ res, data } = await postLattice(
        {
          ...baseBody,
          agentId: data.agentId || thread.agentId,
          recover: true,
        },
        email,
      ));
      // If recover returned nothing yet, one more wait + recover.
      if (!res.ok && (data.code === 'nothing_to_recover' || isBusyPayload(data, res.status))) {
        await sleep(4000);
        ({ res, data } = await postLattice(
          {
            ...baseBody,
            agentId: data.agentId || useLatticeStore.getState().threads.find((t) => t.id === threadId)
              ?.agentId,
            recover: true,
          },
          email,
        ));
      }
    }

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

    store.setError(null);
    applyAssistantReply(threadId, data, store.modelId, store.agentMode, {
      message: trimmed,
      history,
      resumed: Boolean(thread.agentId),
    });
  } catch (err) {
    // Tab blur / OS suspend often kills the fetch while the cloud agent keeps running.
    const agentId =
      useLatticeStore.getState().threads.find((t) => t.id === threadId)?.agentId ||
      thread.agentId;
    if (agentId && isNetworkFailure(err)) {
      store.setError('Connection interrupted — recovering cloud run…');
      try {
        for (let i = 0; i < 4; i++) {
          await sleep(2000 + i * 1500);
          const { res, data } = await postLattice(
            {
              threadId,
              recover: true,
              agentId,
              email,
              model: store.modelId,
              mode: store.agentMode,
              message: trimmed,
              history,
            },
            email,
          );
          if (res.ok) {
            store.setError(null);
            applyAssistantReply(threadId, data, store.modelId, store.agentMode, {
              message: trimmed,
              history,
              resumed: true,
            });
            return;
          }
          if (data.code === 'nothing_to_recover' || isBusyPayload(data, res.status)) {
            continue;
          }
          throw new Error(data.error || `Recover failed (${res.status})`);
        }
      } catch (recoverErr) {
        const msg =
          recoverErr instanceof Error ? recoverErr.message : 'Recover failed';
        store.setError(msg);
        store.appendMessage(threadId, {
          role: 'assistant',
          content: `Could not reach Lattice cloud: ${msg}`,
        });
        return;
      }
    }

    const msg = err instanceof Error ? err.message : 'Chat request failed';
    store.setError(msg);
    store.appendMessage(threadId, {
      role: 'assistant',
      content: `Could not reach Lattice cloud: ${msg}`,
    });
  } finally {
    store.setSending(false);
  }
}
