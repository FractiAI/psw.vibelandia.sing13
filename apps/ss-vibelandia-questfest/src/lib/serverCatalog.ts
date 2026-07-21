import { upload } from '@vercel/blob/client';
import { buildEmptyCatalog, isMasterPlaylist, isMyLikesPlaylist } from '@/lib/catalogSeed';
import { expectedCaptainPassword } from '@/lib/captainAuth';
import { fetchJsonWithTimeout } from '@/lib/fetchWithTimeout';
import { isIOSDevice } from '@/lib/devicePlayback';
import {
  isAudioFile,
  isVideoFile,
  MAX_MEDIA_UPLOAD_BYTES,
  probeAudioDurationSecWithTimeout,
} from '@/lib/mediaUploadLimits';
import { normalizeCoverForUpload } from '@/lib/coverImageFile';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';

const STATIC_CATALOG = '/media/catalog/catalog.json';
const FETCH_MS = 2_500;
/** After uploads — allow slower catalog manifest on mobile networks. */
const SYNC_FETCH_MS = 15_000;
const UPLOAD_API = '/api/catalog-upload';
const TRACK_API = '/api/catalog-track';
const PLAYLIST_API = '/api/catalog-playlist';

export const MAX_UPLOAD_BYTES = Math.floor(4.5 * 1024 * 1024);
export { MAX_MEDIA_UPLOAD_BYTES };

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
    // Upsert shared user playlists so track-list edits from the server replace stale local copies.
    byId.set(p.id, { ...p, trackIds: [...p.trackIds] });
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

async function fetchLiveCatalogWithTimeout(timeoutMs: number): Promise<CatalogSnapshot> {
  const pipe = catalogPipeOrigin();
  const apiUrl = pipe ? `${pipe}/api/catalog` : '/api/catalog';
  const [staticRaw, apiRaw] = await Promise.all([
    fetchJsonWithTimeout(STATIC_CATALOG, timeoutMs),
    fetchJsonWithTimeout(apiUrl, timeoutMs),
  ]);
  let catalog = staticRaw ? normalizeServerCatalog(staticRaw) : buildEmptyCatalog();
  if (apiRaw) catalog = mergeCatalogSnapshots(catalog, normalizeServerCatalog(apiRaw));
  return catalog;
}

export async function fetchLiveCatalog(): Promise<CatalogSnapshot> {
  return fetchLiveCatalogWithTimeout(FETCH_MS);
}

export async function fetchLiveCatalogForSync(): Promise<CatalogSnapshot> {
  return fetchLiveCatalogWithTimeout(SYNC_FETCH_MS);
}

export type ReconcileServerCatalogResult = {
  ok: boolean;
  before: number;
  after: number;
  indexRecovered: number;
  blobRecovered: number;
  masterTrackIds: number;
};

const RECONCILE_FETCH_MS = 300_000;

/** Repair server manifest from upload index + orphan blobs (after bulk uploads). */
export async function reconcileServerCatalog(opts?: {
  includeBlobOrphans?: boolean;
}): Promise<ReconcileServerCatalogResult> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');

  const res = await postCatalogJson(
    '/api/catalog-reconcile',
    secret,
    { includeBlobOrphans: opts?.includeBlobOrphans !== false },
    RECONCILE_FETCH_MS,
  );
  const data = (await res.json().catch(() => ({}))) as ReconcileServerCatalogResult & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw catalogApiError(data.error || 'reconcile_failed', data.message);
  }
  return {
    ok: true,
    before: Number(data.before) || 0,
    after: Number(data.after) || 0,
    indexRecovered: Number(data.indexRecovered) || 0,
    blobRecovered: Number(data.blobRecovered) || 0,
    masterTrackIds: Number(data.masterTrackIds) || Number(data.after) || 0,
  };
}

export type UploadTrackResult = { track: TrackDef };
export type UploadTrackOptions = {
  onProgress?: (line: string) => void;
  /** Skip metadata probe during large batch imports (faster; duration filled later). */
  skipDurationProbe?: boolean;
};

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

function catalogApiError(code: string, message?: string): Error & { code: string } {
  const err = new Error(message || code) as Error & { code: string };
  err.code = code;
  return err;
}

const REGISTER_FETCH_MS = 90_000;

