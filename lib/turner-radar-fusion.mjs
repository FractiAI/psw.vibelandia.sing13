/**
 * Passive radar synthesis — fence-line returns × satellite pass → herd placement field.
 * Operates like radar: transmit (1420 MHz fence waveguide), receive (PLL gates + satellite reflectivity).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EGS_PHI } from './turner-bison-herd.mjs';
import { turnerAllowSynthetic } from './turner-data-policy.mjs';
import { mapSpectrumToGateCoupling, normalizeCouplingShape } from './sdr-fence-spectrum.mjs';
import {
  effectiveRadarGrid,
  fetchMagneticLayers,
  fetchPowerGridLayer,
  magneticGridBoost,
} from './turner-power-magnetic.mjs';
import {
  fetchForecastEt0CalibrationPack,
  fusionCalibrationEt0Weight,
  fusionCalibrationSdrMapWeight,
  turnerFusionSurfaceCalibEnabled,
} from './turner-fusion-calibration.mjs';
import { resolveSteelGatesForPasture } from './turner-perimeter-steel.mjs';
import { fetchSatelliteSkinTempPass, turnerSatelliteLstEnabled } from './turner-satellite-lst.mjs';
import {
  computePastureLockIn,
  fusionLockLstWeight,
  fusionLockSteelWeight,
  steelProximityBoost,
  turnerDigitalPruLockEnabled,
} from './turner-fusion-lock.mjs';

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

export function fenceLineReturns(pastures, wirePhaseUs, iqRms, kpLive, spectrumChunks = null, opts = {}) {
  const pll = num(wirePhaseUs);
  const rms = num(iqRms);
  const kp = num(kpLive);
  const steelPack = opts.steelPack || null;
  const lstById = opts.lstById || {};
  const soilById = opts.soilById || {};
  const bbox = opts.networkBbox || { west: -114, east: -100, south: 32, north: 48 };
  const digitalPruGate = opts.digitalPruLock === true;
  const pasturesOut = [];
  let fenceMeta = {
    source: '',
    wirePhaseUs: pll,
    iqRms: rms,
    kpLive: kp,
    usedSpectrumMapping: false,
    usedSteelGates: false,
    fencePulseUs: pll,
  };

  for (const pasture of pastures) {
    const steelGates = steelPack?.byPasture
      ? resolveSteelGatesForPasture(pasture, steelPack.byPasture, bbox, 40)
      : null;
    const gates =
      steelGates && steelGates.length >= 4 ? steelGates : perimeterGates(pasture.polygon, 40);
    const usedSteel = !!(steelGates && steelGates.length >= 4);
    if (usedSteel) fenceMeta.usedSteelGates = true;

    let returns;
    let sourceLabel;
    let usedSpectrumThis = false;

    if (!turnerAllowSynthetic()) {
      const massCoupling = (rms != null ? rms * 420 : 0) + (kp != null ? kp * 0.12 : 0);
      const pllAdj = pll != null ? pll * 0.02 : 0;
      const pulseBoost = pll != null ? 1 + Math.min(0.12, pll * 0.004) : 1;
      const strengthBase = Math.max(0, (massCoupling + pllAdj) * pulseBoost);

      let perGateShape = null;
      if (Array.isArray(spectrumChunks) && spectrumChunks.length >= 4) {
        const raw = mapSpectrumToGateCoupling(spectrumChunks, gates.length);
        if (raw) perGateShape = normalizeCouplingShape(raw, 0.42);
      }

      if (perGateShape && perGateShape.length === gates.length) {
        usedSpectrumThis = true;
        fenceMeta.usedSpectrumMapping = true;
        returns = gates.map((gate, i) => ({
          ...gate,
          strength: Number((strengthBase * perGateShape[i] * (usedSteel ? 1.06 : 1)).toFixed(4)),
        }));
        sourceLabel = usedSteel
          ? 'OSM / survey fence gates × OpenWebRX spectrum chunks (fence pulse PLL × SDR along mapped barrier=fence line; not collar GPS)'
          : 'Perimeter gates · per-gate coupling from real OpenWebRX downstream (contiguous RMS slices along FFT/IQ/demod buffer; spectral proxy along RX passband, not discrete ranch transducers)';
      } else {
        returns = gates.map((gate) => ({
          ...gate,
          strength: Number((strengthBase * (usedSteel ? 1.04 : 1)).toFixed(4)),
        }));
        sourceLabel = usedSteel
          ? 'OSM / survey fence perimeter · uniform SDR/Kp coupling along mapped fence vertices (Overpass or data/turner-perimeter-steel.geojson override)'
          : 'Perimeter gate grid · uniform coupling from live NOAA Kp and/or OpenWebRX IQ RMS (no synthetic spatial phase)';
      }
    } else {
      const pll2 = pll ?? 8.2;
      const rms2 = rms ?? 0.01;
      const kp2 = kp ?? 1;
      returns = gates.map((gate) => {
        const phase = Math.sin((gate.index / gates.length) * Math.PI * 2 + pll2 / EGS_PHI);
        const massCoupling = rms2 * 420 + kp2 * 0.12;
        const strength = Math.max(0, phase * massCoupling + pll2 * 0.02);
        return { ...gate, strength: Number(strength.toFixed(4)) };
      });
      sourceLabel = 'High-tensile perimeter fence · 1420 MHz Goubau waveguide (legacy synthetic phase)';
    }

    const mean = returns.reduce((s, r) => s + r.strength, 0) / returns.length;
    const lockIn = computePastureLockIn({
      wirePhaseUs: pll,
      iqRms: rms,
      kpLive: kp,
      soilMoisture: soilById[pasture.id] ?? null,
      skinTempZ: lstById[pasture.id]?.skinTempZ ?? null,
      usedSteelGates: usedSteel,
      usedSpectrumMapping: usedSpectrumThis,
      digitalPruGate,
    });
    pasturesOut.push({
      id: pasture.id,
      name: pasture.name,
      gateCount: gates.length,
      meanReturn: Number(mean.toFixed(4)),
      returns,
      steelGates: usedSteel ? gates : null,
      lockIn,
      gateSource: usedSteel ? 'gps-steel' : 'schematic-perimeter',
    });
    if (!fenceMeta.source) fenceMeta.source = sourceLabel;
  }

  return {
    source: fenceMeta.source,
    wirePhaseUs: fenceMeta.wirePhaseUs,
    fencePulseUs: fenceMeta.fencePulseUs,
    iqRms: fenceMeta.iqRms,
    kpLive: fenceMeta.kpLive,
    passiveSdrSpectrumMapping: fenceMeta.usedSpectrumMapping,
    usedSteelGates: fenceMeta.usedSteelGates,
    pastures: pasturesOut,
  };
}

function gridCellReflectivity(
  cx,
  cy,
  gates,
  satMoisture,
  pastureId,
  powerGrid,
  magnetic,
  satBaseline = 0.22,
  lockOpts = null,
) {
  let fenceSum = 0;
  for (const g of gates) {
    const d = Math.hypot(cx - g.x, cy - g.y);
    fenceSum += g.strength * Math.exp(-d / 85);
  }
  const pad = turnerAllowSynthetic() ? 0.15 : 0;
  const satAnom =
    satMoisture != null ? Math.max(0, satBaseline - satMoisture) + pad : pad;
  const lstZ = lockOpts?.skinTempZ;
  const lstTerm = lstZ != null ? Math.tanh(lstZ / 1.35) * 0.08 : 0;
  const magBoost = magneticGridBoost(cx, cy, powerGrid, magnetic, pastureId);
  const steelBoost = steelProximityBoost(
    cx,
    cy,
    lockOpts?.steelGates,
    lockOpts?.lockIn ?? 0,
  );
  return fenceSum * (0.55 + satAnom * 1.8 + lstTerm) * magBoost * steelBoost;
}

export function fuseRadarProduct(geography, fence, satellite, ingestAt, magnetic, powerGrid, lstPass = null) {
  const gridSize = effectiveRadarGrid(BASE_GRID, magnetic, powerGrid);
  const satById = Object.fromEntries((satellite.pastures || []).map((p) => [p.id, p]));
  const fenceById = Object.fromEntries((fence.pastures || []).map((p) => [p.id, p]));

  const sdrAdj =
    fence.passiveSdrSpectrumMapping === true ? fusionCalibrationSdrMapWeight() : 0;
  const lstById = Object.fromEntries((lstPass?.pastures || []).map((p) => [p.id, p]));

  const pastures = [];
  let corrSum = 0;
  let corrN = 0;

  for (const pasture of geography.pastures) {
    const f = fenceById[pasture.id];
    const s = satById[pasture.id];
    const satM = s?.soilMoistureM3M3 ?? s?.soilMoistureMean ?? null;
    const fenceMean = f?.meanReturn ?? (turnerAllowSynthetic() ? 0.1 : 0);
    const moistureTerm = satM != null ? (0.25 - satM) * 0.6 : 0;
    const pg = powerGrid?.pastures?.find((p) => p.id === pasture.id);
    const gridLeverage = pg?.magneticLeverage ?? 0;
    const et0Z = num(s?.et0Z);
    const et0CalOn = satellite.et0Calibration?.enabled === true;
    const et0Adj =
      et0CalOn && et0Z != null ? Math.tanh(et0Z / 1.15) * fusionCalibrationEt0Weight() : 0;
    const lstZ = num(lstById[pasture.id]?.skinTempZ);
    const lstAdj = lstZ != null ? Math.tanh(lstZ / 1.2) * fusionLockLstWeight() : 0;
    const lockIn = f?.lockIn ?? null;
    const steelAdj = f?.gateSource === 'gps-steel' && lockIn != null ? lockIn * fusionLockSteelWeight() : 0;
    const raw =
      0.78 +
      fenceMean * 0.04 +
      moistureTerm +
      gridLeverage * 0.12 +
      (magnetic?.couplingIndex ?? 0) * 0.08 +
      et0Adj +
      sdrAdj +
      lstAdj +
      steelAdj;
    const correlation = Number(
      (turnerAllowSynthetic() ? Math.min(0.995, Math.max(0.72, raw)) : Math.min(1, Math.max(0, raw))).toFixed(3),
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
          ? gridCellReflectivity(x, y, gates, satM, pasture.id, powerGrid, magnetic, 0.22, {
              steelGates: f?.steelGates,
              lockIn: f?.lockIn,
              skinTempZ: lstZ,
            })
          : 0;
        weights.push(Number(w.toFixed(5)));
      }
    }
    const smoothed = smoothWeightField(weights, gridSize);
    const sum = smoothed.reduce((a, b) => a + b, 0) || 1;

    pastures.push({
      id: pasture.id,
      name: pasture.name,
      correlation,
      fenceMeanReturn: fenceMean,
      satelliteSoilMoisture: satM,
      et0Z: et0CalOn ? et0Z : null,
      skinTempC: lstById[pasture.id]?.skinTempC ?? null,
      skinTempZ: lstZ,
      lockIn: lockIn ?? null,
      gateSource: f?.gateSource ?? 'schematic-perimeter',
      transmissionLines: pg?.lineCount ?? 0,
      maxVoltageKv: pg?.maxVoltageKv ?? 0,
      magneticLeverage: gridLeverage,
      gridSize,
      weights: smoothed.map((w) => Number((w / sum).toFixed(6))),
      placementMode: 'continuous-field',
    });
  }

  const meanCorr = corrN ? corrSum / corrN : 0;
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
      fencePulseUs: fence.fencePulseUs ?? fence.wirePhaseUs,
      iqRms: fence.iqRms,
      passiveSdrSpectrumMapping: fence.passiveSdrSpectrumMapping === true,
      usedSteelGates: fence.usedSteelGates === true,
    },
    surfaceTempChannel: lstPass
      ? {
          label: lstPass.source,
          endpoint: lstPass.endpoint,
          parameter: lstPass.parameter,
          model: lstPass.model,
          error: lstPass.error,
        }
      : null,
    triangulatedLock: {
      digitalPruGate: turnerDigitalPruLockEnabled(),
      meanLockIn: Number(
        (
          pastures.reduce((s, p) => s + (p.lockIn ?? 0), 0) / Math.max(1, pastures.length)
        ).toFixed(3),
      ),
      note:
        'Lock-in = fence pulse (PLL µs) + OpenWebRX SDR + NASA POWER skin temp + soil moisture + optional GPS steel gates. Digital Pru = φ-gated coherence stack — not collar GPS or per-animal steel detection.',
    },
    satelliteChannel: {
      label: satellite.source,
      endpoint: satellite.endpoint,
      model: satellite.model,
      variable: satellite.variable,
      error: satellite.error,
      et0Calibration: satellite.et0Calibration || null,
    },
    fusionCalibration: {
      note:
        'Optional bounded nudges to pseudo-correlation: ET₀ z-score (Open-Meteo FAO-56, not NDVI) when TURNER_FUSION_SURFACE_CALIB=1, plus small bump when real per-gate OpenWebRX spectrum mapping is active — not collar-grade truth.',
      et0Weight: fusionCalibrationEt0Weight(),
      sdrMappedGateWeight: fusionCalibrationSdrMapWeight(),
      surfaceCalibEnv: turnerFusionSurfaceCalibEnabled(),
      passiveSdrSpectrumMapping: fence.passiveSdrSpectrumMapping === true,
    },
    pastures,
    placementSeed: hashSeed(
      `${ingestAt}|${fence.wirePhaseUs}|${meanCorr}|${magnetic?.couplingIndex}|${powerGrid?.lineCount}`,
    ),
  };
}

function polygonBounds(polygon) {
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
  return { minX, maxX, minY, maxY };
}

/** Blur discrete radar cells so placement uses a continuous field, not a visible lattice */
function smoothWeightField(weights, gridSize) {
  const out = new Array(weights.length);
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let s = 0;
      let c = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ix = gx + dx;
          const iy = gy + dy;
          if (ix >= 0 && ix < gridSize && iy >= 0 && iy < gridSize) {
            const kernel = dx === 0 && dy === 0 ? 3 : Math.abs(dx) + Math.abs(dy) === 1 ? 2 : 1;
            s += weights[iy * gridSize + ix] * kernel;
            c += kernel;
          }
        }
      }
      out[gy * gridSize + gx] = c ? s / c : 0;
    }
  }
  return out;
}

