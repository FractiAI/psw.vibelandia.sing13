/**
 * ERFT V5 — Constant-neutral (ERFT-C) + generalized-closure (ERFT-G) fidelity experiments.
 *
 * Primary causal lane (ERFT-C): identical recursion topology for every arm;
 * only scalar c changes (via normalized nest weights). No Φ-only closure.
 *
 * Grammar lane (ERFT-G): same weights + generalized C(c) re-entry for every arm.
 *
 * Suite pass = protocol integrity. Empirical Φ advantage is optional and may fail.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  SQRT2,
  E_CONST,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  STANDALONE_REPO,
  GENERATIONS,
  HOLD_OUT_FRACTION,
  NAMED_ARMS,
  BLIND_CONSTANTS,
  SWEEP_MIN,
  SWEEP_MAX,
  SWEEP_STEPS,
  DEPTH_OPTIMA_NS,
  RANDOM_ARM_SEED,
  RANDOM_ARM_COUNT,
  RANDOM_ARM_LO,
  RANDOM_ARM_HI,
  BOOTSTRAP_RESAMPLES,
  BOOTSTRAP_SEED,
  MECHANISMS,
  PROTOCOL_VERSION,
  PRE_REGISTERED_HYPOTHESIS,
  ANTI_BASELINE_BIAS,
  ENGINEERING_THRESHOLD_PCT,
} from './constants.mjs';
import {
  nestWeights,
  nestLags,
  nestBlocks,
  drivePeriod,
  matchedLags,
  matchedBlocks,
  matchedDrivePeriod,
  selfSimilarRatioError,
  phiNestGrammarOk,
  normalizedMixWeights,
  generalizedClosure,
  constantNeutralGeometryOk,
  nestWeights as rawNestWeights,
} from './nest-grammar.mjs';
import {
  CLUTCH_DELTA,
  k81Register,
  octaveStoryDepth,
  vaultPrimeAt,
  engineGrammarLocksOk,
  clutchMixScale,
} from './engine-grammar.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

/** @typedef {'constant_neutral' | 'grammar'} RecursionMode */

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clone(xs) {
  return Float64Array.from(xs);
}

function mean(xs) {
  let s = 0;
  for (const x of xs) s += x;
  return xs.length ? s / xs.length : 0;
}

function median(xs) {
  if (!xs.length) return 0;
  const a = [...xs].sort((u, v) => u - v);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
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

function mae(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.abs(a[i] - b[i]);
  return s / n;
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  const ma = mean(a.subarray ? a.subarray(0, n) : a.slice(0, n));
  const mb = mean(b.subarray ? b.subarray(0, n) : b.slice(0, n));
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const den = Math.sqrt(da * db);
  return den < 1e-15 ? 0 : num / den;
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

/**
 * Optional mix path: apply generalized closure only in grammar mode.
 * Constant-neutral mode returns spatial unchanged for every arm.
 */
function maybeClosure(mode, xs, i, spatial, wMajor, wMinor) {
  if (mode !== 'grammar') return spatial;
  return generalizedClosure(xs, i, spatial, wMajor, wMinor);
}

function mechScaling(xs, c, gen = 0, mode = 'constant_neutral') {
  const n = xs.length;
  const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
  const { wMajor, wMinor } = normalizedMixWeights(c);
  const { la, lb } = matchedLags(n, gen);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = xs[(i + la) % n];
    const b = xs[(i + lb) % n];
    const spatial = wMajor * a + wMinor * b;
    const mix = maybeClosure(mode, xs, i, spatial, wMajor, wMinor);
    out[i] = (1 - w) * xs[i] + w * mix;
  }
  return out;
}

function mechRecursiveWeighting(xs, c, prev, gen = 0, mode = 'constant_neutral') {
  const p = prev || xs;
  const n = xs.length;
  const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
  const { wMajor, wMinor } = normalizedMixWeights(c);
  const { la, lb } = matchedLags(n, gen);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const spatial = wMajor * p[(i + la) % n] + wMinor * p[(i + lb) % n];
    const mix = maybeClosure(mode, p, i, spatial, wMajor, wMinor);
    out[i] = (1 - w) * xs[i] + w * mix;
  }
  return out;
}

function mechHierarchical(xs, c, gen = 0, mode = 'constant_neutral') {
  void mode;
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

function mechFeedback(xs, c, gen = 0, mode = 'constant_neutral') {
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
    const spatial = wMajor * targetSmooth[i] + wMinor * targetBlock[i];
    const t = maybeClosure(mode, xs, i, spatial, wMajor, wMinor);
    out[i] =
      xs[i] +
      gain * (t - xs[i]) +
      drive * rms * Math.sin((2 * Math.PI * i) / period);
  }
  return out;
}

function mechCompression(xs, c, gen = 0, mode = 'constant_neutral') {
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
    const spatial = wMajor * sharp + wMinor * soft;
    const base = maybeClosure(mode, xs, i, spatial, wMajor, wMinor);
    const hp = xs[i] - base;
    out[i] = base + amp * hp * Math.cos((2 * Math.PI * i) / period);
  }
  return out;
}

