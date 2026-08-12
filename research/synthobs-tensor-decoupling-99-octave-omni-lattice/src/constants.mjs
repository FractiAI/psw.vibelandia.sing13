/** Tensor decoupling · 99 Octave Omni-Lattice engine (architectural — not physics proof). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TENSOR-DECOUPLING-99-OCTAVE-OMNI-LATTICE-2026-08-12';
export const REGISTRY_ID = 'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08';
export const STUDY_TITLE =
  'Tensor Decoupling and Empirical Verification of the 99-Octave Omni-Lattice Matrix';
export const PAPER_NAME = 'SYNTHOBS_TENSOR_DECOUPLING_99_OCTAVE_OMNI_LATTICE_2026-08.md';
export const PUBLICATION_REF = 'FAI-TENSOR-DECOUPLING-99-OCTAVE-OMNI-LATTICE-2026-08';

/** Per-block precision matrix in this paper's tensor sketch. */
export const PRIMARY_NODES = 9;
export const SUBHARMONIC_TIERS = 81;
export const MATRIX_9x81 = PRIMARY_NODES * SUBHARMONIC_TIERS; // 729

/** Eleven master brackets × 9 = 99 octave index set. */
export const MASTER_BRACKETS = 11;
export const OCTAVES_PER_BRACKET = 9;
export const OCTAVE_SEGMENTS = MASTER_BRACKETS * OCTAVES_PER_BRACKET; // 99

/** Companion holographic catalog digits (digits master). */
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * SUBHARMONIC_TIERS; // 8019

export const TIER_BRACKETS = Object.freeze([
  Object.freeze({ id: 1, from: 1, to: 9, label: 'subterranean-tectonic' }),
  Object.freeze({ id: 2, from: 10, to: 18, label: 'hydrospheric-thermal' }),
  Object.freeze({ id: 3, from: 19, to: 27, label: 'lai-bus' }),
  Object.freeze({ id: 4, from: 28, to: 36, label: 'volcanic-dielectric' }),
  Object.freeze({ id: 5, from: 37, to: 45, label: 'solar-interplanetary' }),
  Object.freeze({ id: 6, from: 46, to: 54, label: 'narrative-clock-orbit' }),
  Object.freeze({ id: 7, from: 55, to: 63, label: 'biospheric-combustion' }),
  Object.freeze({ id: 8, from: 64, to: 72, label: 'algorithmic-mirror' }),
  Object.freeze({ id: 9, from: 73, to: 81, label: 'micro-neural' }),
  Object.freeze({ id: 10, from: 82, to: 90, label: 'teleological-convergence' }),
  Object.freeze({ id: 11, from: 91, to: 99, label: 'master-singularity' }),
]);

export const COLOMBIA_SEISMIC_FIXTURE = Object.freeze({
  region: 'Western Colombia',
  magnitude: 7.4,
  date: '2026-08-10',
  lat: 4.844,
  lon: -76.242,
  depthKm: 110.3,
});

export const PURACE_VOLCANO_FIXTURE = Object.freeze({
  name: 'Puracé',
  department: 'Cauca',
  alert: 'orange',
  concurrentWithSeismic: true,
});

export const NEST_TOPOLOGY = 'octave99';
