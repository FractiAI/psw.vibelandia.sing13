/** Sin City · Deck 3 Night soundtrack — shared jukebox playlist (static catalog). */
export const SIN_CITY_PLAYLIST_ID = 'pl-sin-city';

/** Opens the Sin City night set on Deck 3. */
export const SIN_CITY_OPENING_TRACK_ID =
  'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340';

/** Sin City-only tracks — not shared with Front Desk pl-reception. */
export const SIN_CITY_CLOSING_TRACK_ID =
  'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083';

/** Deck 3 Night · two Sin City originals — holographic invitation + mami floor. */
export const SIN_CITY_PLAYLIST_TRACK_IDS = [
  SIN_CITY_OPENING_TRACK_ID,
  SIN_CITY_CLOSING_TRACK_ID,
];

export const SIN_CITY_PLAYLIST = {
  id: SIN_CITY_PLAYLIST_ID,
  name: 'Sin City · Deck 3 Night soundtrack',
  kind: 'sovereign',
  description:
    'Deck 3 Night soundtrack — let\'s go holographic tonight and dos mejor q una mami. Sin City originals only; Front Desk boarding set lives on pl-reception.',
  trackIds: SIN_CITY_PLAYLIST_TRACK_IDS,
};

export function sinCityListenHref(autoplay = true) {
  const q = new URLSearchParams({ playlist: SIN_CITY_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
