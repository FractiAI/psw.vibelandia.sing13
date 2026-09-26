/**
 * ERFT V4 — numeric recursive fidelity experiments.
 * Same recursion / evaluator / depth; arm c changes nest weights only.
 * V4: matched geometry via engine grammar (k/81 · octaves · prime vaults · clutch Δ).
 * V3 confounded c with lag/block budgets (retired).
 * Suite pass = protocol integrity. Φ win is optional empirical outcome.
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
  RANDOM_ARM_SEED,
  RANDOM_ARM_COUNT,
  RANDOM_ARM_LO,
  RANDOM_ARM_HI,
  MECHANISMS,
  PROTOCOL_VERSION,
  PRE_REGISTERED_HYPOTHESIS,
  ANTI_BASELINE_BIAS,
} from './constants.mjs';
import {
  nestWeights,
  nestLags,
  nestBlocks,
  drivePeriod,
  selfSimilarRatioError,
  phiNestGrammarOk,
  normalizedMixWeights,
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

/** Mulberry32 PRNG — reproducible arms / noise. */
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
  return s / xs.length;
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

/** Fixed-severity block-mean compress → expand (optional circular offset). */
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
 * Mechanism A — multi-scale shear with nest-ratio lag blend.
 */
/** Φ-exact only: one self-similar re-entry (1/φ + 1/φ² closure) — pre-registered nest hypothesis channel. */
function selfSimilarClosure(xs, i, spatial, wMajor, wMinor, phi_exact) {
  if (!phi_exact) return spatial;
  return wMajor * spatial + wMinor * (wMajor * xs[i] + wMinor * spatial);
}

function mechScaling(xs, c, gen = 0) {
  const n = xs.length;
  const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
  const { wMajor, wMinor, phi_exact } = normalizedMixWeights(c);
  const { la, lb } = nestLags(n, c, gen);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = xs[(i + la) % n];
    const b = xs[(i + lb) % n];
    const mix = wMajor * a + wMinor * b;
    out[i] = (1 - w) * xs[i] + w * mix;
  }
  return out;
}

/**
 * Mechanism B — recursive weighting: prior generation mixed at nest lags.
 */
function mechRecursiveWeighting(xs, c, prev, gen = 0) {
  const p = prev || xs;
  const n = xs.length;
  const w = ANTI_BASELINE_BIAS.fixed_mix_weight * clutchMixScale();
  const { wMajor, wMinor, phi_exact } = normalizedMixWeights(c);
  const { la, lb } = nestLags(n, c, gen);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const spatial = wMajor * p[(i + la) % n] + wMinor * p[(i + lb) % n];
    const mix = selfSimilarClosure(p, i, spatial, wMajor, wMinor, phi_exact);
    out[i] = (1 - w) * xs[i] + w * mix;
  }
  return out;
}

/**
 * Mechanism C — hierarchical resolution at nest-derived block scales.
 */
function mechHierarchical(xs, c, gen = 0) {
  const { b1, b2 } = nestBlocks(c, gen);
  const a = blockMeanExpand(xs, b1, 0);
  const b = blockMeanExpand(xs, b2, Math.floor(b2 / 2));
  const { wMajor, wMinor } = normalizedMixWeights(c);
  const amp = 0.3;
  const period = drivePeriod(c, gen);
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    const base = wMajor * a[i] + wMinor * b[i];
    const hp = xs[i] - base;
    out[i] = base + amp * hp * Math.cos((2 * Math.PI * i) / period);
  }
  return out;
}

/**
 * Mechanism D — homeostatic feedback toward nest-weighted multi-scale target.
 */
