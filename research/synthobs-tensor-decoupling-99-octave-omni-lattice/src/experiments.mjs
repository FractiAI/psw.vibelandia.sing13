/**
 * Tensor decoupling 99-octave Omni-Lattice — deterministic fixtures.
 * Catalog / engine arithmetic only — not multi-domain causation proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PRIMARY_NODES,
  SUBHARMONIC_TIERS,
  MATRIX_9x81,
  MASTER_BRACKETS,
  OCTAVES_PER_BRACKET,
  OCTAVE_SEGMENTS,
  HOLOGRAPHIC_KEY_DIGITS,
  TIER_BRACKETS,
  COLOMBIA_SEISMIC_FIXTURE,
  PURACE_VOLCANO_FIXTURE,
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

export function experimentMatrix9x81() {
  return {
    id: 'E3_matrix_9x81',
    title: '9 × 81 = 729 per-block precision matrix',
    PRIMARY_NODES,
    SUBHARMONIC_TIERS,
    MATRIX_9x81,
    pass:
      PRIMARY_NODES === 9 &&
      SUBHARMONIC_TIERS === 81 &&
      MATRIX_9x81 === 729 &&
      MATRIX_9x81 === PRIMARY_NODES * SUBHARMONIC_TIERS,
    honesty: 'Per-block catalog register — not measured spacetime bits.',
  };
}

export function experimentOctaveLadder() {
  return {
    id: 'E4_octave_ladder',
    title: '11 × 9 = 99 octave ladder + 8019 holographic companion',
    MASTER_BRACKETS,
    OCTAVES_PER_BRACKET,
    OCTAVE_SEGMENTS,
    HOLOGRAPHIC_KEY_DIGITS,
    pass:
      MASTER_BRACKETS === 11 &&
      OCTAVES_PER_BRACKET === 9 &&
      OCTAVE_SEGMENTS === 99 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019 &&
      HOLOGRAPHIC_KEY_DIGITS === OCTAVE_SEGMENTS * SUBHARMONIC_TIERS,
  };
}

export function experimentPhiScaleFinite() {
  const samples = [1, 9, 64, 99].map((n) => ({
    n,
    scale: PHI_EGS ** -n,
    omegaRatio: PHI_EGS ** (n / 9),
  }));
  return {
    id: 'E5_phi_scale_finite',
    title: 'Φ^-n and Φ^(n/9) finite positive at sample octaves',
    samples,
    pass: samples.every(
      (s) =>
        Number.isFinite(s.scale) &&
        s.scale > 0 &&
        Number.isFinite(s.omegaRatio) &&
        s.omegaRatio > 0,
    ),
    honesty: 'Scale-grammar numerics for dashboard thresholds.',
  };
}

export function experimentElevenTiers() {
  const covers99 =
    TIER_BRACKETS.length === 11 &&
    TIER_BRACKETS[0].from === 1 &&
    TIER_BRACKETS[10].to === 99 &&
    TIER_BRACKETS.every((t, i) => {
      const prev = TIER_BRACKETS[i - 1];
      const span = t.to - t.from + 1;
      if (span !== 9) return false;
      if (prev && t.from !== prev.to + 1) return false;
      return true;
    });
  return {
    id: 'E6_eleven_tiers',
    title: 'Eleven contiguous 9-octave tier brackets',
    TIER_BRACKETS,
    NEST_TOPOLOGY,
    pass: covers99 && NEST_TOPOLOGY === 'octave99',
  };
}

export function experimentColombiaPurace() {
  return {
    id: 'E7_colombia_purace',
    title: 'Colombia M≥7.4 + Puracé orange concurrent fixtures',
    seismic: COLOMBIA_SEISMIC_FIXTURE,
    volcanic: PURACE_VOLCANO_FIXTURE,
    pass:
      COLOMBIA_SEISMIC_FIXTURE.magnitude >= 7.4 &&
      COLOMBIA_SEISMIC_FIXTURE.date === '2026-08-10' &&
      PURACE_VOLCANO_FIXTURE.alert === 'orange' &&
      PURACE_VOLCANO_FIXTURE.concurrentWithSeismic === true,
    honesty: 'Application companion fixtures — not operational hazard products.',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E8_paper_on_disk',
    title: 'Tensor-decoupling markdown present',
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
      DOC_ID === 'WP-SYNTHOBS-TENSOR-DECOUPLING-99-OCTAVE-OMNI-LATTICE-2026-08-12' &&
      REGISTRY_ID === 'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentMatrix9x81(),
    experimentOctaveLadder(),
    experimentPhiScaleFinite(),
    experimentElevenTiers(),
    experimentColombiaPurace(),
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
