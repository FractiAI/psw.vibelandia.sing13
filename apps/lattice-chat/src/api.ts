import { isRememberedEmailFresh } from '@/access';
import { useLatticeStore } from '@/store';
import type { TranscriptItem } from '@/types';

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
        'Only use Request access if you do not have a grant yet.',
      ].join('\n'),
    });
    store.setSending(false);
    return;
  }

  try {
    const res = await fetch('/api/lattice-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lattice-email': email,
      },
      body: JSON.stringify({
        threadId,
        message: trimmed,
        history,
        agentId: thread.agentId,
        email,
        model: store.modelId,
        mode: store.agentMode,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      reply?: string;
      runId?: string;
      agentId?: string;
      error?: string;
      detail?: string;
      transcript?: TranscriptItem[];
      model?: string;
      mode?: 'agent' | 'plan';
    };

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          data.error ||
            'This email is not on the access list yet. Use Request access (opens email), then Sign in after you’re granted.',
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

    store.appendMessage(threadId, {
      role: 'assistant',
      content,
      transcript: transcript.length
        ? transcript
        : [{ type: 'assistant', text: content }],
      model: data.model || store.modelId,
      mode: data.mode || store.agentMode,
    });
    if (data.agentId) store.setAgentId(threadId, data.agentId);
  } catch (err) {
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