function sampleBilinearField(x, y, bounds, gridSize, weights) {
  const { minX, maxX, minY, maxY } = bounds;
  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= 0 || h <= 0) return 0;
  const u = ((x - minX) / w) * gridSize - 0.5;
  const v = ((y - minY) / h) * gridSize - 0.5;
  const gx = Math.floor(u);
  const gy = Math.floor(v);
  const fx = u - gx;
  const fy = v - gy;
  const at = (ix, iy) => {
    const cx = Math.max(0, Math.min(gridSize - 1, ix));
    const cy = Math.max(0, Math.min(gridSize - 1, iy));
    return weights[cy * gridSize + cx] ?? 0;
  };
  const w00 = at(gx, gy);
  const w10 = at(gx + 1, gy);
  const w01 = at(gx, gy + 1);
  const w11 = at(gx + 1, gy + 1);
  return w00 * (1 - fx) * (1 - fy) + w10 * fx * (1 - fy) + w01 * (1 - fx) * fy + w11 * fx * fy;
}

/**
 * Continuous radar-field placement — rejects lattice snap to cell centers.
 */
export function pickWeightedPosition(weights, gridSize, polygon, rng, positionConfidence = 1) {
  const bounds = polygonBounds(polygon);
  let maxW = 0;
  for (const w of weights) if (w > maxW) maxW = w;
  const conf = Number.isFinite(positionConfidence)
    ? Math.min(1, Math.max(0.15, positionConfidence))
    : 1;
  const acceptScale = 0.62 + 0.38 * conf;

  if (maxW > 0) {
    for (let t = 0; t < 56; t++) {
      const x = bounds.minX + rng() * (bounds.maxX - bounds.minX);
      const y = bounds.minY + rng() * (bounds.maxY - bounds.minY);
      if (!pointInPoly(x, y, polygon)) continue;
      const field = sampleBilinearField(x, y, bounds, gridSize, weights);
      if (rng() < (field / maxW) * acceptScale) {
        const cellW = (bounds.maxX - bounds.minX) / gridSize;
        const cellH = (bounds.maxY - bounds.minY) / gridSize;
        return {
          x: x + (rng() - 0.5) * cellW * 0.85,
          y: y + (rng() - 0.5) * cellH * 0.85,
        };
      }
    }
  }

  for (let t = 0; t < 40; t++) {
    const x = bounds.minX + rng() * (bounds.maxX - bounds.minX);
    const y = bounds.minY + rng() * (bounds.maxY - bounds.minY);
    if (pointInPoly(x, y, polygon)) return { x, y };
  }
  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
  return { x: cx, y: cy };
}

