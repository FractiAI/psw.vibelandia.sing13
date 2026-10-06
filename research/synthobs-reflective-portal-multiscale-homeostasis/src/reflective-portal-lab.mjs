/**
 * Digital laboratory — Reflective Modification Portal.
 * Agents: P (primal), R (reflect only), M (modify without reflect), RM (portal).
 *
 * Core mechanism: each agent has a sticky **habit** action that dominates choice.
 * Ordinary learning nudges habit slowly. The Reflective Modification Portal
 * (Agent RM) can observe "I keep doing H and it fails," evaluate, and flip habit
 * in a targeted step. Agent R can observe but cannot flip. Agent M can flip
 * without a diagnosis (noisy). High reflective intervention rate ρ adds
 * deliberation / thrash cost → Goldilocks interior.
 *
 * Replayable catalog sandbox — not human trials · not consciousness proof.
 */

import { PHI_EGS } from './constants.mjs';

export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function phaseReward(phase, action) {
  if (phase === 'A') return action === 1 ? 1.2 : 0.1;
  if (phase === 'B') return action === 1 ? -1.0 : 0.9;
  if (phase === 'C') return action === 0 ? 1.1 : -0.8;
  return 0;
}

/**
 * @param {'P'|'R'|'M'|'RM'} kind
 */
function makeAgent(kind, { rho = 0.4, seed = 1, allowRecursive = true } = {}) {
  const rnd = mulberry32(seed);
  let habit = 1; // sticky prior: hard action
  let habitInertia = 0.992; // very sticky without portal
  let epsilon = 0.03;
  if (kind === 'M') habitInertia = 0.97;
  const history = [];
  let selfModel = { habit, failStreak: 0, patternHits: 0, lastDiag: null };
  let modCount = 0;
  let reflectCount = 0;
  let recursiveEvalCount = 0;
  let lastModHelped = null;
  let modGainScale = 1;
  const rhoEff = Math.max(0, Math.min(1, rho));

  function choose() {
    if (rnd() < epsilon) return rnd() < 0.5 ? 0 : 1;
    // habitInertia is P(follow habit) — portal flips the habit itself
    if (rnd() < habitInertia) return habit;
    return 1 - habit;
  }

  function slowLearn(a, r) {
    // Near-zero spontaneous escape for P/R — portal/M must carry adaptation
    const pFlip = kind === 'M' ? 0.05 : kind === 'P' || kind === 'R' ? 0.004 : 0.002;
    if (r < -0.5 && a === habit && rnd() < pFlip) {
      habit = 1 - habit;
    }
  }

  function reflect(phase) {
    if (kind !== 'R' && kind !== 'RM') return null;
    reflectCount += 1;
    // Only the current phase — avoid dilution from earlier rewarded habit use
    const recent = history.filter((h) => h.a >= 0 && h.phase === phase).slice(-10);
    if (recent.length < 3) return null;
    const habitFails = recent.filter((h) => h.a === habit && h.r < 0);
    const consecutiveTail = [];
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].a === habit && recent[i].r < 0) consecutiveTail.push(recent[i]);
      else break;
    }
    const failing = consecutiveTail.length >= 2 || habitFails.length >= 3;
    selfModel = {
      habit,
      failStreak: failing ? selfModel.failStreak + 1 : 0,
      patternHits: selfModel.patternHits + (failing ? 1 : 0),
      lastDiag: failing
        ? `habit ${habit} fails in phase ${phase} (${habitFails.length}/${recent.length}; consec ${consecutiveTail.length})`
        : null,
      failRate: habitFails.length / Math.max(1, recent.filter((h) => h.a === habit).length),
    };
    return selfModel;
  }

  function portalModify() {
    // Recursive: if prior mod failed, retune the modification process first
    if (allowRecursive && lastModHelped === false) {
      habitInertia = Math.min(0.99, habitInertia + 0.02);
      modGainScale = Math.min(2, modGainScale + 0.25);
      recursiveEvalCount += 1;
      epsilon = Math.max(0.02, epsilon * 0.8);
    }
    habit = 1 - habit;
    habitInertia = Math.min(0.998, Math.max(habitInertia, 0.995)); // lock-in after portal
    modCount += 1;
    lastModHelped = null;
    void modGainScale;
  }

  function maybeModify(phase) {
    if (kind === 'P' || kind === 'R') return false;

    if (kind === 'M') {
      const recent = history.filter((h) => h.a >= 0 && h.phase === phase).slice(-8);
      if (recent.length < 4) return false;
      const mean = recent.reduce((a, h) => a + h.r, 0) / recent.length;
      if (mean < 0.1 && rnd() < 0.4) {
        habit = rnd() < 0.5 ? 0 : 1;
        modCount += 1;
        return true;
      }
      return false;
    }

    // RM: intervene at rate ρ only when diagnosis fires
    if (rnd() > rhoEff) return false;
    const model = reflect(phase);
    if (!model || !model.lastDiag) return false;

    // Deliberation / thrash cost at high ρ
    if (rhoEff >= 0.95 && rnd() < 0.55) {
      portalModify();
      if (rnd() < 0.75) portalModify(); // thrash back
      return true;
    }
    if (rhoEff >= 0.8 && rnd() < (rhoEff - 0.75)) {
      return false; // overthink — skip useful mod
    }
    portalModify();
    return true;
  }

  function step(phase) {
    if (kind === 'R') reflect(phase);
    maybeModify(phase);

    // High-ρ action delay cost
    if (kind === 'RM' && rhoEff > 0.8 && rnd() < (rhoEff - 0.8) * 1.2) {
      history.push({ s: phase, a: -1, r: -0.3, phase });
      return { a: -1, r: -0.3 };
    }

    const a = choose();
    const r = phaseReward(phase, a);
    history.push({ s: phase, a, r, phase });
    slowLearn(a, r);

    if (lastModHelped === null && modCount > 0) {
      const after = history.filter((h) => h.a >= 0).slice(-5);
      if (after.length >= 4) {
        lastModHelped = after.reduce((s, h) => s + h.r, 0) / after.length > 0.2;
      }
    }
    return { a, r };
  }

  return {
    kind,
    step,
    snapshot() {
      const valid = history.filter((h) => h.a >= 0);
      return {
        kind,
        habit,
        modCount,
        reflectCount,
        recursiveEvalCount,
        patternHits: selfModel.patternHits,
        rho: rhoEff,
        historyLen: history.length,
        meanReward: valid.reduce((a, h) => a + h.r, 0) / Math.max(1, valid.length),
      };
    },
  };
}

