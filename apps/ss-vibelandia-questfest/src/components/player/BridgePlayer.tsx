import { useCallback, useEffect, useRef } from 'react';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import {
  assignPlaybackSrc,
  getSimpleAudioElement,
  pauseSimpleAudio,
  playAudioNow,
  registerPlaybackEngine,
  subscribeAudioBind,
} from '@/lib/simplePlayback';
import { dispatchPlayGesture } from '@/lib/playGesture';
import { pausePlayback, startTrackPlayback } from '@/lib/trackPlayback';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { KillReason } from '@/hooks/useStreamLock';
import type { TrackDef } from '@/lib/catalogTypes';

const GATE_SEC = 29;
const FADE_START = 28.85;

function trackCoverUrl(track: TrackDef): string | undefined {
  if (!track.posterSrc) return undefined;
  const sep = track.posterSrc.includes('?') ? '&' : '?';
  return `${track.posterSrc}${sep}v=${encodeURIComponent(track.id)}`;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface BridgePlayerProps {
  onFairExchange: () => void;
  onVesselSwitch: (reason: Exclude<KillReason, null>) => void;
  killReason: KillReason;
  beginSession: () => void;
  clearKill: () => void;
}

/** Track chrome + 30s gate — one shared <audio> lives in GlobalAudio (App root). */
export function BridgePlayer({
  onFairExchange,
  onVesselSwitch,
  killReason,
  beginSession,
  clearKill,
}: BridgePlayerProps) {
  const gateArmedRef = useRef(true);
  const gainRef = useRef(1);

  const storeError = usePlaybackStore((s) => s.playbackError);
  const setPlaybackError = usePlaybackStore((s) => s.setPlaybackError);
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const gain = usePlaybackStore((s) => s.gain);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setGain = usePlaybackStore((s) => s.setGain);
  const setDisplayTime = usePlaybackStore((s) => s.setDisplayTime);
  const autoplayEnabled = usePlaybackStore((s) => s.autoplayEnabled);
  const backgroundPlayEnabled = usePlaybackStore((s) => s.backgroundPlayEnabled);
  const setAutoplayEnabled = usePlaybackStore((s) => s.setAutoplayEnabled);
  const setBackgroundPlayEnabled = usePlaybackStore((s) => s.setBackgroundPlayEnabled);

  const getTrack = useCatalogStore((s) => s.getTrack);
  const pl = useActivePlaylist();
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;
  const solenoidActive = pl?.kind === 'sovereign' && !fullPlayUnlocked;

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;
  const url = track ? playbackUrlForTrack(track) : '';

  gainRef.current = gain;

  const playUrl = useCallback(
    (trackId: string, src: string) => {
      clearKill();
      gateArmedRef.current = true;
      beginSession();
      startTrackPlayback(trackId, src, { beginSession });
    },
    [beginSession, clearKill],
  );

  const advanceNext = useCallback(() => {
    if (!pl || !currentTrackId) return false;
    const idx = pl.trackIds.indexOf(currentTrackId);
    if (idx < 0) return false;
    for (let i = idx + 1; i < pl.trackIds.length; i++) {
      const id = pl.trackIds[i];
      const tr = getTrack(id);
      const u = tr ? playbackUrlForTrack(tr) : '';
      if (!u) continue;
      playUrl(id, u);
      return true;
    }
    setPlaying(false);
    return false;
  }, [currentTrackId, getTrack, pl, playUrl, setPlaying]);

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      pauseSimpleAudio();
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

  useEffect(() => {
    const runGate = (t: number) => {
      const el = getSimpleAudioElement();
      if (!el) return;

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
        onFairExchange();
        if (autoplayEnabled && advanceNext()) return;
        setPlaying(false);
      }
    };

    registerPlaybackEngine({
      onTime: runGate,
      onEnded: () => {
        if (autoplayEnabled && advanceNext()) return;
        setPlaying(false);
      },
      onError: () => {
        setPlaybackError('Could not load this audio file.');
        setPlaying(false);
      },
    });

    return subscribeAudioBind(() => {
      const el = getSimpleAudioElement();
      if (el) registerPlaybackEngine({
        onTime: runGate,
        onEnded: () => {
          if (autoplayEnabled && advanceNext()) return;
          setPlaying(false);
        },
        onError: () => {
          setPlaybackError('Could not load this audio file.');
          setPlaying(false);
        },
      });
    });
  }, [
    advanceNext,
    autoplayEnabled,
    onFairExchange,
    setDisplayTime,
    setPlaybackError,
    setPlaying,
    solenoidActive,
  ]);

  useEffect(() => {
    const el = getSimpleAudioElement();
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener('playing', onPlay);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('playing', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [setPlaying]);

  useEffect(() => {
    if (fullPlayUnlocked && backgroundPlayEnabled) return;
    const onHide = () => {
      if (document.hidden) pausePlayback();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    };
  }, [backgroundPlayEnabled, fullPlayUnlocked]);

  const stepPlaylist = (delta: 1 | -1) => {
    if (!pl || !currentTrackId) return;
    const idx = pl.trackIds.indexOf(currentTrackId);
    if (idx < 0) return;
    const step = delta > 0 ? 1 : -1;
    for (let i = idx + step; i >= 0 && i < pl.trackIds.length; i += step) {
      const id = pl.trackIds[i];
      const tr = getTrack(id);
      const u = tr ? playbackUrlForTrack(tr) : '';
      if (!u) continue;
      playUrl(id, u);
      return;
    }
    pausePlayback();
  };

  const togglePlay = () => {
    if (!track || !url) return;
    clearKill();
    setGain(1);
    if (isPlaying) {
      pausePlayback();
      return;
    }
    dispatchPlayGesture(track.id);
    const el = getSimpleAudioElement();
    if (el) {
      assignPlaybackSrc(el, url);
      beginSession();
      setTrack(track.id);
      setPlaying(true);
      void el.play().catch(() => {
        void playAudioNow(url, 1).catch(() => {
          setPlaybackError('Tap play on the audio bar below.');
          setPlaying(false);
        });
      });
      return;
    }
    beginSession();
    startTrackPlayback(track.id, url, { beginSession });
  };

  return (
    <footer className="sp-now sp-bridge-player">
      <div className={`sp-now-bar${track?.posterSrc ? ' sp-now-bar--with-cover' : ''}`}>
        {track?.posterSrc && (
          <img className="sp-now-cover" src={trackCoverUrl(track)} alt="" width={56} height={56} />
        )}
        <div className="sp-now-track">
          {track ? (
            <>
              <p className="sp-now-title">{track.title}</p>
              <p className="sp-now-artist">{track.artist}</p>
              {solenoidActive && <span className="sp-now-badge">30s preview</span>}
              {fullPlayUnlocked && (
                <span className="sp-now-badge sp-now-badge--pass" title="Member playback">
                  {captainUnlocked && !isPassenger ? 'Capitan · full play' : 'Members pass · full play'}
                </span>
              )}
            </>
          ) : (
            <p className="sp-now-empty">Pick a track, then use the player below</p>
          )}
          <div className="sp-now-prefs" role="group" aria-label="Playback options">
            <label className="sp-now-pref">
              <input
                type="checkbox"
                checked={autoplayEnabled}
                onChange={(e) => setAutoplayEnabled(e.target.checked)}
              />
              Autoplay playlist
            </label>
            {fullPlayUnlocked && (
              <label className="sp-now-pref">
                <input
                  type="checkbox"
                  checked={backgroundPlayEnabled}
                  onChange={(e) => setBackgroundPlayEnabled(e.target.checked)}
                />
                Background
              </label>
            )}
          </div>
        </div>
        <div className="sp-now-controls">
          <button type="button" className="sp-now-btn" onClick={() => stepPlaylist(-1)} disabled={!track} aria-label="Previous">
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
          <button type="button" className="sp-now-btn" onClick={() => stepPlaylist(1)} disabled={!track} aria-label="Next">
            ⏭
          </button>
        </div>
        <div className="sp-now-time">
          {track && <span>{fmtTime(displayTime)}</span>}
          {storeError && <span className="sp-now-error">{storeError}</span>}
        </div>
      </div>
      <p className="sp-bridge-player-hint">
        Use the <strong>Safari audio bar</strong> below for scrub and volume — most reliable on iPhone.
      </p>
    </footer>
  );
}