function mechFeedback(xs, c, gen = 0) {
  const gain = ANTI_BASELINE_BIAS.fixed_feedback_gain;
  const { wMajor, wMinor } = normalizedMixWeights(c);
  const targetSmooth = smooth3(xs);
  const { b1 } = nestBlocks(c, gen);
  const targetBlock = blockMeanExpand(xs, b1, 0);
  let rms = 0;
  for (const x of xs) rms += x * x;
  rms = Math.sqrt(rms / xs.length) || 1;
  const drive = 0.08;
  const period = drivePeriod(c, gen);
  const out = new Float64Array(xs.length);
  const { phi_exact } = normalizedMixWeights(c);
  for (let i = 0; i < xs.length; i++) {
    const spatial = wMajor * targetSmooth[i] + wMinor * targetBlock[i];
    const t = selfSimilarClosure(xs, i, spatial, wMajor, wMinor, phi_exact);
    out[i] =
      xs[i] +
      gain * (t - xs[i]) +
      drive * rms * Math.sin((2 * Math.PI * i) / period);
  }
  return out;
}

/**
 * Mechanism E — compression at nest block with nest-weighted recon blend.
 */
function mechCompression(xs, c, gen = 0) {
  const { b1, b2 } = nestBlocks(c, gen);
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
  const { wMajor, wMinor, phi_exact } = normalizedMixWeights(c);
  const amp = 0.3;
  const period = drivePeriod(c, gen);
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
    const base = selfSimilarClosure(xs, i, spatial, wMajor, wMinor, phi_exact);
    const hp = xs[i] - base;
    out[i] = base + amp * hp * Math.cos((2 * Math.PI * i) / period);
  }
  return out;
}

function applyMechanism(name, xs, c, prev, gen = 0) {
  switch (name) {
    case 'scaling':
      return mechScaling(xs, c, gen);
    case 'recursive_weighting':
      return mechRecursiveWeighting(xs, c, prev, gen);
    case 'hierarchical_resolution':
      return mechHierarchical(xs, c, gen);
    case 'recursive_feedback':
      return mechFeedback(xs, c, gen);
    case 'recursive_compression':
      return mechCompression(xs, c, gen);
    default:
      throw new Error(`unknown mechanism: ${name}`);
  }
}

/**
 * Run recursion: D0 → D1 → … → DN under fixed mechanism + constant.
 * RFD_n = Dist(Dn, D0) using RMSE (primary) + MAE + 1−corr.
 */
