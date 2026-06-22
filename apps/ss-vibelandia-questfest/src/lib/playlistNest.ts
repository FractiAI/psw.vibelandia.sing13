import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { isMasterPlaylist, isMyLikesPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';

export function normalizeChildPlaylistIds(ids: string[] | undefined): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id, i, arr) => typeof id === 'string' && id.length > 0 && arr.indexOf(id) === i);
}

/** Playlists not nested under any other playlist (user lists only). */
export function topLevelUserPlaylists(playlists: PlaylistDef[]): PlaylistDef[] {
  const nested = new Set<string>();
  for (const p of playlists) {
    for (const id of normalizeChildPlaylistIds(p.childPlaylistIds)) nested.add(id);
  }
  return playlists.filter(
    (p) => !isMasterPlaylist(p.id) && !isMyLikesPlaylist(p.id) && !nested.has(p.id),
  );
}

export function getParentPlaylistId(
  childId: string,
  playlists: PlaylistDef[],
): string | null {
  for (const p of playlists) {
    if (normalizeChildPlaylistIds(p.childPlaylistIds).includes(childId)) return p.id;
  }
  return null;
}

export function getDirectChildPlaylists(
  parentId: string,
  playlists: PlaylistDef[],
): PlaylistDef[] {
  const parent = playlists.find((p) => p.id === parentId);
  if (!parent) return [];
  return normalizeChildPlaylistIds(parent.childPlaylistIds)
    .map((id) => playlists.find((p) => p.id === id))
    .filter((p): p is PlaylistDef => !!p);
}

export function collectDescendantPlaylistIds(
  rootId: string,
  playlists: PlaylistDef[],
  visited = new Set<string>(),
): Set<string> {
  if (visited.has(rootId)) return visited;
  visited.add(rootId);
  const pl = playlists.find((p) => p.id === rootId);
  if (!pl) return visited;
  for (const cid of normalizeChildPlaylistIds(pl.childPlaylistIds)) {
    collectDescendantPlaylistIds(cid, playlists, visited);
  }
  return visited;
}

export function canNestPlaylist(
  parentId: string,
  childId: string,
  playlists: PlaylistDef[],
): boolean {
  if (parentId === childId) return false;
  if (
    isMasterPlaylist(parentId) ||
    isMasterPlaylist(childId) ||
    isMyLikesPlaylist(parentId) ||
    isMyLikesPlaylist(childId)
  ) {
    return false;
  }
  const parent = playlists.find((p) => p.id === parentId);
  const child = playlists.find((p) => p.id === childId);
  if (!parent || !child) return false;
  if (getParentPlaylistId(childId, playlists) && getParentPlaylistId(childId, playlists) !== parentId) {
    return false;
  }
  const descendants = collectDescendantPlaylistIds(childId, playlists);
  return !descendants.has(parentId);
}

/** Depth-first: nested playlists, then this playlist's own tracks (deduped). */
export function flattenPlaylistTrackIds(
  playlistId: string,
  playlists: PlaylistDef[],
  visited = new Set<string>(),
): string[] {
  if (visited.has(playlistId)) return [];
  visited.add(playlistId);
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return [];

  const ids: string[] = [];
  const seen = new Set<string>();

  const push = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };

  for (const childId of normalizeChildPlaylistIds(pl.childPlaylistIds)) {
    for (const tid of flattenPlaylistTrackIds(childId, playlists, visited)) push(tid);
  }
  for (const tid of pl.trackIds) push(tid);
  return ids;
}

export function nestablePlaylistsForParent(
  parentId: string,
  playlists: PlaylistDef[],
): PlaylistDef[] {
  return playlists.filter((p) => {
    if (p.id === parentId) return false;
    if (isMasterPlaylist(p.id) || isMyLikesPlaylist(p.id)) return false;
    return canNestPlaylist(parentId, p.id, playlists);
  });
}

export function stripPlaylistFromAllParents(
  playlistId: string,
  playlists: PlaylistDef[],
): PlaylistDef[] {
  return playlists.map((p) => {
    const childPlaylistIds = normalizeChildPlaylistIds(p.childPlaylistIds).filter((id) => id !== playlistId);
    if (childPlaylistIds.length === (p.childPlaylistIds?.length ?? 0)) return p;
    return {
      ...p,
      childPlaylistIds: childPlaylistIds.length ? childPlaylistIds : undefined,
    };
  });
}

function sortTrackIdsByUpload(
  ids: string[],
  tracks: Record<string, TrackDef>,
): string[] {
  return [...ids].sort((a, b) => {
    const ua = tracks[a]?.uploadedAt ?? '';
    const ub = tracks[b]?.uploadedAt ?? '';
    if (ua !== ub) return ub.localeCompare(ua);
    return a.localeCompare(b);
  });
}

/**
 * All track ids for playback (shuffle / autoplay / next).
 * Master library always includes every track in the catalog, not just stale playlist rows.
 */
export function resolvePlaylistTrackIds(
  playlistId: string,
  tracks: Record<string, TrackDef>,
  playlists: PlaylistDef[],
): string[] {
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return [];

  const ordered = flattenPlaylistTrackIds(playlistId, playlists);
  const seen = new Set(ordered);

  if (isMasterPlaylist(playlistId)) {
    const orphans = sortTrackIdsByUpload(
      Object.keys(tracks).filter((id) => !seen.has(id)),
      tracks,
    );
    return [...ordered, ...orphans].filter((id) => tracks[id]);
  }

  return ordered.filter((id) => tracks[id]);
}

export function isProtectedPlaylist(id: string): boolean {
  return id === MASTER_PLAYLIST_ID || isMyLikesPlaylist(id);
}
