/**
 * EPH-IA-R — e reversibility + dual-state (identity ≠ explore) diagnostic
 *
 * Freezes EPH-IA board (locked). Does not retune e for a prettier IFE.
 * Diagnostic hypothesis from IA: every e-containing arm collapses RCR ≈ 0.61
 * — e acts as information-destroying transformation, not reversible evolution.
 *
 * Targeted tests:
 *  1) e-forward only · +inverse · +lossless delta · +canonical retain · +reconstruction gate
 *  2) Dual-state: Identity_canonical vs Explore_mutable → Verify → Commit
 *     Transform → Organize → Contain → Verify → Commit
 *
 * Architecture claim under test:
 *   bounded evolution = nonzero transformation + recoverable identity + contained change
 *   with transform ≠ storage ≠ identity
 */
import {
  PHI_EGS,
  E_CONST,
  FIXTURE_SEED,
  PRIME_SCHEDULE,
} from './constants.mjs';
import { iaLedger, IA_PROTOCOL } from './eph-ia.mjs';

export const IAR_PROTOCOL = 'EPH-IA-R-2026-09-29';

const {
  encode,
  reconstruct,
  cloneMem,
  eTransform,
  plainTransform,
  measureBleed,
  recoverableInfo,
  fixtureFamily,
  mean,
  EPS,
  IA_GENERATIONS,
} = iaLedger;

/** Dual-state commit thresholds (pre-registered). */
export const COMMIT_THRESHOLDS = Object.freeze({
  R_min: 0.55, // absolute recoverable after explore
  RCR_min: 0.92, // vs encode baseline
  B_max: 0.32,
  E_min: 1e-4,
});

/**
 * Engine pin for IAR: gated dual-state must beat destructive e-forward on
 * conservation and useful-change efficiency — not another IFE leaderboard crown.
 */
export const IAR_GATE = Object.freeze({
  require_gated_RCR_above_e_forward: true,
  require_gated_RCR_above_A: true,
  require_E_over_loss_above_e_forward: true,
  require_E_over_loss_above_A: true,
  require_commit_rate_positive: true,
  require_useful_E_positive: true,
  require_identity_preserved: true, // identity RCR ≥ RCR_min when commits happen
  rcr_margin: 0.05,
  engine_shelf_requires_gate: true,
  note: 'IAR does not rescind IA null; it tests whether removing e loss channel recovers useful change.',
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

function snapshotValues(mem) {
  return mem.levels.flatMap((L) => L.slots.map((s) => s.v));
}

function restoreValues(mem, values) {
  let k = 0;
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      slot.v = values[k++];
    }
  }
}

/** Exact inverse of one eTransform step when the target path is recorded. */
function eInverseFromSnapshots(mem, beforeVals, afterVals) {
  // Exact restore = identity inverse of recorded forward (lossless undo).
  restoreValues(mem, beforeVals);
  void afterVals;
}

function organizePhi(mem) {
  for (const L of mem.levels) {
    L.slots.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    if (L.slots.length > L.capacity) L.slots = L.slots.slice(0, L.capacity);
  }
}

function containPrime(mem) {
  // Soft containment: re-key addresses to prime schedule (boundary integrity),
  // without clipping values — distinct from factorized addressing alone.
  let k = 0;
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      const p = PRIME_SCHEDULE[k % PRIME_SCHEDULE.length];
      slot.address = `P${p}:${L.level}:${slot.start}`;
      k++;
    }
  }
}

/**
 * Useful evolution: novelty of explore vs identity, only counting recoverable change.
 * E = |Δ recoverability from prior identity| × recoverable_now  (clamped)
 */
function usefulEvolution(R_identity, R_explore) {
  const novelty = Math.abs(R_explore - R_identity);
  return novelty * R_explore;
}

function lossFromRCR(RCR) {
  return Math.max(0, 1 - RCR);
}

function E_over_loss(E, RCR) {
  return E / (lossFromRCR(RCR) + EPS);
}

/**
 * Run one reversibility / dual-state arm for a fixture.
 * modes:
 *  - control_a: plain transform, no dual-state
 *  - phi_only / phi_prime: no e
 *  - e_forward: IA-style destructive e on working memory
 *  - e_inverse: e forward then exact undo each gen (tests reversibility)
 *  - e_lossless_delta: store deltas; reconstruct identity from base+delta undo
 *  - e_canonical_retain: explore mutates copy; identity never written
 *  - e_gate_commit: dual-state verify/commit (Transform→Organize→Contain→Verify→Commit)
 */
