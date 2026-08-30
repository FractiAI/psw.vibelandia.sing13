/** Sin City · Deck 3 Night soundtrack — shared jukebox playlist (static catalog). */
export const SIN_CITY_PLAYLIST_ID = 'pl-sin-city';

/** Opens the Sin City night set on Deck 3. */
export const SIN_CITY_OPENING_TRACK_ID =
  'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340';

/** Deck 3 Night · Bachdoor · Neon Velvet · Club Omnia — consent-first Reno nightlife arc. */
export const SIN_CITY_PLAYLIST_TRACK_IDS = [
  SIN_CITY_OPENING_TRACK_ID,
  'trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d',
  'trk-srv-0f365475-4288-4e8e-b3ed-2ae0f87fc3f3',
  'trk-srv-418b8c0d-671e-4be6-bdbf-7ae7ccbbf587',
  'trk-srv-364cf151-34a2-403d-9970-6d7d67f7da5f',
  'trk-srv-0b6813f6-7159-48a0-b233-55dfb7398ef5',
  'trk-srv-c209b018-1f13-4fa4-9337-0e687c5230ac',
  'trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd',
  'trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59',
  'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083',
  'trk-srv-75385f59-b548-4908-b882-27895dc6b2b0',
];

export const SIN_CITY_PLAYLIST = {
  id: SIN_CITY_PLAYLIST_ID,
  name: 'Sin City · Deck 3 Night soundtrack',
  kind: 'sovereign',
  description:
    'Deck 3 Night soundtrack — let\'s go holographic tonight, magnetic zydeco night, holographic perreo night, downtown Reno, baller nights, wrong-side Sunday gold, dos mejor q una mami, and we are the dance that makes the music.',
  trackIds: SIN_CITY_PLAYLIST_TRACK_IDS,
};

export function sinCityListenHref(autoplay = true) {
  const q = new URLSearchParams({ playlist: SIN_CITY_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
