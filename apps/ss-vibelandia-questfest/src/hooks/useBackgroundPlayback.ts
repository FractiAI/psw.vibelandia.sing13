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
  /** Resume primary or handoff audio (lock-screen play, etc.). */
  onRequestResume?: () => void;
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
  onRequestResume,
}: UseBackgroundPlaybackOptions) {
  const backgroundHandoffRef = useRef(false);
  const resumeAttemptsRef = useRef(0);
  const setBackgroundHandoffActive = usePlaybackStore((s) => s.setBackgroundHandoffActive);

  const setHandoff = (active: boolean) => {
    backgroundHandoffRef.current = active;
    setBackgroundHandoffActive(active);
  };

  useEffect(() => {
    if (!allowBackgroundPlay || !track || !('mediaSession' in navigator)) {
      clearMediaSession();
      return;
    }

    syncMediaSession(track, true);

    const onPlay = () => {
      setPlaying(true);
      onRequestResume?.();
    };
    /** Do not set isPlaying false on lock-screen/tab hide — OS pauses elements; we hand off instead. */
    const onPause = () => {
      if (document.visibilityState === 'visible') {
        setPlaying(false);
      }
    };

    try {
      navigator.mediaSession.setActionHandler('play', onPlay);
      navigator.mediaSession.setActionHandler('pause', onPause);
    } catch {
      /* ignore */
    }

    return () => clearMediaSession();
  }, [allowBackgroundPlay, onRequestResume, setPlaying, track]);

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
          if (!cancelled && usePlaybackStore.getState().isPlaying) {
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
      setHandoff(false);
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };

    const startBackgroundHandoff = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      if (!el || !bg || !track || !usePlaybackStore.getState().isPlaying) return;

      const src = track.src;
      if (!src) return;

      setHandoff(true);
      bg.src = src;
      bg.currentTime = el.currentTime;
      bg.volume = el.volume;
      el.pause();
      void bg.play().catch(() => {
        setHandoff(false);
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
        setHandoff(false);
        if (usePlaybackStore.getState().isPlaying) {
          void el.play().catch(() => {});
        }
      } else if (usePlaybackStore.getState().isPlaying && el.paused) {
        void el.play().catch(() => {});
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

    const onPageHide = () => {
      if (!allowBackgroundPlay) {
        pauseForFreeListener();
        return;
      }
      if (!usePlaybackStore.getState().isPlaying) return;
      startBackgroundHandoff();
    };

    const onFreeze = () => {
      if (!allowBackgroundPlay) pauseForFreeListener();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('freeze', onFreeze);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('freeze', onFreeze);
    };
  }, [
    allowBackgroundPlay,
    backgroundAudioRef,
    isVideo,
    mediaRef,
    setBackgroundHandoffActive,
    setPlaying,
    track,
  ]);

  /** If play starts while already hidden (e.g. resume), hand off immediately. */
  useEffect(() => {
    if (!allowBackgroundPlay || !isPlaying || !document.hidden || !track) return;
    const el = mediaRef.current;
    const bg = backgroundAudioRef.current;
    if (!el || !bg || backgroundHandoffRef.current) return;
    const src = track.src;
    if (!src) return;
    setHandoff(true);
    bg.src = src;
    bg.currentTime = el.currentTime;
    bg.volume = el.volume;
    el.pause();
    void bg.play().catch(() => setHandoff(false));
  }, [allowBackgroundPlay, backgroundAudioRef, isPlaying, mediaRef, setBackgroundHandoffActive, track]);

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

    const onBgPause = () => {
      if (
        !backgroundHandoffRef.current ||
        !document.hidden ||
        !usePlaybackStore.getState().isPlaying
      ) {
        return;
      }
      window.setTimeout(() => {
        if (
          document.hidden &&
          backgroundHandoffRef.current &&
          usePlaybackStore.getState().isPlaying &&
          bg.paused
        ) {
          void bg.play().catch(() => {});
        }
      }, 100);
    };

    bg.addEventListener('timeupdate', onBgTime);
    bg.addEventListener('ended', onBgEnded);
    bg.addEventListener('pause', onBgPause);
    return () => {
      bg.removeEventListener('timeupdate', onBgTime);
      bg.removeEventListener('ended', onBgEnded);
      bg.removeEventListener('pause', onBgPause);
    };
  }, [allowBackgroundPlay, backgroundAudioRef, setPlaying, track?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !allowBackgroundPlay) return;

    const onPause = () => {
      if (!document.hidden || !usePlaybackStore.getState().isPlaying) return;
      if (backgroundHandoffRef.current) return;

      window.setTimeout(() => {
        if (!document.hidden || !usePlaybackStore.getState().isPlaying) return;
        if (backgroundHandoffRef.current) return;
        if (el.paused) void el.play().catch(() => {});
      }, 100);
    };

    el.addEventListener('pause', onPause);
    return () => el.removeEventListener('pause', onPause);
  }, [allowBackgroundPlay, mediaRef, track?.id]);
}
