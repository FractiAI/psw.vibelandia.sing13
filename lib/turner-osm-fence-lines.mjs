/**
 * Public fence-line geometry from OpenStreetMap (Overpass API).
 * ODbL — crowd-sourced; often incomplete on private ranch interiors; use local GeoJSON to override.
 * Live Overpass is rate-limited — use data/turner-osm-fence-cache.json (scripts/fetch-turner-osm-fences.mjs).
 * @see https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dfence
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { schematicToLatLng } from './turner-geodesy.mjs';

const DEFAULT_OVERPASS = 'https://overpass-api.de/api/interpreter';
const CACHE_PATH = join(process.cwd(), 'data/turner-osm-fence-cache.json');
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const UA =
  'SS-Vibelandia-TurnerOSM/1.0 (+https://www.ssvibelandiaquestfest24x365.com; turner-bison-fence; mailto:valetpru@gmail.com)';

export function turnerFenceOsmEnabled() {
  const v = String(process.env.TURNER_FENCE_OSM || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return true;
}

function overpassUrl() {
  const u = String(process.env.TURNER_OVERPASS_URL || '').trim();
  return u || DEFAULT_OVERPASS;
}

/** Schematic pasture polygon → closed ring [[lng,lat], …] in WGS84. */
export function pastureLatLngRing(pasture, bbox) {
  if (!pasture?.polygon?.length || pasture.lat == null || pasture.lon == null) return null;
  const ring = pasture.polygon.map(([sx, sy]) => {
    const ll = schematicToLatLng(sx, sy, pasture, bbox);
    return [ll.lng, ll.lat];
  });
  if (ring.length < 3) return null;
  const [f0, f1] = ring[0];
  const [l0, l1] = ring[ring.length - 1];
  if (f0 !== l0 || f1 !== l1) ring.push([f0, f1]);
  return ring;
}

export function pointInRingLngLat(lng, lat, ring) {
  if (!ring?.length) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-18) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function centroidLngLat(nodes) {
  if (!nodes?.length) return null;
  let slat = 0;
  let slng = 0;
  for (const n of nodes) {
    slat += n.lat;
    slng += n.lng;
  }
  return { lat: slat / nodes.length, lng: slng / nodes.length };
}

function haversineM(a, b) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLon = toR(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

function queryAround(lat, lon, radiusM) {
  const r = Math.round(radiusM);
  return `[out:json][timeout:90];
(
  way["barrier"="fence"](around:${r},${lat},${lon});
  way["barrier"="barbed_wire"](around:${r},${lat},${lon});
  way["barrier"="chain_link"](around:${r},${lat},${lon});
);
out geom;`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postOverpass(ql) {
  const urls = [overpassUrl(), ...OVERPASS_MIRRORS].filter(
    (u, i, a) => u && a.indexOf(u) === i,
  );
  let lastErr = null;
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 95000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: 'application/json',
            'User-Agent': UA,
          },
          body: `data=${encodeURIComponent(ql)}`,
        });
        clearTimeout(t);
        const text = await res.text();
        if (!res.ok) {
          lastErr = new Error(`overpass_${res.status}`);
          await sleep(2000 * (attempt + 1));
          continue;
        }
        try {
          return JSON.parse(text);
        } catch {
          lastErr = new Error('overpass_invalid_json');
          continue;
        }
      } catch (e) {
        clearTimeout(t);
        lastErr = e;
        await sleep(2000 * (attempt + 1));
      }
    }
  }
  throw lastErr || new Error('overpass_failed');
}

export function turnerOsmFenceCacheMaxAgeMs() {
  const days = Number(process.env.TURNER_OSM_CACHE_DAYS);
  if (Number.isFinite(days) && days > 0) return days * 86400000;
  return 14 * 86400000;
}

