import { useEffect, useRef } from 'react';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { IOS_PLAYABLE_MEDIA_CLASS } from '@/lib/devicePlayback';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';

const GATE_SEC = 29;
const FADE_START = 28.85;

export const SIMPLE_AUDIO_CLASS = IOS_PLAYABLE_MEDIA_CLASS;

interface UseSimpleAudioEngineOptions {
  onFairExchange: () => void;
  onError: (message: string | null) => void;
  beginSession: () => void;
}

/**
 * One <audio>, one effect: set src when URL changes; play/pause when isPlaying changes.
 * No background handoff, gesture bus, or duplicate load() paths.
 */
export function useSimpleAudioEngine({
  onFairExchange,
  onError,
  beginSession,
}: UseSimpleAudioEngineOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const gateArmedRef = useRef(true);

  const trackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const gain = usePlaybackStore((s) => s.gain);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setDisplayTime = usePlaybackStore((s) => s.setDisplayTime);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const autoplayEnabled = usePlaybackStore((s) => s.autoplayEnabled);

  const getTrack = useCatalogStore((s) => s.getTrack);
  const pl = useActivePlaylist();
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;
  const solenoidActive = pl?.kind === 'sovereign' && !fullPlayUnlocked;

  const track = trackId ? getTrack(trackId) : undefined;
  const url = track ? playbackUrlForTrack(track) : '';

  useEffect(() => {
    registerPlaybackMedia(audioRef.current, null);
    return () => registerPlaybackMedia(null, null);
  }, []);

  const onFairExchangeRef = useRef(onFairExchange);
  const beginSessionRef = useRef(beginSession);
  const autoplayRef = useRef(autoplayEnabled);
  const gainRef = useRef(gain);
  onFairExchangeRef.current = onFairExchange;
  beginSessionRef.current = beginSession;
  autoplayRef.current = autoplayEnabled;
  gainRef.current = gain;

  useEffect(() => {
    if (fullPlayUnlocked) return;
    const onHide = () => {
      if (!document.hidden) return;
      audioRef.current?.pause();
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [fullPlayUnlocked, setPlaying]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    gateArmedRef.current = true;
    onError(null);

    const advanceNext = () => {
      if (!pl || !trackId) return false;
      const idx = pl.trackIds.indexOf(trackId);
      if (idx < 0) return false;
      for (let i = idx + 1; i < pl.trackIds.length; i++) {
        const id = pl.trackIds[i];
        if (!getTrack(id) || !playbackUrlForTrack(getTrack(id)!)) continue;
        gateArmedRef.current = true;
        setDisplayTime(0);
        setTrack(id);
        setPlaying(true);
        return true;
      }
      setPlaying(false);
      return false;
    };

    const onTime = () => {
      const t = el.currentTime;
      setDisplayTime(t);
      const g = gainRef.current;

      if (!solenoidActive) {
        el.volume = g;
        return;
      }

      if (t >= FADE_START && t < GATE_SEC) {
        const span = GATE_SEC - FADE_START;
        const u = (GATE_SEC - t) / span;
        el.volume = Math.max(0, Math.min(1, u * g));
      }

      if (t >= GATE_SEC && gateArmedRef.current) {
        gateArmedRef.current = false;
        el.pause();
        el.currentTime = 0;
        setDisplayTime(0);
        el.volume = g;
        onFairExchangeRef.current();
        if (autoplayRef.current && advanceNext()) return;
        setPlaying(false);
      }
    };

    const onEnded = () => {
      if (autoplayRef.current && advanceNext()) return;
      setPlaying(false);
    };

    const onErr = () => {
      onError('Could not play this file.');
      setPlaying(false);
    };

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onErr);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onErr);
    };
  }, [
    getTrack,
    onError,
    pl,
    setDisplayTime,
    setPlaying,
    setTrack,
    solenoidActive,
    trackId,
  ]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!trackId || !url) {
      el.pause();
      loadedUrlRef.current = null;
      return;
    }

    if (loadedUrlRef.current !== url) {
      loadedUrlRef.current = url;
      el.src = url;
    }

    el.volume = gainRef.current;

    if (!isPlaying) {
      el.pause();
      return;
    }

    beginSessionRef.current();
    const start = () => {
      void el.play().catch(() => onError('Tap play on a track to start listening.'));
    };

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      start();
      return;
    }

    el.addEventListener('canplay', start, { once: true });
    return () => el.removeEventListener('canplay', start);
  }, [isPlaying, onError, trackId, url]);

  useEffect(() => {
    const el = audioRef.current;
    if (el && !solenoidActive) el.volume = gain;
  }, [gain, solenoidActive]);

  return audioRef;
}
