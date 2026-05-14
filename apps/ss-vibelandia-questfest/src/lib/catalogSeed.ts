import type { CatalogSnapshot } from '@/lib/catalogTypes';

/** Bump to wipe browser catalog + blobs on next load (no seed data). */
export const CATALOG_VERSION = 4;

/** Master list: every upload / device import is kept here automatically. */
export const MASTER_PLAYLIST_ID = 'pl-main';

export function isMasterPlaylist(id: string): boolean {
  return id === MASTER_PLAYLIST_ID;
}

export function buildEmptyCatalog(): CatalogSnapshot {
  return {
    version: CATALOG_VERSION,
    tracks: {},
    playlists: [
      {
        id: MASTER_PLAYLIST_ID,
        name: 'All uploads',
        kind: 'sovereign',
        description: 'Every upload lands here automatically. Build other playlists from this list.',
        trackIds: [],
      },
    ],
    activePlaylistId: MASTER_PLAYLIST_ID,
  };
}
