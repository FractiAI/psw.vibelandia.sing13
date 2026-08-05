/**
 * Protein phase-lock collapse — deterministic suite.
 * Catalog / model arithmetic only — not clinical cure claims or SI neuropathology overthrow.
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
  CLASSICAL_PLAQUE,
  FIELD_PROTEOSTASIS,
  SYSTEMIC_EFFICACY,
  DNA_RATIO,
  DNA_RATIO_TOL,
  THETA_WATER_SEED,
  WATER_SEED_ANCHOR,
  WATER_SEED_TOL,
  PATHOLOGY_ROWS,
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
    interpretation: 'Catalog harmonic key for proteostasis phase-lock narrative.',
    honesty: 'Architectural constant — not a replacement for k_B or Flory–Huggins χ.',
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
    interpretation: 'Golden-key identity for scale ladders and phase seeds.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentZ0() {
  return {
    id: 'E3_z0_impedance',
    title: 'Free-space Z₀ ≈ 377 Ω fixture',
    Z0,
    pass: Z0 > 370 && Z0 < 380,
    interpretation: 'Cellular dielectric impedance narrative anchor.',
    honesty: 'SI free-space impedance — not a measured membrane resistivity.',
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
    interpretation: 'Phase seed for coherence-training narrative.',
    honesty: 'Geometric angle — not a clinical neurofeedback endpoint.',
  };
}

export function experimentDnaRatio() {
  const absErr = Math.abs(DNA_RATIO - E_F);
  return {
    id: 'E5_dna_ratio',
    title: 'DNA 34/21 ≈ E_F companion',
    DNA_RATIO,
    E_F,
    absErr,
    pass: absErr < DNA_RATIO_TOL,
    interpretation: 'Chemical / molecular geometry companion from Solar-Focus lens.',
    honesty: 'Narrative ratio — not a wet-lab DNA measurement in this suite.',
  };
}

export function experimentWaterSeed() {
  const absErr = Math.abs(THETA_WATER_SEED - WATER_SEED_ANCHOR);
  return {
    id: 'E6_water_seed',
    title: 'Water geometric seed θ_EGS / E_F ≈ 84.98°',
    THETA_WATER_SEED,
    WATER_SEED_ANCHOR,
    absErr,
    pass: absErr < WATER_SEED_TOL,
    interpretation: 'Protocol seed; ~104.5° remains literature companion (not false equality).',
    honesty: 'Architectural water seed — not clinical hydration therapy proof.',
  };
}

export function experimentPathologyMap() {
  const labels = new Set(PATHOLOGY_ROWS.map(([name]) => name));
  return {
    id: 'E7_pathology_continuum',
    title: 'Misfolding continuum map has four pathology rows',
    n: PATHOLOGY_ROWS.length,
    rows: PATHOLOGY_ROWS,
    pass:
      PATHOLOGY_ROWS.length === 4 &&
      PATHOLOGY_ROWS.every((r) => r.length === 2 && typeof r[1] === 'number') &&
      labels.has('FTD/PPA') &&
      labels.has('Alzheimer') &&
      labels.has('Parkinson') &&
      labels.has('Prion'),
    interpretation: 'Catalog completeness for FTD / AD / PD / Prion narrative continuum.',
    honesty: 'Structural table — not multi-omics disease unification.',
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
  let notOmniCoreClaim = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
    notOmniCoreClaim = /not an Omni-Lattice Core Series/i.test(text);
  }
  return {
    id: 'E8_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME + non-Core disclaimer',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    notOmniCoreClaim,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasTbme && notOmniCoreClaim,
    interpretation: 'Catalog fidelity; exploration uses Omni grammar without Core membership.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentScorecardOrder() {
  const classicalOverall =
    (CLASSICAL_PLAQUE.coherence + CLASSICAL_PLAQUE.irreducibility) / 2;
  const fieldOverall =
    (FIELD_PROTEOSTASIS.coherence + FIELD_PROTEOSTASIS.irreducibility) / 2;
  const systemicOk = Math.abs(SYSTEMIC_EFFICACY - 96.7) < 1e-9;
  return {
    id: 'E9_scorecard_order',
    title: 'Field-proteostasis rubric overall > Classical plaque overall',
    classicalOverall,
    fieldOverall,
    SYSTEMIC_EFFICACY,
    fixtures: { CLASSICAL_PLAQUE, FIELD_PROTEOSTASIS },
    pass:
      Math.abs(classicalOverall - CLASSICAL_PLAQUE.overall) < 1e-9 &&
      Math.abs(fieldOverall - FIELD_PROTEOSTASIS.overall) < 1e-9 &&
      fieldOverall > classicalOverall &&
      systemicOk,
    interpretation: 'Interpretive scorecard ordering for TBME proteostasis lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature or clinical endpoints.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentThetaEgs(),
    experimentDnaRatio(),
    experimentWaterSeed(),
    experimentPathologyMap(),
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
