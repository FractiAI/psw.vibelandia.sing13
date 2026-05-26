/**
 * Satellite-class surface temperature (IR / skin temp proxy) via NASA POWER (MERRA-2 TS).
 * Not thermal camera on animals — regional earth-skin temperature at pasture centroid.
 * @see https://power.larc.nasa.gov/docs/services/api/temporal/daily/point/
 */
const POWER_DAILY = 'https://power.larc.nasa.gov/api/temporal/daily/point';

function num(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= -900) return null;
  return n;
}

export function turnerSatelliteLstEnabled() {
  const v = String(process.env.TURNER_SATELLITE_LST || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return true;
}

function stdSample(vals) {
  if (vals.length < 2) return 0;
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  let s2 = 0;
  for (const v of vals) s2 += (v - m) * (v - m);
  return Math.sqrt(s2 / (vals.length - 1));
}

export function skinTempZScoreC(seriesC) {
  const vals = (seriesC || []).map(num).filter((v) => v != null);
  if (vals.length < 4) return null;
  const today = vals[vals.length - 1];
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = stdSample(vals);
  if (sd < 1e-4) return 0;
  const z = (today - mean) / sd;
  return Math.max(-2.5, Math.min(2.5, z));
}

/** Rolling 7-day z for a single UTC day (timeseries mode). */
export function historicalSkinTempZForDay(byDay, day) {
  if (!byDay || typeof byDay !== 'object') return null;
  const anchor = new Date(`${day}T12:00:00Z`);
  const series = [];
  for (let k = 6; k >= 0; k--) {
    const t = new Date(anchor.getTime() - k * 86400000);
    const iso = t.toISOString().slice(0, 10);
    const v = num(byDay[iso]);
    if (v != null) series.push(v);
  }
  if (series.length < 4) return null;
  const todayVal = num(byDay[day]);
  if (todayVal == null) return null;
  if (!series.includes(todayVal)) series.push(todayVal);
  return skinTempZScoreC(series);
}

function yyyymmdd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return yyyymmdd(d);
}

async function fetchPowerTs(lat, lon, start, end) {
  const url =
    `${POWER_DAILY}?parameters=TS&community=AG&longitude=${lon}&latitude=${lat}` +
    `&start=${start}&end=${end}&format=JSON`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 18000);
  const res = await fetch(url, {
    signal: ctrl.signal,
    headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerLST/1.0' },
  });
  clearTimeout(t);
  if (!res.ok) throw new Error(`power_ts_${res.status}`);
  const data = await res.json();
  const ts = data?.properties?.parameter?.TS;
  if (!ts || typeof ts !== 'object') throw new Error('power_ts_missing');
  const dates = Object.keys(ts).sort();
  const series = dates.map((d) => ({ date: d, c: num(ts[d]) }));
  const latest = series.length ? series[series.length - 1] : null;
  const z = skinTempZScoreC(series.map((x) => x.c));
  return {
    series,
    skinTempC: latest?.c ?? null,
    skinTempDate: latest?.date ?? null,
    skinTempZ: z,
  };
}

/** Live ingest: last 8 days MERRA-2 earth skin temperature at each pasture centroid. */
export async function fetchSatelliteSkinTempPass(pastures) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const end = yyyymmdd();
  const start = daysAgo(8);
  const out = {
    fetchedAt: new Date().toISOString(),
    source:
      'NASA POWER · MERRA-2 earth skin temperature (TS, °C) — satellite-assimilated surface IR proxy at pasture centroid; not animal thermal imaging',
    endpoint: POWER_DAILY,
    parameter: 'TS',
    model: 'MERRA2',
    start,
    end,
    pastures: [],
    error: null,
  };

  if (!withGeo.length) {
    out.error = 'no pasture coordinates';
    return out;
  }

  try {
    const results = await Promise.all(
      withGeo.map(async (pasture) => {
        try {
          const block = await fetchPowerTs(pasture.lat, pasture.lon, start, end);
          return {
            id: pasture.id,
            name: pasture.name,
            lat: pasture.lat,
            lon: pasture.lon,
            ...block,
          };
        } catch {
          return {
            id: pasture.id,
            name: pasture.name,
            lat: pasture.lat,
            lon: pasture.lon,
            skinTempC: null,
            skinTempDate: null,
            skinTempZ: null,
            series: [],
          };
        }
      }),
    );
    out.pastures = results;
  } catch (e) {
    out.error = e.message || 'lst_fetch_failed';
    withGeo.forEach((pasture) => {
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        lat: pasture.lat,
        lon: pasture.lon,
        skinTempC: null,
        skinTempDate: null,
        skinTempZ: null,
      });
    });
  }

  return out;
}

/** Historical range: per-pasture daily TS keyed YYYY-MM-DD (POWER uses YYYYMMDD). */
export async function fetchHistoricalSkinTempByPastureDay(pastures, startDate, endDate) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const start = startDate.replace(/-/g, '');
  const end = endDate.replace(/-/g, '');
  const out = {
    source: 'NASA POWER · MERRA-2 daily earth skin temperature (TS, °C)',
    endpoint: POWER_DAILY,
    parameter: 'TS',
    error: null,
    byPastureDay: {},
  };
  for (const p of withGeo) out.byPastureDay[p.id] = {};

  if (!withGeo.length) return out;

  try {
    await Promise.all(
      withGeo.map(async (pasture) => {
        try {
          const block = await fetchPowerTs(pasture.lat, pasture.lon, start, end);
          for (const row of block.series) {
            if (row.c == null) continue;
            const iso = `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6, 8)}`;
            out.byPastureDay[pasture.id][iso] = row.c;
          }
        } catch {
          /* leave empty */
        }
      }),
    );
  } catch (e) {
    out.error = e.message || 'lst_history_failed';
  }

  return out;
}
