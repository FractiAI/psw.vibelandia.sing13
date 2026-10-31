/**
 * Real / historical multi-target track fusion lab (Leo Computational Lab priority).
 *
 * Primary source: Movebank GPS collars + GFZ Kp (same public window as TRGM historical-lab).
 * Builds a fusion scenario compatible with conventional / Tiny Gateway pipelines.
 *
 * Honesty: this is civilian wildlife GPS + geomagnetic context — NOT ADS-B / ATC radar.
 * Used because OpenSky/ADS-B logs are not present in-repo. Synthetic airspace is fallback only.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REAL_SOURCES, allowSyntheticFallback } from '../data-policy.mjs';
import { generateSyntheticAirspace } from './synthetic-airspace.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUITE_ROOT = path.resolve(__dirname, '../..');
const MONOREPO_ROOT = path.resolve(SUITE_ROOT, '../..');

function resolveMonorepo(rel) {
  const abs = path.join(MONOREPO_ROOT, rel);
  return fs.existsSync(abs) ? abs : null;
}

function toLocalKm(lat, lon, origin) {
  const kmPerDegLat = 111.32;
  const kmPerDegLon = 111.32 * Math.cos((origin.lat * Math.PI) / 180);
  return {
    x: (lon - origin.lon) * kmPerDegLon,
    y: (lat - origin.lat) * kmPerDegLat,
  };
}

export function loadKpByHour(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/\r/g, '');
  const lines = text.trim().split('\n').slice(1);
  const byHour = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const [time, kp, , storm] = line.split(',');
    const ms = Date.parse(String(time).replace(' ', 'T'));
    if (!Number.isFinite(ms)) continue;
    const key = new Date(ms).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const v = Number(kp);
    if (!Number.isFinite(v)) continue;
    // 3-hourly archive: fill this hour and the following two
    for (let h = 0; h < 3; h++) {
      const k = new Date(ms + h * 3600_000).toISOString().slice(0, 13);
      byHour.set(k, { kp: v, storm: String(storm || 'quiet').trim() || 'quiet' });
    }
    byHour.set(key, { kp: v, storm: String(storm || 'quiet').trim() || 'quiet' });
  }
  return byHour;
}

/**
 * Stream Movebank trajectories into a bounded hourly window.
 * Defaults: first window with ≥ minIndividuals and ≥ targetSteps hours.
 */
export async function loadMovebankWindow({
  trajectoriesPath,
  startHour = '2019-03-01T00',
  targetSteps = 80,
  minIndividuals = 8,
  maxRows = 250_000,
} = {}) {
  const byId = new Map();
  const rl = readline.createInterface({
    input: createReadStream(trajectoriesPath),
    crlfDelay: Infinity,
  });
  let first = true;
  let nRows = 0;
  let origin = null;
  const endMs = Date.parse(startHour.length === 13 ? `${startHour}:00:00Z` : startHour) + targetSteps * 3600_000;
  const startMs = Date.parse(startHour.length === 13 ? `${startHour}:00:00Z` : startHour);

  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }
    nRows++;
    if (nRows > maxRows) break;
    const parts = line.split(',');
    if (parts.length < 5) continue;
    const individual_id = parts[0];
    const timestamp = parts[1];
    const lat = Number(parts[2]);
    const lon = Number(parts[3]);
    const heading = parts[7] === '' ? null : Number(parts[7]);
    const speed = parts[9] === '' ? 0 : Number(parts[9]);
    const tMs = Date.parse(timestamp);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(tMs)) continue;
    if (tMs < startMs || tMs >= endMs) continue;
    if (!origin) origin = { lat, lon };
    const { x, y } = toLocalKm(lat, lon, origin);
    const hourIdx = Math.floor((tMs - startMs) / 3600_000);
    if (!byId.has(individual_id)) byId.set(individual_id, []);
    byId.get(individual_id).push({
      step: hourIdx,
      x,
      y,
      alt: speed, // speed proxy in alt channel for anomaly score compatibility
      speed,
      heading,
      timestamp,
      lat,
      lon,
    });
  }

  return {
    byId,
    origin,
    nRowsScanned: nRows,
    startHour,
    targetSteps,
    nIndividuals: byId.size,
    ok: byId.size >= minIndividuals,
  };
}

