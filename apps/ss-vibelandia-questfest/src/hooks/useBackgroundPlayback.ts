import { useEffect, useRef, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { usePlaybackStore } from '@/stores/playbackStore';

interface UseBackgroundPlaybackOptions {
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  /** Hidden audio used to keep sound when the tab is backgrounded (paid only). */
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
    navigator.mediaSession.playbackState = usePlaybackStore.getState().isPlaying ? 'playing' : 'paused';
  } catch {
    /* ignore */
  }
}

function clearMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
    navigator.mediaSession.setActionHandler('nexttrack', null);
  } catch {
    /* ignore */
  }
}

/**
 * Free plan: pause when the listener leaves the page / locks the screen.
 * Paid (full play): keep audio in background via hidden audio + Media Session + optional Wake Lock.
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
  const backgroundHandoffRef = useRef(false);
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
    if (!('mediaSession' in navigator) || !allowBackgroundPlay) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      /* ignore */
    }
  }, [allowBackgroundPlay, isPlaying]);

  useEffect(() => {
    if (!allowBackgroundPlay || !isPlaying) return;
    const wakeLock = navigator.wakeLock;
    if (!wakeLock) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await wakeLock.request('screen');
        sentinel?.addEventListener('release', () => {
          if (!cancelled && usePlaybackStore.getState().isPlaying && document.visibilityState === 'visible') {
            void acquire();
          }
        });
      } catch {
        /* denied or unsupported */
      }
    };

    void acquire();

    const onVisible = () => {
      if (!cancelled && usePlaybackStore.getState().isPlaying && !sentinel) void acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [allowBackgroundPlay, isPlaying]);

  useEffect(() => {
    const pauseForFreeListener = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (el && !el.paused) el.pause();
      bg?.pause();
      backgroundHandoffRef.current = false;
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };

    const startBackgroundHandoff = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !bg || !track) return;

      const src = isVideo && el instanceof HTMLVideoElement ? track.src : track.src;
      if (!src) return;

      backgroundHandoffRef.current = true;
      bg.src = src;
      bg.currentTime = el.currentTime;
      bg.volume = el.volume;
      el.pause();
      void bg.play().catch(() => {
        backgroundHandoffRef.current = false;
      });
    };

    const restoreFromHandoff = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !bg) return;

      if (backgroundHandoffRef.current) {
        el.currentTime = bg.currentTime;
        bg.pause();
        bg.removeAttribute('src');
        backgroundHandoffRef.current = false;
        if (usePlaybackStore.getState().isPlaying) {
          void el.play().catch(() => {});
        }
      } else if (usePlaybackStore.getState().isPlaying && el.paused) {
        void el.play().catch(() => {});
      }
    };

    const resumePrimaryOrBackground = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !usePlaybackStore.getState().isPlaying) return;

      if (backgroundHandoffRef.current && bg) {
        if (bg.paused) void bg.play().catch(() => {});
        return;
      }

      if (el.paused) {
        resumeAttemptsRef.current += 1;
        if (resumeAttemptsRef.current <= 8) {
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
        startBackgroundHandoff();
        return;
      }

      if (!allowBackgroundPlay) return;
      restoreFromHandoff();
    };

    const onPageHide = (ev: PageTransitionEvent) => {
      if (!allowBackgroundPlay) {
        pauseForFreeListener();
        return;
      }
      if (ev.persisted || !usePlaybackStore.getState().isPlaying) return;
      startBackgroundHandoff();
    };

    const onFreeze = () => {
      if (!allowBackgroundPlay) pauseForFreeListener();
    };

    const onBlur = () => {
      if (!allowBackgroundPlay) pauseForFreeListener();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('freeze', onFreeze);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('freeze', onFreeze);
      window.removeEventListener('blur', onBlur);
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
      if (backgroundHandoffRef.current) {
        usePlaybackStore.getState().setDisplayTime(bg.currentTime);
      }
    };

    const onBgEnded = () => {
      if (backgroundHandoffRef.current) setPlaying(false);
    };

    bg.addEventListener('timeupdate', onBgTime);
    bg.addEventListener('ended', onBgEnded);
    return () => {
      bg.removeEventListener('timeupdate', onBgTime);
      bg.removeEventListener('ended', onBgEnded);
    };
  }, [allowBackgroundPlay, backgroundAudioRef, setPlaying, track?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !allowBackgroundPlay) return;

    const onPause = () => {
      if (!document.hidden || !usePlaybackStore.getState().isPlaying) return;
      if (backgroundHandoffRef.current) {
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
