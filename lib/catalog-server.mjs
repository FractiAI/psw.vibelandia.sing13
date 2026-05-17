/**
 * Server-side catalog — static manifest + optional Upstash overlay (Vercel Blob URLs).
 */
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';

export const CATALOG_REDIS_KEY = 'qv:catalog:v1';
export const STATIC_CATALOG_PATH = '/media/catalog/catalog.json';

const ENV_KEYS = ['CATALOG_UPLOAD_SECRET', 'QUESTFEST_CATALOG_UPLOAD_SECRET'];

export function getCatalogUploadSecret() {
  for (const key of ENV_KEYS) {
    const raw = process.env[key];
    if (raw == null) continue;
    const t = String(raw).trim();
    if (t.length >= 8) return t;
  }
  return null;
}

export function catalogUploadConfigured() {
  return !!(getCatalogUploadSecret() && process.env.BLOB_READ_WRITE_TOKEN);
}

export function requestOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (host) return `${proto}://${host}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function fetchStaticCatalog(origin) {
  const url = `${origin.replace(/\/$/, '')}${STATIC_CATALOG_PATH}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export function normalizeCatalog(raw) {
  if (!raw || typeof raw !== 'object') return emptyCatalog();
  const tracks = raw.tracks && typeof raw.tracks === 'object' ? raw.tracks : {};
  const playlists = Array.isArray(raw.playlists) ? raw.playlists : [];
  return {
    version: Number(raw.version) || 1,
    tracks,
    playlists,
    activePlaylistId: raw.activePlaylistId || 'pl-main',
  };
}

export function emptyCatalog() {
  return {
    version: 1,
    tracks: {},
    playlists: [
      {
        id: 'pl-main',
        name: 'Sonic Singularity · Master Library',
        kind: 'sovereign',
        description: 'Server-hosted catalog — Reno Swamp Beats Caliente.',
        trackIds: [],
      },
    ],
    activePlaylistId: 'pl-main',
  };
}

/** Static manifest wins on id conflict; overlay adds/updates dynamic uploads. */
export function mergeCatalogSnapshots(base, overlay) {
  const a = normalizeCatalog(base);
  const b = overlay ? normalizeCatalog(overlay) : null;
  if (!b) return a;

  const tracks = { ...a.tracks, ...b.tracks };
  const byId = new Map(a.playlists.map((p) => [p.id, { ...p, trackIds: [...p.trackIds] }]));

  for (const p of b.playlists) {
    if (p.id === 'pl-main') continue;
    if (!byId.has(p.id)) byId.set(p.id, { ...p, trackIds: [...p.trackIds] });
  }

  const master = byId.get('pl-main') || a.playlists[0];
  const masterIds = new Set(master.trackIds);
  for (const id of Object.keys(tracks)) {
    if (!masterIds.has(id)) master.trackIds.push(id);
  }
  byId.set('pl-main', master);

  return {
    version: Math.max(a.version, b.version),
    tracks,
    playlists: [...byId.values()],
    activePlaylistId: a.activePlaylistId || 'pl-main',
  };
}

export async function loadServerCatalog(req) {
  const origin = requestOrigin(req);
  const staticCatalog = normalizeCatalog(await fetchStaticCatalog(origin));
  if (!upstashConfigured()) return staticCatalog;
  const dynamic = await redisGetJson(CATALOG_REDIS_KEY);
  if (!dynamic) return staticCatalog;
  return mergeCatalogSnapshots(staticCatalog, dynamic);
}

export async function saveDynamicCatalog(catalog) {
  if (!upstashConfigured()) return false;
  await redisSetJson(CATALOG_REDIS_KEY, normalizeCatalog(catalog));
  return true;
}

export function assertCatalogUploadAuth(req) {
  const secret = getCatalogUploadSecret();
  if (!secret) {
    return { ok: false, status: 503, code: 'catalog_upload_unconfigured' };
  }
  const header = String(req.headers['x-catalog-secret'] || req.headers['x-catalog-upload-secret'] || '');
  if (header !== secret) {
    return { ok: false, status: 401, code: 'unauthorized' };
  }
  return { ok: true };
}
