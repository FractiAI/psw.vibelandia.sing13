import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { isRememberedEmailFresh } from '@/access';
import { sendLatticeMessage } from '@/api';
import { AuthPanel, SignedInBar } from '@/components/AuthPanel';
import { AgentBoard, ExecutionReport } from '@/components/ExecutionReport';
import { useLatticeStore } from '@/store';

export function ChatPane() {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const sending = useLatticeStore((s) => s.sending);
  const liveAgents = useLatticeStore((s) => s.liveAgents);
  const error = useLatticeStore((s) => s.error);
  const ensureThread = useLatticeStore((s) => s.ensureThread);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = threads.find((t) => t.id === activeThreadId) ?? null;
  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);

  useEffect(() => {
    ensureThread();
  }, [ensureThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length, sending, liveAgents, signedIn]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signedIn) return;
    const text = draft;
    setDraft('');
    await sendLatticeMessage(text);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e);
    }
  }

  return (
    <main className="chat-pane">
      <header className="chat-header">
        <div className="chat-header-row">
          <h1 className="chat-title">
            <span className="chat-wordmark">Lattice V1.618</span>
            <span className="chat-by">by FractiAI</span>
          </h1>
          {signedIn ? <SignedInBar /> : null}
        </div>
        <p className="chat-sub">
          Nested agents as simple as chat.{' '}
          <a href="/lattice">What is Lattice?</a>
        </p>
      </header>

      <div className="message-scroll" role="log" aria-live="polite">
        {!signedIn ? (
          <div className="auth-stage">
            <p className="empty-lead">Sign in to use Lattice</p>
            <p className="empty-hint">
              If you already have access, enter your email / userid below. Request access only if
              you still need a grant.
            </p>
            <AuthPanel />
          </div>
        ) : !thread || thread.messages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-lead">You’re signed in — ask anything.</p>
            <p className="empty-hint">
              Histories stay on this device. Each reply shows the Lattice engine, agent board, and
              token-savings ledger.
            </p>
          </div>
        ) : (
          thread.messages.map((m) => (
            <article
              key={m.id}
              className={`bubble bubble-${m.role}`}
              data-role={m.role}
            >
              <span className="bubble-role">
                {m.role === 'user' ? 'You' : 'Lattice'}
              </span>
              <div className="bubble-body">{m.content}</div>
              {m.role === 'assistant' && m.execution ? (
                <ExecutionReport execution={m.execution} />
              ) : null}
            </article>
          ))
        )}
        {sending ? (
          <article className="bubble bubble-assistant thinking">
            <span className="bubble-role">Lattice engine</span>
            <div className="bubble-body">Metabolizing · crystallizing nested agents…</div>
            {liveAgents.length > 0 ? (
              <AgentBoard agents={liveAgents} title="Active agents (live)" />
            ) : null}
          </article>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="chat-error" role="alert">{error}</p> : null}

      <form className="composer" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="lattice-composer">
          Message
        </label>
        <textarea
          id="lattice-composer"
          ref={inputRef}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={signedIn ? 'Message Lattice…' : 'Sign in above to chat…'}
          disabled={sending || !signedIn}
        />
        <button type="submit" disabled={sending || !signedIn || !draft.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
