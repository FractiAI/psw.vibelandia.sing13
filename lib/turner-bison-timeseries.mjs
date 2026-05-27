/**
 * Turner bison — date-range synthesis: historical soil moisture (Open-Meteo) ×
 * passive radar fuse (same fence/satellite/magnetic stack as live).
 * Honesty: sample herd only; positions/weights are model outputs, not collar data.
 */
import {
  loadPublicRegistry,
  fetchNoaaSpaceWeather,
  fetchRfHydrogenProxy,
  wirePhaseMicroseconds,
} from './turner-bison-herd.mjs';
import { turnerAllowSynthetic } from './turner-data-policy.mjs';
import {
  fenceLineReturns,
  fuseRadarProduct,
  loadRangelandGeography,
  pickWeightedPosition,
} from './turner-radar-fusion.mjs';
import { fetchMagneticLayers, fetchPowerGridLayer } from './turner-power-magnetic.mjs';
import {
  fetchHistoricalEt0ByPastureDay,
  historicalEt0ZForDay,
  isoDateMinusDays,
  turnerFusionSurfaceCalibEnabled,
} from './turner-fusion-calibration.mjs';
import { loadPerimeterSteelPack } from './turner-perimeter-steel.mjs';
import {
  fetchHistoricalSkinTempByPastureDay,
  historicalSkinTempZForDay,
  turnerSatelliteLstEnabled,
} from './turner-satellite-lst.mjs';
import { turnerDigitalPruLockEnabled } from './turner-fusion-lock.mjs';

const HIST_FORECAST = 'https://historical-forecast-api.open-meteo.com/v1/forecast';
const ARCHIVE_ERA5 = 'https://archive-api.open-meteo.com/v1/archive';
export const SAMPLE_HEADS = 96;

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

const SEX = { male: 0, female: 1, calf: 2 };

/** Seasonal multiplier — only used when TURNER_ALLOW_SYNTHETIC=1 (legacy). */
function seasonalWeightMul(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const doy = (d.getTime() - start) / 86400000;
  return 0.93 + 0.11 * Math.sin((doy / 365) * Math.PI * 2 - 0.45);
}

function moistureWeightMul(soilM) {
  if (soilM == null || !Number.isFinite(soilM)) return 1;
  const ref = 0.22;
  return 1 + (ref - soilM) * 0.35;
}

function estimateWeightLbs({ id, sex }, meanBase, placementSeed, radarField, dateStr, pastureSoil) {
  if (turnerAllowSynthetic()) {
    const rng = mulberry32(hashSeed(`${id}|${placementSeed}|${dateStr}`));
    let lbs;
    if (sex === SEX.calf) {
      lbs = meanBase * (0.34 + rng() * 0.14);
    } else if (sex === SEX.male) {
      lbs = meanBase * 1.16 * (0.92 + rng() * 0.16);
    } else {
      lbs = meanBase * (0.9 + rng() * 0.2);
    }
    if (radarField != null && Number.isFinite(radarField)) {
      lbs *= 0.93 + Math.min(1, Math.max(0, radarField)) * 0.14;
    }
    lbs *= seasonalWeightMul(dateStr) * moistureWeightMul(pastureSoil);
    return Math.max(200, Math.round(lbs));
  }

  let lbs;
  if (sex === SEX.calf) lbs = meanBase * 0.41;
  else if (sex === SEX.male) lbs = meanBase * 1.16;
  else lbs = meanBase;
  if (radarField != null && Number.isFinite(radarField)) {
    lbs *= 0.93 + Math.min(1, Math.max(0, radarField)) * 0.14;
  }
  if (pastureSoil != null && Number.isFinite(pastureSoil)) {
    lbs *= moistureWeightMul(pastureSoil);
  }
  return Math.max(200, Math.round(lbs));
}