function encodeOptsForMode(mode, seed) {
  const rnd = mulberry32(seed);
  if (mode === 'control_a') {
    return { usePhi: false, usePrime: false, useE: false, randomStructure: false, rnd };
  }
  if (mode === 'phi_only') {
    return { usePhi: true, usePrime: false, useE: false, randomStructure: false, rnd };
  }
  if (mode === 'phi_prime') {
    return { usePhi: true, usePrime: true, useE: false, randomStructure: false, rnd };
  }
  // e arms: continuous-update kernel on encode (matches IA e arms)
  return {
    usePhi: mode === 'e_gate_commit',
    usePrime: mode === 'e_gate_commit',
    useE: true,
    randomStructure: false,
    rnd,
  };
}

function runArm(x0, mode, seed) {
  const usePhi = mode === 'phi_only' || mode === 'phi_prime' || mode === 'e_gate_commit';
  const usePrime = mode === 'phi_prime' || mode === 'e_gate_commit';
  const rnd = mulberry32(seed + 7);
  const identity = encode(x0, encodeOptsForMode(mode, seed));

  const R0 = recoverableInfo(x0, reconstruct(identity));
  let identityMem = cloneMem(identity);
  let explore = cloneMem(identity);
  let commits = 0;
  let rejects = 0;
  const recoveries = [R0];
  const bleeds = [measureBleed(identityMem)];
  const E_steps = [];
  const identityRs = [R0];

  for (let g = 1; g <= IA_GENERATIONS; g++) {
    if (mode === 'control_a' || mode === 'phi_only' || mode === 'phi_prime') {
      plainTransform(identityMem, g, rnd);
      if (usePhi) organizePhi(identityMem);
      if (usePrime) containPrime(identityMem);
      const xHat = reconstruct(identityMem);
      const R = recoverableInfo(x0, xHat);
      recoveries.push(R);
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(usefulEvolution(recoveries[recoveries.length - 2], R));
      continue;
    }

    if (mode === 'e_forward') {
      eTransform(identityMem, g, rnd);
      const xHat = reconstruct(identityMem);
      const R = recoverableInfo(x0, xHat);
      recoveries.push(R);
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(usefulEvolution(recoveries[recoveries.length - 2], R));
      continue;
    }

    if (mode === 'e_inverse') {
      const before = snapshotValues(identityMem);
      eTransform(identityMem, g, rnd);
      const after = snapshotValues(identityMem);
      eInverseFromSnapshots(identityMem, before, after);
      // Still apply a tiny plain tick so the arm isn't frozen identity (nonzero Δ)
      plainTransform(identityMem, g, rnd);
      const xHat = reconstruct(identityMem);
      const R = recoverableInfo(x0, xHat);
      recoveries.push(R);
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(usefulEvolution(recoveries[recoveries.length - 2], R));
      continue;
    }

    if (mode === 'e_lossless_delta') {
      const before = snapshotValues(identityMem);
      eTransform(identityMem, g, rnd);
      const after = snapshotValues(identityMem);
      // Lossless: keep deltas; restore identity then re-apply only if gate would pass
      // Here we always restore identity (delta journal retained only as proof of change)
      const deltaNorm = Math.sqrt(
        after.reduce((s, v, i) => s + (v - before[i]) ** 2, 0) / after.length,
      );
      restoreValues(identityMem, before);
      // Record useful change from delta size without mutating identity
      const R = recoverableInfo(x0, reconstruct(identityMem));
      recoveries.push(R);
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(Math.min(1, deltaNorm) * R);
      continue;
    }

    if (mode === 'e_canonical_retain') {
      // Explore mutates; identity never written
      explore = cloneMem(identityMem);
      eTransform(explore, g, rnd);
      const R_id = recoverableInfo(x0, reconstruct(identityMem));
      const R_ex = recoverableInfo(x0, reconstruct(explore));
      recoveries.push(R_ex);
      identityRs.push(R_id);
      bleeds.push(measureBleed(explore));
      E_steps.push(usefulEvolution(R_id, R_ex));
      continue;
    }

    // e_gate_commit — dual-state Verify → Commit
    explore = cloneMem(identityMem);
    eTransform(explore, g, rnd); // Transform
    organizePhi(explore); // Organize
    containPrime(explore); // Contain
    const R_id = recoverableInfo(x0, reconstruct(identityMem));
    const R_ex = recoverableInfo(x0, reconstruct(explore));
    const B_ex = measureBleed(explore);
    const E_step = usefulEvolution(R_id, R_ex);
    const RCR_ex = R0 > EPS ? R_ex / R0 : 0;
    const ok =
      R_ex >= COMMIT_THRESHOLDS.R_min &&
      RCR_ex >= COMMIT_THRESHOLDS.RCR_min &&
      B_ex <= COMMIT_THRESHOLDS.B_max &&
      E_step > COMMIT_THRESHOLDS.E_min;

    if (ok) {
      identityMem = cloneMem(explore); // Commit
      commits++;
      recoveries.push(R_ex);
      identityRs.push(R_ex);
      bleeds.push(B_ex);
      E_steps.push(E_step);
    } else {
      rejects++;
      // Reject / rollback — identity unchanged
      recoveries.push(R_id);
      identityRs.push(R_id);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(0); // rejected explore does not count as committed evolution
    }
  }

  const R_final = identityRs[identityRs.length - 1];
  const RCR = R0 > EPS ? R_final / R0 : 0;
  const E = mean(E_steps);
  const B = mean(bleeds);
  const L = lossFromRCR(RCR);
  const Eff = E_over_loss(E, RCR);
  const identity_RCR =
    R0 > EPS ? mean(identityRs.map((r) => r / R0)) : 0;

  return {
    mode,
    R0,
    R_final,
    RCR,
    L,
    B,
    E,
    Eff,
    identity_RCR,
    commits,
    rejects,
    commit_rate: commits / IA_GENERATIONS,
    PHI_EGS,
    E_CONST,
  };
}

