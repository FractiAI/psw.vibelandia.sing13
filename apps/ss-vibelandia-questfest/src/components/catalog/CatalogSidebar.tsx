import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistSidebarTree } from '@/components/catalog/PlaylistSidebarTree';
import { PLAIN } from '@/lib/plainSpeak';
import { useLocation, useNavigate } from 'react-router-dom';
import { QUESTFEST_DECK_HREF } from '@/components/QuestfestFastLink';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { jukeboxPlaylistEditHref } from '@/lib/jukeboxRoutes';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { useSessionStore } from '@/stores/sessionStore';

interface CatalogSidebarProps {
  onUploadClick: () => void;
}

export function CatalogSidebar({ onUploadClick }: CatalogSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const catalogSyncing = useCatalogStore((s) => s.catalogSyncing);
  const playlistSyncError = useCatalogStore((s) => s.playlistSyncError);
  const refreshFromServer = useCatalogStore((s) => s.refreshFromServer);

  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlay = isPassenger || captainUnlocked;

  const openPlaylist = (id: string) => {
    setDjMode(false);
    setActive(id);
    if (location.pathname !== '/listen') navigate('/listen', { replace: true });
  };

  const goHome = () => {
    setDjMode(false);
    setActive(MASTER_PLAYLIST_ID);
    if (location.pathname !== '/listen') navigate('/listen', { replace: true });
  };

  const handleCreate = (parentId?: string) => {
    const id = createPlaylist(PLAIN.newPlaylist, parentId);
    setDjMode(false);
    navigate(jukeboxPlaylistEditHref(id));
  };

  return (
    <aside className="sc-side">
      <div className="sc-side-brand">
        <span className="sc-side-logo" aria-hidden>
          ♪
        </span>
        <div>
          <strong>Machote Moderno</strong>
          <span className="sc-side-sub">
            {trackCount} {PLAIN.tracks}
          </span>
        </div>
      </div>

      <nav className="sc-side-nav">
        <button
          type="button"
          className={`sc-nav-btn${!djMode && activeId === MASTER_PLAYLIST_ID ? ' sc-nav-btn--on' : ''}`}
          onClick={goHome}
        >
          {PLAIN.library}
        </button>
        <button type="button" className={`sc-nav-btn${djMode ? ' sc-nav-btn--on' : ''}`} onClick={onUploadClick}>
          {PLAIN.upload}
        </button>
        <a className="sc-nav-link" href={QUESTFEST_DECK_HREF}>
          {PLAIN.questfest}
        </a>
      </nav>

      <PlaylistSidebarTree
        activeId={activeId}
        djMode={djMode}
        onSelect={openPlaylist}
        onCreate={handleCreate}
      />

      <p className="sc-side-share-note">
        Your playlists sync to the shared catalog — permanent for all listeners. Tap Refresh to pull the latest.
      </p>
      {playlistSyncError ? (
        <p className="sc-side-share-note sc-side-share-note--err" role="status">
          Shared sync issue: {playlistSyncError}
        </p>
      ) : null}

      <div className="sc-side-foot">
        <button
          type="button"
          className="sc-side-foot-btn"
          disabled={catalogSyncing}
          onClick={() => void refreshFromServer()}
        >
          {catalogSyncing ? PLAIN.refreshing : PLAIN.refresh}
        </button>
        {!fullPlay ? (
          <button type="button" className="sc-side-foot-btn sc-side-foot-btn--accent" onClick={() => setBoardingOpen(true)}>
            {PLAIN.getPass}
          </button>
        ) : null}
        <button type="button" className="sc-side-foot-btn" onClick={() => setCaptainOpen(true)}>
          {PLAIN.captain}
        </button>
      </div>
    </aside>
  );
}
