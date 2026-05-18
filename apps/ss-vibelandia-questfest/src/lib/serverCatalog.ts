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

/** Upload API host when www edge has no Blob env (FractiVerse pipe). */
const DEFAULT_CATALOG_PIPE = 'https://psw-vibelandia-sing13.vercel.app';

const STATIC_CATALOG = '/media/catalog/catalog.json';
const FETCH_MS = 8_000;

/** Legacy inline serverless cap — small audio may still use /api/catalog-upload. */
export const MAX_UPLOAD_BYTES = Math.floor(4.5 * 1024 * 1024);

export { MAX_MEDIA_UPLOAD_BYTES, MAX_VIDEO_DURATION_SEC };

export function catalogPipeOrigin(): string {
  const fromEnv = import.meta.env.VITE_CATALOG_PIPE_ORIGIN;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, '');
  if (typeof location === 'undefined') return '';
  const host = location.hostname.toLowerCase();
  if (host === 'www.ssvibelandiaquestfest24x365.com' || host === 'ssvibelandiaquestfest24x365.com') {
    return DEFAULT_CATALOG_PIPE;
  }
  return '';
}

export function catalogApiUrl(path: string): string {
  const base = catalogPipeOrigin();
  return base ? `${base}${path}` : path;
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
    normalizedTracks[id] = {
      ...tr,
      id: tr.id || id,
      serverHosted: true,
    };
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

/**
 * Live library from QUESTFEST (static manifest + dynamic API).
 * Same flow as mainstream streaming apps: catalog lives on the server.
 */
export async function fetchLiveCatalog(): Promise<CatalogSnapshot> {
  const staticRaw = await fetchJsonWithTimeout(STATIC_CATALOG, FETCH_MS);
  let catalog = staticRaw ? normalizeServerCatalog(staticRaw) : buildEmptyCatalog();

  const pipe = catalogPipeOrigin();
  const apiUrl = pipe ? `${pipe}/api/catalog` : '/api/catalog';
  const apiRaw = await fetchJsonWithTimeout(apiUrl, FETCH_MS);
  if (apiRaw) {
    catalog = mergeCatalogSnapshots(catalog, normalizeServerCatalog(apiRaw));
  }

  return catalog;
}

export type UploadTrackResult = {
  track: TrackDef;
  catalog?: CatalogSnapshot;
};

export type UploadTrackOptions = {
  onProgress?: (line: string) => void;
};

function safeFilename(name: string): string {
  return name.replace(/[^\w.\-()+ ]/g, '_') || 'upload.bin';
}

/** Direct browser → Blob (videos / large files). */
async function uploadViaBlobClient(
  file: File,
  meta: { title?: string; artist?: string },
  secret: string,
  opts?: UploadTrackOptions,
): Promise<UploadTrackResult> {
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

  opts?.onProgress?.('Connecting to QUESTFEST storage…');

  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: catalogApiUrl('/api/catalog-upload-client'),
    clientPayload: JSON.stringify({
      trackId,
      filename: file.name,
      title,
      artist,
    }),
    headers: {
      'X-Catalog-Secret': secret,
    },
    multipart: file.size > 15 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => {
      opts?.onProgress?.(`Uploading… ${Math.round(percentage)}%`);
    },
  });

  opts?.onProgress?.('Registering in catalog…');

  const res = await fetch(catalogApiUrl('/api/catalog-register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-Secret': secret,
    },
    body: JSON.stringify({
      trackId,
      url: blob.url,
      contentType: file.type || 'application/octet-stream',
      title,
      artist,
      filename: file.name,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'upload_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('upload_failed');
  return { track: data.track };
}

/** Small audio through serverless (optional fast path). */
async function uploadViaServerless(
  file: File,
  meta: { title?: string; artist?: string },
  secret: string,
): Promise<UploadTrackResult> {
  const title = meta.title?.trim() || '';
  const artist = meta.artist?.trim() || '';

  const res = await fetch(catalogApiUrl('/api/catalog-upload'), {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Catalog-Secret': secret,
      'X-Track-Title': title,
      'X-Track-Artist': artist,
      'X-Filename': file.name,
    },
    body: file,
  });

  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    catalog?: CatalogSnapshot;
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'upload_failed') as Error & { code?: string };
    err.code = data.error;
    throw err;
  }
  if (!data.track?.src) throw new Error('upload_failed');
  return { track: data.track, catalog: data.catalog };
}

export async function uploadTrackToServer(
  file: File,
  meta: { title?: string; artist?: string },
  opts?: UploadTrackOptions,
): Promise<UploadTrackResult> {
  const secret = catalogUploadSecret();
  if (!secret) {
    const err = new Error('catalog_upload_unconfigured') as Error & { code?: string };
    err.code = 'catalog_upload_unconfigured';
    throw err;
  }

  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(file.name);
  const useBlobClient = isVideo || file.size > MAX_UPLOAD_BYTES;

  if (useBlobClient) {
    return uploadViaBlobClient(file, meta, secret, opts);
  }

  opts?.onProgress?.(`Uploading ${file.name}…`);
  return uploadViaServerless(file, meta, secret);
}