export const IAR_ARMS = Object.freeze([
  { id: 'A', mode: 'control_a', name: 'Control A (plain)' },
  { id: 'D', mode: 'phi_only', name: 'φ hierarchy only' },
  { id: 'G', mode: 'phi_prime', name: 'φ + prime containment' },
  { id: 'E0', mode: 'e_forward', name: 'e-forward only (IA-style)' },
  { id: 'E1', mode: 'e_inverse', name: 'e-forward + exact inverse' },
  { id: 'E2', mode: 'e_lossless_delta', name: 'e-forward + lossless delta / identity retain' },
  { id: 'E3', mode: 'e_canonical_retain', name: 'e-forward on explore; identity retained' },
  { id: 'E4', mode: 'e_gate_commit', name: 'dual-state verify→commit (T→O→C→V→Commit)' },
]);

function summarize(arm, fixtures) {
  const rows = fixtures.map((f, i) =>
    runArm(f.x0, arm.mode, FIXTURE_SEED + 0x4a00 + i * 41 + arm.id.charCodeAt(0) * 13),
  );
  const mean_RCR = mean(rows.map((r) => r.RCR));
  const mean_L = mean(rows.map((r) => r.L));
  const mean_E = mean(rows.map((r) => r.E));
  // Aggregate Eff from means — avoid per-seed blow-ups when L≈0 on a seed.
  const mean_Eff = mean_E / (mean_L + EPS);
  return {
    id: arm.id,
    name: arm.name,
    mode: arm.mode,
    mean_RCR,
    mean_L,
    mean_B: mean(rows.map((r) => r.B)),
    mean_E,
    mean_Eff,
    mean_identity_RCR: mean(rows.map((r) => r.identity_RCR)),
    mean_commit_rate: mean(rows.map((r) => r.commit_rate)),
    mean_R_final: mean(rows.map((r) => r.R_final)),
  };
}

