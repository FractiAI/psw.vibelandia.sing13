/**
 * Recursive Field-Drag — deterministic suite.
 * Catalog / model arithmetic only — not SI Lenz overthrow or clinical Now proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  MU_0,
  Z0,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  CLASSICAL,
  FIELD_DRAG,
  EPISTEMIC_ROWS,
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
    interpretation: 'Catalog harmonic key for field-drag phase contrast.',
    honesty: 'Architectural constant — not a replacement for μ₀.',
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
    interpretation: 'Golden-key identity used in terminal-velocity lock narrative.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentZ0() {
  return {
    id: 'E3_z0_horizon',
    title: 'Free-space Z₀ ≈ 377 Ω fixture',
    Z0,
    pass: Z0 > 370 && Z0 < 380,
    interpretation: 'Conductive horizon impedance narrative anchor.',
    honesty: 'SI free-space impedance constant — not a pipe resistivity measurement.',
  };
}

export function experimentLenzDenominator() {
  const sigma = 5.96e7;
  const B0 = 0.5;
  const ell = 0.02;
  const den = sigma * B0 * B0 * ell * ell;
  return {
    id: 'E4_lenz_denominator',
    title: 'Classical Lenz factor denominator σ B₀² ℓ² finite & positive',
    den,
    pass: Number.isFinite(den) && den > 0,
    interpretation: 'Model shares classical structure; E_F² scales it (E5).',
    honesty: 'Toy numbers — not a lab calibration.',
  };
}

export function experimentTerminalScale() {
  const m = 0.05;
  const g = 9.81;
  const sigma = 5.96e7;
  const B0 = 0.5;
  const ell = 0.02;
  const classical = (m * g) / (sigma * B0 * B0 * ell * ell);
  const lattice = classical / (E_F * E_F);
  return {
    id: 'E5_terminal_ef2_scale',
    title: 'v_terminal model scales classical by 1/E_F²',
    classical,
    lattice,
    ratio: classical / lattice,
    pass:
      Number.isFinite(lattice) &&
      lattice > 0 &&
      lattice < classical &&
      Math.abs(classical / lattice - E_F * E_F) < 1e-9,
    interpretation: 'Part V invariant arithmetic on the design equation.',
    honesty: 'Closed-form model — not measured magnet-pipe terminal speed.',
  };
}

export function experimentAsqueezedEnergy() {
  const A = 1.2e-3;
  const u = (A * A) / (2 * MU_0);
  return {
    id: 'E6_asqueezed_energy_density',
    title: '‖A‖²/(2μ₀) energy-density form positive',
    A,
    u,
    MU_0,
    pass: u > 0 && Number.isFinite(u),
    interpretation: 'Brake-force narrative uses magnetic energy density gradient.',
    honesty: 'Algebraic positivity — not a force measurement.',
  };
}

export function experimentEpistemicMap() {
  return {
    id: 'E7_epistemic_map_rows',
    title: 'Epistemic twin table has five rows',
    n: EPISTEMIC_ROWS.length,
    rows: EPISTEMIC_ROWS,
    pass: EPISTEMIC_ROWS.length === 5 && EPISTEMIC_ROWS.every((r) => r.length === 2),
    interpretation: 'Catalog completeness for Now ↔ field-drag map.',
    honesty: 'Structural table — not clinical evidence.',
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
  const classicalOverall = (CLASSICAL.coherence + CLASSICAL.irreducibility) / 2;
  const dragOverall = (FIELD_DRAG.coherence + FIELD_DRAG.irreducibility) / 2;
  return {
    id: 'E9_scorecard_order',
    title: 'Field-Drag rubric overall > Classical overall',
    classicalOverall,
    dragOverall,
    fixtures: { CLASSICAL, FIELD_DRAG },
    pass:
      Math.abs(classicalOverall - CLASSICAL.overall) < 1e-9 &&
      Math.abs(dragOverall - FIELD_DRAG.overall) < 1e-9 &&
      dragOverall > classicalOverall,
    interpretation: 'Interpretive scorecard ordering for Part V lens.',
    honesty: 'Rubric arithmetic — not SI accuracy of nature.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentZ0(),
    experimentLenzDenominator(),
    experimentTerminalScale(),
    experimentAsqueezedEnergy(),
    experimentEpistemicMap(),
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
