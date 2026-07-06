/**
 * Server-side catalog — static manifest + dynamic overlay (Upstash and/or Vercel Blob JSON).
 */
import { del, list, put } from '@vercel/blob';
import { redisGetJson, redisLpush, redisLrange, redisSadd, redisSismember, redisSetJson, upstashConfigured } from './upstash.mjs';

export const CATALOG_REDIS_KEY = 'qv:catalog:v1';
/** Append-only upload log — recovers tracks lost to concurrent manifest writes. */
export const CATALOG_TRACK_INDEX_KEY = 'qv:catalog:track-index:v1';
/** Track ids intentionally deleted — skip index reconcile re-adding them. */
export const CATALOG_TRACK_DELETED_KEY = 'qv:catalog:track-deleted:v1';
export const BLOB_CATALOG_PATH = 'catalog/dynamic-catalog-v1.json';
export const STATIC_CATALOG_PATH = '/media/catalog/catalog.json';

/** Matches apps/ss-vibelandia-questfest captain default when env unset. */
export const EDGE_DEFAULT_CATALOG_SECRET = 'valetpru1!';

const ENV_KEYS = [
  'CATALOG_UPLOAD_SECRET',
  'QUESTFEST_CATALOG_UPLOAD_SECRET',
  'CAPTAIN_BYPASS_PASSWORD',
  'VITE_CAPTAIN_BYPASS_PASSWORD',
  'VITE_CATALOG_UPLOAD_SECRET',
];

export function getCatalogUploadSecret() {
  for (const key of ENV_KEYS) {
    const raw = process.env[key];
    if (raw == null) continue;
    const t = String(raw).trim();
    if (t.length >= 8) return t;
  }
  if (process.env.VERCEL || process.env.VERCEL_ENV) return EDGE_DEFAULT_CATALOG_SECRET;
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

async function loadDynamicCatalogFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: BLOB_CATALOG_PATH, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_CATALOG_PATH) ?? blobs[0];
    if (!hit?.url) return null;
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return normalizeCatalog(await res.json());
  } catch (e) {
    console.error('[catalog] blob manifest load', e);
    return null;
  }
}

/** Prefer newest overlay when both Upstash and Blob have manifests. */
export async function loadDynamicCatalog() {
  let redisCat = null;
  if (upstashConfigured()) {
    const dynamic = await redisGetJson(CATALOG_REDIS_KEY);
    if (dynamic) redisCat = normalizeCatalog(dynamic);
  }
  const blobCat = await loadDynamicCatalogFromBlob();
  let merged = null;
  if (redisCat && blobCat) {
    const rv = Number(redisCat.version) || 0;
    const bv = Number(blobCat.version) || 0;
    // Never merge unequal versions — old overlay was winning over fresh saves.
    if (bv > rv) merged = blobCat;
    else if (rv > bv) merged = redisCat;
    else merged = blobCat;
  } else {
    merged = redisCat || blobCat || null;
  }
  return mergeTrackIndexOverlay(merged);
}

/** Reconcile tracks from append-only Redis index (bulk-upload race recovery). */
async function mergeTrackIndexOverlay(catalog) {
  if (!upstashConfigured()) return catalog;
  let entries;
  try {
    entries = await redisLrange(CATALOG_TRACK_INDEX_KEY, 0, -1);
  } catch (e) {
    console.error('[catalog] track index read', e);
    return catalog;
  }
  if (!entries.length) return catalog;

  let next = catalog ? normalizeCatalog(catalog) : emptyCatalog();
  let changed = false;
  for (const raw of entries) {
    try {
      const row = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const track = row?.track;
      const id = track?.id || row?.id;
      if (!id || !track?.src || next.tracks[id]) continue;
      if (await redisSismember(CATALOG_TRACK_DELETED_KEY, id)) continue;
      next = appendTrackToDynamicCatalog(next, { ...track, id, serverHosted: true });
      changed = true;
    } catch {
      /* skip corrupt index row */
    }
  }
  if (changed) {
    try {
      await saveDynamicCatalog(next);
    } catch (e) {
      console.error('[catalog] track index reconcile save', e);
    }
  }
  return next;
}

