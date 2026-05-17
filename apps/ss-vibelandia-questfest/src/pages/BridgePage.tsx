import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { PlaylistBulkExportModal } from '@/components/payment/PlaylistBulkExportModal';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { TrackList } from '@/components/catalog/TrackList';
import { PlaylistLibrary } from '@/components/catalog/PlaylistLibrary';
import { DjStudio } from '@/components/catalog/DjStudio';
import { PlayerDock } from '@/components/player/PlayerDock';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { PLAIN } from '@/lib/plainSpeak';

export function BridgePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);

  const hydrated = useCatalogStore((s) => s.hydrated);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);

  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const openExport = useMediaChromeStore((s) => s.openExport);

  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [playlistEditId, setPlaylistEditId] = useState<string | null>(null);

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

  const handleUploadSuccess = (trackId: string) => {
    goListen();
    setTrack(trackId);
    setPlaying(true);
  };

  const goListen = () => {
    setDjMode(false);
    navigate('/bridge', { replace: true });
    const st = useCatalogStore.getState();
    if (Object.keys(st.tracks).length > 0) {
      st.persist();
      st.setActivePlaylist(MASTER_PLAYLIST_ID);
    }
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

  const getActivePlaylist = useCatalogStore((s) => s.getActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  useEffect(() => {
    if (!hydrated) return;
    const pl = getActivePlaylist();
    if (!pl?.trackIds.length) return;
    const cur = usePlaybackStore.getState().currentTrackId;
    if (!cur || !pl.trackIds.includes(cur)) {
      setTrack(pl.trackIds[0]);
    }
  }, [activePlaylistId, getActivePlaylist, hydrated, setTrack]);

  const handleDownloadRequest = (trackId: string) => {
    openExport(trackId);
  };

  if (!hydrated) {
    return (
      <div className="sp-app sp-app--loading">
        <p>{PLAIN.loadingCatalog}</p>
      </div>
    );
  }

  return (
    <div className="sp-app">
      <CatalogSidebar onDjClick={goDj} />

      <div className="sp-main">
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
            <a href="/questfest" className="sp-top-link">
              SS Vibelandia
            </a>
            <Link to="/" className="sp-top-link">
              Home
            </Link>
            <button type="button" className="sp-top-link" onClick={() => setCaptainOpen(true)}>
              Captain
            </button>
          </nav>
        </header>

        <main className="sp-scroll">
          {!djMode && !isPlaylistsView && trackCount === 0 ? (
            <section className="sp-empty-catalog">
              <h2 className="sp-empty-catalog-title">No songs yet</h2>
              <p className="sp-empty-catalog-desc">{PLAIN.noTracksUpload}</p>
              <button type="button" className="sp-tab sp-tab--dj sp-tab--on" onClick={goDj}>
                {PLAIN.upload}
              </button>
            </section>
          ) : isPlaylistsView ? (
            <PlaylistLibrary
              onOpenPlaylist={openPlaylist}
              initialEditId={playlistEditId}
              onClearInitialEdit={() => setPlaylistEditId(null)}
            />
          ) : djMode ? (
            <DjStudio onUploadSuccess={handleUploadSuccess} />
          ) : (
            <TrackList
              isPassenger={isPassenger || captainUnlocked}
              onDownload={handleDownloadRequest}
              onEditPlaylist={() => editPlaylist(activePlaylistId)}
              onBulkPlaylistDownload={() => setBulkExportOpen(true)}
            />
          )}
        </main>

        <PlayerDock />
      </div>

      <PlaylistBulkExportModal
        open={bulkExportOpen}
        onClose={() => setBulkExportOpen(false)}
        onNeedPass={() => {
          setBulkExportOpen(false);
          useMediaChromeStore.getState().setFairOpen(true);
        }}
        onCaptainRequest={() => {
          setBulkExportOpen(false);
          setCaptainOpen(true);
        }}
      />
    </div>
  );
}
