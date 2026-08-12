import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { isRememberedEmailFresh, MAIN_DECK_HREF, MAIN_DECK_LABEL } from '@/access';
import {
  checkPendingLatticeReply,
  LATTICE_PROGRESS_STEPS,
  latticeProgressHint,
  latticeProgressStep,
  loadLatticeModels,
  sendLatticeMessage,
  threadAwaitingAssistant,
  verifyLatticeAccess,
} from '@/api';
import { AuthPanel, RequestAccessLink, SignedInBar } from '@/components/AuthPanel';
import { AgentTranscript } from '@/components/AgentTranscript';
import { MarkdownBody } from '@/components/MarkdownBody';
import { ComposerOptions } from '@/components/ComposerOptions';
import { KeySettingsPanel } from '@/components/KeySettings';
import { TokenCompareFooter, hasMeasuredTokens } from '@/components/TokenCompare';
import { hasProviderApiKey, subscribeProviderKeys } from '@/lib/providerKeys';
import { useLatticeStore } from '@/store';
import { findRepository, DEFAULT_REPO_ID } from '@/repositories';
import { CollabDmBadge } from '@/components/collaborate/CollabDmNotifier';
import { useUnifiedFeed } from '@/feed/store';
import { resolveClientCollabPeerId } from '@/feed/seatIdentity';