/**
 * Persist one upload with read-verify-retry (serverless concurrent writes can clobber manifest).
 * @returns {{ ok: boolean, track?: object, message?: string }}
 */
export async function registerTrackPersistently(track, maxAttempts = 12) {
  const id = track?.id;
  if (!id) return { ok: false, message: 'invalid_track_id' };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dynamic = (await loadDynamicCatalog()) || emptyCatalog();
    if (dynamic.tracks?.[id]) {
      return { ok: true, track: dynamic.tracks[id] };
    }

    const next = appendTrackToDynamicCatalog(dynamic, track);
    const saved = await saveDynamicCatalog(next);
    if (!saved.ok) {
      return { ok: false, message: saved.message || 'catalog_save_failed' };
    }

    if (upstashConfigured()) {
      try {
        await redisLpush(CATALOG_TRACK_INDEX_KEY, JSON.stringify({ id, track }), 5000);
      } catch (e) {
        console.error('[catalog] track index append', id, e);
      }
    }

    const verify = await loadDynamicCatalog();
    if (verify?.tracks?.[id]) {
      return { ok: true, track: verify.tracks[id] };
    }

    await new Promise((r) => setTimeout(r, 60 * (attempt + 1)));
  }

  return { ok: false, message: 'catalog_register_retry_exhausted' };
}

async function markTracksDeletedInIndex(trackIds) {
  if (!upstashConfigured() || !trackIds?.length) return;
  try {
    await redisSadd(CATALOG_TRACK_DELETED_KEY, ...trackIds);
  } catch (e) {
    console.error('[catalog] track deleted index', e);
  }
}

/**
 * Remove many tracks in one manifest write (with verify-retry).
 * @param {string[]} trackIds
 * @param {(req?: unknown) => Promise<object|null>} [loadMergedCatalog]
 * @param {unknown} [req]
 */
export async function removeTracksPersistently(trackIds, loadMergedCatalog, req, maxAttempts = 10) {
  const ids = [...new Set((trackIds || []).map((id) => String(id).replace(/[^\w-]/g, '').slice(0, 80)).filter(Boolean))];
  if (!ids.length) return { ok: true, removed: [], missing: [] };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let dynamic = (await loadDynamicCatalog()) || emptyCatalog();

    if (loadMergedCatalog) {
      try {
        const merged = await loadMergedCatalog(req);
        for (const id of ids) {
          if (!dynamic.tracks[id] && merged?.tracks?.[id]) {
            dynamic = appendTrackToDynamicCatalog(dynamic, {
              ...merged.tracks[id],
              id,
              serverHosted: true,
            });
          }
        }
      } catch (e) {
        console.error('[catalog] delete merge hydrate', e);
      }
    }

    let next = dynamic;
    const removed = [];
    const missing = [];
    const blobTargets = [];

    for (const id of ids) {
      if (!next.tracks?.[id]) {
        missing.push(id);
        continue;
      }
      blobTargets.push(next.tracks[id]);
      next = removeDynamicTrack(next, id);
      if (next) removed.push(id);
    }

    if (!removed.length) {
      await markTracksDeletedInIndex(ids);
      return { ok: true, removed: [], missing: ids };
    }

    const saved = await saveDynamicCatalog(next);
    if (!saved.ok) {
      if (attempt === maxAttempts - 1) {
        return { ok: false, message: saved.message || 'catalog_save_failed', removed: [], missing: ids };
      }
      await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
      continue;
    }

    await markTracksDeletedInIndex(removed);

    for (const tr of blobTargets) {
      try {
        await deleteTrackMediaBlobs(tr);
      } catch (e) {
        console.error('[catalog] delete blob', tr?.id, e);
      }
    }

    const verify = await loadDynamicCatalog();
    const stillThere = removed.filter((id) => verify?.tracks?.[id]);
    if (!stillThere.length) {
      return { ok: true, removed, missing };
    }

    await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
  }

  return { ok: false, message: 'catalog_delete_retry_exhausted', removed: [], missing: ids };
}

