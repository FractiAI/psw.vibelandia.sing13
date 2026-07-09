import { redisGet, redisIncr, upstashConfigured } from './upstash.mjs';

const PREFIX = 'qv:pv:';

const memStore = globalThis.__qvPageViews || (globalThis.__qvPageViews = new Map());

/** Canonical page key — pathname plus stable query/hash segments. */
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
  if (!s.startsWith('/')) s = `/${s}`;
  return s.replace(/[^a-zA-Z0-9_./?=&\-|%:+|]/g, '').slice(0, 200) || '/';
}

function storageKey(pageKey) {
  return `${PREFIX}${pageKey}`;
}

export async function getPageVisits(pageKey) {
  const key = normalizePageKey(pageKey);
  if (upstashConfigured()) {
    const raw = await redisGet(storageKey(key));
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  return memStore.get(key) ?? 0;
}

export async function incrementPageVisits(pageKey) {
  const key = normalizePageKey(pageKey);
  if (upstashConfigured()) {
    const visits = await redisIncr(storageKey(key));
    return { key, visits };
  }
  const visits = (memStore.get(key) ?? 0) + 1;
  memStore.set(key, visits);
  return { key, visits };
}
