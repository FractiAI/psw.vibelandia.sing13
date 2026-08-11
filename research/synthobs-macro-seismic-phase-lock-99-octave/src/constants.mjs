/** Macro-seismic phase-lock · 99 Octave application suite (not Omni-Lattice TOC). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-MACRO-SEISMIC-PHASE-LOCK-99-OCTAVE-2026-08-11';
export const REGISTRY_ID = 'synthobs-macro-seismic-phase-lock-99-octave-2026-08';
export const STUDY_TITLE =
  'Macro-Seismic Phase-Locking through the 99th-Octave Omni-Lattice Lens';
export const PAPER_NAME = 'SYNTHOBS_MACRO_SEISMIC_PHASE_LOCK_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-MACRO-SEISMIC-99-OCTAVE-2026-08';

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT; // 8019

/** Narrative fixture events — verify against USGS before any operational use. */
export const SEISMIC_FIXTURES = Object.freeze([
  { region: 'Philippines', magnitude: 7.8, date: '2026-06-07' },
  { region: 'Venezuela', magnitude: 7.2, date: '2026-06-24', note: 'doublet-a' },
  { region: 'Venezuela', magnitude: 7.5, date: '2026-06-24', note: 'doublet-b' },
  { region: 'Colombia', magnitude: 7.4, date: '2026-08-10' },
]);

export const SOLAR_WIND_BAND_KMS = Object.freeze({ min: 380, max: 650 });
export const NEST_TOPOLOGY = 'octave99';
