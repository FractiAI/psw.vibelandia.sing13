import { useCallback, useEffect, useRef } from 'react';
import { resolvePlaybackUrl } from '@/lib/localPlayback';
import {
  getSimpleAudioElement,
  pauseSimpleAudio,
  registerPlaybackEngine,
  subscribeAudioBind,
} from '@/lib/simplePlayback';
import {
  consumeAppPause,
  markAppPause,
  pausePlayback,
  playTrackDef,
  startTrackPlayback,
} from '@/lib/trackPlayback';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import {
  filterPlayableTrackIds,
  nextSequentialTrackId,
  nextShuffledTrackId,
  playlistOrderFingerprint,
} from '@/lib/playlistShuffle';
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
  const shuffleEnabled = usePlaybackStore((s) => s.shuffleEnabled);
  const shuffleQueue = usePlaybackStore((s) => s.shuffleQueue);
  const setShuffleEnabled = usePlaybackStore((s) => s.setShuffleEnabled);
  const syncShuffleQueue = usePlaybackStore((s) => s.syncShuffleQueue);
  const clearShuffleQueue = usePlaybackStore((s) => s.clearShuffleQueue);

  const getTrack = useCatalogStore((s) => s.getTrack);
  const pl = useActivePlaylist();
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;
  const solenoidActive = pl?.kind === 'sovereign' && !fullPlayUnlocked;

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;

  const plOrderKey = pl?.trackIds.join('\t') ?? '';

  useEffect(() => {
    if (!pl) {
      clearShuffleQueue();
      return;
    }
    if (!shuffleEnabled) {
      clearShuffleQueue();
      return;
    }
    const playable = filterPlayableTrackIds(pl.trackIds, getTrack);
    const fp = playlistOrderFingerprint(pl.id, pl.trackIds);
    syncShuffleQueue(fp, playable);
  }, [pl?.id, plOrderKey, shuffleEnabled, getTrack, syncShuffleQueue, clearShuffleQueue]);

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
    if (!pl) return false;
    const useShuffle = shuffleEnabled && shuffleQueue && shuffleQueue.length > 1;
    let nextId: string | null = null;
    if (useShuffle) {
      nextId = nextShuffledTrackId(shuffleQueue!, currentTrackId, 1, getTrack);
      if (nextId === currentTrackId) nextId = null;
    } else {
      if (!currentTrackId) return false;
      nextId = nextSequentialTrackId(pl.trackIds, currentTrackId, 1, getTrack);
    }
    if (!nextId) {
      setPlaying(false);
      return false;
    }
    const tr = getTrack(nextId);
    if (!tr) {
      setPlaying(false);
      return false;
    }
    void resolvePlaybackUrl(tr)
      .then((u) => {
        if (!u) {
          setPlaying(false);
          return;
        }
        playUrl(nextId, u);
      })
      .catch(() => setPlaying(false));
    return true;
  }, [
    currentTrackId,
    getTrack,
    pl,
    playUrl,
    setPlaying,
    shuffleEnabled,
    shuffleQueue,
  ]);

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
        markAppPause();
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
    const onPause = () => {
      if (consumeAppPause()) return;
      if (!document.hidden) setPlaying(false);
      /* Tab background / screen lock: keep play intent so we resume on return. */
    };
    el.addEventListener('playing', onPlay);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('playing', onPlay);
      el.removeEventListener('pause', onPause);
    };
  }, [setPlaying]);

  const stepPlaylist = (delta: 1 | -1) => {
    if (!pl) return;
    const useShuffle = shuffleEnabled && shuffleQueue && shuffleQueue.length > 1;
    let nextId: string | null = null;
    if (useShuffle) {
      nextId = nextShuffledTrackId(shuffleQueue!, currentTrackId, delta, getTrack);
    } else {
      if (!currentTrackId) return;
      nextId = nextSequentialTrackId(pl.trackIds, currentTrackId, delta, getTrack);
    }
    if (!nextId) {
      pausePlayback();
      return;
    }
    const tr = getTrack(nextId);
    if (!tr) {
      pausePlayback();
      return;
    }
    void resolvePlaybackUrl(tr)
      .then((u) => {
        if (!u) {
          pausePlayback();
          return;
        }
        playUrl(nextId, u);
      })
      .catch(() => pausePlayback());
  };

  const togglePlay = () => {
    if (!track) return;
    clearKill();
    setGain(1);
    setPlaybackError(null);
    if (isPlaying) {
      pausePlayback();
      return;
    }
    beginSession();
    playTrackDef(track, { beginSession });
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
            <label className="sp-now-pref" title="Random order for next, previous, and autoplay within this playlist">
              <input
                type="checkbox"
                checked={shuffleEnabled}
                onChange={(e) => setShuffleEnabled(e.target.checked)}
              />
              Shuffle
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
