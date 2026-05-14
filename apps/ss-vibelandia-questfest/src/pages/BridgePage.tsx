import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useStreamLock } from '@/hooks/useStreamLock';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar';
import { TrackList } from '@/components/catalog/TrackList';
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
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const getActivePlaylist = useCatalogStore((s) => s.getActivePlaylist);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setGain = usePlaybackStore((s) => s.setGain);

  const [fairOpen, setFairOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [vesselOpen, setVesselOpen] = useState(false);
  const [vesselKind, setVesselKind] = useState<'vessel_switch' | 'tab_preempt' | null>(null);

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
    }
  }, [location.pathname, location.hash, setDjMode]);

  const goDj = () => {
    setDjMode(true);
    navigate('/dj', { replace: true });
  };

  const goListen = () => {
    setDjMode(false);
    navigate('/bridge', { replace: true });
  };

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
              aria-selected={!djMode}
              className={`sp-tab${!djMode ? ' sp-tab--on' : ''}`}
              onClick={goListen}
            >
              Listen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={djMode}
              className={`sp-tab sp-tab--dj${djMode ? ' sp-tab--on' : ''}`}
              onClick={goDj}
            >
              Upload &amp; playlists
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
          {djMode ? <DjStudio /> : <TrackList isPassenger={isPassenger} />}
        </main>
      </div>

      <NowPlayingBar
        onFairExchange={onFairExchange}
        onVesselSwitch={onVesselSwitch}
        killReason={stream.killReason}
        beginSession={stream.beginSession}
        clearKill={stream.clearKill}
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