function applyMechanism(name, xs, c, prev, gen = 0, mode = 'constant_neutral') {
  switch (name) {
    case 'scaling':
      return mechScaling(xs, c, gen, mode);
    case 'recursive_weighting':
      return mechRecursiveWeighting(xs, c, prev, gen, mode);
    case 'hierarchical_resolution':
      return mechHierarchical(xs, c, gen, mode);
    case 'recursive_feedback':
      return mechFeedback(xs, c, gen, mode);
    case 'recursive_compression':
      return mechCompression(xs, c, gen, mode);
    default:
      throw new Error(`unknown mechanism: ${name}`);
  }
}

/**
 * Run recursion with drift-geometry panel.
 * Primary RFD uses NRMSE = RMSE/σ(D0). Also tracks stepwise + path length + recovery.
 */
function runRecursion(d0, mechanism, c, generations = GENERATIONS, mode = 'constant_neutral') {
  let cur = clone(d0);
  let prev = clone(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const sigma0 = seriesStd(d0);
  const curve = [];
  let pathLength = 0;
  let prevState = clone(d0);
  for (let n = 0; n <= generations; n++) {
    const r = rmse(cur, d0);
    const m = mae(cur, d0);
    const corr = pearson(cur, d0);
    const step = n === 0 ? 0 : rmse(cur, prevState);
    if (n > 0) pathLength += step;
    const originDist = r;
    const recovery = pathLength > 1e-15 ? originDist / pathLength : 0;
    curve.push({
      n,
      rfd_rmse: r,
      rfd_nrmse: r / sigma0,
      rfd_mae: m,
      stepwise_rmse: step,
      path_length: pathLength,
      recovery_ratio: recovery,
      fidelity: Math.max(0, corr),
      shape_fidelity: Math.max(0, corr),
      amplitude_fidelity: 1 / (1 + r / sigma0),
      F_over_F0: n === 0 ? 1 : Math.max(0, corr),
    });
    if (n === generations) break;
    prevState = clone(cur);
    const next = applyMechanism(mechanism, cur, c, prev, n, mode);
    prev = cur;
    cur = normalizeEnergy(next, targetRms);
  }
  return curve;
}

function fitDriftSlope(curve) {
  const pts = curve.filter((p) => p.n >= 2 && p.rfd_nrmse > 1e-12);
  if (pts.length < 3) return { a: 0, b: 0, ok: false };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  const n = pts.length;
  for (const p of pts) {
    const x = Math.log(p.n);
    const y = Math.log(p.rfd_nrmse);
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-15) return { a: 0, b: 0, ok: false };
  const b = (n * sxy - sx * sy) / den;
  const logA = (sy - b * sx) / n;
  return { a: Math.exp(logA), b, ok: true };
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
  } else if (kind === 'sunspot_proxy') {
    for (let i = 0; i < len; i++) {
      xs[i] = 60 + 50 * Math.sin((2 * Math.PI * i) / 132) + (rng() - 0.5) * 8;
    }
  } else if (kind === 'sp500_proxy') {
    let x = 100;
    for (let i = 0; i < len; i++) {
      x *= 1 + 0.0008 + (rng() - 0.48) * 0.02;
      xs[i] = x;
    }
  } else if (kind === 'epidemic_proxy') {
    let i = 2;
    let s = 998;
    let r = 0;
    const beta = 0.18;
    const gamma = 0.07;
    for (let t = 0; t < len; t++) {
      const ni = (beta * s * i) / 1000;
      const nr = gamma * i;
      s = Math.max(0, s - ni);
      i = Math.max(0, i + ni - nr);
      r += nr;
      xs[t] = i + (rng() - 0.5) * 0.5;
    }
  } else {
    for (let i = 0; i < len; i++) xs[i] = rng();
  }
  return xs;
}

const DOMAINS = Object.freeze([
  { id: 'synthetic_logistic', kind: 'logistic', domain: 'synthetic' },
  { id: 'synthetic_ar1', kind: 'ar1', domain: 'synthetic' },
  { id: 'synthetic_seasonal', kind: 'seasonal', domain: 'synthetic' },
  { id: 'synthetic_powerlaw', kind: 'powerlaw', domain: 'synthetic' },
  { id: 'env_co2_proxy', kind: 'co2_proxy', domain: 'environmental' },
  { id: 'astro_sunspot_proxy', kind: 'sunspot_proxy', domain: 'astronomical' },
  { id: 'finance_sp500_proxy', kind: 'sp500_proxy', domain: 'financial' },
  { id: 'bio_epidemic_proxy', kind: 'epidemic_proxy', domain: 'biological' },
]);

function randomArms(seed = RANDOM_ARM_SEED) {
  const rng = mulberry32(seed);
  const arms = [];
  for (let i = 0; i < RANDOM_ARM_COUNT; i++) {
    arms.push(RANDOM_ARM_LO + rng() * (RANDOM_ARM_HI - RANDOM_ARM_LO));
  }
  return arms;
}

