import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  LATTICE_ACCESS_EMAIL,
  LATTICE_ACCESS_MAILTO,
  isCreatorEmail,
  isRememberedEmailFresh,
} from '@/access';
import { sendLatticeMessage } from '@/api';
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
  const remembered = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const creator = remembered && isCreatorEmail(userEmail);

  useEffect(() => {
    ensureThread();
  }, [ensureThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length, sending, liveAgents]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
        <h1 className="chat-title">
          <span className="chat-wordmark">Lattice V1.618</span>
          <span className="chat-by">by FractiAI</span>
        </h1>
        <p className="chat-sub">
          Nested agent lattice — as simple as chat.{' '}
          <a href="/lattice">What is Lattice V1.618?</a>
        </p>
        {!remembered ? (
          <p className="chat-access-line">
            What’s your email? Enter it once in the left rail (no passwords).{' '}
            <a href={LATTICE_ACCESS_MAILTO}>Email me for access and pricing</a>
          </p>
        ) : creator ? (
          <p className="chat-access-line ok">
            Creator · {userEmail} · permanent
          </p>
        ) : (
          <p className="chat-access-line ok">
            Remembered · {userEmail} · guest ~1 month
          </p>
        )}
      </header>

      <div className="message-scroll" role="log" aria-live="polite">
        {!thread || thread.messages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-lead">Compose here — histories never leave this browser.</p>
            <p className="empty-hint">
              Old-school access: we ask for your email once and remember it on this device.
              Creator ({LATTICE_ACCESS_EMAIL}) is permanent; guests last one month after grant.
            </p>
            <a className="empty-cta" href={LATTICE_ACCESS_MAILTO}>
              Email me for access and pricing
            </a>
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
          placeholder={
            remembered
              ? 'Message Lattice…'
              : 'Enter your email in the left rail first…'
          }
          disabled={sending}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
