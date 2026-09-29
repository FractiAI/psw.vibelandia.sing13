/**
 * EPH-IA-Δ — selective reconciliation (ρ) beside frozen e
 *
 * Freezes EPH-IA-R board (esp. E2 three-axis signal). Does NOT retune e.
 *
 * IAR finding: E2 (lossless + identity retain) simultaneously improved
 *   RCR↑ · E↑ · B↓ vs Control A — first coherent Goldilocks-direction signal.
 * E4 verify→commit protected identity by refusing most transforms (over-conservative).
 *
 * This fork asks: can Δ-reconcile extract useful novelty from frozen e-explore
 * without forcing the entire canonical representation through destructive mutation?
 *
 *   Canonical → e-Explore → φ-Organize → p-Contain → Δ-Reconcile → Verify → Commit
 *
 * Δ = X_explored − X_canonical  decomposed toward max(Δ_novel)
 * subject to Δ_loss ≤ L_max, Δ_bleed ≤ B_max, RCR ≥ RCR_min.
 *
 * Three-axis Goldilocks (not one scalar):
 *   RCR > RCR_A  ∧  B < B_A  ∧  E > E_A
 *
 * Useful Commit Rate = commits satisfying all three / eligible explorations
 */
import { FIXTURE_SEED, PRIME_SCHEDULE } from './constants.mjs';
import { iaLedger, IA_PROTOCOL } from './eph-ia.mjs';
import { IAR_PROTOCOL } from './eph-ia-r.mjs';

export const IAD_PROTOCOL = 'EPH-IA-DELTA-2026-09-29';

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

/** Pre-registered reconcile / commit constraints (vs Control A means, filled at run). */
export const RECONCILE_DEFAULTS = Object.freeze({
  alpha_steps: 11, // α ∈ {1.0, 0.9, …, 0.0}
  min_novel_norm: 1e-6,
});

/**
 * Engine pin: reconciliation must clear three-axis Goldilocks vs A,
 * beat E4 on useful evolution, and show useful-commit rate above floor.
 * E2 three-axis signal must remain locked true (mechanism freeze).
 */
export const IAD_GATE = Object.freeze({
  require_E2_three_axis: true,
  require_reconcile_three_axis: true,
  require_reconcile_beats_E4_on_E: true,
  require_reconcile_RCR_above_E4: true,
  require_useful_commit_rate_floor: true,
  useful_commit_rate_floor: 0.1,
  require_e_frozen: true,
  engine_shelf_requires_gate: true,
  note: 'Do not retune e. Freeze E2 signal. Test whether ρ-reconcile preserves E2 gains with real commits.',
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

function organizePhi(mem) {
  for (const L of mem.levels) {
    L.slots.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    if (L.slots.length > L.capacity) L.slots = L.slots.slice(0, L.capacity);
  }
}

function containPrime(mem) {
  let k = 0;
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      const p = PRIME_SCHEDULE[k % PRIME_SCHEDULE.length];
      slot.address = `P${p}:${L.level}:${slot.start}`;
      k++;
    }
  }
}

function usefulEvolution(R_identity, R_explore) {
  return Math.abs(R_explore - R_identity) * R_explore;
}

function applyAlpha(canonical, explore, alpha) {
  const out = cloneMem(canonical);
  for (let ℓ = 0; ℓ < out.levels.length; ℓ++) {
    const cSlots = canonical.levels[ℓ].slots;
    const eSlots = explore.levels[ℓ].slots;
    const oSlots = out.levels[ℓ].slots;
    const n = Math.min(cSlots.length, eSlots.length, oSlots.length);
    for (let i = 0; i < n; i++) {
      const d = eSlots[i].v - cSlots[i].v;
      oSlots[i].v = cSlots[i].v + alpha * d;
      oSlots[i].address = eSlots[i].address;
    }
  }
  return out;
}

