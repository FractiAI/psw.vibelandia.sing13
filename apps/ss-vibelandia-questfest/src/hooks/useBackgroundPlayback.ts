import { useEffect, useRef, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { resolvePlaybackUrl } from '@/lib/localPlayback';
import { flushPlaybackSession } from '@/hooks/usePlaybackSessionPersistence';
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
  onTimeUpdate?: (currentTime: number) => void;
  onTrackEnded?: () => void;
  onNextTrack?: () => void;
}

function mediaIsAudible(el: HTMLMediaElement | null): boolean {
  return !!el && !el.paused && el.readyState > HTMLMediaElement.HAVE_NOTHING;
}

async function resolveHandoffUrl(track: TrackDef | undefined): Promise<string> {
  if (!track) return '';
  try {
    return await resolvePlaybackUrl(track);
  } catch {
    return '';
  }
}

/**
 * Free listeners: pause when the tab is hidden.
 * Paid (pass / captain): hand off to a hidden <audio> so playback continues in background.
 */
export function useBackgroundPlayback({
  mediaRef,
  backgroundAudioRef,
  allowBackgroundPlay,
  isPlaying,
  isVideo,
  track,
  setPlaying,
  onRequestResume,
  onTimeUpdate,
  onTrackEnded,
  onNextTrack,
}: UseBackgroundPlaybackOptions) {
  const backgroundHandoffActive = usePlaybackStore((s) => s.backgroundHandoffActive);
  const setBackgroundHandoffActive = usePlaybackStore((s) => s.setBackgroundHandoffActive);
  const isPlayingRef = useRef(isPlaying);
  const trackRef = useRef(track);
  const handoffBusyRef = useRef(false);
  const onTrackEndedRef = useRef(onTrackEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onRequestResumeRef = useRef(onRequestResume);

  isPlayingRef.current = isPlaying;
  trackRef.current = track;
  onTrackEndedRef.current = onTrackEnded;
  onTimeUpdateRef.current = onTimeUpdate;
  onRequestResumeRef.current = onRequestResume;

  useEffect(() => {
    if (allowBackgroundPlay) return;

    const pauseIfHidden = () => {
      if (!document.hidden) return;
      flushPlaybackSession();
      /* Free preview: persist position only — do not stop on tab background. */
    };

    document.addEventListener('visibilitychange', pauseIfHidden);
    window.addEventListener('pagehide', pauseIfHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseIfHidden);
      window.removeEventListener('pagehide', pauseIfHidden);
    };
  }, [allowBackgroundPlay, backgroundAudioRef, mediaRef, setBackgroundHandoffActive, setPlaying]);

  useEffect(() => {
    if (!allowBackgroundPlay) return;

    const restoreToForeground = () => {
      if (handoffBusyRef.current) return;
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const tr = trackRef.current;
      if (!el) {
        setBackgroundHandoffActive(false);
        return;
      }

      const resumeAt = bg?.src ? bg.currentTime : el.currentTime;
      if (bg?.src) {
        el.currentTime = resumeAt;
        if (el instanceof HTMLAudioElement && tr) {
          void resolveHandoffUrl(tr).then((url) => {
            if (url) el.src = bg.src || url;
          });
        }
      }

      const finishRestore = () => {
        const resumeAt = bg?.src ? bg.currentTime : el.currentTime;
        bg?.pause();
        bg?.removeAttribute('src');
        setBackgroundHandoffActive(false);
        if (resumeAt > 0.25 && Number.isFinite(resumeAt)) {
          el.currentTime = resumeAt;
          onTimeUpdateRef.current?.(resumeAt);
          usePlaybackStore.getState().setDisplayTime(resumeAt);
        } else {
          onTimeUpdateRef.current?.(el.currentTime);
        }
        flushPlaybackSession();
        if (usePlaybackStore.getState().isPlaying) {
          void el.play().catch(() => onRequestResumeRef.current?.());
        }
      };

      if (!usePlaybackStore.getState().isPlaying) {
        finishRestore();
        return;
      }

      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && el.src) {
        finishRestore();
        return;
      }

      handoffBusyRef.current = true;
      const onReady = () => {
        handoffBusyRef.current = false;
        finishRestore();
      };
      el.addEventListener('canplay', onReady, { once: true });
      if (!el.src && tr) {
        void resolveHandoffUrl(tr).then((url) => {
          if (url) {
            el.src = url;
            el.load();
          }
        });
      }
    };

    const handoffToBackground = () => {
      if (handoffBusyRef.current) return;
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const tr = trackRef.current;
      if (!el || !bg || !tr || !isPlayingRef.current) return;
      if (isVideo) return;
      if (usePlaybackStore.getState().backgroundHandoffActive && mediaIsAudible(bg)) return;

      void resolveHandoffUrl(tr).then((url) => {
        if (!url) return;
        flushPlaybackSession();
        handoffBusyRef.current = true;
        bg.src = url;
        bg.currentTime = el.currentTime;
        bg.volume = el.volume;
        void bg
          .play()
          .then(() => {
            el.pause();
            setBackgroundHandoffActive(true);
            handoffBusyRef.current = false;
          })
          .catch(() => {
            handoffBusyRef.current = false;
            onRequestResumeRef.current?.();
          });
      });
    };

    const resumeIfStalled = () => {
      if (!isPlayingRef.current || document.hidden) return;
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const st = usePlaybackStore.getState();

      if (st.backgroundHandoffActive && mediaIsAudible(bg)) return;
      if (mediaIsAudible(el)) return;

      if (bg?.src && !bg.paused) {
        restoreToForeground();
        return;
      }
      if (el?.src) {
        void el.play().catch(() => onRequestResumeRef.current?.());
        return;
      }
      onRequestResumeRef.current?.();
    };

    const onVisibility = () => {
      if (document.hidden) {
        handoffToBackground();
      } else {
        if (usePlaybackStore.getState().backgroundHandoffActive) {
          restoreToForeground();
        } else {
          resumeIfStalled();
        }
      }
    };

    const onPageShow = (ev: PageTransitionEvent) => {
      if (ev.persisted || document.visibilityState === 'visible') {
        resumeIfStalled();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', handoffToBackground);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', handoffToBackground);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [
    allowBackgroundPlay,
    isVideo,
    mediaRef,
    backgroundAudioRef,
    setBackgroundHandoffActive,
  ]);

  useEffect(() => {
    if (!allowBackgroundPlay || !backgroundHandoffActive) return;
    const bg = backgroundAudioRef.current;
    if (!bg) return;

    const onTime = () => onTimeUpdateRef.current?.(bg.currentTime);
    const onEnded = () => onTrackEndedRef.current?.();
    const onErr = () => {
      setPlaying(false);
      setBackgroundHandoffActive(false);
    };

    bg.addEventListener('timeupdate', onTime);
    bg.addEventListener('ended', onEnded);
    bg.addEventListener('error', onErr);
    return () => {
      bg.removeEventListener('timeupdate', onTime);
      bg.removeEventListener('ended', onEnded);
      bg.removeEventListener('error', onErr);
    };
  }, [allowBackgroundPlay, backgroundHandoffActive, backgroundAudioRef, setBackgroundHandoffActive, setPlaying]);

  useEffect(() => {
    if (!allowBackgroundPlay || isVideo || !isPlaying || !track) return;
    if (!document.hidden) return;

    const el = mediaRef.current;
    const bg = backgroundAudioRef.current;
    if (!el || !bg || !track) return;
    if (usePlaybackStore.getState().backgroundHandoffActive && bg.src) return;

    let cancelled = false;
    let onReady: (() => void) | null = null;

    const handoff = (url: string) => {
      if (cancelled || handoffBusyRef.current) return;
      handoffBusyRef.current = true;
      bg.src = url;
      bg.currentTime = Math.min(el.currentTime || 0, Number.isFinite(bg.duration) ? bg.duration : el.currentTime || 0);
      bg.volume = el.volume;
      void bg
        .play()
        .then(() => {
          if (cancelled) return;
          el.pause();
          setBackgroundHandoffActive(true);
          handoffBusyRef.current = false;
        })
        .catch(() => {
          handoffBusyRef.current = false;
          if (!cancelled) onRequestResumeRef.current?.();
        });
    };

    void resolveHandoffUrl(track).then((url) => {
      if (cancelled || !url) return;
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && el.src) {
        handoff(url);
        return;
      }

      onReady = () => handoff(url);
      el.addEventListener('canplay', onReady, { once: true });
    });

    return () => {
      cancelled = true;
      if (onReady) el.removeEventListener('canplay', onReady);
    };
  }, [
    allowBackgroundPlay,
    backgroundAudioRef,
    isPlaying,
    isVideo,
    mediaRef,
    setBackgroundHandoffActive,
    track?.id,
    track?.src,
    track?.downloadedLocally,
  ]);

  useEffect(() => {
    if (isPlaying || !backgroundHandoffActive) return;
    const bg = backgroundAudioRef.current;
    if (bg && !bg.paused) return;
    backgroundAudioRef.current?.pause();
    setBackgroundHandoffActive(false);
  }, [isPlaying, backgroundHandoffActive, backgroundAudioRef, setBackgroundHandoffActive]);

  useEffect(() => {
    if (!allowBackgroundPlay || !track || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      const artwork = track.posterSrc
        ? [{ src: track.posterSrc, sizes: '512x512', type: 'image/jpeg' }]
        : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'SS Vibelandia QUESTFEST',
        artwork,
      });
      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        onRequestResumeRef.current?.();
      });
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => onNextTrack?.());
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      /* unsupported */
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      } catch {
        /* ignore */
      }
    };
  }, [allowBackgroundPlay, isPlaying, onNextTrack, setPlaying, track?.artist, track?.id, track?.posterSrc, track?.title]);
}
