import { useCallback } from 'react';
import { useStreamLock } from '@/hooks/useStreamLock';
import { NowPlayingBar } from '@/components/catalog/NowPlayingBar';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';

/** In-flow player at the bottom of the Bridge column (scrolls with the page). */
export function PlayerDock() {
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const showVessel = useMediaChromeStore((s) => s.showVessel);
  const hideVessel = useMediaChromeStore((s) => s.hideVessel);
  const vesselOpen = useMediaChromeStore((s) => s.vesselOpen);
  const vesselKind = useMediaChromeStore((s) => s.vesselKind);
  const setGain = usePlaybackStore((s) => s.setGain);
  const stream = useStreamLock();

  const onFairExchange = useCallback(() => setFairOpen(true), [setFairOpen]);

  const onVesselSwitch = useCallback(
    (reason: 'vessel_switch' | 'tab_preempt') => {
      showVessel(reason);
    },
    [showVessel],
  );

  return (
    <>
      <div className="sp-player-dock" aria-live="polite">
        <NowPlayingBar
          onFairExchange={onFairExchange}
          onVesselSwitch={onVesselSwitch}
          killReason={stream.killReason}
          beginSession={stream.beginSession}
          clearKill={stream.clearKill}
          onDownload={(trackId) => useMediaChromeStore.getState().openExport(trackId)}
        />
      </div>

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
