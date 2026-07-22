import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { isRememberedEmailFresh } from '@/access';
import {
  checkPendingLatticeReply,
  loadLatticeModels,
  sendLatticeMessage,
} from '@/api';
import { AuthPanel, RequestAccessLink, SignedInBar } from '@/components/AuthPanel';
import { AgentTranscript } from '@/components/AgentTranscript';
import { ComposerOptions } from '@/components/ComposerOptions';
import { TokenCompareFooter } from '@/components/TokenCompare';
import { useLatticeStore } from '@/store';

export function ChatPane() {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const sending = useLatticeStore((s) => s.sending);
  const sendPhase = useLatticeStore((s) => s.sendPhase);
  const statusHint = useLatticeStore((s) => s.statusHint);
  const pending = useLatticeStore((s) => s.pending);
  const error = useLatticeStore((s) => s.error);
  const agentMode = useLatticeStore((s) => s.agentMode);
  const modelId = useLatticeStore((s) => s.modelId);
  const models = useLatticeStore((s) => s.models);
  const setAgentMode = useLatticeStore((s) => s.setAgentMode);
  const setModelId = useLatticeStore((s) => s.setModelId);
  const ensureThread = useLatticeStore((s) => s.ensureThread);
  const [draft, setDraft] = useState('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checking, setChecking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = threads.find((t) => t.id === activeThreadId) ?? null;
  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const needsAccessGrant =
    Boolean(error) && /not on the access list|Request access|access expired/i.test(error || '');
  const lastIsUser =
    Boolean(thread?.messages.length) &&
    thread!.messages[thread!.messages.length - 1].role === 'user';
  const showWorking = sending || (lastIsUser && sendPhase !== 'idle' && Boolean(pending));

  useEffect(() => {
    ensureThread();
  }, [ensureThread]);

  useEffect(() => {
    if (signedIn) void loadLatticeModels();
  }, [signedIn, userEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length, sending, signedIn, statusHint, sendPhase]);

  useEffect(() => {
    if (!showWorking || !pending?.startedAt) {
      setElapsedSec(0);
      return;
    }
    const tick = () =>
      setElapsedSec(Math.max(0, Math.floor((Date.now() - pending.startedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [showWorking, pending?.startedAt]);

  // Returning to the tab: auto-check for a finished cloud reply.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState !== 'visible') return;
      const s = useLatticeStore.getState();
      if (!s.sending && s.sendPhase === 'idle') return;
      if (!s.pending && !s.sending) return;
      void checkPendingLatticeReply();
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signedIn) return;
    const text = draft;
    setDraft('');
    await sendLatticeMessage(text);
    inputRef.current?.focus();
  }

  async function onCheckReply() {
    setChecking(true);
    try {
      await checkPendingLatticeReply();
    } finally {
      setChecking(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e);
    }
  }

  const workingLabel =
    statusHint ||
    (sendPhase === 'recovering'
      ? 'Recovering cloud run…'
      : sendPhase === 'stuck'
        ? 'Still waiting — check for a reply instead of re-pasting.'
        : 'Working…');

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
              {m.role === 'assistant' && m.tokens ? (
                <TokenCompareFooter tokens={m.tokens} />
              ) : null}
            </article>
          ))
        )}
        {showWorking ? (
          <article className="bubble bubble-assistant thinking">
            <span className="bubble-role">Lattice</span>
            <div className="cx-block cx-status">
              {workingLabel}
              {elapsedSec > 0 ? ` · ${elapsedSec}s` : ''}
            </div>
            <div className="working-actions">
              <button
                type="button"
                className="working-check-btn"
                disabled={checking}
                onClick={() => void onCheckReply()}
              >
                {checking ? 'Checking…' : 'Check for reply'}
              </button>
              <span className="working-hint">
                Don’t re-paste — this attaches to the active cloud run.
              </span>
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
          {lastIsUser ? (
            <>
              {' '}
              <button type="button" className="error-check-btn" onClick={() => void onCheckReply()}>
                Check for reply
              </button>
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
          placeholder={
            showWorking
              ? 'Waiting on Lattice… use Check for reply instead of re-pasting'
              : signedIn
                ? 'Message Lattice…'
                : 'Sign in above to chat…'
          }
          disabled={!signedIn || (sending && sendPhase !== 'stuck')}
        />
        <button
          type="submit"
          disabled={
            !signedIn ||
            !draft.trim() ||
            (sending && sendPhase !== 'stuck' && draft.trim() !== pending?.prompt)
          }
        >
          {showWorking && draft.trim() === pending?.prompt ? 'Retry' : 'Send'}
        </button>
      </form>
    </main>
  );
}
