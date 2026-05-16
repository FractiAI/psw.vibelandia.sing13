import { useEffect, useState } from 'react';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CaptainUnlockModal } from '@/components/payment/CaptainUnlockModal';
import { ExportTrackModal } from '@/components/payment/ExportTrackModal';
import { MachoteCampaignModal } from '@/components/payment/MachoteCampaignModal';
import { MACHOTE_CAMPAIGN_STORAGE_KEY } from '@/lib/machoteMembership';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import type { BoardingRequestBody } from '@/lib/api';

/**
 * Global modals and session hydration. The player dock lives in BridgePage (in-flow scroll).
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
  const exportTrackId = useMediaChromeStore((s) => s.exportTrackId);
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const closeExport = useMediaChromeStore((s) => s.closeExport);

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    hydrateSession();
    if (!catalogHydrated) void hydrateCatalog();
    setSessionReady(true);
  }, [catalogHydrated, hydrateCatalog, hydrateSession]);

  useEffect(() => {
    if (!sessionReady) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === '1') {
      setBoardingOpen(true);
      return;
    }
    if (isPassenger || captainUnlocked) return;
    if (sessionStorage.getItem(MACHOTE_CAMPAIGN_STORAGE_KEY)) return;
    setCampaignOpen(true);
  }, [sessionReady, isPassenger, captainUnlocked, setBoardingOpen]);

  const dismissCampaign = () => {
    sessionStorage.setItem(MACHOTE_CAMPAIGN_STORAGE_KEY, '1');
    setCampaignOpen(false);
  };

  /** Re-check honor end date without reload (e.g. tab left open past midnight). */
  useEffect(() => {
    const id = window.setInterval(() => hydrateSession(), 60_000);
    return () => window.clearInterval(id);
  }, [hydrateSession]);

  const handleBoarding = async (payload: BoardingRequestBody) => {
    const ok = await completeBoarding(payload);
    if (ok) {
      setBoardingOpen(false);
      setFairOpen(false);
      setCampaignOpen(false);
      sessionStorage.setItem(MACHOTE_CAMPAIGN_STORAGE_KEY, '1');
      setGain(1);
    }
  };

  const exportTrack = exportTrackId ? getTrack(exportTrackId) : undefined;

  return (
    <>
      <MachoteCampaignModal
        open={campaignOpen}
        onClose={dismissCampaign}
        onGetPass={() => {
          dismissCampaign();
          setBoardingOpen(true);
        }}
      />

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
    </>
  );
}
