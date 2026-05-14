import type { CatalogSnapshot } from '@/lib/catalogTypes';

/** Bump to wipe browser catalog + blobs on next load (no seed data). */
export const CATALOG_VERSION = 4;

export function buildEmptyCatalog(): CatalogSnapshot {
  return {
    version: CATALOG_VERSION,
    tracks: {},
    playlists: [
      {
        id: 'pl-main',
        name: 'My catalog',
        kind: 'sovereign',
        description: 'Upload a track to get started.',
        trackIds: [],
      },
    ],
    activePlaylistId: 'pl-main',
  };
}
