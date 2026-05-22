import { useCallback, useEffect, useRef } from 'react';
import { directPlayTrack, registerDirectPlayHandler } from '@/lib/directPlayback';
import { IOS_PLAYABLE_MEDIA_CLASS } from '@/lib/devicePlayback';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
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

interface SimplePlayerProps {
  onFairExchange: () => void;
  onVesselSwitch: (reason: Exclude<KillReason, null>) => void;
  killReason: KillReason;
  beginSession: () => void;
  clearKill: () => void;
}

/** Dock player: one in-component <audio> + native controls (reliable on iOS). */
export function SimplePlayer({
  onFairExchange,
  onVesselSwitch,
  killReason,
  beginSession,
  clearKill,
}: SimplePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const gateArmedRef = useRef(true);

  const storeError = usePlaybackStore((s) => s.playbackError);
  const setPlaybackError = usePlaybackStore((s) => s.setPlaybackError);
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const gain = usePlaybackStore((s) => s.gain);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setGain = usePlaybackStore((s) => s.setGain);
  const setTrack = usePlaybackStore((s) => s.setTrack);
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

  const playOnElement = useCallback(
    (el: HTMLAudioElement, src: string, vol = 1) => {
      el.volume = Math.max(0, Math.min(1, vol));
      try {
        const next = new URL(src, window.location.href).href;
        const cur = el.src ? new URL(el.src, window.location.href).href : '';
        if (cur !== next) el.src = src;
      } catch {
        if (el.src !== src) el.src = src;
      }
      return el.play();
    },
    [],
  );

  const playUrl = useCallback(
    (trackId: string, src: string) => {
      const el = audioRef.current;
      if (!el) {
        setPlaybackError('Player not ready — refresh the page.');
        setPlaying(false);
        return;
      }

      clearKill();
      gateArmedRef.current = true;

      const playPromise = playOnElement(el, src, 1);

      setGain(1);
      setPlaybackError(null);
      setTrack(trackId);
      setPlaying(true);
      setDisplayTime(0);
      beginSession();

      void playPromise.catch(() => {
        setPlaybackError('Could not play — use the bar above or tap ▶ again.');
        setPlaying(false);
      });
    },
    [
      beginSession,
      clearKill,
      playOnElement,
      setDisplayTime,
      setGain,
      setPlaybackError,
      setPlaying,
      setTrack,
    ],
  );

  useEffect(() => {
    registerDirectPlayHandler((trackId, src) => playUrl(trackId, src));
    return () => registerDirectPlayHandler(null);
  }, [playUrl]);

  useEffect(() => {
    const el = audioRef.current;
    registerPlaybackMedia(el, null);
    return () => registerPlaybackMedia(null, null);
  }, []);

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const advanceNext = () => {
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
    };

    const onTime = () => {
      const t = el.currentTime;
      setDisplayTime(t);
      const g = usePlaybackStore.getState().gain;

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

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (autoplayEnabled && advanceNext()) return;
      setPlaying(false);
    };
    const onErr = () => {
      setPlaybackError('Could not load this audio file.');
      setPlaying(false);
    };

    el.addEventListener('timeupdate', onTime);
    el.addEventListener('playing', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onErr);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('playing', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onErr);
    };
  }, [
    autoplayEnabled,
    currentTrackId,
    getTrack,
    onFairExchange,
    pl,
    playUrl,
    setDisplayTime,
    setPlaybackError,
    setPlaying,
    solenoidActive,
  ]);

  useEffect(() => {
    if (!url || !audioRef.current) return;
    if (!isPlaying) {
      audioRef.current.pause();
      return;
    }
  }, [isPlaying, url]);

  const stepPlaylist = useCallback(
    (delta: 1 | -1) => {
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
      setPlaying(false);
      audioRef.current?.pause();
    },
    [currentTrackId, getTrack, pl, playUrl, setPlaying],
  );

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el || !track || !url) return;
    clearKill();
    setGain(1);
    if (isPlaying) {
      el.pause();
      setPlaying(false);
      return;
    }
    playUrl(track.id, url);
  };

  return (
    <footer className="sp-now sp-simple-player sp-native-player">
      <audio
        ref={audioRef}
        className={`sp-native-audio ${IOS_PLAYABLE_MEDIA_CLASS}`}
        playsInline
        preload="auto"
        controls
        aria-label={track ? `Playing ${track.title}` : 'Audio player'}
      />
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
            <p className="sp-now-empty">Pick a track, then press play on the bar above</p>
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
    </footer>
  );
}

/** List rows — single code path; play() runs inside the tap handler. */
export function startTrackPlayback(
  trackId: string,
  url: string,
  opts?: {
    onError?: (msg: string | null) => void;
  },
): void {
  if (directPlayTrack(trackId, url)) return;

  const msg = 'Player not ready — scroll to the player bar and press play there.';
  const pb = usePlaybackStore.getState();
  pb.setTrack(trackId);
  pb.setPlaybackError(msg);
  pb.setPlaying(false);
  opts?.onError?.(msg);
}
