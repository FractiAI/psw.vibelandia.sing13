import { useCallback, useEffect, useState } from 'react';
import { ContextualChatDock } from '@/components/collaborate/ContextualChatDock';
import { IntegrationSettings } from '@/components/collaborate/IntegrationSettings';
import { RepoViewerOverlay } from '@/components/collaborate/RepoViewerOverlay';
import { UnifiedFeedStream } from '@/components/collaborate/UnifiedFeedStream';
import { MAIN_DECK_HREF, MAIN_DECK_LABEL } from '@/access';
import { useUnifiedFeed } from '@/feed/store';
import type { CollabMobileTab } from '@/feed/types';

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
  const setIntegrationEnabled = useUnifiedFeed((s) => s.setIntegrationEnabled);
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

  const handoffAgent = useCallback(
    (prompt: string) => {
      onSendToAgent(prompt);
      onExit();
    },
    [onExit, onSendToAgent],
  );

  return (
    <div className={`collab-shell${wide ? ' collab-shell--desktop' : ' collab-shell--mobile'}`}>
      <header className="collab-topbar">
        <button type="button" className="collab-topbar__back" onClick={onExit} aria-label="Back to Lattice Chat">
          ‹
        </button>
        <h1>Lattice Workspace</h1>
        <button
          type="button"
          className="collab-topbar__gear"
          aria-label="Settings"
          onClick={() => {
            setMobileTab('settings');
            setLayoutMode('settings');
          }}
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
                <label key={i.id} className="collab-feed-toggle">
                  <input
                    type="checkbox"
                    checked={i.enabled}
                    onChange={(e) => setIntegrationEnabled(i.id, e.target.checked)}
                  />
                  {i.id === 'facebook'
                    ? 'Facebook'
                    : i.id === 'whatsapp'
                      ? 'WhatsApp'
                      : i.id === 'github'
                        ? 'GitHub'
                        : 'GitLab'}
                </label>
              ))}
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
            {mobileTab === 'settings' || layoutMode === 'settings' ? (
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
            ) : mobileTab === 'dms' ? (
              <DmsPane />
            ) : (
              <div className="collab-center__feed">
                <h2 className="collab-center__title">Home</h2>
                <UnifiedFeedStream onConvert={handoffAgent} />
              </div>
            )}
          </div>
          <MobileBottomNav
            tab={mobileTab}
            onChange={(tab) => {
              setMobileTab(tab);
              if (tab === 'home') openRepoFile(null);
              if (tab === 'settings') setLayoutMode('settings');
            }}
          />
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
    { id: 'dms', label: 'DMs' },
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

function DmsPane() {
  const peers = useUnifiedFeed((s) => s.peers);
  return (
    <div className="collab-center__feed">
      <h2 className="collab-center__title">DMs</h2>
      <p className="uf-empty__hint">No messages yet — start a thread when you are ready.</p>
      <ul className="int-peers" style={{ marginTop: '1rem' }}>
        {peers.map((p) => (
          <li key={p.id}>
            <span className="int-peer" data-hue={p.hue}>
              {p.name.slice(0, 1)}
              {p.online ? <i className="int-peer__online" /> : null}
            </span>
            <span className="int-peer__name">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
