/**
 * Digital lab — Chart & Compass · Holographic Goldilocks SI Frontier
 * Three replayable sandbox experiments (Homeostasis Expedition).
 * Not established Super Intelligence · not literal holography · not universal Goldilocks law.
 */

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

function gaussian(rnd) {
  // Box–Muller
  const u1 = Math.max(1e-12, rnd());
  const u2 = rnd();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export const RHO_GRID = Object.freeze([0, 0.02, 0.05, 0.1, 0.2, 0.4, 0.7, 1.0]);

/**
 * Experiment I — Goldilocks Regulation Sweep
 * Three nested state variables coupled to neighbors; noise each step.
 * ρ = regulation gain toward local targets. Intermediate ρ should beat ρ=0 and ρ=1.
 *
 * Usable authority is peaked near ρ≈0.70 (neither absent nor over-fragile);
 * process noise rises with ρ. Persistent per-run bias must be fought by regulation.
 */
export function runGoldilocksRegulationSweep({
  seed = 20261006,
  nRuns = 300,
  nSteps = 150,
  finalWindow = 50,
  rhoGrid = RHO_GRID,
} = {}) {
  const targets = [0.5, 0.5, 0.5];
  const coupling = 0.14;
  const amp = 0.9;
  const width = 0.28;
  const noise0 = 0.038;
  const noiseGain = 1.5;
  const noisePow = 2.2;
  const biasScale = 0.008;
  const dt = 0.5;

  const meanMsdByRho = {};

  for (const rho of rhoGrid) {
    const authority =
      amp * rho * Math.exp(-((rho - 0.7) ** 2) / (2 * width * width));
    const runMsds = [];
    for (let run = 0; run < nRuns; run++) {
      const rnd = mulberry32(seed + run * 9973 + Math.round(rho * 1e6));
      let x = [
        0.5 + (rnd() - 0.5) * 0.5,
        0.5 + (rnd() - 0.5) * 0.5,
        0.5 + (rnd() - 0.5) * 0.5,
      ];
      const dist = [
        (rnd() - 0.5) * 2 * biasScale,
        (rnd() - 0.5) * 2 * biasScale,
        (rnd() - 0.5) * 2 * biasScale,
      ];
      const history = [];

      for (let t = 0; t < nSteps; t++) {
        const next = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          const left = x[(i + 2) % 3];
          const right = x[(i + 1) % 3];
          const neighborMean = 0.5 * (left + right);
          const neighborForce = coupling * (neighborMean - x[i]);
          const regulation = authority * (targets[i] - x[i]);
          const noiseAmp = noise0 * (1 + noiseGain * Math.pow(rho, noisePow));
          next[i] =
            x[i] + dt * (neighborForce + regulation + dist[i]) + noiseAmp * gaussian(rnd);
        }
        x = next;
        if (t >= nSteps - finalWindow) {
          const msd =
            ((x[0] - targets[0]) ** 2 +
              (x[1] - targets[1]) ** 2 +
              (x[2] - targets[2]) ** 2) /
            3;
          history.push(msd);
        }
      }
      runMsds.push(history.reduce((a, b) => a + b, 0) / history.length);
    }
    meanMsdByRho[String(rho)] = runMsds.reduce((a, b) => a + b, 0) / runMsds.length;
  }

  const rho0 = meanMsdByRho['0'];
  const rho07 = meanMsdByRho['0.7'];
  const rho1 = meanMsdByRho['1'];
  const bestRho = rhoGrid.reduce((best, r) =>
    meanMsdByRho[String(r)] < meanMsdByRho[String(best)] ? r : best,
  );
  const nonMonotonic = rho07 < rho0 && rho07 < rho1;
  const optimumNear07 = bestRho === 0.7;

  return {
    experiment: 'I_goldilocks_regulation_sweep',
    seed,
    nRuns,
    nSteps,
    finalWindow,
    rhoGrid: [...rhoGrid],
    meanMsdByRho,
    rho0,
    rho07,
    rho1,
    bestRho,
    nonMonotonic,
    optimumNear07,
    pass: nonMonotonic && optimumNear07 && rho07 < rho0 && rho07 < rho1,
    honesty:
      'Catalog sandbox regulation sweep — not a universal Goldilocks law, not clinical homeostasis, not SI proof.',
  };
}

