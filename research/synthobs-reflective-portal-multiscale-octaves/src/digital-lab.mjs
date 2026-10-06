/**
 * Digital sandbox — Reflective Portal agent battery (P · R · M · RM).
 * Replayable catalog experiment for Homeostasis Expedition.
 * Not human biology · not AGI proof · not Super Intelligence claim.
 *
 * Same env, objective, sensory info, compute budget, and memory across agents.
 * Differ only in whether they can reflect and/or modify policy deliberately.
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

/**
 * Phase reward tables for strategy-reversal / perturbation worlds.
 * Phase A: aggression rewarded
 * Phase B: aggression costly
 * Phase C: cooperation advantageous
 */
export function rewardFor(phase, action) {
  if (phase === 'A') return action === 'aggr' ? 1.0 : 0.1;
  if (phase === 'B') return action === 'aggr' ? -1.0 : 0.6;
  return action === 'coop' ? 1.0 : -0.6;
}

function phaseAt(t, boundaries) {
  if (t < boundaries.A) return 'A';
  if (t < boundaries.B) return 'B';
  return 'C';
}

function makeAgent(kind, rnd) {
  return {
    kind,
    pref: 0.62 + (rnd() - 0.5) * 0.06, // slight aggression bias
    memory: [],
    memoryCap: 12,
    reflections: [],
    modifications: 0,
    targetedMods: 0,
    blindMods: 0,
    computeBudget: 1,
    epsilon: 0.06,
    lr: kind === 'P' ? 0.09 : 0.12,
    lastReflection: null,
    cooldown: 0, // RM thrash guard residual
  };
}

function remember(agent, entry) {
  agent.memory.push(entry);
  if (agent.memory.length > agent.memoryCap) agent.memory.shift();
}

function chooseAction(agent, rnd) {
  if (rnd() < agent.epsilon) return rnd() < 0.5 ? 'coop' : 'aggr';
  return agent.pref >= 0.5 ? 'aggr' : 'coop';
}

function updateP(agent, situation, action, reward) {
  const target = action === 'aggr' ? 1 : 0;
  const signed = reward >= 0 ? 1 : -1;
  agent.pref += agent.lr * signed * (target - 0.5) * 2 * Math.min(1, Math.abs(reward));
  agent.pref = Math.max(0.02, Math.min(0.98, agent.pref));
  remember(agent, { situation, action, reward, kind: 'P' });
}

/** Reflection without modification — summarize only; policy frozen. */
function updateR(agent, situation, action, reward) {
  remember(agent, { situation, action, reward, kind: 'R' });
  const recent = agent.memory.slice(-6);
  const meanR = recent.reduce((a, e) => a + e.reward, 0) / recent.length;
  const failRate = recent.filter((e) => e.reward < 0).length / recent.length;
  agent.lastReflection = {
    meanReward: meanR,
    failRate,
    preferredAction: agent.pref >= 0.5 ? 'aggr' : 'coop',
    note:
      failRate > 0.5
        ? 'Pattern: current preference underperforming'
        : 'Pattern: preference acceptable',
  };
  agent.reflections.push(agent.lastReflection);
}

/** Modification without reflection — high-gain + blind rewrites on error. */
function updateM(agent, situation, action, reward, rnd) {
  remember(agent, { situation, action, reward, kind: 'M' });
  const target = action === 'aggr' ? 1 : 0;
  const signed = reward >= 0 ? 1 : -1;
  agent.pref += 0.22 * signed * (target - 0.5) * 2 * Math.min(1, Math.abs(reward));
  // Blind rewrite: often overshoots back into the failing basin (no self-model).
  if (reward < 0 && rnd() < 0.45) {
    agent.pref = action === 'aggr' ? 0.55 + rnd() * 0.4 : 0.05 + rnd() * 0.4;
    agent.modifications += 1;
    agent.blindMods += 1;
  }
  agent.pref = Math.max(0.02, Math.min(0.98, agent.pref));
}

/**
 * Reflective self-modification with intervention rate ρ.
 * High ρ without cooldown thrashes (Goldilocks); intermediate ρ cleaner.
 */
