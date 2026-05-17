import { useEffect } from 'react';
import { FairExchangeModal } from '@/components/player/FairExchangeModal';
import { BoardingModal } from '@/components/payment/BoardingModal';
import { CaptainUnlockModal } from '@/components/payment/CaptainUnlockModal';
import { MachoteCampaignModal } from '@/components/payment/MachoteCampaignModal';
import { ExportTrackModal } from '@/components/payment/ExportTrackModal';
import {
  consumeCampaignResetFromUrl,
  dismissMachoteCampaign,
  shouldAutoShowMachoteCampaign,
} from '@/lib/machoteCampaignStorage';
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
  const campaignOpen = useMediaChromeStore((s) => s.campaignOpen);
  const exportTrackId = useMediaChromeStore((s) => s.exportTrackId);
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const setCaptainOpen = useMediaChromeStore((s) => s.setCaptainOpen);
  const setCampaignOpen = useMediaChromeStore((s) => s.setCampaignOpen);
  const closeExport = useMediaChromeStore((s) => s.closeExport);

  const hasMembersAccess = isPassenger || captainUnlocked;

  useEffect(() => {
    hydrateSession();
    if (!catalogHydrated) void hydrateCatalog();
  }, [catalogHydrated, hydrateCatalog, hydrateSession]);

  /** Re-check honor end date without reload (e.g. tab left open past midnight). */
  useEffect(() => {
    const id = window.setInterval(() => hydrateSession(), 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') hydrateSession();
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'qv-local-monthly-honor' || ev.key === 'qv-pass-token') hydrateSession();
    };
    const onPageShow = () => hydrateSession();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [hydrateSession]);

  useEffect(() => {
    consumeCampaignResetFromUrl();
  }, []);

  /** Machote campaign · top deck (auto once per browser until dismissed). */
  useEffect(() => {
    if (!catalogHydrated) return;
    if (!shouldAutoShowMachoteCampaign(hasMembersAccess)) return;
    const t = window.setTimeout(() => setCampaignOpen(true), 500);
    return () => window.clearTimeout(t);
  }, [catalogHydrated, hasMembersAccess, setCampaignOpen]);

  useEffect(() => {
    if (hasMembersAccess && campaignOpen) setCampaignOpen(false);
  }, [hasMembersAccess, campaignOpen, setCampaignOpen]);

  const closeCampaign = (dismiss: boolean) => {
    if (dismiss) dismissMachoteCampaign();
    setCampaignOpen(false);
  };

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

      <MachoteCampaignModal
        open={campaignOpen}
        onClose={() => closeCampaign(true)}
        onGetPass={() => {
          closeCampaign(true);
          setBoardingOpen(true);
        }}
      />

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
          const st = useSessionStore.getState();
          if (st.isPassenger || st.captainUnlocked) return;
          setFairOpen(true);
        }}
      />
    </>
  );
}
