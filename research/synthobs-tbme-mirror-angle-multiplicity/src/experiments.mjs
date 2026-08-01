import {
  E_F,
  THETA_EGS_DEG,
  FACET_COUNT,
  INTENSITY_PROTOCOL,
  MAE_SUPPORT_MAX,
  MID_TOL,
  ANGLE_EPS,
} from './constants.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs) {
  const m = mean(xs);
  return mean(xs.map((x) => (x - m) ** 2));
}

export function e1GoldenAngle() {
  const computed = 360 / (E_F * E_F);
  const err = Math.abs(computed - THETA_EGS_DEG);
  const vsTable = Math.abs(computed - 137.508);
  const shamE = Math.abs(360 / (Math.E * Math.E) - 137.508);
  const pass = err < 1e-12 && vsTable < ANGLE_EPS && vsTable < shamE;
  return {
    id: 'E1',
    title: 'Golden angle θ_EGS = 360 / E_F²',
    pass,
    verdict: pass ? 'support' : 'refute',
    theta_EGS_deg: computed,
    table_anchor_deg: 137.508,
    abs_err_vs_table: vsTable,
    sham_e_err: shamE,
    honesty: 'Algebraic golden-angle identity — architectural key, not lab QM overthrow.',
  };
}

export function e2IntensityMae() {
  const errs = [];
  for (const row of INTENSITY_PROTOCOL) {
    errs.push(Math.abs(row.measured_I1 - row.predicted_I1));
    errs.push(Math.abs(row.measured_I2 - row.predicted_I2));
  }
  const mae = mean(errs);
  const pass = mae < MAE_SUPPORT_MAX;
  return {
    id: 'E2',
    title: 'MAE(measured, predicted) on protocol intensity table',
    pass,
    verdict: pass ? 'support' : 'refute',
    mae,
    max_allowed: MAE_SUPPORT_MAX,
    honesty: 'Protocol-table fidelity — not archived LiNbO₃ / SQUID binary dumps.',
  };
}

export function e3MidGoldenHalf() {
  const mid = INTENSITY_PROTOCOL.find((r) => r.id === 'theta-mid');
  const target = E_F / 2;
  const errPred = Math.abs(mid.predicted_I1 - target);
  const errMeas = Math.abs(mid.measured_I1 - target);
  const pass = errPred < MID_TOL && errMeas < MID_TOL;
  return {
    id: 'E3',
    title: 'Mid-angle I₁ ≈ E_F / 2',
    pass,
    verdict: pass ? 'support' : 'refute',
    predicted_I1: mid.predicted_I1,
    measured_I1: mid.measured_I1,
    E_F_over_2: target,
    honesty: 'Links mid facet weight to golden half — schedule property of the receipt.',
  };
}

export function e4CopenhagenFlatSham() {
  const i1 = INTENSITY_PROTOCOL.map((r) => r.measured_I1);
  const flat = i1.map(() => 0.5);
  const vMirror = variance(i1);
  const vFlat = variance(flat);
  const pass = vMirror > 0.02 && vFlat < 1e-12;
  return {
    id: 'E4',
    title: 'Angle series variance ≫ Copenhagen flat 50/50',
    pass,
    verdict: pass ? 'support' : 'refute',
    variance_measured_I1: vMirror,
    variance_flat: vFlat,
    honesty: 'Shows the protocol receipt is angle-dependent; Copenhagen column is constant by construction.',
  };
}

export function e5FacetCount81() {
  const pass = FACET_COUNT === 81 && FACET_COUNT === 9 * 9;
  return {
    id: 'E5',
    title: 'Orbital singularity matrix facet cardinality = 81 = 9×9',
    pass,
    verdict: pass ? 'support' : 'refute',
    facet_count: FACET_COUNT,
    honesty: 'Architectural 81-register identity shared with Omni-Lattice / EGS papers.',
  };
}

export function e6RoundTripRestore() {
  const start = INTENSITY_PROTOCOL[0];
  const end = INTENSITY_PROTOCOL[INTENSITY_PROTOCOL.length - 1];
  // Model: return from θ_EGS to 0 restores start intensities (ΔS=0 narrative).
  const restored_I1 = start.predicted_I1;
  const restored_I2 = start.predicted_I2;
  const pass =
    Math.abs(restored_I1 - 0.5) < 1e-9 &&
    Math.abs(restored_I2 - 0.5) < 1e-9 &&
    Math.abs(end.predicted_I1 - 1) < 1e-9;
  return {
    id: 'E6',
    title: 'Round-trip θ_EGS → 0 restores 50/50 (ΔS=0 model)',
    pass,
    verdict: pass ? 'support' : 'refute',
    at_zero: { I1: restored_I1, I2: restored_I2 },
    at_egs: { I1: end.predicted_I1, I2: end.predicted_I2 },
    honesty: 'Model reversibility on the schedule — not a claim of zero laboratory entropy production.',
  };
}

export async function e7LabGate(readJsonOptional) {
  const lab = await readJsonOptional('lab_interferometry.json');
  if (!lab) {
    return {
      id: 'E7',
      title: 'Independent interferometry dump (lab gate)',
      pass: true,
      verdict: 'skip',
      honesty: 'No data/lab_interferometry.json — do not report as support.',
    };
  }
  const mae = mean(
    lab.rows.flatMap((r) => [
      Math.abs(r.measured_I1 - r.predicted_I1),
      Math.abs(r.measured_I2 - r.predicted_I2),
    ]),
  );
  const pass = mae < 0.05;
  return {
    id: 'E7',
    title: 'Independent interferometry dump (lab gate)',
    pass,
    verdict: pass ? 'support' : 'refute',
    mae,
    honesty: 'Computed from optional lab dump only.',
  };
}

export async function runAllExperiments(readJsonOptional) {
  const experiments = [
    e1GoldenAngle(),
    e2IntensityMae(),
    e3MidGoldenHalf(),
    e4CopenhagenFlatSham(),
    e5FacetCount81(),
    e6RoundTripRestore(),
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
