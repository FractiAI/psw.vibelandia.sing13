/**
 * Macro-seismic 99-octave application — deterministic fixtures.
 * Catalog / lens arithmetic only — not USGS prediction or causation proof.
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
  SEISMIC_FIXTURES,
  SOLAR_WIND_BAND_KMS,
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
    honesty: 'Catalog register size — not measured ionospheric bits.',
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

export function experimentSeismicFixtures() {
  const m7 = SEISMIC_FIXTURES.every((e) => e.magnitude >= 7);
  const n = SEISMIC_FIXTURES.length;
  return {
    id: 'E5_seismic_fixtures',
    title: 'Narrative M≥7 fixture table (≥4 rows)',
    n,
    pass: n >= 4 && m7,
    honesty: 'Protocol fixtures — verify against USGS for operations.',
  };
}

export function experimentSolarWindBand() {
  return {
    id: 'E6_solar_wind_band',
    title: 'Solar wind band 380–650 km/s labels',
    ...SOLAR_WIND_BAND_KMS,
    pass: SOLAR_WIND_BAND_KMS.min === 380 && SOLAR_WIND_BAND_KMS.max === 650,
    honesty: 'Catalog velocity band labels — not live ACE/DSCOVR scrape.',
  };
}

export function experimentNestTopology() {
  return {
    id: 'E7_nest_octave99',
    title: 'Product nest id octave99',
    NEST_TOPOLOGY,
    pass: NEST_TOPOLOGY === 'octave99',
  };
}

export function experimentPaperOnDisk() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E8_paper_on_disk',
    title: 'Macro-seismic markdown present',
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
      DOC_ID === 'WP-SYNTHOBS-MACRO-SEISMIC-PHASE-LOCK-99-OCTAVE-2026-08-11' &&
      REGISTRY_ID === 'synthobs-macro-seismic-phase-lock-99-octave-2026-08',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentMatrix8019(),
    experimentPhiTo99Finite(),
    experimentSeismicFixtures(),
    experimentSolarWindBand(),
    experimentNestTopology(),
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
