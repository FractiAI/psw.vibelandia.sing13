import type { TrackDef } from '@/lib/catalogTypes';
import { isIOSDevice } from '@/lib/devicePlayback';

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|mkv)(\?|#|$)/i;
const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|flac|opus|weba)(\?|#|$)/i;

function isAudioUrl(url: string): boolean {
  if (!url) return false;
  if (AUDIO_EXT.test(url)) return true;
  return /audio\//i.test(url);
}

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (VIDEO_EXT.test(url)) return true;
  return /video\//i.test(url);
}

/** True when this catalog row should use the video player (not audio-only). */
export function isVideoTrack(track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined): boolean {
  if (!track) return false;
  const src = (track.src || '').trim();
  const videoSrc = (track.videoSrc || '').trim();
  // Migrated / uploaded audio rows keep src as mp3 even if legacy videoSrc lingers in cache.
  if (isAudioUrl(src)) return false;
  if (videoSrc) return true;
  if (!src) return false;
  return isVideoUrl(src);
}

/** Canonical stream URL for the active player (audio-first when src is audio). */
export function playbackUrlForTrack(track: TrackDef): string {
  if (isVideoTrack(track)) return (track.videoSrc || track.src || '').trim();
  return (track.src || track.videoSrc || '').trim();
}

/** Inline <video> panel — off on iPhone (native layer / hang); use <audio> there instead. */
export function showInlineVideoPlayer(
  track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined,
): boolean {
  return isVideoTrack(track) && !isIOSDevice();
}
