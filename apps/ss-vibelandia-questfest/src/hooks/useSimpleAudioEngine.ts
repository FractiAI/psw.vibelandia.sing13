import { useEffect, useRef } from 'react';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import {
  getLoadedUrl,
  getSimpleAudioElement,
  pauseSimpleAudio,
  playAudioNow,
  syncLoadedUrl,
  urlMatchesElement,
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
  onFairExchangeRef.current = onFairExchange;
  beginSessionRef.current = beginSession;
  autoplayRef.current = autoplayEnabled;
  gainRef.current = gain;

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
    const audio = getSimpleAudioElement();
    if (!audio) return;

    gateArmedRef.current = true;

    const advanceNext = () => {
      if (!pl || !trackId) return false;
      const idx = pl.trackIds.indexOf(trackId);
      if (idx < 0) return false;
      for (let i = idx + 1; i < pl.trackIds.length; i++) {
        const id = pl.trackIds[i];
        const next = getTrack(id);
        const nextUrl = next ? playbackUrlForTrack(next) : '';
        if (!nextUrl) continue;
        gateArmedRef.current = true;
        setDisplayTime(0);
        setTrack(id);
        setPlaying(true);
        beginSessionRef.current();
        syncLoadedUrl(nextUrl);
        void playAudioNow(nextUrl, gainRef.current).catch(() =>
          onError('Could not play next track.'),
        );
        return true;
      }
      setPlaying(false);
      return false;
    };

    const onTime = () => {
      const t = audio.currentTime;
      setDisplayTime(t);
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
    };

    const onEnded = () => {
      if (autoplayRef.current && advanceNext()) return;
      setPlaying(false);
    };

    const onErr = () => {
      onError('Could not play this file.');
      setPlaying(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onErr);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onErr);
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

    const audio = getSimpleAudioElement();
    if (!audio) return;

    // Never assign src here — that races gesture play() and silences playback.
    const loaded = getLoadedUrl();
    if (loaded && urlMatchesElement(audio, loaded) && audio.paused) {
      void audio.play().catch(() => {
        onError('Tap play again — could not start audio.');
        setPlaying(false);
      });
    }
  }, [isPlaying, onError, setPlaying, trackId, url]);

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