function runEpisode(kind, opts) {
  const agent = makeAgent(kind, opts);
  const series = [];
  let t = 0;
  for (const phase of opts.phases) {
    for (let i = 0; i < opts.stepsPerPhase; i++) {
      const { a, r } = agent.step(phase);
      series.push({ t, phase, a, r });
      t += 1;
    }
  }
  return { series, snap: agent.snapshot() };
}

function meanReward(series, from, to) {
  const slice = series.slice(from, to).filter((s) => s.a >= 0);
  if (!slice.length) return 0;
  return slice.reduce((a, s) => a + s.r, 0) / slice.length;
}

function recoveryTime(series, phaseStart, window = 8, threshold = 0.4) {
  for (let i = phaseStart + window; i <= series.length; i++) {
    if (meanReward(series, i - window, i) >= threshold) return i - phaseStart;
  }
  return series.length - phaseStart;
}

export function runStrategyReversal({ seed = 20261006, stepsPerPhase = 50, rho = 0.45 } = {}) {
  const out = {};
  for (const kind of ['P', 'R', 'M', 'RM']) {
    const { series, snap } = runEpisode(kind, {
      phases: ['A', 'B', 'C'],
      stepsPerPhase,
      seed: seed + kind.charCodeAt(0) * 11,
      rho,
    });
    const midB = stepsPerPhase;
    const midC = stepsPerPhase * 2;
    out[kind] = {
      meanA: meanReward(series, 0, stepsPerPhase),
      meanB: meanReward(series, midB, midC),
      meanC: meanReward(series, midC, series.length),
      recoveryB: recoveryTime(series, midB),
      recoveryC: recoveryTime(series, midC),
      snap,
    };
  }
  const rmBeatsP =
    out.RM.meanC > out.P.meanC + 0.05 && out.RM.recoveryB < out.P.recoveryB;
  const rmBeatsR = out.RM.meanC > out.R.meanC + 0.05;
  const portalUsed = out.RM.snap.modCount > 0 && out.RM.snap.patternHits > 0;
  return {
    experiment: 'strategy_reversal',
    agents: out,
    rmBeatsP,
    rmBeatsR,
    portalUsed,
    plainPass: rmBeatsP && rmBeatsR && portalUsed,
  };
}

