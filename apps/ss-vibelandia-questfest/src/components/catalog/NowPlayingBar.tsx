import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useBackgroundPlayback } from '@/hooks/useBackgroundPlayback';
import { flushPlaybackSession } from '@/hooks/usePlaybackSessionPersistence';
import { isVideoTrack, playbackUrlForTrack } from '@/lib/isVideoTrack';
import { getPlaybackMedia, registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { readPlaybackSession } from '@/lib/playbackSession';
import { releasePlaybackUrl, resolvePlaybackUrl } from '@/lib/localPlayback';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useCatalogStore } from '@/stores/catalogStore';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useSessionStore } from '@/stores/sessionStore';
import type { KillReason } from '@/hooks/useStreamLock';
import type { TrackDef } from '@/lib/catalogTypes';

const GATE_SEC = 29;

function trackCoverUrl(track: TrackDef): string | undefined {
  if (!track.posterSrc) return undefined;
  const sep = track.posterSrc.includes('?') ? '&' : '?';
  return `${track.posterSrc}${sep}v=${encodeURIComponent(track.id)}`;
}
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
}: NowPlayingBarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const wiredTrackRef = useRef<string | null>(null);
  const gateArmedRef = useRef(true);
  const [error, setError] = useState<string | null>(null);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const gain = usePlaybackStore((s) => s.gain);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setDisplayTime = usePlaybackStore((s) => s.setDisplayTime);
  const setGain = usePlaybackStore((s) => s.setGain);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setBackgroundHandoffActive = usePlaybackStore((s) => s.setBackgroundHandoffActive);
  const autoplayEnabled = usePlaybackStore((s) => s.autoplayEnabled);
  const backgroundPlayEnabled = usePlaybackStore((s) => s.backgroundPlayEnabled);
  const setAutoplayEnabled = usePlaybackStore((s) => s.setAutoplayEnabled);
  const setBackgroundPlayEnabled = usePlaybackStore((s) => s.setBackgroundPlayEnabled);

  const getTrack = useCatalogStore((s) => s.getTrack);
  const pl = useActivePlaylist();

  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlayUnlocked = isPassenger || captainUnlocked;
  const allowBackgroundPlay = fullPlayUnlocked && backgroundPlayEnabled;

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;
  const solenoidActive = pl?.kind === 'sovereign' && !fullPlayUnlocked;
  const showVideo = isVideoTrack(track);

  const primaryMediaRef = showVideo ? videoRef : audioRef;

  const syncBackgroundRef = useCallback(() => {
    backgroundAudioRef.current =
      getPlaybackMedia().background ??
      (document.querySelector('audio[data-qv-playback-keepalive]') as HTMLAudioElement | null);
  }, []);

  const getPrimaryMedia = useCallback((): HTMLVideoElement | HTMLAudioElement | null => {
    return primaryMediaRef.current;
  }, [primaryMediaRef]);

  useEffect(() => {
    syncBackgroundRef();
    registerPlaybackMedia(primaryMediaRef.current, backgroundAudioRef.current);
    return () => registerPlaybackMedia(null, getPlaybackMedia().background);
  }, [primaryMediaRef, syncBackgroundRef, showVideo, track?.id]);

  const advanceInPlaylist = useCallback(
    (delta: 1 | -1) => {
      if (!pl || !currentTrackId) return false;
      const idx = pl.trackIds.indexOf(currentTrackId);
      if (idx < 0) return false;
      const step = delta > 0 ? 1 : -1;
      for (let i = idx + step; i >= 0 && i < pl.trackIds.length; i += step) {
        const id = pl.trackIds[i];
        if (!getTrack(id)) continue;
        setBackgroundHandoffActive(false);
        gateArmedRef.current = true;
        setDisplayTime(0);
        setTrack(id);
        setPlaying(true);
        return true;
      }
      setPlaying(false);
      return false;
    },
    [currentTrackId, getTrack, pl, setBackgroundHandoffActive, setDisplayTime, setPlaying, setTrack],
  );

  const playNext = useCallback(() => {
    advanceInPlaylist(1);
  }, [advanceInPlaylist]);

  const handleTrackEnded = useCallback(() => {
    if (autoplayEnabled) advanceInPlaylist(1);
    else setPlaying(false);
  }, [advanceInPlaylist, autoplayEnabled, setPlaying]);

  const autoplayRef = useRef(autoplayEnabled);
  const gainRef = useRef(gain);
  const advanceRef = useRef(advanceInPlaylist);
  const endedRef = useRef(handleTrackEnded);
  const fairExchangeRef = useRef(onFairExchange);
  autoplayRef.current = autoplayEnabled;
  gainRef.current = gain;
  advanceRef.current = advanceInPlaylist;
  endedRef.current = handleTrackEnded;
  fairExchangeRef.current = onFairExchange;

  const resumePlayback = useCallback(() => {
    syncBackgroundRef();
    const el = getPrimaryMedia();
    const bg = backgroundAudioRef.current;
    if (!track || !fullPlayUnlocked) return;
    if (document.hidden && allowBackgroundPlay && bg?.src) {
      void bg.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
    } else if (el) {
      void el.play().catch(() => setError('Tap play again — browser blocked autoplay.'));
    }
  }, [allowBackgroundPlay, fullPlayUnlocked, getPrimaryMedia, syncBackgroundRef, track]);

  syncBackgroundRef();

  useBackgroundPlayback({
    mediaRef: primaryMediaRef as RefObject<HTMLVideoElement | HTMLAudioElement | null>,
    backgroundAudioRef,
    allowBackgroundPlay,
    isPlaying,
    track,
    isVideo: showVideo,
    setPlaying,
    onRequestResume: resumePlayback,
    onTimeUpdate: setDisplayTime,
    onTrackEnded: handleTrackEnded,
    onNextTrack: playNext,
  });

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

  useEffect(() => {
    if (!track || !currentTrackId) return;
    const el = primaryMediaRef.current;
    if (!el) return;
    syncBackgroundRef();
    const bg = backgroundAudioRef.current;
    registerPlaybackMedia(el, bg);

    let cancelled = false;
    const trackId = track.id;
    gateArmedRef.current = true;
    setError(null);

    const snap = readPlaybackSession();
    const resumeAt =
      snap?.trackId === trackId && snap.displayTime > 0.5 ? snap.displayTime : null;

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
        fairExchangeRef.current();
        if (autoplayRef.current && advanceRef.current(1)) return;
        setPlaying(false);
      }
    };

    const onEnded = () => endedRef.current();
    const onErr = () => setError('Could not play this file.');

    const detachListeners = () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onErr);
    };

    const tryPlay = () => {
      if (cancelled || !usePlaybackStore.getState().isPlaying) return;
      const handoffActive = usePlaybackStore.getState().backgroundHandoffActive;
      if (handoffActive && bg?.src && !bg.paused) {
        const t = bg.currentTime;
        el.currentTime = t;
        setDisplayTime(t);
        bg.pause();
        bg.removeAttribute('src');
        setBackgroundHandoffActive(false);
      } else if (resumeAt != null && resumeAt < (el.duration || Infinity) - 0.25) {
        el.currentTime = resumeAt;
        setDisplayTime(resumeAt);
      }
      beginSession();
      el.volume = gainRef.current;
      void el.play().catch(() => setError('Tap play on a track to start listening.'));
    };

    const attachListeners = () => {
      el.addEventListener('timeupdate', onTime);
      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onErr);
    };

    const sameTrack =
      wiredTrackRef.current === trackId &&
      !!el.src &&
      !el.error;

    if (sameTrack) {
      attachListeners();
      if (usePlaybackStore.getState().isPlaying) tryPlay();
      return () => {
        cancelled = true;
        detachListeners();
      };
    }

    const handoffActive = usePlaybackStore.getState().backgroundHandoffActive;
    if (!handoffActive) {
      bg?.pause();
      bg?.removeAttribute('src');
    }

    const applySrc = (url: string) => {
      if (cancelled || !url) return;
      wiredTrackRef.current = trackId;
      el.src = url;
      el.load();
      el.volume = gainRef.current;
      attachListeners();
      el.addEventListener('canplay', tryPlay, { once: true });
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) tryPlay();
    };

    const streamUrl = playbackUrlForTrack(track);
    const useStreamFirst = !!streamUrl && !track.downloadedLocally;

    if (useStreamFirst) {
      applySrc(streamUrl);
    } else {
      void (async () => {
        try {
          const url = await resolvePlaybackUrl(track);
          if (cancelled) return;
          applySrc(url);
        } catch {
          if (!cancelled) setError('Could not load this track.');
        }
      })();
    }

    return () => {
      cancelled = true;
      detachListeners();
      const stillThisTrack = usePlaybackStore.getState().currentTrackId === trackId;
      const handoff = usePlaybackStore.getState().backgroundHandoffActive;
      if (!stillThisTrack) {
        wiredTrackRef.current = null;
        if (!handoff) {
          el.pause();
          el.removeAttribute('src');
        }
        releasePlaybackUrl(trackId);
      }
    };
  }, [
    beginSession,
    currentTrackId,
    primaryMediaRef,
    setBackgroundHandoffActive,
    setDisplayTime,
    setPlaying,
    showVideo,
    solenoidActive,
    syncBackgroundRef,
    track?.downloadedLocally,
    track?.id,
    track?.src,
    track?.videoSrc,
  ]);

  useEffect(() => {
    const el = primaryMediaRef.current;
    if (!el || !track || solenoidActive) return;
    el.volume = gain;
  }, [gain, primaryMediaRef, solenoidActive, track?.id]);

  useEffect(() => {
    const el = primaryMediaRef.current;
    syncBackgroundRef();
    const bg = backgroundAudioRef.current;
    if (!el || !track) return;
    const handoff = usePlaybackStore.getState().backgroundHandoffActive;

    if (!isPlaying) {
      el.pause();
      if (!handoff) bg?.pause();
      return;
    }

    if (document.hidden && allowBackgroundPlay) {
      if (handoff && bg?.src) return;
      return;
    }

    if (handoff) return;

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && el.src) {
      beginSession();
      el.volume = gainRef.current;
      const snap = readPlaybackSession();
      if (snap?.trackId === track.id && snap.displayTime > 0.5) {
        const resumeAt = Math.min(snap.displayTime, (el.duration || Infinity) - 0.25);
        if (resumeAt > 0.25) {
          el.currentTime = resumeAt;
          setDisplayTime(resumeAt);
        }
      }
      void el.play().catch(() => setError('Tap play on a track to start listening.'));
    }
  }, [allowBackgroundPlay, beginSession, isPlaying, primaryMediaRef, setDisplayTime, syncBackgroundRef, track?.id]);

  const wasHiddenRef = useRef(false);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        flushPlaybackSession();
        return;
      }
      if (!wasHiddenRef.current || !isPlaying || !track) return;
      wasHiddenRef.current = false;
      syncBackgroundRef();
      const el = primaryMediaRef.current;
      const bg = backgroundAudioRef.current;
      if (usePlaybackStore.getState().backgroundHandoffActive && bg?.src) return;
      if (!el?.src) return;
      if (el && !el.paused && el.readyState > HTMLMediaElement.HAVE_NOTHING) return;
      const snap = readPlaybackSession();
      if (snap?.trackId === track.id && snap.displayTime > 0.5) {
        el.currentTime = Math.min(snap.displayTime, (el.duration || Infinity) - 0.25);
        setDisplayTime(el.currentTime);
      }
      void el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isPlaying, primaryMediaRef, setDisplayTime, syncBackgroundRef, track?.id]);

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const playPrev = () => {
    advanceInPlaylist(-1);
  };

  const togglePlay = () => {
    clearKill();
    setGain(1);
    setPlaying(!isPlaying);
  };

  return (
    <footer className="sp-now">
      {track && showVideo && (
        <div className="sp-now-visual">
          <video
            key={track.id}
            ref={videoRef}
            className="sp-now-video"
            preload="auto"
            playsInline
            controls
            poster={trackCoverUrl(track)}
            aria-label={track.title}
          />
        </div>
      )}
      {track && !showVideo && track.posterSrc && (
        <div className="sp-now-art" aria-hidden>
          <img className="sp-now-art-img" src={trackCoverUrl(track)} alt="" />
        </div>
      )}
      {track && !showVideo && (
        <audio key={track.id} ref={audioRef} className="sr-only" preload="auto" />
      )}
      <div className={`sp-now-bar${track?.posterSrc ? ' sp-now-bar--with-cover' : ''}`}>
        {track?.posterSrc && !showVideo && (
          <img
            className="sp-now-cover"
            src={trackCoverUrl(track)}
            alt=""
            width={56}
            height={56}
          />
        )}
        <div className="sp-now-track">
          {track ? (
            <>
              <p className="sp-now-title">{track.title}</p>
              <p className="sp-now-artist">{track.artist}</p>
              {showVideo && <span className="sp-now-badge">Video</span>}
              {solenoidActive && <span className="sp-now-badge">30s preview</span>}
              {fullPlayUnlocked && (
                <span className="sp-now-badge sp-now-badge--pass" title="Member playback">
                  {captainUnlocked && !isPassenger ? 'Capitan · full play' : 'Members pass · full play'}
                </span>
              )}
            </>
          ) : (
            <p className="sp-now-empty">Pick a track to play</p>
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
