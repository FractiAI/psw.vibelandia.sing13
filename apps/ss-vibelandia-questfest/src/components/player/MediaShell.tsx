import { useEffect } from 'react';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CaptainUnlockModal } from '@/components/payment/CaptainUnlockModal';
import { ExportTrackModal } from '@/components/payment/ExportTrackModal';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import type { BoardingHonorPayload } from '@/lib/boardingHonor';

/** Modals + session only — catalog loads from cache/bundle; Refresh pulls server updates. */
export function MediaShell() {
  const hydrateSession = useSessionStore((s) => s.hydrateFromStorage);
  const completeBoarding = useSessionStore((s) => s.completeBoarding);
  const boardingBusy = useSessionStore((s) => s.boardingBusy);
  const boardingError = useSessionStore((s) => s.boardingError);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const markTrackDownloaded = useCatalogStore((s) => s.markTrackDownloaded);
  const setGain = usePlaybackStore((s) => s.setGain);

  const fairOpen = useMediaChromeStore((s) => s.fairOpen);
  const boardingOpen = useMediaChromeStore((s) => s.boardingOpen);
  const captainOpen = useMediaChromeStore((s) => s.captainOpen);
  const exportTrackId = useMediaChromeStore((s) => s.exportTrackId);
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const closeExport = useMediaChromeStore((s) => s.closeExport);

  useEffect(() => {
    hydrateSession();
    usePlaybackStore.getState().hydratePlaybackPrefs();
    usePlaybackStore.getState().setPlaying(false);
    usePlaybackStore.getState().setTrack(null);

    const params = new URLSearchParams(window.location.search);
    if (params.get('boarding') === '1') {
      setBoardingOpen(true);
    }

  }, [hydrateSession, setBoardingOpen]);

  const handleBoarding = async (payload: BoardingHonorPayload) => {
    const ok = await completeBoarding(payload);
    if (ok) {
      usePlaybackStore.getState().applyPassHolderPlaybackDefaults();
      setBoardingOpen(false);
      setFairOpen(false);
      setGain(1);
    }
  };

  const exportTrack = exportTrackId ? getTrack(exportTrackId) : undefined;

  return (
    <>
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
        onClose={() => closeExport()}
        onDownloaded={(trackId) => markTrackDownloaded(trackId)}
        onNeedPass={() => {
          closeExport();
          const st = useSessionStore.getState();
          if (st.isPassenger || st.captainUnlocked) return;
          setFairOpen(true);
        }}
      />
    </>
  );
}