function enumerateDays(startDate, endDate) {
  const out = [];
  const a = new Date(`${startDate}T00:00:00Z`);
  const b = new Date(`${endDate}T00:00:00Z`);
  for (let t = a.getTime(); t <= b.getTime(); t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

function parseISODate(s) {
  if (!s || typeof s !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return { y, mo, d, iso: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
}

export function validateDateRange(startDate, endDate) {
  const s = parseISODate(startDate);
  const e = parseISODate(endDate);
  if (!s || !e) return { ok: false, error: 'invalid_date_format', message: 'Use YYYY-MM-DD for start and end.' };
  if (s.iso > e.iso) return { ok: false, error: 'range_inverted', message: 'Start date must be on or before end date.' };
  const days = enumerateDays(s.iso, e.iso).length;
  if (days < 1) return { ok: false, error: 'range_empty', message: 'Range must include at least one day.' };
  return { ok: true, start: s.iso, end: e.iso, dayCount: days };
}

async function fetchJson(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerTS/1.0' },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Per-pasture daily mean soil moisture (m³/m³) keyed by date string.
 */
export async function fetchHistoricalSoilByPastureDay(pastures, startDate, endDate) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const out = {
    source: null,
    model: null,
    variable: null,
    error: null,
    /** @type {Record<string, Record<string, number|null>>} */
    byPastureDay: {},
  };

  for (const p of withGeo) out.byPastureDay[p.id] = {};

  function ingestBlock(block, pastureId) {
    const hourly = block?.hourly;
    const times = hourly?.time || [];
    const series =
      hourly?.soil_moisture_0_to_1cm ||
      hourly?.soil_moisture_0_to_7cm ||
      hourly?.soil_moisture_0_1cm ||
      [];
    const byDay = {};
    for (let i = 0; i < times.length; i++) {
      const v = num(series[i]);
      if (v == null) continue;
      const day = String(times[i]).slice(0, 10);
      if (!byDay[day]) byDay[day] = { sum: 0, n: 0 };
      byDay[day].sum += v;
      byDay[day].n += 1;
    }
    if (!pastureId) return;
    for (const [day, agg] of Object.entries(byDay)) {
      if (agg.n) out.byPastureDay[pastureId][day] = agg.sum / agg.n;
    }
  }

  try {
    const lat = withGeo.map((p) => p.lat).join(',');
    const lon = withGeo.map((p) => p.lon).join(',');
    const histUrl = `${HIST_FORECAST}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=soil_moisture_0_to_1cm`;
    try {
      const data = await fetchJson(histUrl);
      const blocks = Array.isArray(data) ? data : [data];
      for (let i = 0; i < withGeo.length; i++) {
        const p = withGeo[i];
        const block = blocks[i] ?? blocks[0];
        ingestBlock(block, p.id);
        const hasHour = (block?.hourly?.time || []).length > 0;
        if (hasHour) {
          out.source = 'Open-Meteo · historical forecast (hourly soil moisture 0–1 cm)';
          out.model = 'historical-forecast';
          out.variable = 'soil_moisture_0_to_1cm';
        }
      }
    } catch {
      await Promise.all(
        withGeo.map(async (p) => {
          try {
            const archUrl = `${ARCHIVE_ERA5}?latitude=${p.lat}&longitude=${p.lon}&start_date=${startDate}&end_date=${endDate}&daily=soil_moisture_0_to_7cm`;
            const data = await fetchJson(archUrl);
            const daily = data?.daily;
            const dates = daily?.time || [];
            const vals = daily?.soil_moisture_0_to_7cm || [];
            for (let j = 0; j < dates.length; j++) {
              const v = num(vals[j]);
              const day = String(dates[j]).slice(0, 10);
              if (v != null) out.byPastureDay[p.id][day] = v;
            }
            if (dates.length) {
              out.source = 'Open-Meteo · ERA5 archive (daily soil moisture 0–7 cm)';
              out.model = 'ERA5';
              out.variable = 'soil_moisture_0_to_7cm';
            }
          } catch {
            /* filled below */
          }
        }),
      );
    }
  } catch (e) {
    out.error = e.message || 'soil_history_failed';
  }

  const days = enumerateDays(startDate, endDate);
  const hasAnySoil = withGeo.some((p) => Object.keys(out.byPastureDay[p.id] || {}).length > 0);

  if (out.error || !hasAnySoil) {
    if (turnerAllowSynthetic()) {
      out.source = 'synthetic-fallback (Open-Meteo historical unavailable — TURNER_ALLOW_SYNTHETIC)';
      out.model = 'none';
      out.variable = 'deterministic_placeholder';
      for (const p of withGeo) {
        for (const day of days) {
          const rng = mulberry32(hashSeed(`${p.id}|${day}`));
          out.byPastureDay[p.id][day] = 0.14 + rng() * 0.18;
        }
      }
    } else {
      out.source = null;
      out.model = null;
      out.variable = null;
      if (!out.error) out.error = 'soil_history_unavailable';
    }
  }

  return out;
}

function buildLstPassForDay(lstPack, day, geography) {
  if (!lstPack?.byPastureDay) return null;
  return {
    source: lstPack.source,
    endpoint: lstPack.endpoint,
    parameter: lstPack.parameter,
    model: 'MERRA2',
    error: lstPack.error,
    pastures: geography.pastures.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lon: p.lon,
      skinTempC: lstPack.byPastureDay[p.id]?.[day] ?? null,
      skinTempZ: historicalSkinTempZForDay(lstPack.byPastureDay[p.id], day),
    })),
  };
}

function buildSatelliteSnapshotForDay(soilByPastureDay, day, geography, calOpts = null, lstPack = null) {
  const pastures = geography.pastures.map((pasture) => ({
    id: pasture.id,
    name: pasture.name,
    lat: pasture.lat,
    lon: pasture.lon,
    soilMoistureM3M3: soilByPastureDay[pasture.id]?.[day] ?? null,
    soilMoistureMean: soilByPastureDay[pasture.id]?.[day] ?? null,
    time: `${day}T12:00:00`,
    et0Z:
      calOpts?.enabled && calOpts.et0ZByPasture
        ? calOpts.et0ZByPasture[pasture.id] ?? null
        : null,
    skinTempC: lstPack?.byPastureDay?.[pasture.id]?.[day] ?? null,
    skinTempZ: lstPack
      ? historicalSkinTempZForDay(lstPack.byPastureDay[pasture.id], day)
      : null,
  }));
  return {
    fetchedAt: new Date().toISOString(),
    source: 'Range slice · assimilated soil moisture (daily mean or daily value)',
    endpoint: 'timeseries',
    model: 'per-day',
    variable: 'soil_moisture',
    pastures,
    error: null,
    et0Calibration:
      calOpts?.enabled && calOpts.et0Pack
        ? {
            enabled: true,
            source: `${calOpts.et0Pack.source} · 7d rolling z (UTC ${day})`,
            endpoint: calOpts.et0Pack.endpoint,
            variable: calOpts.et0Pack.variable,
            error: calOpts.et0Pack.error,
          }
        : null,
  };
}

export const MAX_SAMPLE_HEADS = 128;

function sampleSlotsPerPasture(pastures, totalSample) {
  const nP = pastures.length;
  if (!nP || totalSample <= 0) return [];
  const cap = Math.min(Math.max(1, totalSample), MAX_SAMPLE_HEADS);
  const shares = pastures.map((p) => p.headShare || 1 / nP);
  const sSum = shares.reduce((a, b) => a + b, 0);
  const slots = pastures.map((p, i) => ({
    pasture: p,
    count: Math.floor((cap * shares[i]) / sSum),
  }));
  let n = slots.reduce((s, x) => s + x.count, 0);
  let i = 0;
  while (n < cap) {
    slots[i % slots.length].count++;
    n++;
    i++;
  }
  while (n > cap) {
    let j = 0;
    for (let k = 1; k < slots.length; k++) {
      if (slots[k].count > slots[j].count) j = k;
    }
    if (slots[j].count <= 0) break;
    slots[j].count--;
    n--;
  }
  return slots;
}

function polygonCentroid(poly) {
  const sx = poly.reduce((s, c) => s + c[0], 0) / poly.length;
  const sy = poly.reduce((s, c) => s + c[1], 0) / poly.length;
  return { scx: sx, scy: sy };
}

/** Match `TurnerRangelandMap` schematic → WGS84 (pasture-local scaling). */
function schematicToLatLng(x, y, pasture, bbox) {
  const MAP_W = 1000;
  const MAP_H = 620;
  const b = bbox || { west: -114, east: -100, south: 32, north: 48 };
  if (pasture.lat == null || pasture.lon == null) {
    const lat = b.north - (y / MAP_H) * (b.north - b.south);
    const lng = b.west + (x / MAP_W) * (b.east - b.west);
    return { lat, lng };
  }
  const poly = pasture.polygon;
  const pb = polygonBounds(poly);
  const pw = Math.max(pb.maxX - pb.minX, 48);
  const ph = Math.max(pb.maxY - pb.minY, 48);
  const { scx, scy } = polygonCentroid(poly);
  const acreScale = Math.sqrt((pasture.acres || 120000) / 220000);
  const dLon = 1.15 * acreScale * (pw / MAP_W) * (b.east - b.west);
  const dLat = 0.95 * acreScale * (ph / MAP_H) * (b.north - b.south);
  return {
    lat: pasture.lat + ((scy - y) / ph) * dLat,
    lng: pasture.lon + ((x - scx) / pw) * dLon,
  };
}

function polygonBounds(poly) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of poly) {
    minX = Math.min(minX, c[0]);
    maxX = Math.max(maxX, c[0]);
    minY = Math.min(minY, c[1]);
    maxY = Math.max(maxY, c[1]);
  }
  return { minX, maxX, minY, maxY };
}

