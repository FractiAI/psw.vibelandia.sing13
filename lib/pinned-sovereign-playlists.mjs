/**
 * Pinned sovereign jukebox playlists — canonical track order (static catalog source of truth).
 */
import { CONCIERTO_PRELUDE_PLAYLIST } from './concierto-prelude-playlist.mjs';
import { RECEPTION_PLAYLIST } from './reception-playlist.mjs';
import { SIN_CITY_PLAYLIST } from './sin-city-playlist.mjs';

export const PINNED_SOVEREIGN_PLAYLIST_IDS = new Set([
  CONCIERTO_PRELUDE_PLAYLIST.id,
  RECEPTION_PLAYLIST.id,
  SIN_CITY_PLAYLIST.id,
]);

export const PINNED_SOVEREIGN_PLAYLISTS = [
  CONCIERTO_PRELUDE_PLAYLIST,
  RECEPTION_PLAYLIST,
  SIN_CITY_PLAYLIST,
];

/** Ensure prelude, Front Desk, and Sin City playlists keep canonical track lists. */
export function reconcilePinnedSovereignPlaylists(catalog) {
  if (!catalog || typeof catalog !== 'object') return catalog;
  const playlists = Array.isArray(catalog.playlists) ? [...catalog.playlists] : [];
  const byId = new Map(playlists.map((p) => [p.id, { ...p, trackIds: [...(p.trackIds || [])] }]));

  for (const pinned of PINNED_SOVEREIGN_PLAYLISTS) {
    const existing = byId.get(pinned.id);
    byId.set(pinned.id, {
      ...(existing || {}),
      id: pinned.id,
      name: pinned.name,
      kind: pinned.kind,
      description: pinned.description,
      trackIds: [...pinned.trackIds],
    });
  }

  return {
    ...catalog,
    playlists: [...byId.values()],
  };
}
