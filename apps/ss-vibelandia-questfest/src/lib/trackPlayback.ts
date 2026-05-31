import { resolvePlaybackUrl } from '@/lib/localPlayback';
import { getSimpleAudioElement, pauseSimpleAudio, playAudioNow } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';
import type { TrackDef } from '@/lib/catalogTypes';

/** Play from a list-row tap — src + play() in the same user gesture (iOS Safari). */
export function startTrackPlayback(
  trackId: string,
  url: string,
  opts?: { onError?: (msg: string | null) => void; beginSession?: () => void },
): void {
  if (!trackId || !url) {
    const msg = 'No audio file on this track — tap Refresh.';
    usePlaybackStore.getState().setPlaybackError(msg);
    opts?.onError?.(msg);
    return;
  }

  const pb = usePlaybackStore.getState();
  pb.setPlaybackError(null);
  pb.setTrack(trackId);
  pb.setDisplayTime(0);
  pb.setGain(1);
  opts?.beginSession?.();

  const el = getSimpleAudioElement();
  if (el) {
    pb.setPlaying(true);
    void playAudioNow(url, 1)
      .then(() => pb.setPlaying(true))
      .catch(() => {
        const msg = 'Could not start — tap ▶ on the player bar or Safari controls below.';
        pb.setPlaybackError(msg);
        pb.setPlaying(false);
        opts?.onError?.(msg);
      });
    return;
  }

  pb.setPlaying(true);
  void playAudioNow(url, 1).catch(() => {
    const msg = 'Player not ready — refresh, then tap play on the audio bar below.';
    pb.setPlaybackError(msg);
    pb.setPlaying(false);
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
  pauseSimpleAudio();
  usePlaybackStore.getState().setPlaying(false);
}
