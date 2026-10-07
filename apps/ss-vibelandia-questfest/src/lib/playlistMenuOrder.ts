import type { PlaylistDef } from '@/lib/catalogTypes';
import {
  isConciertoPreludePlaylist,
  isHerosReturnConciertoPlaylist,
  isMasterPlaylist,
  isMyLikesPlaylist,
  isReadingRoomPlaylist,
  isReceptionPlaylist,
  isSinCityPlaylist,
  MASTER_PLAYLIST_ID,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';
import { CONCIERTO_PRELUDE_PLAYLIST_ID } from '@/lib/conciertoPreludePlaylist';
import { HEROS_RETURN_CONCIERTO_PLAYLIST_ID } from '@/lib/herosReturnConciertoPlaylist';
import { READING_ROOM_PLAYLIST_ID } from '@/lib/readingRoomPlaylist';
import { RECEPTION_PLAYLIST_ID } from '@/lib/receptionPlaylist';
import { SIN_CITY_PLAYLIST_ID } from '@/lib/sinCityPlaylist';

/** How many recently listened playlists float above A–Z. */
export const RECENT_PLAYLIST_MENU_CAP = 24;

/** Prefs marker — empty recent list → pure alphabetic user playlists. */
export const PLAYLIST_ORDER_MODE_RECENT_ALPHA = 'recent-alpha-v1' as const;

export function isMenuPinnedPlaylist(id: string): boolean {
  return (
    isMasterPlaylist(id) ||
    isMyLikesPlaylist(id) ||
    isConciertoPreludePlaylist(id) ||
    isHerosReturnConciertoPlaylist(id) ||
    isReceptionPlaylist(id) ||
    isSinCityPlaylist(id) ||
    isReadingRoomPlaylist(id)
  );
}

export function manageableMenuPlaylists(playlists: PlaylistDef[]): PlaylistDef[] {
  return playlists.filter((p) => !isMenuPinnedPlaylist(p.id));
}

function comparePlaylistName(a: PlaylistDef, b: PlaylistDef): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

/**
 * Menu order = recently listened first (most recent at front), then remaining A–Z.
 * Pinned catalogs are applied separately in {@link applyPlaylistMenuOrder}.
 */
export function normalizePlaylistMenuOrder(
  order: string[] | undefined,
  playlists: PlaylistDef[],
): string[] {
  const manageable = manageableMenuPlaylists(playlists);
  const manageableIds = new Set(manageable.map((p) => p.id));
  const seen = new Set<string>();
  const recent: string[] = [];
  for (const id of order ?? []) {
    if (!manageableIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    recent.push(id);
    if (recent.length >= RECENT_PLAYLIST_MENU_CAP) break;
  }
  const rest = manageable
    .filter((p) => !seen.has(p.id))
    .sort(comparePlaylistName);
  return [...recent, ...rest.map((p) => p.id)];
}

/** Bump a playlist to the front of the recent-listen stack (pinned ids ignored). */
export function bumpRecentPlaylistMenuOrder(order: string[], playlistId: string): string[] {
  if (!playlistId || isMenuPinnedPlaylist(playlistId)) {
    return order.filter((id) => id !== playlistId);
  }
  return [playlistId, ...order.filter((id) => id !== playlistId)].slice(0, RECENT_PLAYLIST_MENU_CAP);
}

/** Master + Likes + program pins, then recent listens, then A–Z. */
export function applyPlaylistMenuOrder(
  playlists: PlaylistDef[],
  order: string[] | undefined,
): PlaylistDef[] {
  const pinned: PlaylistDef[] = [];
  const master = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);
  const likes = playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID);
  const prelude = playlists.find((p) => p.id === CONCIERTO_PRELUDE_PLAYLIST_ID);
  const herosReturn = playlists.find((p) => p.id === HEROS_RETURN_CONCIERTO_PLAYLIST_ID);
  const reception = playlists.find((p) => p.id === RECEPTION_PLAYLIST_ID);
  const sinCity = playlists.find((p) => p.id === SIN_CITY_PLAYLIST_ID);
  const readingRoom = playlists.find((p) => p.id === READING_ROOM_PLAYLIST_ID);
  if (master) pinned.push(master);
  if (likes) pinned.push(likes);
  if (prelude) pinned.push(prelude);
  if (herosReturn) pinned.push(herosReturn);
  if (reception) pinned.push(reception);
  if (sinCity) pinned.push(sinCity);
  if (readingRoom) pinned.push(readingRoom);

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
  if (!afterId) return [...without, newId].slice(0, RECENT_PLAYLIST_MENU_CAP);
  const idx = without.indexOf(afterId);
  if (idx < 0) return [...without, newId].slice(0, RECENT_PLAYLIST_MENU_CAP);
  return [...without.slice(0, idx + 1), newId, ...without.slice(idx + 1)].slice(
    0,
    RECENT_PLAYLIST_MENU_CAP,
  );
}
