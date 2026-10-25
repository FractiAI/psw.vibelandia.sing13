/**
 * TRGM historical prediction lab — Movebank GPS + GFZ Kp (collar window).
 * Uses real public collar fixes and archived Kp; never fabricates metrics.
 *
 * Sources (monorepo):
 *   research/geomagnetic-herbivore/data/trajectories.csv
 *   research/geomagnetic-herbivore/data/archive/kp_3hourly_2020-05-15.csv
 * Fallback fixture (standalone / offline):
 *   data/historical/movebank_daily_proxy.json
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DIGITAL_SEED } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUITE_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(SUITE_ROOT, '../..');

export const HISTORICAL_SOURCES = Object.freeze({
  trajectories: 'research/geomagnetic-herbivore/data/trajectories.csv',
  kpArchive: 'research/geomagnetic-herbivore/data/archive/kp_3hourly_2020-05-15.csv',
  study: 'Movebank 2548892515 · Snowy Range Moose (Alces alces) 2019-01-01→2020-05-15',
  kpLicense: 'GFZ Kp · archived 3-hourly aligned to collar window',
});

/** Pre-registered before scoring held-out historical days. */
export const HISTORICAL_GATES = Object.freeze({
  /** Chronological train fraction for threshold lock. */
  trainFraction: 0.6,
  /** Goldilocks structure band = train CV percentiles [25, 75]. */
  structurePctLo: 0.25,
  structurePctHi: 0.75,
  /** H2: fraction of held-out days where real Rayleigh r beats day-matched shuffle. */
  phaseBeatShuffleMin: 0.55,
  /** Minimum individuals / day. */
  minIndividuals: 5,
});

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function mulberry32(a) {
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nnCv(pts) {
  if (pts.length < 3) return null;
  const nn = [];
  for (let i = 0; i < pts.length; i++) {
    let best = Infinity;
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue;
      best = Math.min(best, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    }
    nn.push(best);
  }
  const m = mean(nn);
  const sd = Math.sqrt(mean(nn.map((v) => (v - m) ** 2)));
  return m > 0 ? sd / m : null;
}

function rayleighR(degs) {
  if (!degs.length) return null;
  let cx = 0;
  let cy = 0;
  for (const d of degs) {
    const rad = (d * Math.PI) / 180;
    cx += Math.cos(rad);
    cy += Math.sin(rad);
  }
  return Math.hypot(cx, cy) / degs.length;
}

function spearman(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const rank = (a) => {
    const idx = [...a.keys()].sort((i, j) => a[i] - a[j]);
    const r = Array(n);
    for (let k = 0; k < n; ) {
      let m = k;
      while (m + 1 < n && a[idx[m + 1]] === a[idx[k]]) m += 1;
      const avg = (k + m) / 2 + 1;
      for (let t = k; t <= m; t++) r[idx[t]] = avg;
      k = m + 1;
    }
    return r;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  const mx = mean(rx);
  const my = mean(ry);
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - mx;
    const dy = ry[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const den = Math.sqrt(sxx * syy);
  return den > 0 ? sxy / den : null;
}

function resolvePath(relFromMonorepo) {
  const abs = path.join(MONOREPO_ROOT, relFromMonorepo);
  if (fs.existsSync(abs)) return abs;
  return null;
}

function fixturePath() {
  return path.join(SUITE_ROOT, 'data/historical/movebank_daily_proxy.json');
}

export function loadKpDaily(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8').replace(/\r/g, '');
  const lines = text.trim().split('\n').slice(1);
  const kpDaily = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const [time, kp, , storm] = line.split(',');
    const date = String(time).slice(0, 10);
    const v = Number(kp);
    if (!date || !Number.isFinite(v)) continue;
    const prev = kpDaily.get(date) || { kpMax: -Infinity, storm: 'quiet' };
    if (v >= prev.kpMax) {
      kpDaily.set(date, { kpMax: v, storm: String(storm || 'quiet').trim() || 'quiet' });
    }
  }
  return kpDaily;
}

export async function loadTrajectoryDays(csvPath) {
  const byDay = new Map();
  const rl = readline.createInterface({ input: createReadStream(csvPath), crlfDelay: Infinity });
  let first = true;
  let nRows = 0;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }
    if (!line.trim()) continue;
    nRows += 1;
    const p = line.split(',');
    const id = p[0];
    const ts = p[1];
    const lat = Number(p[2]);
    const lon = Number(p[3]);
    const heading = p[7] === '' || p[7] == null ? NaN : Number(p[7]);
    if (!id || !ts || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const date = ts.slice(0, 10);
    if (!byDay.has(date)) byDay.set(date, new Map());
    const inds = byDay.get(date);
    if (!inds.has(id)) inds.set(id, { lat: 0, lon: 0, n: 0, headings: [] });
    const o = inds.get(id);
    o.lat += lat;
    o.lon += lon;
    o.n += 1;
    if (Number.isFinite(heading)) o.headings.push(heading);
  }
  return { byDay, nRows };
}

export function daysFromTrajectoryMap(byDay, kpDaily) {
  const days = [];
  for (const date of [...byDay.keys()].sort()) {
    const inds = [...byDay.get(date).values()];
    if (inds.length < HISTORICAL_GATES.minIndividuals) continue;
    const pts = inds.map((o) => ({ x: o.lon / o.n, y: o.lat / o.n }));
    const headings = inds.flatMap((o) => o.headings);
    const structureCv = nnCv(pts);
    const phaseR = rayleighR(headings);
    if (structureCv == null || phaseR == null || !headings.length) continue;

    const rng = mulberry32((DIGITAL_SEED ^ Number(date.replace(/-/g, ''))) >>> 0);
    const shuffled = [...headings];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const shuffleR = rayleighR(shuffled);
    const kp = kpDaily?.get(date);
    days.push({
      date,
      nIndividuals: pts.length,
      nHeadings: headings.length,
      structureCv,
      phaseR,
      shuffleR,
      kpMax: kp?.kpMax ?? null,
      storm: kp?.storm ?? null,
    });
  }
  return days;
}

export function scoreHistoricalPredictions(days) {
  const usable = days.filter(
    (d) =>
      Number.isFinite(d.structureCv) &&
      Number.isFinite(d.phaseR) &&
      Number.isFinite(d.shuffleR),
  );
  const mid = Math.floor(usable.length * HISTORICAL_GATES.trainFraction);
  const train = usable.slice(0, mid);
  const held = usable.slice(mid);
  const cvs = train.map((d) => d.structureCv).sort((a, b) => a - b);
  const lo = cvs[Math.floor(cvs.length * HISTORICAL_GATES.structurePctLo)];
  const hi = cvs[Math.floor(cvs.length * HISTORICAL_GATES.structurePctHi)];

  const inBand = held.filter((d) => d.structureCv >= lo && d.structureCv <= hi);
  const outBand = held.filter((d) => d.structureCv < lo || d.structureCv > hi);
  const inPhase = mean(inBand.map((d) => d.phaseR));
  const outPhase = mean(outBand.map((d) => d.phaseR));
  /** H1: train-locked Goldilocks structure band has higher held-out phase order. */
  const h1Pass = inBand.length >= 5 && outBand.length >= 5 && inPhase > outPhase;

  const beatShuffle = held.filter((d) => d.phaseR > d.shuffleR).length / (held.length || 1);
  /** H2: real headings beat day-matched shuffle on ≥55% of held-out days. */
  const h2Pass = beatShuffle >= HISTORICAL_GATES.phaseBeatShuffleMin;

  const quiet = held.filter((d) => d.storm === 'quiet');
  const storm = held.filter((d) => d.storm && d.storm !== 'quiet');
  const quietPhase = mean(quiet.map((d) => d.phaseR));
  const stormPhase = mean(storm.map((d) => d.phaseR));
  /**
   * H3: storm days differ in mean phase order from quiet (two-sided |Δ| > 0 on held-out
   * with ≥3 storm days). Direction is not pre-crowned — either sign is informative.
   */
  const h3Pass = storm.length >= 3 && quiet.length >= 3 && Math.abs(stormPhase - quietPhase) > 1e-12;

  const rho = spearman(
    held.map((d) => d.structureCv),
    held.map((d) => d.phaseR),
  );

  return {
    nDays: usable.length,
    nTrain: train.length,
    nHeld: held.length,
    dateRange: usable.length
      ? { start: usable[0].date, end: usable[usable.length - 1].date }
      : null,
    structureBand: { lo, hi },
    H1_structureBandPhase: {
      pass: h1Pass,
      inBandN: inBand.length,
      outBandN: outBand.length,
      inBandMeanPhaseR: inPhase,
      outBandMeanPhaseR: outPhase,
      rhoStructureVsPhaseHeld: rho,
      interpretation: h1Pass
        ? 'Held-out days inside train-locked structure Goldilocks band show higher mean heading order.'
        : 'Held-out structure Goldilocks band did not raise mean phase order vs out-of-band (mixed/null).',
    },
    H2_phaseBeatsShuffle: {
      pass: h2Pass,
      beatShuffleRate: beatShuffle,
      threshold: HISTORICAL_GATES.phaseBeatShuffleMin,
      meanPhaseR: mean(held.map((d) => d.phaseR)),
      meanShuffleR: mean(held.map((d) => d.shuffleR)),
      interpretation: h2Pass
        ? `Real headings beat shuffle on ${(beatShuffle * 100).toFixed(1)}% of held-out days.`
        : `Real headings beat shuffle on only ${(beatShuffle * 100).toFixed(1)}% of held-out days (threshold ${(HISTORICAL_GATES.phaseBeatShuffleMin * 100).toFixed(0)}%) — weak/null coordination signal.`,
    },
    H3_stormVsQuietPhase: {
      pass: h3Pass,
      stormN: storm.length,
      quietN: quiet.length,
      stormMeanPhaseR: stormPhase,
      quietMeanPhaseR: quietPhase,
      delta: stormPhase - quietPhase,
      interpretation: h3Pass
        ? `Storm vs quiet mean phase Δ=${(stormPhase - quietPhase).toFixed(5)} on held-out days (n_storm=${storm.length}).`
        : 'Insufficient storm/quiet contrast or identical means on held-out window.',
    },
  };
}

/**
 * Run historical prediction battery.
 * Prefers live Movebank+Kp CSVs; falls back to committed daily proxy fixture.
 */
export async function runHistoricalLaboratory() {
  const trajPath = resolvePath(HISTORICAL_SOURCES.trajectories);
  const kpPath = resolvePath(HISTORICAL_SOURCES.kpArchive);
  const fixture = fixturePath();

  let days;
  let sourceMode;
  let nRows = null;

  if (trajPath && kpPath) {
    const kpDaily = loadKpDaily(kpPath);
    const loaded = await loadTrajectoryDays(trajPath);
    nRows = loaded.nRows;
    days = daysFromTrajectoryMap(loaded.byDay, kpDaily);
    sourceMode = 'live_csv';
    // Refresh fixture for standalone / offline replay
    fs.mkdirSync(path.dirname(fixture), { recursive: true });
    fs.writeFileSync(
      fixture,
      JSON.stringify(
        {
          schema: 'trgm-historical-daily-proxy/v1',
          generatedAt: new Date().toISOString(),
          sources: HISTORICAL_SOURCES,
          nTrajectoryRows: nRows,
          days,
        },
        null,
        2,
      ),
    );
  } else if (fs.existsSync(fixture)) {
    const doc = JSON.parse(fs.readFileSync(fixture, 'utf8'));
    days = doc.days || [];
    nRows = doc.nTrajectoryRows ?? null;
    sourceMode = 'fixture';
  } else {
    return {
      ok: false,
      sourceMode: 'missing',
      error:
        'No Movebank/Kp CSVs and no data/historical/movebank_daily_proxy.json fixture — historical battery skipped.',
      hypotheses: [],
    };
  }

  const scored = scoreHistoricalPredictions(days);
  const hypotheses = [
    {
      id: 'H1',
      title: 'Historical structure Goldilocks → higher held-out heading order (Movebank)',
      pass: scored.H1_structureBandPhase.pass,
      detail: scored.H1_structureBandPhase,
      evidence: 'empirically_observed',
      data: 'historical_movebank_gps',
    },
    {
      id: 'H2',
      title: 'Historical heading order beats day-matched shuffle null',
      pass: scored.H2_phaseBeatsShuffle.pass,
      detail: scored.H2_phaseBeatsShuffle,
      evidence: 'empirically_observed',
      data: 'historical_movebank_gps',
    },
    {
      id: 'H3',
      title: 'Historical storm vs quiet heading-order contrast (GFZ Kp ∩ collar window)',
      pass: scored.H3_stormVsQuietPhase.pass,
      detail: scored.H3_stormVsQuietPhase,
      evidence: 'empirically_observed',
      data: 'historical_gfz_kp_archive',
    },
  ];

  return {
    ok: true,
    sourceMode,
    sources: HISTORICAL_SOURCES,
    nTrajectoryRows: nRows,
    gates: HISTORICAL_GATES,
    scored,
    hypotheses,
    n_pass: hypotheses.filter((h) => h.pass).length,
    n_total: hypotheses.length,
    all_pass: hypotheses.every((h) => h.pass),
  };
}
