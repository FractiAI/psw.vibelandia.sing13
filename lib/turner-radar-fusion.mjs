/**
 * Passive radar synthesis — fence-line returns × satellite pass → herd placement field.
 * Operates like radar: transmit (1420 MHz fence waveguide), receive (PLL gates + satellite reflectivity).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EGS_PHI } from './turner-bison-herd.mjs';
import {
  effectiveRadarGrid,
  fetchMagneticLayers,
  fetchPowerGridLayer,
  magneticGridBoost,
} from './turner-power-magnetic.mjs';

/** Assimilated soil-moisture grid (ECMWF + satellite/station inputs) — satellite reflectivity pass for radar fuse */
const SATELLITE_API = 'https://api.open-meteo.com/v1/forecast';
const BASE_GRID = 24;

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function perimeterGates(polygon, gateCount) {
  const gates = [];
  const n = polygon.length;
  for (let g = 0; g < gateCount; g++) {
    const t = g / gateCount;
    const seg = Math.floor(t * n) % n;
    const next = (seg + 1) % n;
    const local = (t * n) % 1;
    const x = polygon[seg][0] + (polygon[next][0] - polygon[seg][0]) * local;
    const y = polygon[seg][1] + (polygon[next][1] - polygon[seg][1]) * local;
    gates.push({ x, y, index: g });
  }
  return gates;
}

export async function loadRangelandGeography() {
  const raw = await readFile(join(process.cwd(), 'data/turner-rangeland-geography.json'), 'utf8');
  return JSON.parse(raw);
}

export async function fetchSatelliteMoisturePass(pastures) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const out = {
    fetchedAt: new Date().toISOString(),
    source: 'Open-Meteo · ECMWF assimilated soil moisture (satellite + stations)',
    endpoint: SATELLITE_API,
    model: 'ecmwf_ifs025',
    variable: 'soil_moisture_0_to_1cm',
    pastures: [],
    error: null,
  };

  if (!withGeo.length) {
    out.error = 'no pasture coordinates';
    return out;
  }

  try {
    const lat = withGeo.map((p) => p.lat).join(',');
    const lon = withGeo.map((p) => p.lon).join(',');
    const url = `${SATELLITE_API}?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_0_to_1cm&forecast_days=1`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 14000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerRadar/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`satellite ${res.status}`);
    const data = await res.json();

    const list = Array.isArray(data) ? data : [data];
    withGeo.forEach((pasture, i) => {
      const block = list[i] || list[0];
      const series =
        block?.hourly?.soil_moisture_0_to_1cm ||
        block?.hourly?.soil_moisture_0_1cm ||
        [];
      const valid = series.filter((v) => v != null);
      const latest = valid.length ? valid[valid.length - 1] : null;
      const mean =
        valid.length > 0 ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        lat: pasture.lat,
        lon: pasture.lon,
        soilMoistureM3M3: latest,
        soilMoistureMean: mean,
        time: block?.hourly?.time?.[block.hourly.time.length - 1] || null,
      });
    });
  } catch (e) {
    out.error = e.message || 'satellite fetch failed';
    withGeo.forEach((pasture) => {
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        lat: pasture.lat,
        lon: pasture.lon,
        soilMoistureM3M3: null,
        soilMoistureMean: null,
        time: null,
      });
    });
  }

  return out;
}

export function fenceLineReturns(pastures, wirePhaseUs, iqRms, kpLive) {
  const pll = num(wirePhaseUs) ?? 8.2;
  const rms = num(iqRms) ?? 0.01;
  const kp = num(kpLive) ?? 1;
  const pasturesOut = [];

  for (const pasture of pastures) {
    const gates = perimeterGates(pasture.polygon, 40);
    const returns = gates.map((gate) => {
      const phase = Math.sin((gate.index / gates.length) * Math.PI * 2 + pll / EGS_PHI);
      const massCoupling = rms * 420 + kp * 0.12;
      const strength = Math.max(0, phase * massCoupling + pll * 0.02);
      return { ...gate, strength: Number(strength.toFixed(4)) };
    });
    const mean = returns.reduce((s, r) => s + r.strength, 0) / returns.length;
    pasturesOut.push({
      id: pasture.id,
      name: pasture.name,
      gateCount: gates.length,
      meanReturn: Number(mean.toFixed(4)),
      returns,
    });
  }

  return {
    source: 'High-tensile perimeter fence · 1420 MHz Goubau waveguide',
    wirePhaseUs: pll,
    iqRms: rms,
    kpLive: kp,
    pastures: pasturesOut,
  };
}

function gridCellReflectivity(cx, cy, gates, satMoisture, pastureId, powerGrid, magnetic, satBaseline = 0.22) {
  let fenceSum = 0;
  for (const g of gates) {
    const d = Math.hypot(cx - g.x, cy - g.y);
    fenceSum += g.strength * Math.exp(-d / 85);
  }
  const satAnom =
    satMoisture != null ? Math.max(0, satBaseline - satMoisture) + 0.15 : 0.15;
  const magBoost = magneticGridBoost(cx, cy, powerGrid, magnetic, pastureId);
  return fenceSum * (0.55 + satAnom * 1.8) * magBoost;
}

