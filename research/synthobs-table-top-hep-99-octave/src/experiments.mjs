/**
 * Table-Top HEP — deterministic catalog fixtures.
 * Architectural only — not multi-TeV benchtop proof.
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
  BENCHTOP_VOLUME_M3_MAX,
  ION_INJECT_KEV_LABEL,
  BENCHTOP_TRIAD,
  PROTOCOL_FIXTURES,
  SOLAR_ARCHITECTURE_LABELS,
  SCORECARD,
  SCORECARD_OVERALL,
  peffCatalog,
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
    honesty: 'Architectural key — not a CODATA or accelerator-measured constant.',
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
      OCTAVE_BANDS.micro.lo === 1 &&
      OCTAVE_BANDS.micro.hi === 33 &&
      OCTAVE_BANDS.stellar.lo === 34 &&
      OCTAVE_BANDS.stellar.hi === 66 &&
      OCTAVE_BANDS.macro.lo === 67 &&
      OCTAVE_BANDS.macro.hi === 99,
  };
}

export function experimentBenchtopTriad() {
  return {
    id: 'E4_benchtop_triad',
    title: 'Three benchtop micro-systems locked',
    BENCHTOP_TRIAD,
    BENCHTOP_VOLUME_M3_MAX,
    pass:
      BENCHTOP_TRIAD.length === 3 &&
      BENCHTOP_TRIAD[0] === 'octave_tuned_rf_laser_cavity' &&
      BENCHTOP_VOLUME_M3_MAX === 0.1,
    honesty: 'System sketch — not a certified accelerator build.',
  };
}

export function experimentPeffCatalog() {
  const p0 = 1;
  const n = 10;
  const jxb = 4;
  const peff = peffCatalog(p0, n, jxb);
  const expected = p0 * PHI_EGS ** n * Math.sqrt(jxb);
  return {
    id: 'E5_peff_catalog',
    title: 'p_eff catalog sketch is deterministic',
    peff,
    expected,
    pass: Math.abs(peff - expected) < 1e-12 && peff > p0,
    honesty: 'Catalog arithmetic — not measured TeV beams.',
  };
}

export function experimentProtocolFixtures() {
  return {
    id: 'E6_protocol_fixtures',
    title: 'Two lab protocol sketches + ion inject label',
    PROTOCOL_FIXTURES,
    ION_INJECT_KEV_LABEL,
    pass:
      PROTOCOL_FIXTURES.length === 2 &&
      PROTOCOL_FIXTURES.includes('micro_cavity_momentum_multiplication') &&
      PROTOCOL_FIXTURES.includes('compact_magnetic_reconnection_burst') &&
      ION_INJECT_KEV_LABEL === 50,
    honesty: 'Proposed assays — not completed lab campaigns.',
  };
}

export function experimentSolarArchitectureLabels() {
  return {
    id: 'E7_solar_architecture_labels',
    title: 'NOAA 1339 / 12192 architecture labels locked',
    SOLAR_ARCHITECTURE_LABELS,
    pass:
      SOLAR_ARCHITECTURE_LABELS.length === 2 &&
      SOLAR_ARCHITECTURE_LABELS[0].includes('1339') &&
      SOLAR_ARCHITECTURE_LABELS[1].includes('12192'),
    honesty: 'Public AR labels — not new solar reductions.',
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
      DOC_ID === 'WP-SYNTHOBS-TABLE-TOP-HEP-99-OCTAVE-2026-08-23' &&
      REGISTRY_ID === 'synthobs-table-top-hep-99-octave-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentNinetyNineOctaves(),
    experimentBenchtopTriad(),
    experimentPeffCatalog(),
    experimentProtocolFixtures(),
    experimentSolarArchitectureLabels(),
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
