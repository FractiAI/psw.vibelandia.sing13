import { mulberry32 } from './rng.mjs';
import { runArchitecture } from './architectures.mjs';
import { octaveInvariance, substrateLoss, PROFILE } from './spirit.mjs';
import {
  ABLATIONS, ASSUMPTIONS, BOOTSTRAP, DOC_ID, ENGINE_SHELF_PINNED, FAMILIES, HONESTY, N_TRIALS, REGISTRY_ID, SEED,
} from './constants.mjs';

const OPTS = ['plan_x', 'plan_y'];
const between = (rng, [lo, hi]) => lo + rng() * (hi - lo);
const intBetween = (rng, [lo, hi]) => lo + Math.floor(rng() * (hi - lo + 1));
const flip = (o) => (o === OPTS[0] ? OPTS[1] : OPTS[0]);

export function makeTask(family, rng, i) {
  const A = ASSUMPTIONS;
  const correct = OPTS[rng() < 0.5 ? 0 : 1];
  const base = { id: `${family}_${i}`, kind: family, options: OPTS, correct };
  if (family === 'attention_trap') {
    const decoy = rng() < A.decoyShare;
    const nMaj = intBetween(rng, A.majorityRange);
    const agents = [];
    const majVote = decoy ? correct : flip(correct);
    const minVote = decoy ? flip(correct) : correct;
    for (let k = 0; k < nMaj; k++) {
      agents.push({ id: `maj${k}`, specialty: 'generalist', vote: majVote, conf: between(rng, A.majorityConfidence), corroborated: decoy, minority: false });
    }
    const nMin = 1 + (rng() < 0.4 ? 1 : 0);
    for (let k = 0; k < nMin; k++) {
      agents.push({
        id: `min${k}`, specialty: 'specialist', vote: minVote,
        conf: between(rng, decoy ? A.decoyConfidence : A.truthConfidence),
        corroborated: !decoy, minority: true,
      });
    }
    return { ...base, decoy, agents };
  }
  if (family === 'self_construction') {
    const hasCapability = rng() < 0.3;
    const agents = [{ id: 'g0', specialty: 'generalist' }, { id: 'g1', specialty: 'generalist' }];
    if (hasCapability) agents.push({ id: 's0', specialty: 'simulation' });
    return { ...base, agents, need: 'simulation', budget: intBetween(rng, A.budgetRange), hasCapability };
  }
  if (family === 'identity_persistence') {
    return { ...base, agents: [], switches: intBetween(rng, A.octaveSequenceLength) };
  }
  return { ...base, agents: [], handoffs: intBetween(rng, [2, 4]) };
}

