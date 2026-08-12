import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatPane } from '@/components/ChatPane';
import { RepoWorkstreamList } from '@/components/RepoWorkstreamList';
import { IntegrationSettings } from '@/components/collaborate/IntegrationSettings';
import { MAIN_DECK_HREF, MAIN_DECK_LABEL } from '@/access';
import { useLatticeStore } from '@/store';
import { useUnifiedFeed } from '@/feed/store';
import { unreadCountForPeer, countUnreadDms } from '@/feed/dm';
import { resolveClientCollabPeerId } from '@/feed/seatIdentity';
import { syncPublishedPapers } from '@/feed/syncPublishedPapers';
import {
  newClientDmId,
  postCollaborateDm,
  syncCollaborateDms,
} from '@/feed/syncCollaborateDms';
import { formatDmThreadForAgent } from '@/feed/sessionBridge';
import type { CollabPeer } from '@/feed/types';

export function CollaborateShell({
  onExit,
  onSendToAgent,
  agentSeedPrompt,
  onAgentSeedConsumed,
}: {
  onExit: () => void;
  onSendToAgent: (prompt: string, opts?: { title?: string }) => void;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
}) {
  const mobileTab = useUnifiedFeed((s) => s.mobileTab);
  const setMobileTab = useUnifiedFeed((s) => s.setMobileTab);
  const setLayoutMode = useUnifiedFeed((s) => s.setLayoutMode);
  const peersAll = useUnifiedFeed((s) => s.peers);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const newChat = useLatticeStore((s) => s.newChat);
  const myPeerId = useMemo(() => resolveClientCollabPeerId(userEmail), [userEmail]);
  const peers = useMemo(
    () => (myPeerId ? peersAll.filter((p) => p.id !== myPeerId) : peersAll),
    [peersAll, myPeerId],
  );
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  );
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      void syncPublishedPapers();
    };
    run();
    const id = window.setInterval(run, 5 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      void syncCollaborateDms();
    };
    run();
    const id = window.setInterval(run, 12_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [userEmail]);

  const handoffAgent = useCallback(
    (prompt: string, opts?: { title?: string }) => {
      // Seed embedded Lattice Chat in-place — stay on Collaborate.
      onSendToAgent(prompt, opts);
    },
    [onSendToAgent],
  );

  const agentHalf = (
    <div className="collab-agent-band">
      <aside className="collab-agent-band__repos" aria-label="Repositories">
        <p className="collab-agent-band__label">Repositories</p>
        <RepoWorkstreamList />
        <a className="collab-left__deck" href={MAIN_DECK_HREF}>
          {MAIN_DECK_LABEL}
        </a>
      </aside>
      <div className="collab-agent-band__chat">
        <ChatPane
          compact
          onNewChat={() => newChat()}
          agentSeedPrompt={agentSeedPrompt}
          onAgentSeedConsumed={onAgentSeedConsumed}
        />
      </div>
    </div>
  );

  const dmHalf = (
    <div className="collab-dm-band">
      <div className="collab-dm-band__head">
        <h2>Direct messages</h2>
        <div className="collab-dm-band__seats">
          {peers.map((p) => (
            <button
              key={p.id}
              type="button"
              className="collab-seat collab-seat--btn"
              onClick={() => useUnifiedFeed.getState().openPeerDm(p.id)}
            >
              {p.name}
              <SeatUnreadBadge peerId={p.id} />
            </button>
          ))}
        </div>
      </div>
      <div className="collab-dm-band__pane">
        <WorkspaceChatPane peers={peers} onSendToAgent={handoffAgent} />
      </div>
    </div>
  );

  return (
    <div className={`collab-shell${wide ? ' collab-shell--desktop' : ' collab-shell--mobile'}`}>
      <header className="collab-topbar">
        <button type="button" className="collab-topbar__back" onClick={onExit} aria-label="Back to full Lattice Chat">
          ‹
        </button>
        <h1>Lattice Collaborate</h1>
        <button
          type="button"
          className="collab-topbar__gear"
          aria-label="Integrations"
          onClick={() => setShowSettings((v) => !v)}
        >
          ⚙
        </button>
      </header>

      {showSettings ? (
        <div className="collab-settings-overlay">
          <button type="button" className="collab-settings-overlay__back" onClick={() => setShowSettings(false)}>
            ‹ Back to workspace
          </button>
          <IntegrationSettings />
        </div>
      ) : wide ? (
        <div className="collab-workspace-split">
          {agentHalf}
          {dmHalf}
        </div>
      ) : (
        <div className="collab-mobile">
          <div className="collab-mobile__stage">
            {mobileTab === 'settings' ? (
              <IntegrationSettings />
            ) : mobileTab === 'chat' ? (
              dmHalf
            ) : (
              agentHalf
            )}
          </div>
          <nav className="collab-bottomnav" aria-label="Workspace">
            <button
              type="button"
              className={mobileTab !== 'chat' && mobileTab !== 'settings' ? 'is-active' : undefined}
              onClick={() => setMobileTab('home')}
            >
              Agent
            </button>
            <button
              type="button"
              className={mobileTab === 'chat' ? 'is-active' : undefined}
              onClick={() => {
                setMobileTab('chat');
                setLayoutMode('chat');
              }}
            >
              DMs
              <MobileDmBadge />
            </button>
            <button
              type="button"
              className={mobileTab === 'settings' ? 'is-active' : undefined}
              onClick={() => setMobileTab('settings')}
            >
              Settings
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function MobileDmBadge() {
  const items = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const unread = countUnreadDms(items, dmLastReadAt);
  if (unread <= 0) return null;
  return <span className="collab-dm-badge">{unread > 9 ? '9+' : unread}</span>;
}

function SeatUnreadBadge({ peerId }: { peerId: string }) {
  const items = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const n = unreadCountForPeer(items, peerId, dmLastReadAt);
  if (n <= 0) return null;
  return <span className="collab-dm-badge collab-dm-badge--seat">{n > 9 ? '9+' : n}</span>;
}

function WorkspaceChatPane({
  peers,
  onSendToAgent,
}: {
  peers: CollabPeer[];
  onSendToAgent: (prompt: string, opts?: { title?: string }) => void;
}) {
  const ingestPayload = useUnifiedFeed((s) => s.ingestPayload);
  const items = useUnifiedFeed((s) => s.items);
  const dmLastReadAt = useUnifiedFeed((s) => s.dmLastReadAt);
  const activePeerId = useUnifiedFeed((s) => s.dmActivePeerId);
  const setDmActivePeerId = useUnifiedFeed((s) => s.setDmActivePeerId);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activePeer = peers.find((p) => p.id === activePeerId) || null;

  const threadItems = useMemo(() => {
    if (!activePeerId) return [];
    return items
      .filter(
        (i) =>
          i.kind === 'chat' &&
          i.platform === 'lattice' &&
          i.threadPeerId === activePeerId,
      )
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [items, activePeerId]);

  const previewFor = (peerId: string) => {
    const thread = items
      .filter(
        (i) =>
          i.kind === 'chat' &&
          i.platform === 'lattice' &&
          i.threadPeerId === peerId,
      )
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const last = thread[thread.length - 1];
    return last?.body || 'Tap to open chat';
  };

  useEffect(() => {
    if (!activePeerId) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [activePeerId, threadItems.length]);

  const openPeer = (id: string) => {
    setDraft('');
    setDmActivePeerId(id);
  };

  const send = () => {
    const body = draft.trim();
    if (!body || !activePeer) return;
    const id = newClientDmId();
    const createdAt = new Date().toISOString();
    ingestPayload({
      id,
      type: 'chat',
      platform: 'lattice',
      actor: 'You',
      body,
      threadPeerId: activePeer.id,
      presenceHue: 'gold',
      createdAt,
    });
    setDraft('');
    void postCollaborateDm({
      id,
      text: body,
      threadPeerId: activePeer.id,
      createdAt,
    });
  };

  const addToLatticeChat = () => {
    if (!activePeer) return;
    const prompt = formatDmThreadForAgent(activePeer.name, threadItems);
    onSendToAgent(prompt, { title: `DM · ${activePeer.name}` });
  };

  if (!activePeer) {
    return (
      <div className="collab-chat collab-chat--roster">
        <header className="collab-chat__head">
          <h2 className="collab-center__title">Chat</h2>
        </header>
        <p className="uf-empty__hint">Select someone to open their chat.</p>
        <ul className="collab-chat__roster" role="list">
          {peers.map((p) => {
            const unread = unreadCountForPeer(items, p.id, dmLastReadAt);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="collab-chat__roster-row"
                  onClick={() => openPeer(p.id)}
                >
                  <span className="int-peer" data-hue={p.hue}>
                    {p.name.slice(0, 1)}
                    {p.online ? <i className="int-peer__online" /> : null}
                  </span>
                  <span className="collab-chat__roster-meta">
                    <strong>
                      {p.name}
                      {unread > 0 ? (
                        <span className="collab-dm-badge collab-dm-badge--inline">{unread}</span>
                      ) : null}
                    </strong>
                    <span>{previewFor(p.id)}</span>
                  </span>
                  <span className="collab-chat__roster-chevron" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="collab-chat collab-chat--thread">
      <header className="collab-chat__head collab-chat__head--thread">
        <button
          type="button"
          className="collab-chat__back"
          onClick={() => setDmActivePeerId(null)}
          aria-label="Back to chats"
        >
          ‹
        </button>
        <div className="collab-chat__thread-peer">
          <span className="int-peer" data-hue={activePeer.hue}>
            {activePeer.name.slice(0, 1)}
            {activePeer.online ? <i className="int-peer__online" /> : null}
          </span>
          <div>
            <h2 className="collab-chat__thread-name">{activePeer.name}</h2>
            <p className="collab-chat__thread-status">{activePeer.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <button
          type="button"
          className="collab-chat__to-agent"
          onClick={addToLatticeChat}
          title="Open this DM as a Lattice Chat session"
        >
          Add to Lattice Chat
        </button>
      </header>

      <ul className="collab-chat__list" aria-live="polite" ref={listRef}>
        {threadItems.length === 0 ? (
          <li className="collab-chat__empty">No messages yet — say hello to {activePeer.name}.</li>
        ) : (
          threadItems.map((m) => {
            const mine = m.actor === 'You';
            const sender = mine ? 'You' : m.actor || 'Seat';
            return (
              <li
                key={m.id}
                className={`collab-chat__bubble${mine ? ' collab-chat__bubble--mine' : ''}`}
              >
                <strong className="collab-chat__sender">{sender}</strong>
                <span className="collab-chat__body">{m.body}</span>
              </li>
            );
          })
        )}
      </ul>

      <div className="collab-chat__composer">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${activePeer.name}…`}
          enterKeyHint="send"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="button" onClick={send} disabled={!draft.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
