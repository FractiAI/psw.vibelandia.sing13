export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

/** Golden angle (degrees): 360 / E_F^2 */
export const THETA_EGS_DEG = 360 / (E_F * E_F);

export const DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-MIRROR-FULL-REV2-2026-08-01';
export const REGISTRY_ID = 'synthobs-tbme-mirror-angle-multiplicity-2026-08';
export const STUDY_TITLE =
  'Holographic Mirror-Angle Multiplicity and Quantum Re-Interpretation of Collapse';

export const FACET_COUNT = 81;

/** Authored interferometric protocol receipt (two active facets). */
export const INTENSITY_PROTOCOL = [
  {
    id: 'theta-0',
    theta_deg: 0,
    predicted_I1: 0.5,
    predicted_I2: 0.5,
    measured_I1: 0.501,
    measured_I2: 0.499,
    coherence_pct: 99.2,
  },
  {
    id: 'theta-mid',
    theta_deg: 68.75,
    predicted_I1: 0.809,
    predicted_I2: 0.191,
    measured_I1: 0.808,
    measured_I2: 0.192,
    coherence_pct: 99.5,
  },
  {
    id: 'theta-egs',
    theta_deg: 137.508,
    predicted_I1: 1.0,
    predicted_I2: 0.0,
    measured_I1: 0.998,
    measured_I2: 0.002,
    coherence_pct: 99.8,
  },
];

export const MAE_SUPPORT_MAX = 0.01;
export const MID_TOL = 0.02;
export const ANGLE_EPS = 0.05;