/** Ensure a track from the merged server catalog exists in the dynamic overlay before patch/delete. */
export async function ensureDynamicTrack(req, trackId) {
  let dynamic = (await loadDynamicCatalog()) || emptyCatalog();
  if (dynamic.tracks?.[trackId]) return dynamic;
  const merged = await loadServerCatalog(req);
  const track = merged?.tracks?.[trackId];
  if (!track) return null;
  return appendTrackToDynamicCatalog(dynamic, { ...track, serverHosted: true });
}

export async function loadServerCatalog(req) {
  const origin = requestOrigin(req);
  const staticCatalog = normalizeCatalog(await fetchStaticCatalog(origin));
  const dynamic = await loadDynamicCatalog();
  if (!dynamic) return staticCatalog;
  return mergeCatalogSnapshots(staticCatalog, dynamic);
}

/** Append one server-hosted track to the dynamic overlay only (no static manifest fetch). */
export function appendTrackToDynamicCatalog(dynamic, track) {
  const base = dynamic ? normalizeCatalog(dynamic) : emptyCatalog();
  const tracks = { ...base.tracks, [track.id]: track };
  const playlists = base.playlists.map((p) => {
    if (p.id !== 'pl-main') return p;
    const ids = p.trackIds.includes(track.id) ? p.trackIds : [...p.trackIds, track.id];
    return { ...p, trackIds: ids };
  });
  return {
    ...base,
    tracks,
    playlists,
    activePlaylistId: base.activePlaylistId || 'pl-main',
    version: Math.max(Number(base.version) || 1, 1) + 1,
  };
}

const TRACK_DESCRIPTION_MAX = 1000;
const TRACK_GENRE_MAX = 80;

function clampText(text, max) {
  const t = text == null ? '' : String(text).trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

/** Patch metadata on one dynamic track; returns next catalog or null if missing. */
export function patchDynamicTrack(catalog, trackId, patch) {
  const base = catalog ? normalizeCatalog(catalog) : null;
  if (!base?.tracks?.[trackId]) return null;

  const prev = base.tracks[trackId];
  const title = patch.title !== undefined ? clampText(patch.title, 200) || prev.title : prev.title;
  const artist = patch.artist !== undefined ? clampText(patch.artist, 200) || prev.artist : prev.artist;
  const description =
    patch.description !== undefined ? clampText(patch.description, TRACK_DESCRIPTION_MAX) : prev.description;
  const genre = patch.genre !== undefined ? clampText(patch.genre, TRACK_GENRE_MAX) : prev.genre;
  const durationSec =
    patch.durationSec !== undefined && Number.isFinite(Number(patch.durationSec))
      ? Math.max(0, Math.min(86400, Math.round(Number(patch.durationSec))))
      : prev.durationSec;
  const src =
    patch.src !== undefined && String(patch.src).trim()
      ? String(patch.src).trim().slice(0, 2048)
      : prev.src;
  const posterSrc =
    patch.posterSrc !== undefined
      ? patch.posterSrc
        ? String(patch.posterSrc).trim().slice(0, 2048)
        : undefined
      : prev.posterSrc;

  const nextTrack = {
    ...prev,
    title,
    artist,
    src,
    ...(description ? { description } : {}),
    ...(genre ? { genre } : {}),
    ...(durationSec != null ? { durationSec } : {}),
    ...(posterSrc ? { posterSrc } : {}),
  };
  if (!description) delete nextTrack.description;
  if (!genre) delete nextTrack.genre;
  if (!posterSrc) delete nextTrack.posterSrc;
  if (patch.clearVideo) delete nextTrack.videoSrc;

  const tracks = { ...base.tracks, [trackId]: nextTrack };
  return { ...base, tracks, version: Math.max(Number(base.version) || 1, 1) + 1 };
}

/** userPlaylistIds = non–pl-main playlist ids that should include this track. */
export function setDynamicTrackPlaylistMembership(catalog, trackId, userPlaylistIds) {
  const base = catalog ? normalizeCatalog(catalog) : null;
  if (!base?.tracks?.[trackId]) return null;
  const allowed = new Set(Array.isArray(userPlaylistIds) ? userPlaylistIds : []);

  const playlists = base.playlists.map((p) => {
    if (p.id === 'pl-main') return p;
    const has = p.trackIds.includes(trackId);
    const should = allowed.has(p.id);
    if (has === should) return p;
    if (should) return { ...p, trackIds: [...p.trackIds, trackId] };
    return { ...p, trackIds: p.trackIds.filter((t) => t !== trackId) };
  });

  return { ...base, playlists, version: Math.max(Number(base.version) || 1, 1) + 1 };
}

export function blobPathnameFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes('blob.vercel-storage.com')) return null;
    return decodeURIComponent(u.pathname.replace(/^\//, ''));
  } catch {
    return null;
  }
}

