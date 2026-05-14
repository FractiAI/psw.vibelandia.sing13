import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';

export const DEMO_LONG_MP3 =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
export const DEMO_SHORT_MP3 =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
export const DEMO_VIDEO_MP4 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const AUDIO_POOL = [DEMO_LONG_MP3, DEMO_SHORT_MP3];
const VIDEO_POOL = [DEMO_VIDEO_MP4];

const TITLE_BITS = [
  'Caliente',
  'Bachdoor',
  'Swamp Vibe',
  'Golden Hour',
  'Reno Heat',
  'Perreo Night',
  'Backdoor Bounce',
  'Hero Jo',
  'Hit Factory',
  'Wrong Side',
  'Man Cave',
  'φ Bearing',
  'H-Line',
  'Deck Fire',
  'Swamp Gold',
];

const ARTISTS = [
  'Hero Jo Golden Bachdoor',
  'Reno Swamp Beats',
  'Hit Factory Crew',
  'Caliente Valley',
  'Backdoor Syndicate',
  'SS Vibelandia',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildTracks(count: number): Record<string, TrackDef> {
  const tracks: Record<string, TrackDef> = {};
  for (let i = 1; i <= count; i++) {
    const id = `trk-${i}`;
    const a = pick(AUDIO_POOL, i);
    const withVideo = i % 7 === 0 || i <= 3;
    tracks[id] = {
      id,
      title: `${pick(TITLE_BITS, i)} · Vol ${Math.ceil(i / 13)} #${i}`,
      artist: pick(ARTISTS, Math.floor(i / 3)),
      src: a,
      ...(withVideo
        ? { videoSrc: pick(VIDEO_POOL, i), posterSrc: undefined }
        : {}),
      durationSec: 180 + (i % 90),
    };
  }
  return tracks;
}

function chunkIds(ids: string[], size: number): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size));
  return out;
}

export const SEED_TRACK_COUNT = 552;

export function buildSeedCatalog(): CatalogSnapshot {
  const tracks = buildTracks(SEED_TRACK_COUNT);
  const allIds = Object.keys(tracks);

  const playlists: PlaylistDef[] = [
    {
      id: 'pl-main',
      name: 'Hero Jo Golden Bachdoor Hit Factory',
      kind: 'sovereign',
      description: 'The full Reno Swamp Beats Caliente catalog — over 550 tracks.',
      trackIds: [...allIds],
    },
    {
      id: 'pl-caliente',
      name: 'Caliente Picks',
      kind: 'sovereign',
      description: 'Hottest cuts from the swamp.',
      trackIds: allIds.filter((_, i) => i % 3 === 0),
    },
    {
      id: 'pl-backdoor',
      name: 'Backdoor Sessions',
      kind: 'sovereign',
      description: 'Late-night backdoor bearings.',
      trackIds: allIds.filter((_, i) => i % 5 === 0),
    },
    {
      id: 'pl-broadcast',
      name: 'Broadcast Now',
      kind: 'sovereign',
      description: 'What is on the air right now.',
      trackIds: allIds.slice(0, 24),
    },
    {
      id: 'pl-open',
      name: 'Open Deck',
      kind: 'open_deck',
      description: 'Full-length preview — no 30s gate.',
      trackIds: chunkIds(allIds, 40)[0] ?? [],
    },
  ];

  return {
    version: 2,
    tracks,
    playlists,
    activePlaylistId: 'pl-main',
  };
}

/** @deprecated use catalogStore */
export const TRACKS = buildSeedCatalog().tracks;
export const INITIAL_PLAYLISTS = buildSeedCatalog().playlists;
