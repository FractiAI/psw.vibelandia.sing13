import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isCreatorEmail,
  isRememberedEmailFresh,
  MAIN_DECK_HREF,
  MAIN_DECK_LABEL,
  VOYAGE_HREF,
  VOYAGE_LABEL,
} from '@/access';
import {
  checkPendingLatticeReply,
  LATTICE_PROGRESS_STEPS,
  latticeProgressHint,
  latticeProgressStep,
  loadLatticeModels,
  threadAwaitingAssistant,
  verifyLatticeAccess,
} from '@/api';
import { isSoftRecoverableLatticeError } from '@/lib/guestErrors';
import { AuthPanel, RequestAccessLink, SignedInBar } from '@/components/AuthPanel';
import { AgentTranscript } from '@/components/AgentTranscript';
import { ComposerBar } from '@/components/ComposerBar';
import { MessageThread } from '@/components/MessageThread';
import { KeySettingsPanel } from '@/components/KeySettings';
import { hasProviderApiKey, subscribeProviderKeys } from '@/lib/providerKeys';
import { useLatticeStore } from '@/store';
import { findRepository, DEFAULT_REPO_ID } from '@/repositories';
import { listSelectableChats } from '@/threadHistory';
import { CollabDmBadge } from '@/components/collaborate/CollabDmNotifier';
import { resolveClientCollabPeerId } from '@/feed/seatIdentity';
import { useUnifiedFeed } from '@/feed/store';
import { isIncomingCollabDm, unreadCountForPeer } from '@/feed/dm';
import { isSharedCollabAgentThread } from '@/feed/syncCollaborateAgent';

