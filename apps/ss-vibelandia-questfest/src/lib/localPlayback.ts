import { loadBlob, saveBlob } from '@/lib/catalogPersistence';
import { markTrackDownloaded } from '@/lib/catalogPrefs';
import type { TrackDef } from '@/lib/catalogTypes';

const blobUrlCache = new Map<string, string>();

export function localMediaKeyFor(trackId: string): string {
  return `dl-${trackId}`;
}

export async function hasLocalCopy(trackId: string): Promise<boolean> {
  const blob = await loadBlob(localMediaKeyFor(trackId));
  return !!blob;
}

/** Save paid/offline copy for in-app playback (standard download-to-library flow). */
export async function saveLocalCopy(trackId: string, blob: Blob): Promise<void> {
  await saveBlob(localMediaKeyFor(trackId), blob);
  markTrackDownloaded(trackId);
}

function revokeUrl(trackId: string) {
  const prev = blobUrlCache.get(trackId);
  if (prev) {
    URL.revokeObjectURL(prev);
    blobUrlCache.delete(trackId);
  }
}

/** Prefer device copy when user downloaded; otherwise stream from server URL. */
export async function resolvePlaybackUrl(track: TrackDef): Promise<string> {
  if (track.localMediaKey || track.downloadedLocally) {
    const key = track.localMediaKey ?? localMediaKeyFor(track.id);
    const blob = await loadBlob(key);
    if (blob) {
      revokeUrl(track.id);
      const url = URL.createObjectURL(blob);
      blobUrlCache.set(track.id, url);
      return url;
    }
  }

  const stream = track.videoSrc || track.src;
  if (!stream) throw new Error('no_playback_source');
  return stream;
}

export function releasePlaybackUrl(trackId: string | null) {
  if (trackId) revokeUrl(trackId);
}
