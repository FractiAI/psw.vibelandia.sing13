/**
 * Thermal Meissner Omni-Lattice lens — deterministic catalog fixtures.
 * Not SI BCS overthrow or wet-lab λ_L calibration.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PUBLICATION_REF,
  NORMAL_STATE,
  SC_STATE,
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
    interpretation: 'Golden key for Omni-Lattice scale ladders in this exploration.',
    honesty: 'Architectural constant — not a Meissner critical exponent.',
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
    interpretation: 'Golden-key identity.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentPhaseSwitchTable() {
  const ok =
    NORMAL_STATE.resistance === 'R>0' &&
    SC_STATE.resistance === 'R=0' &&
    NORMAL_STATE.bulkB === 'threaded' &&
    SC_STATE.bulkB === 'expelled';
  return {
    id: 'E3_phase_switch_table',
    title: 'Normal vs SC catalog metric polarity',
    NORMAL_STATE,
    SC_STATE,
    pass: ok,
    interpretation: 'Table integrity for thermal phase-switch narrative.',
    honesty: 'Idealized textbook polarity — not sample-specific Tc data.',
  };
}

export function experimentPublicationRef() {
  return {
    id: 'E4_publication_ref',
    title: 'Publication ref FAI-EGSC-2026-08',
    PUBLICATION_REF,
    pass: PUBLICATION_REF === 'FAI-EGSC-2026-08',
    interpretation: 'Stable publication handle for catalog.',
    honesty: 'Bibliographic fixture.',
  };
}

export function experimentPaperOnDisk() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const exists = fs.existsSync(local) || fs.existsSync(mono);
  return {
    id: 'E5_paper_on_disk',
    title: 'Canonical paper present',
    local,
    mono,
    pass: exists,
    interpretation: 'Suite linked to published docs/.',
    honesty: 'Filesystem fidelity check.',
  };
}

export function experimentNotCoreClaim() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p = fs.existsSync(local) ? local : mono;
  const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  const pass =
    /not Omni-Lattice Core/i.test(text) &&
    /catalog exploration only/i.test(text) &&
    !/Omni-Lattice Core Whitepaper Series — Part/i.test(text);
  return {
    id: 'E6_not_core_part',
    title: 'Explicit non-Core catalog status',
    pass,
    interpretation: 'Exploration lens — excluded from Core / Engine allowlist by design.',
    honesty: 'Governance fixture for NSPFRNP catalog fidelity.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentPhaseSwitchTable(),
    experimentPublicationRef(),
    experimentPaperOnDisk(),
    experimentNotCoreClaim(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
