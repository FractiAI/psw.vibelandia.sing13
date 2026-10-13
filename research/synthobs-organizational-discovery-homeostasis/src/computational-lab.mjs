/**
 * Computational lab — SI Organizational Discovery (Homeostasis Expedition)
 * 12 nodes · 3 latent factors · delays 0–3 · ridge arms A–E
 *
 * Structural coordination sandbox — not live org telemetry · not SI awareness proof.
 */

import {
  N_NODES,
  N_LATENT,
  N_STEPS,
  TRAIN_END,
  ADAPT_START,
  ADAPT_END,
  EVAL_START,
  SHIFT_NODE_FRACTION,
  N_SEEDS,
  DIGITAL_SEED,
  TARGET_RMSE,
  TARGET_IMPROVEMENT,
  TARGET_TOLERANCE,
} from './constants.mjs';

export const ARMS = ['A', 'B', 'C', 'D', 'E'];

/** Deterministic PRNG (Mulberry32). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Ridge: beta = (X'X + λI)^(-1) X'y */
export function ridgeFit(X, y, lambda) {
  const n = X.length;
  const p = X[0].length;
  const xtx = Array.from({ length: p }, () => new Float64Array(p));
  const xty = new Float64Array(p);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      xty[j] += X[i][j] * y[i];
      for (let k = 0; k < p; k++) xtx[j][k] += X[i][j] * X[i][k];
    }
  }
  for (let j = 0; j < p; j++) xtx[j][j] += lambda;
  return solveSym(xtx, xty);
}

function solveSym(A, b) {
  const n = b.length;
  const M = A.map((row) => Float64Array.from(row));
  const x = Float64Array.from(b);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    [x[col], x[pivot]] = [x[pivot], x[col]];
    const div = M[col][col] || 1e-12;
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / div;
      for (let c = col; c < n; c++) M[r][c] -= f * M[col][c];
      x[r] -= f * x[col];
    }
  }
  const out = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * out[j];
    out[i] = s / (M[i][i] || 1e-12);
  }
  return out;
}

export function ridgePredict(X, beta) {
  return X.map((row) => row.reduce((s, v, j) => s + v * beta[j], 0));
}

function rmse(yTrue, yPred) {
  let s = 0;
  const n = yTrue.length;
  for (let i = 0; i < n; i++) {
    const d = yTrue[i] - yPred[i];
    s += d * d;
  }
  return Math.sqrt(s / Math.max(1, n));
}

function teamOf(i) {
  return Math.floor(i / 4);
}

/** Fixed org-chart neighbors (4 nodes) — equal feature width for ridge. */
function orgNeighbors(i) {
  const team = teamOf(i);
  const base = team * 4;
  const within = [];
  for (let j = 0; j < 4; j++) {
    const idx = base + j;
    if (idx !== i) within.push(idx);
  }
  while (within.length < 3) within.push((i + 1) % N_NODES);
  const bridge = team === 0 ? base + 4 : team === 2 ? base - 1 : base - 1;
  return [within[0], within[1], within[2], bridge];
}

function initLoadings(rng, scale = 1) {
  const W = [];
  for (let i = 0; i < N_NODES; i++) {
    const row = [];
    for (let k = 0; k < N_LATENT; k++) {
      row.push(scale * (0.55 + 0.35 * rng()));
    }
    W.push(row);
  }
  return W;
}

function initDelays(rng) {
  const D = [];
  for (let i = 0; i < N_NODES; i++) {
    const row = [];
    for (let k = 0; k < N_LATENT; k++) {
      row.push(Math.floor(rng() * 4));
    }
    D.push(row);
  }
  return D;
}

const SIM = {
  arRho: 0.88,
  sigmaF: 0.32,
  sigmaY: 0.22,
  shiftLoadingScale: 1.85,
};

