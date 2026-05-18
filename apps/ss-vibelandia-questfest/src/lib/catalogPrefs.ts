import { loadCatalogJson } from '@/lib/catalogPersistence';
import type { CatalogSnapshot, PlaylistDef } from '@/lib/catalogTypes';
import { CATALOG_VERSION } from '@/lib/catalogSeed';

const PREFS_KEY = 'hjghf-catalog-prefs-v2';
const CACHE_KEY = 'hjghf-catalog-cache-v2';
const LEGACY_CACHE_KEY = 'hjghf-catalog-cache-v1';
const DOWNLOADS_KEY = 'hjghf-downloaded-tracks-v1';

export interface CatalogPrefs {
  version: number;
  playlists: PlaylistDef[];
  activePlaylistId: string;
}

const MAX_PREFS_BYTES = 800_000;

/** v2 prefs only — avoids parsing multi‑MB legacy `hjghf-catalog-v1` on boot. */
export function loadCatalogPrefsOnly(): CatalogPrefs | null {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw || raw.length > MAX_PREFS_BYTES) return null;
    const o = JSON.parse(raw) as CatalogPrefs;
    if (Array.isArray(o.playlists)) return o;
  } catch {
    /* ignore */
  }
  return null;
}

/** Includes one-time migration from legacy localStorage catalog. */
export function loadCatalogPrefs(): CatalogPrefs | null {
  const prefs = loadCatalogPrefsOnly();
  if (prefs) return prefs;
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
const MAX_CACHE_BYTES = 2_000_000;

/** Drop stale v1 cache (orphan server tracks / bad localMediaKey). */
function migrateLegacyCatalogCache(): void {
  try {
    if (localStorage.getItem(CACHE_KEY)) return;
    if (localStorage.getItem(LEGACY_CACHE_KEY)) {
      localStorage.removeItem(LEGACY_CACHE_KEY);
    }
    localStorage.removeItem('hjghf-catalog-v1');
  } catch {
    /* ignore */
  }
}

export function clearClientCatalogCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LEGACY_CACHE_KEY);
    localStorage.removeItem('hjghf-catalog-v1');
    localStorage.removeItem(DOWNLOADS_KEY);
  } catch {
    /* ignore */
  }
}

export function loadCatalogCache(): CatalogSnapshot | null {
  migrateLegacyCatalogCache();
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw || raw.length > MAX_CACHE_BYTES) return null;
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
