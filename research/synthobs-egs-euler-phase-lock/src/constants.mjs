/** El Gran Sol's Fractal Constant (golden-ratio postulate) = E_F. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.6180339887…
export const E_F = PHI_EGS;

/** λ_EGS = ln(E_F) / 2π — radial growth rate of the harmonic logarithmic fractal spiral. */
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const DOC_ID = 'WP-SYNTHOBS-EGS-EULER-PHASE-LOCK-2026-07';
export const REGISTRY_ID = 'synthobs-egs-euler-phase-lock-2026-07';
export const STUDY_TITLE =
  'Phase-Locked Scale Invariance — Euler Identity ↔ EGS Fractal Constant';

export const RANDOM_SEED = 20260727;
export const NUM_THETA_SAMPLES = 360;
export const SCALE_K_MAX = 12;