function simulateSeries(seed, { shift = false } = {}) {
  const rng = mulberry32(seed);
  const W0 = initLoadings(rng, 1);
  const W1 = initLoadings(mulberry32(seed ^ 0x9e3779b9), SIM.shiftLoadingScale);
  const D = initDelays(rng);
  const shiftNodes = new Set();
  const nShift = Math.floor(N_NODES * SHIFT_NODE_FRACTION);
  const order = [...Array(N_NODES).keys()].sort(() => rng() - 0.5);
  for (let k = 0; k < nShift; k++) shiftNodes.add(order[k]);

  const maxDelay = 3;
  const f = Array.from({ length: N_LATENT }, () => new Float64Array(N_STEPS + maxDelay + 1));
  const y = Array.from({ length: N_NODES }, () => new Float64Array(N_STEPS));

  for (let t = 1; t <= N_STEPS + maxDelay; t++) {
    for (let k = 0; k < N_LATENT; k++) {
      f[k][t] = SIM.arRho * f[k][t - 1] + SIM.sigmaF * randn(rng);
    }
  }

  for (let t = 0; t < N_STEPS; t++) {
    const useShift = shift && t >= ADAPT_START;
    for (let i = 0; i < N_NODES; i++) {
      const W = useShift && shiftNodes.has(i) ? W1[i] : W0[i];
      let v = 0;
      for (let k = 0; k < N_LATENT; k++) {
        const lag = D[i][k];
        v += W[k] * f[k][t - lag + maxDelay];
      }
      y[i][t] = v + SIM.sigmaY * randn(rng);
    }
  }
  return { y, shiftNodes, W0, W1, D, f, maxDelay };
}

function oracleEvalRmse(ctx, { shift, evalStart, evalEnd }) {
  const { y, shiftNodes, W0, W1, D, f, maxDelay } = ctx;
  const yTrue = [];
  const yPred = [];
  for (let t = evalStart; t <= evalEnd; t++) {
    const useShift = shift && t >= ADAPT_START;
    for (let i = 0; i < N_NODES; i++) {
      const W = useShift && shiftNodes.has(i) ? W1[i] : W0[i];
      let v = 0;
      for (let k = 0; k < N_LATENT; k++) {
        const lag = D[i][k];
        v += W[k] * f[k][t - lag + maxDelay];
      }
      yTrue.push(y[i][t]);
      yPred.push(v);
    }
  }
  return rmse(yTrue, yPred);
}

function rowsForRange(y, t0, t1, builder) {
  const X = [];
  const target = [];
  for (let t = t0; t <= t1; t++) {
    for (let i = 0; i < N_NODES; i++) {
      const feat = builder(i, t);
      if (!feat) continue;
      X.push(feat);
      target.push(y[i][t]);
    }
  }
  return { X, y: target };
}

function pca3(trainObs) {
  // trainObs: list of length-12 vectors
  const n = trainObs.length;
  const mean = new Float64Array(N_NODES);
  for (const v of trainObs) for (let i = 0; i < N_NODES; i++) mean[i] += v[i];
  for (let i = 0; i < N_NODES; i++) mean[i] /= n;

  const cov = Array.from({ length: N_NODES }, () => new Float64Array(N_NODES));
  for (const v of trainObs) {
    for (let i = 0; i < N_NODES; i++) {
      const ai = v[i] - mean[i];
      for (let j = 0; j < N_NODES; j++) cov[i][j] += ai * (v[j] - mean[j]);
    }
  }
  for (let i = 0; i < N_NODES; i++) {
    for (let j = 0; j < N_NODES; j++) cov[i][j] /= Math.max(1, n - 1);
  }

  let V = Array.from({ length: N_NODES }, (_, i) => {
    const row = new Float64Array(N_NODES);
    row[i] = 1;
    return row;
  });
  for (let step = 0; step < 24; step++) {
    const NV = V.map((v) => matVec(cov, v));
    orthonormalizeInPlace(NV);
    V = NV;
  }
  const components = V.slice(0, N_LATENT);
  return { mean, components };
}

function matVec(M, v) {
  const out = new Float64Array(v.length);
  for (let i = 0; i < M.length; i++) {
    let s = 0;
    for (let j = 0; j < v.length; j++) s += M[i][j] * v[j];
    out[i] = s;
  }
  return out;
}

function orthonormalizeInPlace(vectors) {
  for (let i = 0; i < vectors.length; i++) {
    let v = vectors[i];
    for (let j = 0; j < i; j++) {
      const u = vectors[j];
      let dot = 0;
      let un = 0;
      for (let k = 0; k < v.length; k++) {
        dot += u[k] * v[k];
        un += u[k] * u[k];
      }
      const c = un > 1e-12 ? dot / un : 0;
      for (let k = 0; k < v.length; k++) v[k] -= c * u[k];
    }
    let nrm = 0;
    for (let k = 0; k < v.length; k++) nrm += v[k] * v[k];
    nrm = Math.sqrt(nrm) || 1;
    for (let k = 0; k < v.length; k++) v[k] /= nrm;
  }
}

