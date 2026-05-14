import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const hydrateSession = useSessionStore((s) => s.hydrateFromStorage);
  const completeBoarding = useSessionStore((s) => s.completeBoarding);
  const boardingBusy = useSessionStore((s) => s.boardingBusy);
  const boardingError = useSessionStore((s) => s.boardingError);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const disembark = useSessionStore((s) => s.disembark);

  const hydrateCatalog = useCatalogStore((s) => s.hydrate);
  const hydrated = useCatalogStore((s) => s.hydrated);
  const djMode = useCatalogStore((s) => s.djMode);
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
      <div className="spotify-shell spotify-shell--loading">
        <p>Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="spotify-shell">
      <CatalogSidebar />

      <div className="spotify-body">
        <header className="spotify-topbar">
          <p className="spotify-topbar-title">Hero Jo Golden Bachdoor Hit Factory · Reno Swamp Beats Caliente</p>
          <nav className="spotify-topbar-nav">
            <Link to="/" className="spotify-link">
              Home
            </Link>
            <button
              type="button"
              className="spotify-link spotify-link--btn"
              onClick={() => {
                disembark();
                usePlaybackStore.getState().setPlaying(false);
                setGain(1);
              }}
            >
              {isPassenger ? 'Sign out pass' : 'Account'}
            </button>
          </nav>
        </header>

        <main className="spotify-content">
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
