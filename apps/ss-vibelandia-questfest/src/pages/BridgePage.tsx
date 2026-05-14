import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlaylistStore } from '@/stores/playlistStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useStreamLock } from '@/hooks/useStreamLock';
import { SolenoidPlayer } from '@/components/player/SolenoidPlayer';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CatalogPanel } from '@/components/payment/CatalogPanel';
import { LibrettoOverlay } from '@/components/libretto/LibrettoOverlay';
import { useSessionStore } from '@/stores/sessionStore';

export function BridgePage() {
  const hydrate = useSessionStore((s) => s.hydrateFromStorage);
  const completeBoarding = useSessionStore((s) => s.completeBoarding);
  const boardingBusy = useSessionStore((s) => s.boardingBusy);
  const boardingError = useSessionStore((s) => s.boardingError);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const disembark = useSessionStore((s) => s.disembark);

  const getActivePlaylist = usePlaylistStore((s) => s.getActivePlaylist);
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
    hydrate();
  }, [hydrate]);

  const activePlaylistId = usePlaylistStore((s) => s.activePlaylistId);
  useEffect(() => {
    const pl = getActivePlaylist();
    if (!pl?.trackIds.length) return;
    const cur = usePlaybackStore.getState().currentTrackId;
    if (!cur || !pl.trackIds.includes(cur)) {
      setTrack(pl.trackIds[0]);
    }
  }, [activePlaylistId, getActivePlaylist, setTrack]);

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

  return (
    <div className="bridge">
      <header className="bridge-top bridge-top--warm">
        <div>
          <p className="bridge-eyebrow">SS Vibelandia · QUESTFEST</p>
          <h1 className="bridge-title">Reno Swamp Player &amp; Catalog</h1>
          <p className="bridge-tagline">Everything free for 30 seconds — then stay if the vibe hits.</p>
        </div>
        <nav className="bridge-nav">
          <Link to="/" className="voxel-btn voxel-btn--ghost">
            Passenger hatch
          </Link>
          <button
            type="button"
            className="voxel-btn"
            onClick={() => {
              disembark();
              usePlaybackStore.getState().setPlaying(false);
              usePlaybackStore.getState().setGain(1);
            }}
          >
            Disembark
          </button>
        </nav>
      </header>

      <main className="bridge-main">
        <section className="bridge-col bridge-col--wide">
          <div className="bridge-player-stack">
            <SolenoidPlayer
              onFairExchange={onFairExchange}
              onVesselSwitch={onVesselSwitch}
              killReason={stream.killReason}
              beginSession={stream.beginSession}
              clearKill={stream.clearKill}
            />
            <LibrettoOverlay />
          </div>
        </section>
        <aside className="bridge-col bridge-aside">
          <CatalogPanel isPassenger={isPassenger} />
        </aside>
      </main>

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
