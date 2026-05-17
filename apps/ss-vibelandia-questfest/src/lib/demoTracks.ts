/** @deprecated use catalogStore */
import { buildSeedCatalog, SEED_TRACK_COUNT } from '@/lib/catalogSeed';

export { DEMO_LONG_MP3, DEMO_SHORT_MP3, DEMO_VIDEO_MP4, SEED_TRACK_COUNT } from '@/lib/catalogSeed';

export const TRACKS = buildSeedCatalog().tracks;
export const INITIAL_PLAYLISTS = buildSeedCatalog().playlists;
export type { TrackDef, PlaylistDef, PlaylistKind } from '@/lib/catalogTypes';
