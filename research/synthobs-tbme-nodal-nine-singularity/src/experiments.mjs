/**
 * Nodal Nine Singularity — deterministic suite.
 * Catalog / model arithmetic + digit fixtures — not SI digit-randomness overthrow.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  Z0,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  EF_FRAC_DIGITS,
  SEPARATED_DIGITS,
  NODAL_NINE,
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
    interpretation: 'Catalog harmonic key for nodal-nine boundary map.',
    honesty: 'Architectural constant — not a replacement for ℏ, c, or CODATA.',
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
    interpretation: 'Horizon skin impedance narrative for Ĥ₉ poetry.',
    honesty: 'SI free-space impedance — not digit-measured resistivity.',
  };
}

export function experimentMod9() {
  return {
    id: 'E4_mod9_boundary',
    title: '9 ≡ 0 (mod 9) digital-root boundary arithmetic',
    rem: 9 % 9,
    pass: 9 % 9 === 0,
    interpretation: 'Digit 9 as modular completion / transparent boundary poetry.',
    honesty: 'Modular arithmetic — not a physical horizon measurement.',
  };
}

export function experimentEightyOneSquare() {
  return {
    id: 'E5_81_equals_9sq',
    title: '81 = 9 × 9 facet-matrix square',
    pass: 9 * 9 === 81,
    interpretation: 'Anchors the 81-facet spherical dielectric mirror register.',
    honesty: 'Integer identity — catalog key for THALIA / Reno optics.',
  };
}

export function experimentDigit81IsNine() {
  const d81 = EF_FRAC_DIGITS[80];
  return {
    id: 'E6_digit_81_is_nine',
    title: 'E_F fractional digit 81 = 9',
    d81,
    pass: d81 === '9' && EF_FRAC_DIGITS.length >= 81,
    interpretation: 'Major singularity / 9×9 completion fixture.',
    honesty: 'Digit fixture from standard Φ expansion — not lab Z₀ events.',
  };
}

export function experimentNinePlacementMap() {
  const positions = [];
  for (let i = 0; i < EF_FRAC_DIGITS.length; i++) {
    if (EF_FRAC_DIGITS[i] === '9') positions.push(i + 1);
  }
  const firstNine = positions[0];
  const has81 = positions.includes(81);
  return {
    id: 'E7_nine_placement_map',
    title: 'First 9 at position 7; digit 81 is a nine-node',
    firstNine,
    has81,
    ninesBefore81: positions.filter((p) => p < 81).length,
    positionsSample: positions.slice(0, 8),
    pass: firstNine === 7 && has81 && positions.filter((p) => p < 81).length >= 1,
    interpretation: 'Corrects draft “10th digit” indexing; locks early + 81 nodes.',
    honesty: 'Placement map on fixed digit string — not SI non-randomness proof.',
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
  let hasPartIx = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasTbme = /Category scope & disclaimer \(TBME\)/i.test(text);
    hasPartIx = /Part IX/i.test(text);
  }
  return {
    id: 'E8_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + TBME + Part IX',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasTbme,
    hasPartIx,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasTbme && hasPartIx,
    interpretation: 'Catalog fidelity for Omni-Lattice appendix sync.',
    honesty: 'Filesystem receipt.',
  };
}

export function experimentScorecardOrder() {
  const sepOverall = (SEPARATED_DIGITS.coherence + SEPARATED_DIGITS.irreducibility) / 2;
  const uniOverall = (NODAL_NINE.coherence + NODAL_NINE.irreducibility) / 2;
  return {
    id: 'E9_scorecard_order',
    title: 'Nodal-Nine rubric overall > Separated overall',
    sepOverall,
    uniOverall,
    fixtures: { SEPARATED_DIGITS, NODAL_NINE },
    pass:
      Math.abs(sepOverall - SEPARATED_DIGITS.overall) < 1e-9 &&
      Math.abs(uniOverall - NODAL_NINE.overall) < 1e-9 &&
      uniOverall > sepOverall,
    interpretation: 'Interpretive scorecard ordering for Part IX lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentMod9(),
    experimentEightyOneSquare(),
    experimentDigit81IsNine(),
    experimentNinePlacementMap(),
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
