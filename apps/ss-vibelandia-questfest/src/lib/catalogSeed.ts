import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import {
  MASTER_LIBRARY_UI_HINT,
  SONIC_CATALOG_DISPLAY_NAME,
} from '@/lib/sonicCatalogCopy';

/** Bump only when persisted local-catalog shape changes (seed tracks are not stored). */
export const CATALOG_VERSION = 4;

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

/** Master list: every upload / device import is kept here automatically. */
export const MASTER_PLAYLIST_ID = 'pl-main';

export const MASTER_PLAYLIST_DEFAULT_NAME = SONIC_CATALOG_DISPLAY_NAME;

export const MASTER_PLAYLIST_DEFAULT_DESCRIPTION = MASTER_LIBRARY_UI_HINT;

export const MASTER_PLAYLIST_LEGACY_NAME = 'All uploads';

export const SEED_TRACK_COUNT = 552;

export function isMasterPlaylist(id: string): boolean {
  return id === MASTER_PLAYLIST_ID;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildSeedTracks(count: number): Record<string, TrackDef> {
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
      ...(withVideo ? { videoSrc: pick(VIDEO_POOL, i) } : {}),
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

export function buildSeedCatalog(): CatalogSnapshot {
  const tracks = buildSeedTracks(SEED_TRACK_COUNT);
  const allIds = Object.keys(tracks);

  const playlists: PlaylistDef[] = [
    {
      id: MASTER_PLAYLIST_ID,
      name: MASTER_PLAYLIST_DEFAULT_NAME,
      kind: 'sovereign',
      description: MASTER_PLAYLIST_DEFAULT_DESCRIPTION,
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
    version: CATALOG_VERSION,
    tracks,
    playlists,
    activePlaylistId: MASTER_PLAYLIST_ID,
  };
}

export function buildEmptyCatalog(): CatalogSnapshot {
  return buildSeedCatalog();
}

/** Device uploads only — seed tracks are re-merged on every hydrate. */
export function extractLocalTracks(snapshot: CatalogSnapshot): Record<string, TrackDef> {
  const tracks: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(snapshot.tracks)) {
    if (tr.localMediaKey) tracks[id] = tr;
  }
  return tracks;
}

const LEGACY_MASTER_NAMES = new Set([
  MASTER_PLAYLIST_LEGACY_NAME,
  'Master catalog',
  'All uploads',
  'Hero Jo Golden Bachdoor Hit Factory',
]);

const LEGACY_MASTER_DESCRIPTIONS = new Set([
  'Every upload lands here automatically. Build other playlists from this list.',
  'Every file on this device (uploads and folder imports) lives here. Other playlists are views you build from this full library.',
  'The full Reno Swamp Beats Caliente catalog — over 550 tracks.',
]);

/**
 * Seed catalog (552 streams) + saved local uploads + user playlists.
 * `syncMaster` is catalogStore.syncMasterPlaylistWithTracks.
 */
export function mergeCatalogWithSeed(
  saved: CatalogSnapshot | null,
  syncMaster: (tracks: Record<string, TrackDef>, playlists: PlaylistDef[]) => PlaylistDef[],
): CatalogSnapshot {
  const seed = buildSeedCatalog();
  const localTracks = saved ? extractLocalTracks(saved) : {};
  const tracks = { ...seed.tracks, ...localTracks };

  const seedIds = new Set(seed.playlists.map((p) => p.id));
  let playlists: PlaylistDef[] = [...seed.playlists];

  if (saved) {
    for (const p of saved.playlists) {
      if (p.id === MASTER_PLAYLIST_ID || seedIds.has(p.id)) continue;
      playlists.push({
        ...p,
        trackIds: p.trackIds.filter((id) => tracks[id]),
      });
    }
  }

  playlists = syncMaster(tracks, playlists);

  playlists = playlists.map((p) => {
    if (p.id !== MASTER_PLAYLIST_ID) return p;
    return {
      ...p,
      name: LEGACY_MASTER_NAMES.has(p.name) ? MASTER_PLAYLIST_DEFAULT_NAME : p.name,
      description:
        LEGACY_MASTER_DESCRIPTIONS.has(p.description) || !p.description?.trim()
          ? MASTER_PLAYLIST_DEFAULT_DESCRIPTION
          : p.description,
    };
  });

  const activePlaylistId =
    saved?.activePlaylistId && playlists.some((p) => p.id === saved.activePlaylistId)
      ? saved.activePlaylistId
      : MASTER_PLAYLIST_ID;

  return {
    version: CATALOG_VERSION,
    tracks,
    playlists,
    activePlaylistId,
  };
}