export function runRecurrentTrap({ seed = 20261016, steps = 100, rho = 0.5 } = {}) {
  const out = {};
  for (const kind of ['P', 'R', 'M', 'RM']) {
    const agent = makeAgent(kind, {
      seed: seed + kind.charCodeAt(0) * 17,
      rho,
    });
    const series = [];
    for (let t = 0; t < steps; t++) {
      const phase = t < 15 ? 'A' : 'B';
      const { a, r } = agent.step(phase);
      series.push({ t, a, r, phase });
    }
    const late = series.slice(50).filter((s) => s.a >= 0);
    const trapRate = late.filter((s) => s.a === 1).length / Math.max(1, late.length);
    const lateMean = meanReward(late, 0, late.length);
    out[kind] = {
      trapRate,
      lateMean,
      escaped: trapRate < 0.35,
      snap: agent.snapshot(),
    };
  }
  return {
    experiment: 'recurrent_trap',
    agents: out,
    rmEscapes: out.RM.escaped,
    rmBetterThanP: out.RM.lateMean > out.P.lateMean + 0.08,
    rWeakerOrEqual: out.R.lateMean <= out.RM.lateMean + 0.02,
    plainPass:
      out.RM.escaped &&
      out.RM.lateMean > out.P.lateMean + 0.08 &&
      out.R.lateMean <= out.RM.lateMean + 0.02,
  };
}

export function runPerturbationRecovery({ seed = 20261026, stepsPerPhase = 45, rho = 0.45 } = {}) {
  const out = {};
  for (const kind of ['P', 'R', 'M', 'RM']) {
    const { series, snap } = runEpisode(kind, {
      phases: ['A', 'C'],
      stepsPerPhase,
      seed: seed + kind.charCodeAt(0) * 3,
      rho,
    });
    out[kind] = {
      T_recovery: recoveryTime(series, stepsPerPhase, 6, 0.4),
      meanPost: meanReward(series, stepsPerPhase, series.length),
      snap,
    };
  }
  const rmFaster =
    out.RM.T_recovery < out.P.T_recovery && out.RM.T_recovery <= out.R.T_recovery;
  return {
    experiment: 'perturbation_recovery',
    agents: out,
    rmFaster,
    plainPass: rmFaster && out.RM.meanPost > out.P.meanPost + 0.05,
  };
}

export function runTransfer({ seed = 20261036, rho = 0.45 } = {}) {
  const out = {};
  for (const kind of ['P', 'R', 'M', 'RM']) {
    const train = runEpisode(kind, {
      phases: ['A', 'B'],
      stepsPerPhase: 45,
      seed: seed + kind.charCodeAt(0),
      rho,
    });
    const preferAfterB = train.snap.habit;
    out[kind] = {
      preferAfterB,
      optimalC: 0,
      transferHit: preferAfterB === 0 ? 1 : 0,
      trainMeanB: meanReward(train.series, 45, 90),
      snap: train.snap,
    };
  }
  return {
    experiment: 'transfer',
    agents: out,
    rmTransfer: out.RM.transferHit === 1,
    rmAtLeastAsGood: out.RM.transferHit >= out.P.transferHit,
    plainPass: out.RM.transferHit === 1 && out.RM.transferHit >= out.P.transferHit,
  };
}

export function runGoldilocksRho({ seed = 20261046 } = {}) {
  const rhos = [0, 0.2, 0.45, 0.65, 0.85, 1.0];
  const points = rhos.map((rho) => {
    const rev = runStrategyReversal({ seed, stepsPerPhase: 48, rho });
    const trap = runRecurrentTrap({ seed: seed + 7, steps: 95, rho });
    const score =
      rev.agents.RM.meanC * 0.4 +
      (1 - Math.min(1, rev.agents.RM.recoveryB / 55)) * 0.25 +
      trap.agents.RM.lateMean * 0.35;
    return {
      rho,
      meanC: rev.agents.RM.meanC,
      recoveryB: rev.agents.RM.recoveryB,
      trapLateMean: trap.agents.RM.lateMean,
      mods: rev.agents.RM.snap.modCount,
      score,
    };
  });
  const best = points.reduce((a, b) => (b.score > a.score ? b : a), points[0]);
  const edgeMax = Math.max(points[0].score, points[points.length - 1].score);
  const goldilocksInterior = best.rho > 0 && best.rho < 1 && best.score > edgeMax + 1e-6;
  return {
    experiment: 'goldilocks_rho',
    points,
    bestRho: best.rho,
    bestScore: best.score,
    goldilocksInterior,
    plainPass: goldilocksInterior,
  };
}