function finalRfd(curve) {
  return curve[curve.length - 1].rfd_nrmse;
}

function finalRawRmse(curve) {
  return curve[curve.length - 1].rfd_rmse;
}

/** Paired Δ = RFD_baseline − RFD_φ per matched cell + bootstrap CI. */
function pairedDeltaStats(deltas, seed = BOOTSTRAP_SEED) {
  const n = deltas.length;
  if (!n) {
    return {
      n: 0,
      mean_delta: 0,
      median_delta: 0,
      std_delta: 0,
      fraction_positive: 0,
      effect_size_cohens_d: 0,
      bootstrap_ci95: [0, 0],
    };
  }
  const meanD = mean(deltas);
  const sd = stdev(deltas);
  const fracPos = deltas.filter((d) => d > 0).length / n;
  const dCohen = sd > 1e-15 ? meanD / sd : 0;
  const rng = mulberry32(seed);
  const boots = [];
  for (let b = 0; b < BOOTSTRAP_RESAMPLES; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += deltas[Math.floor(rng() * n)];
    boots.push(s / n);
  }
  boots.sort((a, b) => a - b);
  const lo = boots[Math.floor(0.025 * boots.length)] ?? meanD;
  const hi = boots[Math.min(boots.length - 1, Math.floor(0.975 * boots.length))] ?? meanD;
  return {
    n,
    mean_delta: meanD,
    median_delta: median(deltas),
    std_delta: sd,
    fraction_positive: fracPos,
    effect_size_cohens_d: dCohen,
    bootstrap_ci95: [lo, hi],
  };
}

/** Sign-flip permutation p-value for mean paired Δ (null: labels exchangeable). */
function permutationPValue(deltas, seed = 0x9e37, nPerm = 400) {
  if (!deltas.length) return 1;
  const observed = Math.abs(mean(deltas));
  const rng = mulberry32(seed);
  let extreme = 0;
  for (let p = 0; p < nPerm; p++) {
    let s = 0;
    for (const d of deltas) s += rng() < 0.5 ? d : -d;
    if (Math.abs(s / deltas.length) >= observed - 1e-15) extreme += 1;
  }
  return (extreme + 1) / (nPerm + 1);
}

const NEST_HEAVY_MECHANISMS = Object.freeze([
  'recursive_weighting',
  'recursive_feedback',
  'recursive_compression',
]);

function scoreFiveArmRows(rows) {
  const byMech = {};
  const armMeans = {};
  const nestArmMeans = {};
  const pairedDeltas = [];
  const perDomain = {};
  const perMechanism = {};
  let nestRows = 0;
  for (const row of rows) {
    let best = null;
    const isNestHeavy = NEST_HEAVY_MECHANISMS.includes(row.mechanism);
    if (isNestHeavy) nestRows += 1;
    const baseRfd = row.arms.baseline?.rfd_final;
    const egsRfd = row.arms.egs?.rfd_final;
    if (baseRfd != null && egsRfd != null) {
      const delta = baseRfd - egsRfd;
      pairedDeltas.push(delta);
      if (!perDomain[row.domain]) perDomain[row.domain] = [];
      perDomain[row.domain].push(delta);
      if (!perMechanism[row.mechanism]) perMechanism[row.mechanism] = [];
      perMechanism[row.mechanism].push(delta);
    }
    for (const [name, arm] of Object.entries(row.arms)) {
      armMeans[name] = (armMeans[name] || 0) + arm.rfd_final;
      if (isNestHeavy) {
        nestArmMeans[name] = (nestArmMeans[name] || 0) + arm.rfd_final;
      }
      if (!best || arm.rfd_final < best.rfd) best = { name, rfd: arm.rfd_final };
    }
    byMech[row.mechanism] = best.name;
  }
  const nRows = rows.length;
  for (const k of Object.keys(armMeans)) armMeans[k] /= nRows;
  for (const k of Object.keys(nestArmMeans)) nestArmMeans[k] /= nestRows || 1;
  const egsMechWins = Object.values(byMech).filter((n) => n === 'egs').length;
  const baselineMechWins = Object.values(byMech).filter((n) => n === 'baseline').length;
  let lowestMeanArm = null;
  for (const [name, avg] of Object.entries(armMeans)) {
    if (!lowestMeanArm || avg < lowestMeanArm.avg) lowestMeanArm = { name, avg };
  }
  let lowestNestMeanArm = null;
  for (const [name, avg] of Object.entries(nestArmMeans)) {
    if (!lowestNestMeanArm || avg < lowestNestMeanArm.avg) {
      lowestNestMeanArm = { name, avg };
    }
  }
  const NAMED = ['baseline', 'egs', 'sqrt2', 'e'];
  let lowestNamedMeanArm = null;
  for (const name of NAMED) {
    const avg = armMeans[name];
    if (avg == null) continue;
    if (!lowestNamedMeanArm || avg < lowestNamedMeanArm.avg) {
      lowestNamedMeanArm = { name, avg };
    }
  }
  const paired = pairedDeltaStats(pairedDeltas);
  const permP = permutationPValue(pairedDeltas);
  const named = Object.fromEntries(
    NAMED.filter((k) => armMeans[k] != null).map((k) => [k, armMeans[k]]),
  );
  const pctVsBaseline =
    named.baseline > 1e-15 ? (named.baseline - named.egs) / named.baseline : 0;

  // Random-arm percentile: P(RFD(Φ) < RFD(random_i))
  const randomKeys = Object.keys(armMeans).filter((k) => k.startsWith('random_'));
  let phiBeatsRandomFrac = null;
  if (randomKeys.length && named.egs != null) {
    const beats = randomKeys.filter((k) => named.egs < armMeans[k]).length;
    phiBeatsRandomFrac = beats / randomKeys.length;
  }

  return {
    mechanism_lowest_rfd_arm: byMech,
    egs_mechanism_lowest_count: egsMechWins,
    baseline_mechanism_lowest_count: baselineMechWins,
    n_mechanisms: MECHANISMS.length,
    mean_final_rfd_by_arm: armMeans,
    lowest_mean_rfd_arm: lowestMeanArm?.name ?? null,
    nest_heavy_mean_final_rfd_by_arm: nestArmMeans,
    lowest_nest_heavy_mean_rfd_arm: lowestNestMeanArm?.name ?? null,
    lowest_named_mean_rfd_arm: lowestNamedMeanArm?.name ?? null,
    named_mean_final_rfd_by_arm: named,
    phi_vs_baseline_pct: pctVsBaseline,
    engineering_threshold_pct: ENGINEERING_THRESHOLD_PCT,
    paired_delta_baseline_minus_phi: paired,
    permutation_p_mean_delta: permP,
    paired_delta_by_domain: Object.fromEntries(
      Object.entries(perDomain).map(([k, v]) => [k, { mean: mean(v), n: v.length }]),
    ),
    paired_delta_by_mechanism: Object.fromEntries(
      Object.entries(perMechanism).map(([k, v]) => [k, { mean: mean(v), n: v.length }]),
    ),
    phi_beats_random_fraction: phiBeatsRandomFrac,
  };
}

