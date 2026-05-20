import { useEffect, useRef, type RefObject } from 'react';
import type { TrackDef } from '@/lib/catalogTypes';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
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
  track,
  setPlaying,
  onRequestResume,
  onTimeUpdate,
}: UseBackgroundPlaybackOptions) {
  const backgroundHandoffActive = usePlaybackStore((s) => s.backgroundHandoffActive);
  const setBackgroundHandoffActive = usePlaybackStore((s) => s.setBackgroundHandoffActive);
  const isPlayingRef = useRef(isPlaying);
  const trackRef = useRef(track);
  isPlayingRef.current = isPlaying;
  trackRef.current = track;

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
  }, [allowBackgroundPlay, mediaRef, setPlaying]);

  useEffect(() => {
    if (!allowBackgroundPlay) return;

    const restoreToForeground = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const tr = trackRef.current;
      if (!el || !bg?.src) {
        setBackgroundHandoffActive(false);
        return;
      }
      el.currentTime = bg.currentTime;
      if (el instanceof HTMLAudioElement) {
        el.src = bg.src;
      } else if (el instanceof HTMLVideoElement && tr) {
        el.src = tr.videoSrc || tr.src || bg.src;
      }
      bg.pause();
      bg.removeAttribute('src');
      if (usePlaybackStore.getState().isPlaying) {
        void el.play().catch(() => onRequestResume?.());
      }
      setBackgroundHandoffActive(false);
    };

    const handoffToBackground = () => {
      const el = mediaRef.current;
      const bg = backgroundAudioRef.current;
      const url = playbackUrlForTrack(trackRef.current);
      if (!el || !bg || !url || !isPlayingRef.current) return;
      if (usePlaybackStore.getState().backgroundHandoffActive) return;

      bg.src = url;
      bg.currentTime = el.currentTime;
      bg.volume = el.volume;
      void bg
        .play()
        .then(() => {
          el.pause();
          setBackgroundHandoffActive(true);
        })
        .catch(() => onRequestResume?.());
    };

    const onVisibility = () => {
      if (document.hidden) {
        handoffToBackground();
      } else if (usePlaybackStore.getState().backgroundHandoffActive) {
        restoreToForeground();
      }
    };

    const onPageHide = () => handoffToBackground();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [
    allowBackgroundPlay,
    mediaRef,
    backgroundAudioRef,
    setBackgroundHandoffActive,
    onRequestResume,
  ]);

  useEffect(() => {
    if (!allowBackgroundPlay || !backgroundHandoffActive) return;
    const bg = backgroundAudioRef.current;
    if (!bg) return;

    const onTime = () => onTimeUpdate?.(bg.currentTime);
    const onEnded = () => setPlaying(false);
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
  }, [
    allowBackgroundPlay,
    backgroundHandoffActive,
    backgroundAudioRef,
    onTimeUpdate,
    setPlaying,
    setBackgroundHandoffActive,
  ]);

  useEffect(() => {
    if (!isPlaying && backgroundHandoffActive) {
      backgroundAudioRef.current?.pause();
      setBackgroundHandoffActive(false);
    }
  }, [isPlaying, backgroundHandoffActive, backgroundAudioRef, setBackgroundHandoffActive]);

  useEffect(() => {
    if (!allowBackgroundPlay || !track || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'SS Vibelandia QUESTFEST',
      });
      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        onRequestResume?.();
      });
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
    } catch {
      /* unsupported */
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      } catch {
        /* ignore */
      }
    };
  }, [allowBackgroundPlay, track?.id, track?.title, track?.artist, setPlaying, onRequestResume]);
}
