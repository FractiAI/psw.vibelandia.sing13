/**
 * Optional Turner passive-radar fusion calibration — bounded nudges to pseudo-correlation only.
 * ET₀: Open-Meteo FAO-56 reference evapotranspiration (mm/day) — surface/atmosphere demand, not NDVI or collar truth.
 * @see https://open-meteo.com/en/docs (forecast / archive daily variables)
 */

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function turnerFusionSurfaceCalibEnabled() {
  const v = String(process.env.TURNER_FUSION_SURFACE_CALIB || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/** Max swing added to raw correlation before clamp (keep small). */
export function fusionCalibrationEt0Weight() {
  const w = Number(process.env.TURNER_FUSION_CAL_ET0_WEIGHT);
  return Number.isFinite(w) && w >= 0 ? Math.min(w, 0.08) : 0.018;
}

export function fusionCalibrationSdrMapWeight() {
  const w = Number(process.env.TURNER_FUSION_CAL_SDR_MAP_WEIGHT);
  return Number.isFinite(w) && w >= 0 ? Math.min(w, 0.06) : 0.014;
}

function stdSample(vals) {
  if (vals.length < 2) return 0;
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  let s2 = 0;
  for (const v of vals) s2 += (v - m) * (v - m);
  return Math.sqrt(s2 / (vals.length - 1));
}

/**
 * Live / forecast: z-score of first-day ET₀ vs mean/std of first 7 forecast days (same model run).
 */
export function forecastEt0ZScore(dailyEt0Mm) {
  const series = (dailyEt0Mm || []).slice(0, 7).map(num).filter((v) => v != null);
  if (series.length < 4) return null;
  const today = series[0];
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const sd = stdSample(series);
  if (sd < 1e-4) return 0;
  const z = (today - mean) / sd;
  return Math.max(-2.5, Math.min(2.5, z));
}

/**
 * Historical: rolling 7-day window ending on `day` (inclusive), z = (ET₀(day) − mean) / std.
 * `byDay` may include prior days before the user range for lookback.
 */
export function historicalEt0ZForDay(byDay, day) {
  if (!byDay || typeof byDay !== 'object') return null;
  const anchor = new Date(`${day}T12:00:00Z`);
  const windowVals = [];
  for (let k = 0; k < 7; k++) {
    const t = new Date(anchor.getTime() - k * 86400000);
    const iso = t.toISOString().slice(0, 10);
    const v = num(byDay[iso]);
    if (v != null) windowVals.push({ iso, v });
  }
  if (windowVals.length < 4) return null;
  const todayVal = num(byDay[day]);
  if (todayVal == null) return null;
  const vals = windowVals.map((x) => x.v);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = stdSample(vals);
  if (sd < 1e-4) return 0;
  const z = (todayVal - mean) / sd;
  return Math.max(-2.5, Math.min(2.5, z));
}

export async function fetchForecastEt0CalibrationPack(pastures) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const out = {
    fetchedAt: new Date().toISOString(),
    source:
      'Open-Meteo · daily FAO-56 reference evapotranspiration (ET₀, mm) — meteorological surface drying demand; not vegetation index, biomass, or animal telemetry',
    endpoint: FORECAST_API,
    variable: 'et0_fao_evapotranspiration',
    forecastDays: 10,
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
    const url = `${FORECAST_API}?latitude=${lat}&longitude=${lon}&daily=et0_fao_evapotranspiration&forecast_days=${out.forecastDays}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 16000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerFusionCal/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`et0 ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];
    withGeo.forEach((pasture, i) => {
      const block = list[i] || list[0];
      const daily = block?.daily?.et0_fao_evapotranspiration || [];
      const times = block?.daily?.time || [];
      const z = forecastEt0ZScore(daily);
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        lat: pasture.lat,
        lon: pasture.lon,
        et0ForecastMm: daily.map(num),
        et0TimeLabels: times,
        et0Z: z,
      });
    });
  } catch (e) {
    out.error = e.message || 'et0_forecast_failed';
    withGeo.forEach((pasture) => {
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        lat: pasture.lat,
        lon: pasture.lon,
        et0ForecastMm: [],
        et0TimeLabels: [],
        et0Z: null,
      });
    });
  }

  return out;
}

/**
 * Per-pasture daily ET₀ (mm) for [extendedStart, endDate] — use extendedStart = start − 7d for z-score lookback.
 */
export async function fetchHistoricalEt0ByPastureDay(pastures, extendedStartDate, endDate) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const out = {
    source: 'Open-Meteo · archive daily FAO-56 ET₀ (mm)',
    endpoint: ARCHIVE_API,
    variable: 'et0_fao_evapotranspiration',
    error: null,
    /** @type {Record<string, Record<string, number|null>>} */
    byPastureDay: {},
  };

  for (const p of withGeo) out.byPastureDay[p.id] = {};

  if (!withGeo.length) return out;

  try {
    const lat = withGeo.map((p) => p.lat).join(',');
    const lon = withGeo.map((p) => p.lon).join(',');
    const url = `${ARCHIVE_API}?latitude=${lat}&longitude=${lon}&start_date=${extendedStartDate}&end_date=${endDate}&daily=et0_fao_evapotranspiration`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 22000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerFusionCal/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];
    for (let i = 0; i < withGeo.length; i++) {
      const p = withGeo[i];
      const block = list[i] || list[0];
      const dates = block?.daily?.time || [];
      const vals = block?.daily?.et0_fao_evapotranspiration || [];
      for (let j = 0; j < dates.length; j++) {
        const day = String(dates[j]).slice(0, 10);
        const v = num(vals[j]);
        if (v != null) out.byPastureDay[p.id][day] = v;
      }
    }
  } catch (e) {
    out.error = e.message || 'et0_history_failed';
  }

  return out;
}

/** ISO date string YYYY-MM-DD minus `days` calendar days (UTC). */
export function isoDateMinusDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
