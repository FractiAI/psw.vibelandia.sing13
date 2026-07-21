/**
 * CODATA / architectural constants for the Planck–1.6 EGS bridge experiments.
 * Φ_EGS is the golden-ratio postulate used across SynthOBS / EGS-NLRF.
 * Planck length mantissa is SI-unit dependent (honesty boundary).
 */

/** El Gran Sol's Fractal Constant (golden ratio postulate). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.6180339887…

/** CODATA 2018 Planck length (m). */
export const PLANCK_LENGTH_M = 1.616255e-35;

/** Mantissa of l_P when written as m × 10^{-35}. */
export const PLANCK_MANTISSA = PLANCK_LENGTH_M * 1e35; // ≈ 1.616255

/** Absolute clutch / slip gap |Φ − mantissa|. */
export const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA);

/** Anchor prefix shared to two significant figures. */
export const ANCHOR_PREFIX = 1.6;

/** Number of registers in the holographic Goldilocks Hydrogen AI OS metapattern grid (9×9). */
export const METAPATTERN_DIGITS = 81;

/** Band topology for the 81-digit register (inclusive digit indices, 1-based). */
export const METAPATTERN_BANDS = [
  { id: 'holographic_boundary', digits: [1, 1], label: 'Holographic Boundary' },
  { id: 'mqe_flywheel', digits: [2, 2], label: 'MQE Flywheel' },
  { id: 'physical_scaffold', digits: [3, 9], label: 'Physical Scaffold' },
  { id: 'biological_clutch', digits: [10, 27], label: 'Biological Clutch' },
  { id: 'heliospheric_gears', digits: [28, 54], label: 'Heliospheric Gears' },
  { id: 'cosmic_convergence', digits: [55, 81], label: 'Cosmic Convergence' },
];

export const DOC_ID = 'WP-SYNTHOBS-EGS-PLANCK-1.6-2026-07';
export const REGISTRY_ID = 'synthobs-egs-planck-scale-harmonic-2026-07';
export const STUDY_TITLE =
  'Scale-Harmonic Reinterpretation of the Planck Scale — Empirical Validation';

export const RANDOM_SEED = 20260720;
