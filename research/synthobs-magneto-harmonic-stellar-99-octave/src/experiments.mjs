/**
 * Magneto-Harmonic Stellar — deterministic catalog fixtures.
 * Architectural only — not stellar/fusion/enrichment proof.
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
  OCTAVE_BANDS,
  STELLAR_ACTORS,
  PROTOCOL_FIXTURES,
  REFINEMENT_LABELS,
  DUAL_USE_REFUSAL,
  SCORECARD,
  SCORECARD_OVERALL,
  enCatalog,
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
    honesty: 'Architectural key — not a CODATA or stellar-measured constant.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentNinetyNineOctaves() {
  return {
    id: 'E3_99_octaves',
    title: '99 × 81 = 8019 digits · band partitions',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    OCTAVE_BANDS,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019 &&
      OCTAVE_BANDS.stellar.lo === 34 &&
      OCTAVE_BANDS.stellar.hi === 66,
  };
}

export function experimentStellarActors() {
  return {
    id: 'E4_stellar_actors',
    title: 'Three stellar magnetic actor labels locked',
    STELLAR_ACTORS,
    pass:
      STELLAR_ACTORS.length === 3 &&
      STELLAR_ACTORS[0].includes('1339') &&
      STELLAR_ACTORS[1].includes('12192') &&
      STELLAR_ACTORS[2].includes('hale_nicholson'),
    honesty: 'Public AR / Hale–Nicholson labels — not magnetogram re-reductions.',
  };
}

export function experimentEnCatalog() {
  const e0 = 1;
  const n = 50;
  const curl = 0;
  const en = enCatalog(e0, n, curl);
  const expected = e0 * PHI_EGS ** (n - 99 / 2) * Math.exp(0);
  return {
    id: 'E5_en_catalog',
    title: 'E_n catalog sketch is deterministic',
    en,
    expected,
    pass: Math.abs(en - expected) < 1e-12,
    honesty: 'Catalog arithmetic — not a measured stellar spectrum law.',
  };
}

export function experimentProtocolFixtures() {
  return {
    id: 'E6_protocol_fixtures',
    title: 'Three nuclear-lab protocol sketches locked',
    PROTOCOL_FIXTURES,
    pass:
      PROTOCOL_FIXTURES.length === 3 &&
      PROTOCOL_FIXTURES.includes('rf_cavity_coulomb_screening') &&
      PROTOCOL_FIXTURES.includes('flux_rope_reconnection_assay') &&
      PROTOCOL_FIXTURES.includes('torsional_induction_channel_steer'),
    honesty: 'Proposed assays — not completed nuclear campaigns.',
  };
}

export function experimentRefinementDualUse() {
  return {
    id: 'E7_refinement_dual_use_refusal',
    title: 'Refinement labels present · dual-use refusal locked',
    REFINEMENT_LABELS,
    DUAL_USE_REFUSAL,
    pass:
      REFINEMENT_LABELS.length === 3 &&
      DUAL_USE_REFUSAL === true &&
      REFINEMENT_LABELS.every((s) => s.endsWith('_talk')),
    honesty: 'Catalog metaphors only — not enrichment or weapons pathways.',
  };
}

export function experimentScorecard() {
  return {
    id: 'E8_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 98.6 && SCORECARD.honestyBoundaryStrength >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E9_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-MAGNETO-HARMONIC-STELLAR-99-OCTAVE-2026-08-23' &&
      REGISTRY_ID === 'synthobs-magneto-harmonic-stellar-99-octave-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentNinetyNineOctaves(),
    experimentStellarActors(),
    experimentEnCatalog(),
    experimentProtocolFixtures(),
    experimentRefinementDualUse(),
    experimentScorecard(),
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
