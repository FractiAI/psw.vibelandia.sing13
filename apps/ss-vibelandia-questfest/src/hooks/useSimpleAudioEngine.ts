import { useEffect, useRef, useState } from 'react';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import {
  getSimpleAudioElement,
  pauseSimpleAudio,
  playAudioNow,
  registerPlaybackEngine,
  subscribeAudioBind,
  syncLoadedUrl,
} from '@/lib/simplePlayback';

const GATE_SEC = 29;
const FADE_START = 28.85;

interface UseSimpleAudioEngineOptions {
  onFairExchange: () => void;
  onError: (message: string | null) => void;
  beginSession: () => void;
}

/**
 * One <audio> element: tap handlers call playAudioNow() in the same gesture;
 * effects handle pause, missing-url errors, and solenoid/autoplay.
 */
export function useSimpleAudioEngine({
  onFairExchange,
  onError,
  beginSession,
}: UseSimpleAudioEngineOptions) {
  const gateArmedRef = useRef(true);
  const [, setBindTick] = useState(0);

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

  const onFairExchangeRef = useRef(onFairExchange);
  const beginSessionRef = useRef(beginSession);
  const autoplayRef = useRef(autoplayEnabled);
  const gainRef = useRef(gain);
  const onErrorRef = useRef(onError);
  const plRef = useRef(pl);
  const trackIdRef = useRef(trackId);
  const getTrackRef = useRef(getTrack);
  onFairExchangeRef.current = onFairExchange;
  beginSessionRef.current = beginSession;
  autoplayRef.current = autoplayEnabled;
  gainRef.current = gain;
  onErrorRef.current = onError;
  plRef.current = pl;
  trackIdRef.current = trackId;
  getTrackRef.current = getTrack;

  useEffect(() => subscribeAudioBind(() => setBindTick((n) => n + 1)), []);

  useEffect(() => {
    if (fullPlayUnlocked) return;
    const onHide = () => {
      if (!document.hidden) return;
      pauseSimpleAudio();
      if (usePlaybackStore.getState().isPlaying) setPlaying(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [fullPlayUnlocked, setPlaying]);

  useEffect(() => {
    const advanceNext = () => {
      const plNow = plRef.current;
      const tid = trackIdRef.current;
      if (!plNow || !tid) return false;
      const idx = plNow.trackIds.indexOf(tid);
      if (idx < 0) return false;
      for (let i = idx + 1; i < plNow.trackIds.length; i++) {
        const id = plNow.trackIds[i];
        const next = getTrackRef.current(id);
        const nextUrl = next ? playbackUrlForTrack(next) : '';
        if (!nextUrl) continue;
        gateArmedRef.current = true;
        setDisplayTime(0);
        setTrack(id);
        setPlaying(true);
        beginSessionRef.current();
        syncLoadedUrl(nextUrl);
        void playAudioNow(nextUrl, gainRef.current).catch(() =>
          onErrorRef.current('Could not play next track.'),
        );
        return true;
      }
      setPlaying(false);
      return false;
    };

    registerPlaybackEngine({
      onTime: (t) => {
        setDisplayTime(t);
        const audio = getSimpleAudioElement();
        if (!audio) return;
        const g = gainRef.current;

        if (!solenoidActive) {
          audio.volume = g;
          return;
        }

        if (t >= FADE_START && t < GATE_SEC) {
          const span = GATE_SEC - FADE_START;
          const u = (GATE_SEC - t) / span;
          audio.volume = Math.max(0, Math.min(1, u * g));
        }

        if (t >= GATE_SEC && gateArmedRef.current) {
          gateArmedRef.current = false;
          audio.pause();
          audio.currentTime = 0;
          setDisplayTime(0);
          audio.volume = g;
          onFairExchangeRef.current();
          if (autoplayRef.current && advanceNext()) return;
          setPlaying(false);
        }
      },
      onEnded: () => {
        if (autoplayRef.current && advanceNext()) return;
        setPlaying(false);
      },
      onError: () => {
        onErrorRef.current('Could not play this file.');
        setPlaying(false);
      },
    });

    gateArmedRef.current = true;
  }, [setDisplayTime, setPlaying, setTrack, solenoidActive]);

  useEffect(() => {
    if (!trackId) {
      pauseSimpleAudio();
      syncLoadedUrl(null);
      onError(null);
      return;
    }

    if (!url) {
      onError('No MP3 on this track — tap Refresh or upload audio.');
      setPlaying(false);
      pauseSimpleAudio();
      syncLoadedUrl(null);
      return;
    }

    if (!isPlaying) {
      pauseSimpleAudio();
      return;
    }

    onError(null);
    syncLoadedUrl(url);
  }, [isPlaying, onError, setPlaying, trackId, url]);

  /** Poll clock while playing — backup if timeupdate misses (detached node / iOS). */
  useEffect(() => {
    if (!isPlaying || !trackId) return;
    const tick = () => {
      const audio = getSimpleAudioElement();
      if (audio && !audio.paused) {
        setDisplayTime(audio.currentTime);
      }
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [isPlaying, trackId, setDisplayTime]);

  useEffect(() => {
    const audio = getSimpleAudioElement();
    if (audio && !solenoidActive) audio.volume = gain;
  }, [gain, solenoidActive]);
}

/** Start playback inside a user gesture (list row, play button). */
export function startTrackPlayback(
  trackId: string,
  url: string,
  opts?: {
    beginSession?: () => void;
    onError?: (msg: string | null) => void;
    setGain?: (g: number) => void;
  },
): void {
  const pb = usePlaybackStore.getState();
  pb.setGain(1);
  opts?.setGain?.(1);
  pb.setPlaybackError(null);
  pb.setTrack(trackId);
  pb.setPlaying(true);
  pb.setDisplayTime(0);
  opts?.beginSession?.();
  syncLoadedUrl(url);

  const el = getSimpleAudioElement();
  if (!el) {
    const msg = 'Player not ready — refresh and try again.';
    pb.setPlaybackError(msg);
    opts?.onError?.(msg);
    pb.setPlaying(false);
    return;
  }

  void playAudioNow(url, 1).catch((err) => {
    const msg =
      err instanceof Error && err.message === 'no_audio_or_url'
        ? 'Player not ready — refresh and try again.'
        : 'Tap play again — could not start audio.';
    pb.setPlaybackError(msg);
    opts?.onError?.(msg);
    pb.setPlaying(false);
  });
}