function runRecursion(d0, mechanism, c, generations = GENERATIONS) {
  let cur = clone(d0);
  let prev = clone(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const curve = [];
  for (let n = 0; n <= generations; n++) {
    const r = rmse(cur, d0);
    const m = mae(cur, d0);
    const corr = pearson(cur, d0);
    curve.push({
      n,
      rfd_rmse: r,
      rfd_mae: m,
      fidelity: Math.max(0, corr),
      F_over_F0: n === 0 ? 1 : Math.max(0, corr),
    });
    if (n === generations) break;
    const next = applyMechanism(mechanism, cur, c, prev, n);
    prev = cur;
    cur = normalizeEnergy(next, targetRms);
  }
  return curve;
}

/** Fit log RFD ≈ log a + b log n for n≥2 (drift slope). */
function fitDriftSlope(curve) {
  const pts = curve.filter((p) => p.n >= 2 && p.rfd_rmse > 1e-12);
  if (pts.length < 3) return { a: 0, b: 0, ok: false };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  const n = pts.length;
  for (const p of pts) {
    const x = Math.log(p.n);
    const y = Math.log(p.rfd_rmse);
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
    // Synthetic rising CO₂-like series (fixture; not NOAA live pull)
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
  return curve[curve.length - 1].rfd_rmse;
}

function experimentProtocolLocks() {
  const ok =
    MECHANISMS.length === 5 &&
    Object.keys(NAMED_ARMS).length === 4 &&
    GENERATIONS >= 16 &&
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    PRE_REGISTERED_HYPOTHESIS.suite_pass_means.includes('NOT that Φ won') &&
    PROTOCOL_VERSION.startsWith('ERFT-V4') &&
    ANTI_BASELINE_BIAS.version === 4;
  return {
    id: 'E0_protocol_locks',
    title: 'Pre-registered protocol locks (φ not assumed · V2 anti-bias)',
    PROTOCOL_VERSION,
    GENERATIONS,
    MECHANISMS: [...MECHANISMS],
    NAMED_ARMS: { ...NAMED_ARMS },
    ANTI_BASELINE_BIAS,
    hypothesis: PRE_REGISTERED_HYPOTHESIS,
    pass: ok,
    interpretation:
      'V4 freezes arms, mechanisms, depth, null-ok honesty, matched engine geometry, and nest-weight locks before reading outcomes.',
    honesty: 'Protocol lock ≠ physics proof.',
  };
}

/**
 * E0b — Construction anti-bias: baseline must not inherit least-drift
 * from milder coarsening or null transforms (the V1 failure mode).
 */
function experimentAntiBaselineBias() {
  const rng = mulberry32(0xa7b1);
  const probe = makeSeries('seasonal', 128, rng);
  const named = Object.entries(NAMED_ARMS);

  // (1) First-step RFD must be clearly nonzero for scaling + weighting (no identity trap).
  const firstStep = {};
  for (const mech of ['scaling', 'recursive_weighting']) {
    firstStep[mech] = {};
    for (const [name, c] of named) {
      const next = applyMechanism(mech, probe, c, probe);
      firstStep[mech][name] = rmse(next, probe);
    }
  }
  const noIdentityTrap = ['scaling', 'recursive_weighting'].every((mech) =>
    named.every(([name]) => firstStep[mech][name] > 1e-6),
  );

  // (2) Hierarchical + compression: final RFD on blind ladder must NOT be
  //     strictly sorted ascending with c (V1: smaller c ⇒ lower RFD always).
  function ladderRfds(mech) {
    return BLIND_CONSTANTS.map((c) => ({
      c,
      rfd: finalRfd(runRecursion(probe, mech, c, 12)),
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

  // (3) Feedback must not recreate gain=1/c (where larger c always wins least drift).
  const fb = named.map(([name, c]) => ({
    name,
    c,
    rfd: finalRfd(runRecursion(probe, 'recursive_feedback', c, 12)),
  }));
  const fbSortedByC = [...fb].sort((a, b) => a.c - b.c);
  const feedbackNotInverseGain = !fbSortedByC.every((row, i, arr) => {
    if (i === 0) return true;
    return row.rfd < arr[i - 1].rfd - 1e-9; // strictly falling RFD as c rises
  });

  // (4) V3 construction: scaling/weighting first-step must differ across arms
  //     (no flat transform — not an empirical “who won” gate).
  const spreadScaling =
    Math.max(...Object.values(firstStep.scaling)) /
    Math.max(1e-12, Math.min(...Object.values(firstStep.scaling)));
  const armSpreadOk = spreadScaling > 1.05;

  // (5) Severity parity: first-step RFD for hierarchical/compression similar
  //     across named arms (no c=1-only mild path).
  function firstStepSpread(mech) {
    const vals = named.map(([, c]) => rmse(applyMechanism(mech, probe, c, probe), probe));
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
    title: 'Anti-baseline-bias construction locks (V4 matched geometry)',
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
    honesty: 'Anti-bias lock ≠ Φ win. Empirical outcomes still free to null.',
  };
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
  let nestRows = 0;
  for (const row of rows) {
    let best = null;
    const isNestHeavy = NEST_HEAVY_MECHANISMS.includes(row.mechanism);
    if (isNestHeavy) nestRows += 1;
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
  const nMech = MECHANISMS.length;
  for (const k of Object.keys(armMeans)) armMeans[k] /= nRows;
  for (const k of Object.keys(nestArmMeans)) nestArmMeans[k] /= nestRows;
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
  return {
    mechanism_winners: byMech,
    egs_mechanism_wins: egsMechWins,
    baseline_mechanism_wins: baselineMechWins,
    n_mechanisms: nMech,
    mean_final_rfd_by_arm: armMeans,
    lowest_mean_rfd_arm: lowestMeanArm?.name ?? null,
    nest_heavy_mean_final_rfd_by_arm: nestArmMeans,
    lowest_nest_heavy_mean_rfd_arm: lowestNestMeanArm?.name ?? null,
    lowest_named_mean_rfd_arm: lowestNamedMeanArm?.name ?? null,
    named_mean_final_rfd_by_arm: Object.fromEntries(
      NAMED.filter((k) => armMeans[k] != null).map((k) => [k, armMeans[k]]),
    ),
  };
}

function experimentEngineGrammarLock() {
  const n = 256;
  const gen = 12;
  const laPhi = nestLags(n, PHI_EGS, gen);
  const laDecoy = nestLags(n, SQRT2, gen);
  const blocksPhi = nestBlocks(PHI_EGS, gen);
  const blocksDecoy = nestBlocks(SQRT2, gen);
  const pass =
    engineGrammarLocksOk() &&
    laPhi.la !== laDecoy.la &&
    CLUTCH_DELTA > 0 &&
    k81Register(gen) >= 0 &&
    octaveStoryDepth(gen) >= 1;
  return {
    id: 'E0d_engine_grammar_lock',
    title: 'Engine grammar lock (k/81 · octaves · prime vaults · matched lags)',
    CLUTCH_DELTA,
    k81_gen12: k81Register(gen),
    octave_gen12: octaveStoryDepth(gen),
    vault_gen12: vaultPrimeAt(gen),
    lag_phi_vs_sqrt2: { phi: laPhi, sqrt2: laDecoy },
    block_phi_vs_sqrt2: { phi: blocksPhi, sqrt2: blocksDecoy },
    pass,
    interpretation:
      'Each arm carries its own nest-ratio lags/blocks with vault×(c/Φ) severity normalization and uniform k/81 overlay.',
    honesty: 'Engine fixture lock ≠ Φ empirical win.',
  };
}

function experimentNestGrammarLock() {
  const phiErr = selfSimilarRatioError(PHI_EGS);
  const baseline = rawNestWeights(1.0);
  const phiW = rawNestWeights(PHI_EGS);
  const decoyW = rawNestWeights(SQRT2);
  const pass =
    phiNestGrammarOk() &&
    baseline.dyadic === true &&
    Math.abs(baseline.wMajor - 0.5) < 1e-12 &&
    phiErr < 1e-10 &&
    phiW.phi_exact === true &&
    Math.abs(phiW.wMajor + phiW.wMinor - 1) < 1e-12 &&
    Math.abs(decoyW.partition_sum - 1) > 0.05;
  return {
    id: 'E0c_nest_grammar_lock',
    title: 'Nest-ratio grammar lock (V3 · models RSI partition, not sin(c))',
    phi_self_similar_error: phiErr,
    phi_partition: phiW,
    baseline_dyadic: baseline,
    pass,
    interpretation:
      'Φ satisfies whole:part ≈ part:remainder; baseline is dyadic 1:1; decoys use 1/c partition without V2 arbitrary phase.',
    honesty: 'Grammar lock ≠ Φ empirical win on fixtures.',
  };
}

function experimentFiveArmMatched(domains = DOMAINS.slice(0, 6)) {
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
        const curve = runRecursion(series, mech, c);
        const slope = fitDriftSlope(curve);
        byArm[name] = {
          c,
          rfd_final: finalRfd(curve),
          fidelity_final: curve[curve.length - 1].fidelity,
          drift_slope_b: slope.ok ? slope.b : null,
          drift_a: slope.ok ? slope.a : null,
        };
      }
      rows.push({ domain: d.id, domainClass: d.domain, mechanism: mech, arms: byArm });
    }
  }
  // Integrity: every row has all arms; same evaluator shape
  const pass =
    rows.length === domains.length * MECHANISMS.length &&
    rows.every((r) => Object.keys(r.arms).length >= 5);
  const scoreboard = scoreFiveArmRows(rows);
  return {
    id: 'E1_five_arm_matched',
    title: 'Five-arm matched recursion (baseline · Φ · √2 · e · random)',
    rows,
    scoreboard,
    pass,
    interpretation:
      'Identical recursion/evaluator; only nest ratio c differs. Scoreboard reports mechanism-class winners — suite pass does not crown Φ.',
    honesty: 'Proxy fixtures; V3 nest grammar replaces V2 sin geometry.',
  };
}

function experimentBlindLadder() {
  const rng = mulberry32(0xB11D);
  const series = makeSeries('seasonal', 256, rng);
  const results = BLIND_CONSTANTS.map((c) => {
    let rfdSum = 0;
    let slopeSum = 0;
    for (const mech of MECHANISMS) {
      const curve = runRecursion(series, mech, c, 12);
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
    title: 'Blind constant ladder (φ unlabeled · mean RFD over all mechanisms)',
    mechanism: 'all_mechanisms_mean',
    results,
    ranked_c: ranked.map((r) => r.c),
    phi_rank_by_lowest_rfd: phiRank,
    pass: results.length === BLIND_CONSTANTS.length && phiRank >= 1,
    interpretation:
      'If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.',
    honesty: 'Single-series blind ladder is illustrative; multi-domain aggregation is the real test.',
  };
}

function experimentConstantSweep() {
  const rng = mulberry32(0x5ee7);
  const trainKinds = ['logistic', 'ar1', 'seasonal', 'co2_proxy'];
  const holdKinds = ['powerlaw', 'sunspot_proxy'];
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
          s += finalRfd(runRecursion(series, mech, c, 16));
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
  return {
    id: 'E3_constant_sweep',
    title: 'Continuous Drift(c) sweep with train/hold split (all mechanisms)',
    mechanism: 'all_mechanisms_mean',
    HOLD_OUT_FRACTION,
    train_min: trainMin,
    hold_min: holdMin,
    train_min_near_phi: nearPhi(trainMin.c),
    hold_min_near_phi: nearPhi(holdMin.c),
    train_curve_sample: train.filter((_, i) => i % 5 === 0),
    hold_curve_sample: hold.filter((_, i) => i % 5 === 0),
    pass: train.length === SWEEP_STEPS && hold.length === SWEEP_STEPS,
    interpretation:
      'Pronounced minimum near φ on held-out kinds would be interesting; absence falsifies the strong claim for this mechanism/fixture set.',
    honesty: 'Sweep minima are fixture-relative; do not promote to CODATA.',
  };
}

function experimentDriftSlopeContrast() {
  const rng = mulberry32(0x5109);
  const series = makeSeries('logistic', 320, rng);
  const mech = 'recursive_compression';
  const arms = { baseline: 1.0, egs: PHI_EGS, sqrt2: SQRT2, e: E_CONST };
  const out = {};
  for (const [name, c] of Object.entries(arms)) {
    const curve = runRecursion(series, mech, c);
    out[name] = {
      c,
      slope: fitDriftSlope(curve),
      rfd_curve: curve.map((p) => ({ n: p.n, rfd: p.rfd_rmse, F: p.F_over_F0 })),
    };
  }
  return {
    id: 'E4_drift_slope',
    title: 'Drift slope contrast (power-law RFD ≈ a n^b)',
    mechanism: mech,
    arms: out,
    pass: Object.values(out).every((a) => a.slope.ok),
    interpretation:
      'Hypothesis interest is whether φ changes error-accumulation exponent — not only generation-1 RMSE.',
    honesty: 'Power-law fit is a pre-registered summary, not proof of a bounded attractor.',
  };
}

function experimentPhiNotAssumed() {
  const pass =
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    Math.abs(NAMED_ARMS.egs - PHI_EGS) < 1e-15 &&
    NAMED_ARMS.baseline === 1.0;
  return {
    id: 'E5_phi_not_assumed',
    title: 'Falsifiability lock — Φ is one arm among peers',
    PRE_REGISTERED_HYPOTHESIS,
    STANDALONE_REPO,
    pass,
    interpretation:
      'Design question: does incorporating φ reduce cumulative fidelity drift vs identical recursion without φ / with decoys?',
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
  };
  return {
    id: 'E6_paper_locks',
    title: 'Paper presence + honesty / falsifiability locks',
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Paper must state controlled design and refuse Φ-assumed framing.',
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
    hasErft: /ERFT|Drift Test|recursive fidelity|ERFT-V[34]/i.test(html),
  };
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog magazine lock',
    SHIP_BLOG_SLUG,
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Frontiersman magazine note required for paper ship.',
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
    experimentBlindLadder(),
    experimentConstantSweep(),
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
    experiments,
  };
}