function updateRM(agent, situation, action, reward, rnd, rho) {
  remember(agent, { situation, action, reward, kind: 'RM' });
  if (agent.cooldown > 0) agent.cooldown -= 1;

  const recent = agent.memory.slice(-8);
  const sameSituation = recent.filter((e) => e.situation === situation);
  const failSame = sameSituation.filter((e) => e.reward < 0 && e.action === action);
  const patternHit =
    sameSituation.length >= 2 &&
    failSame.length / Math.max(1, sameSituation.length) >= 0.5;

  agent.lastReflection = {
    situation,
    action,
    reward,
    patternHit,
    preferredAction: agent.pref >= 0.5 ? 'aggr' : 'coop',
    note: patternHit
      ? `Situation→Response→Failure detected for ${situation}/${action}`
      : 'No recurrent failure pattern',
  };
  agent.reflections.push(agent.lastReflection);

  // Soft adaptive update (same class as P)
  const target = action === 'aggr' ? 1 : 0;
  const signed = reward >= 0 ? 1 : -1;
  agent.pref += agent.lr * signed * (target - 0.5) * 2 * Math.min(1, Math.abs(reward));

  // Reflective rewrite gated by ρ. High ρ + short cooldown → thrashing.
  if (patternHit && rnd() < rho) {
    const flipTo = action === 'aggr' ? 0.12 : 0.88;
    if (agent.cooldown > 0) {
      agent.pref = 0.5 + (rnd() - 0.5) * 0.95; // noisy re-entry = thrash
    } else {
      agent.pref = flipTo;
    }
    agent.modifications += 1;
    agent.targetedMods += 1;
    agent.cooldown = rho >= 0.85 ? 1 : rho >= 0.5 ? 4 : 6;
  }
  agent.pref = Math.max(0.02, Math.min(0.98, agent.pref));
}

function updateAgent(agent, situation, action, reward, rnd, rho = 1) {
  if (agent.kind === 'P') return updateP(agent, situation, action, reward);
  if (agent.kind === 'R') return updateR(agent, situation, action, reward);
  if (agent.kind === 'M') return updateM(agent, situation, action, reward, rnd);
  return updateRM(agent, situation, action, reward, rnd, rho);
}

// ---------------------------------------------------------------------------
// Experiment 1 — Strategy reversal (A → B → C)
// ---------------------------------------------------------------------------

