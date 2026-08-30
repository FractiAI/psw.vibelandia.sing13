/** Reception check-in soundtrack — jukebox playlist id (mirrors lib/reception-playlist.mjs). */
export const RECEPTION_PLAYLIST_ID = 'pl-reception';

export const RECEPTION_CAPTAIN_WELCOME_TRACK_ID =
  'trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4';

export const RECEPTION_PLAYLIST_TRACK_IDS = [
  RECEPTION_CAPTAIN_WELCOME_TRACK_ID,
  'trk-srv-4958316a-f7ef-4639-9765-e326d85fd808',
  'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52',
  'trk-srv-21e83580-3b12-44a0-884a-8679fa1d6a9a',
  'trk-srv-0a4b414c-9ce0-41b2-901b-8e5b11215a09',
  'trk-srv-b2eccf1d-a165-4b4e-8e3a-d4d3ce53b89a',
  'trk-srv-d057c001-ebf8-4cf9-be19-e3d6537842a6',
  'trk-srv-7c29e8cf-b516-4689-882c-e94550b30636',
  'trk-srv-0f63093f-bd81-4a96-bfe6-56b6d9c31ef9',
  'trk-srv-0f971a21-b916-436d-bae5-9fe5c0f8878d',
  'trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d',
  'trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59',
  'trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd',
  'trk-srv-75385f59-b548-4908-b882-27895dc6b2b0',
  'trk-srv-480b6197-b842-4d6e-846c-ac9c6e3da544',
] as const;

export function isReceptionPlaylist(id: string): boolean {
  return id === RECEPTION_PLAYLIST_ID;
}

export function receptionListenHref(autoplay = true): string {
  const q = new URLSearchParams({ playlist: RECEPTION_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