function pickAnomalyIds(tracks, kpByHour, startHour, targetSteps) {
  // Label anomalous tracks: top speed-percentile OR majority of fixes on elevated Kp
  const scored = tracks.map((tr) => {
    const speeds = tr.path.map((p) => p.speed || 0);
    const meanSp = speeds.reduce((a, b) => a + b, 0) / (speeds.length || 1);
    let stormHits = 0;
    for (const p of tr.path) {
      const hourKey = hourKeyFromStart(startHour, p.step);
      const kp = kpByHour.get(hourKey);
      if (kp && (kp.kp >= 4 || kp.storm !== 'quiet')) stormHits++;
    }
    const stormFrac = stormHits / (tr.path.length || 1);
    return { id: tr.id, score: meanSp * 2 + stormFrac, meanSp, stormFrac };
  });
  scored.sort((a, b) => b.score - a.score);
  const nAnom = Math.max(3, Math.round(tracks.length * 0.1));
  return scored.slice(0, nAnom).map((s) => s.id);
}

function hourKeyFromStart(startHour, step) {
  const startMs = Date.parse(startHour.length === 13 ? `${startHour}:00:00Z` : startHour);
  const d = new Date(startMs + step * 3600_000);
  const iso = d.toISOString(); // 2019-03-01T00:00:00.000Z
  return iso.slice(0, 13);
}

/**
 * Build fusion scenario from real Movebank + Kp.
 * Sensors: 4 bounding-box beacons + collar channel + Kp disturbance channel (=6).
 */
export function buildScenarioFromMovebank(window, kpByHour) {
  const ids = [...window.byId.keys()].sort();
  const rawTracks = ids.map((id, idx) => {
    const pts = window.byId.get(id).sort((a, b) => a.step - b.step || a.timestamp.localeCompare(b.timestamp));
    // one point per step (last fix in hour)
    const byStep = new Map();
    for (const p of pts) byStep.set(p.step, p);
    const path = [];
    for (let step = 0; step < window.targetSteps; step++) {
      const p = byStep.get(step);
      if (p) path.push({ step, x: p.x, y: p.y, alt: p.alt, speed: p.speed, anomalous: false });
      else if (path.length) {
        const last = path[path.length - 1];
        path.push({ ...last, step, anomalous: false });
      }
    }
    return { id: idx, individualId: id, path, anomalous: false };
  }).filter((t) => t.path.length >= Math.floor(window.targetSteps * 0.5));

  const anomalyIds = pickAnomalyIds(rawTracks, kpByHour, window.startHour, window.targetSteps);
  const anomSet = new Set(anomalyIds);
  for (const tr of rawTracks) {
    tr.anomalous = anomSet.has(tr.id);
    for (const p of tr.path) p.anomalous = tr.anomalous;
  }

  // Bounding box for virtual sensors
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const tr of rawTracks) {
    for (const p of tr.path) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }
  const sensors = [
    { id: 0, x: minX, y: minY, noise: 0.2, role: 'beacon_sw' },
    { id: 1, x: maxX, y: minY, noise: 0.2, role: 'beacon_se' },
    { id: 2, x: minX, y: maxY, noise: 0.2, role: 'beacon_nw' },
    { id: 3, x: maxX, y: maxY, noise: 0.2, role: 'beacon_ne' },
    { id: 4, x: (minX + maxX) / 2, y: (minY + maxY) / 2, noise: 0.05, role: 'collar_channel' },
    { id: 5, x: (minX + maxX) / 2, y: minY - 1, noise: 0.3, role: 'kp_disturbance_channel' },
  ];

  const observations = [];
  for (const track of rawTracks) {
    for (const pt of track.path) {
      for (const s of sensors) {
        const dx = pt.x - s.x;
        const dy = pt.y - s.y;
        const range = Math.hypot(dx, dy);
        // Kp channel modulates noise / range on sensor 5
        let x = pt.x;
        let y = pt.y;
        let alt = pt.alt;
        if (s.role === 'kp_disturbance_channel') {
          const hourKey = hourKeyFromStart(window.startHour, pt.step);
          const kp = kpByHour.get(hourKey);
          const k = kp?.kp ?? 0;
          x += 0.05 * k;
          y += 0.05 * k;
          alt = k;
        } else if (s.role !== 'collar_channel') {
          // range-bearing style observation from beacon
          const bearing = Math.atan2(dy, dx);
          x = s.x + range * Math.cos(bearing);
          y = s.y + range * Math.sin(bearing);
        }
        observations.push({
          sensorId: s.id,
          trackId: track.id,
          step: pt.step,
          x,
          y,
          alt,
          range,
          bearing: Math.atan2(dy, dx),
          anomalousTruth: track.anomalous,
        });
      }
    }
  }

  return {
    sourceMode: 'historical_movebank_kp',
    seed: null,
    params: {
      sensors: sensors.length,
      tracks: rawTracks.length,
      timeSteps: window.targetSteps,
      observations: observations.length,
      anomalyTracks: anomalyIds.length,
      areaKm: Math.max(maxX - minX, maxY - minY),
    },
    sensors,
    tracks: rawTracks,
    observations,
    anomalyIds: [...anomSet].sort((a, b) => a - b),
    stats: {
      nSensors: sensors.length,
      nTracks: rawTracks.length,
      nSteps: window.targetSteps,
      nObservations: observations.length,
      nAnomalies: anomalyIds.length,
      expectedObservations: sensors.length * rawTracks.length * window.targetSteps,
    },
    provenance: {
      trajectories: REAL_SOURCES.movebankTrajectories,
      kp: REAL_SOURCES.kpArchive,
      study: REAL_SOURCES.movebankStudy,
      startHour: window.startHour,
      origin: window.origin,
      nRowsScanned: window.nRowsScanned,
      honesty:
        'Real Movebank GPS + GFZ Kp historical window. Virtual beacons are geometric observers over real tracks — not ADS-B receivers. Anomaly labels = high-speed / elevated-Kp heuristic on real fixes, not injected fiction.',
    },
  };
}

