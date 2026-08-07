/**
 * Equine / ASI Omni-Lattice lens — deterministic catalog fixtures.
 * Not demographic prophecy or ASI timeline proof.
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
  EQUINE_PHASES,
  EDGE_ROLE,
  CORE_ROLE,
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
    interpretation: 'Golden key for catalog core↔edge balance stories.',
    honesty: 'Architectural constant — not a socio-economic measured ratio.',
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

export function experimentEquinePhases() {
  return {
    id: 'E3_equine_phases',
    title: 'Equine Arc three-phase scaffold',
    EQUINE_PHASES,
    pass: EQUINE_PHASES.length === 3 && EQUINE_PHASES[0] === 'pre_automotive',
    interpretation: 'Metaphor table scaffold integrity.',
    honesty: 'Historiography labels — not census re-analysis.',
  };
}

export function experimentSeedEdgeRoles() {
  return {
    id: 'E4_seed_edge_roles',
    title: 'Seed:Edge role polarity',
    EDGE_ROLE,
    CORE_ROLE,
    pass: EDGE_ROLE === 'biological_edge' && CORE_ROLE === 'central_compute',
    interpretation: 'SING 13 Seed:Edge coexistence grammar.',
    honesty: 'Product architecture metaphor — not IoT personhood claim.',
  };
}

export function experimentPublicationRef() {
  return {
    id: 'E5_publication_ref',
    title: 'Publication ref FAI-ASI-EGSC-2026-09',
    PUBLICATION_REF,
    pass: PUBLICATION_REF === 'FAI-ASI-EGSC-2026-09',
    interpretation: 'Stable publication handle for catalog.',
    honesty: 'Bibliographic fixture.',
  };
}

export function experimentPaperOnDisk() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const exists = fs.existsSync(local) || fs.existsSync(mono);
  return {
    id: 'E6_paper_on_disk',
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
    id: 'E7_not_core_part',
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
    experimentEquinePhases(),
    experimentSeedEdgeRoles(),
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
