/**
 * Recent Anomaly Detection Module + geomagnetic herbivore report (edge runtime).
 * Mirrors research/geomagnetic-herbivore Python pipeline with live GFZ Kp + Turner timeseries.
 */
import { runTurnerBisonTimeseries } from './turner-bison-timeseries.mjs';

const GFZ_JSON = 'https://kp.gfz-potsdam.de/app/json/';
const CLASSIFICATIONS = ['none', 'weak', 'moderate', 'strong', 'extraordinary'];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, delta) {
  const t = new Date(`${dateStr}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + delta);
  return isoDate(t);
}

function classifyStorm(kp) {
  if (kp == null) return 'unknown';
  if (kp < 4) return 'quiet';
  if (kp <= 5) return 'moderate';
  if (kp <= 7) return 'strong';
  return 'severe';
}

async function fetchGfzKp(start, end) {
  const url = `${GFZ_JSON}?start=${start}T00:00:00Z&end=${end}T23:59:59Z&index=Kp`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GFZ Kp ${res.status}`);
  const data = await res.json();
  const rows = [];
  const times = data.datetime || [];
  const vals = data.Kp || data.kp || [];
  for (let i = 0; i < times.length; i++) {
    const kp = num(vals[i]);
    if (kp == null) continue;
    rows.push({ time: times[i], kp, stormClass: classifyStorm(kp) });
  }
  return rows;
}

function kpDailyMax(rows) {
  const byDay = new Map();
  for (const r of rows) {
    const day = String(r.time).slice(0, 10);
    const prev = byDay.get(day);
    if (!prev || r.kp > prev.kpMax) byDay.set(day, { date: day, kpMax: r.kp, stormClass: r.stormClass });
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(Math.min(1, a)));
}

function bearingDeg(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dlon = ((lon2 - lon1) * Math.PI) / 180;
  const x = Math.sin(dlon) * Math.cos(phi2);
  const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dlon);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

function rayleighR(headings) {
  const a = headings.filter((h) => h != null && Number.isFinite(h)).map((h) => (h * Math.PI) / 180);
  if (a.length < 5) return 0;
  const c = a.reduce((s, x) => s + Math.cos(x), 0) / a.length;
  const s = a.reduce((ss, x) => ss + Math.sin(x), 0) / a.length;
  return Math.sqrt(c * c + s * s);
}

