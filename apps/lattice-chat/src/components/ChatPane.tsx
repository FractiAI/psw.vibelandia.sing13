import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { isRememberedEmailFresh } from '@/access';
import { loadLatticeModels, sendLatticeMessage } from '@/api';
import { AuthPanel, RequestAccessLink, SignedInBar } from '@/components/AuthPanel';
import { AgentTranscript } from '@/components/AgentTranscript';
import { ComposerOptions } from '@/components/ComposerOptions';
import { useLatticeStore } from '@/store';

export function ChatPane() {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const sending = useLatticeStore((s) => s.sending);
  const error = useLatticeStore((s) => s.error);
  const agentMode = useLatticeStore((s) => s.agentMode);
  const modelId = useLatticeStore((s) => s.modelId);
  const models = useLatticeStore((s) => s.models);
  const setAgentMode = useLatticeStore((s) => s.setAgentMode);
  const setModelId = useLatticeStore((s) => s.setModelId);
  const ensureThread = useLatticeStore((s) => s.ensureThread);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = threads.find((t) => t.id === activeThreadId) ?? null;
  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const needsAccessGrant =
    Boolean(error) && /not on the access list|Request access|access expired/i.test(error || '');

  useEffect(() => {
    ensureThread();
  }, [ensureThread]);

  useEffect(() => {
    if (signedIn) void loadLatticeModels();
  }, [signedIn, userEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length, sending, signedIn]);

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
              If you already have a grant, enter your email / userid below. Request access only
              appears when you are not signed in for the current monthly period.
            </p>
            <AuthPanel />
          </div>
        ) : !thread || thread.messages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-lead">You’re signed in — ask anything.</p>
            <p className="empty-hint">
              Pick Agent or Plan and a model below — same Cursor agent options. Replies show
              thinking, tools, and text in the chat like Cursor.
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
                {m.role === 'user'
                  ? 'You'
                  : m.mode || m.model
                    ? `Lattice · ${m.mode || 'agent'}${m.model ? ` · ${m.model}` : ''}`
                    : 'Lattice'}
              </span>
              {m.role === 'assistant' && m.transcript?.length ? (
                <AgentTranscript items={m.transcript} />
              ) : (
                <div className="bubble-body">{m.content}</div>
              )}
            </article>
          ))
        )}
        {sending ? (
          <article className="bubble bubble-assistant thinking">
            <span className="bubble-role">Lattice</span>
            <div className="cx-block cx-status">
              Working… (first cloud runs can take a minute — keep this tab open or Lattice will
              recover when you return)
            </div>
          </article>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="chat-error" role="alert">
          {error}
          {needsAccessGrant || !signedIn ? (
            <>
              {' '}
              <RequestAccessLink fromEmail={userEmail} />
            </>
          ) : null}
        </p>
      ) : null}

      <form className="composer" onSubmit={onSubmit}>
        <ComposerOptions
          mode={agentMode}
          modelId={modelId}
          models={models}
          disabled={sending || !signedIn}
          onModeChange={setAgentMode}
          onModelChange={setModelId}
        />
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
