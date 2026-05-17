import { useEffect, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { usePlaybackStore } from '@/stores/playbackStore';

interface UseBackgroundPlaybackOptions {
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  backgroundAudioRef: RefObject<HTMLAudioElement | null>;
  allowBackgroundPlay: boolean;
  isPlaying: boolean;
  track: TrackDef | undefined;
  isVideo: boolean;
  setPlaying: (playing: boolean) => void;
  onRequestResume?: () => void;
}

/**
 * Simplified playback: free listeners pause when the tab is hidden.
 * Paid listeners keep the primary element only (no wake-lock / dual-audio loops).
 */
export function useBackgroundPlayback({
  mediaRef,
  allowBackgroundPlay,
  isPlaying,
  setPlaying,
}: UseBackgroundPlaybackOptions) {
  useEffect(() => {
    if (allowBackgroundPlay) return;

    const pauseIfHidden = () => {
      if (!document.hidden) return;
      const el = mediaRef.current;
      if (el && !el.paused) el.pause();
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };

    document.addEventListener('visibilitychange', pauseIfHidden);
    window.addEventListener('pagehide', pauseIfHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseIfHidden);
      window.removeEventListener('pagehide', pauseIfHidden);
    };
  }, [allowBackgroundPlay, isPlaying, mediaRef, setPlaying]);
}