function sampleBilinearField(x, y, bounds, gridSize, weights) {
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  if (w <= 0 || h <= 0) return 0;
  const u = ((x - bounds.minX) / w) * gridSize - 0.5;
  const v = ((y - bounds.minY) / h) * gridSize - 0.5;
  const gx = Math.floor(u);
  const gy = Math.floor(v);
  const fx = u - gx;
  const fy = v - gy;
  const at = (ix, iy) => {
    const cx = Math.max(0, Math.min(gridSize - 1, ix));
    const cy = Math.max(0, Math.min(gridSize - 1, iy));
    return weights[cy * gridSize + cx] ?? 0;
  };
  return (
    at(gx, gy) * (1 - fx) * (1 - fy) +
    at(gx + 1, gy) * fx * (1 - fy) +
    at(gx, gy + 1) * (1 - fx) * fy +
    at(gx + 1, gy + 1) * fx * fy
  );
}

/**
 * Date-range pipeline: soil history → daily radar fuse → sampled head trajectories.
 * @param {object} opts
 * @param {boolean} [opts.snapshotsOnly] — synthesize only range start and end (herd export default).
 */
export async function runTurnerBisonTimeseries({
  startDate,
  endDate,
  sampleSize = SAMPLE_HEADS,
  snapshotsOnly = false,
} = {}) {
  const vr = validateDateRange(startDate, endDate);
  if (!vr.ok) return { ok: false, ...vr };

  const cappedSample = Math.min(Math.max(8, sampleSize), MAX_SAMPLE_HEADS);

  const geography = await loadRangelandGeography();
  const registry = await loadPublicRegistry();
  const meanBase = registry.operationalBaseline?.meanWeightLbs ?? 1100;
  const mapBbox = geography.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 };

  const surfaceCalib = turnerFusionSurfaceCalibEnabled();
  const lstOn = turnerSatelliteLstEnabled();
  const et0ArchiveStart = surfaceCalib ? isoDateMinusDays(vr.start, 7) : vr.start;
  const lstArchiveStart = lstOn ? isoDateMinusDays(vr.start, 7) : vr.start;

  const [magnetic, powerGrid, soilPack, noaa, rf, et0Pack, lstPack, steelPack] = await Promise.all([
    fetchMagneticLayers(),
    fetchPowerGridLayer({
      networkBbox: mapBbox,
      pastures: geography.pastures,
      mapBbox,
    }),
    fetchHistoricalSoilByPastureDay(geography.pastures, vr.start, vr.end),
    fetchNoaaSpaceWeather(),
    fetchRfHydrogenProxy(),
    surfaceCalib ? fetchHistoricalEt0ByPastureDay(geography.pastures, et0ArchiveStart, vr.end) : Promise.resolve(null),
    lstOn ? fetchHistoricalSkinTempByPastureDay(geography.pastures, lstArchiveStart, vr.end) : Promise.resolve(null),
    loadPerimeterSteelPack(geography),
  ]);

  const days = enumerateDays(vr.start, vr.end);
  const synthesisDays =
    snapshotsOnly && vr.start !== vr.end ? [vr.start, vr.end] : snapshotsOnly ? [vr.start] : days;
  const withGeoP = geography.pastures.filter((p) => p.lat != null && p.lon != null);

  function soilComplete() {
    for (const p of withGeoP) {
      for (const day of days) {
        const v = soilPack.byPastureDay[p.id]?.[day];
        if (v == null || !Number.isFinite(v)) return false;
      }
    }
    return withGeoP.length > 0;
  }

  if (!turnerAllowSynthetic()) {
    if (soilPack.error || !soilComplete()) {
      return {
        ok: false,
        code: 'incomplete_soil_history',
        message:
          'Real-data policy: Open-Meteo must return soil moisture for every geolocated pasture on every day in the range (no synthetic fill). Narrow the range, verify dates, or set TURNER_ALLOW_SYNTHETIC=1 for legacy fallback.',
        soilHistory: {
          source: soilPack.source,
          model: soilPack.model,
          variable: soilPack.variable,
          error: soilPack.error,
        },
      };
    }
  }

  const kpLive = noaa.kpIndex;
  const wirePhaseUs = wirePhaseMicroseconds(rf.iqRms, kpLive);
  const geoBbox = geography.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 };

  const soilById = Object.fromEntries(
    geography.pastures.map((p) => [p.id, soilPack.byPastureDay[p.id]?.[days[0]] ?? null]),
  );
  const lstById = lstPack
    ? Object.fromEntries(
        geography.pastures.map((p) => [
          p.id,
          {
            skinTempZ: historicalSkinTempZForDay(lstPack.byPastureDay[p.id], days[0]),
          },
        ]),
      )
    : {};
  const fence = fenceLineReturns(
    geography.pastures,
    wirePhaseUs,
    rf.iqRms,
    kpLive,
    rf.spectrumChunkRmss ?? null,
    {
      steelPack,
      lstById,
      soilById,
      networkBbox: geoBbox,
      digitalPruLock: turnerDigitalPruLockEnabled(),
    },
  );

  const { fetchOpenMeteoLaiPass } = await import('./turner-cross-source-fidelity.mjs');
  const laiPass = await fetchOpenMeteoLaiPass(geography.pastures);

  const daily = [];

  for (const day of synthesisDays) {
    const calOpts =
      surfaceCalib && et0Pack
        ? {
            enabled: true,
            et0Pack,
            et0ZByPasture: Object.fromEntries(
              geography.pastures.map((p) => [
                p.id,
                historicalEt0ZForDay(et0Pack.byPastureDay[p.id], day),
              ]),
            ),
          }
        : null;
    const satellite = buildSatelliteSnapshotForDay(
      soilPack.byPastureDay,
      day,
      geography,
      calOpts,
      lstPack,
    );
    const ingestAt = `${day}T12:00:00.000Z`;
    const lstPass = buildLstPassForDay(lstPack, day, geography);
    const radar = fuseRadarProduct(geography, fence, satellite, ingestAt, magnetic, powerGrid, lstPass);
    const { enrichRadarWithCrossSource } = await import('./turner-cross-source-fidelity.mjs');
    await enrichRadarWithCrossSource(radar, {
      geography,
      satellite,
      lstPass,
      fence,
      magnetic,
      powerGrid,
      steelPack,
      iqRms: rf.iqRms,
      spectrumChunkCount: rf.spectrumChunkRmss?.length ?? null,
      kpLive,
      syntheticDataAllowed: turnerAllowSynthetic(),
      laiPass,
    });
    const radarByPasture = Object.fromEntries((radar.pastures || []).map((rp) => [rp.id, rp]));

    const slots = sampleSlotsPerPasture(geography.pastures, cappedSample);
    const animals = [];
    let slot = 0;
    for (const { pasture: p, count } of slots) {
      const poly = p.polygon;
      const rp = radarByPasture[p.id];
      const gridSize = rp?.gridSize || 24;
      const weights = rp?.weights;
      const bounds = polygonBounds(poly);
      const pastureSoil = soilPack.byPastureDay[p.id]?.[day] ?? null;
      const sexCycle = [SEX.male, SEX.female, SEX.calf];
      for (let n = 0; n < count; n++) {
        const id = `ts-${p.id}-${n}`;
        const sex = sexCycle[slot % 3];
        slot++;
        const placementSeed = radar.placementSeed;
        const rng = mulberry32(hashSeed(`${id}|${day}|${placementSeed}`));
        const posConf = rp?.crossSource?.placementConfidence ?? 1;
        const pos = weights?.length
          ? pickWeightedPosition(weights, gridSize, poly, rng, posConf)
          : { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
        let radarField = null;
        if (weights?.length) {
          radarField = sampleBilinearField(pos.x, pos.y, bounds, gridSize, weights);
        }
        const weightLbs = estimateWeightLbs(
          { id, sex },
          meanBase,
          placementSeed,
          radarField,
          day,
          pastureSoil,
        );
        const ll = schematicToLatLng(pos.x, pos.y, p, geoBbox);
        const rec = {
          id,
          sex,
          pastureId: p.id,
          pastureName: p.name,
          x: pos.x,
          y: pos.y,
          lat: Number(ll.lat.toFixed(5)),
          lng: Number(ll.lng.toFixed(5)),
          weightLbs,
          date: day,
        };
        animals.push(rec);
      }
    }

    daily.push({
      date: day,
      radar: {
        fidelityPct: radar.fidelityPct,
        correlationMean: radar.correlationMean,
        placementSeed: radar.placementSeed,
        collarGradeProximityPct: radar.collarGradeProximityPct ?? null,
        crossSource: radar.crossSource
          ? {
              collarGradeProximityPct: radar.crossSource.collarGradeProximityPct,
              meanPlacementConfidence: radar.crossSource.meanPlacementConfidence,
            }
          : null,
      },
      soilByPasture: geography.pastures.map((pasture) => ({
        id: pasture.id,
        soilMoisture: soilPack.byPastureDay[pasture.id]?.[day] ?? null,
      })),
      herdMeanWeightLbs: animals.length
        ? Math.round(animals.reduce((s, a) => s + a.weightLbs, 0) / animals.length)
        : null,
      animals,
    });
  }

  return {
    ok: true,
    dataPolicy: turnerAllowSynthetic() ? 'mixed_synthetic_allowed' : 'real_sources_only',
    syntheticDataAllowed: turnerAllowSynthetic(),
    honesty: {
      note: turnerAllowSynthetic()
        ? 'Legacy: synthetic soil fallback may be used if Open-Meteo is incomplete. Fence coupling may use spatial phase fiction when TURNER_ALLOW_SYNTHETIC=1.'
        : 'Soil moisture is only Open-Meteo historical forecast or ERA5 archive (full coverage required). Fence coupling for the range uses the same live NOAA Kp / OpenWebRX IQ snapshot as the current ingest (not per-historical-day Kp). Weights use registry mean + real soil only (no RNG spread). Sample size capped — not every head.',
      groundCollaboration:
        'Default RF: internet OpenWebRX + live fence coordinates (no on-premise Turner SDR required). Optional on-premise receive-only SDR can upgrade ability and fidelity when deployed. Accuracy improves when tuned with Turner teams on the ground (boundaries, fence corrections, seasonal baselines).',
    },
    range: { start: vr.start, end: vr.end, dayCount: days.length },
    exportKind: snapshotsOnly ? 'start_end_snapshots' : 'daily',
    snapshotDates: synthesisDays,
    soilHistory: {
      source: soilPack.source,
      model: soilPack.model,
      variable: soilPack.variable,
      error: soilPack.error,
    },
    sampleSize: cappedSample,
    sampleCount: daily[0]?.animals?.length ?? 0,
    daily,
    documentRef: registry.documentRef,
  };
}
