import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { CONCIERTO_PRELUDE_PLAYLIST_ID, CONCIERTO_PRELUDE_TRACK_IDS } from '@/lib/conciertoPreludePlaylist';
import { RECEPTION_PLAYLIST_ID, RECEPTION_PLAYLIST_TRACK_IDS } from '@/lib/receptionPlaylist';
import { SIN_CITY_PLAYLIST_ID, SIN_CITY_PLAYLIST_TRACK_IDS } from '@/lib/sinCityPlaylist';

const PINNED_TRACK_IDS: Record<string, readonly string[]> = {
  [CONCIERTO_PRELUDE_PLAYLIST_ID]: CONCIERTO_PRELUDE_TRACK_IDS,
  [RECEPTION_PLAYLIST_ID]: RECEPTION_PLAYLIST_TRACK_IDS,
  [SIN_CITY_PLAYLIST_ID]: SIN_CITY_PLAYLIST_TRACK_IDS,
};

/** Restore canonical track order for pinned sovereign playlists after server/local merge. */
export function syncPinnedSovereignPlaylists(
  playlists: PlaylistDef[],
  tracks: Record<string, TrackDef>,
): PlaylistDef[] {
  const valid = new Set(Object.keys(tracks));
  let changed = false;
  const next = playlists.map((p) => {
    const canonical = PINNED_TRACK_IDS[p.id];
    if (!canonical) return p;
    const trackIds = canonical.filter((id) => valid.has(id));
    const same =
      trackIds.length === p.trackIds.length && trackIds.every((id, i) => id === p.trackIds[i]);
    if (same) return p;
    changed = true;
    return { ...p, trackIds };
  });

  if (!changed) return playlists;

  for (const [id, canonical] of Object.entries(PINNED_TRACK_IDS)) {
    if (next.some((p) => p.id === id)) continue;
    const trackIds = canonical.filter((tid) => valid.has(tid));
    if (!trackIds.length) continue;
    next.push({
      id,
      name: id,
      kind: 'sovereign',
      trackIds,
    });
  }

  return next;
}