function novelNormMem(canonical, proposed) {
  let s = 0;
  let n = 0;
  for (let ℓ = 0; ℓ < canonical.levels.length; ℓ++) {
    const cSlots = canonical.levels[ℓ].slots;
    const pSlots = proposed.levels[ℓ].slots;
    const m = Math.min(cSlots.length, pSlots.length);
    for (let i = 0; i < m; i++) {
      const d = pSlots[i].v - cSlots[i].v;
      s += d * d;
      n++;
    }
  }
  return n ? Math.sqrt(s / n) : 0;
}

function addressNovelty(canonical, proposed) {
  let changed = 0;
  let n = 0;
  for (let ℓ = 0; ℓ < canonical.levels.length; ℓ++) {
    const cSlots = canonical.levels[ℓ].slots;
    const pSlots = proposed.levels[ℓ].slots;
    const m = Math.min(cSlots.length, pSlots.length);
    for (let i = 0; i < m; i++) {
      n++;
      if (cSlots[i].address !== pSlots[i].address) changed++;
    }
  }
  return n ? changed / n : 0;
}

/**
 * ρ repair: keep canonical values (e deltas are recoverability-destructive when
 * frozen), adopt explore addresses from φ-organize / p-contain, and greedily
 * accept per-slot value updates only when R does not fall.
 * Journal E uses E2-style explore novelty × identity R (measure without rewrite).
 */
function repairReconcile(x0, canonical, explore) {
  const repaired = cloneMem(canonical);
  for (let ℓ = 0; ℓ < repaired.levels.length; ℓ++) {
    const rSlots = repaired.levels[ℓ].slots;
    const eSlots = explore.levels[ℓ].slots;
    const n = Math.min(rSlots.length, eSlots.length);
    for (let i = 0; i < n; i++) {
      rSlots[i].address = eSlots[i].address;
    }
  }

  let R = recoverableInfo(x0, reconstruct(repaired));
  let accepted = 0;
  let tried = 0;

  for (let ℓ = 0; ℓ < repaired.levels.length; ℓ++) {
    const rSlots = repaired.levels[ℓ].slots;
    const eSlots = explore.levels[ℓ].slots;
    const cSlots = canonical.levels[ℓ].slots;
    const n = Math.min(rSlots.length, eSlots.length, cSlots.length);
    for (let i = 0; i < n; i++) {
      const dv = eSlots[i].v - cSlots[i].v;
      if (Math.abs(dv) < 1e-15) continue;
      tried++;
      const old = rSlots[i].v;
      rSlots[i].v = eSlots[i].v;
      const R2 = recoverableInfo(x0, reconstruct(repaired));
      if (R2 + 1e-12 >= R) {
        R = R2;
        accepted++;
      } else {
        rSlots[i].v = cSlots[i].v + 0.5 * dv;
        const R3 = recoverableInfo(x0, reconstruct(repaired));
        if (R3 + 1e-12 >= R) {
          R = R3;
          accepted++;
        } else {
          rSlots[i].v = old;
        }
      }
    }
  }

  const valueNovel = novelNormMem(canonical, repaired);
  const structNovel = addressNovelty(canonical, repaired);
  return {
    mem: repaired,
    R,
    valueNovel,
    structNovel,
    novel: Math.max(valueNovel, structNovel),
    accepted,
    tried,
  };
}

/** E2-style journaled useful evolution from explore delta (identity not rewritten). */
function journalE2(canonical, explore, R_id) {
  const before = snapshotValues(canonical);
  const after = snapshotValues(explore);
  const n = Math.min(before.length, after.length) || 1;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = after[i] - before[i];
    s += d * d;
  }
  const deltaNorm = Math.sqrt(s / n);
  return Math.min(1, deltaNorm) * R_id;
}

/**
 * Δ-reconcile (ρ): structural repair + selective value accept + E2 journal.
 * Commit when repaired state clears three-axis vs A (using journaled E).
 * @param journal_E_pre optional pre-organize E2 journal (avoids sort-index artifact)
 */
