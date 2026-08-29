/** Reception check-in soundtrack — shared jukebox playlist (static catalog). */
export const RECEPTION_PLAYLIST_ID = 'pl-reception';

/** Begins with Welcome Aboard — more tracks can be appended as the reception set grows. */
export const RECEPTION_PLAYLIST_TRACK_IDS = [
  'trk-srv-4958316a-f7ef-4639-9765-e326d85fd808',
];

export const RECEPTION_PLAYLIST = {
  id: RECEPTION_PLAYLIST_ID,
  name: 'Reception · Welcome Aboard',
  kind: 'sovereign',
  description:
    'Phase 2 reception soundtrack — begins with Welcome Aboard at check-in. Play from the jukebox while you tour the ship.',
  trackIds: RECEPTION_PLAYLIST_TRACK_IDS,
};

export function receptionListenHref(autoplay = true) {
  const q = new URLSearchParams({ playlist: RECEPTION_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
