import { upload } from '@vercel/blob/client';
import { buildEmptyCatalog } from '@/lib/catalogSeed';
import { expectedCaptainPassword } from '@/lib/captainAuth';
import { fetchJsonWithTimeout } from '@/lib/fetchWithTimeout';
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SEC,
  probeVideoDurationSec,
} from '@/lib/mediaUploadLimits';
import type { CatalogSnapshot, TrackDef } from '@/lib/catalogTypes';

const STATIC_CATALOG = '/media/catalog/catalog.json';
const FETCH_MS = 2_500;
const UPLOAD_API = '/api/catalog-upload';
const TRACK_API = '/api/catalog-track';

export const MAX_UPLOAD_BYTES = Math.floor(4.5 * 1024 * 1024);
export { MAX_MEDIA_UPLOAD_BYTES, MAX_VIDEO_DURATION_SEC };

/** Same-origin `/api/catalog-*` unless `VITE_CATALOG_PIPE_ORIGIN` overrides (dev only). */
export function catalogPipeOrigin(): string {
  const fromEnv = import.meta.env.VITE_CATALOG_PIPE_ORIGIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, '');
  return '';
}

export function catalogApiUrl(path: string): string {
  const base = catalogPipeOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export function catalogUploadSecret(): string {
  const upload = import.meta.env.VITE_CATALOG_UPLOAD_SECRET;
  if (typeof upload === 'string' && upload.trim().length >= 8) return upload.trim();
  const captain = import.meta.env.VITE_CAPTAIN_BYPASS_PASSWORD;
  if (typeof captain === 'string' && captain.trim().length >= 8) return captain.trim();
  const edgeDefault = expectedCaptainPassword();
  if (edgeDefault.length >= 8) return edgeDefault;
  return '';
}

export function isServerUploadConfigured(): boolean {
  return catalogUploadSecret().length >= 8;
}

function normalizeServerCatalog(raw: unknown): CatalogSnapshot {
  if (!raw || typeof raw !== 'object') return buildEmptyCatalog();
  const o = raw as CatalogSnapshot;
  const tracks =
    o.tracks && typeof o.tracks === 'object' ? (o.tracks as Record<string, TrackDef>) : {};
  const playlists = Array.isArray(o.playlists) ? o.playlists : buildEmptyCatalog().playlists;
  const normalizedTracks: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(tracks)) {
    normalizedTracks[id] = { ...tr, id: tr.id || id, serverHosted: true };
  }
  return {
    version: Number(o.version) || 1,
    tracks: normalizedTracks,
    playlists,
    activePlaylistId: o.activePlaylistId || 'pl-main',
  };
}

export function mergeCatalogSnapshots(a: CatalogSnapshot, b: CatalogSnapshot): CatalogSnapshot {
  const tracks = { ...a.tracks, ...b.tracks };
  const byId = new Map(a.playlists.map((p) => [p.id, { ...p, trackIds: [...p.trackIds] }]));
  for (const p of b.playlists) {
    if (p.id === 'pl-main') continue;
    if (!byId.has(p.id)) byId.set(p.id, { ...p, trackIds: [...p.trackIds] });
  }
  const master = byId.get('pl-main') ?? a.playlists[0];
  if (master) {
    const ids = new Set(master.trackIds);
    for (const id of Object.keys(tracks)) {
      if (!ids.has(id)) master.trackIds.push(id);
    }
    byId.set('pl-main', master);
  }
  return {
    version: Math.max(a.version, b.version),
    tracks,
    playlists: [...byId.values()],
    activePlaylistId: a.activePlaylistId || b.activePlaylistId || 'pl-main',
  };
}

export async function fetchLiveCatalog(): Promise<CatalogSnapshot> {
  const pipe = catalogPipeOrigin();
  const apiUrl = pipe ? `${pipe}/api/catalog` : '/api/catalog';
  const [staticRaw, apiRaw] = await Promise.all([
    fetchJsonWithTimeout(STATIC_CATALOG, FETCH_MS),
    fetchJsonWithTimeout(apiUrl, FETCH_MS),
  ]);
  let catalog = staticRaw ? normalizeServerCatalog(staticRaw) : buildEmptyCatalog();
  if (apiRaw) catalog = mergeCatalogSnapshots(catalog, normalizeServerCatalog(apiRaw));
  return catalog;
}

export type UploadTrackResult = { track: TrackDef };
export type UploadTrackOptions = { onProgress?: (line: string) => void };