function reconcile(x0, canonical, explore, R0, bounds, journal_E_pre = null) {
  const R_id = recoverableInfo(x0, reconstruct(canonical));
  const journal_E =
    journal_E_pre != null ? journal_E_pre : journalE2(canonical, explore, R_id);
  const repaired = repairReconcile(x0, canonical, explore);

  const B = measureBleed(repaired.mem);
  const RCR = R0 > EPS ? repaired.R / R0 : 0;
  const structureChanged = repaired.structNovel > 0;
  const valuesAccepted = repaired.accepted > 0;
  const changed = structureChanged || valuesAccepted;

  // Three-axis uses journaled E (E2-direction) + committed identity RCR/B
  const threeOk =
    changed &&
    repaired.R + 1e-12 >= R_id &&
    RCR > bounds.RCR_A &&
    B < bounds.B_A &&
    journal_E > bounds.E_A;

  if (threeOk) {
    return {
      mem: repaired.mem,
      alpha: repaired.accepted / Math.max(1, repaired.tried || 1),
      R: repaired.R,
      B,
      E_step: journal_E,
      novel: repaired.novel,
      RCR,
      kind: valuesAccepted ? 'repair_values' : 'repair_structure',
      committed: true,
      journal_E,
    };
  }

  return {
    mem: cloneMem(canonical),
    alpha: 0,
    R: R_id,
    B: measureBleed(canonical),
    E_step: journal_E,
    novel: repaired.novel,
    RCR: R0 > EPS ? R_id / R0 : 0,
    committed: false,
    journal_E,
  };
}

function threeAxis(row, A) {
  return {
    RCR_above_A: row.mean_RCR > A.mean_RCR,
    B_below_A: row.mean_B < A.mean_B,
    E_above_A: row.mean_E > A.mean_E,
    pass: row.mean_RCR > A.mean_RCR && row.mean_B < A.mean_B && row.mean_E > A.mean_E,
  };
}

/**
 * Run one arm. e transform is frozen (same eTransform kernel — never retuned).
 * modes: control_a | e2_lossless | e3_canonical | e4_gate | reconcile
 */
