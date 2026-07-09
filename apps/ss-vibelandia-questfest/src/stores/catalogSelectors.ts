import type { PlaylistDef } from '@/lib/catalogTypes';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useShallow } from 'zustand/react/shallow';

/** Subscribes to activePlaylistId + playlists (safe for Zustand). */
export function useActivePlaylist(): PlaylistDef | undefined {
  return useCatalogStore((s) => s.playlists.find((p) => p.id === s.activePlaylistId));
}

/** Playlist driving next/prev/autoplay — falls back to browse selection when idle. */
export function usePlaybackPlaylist(): PlaylistDef | undefined {
  const playbackPlaylistId = usePlaybackStore((s) => s.playbackPlaylistId);
  return useCatalogStore((s) => {
    const id = playbackPlaylistId ?? s.activePlaylistId;
    return s.playlists.find((p) => p.id === id);
  });
}

export function usePlaybackPlaylistId(): string | undefined {
  const playbackPlaylistId = usePlaybackStore((s) => s.playbackPlaylistId);
  return useCatalogStore((s) => playbackPlaylistId ?? s.activePlaylistId);
}

/**
 * Track ids for playback — subscribes to tracks + playlists so shuffle stays in sync
 * when the catalog grows after server sync.
 * Zustand v5 create() ignores a custom equality fn; useShallow stabilizes array refs.
 */
export function useResolvedTrackIds(playlistId?: string): string[] {
  return useCatalogStore(
    useShallow((s) => {
      const id = playlistId ?? s.activePlaylistId;
      if (!id) return [] as string[];
      return resolvePlaylistTrackIds(id, s.tracks, s.playlists);
    }),
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
