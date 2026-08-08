import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContextualChatDock } from '@/components/collaborate/ContextualChatDock';
import { IntegrationSettings } from '@/components/collaborate/IntegrationSettings';
import { RepoViewerOverlay } from '@/components/collaborate/RepoViewerOverlay';
import { UnifiedFeedStream } from '@/components/collaborate/UnifiedFeedStream';
import { MAIN_DECK_HREF, MAIN_DECK_LABEL } from '@/access';
import { useUnifiedFeed } from '@/feed/store';
import { syncPublishedPapers } from '@/feed/syncPublishedPapers';
import type { CollabMobileTab, CollabPeer } from '@/feed/types';
import { displayName } from '@/feed/verifyConnection';

export function CollaborateShell({
  onExit,
  onSendToAgent,
}: {
  onExit: () => void;
  onSendToAgent: (prompt: string) => void;
}) {
  const mobileTab = useUnifiedFeed((s) => s.mobileTab);
  const setMobileTab = useUnifiedFeed((s) => s.setMobileTab);
  const layoutMode = useUnifiedFeed((s) => s.layoutMode);
  const setLayoutMode = useUnifiedFeed((s) => s.setLayoutMode);
  const isDocked = useUnifiedFeed((s) => s.isDocked);
  const dockCollapsed = useUnifiedFeed((s) => s.dockCollapsed);
  const setDockCollapsed = useUnifiedFeed((s) => s.setDockCollapsed);
  const openRepoFile = useUnifiedFeed((s) => s.openRepoFile);
  const openRepoWorkspace = useUnifiedFeed((s) => s.openRepoWorkspace);
  const integrations = useUnifiedFeed((s) => s.integrations);
  const peers = useUnifiedFeed((s) => s.peers);
  const pendingAgentPrompt = useUnifiedFeed((s) => s.pendingAgentPrompt);
  const clearPendingAgentPrompt = useUnifiedFeed((s) => s.clearPendingAgentPrompt);
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  );

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

  const handoffAgent = useCallback(
    (prompt: string) => {
      onSendToAgent(prompt);
      onExit();
    },
    [onExit, onSendToAgent],
  );

  const goTab = (tab: CollabMobileTab) => {
    if (tab !== 'settings') openRepoFile(null);
    setMobileTab(tab);
  };

  return (
    <div className={`collab-shell${wide ? ' collab-shell--desktop' : ' collab-shell--mobile'}`}>
      <header className="collab-topbar">
        <button type="button" className="collab-topbar__back" onClick={onExit} aria-label="Back to Lattice Chat Agent">
          ‹
        </button>
        <h1>Lattice Workspace</h1>
        <button
          type="button"
          className="collab-topbar__gear"
          aria-label="Settings"
          onClick={() => goTab('settings')}
        >
          ⚙
        </button>
      </header>

      {wide ? (
        <div className="collab-desktop">
          <nav className="collab-left" aria-label="Nav & Integrations">
            <p className="collab-left__brand">Lattice Collaborate</p>
            <button type="button" className="collab-navbtn" onClick={() => setLayoutMode('feed')}>
              Unified Feed
            </button>
            <button type="button" className="collab-navbtn" onClick={() => openRepoWorkspace()}>
              Repository
            </button>
            <button type="button" className="collab-navbtn" onClick={() => setLayoutMode('settings')}>
              Integrations
            </button>
            <div className="collab-left__feeds">
              <p className="collab-left__label">Feeds</p>
              {integrations.map((i) => (
                <p
                  key={i.id}
                  className={`collab-feed-status${i.enabled ? ' is-on' : ''}`}
                  title={i.connectionMessage || displayName(i.id)}
                >
                  <span className={`collab-feed-dot${i.enabled ? ' is-on' : ''}`} aria-hidden />
                  {displayName(i.id)}
                  {i.enabled ? ' · on' : ''}
                </p>
              ))}
              <button type="button" className="collab-navbtn collab-navbtn--quiet" onClick={() => setLayoutMode('settings')}>
                Connect feeds…
              </button>
            </div>
            <div className="collab-left__feeds">
              <p className="collab-left__label">Seats</p>
              {peers.map((p) => (
                <p key={p.id} className="collab-seat">
                  {p.name}
                </p>
              ))}
            </div>
            <a className="collab-left__deck" href={MAIN_DECK_HREF}>
              {MAIN_DECK_LABEL}
            </a>
          </nav>

          <main className="collab-center">
            {layoutMode === 'settings' ? (
              <IntegrationSettings />
            ) : layoutMode === 'repo' ? (
              <RepoViewerOverlay onClose={() => openRepoFile(null)} />
            ) : (
              <div className="collab-center__feed">
                <h2 className="collab-center__title">Unified Feed</h2>
                <UnifiedFeedStream onConvert={handoffAgent} />
              </div>
            )}
          </main>

          <ContextualChatDock
            collapsed={dockCollapsed}
            onToggleCollapse={() => setDockCollapsed(!dockCollapsed)}
            onConvertToAgent={handoffAgent}
            agentPrompt={pendingAgentPrompt}
            onAgentPromptConsumed={clearPendingAgentPrompt}
          />
        </div>
      ) : (
        <div className="collab-mobile">
          <div className="collab-mobile__stage">
            {mobileTab === 'settings' ? (
              <IntegrationSettings />
            ) : layoutMode === 'repo' ? (
              <div
                className={`collab-split${isDocked ? ' is-docked' : ''}${dockCollapsed ? ' dock-collapsed' : ''}`}
              >
                <div className="collab-split__repo">
                  <RepoViewerOverlay
                    showDockHint
                    onClose={() => {
                      openRepoFile(null);
                      setMobileTab('home');
                    }}
                  />
                </div>
                <ContextualChatDock
                  collapsed={dockCollapsed}
                  onToggleCollapse={() => setDockCollapsed(!dockCollapsed)}
                  onConvertToAgent={handoffAgent}
                  agentPrompt={pendingAgentPrompt}
                  onAgentPromptConsumed={clearPendingAgentPrompt}
                />
              </div>
            ) : mobileTab === 'channels' ? (
              <ChannelsPane onOpenRepo={() => openRepoWorkspace()} />
            ) : mobileTab === 'chat' ? (
              <WorkspaceChatPane peers={peers} onConvert={handoffAgent} />
            ) : (
              <div className="collab-center__feed">
                <h2 className="collab-center__title">Home</h2>
                <UnifiedFeedStream onConvert={handoffAgent} />
              </div>
            )}
          </div>
          <MobileBottomNav tab={mobileTab} onChange={goTab} />
        </div>
      )}
    </div>
  );
}

