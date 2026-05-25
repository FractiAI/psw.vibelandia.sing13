import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { PlaylistBulkExportModal } from '@/components/payment/PlaylistBulkExportModal';

const TrackList = lazy(() =>
  import('@/components/catalog/TrackList').then((m) => ({ default: m.TrackList })),
);
const PlaylistLibrary = lazy(() =>
  import('@/components/catalog/PlaylistLibrary').then((m) => ({ default: m.PlaylistLibrary })),
);
const DjStudio = lazy(() =>
  import('@/components/catalog/DjStudio').then((m) => ({ default: m.DjStudio })),
);

function TabPane({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="sp-empty">Loading…</p>}>{children}</Suspense>;
}
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { PLAIN } from '@/lib/plainSpeak';
import { BridgeTowerBillboard } from '@/components/BridgeTowerBillboard';
import { BuildNoticeBanner } from '@/components/BuildNoticeBanner';
import { CAPITANS_BRIDGE } from '@/lib/productNames';
import { isIOSDevice } from '@/lib/devicePlayback';
import { pauseSimpleAudio } from '@/lib/simplePlayback';

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
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);

  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const showMembersOffer = !isPassenger && !captainUnlocked;

  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [playlistEditId, setPlaylistEditId] = useState<string | null>(null);

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
    if (location.pathname === '/dj' || location.hash === '#/dj') {
      setDjMode(true);
    } else if (location.pathname === '/playlists' || location.hash === '#/playlists') {
      setDjMode(false);
    }
  }, [location.pathname, location.hash, setDjMode]);

  const isPlaylistsView =
    location.pathname === '/playlists' || location.hash === '#/playlists';

  useEffect(() => {
    if (!isPlaylistsView) setPlaylistEditId(null);
  }, [isPlaylistsView]);

  const goDj = () => {
    setDjMode(true);
    navigate('/dj', { replace: true });
  };

  const handleUploadSuccess = (_trackId: string) => {
    pauseSimpleAudio();
    setPlaying(false);
    setTrack(null);
    setActivePlaylist(MASTER_PLAYLIST_ID);
    if (isIOSDevice()) {
      /* Stay on Upload — navigating during picker teardown causes Safari blue-screen hang. */
      return;
    }
    setDjMode(false);
    navigate('/bridge', { replace: true });
  };

  const goListen = () => {
    setDjMode(false);
    setActivePlaylist(MASTER_PLAYLIST_ID);
    navigate('/bridge', { replace: true });
  };

  const goPlaylists = () => {
    setDjMode(false);
    navigate('/playlists', { replace: true });
  };

  const editPlaylist = (id: string) => {
    setPlaylistEditId(id);
    goPlaylists();
  };

  const openPlaylist = (id: string) => {
    setActivePlaylist(id);
    goListen();
  };

  return (
    <>
      <BuildNoticeBanner />
      <div className="sp-app">
      <CatalogSidebar onDjClick={goDj} />

      <div className="sp-main">
        {!djMode && (
          <div className="sp-bridge-tower-wrap">
            <BridgeTowerBillboard />
          </div>
        )}
        <header className="sp-top">
          <div className="sp-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!djMode && !isPlaylistsView}
              className={`sp-tab${!djMode && !isPlaylistsView ? ' sp-tab--on' : ''}`}
              onClick={goListen}
            >
              Listen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isPlaylistsView}
              className={`sp-tab${isPlaylistsView ? ' sp-tab--on' : ''}`}
              onClick={goPlaylists}
            >
              Playlists
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={djMode}
              className={`sp-tab sp-tab--dj${djMode ? ' sp-tab--on' : ''}`}
              onClick={goDj}
            >
              Upload
            </button>
          </div>
          <nav className="sp-top-nav">
            <button
              type="button"
              className="sp-top-link"
              disabled={catalogSyncing}
              onClick={() => void refreshFromServer()}
              title="Optional — only when you want to pull new uploads from the server"
            >
              {catalogSyncing ? 'Updating…' : 'Refresh'}
            </button>
            {showMembersOffer ? (
              <a
                href="/interfaces/vibelandia-questfest.html?campaign=1"
                className="sp-top-link sp-top-link--offer"
              >
                Members offer
              </a>
            ) : null}
            <a href="/interfaces/vibelandia-questfest.html" className="sp-top-link">
              QUESTFEST
            </a>
            <button
              type="button"
              className="sp-top-link"
              onClick={() => setCaptainOpen(true)}
              title={CAPITANS_BRIDGE}
            >
              Capitan
            </button>
          </nav>
        </header>

        <main className="sp-scroll">
          {!djMode && !isPlaylistsView && trackCount === 0 ? (
            <section className="sp-empty-catalog">
              <h2 className="sp-empty-catalog-title">No songs in catalog yet</h2>
              <p className="sp-empty-catalog-desc">{PLAIN.noTracksUpload}</p>
              <button type="button" className="sp-tab sp-tab--dj sp-tab--on" onClick={goDj}>
                {PLAIN.upload}
              </button>
            </section>
          ) : isPlaylistsView ? (
            <TabPane>
              <PlaylistLibrary
                onOpenPlaylist={openPlaylist}
                initialEditId={playlistEditId}
                onClearInitialEdit={() => setPlaylistEditId(null)}
              />
            </TabPane>
          ) : djMode ? (
            <TabPane>
              <DjStudio onUploadSuccess={handleUploadSuccess} />
            </TabPane>
          ) : (
            <TabPane>
              <TrackList
                isPassenger={isPassenger || captainUnlocked}
                onEditPlaylist={() => editPlaylist(activePlaylistId)}
                onBulkPlaylistDownload={() => setBulkExportOpen(true)}
              />
            </TabPane>
          )}
        </main>

      </div>

      <PlaylistBulkExportModal
        open={bulkExportOpen}
        onClose={() => setBulkExportOpen(false)}
        onNeedPass={() => {
          setBulkExportOpen(false);
          setBoardingOpen(true);
        }}
        onCaptainRequest={() => {
          setBulkExportOpen(false);
          setCaptainOpen(true);
        }}
      />
    </div>
    </>
  );
}
