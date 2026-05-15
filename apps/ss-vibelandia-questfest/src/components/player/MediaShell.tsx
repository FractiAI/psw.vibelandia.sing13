import { useCallback, useEffect } from 'react';
import { useStreamLock } from '@/hooks/useStreamLock';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CaptainUnlockModal } from '@/components/payment/CaptainUnlockModal';
import { ExportTrackModal } from '@/components/payment/ExportTrackModal';
import { NowPlayingBar } from '@/components/catalog/NowPlayingBar';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import type { BoardingRequestBody } from '@/lib/api';

/**
 * Lives under the app router but outside route elements so playback and media elements
 * stay mounted when navigating (e.g. Bridge → Home).
 */
export function MediaShell() {
  const catalogHydrated = useCatalogStore((s) => s.hydrated);
  const hydrateCatalog = useCatalogStore((s) => s.hydrate);
  const hydrateSession = useSessionStore((s) => s.hydrateFromStorage);
  const completeBoarding = useSessionStore((s) => s.completeBoarding);
  const boardingBusy = useSessionStore((s) => s.boardingBusy);
  const boardingError = useSessionStore((s) => s.boardingError);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setGain = usePlaybackStore((s) => s.setGain);

  const fairOpen = useMediaChromeStore((s) => s.fairOpen);
  const boardingOpen = useMediaChromeStore((s) => s.boardingOpen);
  const captainOpen = useMediaChromeStore((s) => s.captainOpen);
  const vesselOpen = useMediaChromeStore((s) => s.vesselOpen);
  const vesselKind = useMediaChromeStore((s) => s.vesselKind);
  const exportTrackId = useMediaChromeStore((s) => s.exportTrackId);
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const showVessel = useMediaChromeStore((s) => s.showVessel);
  const hideVessel = useMediaChromeStore((s) => s.hideVessel);
  const closeExport = useMediaChromeStore((s) => s.closeExport);

  const stream = useStreamLock();

  useEffect(() => {
    hydrateSession();
    if (!catalogHydrated) void hydrateCatalog();
  }, [catalogHydrated, hydrateCatalog, hydrateSession]);

  const onFairExchange = useCallback(() => setFairOpen(true), [setFairOpen]);

  const onVesselSwitch = useCallback(
    (reason: 'vessel_switch' | 'tab_preempt') => {
      showVessel(reason);
    },
    [showVessel],
  );

  const handleBoarding = async (payload: BoardingRequestBody) => {
    const ok = await completeBoarding(payload);
    if (ok) {
      setBoardingOpen(false);
      setFairOpen(false);
      setGain(1);
    }
  };

  const exportTrack = exportTrackId ? getTrack(exportTrackId) : undefined;

  return (
    <>
      <div className="sp-media-shell" aria-live="polite">
        <NowPlayingBar
          onFairExchange={onFairExchange}
          onVesselSwitch={onVesselSwitch}
          killReason={stream.killReason}
          beginSession={stream.beginSession}
          clearKill={stream.clearKill}
          onDownload={(trackId) => useMediaChromeStore.getState().openExport(trackId)}
        />
      </div>

      <FairExchangeModal
        open={fairOpen}
        onClose={() => setFairOpen(false)}
        onBoard={() => {
          setFairOpen(false);
          setBoardingOpen(true);
        }}
        onCaptainAccess={() => {
          setFairOpen(false);
          setCaptainOpen(true);
        }}
      />

      <BoardingModal
        open={boardingOpen}
        onClose={() => setBoardingOpen(false)}
        onSubmit={handleBoarding}
        busy={boardingBusy}
        error={boardingError}
      />

      <CaptainUnlockModal open={captainOpen} onClose={() => setCaptainOpen(false)} />

      <ExportTrackModal
        open={!!exportTrackId}
        track={exportTrack}
        isPassenger={isPassenger}
        captainUnlocked={captainUnlocked}
        onClose={() => {
          closeExport();
        }}
        onNeedPass={() => {
          closeExport();
          setBoardingOpen(true);
        }}
      />

      <VesselSwitchModal
        open={vesselOpen}
        kind={vesselKind}
        onAck={() => {
          hideVessel();
          stream.clearKill();
          setGain(1);
        }}
      />
    </>
  );
}
