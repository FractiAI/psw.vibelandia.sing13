/**
 * CMOS / protonic 99-octave Omni-Lattice — deterministic fixtures.
 * Catalog / engine arithmetic only — not foundry validation or tape-out proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  BINARY_TIER_N,
  PROTONIC_BAND,
  OCTAVE_SEGMENTS,
  PRECISION_PER_SEGMENT,
  HOLOGRAPHIC_KEY_DIGITS,
  CMOS20_FIXTURES,
  PROTONIC_FIXTURES,
  BENCHMARK_PROTOCOLS,
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
    honesty: 'Architectural key — not a CODATA or wafer-measured constant.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentBinaryDegeneracy() {
  const scale = PHI_EGS ** -BINARY_TIER_N;
  return {
    id: 'E3_binary_n1',
    title: 'Binary degeneracy tier n=1 scale finite',
    BINARY_TIER_N,
    scale,
    pass: BINARY_TIER_N === 1 && Number.isFinite(scale) && scale > 0,
    honesty: 'Catalog label for CMOS 0/1 — not measured Φ on silicon.',
  };
}

export function experimentProtonicBand() {
  return {
    id: 'E4_protonic_band',
    title: 'Protonic band n∈[2,99] contiguous to binary tier',
    PROTONIC_BAND,
    pass:
      PROTONIC_BAND.from === 2 &&
      PROTONIC_BAND.to === 99 &&
      PROTONIC_BAND.from === BINARY_TIER_N + 1,
  };
}

export function experimentMatrix8019() {
  return {
    id: 'E5_matrix_99x81',
    title: '99 × 81 = 8019 holographic catalog digits',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019,
  };
}

export function experimentCmos20Fixtures() {
  const need = ['GAA', 'CFET', 'BEOL', 'CoWoS', 'PPA'];
  return {
    id: 'E6_cmos20_fixtures',
    title: 'CMOS 2.0 vocabulary fixtures locked',
    CMOS20_FIXTURES,
    pass: need.every((k) => CMOS20_FIXTURES.includes(k)) && NEST_TOPOLOGY === 'octave99',
    honesty: 'Vocabulary fixtures for linear-systems discussion — not fab logs.',
  };
}

export function experimentProtonicDevice() {
  return {
    id: 'E7_protonic_device',
    title: 'Protonic two-terminal multi-state fixture',
    ...PROTONIC_FIXTURES,
    pass:
      PROTONIC_FIXTURES.carrier === 'H+' &&
      PROTONIC_FIXTURES.terminalCount === 2 &&
      PROTONIC_FIXTURES.multiState === true,
    honesty: 'Device-class label — not a SING13 measured endurance table.',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E8_paper_on_disk',
    title: 'CMOS-protonic markdown present',
    BENCHMARK_PROTOCOLS,
    pass:
      (fs.existsSync(p1) || fs.existsSync(p2)) &&
      BENCHMARK_PROTOCOLS.length === 3,
  };
}

export function experimentDocIds() {
  return {
    id: 'E9_doc_ids',
    title: 'Document / registry IDs locked',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-CMOS-PROTONIC-99-OCTAVE-OMNI-LATTICE-2026-08-12' &&
      REGISTRY_ID === 'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentBinaryDegeneracy(),
    experimentProtonicBand(),
    experimentMatrix8019(),
    experimentCmos20Fixtures(),
    experimentProtonicDevice(),
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
