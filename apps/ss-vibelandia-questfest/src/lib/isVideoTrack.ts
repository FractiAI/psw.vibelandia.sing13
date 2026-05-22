import type { TrackDef } from '@/lib/catalogTypes';

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

/** Catalog metadata only — playback is audio-only (never true for player routing). */
export function isVideoTrack(_track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined): boolean {
  return false;
}

/** True when the row still has a legacy video file (UI labels only). */
export function trackHasVideoAsset(track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined): boolean {
  if (!track) return false;
  const src = (track.src || '').trim();
  const videoSrc = (track.videoSrc || '').trim();
  if (isAudioUrl(src)) return false;
  if (videoSrc) return true;
  if (!src) return false;
  return isVideoUrl(src);
}

/** Stream URL for playback — MP3/audio src only; never videoSrc. */
export function playbackUrlForTrack(track: TrackDef): string {
  const src = (track.src || '').trim();
  if (src) return src;
  const videoSrc = (track.videoSrc || '').trim();
  if (!videoSrc || !track.id) return '';
  try {
    const origin = new URL(videoSrc).origin;
    return `${origin}/catalog/${track.id}.mp3`;
  } catch {
    return '';
  }
}

/** Inline video panel disabled — audio-only deck. */
export function showInlineVideoPlayer(
  _track: Pick<TrackDef, 'src' | 'videoSrc'> | undefined,
): boolean {
  return false;
}
