import { useCallback } from 'react';
import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
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
 * Live track lookup — re-renders when `tracks` is replaced (Edit track Save, sync, covers).
 * Prefer this over `useCatalogStore(s => s.getTrack)` which never invalidates on metadata edits.
 */
export function useGetTrack(): (id: string) => TrackDef | undefined {
  const tracks = useCatalogStore((s) => s.tracks);
  return useCallback((id: string) => tracks[id], [tracks]);
}

/** Single track by id — updates immediately after Edit track Save. */
export function useTrack(trackId: string | null | undefined): TrackDef | undefined {
  return useCatalogStore((s) => (trackId ? s.tracks[trackId] : undefined));
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