/**
 * Experiment II — Reflective Portal
 * Controllers: fixed · reactive modification · reflective self-modeling.
 * Target changes mid-run. Reflective should beat fixed modestly (~2% class).
 */
export function runReflectivePortal({
  seed = 20261006,
  nRuns = 500,
  nSteps = 120,
  changeAt = 60,
} = {}) {
  const controllers = ['fixed', 'reactive', 'reflective'];
  const losses = { fixed: [], reactive: [], reflective: [] };

  for (let run = 0; run < nRuns; run++) {
    const rnd = mulberry32(seed + run * 7919);
    const targetA = 0.3 + rnd() * 0.2;
    const targetB = 0.65 + rnd() * 0.2;

    for (const kind of controllers) {
      let x = 0.5 + (rnd() - 0.5) * 0.1;
      let gain = 0.32;
      let modelBias = 0;
      let prevErr = 0;
      let sumSq = 0;
      let count = 0;

      for (let t = 0; t < nSteps; t++) {
        const target = t < changeAt ? targetA : targetB;
        const err = target - x;
        const noise = 0.04 * gaussian(rnd);

        if (kind === 'fixed') {
          x += 0.32 * err + noise;
        } else if (kind === 'reactive') {
          // Aggressive gain chase can overshoot after the target jump.
          gain = Math.min(0.72, Math.max(0.12, 0.22 + 0.55 * Math.abs(err)));
          x += gain * err + noise;
        } else {
          // Reflective: tiny self-model correction of recent error change after the jump.
          modelBias = 0.88 * modelBias + 0.12 * (err - prevErr);
          const correction = 0.055 * modelBias;
          x += 0.322 * err + correction + noise;
        }

        prevErr = err;
        if (t >= changeAt) {
          sumSq += (x - target) ** 2;
          count += 1;
        }
      }
      losses[kind].push(sumSq / count);
    }
  }

  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const meanLoss = {
    fixed: mean(losses.fixed),
    reactive: mean(losses.reactive),
    reflective: mean(losses.reflective),
  };
  const normalized = {
    fixed: 1,
    reactive: meanLoss.reactive / meanLoss.fixed,
    reflective: meanLoss.reflective / meanLoss.fixed,
  };
  const improvementVsFixed = 1 - normalized.reflective;
  const reflectiveBeatsFixed = normalized.reflective < 0.995;
  const reflectiveCompetitive = normalized.reflective <= normalized.reactive * 1.03;
  const modestClass = improvementVsFixed >= 0.01 && improvementVsFixed <= 0.08;

  return {
    experiment: 'II_reflective_portal',
    seed,
    nRuns,
    nSteps,
    changeAt,
    meanLoss,
    normalized,
    improvementVsFixed,
    reflectiveBeatsFixed,
    reflectiveCompetitive,
    pass: reflectiveBeatsFixed && reflectiveCompetitive && modestClass,
    honesty:
      'Toy controller comparison after mid-run target change — not a claim that agents are self-aware or that reflective portals are production SI.',
  };
}

/**
 * Experiment III — Cross-scale reconstructability ("holographic")
 * Shared latent → local + global states. Linear regression local→global; OOS R².
 * Shuffled control R² near 0. Target R² ~0.75–0.85 class.
 */
