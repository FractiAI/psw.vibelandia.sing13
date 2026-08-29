import type { PlaylistDef } from '@/lib/catalogTypes';
import {
  isConciertoPreludePlaylist,
  isMasterPlaylist,
  isMyLikesPlaylist,
  isReceptionPlaylist,
  MASTER_PLAYLIST_ID,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';
import { CONCIERTO_PRELUDE_PLAYLIST_ID } from '@/lib/conciertoPreludePlaylist';
import { RECEPTION_PLAYLIST_ID } from '@/lib/receptionPlaylist';

export function isMenuPinnedPlaylist(id: string): boolean {
  return isMasterPlaylist(id) || isMyLikesPlaylist(id) || isConciertoPreludePlaylist(id) || isReceptionPlaylist(id);
}

export function manageableMenuPlaylists(playlists: PlaylistDef[]): PlaylistDef[] {
  return playlists.filter((p) => !isMenuPinnedPlaylist(p.id));
}

/** Drop stale ids; append new playlists alphabetically. */
export function normalizePlaylistMenuOrder(
  order: string[] | undefined,
  playlists: PlaylistDef[],
): string[] {
  const manageable = manageableMenuPlaylists(playlists);
  const manageableIds = new Set(manageable.map((p) => p.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of order ?? []) {
    if (!manageableIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  const rest = manageable
    .filter((p) => !seen.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return [...out, ...rest.map((p) => p.id)];
}

/** Master + Likes pinned, then user playlists in saved menu order. */
export function applyPlaylistMenuOrder(
  playlists: PlaylistDef[],
  order: string[] | undefined,
): PlaylistDef[] {
  const pinned: PlaylistDef[] = [];
  const master = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);
  const likes = playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID);
  const prelude = playlists.find((p) => p.id === CONCIERTO_PRELUDE_PLAYLIST_ID);
  const reception = playlists.find((p) => p.id === RECEPTION_PLAYLIST_ID);
  if (master) pinned.push(master);
  if (likes) pinned.push(likes);
  if (prelude) pinned.push(prelude);
  if (reception) pinned.push(reception);

  const manageable = manageableMenuPlaylists(playlists);
  const byId = new Map(manageable.map((p) => [p.id, p]));
  const orderedIds = normalizePlaylistMenuOrder(order, playlists);
  const ordered = orderedIds.map((id) => byId.get(id)).filter((p): p is PlaylistDef => !!p);

  return [...pinned, ...ordered];
}

export function insertPlaylistMenuOrderAfter(
  order: string[],
  newId: string,
  afterId?: string,
): string[] {
  const without = order.filter((id) => id !== newId);
  if (!afterId) return [...without, newId];
  const idx = without.indexOf(afterId);
  if (idx < 0) return [...without, newId];
  return [...without.slice(0, idx + 1), newId, ...without.slice(idx + 1)];
}
