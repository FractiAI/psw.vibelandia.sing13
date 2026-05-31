import { loadBlob, saveBlob } from '@/lib/catalogPersistence';
import { markTrackDownloaded as markTrackDownloadedPref } from '@/lib/catalogPrefs';
import type { TrackDef } from '@/lib/catalogTypes';
import { dispatchTrackDownloaded } from '@/lib/downloadEvents';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';

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
  markTrackDownloadedPref(trackId);
  dispatchTrackDownloaded(trackId);
}

function revokeUrl(trackId: string) {
  const prev = blobUrlCache.get(trackId);
  if (prev) {
    URL.revokeObjectURL(prev);
    blobUrlCache.delete(trackId);
  }
}

function syncDownloadFlags(trackId: string, track: TrackDef): void {
  if (track.downloadedLocally && track.localMediaKey) return;
  markTrackDownloadedPref(trackId);
  dispatchTrackDownloaded(trackId);
}

/** Prefer on-device copy (IndexedDB) whenever present; fall back to cloud stream. */
export async function resolvePlaybackUrl(track: TrackDef): Promise<string> {
  const stream = playbackUrlForTrack(track);
  const key = track.localMediaKey ?? localMediaKeyFor(track.id);
  const blob = await loadBlob(key);

  if (blob) {
    syncDownloadFlags(track.id, track);
    revokeUrl(track.id);
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(track.id, url);
    return url;
  }

  if (!stream) throw new Error('no_playback_source');
  return stream;
}

export function releasePlaybackUrl(trackId: string | null) {
  if (trackId) revokeUrl(trackId);
}
