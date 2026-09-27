/**
 * ERFT-D — Dynamic Constant Regulation (exploratory extension)
 *
 * Hypothesis: recursive stability may emerge from dynamic regulation among
 * complementary transformation modes rather than a single fixed constant.
 *
 * Does NOT rewrite ERFT-V5. ERFT-C / ERFT-G remain the confirmatory baseline.
 * Φ is one candidate mode among peers — no a-priori privilege.
 *
 * Lanes:
 *   D0 — fixed-constant controls (static policies)
 *   D1 — prescribed multi-constant sequences
 *   D2 — state-dependent switching (observable state only; frozen evaluator)
 *   D3 — adaptive one-step look-ahead on controller-selection split (no holdout peek)
 */
import {
  PHI_EGS,
  SQRT2,
  E_CONST,
  GENERATIONS,
  NAMED_ARMS,
  MECHANISMS,
  BOOTSTRAP_RESAMPLES,
  BOOTSTRAP_SEED,
  ANTI_BASELINE_BIAS,
} from './constants.mjs';
import { normalizedMixWeights, matchedLags, matchedBlocks, matchedDrivePeriod } from './nest-grammar.mjs';
import { clutchMixScale } from './engine-grammar.mjs';

export const ERFT_D_EXTENSION_ID = 'ERFT-D';
export const ERFT_D_PROTOCOL = 'ERFT-D-2026-09-27';

/** Candidate mode set — Φ is a peer, not a crown. */
export const ERFT_D_CANDIDATES = Object.freeze({
  baseline: 1.0,
  sqrt2: SQRT2,
  egs: PHI_EGS,
  e: E_CONST,
  near_phi: 1.6, // nearby continuous control for Q5/Q6
});

/** Controller information permitted (pre-registered; no future ground truth). */
export const ERFT_D_CONTROLLER_INFO = Object.freeze({
  permitted: Object.freeze([
    'current_nrmse_vs_d0',
    'stepwise_rmse',
    'delta_nrmse',
    'path_length',
    'recovery_ratio',
    'drift_direction',
    'recursion_depth',
    'mechanism_id',
  ]),
  forbidden: Object.freeze([
    'future_generations',
    'held_out_target',
    'evaluator_implementation',
    'fixture_seeds_beyond_controller_split',
  ]),
  preregistered: true,
  tuned_on_holdout: false,
});

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function mean(xs) {
  let s = 0;
  for (const x of xs) s += x;
  return xs.length ? s / xs.length : 0;
}

function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return Math.sqrt(s / (xs.length - 1));
}

function rmse(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s / n);
}

function seriesStd(xs) {
  return Math.max(1e-12, stdev([...xs]));
}

function normalizeEnergy(xs, targetRms) {
  let s = 0;
  for (const x of xs) s += x * x;
  const rms = Math.sqrt(s / xs.length) || 1;
  const g = targetRms / rms;
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) out[i] = xs[i] * g;
  return out;
}

function smooth3(xs) {
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    const a = xs[Math.max(0, i - 1)];
    const b = xs[i];
    const c = xs[Math.min(xs.length - 1, i + 1)];
    out[i] = (a + b + c) / 3;
  }
  return out;
}

function blockMeanExpand(xs, block, offset = 0) {
  const b = Math.max(2, block | 0);
  const n = xs.length;
  const off = ((offset % b) + b) % b;
  const codes = [];
  for (let start = 0; start < n; start += b) {
    let s = 0;
    let count = 0;
    for (let k = 0; k < b; k++) {
      const j = (start + off + k) % n;
      s += xs[j];
      count++;
    }
    codes.push(s / count);
  }
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const idx = Math.min(codes.length - 1, Math.floor(((i - off + n) % n) / b));
    out[i] = codes[idx];
  }
  return out;
}

