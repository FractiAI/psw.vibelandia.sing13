/**
 * Perimeter fence geometry for Turner gate coupling.
 * Primary: OpenStreetMap barrier=fence (Overpass) near pasture centroids.
 * Override: optional data/turner-perimeter-steel.geojson (local survey wins on same pastureId).
 * Not animal GPS collars — fence lines only.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { latLngToSchematic } from './turner-geodesy.mjs';
import { fetchOsmFenceLinesByPasture, turnerFenceOsmEnabled } from './turner-osm-fence-lines.mjs';

const STEEL_PATH = join(process.cwd(), 'data/turner-perimeter-steel.geojson');

export function turnerPerimeterSteelEnabled() {
  const v = String(process.env.TURNER_PERIMETER_STEEL || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return true;
}

function lineCoordsFromFeature(f) {
  const g = f?.geometry;
  if (!g) return [];
  const out = [];
  if (g.type === 'LineString' && Array.isArray(g.coordinates)) {
    for (const c of g.coordinates) {
      if (c.length >= 2) out.push({ lng: c[0], lat: c[1] });
    }
  } else if (g.type === 'MultiLineString' && Array.isArray(g.coordinates)) {
    for (const ring of g.coordinates) {
      for (const c of ring) {
        if (c.length >= 2) out.push({ lng: c[0], lat: c[1] });
      }
    }
  }
  return out;
}

function parseSteelGeojson(fc) {
  /** @type {Record<string, {lat:number,lng:number}[][]>} */
  const byPasture = {};
  if (!fc || fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
    return { byPasture, featureCount: 0 };
  }
  for (const f of fc.features) {
    const pid =
      f.properties?.pastureId ||
      f.properties?.pasture_id ||
      f.properties?.ranchId ||
      null;
    if (!pid) continue;
    const coords = lineCoordsFromFeature(f);
    if (coords.length < 2) continue;
    if (!byPasture[pid]) byPasture[pid] = [];
    byPasture[pid].push(coords);
  }
  return { byPasture, featureCount: fc.features.length };
}

async function loadLocalSteelFile() {
  try {
    const raw = await readFile(STEEL_PATH, 'utf8');
    return parseSteelGeojson(JSON.parse(raw));
  } catch (e) {
    if (e.code === 'ENOENT') return { byPasture: {}, featureCount: 0, error: 'file_not_found' };
    return { byPasture: {}, featureCount: 0, error: e.message || 'steel_load_failed' };
  }
}

function mergeFenceByPasture(osmBy, localBy) {
  const ids = new Set([...Object.keys(osmBy || {}), ...Object.keys(localBy || {})]);
  /** @type {Record<string, {lat:number,lng:number}[][]>} */
  const merged = {};
  for (const id of ids) {
    const local = localBy?.[id];
    const osm = osmBy?.[id];
    if (local?.length) merged[id] = [...local];
    else if (osm?.length) merged[id] = [...osm];
  }
  return merged;
}

