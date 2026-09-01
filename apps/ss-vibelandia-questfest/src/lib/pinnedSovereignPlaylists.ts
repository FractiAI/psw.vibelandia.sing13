import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { CONCIERTO_PRELUDE_PLAYLIST_ID, CONCIERTO_PRELUDE_TRACK_IDS } from '@/lib/conciertoPreludePlaylist';
import { READING_ROOM_PLAYLIST_ID, READING_ROOM_PLAYLIST_TRACK_IDS } from '@/lib/readingRoomPlaylist';
import { RECEPTION_PLAYLIST_ID, RECEPTION_PLAYLIST_TRACK_IDS } from '@/lib/receptionPlaylist';
import { SIN_CITY_PLAYLIST_ID, SIN_CITY_PLAYLIST_TRACK_IDS } from '@/lib/sinCityPlaylist';

const PINNED_TRACK_IDS: Record<string, readonly string[]> = {
  [CONCIERTO_PRELUDE_PLAYLIST_ID]: CONCIERTO_PRELUDE_TRACK_IDS,
  [RECEPTION_PLAYLIST_ID]: RECEPTION_PLAYLIST_TRACK_IDS,
  [SIN_CITY_PLAYLIST_ID]: SIN_CITY_PLAYLIST_TRACK_IDS,
  [READING_ROOM_PLAYLIST_ID]: READING_ROOM_PLAYLIST_TRACK_IDS,
};

const PINNED_NAMES: Record<string, string> = {
  [CONCIERTO_PRELUDE_PLAYLIST_ID]: 'Holographic Magnetic Goldilocks Art SS Canvas Landing',
  [RECEPTION_PLAYLIST_ID]: 'SS Vibelandia Check-In',
  [SIN_CITY_PLAYLIST_ID]: 'SS Vibelandia Sin City',
  [READING_ROOM_PLAYLIST_ID]: 'SS Vibelandia Reading Room',
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
    const canonicalName = PINNED_NAMES[p.id];
    const same =
      trackIds.length === p.trackIds.length &&
      trackIds.every((id, i) => id === p.trackIds[i]) &&
      (!canonicalName || p.name === canonicalName);
    if (same) return p;
    changed = true;
    return {
      ...p,
      name: canonicalName ?? p.name,
      kind: 'sovereign' as const,
      trackIds,
    };
  });

  for (const [id, canonical] of Object.entries(PINNED_TRACK_IDS)) {
    if (next.some((p) => p.id === id)) continue;
    const trackIds = canonical.filter((tid) => valid.has(tid));
    if (!trackIds.length) continue;
    changed = true;
    next.push({
      id,
      name: PINNED_NAMES[id] ?? id,
      kind: 'sovereign',
      trackIds,
    });
  }

  if (!changed) return playlists;
  return next;
}
