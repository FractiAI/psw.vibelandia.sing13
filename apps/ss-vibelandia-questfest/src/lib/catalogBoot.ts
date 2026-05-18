import { readBundledCatalog } from '@/lib/bundledCatalog';
import { extractDeviceCacheTracks, mergeServerCatalogWithPrefs } from '@/lib/catalogSeed';
import { loadCatalogCache, loadCatalogPrefsOnly, loadDownloadedTrackIds } from '@/lib/catalogPrefs';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';

/** Empty bundled manifest — paints instantly; no localStorage on module load. */
export function instantBootSnapshot(): CatalogSnapshot {
  return readBundledCatalog();
}

/** Device cache + prefs after first paint (filters legacy seed tracks). */
export function hydrateCatalogFromDevice(
  syncMaster: (tracks: Record<string, TrackDef>, playlists: PlaylistDef[]) => PlaylistDef[],
): CatalogSnapshot {
  const prefs = loadCatalogPrefsOnly();
  const downloaded = loadDownloadedTrackIds();
  const raw = loadCatalogCache();
  const server = raw
    ? (() => {
        const tracks = extractDeviceCacheTracks(raw);
        const valid = new Set(Object.keys(tracks));
        return {
          ...raw,
          tracks,
          playlists: raw.playlists.map((p) => ({
            ...p,
            trackIds: p.trackIds.filter((id) => valid.has(id)),
          })),
        };
      })()
    : readBundledCatalog();
  return mergeServerCatalogWithPrefs(server, prefs, downloaded, syncMaster);
}
