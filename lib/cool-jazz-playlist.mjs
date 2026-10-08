/** Cool Jazz · Golden Y Frontier Club soundtrack (live catalog playlist). */
export const COOL_JAZZ_PLAYLIST_ID = 'pl-1791170281395';

/** Opens Cool Jazz on Golden Y Frontier Club. */
export const COOL_JAZZ_OPENING_TRACK_ID =
  'trk-srv-b347a19b-a84b-4797-96f6-8f0386aa8d6b';

export const COOL_JAZZ_PLAYLIST_TRACK_IDS = [
  COOL_JAZZ_OPENING_TRACK_ID,
  'trk-srv-10bad482-5f3e-4f6e-8551-201d1ae541c9',
  'trk-srv-83f15f32-a21b-40a3-af82-65dbf7dcdad2',
  'trk-srv-26c6236b-41ce-4071-b695-04a328a3f867',
  'trk-srv-605d475d-f834-459a-817f-593d333b2dc1',
  'trk-srv-4ba45442-6d7e-405f-a2a3-241039d6259e',
  'trk-srv-e045ffb2-bccc-4977-b916-cbdb8ccb75d9',
  'trk-srv-2d658082-c060-4869-a11f-f216b1e0c77f',
];

export const COOL_JAZZ_PLAYLIST = {
  id: COOL_JAZZ_PLAYLIST_ID,
  name: 'Cool Jazz',
  kind: 'catalog',
  description:
    'Golden Y Frontier Club cool-jazz set — tap Sound on at /golden-y-frontier-club. Same playlist as Sovereignty Player Cool Jazz.',
  trackIds: COOL_JAZZ_PLAYLIST_TRACK_IDS,
};

export function coolJazzListenHref(autoplay = true) {
  const q = new URLSearchParams({ playlist: COOL_JAZZ_PLAYLIST_ID });
  if (autoplay) q.set('autoplay', '1');
  return `/interfaces/questfest-bridge/#/listen?${q.toString()}`;
}
