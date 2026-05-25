/**
 * Free power-grid + higher magnetic-layer feeds for Turner passive radar.
 * HIFLD US transmission lines (ArcGIS) · NOAA SWPC geomagnetic stack.
 */
import { EGS_PHI } from './turner-bison-herd.mjs';

const HIFLD_LINES =
  'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_Electric_Power_Transmission_Lines/FeatureServer/0/query';

const MAGNETIC = {
  boulderK: 'https://services.swpc.noaa.gov/json/boulder_k_index_1m.json',
  dst: 'https://services.swpc.noaa.gov/json/geospace/geospace_dst_1_hour.json',
  rtswMag: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json',
};

const DEFAULT_NETWORK_BBOX = { west: -114, east: -100, south: 32, north: 48 };

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function lastRow(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows[rows.length - 1];
}

async function fetchJson(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerRadar/1.0' },
    });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export function projectLonLatToMap(lon, lat, bbox, mapW = 1000, mapH = 620) {
  const { west, east, south, north } = bbox;
  const x = ((lon - west) / (east - west)) * mapW;
  const y = (1 - (lat - south) / (north - south)) * mapH;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

export async function fetchMagneticLayers() {
  const out = {
    fetchedAt: new Date().toISOString(),
    source: 'NOAA SWPC · geomagnetic stack (Boulder K · Dst · L1 RTSW Bz)',
    layers: {
      ground: 'boulder_k_index_1m',
      ring: 'geospace_dst_1_hour',
      l1: 'rtsw_mag_1m',
    },
    boulderK: null,
    dst: null,
    solarWindBz: null,
    solarWindBt: null,
    couplingIndex: null,
    resolutionBoost: null,
    error: null,
  };

  try {
    const [kRaw, dstRaw, magRaw] = await Promise.all([
      fetchJson(MAGNETIC.boulderK).catch(() => []),
      fetchJson(MAGNETIC.dst).catch(() => []),
      fetchJson(MAGNETIC.rtswMag).catch(() => []),
    ]);

    const kRow = lastRow(kRaw);
    const dstRow = lastRow(dstRaw);
    const magRow = lastRow(magRaw);

    out.boulderK = num(kRow?.k_index) ?? num(kRow?.estimated_kp);
    out.dst = num(dstRow?.dst);
    out.solarWindBz = num(magRow?.bz_gsm);
    out.solarWindBt = num(magRow?.bt);

    const kNorm = out.boulderK != null ? Math.min(1, out.boulderK / 5) : 0.2;
    const dstNorm = out.dst != null ? Math.min(1, Math.abs(out.dst) / 80) : 0.2;
    const bzNorm = out.solarWindBz != null ? Math.min(1, Math.abs(out.solarWindBz) / 15) : 0.2;
    out.couplingIndex = Number(
      ((kNorm * 0.35 + dstNorm * 0.35 + bzNorm * 0.3) / EGS_PHI).toFixed(3),
    );
    out.resolutionBoost = Number((1 + out.couplingIndex * 0.35).toFixed(3));
  } catch (e) {
    out.error = e.message || 'magnetic fetch failed';
    out.couplingIndex = 0.25;
    out.resolutionBoost = 1.08;
  }

  return out;
}

function pastureGeoBbox(pasture, pad = 1.2) {
  const lat = pasture.lat;
  const lon = pasture.lon;
  if (lat == null || lon == null) return null;
  return {
    west: lon - pad,
    east: lon + pad,
    south: lat - pad,
    north: lat + pad,
  };
}

function lineIntersectsBbox(path, bbox) {
  for (const [lon, lat] of path) {
    if (lon >= bbox.west && lon <= bbox.east && lat >= bbox.south && lat <= bbox.north) {
      return true;
    }
  }
  return false;
}

export async function fetchPowerGridLayer({ networkBbox, pastures, mapBbox, maxFeatures = 350 }) {
  const bbox = networkBbox || DEFAULT_NETWORK_BBOX;
  const geom = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
  const out = {
    fetchedAt: new Date().toISOString(),
    source: 'HIFLD · US Electric Power Transmission Lines (ArcGIS open data)',
    endpoint: HIFLD_LINES,
    networkBbox: bbox,
    lineCount: 0,
    maxVoltageKv: null,
    mapSegments: [],
    pastures: [],
    error: null,
  };

  try {
    const url = `${HIFLD_LINES}?where=VOLTAGE%3E%3D69&geometry=${geom}&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326&spatialRel=esriSpatialRelIntersects&outFields=VOLTAGE,OWNER,TYPE&returnGeometry=true&resultRecordCount=${maxFeatures}&f=json`;
    const data = await fetchJson(url, 18000);
    const features = data.features || [];
    out.lineCount = features.length;

    let maxV = 0;
    const segments = [];
    const pastureStats = (pastures || []).map((p) => ({
      id: p.id,
      name: p.name,
      lineCount: 0,
      maxVoltageKv: 0,
      magneticLeverage: 0,
    }));
    const statById = Object.fromEntries(pastureStats.map((s) => [s.id, s]));

    for (const feat of features) {
      const v = num(feat.attributes?.VOLTAGE) ?? 0;
      if (v > maxV) maxV = v;
      const paths = feat.geometry?.paths || [];
      for (const path of paths) {
        if (!path?.length) continue;
        let hitPasture = null;
        for (const p of pastures || []) {
          const pb = pastureGeoBbox(p, 0.85);
          if (pb && lineIntersectsBbox(path, pb)) {
            hitPasture = p.id;
            const st = statById[p.id];
            if (st) {
              st.lineCount += 1;
              if (v > st.maxVoltageKv) st.maxVoltageKv = v;
            }
          }
        }
        if (segments.length < 180) {
          const step = Math.max(1, Math.floor(path.length / 6));
          const sampled = [];
          for (let i = 0; i < path.length; i += step) {
            sampled.push(projectLonLatToMap(path[i][0], path[i][1], mapBbox || bbox));
          }
          if (sampled.length >= 2) {
            segments.push({
              voltageKv: v,
              owner: feat.attributes?.OWNER || null,
              pastureId: hitPasture,
              points: sampled,
            });
          }
        }
      }
    }

    out.maxVoltageKv = maxV;
    out.mapSegments = segments;
    out.pastures = pastureStats.map((s) => ({
      ...s,
      magneticLeverage: Number((s.lineCount * 0.04 + s.maxVoltageKv / 2000).toFixed(3)),
    }));
  } catch (e) {
    out.error = e.message || 'power grid fetch failed';
  }

  return out;
}

/** Boost radar cell reflectivity near transmission corridors under active magnetic coupling */
export function magneticGridBoost(cx, cy, powerGrid, magnetic, pastureId) {
  if (!powerGrid?.mapSegments?.length) return 1;
  const coupling = magnetic?.couplingIndex ?? 0.2;
  const pastureStat = powerGrid.pastures?.find((p) => p.id === pastureId);
  const leverage = pastureStat?.magneticLeverage ?? 0.05;
  let near = 0;
  for (const seg of powerGrid.mapSegments) {
    if (seg.pastureId && seg.pastureId !== pastureId) continue;
    for (const pt of seg.points || []) {
      const d = Math.hypot(cx - pt.x, cy - pt.y);
      if (d < 45) near += (seg.voltageKv || 115) / 115 / (1 + d / 25);
    }
  }
  return 1 + Math.min(0.45, near * 0.02 * coupling * (1 + leverage * 4));
}

export function effectiveRadarGrid(baseGrid, magnetic, powerGrid) {
  const boost = magnetic?.resolutionBoost ?? 1;
  const lines = powerGrid?.lineCount ?? 0;
  const extra = lines > 80 ? 8 : lines > 20 ? 4 : 0;
  return Math.min(40, Math.round(baseGrid * boost) + extra);
}
