import { isRememberedEmailFresh } from '@/access';
import { buildLatticeExecution, buildLiveAgentRoster } from '@/latticeEngine';
import { useLatticeStore } from '@/store';
import type { LatticeExecution } from '@/types';

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

  let tick = 0;
  const pulse = window.setInterval(() => {
    tick += 1;
    store.setLiveAgents(buildLiveAgentRoster(trimmed, tick));
  }, 420);
  store.setLiveAgents(buildLiveAgentRoster(trimmed, 0));

  const history = [
    ...thread.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: trimmed },
  ];

  const email = store.userEmail.trim();
  const remembered = isRememberedEmailFresh(email, store.emailRememberedAt);

  if (!remembered) {
    await new Promise((r) => setTimeout(r, 500));
    window.clearInterval(pulse);
    const execution = buildLatticeExecution({
      message: trimmed,
      history,
      mode: 'edge',
      resumed: false,
      reply: 'ask-signin',
    });
    store.appendMessage(threadId, {
      role: 'assistant',
      content: [
        'Please sign in first.',
        '',
        'Use Sign in (if you already have access) or Sign up (to request access) in the main panel.',
        'No passwords — just your email, remembered on this device.',
      ].join('\n'),
      execution,
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
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      reply?: string;
      runId?: string;
      agentId?: string;
      error?: string;
      email?: string;
      execution?: LatticeExecution;
    };

    window.clearInterval(pulse);

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          'Access not granted for this email yet. Use Sign up to request access, then Sign in after you’re approved.',
        );
      }
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    const reply = (data.reply || '').trim() || '(No reply text returned.)';
    const execution =
      data.execution ??
      buildLatticeExecution({
        message: trimmed,
        history,
        mode: 'cloud',
        resumed: Boolean(thread.agentId),
        reply,
        runId: data.runId,
        agentId: data.agentId,
      });

    store.appendMessage(threadId, {
      role: 'assistant',
      content: reply,
      execution,
    });
    if (data.agentId) store.setAgentId(threadId, data.agentId);
  } catch (err) {
    window.clearInterval(pulse);
    const msg = err instanceof Error ? err.message : 'Chat request failed';
    store.setError(msg);
    const execution = buildLatticeExecution({
      message: trimmed,
      history,
      mode: 'edge',
      resumed: false,
      reply: msg,
    });
    store.appendMessage(threadId, {
      role: 'assistant',
      content: `Could not reach Lattice cloud: ${msg}`,
      execution,
    });
  } finally {
    store.setSending(false);
  }
}