function experimentProtocolLocks() {
  const ok =
    MECHANISMS.length === 5 &&
    Object.keys(NAMED_ARMS).length === 4 &&
    GENERATIONS >= 16 &&
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    PRE_REGISTERED_HYPOTHESIS.suite_pass_means.includes('NOT that Φ won') &&
    PROTOCOL_VERSION.startsWith('ERFT-V5') &&
    ANTI_BASELINE_BIAS.version === 5 &&
    ANTI_BASELINE_BIAS.layers.includes('ERFT-C') &&
    ANTI_BASELINE_BIAS.layers.includes('ERFT-G');
  return {
    id: 'E0_protocol_locks',
    title: 'Pre-registered protocol locks (φ not assumed · V5 C/G split)',
    PROTOCOL_VERSION,
    GENERATIONS,
    MECHANISMS: [...MECHANISMS],
    NAMED_ARMS: { ...NAMED_ARMS },
    ANTI_BASELINE_BIAS,
    ENGINEERING_THRESHOLD_PCT,
    hypothesis: PRE_REGISTERED_HYPOTHESIS,
    pass: ok,
    interpretation:
      'V5 freezes arms, mechanisms, depth, null-ok honesty, and the ERFT-C / ERFT-G layer split before reading outcomes.',
    honesty: 'Protocol lock ≠ physics proof.',
  };
}

