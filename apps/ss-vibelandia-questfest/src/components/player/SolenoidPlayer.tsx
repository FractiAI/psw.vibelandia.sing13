import { useEffect, useRef, useCallback, useState } from 'react';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { KillReason } from '@/hooks/useStreamLock';

const GATE_SEC = 29;
const FADE_START = 28.85;

interface SolenoidPlayerProps {
  onFairExchange: () => void;
  onVesselSwitch: (reason: Exclude<KillReason, null>) => void;
  onExport: () => void;
  killReason: KillReason;
  beginSession: () => void;
  clearKill: () => void;
}

export function SolenoidPlayer({
  onFairExchange,
  onVesselSwitch,
  onExport,
  killReason,
  beginSession,
  clearKill,
}: SolenoidPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const gateArmedRef = useRef(true);
  const [error, setError] = useState<string | null>(null);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const gain = usePlaybackStore((s) => s.gain);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setDisplayTime = usePlaybackStore((s) => s.setDisplayTime);
  const setGain = usePlaybackStore((s) => s.setGain);

  const getTrack = usePlaylistStore((s) => s.getTrack);
  const getActivePlaylist = usePlaylistStore((s) => s.getActivePlaylist);

  const isPassenger = useSessionStore((s) => s.isPassenger);

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;
  const pl = getActivePlaylist();
  const solenoidActive = pl?.kind === 'sovereign' && !isPassenger;
  const isVideo = !!track?.videoSrc;

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !track) return;

    gateArmedRef.current = true;
    setError(null);
    if (isVideo && el instanceof HTMLVideoElement) {
      el.src = track.videoSrc!;
      el.load();
    } else {
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
    const onErr = () =>
      setError('Media blocked or source unreachable — try another network or bearing.');

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onErr);

    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onErr);
    };
  }, [gain, isVideo, onFairExchange, setDisplayTime, setPlaying, solenoidActive, track]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !track) return;
    if (isPlaying) {
      beginSession();
      el.play().catch(() => setError('Playback was blocked — tap transmit again.'));
    } else {
      el.pause();
    }
  }, [beginSession, isPlaying, track]);

  useEffect(() => {
    const el = mediaRef.current;
    if (el) el.volume = gain;
  }, [gain]);

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  if (!track) {
    return (
      <div className="voxel-panel player-empty">
        <p>Select a bearing from the Master Playlist.</p>
      </div>
    );
  }

  return (
    <div className="voxel-panel player-wrap">
      {isVideo ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          className="player-video"
          preload="metadata"
          playsInline
          poster={track.posterSrc}
        />
      ) : (
        <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} preload="metadata" />
      )}

      <div className="player-head">
        <div>
          <div className="player-label">Now transmitting {isVideo ? '· video' : '· audio'}</div>
          <h3 className="player-title">{track.title}</h3>
          <div className="player-artist">{track.artist}</div>
          <div className="player-meta">
            <span>φ {track.egsPhi}</span>
            <span>H-line {track.hydrogenLineGhz} GHz</span>
            <span className="channel-dots" aria-label={`Channel ${track.channelIndex} of 13`}>
              {Array.from({ length: 13 }, (_, i) => (
                <span
                  key={i}
                  className={`channel-dot${i + 1 === track.channelIndex ? ' channel-dot--on' : ''}`}
                />
              ))}
            </span>
          </div>
        </div>
        <div className="player-time">
          <span>{fmt(displayTime)}</span>
          {solenoidActive && <span className="solenoid-badge">SOLENOID · 30s</span>}
          {isPassenger && <span className="pass-badge">PASSENGER · FULL</span>}
        </div>
      </div>

      {track.lyrics && <p className="player-lyrics">{track.lyrics}</p>}
      {error && <p className="player-error">{error}</p>}

      <div className="player-controls">
        <button
          type="button"
          className="voxel-btn voxel-btn--cyan"
          onClick={() => {
            clearKill();
            setGain(1);
            setPlaying(!isPlaying);
          }}
        >
          {isPlaying ? 'Hold' : 'Transmit'}
        </button>
        <button type="button" className="voxel-btn" onClick={() => setPlaying(false)}>
          Stop
        </button>
        <button type="button" className="voxel-btn voxel-btn--orange" onClick={onExport}>
          Export · $1.61
        </button>
      </div>

      <p className="player-hint">
        {pl?.kind === 'sovereign' && !isPassenger
          ? 'Your free 30-second taste — when it pauses, we will warmly offer the monthly pass.'
          : isPassenger
            ? `${track.channelHint} · single active stream enforced.`
            : 'Open deck — full preview on this relay.'}
      </p>
    </div>
  );
}
