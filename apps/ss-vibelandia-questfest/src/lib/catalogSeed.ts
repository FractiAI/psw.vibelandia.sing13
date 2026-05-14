import type { CatalogSnapshot } from '@/lib/catalogTypes';

export const DEMO_LONG_MP3 =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
export const DEMO_SHORT_MP3 =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
export const DEMO_VIDEO_MP4 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

/** No fabricated catalog — only real uploads / device imports. */
export const SEED_TRACK_COUNT = 0;

export function buildEmptyCatalog(): CatalogSnapshot {
  return {
    version: 3,
    tracks: {},
    playlists: [
      {
        id: 'pl-main',
        name: 'My catalog',
        kind: 'sovereign',
        description: 'Your uploads and device library.',
        trackIds: [],
      },
    ],
    activePlaylistId: 'pl-main',
  };
}

/** @deprecated use buildEmptyCatalog */
export function buildSeedCatalog(): CatalogSnapshot {
  return buildEmptyCatalog();
}

/** @deprecated use catalogStore */
export const TRACKS = buildEmptyCatalog().tracks;
export const INITIAL_PLAYLISTS = buildEmptyCatalog().playlists;