function dailyHerdMetrics(dailyAnimals) {
  const byDate = new Map();
  for (const { date, animals } of dailyAnimals) {
    const prevByInd = new Map();
    let totalStep = 0;
    let steps = 0;
    const headings = [];
    const lats = [];
    const lons = [];
    for (const a of animals) {
      const prev = prevByInd.get(a.id);
      if (prev) {
        const d = haversineKm(prev.lat, prev.lng, a.lat, a.lng);
        totalStep += d;
        steps += 1;
        headings.push(bearingDeg(prev.lat, prev.lng, a.lat, a.lng));
      }
      prevByInd.set(a.id, a);
      lats.push(a.lat);
      lons.push(a.lng);
    }
    const meanLat = lats.reduce((s, v) => s + v, 0) / (lats.length || 1);
    const meanLon = lons.reduce((s, v) => s + v, 0) / (lons.length || 1);
    let spread = 0;
    for (let i = 0; i < lats.length; i++) {
      spread += Math.sqrt((lats[i] - meanLat) ** 2 + (lons[i] - meanLon) ** 2) * 111;
    }
    spread = lats.length ? spread / lats.length : 0;
    byDate.set(date, {
      date,
      meanStepKm: steps ? totalStep / steps : 0,
      totalDisplacementKm: totalStep,
      directionalConsistency: rayleighR(headings),
      herdSpreadKm: spread,
      nIndividuals: animals.length,
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function zScoreAnomalies(merged, baselineStart, windows) {
  const baseline = merged.filter((r) => r.date < baselineStart);
  const ranked = [];
  const metrics = ['meanStepKm', 'totalDisplacementKm', 'directionalConsistency', 'herdSpreadKm'];
  for (const metric of metrics) {
    const baseVals = baseline.map((r) => r[metric]).filter((v) => Number.isFinite(v));
    if (baseVals.length < 5) continue;
    const mu = baseVals.reduce((s, v) => s + v, 0) / baseVals.length;
    const sd = Math.sqrt(baseVals.reduce((s, v) => s + (v - mu) ** 2, 0) / baseVals.length) || 1e-6;
    for (const [win, start] of Object.entries(windows)) {
      for (const row of merged.filter((r) => r.date >= start)) {
        const val = row[metric];
        const z = (val - mu) / sd;
        if (Math.abs(z) < 1.5) continue;
        ranked.push({
          date: row.date,
          window: win,
          metric,
          value: val,
          baselineMean: mu,
          zScore: z,
          statisticalConfidence: Math.min(0.99, Math.abs(z) / 4),
          environmentalExplanations: ['weather', 'drought', 'snow', 'management', 'habitat', 'wildfire'],
          geomagneticExplanations: ['Kp elevation', 'solar flare / CME window'],
          evidenceForGeomagnetic: row.kpMax >= 5 ? [`Kp max ${row.kpMax} on ${row.date}`] : [],
          evidenceAgainstGeomagnetic: [
            'correlation ≠ causation',
            'movement layer may be synthesis not collar GPS',
            'covariates not fully controlled on edge pass',
          ],
          finalConfidenceNote: 'Geomagnetic influence not asserted without multivariate control.',
        });
      }
    }
  }
  ranked.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  return ranked.slice(0, 25);
}

function classifyFromZ(maxZ, count) {
  if (!count || maxZ < 1.5) return 'none';
  if (maxZ >= 4) return 'extraordinary';
  if (maxZ >= 3) return 'strong';
  if (maxZ >= 2.5) return 'moderate';
  return 'weak';
}

function stormEvents(kpRows, threshold = 5) {
  const events = [];
  let block = [];
  for (const r of kpRows) {
    if (r.kp >= threshold) block.push(r);
    else if (block.length) {
      events.push({
        start: block[0].time,
        end: block[block.length - 1].time,
        kpMax: Math.max(...block.map((x) => x.kp)),
        tier: `kp_ge_${threshold}`,
      });
      block = [];
    }
  }
  if (block.length) {
    events.push({
      start: block[0].time,
      end: block[block.length - 1].time,
      kpMax: Math.max(...block.map((x) => x.kp)),
      tier: `kp_ge_${threshold}`,
    });
  }
  return events;
}

/**
 * Run full recent-anomaly + hypothesis summary for bulletin / API.
 */
export async function runRecentAnomalyModule(opts = {}) {
  const end = opts.endDate || isoDate(new Date());
  const start90 = opts.start90 || addDays(end, -90);
  const start30 = addDays(end, -30);
  const start14 = addDays(end, -14);
  const baselineStart = addDays(end, -365 * 5);
  const movementDays = Math.min(90, Math.max(14, num(opts.movementDays) ?? 30));

  const [kpRows, series] = await Promise.all([
    fetchGfzKp(baselineStart, end),
    runTurnerBisonTimeseries({
      startDate: addDays(end, -movementDays),
      endDate: end,
      sampleSize: opts.sampleSize ?? 40,
      snapshotsOnly: false,
    }),
  ]);

  const kpDaily = kpDailyMax(kpRows);
  const kpByDate = Object.fromEntries(kpDaily.map((k) => [k.date, k]));

  let dailyAnimals = [];
  if (series.ok && Array.isArray(series.daily)) {
    dailyAnimals = series.daily.map((d) => ({
      date: d.date,
      animals: (d.animals || []).map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
      })),
    }));
  }

  const herd = dailyHerdMetrics(dailyAnimals).map((h) => ({
    ...h,
    kpMax: kpByDate[h.date]?.kpMax ?? null,
    stormClass: kpByDate[h.date]?.stormClass ?? null,
  }));

  const windows = { '90d': start90, '30d': start30, '14d': start14 };
  const rankedAnomalies = zScoreAnomalies(herd, start90, windows);
  const maxZ = rankedAnomalies.length ? Math.max(...rankedAnomalies.map((a) => Math.abs(a.zScore))) : 0;
  const classification = classifyFromZ(maxZ, rankedAnomalies.length);

  const quiet = herd.filter((h) => (h.kpMax ?? 0) < 4);
  const storm = herd.filter((h) => (h.kpMax ?? 0) >= 5);
  const stormComparison = {};
  for (const metric of ['meanStepKm', 'herdSpreadKm', 'directionalConsistency']) {
    const qv = quiet.map((h) => h[metric]).filter(Number.isFinite);
    const sv = storm.map((h) => h[metric]).filter(Number.isFinite);
    if (qv.length < 3 || sv.length < 2) continue;
    const qMean = qv.reduce((s, v) => s + v, 0) / qv.length;
    const sMean = sv.reduce((s, v) => s + v, 0) / sv.length;
    stormComparison[metric] = {
      quietMean: qMean,
      stormMean: sMean,
      delta: sMean - qMean,
      significant: Math.abs(sMean - qMean) > 0.15 * (qMean || 1),
    };
  }

  return {
    schema: 'recent-anomaly-module/v1',
    docId: 'HHA-GEOMAG-HERBIVORE-2026',
    generatedAt: new Date().toISOString(),
    range: { start90, start30, start14, end, baselineStart, movementDays },
    dataHonesty: {
      movement:
        series.ok
          ? series.honesty?.note || 'Turner synthesis — not collar GPS.'
          : 'Turner timeseries unavailable; anomaly pass uses empty or partial herd metrics.',
      geomagnetic: 'GFZ Potsdam Kp (CC BY 4.0). Flare/CME lists require extended GOES ingest.',
    },
    hypotheses: {
      H1: {
        label: 'Orientation parallel to field lines',
        tier: herd.length ? 'inconclusive' : 'no_support',
        meanDirectionalConsistency: herd.length
          ? herd.reduce((s, h) => s + h.directionalConsistency, 0) / herd.length
          : null,
      },
      H2: {
        label: 'Behavioral change during storms',
        tier: Object.values(stormComparison).some((v) => v.significant) ? 'weak' : 'no_support',
        stormComparison,
      },
      H3: { label: 'Corridors vs magnetic gradients', tier: 'inconclusive' },
      H4: { label: 'Bison magnetic navigation', tier: 'inconclusive' },
      H5: { label: 'Recent disturbances ↔ route anomalies', tier: classification },
    },
    recentAnomalySummary: `Classification: ${classification}. ${rankedAnomalies.length} ranked metrics (max |z|=${maxZ.toFixed(2)}).`,
    classification,
    rankedAnomalies,
    stormEvents: {
      kp_ge_5: stormEvents(kpRows, 5),
      kp_ge_7: stormEvents(kpRows, 7),
      severe_kp8: stormEvents(kpRows, 8),
    },
    lagWindowsHours: [0, 24, 48, 72, 168],
    criticalRule:
      'Do not infer causation from correlation. Geomagnetic influence only if significant after weather, drought, snow, predators, human activity, habitat, wildfire, and management controls.',
    alternativeExplanations: [
      'weather',
      'drought',
      'snow',
      'predators',
      'human activity',
      'habitat changes',
      'wildfire',
      'management actions',
    ],
    herdDaily: herd,
    kpDaily,
    turnerSeriesOk: !!series.ok,
    classifications: CLASSIFICATIONS,
  };
}
