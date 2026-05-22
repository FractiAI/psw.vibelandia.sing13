import { useCallback } from 'react';
import { useStreamLock } from '@/hooks/useStreamLock';
import { SimplePlayer } from '@/components/player/SimplePlayer';
import { VesselSwitchModal } from '@/components/player/VesselSwitchModal';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { useSessionStore } from '@/stores/sessionStore';

/** In-flow player at the bottom of the Bridge column (scrolls with the page). */
export function PlayerDock() {
  const setFairOpen = useMediaChromeStore((s) => s.setFairOpen);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const showVessel = useMediaChromeStore((s) => s.showVessel);
  const hideVessel = useMediaChromeStore((s) => s.hideVessel);
  const vesselOpen = useMediaChromeStore((s) => s.vesselOpen);
  const vesselKind = useMediaChromeStore((s) => s.vesselKind);
  const setGain = usePlaybackStore((s) => s.setGain);
  const stream = useStreamLock();

  const onFairExchange = useCallback(() => {
    if (isPassenger || captainUnlocked) return;
    setFairOpen(true);
  }, [captainUnlocked, isPassenger, setFairOpen]);

  const onVesselSwitch = useCallback(
    (reason: 'vessel_switch' | 'tab_preempt') => {
      showVessel(reason);
    },
    [showVessel],
  );

  return (
    <>
      <div className="sp-player-dock" aria-live="polite">
        <SimplePlayer
          onFairExchange={onFairExchange}
          onVesselSwitch={onVesselSwitch}
          killReason={stream.killReason}
          beginSession={stream.beginSession}
          clearKill={stream.clearKill}
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
