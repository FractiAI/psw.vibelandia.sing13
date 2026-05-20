import type { TrackDef } from '@/lib/catalogTypes';

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|mkv)(\?|#|$)/i;

/** True when this catalog row should use the video player (not audio-only). */
export function isVideoTrack(track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined): boolean {
  if (!track) return false;
  if (track.videoSrc) return true;
  const src = track.src || '';
  if (!src) return false;
  if (VIDEO_EXT.test(src)) return true;
  if (/video\//i.test(src)) return true;
  return false;
}

export function playbackUrlForTrack(track: TrackDef): string {
  return track.videoSrc || track.src || '';
}
