/** Reception check-in soundtrack — jukebox playlist id (mirrors lib/reception-playlist.mjs). */
export const RECEPTION_PLAYLIST_ID = 'pl-reception';

export const RECEPTION_PLAYLIST_TRACK_IDS = [
  'trk-srv-4958316a-f7ef-4639-9765-e326d85fd808',
  'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52',
  'trk-srv-21e83580-3b12-44a0-884a-8679fa1d6a9a',
] as const;

export function isReceptionPlaylist(id: string): boolean {
  return id === RECEPTION_PLAYLIST_ID;
}

export function receptionListenHref(autoplay = true): string {
  const q = new URLSearchParams({ playlist: RECEPTION_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