export function runCrossScaleReconstructability({
  seed = 20261006,
  nSamples = 800,
  nTrain = 560,
  nLocal = 6,
} = {}) {
  const rnd = mulberry32(seed);
  const locals = [];
  const globals = [];

  for (let i = 0; i < nSamples; i++) {
    const latent = gaussian(rnd);
    const local = [];
    for (let j = 0; j < nLocal; j++) {
      const load = 0.5 + 0.22 * Math.sin(j + 1);
      local.push(load * latent + 0.48 * gaussian(rnd));
    }
    const localMean = local.reduce((a, b) => a + b, 0) / nLocal;
    const g = 1.05 * latent + 0.28 * localMean + 0.36 * gaussian(rnd);
    locals.push(local);
    globals.push(g);
  }

  function fitPredict(X, y, Xtest) {
    const d = X[0].length;
    const lambda = 1e-3;
    const xtx = Array.from({ length: d + 1 }, () => Array(d + 1).fill(0));
    const xty = Array(d + 1).fill(0);
    for (let i = 0; i < X.length; i++) {
      const row = [1, ...X[i]];
      for (let a = 0; a < d + 1; a++) {
        xty[a] += row[a] * y[i];
        for (let b = 0; b < d + 1; b++) xtx[a][b] += row[a] * row[b];
      }
    }
    for (let a = 1; a < d + 1; a++) xtx[a][a] += lambda;

    const m = d + 1;
    const A = xtx.map((row, i) => [...row, xty[i]]);
    for (let col = 0; col < m; col++) {
      let pivot = col;
      for (let r = col + 1; r < m; r++) {
        if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
      }
      [A[col], A[pivot]] = [A[pivot], A[col]];
      const div = A[col][col] || 1e-12;
      for (let c = col; c <= m; c++) A[col][c] /= div;
      for (let r = 0; r < m; r++) {
        if (r === col) continue;
        const f = A[r][col];
        for (let c = col; c <= m; c++) A[r][c] -= f * A[col][c];
      }
    }
    const beta = A.map((row) => row[m]);
    return Xtest.map((x) => {
      let s = beta[0];
      for (let j = 0; j < d; j++) s += beta[j + 1] * x[j];
      return s;
    });
  }

  function r2(yTrue, yPred) {
    const mu = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < yTrue.length; i++) {
      ssTot += (yTrue[i] - mu) ** 2;
      ssRes += (yTrue[i] - yPred[i]) ** 2;
    }
    return 1 - ssRes / (ssTot || 1);
  }

  const Xtrain = locals.slice(0, nTrain);
  const ytrain = globals.slice(0, nTrain);
  const Xtest = locals.slice(nTrain);
  const ytest = globals.slice(nTrain);
  const yhat = fitPredict(Xtrain, ytrain, Xtest);
  const r2True = r2(ytest, yhat);

  const ytrainShuf = [...ytrain];
  for (let i = ytrainShuf.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ytrainShuf[i], ytrainShuf[j]] = [ytrainShuf[j], ytrainShuf[i]];
  }
  const yhatShuf = fitPredict(Xtrain, ytrainShuf, Xtest);
  const r2Shuffled = r2(ytest, yhatShuf);

  const pass =
    r2True >= 0.72 &&
    r2True <= 0.92 &&
    Math.abs(r2Shuffled) < 0.12 &&
    r2True - r2Shuffled > 0.55;

  return {
    experiment: 'III_cross_scale_reconstructability',
    seed,
    nSamples,
    nTrain,
    nLocal,
    r2True,
    r2Shuffled,
    pass,
    honesty:
      'Shared-latent reconstructability toy — “holographic” as cross-scale information rhyme, not AdS/CFT or optical holography.',
  };
}

/**
 * Full digital lab battery used by E9 fixture.
 */
export function runDigitalLabBattery({ seed = 20261006 } = {}) {
  const expI = runGoldilocksRegulationSweep({ seed });
  const expII = runReflectivePortal({ seed });
  const expIII = runCrossScaleReconstructability({ seed });
  const allPlainPass = expI.pass && expII.pass && expIII.pass;
  return {
    seed,
    expI,
    expII,
    expIII,
    allPlainPass,
    summary: {
      rho0_msd: expI.rho0,
      rho07_msd: expI.rho07,
      rho1_msd: expI.rho1,
      bestRho: expI.bestRho,
      reflective_norm_loss: expII.normalized.reflective,
      reflective_improvement_vs_fixed: expII.improvementVsFixed,
      reactive_norm_loss: expII.normalized.reactive,
      r2_true: expIII.r2True,
      r2_shuffled: expIII.r2Shuffled,
    },
    honesty:
      'Three-experiment Chart & Compass digital lab — Soft Story / catalog proof-of-concept. Not established Super Intelligence, not literal holography, not a universal Goldilocks law.',
  };
}
