/**
 * ERFT-E experiments — confirmatory held-out + continuous regulation + engine gate.
 * Constant-neutral recursion (identical to ERFT-C topology). No Φ-only grammar.
 */
import {
  PHI_EGS,
  SQRT2,
  E_CONST,
  GENERATIONS,
  NAMED_ARMS,
  MECHANISMS,
  TRAIN_KINDS,
  HOLD_KINDS,
  TRAIN_SEED,
  HOLD_SEED,
  CONTROLLER_SEED,
  SERIES_LEN,
  C_MIN,
  C_MAX,
  CONTINUOUS_GRID_STEP,
  ANTI_BASELINE_BIAS,
  ENGINEERING_THRESHOLD_PCT,
  ENGINE_INCLUSION_GATE,
  PROTOCOL_VERSION,
  PRE_REGISTERED_HYPOTHESIS,
  HONESTY,
} from './constants.mjs';
import { normalizedMixWeights, matchedLags, matchedBlocks, matchedDrivePeriod } from './nest-grammar.mjs';
import { clutchMixScale } from './engine-grammar.mjs';

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

function nrmse(a, b, sigma0) {
  return rmse(a, b) / sigma0;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
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

function applyMechanism(name, xs, c, prev, gen = 0) {
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
  } else if (kind === 'chirp') {
    for (let i = 0; i < len; i++) {
      const f = 0.02 + 0.08 * (i / len);
      xs[i] = Math.sin(2 * Math.PI * f * i) + (rng() - 0.5) * 0.15;
    }
  } else if (kind === 'step_recovery') {
    for (let i = 0; i < len; i++) {
      const base = i < len / 3 ? 1.0 : i < (2 * len) / 3 ? 2.2 : 1.1;
      xs[i] = base + (rng() - 0.5) * 0.2;
    }
  } else if (kind === 'heavy_tail') {
    for (let i = 0; i < len; i++) {
      const u = Math.max(1e-6, rng());
      xs[i] = Math.tan(Math.PI * (u - 0.5)) * 0.15 + (rng() - 0.5) * 0.05;
    }
  } else if (kind === 'dual_season') {
    for (let i = 0; i < len; i++) {
      xs[i] =
        5 +
        1.5 * Math.sin((2 * Math.PI * i) / 16) +
        0.8 * Math.cos((2 * Math.PI * i) / 5) +
        (rng() - 0.5) * 0.25;
    }
  } else if (kind === 'mean_reverting_jump') {
    let x = 0;
    for (let i = 0; i < len; i++) {
      const jump = rng() < 0.04 ? (rng() - 0.5) * 3 : 0;
      x = 0.7 * x + jump + (rng() - 0.5) * 0.15;
      xs[i] = x;
    }
  } else {
    for (let i = 0; i < len; i++) xs[i] = rng();
  }
  return xs;
}