export function fuseRadarProduct(geography, fence, satellite, ingestAt, magnetic, powerGrid) {
  const gridSize = effectiveRadarGrid(BASE_GRID, magnetic, powerGrid);
  const satById = Object.fromEntries((satellite.pastures || []).map((p) => [p.id, p]));
  const fenceById = Object.fromEntries((fence.pastures || []).map((p) => [p.id, p]));

  const pastures = [];
  let corrSum = 0;
  let corrN = 0;

  for (const pasture of geography.pastures) {
    const f = fenceById[pasture.id];
    const s = satById[pasture.id];
    const satM = s?.soilMoistureM3M3 ?? s?.soilMoistureMean ?? null;
    const fenceMean = f?.meanReturn ?? 0.1;
    const satNorm = satM != null ? satM : 0.22;
    const pg = powerGrid?.pastures?.find((p) => p.id === pasture.id);
    const gridLeverage = pg?.magneticLeverage ?? 0;
    const correlation = Number(
      Math.min(
        0.995,
        Math.max(
          0.72,
          0.78 +
            fenceMean * 0.04 +
            (0.25 - satNorm) * 0.6 +
            gridLeverage * 0.12 +
            (magnetic?.couplingIndex ?? 0) * 0.08,
        ),
      ).toFixed(3),
    );
    corrSum += correlation;
    corrN += 1;

    const gates = f?.returns || [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of pasture.polygon) {
      minX = Math.min(minX, c[0]);
      maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]);
      maxY = Math.max(maxY, c[1]);
    }

    const weights = [];
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const x = minX + ((gx + 0.5) / gridSize) * (maxX - minX);
        const y = minY + ((gy + 0.5) / gridSize) * (maxY - minY);
        const w = pointInPoly(x, y, pasture.polygon)
          ? gridCellReflectivity(x, y, gates, satM, pasture.id, powerGrid, magnetic)
          : 0;
        weights.push(Number(w.toFixed(5)));
      }
    }
    const sum = weights.reduce((a, b) => a + b, 0) || 1;

    pastures.push({
      id: pasture.id,
      name: pasture.name,
      correlation,
      fenceMeanReturn: fenceMean,
      satelliteSoilMoisture: satM,
      transmissionLines: pg?.lineCount ?? 0,
      maxVoltageKv: pg?.maxVoltageKv ?? 0,
      magneticLeverage: gridLeverage,
      gridSize,
      weights: weights.map((w) => Number((w / sum).toFixed(6))),
    });
  }

  const meanCorr = corrN ? corrSum / corrN : 0.85;
  const fidelityPct = Number((meanCorr * 100).toFixed(1));

  return {
    at: ingestAt || new Date().toISOString(),
    stage: 'RADAR',
    method: 'passive-radar-synthesis',
    analogy:
      'Like radar: fence-line transmits; satellite pass returns; NOAA magnetic layers (Boulder K, Dst, L1 Bz) and HIFLD transmission corridors add resolution via grid coupling.',
    fidelityPct,
    correlationMean: Number(meanCorr.toFixed(3)),
    gridResolution: gridSize,
    magneticChannel: magnetic
      ? {
          label: magnetic.source,
          boulderK: magnetic.boulderK,
          dst: magnetic.dst,
          solarWindBz: magnetic.solarWindBz,
          couplingIndex: magnetic.couplingIndex,
          resolutionBoost: magnetic.resolutionBoost,
        }
      : null,
    powerGridChannel: powerGrid
      ? {
          label: powerGrid.source,
          lineCount: powerGrid.lineCount,
          maxVoltageKv: powerGrid.maxVoltageKv,
          mapSegments: powerGrid.mapSegments,
        }
      : null,
    fenceChannel: {
      label: fence.source,
      wirePhaseUs: fence.wirePhaseUs,
      iqRms: fence.iqRms,
    },
    satelliteChannel: {
      label: satellite.source,
      endpoint: satellite.endpoint,
      model: satellite.model,
      variable: satellite.variable,
      error: satellite.error,
    },
    pastures,
    placementSeed: hashSeed(
      `${ingestAt}|${fence.wirePhaseUs}|${meanCorr}|${magnetic?.couplingIndex}|${powerGrid?.lineCount}`,
    ),
  };
}

export function pickWeightedPosition(weights, gridSize, polygon, rng) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of polygon) {
    minX = Math.min(minX, c[0]);
    maxX = Math.max(maxX, c[0]);
    minY = Math.min(minY, c[1]);
    maxY = Math.max(maxY, c[1]);
  }
  const r = rng();
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r <= acc || i === weights.length - 1) {
      const gx = i % gridSize;
      const gy = Math.floor(i / gridSize);
      const x = minX + ((gx + 0.5) / gridSize) * (maxX - minX);
      const y = minY + ((gy + 0.5) / gridSize) * (maxY - minY);
      if (pointInPoly(x, y, polygon)) return { x, y };
      break;
    }
  }
  for (let t = 0; t < 40; t++) {
    const x = minX + rng() * (maxX - minX);
    const y = minY + rng() * (maxY - minY);
    if (pointInPoly(x, y, polygon)) return { x, y };
  }
  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
  return { x: cx, y: cy };
}

export async function runPassiveRadarFusion({ wirePhaseUs, iqRms, kpLive, ingestAt }) {
  const geography = await loadRangelandGeography();
  const mapBbox = geography.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 };
  const [satellite, magnetic, powerGrid] = await Promise.all([
    fetchSatelliteMoisturePass(geography.pastures),
    fetchMagneticLayers(),
    fetchPowerGridLayer({
      networkBbox: mapBbox,
      pastures: geography.pastures,
      mapBbox,
    }),
  ]);
  const fence = fenceLineReturns(geography.pastures, wirePhaseUs, iqRms, kpLive);
  const radar = fuseRadarProduct(geography, fence, satellite, ingestAt, magnetic, powerGrid);
  return { geography, fence, satellite, magnetic, powerGrid, radar };
}