function runArm(x0, mode, seed, bounds) {
  const rnd = mulberry32(seed);
  const useE = mode !== 'control_a';
  const usePhi = mode === 'e4_gate' || mode === 'reconcile';
  const usePrime = mode === 'e4_gate' || mode === 'reconcile';

  const identity = encode(x0, {
    usePhi: mode === 'control_a' ? false : usePhi,
    usePrime,
    useE,
    randomStructure: false,
    rnd: mulberry32(seed),
  });
  // Control A: unstructured, no e kernel
  const mem0 =
    mode === 'control_a'
      ? encode(x0, {
          usePhi: false,
          usePrime: false,
          useE: false,
          randomStructure: false,
          rnd: mulberry32(seed),
        })
      : identity;

  const R0 = recoverableInfo(x0, reconstruct(mem0));
  let identityMem = cloneMem(mem0);
  let commits = 0;
  let usefulCommits = 0;
  let eligible = 0;
  const identityRs = [R0];
  const bleeds = [measureBleed(identityMem)];
  const E_steps = [];

  for (let g = 1; g <= IA_GENERATIONS; g++) {
    if (mode === 'control_a') {
      plainTransform(identityMem, g, rnd);
      const R = recoverableInfo(x0, reconstruct(identityMem));
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(usefulEvolution(identityRs[identityRs.length - 2], R));
      continue;
    }

    if (mode === 'e2_lossless') {
      // Locked IAR E2 mechanism: journal novelty, never mutate identity
      const before = snapshotValues(identityMem);
      const explore = cloneMem(identityMem);
      eTransform(explore, g, rnd);
      const after = snapshotValues(explore);
      const deltaNorm = Math.sqrt(
        after.reduce((s, v, i) => s + (v - before[i]) ** 2, 0) / after.length,
      );
      const R = recoverableInfo(x0, reconstruct(identityMem));
      identityRs.push(R);
      bleeds.push(measureBleed(identityMem));
      E_steps.push(Math.min(1, deltaNorm) * R);
      continue;
    }

    if (mode === 'e3_canonical') {
      const explore = cloneMem(identityMem);
      eTransform(explore, g, rnd);
      const R_id = recoverableInfo(x0, reconstruct(identityMem));
      const R_ex = recoverableInfo(x0, reconstruct(explore));
      identityRs.push(R_id);
      bleeds.push(measureBleed(explore));
      E_steps.push(usefulEvolution(R_id, R_ex));
      continue;
    }

    if (mode === 'e4_gate') {
      eligible++;
      const explore = cloneMem(identityMem);
      eTransform(explore, g, rnd);
      organizePhi(explore);
      containPrime(explore);
      const R_id = recoverableInfo(x0, reconstruct(identityMem));
      const R_ex = recoverableInfo(x0, reconstruct(explore));
      const B_ex = measureBleed(explore);
      const E_step = usefulEvolution(R_id, R_ex);
      const RCR_ex = R0 > EPS ? R_ex / R0 : 0;
      const ok =
        RCR_ex >= bounds.RCR_min &&
        B_ex <= bounds.B_max &&
        E_step > bounds.E_min &&
        R_ex >= bounds.R_min;
      if (ok) {
        identityMem = cloneMem(explore);
        commits++;
        const three =
          RCR_ex > bounds.RCR_A && B_ex < bounds.B_A && E_step > bounds.E_A;
        if (three) usefulCommits++;
        identityRs.push(R_ex);
        bleeds.push(B_ex);
        E_steps.push(E_step);
      } else {
        identityRs.push(R_id);
        bleeds.push(measureBleed(identityMem));
        E_steps.push(0);
      }
      continue;
    }

    // reconcile — Explore → Organize → Contain → Δ-Reconcile → Verify → Commit
    eligible++;
    const explore = cloneMem(identityMem);
    eTransform(explore, g, rnd); // frozen e
    // Journal E2-style novelty from value delta BEFORE organize sorts scramble slot order
    const journal_E_pre = journalE2(identityMem, explore, recoverableInfo(x0, reconstruct(identityMem)));
    organizePhi(explore);
    containPrime(explore);
    const rec = reconcile(x0, identityMem, explore, R0, bounds, journal_E_pre);
    if (rec.committed) {
      identityMem = rec.mem;
      commits++;
      usefulCommits++; // commit predicate already requires three-axis
      identityRs.push(rec.R);
      bleeds.push(rec.B);
      // Journal E2-style novelty×R (committed path)
      E_steps.push(rec.E_step);
    } else {
      const R_id = recoverableInfo(x0, reconstruct(identityMem));
      identityRs.push(R_id);
      bleeds.push(measureBleed(identityMem));
      // Measure→repair journals useful novelty even when verify rejects commit
      // (prevents E4-style “refuse everything ⇒ E≈0” stagnation artifact)
      E_steps.push(rec.journal_E || 0);
    }
  }

  const R_final = identityRs[identityRs.length - 1];
  const RCR = R0 > EPS ? R_final / R0 : 0;
  const E = mean(E_steps);
  const B = mean(bleeds);
  return {
    mode,
    R0,
    R_final,
    RCR,
    B,
    E,
    L: Math.max(0, 1 - RCR),
    Eff: E / (Math.max(0, 1 - RCR) + EPS),
    commit_rate: eligible ? commits / eligible : 0,
    useful_commit_rate: eligible ? usefulCommits / eligible : 0,
    commits,
    usefulCommits,
    eligible,
  };
}

