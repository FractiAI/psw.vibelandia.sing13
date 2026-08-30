/** Sin City · Deck 3 Night soundtrack — shared jukebox playlist (static catalog). */
export const SIN_CITY_PLAYLIST_ID = 'pl-sin-city';

/** Opens the Sin City night set on Deck 3. */
export const SIN_CITY_OPENING_TRACK_ID =
  'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340';

/** Sin City-only tracks — not shared with Front Desk pl-reception. */
export const SIN_CITY_CLOSING_TRACK_ID =
  'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083';

/** Deck 3 Night · Sin City originals only. */
export const SIN_CITY_PLAYLIST_TRACK_IDS = [
  SIN_CITY_OPENING_TRACK_ID,
  SIN_CITY_CLOSING_TRACK_ID,
  'trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636',
  'trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78',
  'trk-srv-4c6cf3c8-266d-46a9-bdb5-709168da455e',
];

export const SIN_CITY_PLAYLIST = {
  id: SIN_CITY_PLAYLIST_ID,
  name: 'Sin City · Deck 3 Night soundtrack',
  kind: 'sovereign',
  description:
    'Deck 3 Night soundtrack — let\'s go holographic tonight, dos mejor q una mami, tired eyes, buena mota, mezcal y café, and ando bellaco baby. Sin City originals only; Front Desk boarding set lives on pl-reception.',
  trackIds: SIN_CITY_PLAYLIST_TRACK_IDS,
};

export function sinCityListenHref(autoplay = true) {
  const q = new URLSearchParams({ playlist: SIN_CITY_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
