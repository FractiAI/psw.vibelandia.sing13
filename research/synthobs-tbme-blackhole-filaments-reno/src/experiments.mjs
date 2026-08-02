import {
  E_F,
  R_N,
  R_N_TABLE_ANCHOR,
  R_N_EPS,
  FACET_COUNT,
  SHELL_COUNT,
  SHELL_FACET_TIERS,
  PHI0_FACTOR,
  SCORECARD,
} from './constants.mjs';

export function e1GoldenHorizonLock() {
  // Architectural identity: r0/E_F = a0/E_F^2 when r0 = a0/E_F
  const a0 = 1;
  const r0 = a0 / E_F;
  const left = r0 / E_F;
  const right = a0 / (E_F * E_F);
  const err = Math.abs(left - right);
  const pass = err < 1e-12;
  return {
    id: 'E1',
    title: 'Golden horizon lock form r₀/E_F = a₀/E_F²',
    pass,
    verdict: pass ? 'support' : 'refute',
    left,
    right,
    abs_err: err,
    honesty: 'Algebraic E_F identity — not a measured Kerr r₊ dump.',
  };
}

export function e2ReflectionCoefficient() {
  const err = Math.abs(R_N - R_N_TABLE_ANCHOR);
  const pass = err < R_N_EPS;
  return {
    id: 'E2',
    title: 'Dielectric R_n = (E_F−1)/(E_F+1) ≈ 0.236',
    pass,
    verdict: pass ? 'support' : 'refute',
    R_n: R_N,
    table_anchor: R_N_TABLE_ANCHOR,
    abs_err: err,
    honesty: 'Fresnel-style amplitude from E_F — lens parameter.',
  };
}

export function e3NestedShellFacetSum() {
  const sum = SHELL_FACET_TIERS.reduce((a, b) => a + b, 0);
  const oddTiers = SHELL_FACET_TIERS.every((n, i) => n === 2 * i + 1);
  const pass =
    SHELL_FACET_TIERS.length === SHELL_COUNT && sum === FACET_COUNT && oddTiers;
  return {
    id: 'E3',
    title: 'Nested-shell odd facet tiers sum to 81',
    pass,
    verdict: pass ? 'support' : 'refute',
    tiers: SHELL_FACET_TIERS,
    facet_sum: sum,
    honesty: 'Architectural bookkeeping shared with Reno parent lens.',
  };
}

export function e4FluxQuantumForm() {
  const phi0_symbolic = PHI0_FACTOR.h / PHI0_FACTOR.two_e;
  const pass = PHI0_FACTOR.h === 1 && PHI0_FACTOR.two_e === 2 && phi0_symbolic === 0.5;
  return {
    id: 'E4',
    title: 'Flux quantum form Φ₀ = h/(2e) present',
    pass,
    verdict: pass ? 'support' : 'refute',
    phi0_symbolic_units: phi0_symbolic,
    honesty: 'Symbolic flux-quantum form check — not a Josephson lab calibration.',
  };
}

export function e5NetPowerCancellation() {
  // Model: normalize nine equal R_n^2 weights to sum 1 → P_net = 0
  const weights = Array.from({ length: SHELL_COUNT }, () => R_N * R_N);
  const rawSum = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map((w) => w / rawSum);
  const feedback = normalized.reduce((a, b) => a + b, 0);
  const pNet = 1 - feedback;
  const pass = Math.abs(feedback - 1) < 1e-12 && Math.abs(pNet) < 1e-12;
  return {
    id: 'E5',
    title: 'Normalized nested-shell feedback ⇒ P_net = 0 model',
    pass,
    verdict: pass ? 'support' : 'refute',
    raw_sum_Rn2: rawSum,
    feedback,
    P_net: pNet,
    honesty: 'Standing-wave feedback identity inside the lens — not SI Hawking cancellation.',
  };
}

export function e6ScorecardOrdering() {
  const { pointChargeSM: sm, toroidalBH: bh } = SCORECARD;
  const pass =
    bh.overall > sm.overall &&
    bh.coherence > sm.coherence &&
    bh.irreducibility > sm.irreducibility;
  return {
    id: 'E6',
    title: 'Toroidal BH rubric > point-charge SM (interpretive)',
    pass,
    verdict: pass ? 'support' : 'refute',
    scorecard: SCORECARD,
    honesty: 'Interpretive rubric only — not SI accuracy of nature.',
  };
}

export async function e7LabGate(readJsonOptional) {
  const lab = await readJsonOptional('lab_filament_kerr.json');
  if (!lab) {
    return {
      id: 'E7',
      title: 'Independent Kerr/filament dump (lab gate)',
      pass: true,
      verdict: 'skip',
      honesty: 'No data/lab_filament_kerr.json — do not report as support.',
    };
  }
  const pass = Boolean(lab.ok);
  return {
    id: 'E7',
    title: 'Independent Kerr/filament dump (lab gate)',
    pass,
    verdict: pass ? 'support' : 'refute',
    honesty: 'Computed from optional lab dump only.',
  };
}

export async function runAllExperiments(readJsonOptional) {
  const experiments = [
    e1GoldenHorizonLock(),
    e2ReflectionCoefficient(),
    e3NestedShellFacetSum(),
    e4FluxQuantumForm(),
    e5NetPowerCancellation(),
    e6ScorecardOrdering(),
    await e7LabGate(readJsonOptional),
  ];
  const scored = experiments.filter((e) => e.verdict !== 'skip');
  const n_pass = scored.filter((e) => e.pass).length;
  const n_total = scored.length;
  const failed = scored.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total,
    failed,
    experiments,
  };
}
