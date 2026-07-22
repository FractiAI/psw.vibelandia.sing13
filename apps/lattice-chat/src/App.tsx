import { useCallback, useState } from 'react';
import { HistoryRail, HistoryRailOverlay } from '@/components/HistoryRail';
import { ChatPane } from '@/components/ChatPane';
import { useLatticeStore } from '@/store';

export function App() {
  const [railOpen, setRailOpen] = useState(false);
  const newChat = useLatticeStore((s) => s.newChat);
  const closeRail = useCallback(() => setRailOpen(false), []);
  const openRail = useCallback(() => setRailOpen(true), []);

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
      />
    </div>
  );
}
