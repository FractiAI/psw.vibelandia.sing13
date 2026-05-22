import { useEffect } from 'react';
import { readLivePlaybackPosition } from '@/lib/playbackMediaRegistry';
import { writePlaybackSession } from '@/lib/playbackSession';
import { usePlaybackStore } from '@/stores/playbackStore';

export function flushPlaybackSession() {
  const s = usePlaybackStore.getState();
  const live = readLivePlaybackPosition();
  const displayTime = live > 0.25 ? live : s.displayTime;
  if (displayTime > 0.25) s.setDisplayTime(displayTime);
  writePlaybackSession({
    trackId: s.currentTrackId,
    isPlaying: s.isPlaying,
    displayTime,
  });
}

/** Keep queue position + play intent across hide/screensaver/remount. */
export function usePlaybackSessionPersistence() {
  const trackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  useEffect(() => {
    flushPlaybackSession();
  }, [trackId, isPlaying]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushPlaybackSession();
    };
    window.addEventListener('pagehide', flushPlaybackSession);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', flushPlaybackSession);
    return () => {
      window.removeEventListener('pagehide', flushPlaybackSession);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', flushPlaybackSession);
    };
  }, []);
}
