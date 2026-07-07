import { useCatalogStore } from '@/stores/catalogStore';
import { PLAIN } from '@/lib/plainSpeak';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { useSessionStore } from '@/stores/sessionStore';

interface ListenTopBarProps {
  djMode: boolean;
  onListen: () => void;
  onUpload: () => void;
}

export function ListenTopBar({ djMode, onListen, onUpload }: ListenTopBarProps) {
  const catalogSyncing = useCatalogStore((s) => s.catalogSyncing);
  const refreshFromServer = useCatalogStore((s) => s.refreshFromServer);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlay = isPassenger || captainUnlocked;

  return (
    <header className="sc-bar">
      <span className="sc-bar-brand">Machote Moderno</span>
      <button type="button" className={`sc-bar-tab${!djMode ? ' sc-bar-tab--on' : ''}`} onClick={onListen}>
        {PLAIN.listen}
      </button>
      <button type="button" className={`sc-bar-tab${djMode ? ' sc-bar-tab--on' : ''}`} onClick={onUpload}>
        {PLAIN.upload}
      </button>
      <div className="sc-bar-spacer" />
      <button
        type="button"
        className="sc-bar-link"
        disabled={catalogSyncing}
        onClick={() => void refreshFromServer()}
      >
        {catalogSyncing ? PLAIN.refreshing : PLAIN.refresh}
      </button>
      {!fullPlay ? (
        <button type="button" className="sc-bar-link sc-bar-link--accent" onClick={() => setBoardingOpen(true)}>
          {PLAIN.getPass}
        </button>
      ) : null}
      <button type="button" className="sc-bar-link" onClick={() => setCaptainOpen(true)}>
        {PLAIN.captain}
      </button>
    </header>
  );
}
