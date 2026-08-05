import {
  E_F,
  THETA_EGS_DEG,
  R_N,
  R_N_TABLE_ANCHOR,
  R_N_EPS,
  ANGLE_EPS,
  THETA_WATER_SEED,
  WATER_SEED_ANCHOR,
  WATER_SEED_TOL,
  WATER_LIT_BAND,
  DNA_RATIO,
  DNA_RATIO_TOL,
  SCORECARD,
  PARENT_DOC_ID,
  RENO_DOC_ID,
  DOC_ID,
} from './constants.mjs';

export function e1GoldenAngle() {
  const computed = 360 / (E_F * E_F);
  const vsTable = Math.abs(computed - 137.508);
  const pass = Math.abs(computed - THETA_EGS_DEG) < 1e-12 && vsTable < ANGLE_EPS;
  return {
    id: 'E1',
    title: 'Golden angle θ_EGS = 360 / E_F²',
    pass,
    verdict: pass ? 'support' : 'refute',
    theta_EGS_deg: computed,
    abs_err_vs_table: vsTable,
    honesty: 'Algebraic golden-angle identity — architectural key.',
  };
}

export function e2WaterSeed() {
  const err = Math.abs(THETA_WATER_SEED - WATER_SEED_ANCHOR);
  const pass = err < WATER_SEED_TOL;
  return {
    id: 'E2',
    title: 'Water geometric seed θ_EGS / E_F ≈ 84.98°',
    pass,
    verdict: pass ? 'support' : 'refute',
    seed_deg: THETA_WATER_SEED,
    anchor_deg: WATER_SEED_ANCHOR,
    abs_err: err,
    literature_water_band_deg: WATER_LIT_BAND,
    honesty:
      'Seed identity only. Literature ~104.5° band is a companion anchor — not claimed as θ_seed·E_F/2 equality.',
  };
}

export function e3DnaPitchRatio() {
  const err = Math.abs(DNA_RATIO - E_F);
  const pass = err < DNA_RATIO_TOL;
  return {
    id: 'E3',
    title: 'DNA turn/diameter 34/21 ≈ E_F',
    pass,
    verdict: pass ? 'support' : 'refute',
    ratio: DNA_RATIO,
    E_F,
    abs_err: err,
    honesty: 'B-DNA pitch narrative identity — not a claim DNA was rendered in this suite.',
  };
}

export function e4ReflectionCoefficient() {
  const err = Math.abs(R_N - R_N_TABLE_ANCHOR);
  const pass = err < R_N_EPS;
  return {
    id: 'E4',
    title: 'R_n = (E_F−1)/(E_F+1) ≈ 0.236',
    pass,
    verdict: pass ? 'support' : 'refute',
    R_n: R_N,
    abs_err: err,
    honesty: 'Fresnel-style amplitude from E_F — lens parameter.',
  };
}

export function e5ScorecardOrdering() {
  const { randomCollision: r, solarFocus: s } = SCORECARD;
  const pass =
    s.overall > r.overall && s.coherence > r.coherence && s.irreducibility > r.irreducibility;
  return {
    id: 'E5',
    title: 'Solar-focus rubric > random-collision (interpretive)',
    pass,
    verdict: pass ? 'support' : 'refute',
    scorecard: SCORECARD,
    honesty: 'Interpretive rubric only — not SI accuracy of nature.',
  };
}

export function e6ParentChain() {
  const pass =
    PARENT_DOC_ID.includes('MAGNETIC-LAYER') &&
    RENO_DOC_ID.includes('SUPERPOSITION-RENO') &&
    DOC_ID.includes('SOLAR-FOCUS');
  return {
    id: 'E6',
    title: 'Reno sextet DOC ID chain present',
    pass,
    verdict: pass ? 'support' : 'refute',
    parent: PARENT_DOC_ID,
    reno: RENO_DOC_ID,
    honesty: 'Catalog lineage check.',
  };
}

export async function e7LabGate(readJsonOptional) {
  const lab = await readJsonOptional('lab_solar_focus.json');
  if (!lab) {
    return {
      id: 'E7',
      title: 'Independent solar-focus dump (lab gate)',
      pass: true,
      verdict: 'skip',
      honesty: 'No data/lab_solar_focus.json — do not report as support.',
    };
  }
  return {
    id: 'E7',
    title: 'Independent solar-focus dump (lab gate)',
    pass: Boolean(lab.ok),
    verdict: lab.ok ? 'support' : 'refute',
    honesty: 'Computed from optional lab dump only.',
  };
}

export async function runAllExperiments(readJsonOptional) {
  const experiments = [
    e1GoldenAngle(),
    e2WaterSeed(),
    e3DnaPitchRatio(),
    e4ReflectionCoefficient(),
    e5ScorecardOrdering(),
    e6ParentChain(),
    await e7LabGate(readJsonOptional),
  ];
  const scored = experiments.filter((e) => e.verdict !== 'skip');
  const failed = scored.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: scored.filter((e) => e.pass).length,
    n_total: scored.length,
    failed,
    experiments,
  };
}