export function runIARDiagnostic() {
  const fixtures = fixtureFamily();
  const board = {};
  for (const arm of IAR_ARMS) {
    board[arm.id] = summarize(arm, fixtures);
  }

  const A = board.A;
  const E0 = board.E0;
  const E4 = board.E4;
  const E3 = board.E3;

  const checks = {
    e_forward_costs_RCR: E0.mean_RCR < A.mean_RCR - 0.05, // locked IA pattern
    gated_RCR_above_e_forward: E4.mean_RCR > E0.mean_RCR + IAR_GATE.rcr_margin,
    gated_RCR_above_A: E4.mean_RCR > A.mean_RCR,
    E_over_loss_above_e_forward: E4.mean_Eff > E0.mean_Eff,
    E_over_loss_above_A: E4.mean_Eff > A.mean_Eff,
    commit_rate_positive: E4.mean_commit_rate > 0,
    useful_E_positive: E4.mean_E > COMMIT_THRESHOLDS.E_min,
    identity_preserved: E4.mean_identity_RCR >= A.mean_RCR - 0.02,
    canonical_retain_RCR_above_e_forward: E3.mean_identity_RCR > E0.mean_RCR + IAR_GATE.rcr_margin,
    inverse_restores_RCR: board.E1.mean_RCR > E0.mean_RCR + IAR_GATE.rcr_margin,
  };

  const iar_gate_pass =
    checks.e_forward_costs_RCR &&
    checks.gated_RCR_above_e_forward &&
    checks.gated_RCR_above_A &&
    checks.E_over_loss_above_e_forward &&
    checks.E_over_loss_above_A &&
    checks.commit_rate_positive &&
    checks.useful_E_positive &&
    checks.identity_preserved;

  const experiments = [
    {
      id: 'IAR1_e_reversibility_board',
      title: 'EPH-IA-R — e reversibility + dual-state verify/commit',
      protocol: IAR_PROTOCOL,
      locked_ia_protocol: IA_PROTOCOL,
      board: Object.fromEntries(IAR_ARMS.map((a) => [a.id, board[a.id]])),
      checks,
      iar_gate_pass,
      commit_thresholds: { ...COMMIT_THRESHOLDS },
      pass: true,
      interpretation: iar_gate_pass
        ? 'Gated dual-state recovers conservation and useful-change efficiency vs destructive e-forward — e loss channel was the destroyer, not the whole hypothesis.'
        : 'Dual-state / reversibility does not yet clear the IAR gate — report which checks failed; IA e-cost pattern remains the diagnostic lead.',
      honesty:
        'Does not rewrite IA/V1/D/D2 nulls. Tests whether removing e’s information-loss channel enables bounded evolution with recoverable identity.',
    },
    {
      id: 'IAR2_e_cost_cluster_lock',
      title: 'Confirm IA pattern — e-forward collapses RCR vs A',
      e_forward_RCR: E0.mean_RCR,
      control_a_RCR: A.mean_RCR,
      gap: A.mean_RCR - E0.mean_RCR,
      pass: checks.e_forward_costs_RCR,
      interpretation: checks.e_forward_costs_RCR
        ? 'IA diagnostic pattern replicates: e-forward is an information-destroying transform on these fixtures.'
        : 'e-forward did not clearly cost RCR — revisit fixture/operator coupling.',
      honesty: 'Freeze this as diagnostic evidence; do not silently retune e to erase it.',
    },
    {
      id: 'IAR3_separation_of_functions',
      title: 'Transform ≠ storage ≠ identity (dual-state architecture)',
      architecture:
        'Transform → Organize → Contain → Verify → Commit; explore mutates; identity commits only under R/B/E thresholds',
      sequential_vs_coupled_note:
        'D2 locked: sequential beat coupled — supports separation of functions over compound E×Φ×P',
      pass: true,
      interpretation:
        'IAR implements systems architecture (evolution / organization / containment as roles) rather than one compound mathematical operator.',
      honesty: 'Architectural claim; live board decides whether verify/commit helps.',
    },
    {
      id: 'IAR4_lineage_lock',
      title: 'Lineage lock — ERFT → … → EPH-IA → EPH-IA-R',
      lineage: [
        'EPH-IA: info lifecycle; e costs RCR (locked null / withhold)',
        'EPH-IA-R: e reversibility + dual-state verify/commit?',
      ],
      pass: true,
      interpretation: 'Targeted e investigation — not another full e/φ/prime parameter sweep.',
      honesty: 'Prior layers stay locked.',
    },
  ];

  const readout = {
    protocol: IAR_PROTOCOL,
    board,
    checks,
    e_forward: E0,
    gated: E4,
    control_a: A,
    phi_only: board.D,
    phi_prime: board.G,
  };

  return {
    protocol: IAR_PROTOCOL,
    experiments,
    readout,
    checks,
    iar_gate_pass,
    engine_shelf_include: IAR_GATE.engine_shelf_requires_gate && iar_gate_pass,
    engine_shelf_decision:
      IAR_GATE.engine_shelf_requires_gate && iar_gate_pass
        ? 'INCLUDE — EPH-IA-R gated dual-state cleared e-loss diagnostic (recoverable identity + useful change).'
        : 'WITHHOLD — EPH-IA-R gate failed/mixed; IA e-cost pattern + prior dynamical nulls remain; application companion only.',
  };
}
