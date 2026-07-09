import { resolvePlaybackUrl } from '@/lib/localPlayback';
import { getPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { readPlaybackSession } from '@/lib/playbackSession';
import {
  getSimpleAudioElement,
  pauseSimpleAudio,
  playAudioNow,
  urlMatchesElement,
} from '@/lib/simplePlayback';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import type { TrackDef } from '@/lib/catalogTypes';

/** True while pause came from app controls (not browser tab/screen sleep). */
let appInitiatedPause = false;

export function markAppPause(): void {
  appInitiatedPause = true;
}

export function consumeAppPause(): boolean {
  if (!appInitiatedPause) return false;
  appInitiatedPause = false;
  return true;
}

function resolveResumeAt(trackId: string): number {
  const pb = usePlaybackStore.getState();
  if (pb.currentTrackId === trackId && pb.displayTime > 0.25) return pb.displayTime;
  const snap = readPlaybackSession();
  if (snap?.trackId === trackId && snap.displayTime > 0.5) return snap.displayTime;
  return 0;
}

/** Play from a list-row tap — src + play() in the same user gesture (iOS Safari). */
export function startTrackPlayback(
  trackId: string,
  url: string,
  opts?: {
    onError?: (msg: string | null) => void;
    beginSession?: () => void;
    /** When true, keep queue position for the same track (player bar resume). */
    resume?: boolean;
  },
): void {
  if (!trackId || !url) {
    const msg = 'No audio file on this track — tap Refresh.';
    usePlaybackStore.getState().setPlaybackError(msg);
    opts?.onError?.(msg);
    return;
  }

  const pb = usePlaybackStore.getState();
  const switching = pb.currentTrackId !== trackId;
  const resume = opts?.resume === true && !switching;
  const startAt = resume ? resolveResumeAt(trackId) : 0;

  pb.setPlaybackError(null);
  pb.setTrack(trackId);
  if (switching || !resume) pb.setDisplayTime(0);
  else if (startAt > 0.25) pb.setDisplayTime(startAt);
  pb.setGain(1);
  opts?.beginSession?.();

  const fail = (msg: string) => {
    pb.setPlaybackError(msg);
    pb.setPlaying(false);
    opts?.onError?.(msg);
  };

  const el = getSimpleAudioElement();
  if (el) {
    pb.setPlaying(true);
    void playAudioNow(url, 1, startAt)
      .then(() => pb.setPlaying(true))
      .catch(() => fail('Could not start — tap ▶ on the player bar or Safari controls below.'));
    return;
  }

  pb.setPlaying(true);
  void playAudioNow(url, 1, startAt).catch(() =>
    fail('Player not ready — refresh, then tap play on the audio bar below.'),
  );
}

/** Resume the track already shown in the player bar (same gesture as ▶). */
export function resumeOrPlayTrack(
  track: TrackDef,
  opts?: { onError?: (msg: string | null) => void; beginSession?: () => void },
): void {
  const pb = usePlaybackStore.getState();
  pb.setPlaybackError(null);
  opts?.beginSession?.();

  const startAt = resolveResumeAt(track.id);
  const el = getSimpleAudioElement();

  void resolvePlaybackUrl(track)
    .then((url) => {
      if (!url) {
        const msg = 'No audio file on this track — tap Refresh.';
        pb.setPlaybackError(msg);
        opts?.onError?.(msg);
        return;
      }

      if (el && urlMatchesElement(el, url) && el.src && !el.error) {
        pb.setTrack(track.id);
        pb.setPlaying(true);
        if (startAt > 0.25) {
          const at = Math.min(startAt, (el.duration || Infinity) - 0.25);
          if (at > 0.25) {
            el.currentTime = at;
            pb.setDisplayTime(at);
          }
        }
        el.volume = pb.gain;
        void el.play().catch(() => startTrackPlayback(track.id, url, { ...opts, resume: true }));
        return;
      }

      startTrackPlayback(track.id, url, { ...opts, resume: true });
    })
    .catch(() => {
      const msg = 'No audio file on this track — tap Refresh.';
      pb.setPlaybackError(msg);
      opts?.onError?.(msg);
    });
}

export function playTrackDef(
  track: TrackDef,
  opts?: { onError?: (msg: string | null) => void; beginSession?: () => void },
): void {
  void resolvePlaybackUrl(track)
    .then((url) => startTrackPlayback(track.id, url, opts))
    .catch(() => {
      const msg = 'No audio file on this track — tap Refresh.';
      usePlaybackStore.getState().setPlaybackError(msg);
      opts?.onError?.(msg);
    });
}

/** Resolve local-first URL then play — for list rows and bridge controls. */
export function playTrackById(
  trackId: string,
  getTrack: (id: string) => TrackDef | undefined,
  opts?: { onError?: (msg: string | null) => void; beginSession?: () => void },
): void {
  const tr = getTrack(trackId);
  if (!tr) {
    const msg = 'Track not found — tap Refresh.';
    usePlaybackStore.getState().setPlaybackError(msg);
    opts?.onError?.(msg);
    return;
  }
  playTrackDef(tr, opts);
}

export function pausePlayback(): void {
  markAppPause();
  pauseSimpleAudio();
  usePlaybackStore.getState().setPlaying(false);
}

/** Resume when store still says playing but the element was paused (tab switch, screen lock). */
export function resumePlaybackIfNeeded(): void {
  const { isPlaying, currentTrackId, backgroundHandoffActive } = usePlaybackStore.getState();
  if (!isPlaying || !currentTrackId) return;

  const bg = getPlaybackMedia().background;
  if (backgroundHandoffActive && bg?.src && bg.paused) {
    void bg.play().catch(() => {});
    return;
  }

  if (document.hidden) return;

  const el = getSimpleAudioElement();
  if (el?.paused && el.src) {
    void el.play().catch(() => {});
    return;
  }

  if (el?.paused && !el.src) {
    const tr = useCatalogStore.getState().getTrack(currentTrackId);
    if (tr) resumeOrPlayTrack(tr);
  }
}