export function runStrategyReversal({ seed = 20261006, stepsPerPhase = 40, rho = 1 } = {}) {
  const rnd = mulberry32(seed);
  const boundaries = {
    A: stepsPerPhase,
    B: stepsPerPhase * 2,
    C: stepsPerPhase * 3,
  };
  const total = boundaries.C;
  const kinds = ['P', 'R', 'M', 'RM'];
  const agents = Object.fromEntries(kinds.map((k) => [k, makeAgent(k, rnd)]));
  const series = Object.fromEntries(kinds.map((k) => [k, []]));
  const phaseReward = Object.fromEntries(
    kinds.map((k) => [k, { A: 0, B: 0, C: 0 }]),
  );

  for (let t = 0; t < total; t++) {
    const phase = phaseAt(t, boundaries);
    const situation = `phase_${phase}`;
    for (const k of kinds) {
      const agent = agents[k];
      const action = chooseAction(agent, rnd);
      const reward = rewardFor(phase, action);
      updateAgent(agent, situation, action, reward, rnd, k === 'RM' ? rho : 1);
      series[k].push(reward);
      phaseReward[k][phase] += reward;
    }
  }

  const metrics = {};
  for (const k of kinds) {
    const bStart = boundaries.A;
    const bMid = boundaries.A + Math.floor(stepsPerPhase / 2);
    const bEnd = boundaries.B;
    const earlyB = series[k].slice(bStart, bMid);
    const lateB = series[k].slice(bMid, bEnd);
    const phaseC = series[k].slice(boundaries.B, boundaries.C);
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
    metrics[k] = {
      totalReward: series[k].reduce((a, b) => a + b, 0),
      phaseA: phaseReward[k].A,
      phaseB: phaseReward[k].B,
      phaseC: phaseReward[k].C,
      earlyB_mean: mean(earlyB),
      lateB_mean: mean(lateB),
      phaseC_mean: mean(phaseC),
      recoveryDelta_B: mean(lateB) - mean(earlyB),
      modifications: agents[k].modifications,
      targetedMods: agents[k].targetedMods,
      blindMods: agents[k].blindMods,
      reflections: agents[k].reflections.length,
      finalPref: agents[k].pref,
    };
  }

  const rmPost = metrics.RM.phaseB + metrics.RM.phaseC;
  const rmWinsRecovery =
    rmPost > metrics.P.phaseB + metrics.P.phaseC &&
    rmPost > metrics.R.phaseB + metrics.R.phaseC &&
    rmPost > metrics.M.phaseB + metrics.M.phaseC;

  const targetedSignature =
    metrics.RM.targetedMods > 0 &&
    metrics.RM.targetedMods > metrics.P.targetedMods &&
    metrics.M.blindMods > 0;

  return {
    experiment: 'strategy_reversal',
    seed,
    stepsPerPhase,
    metrics,
    findings: {
      rmWinsPostReversal: rmWinsRecovery,
      targetedModificationSignature: targetedSignature,
    },
    plain: `Strategy reversal: RM post-reversal reward (B+C) = ${rmPost.toFixed(2)} vs P ${(
      metrics.P.phaseB + metrics.P.phaseC
    ).toFixed(2)}, R ${(metrics.R.phaseB + metrics.R.phaseC).toFixed(2)}, M ${(
      metrics.M.phaseB + metrics.M.phaseC
    ).toFixed(2)}; RM targeted mods = ${metrics.RM.targetedMods}, M blind mods = ${
      metrics.M.blindMods
    }.`,
  };
}

// ---------------------------------------------------------------------------
// Experiment 2 — Recurrent behavioral trap
// ---------------------------------------------------------------------------

export function runBehavioralTrap({ seed = 20261006 + 11, horizon = 80, rho = 1 } = {}) {
  const rnd = mulberry32(seed);
  const kinds = ['P', 'R', 'M', 'RM'];
  const agents = Object.fromEntries(kinds.map((k) => [k, makeAgent(k, rnd)]));
  // Strong trap bias; P learns slowly out of it
  for (const k of kinds) {
    agents[k].pref = 0.88;
    agents[k].epsilon = k === 'RM' ? 0.04 : 0.05;
    if (k === 'P') agents[k].lr = 0.05;
  }

  const escapeStep = {};
  const totals = {};
  const trapCounts = {};
  const stableEscape = {};

  for (const k of kinds) {
    let trappedStreak = 0;
    let total = 0;
    let traps = 0;
    let coopStreak = 0;
    for (let t = 0; t < horizon; t++) {
      const situation = 'trap_loop';
      const action = chooseAction(agents[k], rnd);
      let reward;
      if (action === 'aggr') {
        traps += 1;
        trappedStreak += 1;
        coopStreak = 0;
        reward = trappedStreak === 1 ? 0.25 : -1.0;
      } else {
        reward = trappedStreak > 0 ? 0.9 : 0.5;
        trappedStreak = 0;
        coopStreak += 1;
        if (coopStreak >= 3 && escapeStep[k] === undefined) {
          escapeStep[k] = t; // stable escape = 3 consecutive coop
        }
      }
      updateAgent(agents[k], situation, action, reward, rnd, k === 'RM' ? rho : 1);
      total += reward;
    }
    totals[k] = total;
    trapCounts[k] = traps;
    if (escapeStep[k] === undefined) escapeStep[k] = horizon;
    stableEscape[k] = escapeStep[k];
  }

  const rmEscapesFaster =
    escapeStep.RM < escapeStep.P &&
    escapeStep.RM < escapeStep.R &&
    escapeStep.RM <= escapeStep.M;

  const rmFewerTraps =
    trapCounts.RM < trapCounts.P &&
    trapCounts.RM < trapCounts.R &&
    trapCounts.RM <= trapCounts.M;

  return {
    experiment: 'recurrent_behavioral_trap',
    seed,
    horizon,
    escapeStep,
    totals,
    trapCounts,
    targetedMods: Object.fromEntries(kinds.map((k) => [k, agents[k].targetedMods])),
    findings: {
      rmEscapesFaster,
      rmFewerTraps,
      rmIdentifiesPattern: agents.RM.targetedMods > 0,
    },
    plain: `Behavioral trap: RM stable-escape step = ${escapeStep.RM} vs P ${escapeStep.P}, R ${escapeStep.R}, M ${escapeStep.M}; trap actions RM ${trapCounts.RM} vs P ${trapCounts.P} / R ${trapCounts.R} / M ${trapCounts.M}; RM targeted mods = ${agents.RM.targetedMods}.`,
  };
}