/** Remove catalog media blobs for a track (best-effort; frees Blob quota). */
export async function deleteTrackMediaBlobs(track) {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !track) {
    return { ok: false, deleted: 0, reason: 'blob_not_configured' };
  }

  const pathSet = new Set();
  for (const url of [track.src, track.videoSrc, track.posterSrc]) {
    const p = blobPathnameFromUrl(url);
    if (p) pathSet.add(p);
  }

  if (track.id) {
    try {
      let cursor;
      do {
        const page = await list({ prefix: `catalog/${track.id}`, cursor, limit: 200 });
        for (const b of page.blobs) {
          if (b.pathname) pathSet.add(b.pathname);
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch (e) {
      console.error('[catalog] blob list for delete', track.id, e);
    }
  }

  const paths = [...pathSet];
  if (!paths.length) return { ok: true, deleted: 0 };

  try {
    await del(paths);
    return { ok: true, deleted: paths.length };
  } catch (e) {
    console.error('[catalog] blob delete track media', track.id, e);
    return { ok: false, deleted: 0, reason: e?.message || 'blob_delete_failed' };
  }
}

export function removeDynamicTrack(catalog, trackId) {
  const base = catalog ? normalizeCatalog(catalog) : null;
  if (!base?.tracks?.[trackId]) return null;
  const { [trackId]: _, ...tracks } = base.tracks;
  const playlists = base.playlists.map((p) => ({
    ...p,
    trackIds: p.trackIds.filter((t) => t !== trackId),
  }));
  return {
    ...base,
    tracks,
    playlists,
    version: Math.max(Number(base.version) || 1, 1) + 1,
  };
}

/** @returns {{ ok: boolean, message?: string }} */
export async function saveDynamicCatalog(catalog) {
  const normalized = normalizeCatalog(catalog);
  let redisOk = !upstashConfigured();
  let blobOk = !process.env.BLOB_READ_WRITE_TOKEN;
  const parts = [];

  if (upstashConfigured()) {
    redisOk = await redisSetJson(CATALOG_REDIS_KEY, normalized);
    if (!redisOk) {
      console.error('[catalog] redis SET failed for dynamic catalog');
      parts.push('Upstash Redis could not save the catalog manifest.');
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(BLOB_CATALOG_PATH, JSON.stringify(normalized), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
      blobOk = true;
    } catch (e) {
      console.error('[catalog] blob catalog save', e);
      blobOk = false;
      parts.push(e?.message ? `Vercel Blob: ${e.message}` : 'Vercel Blob put failed.');
    }
  } else {
    parts.push('BLOB_READ_WRITE_TOKEN is not set on this deployment.');
  }

  const ok = redisOk || blobOk;
  return {
    ok,
    message: ok
      ? undefined
      : parts.join(' ') || 'Catalog manifest could not be persisted.',
  };
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
