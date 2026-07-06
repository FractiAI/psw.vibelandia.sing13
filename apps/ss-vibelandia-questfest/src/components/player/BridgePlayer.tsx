import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
  playTrackById,
  resumeOrPlayTrack,
  startTrackPlayback,
} from '@/lib/trackPlayback';
import { useActivePlaylist, useResolvedTrackIds, useResolvedTrackIdsKey } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { LikeButton } from '@/components/catalog/LikeButton';
import { AddToPlaylistIcon } from '@/components/catalog/AddToPlaylistIcon';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import {
  hasFreeFullPlayRemaining,
  markFreeFullPlayConsumed,
  shouldPreviewGate,
} from '@/lib/freeFullPlay';
import {
  filterPlayableTrackIds,
  nextSequentialTrackId,
  nextShuffledTrackId,
  playlistOrderFingerprint,
} from '@/lib/playlistShuffle';
import { PLAIN } from '@/lib/plainSpeak';
import {
  clearSharedTrackAutoplaySeed,
  sharedTrackAutoplayFromMaster,
} from '@/lib/sharedTrackPlayback';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
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
  const resolvedTrackIds = useResolvedTrackIds(pl?.id);
  const resolvedTrackIdsKey = useResolvedTrackIdsKey(pl?.id);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;
  const solenoidActive = shouldPreviewGate(currentTrackId, fullPlayUnlocked, pl?.kind);
  const freeFullRemaining =
    Boolean(currentTrackId) && !fullPlayUnlocked && hasFreeFullPlayRemaining(currentTrackId);

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;

  useEffect(() => {
    if (!pl) {
      clearShuffleQueue();
      return;
    }
    if (!shuffleEnabled) {
      clearShuffleQueue();
      return;
    }
    const playable = filterPlayableTrackIds(resolvedTrackIds, getTrack);
    const fp = playlistOrderFingerprint(pl.id, resolvedTrackIds);
    syncShuffleQueue(fp, playable);
  }, [pl?.id, resolvedTrackIdsKey, shuffleEnabled, getTrack, syncShuffleQueue, clearShuffleQueue]);

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
    const tid = usePlaybackStore.getState().currentTrackId;
    const fromShared = sharedTrackAutoplayFromMaster(tid);
    let trackIds = resolvedTrackIds;

    if (fromShared) {
      const cat = useCatalogStore.getState();
      trackIds = resolvePlaylistTrackIds(MASTER_PLAYLIST_ID, cat.tracks, cat.playlists);
      cat.setActivePlaylist(MASTER_PLAYLIST_ID);
      clearSharedTrackAutoplaySeed();
    } else if (!pl) {
      return false;
    }

    const useShuffle =
      !fromShared && shuffleEnabled && shuffleQueue && shuffleQueue.length > 1;
    let nextId: string | null = null;
    if (useShuffle) {
      nextId = nextShuffledTrackId(shuffleQueue!, tid, 1, getTrack);
    } else {
      if (!tid) return false;
      nextId = nextSequentialTrackId(trackIds, tid, 1, getTrack);
    }
    if (!nextId || nextId === tid) {
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
        playUrl(nextId!, u);
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
    resolvedTrackIds,
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
        if (advanceNext()) return;
        setPlaying(false);
      }
    };

    const handleEnded = () => {
      const tid = usePlaybackStore.getState().currentTrackId;
      const member =
        useSessionStore.getState().isPassenger || useSessionStore.getState().captainUnlocked;
      if (tid && !member && hasFreeFullPlayRemaining(tid)) {
        markFreeFullPlayConsumed(tid);
      }
      if (advanceNext()) return;
      setPlaying(false);
    };

    registerPlaybackEngine({
      onTime: runGate,
      onEnded: handleEnded,
      onError: () => {
        setPlaybackError('Could not load this audio file.');
        setPlaying(false);
      },
    });

    return subscribeAudioBind(() => {
      const el = getSimpleAudioElement();
      if (el)
        registerPlaybackEngine({
          onTime: runGate,
          onEnded: handleEnded,
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
      nextId = nextSequentialTrackId(resolvedTrackIds, currentTrackId, delta, getTrack);
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
    resumeOrPlayTrack(track, { beginSession, onError: setPlaybackError });
  };

  const canStartPlaylist = useMemo(() => {
    if (track) return true;
    const firstId =
      shuffleEnabled && shuffleQueue?.length
        ? nextShuffledTrackId(shuffleQueue, null, 1, getTrack)
        : nextSequentialTrackId(resolvedTrackIds, null, 1, getTrack);
    return Boolean(firstId);
  }, [getTrack, resolvedTrackIds, shuffleEnabled, shuffleQueue, track]);

  const playOrToggle = () => {
    if (track) {
      togglePlay();
      return;
    }
    const firstId =
      shuffleEnabled && shuffleQueue?.length
        ? nextShuffledTrackId(shuffleQueue, null, 1, getTrack)
        : nextSequentialTrackId(resolvedTrackIds, null, 1, getTrack);
    if (!firstId) return;
    playTrackById(firstId, getTrack);
  };

  const handleShare = async () => {
    if (!track) return;
    setShareNote(null);
    const result = await shareTrack(track);
    if (result === 'copied') setShareNote(PLAIN.shareCopied);
    else if (result === 'failed') setShareNote(PLAIN.shareFailed);
    if (result === 'copied' || result === 'failed') {
      window.setTimeout(() => setShareNote(null), 4000);
    }
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
              {freeFullRemaining && (
                <span className="sp-now-badge sp-now-badge--free">{PLAIN.freeFullPlay}</span>
              )}
              {solenoidActive && <span className="sp-now-badge">{PLAIN.freePreview}</span>}
              {fullPlayUnlocked && (
                <span className="sp-now-badge sp-now-badge--pass" title="Member playback">
                  {captainUnlocked && !isPassenger ? 'Capitan · full play' : 'Members pass · full play'}
                </span>
              )}
            </>
          ) : (
            <p className="sp-now-empty">Tap ▶ {PLAIN.playAll} or pick a track</p>
          )}
          {shareNote ? <p className="sp-now-share-note">{shareNote}</p> : null}
          <div className="sp-now-prefs" role="group" aria-label="Playback options">
            <label className="sp-now-pref" title="Autoplay playlist">
              <input
                type="checkbox"
                checked={autoplayEnabled}
                onChange={(e) => setAutoplayEnabled(e.target.checked)}
              />
              Autoplay
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
          {track ? (
            <>
              <LikeButton trackId={track.id} size="md" className="sp-now-like" />
              <AddToPlaylistIcon
                className="sp-now-add-pl"
                onClick={() => setPlaylistModalOpen(true)}
              />
              <button
                type="button"
                className="sp-now-btn sp-now-btn--share"
                onClick={() => void handleShare()}
                aria-label={PLAIN.shareTrack}
                title={PLAIN.shareTrack}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M13 9.5a2.2 2.2 0 0 0-1.4.5l-4.6-2.6a2.3 2.3 0 0 0 0-1l4.6-2.6a2.2 2.2 0 1 0-.4-1l-4.6 2.6a2.2 2.2 0 1 0 0 2.2l4.6 2.6a2.2 2.2 0 1 0 1.4-.7zM3.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9-4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                  />
                </svg>
              </button>
            </>
          ) : null}
          <button type="button" className="sp-now-btn" onClick={() => stepPlaylist(-1)} disabled={!track} aria-label="Previous">
            ⏮
          </button>
          <button
            type="button"
            className="sp-now-btn sp-now-btn--play"
            onClick={playOrToggle}
            disabled={!canStartPlaylist}
            aria-label={track ? (isPlaying ? 'Pause' : 'Play') : PLAIN.playAll}
          >
            {track && isPlaying ? '⏸' : '▶'}
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

      {track && playlistModalOpen ? (
        <TrackPlaylistsModal
          open
          trackId={track.id}
          trackTitle={track.title}
          onClose={() => setPlaylistModalOpen(false)}
        />
      ) : null}
    </footer>
  );
}