/** Constant-neutral mechanism application (identical to ERFT-C — no grammar affordance). */
function applyMechanism(name, xs, c, prev, gen = 0) {
  const mode = 'constant_neutral';
  void mode;
  switch (name) {
    case 'scaling': {
      const n = xs.length;
      const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
      const { wMajor, wMinor } = normalizedMixWeights(c);
      const { la, lb } = matchedLags(n, gen);
      const out = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const a = xs[(i + la) % n];
        const b = xs[(i + lb) % n];
        const spatial = wMajor * a + wMinor * b;
        out[i] = (1 - w) * xs[i] + w * spatial;
      }
      return out;
    }
    case 'recursive_weighting': {
      const p = prev || xs;
      const n = xs.length;
      const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
      const { wMajor, wMinor } = normalizedMixWeights(c);
      const { la, lb } = matchedLags(n, gen);
      const out = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const spatial = wMajor * p[(i + la) % n] + wMinor * p[(i + lb) % n];
        out[i] = (1 - w) * xs[i] + w * spatial;
      }
      return out;
    }
    case 'hierarchical_resolution': {
      const { b1, b2 } = matchedBlocks(gen);
      const a = blockMeanExpand(xs, b1, 0);
      const b = blockMeanExpand(xs, b2, Math.floor(b2 / 2));
      const { wMajor, wMinor } = normalizedMixWeights(c);
      const amp = 0.3;
      const period = matchedDrivePeriod(gen);
      const out = new Float64Array(xs.length);
      for (let i = 0; i < xs.length; i++) {
        const base = wMajor * a[i] + wMinor * b[i];
        const hp = xs[i] - base;
        out[i] = base + amp * hp * Math.cos((2 * Math.PI * i) / period);
      }
      return out;
    }
    case 'recursive_feedback': {
      const gain = ANTI_BASELINE_BIAS.fixed_feedback_gain;
      const { wMajor, wMinor } = normalizedMixWeights(c);
      const targetSmooth = smooth3(xs);
      const { b1 } = matchedBlocks(gen);
      const targetBlock = blockMeanExpand(xs, b1, 0);
      let rms = 0;
      for (const x of xs) rms += x * x;
      rms = Math.sqrt(rms / xs.length) || 1;
      const drive = 0.08;
      const period = matchedDrivePeriod(gen);
      const out = new Float64Array(xs.length);
      for (let i = 0; i < xs.length; i++) {
        const t = wMajor * targetSmooth[i] + wMinor * targetBlock[i];
        out[i] =
          xs[i] + gain * (t - xs[i]) + drive * rms * Math.sin((2 * Math.PI * i) / period);
      }
      return out;
    }
    case 'recursive_compression': {
      const { b1, b2 } = matchedBlocks(gen);
      const block = Math.max(2, Math.min(b1, b2));
      const n = xs.length;
      const codes = [];
      for (let i = 0; i < n; i += block) {
        let s = 0;
        let count = 0;
        for (let j = i; j < Math.min(n, i + block); j++) {
          s += xs[j];
          count++;
        }
        codes.push(s / count);
      }
      const { wMajor, wMinor } = normalizedMixWeights(c);
      const amp = 0.3;
      const period = matchedDrivePeriod(gen);
      const out = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const idx = Math.min(codes.length - 1, Math.floor(i / block));
        const sharp = codes[idx];
        const f = i / block;
        const i0 = Math.min(codes.length - 1, Math.floor(f));
        const i1 = Math.min(codes.length - 1, i0 + 1);
        const t = f - i0;
        const soft = (1 - t) * codes[i0] + t * codes[i1];
        const base = wMajor * sharp + wMinor * soft;
        const hp = xs[i] - base;
        out[i] = base + amp * hp * Math.cos((2 * Math.PI * i) / period);
      }
      return out;
    }
    default:
      throw new Error(`unknown mechanism: ${name}`);
  }
}

function makeSeries(kind, len, rng) {
  const xs = new Float64Array(len);
  if (kind === 'logistic') {
    let x = 0.2;
    const r = 3.7;
    for (let i = 0; i < len; i++) {
      x = r * x * (1 - x);
      xs[i] = x;
    }
  } else if (kind === 'ar1') {
    let x = 0;
    for (let i = 0; i < len; i++) {
      x = 0.85 * x + rng() * 0.4 - 0.2;
      xs[i] = x;
    }
  } else if (kind === 'seasonal') {
    for (let i = 0; i < len; i++) {
      xs[i] =
        10 +
        2 * Math.sin((2 * Math.PI * i) / 12) +
        0.5 * Math.sin((2 * Math.PI * i) / 7) +
        (rng() - 0.5) * 0.3;
    }
  } else if (kind === 'powerlaw') {
    for (let i = 0; i < len; i++) {
      xs[i] = Math.pow(i + 1, -0.7) + (rng() - 0.5) * 0.02;
    }
  } else if (kind === 'co2_proxy') {
    for (let i = 0; i < len; i++) {
      xs[i] = 340 + 0.12 * i + 2 * Math.sin((2 * Math.PI * i) / 12) + (rng() - 0.5) * 0.4;
    }
  } else {
    for (let i = 0; i < len; i++) xs[i] = rng();
  }
  return xs;
}