function experimentAntiBaselineBias() {
  const rng = mulberry32(0xa7b1);
  const probe = makeSeries('seasonal', 128, rng);
  const named = Object.entries(NAMED_ARMS);
  const mode = 'constant_neutral';

  const firstStep = {};
  for (const mech of ['scaling', 'recursive_weighting']) {
    firstStep[mech] = {};
    for (const [name, c] of named) {
      const next = applyMechanism(mech, probe, c, probe, 0, mode);
      firstStep[mech][name] = rmse(next, probe);
    }
  }
  const noIdentityTrap = ['scaling', 'recursive_weighting'].every((mech) =>
    named.every(([name]) => firstStep[mech][name] > 1e-6),
  );

  function ladderRfds(mech) {
    return BLIND_CONSTANTS.map((c) => ({
      c,
      rfd: finalRfd(runRecursion(probe, mech, c, 12, mode)),
    }));
  }
  const hier = ladderRfds('hierarchical_resolution');
  const comp = ladderRfds('recursive_compression');
  function strictlyMonotoneAscendingByC(rows) {
    for (let i = 1; i < rows.length; i++) {
      if (!(rows[i].rfd > rows[i - 1].rfd + 1e-9)) return false;
    }
    return true;
  }
  const notMonotoneCoarsening =
    !strictlyMonotoneAscendingByC(hier) && !strictlyMonotoneAscendingByC(comp);

  const fb = named.map(([name, c]) => ({
    name,
    c,
    rfd: finalRfd(runRecursion(probe, 'recursive_feedback', c, 12, mode)),
  }));
  const fbSortedByC = [...fb].sort((a, b) => a.c - b.c);
  const feedbackNotInverseGain = !fbSortedByC.every((row, i, arr) => {
    if (i === 0) return true;
    return row.rfd < arr[i - 1].rfd - 1e-9;
  });

  const spreadScaling =
    Math.max(...Object.values(firstStep.scaling)) /
    Math.max(1e-12, Math.min(...Object.values(firstStep.scaling)));
  // V5 constant-neutral: geometry is matched, so first-step spreads are naturally small.
  // Still require arms to differ (not a flat identical transform across c).
  const armSpreadOk = spreadScaling > 1.001;

  function firstStepSpread(mech) {
    const vals = named.map(([, c]) =>
      rmse(applyMechanism(mech, probe, c, probe, 0, mode), probe),
    );
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    return { lo, hi, ratio: hi / Math.max(lo, 1e-12) };
  }
  const hierSpread = firstStepSpread('hierarchical_resolution');
  const compSpread = firstStepSpread('recursive_compression');
  const severityParity = hierSpread.ratio < 1.85 && compSpread.ratio < 2.35;

  const pass =
    noIdentityTrap &&
    notMonotoneCoarsening &&
    feedbackNotInverseGain &&
    armSpreadOk &&
    severityParity;

  return {
    id: 'E0b_anti_baseline_bias',
    title: 'Anti-baseline-bias construction locks (V5 constant-neutral)',
    first_step_rfd: firstStep,
    hierarchical_ladder: hier,
    compression_ladder: comp,
    feedback_named: fb,
    scaling_first_step_spread_ratio: spreadScaling,
    severity_parity: { hierarchical: hierSpread, compression: compSpread },
    checks: {
      noIdentityTrap,
      notMonotoneCoarsening,
      feedbackNotInverseGain,
      armSpreadOk,
      severityParity,
    },
    pass,
    interpretation:
      'Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.',
    honesty: 'Anti-bias lock ≠ Φ advantage. Empirical outcomes still free to null.',
  };
}

function experimentNestGrammarLock() {
  const phiErr = selfSimilarRatioError(PHI_EGS);
  const baseline = rawNestWeights(1.0);
  const phiW = rawNestWeights(PHI_EGS);
  const decoyW = rawNestWeights(SQRT2);
  const geoOk = constantNeutralGeometryOk();
  // V5: Φ algebra still closes; decoys still ≠ 1 raw — but mix always normalizes (no Φ-only affordance).
  const mixPhi = normalizedMixWeights(PHI_EGS);
  const mixDecoy = normalizedMixWeights(SQRT2);
  const bothUnit =
    Math.abs(mixPhi.wMajor + mixPhi.wMinor - 1) < 1e-12 &&
    Math.abs(mixDecoy.wMajor + mixDecoy.wMinor - 1) < 1e-12;
  const pass =
    phiNestGrammarOk() &&
    baseline.dyadic === true &&
    Math.abs(baseline.wMajor - 0.5) < 1e-12 &&
    phiErr < 1e-10 &&
    Math.abs(phiW.wMajor + phiW.wMinor - 1) < 1e-12 &&
    Math.abs(decoyW.partition_sum - 1) > 0.05 &&
    bothUnit &&
    geoOk;
  return {
    id: 'E0c_nest_grammar_lock',
    title: 'Nest grammar + constant-neutral geometry lock (V5)',
    phi_self_similar_error: phiErr,
    phi_partition: phiW,
    baseline_dyadic: baseline,
    decoy_raw_sum: decoyW.partition_sum,
    mix_always_unit_sum: bothUnit,
    constant_neutral_geometry: geoOk,
    pass,
    interpretation:
      'Φ algebra closes by identity; every arm (including decoys) mixes after unit-sum normalization; lags/blocks/period are generation-matched across arms.',
    honesty: 'Grammar/geometry lock ≠ Φ empirical advantage on fixtures.',
  };
}

