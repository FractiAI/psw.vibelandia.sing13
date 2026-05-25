import { useEffect } from 'react';
import { GlobalAudio } from '@/components/player/GlobalAudio';
import { PlayerDock } from '@/components/player/PlayerDock';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

/** App-level playback — one <audio> always mounted; chrome hidden on Upload tab. */
export function PlaybackRoot() {
  const djMode = useCatalogStore((s) => s.djMode);

  useEffect(() => {
    document.documentElement.classList.toggle('qf-upload-tab', djMode);
    if (djMode) {
      pauseSimpleAudio();
      const pb = usePlaybackStore.getState();
      pb.setPlaying(false);
      pb.setTrack(null);
      pb.setPlaybackError(null);
    }
    return () => document.documentElement.classList.remove('qf-upload-tab');
  }, [djMode]);

  return (
    <div className="sp-playback-stack" aria-hidden={djMode}>
      <GlobalAudio />
      {!djMode ? <PlayerDock /> : null}
    </div>
  );
}
