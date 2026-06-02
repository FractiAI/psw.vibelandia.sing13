import type { CatalogPrefs } from '@/lib/catalogPrefs';
import type { PlaylistDef } from '@/lib/catalogTypes';
import {
  MY_LIKES_PLAYLIST_DEFAULT_DESCRIPTION,
  MY_LIKES_PLAYLIST_DEFAULT_NAME,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';

const LIKES_KEY = 'hjghf-track-likes-v1';

export function loadLikedTrackIds(): string[] {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return [];
    return ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function saveLikedTrackIds(ids: string[]): void {
  localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
}

/** Migrate likes from prefs or legacy My Likes playlist track order. */
export function resolveLikedTrackIds(
  prefs: CatalogPrefs | null,
  playlists: PlaylistDef[],
): string[] {
  if (prefs?.likedTrackIds?.length) {
    return [...prefs.likedTrackIds];
  }
  const legacy = playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID);
  if (legacy?.trackIds.length) return [...legacy.trackIds];
  return loadLikedTrackIds();
}

export function buildMyLikesPlaylist(trackIds: string[]): PlaylistDef {
  return {
    id: MY_LIKES_PLAYLIST_ID,
    name: MY_LIKES_PLAYLIST_DEFAULT_NAME,
    kind: 'sovereign',
    description: MY_LIKES_PLAYLIST_DEFAULT_DESCRIPTION,
    trackIds: [...trackIds],
  };
}

/** Ensure My Likes exists; sync its track list from liked ids (valid tracks only). */
export function applyLikesToPlaylists(
  playlists: PlaylistDef[],
  likedTrackIds: string[],
  validTrackIds: Set<string>,
): PlaylistDef[] {
  const trackIds = likedTrackIds.filter((id) => validTrackIds.has(id));
  const myLikes = buildMyLikesPlaylist(trackIds);
  const without = playlists.filter((p) => p.id !== MY_LIKES_PLAYLIST_ID);
  const masterIdx = without.findIndex((p) => p.id === 'pl-main');
  if (masterIdx === -1) return [myLikes, ...without];
  return [...without.slice(0, masterIdx + 1), myLikes, ...without.slice(masterIdx + 1)];
}

export function toggleLikedId(likedTrackIds: string[], trackId: string): string[] {
  const i = likedTrackIds.indexOf(trackId);
  if (i >= 0) {
    const next = [...likedTrackIds];
    next.splice(i, 1);
    return next;
  }
  return [trackId, ...likedTrackIds.filter((id) => id !== trackId)];
}