function experimentEngineGrammarLock() {
  const n = 256;
  const gen = 12;
  const laA = nestLags(n, PHI_EGS, gen);
  const laB = nestLags(n, SQRT2, gen);
  const blocksA = nestBlocks(PHI_EGS, gen);
  const blocksB = nestBlocks(SQRT2, gen);
  const matched =
    laA.la === laB.la &&
    laA.lb === laB.lb &&
    blocksA.b1 === blocksB.b1 &&
    blocksA.b2 === blocksB.b2;
  const pass =
    engineGrammarLocksOk() &&
    matched &&
    CLUTCH_DELTA > 0 &&
    k81Register(gen) >= 0 &&
    octaveStoryDepth(gen) >= 1 &&
    constantNeutralGeometryOk(n, gen);
  return {
    id: 'E0d_engine_grammar_lock',
    title: 'Engine grammar lock (matched geometry · no c-dependent lags)',
    CLUTCH_DELTA,
    k81_gen12: k81Register(gen),
    octave_gen12: octaveStoryDepth(gen),
    vault_gen12: vaultPrimeAt(gen),
    lag_phi_vs_sqrt2: { phi: laA, sqrt2: laB, identical: matched },
    block_phi_vs_sqrt2: { phi: blocksA, sqrt2: blocksB, identical: matched },
    pass,
    interpretation:
      'V5 requires identical generation-indexed lags/blocks across arms — geometry is not a treatment.',
    honesty: 'Engine fixture lock ≠ Φ empirical advantage.',
  };
}

function runMatchedArmBoard(domains, mode) {
  const rng = mulberry32(0xe8f7);
  const random = randomArms();
  const arms = {
    ...NAMED_ARMS,
    random_0: random[0],
    random_1: random[1],
  };
  const rows = [];
  for (const d of domains) {
    const series = makeSeries(d.kind, 256, rng);
    for (const mech of MECHANISMS) {
      const byArm = {};
      for (const [name, c] of Object.entries(arms)) {
        const curve = runRecursion(series, mech, c, GENERATIONS, mode);
        const slope = fitDriftSlope(curve);
        const last = curve[curve.length - 1];
        byArm[name] = {
          c,
          rfd_final: finalRfd(curve),
          rfd_rmse_raw: finalRawRmse(curve),
          fidelity_final: last.fidelity,
          shape_fidelity: last.shape_fidelity,
          amplitude_fidelity: last.amplitude_fidelity,
          path_length: last.path_length,
          recovery_ratio: last.recovery_ratio,
          drift_slope_b: slope.ok ? slope.b : null,
          drift_a: slope.ok ? slope.a : null,
        };
      }
      rows.push({ domain: d.id, domainClass: d.domain, mechanism: mech, arms: byArm, mode });
    }
  }
  return rows;
}

function experimentFiveArmMatched(domains = DOMAINS.slice(0, 6)) {
  const rows = runMatchedArmBoard(domains, 'constant_neutral');
  const pass =
    rows.length === domains.length * MECHANISMS.length &&
    rows.every((r) => Object.keys(r.arms).length >= 5);
  const scoreboard = scoreFiveArmRows(rows);
  return {
    id: 'E1_five_arm_matched',
    title: 'ERFT-C · Five-arm constant-neutral recursion (primary causal)',
    mode: 'constant_neutral',
    rows,
    scoreboard,
    pass,
    interpretation:
      'Identical recursion topology and evaluator; only scalar nest-weight c differs. No Φ-specific closure. Scoreboard reports paired Δ and means — suite pass does not crown Φ.',
    honesty:
      'Primary causal lane. Proxy fixtures. NRMSE primary. 15% band is engineering threshold only.',
  };
}

function experimentGrammarClosure(domains = DOMAINS.slice(0, 6)) {
  const rows = runMatchedArmBoard(domains, 'grammar');
  const pass =
    rows.length === domains.length * MECHANISMS.length &&
    rows.every((r) => Object.keys(r.arms).length >= 5);
  const scoreboard = scoreFiveArmRows(rows);
  // Contrast: does grammar help Φ more than √2 relative to constant-neutral?
  const cRows = runMatchedArmBoard(domains, 'constant_neutral');
  const cScore = scoreFiveArmRows(cRows);
  const gNamed = scoreboard.named_mean_final_rfd_by_arm;
  const cNamed = cScore.named_mean_final_rfd_by_arm;
  const grammarDeltaVsNeutral = {
    egs: cNamed.egs - gNamed.egs,
    sqrt2: cNamed.sqrt2 - gNamed.sqrt2,
    e: cNamed.e - gNamed.e,
    baseline: cNamed.baseline - gNamed.baseline,
  };
  return {
    id: 'E1g_grammar_closure',
    title: 'ERFT-G · Generalized closure C(c) for every arm',
    mode: 'grammar',
    rows,
    scoreboard,
    grammar_delta_vs_neutral_mean_rfd: grammarDeltaVsNeutral,
    pass,
    interpretation:
      'Same algorithm family with symmetric C(c) re-entry on nest-heavy paths. Asks whether exploiting nest algebra adds stability — and whether Φ benefits disproportionately vs decoys under the same operator.',
    honesty: 'Architectural hypothesis lane — not a substitute for ERFT-C causal isolation.',
  };
}

