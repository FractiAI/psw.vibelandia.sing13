import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { ListenTopBar } from '@/components/catalog/ListenTopBar';
import { PLAIN } from '@/lib/plainSpeak';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';

const TrackList = lazy(() =>
  import('@/components/catalog/TrackList').then((m) => ({ default: m.TrackList })),
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

  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const setPlaylistTab = useCatalogStore((s) => s.setPlaylistTab);

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
    navigate('/bridge', { replace: true });
  };

  const handleUploadSuccess = () => {
    void syncLibraryFromServer();
  };

  return (
    <div className="sp-app sc-shell sc-shell--solo">
      <div className="sc-main">
        {djMode ? <ListenTopBar djMode={djMode} onListen={goListen} onUpload={goUpload} /> : null}

        <main className="sc-scroll">
          {!djMode && trackCount === 0 ? (
            <section className="sc-empty-state sc-feed-body">
              <h2>{PLAIN.noTracksYet}</h2>
              <button type="button" className="sc-play-all" onClick={goUpload}>
                {PLAIN.uploadFirst}
              </button>
            </section>
          ) : djMode ? (
            <div className="sc-feed-body">
              <TabPane>
                <Mp3Uploader onUploaded={handleUploadSuccess} />
              </TabPane>
            </div>
          ) : (
            <TabPane>
              <TrackList />
            </TabPane>
          )}
        </main>
      </div>
    </div>
  );
}
