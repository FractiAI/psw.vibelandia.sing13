import { useEffect, useRef, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { usePlaybackStore } from '@/stores/playbackStore';

interface UseBackgroundPlaybackOptions {
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  /** Hidden audio used to keep sound when a video element is backgrounded (paid only). */
  backgroundAudioRef: RefObject<HTMLAudioElement | null>;
  /** Passenger / captain — full play, may continue in background. */
  allowBackgroundPlay: boolean;
  isPlaying: boolean;
  track: TrackDef | undefined;
  isVideo: boolean;
  setPlaying: (playing: boolean) => void;
}

function syncMediaSession(track: TrackDef | undefined, allowBackgroundPlay: boolean) {
  if (!allowBackgroundPlay || !track || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
    });
  } catch {
    /* ignore */
  }
}

function clearMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
  } catch {
    /* ignore */
  }
}

/**
 * Free plan: pause when the listener leaves the page / switches apps.
 * Paid (full play): keep audio in background; hand off video → hidden audio on mobile.
 */
export function useBackgroundPlayback({
  mediaRef,
  backgroundAudioRef,
  allowBackgroundPlay,
  isPlaying,
  track,
  isVideo,
  setPlaying,
}: UseBackgroundPlaybackOptions) {
  const videoHandoffRef = useRef(false);
  const resumeAttemptsRef = useRef(0);

  useEffect(() => {
    if (!allowBackgroundPlay || !track || !('mediaSession' in navigator)) {
      clearMediaSession();
      return;
    }

    syncMediaSession(track, true);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    try {
      navigator.mediaSession.setActionHandler('play', onPlay);
      navigator.mediaSession.setActionHandler('pause', onPause);
    } catch {
      /* ignore */
    }

    return () => clearMediaSession();
  }, [allowBackgroundPlay, setPlaying, track]);

  useEffect(() => {
    const pauseForFreeListener = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (el && !el.paused) el.pause();
      bg?.pause();
      videoHandoffRef.current = false;
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };

    const startVideoAudioHandoff = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !bg || !track || !(el instanceof HTMLVideoElement)) return;

      videoHandoffRef.current = true;
      bg.src = track.src;
      bg.currentTime = el.currentTime;
      bg.volume = el.volume;
      el.pause();
      void bg.play().catch(() => {
        videoHandoffRef.current = false;
      });
    };

    const restoreVideoFromHandoff = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !bg || !(el instanceof HTMLVideoElement)) return;

      if (videoHandoffRef.current) {
        el.currentTime = bg.currentTime;
        bg.pause();
        videoHandoffRef.current = false;
        if (usePlaybackStore.getState().isPlaying) {
          void el.play().catch(() => {});
        }
      } else if (usePlaybackStore.getState().isPlaying && el.paused) {
        void el.play().catch(() => {});
      }
    };

    const resumePrimaryMedia = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !usePlaybackStore.getState().isPlaying) return;

      if (videoHandoffRef.current && bg) {
        if (bg.paused) void bg.play().catch(() => {});
        return;
      }

      if (el.paused) {
        resumeAttemptsRef.current += 1;
        if (resumeAttemptsRef.current <= 5) {
          void el.play().catch(() => {});
        }
      }
    };

    const onVisibility = () => {
      resumeAttemptsRef.current = 0;

      if (document.hidden) {
        if (!allowBackgroundPlay) {
          pauseForFreeListener();
          return;
        }
        if (!usePlaybackStore.getState().isPlaying) return;
        syncMediaSession(track, true);
        if (isVideo) startVideoAudioHandoff();
        return;
      }

      if (!allowBackgroundPlay) return;

      if (isVideo) restoreVideoFromHandoff();
      else resumePrimaryMedia();
    };

    const onPageHide = () => {
      if (!allowBackgroundPlay) pauseForFreeListener();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [
    allowBackgroundPlay,
    backgroundAudioRef,
    isVideo,
    mediaRef,
    setPlaying,
    track,
  ]);

  useEffect(() => {
    const bg = backgroundAudioRef.current;
    if (!bg || !allowBackgroundPlay) return;

    const onBgTime = () => {
      if (videoHandoffRef.current) {
        usePlaybackStore.getState().setDisplayTime(bg.currentTime);
      }
    };

    bg.addEventListener('timeupdate', onBgTime);
    return () => bg.removeEventListener('timeupdate', onBgTime);
  }, [allowBackgroundPlay, backgroundAudioRef, track?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !allowBackgroundPlay) return;

    const onPause = () => {
      if (!document.hidden || !usePlaybackStore.getState().isPlaying) return;
      if (videoHandoffRef.current) {
        const bg = backgroundAudioRef.current;
        if (bg?.paused) {
          window.setTimeout(() => {
            if (document.hidden && usePlaybackStore.getState().isPlaying) {
              void bg.play().catch(() => {});
            }
          }, 80);
        }
        return;
      }

      window.setTimeout(() => {
        if (!document.hidden || !usePlaybackStore.getState().isPlaying) return;
        if (el.paused) void el.play().catch(() => {});
      }, 80);
    };

    el.addEventListener('pause', onPause);
    return () => el.removeEventListener('pause', onPause);
  }, [allowBackgroundPlay, backgroundAudioRef, mediaRef, track?.id]);
}