function MobileBottomNav({
  tab,
  onChange,
}: {
  tab: CollabMobileTab;
  onChange: (t: CollabMobileTab) => void;
}) {
  const items: { id: CollabMobileTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'channels', label: 'Channels' },
    { id: 'chat', label: 'Chat' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <nav className="collab-bottomnav" aria-label="Workspace">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={tab === item.id ? 'is-active' : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function ChannelsPane({ onOpenRepo }: { onOpenRepo: () => void }) {
  return (
    <div className="collab-center__feed">
      <h2 className="collab-center__title">Channels</h2>
      <p className="uf-empty__hint">Shared workspace for Valet Pru and Daniel.</p>
      <button type="button" className="collab-navbtn collab-navbtn--block" onClick={onOpenRepo}>
        # lattice-collaborate
      </button>
    </div>
  );
}

function WorkspaceChatPane({
  peers,
  onConvert,
}: {
  peers: CollabPeer[];
  onConvert: (prompt: string) => void;
}) {
  const ingestPayload = useUnifiedFeed((s) => s.ingestPayload);
  const items = useUnifiedFeed((s) => s.items);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
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
    setActivePeerId(id);
  };

  const send = () => {
    const body = draft.trim();
    if (!body || !activePeer) return;
    ingestPayload({
      type: 'chat',
      platform: 'lattice',
      actor: 'You',
      body,
      threadPeerId: activePeer.id,
      presenceHue: 'gold',
    });
    setDraft('');
  };

  if (!activePeer) {
    return (
      <div className="collab-chat collab-chat--roster">
        <header className="collab-chat__head">
          <h2 className="collab-center__title">Chat</h2>
        </header>
        <p className="uf-empty__hint">Select someone to open their chat.</p>
        <ul className="collab-chat__roster" role="list">
          {peers.map((p) => (
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
                  <strong>{p.name}</strong>
                  <span>{previewFor(p.id)}</span>
                </span>
                <span className="collab-chat__roster-chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          ))}
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
          onClick={() => setActivePeerId(null)}
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
      </header>

      <ul className="collab-chat__list" aria-live="polite" ref={listRef}>
        {threadItems.length === 0 ? (
          <li className="collab-chat__empty">No messages yet — say hello to {activePeer.name}.</li>
        ) : (
          threadItems.map((m) => {
            const mine = m.actor === 'You';
            return (
              <li
                key={m.id}
                className={`collab-chat__bubble${mine ? ' collab-chat__bubble--mine' : ''}`}
              >
                {!mine ? <strong>{m.actor}</strong> : null}
                <span>{m.body}</span>
                <button
                  type="button"
                  className="collab-chat__ask"
                  onClick={() => onConvert(m.body || '')}
                >
                  Ask agent
                </button>
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
