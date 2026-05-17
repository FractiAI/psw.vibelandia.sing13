import { buildEmptyCatalog } from '@/lib/catalogSeed';
import type { CatalogSnapshot, TrackDef } from '@/lib/catalogTypes';

const API_CATALOG = '/api/catalog';
const STATIC_CATALOG = '/media/catalog/catalog.json';

export function catalogUploadSecret(): string | null {
  const fromEnv = import.meta.env.VITE_CATALOG_UPLOAD_SECRET;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim();
  return null;
}

function normalizeServerCatalog(raw: unknown): CatalogSnapshot {
  if (!raw || typeof raw !== 'object') return buildEmptyCatalog();
  const o = raw as CatalogSnapshot;
  const tracks =
    o.tracks && typeof o.tracks === 'object' ? (o.tracks as Record<string, TrackDef>) : {};
  const playlists = Array.isArray(o.playlists) ? o.playlists : buildEmptyCatalog().playlists;
  return {
    version: Number(o.version) || 1,
    tracks,
    playlists,
    activePlaylistId: o.activePlaylistId || 'pl-main',
  };
}

/** Load master library from server (API merges static JSON + Redis overlay). */
export async function fetchServerCatalog(): Promise<CatalogSnapshot> {
  try {
    const res = await fetch(API_CATALOG, { cache: 'no-store' });
    if (res.ok) return normalizeServerCatalog(await res.json());
  } catch {
    /* offline or local dev */
  }
  try {
    const res = await fetch(STATIC_CATALOG, { cache: 'no-store' });
    if (res.ok) return normalizeServerCatalog(await res.json());
  } catch {
    /* */
  }
  return buildEmptyCatalog();
}

export async function uploadTrackToServer(
  file: File,
  meta: { title?: string; artist?: string },
): Promise<TrackDef> {
  const secret = catalogUploadSecret();
  if (!secret) {
    throw new Error('catalog_upload_unconfigured');
  }
  const res = await fetch('/api/catalog-upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Catalog-Secret': secret,
      'X-Track-Title': meta.title?.trim() || '',
      'X-Track-Artist': meta.artist?.trim() || '',
      'X-Filename': file.name,
    },
    body: file,
  });
  const data = (await res.json().catch(() => ({}))) as { track?: TrackDef; error?: string; message?: string };
  if (!res.ok) {
    const err = new Error(data.error || 'upload_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('upload_failed');
  return data.track;
}
