import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { resolvePlaylistCoverSrc } from '@/lib/sonicCatalogCopy';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

type TrackCoverSource = Pick<TrackDef, 'id' | 'posterSrc'>;
type PlaylistCoverSource = Pick<PlaylistDef, 'id' | 'posterSrc'>;

/** Playlist driving playback (next/prev) — same resolution as usePlaybackPlaylist. */
export function getPlaybackPlaylistCoverSource(): PlaylistCoverSource | undefined {
  const playbackPlaylistId = usePlaybackStore.getState().playbackPlaylistId;
  const cat = useCatalogStore.getState();
  const id = playbackPlaylistId ?? cat.activePlaylistId;
  if (!id) return undefined;
  return cat.playlists.find((p) => p.id === id);
}

/**
 * Cover for a track shown inside a playlist context: prefer the playlist image
 * so every row / player surface matches the playlist tile (Change image → all tracks).
 * Playlists without a custom poster use the FractiAI Studios default cover.
 */
export function resolvePlayingCoverSrc(
  track: TrackCoverSource,
  playlist?: PlaylistCoverSource | null,
): string | undefined {
  if (playlist) return resolvePlaylistCoverSrc(playlist.posterSrc);
  return track.posterSrc || resolvePlaylistCoverSrc(null);
}

/** Cache-bust URL for player / now-playing / playlist track thumbs. */
export function playingCoverUrl(
  track: TrackCoverSource,
  playlist?: PlaylistCoverSource | null,
): string | undefined {
  const src = resolvePlayingCoverSrc(track, playlist);
  if (!src) return undefined;
  // Include playlist poster so Change image remounts every track surface, not only the hero.
  const version = `${track.id}:${playlist?.posterSrc ?? ''}`;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}cv=${encodeURIComponent(version)}`;
}