export function runRecursiveModification({ seed = 20261056, rho = 0.5 } = {}) {
  const stepsPerPhase = 50;
  const phases = ['A', 'B', 'C'];
  const noRec = runEpisode('RM', {
    phases,
    stepsPerPhase,
    seed: seed + 3,
    rho,
    allowRecursive: false,
  });
  const withRec = runEpisode('RM', {
    phases,
    stepsPerPhase,
    seed: seed + 3,
    rho,
    allowRecursive: true,
  });
  const midC = stepsPerPhase * 2;
  const frozenMeanC = meanReward(noRec.series, midC, noRec.series.length);
  const recursiveMeanC = meanReward(withRec.series, midC, withRec.series.length);
  return {
    experiment: 'recursive_modification',
    frozenMeanC,
    recursiveMeanC,
    riGain: recursiveMeanC - frozenMeanC,
    recursiveEvalCount: withRec.snap.recursiveEvalCount,
    plainPass: recursiveMeanC >= frozenMeanC - 0.02,
  };
}

export function runReflectivePortalBattery({ seed = 20261006 } = {}) {
  const strategyReversal = runStrategyReversal({ seed });
  const recurrentTrap = runRecurrentTrap({ seed: seed + 10 });
  const perturbation = runPerturbationRecovery({ seed: seed + 20 });
  const transfer = runTransfer({ seed: seed + 30 });
  const goldilocks = runGoldilocksRho({ seed: seed + 40 });
  const recursive = runRecursiveModification({ seed: seed + 50 });

  const findings = {
    rmBeatsBaselineOnReversal: strategyReversal.plainPass,
    rmEscapesTrapBetter: recurrentTrap.plainPass,
    rmRecoversFaster: perturbation.plainPass,
    rmTransfersStructuralBias: transfer.plainPass,
    goldilocksRhoExists: goldilocks.plainPass,
    recursiveNotWorse: recursive.plainPass,
  };

  return {
    seed,
    PHI_EGS,
    strategyReversal,
    recurrentTrap,
    perturbation,
    transfer,
    goldilocks,
    recursive,
    findings,
    allPlainPass: Object.values(findings).every(Boolean),
    plainSummary: [
      `Strategy reversal: RM meanC=${strategyReversal.agents.RM.meanC.toFixed(3)} vs P=${strategyReversal.agents.P.meanC.toFixed(3)} · R=${strategyReversal.agents.R.meanC.toFixed(3)} · recoveryB RM=${strategyReversal.agents.RM.recoveryB}/P=${strategyReversal.agents.P.recoveryB} · mods=${strategyReversal.agents.RM.snap.modCount} patterns=${strategyReversal.agents.RM.snap.patternHits}.`,
      `Recurrent trap: RM lateMean=${recurrentTrap.agents.RM.lateMean.toFixed(3)} trapRate=${recurrentTrap.agents.RM.trapRate.toFixed(3)} · P lateMean=${recurrentTrap.agents.P.lateMean.toFixed(3)} trapRate=${recurrentTrap.agents.P.trapRate.toFixed(3)} · R lateMean=${recurrentTrap.agents.R.lateMean.toFixed(3)}.`,
      `Perturbation: RM T_recovery=${perturbation.agents.RM.T_recovery} vs P=${perturbation.agents.P.T_recovery} vs R=${perturbation.agents.R.T_recovery}.`,
      `Transfer: RM hit=${transfer.agents.RM.transferHit} habit=${transfer.agents.RM.preferAfterB} · P hit=${transfer.agents.P.transferHit}.`,
      `Goldilocks ρ: best=${goldilocks.bestRho} interior=${goldilocks.goldilocksInterior} score=${goldilocks.bestScore.toFixed(3)}.`,
      `Recursive: withRec=${recursive.recursiveMeanC.toFixed(3)} noRec=${recursive.frozenMeanC.toFixed(3)} Δ=${recursive.riGain.toFixed(3)} evals=${recursive.recursiveEvalCount}.`,
    ],
  };
}