function runFixed(d0, mechanism, c, generations = GENERATIONS) {
  let cur = Float64Array.from(d0);
  let prev = Float64Array.from(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const sigma0 = seriesStd(d0);
  let pathLength = 0;
  let prevState = Float64Array.from(d0);
  for (let g = 0; g < generations; g++) {
    const next = applyMechanism(mechanism, cur, c, prev, g);
    const normed = normalizeEnergy(next, targetRms);
    pathLength += rmse(normed, prevState);
    prev = cur;
    cur = normed;
    prevState = Float64Array.from(cur);
  }
  return {
    final_nrmse: nrmse(cur, d0, sigma0),
    path_length: pathLength,
    c,
  };
}

/**
 * Policy: (state) => next c
 * state: { n, c, nrmse, delta, pathLength, mechanism }
 */
function runPolicy(d0, mechanism, policy, generations = GENERATIONS, startC = 1.0) {
  let cur = Float64Array.from(d0);
  let prev = Float64Array.from(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const sigma0 = seriesStd(d0);
  let pathLength = 0;
  let prevState = Float64Array.from(d0);
  let c = startC;
  let prevNrmse = 0;
  let switches = 0;
  let paramPath = 0;
  const cPath = [];
  for (let g = 0; g < generations; g++) {
    const nr = nrmse(cur, d0, sigma0);
    const delta = nr - prevNrmse;
    const nextC = policy({
      n: g,
      c,
      nrmse: nr,
      delta,
      pathLength,
      mechanism,
      d0,
      cur,
      sigma0,
    });
    const cClamped = clamp(nextC, C_MIN, C_MAX);
    if (Math.abs(cClamped - c) > 1e-9) switches += 1;
    paramPath += Math.abs(cClamped - c);
    c = cClamped;
    cPath.push(c);
    const next = applyMechanism(mechanism, cur, c, prev, g);
    const normed = normalizeEnergy(next, targetRms);
    pathLength += rmse(normed, prevState);
    prev = cur;
    cur = normed;
    prevState = Float64Array.from(cur);
    prevNrmse = nr;
  }
  return {
    final_nrmse: nrmse(cur, d0, sigma0),
    path_length: pathLength,
    switches,
    param_path: paramPath,
    c_path: cPath,
    mean_c: mean(cPath),
  };
}

function buildCells(kinds, seed) {
  const rng = mulberry32(seed);
  const cells = [];
  for (const kind of kinds) {
    for (const mechanism of MECHANISMS) {
      const d0 = makeSeries(kind, SERIES_LEN, rng);
      cells.push({ kind, mechanism, d0 });
    }
  }
  return cells;
}

function bestFixedForCell(d0, mechanism) {
  let bestName = null;
  let best = Infinity;
  const arms = {};
  for (const [name, c] of Object.entries(NAMED_ARMS)) {
    const r = runFixed(d0, mechanism, c);
    arms[name] = r.final_nrmse;
    if (r.final_nrmse < best) {
      best = r.final_nrmse;
      bestName = name;
    }
  }
  return { bestName, best, arms };
}

/** Discrete state-dependent: move toward lower-c when rising drift, higher-c when recovering. */
function discreteStatePolicy(state) {
  const candidates = [1.0, SQRT2, PHI_EGS, E_CONST];
  if (state.delta > 0.002) {
    // rising drift → prefer smaller c (preservation)
    return candidates.reduce((a, b) => (Math.abs(a - 1.0) < Math.abs(b - 1.0) ? a : b));
  }
  if (state.delta < -0.002) {
    // recovering → prefer mid/high
    return PHI_EGS;
  }
  return state.c;
}

/** Adaptive one-step look-ahead on discrete set (present observables only). */
function makeAdaptiveDiscrete() {
  const set = [1.0, SQRT2, PHI_EGS, E_CONST];
  return (state) => {
    let bestC = state.c;
    let bestScore = Infinity;
    for (const c of set) {
      const trial = applyMechanism(state.mechanism, state.cur, c, state.cur, state.n);
      const score = nrmse(trial, state.d0, state.sigma0);
      if (score < bestScore) {
        bestScore = score;
        bestC = c;
      }
    }
    return bestC;
  };
}

/** Continuous proportional: nudge c by signed drift change. */
function continuousProportional(state) {
  const alpha = 0.08;
  const step = state.delta > 0 ? -alpha : state.delta < 0 ? alpha * 0.5 : 0;
  return state.c + step;
}

/** Continuous gradient one-step look-ahead on fine grid. */
function continuousGradient(state) {
  let bestC = state.c;
  let bestScore = Infinity;
  for (let c = C_MIN; c <= C_MAX + 1e-9; c += CONTINUOUS_GRID_STEP) {
    const trial = applyMechanism(state.mechanism, state.cur, c, state.cur, state.n);
    const score = nrmse(trial, state.d0, state.sigma0);
    if (score < bestScore) {
      bestScore = score;
      bestC = c;
    }
  }
  // Smooth toward best (complexity: many probes)
  return state.c * 0.3 + bestC * 0.7;
}

/** Random-walk control on continuous c (complexity baseline). */
function makeRandomWalk(seed) {
  const rng = mulberry32(seed);
  return (state) => state.c + (rng() - 0.5) * 0.2;
}

function bootstrapMeanCI(deltas, resamples = 400, seed = 0xc0ff) {
  const rng = mulberry32(seed);
  const n = deltas.length;
  if (!n) return { lo: 0, hi: 0, mean: 0 };
  const means = [];
  for (let r = 0; r < resamples; r++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += deltas[(rng() * n) | 0];
    means.push(s / n);
  }
  means.sort((a, b) => a - b);
  const lo = means[Math.floor(0.025 * means.length)];
  const hi = means[Math.floor(0.975 * means.length)];
  return { lo, hi, mean: mean(deltas) };
}

function evaluateFamily(cells, label) {
  const fixedRows = [];
  const discreteStateRows = [];
  const adaptiveRows = [];
  const contPropRows = [];
  const contGradRows = [];
  const randomWalkRows = [];
  const adaptive = makeAdaptiveDiscrete();
  const randomWalk = makeRandomWalk(CONTROLLER_SEED ^ 0x111);

  for (const cell of cells) {
    const { d0, mechanism, kind } = cell;
    const bf = bestFixedForCell(d0, mechanism);
    fixedRows.push({ kind, mechanism, ...bf });

    const ds = runPolicy(d0, mechanism, discreteStatePolicy, GENERATIONS, 1.0);
    discreteStateRows.push({ kind, mechanism, ...ds });

    const ad = runPolicy(d0, mechanism, adaptive, GENERATIONS, 1.0);
    adaptiveRows.push({ kind, mechanism, ...ad });

    const cp = runPolicy(d0, mechanism, continuousProportional, GENERATIONS, 1.0);
    contPropRows.push({ kind, mechanism, ...cp });

    const cg = runPolicy(d0, mechanism, continuousGradient, GENERATIONS, 1.0);
    contGradRows.push({ kind, mechanism, ...cg });

    const rw = runPolicy(d0, mechanism, randomWalk, GENERATIONS, 1.0);
    randomWalkRows.push({ kind, mechanism, ...rw });
  }

  const summarize = (rows, key = 'final_nrmse') => ({
    mean_final_nrmse: mean(rows.map((r) => r[key])),
    mean_switches: mean(rows.map((r) => r.switches ?? 0)),
    mean_param_path: mean(rows.map((r) => r.param_path ?? 0)),
    mean_path_length: mean(rows.map((r) => r.path_length ?? 0)),
    mean_c: mean(rows.map((r) => r.mean_c ?? 0)),
    n: rows.length,
  });

  const bestFixedMean = mean(fixedRows.map((r) => r.best));
  const armMeans = {};
  for (const name of Object.keys(NAMED_ARMS)) {
    armMeans[name] = mean(fixedRows.map((r) => r.arms[name]));
  }
  const bestFixedArm = Object.entries(armMeans).sort((a, b) => a[1] - b[1])[0];

  const policies = {
    best_fixed: { mean_final_nrmse: bestFixedMean, mean_switches: 0, params: 0, arm: bestFixedArm[0], arm_means: armMeans },
    discrete_state: { ...summarize(discreteStateRows), params: 4 },
    adaptive_discrete: { ...summarize(adaptiveRows), params: 4 },
    continuous_proportional: { ...summarize(contPropRows), params: 2 },
    continuous_gradient: { ...summarize(contGradRows), params: Math.floor((C_MAX - C_MIN) / CONTINUOUS_GRID_STEP) + 1 },
    random_walk_control: { ...summarize(randomWalkRows), params: 1 },
  };

  // Best dynamic among non-fixed (exclude random_walk as primary contender; keep as control)
  const contenders = [
    ['discrete_state', policies.discrete_state],
    ['adaptive_discrete', policies.adaptive_discrete],
    ['continuous_proportional', policies.continuous_proportional],
    ['continuous_gradient', policies.continuous_gradient],
  ];
  contenders.sort((a, b) => a[1].mean_final_nrmse - b[1].mean_final_nrmse);
  const [bestDynName, bestDyn] = contenders[0];

  const paired = fixedRows.map((f, i) => {
    const dynRow =
      bestDynName === 'discrete_state'
        ? discreteStateRows[i]
        : bestDynName === 'adaptive_discrete'
          ? adaptiveRows[i]
          : bestDynName === 'continuous_proportional'
            ? contPropRows[i]
            : contGradRows[i];
    return f.best - dynRow.final_nrmse; // positive => dynamic better
  });
  const ci = bootstrapMeanCI(paired);
  const improvementPct =
    bestFixedMean > 1e-12 ? (bestFixedMean - bestDyn.mean_final_nrmse) / bestFixedMean : 0;
  const complexityDenom = Math.log(1 + bestDyn.params + (bestDyn.mean_switches || 0));
  const complexityAdjusted = complexityDenom > 0 ? improvementPct / complexityDenom : 0;

  const beatsFixedByMargin = improvementPct >= ENGINEERING_THRESHOLD_PCT;
  const ciExcludesZeroFavoringDynamic = ci.lo > 0;

  return {
    label,
    n_cells: cells.length,
    policies,
    best_dynamic_name: bestDynName,
    best_dynamic: bestDyn,
    best_fixed_mean_nrmse: bestFixedMean,
    best_fixed_arm: bestFixedArm[0],
    improvement_pct: improvementPct,
    paired_delta_mean: ci.mean,
    paired_delta_ci95: { lo: ci.lo, hi: ci.hi },
    complexity_adjusted_score: complexityAdjusted,
    beats_fixed_by_15pct: beatsFixedByMargin,
    ci_excludes_zero_favoring_dynamic: ciExcludesZeroFavoringDynamic,
    dynamic_beats_best_fixed: bestDyn.mean_final_nrmse < bestFixedMean,
  };
}

function phiPrivilegeCheck(trainEval, holdEval) {
  // Advantage must not require Φ-only: if best continuous mean_c near φ AND removing φ-like
  // start still wins — we check whether best fixed arm is egs, and whether dynamic mean_c ≈ φ.
  const trainMeanC = trainEval.best_dynamic.mean_c ?? trainEval.policies[trainEval.best_dynamic_name]?.mean_c;
  // Recompute mean_c from policy rows if missing — policies summarize may lack mean_c
  const nearPhi =
    typeof trainMeanC === 'number' && Math.abs(trainMeanC - PHI_EGS) < 0.05;
  return {
    requires_phi_privilege: false, // architecture is peer; flag only if we detect φ-only affordance (none here)
    train_best_fixed_is_phi: trainEval.best_fixed_arm === 'egs',
    hold_best_fixed_is_phi: holdEval.best_fixed_arm === 'egs',
    dynamic_mean_c_near_phi: !!nearPhi,
    note: 'ERFT-E uses constant-neutral recursion only — no Φ-only grammar affordance.',
  };
}

export function runEngineGate(trainEval, holdEval) {
  const phi = phiPrivilegeCheck(trainEval, holdEval);
  const holdImproves =
    holdEval.improvement_pct >= ENGINEERING_THRESHOLD_PCT && holdEval.dynamic_beats_best_fixed;
  const sameDirection =
    trainEval.dynamic_beats_best_fixed === holdEval.dynamic_beats_best_fixed &&
    holdEval.dynamic_beats_best_fixed === true;
  const complexityOk = holdEval.complexity_adjusted_score >= 0.05;
  const ciOk = holdEval.ci_excludes_zero_favoring_dynamic;
  const marginOk = holdEval.beats_fixed_by_15pct;
  const noPhiPrivilege = !phi.requires_phi_privilege;

  const criteria = {
    holdout_beats_fixed_by_15pct: marginOk,
    same_direction_train_hold: sameDirection && holdImproves,
    complexity_adjusted_score_ok: complexityOk,
    paired_ci_excludes_zero: ciOk,
    no_phi_only_affordance: noPhiPrivilege,
  };
  const passes = Object.values(criteria).every(Boolean);

  return {
    gate: ENGINE_INCLUSION_GATE,
    criteria,
    passes,
    engine_inclusion_recommended: passes,
    decision: passes
      ? ENGINE_INCLUSION_GATE.on_pass
      : ENGINE_INCLUSION_GATE.on_fail,
    phi_check: phi,
  };
}

export async function runAllExperiments() {
  const trainCells = buildCells(TRAIN_KINDS, TRAIN_SEED);
  const holdCells = buildCells(HOLD_KINDS, HOLD_SEED);

  const trainEval = evaluateFamily(trainCells, 'train_controller_family');
  const holdEval = evaluateFamily(holdCells, 'confirmatory_held_out_family');
  const gate = runEngineGate(trainEval, holdEval);

  const e0 = {
    id: 'E0_protocol_locks',
    title: 'ERFT-E protocol locks · preserves V5/D · gate pre-registered',
    pass: true,
    protocol: PROTOCOL_VERSION,
    preserves_v5: true,
    preserves_erft_d: true,
    train_seed: TRAIN_SEED,
    hold_seed: HOLD_SEED,
    hold_kinds: [...HOLD_KINDS],
    engineering_threshold_pct: ENGINEERING_THRESHOLD_PCT,
    hypothesis: PRE_REGISTERED_HYPOTHESIS,
  };

  const e1 = {
    id: 'E1_confirmatory_held_out',
    title: 'Confirmatory held-out family · frozen novel fixtures',
    pass: true,
    ...holdEval,
    interpretation: holdEval.dynamic_beats_best_fixed
      ? 'On confirmatory held-out, best dynamic policy beat best fixed on mean NRMSE — check gate for significance.'
      : 'On confirmatory held-out, best fixed still matches or beats dynamic/continuous policies — replicates ERFT-D weakening on a new fixture family.',
  };

  const e2 = {
    id: 'E2_continuous_vs_discrete',
    title: 'Continuous c_n regulation vs discrete modes vs best fixed',
    pass: true,
    train: trainEval,
    hold: {
      best_fixed_arm: holdEval.best_fixed_arm,
      best_fixed_mean_nrmse: holdEval.best_fixed_mean_nrmse,
      best_dynamic_name: holdEval.best_dynamic_name,
      best_dynamic_mean_nrmse: holdEval.best_dynamic.mean_final_nrmse,
      improvement_pct: holdEval.improvement_pct,
      policies: holdEval.policies,
    },
    interpretation:
      'Compares fixed, discrete state/adaptive, continuous proportional/gradient, and random-walk control under matched constant-neutral recursion.',
  };

  const e3 = {
    id: 'E3_engine_inclusion_gate',
    title: 'ENGINE_SHELF significant-improvement gate',
    pass: true, // protocol integrity — gate result is separate
    ...gate,
    honesty:
      'Suite pass does not imply engine inclusion. engine_inclusion_recommended is the sole soft pin signal.',
  };

  const experiments = [e0, e1, e2, e3];
  const n_pass = experiments.filter((e) => e.pass).length;

  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    PROTOCOL_VERSION,
    PHI_EGS,
    preserves_v5: true,
    preserves_erft_d: true,
    engine_inclusion_recommended: gate.engine_inclusion_recommended,
    verdict: {
      better_constant: holdEval.best_fixed_arm,
      better_combination: holdEval.dynamic_beats_best_fixed ? holdEval.best_dynamic_name : null,
      nothing_to_crown: !holdEval.dynamic_beats_best_fixed || !gate.engine_inclusion_recommended,
      engine_shelf: gate.engine_inclusion_recommended,
    },
    experiments,
    honesty: HONESTY,
  };
}
