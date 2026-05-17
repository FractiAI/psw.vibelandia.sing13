import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useBackgroundPlayback } from '@/hooks/useBackgroundPlayback';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { KillReason } from '@/hooks/useStreamLock';

const GATE_SEC = 29;
const FADE_START = 28.85;

interface NowPlayingBarProps {
  onFairExchange: () => void;
  onVesselSwitch: (reason: Exclude<KillReason, null>) => void;
  killReason: KillReason;
  beginSession: () => void;
  clearKill: () => void;
  onDownload?: (trackId: string) => void;
  expanded?: boolean;
}

export function NowPlayingBar({
  onFairExchange,
  onVesselSwitch,
  killReason,
  beginSession,
  clearKill,
  onDownload,
  expanded = false,
}: NowPlayingBarProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const gateArmedRef = useRef(true);
  const [error, setError] = useState<string | null>(null);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const gain = usePlaybackStore((s) => s.gain);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setDisplayTime = usePlaybackStore((s) => s.setDisplayTime);
  const setGain = usePlaybackStore((s) => s.setGain);

  const getTrack = useCatalogStore((s) => s.getTrack);
  const getActivePlaylist = useCatalogStore((s) => s.getActivePlaylist);

  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;
  const pl = getActivePlaylist();
  const solenoidActive = pl?.kind === 'sovereign' && !fullPlayUnlocked;
  const isVideo = !!track?.videoSrc;
  const backgroundHandoffActive = usePlaybackStore((s) => s.backgroundHandoffActive);

  const resumePlayback = useCallback(() => {
    const el = mediaRef.current;
    const bg = backgroundAudioRef.current;
    if (!track || !fullPlayUnlocked) return;
    if (document.hidden && bg?.src) {
      void bg.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
    } else if (el) {
      void el.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
    }
  }, [fullPlayUnlocked, track]);

  useBackgroundPlayback({
    mediaRef,
    backgroundAudioRef,
    allowBackgroundPlay: fullPlayUnlocked,
    isPlaying,
    track,
    isVideo,
    setPlaying,
    onRequestResume: resumePlayback,
  });

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

  useEffect(() => {
    const el = mediaRef.current;
    const bg = backgroundAudioRef.current;
    const activeEl = el ?? bg;
    if (!activeEl || !track) return;

    gateArmedRef.current = true;
    setError(null);
    if (!el) return;

    if (isVideo && el instanceof HTMLVideoElement) {
      el.src = track.videoSrc!;
      el.load();
      if (bg) {
        bg.pause();
        bg.removeAttribute('src');
      }
    } else if (el instanceof HTMLAudioElement) {
      el.src = track.src;
      el.load();
    }

    el.volume = gain;

    const onTime = () => {
      const t = el.currentTime;
      setDisplayTime(t);

      if (!solenoidActive) {
        el.volume = gain;
        return;
      }

      if (t >= FADE_START && t < GATE_SEC) {
        const span = GATE_SEC - FADE_START;
        const u = (GATE_SEC - t) / span;
        el.volume = Math.max(0, Math.min(1, u * gain));
      }

      if (t >= GATE_SEC && gateArmedRef.current) {
        gateArmedRef.current = false;
        el.pause();
        el.currentTime = 0;
        setPlaying(false);
        setDisplayTime(0);
        el.volume = gain;
        onFairExchange();
      }
    };

    const onEnded = () => setPlaying(false);
    const onErr = () => setError('Could not play this file.');

    const onBgEnded = () => setPlaying(false);

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onErr);
    bg?.addEventListener('ended', onBgEnded);

    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onErr);
      bg?.removeEventListener('ended', onBgEnded);
    };
  }, [gain, isVideo, onFairExchange, setDisplayTime, setPlaying, solenoidActive, track]);

  useEffect(() => {
    const el = mediaRef.current;
    const bg = backgroundAudioRef.current;
    if (!el || !track) return;
    if (isPlaying) {
      beginSession();
      if (document.hidden && fullPlayUnlocked) {
        if (bg?.src) {
          void bg.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
        } else {
          void el.play().catch(() => {});
        }
      } else {
        void el.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
      }
    } else {
      el.pause();
      if (!backgroundHandoffActive || !document.hidden) {
        bg?.pause();
      }
    }
  }, [backgroundHandoffActive, beginSession, fullPlayUnlocked, isPlaying, isVideo, track]);

  useEffect(() => {
    const el = mediaRef.current;
    if (el) el.volume = gain;
  }, [gain]);

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const playNext = () => {
    if (!pl || !currentTrackId) return;
    const idx = pl.trackIds.indexOf(currentTrackId);
    const next = pl.trackIds[idx + 1];
    if (next) {
      usePlaybackStore.getState().setTrack(next);
      setPlaying(true);
    }
  };

  const playPrev = () => {
    if (!pl || !currentTrackId) return;
    const idx = pl.trackIds.indexOf(currentTrackId);
    const prev = pl.trackIds[Math.max(0, idx - 1)];
    if (prev) {
      usePlaybackStore.getState().setTrack(prev);
      setPlaying(true);
    }
  };

  const togglePlay = () => {
    clearKill();
    setGain(1);
    setPlaying(!isPlaying);
  };

  return (
    <footer className="sp-now">
      {track && isVideo && (
        <div className="sp-now-visual">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            className="sp-now-video"
            preload="metadata"
            playsInline
            poster={track.posterSrc}
            aria-label={track.title}
          />
        </div>
      )}
      {track && !isVideo && (
        <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} className="sr-only" preload="metadata" />
      )}
      {fullPlayUnlocked && (
        <audio
          ref={backgroundAudioRef as RefObject<HTMLAudioElement>}
          className="sr-only"
          preload="auto"
          aria-hidden
          playsInline
        />
      )}

      <div className="sp-now-bar">
        <div className="sp-now-track">
          {track ? (
            <>
              <p className="sp-now-title">{track.title}</p>
              <p className="sp-now-artist">{track.artist}</p>
              {solenoidActive && <span className="sp-now-badge">30s preview</span>}
              {fullPlayUnlocked && (
                <span className="sp-now-badge sp-now-badge--pass" title="Keeps playing in background">
                  {captainUnlocked && !isPassenger ? 'Captain · background OK' : 'Background play'}
                </span>
              )}
            </>
          ) : (
            <p className="sp-now-empty">Pick a track to play</p>
          )}
        </div>

        <div className="sp-now-controls">
          <button type="button" className="sp-now-btn" onClick={playPrev} disabled={!track} aria-label="Previous">
            ⏮
          </button>
          <button
            type="button"
            className="sp-now-btn sp-now-btn--play"
            onClick={togglePlay}
            disabled={!track}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button type="button" className="sp-now-btn" onClick={playNext} disabled={!track} aria-label="Next">
            ⏭
          </button>
        </div>

        <div className="sp-now-time">
          {track && onDownload && (
            <button
              type="button"
              className="sp-now-dl"
              onClick={() => onDownload(track.id)}
              aria-label="Download track"
            >
              ↓
            </button>
          )}
          {track && <span>{fmt(displayTime)}</span>}
          {error && <span className="sp-now-error">{error}</span>}
        </div>
      </div>
    </footer>
  );
}
