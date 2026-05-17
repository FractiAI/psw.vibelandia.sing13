import type { CatalogSnapshot } from '@/lib/catalogTypes';
import { MASTER_LIBRARY_UI_HINT, SONIC_CATALOG_DISPLAY_NAME } from '@/lib/sonicCatalogCopy';

/** Bump to wipe browser catalog + blobs on next load (no seed data). */
export const CATALOG_VERSION = 4;

/** Master list: every upload / device import is kept here automatically. */
export const MASTER_PLAYLIST_ID = 'pl-main';

/** Shown for the master row (persisted playlists may still use legacy name until migrated). */
export const MASTER_PLAYLIST_DEFAULT_NAME = SONIC_CATALOG_DISPLAY_NAME;

/** Persisted on the master row — UI hint only (Listen hero uses sonicCatalogCopy). */
export const MASTER_PLAYLIST_DEFAULT_DESCRIPTION = MASTER_LIBRARY_UI_HINT;

/** Legacy catalog title from older builds — migrated on load in `keepLocalTracksOnly`. */
export const MASTER_PLAYLIST_LEGACY_NAME = 'All uploads';

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
        name: MASTER_PLAYLIST_DEFAULT_NAME,
        kind: 'sovereign',
        description: MASTER_PLAYLIST_DEFAULT_DESCRIPTION,
        trackIds: [],
      },
    ],
    activePlaylistId: MASTER_PLAYLIST_ID,
  };
}
