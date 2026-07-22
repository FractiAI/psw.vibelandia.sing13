import { HistoryRail } from '@/components/HistoryRail';
import { ChatPane } from '@/components/ChatPane';

export function App() {
  return (
    <div className="lattice-shell">
      <HistoryRail />
      <ChatPane />
    </div>
  );
}
