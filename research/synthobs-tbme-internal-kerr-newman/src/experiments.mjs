/**
 * Universal Toroidal Singularity — deterministic suite.
 * Catalog / model arithmetic only — not SI force-taxonomy overthrow or clinical social proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  Z0,
  THETA_EGS_DEG,
  ANGLE_EPS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SEPARATED_FORCES,
  UNIFIED_ATTRACTION,
  ATTRACTION_SCALE_NS,
  ATTRACTION_LAYERS,
  DNA_RATIO,
  DNA_RATIO_TOL,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'E_F = Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Catalog harmonic key for internal Kerr–Newman scale layers.',
    honesty: 'Architectural constant — not a replacement for G, c, e, or ℏ.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = E_F * E_F;
  const rhs = E_F + 1;
  return {
    id: 'E2_ef_squared_identity',
    title: 'E_F² = E_F + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing scale ladders and phase-lock narratives.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentZ0() {
  return {
    id: 'E3_z0_horizon',
    title: 'Free-space Z₀ ≈ 377 Ω fixture',
    Z0,
    pass: Z0 > 370 && Z0 < 380,
    interpretation: 'Event-horizon skin impedance narrative anchor.',
    honesty: 'SI free-space impedance constant — not a measured horizon resistivity.',
  };
}

export function experimentThetaEgs() {
  const expected = 360 / (E_F * E_F);
  const table = 137.508;
  return {
    id: 'E4_theta_egs',
    title: 'θ_EGS = 360 / E_F² golden-angle seed',
    THETA_EGS_DEG,
    expected,
    abs_err_vs_table: Math.abs(THETA_EGS_DEG - table),
    pass:
      Math.abs(THETA_EGS_DEG - expected) < 1e-12 &&
      Math.abs(THETA_EGS_DEG - table) < ANGLE_EPS,
    interpretation: 'Phase seed for socio-cognitive / facet lock narrative.',
    honesty: 'Geometric angle — not a social-force measurement.',
  };
}

export function experimentScaleLadder() {
  const r0 = 1;
  const radii = ATTRACTION_SCALE_NS.map((n) => ({ n, r: r0 * E_F ** n }));
  let monotone = true;
  for (let i = 1; i < radii.length; i++) {
    if (!(radii[i].r > radii[i - 1].r)) monotone = false;
  }
  return {
    id: 'E5_scale_ladder',
    title: 'Attraction scale ladder E_F^n monotone for n ∈ {1,2,3,6,9}',
    radii,
    pass: monotone && radii.length === 5,
    interpretation: 'Layered r_n = r_0 · E_F^n for grav/mag/chem/social indices.',
    honesty: 'Catalog radii — not measured force ranges.',
  };
}

export function experimentDnaRatio() {
  const absErr = Math.abs(DNA_RATIO - E_F);
  return {
    id: 'E6_dna_ratio',
    title: 'DNA 34/21 ≈ E_F (chemical-layer companion)',
    DNA_RATIO,
    E_F,
    absErr,
    pass: absErr < DNA_RATIO_TOL,
    interpretation: 'Chemical / molecular layer geometric companion from Part IV.',
    honesty: 'Narrative ratio match — not a wet-lab DNA measurement in this suite.',
  };
}

export function experimentAttractionLayers() {
  const ns = new Set(ATTRACTION_LAYERS.map(([, n]) => n));
  return {
    id: 'E7_attraction_layers',
    title: 'Attraction-layer diagnostic map has four rows',
    n: ATTRACTION_LAYERS.length,
    layers: ATTRACTION_LAYERS,
    pass:
      ATTRACTION_LAYERS.length === 4 &&
      ATTRACTION_LAYERS.every((r) => r.length === 2 && typeof r[1] === 'number') &&
      ns.has(2) &&
      ns.has(3) &&
      ns.has(6) &&
      ns.has(9),
    interpretation: 'Catalog completeness for grav / mag / chem / social layers.',
    honesty: 'Structural table — not multi-force empirical unification.',
  };
}

export function experimentPaperOnDisk() {
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const mirror = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const monoOk = fs.existsSync(mono);
  const mirrorOk = fs.existsSync(mirror);
  let hasDocId = false;
  let hasHonesty = false;
  let hasTbme = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
  }
  return {
    id: 'E8_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME disclaimer',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasTbme,
    interpretation: 'Catalog fidelity for Omni-Lattice appendix sync.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentScorecardOrder() {
  const sepOverall = (SEPARATED_FORCES.coherence + SEPARATED_FORCES.irreducibility) / 2;
  const uniOverall = (UNIFIED_ATTRACTION.coherence + UNIFIED_ATTRACTION.irreducibility) / 2;
  return {
    id: 'E9_scorecard_order',
    title: 'Unified-attraction rubric overall > Separated-forces overall',
    sepOverall,
    uniOverall,
    fixtures: { SEPARATED_FORCES, UNIFIED_ATTRACTION },
    pass:
      Math.abs(sepOverall - SEPARATED_FORCES.overall) < 1e-9 &&
      Math.abs(uniOverall - UNIFIED_ATTRACTION.overall) < 1e-9 &&
      uniOverall > sepOverall,
    interpretation: 'Interpretive scorecard ordering for Part VI lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentThetaEgs(),
    experimentScaleLadder(),
    experimentDnaRatio(),
    experimentAttractionLayers(),
    experimentPaperOnDisk(),
    experimentScorecardOrder(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