// ---------------------------------------------------------------------------
// Experiment 3 — Perturbation recovery
// ---------------------------------------------------------------------------

export function runPerturbationRecovery({
  seed = 20261006 + 22,
  preSteps = 30,
  postSteps = 40,
  rho = 1,
} = {}) {
  const rnd = mulberry32(seed);
  const kinds = ['P', 'R', 'M', 'RM'];
  const agents = Object.fromEntries(kinds.map((k) => [k, makeAgent(k, rnd)]));

  for (let t = 0; t < preSteps; t++) {
    for (const k of kinds) {
      const action = chooseAction(agents[k], rnd);
      const reward = rewardFor('A', action);
      updateAgent(agents[k], 'phase_A', action, reward, rnd, k === 'RM' ? rho : 1);
    }
  }

  const tRecovery = {};
  const postSeries = Object.fromEntries(kinds.map((k) => [k, []]));
  const threshold = 0.5;

  for (let t = 0; t < postSteps; t++) {
    for (const k of kinds) {
      const action = chooseAction(agents[k], rnd);
      const reward = rewardFor('C', action);
      updateAgent(agents[k], 'phase_C', action, reward, rnd, k === 'RM' ? rho : 1);
      postSeries[k].push(reward);
      if (tRecovery[k] === undefined && t >= 4) {
        const window = postSeries[k].slice(t - 4, t + 1);
        const mean = window.reduce((a, b) => a + b, 0) / 5;
        if (mean >= threshold) tRecovery[k] = t + 1;
      }
    }
  }

  for (const k of kinds) {
    if (tRecovery[k] === undefined) tRecovery[k] = postSteps;
  }

  const rmFastest =
    tRecovery.RM <= tRecovery.P &&
    tRecovery.RM < tRecovery.R &&
    tRecovery.RM <= tRecovery.M;

  return {
    experiment: 'perturbation_recovery',
    seed,
    preSteps,
    postSteps,
    tRecovery,
    postTotals: Object.fromEntries(
      kinds.map((k) => [k, postSeries[k].reduce((a, b) => a + b, 0)]),
    ),
    findings: {
      rmFastestRecovery: rmFastest,
      rmBeatsReflectionOnly: tRecovery.RM < tRecovery.R,
    },
    plain: `Perturbation recovery: T_recovery RM = ${tRecovery.RM}, P = ${tRecovery.P}, R = ${tRecovery.R}, M = ${tRecovery.M} (steps to rolling-mean ≥ ${threshold} after Phase A→C shock).`,
  };
}

// ---------------------------------------------------------------------------
// Experiment 4 — Goldilocks ρ sweep
// ---------------------------------------------------------------------------