async function postCatalogJson(
  apiPath: string,
  secret: string,
  body: Record<string, unknown>,
  timeoutMs = REGISTER_FETCH_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(catalogApiUrl(apiPath), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Catalog-Secret': secret,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw catalogApiError('upload_connection_failed', 'Catalog register timed out — retry.');
    }
    throw catalogApiError('upload_connection_failed');
  } finally {
    window.clearTimeout(timer);
  }
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
  let lastErr: (Error & { code?: string }) | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await postCatalogJson(UPLOAD_API, secret, { action: 'register', ...payload });
    const data = (await res.json().catch(() => ({}))) as {
      track?: TrackDef;
      error?: string;
      message?: string;
    };
    if (res.ok && data.track?.src) return data.track;
    const msg = data.message || data.error || 'register_failed';
    lastErr = catalogApiError(data.error || 'register_failed', msg);
    if (res.status !== 503 && res.status !== 500) break;
    await new Promise((r) => window.setTimeout(r, 400 * (attempt + 1)));
  }
  throw lastErr ?? catalogApiError('register_failed');
}

/** All uploads: browser → Blob, then register (works for audio + video up to 10 min). */
export type TrackMetadataPatch = {
  title?: string;
  artist?: string;
  genre?: string;
  description?: string;
  durationSec?: number;
  playlistIds?: string[];
  posterSrc?: string;
};

export type UpdateTrackOnServerResult = {
  track: TrackDef;
  catalog?: CatalogSnapshot;
};

export async function updateTrackOnServer(
  trackId: string,
  patch: TrackMetadataPatch,
): Promise<UpdateTrackOnServerResult> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');

  const res = await postCatalogJson(TRACK_API, secret, {
    action: 'update',
    trackId,
    ...patch,
  });
  const data = (await res.json().catch(() => ({}))) as {
    track?: TrackDef;
    catalog?: CatalogSnapshot;
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    const msg = data.message || data.error || 'update_failed';
    throw catalogApiError(data.error || 'update_failed', msg);
  }
  const track = data.track;
  if (!track?.id) throw catalogApiError('update_failed');
  const src = String(track.src || '').trim();
  const videoSrc = String(track.videoSrc || '').trim();
  if (!src && !videoSrc) throw catalogApiError('update_failed');
  return { track: { ...track, src: src || videoSrc }, catalog: data.catalog };
}

/** Same ceiling as catalog client blob uploads (standard phone/camera photos). */
export const COVER_MAX_BYTES = 80 * 1024 * 1024;

/** Upload cover image to Blob (JPEG/PNG/WebP; large sources are resized client-side). */
export async function uploadCoverBlob(
  trackId: string,
  file: File,
  opts?: { onProgress?: (message: string) => void },
): Promise<string> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');
  let uploadFile: File;
  try {
    uploadFile = await normalizeCoverForUpload(file);
  } catch (e) {
    const code = e instanceof Error ? e.message : 'cover_not_image';
    if (code === 'cover_too_large' || code === 'cover_not_image') throw catalogApiError(code);
    throw catalogApiError('cover_not_image');
  }

  const ext =
    uploadFile.type === 'image/png'
      ? 'png'
      : uploadFile.type === 'image/webp'
        ? 'webp'
        : 'jpg';
  const pathname = `catalog/covers/${trackId}.${ext}`;

  opts?.onProgress?.('Uploading cover…');

  const blob = await upload(pathname, uploadFile, {
    access: 'public',
    handleUploadUrl: catalogApiUrl(UPLOAD_API),
    headers: { 'X-Catalog-Secret': secret },
    clientPayload: JSON.stringify({ allowOverwrite: true }),
    onUploadProgress: ({ percentage }) => {
      opts?.onProgress?.(`Uploading cover… ${Math.round(percentage)}%`);
    },
  });

  return blob.url;
}

/** Upload playlist cover image to Blob (same pipeline as track covers). */
export async function uploadPlaylistCoverBlob(
  playlistId: string,
  file: File,
  opts?: { onProgress?: (message: string) => void },
): Promise<string> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');
  let uploadFile: File;
  try {
    uploadFile = await normalizeCoverForUpload(file);
  } catch (e) {
    const code = e instanceof Error ? e.message : 'cover_not_image';
    if (code === 'cover_too_large' || code === 'cover_not_image') throw catalogApiError(code);
    throw catalogApiError('cover_not_image');
  }

  const ext =
    uploadFile.type === 'image/png'
      ? 'png'
      : uploadFile.type === 'image/webp'
        ? 'webp'
        : 'jpg';
  const pathname = `catalog/playlist-covers/${playlistId}.${ext}`;

  opts?.onProgress?.('Uploading cover…');

  const blob = await upload(pathname, uploadFile, {
    access: 'public',
    handleUploadUrl: catalogApiUrl(UPLOAD_API),
    headers: { 'X-Catalog-Secret': secret },
    clientPayload: JSON.stringify({ allowOverwrite: true }),
    onUploadProgress: ({ percentage }) => {
      opts?.onProgress?.(`Uploading cover… ${Math.round(percentage)}%`);
    },
  });

  return blob.url;
}

