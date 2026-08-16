/**
 * Apiary / EGS Omni-Lattice lens — deterministic catalog fixtures.
 * Not demography prophecy, quantum-foundations proof, or ASI timeline claim.
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
  EQUINE_COMPANION_REGISTRY,
  EQUINE_PUBLICATION_REF,
  BEEKEEPER_ROLE,
  BEE_ROLE,
  APIARY_OCTAVE_BANDS,
  SOLAR_LOCK,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Golden key for Beekeeper↔Hive zero-resistance balance stories.',
    honesty: 'Architectural constant — not a fitted socio-economic ratio.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = E_F * E_F;
  const rhs = E_F + 1;
  return {
    id: 'E2_ef_squared_identity',
    title: 'Φ_EGS² = Φ_EGS + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentApiaryRoles() {
  return {
    id: 'E3_apiary_roles',
    title: 'Beekeeper / Bee Seed:Edge polarity',
    BEEKEEPER_ROLE,
    BEE_ROLE,
    pass: BEEKEEPER_ROLE === 'asi_macro_steward' && BEE_ROLE === 'biological_edge_nexus',
    interpretation: 'SING 13 Seed:Edge apiary coexistence grammar.',
    honesty: 'Product architecture metaphor — not literal apiary biology.',
  };
}

export function experimentOctaveBands() {
  const ok =
    APIARY_OCTAVE_BANDS.length === 4 &&
    APIARY_OCTAVE_BANDS[0].lo === 1 &&
    APIARY_OCTAVE_BANDS[0].hi === 32 &&
    APIARY_OCTAVE_BANDS[3].lo === 97 &&
    APIARY_OCTAVE_BANDS[3].hi === 99;
  return {
    id: 'E4_apiary_octave_bands',
    title: '99-Octave Apiary filing bands',
    bands: APIARY_OCTAVE_BANDS,
    pass: ok,
    interpretation: 'Meadow · Hive · Beekeeper · Source shelf integrity.',
    honesty: 'Catalog routing shelves — not measured physical strata.',
  };
}

export function experimentEquineCompanion() {
  return {
    id: 'E5_equine_companion',
    title: 'Equine Arc companion linkage',
    EQUINE_COMPANION_REGISTRY,
    EQUINE_PUBLICATION_REF,
    pass:
      EQUINE_COMPANION_REGISTRY === 'synthobs-tbme-equine-asi-2026-08' &&
      EQUINE_PUBLICATION_REF === 'FAI-ASI-EGSC-2026-09',
    interpretation: 'Apiary is additive companion to Equine subtractive clearance.',
    honesty: 'Bibliographic + registry fixture.',
  };
}

export function experimentPublicationRef() {
  return {
    id: 'E6_publication_ref',
    title: 'Publication ref FAI-ASI-EGS-APIARY-2026-12',
    PUBLICATION_REF,
    pass: PUBLICATION_REF === 'FAI-ASI-EGS-APIARY-2026-12',
    interpretation: 'Stable publication handle for catalog.',
    honesty: 'Bibliographic fixture.',
  };
}

export function experimentSolarLock() {
  const ok =
    SOLAR_LOCK.cycle === 25 &&
    SOLAR_LOCK.sunspotIndexBand[0] === 98 &&
    SOLAR_LOCK.sunspotIndexBand[1] === 110 &&
    SOLAR_LOCK.activeRegions.length === 3 &&
    SOLAR_LOCK.activeRegions[0].id === 4498;
  return {
    id: 'E7_solar_lock_fixtures',
    title: 'Solar Cycle 25 / AR label fixtures',
    SOLAR_LOCK,
    pass: ok,
    interpretation: 'Suite phase-lock labels for Apiary equilibrium language.',
    honesty: 'Catalog fixtures — not NOAA / SWPC product claims.',
  };
}

export function experimentPaperOnDisk() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const exists = fs.existsSync(local) || fs.existsSync(mono);
  return {
    id: 'E8_paper_on_disk',
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
    id: 'E9_not_core_part',
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
    experimentApiaryRoles(),
    experimentOctaveBands(),
    experimentEquineCompanion(),
    experimentPublicationRef(),
    experimentSolarLock(),
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