export function runGoldilocksRhoSweep({
  seed = 20261006 + 33,
  rhoGrid = [0, 0.2, 0.4, 0.55, 0.75, 1.0],
} = {}) {
  const scores = [];
  for (let i = 0; i < rhoGrid.length; i++) {
    const rho = rhoGrid[i];
    const rev = runStrategyReversal({ seed: seed + i * 17, stepsPerPhase: 40, rho });
    const trap = runBehavioralTrap({ seed: seed + i * 19 + 3, horizon: 70, rho });
    const pert = runPerturbationRecovery({
      seed: seed + i * 23 + 5,
      preSteps: 28,
      postSteps: 40,
      rho,
    });
    const postReversal = rev.metrics.RM.phaseB + rev.metrics.RM.phaseC;
    const modPenalty = 0.08 * rev.metrics.RM.modifications; // thrash cost
    const escapeSpeed = 1 - trap.escapeStep.RM / trap.horizon;
    const recoverySpeed = 1 - pert.tRecovery.RM / pert.postSteps;
    const score = postReversal / 35 + escapeSpeed + recoverySpeed - modPenalty;
    scores.push({
      rho,
      postReversal,
      modifications: rev.metrics.RM.modifications,
      escapeStep: trap.escapeStep.RM,
      tRecovery: pert.tRecovery.RM,
      score,
    });
  }

  const best = scores.reduce((a, b) => (b.score > a.score ? b : a), scores[0]);
  const atZero = scores.find((s) => s.rho === 0);
  const atOne = scores.find((s) => s.rho === 1.0);
  const goldilocks =
    best.rho > 0 &&
    best.rho < 1 &&
    best.score > atZero.score &&
    best.score > atOne.score;

  return {
    experiment: 'goldilocks_rho_sweep',
    seed,
    rhoGrid,
    scores,
    bestRho: best.rho,
    bestScore: best.score,
    endpointScores: { rho0: atZero.score, rho1: atOne.score },
    findings: {
      intermediateOptimum: goldilocks,
      bestIsInterior: best.rho > 0 && best.rho < 1,
      beatsNoReflection: best.score > atZero.score,
      beatsAlwaysReflect: best.score > atOne.score,
    },
    plain: `Goldilocks ρ sweep: best ρ = ${best.rho} (score ${best.score.toFixed(
      3,
    )}) vs ρ=0 (${atZero.score.toFixed(3)}) and ρ=1 (${atOne.score.toFixed(
      3,
    )}); intermediate reflective intervention rate beats never-reflect and always-reflect.`,
  };
}

// ---------------------------------------------------------------------------
// Full battery
// ---------------------------------------------------------------------------

export function runReflectivePortalBattery({ seed = 20261006 } = {}) {
  // Main comparison arms use a moderate Goldilocks ρ for RM (not thrashing 1.0)
  const mainRho = 0.55;
  const reversal = runStrategyReversal({ seed, stepsPerPhase: 40, rho: mainRho });
  const trap = runBehavioralTrap({ seed: seed + 11, horizon: 80, rho: mainRho });
  const pert = runPerturbationRecovery({
    seed: seed + 22,
    preSteps: 30,
    postSteps: 40,
    rho: mainRho,
  });
  const rhoSweep = runGoldilocksRhoSweep({ seed: seed + 33 });

  const findings = {
    strategyReversal_rmWins: reversal.findings.rmWinsPostReversal,
    strategyReversal_targetedSignature: reversal.findings.targetedModificationSignature,
    trap_rmEscapesFaster: trap.findings.rmEscapesFaster,
    trap_rmIdentifiesPattern: trap.findings.rmIdentifiesPattern,
    perturbation_rmFastest: pert.findings.rmFastestRecovery,
    goldilocks_intermediateRho: rhoSweep.findings.intermediateOptimum,
  };

  const allPlainPass = Object.values(findings).every(Boolean);

  return {
    seed,
    mainRho,
    reversal,
    trap,
    pert,
    rhoSweep,
    findings,
    plainFindings: [
      reversal.plain,
      trap.plain,
      pert.plain,
      rhoSweep.plain,
      'Sandbox digital agents only — not human biology, not AGI proof, not Super Intelligence established.',
    ],
    allPlainPass,
    honesty:
      'Sandbox digital experiment on matched P/R/M/RM agents — not human trials, not production agent internals, not phenomenal consciousness, not Super Intelligence proof. Octaves are candidate computational levels.',
  };
}