export function ChatPane({
  onOpenHistory,
  onNewChat,
  onOpenCollaborate,
  agentSeedPrompt,
  onAgentSeedConsumed,
  compact = false,
  sharedCollab = false,
}: {
  onOpenHistory?: () => void;
  onNewChat?: () => void;
  onOpenCollaborate?: () => void;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
  /** Half-height embed inside Collaborate (messages + composer only). */
  compact?: boolean;
  /** Shared Collaborate session — all seats see inputs/outputs + thought streams. */
  sharedCollab?: boolean;
} = {}) {
  const threads = useLatticeStore((s) => s.threads);
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const privilege = useLatticeStore((s) => s.privilege);
  const sending = useLatticeStore((s) => s.sending);
  const sendPhase = useLatticeStore((s) => s.sendPhase);
  const statusHint = useLatticeStore((s) => s.statusHint);
  const pending = useLatticeStore((s) => s.pending);
  const liveTranscript = useLatticeStore((s) => s.liveTranscript);
  const remoteCollabLive = useLatticeStore((s) => s.remoteCollabLive);
  const error = useLatticeStore((s) => s.error);
  const provider = useLatticeStore((s) => s.provider);
  const activeRepoId = useLatticeStore((s) => s.activeRepoId);
  const repositories = useLatticeStore((s) => s.repositories);
  const hardRefreshEdge = useLatticeStore((s) => s.hardRefreshEdge);
  const ensureThread = useLatticeStore((s) => s.ensureThread);
  const ensureSharedCollabThread = useLatticeStore((s) => s.ensureSharedCollabThread);
  const selectThread = useLatticeStore((s) => s.selectThread);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [checking, setChecking] = useState(false);
  const [keySettingsOpen, setKeySettingsOpen] = useState(false);
  const [hasEdgeKey, setHasEdgeKey] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const resumedRef = useRef(false);

  const myCollabPeerId = useMemo(() => resolveClientCollabPeerId(userEmail), [userEmail]);
  const creatorAttach = privilege === 'creator' || isCreatorEmail(userEmail);
  const openPeerDm = useUnifiedFeed((s) => s.openPeerDm);
  const feedItems = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const unreadDmCards = useMemo(() => {
    const byPeer = new Map<string, { peerId: string; peerName: string; body: string; id: string; createdAt: string }>();
    for (const item of feedItems) {
      if (!isIncomingCollabDm(item) || !item.threadPeerId) continue;
      if (unreadCountForPeer(feedItems, item.threadPeerId, dmLastReadAt) <= 0) continue;
      const prev = byPeer.get(item.threadPeerId);
      if (!prev || item.createdAt > prev.createdAt) {
        byPeer.set(item.threadPeerId, {
          peerId: item.threadPeerId,
          peerName: item.actor || 'Seat',
          body: (item.body || '').slice(0, 160),
          id: item.id,
          createdAt: item.createdAt,
        });
      }
    }
    return Array.from(byPeer.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [feedItems, dmLastReadAt]);
  const jumpToCollabDm = useCallback((peerId: string, focusMessageId?: string) => {
    openPeerDm(peerId, focusMessageId ? { focusMessageId } : undefined);
    onOpenCollaborate?.();
  }, [openPeerDm, onOpenCollaborate]);
  const onSharedSession =
    sharedCollab || isSharedCollabAgentThread(activeThreadId);

  const thread = threads.find((t) => t.id === activeThreadId) ?? null;
  const pastChats = listSelectableChats(threads, activeThreadId);
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
  const showRemoteWorking =
    onSharedSession &&
    !showWorking &&
    Boolean(remoteCollabLive?.transcript?.length);

  useEffect(() => {
    if (sharedCollab) ensureSharedCollabThread();
    else ensureThread();
  }, [ensureThread, ensureSharedCollabThread, sharedCollab]);

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
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
  }, [activeThreadId]);

  useEffect(() => {
    // Only pin to bottom when the user is already near the end (or just sent).
    // Do not re-scroll on wait-timer ticks — that blocked reading earlier turns.
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setShowJumpToBottom(false);
  }, [thread?.messages.length, showWorking, signedIn, activeThreadId, liveTranscript.length]);

  function onMessageScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = gap < 96;
    stickToBottomRef.current = nearBottom;
    setShowJumpToBottom(!nearBottom && el.scrollHeight > el.clientHeight + 120);
  }

  function jumpToLatest() {
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
    // Double-rAF: flex overflow scrollHeight can lag one frame; always
    // also scroll the sentinel so the click never looks like a no-op.
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight;
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' });
      });
    });
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
    let hiddenAt = 0;
    function resumeAfterReturn() {
      const s = useLatticeStore.getState();
      if (!threadAwaitingAssistant(s.activeThreadId)) return;
      if (!s.sending && s.sendPhase === 'idle' && !s.pending) return;
      const awayMs = hiddenAt ? Date.now() - hiddenAt : 0;
      // Primary SSE still open: do not open a second recover attach (race → dead turn).
      if (s.primaryStreamLive && awayMs < 8_000) return;
      // Brief blips: keep primary SSE. After a real leave, SSE is usually dead while
      // phase is still "sending" — recover instead of waiting on a zombie stream.
      if (s.sending && s.sendPhase === 'sending' && awayMs < 2500) return;
      void checkPendingLatticeReply();
    }
    function onVis() {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }
      if (document.visibilityState !== 'visible') return;
      resumeAfterReturn();
    }
    function onPageShow(ev: PageTransitionEvent) {
      if (ev.persisted) resumeAfterReturn();
    }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  async function onCheckReply() {
    setChecking(true);
    try {
      await checkPendingLatticeReply();
    } finally {
      setChecking(false);
    }
  }

  const onBeforeSend = useCallback(() => {
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
  }, []);

  const step = latticeProgressStep(elapsedSec);
  const mm = String(Math.floor(elapsedSec / 60)).padStart(1, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');

  return (
    <main className={`chat-pane${compact ? ' chat-pane--compact' : ''}`}>
      <header className="chat-header">
        <div className="chat-header-row">
          <div className="chat-header-lead">
            {onOpenHistory && !compact ? (
              <button
                type="button"
                className="header-rail-btn"
                aria-label="Open past chats"
                onClick={onOpenHistory}
              >
                ☰
              </button>
            ) : null}
            <h1 className="chat-title">
              <span className="chat-wordmark">
                {compact ? (
                  'Lattice Chat'
                ) : (
                  <>
                    <span className="chat-wordmark__full">Lattice Chat</span>
                    <span className="chat-wordmark__short">Lattice</span>
                  </>
                )}
              </span>
              {!compact ? (
                <span className="chat-by">
                  <a className="deck-home-link" href={MAIN_DECK_HREF} title={`Back to ${MAIN_DECK_LABEL} main deck`}>
                    {MAIN_DECK_LABEL}
                  </a>
                  {' · live demo · Syntheverse Sandbox · '}
                  <a className="deck-home-link" href="/lattice" title="Infinite Octave Omniversal Lattice Catalog">
                    Catalog
                  </a>
                  {' · Deck 2 Core'}
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
              ) : activeRepo ? (
                <span className="chat-by">
                  <span className="chat-repo-chip" title={activeRepo.url}>
                    {activeRepo.label}
                  </span>
                </span>
              ) : null}
            </h1>
            {!sharedCollab ? (
              <>
                {signedIn && pastChats.length > 0 ? (
                  <label className="header-thread-pick-wrap">
                    <span className="sr-only">Past chats</span>
                    <select
                      className="header-thread-pick"
                      aria-label="Select a past chat"
                      value={activeThreadId || ''}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) selectThread(id);
                      }}
                    >
                      {pastChats.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title || 'Untitled'}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button
                  type="button"
                  className="header-new-chat"
                  aria-label="New chat"
                  disabled={!signedIn}
                  onClick={() => onNewChat?.()}
                >
                  <span aria-hidden="true">+</span>
                  <span className="header-new-chat__label">New chat</span>
                </button>
              </>
            ) : (
              <span className="header-shared-session" title="Shared with Collaborate seats">
                Shared session
              </span>
            )}
            {!compact && onOpenCollaborate ? (
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
          </div>
          {signedIn && !compact ? (
            <SignedInBar
              onOpenKeySettings={() => setKeySettingsOpen(true)}
              hideHardRefresh={
                isSoftRecoverableLatticeError(error) ||
                sendPhase === 'sending' ||
                sendPhase === 'recovering' ||
                Boolean(pending)
              }
            />
          ) : null}
        </div>
        {!compact ? (
          <>
            <p className="chat-sub">
              Deck 2 · the Core ·{' '}
              <a href={MAIN_DECK_HREF}>Main deck</a>
              {' · '}
              <a href={VOYAGE_HREF}>{VOYAGE_LABEL}</a>
              {' · '}
              <a href="/lattice/how">How it works</a>
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
          </>
        ) : null}
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

      <div className="message-scroll-wrap">
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
              <a className="deck-home-link" href={MAIN_DECK_HREF} title={`Back to ${MAIN_DECK_LABEL} main deck`}>
                {MAIN_DECK_LABEL}
              </a>
              {' · 24×365'}
            </p>
            <p className="empty-lead">Lattice Chat · live demo · Syntheverse Sandbox</p>
            <p className="ai-act-notice ai-act-notice--empty" role="status">
              <strong>You are interacting with an AI system.</strong> Lattice Chat replies are
              machine-generated. This is the evaluator live demo of{' '}
              <a href="/lattice">Infinite Octave Omniversal Lattice Catalog</a>
              {' '}inside the Syntheverse Sandbox — not a human operator and not a production data plane.{' '}
              <a href="/ai-transparency">AI transparency</a>
            </p>
            <p className="empty-hint">
              Safe try-on for evaluators: bring your own key, keep corpora out of the prompt, and explore
              nested routing without touching production stores. Token Maxing on your keys; intentions
              matter — we do not help with malice or ill will.
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
              <a className="empty-cta" href="/lattice/how">
                How it works
              </a>
              <a className="empty-cta empty-cta--ghost" href={VOYAGE_HREF}>
                {VOYAGE_LABEL}
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
              <strong>Your key is your password</strong> for Infinite Octave Omniversal Lattice Catalog — paste a
              Cursor, Claude, or Gemini key for this device. It stays with you. No separate
              passwords to manage. We never store it on our server — Fair Exchange, your edge.
            </p>
            <KeySettingsPanel onSaved={() => void loadLatticeModels()} />
          </div>
        ) : !thread || thread.messages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-eyebrow">Lounge · Deck 2 Core</p>
            <p className="empty-lead">Welcome aboard — how may we help?</p>
            <p className="empty-hint">
              Ask in plain language. Players set the gravity; NPCs just live here; both are the crew.
              Attach a chart when you have one. Advanced options stay under the hatch.
            </p>
            <p className="empty-intention">
              Within Goldilocks · intentions matter — craft, curiosity, and care; never malice.
            </p>
            <div className="empty-cta-row">
              <a className="empty-cta" href="/lattice/how">
                How it works
              </a>
              <a className="empty-cta empty-cta--ghost" href={VOYAGE_HREF}>
                {VOYAGE_LABEL}
              </a>
            </div>
          </div>
        ) : (
          <>
          {unreadDmCards.length > 0 ? (
            <div className="collab-dm-inline" aria-label="Unread Collaborate direct messages">
              {unreadDmCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="collab-dm-inline__card"
                  onClick={() => jumpToCollabDm(card.peerId, card.id)}
                >
                  <span className="collab-dm-inline__pill">Collaborate · unread</span>
                  <strong className="collab-dm-inline__from">{card.peerName}</strong>
                  <span className="collab-dm-inline__body">{card.body || 'New message'}</span>
                  <span className="collab-dm-inline__cta">Open chat →</span>
                </button>
              ))}
            </div>
          ) : null}
          {thread.messages.length ? (
            <MessageThread
              messages={thread.messages}
              myCollabPeerId={myCollabPeerId}
              onJumpToCollabDm={jumpToCollabDm}
            />
          ) : null}
          </>
        )}
        {showRemoteWorking ? (
          <article className="bubble bubble-assistant thinking thought-stream-panel">
            <div className="thought-stream-head">
              <span className="bubble-role">
                {remoteCollabLive?.senderName || 'Seat'} · thinking
              </span>
            </div>
            {remoteCollabLive?.transcript?.length ? (
              <AgentTranscript items={remoteCollabLive.transcript} live />
            ) : null}
          </article>
        ) : null}
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
      {showJumpToBottom && signedIn ? (
        <button
          type="button"
          className="jump-to-bottom"
          onClick={jumpToLatest}
          aria-label="Go to bottom of conversation"
        >
          ↓ Latest
        </button>
      ) : null}
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
          {lastIsUser || isSoftRecoverableLatticeError(error) ? (
            <>
              {' '}
              <button type="button" className="error-check-btn" onClick={() => void onCheckReply()}>
                Check for reply
              </button>
            </>
          ) : null}
          {signedIn && !isSoftRecoverableLatticeError(error) ? (
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

      <ComposerBar
        signedIn={signedIn}
        hasEdgeKey={hasEdgeKey}
        creatorAttach={creatorAttach}
        showWorking={showWorking}
        agentSeedPrompt={agentSeedPrompt}
        onAgentSeedConsumed={onAgentSeedConsumed}
        onBeforeSend={onBeforeSend}
      />
    </main>
  );
}