/**
 * Resolve fusion scenario: real historical first → synthetic only if allowed.
 */
export async function resolveFusionScenario({
  seed = 20261030,
  startHour = '2019-03-01T00',
  targetSteps = 80,
} = {}) {
  const trajPath = resolveMonorepo(REAL_SOURCES.movebankTrajectories);
  const kpPath = resolveMonorepo(REAL_SOURCES.kpArchive);

  if (trajPath && kpPath) {
    const window = await loadMovebankWindow({
      trajectoriesPath: trajPath,
      startHour,
      targetSteps,
    });
    if (window.ok) {
      const kpByHour = loadKpByHour(kpPath);
      const scenario = buildScenarioFromMovebank(window, kpByHour);
      return {
        ok: true,
        sourceMode: 'historical_movebank_kp',
        scenario,
        missing: [],
      };
    }
    if (!allowSyntheticFallback()) {
      return {
        ok: false,
        sourceMode: 'unavailable',
        scenario: null,
        missing: ['movebank_window_insufficient_individuals'],
        honesty: 'Real CSV present but window lacked individuals; synthetic withheld (set TINY_GATEWAY_ALLOW_SYNTHETIC=1 to allow fallback).',
      };
    }
  }

  if (!allowSyntheticFallback()) {
    return {
      ok: false,
      sourceMode: 'unavailable',
      scenario: null,
      missing: [
        trajPath ? null : REAL_SOURCES.movebankTrajectories,
        kpPath ? null : REAL_SOURCES.kpArchive,
      ].filter(Boolean),
      honesty:
        'Real Movebank/Kp unavailable and synthetic fallback disabled. Withhold fusion claims (Leo Computational Lab real-data priority).',
    };
  }

  const scenario = generateSyntheticAirspace(seed);
  scenario.sourceMode = 'synthetic_fallback';
  scenario.provenance = {
    honesty:
      'SYNTHETIC FALLBACK — real Movebank/Kp missing or insufficient. Enabled only because TINY_GATEWAY_ALLOW_SYNTHETIC=1. Not ATC radar.',
  };
  return { ok: true, sourceMode: 'synthetic_fallback', scenario, missing: [] };
}