export function ChatPane({
  onOpenHistory,
  onNewChat,
  onOpenCollaborate,
  onBringIntoDm,
  agentSeedPrompt,
  onAgentSeedConsumed,
}: {
  onOpenHistory?: () => void;
  onNewChat?: () => void;
  onOpenCollaborate?: () => void;
  /** Open Collaborate DM with peer and inject this chat session. */
  onBringIntoDm?: (peerId: string) => void;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
} = {}) {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const sending = useLatticeStore((s) => s.sending);
  const sendPhase = useLatticeStore((s) => s.sendPhase);
  const statusHint = useLatticeStore((s) => s.statusHint);
  const pending = useLatticeStore((s) => s.pending);
  const liveTranscript = useLatticeStore((s) => s.liveTranscript);
  const error = useLatticeStore((s) => s.error);
  const agentMode = useLatticeStore((s) => s.agentMode);
  const modelId = useLatticeStore((s) => s.modelId);
  const models = useLatticeStore((s) => s.models);
  const provider = useLatticeStore((s) => s.provider);
  const nestTopology = useLatticeStore((s) => s.nestTopology);
  const agentRoster = useLatticeStore((s) => s.agentRoster);
  const activeRepoId = useLatticeStore((s) => s.activeRepoId);
  const repositories = useLatticeStore((s) => s.repositories);
  const setAgentMode = useLatticeStore((s) => s.setAgentMode);
  const setModelId = useLatticeStore((s) => s.setModelId);
  const setProvider = useLatticeStore((s) => s.setProvider);
  const setNestTopology = useLatticeStore((s) => s.setNestTopology);
  const setAgentRoster = useLatticeStore((s) => s.setAgentRoster);
  const hardRefreshEdge = useLatticeStore((s) => s.hardRefreshEdge);
  const ensureThread = useLatticeStore((s) => s.ensureThread);
  const [draft, setDraft] = useState('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checking, setChecking] = useState(false);
  const [keySettingsOpen, setKeySettingsOpen] = useState(false);
  const [hasEdgeKey, setHasEdgeKey] = useState(false);
  const [dmMenuOpen, setDmMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resumedRef = useRef(false);
  const dmMenuRef = useRef<HTMLDivElement>(null);

  const collabPeers = useUnifiedFeed((s) => s.peers);
  const myCollabPeerId = useMemo(() => resolveClientCollabPeerId(userEmail), [userEmail]);
  const dmPeers = useMemo(
    () => (myCollabPeerId ? collabPeers.filter((p) => p.id !== myCollabPeerId) : collabPeers),
    [collabPeers, myCollabPeerId],
  );

  const thread = threads.find((t) => t.id === activeThreadId) ?? null;
  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const activeRepo =
    findRepository(activeRepoId || DEFAULT_REPO_ID, repositories) ||
    findRepository(activeRepoId || DEFAULT_REPO_ID);
  const needsAccessGrant =
    Boolean(error) && /not on the access list|Request access|access expired/i.test(error || '');
  const needsProviderKey =
    Boolean(error) &&
    /API key|missing_.*api_key|x-cursor-api-key|x-anthropic-api-key|x-gemini-api-key/i.test(
      error || '',
    );
  const lastIsUser =
    Boolean(thread?.messages.length) &&
    thread!.messages[thread!.messages.length - 1].role === 'user';
  const awaiting = threadAwaitingAssistant(activeThreadId);
  const showWorking =
    awaiting &&
    (sending ||
      sendPhase === 'stuck' ||
      sendPhase === 'recovering' ||
      sendPhase === 'sending' ||
      Boolean(pending));

  useEffect(() => {
    ensureThread();
  }, [ensureThread]);

  useEffect(() => {
    if (!agentSeedPrompt) return;
    setDraft(agentSeedPrompt);
    onAgentSeedConsumed?.();
    inputRef.current?.focus();
  }, [agentSeedPrompt, onAgentSeedConsumed]);

  useEffect(() => {
    if (!dmMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!dmMenuRef.current?.contains(e.target as Node)) setDmMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [dmMenuOpen]);

  useEffect(() => {
    const sync = (detail?: { changed?: boolean }) => {
      setHasEdgeKey(hasProviderApiKey(useLatticeStore.getState().provider));
      // New key / provider ⇒ old cloud agent ids are invalid.
      if (detail?.changed) {
        const s = useLatticeStore.getState();
        s.clearCloudAgents();
        s.clearPending();
        s.setError(null);
        s.setSending(false);
        resumedRef.current = true; // do not auto-recover a dead agent after key paste
      }
    };
    sync();
    return subscribeProviderKeys(sync);
  }, [provider]);

  useEffect(() => {
    if (signedIn) void loadLatticeModels();
  }, [signedIn, userEmail, hasEdgeKey, provider]);

  useEffect(() => {
    if (!signedIn || !userEmail) return;
    void verifyLatticeAccess(userEmail);
  }, [signedIn, userEmail]);

  // Resume a waiting turn after refresh — only when we still have a pending soft wait.
  useEffect(() => {
    if (!signedIn || !hasEdgeKey || resumedRef.current) return;
    if (!threadAwaitingAssistant(activeThreadId)) return;
    const s = useLatticeStore.getState();
    if (!s.pending) return;
    if (
      s.error &&
      /GitHub|repository|branch|API key|access list|invalid model|agent not found/i.test(s.error)
    ) {
      resumedRef.current = true;
      return;
    }
    // Stale agent under a new edge key — don't spin recover forever.
    const pendingAgent = s.pending.agentId || s.threads.find((t) => t.id === activeThreadId)?.agentId;
    if (!pendingAgent) {
      resumedRef.current = true;
      return;
    }
    resumedRef.current = true;
    void checkPendingLatticeReply();
  }, [signedIn, hasEdgeKey, activeThreadId]);

  useEffect(() => {
    // Only pin to bottom when the user is already near the end (or just sent).
    // Do not re-scroll on wait-timer ticks — that blocked reading earlier turns.
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread?.messages.length, showWorking, signedIn, activeThreadId, liveTranscript.length]);

  function onMessageScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = gap < 96;
  }
  useEffect(() => {
    if (!showWorking) {
      setElapsedSec(0);
      return;
    }
    const startedAt = pending?.startedAt || Date.now();
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [showWorking, pending?.startedAt]);

  // Live label from elapsed — local only (avoid store write loops).
  const liveHint = latticeProgressHint(
    elapsedSec,
    sendPhase === 'idle' || sendPhase === 'sending' ? 'sending' : sendPhase,
  );
  const workingLabel =
    sendPhase === 'sending' || !statusHint
      ? liveHint
      : statusHint;

  useEffect(() => {
    function onVis() {
      if (document.visibilityState !== 'visible') return;
      const s = useLatticeStore.getState();
      if (!threadAwaitingAssistant(s.activeThreadId)) return;
      // Do not pile recover on a live primary SSE (sending) — that causes attach thrash.
      if (s.sending && s.sendPhase === 'sending') return;
      if (!s.sending && s.sendPhase === 'idle' && !s.pending) return;
      void checkPendingLatticeReply();
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signedIn) return;
    stickToBottomRef.current = true;
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

  const step = latticeProgressStep(elapsedSec);
  const mm = String(Math.floor(elapsedSec / 60)).padStart(1, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');

  return (
    <main className="chat-pane">
      <header className="chat-header">
        <div className="chat-header-row">
          <div className="chat-header-lead">
            <button
              type="button"
              className="header-rail-btn"
              aria-label="Open past chats"
              onClick={onOpenHistory}
            >
              ☰
            </button>
            <h1 className="chat-title">
              <span className="chat-wordmark">Lattice Chat Agent V1.618</span>
              <span className="chat-by">
                <a className="deck-home-link" href={MAIN_DECK_HREF} title="Back to QUESTFEST main deck">
                  {MAIN_DECK_LABEL}
                </a>
                {' · Your Goldilocks Valet'}
                {activeRepo ? (
                  <>
                    {' · '}
                    <span className="chat-repo-chip" title={activeRepo.url}>
                      {activeRepo.label}
                    </span>
                  </>
                ) : null}
                {onOpenCollaborate ? (
                  <>
                    {' · '}
                    <button type="button" className="chat-collab-link" onClick={() => onOpenCollaborate()}>
                      Collaborate
                      <CollabDmBadge />
                    </button>
                  </>
                ) : null}
              </span>
            </h1>
            <button
              type="button"
              className="header-new-chat"
              aria-label="New chat"
              disabled={!signedIn}
              onClick={() => onNewChat?.()}
            >
              + New chat
            </button>
            {onOpenCollaborate ? (
              <button
                type="button"
                className="header-collab-btn"
                aria-label="Open Lattice Collaborate"
                onClick={() => onOpenCollaborate()}
              >
                Collaborate
                <CollabDmBadge />
              </button>
            ) : null}
            {onBringIntoDm && dmPeers.length > 0 ? (
              <div className="header-dm-menu" ref={dmMenuRef}>
                <button
                  type="button"
                  className="header-collab-btn header-dm-btn"
                  aria-expanded={dmMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setDmMenuOpen((v) => !v)}
                >
                  Bring into DM
                </button>
                {dmMenuOpen ? (
                  <ul className="header-dm-menu__list" role="menu">
                    {dmPeers.map((p) => (
                      <li key={p.id} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setDmMenuOpen(false);
                            onBringIntoDm(p.id);
                          }}
                        >
                          DM · {p.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
          {signedIn ? (
            <SignedInBar onOpenKeySettings={() => setKeySettingsOpen(true)} />
          ) : null}
        </div>
        <p className="chat-sub">
          Your Goldilocks Valet on the Ark ·{' '}
          <a href={MAIN_DECK_HREF}>Main deck</a>
          {' · '}
          <a href="/lattice/learn">Learn more</a>
          {' · '}
          <a href="/ss-vibelandia">Meet the ship</a>
          {' · '}
          <a href="/ai-transparency">AI transparency</a>
        </p>
        <p className="ai-act-notice" role="status">
          <strong>You are interacting with an AI system.</strong> Replies are machine-generated — not a
          human. <a href="/ai-transparency">AI transparency</a>
        </p>
        <p className="chat-build-stamp" data-lattice-build="valet-lounge-v6-ai-act">
          Within Goldilocks · intentions matter · craft, curiosity, care · Hard refresh keeps your keys
        </p>
      </header>

      {keySettingsOpen ? (
        <div className="key-settings-drawer" role="dialog" aria-label="Cursor API key settings">
          <div className="key-settings-drawer__head">
            <h2>Cursor API key</h2>
            <button type="button" onClick={() => setKeySettingsOpen(false)}>
              Close
            </button>
          </div>
          <KeySettingsPanel
            onSaved={() => {
              setKeySettingsOpen(false);
              void loadLatticeModels();
            }}
          />
        </div>
      ) : null}

      <div
        className="message-scroll"
        role="log"
        aria-live="polite"
        ref={scrollRef}
        onScroll={onMessageScroll}
      >
        {!signedIn ? (
          <div className="auth-stage empty-state">
            <p className="empty-eyebrow">
              <a className="deck-home-link" href={MAIN_DECK_HREF} title="Back to QUESTFEST main deck">
                {MAIN_DECK_LABEL}
              </a>
              {' · 24×365'}
            </p>
            <p className="empty-lead">Welcome aboard</p>
            <p className="ai-act-notice ai-act-notice--empty" role="status">
              <strong>You are interacting with an AI system.</strong> Lattice Chat Agent replies are
              machine-generated. This is not a human operator.{' '}
              <a href="/ai-transparency">AI transparency</a>
            </p>
            <p className="empty-hint">
              First the LLMs. Then Cursor AI, Claude Code, and the vibe platforms. Now Lattice Chat Agent —
              the next layer in the stack: to slow down and cool off GPUs and deliver new function.
              Token Maxing on your keys; intentions matter — we do not help with malice or ill will.
            </p>
            <p className="empty-hint empty-hint--bridge">
              Email + your key + pick Cursor, Claude, or Gemini.{' '}
              <strong>Your key is your password</strong> — it stays with you. No separate passwords
              to manage.
            </p>
            <AuthPanel
              onSignedIn={() => {
                void loadLatticeModels();
              }}
            />
            <div className="empty-cta-row">
              <a className="empty-cta" href="/lattice/learn">
                Learn more
              </a>
              <a className="empty-cta empty-cta--ghost" href="/ss-vibelandia">
                Meet the Ark
              </a>
              <a className="empty-cta empty-cta--ghost" href="/ai-transparency">
                AI transparency
              </a>
            </div>
          </div>
        ) : !hasEdgeKey ? (
          <div className="empty-state">
            <p className="empty-eyebrow">Bridge access</p>
            <p className="empty-lead">Bring your key to the bridge</p>
            <p className="empty-hint">
              <strong>Your key is your password</strong> for 99 Octave Omni-Lattice Chat — paste a
              Cursor, Claude, or Gemini key for this device. It stays with you. No separate
              passwords to manage. We never store it on our server — Fair Exchange, your edge.
            </p>
            <KeySettingsPanel onSaved={() => void loadLatticeModels()} />
          </div>
        ) : !thread || thread.messages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-eyebrow">Lounge · Valet ready</p>
            <p className="empty-lead">Welcome aboard — how may we help?</p>
            <p className="empty-hint">
              Ask in plain language. Lattice is the layer above your vibe stack — cooler GPUs, new
              function, less prompt bloat. Advanced options stay under the hatch when you want them.
            </p>
            <p className="empty-intention">
              Within Goldilocks · intentions matter — craft, curiosity, and care; never malice.
            </p>
            <div className="empty-cta-row">
              <a className="empty-cta" href="/lattice/learn">
                Learn more
              </a>
              <a className="empty-cta empty-cta--ghost" href="/lattice/brochure">
                Brochure
              </a>
            </div>
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
                    ? `Valet · ${m.mode || 'agent'}${m.model ? ` · ${m.model}` : ''}`
                    : 'Valet'}
              </span>
              {m.role === 'assistant' && m.transcript?.length ? (
                <AgentTranscript items={m.transcript} />
              ) : m.role === 'assistant' ? (
                <div className="bubble-body">
                  <MarkdownBody>{m.content}</MarkdownBody>
                </div>
              ) : (
                <div className="bubble-body">{m.content}</div>
              )}
              {m.role === 'assistant' && m.tokens && hasMeasuredTokens(m.tokens) ? (
                <TokenCompareFooter tokens={m.tokens} />
              ) : null}
            </article>
          ))
        )}
        {showWorking ? (
          <article
            className={`bubble bubble-assistant thinking thought-stream-panel${sendPhase === 'stuck' ? ' thinking--stuck' : ''}`}
          >
            <div className="thought-stream-head">
              <span className="bubble-role">Your Valet is thinking</span>
              <span className="thought-stream-timer">
                {mm}:{ss}
                {sendPhase === 'stuck' ? ' · may still finish' : ''}
              </span>
            </div>
            <div className="cx-block cx-status working-live-status">
              <span className="working-pulse" aria-hidden="true" />
              {workingLabel}
            </div>
            {liveTranscript.length ? (
              <AgentTranscript items={liveTranscript} live />
            ) : (
              <div className="thought-stream-waiting">
                <div className="working-meter" aria-hidden="true">
                  {LATTICE_PROGRESS_STEPS.map((label, i) => (
                    <span
                      key={label}
                      className={`working-meter__step${i <= step ? ' is-active' : ''}${i === step ? ' is-current' : ''}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="working-stream-hint">
                  Waiting for live thought from your Valet…
                </p>
              </div>
            )}
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
                Don’t re-paste — this attaches to the active run.
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
          {needsProviderKey ? (
            <>
              {' '}
              <button
                type="button"
                className="error-check-btn"
                onClick={() => setKeySettingsOpen(true)}
              >
                Open key settings
              </button>
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
          {signedIn ? (
            <>
              {' '}
              <button
                type="button"
                className="error-check-btn"
                title="Clear chat cache and stuck runs, then reload. Keeps your email and API keys."
                onClick={() => hardRefreshEdge()}
              >
                Hard refresh
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      <form className={`composer${signedIn && hasEdgeKey ? '' : ' composer--boarding'}`} onSubmit={onSubmit}>
        {signedIn && hasEdgeKey ? (
          <ComposerOptions
            provider={provider}
            mode={agentMode}
            nestTopology={nestTopology}
            agentRoster={agentRoster}
            modelId={modelId}
            models={models}
            disabled={sending}
            onProviderChange={setProvider}
            onModeChange={setAgentMode}
            onNestChange={setNestTopology}
            onRosterChange={setAgentRoster}
            onModelChange={setModelId}
          />
        ) : null}
        <label className="sr-only" htmlFor="lattice-composer">
          Message
        </label>
        <textarea
          id="lattice-composer"
          ref={inputRef}
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            showWorking
              ? 'Your Valet is working… use Check for reply instead of re-pasting'
              : !signedIn
                ? 'Welcome aboard — sign in above to chat…'
                : !hasEdgeKey
                  ? 'Bring your key to the bridge above…'
                  : 'Message your Goldilocks Valet…'
          }
          disabled={!signedIn || !hasEdgeKey || (sending && sendPhase !== 'stuck')}
        />
        <button
          type="submit"
          disabled={
            !signedIn ||
            !hasEdgeKey ||
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