function countLines(byPasture) {
  return Object.values(byPasture || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
}

/**
 * @param {import('./turner-radar-fusion.mjs').loadRangelandGeography extends () => Promise<infer G> ? G : never} [geography]
 */
export async function loadPerimeterSteelPack(geography = null) {
  const out = {
    loadedAt: new Date().toISOString(),
    source: 'Perimeter fence lines · OpenStreetMap Overpass (barrier=fence and related)',
    path: 'lib/turner-osm-fence-lines.mjs',
    localPath: 'data/turner-perimeter-steel.geojson',
    enabled: turnerPerimeterSteelEnabled(),
    byPasture: {},
    featureCount: 0,
    osmWayCount: 0,
    localFeatureCount: 0,
    osmAttribution: null,
    overpass: null,
    error: null,
  };

  if (!out.enabled) {
    out.source = 'Perimeter steel overlay disabled (TURNER_PERIMETER_STEEL=0)';
    return out;
  }

  let osm = { byPasture: {}, wayCount: 0, error: null, attribution: null, overpass: null, fromCache: false };
  if (turnerFenceOsmEnabled() && geography) {
    osm = await fetchOsmFenceLinesByPasture(geography);
    out.osmWayCount = osm.wayCount;
    out.osmAttribution = osm.attribution;
    out.overpass = osm.overpass;
    out.osmFromCache = osm.fromCache === true;
    out.osmFetchedAt = osm.fetchedAt || null;
    if (osm.error) out.error = osm.error;
  } else if (!geography) {
    out.error = 'geography_required_for_osm';
  }

  const local = await loadLocalSteelFile();
  out.localFeatureCount = local.featureCount;
  if (local.error && local.error !== 'file_not_found' && !out.error) {
    out.error = local.error;
  }

  out.byPasture = mergeFenceByPasture(osm.byPasture, local.byPasture);
  out.featureCount = countLines(out.byPasture);

  const pasturesWithLines = Object.keys(out.byPasture).filter((id) => out.byPasture[id]?.length);
  if (local.featureCount > 0 && osm.wayCount > 0) {
    out.source =
      'OpenStreetMap fence ways (Overpass) + local override · data/turner-perimeter-steel.geojson where present';
  } else if (local.featureCount > 0) {
    out.source = 'Local survey · data/turner-perimeter-steel.geojson';
    out.path = out.localPath;
  } else if (osm.wayCount > 0) {
    out.source =
      'OpenStreetMap · Overpass barrier=fence (and related) near pasture centroids — ODbL; gaps expected on private rangeland';
  } else if (!out.error) {
    out.error = 'no_fence_lines_osm_or_local';
    out.source += ' · no ways returned (OSM sparse here or Overpass timeout)';
  }

  return out;
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

/** Resample fence polyline to `gateCount` schematic gates (arc-length along line). */
export function steelLineToSchematicGates(latLngSamples, pasture, bbox, gateCount = 40) {
  if (!latLngSamples?.length || latLngSamples.length < 2) return null;
  const pts = latLngSamples.map((p) => {
    const xy = latLngToSchematic(p.lat, p.lng, pasture, bbox);
    return { ...xy, lat: p.lat, lng: p.lng };
  });
  const segLen = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = haversineM(latLngSamples[i - 1], latLngSamples[i]);
    segLen.push(d);
    total += d;
  }
  if (total < 1) {
    return pts.slice(0, gateCount).map((p, index) => ({
      x: p.x,
      y: p.y,
      lat: p.lat,
      lng: p.lng,
      index,
      steel: true,
    }));
  }
  const gates = [];
  for (let g = 0; g < gateCount; g++) {
    const target = (g / gateCount) * total;
    let acc = 0;
    let i = 0;
    while (i < segLen.length && acc + segLen[i] < target) {
      acc += segLen[i];
      i++;
    }
    const seg = segLen[i] ?? segLen[segLen.length - 1] ?? 1;
    const local = seg > 0 ? (target - acc) / seg : 0;
    const a = pts[Math.min(i, pts.length - 2)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    const i0 = Math.min(i, latLngSamples.length - 2);
    const i1 = i0 + 1;
    gates.push({
      x: a.x + (b.x - a.x) * local,
      y: a.y + (b.y - a.y) * local,
      lat: latLngSamples[i0].lat + (latLngSamples[i1].lat - latLngSamples[i0].lat) * local,
      lng: latLngSamples[i0].lng + (latLngSamples[i1].lng - latLngSamples[i0].lng) * local,
      index: g,
      steel: true,
    });
  }
  return gates;
}

/** Pick longest fence line for a pasture when multiple OSM/local features exist. */
export function resolveSteelGatesForPasture(pasture, steelLines, bbox, gateCount = 40) {
  const lines = steelLines?.[pasture.id];
  if (!lines?.length) return null;
  let best = null;
  let bestLen = 0;
  for (const line of lines) {
    let len = 0;
    for (let i = 1; i < line.length; i++) len += haversineM(line[i - 1], line[i]);
    if (len > bestLen) {
      bestLen = len;
      best = line;
    }
  }
  if (!best) return null;
  return steelLineToSchematicGates(best, pasture, bbox, gateCount);
}
