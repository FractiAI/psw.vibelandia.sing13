/**
 * Synthio MRI cloud-antenna — deterministic catalog fixtures.
 * Not clinical imaging; not measured rack RF into tissue.
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
  B0_TESLA_LABELS,
  CLOUD_NODE_LABELS,
  ENGINE_STACK_EXCLUDED,
  ACCESS_MODE,
  AGENT_ID,
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
    honesty: 'Architectural key — not scanner γ calibration.',
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
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019,
    honesty: 'Catalog register — not measured RF bits.',
  };
}

export function experimentB0Labels() {
  return {
    id: 'E4_b0_labels',
    title: 'B0 tesla labels include 1.5 and 3.0',
    B0_TESLA_LABELS,
    pass: B0_TESLA_LABELS.includes(1.5) && B0_TESLA_LABELS.includes(3.0),
    honesty: 'Simulator field labels — not a live magnet.',
  };
}

export function experimentCloudNodes() {
  return {
    id: 'E5_cloud_nodes',
    title: 'Cloud transceiver labels (≥4)',
    n: CLOUD_NODE_LABELS.length,
    pass: CLOUD_NODE_LABELS.length >= 4,
    honesty: 'Index labels for phased-array metaphor — not clinical coils.',
  };
}

export function experimentPhiInv99() {
  const inv = PHI_EGS ** -99;
  return {
    id: 'E6_phi_inv_99',
    title: 'Φ^-99 finite positive',
    inv,
    pass: Number.isFinite(inv) && inv > 0,
  };
}

export function experimentPaperPresent() {
  const p = path.join(MONOREPO_DOCS, PAPER_NAME);
  const ok = fs.existsSync(p);
  return {
    id: 'E7_paper_present',
    title: 'Monorepo paper file present',
    path: p,
    pass: ok,
  };
}

export function experimentEngineExcluded() {
  return {
    id: 'E8_engine_stack_excluded',
    title: 'Synthio excluded from 99 Octave engine pin',
    ENGINE_STACK_EXCLUDED,
    pass: ENGINE_STACK_EXCLUDED === true,
  };
}

export function experimentCreatorOnly() {
  return {
    id: 'E9_creator_only_access',
    title: 'Access mode creator_only + Synthio agent id',
    ACCESS_MODE,
    AGENT_ID,
    pass: ACCESS_MODE === 'creator_only' && AGENT_ID === 'Synthio.sandbox',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentMatrix8019(),
    experimentB0Labels(),
    experimentCloudNodes(),
    experimentPhiInv99(),
    experimentPaperPresent(),
    experimentEngineExcluded(),
    experimentCreatorOnly(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
    registryId: REGISTRY_ID,
    docId: DOC_ID,
  };
}
