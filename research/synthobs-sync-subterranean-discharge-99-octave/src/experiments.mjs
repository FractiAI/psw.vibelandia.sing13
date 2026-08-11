/**
 * Sync subterranean discharge 99-octave application — deterministic fixtures.
 * Catalog / lens arithmetic only — not multi-hazard prediction or causation proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  OCTAVE_SEGMENTS,
  PRECISION_PER_SEGMENT,
  HOLOGRAPHIC_KEY_DIGITS,
  COLOMBIA_SEISMIC_FIXTURE,
  PURACE_VOLCANO_FIXTURE,
  DISCHARGE_PATHS,
  NEST_TOPOLOGY,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    honesty: 'Architectural key — not a CODATA replacement.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentMatrix8019() {
  return {
    id: 'E3_matrix_99x81',
    title: '99 × 81 = 8019 holographic catalog digits',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019 &&
      HOLOGRAPHIC_KEY_DIGITS === OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT,
    honesty: 'Catalog register size — not measured magma-chamber bits.',
  };
}

export function experimentPhiTo99Finite() {
  const scale = PHI_EGS ** 99;
  const inv = PHI_EGS ** -99;
  return {
    id: 'E4_phi_pow_99',
    title: 'Φ^99 and Φ^-99 finite positive',
    scale,
    inv,
    pass: Number.isFinite(scale) && scale > 0 && Number.isFinite(inv) && inv > 0,
    honesty: 'Scale-grammar numerics for dashboard thresholds.',
  };
}

export function experimentColombiaSeismic() {
  return {
    id: 'E5_colombia_seismic',
    title: 'Colombia M≥7.4 fixture (2026-08-10)',
    ...COLOMBIA_SEISMIC_FIXTURE,
    pass:
      COLOMBIA_SEISMIC_FIXTURE.magnitude >= 7.4 &&
      COLOMBIA_SEISMIC_FIXTURE.date === '2026-08-10',
    honesty: 'Protocol fixture — verify against USGS for operations.',
  };
}

export function experimentPuraceOrange() {
  return {
    id: 'E6_purace_orange',
    title: 'Puracé orange-alert concurrent fixture',
    ...PURACE_VOLCANO_FIXTURE,
    pass:
      PURACE_VOLCANO_FIXTURE.name === 'Puracé' &&
      PURACE_VOLCANO_FIXTURE.alert === 'orange' &&
      PURACE_VOLCANO_FIXTURE.concurrentWithSeismic === true,
    honesty: 'Narrative volcanic context — not an official SGC bulletin.',
  };
}

export function experimentDualDischargePaths() {
  return {
    id: 'E7_dual_paths',
    title: 'Dual discharge paths: seismic + volcanic',
    DISCHARGE_PATHS,
    NEST_TOPOLOGY,
    pass:
      DISCHARGE_PATHS.length === 2 &&
      DISCHARGE_PATHS.includes('seismic') &&
      DISCHARGE_PATHS.includes('volcanic') &&
      NEST_TOPOLOGY === 'octave99',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E8_paper_on_disk',
    title: 'Subterranean-discharge markdown present',
    pass: fs.existsSync(p1) || fs.existsSync(p2),
  };
}

export function experimentDocIds() {
  return {
    id: 'E9_doc_ids',
    title: 'Document / registry IDs locked',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-SYNC-SUBTERRANEAN-DISCHARGE-99-OCTAVE-2026-08-11' &&
      REGISTRY_ID === 'synthobs-sync-subterranean-discharge-99-octave-2026-08',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentMatrix8019(),
    experimentPhiTo99Finite(),
    experimentColombiaSeismic(),
    experimentPuraceOrange(),
    experimentDualDischargePaths(),
    experimentPaperOnDisk(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_total: experiments.length,
    n_pass,
    all_pass: n_pass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
  };
}
