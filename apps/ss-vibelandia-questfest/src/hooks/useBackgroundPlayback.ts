import { useEffect, useRef, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { resolvePlaybackUrl } from '@/lib/localPlayback';
import { getPlaybackMedia, readLivePlaybackPosition } from '@/lib/playbackMediaRegistry';
import { flushPlaybackSession } from '@/hooks/usePlaybackSessionPersistence';
import { getSimpleAudioElement, urlMatchesElement } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';

interface UseBackgroundPlaybackOptions {
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  backgroundAudioRef: RefObject<HTMLAudioElement | null>;
  allowBackgroundPlay: boolean;
  isPlaying: boolean;
  track: TrackDef | undefined;
  isVideo: boolean;
  setPlaying: (playing: boolean) => void;
  onRequestResume?: (opts?: { userInitiated?: boolean }) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onTrackEnded?: () => void;
  onNextTrack?: () => void;
}

function mediaIsAudible(el: HTMLMediaElement | null): boolean {
  return !!el && !el.paused && el.readyState > HTMLMediaElement.HAVE_NOTHING;
}

function syncMediaRefs(
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>,
  backgroundAudioRef: RefObject<HTMLAudioElement | null>,
) {
  const el = getSimpleAudioElement();
  const bg = getPlaybackMedia().background;
  if (mediaRef.current !== el) mediaRef.current = el;
  if (backgroundAudioRef.current !== bg) backgroundAudioRef.current = bg;
  return { el, bg };
}

async function resolveHandoffUrl(track: TrackDef | undefined): Promise<string> {
  if (!track) return '';
  try {
    return await resolvePlaybackUrl(track);
  } catch {
    return '';
  }
}

function waitForCanPlay(el: HTMLMediaElement): Promise<void> {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error('media_error'));
    };
    const cleanup = () => {
      el.removeEventListener('canplay', onReady);
      el.removeEventListener('error', onErr);
    };
    el.addEventListener('canplay', onReady, { once: true });
    el.addEventListener('error', onErr, { once: true });
  });
}

async function ensureForegroundSrc(el: HTMLAudioElement, tr: TrackDef, bg: HTMLAudioElement | null): Promise<void> {
  const url = await resolveHandoffUrl(tr);
  if (!url) return;
  if (urlMatchesElement(el, url) && el.src) return;
  el.src = bg?.src || url;
  el.load();
  await waitForCanPlay(el).catch(() => undefined);
}

function releaseBackground(bg: HTMLAudioElement | null, setBackgroundHandoffActive: (on: boolean) => void) {
  if (!bg) {
    setBackgroundHandoffActive(false);
    return;
  }
  bg.pause();
  bg.removeAttribute('src');
  setBackgroundHandoffActive(false);
}

function syncUiFromBackgroundAudio(
  el: HTMLAudioElement | null,
  bg: HTMLAudioElement,
  setBackgroundHandoffActive: (on: boolean) => void,
  onTimeUpdate?: (t: number) => void,
): void {
  const t = bg.currentTime;
  usePlaybackStore.getState().setDisplayTime(t);
  onTimeUpdate?.(t);
  if (el && el.paused) {
    try {
      el.currentTime = t;
    } catch {
      /* ignore */
    }
  }
  setBackgroundHandoffActive(true);
}