/**
 * Run recursion with per-generation c_n = policy(state, n).
 * Returns curve + path of c + switching metrics.
 */
export function runDynamicRecursion(d0, mechanism, policy, generations = GENERATIONS) {
  let cur = Float64Array.from(d0);
  let prev = Float64Array.from(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const sigma0 = seriesStd(d0);
  const curve = [];
  const cPath = [];
  let pathLength = 0;
  let prevState = Float64Array.from(d0);
  let prevNrmse = 0;
  let switches = 0;
  let paramPath = 0;
  let maxNrmse = 0;
  let catastrophic = 0;
  const CATASTROPHIC_THRESHOLD = 3; // NRMSE > 3σ-scale units

  for (let n = 0; n <= generations; n++) {
    const r = rmse(cur, d0);
    const nrmse = r / sigma0;
    const step = n === 0 ? 0 : rmse(cur, prevState);
    if (n > 0) pathLength += step;
    const recovery = pathLength > 1e-15 ? r / pathLength : 0;
    const deltaNrmse = nrmse - prevNrmse;
    const state = {
      n,
      nrmse,
      stepwise_rmse: step,
      delta_nrmse: deltaNrmse,
      path_length: pathLength,
      recovery_ratio: recovery,
      drift_rising: deltaNrmse > 1e-9,
      drift_falling: deltaNrmse < -1e-9,
      mechanism,
    };
    curve.push({
      n,
      rfd_nrmse: nrmse,
      rfd_rmse: r,
      stepwise_rmse: step,
      path_length: pathLength,
      recovery_ratio: recovery,
    });
    if (nrmse > maxNrmse) maxNrmse = nrmse;
    if (nrmse > CATASTROPHIC_THRESHOLD) catastrophic += 1;
    if (n === generations) break;

    const c = policy(state, cPath);
    if (cPath.length && c !== cPath[cPath.length - 1]) {
      switches += 1;
      paramPath += Math.abs(c - cPath[cPath.length - 1]);
    }
    cPath.push(c);
    prevState = Float64Array.from(cur);
    prevNrmse = nrmse;
    const next = applyMechanism(mechanism, cur, c, prev, n);
    prev = cur;
    cur = normalizeEnergy(next, targetRms);
  }

  const last = curve[curve.length - 1];
  const uniqueC = new Set(cPath.map((x) => Number(x.toFixed(8))));
  return {
    curve,
    c_path: cPath,
    final_nrmse: last.rfd_nrmse,
    path_length: last.path_length,
    recovery_ratio: last.recovery_ratio,
    max_nrmse: maxNrmse,
    switching_cost: switches,
    parameter_path_length: paramPath,
    catastrophic_excursion_count: catastrophic,
    collapses_to_single_constant: uniqueC.size <= 1,
    unique_constants_used: uniqueC.size,
  };
}

function fixedPolicy(c) {
  return () => c;
}

function sequencePolicy(seq) {
  return (state) => seq[state.n % seq.length];
}

/** D2: rising drift → prefer contraction-ish (baseline); falling → allow expansion (e); mid → Φ peer. */
function stateDependentPolicy(candidates) {
  return (state) => {
    if (state.drift_rising || state.nrmse > 1.5) return candidates.baseline;
    if (state.drift_falling && state.recovery_ratio < 0.5) return candidates.egs;
    if (state.n % 3 === 0) return candidates.sqrt2;
    return candidates.e;
  };
}

/** D2b: random switching control (same candidate set; seeded). */
function randomSwitchPolicy(candidates, seed) {
  const vals = Object.values(candidates);
  const rng = mulberry32(seed);
  return () => vals[Math.floor(rng() * vals.length)];
}

/**
 * D3: one-step look-ahead — try each candidate on a *clone* of current state,
 * pick argmin estimated next NRMSE. Uses only current observable state + mechanism.
 * Causal: does not see future ground truth beyond the one simulated step from current.
 */
function adaptiveLookaheadPolicy(candidates, d0, mechanism, sigma0, targetRms) {
  const vals = Object.entries(candidates);
  return (state, cPath, ctx) => {
    const { cur, prev, gen } = ctx;
    let bestC = vals[0][1];
    let bestScore = Infinity;
    for (const [, c] of vals) {
      const trial = applyMechanism(mechanism, cur, c, prev, gen);
      const next = normalizeEnergy(trial, targetRms);
      const score = rmse(next, d0) / sigma0;
      if (score < bestScore) {
        bestScore = score;
        bestC = c;
      }
    }
    return bestC;
  };
}

/** Wrap adaptive so runDynamicRecursion can pass ctx — use specialized runner. */
function runAdaptiveRecursion(d0, mechanism, candidates, generations = GENERATIONS) {
  let cur = Float64Array.from(d0);
  let prev = Float64Array.from(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const sigma0 = seriesStd(d0);
  const pick = adaptiveLookaheadPolicy(candidates, d0, mechanism, sigma0, targetRms);
  const curve = [];
  const cPath = [];
  let pathLength = 0;
  let prevState = Float64Array.from(d0);
  let prevNrmse = 0;
  let switches = 0;
  let paramPath = 0;
  let maxNrmse = 0;
  let catastrophic = 0;

  for (let n = 0; n <= generations; n++) {
    const r = rmse(cur, d0);
    const nrmse = r / sigma0;
    const step = n === 0 ? 0 : rmse(cur, prevState);
    if (n > 0) pathLength += step;
    const recovery = pathLength > 1e-15 ? r / pathLength : 0;
    curve.push({
      n,
      rfd_nrmse: nrmse,
      rfd_rmse: r,
      stepwise_rmse: step,
      path_length: pathLength,
      recovery_ratio: recovery,
    });
    if (nrmse > maxNrmse) maxNrmse = nrmse;
    if (nrmse > 3) catastrophic += 1;
    if (n === generations) break;

    const state = {
      n,
      nrmse,
      stepwise_rmse: step,
      delta_nrmse: nrmse - prevNrmse,
      path_length: pathLength,
      recovery_ratio: recovery,
      mechanism,
    };
    const c = pick(state, cPath, { cur, prev, gen: n });
    if (cPath.length && c !== cPath[cPath.length - 1]) {
      switches += 1;
      paramPath += Math.abs(c - cPath[cPath.length - 1]);
    }
    cPath.push(c);
    prevState = Float64Array.from(cur);
    prevNrmse = nrmse;
    const next = applyMechanism(mechanism, cur, c, prev, n);
    prev = cur;
    cur = normalizeEnergy(next, targetRms);
  }

  const last = curve[curve.length - 1];
  const uniqueC = new Set(cPath.map((x) => Number(x.toFixed(8))));
  return {
    curve,
    c_path: cPath,
    final_nrmse: last.rfd_nrmse,
    path_length: last.path_length,
    recovery_ratio: last.recovery_ratio,
    max_nrmse: maxNrmse,
    switching_cost: switches,
    parameter_path_length: paramPath,
    catastrophic_excursion_count: catastrophic,
    collapses_to_single_constant: uniqueC.size <= 1,
    unique_constants_used: uniqueC.size,
  };
}

function selectionHistogram(cPath, candidates) {
  const hist = {};
  for (const k of Object.keys(candidates)) hist[k] = 0;
  const inv = new Map(Object.entries(candidates).map(([k, v]) => [Number(v.toFixed(8)), k]));
  for (const c of cPath) {
    const key = inv.get(Number(c.toFixed(8)));
    if (key) hist[key] += 1;
  }
  const total = cPath.length || 1;
  const probs = {};
  for (const [k, v] of Object.entries(hist)) probs[k] = v / total;
  return { counts: hist, probabilities: probs };
}

const D1_SEQUENCES = Object.freeze({
  phi_repeated: Object.freeze(Array(GENERATIONS).fill(PHI_EGS)),
  baseline_repeated: Object.freeze(Array(GENERATIONS).fill(1.0)),
  sqrt2_repeated: Object.freeze(Array(GENERATIONS).fill(SQRT2)),
  e_repeated: Object.freeze(Array(GENERATIONS).fill(E_CONST)),
  phi_e_1_sqrt2: Object.freeze(
    Array.from({ length: GENERATIONS }, (_, i) => [PHI_EGS, E_CONST, 1.0, SQRT2][i % 4]),
  ),
  one_phi_e_sqrt2: Object.freeze(
    Array.from({ length: GENERATIONS }, (_, i) => [1.0, PHI_EGS, E_CONST, SQRT2][i % 4]),
  ),
  phi_1_alt: Object.freeze(
    Array.from({ length: GENERATIONS }, (_, i) => (i % 2 === 0 ? PHI_EGS : 1.0)),
  ),
  seeded_random: null, // filled at runtime with seed
});

const DOMAINS_D = Object.freeze([
  { id: 'synthetic_logistic', kind: 'logistic' },
  { id: 'synthetic_seasonal', kind: 'seasonal' },
  { id: 'env_co2_proxy', kind: 'co2_proxy' },
]);

function summarizePolicyRuns(runs) {
  const finals = runs.map((r) => r.final_nrmse);
  const paths = runs.map((r) => r.path_length);
  const maxes = runs.map((r) => r.max_nrmse);
  const switches = runs.map((r) => r.switching_cost);
  return {
    n: runs.length,
    mean_final_nrmse: mean(finals),
    mean_path_length: mean(paths),
    mean_max_nrmse: mean(maxes),
    mean_switching_cost: mean(switches),
    mean_catastrophic: mean(runs.map((r) => r.catastrophic_excursion_count)),
    fraction_collapse_to_single: mean(runs.map((r) => (r.collapses_to_single_constant ? 1 : 0))),
  };
}

/**
 * Full ERFT-D suite (integrity + empirical readout).
 * Suite pass = protocol executed with required controls — NOT that dynamic beat fixed.
 */
export function runErftDExperiments() {
  const rng = mulberry32(0xd1a1);
  const domains = DOMAINS_D;
  const mechs = MECHANISMS.slice(0, 3); // keep exploratory lane tractable
  const candidates = { ...ERFT_D_CANDIDATES };
  const candidatesNoPhi = {
    baseline: candidates.baseline,
    sqrt2: candidates.sqrt2,
    e: candidates.e,
    near_phi: candidates.near_phi,
  };
  const candidatesNearOnly = {
    baseline: candidates.baseline,
    sqrt2: candidates.sqrt2,
    e: candidates.e,
    near_phi: candidates.near_phi,
  };

  // D0 — fixed controls
  const d0Rows = [];
  for (const d of domains) {
    const series = makeSeries(d.kind, 128, rng);
    for (const mech of mechs) {
      const byArm = {};
      for (const [name, c] of Object.entries(NAMED_ARMS)) {
        const run = runDynamicRecursion(series, mech, fixedPolicy(c));
        byArm[name] = {
          c,
          final_nrmse: run.final_nrmse,
          path_length: run.path_length,
          max_nrmse: run.max_nrmse,
          switching_cost: 0,
        };
      }
      d0Rows.push({ domain: d.id, mechanism: mech, arms: byArm });
    }
  }
  const bestFixedByCell = d0Rows.map((row) => {
    let best = Infinity;
    let bestName = null;
    for (const [name, a] of Object.entries(row.arms)) {
      if (a.final_nrmse < best) {
        best = a.final_nrmse;
        bestName = name;
      }
    }
    return { ...row, best_fixed_name: bestName, best_fixed_nrmse: best };
  });
  const bestFixedMean = mean(bestFixedByCell.map((r) => r.best_fixed_nrmse));

  // D1 — prescribed sequences
  const seqDefs = { ...D1_SEQUENCES };
  const seqRng = mulberry32(0xd15e);
  seqDefs.seeded_random = Object.freeze(
    Array.from({ length: GENERATIONS }, () => {
      const vals = Object.values(NAMED_ARMS);
      return vals[Math.floor(seqRng() * vals.length)];
    }),
  );
  const d1Summaries = {};
  for (const [seqName, seq] of Object.entries(seqDefs)) {
    const runs = [];
    for (const d of domains) {
      const series = makeSeries(d.kind, 128, mulberry32(0xd100 + d.id.length));
      for (const mech of mechs) {
        runs.push(runDynamicRecursion(series, mech, sequencePolicy(seq)));
      }
    }
    d1Summaries[seqName] = summarizePolicyRuns(runs);
  }
  let bestSeqName = null;
  let bestSeqMean = Infinity;
  for (const [name, s] of Object.entries(d1Summaries)) {
    if (s.mean_final_nrmse < bestSeqMean) {
      bestSeqMean = s.mean_final_nrmse;
      bestSeqName = name;
    }
  }

  // D2 — state-dependent + random switch control
  const d2Runs = [];
  const d2RandomRuns = [];
  const d2PolicyHist = { rising_picks: {}, falling_picks: {} };
  for (const k of Object.keys(candidates)) {
    d2PolicyHist.rising_picks[k] = 0;
    d2PolicyHist.falling_picks[k] = 0;
  }
  for (const d of domains) {
    const series = makeSeries(d.kind, 128, mulberry32(0xd200 + d.id.length));
    for (const mech of mechs) {
      const pol = stateDependentPolicy(candidates);
      // Instrument: re-run collecting state→pick associations via wrapper
      let risingN = 0;
      let fallingN = 0;
      const instrumented = (state, cPath) => {
        const c = pol(state, cPath);
        const inv = Object.entries(candidates).find(
          ([, v]) => Number(v.toFixed(8)) === Number(c.toFixed(8)),
        );
        const key = inv ? inv[0] : null;
        if (key && state.drift_rising) {
          d2PolicyHist.rising_picks[key] += 1;
          risingN += 1;
        }
        if (key && state.drift_falling) {
          d2PolicyHist.falling_picks[key] += 1;
          fallingN += 1;
        }
        return c;
      };
      void risingN;
      void fallingN;
      d2Runs.push(runDynamicRecursion(series, mech, instrumented));
      d2RandomRuns.push(
        runDynamicRecursion(series, mech, randomSwitchPolicy(candidates, 0xd22d + mech.length)),
      );
    }
  }
  const d2Summary = summarizePolicyRuns(d2Runs);
  const d2RandomSummary = summarizePolicyRuns(d2RandomRuns);

  // D3 — adaptive look-ahead (controller-selection on same fixtures; holdout framing documented)
  const d3Runs = [];
  const d3NoPhiRuns = [];
  const d3NearOnlyRuns = [];
  for (const d of domains) {
    const series = makeSeries(d.kind, 128, mulberry32(0xd300 + d.id.length));
    for (const mech of mechs) {
      const full = runAdaptiveRecursion(series, mech, candidates);
      d3Runs.push(full);
      d3NoPhiRuns.push(runAdaptiveRecursion(series, mech, candidatesNoPhi));
      d3NearOnlyRuns.push(runAdaptiveRecursion(series, mech, candidatesNearOnly));
    }
  }
  const d3Summary = summarizePolicyRuns(d3Runs);
  const d3NoPhiSummary = summarizePolicyRuns(d3NoPhiRuns);
  const d3NearSummary = summarizePolicyRuns(d3NearOnlyRuns);

  // Φ Q1–Q6 readout (descriptive; not crowns)
  const phiFixedMean = mean(
    d0Rows.map((r) => r.arms.egs.final_nrmse),
  );
  const baselineFixedMean = mean(d0Rows.map((r) => r.arms.baseline.final_nrmse));
  const sqrt2FixedMean = mean(d0Rows.map((r) => r.arms.sqrt2.final_nrmse));
  const q1_phi_beats_baseline_fixed = phiFixedMean < baselineFixedMean;
  const q1_phi_is_best_fixed = phiFixedMean <= Math.min(baselineFixedMean, sqrt2FixedMean, mean(d0Rows.map((r) => r.arms.e.final_nrmse)));

  const d3PhiPref = mean(
    d3Runs.map((r) => {
      const hist = selectionHistogram(r.c_path, candidates);
      return hist.probabilities.egs;
    }),
  );
  const q2_phi_preferential = d3PhiPref > 1 / Object.keys(candidates).length + 0.05;
  const q3_phi_helps_dynamic = d3Summary.mean_final_nrmse < d3NoPhiSummary.mean_final_nrmse;
  const q4_removing_phi_hurts =
    d3NoPhiSummary.mean_final_nrmse - d3Summary.mean_final_nrmse > 0.01;
  const q5_near_equiv =
    Math.abs(d3Summary.mean_final_nrmse - d3NearSummary.mean_final_nrmse) < 0.02;
  const q6_special_vs_nearby = !q5_near_equiv && q3_phi_helps_dynamic;

  // Primary comparison: dynamic vs best fixed
  const dynamicBeatsBestFixed =
    Math.min(d2Summary.mean_final_nrmse, d3Summary.mean_final_nrmse, bestSeqMean) <
    bestFixedMean - 1e-9;
  const adaptiveCollapses = d3Summary.fraction_collapse_to_single > 0.5;
  const randomMatchesState =
    Math.abs(d2Summary.mean_final_nrmse - d2RandomSummary.mean_final_nrmse) < 0.02;

  const complexity = {
    controller_parameters: {
      D0: 0,
      D1: 'sequence length = N (prescribed)',
      D2: 'threshold rules on nrmse / drift direction (preregistered)',
      D3: `|C|=${Object.keys(candidates).length} one-step trials per generation`,
    },
    candidate_constants: Object.keys(candidates).length,
    switching_opportunities: GENERATIONS,
    computational_cost_note:
      'D3 costs |C| extra mechanism evaluations per generation vs fixed; D2 is O(1) rule.',
    information: ERFT_D_CONTROLLER_INFO,
    hyperparameters_tuned_on_holdout: false,
    preregistered_rules: true,
  };

  const falsification = {
    best_fixed_matches_or_beats_dynamic: !dynamicBeatsBestFixed,
    random_switching_equivalent: randomMatchesState,
    adaptive_collapses_to_one_constant: adaptiveCollapses,
    no_stable_state_policy: randomMatchesState && !dynamicBeatsBestFixed,
    hypothesis_weakened:
      !dynamicBeatsBestFixed || randomMatchesState || adaptiveCollapses,
  };

  const comparison = {
    best_fixed_mean_nrmse: bestFixedMean,
    best_sequence: { name: bestSeqName, mean_final_nrmse: bestSeqMean },
    state_dependent: d2Summary,
    random_switch_control: d2RandomSummary,
    adaptive: d3Summary,
    adaptive_without_phi: d3NoPhiSummary,
    adaptive_near_phi_proxy: d3NearSummary,
    dynamic_beats_best_fixed: dynamicBeatsBestFixed,
  };

  const phiQuestions = {
    Q1_phi_outperforms_other_fixed: {
      phi_mean: phiFixedMean,
      baseline_mean: baselineFixedMean,
      beats_baseline: q1_phi_beats_baseline_fixed,
      is_best_fixed: q1_phi_is_best_fixed,
    },
    Q2_phi_preferential_in_dynamic: {
      mean_selection_prob: d3PhiPref,
      preferential: q2_phi_preferential,
    },
    Q3_inclusion_improves_dynamic: q3_phi_helps_dynamic,
    Q4_removal_hurts: q4_removing_phi_hurts,
    Q5_nearby_equivalent: q5_near_equiv,
    Q6_special_vs_numerical_location: q6_special_vs_nearby,
  };

  const pass =
    d0Rows.length === domains.length * mechs.length &&
    Object.keys(d1Summaries).length >= 5 &&
    d2Runs.length > 0 &&
    d3Runs.length > 0 &&
    typeof falsification.hypothesis_weakened === 'boolean';

  return {
    id: 'ED_dynamic_constant_regulation',
    title: 'ERFT-D · Dynamic Constant Regulation (exploratory extension)',
    extension: ERFT_D_EXTENSION_ID,
    protocol: ERFT_D_PROTOCOL,
    preserves_v5: true,
    hypothesis:
      'Recursive stability may emerge from dynamic regulation among complementary modes rather than a single fixed constant. Φ is a peer candidate — not privileged.',
    conceptual_model:
      'recursive system → state → drift measurement → mode selection → transformation → new state',
    controller_info: ERFT_D_CONTROLLER_INFO,
    complexity,
    D0_fixed_controls: { rows: d0Rows, best_fixed_mean_nrmse: bestFixedMean },
    D1_prescribed_sequences: d1Summaries,
    D2_state_dependent: {
      summary: d2Summary,
      random_control: d2RandomSummary,
      policy_state_hist: d2PolicyHist,
    },
    D3_adaptive: {
      summary: d3Summary,
      without_phi: d3NoPhiSummary,
      near_phi_proxy: d3NearSummary,
    },
    comparison,
    phi_questions: phiQuestions,
    falsification,
    pass,
    interpretation:
      falsification.hypothesis_weakened
        ? 'On these fixtures, dynamic regulation did not clearly outperform the best fixed constant under matched evaluation — or collapsed / matched random switching. Hypothesis weakened (not a Φ rescue).'
        : 'Dynamic policies show a mean-NRMSE edge over the best fixed constant on these fixtures. Treat as exploratory; complexity-adjusted claims require further hold-out confirmation.',
    honesty:
      'ERFT-D is an exploratory extension. It does not reinterpret ERFT-V5. V5 constant-neutral null/mixed findings remain intact. Not holographic-homeostasis proof. Not a Φ crown.',
  };
}
