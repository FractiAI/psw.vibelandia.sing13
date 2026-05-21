import { useEffect } from 'react';
import { writePlaybackSession } from '@/lib/playbackSession';
import { usePlaybackStore } from '@/stores/playbackStore';

/** Keep queue position + play intent across hide/screensaver/remount. */
export function usePlaybackSessionPersistence() {
  const trackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);

  useEffect(() => {
    writePlaybackSession({ trackId, isPlaying, displayTime });
  }, [trackId, isPlaying, displayTime]);

  useEffect(() => {
    const flush = () => {
      const s = usePlaybackStore.getState();
      writePlaybackSession({
        trackId: s.currentTrackId,
        isPlaying: s.isPlaying,
        displayTime: s.displayTime,
      });
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);
}