function experimentBlindLadder() {
  const rng = mulberry32(0xb11d);
  const series = makeSeries('seasonal', 256, rng);
  const mode = 'constant_neutral';
  const results = BLIND_CONSTANTS.map((c) => {
    let rfdSum = 0;
    let slopeSum = 0;
    for (const mech of MECHANISMS) {
      const curve = runRecursion(series, mech, c, 12, mode);
      rfdSum += finalRfd(curve);
      slopeSum += fitDriftSlope(curve).b;
    }
    return {
      c,
      rfd_final: rfdSum / MECHANISMS.length,
      slope_b: slopeSum / MECHANISMS.length,
      is_phi: Math.abs(c - PHI_EGS) < 1e-12,
    };
  });
  const ranked = [...results].sort((a, b) => a.rfd_final - b.rfd_final);
  const phiRank = ranked.findIndex((r) => r.is_phi) + 1;
  return {
    id: 'E2_blind_constant_ladder',
    title: 'Blind constant ladder · ERFT-C (φ unlabeled · mean NRMSE)',
    mechanism: 'all_mechanisms_mean',
    mode,
    results,
    ranked_c: ranked.map((r) => r.c),
    phi_rank_by_lowest_rfd: phiRank,
    pass: results.length === BLIND_CONSTANTS.length && phiRank >= 1,
    interpretation:
      'Rank distribution under constant-neutral recursion. Report rank — do not declare a universal crown from one seasonal probe.',
    honesty: 'Single-series blind ladder is illustrative; multi-domain paired Δ is the stronger read.',
  };
}

function experimentConstantSweep() {
  const rng = mulberry32(0x5ee7);
  const trainKinds = ['logistic', 'ar1', 'seasonal', 'co2_proxy'];
  const holdKinds = ['powerlaw', 'sunspot_proxy'];
  const mode = 'constant_neutral';
  const grid = [];
  for (let i = 0; i < SWEEP_STEPS; i++) {
    grid.push(SWEEP_MIN + (i * (SWEEP_MAX - SWEEP_MIN)) / (SWEEP_STEPS - 1));
  }
  function avgRfd(kinds) {
    return grid.map((c) => {
      let s = 0;
      let count = 0;
      for (const k of kinds) {
        const series = makeSeries(k, 192, rng);
        for (const mech of MECHANISMS) {
          s += finalRfd(runRecursion(series, mech, c, 16, mode));
          count += 1;
        }
      }
      return { c, rfd: s / count };
    });
  }
  const train = avgRfd(trainKinds);
  const hold = avgRfd(holdKinds);
  const trainMin = train.reduce((a, b) => (b.rfd < a.rfd ? b : a));
  const holdMin = hold.reduce((a, b) => (b.rfd < a.rfd ? b : a));
  const nearPhi = (c) => Math.abs(c - PHI_EGS) < 0.06;
  const phiTrain = train.find((p) => Math.abs(p.c - PHI_EGS) < 0.02);
  const phiHold = hold.find((p) => Math.abs(p.c - PHI_EGS) < 0.02);
  return {
    id: 'E3_constant_sweep',
    title: 'Continuous Drift(c) sweep · ERFT-C · train/hold (prominence: optimality falsifier)',
    mechanism: 'all_mechanisms_mean',
    mode,
    HOLD_OUT_FRACTION,
    train_min: trainMin,
    hold_min: holdMin,
    train_min_near_phi: nearPhi(trainMin.c),
    hold_min_near_phi: nearPhi(holdMin.c),
    rfd_at_phi_train: phiTrain?.rfd ?? null,
    rfd_at_phi_hold: phiHold?.rfd ?? null,
    train_curve_sample: train.filter((_, i) => i % 5 === 0),
    hold_curve_sample: hold.filter((_, i) => i % 5 === 0),
    pass: train.length === SWEEP_STEPS && hold.length === SWEEP_STEPS,
    interpretation:
      'Sweep minimum away from Φ falsifies the strong optimality claim within this parameterized family. Emphasize this result — it is scientifically valuable.',
    honesty: 'Sweep minima are fixture-relative; do not promote to CODATA.',
  };
}

/** Depth-dependent optima: c*_n = argmin_c RFD_n(c) for n in DEPTH_OPTIMA_NS. */
function experimentDepthOptima() {
  const rng = mulberry32(0xd307);
  const series = makeSeries('seasonal', 192, rng);
  const mode = 'constant_neutral';
  const grid = [];
  for (let i = 0; i < SWEEP_STEPS; i++) {
    grid.push(SWEEP_MIN + (i * (SWEEP_MAX - SWEEP_MIN)) / (SWEEP_STEPS - 1));
  }
  const mech = 'recursive_weighting';
  const optima = DEPTH_OPTIMA_NS.map((depth) => {
    let best = { c: grid[0], rfd: Infinity };
    for (const c of grid) {
      const curve = runRecursion(series, mech, c, depth, mode);
      const rfd = finalRfd(curve);
      if (rfd < best.rfd) best = { c, rfd };
    }
    return {
      n: depth,
      c_star: best.c,
      rfd: best.rfd,
      distance_to_phi: Math.abs(best.c - PHI_EGS),
      moving_toward_phi: null,
    };
  });
  for (let i = 1; i < optima.length; i++) {
    optima[i].moving_toward_phi =
      optima[i].distance_to_phi < optima[i - 1].distance_to_phi - 1e-9;
  }
  const finalToward =
    optima.length >= 2 &&
    optima[optima.length - 1].distance_to_phi < optima[0].distance_to_phi - 0.05;
  return {
    id: 'E3b_depth_optima',
    title: 'Depth-dependent optima c*_n (does the minimum drift toward Φ?)',
    mechanism: mech,
    mode,
    optima,
    converges_toward_phi: finalToward,
    pass: optima.length === DEPTH_OPTIMA_NS.length,
    interpretation:
      'If c*_n stays near ~1.025, evidence against a Φ-attractor with depth. If c*_n marches toward 1.618, that is a stronger structural signal than a single aggregate.',
    honesty: 'Single-mechanism / single-series probe — exploratory, not confirmatory.',
  };
}

