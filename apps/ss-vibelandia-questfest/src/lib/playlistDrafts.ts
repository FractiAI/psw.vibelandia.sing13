import type { PlaylistDef } from '@/lib/catalogTypes';
import { isMasterPlaylist, isMyLikesPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { normalizeChildPlaylistIds } from '@/lib/playlistNest';

const BLANK_DRAFT_NAME = 'new playlist';

/** Untouched "New playlist" shell — safe to drop on hydrate or when user backs out of editor. */
export function isBlankDraftPlaylist(p: PlaylistDef): boolean {
  if (isMasterPlaylist(p.id) || isMyLikesPlaylist(p.id)) return false;
  if (p.name.trim().toLowerCase() !== BLANK_DRAFT_NAME) return false;
  if (p.trackIds.length > 0) return false;
  if (normalizeChildPlaylistIds(p.childPlaylistIds).length > 0) return false;
  if ((p.description ?? '').trim()) return false;
  if (p.posterSrc) return false;
  return true;
}

export function purgeBlankUserPlaylists(playlists: PlaylistDef[]): PlaylistDef[] {
  const blankIds = new Set(playlists.filter(isBlankDraftPlaylist).map((p) => p.id));
  if (!blankIds.size) return playlists;
  return playlists
    .filter((p) => !blankIds.has(p.id))
    .map((p) => ({
      ...p,
      childPlaylistIds: normalizeChildPlaylistIds(p.childPlaylistIds).filter((id) => !blankIds.has(id)),
    }));
}

export function resolveActivePlaylistAfterPurge(
  activePlaylistId: string,
  playlists: PlaylistDef[],
): string {
  if (playlists.some((p) => p.id === activePlaylistId)) return activePlaylistId;
  return playlists.find((p) => p.id === MASTER_PLAYLIST_ID)?.id ?? playlists[0]?.id ?? MASTER_PLAYLIST_ID;
}
