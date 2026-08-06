/**
 * Spin-Phase-Polarity Triad — deterministic suite.
 * Catalog / model arithmetic only — not SI Lie-group identity or clinical proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  Z0,
  PI,
  HALF_PI,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SEPARATED_GROUPS,
  TRIAD_UNIFIED,
  DIMENSIONAL_MAP,
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
    interpretation: 'Catalog harmonic key for triadic dimensional routing.',
    honesty: 'Architectural constant — not a replacement for ℏ, e, or c.',
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
    interpretation: 'Golden-key identity closing scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentZ0() {
  return {
    id: 'E3_z0_horizon',
    title: 'Free-space Z₀ ≈ 377 Ω fixture',
    Z0,
    pass: Z0 > 370 && Z0 < 380,
    interpretation: 'Boundary impedance narrative for triad routing.',
    honesty: 'SI free-space impedance — not measured triad resistivity.',
  };
}

export function experimentPolarityFlip() {
  const P = 1;
  const flipped = -P;
  return {
    id: 'E4_polarity_flip',
    title: 'Polarity flip P → −P (Z₂ fixture)',
    P,
    flipped,
    pass: flipped === -1 && flipped === -P,
    interpretation: '1D binary orientation catalog step.',
    honesty: 'Z₂ arithmetic — not a lab magnet measurement.',
  };
}

export function experimentPhaseQuarterTurn() {
  const phi0 = 0;
  const phi1 = (phi0 + HALF_PI) % (2 * PI);
  return {
    id: 'E5_phase_quarter_turn',
    title: 'Phase step φ → φ + π/2 (U(1) quarter-turn)',
    phi0,
    phi1,
    pass: Math.abs(phi1 - HALF_PI) < 1e-15,
    interpretation: '2D prime routing step for triad grammar.',
    honesty: 'Angle arithmetic — not optical interferometry.',
  };
}

export function experimentDimensionalMap() {
  const groups = new Set(DIMENSIONAL_MAP.map(([, , g]) => g));
  return {
    id: 'E6_dimensional_map',
    title: 'Dimensional map has 4 rows (1D–N)',
    n: DIMENSIONAL_MAP.length,
    rows: DIMENSIONAL_MAP,
    pass:
      DIMENSIONAL_MAP.length === 4 &&
      groups.has('Z2') &&
      groups.has('U1') &&
      groups.has('SU2') &&
      groups.has('Clifford'),
    interpretation: 'Catalog completeness for polarity / phase / spin / lattice.',
    honesty: 'Structural table — not Lie-group isomorphism proof.',
  };
}

export function experimentPiEquivalence() {
  const P = 1;
  const afterPi = -P;
  const phi0 = 0;
  const phiAfterPi = (phi0 + PI) % (2 * PI);
  const polarityMatches180 = afterPi === -1;
  const phaseIsPi = Math.abs(phiAfterPi - PI) < 1e-15;
  return {
    id: 'E7_pi_polarity_phase',
    title: 'π phase shift coincides with polarity flip (catalog)',
    afterPi,
    phiAfterPi,
    pass: polarityMatches180 && phaseIsPi,
    interpretation: '180° functional twin of P → −P inside the lens.',
    honesty: 'Catalog equivalence — not SI identity of domains.',
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
  let hasPartViii = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
    hasPartViii = /Part VIII/i.test(text);
  }
  return {
    id: 'E8_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME + Part VIII',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    hasPartViii,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasTbme && hasPartViii,
    interpretation: 'Catalog fidelity for Omni-Lattice appendix sync.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentScorecardOrder() {
  const sepOverall = (SEPARATED_GROUPS.coherence + SEPARATED_GROUPS.irreducibility) / 2;
  const uniOverall = (TRIAD_UNIFIED.coherence + TRIAD_UNIFIED.irreducibility) / 2;
  return {
    id: 'E9_scorecard_order',
    title: 'Triad rubric overall > Separated-groups overall',
    sepOverall,
    uniOverall,
    fixtures: { SEPARATED_GROUPS, TRIAD_UNIFIED },
    pass:
      Math.abs(sepOverall - SEPARATED_GROUPS.overall) < 1e-9 &&
      Math.abs(uniOverall - TRIAD_UNIFIED.overall) < 1e-9 &&
      uniOverall > sepOverall,
    interpretation: 'Interpretive scorecard ordering for Part VIII lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentPolarityFlip(),
    experimentPhaseQuarterTurn(),
    experimentDimensionalMap(),
    experimentPiEquivalence(),
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