export async function readOsmFenceCache() {
  try {
    const raw = await readFile(CACHE_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data?.byPasture || typeof data.byPasture !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export async function writeOsmFenceCache(payload) {
  await writeFile(CACHE_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

function cacheIsFresh(cache) {
  if (!cache?.fetchedAt) return false;
  const age = Date.now() - new Date(cache.fetchedAt).getTime();
  return age >= 0 && age < turnerOsmFenceCacheMaxAgeMs();
}

export function turnerOsmFenceRefreshForced() {
  const v = String(process.env.TURNER_FENCE_OSM_REFRESH || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function waysFromOverpassJson(data) {
  const ways = [];
  for (const el of data?.elements || []) {
    if (el.type !== 'way' || !Array.isArray(el.geometry) || el.geometry.length < 2) continue;
    const nodes = el.geometry.map((g) => ({ lat: g.lat, lng: g.lon }));
    ways.push({ osmId: el.id, tags: el.tags || {}, nodes });
  }
  return ways;
}

function pickPastureForWay(way, pastureRings, pastures) {
  const c = centroidLngLat(way.nodes);
  if (!c) return null;
  for (const p of pastures) {
    const ring = pastureRings.get(p.id);
    if (ring && pointInRingLngLat(c.lng, c.lat, ring)) return p.id;
  }
  let bestId = null;
  let bestD = Infinity;
  for (const p of pastures) {
    if (p.lat == null || p.lon == null) continue;
    const d = haversineM(c, { lat: p.lat, lng: p.lon });
    if (d < bestD) {
      bestD = d;
      bestId = p.id;
    }
  }
  const maxAssign = 80000;
  if (bestId != null && bestD < maxAssign) return bestId;
  return null;
}

function radiusForPasture(pasture) {
  const acres = pasture.acres || 100000;
  return Math.min(55000, Math.max(8000, Math.sqrt(acres) * 18));
}

/**
 * Fetch OSM fence ways near each pasture centroid; returns same shape as steel file parser:
 * `byPasture[id]` = array of polylines `{lat,lng}[][]`.
 */
export async function fetchOsmFenceLinesByPasture(geography, { skipCache = false } = {}) {
  const bbox = geography.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 };
  const pastures = geography.pastures || [];
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);

  if (!withGeo.length) {
    return {
      byPasture: {},
      wayCount: 0,
      error: 'no_pasture_coordinates',
      attribution: '© OpenStreetMap contributors ODbL',
      fromCache: false,
    };
  }

  if (!skipCache && !turnerOsmFenceRefreshForced()) {
    const cached = await readOsmFenceCache();
    if (cacheIsFresh(cached)) {
      return {
        byPasture: cached.byPasture,
        wayCount: cached.wayCount ?? countWays(cached.byPasture),
        error: cached.error ?? null,
        attribution: cached.attribution,
        overpass: cached.overpass,
        fromCache: true,
        fetchedAt: cached.fetchedAt,
      };
    }
  }

  /** @type {Record<string, {lat:number,lng:number}[][]>} */
  const byPasture = {};
  let wayCount = 0;
  let error = null;

  const pastureRings = new Map();
  for (const p of withGeo) {
    const ring = pastureLatLngRing(p, bbox);
    if (ring) pastureRings.set(p.id, ring);
  }

  try {
    for (let i = 0; i < withGeo.length; i++) {
      const p = withGeo[i];
      if (i > 0) await sleep(2800);
      const ql = queryAround(p.lat, p.lon, radiusForPasture(p));
      const data = await postOverpass(ql);
      const ways = waysFromOverpassJson(data);
      wayCount += ways.length;
      for (const w of ways) {
        const pid = pickPastureForWay(w, pastureRings, withGeo);
        if (!pid) continue;
        const line = w.nodes.map((n) => ({ lat: n.lat, lng: n.lng }));
        if (!byPasture[pid]) byPasture[pid] = [];
        byPasture[pid].push(line);
      }
    }
  } catch (e) {
    error = e.message || 'osm_fetch_failed';
    const stale = await readOsmFenceCache();
    if (stale?.byPasture && Object.keys(stale.byPasture).length) {
      return {
        byPasture: stale.byPasture,
        wayCount: stale.wayCount ?? countWays(stale.byPasture),
        error: `${error}; using_stale_cache`,
        attribution: stale.attribution,
        overpass: stale.overpass,
        fromCache: true,
        fetchedAt: stale.fetchedAt,
      };
    }
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    byPasture,
    wayCount,
    error,
    attribution: '© OpenStreetMap contributors — data available under the Open Database License (ODbL)',
    overpass: overpassUrl(),
  };
  if (!error && wayCount > 0) {
    try {
      await writeOsmFenceCache(payload);
    } catch {
      /* ignore cache write on read-only deploy */
    }
  }

  return { ...payload, fromCache: false };
}

function countWays(byPasture) {
  return Object.values(byPasture || {}).reduce((s, lines) => s + (lines?.length || 0), 0);
}