export async function runPassiveRadarFusion({
  wirePhaseUs,
  iqRms,
  kpLive,
  ingestAt,
  spectrumChunks = null,
  syntheticDataAllowed = false,
} = {}) {
  const geography = await loadRangelandGeography();
  const mapBbox = geography.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 };
  const surfaceCalib = turnerFusionSurfaceCalibEnabled();
  const lstOn = turnerSatelliteLstEnabled();
  const { loadPerimeterSteelPack } = await import('./turner-perimeter-steel.mjs');
  const [satellite, et0Pack, lstPass, magnetic, powerGrid] = await Promise.all([
    fetchSatelliteMoisturePass(geography.pastures),
    surfaceCalib ? fetchForecastEt0CalibrationPack(geography.pastures) : Promise.resolve(null),
    lstOn ? fetchSatelliteSkinTempPass(geography.pastures) : Promise.resolve(null),
    fetchMagneticLayers(),
    fetchPowerGridLayer({
      networkBbox: mapBbox,
      pastures: geography.pastures,
      mapBbox,
    }),
  ]);
  const steelPack = await loadPerimeterSteelPack(geography);
  if (surfaceCalib && et0Pack) {
    const zById = Object.fromEntries((et0Pack.pastures || []).map((x) => [x.id, x.et0Z]));
    satellite.et0Calibration = {
      enabled: true,
      fetchedAt: et0Pack.fetchedAt,
      source: et0Pack.source,
      endpoint: et0Pack.endpoint,
      variable: et0Pack.variable,
      error: et0Pack.error,
    };
    satellite.pastures = (satellite.pastures || []).map((p) => ({
      ...p,
      et0Z: zById[p.id] ?? null,
    }));
  }
  const soilById = Object.fromEntries(
    (satellite.pastures || []).map((p) => [p.id, p.soilMoistureM3M3 ?? p.soilMoistureMean]),
  );
  const lstById = Object.fromEntries((lstPass?.pastures || []).map((p) => [p.id, p]));
  const fence = fenceLineReturns(geography.pastures, wirePhaseUs, iqRms, kpLive, spectrumChunks, {
    steelPack,
    lstById,
    soilById,
    networkBbox: mapBbox,
    digitalPruLock: turnerDigitalPruLockEnabled(),
  });
  const radar = fuseRadarProduct(geography, fence, satellite, ingestAt, magnetic, powerGrid, lstPass);
  const { enrichRadarWithCrossSource } = await import('./turner-cross-source-fidelity.mjs');
  const { laiPass } = await enrichRadarWithCrossSource(radar, {
    geography,
    satellite,
    lstPass,
    fence,
    magnetic,
    powerGrid,
    steelPack,
    iqRms,
    spectrumChunkCount: spectrumChunks?.length ?? null,
    kpLive,
    syntheticDataAllowed,
  });
  return { geography, fence, satellite, lstPass, steelPack, magnetic, powerGrid, radar, laiPass };
}
