import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { isMyLikesPlaylist, isMasterPlaylist } from '@/lib/catalogSeed';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { PLAIN } from '@/lib/plainSpeak';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';

const TrackList = lazy(() =>
  import('@/components/catalog/TrackList').then((m) => ({ default: m.TrackList })),
);
const PlaylistEditor = lazy(() =>
  import('@/components/catalog/PlaylistEditor').then((m) => ({ default: m.PlaylistEditor })),
);
const Mp3Uploader = lazy(() =>
  import('@/components/catalog/Mp3Uploader').then((m) => ({ default: m.Mp3Uploader })),
);

function TabPane({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="sc-empty">{PLAIN.loading}</p>}>{children}</Suspense>;
}

export function BridgePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);

  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const catalogSyncing = useCatalogStore((s) => s.catalogSyncing);
  const refreshFromServer = useCatalogStore((s) => s.refreshFromServer);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const setPlaylistTab = useCatalogStore((s) => s.setPlaylistTab);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);

  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = () => useCatalogStore.getState().hydrateFromDevice();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(hydrate, { timeout: 120 });
    } else {
      setTimeout(hydrate, 0);
    }
  }, []);

  useEffect(() => {
    if (!deviceHydrated) return;
    void syncLibraryFromServer();
  }, [deviceHydrated, syncLibraryFromServer]);

  useEffect(() => {
    setPlaylistTab(false);
    if (location.pathname === '/dj' || location.hash === '#/dj') {
      setDjMode(true);
      pauseSimpleAudio();
      usePlaybackStore.getState().setPlaying(false);
      usePlaybackStore.getState().setTrack(null);
      document.documentElement.classList.add('qf-mp3-upload-page');
    } else {
      setDjMode(false);
      document.documentElement.classList.remove('qf-mp3-upload-page');
    }
    return () => document.documentElement.classList.remove('qf-mp3-upload-page');
  }, [location.pathname, location.hash, setDjMode, setPlaylistTab]);

  useEffect(() => {
    if (location.pathname === '/playlists') {
      navigate('/bridge', { replace: true });
    }
  }, [location.pathname, navigate]);

  const goUpload = () => {
    setDjMode(true);
    navigate('/dj', { replace: true });
  };

  const goListen = () => {
    setDjMode(false);
    setEditPlaylistId(null);
    navigate('/bridge', { replace: true });
  };

  const handleUploadSuccess = () => {
    void syncLibraryFromServer();
  };

  const startEditPlaylist = () => {
    if (
      isMasterPlaylist(activePlaylistId) ||
      isMyLikesPlaylist(activePlaylistId)
    ) {
      return;
    }
    setEditPlaylistId(activePlaylistId);
  };

  const fullPlay = isPassenger || captainUnlocked;

  return (
    <div className="sp-app sc-shell">
      <CatalogSidebar onUploadClick={goUpload} />

      <div className="sc-main">
        <header className="sc-topbar">
          {!djMode ? (
            <button type="button" className="sc-topbar-btn sc-topbar-btn--on">
              {PLAIN.listen}
            </button>
          ) : (
            <button type="button" className="sc-topbar-btn" onClick={goListen}>
              {PLAIN.listen}
            </button>
          )}
          {djMode ? (
            <button type="button" className="sc-topbar-btn sc-topbar-btn--on">
              {PLAIN.upload}
            </button>
          ) : (
            <button type="button" className="sc-topbar-btn" onClick={goUpload}>
              {PLAIN.upload}
            </button>
          )}
          <div className="sc-topbar-spacer" />
          <button
            type="button"
            className="sc-topbar-link"
            disabled={catalogSyncing}
            onClick={() => void refreshFromServer()}
          >
            {catalogSyncing ? PLAIN.refreshing : PLAIN.refresh}
          </button>
          {!fullPlay ? (
            <button type="button" className="sc-topbar-link sc-topbar-link--accent" onClick={() => setBoardingOpen(true)}>
              {PLAIN.getPass}
            </button>
          ) : null}
          <button type="button" className="sc-topbar-link" onClick={() => setCaptainOpen(true)}>
            {PLAIN.captain}
          </button>
        </header>

        <main className="sc-scroll">
          {!djMode && trackCount === 0 ? (
            <section className="sc-empty-state">
              <h2>{PLAIN.noTracksYet}</h2>
              <button type="button" className="sc-play-all" onClick={goUpload}>
                {PLAIN.uploadFirst}
              </button>
            </section>
          ) : editPlaylistId && !djMode ? (
            <TabPane>
              <PlaylistEditor
                playlistId={editPlaylistId}
                onDone={() => setEditPlaylistId(null)}
                onPlay={() => setEditPlaylistId(null)}
              />
            </TabPane>
          ) : djMode ? (
            <TabPane>
              <Mp3Uploader onUploaded={handleUploadSuccess} />
            </TabPane>
          ) : (
            <TabPane>
              <TrackList
                isPassenger={fullPlay}
                onEditPlaylist={startEditPlaylist}
              />
            </TabPane>
          )}
        </main>
      </div>
    </div>
  );
}
