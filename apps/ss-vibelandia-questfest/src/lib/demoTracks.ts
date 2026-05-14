/** @deprecated use catalogStore */
import { buildEmptyCatalog } from '@/lib/catalogSeed';

export const TRACKS = buildEmptyCatalog().tracks;
export const INITIAL_PLAYLISTS = buildEmptyCatalog().playlists;
export type { TrackDef, PlaylistDef, PlaylistKind } from '@/lib/catalogTypes';
