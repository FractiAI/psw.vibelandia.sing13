import { loadCatalogJson } from '@/lib/catalogPersistence';
import type { CatalogSnapshot, PlaylistDef } from '@/lib/catalogTypes';
import { CATALOG_VERSION } from '@/lib/catalogSeed';

const PREFS_KEY = 'hjghf-catalog-prefs-v2';
const CACHE_KEY = 'hjghf-catalog-cache-v1';
const DOWNLOADS_KEY = 'hjghf-downloaded-tracks-v1';

export interface CatalogPrefs {
  version: number;
  playlists: PlaylistDef[];
  activePlaylistId: string;
}

export function loadCatalogPrefs(): CatalogPrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const o = JSON.parse(raw) as CatalogPrefs;
      if (Array.isArray(o.playlists)) return o;
    }
  } catch {
    /* fall through */
  }
  const legacy = loadCatalogJson<CatalogSnapshot>();
  if (!legacy?.playlists?.length) return null;
  return {
    version: CATALOG_VERSION,
    playlists: legacy.playlists,
    activePlaylistId: legacy.activePlaylistId || 'pl-main',
  };
}

export function saveCatalogPrefs(prefs: CatalogPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/** Last server manifest — instant paint while live sync runs. */
export function loadCatalogCache(): CatalogSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CatalogSnapshot;
  } catch {
    return null;
  }
}

export function saveCatalogCache(snapshot: CatalogSnapshot): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      version: snapshot.version,
      tracks: snapshot.tracks,
      playlists: snapshot.playlists,
      activePlaylistId: snapshot.activePlaylistId,
    }),
  );
}

export function loadDownloadedTrackIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DOWNLOADS_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveDownloadedTrackIds(ids: Iterable<string>): void {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify([...ids]));
}

export function markTrackDownloaded(trackId: string): void {
  const set = loadDownloadedTrackIds();
  set.add(trackId);
  saveDownloadedTrackIds(set);
}