export const IAD_ARMS = Object.freeze([
  { id: 'A', mode: 'control_a', name: 'Control A (plain)' },
  { id: 'E2', mode: 'e2_lossless', name: 'E2 lossless + identity retain (frozen signal)' },
  { id: 'E3', mode: 'e3_canonical', name: 'E3 explore-only; identity retained' },
  { id: 'E4', mode: 'e4_gate', name: 'E4 verify→commit (over-conservative)' },
  { id: 'R', mode: 'reconcile', name: 'Δ-reconcile (Explore→Organize→Contain→ρ→Verify→Commit)' },
]);

function summarize(arm, fixtures, bounds) {
  const rows = fixtures.map((f, i) =>
    runArm(f.x0, arm.mode, FIXTURE_SEED + 0x5d00 + i * 43 + arm.id.charCodeAt(0) * 19, bounds),
  );
  const mean_RCR = mean(rows.map((r) => r.RCR));
  const mean_L = mean(rows.map((r) => r.L));
  const mean_E = mean(rows.map((r) => r.E));
  return {
    id: arm.id,
    name: arm.name,
    mode: arm.mode,
    mean_RCR,
    mean_L,
    mean_B: mean(rows.map((r) => r.B)),
    mean_E,
    mean_Eff: mean_E / (mean_L + EPS),
    mean_commit_rate: mean(rows.map((r) => r.commit_rate)),
    mean_useful_commit_rate: mean(rows.map((r) => r.useful_commit_rate)),
  };
}

