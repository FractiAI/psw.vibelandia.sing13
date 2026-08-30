/** Sin City · Deck 3 Night soundtrack — shared jukebox playlist (static catalog). */
export const SIN_CITY_PLAYLIST_ID = 'pl-sin-city';

export const SIN_CITY_OPENING_TRACK_ID =
  'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340';

export const SIN_CITY_CLOSING_TRACK_ID =
  'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083';

export const SIN_CITY_PLAYLIST_TRACK_IDS = [
  SIN_CITY_OPENING_TRACK_ID,
  SIN_CITY_CLOSING_TRACK_ID,
  'trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636',
  'trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78',
];

export function isSinCityPlaylist(id: string): boolean {
  return id === SIN_CITY_PLAYLIST_ID;
}

export function sinCityListenHref(autoplay = true): string {
  const q = new URLSearchParams({ playlist: SIN_CITY_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