/**
 * Free listeners: browser may pause audio when hidden — resume on return.
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
    const flushIfHidden = () => {
      if (!document.hidden) return;
      flushPlaybackSession();
    };

    document.addEventListener('visibilitychange', flushIfHidden);
    window.addEventListener('pagehide', flushPlaybackSession);
    return () => {
      document.removeEventListener('visibilitychange', flushIfHidden);
      window.removeEventListener('pagehide', flushPlaybackSession);
    };
  }, []);

  useEffect(() => {
    const stayOnBackgroundIfPlaying = (): boolean => {
      const { el, bg } = syncMediaRefs(mediaRef, backgroundAudioRef);
      if (!bg?.src || !mediaIsAudible(bg)) return false;
      syncUiFromBackgroundAudio(
        el instanceof HTMLAudioElement ? el : null,
        bg,
        setBackgroundHandoffActive,
        onTimeUpdateRef.current ?? undefined,
      );
      return true;
    };

    const restoreToForeground = async () => {
      if (handoffBusyRef.current) return;
      const { el, bg } = syncMediaRefs(mediaRef, backgroundAudioRef);
      const tr = trackRef.current;
      const st = usePlaybackStore.getState();

      if (!el) {
        if (bg && mediaIsAudible(bg)) {
          setBackgroundHandoffActive(true);
        } else {
          setBackgroundHandoffActive(false);
        }
        return;
      }

      if (!st.isPlaying) {
        releaseBackground(bg, setBackgroundHandoffActive);
        return;
      }

      if (bg?.src && mediaIsAudible(bg)) {
        syncUiFromBackgroundAudio(
          el instanceof HTMLAudioElement ? el : null,
          bg,
          setBackgroundHandoffActive,
          onTimeUpdateRef.current ?? undefined,
        );
        return;
      }

      handoffBusyRef.current = true;
      const resumeAt = readLivePlaybackPosition() || (bg?.src ? bg.currentTime : el.currentTime);

      try {
        if (tr && el instanceof HTMLAudioElement) {
          await ensureForegroundSrc(el, tr, bg);
        }

        if (resumeAt > 0.25 && Number.isFinite(resumeAt)) {
          const at = Math.min(resumeAt, Math.max(0, (el.duration || Infinity) - 0.25));
          if (at > 0.25) {
            el.currentTime = at;
            usePlaybackStore.getState().setDisplayTime(at);
            onTimeUpdateRef.current?.(at);
          }
        }

        await waitForCanPlay(el);
        await el.play();

        releaseBackground(bg, setBackgroundHandoffActive);
        flushPlaybackSession();
      } catch {
        if (bg?.src) {
          if (resumeAt > 0.25 && Number.isFinite(resumeAt)) {
            try {
              bg.currentTime = resumeAt;
            } catch {
              /* ignore */
            }
          }
          setBackgroundHandoffActive(true);
          if (bg.paused) {
            void bg.play().catch(() => {});
          }
        }
      } finally {
        handoffBusyRef.current = false;
      }
    };

    const handoffToBackground = () => {
      if (!allowBackgroundPlay || handoffBusyRef.current || isVideo) return;
      const { el, bg } = syncMediaRefs(mediaRef, backgroundAudioRef);
      const tr = trackRef.current;
      if (!el || !bg || !tr || !isPlayingRef.current) return;
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
          });
      });
    };

    const resumeIfStalled = () => {
      if (!isPlayingRef.current || document.hidden) return;
      syncMediaRefs(mediaRef, backgroundAudioRef);
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const st = usePlaybackStore.getState();

      if (stayOnBackgroundIfPlaying()) return;

      if (st.backgroundHandoffActive && bg?.src) {
        void restoreToForeground();
        return;
      }
      if (mediaIsAudible(el)) return;

      const resumeAt = readLivePlaybackPosition();
      if (el?.src) {
        if (resumeAt > 0.25 && Number.isFinite(resumeAt)) {
          try {
            el.currentTime = Math.min(resumeAt, Math.max(0, (el.duration || Infinity) - 0.25));
            usePlaybackStore.getState().setDisplayTime(el.currentTime);
            onTimeUpdateRef.current?.(el.currentTime);
          } catch {
            /* ignore */
          }
        }
        void el.play().catch(() => {});
        return;
      }
      onRequestResumeRef.current?.({ userInitiated: false });
    };

    const onReturnToForeground = () => {
      if (stayOnBackgroundIfPlaying()) return;
      if (usePlaybackStore.getState().backgroundHandoffActive) {
        void restoreToForeground();
      } else {
        resumeIfStalled();
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        handoffToBackground();
        return;
      }
      window.setTimeout(() => {
        if (document.hidden) return;
        onReturnToForeground();
      }, 0);
    };

    const onPageShow = (ev: PageTransitionEvent) => {
      if (!ev.persisted && document.visibilityState !== 'visible') return;
      window.setTimeout(() => {
        if (document.hidden) return;
        onReturnToForeground();
      }, 0);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', handoffToBackground);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', resumeIfStalled);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', handoffToBackground);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', resumeIfStalled);
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
    const bg = backgroundAudioRef.current ?? getPlaybackMedia().background;
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

    const { el, bg } = syncMediaRefs(mediaRef, backgroundAudioRef);
    if (!el || !bg) return;
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
    const bg = backgroundAudioRef.current ?? getPlaybackMedia().background;
    if (bg && !bg.paused) return;
    bg?.pause();
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
        onRequestResumeRef.current?.({ userInitiated: true });
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
