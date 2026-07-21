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

export const DOC_ID = 'WP-SYNTHOBS-EGS-PLANCK-1.6-2026-07';
export const REGISTRY_ID = 'synthobs-egs-planck-scale-harmonic-2026-07';
export const STUDY_TITLE =
  'Scale-Harmonic Reinterpretation of the Planck Scale — Empirical Validation';

export const RANDOM_SEED = 20260720;
