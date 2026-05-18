import type { PlaylistDef } from '@/lib/catalogTypes';
import { useCatalogStore } from '@/stores/catalogStore';

/** Subscribes to activePlaylistId + playlists (safe for Zustand). */
export function useActivePlaylist(): PlaylistDef | undefined {
  return useCatalogStore((s) => s.playlists.find((p) => p.id === s.activePlaylistId));
}
