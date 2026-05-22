import { useCallback, useEffect } from 'react';
import { useSimpleAudioEngine, startTrackPlayback } from '@/hooks/useSimpleAudioEngine';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { useActivePlaylist } from '@/stores/catalogSelectors';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { KillReason } from '@/hooks/useStreamLock';
import type { TrackDef } from '@/lib/catalogTypes';

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

/** Single-path MP3 player — one audio element, no video / handoff / gesture races. */
export function SimplePlayer({
  onFairExchange,
  onVesselSwitch,
  killReason,
  beginSession,
  clearKill,
}: SimplePlayerProps) {
  const storeError = usePlaybackStore((s) => s.playbackError);
  const setPlaybackError = usePlaybackStore((s) => s.setPlaybackError);

  const setError = useCallback(
    (msg: string | null) => setPlaybackError(msg),
    [setPlaybackError],
  );

  useSimpleAudioEngine({
    onFairExchange,
    onError: setError,
    beginSession,
  });

  const error = storeError;

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);
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

  useEffect(() => {
    if (killReason === 'vessel_switch' || killReason === 'tab_preempt') {
      onVesselSwitch(killReason);
    }
  }, [killReason, onVesselSwitch]);

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
        startTrackPlayback(id, u, { beginSession, onError: setError, setGain });
        return;
      }
      setPlaying(false);
      pauseSimpleAudio();
    },
    [beginSession, currentTrackId, getTrack, pl, setPlaying],
  );

  const togglePlay = () => {
    clearKill();
    setGain(1);
    if (isPlaying) {
      pauseSimpleAudio();
      setPlaying(false);
      return;
    }
    if (!track) return;
    const u = playbackUrlForTrack(track);
    if (!u) {
      setError('No MP3 on this track — tap Refresh or upload audio.');
      return;
    }
    startTrackPlayback(track.id, u, { beginSession, onError: setError, setGain });
  };

  return (
    <footer className="sp-now sp-simple-player">
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
          {error && <span className="sp-now-error">{error}</span>}
        </div>
      </div>
    </footer>
  );
}