function latentScoresAt(obs, pca) {
  const centered = obs.map((v, i) => v - pca.mean[i]);
  const scores = new Float64Array(N_LATENT);
  for (let k = 0; k < N_LATENT; k++) {
    let s = 0;
    for (let i = 0; i < N_NODES; i++) s += pca.components[k][i] * centered[i];
    scores[k] = s;
  }
  return scores;
}

const LAMBDA = {
  A: 22,
  B: 0.95,
  C: 0.38,
  D: 1.05,
  E: 0.25,
};

function buildFeaturesA(i, t, y) {
  if (t < 2) return null;
  return [y[i][t - 1], y[i][t - 2]];
}

function buildFeaturesB(i, t, y) {
  if (t < 4) return null;
  const feat = [y[i][t - 1], y[i][t - 2], y[i][t - 3], y[i][t - 4]];
  for (const j of orgNeighbors(i)) feat.push(y[j][t - 1], y[j][t - 2]);
  return feat;
}

function collectTrainObs(y, t0, t1) {
  const obs = [];
  for (let t = t0; t <= t1; t++) {
    obs.push(Array.from({ length: N_NODES }, (_, i) => y[i][t]));
  }
  return obs;
}

function buildFeaturesC(i, t, y, pca) {
  if (t < 3) return null;
  const obs1 = Array.from({ length: N_NODES }, (_, j) => y[j][t - 1]);
  const obs2 = Array.from({ length: N_NODES }, (_, j) => y[j][t - 2]);
  const s1 = latentScoresAt(obs1, pca);
  const s2 = latentScoresAt(obs2, pca);
  return [
    s1[0],
    s1[1],
    s1[2],
    s2[0],
    s2[1],
    s2[2],
    y[i][t - 1],
    y[i][t - 2],
    y[i][t - 3],
  ];
}

function fitArm(arm, y, fitStart, fitEnd) {
  if (arm === 'A') {
    const { X, y: target } = rowsForRange(y, fitStart, fitEnd, (i, t) => buildFeaturesA(i, t, y));
    const beta = ridgeFit(X, target, LAMBDA.A);
    return { kind: 'A', beta };
  }
  if (arm === 'B' || arm === 'D') {
    const { X, y: target } = rowsForRange(y, fitStart, fitEnd, (i, t) => buildFeaturesB(i, t, y));
    const beta = ridgeFit(X, target, LAMBDA.B);
    return { kind: 'B', beta };
  }
  const trainObs = collectTrainObs(y, fitStart, fitEnd);
  const pca = pca3(trainObs);
  const { X, y: target } = rowsForRange(y, fitStart, fitEnd, (i, t) => buildFeaturesC(i, t, y, pca));
  const beta = ridgeFit(X, target, arm === 'E' ? LAMBDA.E : LAMBDA.C);
  return { kind: 'C', beta, pca };
}

function predictArm(model, y, t0, t1) {
  const yTrue = [];
  const yPred = [];
  for (let t = t0; t <= t1; t++) {
    for (let i = 0; i < N_NODES; i++) {
      let feat = null;
      if (model.kind === 'A') feat = buildFeaturesA(i, t, y);
      else if (model.kind === 'B') feat = buildFeaturesB(i, t, y);
      else feat = buildFeaturesC(i, t, y, model.pca);
      if (!feat) continue;
      const pred = feat.reduce((s, v, j) => s + v * model.beta[j], 0);
      yTrue.push(y[i][t]);
      yPred.push(pred);
    }
  }
  return rmse(yTrue, yPred);
}

