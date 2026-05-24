import { playbackUrlForTrack } from '@/lib/isVideoTrack';
import {
  pauseSimpleAudio,
  playAudioNow,
  syncLoadedUrl,
} from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';
import type { TrackDef } from '@/lib/catalogTypes';

/** Play from a list-row tap — must stay synchronous into playAudioNow (iOS Safari). */
export function startTrackPlayback(
  trackId: string,
  url: string,
  opts?: { onError?: (msg: string | null) => void },
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
  pb.setPlaying(true);
  syncLoadedUrl(url);

  void playAudioNow(url, 1).catch(() => {
    const msg = 'Could not start — use the player bar below, then tap play.';
    pb.setPlaybackError(msg);
    pb.setPlaying(false);
    opts?.onError?.(msg);
  });
}

export function playTrackDef(track: TrackDef, opts?: { onError?: (msg: string | null) => void }): void {
  const url = playbackUrlForTrack(track);
  if (!url) {
    const msg = 'No audio file on this track — tap Refresh.';
    usePlaybackStore.getState().setPlaybackError(msg);
    opts?.onError?.(msg);
    return;
  }
  startTrackPlayback(track.id, url, opts);
}

export function pausePlayback(): void {
  pauseSimpleAudio();
  usePlaybackStore.getState().setPlaying(false);
}