function safeFilename(name: string): string {
  return name.replace(/[^\w.\-()+ ]/g, '_') || 'upload.bin';
}

function uploadErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'upload_failed';
  const msg = err.message || 'upload_failed';
  if (/catalog_upload_unconfigured|blob_store|upload_token_failed|BLOB_READ_WRITE/i.test(msg)) {
    return 'catalog_upload_unconfigured';
  }
  if (/load failed|failed to fetch|networkerror|network error|deployment.not_found|not found on vercel/i.test(msg)) {
    return 'upload_connection_failed';
  }
  return msg;
}

async function postCatalogJson(
  apiPath: string,
  secret: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return fetch(catalogApiUrl(apiPath), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': secret,
    },
    body: JSON.stringify(body),
  });
}

async function registerUploadedTrack(
  secret: string,
  payload: {
    trackId: string;
    url: string;
    contentType: string;
    title: string;
    artist: string;
    filename: string;
    description?: string;
    genre?: string;
    durationSec?: number;
  },
): Promise<TrackDef> {
  const res = await postCatalogJson(UPLOAD_API, secret, { action: 'register', ...payload });
  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'register_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('register_failed');
  return data.track;
}

/** All uploads: browser → Blob, then register (works for audio + video up to 10 min). */
export type TrackMetadataPatch = {
  title?: string;
  artist?: string;
  genre?: string;
  description?: string;
  durationSec?: number;
  playlistIds?: string[];
};

export async function updateTrackOnServer(
  trackId: string,
  patch: TrackMetadataPatch,
): Promise<TrackDef> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');

  const res = await postCatalogJson(TRACK_API, secret, {
    action: 'update',
    trackId,
    ...patch,
  });
  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'update_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('update_failed');
  return data.track;
}

export async function deleteTrackOnServer(trackId: string): Promise<void> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');

  const res = await postCatalogJson(TRACK_API, secret, { action: 'delete', trackId });
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'delete_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
}

export async function uploadTrackToServer(
  file: File,
  meta: { title?: string; artist?: string; description?: string; genre?: string },
  opts?: UploadTrackOptions,
): Promise<UploadTrackResult> {
  const secret = catalogUploadSecret();
  if (!secret) {
    const err = new Error('catalog_upload_unconfigured') as Error & { code?: string };
    err.code = 'catalog_upload_unconfigured';
    throw err;
  }

  const durationSec = await probeVideoDurationSec(file);
  if (durationSec !== null && durationSec > MAX_VIDEO_DURATION_SEC) {
    const err = new Error('video_too_long') as Error & { code?: string };
    err.code = 'video_too_long';
    throw err;
  }
  if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
    const err = new Error('file_too_large') as Error & { code?: string };
    err.code = 'file_too_large';
    throw err;
  }

  const trackId = `trk-srv-${crypto.randomUUID()}`;
  const pathname = `catalog/${trackId}-${safeFilename(file.name)}`;
  const title = meta.title?.trim() || '';
  const artist = meta.artist?.trim() || '';
  const description = meta.description?.trim().slice(0, 1000) || undefined;
  const genre = meta.genre?.trim().slice(0, 80) || undefined;
  const storedDuration =
    durationSec != null && durationSec > 0 ? Math.round(durationSec) : undefined;

  opts?.onProgress?.('Uploading to QUESTFEST…');

  let blob;
  try {
    blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: catalogApiUrl(UPLOAD_API),
      clientPayload: JSON.stringify({ trackId, filename: file.name, title, artist }),
      headers: { 'X-Catalog-Secret': secret },
      multipart: file.size > 15 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => {
        opts?.onProgress?.(`Uploading… ${Math.round(percentage)}%`);
      },
    });
  } catch (e) {
    const code = uploadErrorMessage(e);
    const err = new Error(code) as Error & { code?: string };
    err.code = code;
    throw err;
  }

  opts?.onProgress?.('Saving to catalog…');
  const track = await registerUploadedTrack(secret, {
    trackId,
    url: blob.url,
    contentType: file.type || 'application/octet-stream',
    title,
    artist,
    filename: file.name,
    description,
    genre,
    durationSec: storedDuration,
  });
  return {
    track: {
      ...track,
      ...(description ? { description } : {}),
      ...(genre ? { genre } : {}),
      ...(storedDuration != null ? { durationSec: storedDuration } : {}),
    },
  };
}
