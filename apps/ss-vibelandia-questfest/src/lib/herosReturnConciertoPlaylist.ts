/** The Hero’s Return Concierto — 12-movement Source playlist (mirrors lib/heros-return-concierto-playlist.mjs). */
export const HEROS_RETURN_CONCIERTO_PLAYLIST_ID = 'pl-heros-return-concierto';

export const HEROS_RETURN_CONCIERTO_TRACK_IDS = [
  'trk-srv-cee5ce49-3e95-4de9-9edb-a6eebc7a597c', // 1:12
  'trk-srv-470ddfdc-b8eb-4dde-b43b-788ce6068eb7', // 2:12
  'trk-srv-1b3d4399-904d-4244-bad4-04e3fc5db99b', // 3:12
  'trk-srv-24f29003-7e87-4d53-a241-b3db37086bb7', // 4:12
  'trk-srv-e96c1dcf-4e1b-4671-b3e2-188d69053ebc', // 5:12
  'trk-srv-b28550b5-7b3c-4882-a7f9-fd8137cb22da', // 6:12
  'trk-srv-1c76146b-520b-46c8-a1af-419554497313', // 7:12
  'trk-srv-0eee22a0-c033-488d-a302-cce970e25328', // 8:12
  'trk-srv-85ec124b-9d95-4281-ada1-78fe313c21d2', // 9:12
  'trk-srv-e715de1c-d6a5-4b8e-8cf3-96c5f16c4fad', // 10:12
  'trk-srv-195e640f-c0fc-402f-9f42-e8b43d0adde3', // 11:12
  'trk-srv-645868fe-b6ab-4181-93b4-27430bddd4a6', // 12:12
] as const;

export function isHerosReturnConciertoPlaylist(id: string): boolean {
  return id === HEROS_RETURN_CONCIERTO_PLAYLIST_ID;
}

export function herosReturnConciertoListenHref(autoplay = true): string {
  const q = new URLSearchParams({ playlist: HEROS_RETURN_CONCIERTO_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
