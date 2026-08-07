import { useCallback, useEffect, useState } from 'react';
import { HistoryRail, HistoryRailOverlay } from '@/components/HistoryRail';
import { ChatPane } from '@/components/ChatPane';
import { CollaborateShell } from '@/components/collaborate/CollaborateShell';
import { useLatticeStore } from '@/store';

const MODE_KEY = 'lattice-workspace-mode';

function readInitialMode(): 'chat' | 'collaborate' {
  try {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path.endsWith('/collaborate') || path === '/collaborate') {
      return 'collaborate';
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'collaborate' || params.get('collaborate') === '1') {
      return 'collaborate';
    }
    if (sessionStorage.getItem(MODE_KEY) === 'collaborate') return 'collaborate';
  } catch {
    /* ignore */
  }
  return 'chat';
}

export function App() {
  const [railOpen, setRailOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'collaborate'>(readInitialMode);
  const [agentSeed, setAgentSeed] = useState<string | null>(null);
  const newChat = useLatticeStore((s) => s.newChat);
  const closeRail = useCallback(() => setRailOpen(false), []);
  const openRail = useCallback(() => setRailOpen(true), []);

  useEffect(() => {
    try {
      sessionStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const enterCollaborate = useCallback(() => setMode('collaborate'), []);
  const exitCollaborate = useCallback(() => setMode('chat'), []);

  const sendToAgent = useCallback(
    (prompt: string) => {
      setAgentSeed(prompt);
      setMode('chat');
      newChat();
    },
    [newChat],
  );

  if (mode === 'collaborate') {
    return <CollaborateShell onExit={exitCollaborate} onSendToAgent={sendToAgent} />;
  }

  return (
    <div className={`lattice-shell${railOpen ? ' rail-open' : ''}`}>
      <HistoryRailOverlay open={railOpen} onClose={closeRail} />
      <HistoryRail open={railOpen} onClose={closeRail} />
      <ChatPane
        onOpenHistory={openRail}
        onNewChat={() => {
          newChat();
          closeRail();
        }}
        onOpenCollaborate={enterCollaborate}
        agentSeedPrompt={agentSeed}
        onAgentSeedConsumed={() => setAgentSeed(null)}
      />
    </div>
  );
}
