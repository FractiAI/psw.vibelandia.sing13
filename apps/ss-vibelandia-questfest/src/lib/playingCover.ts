import { isMasterPlaylist } from '@/lib/catalogSeed';
import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { SONIC_SINGULARITY_HERO_SRC } from '@/lib/sonicCatalogCopy';
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
 * Cover for the track currently playing: prefer the active playlist image
 * so the player matches the playlist tile the listener started from.
 */
export function resolvePlayingCoverSrc(
  track: TrackCoverSource,
  playlist?: PlaylistCoverSource | null,
): string | undefined {
  if (playlist?.posterSrc) return playlist.posterSrc;
  if (playlist && isMasterPlaylist(playlist.id)) return SONIC_SINGULARITY_HERO_SRC;
  return track.posterSrc;
}

/** Cache-bust URL for player / now-playing surfaces. */
export function playingCoverUrl(
  track: TrackCoverSource,
  playlist?: PlaylistCoverSource | null,
): string | undefined {
  const src = resolvePlayingCoverSrc(track, playlist);
  if (!src) return undefined;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}v=${encodeURIComponent(track.id)}`;
}