/** @deprecated Use uploadCoverBlob + updateTrackOnServer */
export const uploadTrackCover = uploadCoverBlob;

export async function deleteTrackOnServer(trackId: string): Promise<void> {
  const result = await deleteTracksOnServer([trackId]);
  if (!result.removed.includes(trackId) && result.missing.includes(trackId)) {
    const err = new Error('track_not_found') as Error & { code?: string };
    err.code = 'track_not_found';
    throw err;
  }
  if (!result.removed.includes(trackId) && result.error) {
    const err = new Error(result.error) as Error & { code?: string };
    err.code = result.error;
    throw err;
  }
}

export type DeleteTracksOnServerResult = {
  removed: string[];
  missing: string[];
  error?: string;
  message?: string;
};

const DELETE_MANY_FETCH_MS = 120_000;

export async function deleteTracksOnServer(trackIds: string[]): Promise<DeleteTracksOnServerResult> {
  const secret = catalogUploadSecret();
  if (!secret) throw new Error('catalog_upload_unconfigured');

  const unique = [...new Set(trackIds.filter(Boolean))];
  if (!unique.length) return { removed: [], missing: [] };

  if (unique.length === 1) {
    const trackId = unique[0]!;
    const res = await postCatalogJson(TRACK_API, secret, { action: 'delete', trackId }, DELETE_MANY_FETCH_MS);
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      removed?: string[];
      missing?: string[];
    };
    if (!res.ok) {
      return {
        removed: [],
        missing: unique,
        error: data.error || data.message || 'delete_failed',
        message: data.message,
      };
    }
    return {
      removed: data.removed?.length ? data.removed : [trackId],
      missing: data.missing ?? [],
    };
  }

  let last: DeleteTracksOnServerResult = { removed: [], missing: unique, error: 'delete_failed' };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await postCatalogJson(
      TRACK_API,
      secret,
      { action: 'delete_many', trackIds: unique },
      DELETE_MANY_FETCH_MS,
    );
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      removed?: string[];
      missing?: string[];
    };
    if (res.ok) {
      return {
        removed: Array.isArray(data.removed) ? data.removed : [],
        missing: Array.isArray(data.missing) ? data.missing : [],
      };
    }
    last = {
      removed: Array.isArray(data.removed) ? data.removed! : [],
      missing: Array.isArray(data.missing) ? data.missing! : unique,
      error: data.error || data.message || 'delete_failed',
      message: data.message,
    };
    if (res.status !== 503 && res.status !== 500) break;
    await new Promise((r) => window.setTimeout(r, 500 * (attempt + 1)));
  }
  return last;
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

  if (isVideoFile(file)) {
    const err = new Error('video_not_allowed') as Error & { code?: string };
    err.code = 'video_not_allowed';
    throw err;
  }
  if (!isAudioFile(file)) {
    const err = new Error('not_audio') as Error & { code?: string };
    err.code = 'not_audio';
    throw err;
  }
  const durationSec =
    opts?.skipDurationProbe || isIOSDevice()
      ? null
      : await probeAudioDurationSecWithTimeout(file, 8_000);
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
      clientPayload: JSON.stringify({ trackId, filename: file.name, title, artist, allowOverwrite: true }),
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

export async function syncUserPlaylistsToServer(
  playlists: PlaylistDef[],
  opts?: { deleteIds?: string[] },
): Promise<void> {
  const secret = catalogUploadSecret();
  if (!secret) return;

  const shared = playlists
    .filter((p) => !isMasterPlaylist(p.id) && !isMyLikesPlaylist(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      description: p.description,
      posterSrc: p.posterSrc,
      trackIds: p.trackIds,
      childPlaylistIds: p.childPlaylistIds,
    }));

  const res = await postCatalogJson(PLAYLIST_API, secret, {
    action: 'sync',
    playlists: shared,
    deleteIds: opts?.deleteIds?.length ? opts.deleteIds : undefined,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw catalogApiError(data.error || 'playlist_sync_failed', data.message);
  }
}
