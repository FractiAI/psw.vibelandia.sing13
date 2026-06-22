import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { filterPlayableTrackIds, playlistOrderFingerprint } from '@/lib/playlistShuffle';
import { usePlaybackStore } from '@/stores/playbackStore';

/** Rebuild shuffle ring when catalog or playlist membership changes. */
export function resyncShuffleQueueForPlaylist(
  playlistId: string,
  tracks: Record<string, TrackDef>,
  playlists: PlaylistDef[],
): void {
  const pb = usePlaybackStore.getState();
  if (!pb.shuffleEnabled || !playlistId) return;
  const resolved = resolvePlaylistTrackIds(playlistId, tracks, playlists);
  const playable = filterPlayableTrackIds(resolved, (id) => tracks[id]);
  const fp = playlistOrderFingerprint(playlistId, resolved);
  pb.syncShuffleQueue(fp, playable);
}
