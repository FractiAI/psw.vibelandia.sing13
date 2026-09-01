/** Reading Room · Deep Memory soundtrack — shared jukebox playlist (static catalog). */
export const READING_ROOM_PLAYLIST_ID = 'pl-reading-room';

export const READING_ROOM_OPENING_TRACK_ID =
  'trk-srv-8803278e-1d65-4172-b503-0bf33266b61d';

export const READING_ROOM_PLAYLIST_TRACK_IDS = [
  READING_ROOM_OPENING_TRACK_ID,
  'trk-srv-cd8981fe-ff66-4e04-bd06-b6c831c393d5',
  'trk-srv-5fec2bdf-5b85-46ca-94a1-314a9971e677',
  'trk-srv-f66cd32f-eed5-4f32-bf04-b30ea2d4d89e',
  'trk-srv-6c94b386-290f-490d-ae35-e36c1402e80e',
  'trk-srv-03693ab2-81a5-4663-b160-d1287e20057a',
  'trk-srv-8acd39c5-1cf7-407e-9f40-590de96b0cda',
  'trk-srv-dff8cd18-59af-40a1-baf8-cc0c04fbbd48',
  'trk-srv-1871b78c-fd4d-4d76-aa99-4afa0a0323f6',
  'trk-srv-84a284ab-1425-4b5d-b243-0f74ee89ba7e',
  'trk-srv-818f3a56-5df6-4a88-9745-63f35bae1cb4',
  'trk-srv-09d32078-96d5-41ff-afe4-f85b8ead8a84',
];

export function isReadingRoomPlaylist(id: string): boolean {
  return id === READING_ROOM_PLAYLIST_ID;
}

export function readingRoomListenHref(autoplay = true): string {
  const q = new URLSearchParams({ playlist: READING_ROOM_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