function runAll(family, arch, seed, opts) {
  const rows = [];
  for (let i = 0; i < N_TRIALS; i++) {
    const taskRng = mulberry32(seed + i * 7919 + family.length);
    const task = makeTask(family, taskRng, i);
    const runRng = mulberry32(seed + i * 104729 + 13);
    rows.push({ task, ...runArchitecture(arch, task, runRng, opts) });
  }
  return rows;
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const rate = (rows) => mean(rows.map((r) => (r.success ? 1 : 0)));

function bootstrapDiff(a, b, seed) {
  const rng = mulberry32(seed);
  const d = a.map((r, i) => (r.success ? 1 : 0) - (b[i].success ? 1 : 0));
  const stats = [];
  for (let k = 0; k < BOOTSTRAP; k++) {
    let s = 0;
    for (let j = 0; j < d.length; j++) s += d[Math.floor(rng() * d.length)];
    stats.push(s / d.length);
  }
  stats.sort((x, y) => x - y);
  return { mean: mean(d), lo: stats[Math.floor(0.025 * BOOTSTRAP)], hi: stats[Math.floor(0.975 * BOOTSTRAP)] };
}

export function runExpedition() {
  const families = {};
  const all = { A: [], B: [], C: [] };
  for (const fam of FAMILIES) {
    const A = runAll(fam, 'A', SEED, {});
    const B = runAll(fam, 'B', SEED, {});
    const C = runAll(fam, 'C', SEED, {});
    all.A.push(...A); all.B.push(...B); all.C.push(...C);
    const ablations = {};
    for (const knob of ABLATIONS[fam]) {
      const rows = runAll(fam, 'C', SEED, { ablation: { [knob]: false } });
      ablations[knob] = { success: rate(rows), dropVsFullC: rate(C) - rate(rows) };
    }
    families[fam] = {
      n: N_TRIALS,
      A: { success: rate(A), compute: mean(A.map((r) => r.compute)) },
      B: { success: rate(B), compute: mean(B.map((r) => r.compute)) },
      C: { success: rate(C), compute: mean(C.map((r) => r.compute)) },
      CminusB: bootstrapDiff(C, B, SEED + 1),
      CminusA: bootstrapDiff(C, A, SEED + 2),
      ablations,
    };
  }

  const decoyRows = (rows) => rows.filter((r) => r.task.decoy);
  const trueRows = (rows) => rows.filter((r) => r.task.kind === 'attention_trap' && !r.task.decoy);
  const trapAll = (rows) => rows.filter((r) => r.task.kind === 'attention_trap');
  const decoy = {
    n: decoyRows(all.C).length,
    A: rate(decoyRows(all.A)), B: rate(decoyRows(all.B)), C: rate(decoyRows(all.C)),
  };
  const genuineMinority = {
    n: trueRows(all.C).length,
    A: rate(trueRows(all.A)), B: rate(trueRows(all.B)), C: rate(trueRows(all.C)),
  };
  const naiveRedirect = runAll('attention_trap', 'C', SEED, { ablation: { evidenceCheck: false } });
  const naive = {
    decoy: rate(decoyRows(naiveRedirect)),
    genuineMinority: rate(trueRows(naiveRedirect)),
    overall: rate(trapAll(naiveRedirect)),
  };

  const sensitivity = [];
  const saved = JSON.parse(JSON.stringify({ d: ASSUMPTIONS.missionDriftPerSwitch, f: ASSUMPTIONS.factLossPerHandoff }));
  for (const p of [0.02, 0.05, 0.1, 0.15]) {
    ASSUMPTIONS.missionDriftPerSwitch.A = ASSUMPTIONS.missionDriftPerSwitch.B = p;
    ASSUMPTIONS.factLossPerHandoff.A = ASSUMPTIONS.factLossPerHandoff.B = p;
    const id = (arch) => rate(runAll('identity_persistence', arch, SEED, {}));
    const tr = (arch) => rate(runAll('octave_transfer', arch, SEED, {}));
    sensitivity.push({
      baselineLossRate: p,
      identity: { B: id('B'), C: id('C'), gap: id('C') - id('B') },
      transfer: { B: tr('B'), C: tr('C'), gap: tr('C') - tr('B') },
    });
  }
  Object.assign(ASSUMPTIONS.missionDriftPerSwitch, saved.d);
  Object.assign(ASSUMPTIONS.factLossPerHandoff, saved.f);

  const overall = { A: rate(all.A), B: rate(all.B), C: rate(all.C) };
  const compute = { A: mean(all.A.map((r) => r.compute)), B: mean(all.B.map((r) => r.compute)), C: mean(all.C.map((r) => r.compute)) };

  const gates = {
    G1_C_beats_B_overall: overall.C - overall.B >= 0.1,
    G2_not_gullible_on_decoys: decoy.C >= decoy.B - 0.02 && naive.decoy < decoy.C,
    G3_each_ablation_hurts: Object.entries(families).every(([, f]) => Object.values(f.ablations).every((a) => a.dropVsFullC >= 0.05)),
    G4_null_control_closes_gap: sensitivity.find((s) => s.baselineLossRate === 0.02).identity.gap <= 0.03
      && sensitivity.find((s) => s.baselineLossRate === 0.02).transfer.gap <= 0.03,
    G5_compute_within_3x_B: compute.C <= 3 * compute.B,
  };
  const octave = octaveInvariance();
  const loss = substrateLoss();
  const surv = octave.survival;
  const flat = surv.C_five_repair;
  gates.G6_scale_invariance = flat[1024] >= 0.85 && flat[1] - flat[1024] <= 0.1
    && surv.C_five_no_repair[1024] <= 0.1 && surv.C_single_drift2[1024] <= 0.1;
  gates.G7_substrate_loss = loss.results[0.3].nine >= 0.95 && loss.results[0.3].single <= 0.05;
  const profile = PROFILE.map((row) => {
    let evidence;
    if (families[row.family]) {
      const f = families[row.family];
      evidence = { A: f.A.success, B: f.B.success, C: f.C.success, ablationDrop: f.ablations[row.ablation]?.dropVsFullC ?? null };
    } else if (row.family === 'octave_depth') {
      evidence = { A: surv.A_single_drift15[1024], B: surv.B_single_drift15[1024], C: flat[1024], ablationDrop: flat[1024] - surv.C_five_no_repair[1024] };
    } else {
      evidence = { A: loss.results[0.3].single, B: loss.results[0.3].single, C: loss.results[0.3].nine, ablationDrop: loss.results[0.3].nine - loss.results[0.3].single };
    }
    return { ...row, ...evidence, headHolds: evidence.C >= 0.85, baselinesFail: Math.max(evidence.A, evidence.B) < evidence.C - 0.05 };
  });
  const spiritCorrespondence = profile.every((r) => r.headHolds && r.baselinesFail);
  const mechanismVerified = Object.values(gates).every(Boolean);

  return {
    documentId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: SEED,
    trialsPerFamily: N_TRIALS,
    honesty: HONESTY,
    assumptions: ASSUMPTIONS,
    families,
    decoyRobustness: { decoy, genuineMinority, naiveRedirect: naive },
    sensitivity,
    octaveInvariance: octave,
    substrateLoss: loss,
    spiritProfile: profile,
    overall,
    compute,
    gates,
    verdict: {
      mechanismVerified,
      spiritCorrespondence,
      liveAgentReplication: false,
      engineShelfPinned: ENGINE_SHELF_PINNED,
      engineShelfDecision: mechanismVerified
        ? 'deferred: scripted simulator passes mechanism gates; pin waits for a live-agent replication'
        : 'not pinned: one or more mechanism gates failed',
      summary: `Six-property spirit profile ${spiritCorrespondence ? 'holds' : 'does not hold'} for the head. Aware head ${(overall.C * 100).toFixed(1)}% vs shared world ${(overall.B * 100).toFixed(1)}% vs flat ${(overall.A * 100).toFixed(1)}% across ${FAMILIES.length} families; mechanism gates ${mechanismVerified ? 'pass' : 'fail'}; ENGINE_SHELF pin deferred.`,
    },
  };
}