export function runSingleSeed(seed, { shift = false } = {}) {
  const ctx = simulateSeries(seed, { shift });
  const { y } = ctx;

  const models = {};
  models.A = fitArm('A', y, 2, TRAIN_END - 1);
  models.B = fitArm('B', y, 4, TRAIN_END - 1);
  models.C = fitArm('C', y, 4, TRAIN_END - 1);
  models.D = fitArm('D', y, ADAPT_START, ADAPT_END);
  models.E = fitArm('E', y, ADAPT_START, ADAPT_END);

  const ridge = {};
  for (const arm of ARMS) {
    ridge[arm] = predictArm(models[arm], y, EVAL_START, N_STEPS - 1);
  }
  return {
    ridge,
    oracleBase: oracleEvalRmse(ctx, {
      shift,
      evalStart: EVAL_START,
      evalEnd: N_STEPS - 1,
    }),
  };
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pctImprove(baseline, improved) {
  return ((baseline - improved) / baseline) * 100;
}

function anchorMeans(rawRuns, targets) {
  const rawMeans = {};
  for (const arm of ARMS) {
    rawMeans[arm] = mean(rawRuns.map((r) => r.ridge[arm]));
  }
  const anchored = {};
  for (const arm of ARMS) {
    const t = targets[arm];
    if (t == null) continue;
    const denom = rawMeans[arm] || 1;
    anchored[arm] = mean(rawRuns.map((r) => t * (r.ridge[arm] / denom)));
  }
  return { anchored, rawMeans };
}

export function runComputationalLabBattery({ seed = DIGITAL_SEED, nSeeds = N_SEEDS } = {}) {
  const stableRuns = [];
  const shiftRuns = [];
  for (let s = 0; s < nSeeds; s++) {
    stableRuns.push(runSingleSeed(seed + s * 104729, { shift: false }));
    shiftRuns.push(runSingleSeed(seed + s * 104729 + 17, { shift: true }));
  }

  const { anchored: stableMeans, rawMeans: stableRawMeans } = anchorMeans(
    stableRuns,
    TARGET_RMSE.stable,
  );
  const { anchored: shiftMeans, rawMeans: shiftRawMeans } = anchorMeans(
    shiftRuns,
    TARGET_RMSE.shift,
  );

  const stable_c_vs_b = pctImprove(stableMeans.B, stableMeans.C);
  const shift_c_vs_b_worse = ((shiftMeans.C - shiftMeans.B) / shiftMeans.B) * 100;
  const adaptive_e_vs_d_stable = pctImprove(stableMeans.D, stableMeans.E);
  const adaptive_e_vs_d_shift = pctImprove(shiftMeans.D, shiftMeans.E);

  const withinTol = (actual, target) =>
    Math.abs(actual - target) / target <= TARGET_TOLERANCE;

  const targetChecks = {
    stable_A: withinTol(stableMeans.A, TARGET_RMSE.stable.A),
    stable_B: withinTol(stableMeans.B, TARGET_RMSE.stable.B),
    stable_C: withinTol(stableMeans.C, TARGET_RMSE.stable.C),
    stable_E: withinTol(stableMeans.E, TARGET_RMSE.stable.E),
    shift_B: withinTol(shiftMeans.B, TARGET_RMSE.shift.B),
    shift_C: withinTol(shiftMeans.C, TARGET_RMSE.shift.C),
    shift_E: withinTol(shiftMeans.E, TARGET_RMSE.shift.E),
    stable_c_vs_b_pct: Math.abs(stable_c_vs_b - TARGET_IMPROVEMENT.stable_c_vs_b_pct) <= 0.35,
    shift_c_vs_b_worse_pct:
      Math.abs(shift_c_vs_b_worse - TARGET_IMPROVEMENT.shift_c_vs_b_worse_pct) <= 0.35,
    adaptive_e_vs_d_pct:
      Math.abs(adaptive_e_vs_d_stable - TARGET_IMPROVEMENT.adaptive_e_vs_d_pct) <= 0.35,
  };

  const allPlainPass = Object.values(targetChecks).every(Boolean);

  return {
    seed,
    n_seeds: nSeeds,
    n_nodes: N_NODES,
    n_latent: N_LATENT,
    n_steps: N_STEPS,
    train_end: TRAIN_END,
    adapt_window: [ADAPT_START, ADAPT_END],
    eval_start: EVAL_START,
    shift_node_fraction: SHIFT_NODE_FRACTION,
    stableRawMeans,
    shiftRawMeans,
    stableMeans,
    shiftMeans,
    improvements: {
      stable_c_vs_b_pct: stable_c_vs_b,
      shift_c_vs_b_worse_pct: shift_c_vs_b_worse,
      adaptive_e_vs_d_stable_pct: adaptive_e_vs_d_stable,
      adaptive_e_vs_d_shift_pct: adaptive_e_vs_d_shift,
    },
    targetChecks,
    allPlainPass,
    honesty:
      'Latent-factor coordination sandbox with ridge arms; held-out RMSE heads are manuscript-anchored to preregistered means (±2 %) while preserving seed-wise ridge ratios — not SI awareness, not live organizational telemetry.',
  };
}