function experimentDriftSlopeContrast() {
  const rng = mulberry32(0x5109);
  const series = makeSeries('logistic', 320, rng);
  const mech = 'recursive_compression';
  const mode = 'constant_neutral';
  const arms = { baseline: 1.0, egs: PHI_EGS, sqrt2: SQRT2, e: E_CONST };
  const out = {};
  for (const [name, c] of Object.entries(arms)) {
    const curve = runRecursion(series, mech, c, GENERATIONS, mode);
    out[name] = {
      c,
      slope: fitDriftSlope(curve),
      rfd_curve: curve.map((p) => ({
        n: p.n,
        rfd_nrmse: p.rfd_nrmse,
        stepwise: p.stepwise_rmse,
        path_length: p.path_length,
        recovery_ratio: p.recovery_ratio,
        F: p.F_over_F0,
      })),
    };
  }
  return {
    id: 'E4_drift_slope',
    title: 'Drift geometry panel (origin · stepwise · path · recovery)',
    mechanism: mech,
    mode,
    arms: out,
    pass: Object.values(out).every((a) => a.slope.ok),
    interpretation:
      'Distinguishes convergence, oscillation, random walk, progressive degradation, and runaway drift — richer than final RFD alone.',
    honesty: 'Power-law fit + geometry panel are pre-registered summaries, not proof of a bounded attractor.',
  };
}

function experimentPhiNotAssumed() {
  const pass =
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    Math.abs(NAMED_ARMS.egs - PHI_EGS) < 1e-15 &&
    NAMED_ARMS.baseline === 1.0 &&
    /V5 separates|constant-neutral|ERFT-C/i.test(PRE_REGISTERED_HYPOTHESIS.v4_confound_note);
  return {
    id: 'E5_phi_not_assumed',
    title: 'Falsifiability lock — Φ is one arm among peers · V5 separates effects',
    PRE_REGISTERED_HYPOTHESIS,
    STANDALONE_REPO,
    pass,
    interpretation:
      'Q1 numerical · Q2 optimality · Q3 structural — three different hypotheses. V4 partially combined them; V5 separates them.',
    honesty: 'A null result is a valid scientific outcome for this suite.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasErft: /ERFT|Recursive Fidelity/i.test(paper),
    hasFalsifiable: /falsif/i.test(paper),
    hasNotAssume: /does not assume|not assume|φ not assumed|phi not assumed/i.test(paper),
    hasFiveArm: /five-arm|five arm|baseline/i.test(paper),
    hasV5Split: /ERFT-C|constant-neutral|ERFT-V5|generalized closure/i.test(paper),
  };
  return {
    id: 'E6_paper_locks',
    title: 'Paper presence + honesty / falsifiability / V5-split locks',
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Paper must state controlled design, refuse Φ-assumed framing, and document the C/G split.',
    honesty: 'Structural lock only.',
  };
}

function experimentShipBlogLock() {
  const local = path.join(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);
  const exists = fs.existsSync(MONOREPO_BLOG) || fs.existsSync(local);
  const html = exists
    ? fs.readFileSync(fs.existsSync(MONOREPO_BLOG) ? MONOREPO_BLOG : local, 'utf8')
    : '';
  const checks = {
    exists,
    hasHonestyRail: /class="honesty"/i.test(html),
    hasErft: /ERFT|Drift Test|recursive fidelity|ERFT-V[345]/i.test(html),
    hasV5: /ERFT-V5|constant-neutral|ERFT-C/i.test(html),
  };
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog magazine lock',
    SHIP_BLOG_SLUG,
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Frontiersman magazine note required for paper ship; must reflect V5 C/G split.',
    honesty: 'Structural lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentProtocolLocks(),
    experimentAntiBaselineBias(),
    experimentNestGrammarLock(),
    experimentEngineGrammarLock(),
    experimentFiveArmMatched(),
    experimentGrammarClosure(),
    experimentBlindLadder(),
    experimentConstantSweep(),
    experimentDepthOptima(),
    experimentDriftSlopeContrast(),
    experimentPhiNotAssumed(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    PROTOCOL_VERSION,
    PHI_EGS,
    layers: ['ERFT-C', 'ERFT-G'],
    experiments,
  };
}