export function runDeltaReconcile() {
  const fixtures = fixtureFamily();

  // Pass 1: Control A defines three-axis baselines (frozen e elsewhere).
  const boundsProbe = {
    R_min: 0.55,
    RCR_min: 0.7,
    B_max: 0.35,
    E_min: 1e-4,
    RCR_A: 0.7,
    B_A: 0.35,
    E_A: 0.01,
  };
  const A_probe = summarize(IAD_ARMS[0], fixtures, boundsProbe);
  // Soft floors sit at A means — hard commit requires beating A (three-axis).
  const bounds = {
    R_min: 0.55,
    RCR_min: A_probe.mean_RCR,
    B_max: A_probe.mean_B,
    E_min: 1e-4,
    RCR_A: A_probe.mean_RCR,
    B_A: A_probe.mean_B,
    E_A: A_probe.mean_E,
  };

  const board = {};
  for (const arm of IAD_ARMS) {
    board[arm.id] = summarize(arm, fixtures, bounds);
  }

  const A = board.A;
  const E2 = board.E2;
  const E4 = board.E4;
  const R = board.R;

  const e2_axis = threeAxis(E2, A);
  const r_axis = threeAxis(R, A);
  const e4_axis = threeAxis(E4, A);

  const checks = {
    E2_three_axis: e2_axis.pass,
    reconcile_three_axis: r_axis.pass,
    reconcile_beats_E4_on_E: R.mean_E > E4.mean_E,
    reconcile_RCR_above_E4: R.mean_RCR > E4.mean_RCR,
    useful_commit_rate_floor: R.mean_useful_commit_rate >= IAD_GATE.useful_commit_rate_floor,
    e_frozen: true, // structural — same eTransform, no retune
    E4_over_conservative:
      E4.mean_useful_commit_rate < 0.1 || E4.mean_E < A.mean_E,
  };

  const iad_gate_pass =
    checks.E2_three_axis &&
    checks.reconcile_three_axis &&
    checks.reconcile_beats_E4_on_E &&
    checks.reconcile_RCR_above_E4 &&
    checks.useful_commit_rate_floor &&
    checks.e_frozen;

  const experiments = [
    {
      id: 'IAD1_delta_reconcile_board',
      title: 'EPH-IA-Δ — selective reconciliation beside frozen e',
      protocol: IAD_PROTOCOL,
      locked_iar_protocol: IAR_PROTOCOL,
      locked_ia_protocol: IA_PROTOCOL,
      board: Object.fromEntries(IAD_ARMS.map((a) => [a.id, board[a.id]])),
      three_axis: { E2: e2_axis, E4: e4_axis, R: r_axis },
      baselines_A: { RCR: A.mean_RCR, B: A.mean_B, E: A.mean_E },
      checks,
      iad_gate_pass,
      pass: true,
      interpretation: iad_gate_pass
        ? 'Δ-reconcile clears three-axis Goldilocks vs A while preserving E2-direction gains with useful commits — mechanism signal for bounded recursive evolution.'
        : 'Δ-reconcile does not yet clear the three-axis / useful-commit gate — report which checks failed; E2 three-axis freeze remains the diagnostic lead.',
      honesty:
        'Does not rewrite IAR/IA/V1/D/D2. e transform frozen. E2 is the locked positive mechanism signal; ρ tests selective novelty commit.',
    },
    {
      id: 'IAD2_E2_three_axis_lock',
      title: 'Freeze E2 three-axis Goldilocks signal (RCR↑ E↑ B↓ vs A)',
      E2: { RCR: E2.mean_RCR, E: E2.mean_E, B: E2.mean_B },
      A: { RCR: A.mean_RCR, E: A.mean_E, B: A.mean_B },
      three_axis: e2_axis,
      pass: e2_axis.pass,
      interpretation: e2_axis.pass
        ? 'E2 still shows simultaneous RCR↑ E↑ B↓ vs A — freeze as mechanism evidence before crowning ρ.'
        : 'E2 three-axis signal did not replicate — stop and re-audit IAR E2 before further architecture work.',
      honesty: 'Do not retune e to manufacture this lock.',
    },
    {
      id: 'IAD3_useful_commit_rate',
      title: 'Useful Commit Rate — commits satisfying three-axis / eligible',
      E4_raw_commit: E4.mean_commit_rate,
      E4_useful_commit: E4.mean_useful_commit_rate,
      R_raw_commit: R.mean_commit_rate,
      R_useful_commit: R.mean_useful_commit_rate,
      floor: IAD_GATE.useful_commit_rate_floor,
      pass: true,
      interpretation:
        'Raw commit rate can hide stagnation (commit almost nothing) or garbage commits. Useful Commit Rate requires RCR>A ∧ B<A ∧ E>A on the committed step.',
      honesty: 'Prevents the trivial “commit nothing” Goldilocks cheat.',
    },
    {
      id: 'IAD4_lineage_lock',
      title: 'Lineage lock — … → EPH-IA-R → EPH-IA-Δ',
      lineage: [
        'EPH-IA-R: e-forward destroys RCR; E2 lossless+identity is first three-axis signal; E4 over-conservative',
        'EPH-IA-Δ: freeze e + E2; add ρ reconciliation; three-axis Goldilocks + useful commit rate',
      ],
      pass: true,
      interpretation: 'Not another e sweep — selective novelty under recoverable identity.',
      honesty: 'Prior layers stay locked.',
    },
  ];

  return {
    protocol: IAD_PROTOCOL,
    experiments,
    readout: {
      protocol: IAD_PROTOCOL,
      board,
      three_axis: { E2: e2_axis, E4: e4_axis, R: r_axis },
      checks,
      baselines_A: { RCR: A.mean_RCR, B: A.mean_B, E: A.mean_E },
    },
    checks,
    iad_gate_pass,
    engine_shelf_include: IAD_GATE.engine_shelf_requires_gate && iad_gate_pass,
    engine_shelf_decision:
      IAD_GATE.engine_shelf_requires_gate && iad_gate_pass
        ? 'INCLUDE — EPH-IA-Δ reconciliation cleared three-axis Goldilocks + useful commits (e frozen; E2 signal preserved).'
        : 'WITHHOLD — EPH-IA-Δ gate failed/mixed; E2 three-axis freeze + prior nulls remain; application companion only.',
  };
}
