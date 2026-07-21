import { list, put } from '@vercel/blob';
import { redisGet, redisIncr, upstashConfigured } from './upstash.mjs';

const PREFIX = 'qv:pv:';
const BLOB_PREFIX = 'page-views/';

const memStore = globalThis.__qvPageViews || (globalThis.__qvPageViews = new Map());

function blobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Canonical page key — pathname plus stable query/hash segments.
 * Collapses jukebox entry URLs so / and /interfaces/questfest-bridge share counts.
 */
export function normalizePageKey(raw) {
  if (!raw || typeof raw !== 'string') return '/';
  let s = raw.trim().slice(0, 240);
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      s = u.pathname + u.search + u.hash;
    }
  } catch {
    /* keep raw */
  }
  if (!s.startsWith('/') && !s.includes('|')) s = `/${s}`;

  const pipeParts = s.split('|').map((p) => p.trim()).filter(Boolean);
  let path = pipeParts[0] || '/';
  path = path.replace(/\/index\.html$/i, '').replace(/\.html$/i, '') || '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  // Same jukebox surface whether served at / or under questfest-bridge
  if (
    path === '/interfaces/questfest-bridge' ||
    path === '/questfest-bridge' ||
    path === '/listen'
  ) {
    path = '/';
  }

  const rest = pipeParts.slice(1).map((part) => {
    if (part === '/listen' || part === 'listen') return '/listen';
    if (part === '/listen/now' || part === 'listen/now') return '/listen/now';
    return part;
  });

  const joined = [path, ...rest].join('|');
  return joined.replace(/[^a-zA-Z0-9_./?=&\-|%:+]/g, '').slice(0, 200) || '/';
}

function storageKey(pageKey) {
  return `${PREFIX}${pageKey}`;
}

function blobPathForKey(pageKey) {
  const safe = encodeURIComponent(pageKey)
    .replace(/%/g, '_')
    .replace(/[^a-zA-Z0-9_.\-]/g, '_')
    .slice(0, 180);
  return `${BLOB_PREFIX}${safe || 'root'}.json`;
}

async function blobReadVisits(pageKey) {
  if (!blobConfigured()) return null;
  try {
    const pathname = blobPathForKey(pageKey);
    const { blobs } = await list({ prefix: pathname, limit: 8 });
    const hit = blobs.find((b) => b.pathname === pathname) ?? blobs[0];
    if (!hit?.url) return 0;
    const res = await fetch(`${hit.url}${hit.url.includes('?') ? '&' : '?'}_=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const n = Number(data?.visits);
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    console.error('[page-views] blob read', e);
    return null;
  }
}

async function blobIncrVisits(pageKey) {
  if (!blobConfigured()) return null;
  try {
    const current = (await blobReadVisits(pageKey)) ?? 0;
    const visits = current + 1;
    await put(
      blobPathForKey(pageKey),
      JSON.stringify({
        key: pageKey,
        visits,
        updatedAt: new Date().toISOString(),
      }),
      {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      },
    );
    return visits;
  } catch (e) {
    console.error('[page-views] blob incr', e);
    return null;
  }
}

function memoryGet(pageKey) {
  return memStore.get(pageKey) ?? 0;
}

function memoryIncr(pageKey) {
  const visits = memoryGet(pageKey) + 1;
  memStore.set(pageKey, visits);
  return visits;
}

export function pageViewsBackend() {
  if (upstashConfigured()) return 'upstash';
  if (blobConfigured()) return 'blob';
  return 'memory';
}

export async function getPageVisits(pageKey) {
  const key = normalizePageKey(pageKey);

  if (upstashConfigured()) {
    const raw = await redisGet(storageKey(key));
    if (raw != null) {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
  }

  if (blobConfigured()) {
    const fromBlob = await blobReadVisits(key);
    if (fromBlob != null) return fromBlob;
  }

  return memoryGet(key);
}

export async function incrementPageVisits(pageKey) {
  const key = normalizePageKey(pageKey);

  if (upstashConfigured()) {
    const visits = await redisIncr(storageKey(key));
    if (typeof visits === 'number' && visits > 0) {
      return { key, visits, backend: 'upstash' };
    }
    // INCR can return 0 only for a brand-new key after failed parse — treat null/0 from failed REST as miss
    if (visits === null || visits === undefined) {
      /* fall through */
    } else if (Number.isFinite(visits)) {
      return { key, visits, backend: 'upstash' };
    }
  }

  if (blobConfigured()) {
    const visits = await blobIncrVisits(key);
    if (typeof visits === 'number') {
      return { key, visits, backend: 'blob' };
    }
  }

  const visits = memoryIncr(key);
  return { key, visits, backend: 'memory' };
}
