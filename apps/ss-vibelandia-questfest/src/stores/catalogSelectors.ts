import type { PlaylistDef } from '@/lib/catalogTypes';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { useCatalogStore } from '@/stores/catalogStore';

/** Subscribes to activePlaylistId + playlists (safe for Zustand). */
export function useActivePlaylist(): PlaylistDef | undefined {
  return useCatalogStore((s) => s.playlists.find((p) => p.id === s.activePlaylistId));
}

function resolvedIdsEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Track ids for playback — subscribes to tracks + playlists so shuffle stays in sync
 * when the catalog grows after server sync.
 */
export function useResolvedTrackIds(playlistId?: string): string[] {
  return useCatalogStore(
    (s) => {
      const id = playlistId ?? s.activePlaylistId;
      if (!id) return [] as string[];
      return resolvePlaylistTrackIds(id, s.tracks, s.playlists);
    },
    resolvedIdsEqual,
  );
}

/** Stable key for shuffle fingerprint effects (count + tail id avoids huge strings). */
export function useResolvedTrackIdsKey(playlistId?: string): string {
  return useCatalogStore((s) => {
    const id = playlistId ?? s.activePlaylistId;
    if (!id) return '';
    const ids = resolvePlaylistTrackIds(id, s.tracks, s.playlists);
    const tail = ids.length ? ids[ids.length - 1] : '';
    return `${id}:${ids.length}:${tail}`;
  });
}
