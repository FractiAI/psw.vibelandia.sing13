import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useStreamLock } from '@/hooks/useStreamLock';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { ExportTrackModal } from '@/components/payment/ExportTrackModal';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { TrackList } from '@/components/catalog/TrackList';
import { PlaylistLibrary } from '@/components/catalog/PlaylistLibrary';
import { DjStudio } from '@/components/catalog/DjStudio';
import { NowPlayingBar } from '@/components/catalog/NowPlayingBar';
import { useSessionStore } from '@/stores/sessionStore';

export function BridgePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const hydrateSession = useSessionStore((s) => s.hydrateFromStorage);
  const completeBoarding = useSessionStore((s) => s.completeBoarding);
  const boardingBusy = useSessionStore((s) => s.boardingBusy);
  const boardingError = useSessionStore((s) => s.boardingError);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const disembark = useSessionStore((s) => s.disembark);

  const hydrateCatalog = useCatalogStore((s) => s.hydrate);
  const hydrated = useCatalogStore((s) => s.hydrated);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setGain = usePlaybackStore((s) => s.setGain);

  const [fairOpen, setFairOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTrackId, setExportTrackId] = useState<string | null>(null);
  const [vesselOpen, setVesselOpen] = useState(false);
  const [vesselKind, setVesselKind] = useState<'vessel_switch' | 'tab_preempt' | null>(null);
  const [playlistEditId, setPlaylistEditId] = useState<string | null>(null);

  const stream = useStreamLock();

  const onFairExchange = useCallback(() => setFairOpen(true), []);
  const onVesselSwitch = useCallback((reason: 'vessel_switch' | 'tab_preempt') => {
    setVesselKind(reason);
    setVesselOpen(true);
  }, []);

  useEffect(() => {
    hydrateSession();
    void hydrateCatalog();
  }, [hydrateSession, hydrateCatalog]);

  useEffect(() => {
    if (location.pathname === '/dj' || location.hash === '#/dj') {
      setDjMode(true);
    } else if (location.pathname === '/playlists' || location.hash === '#/playlists') {
      setDjMode(false);
    }
  }, [location.pathname, location.hash, setDjMode]);

  const isPlaylistsView =
    location.pathname === '/playlists' || location.hash === '#/playlists';

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
    setExportTrackId(trackId);
    setExportOpen(true);
  };

  const exportTrack = exportTrackId ? getTrack(exportTrackId) : undefined;

  const handleBoarding = async (
    rail: Parameters<typeof completeBoarding>[0],
    receipt: string,
    contact: string,
  ) => {
    const ok = await completeBoarding(rail, receipt, contact);
    if (ok) {
      setBoardOpen(false);
      setFairOpen(false);
      setGain(1);
    }
  };

  if (!hydrated) {
    return (
      <div className="sp-app sp-app--loading">
        <p>Loading catalog…</p>
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
            <Link to="/" className="sp-top-link">
              Home
            </Link>
            <button
              type="button"
              className="sp-top-link"
              onClick={() => {
                disembark();
                usePlaybackStore.getState().setPlaying(false);
                setGain(1);
              }}
            >
              {isPassenger ? 'Pass' : 'Account'}
            </button>
          </nav>
        </header>

        <main className="sp-scroll">
          {!djMode && !isPlaylistsView && trackCount === 0 ? (
            <section className="sp-empty-catalog">
              <h2 className="sp-empty-catalog-title">No tracks yet</h2>
              <p className="sp-empty-catalog-desc">
                Catalog is empty. Use Upload to add a track, then listen and press play.
              </p>
              <button type="button" className="sp-tab sp-tab--dj sp-tab--on" onClick={goDj}>
                Upload a track
              </button>
            </section>
          ) : isPlaylistsView ? (
            <PlaylistLibrary
              onOpenPlaylist={openPlaylist}
              initialEditId={playlistEditId}
            />
          ) : djMode ? (
            <DjStudio onUploadSuccess={handleUploadSuccess} />
          ) : (
            <TrackList
              isPassenger={isPassenger}
              onDownload={handleDownloadRequest}
              onEditPlaylist={() => editPlaylist(activePlaylistId)}
            />
          )}
        </main>
      </div>

      <NowPlayingBar
        onFairExchange={onFairExchange}
        onVesselSwitch={onVesselSwitch}
        killReason={stream.killReason}
        beginSession={stream.beginSession}
        clearKill={stream.clearKill}
        onDownload={handleDownloadRequest}
      />

      <FairExchangeModal
        open={fairOpen}
        onClose={() => setFairOpen(false)}
        onBoard={() => {
          setFairOpen(false);
          setBoardOpen(true);
        }}
      />

      <BoardingModal
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
        onSubmit={handleBoarding}
        busy={boardingBusy}
        error={boardingError}
      />

      <ExportTrackModal
        open={exportOpen}
        track={exportTrack}
        isPassenger={isPassenger}
        onClose={() => {
          setExportOpen(false);
          setExportTrackId(null);
        }}
        onNeedPass={() => {
          setExportOpen(false);
          setBoardOpen(true);
        }}
      />

      <VesselSwitchModal
        open={vesselOpen}
        kind={vesselKind}
        onAck={() => {
          setVesselOpen(false);
          setVesselKind(null);
          stream.clearKill();
          setGain(1);
        }}
      />
    </div>
  );
}
