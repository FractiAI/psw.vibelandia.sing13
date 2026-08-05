export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

/** Golden angle (degrees): 360 / E_F^2 */
export const THETA_EGS_DEG = 360 / (E_F * E_F);

/** Dielectric amplitude reflection coefficient R_n = (E_F - 1) / (E_F + 1) */
export const R_N = (E_F - 1) / (E_F + 1);
export const R_N_TABLE_ANCHOR = 0.236;

export const DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01';
export const REGISTRY_ID = 'synthobs-tbme-superposition-reno-interpretation-2026-08';
export const STUDY_TITLE =
  'Holographic Mirror-Angle Multiplicity — The Reno Interpretation (Nested Spherical Mirror Lattice)';
export const PRIOR_DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-MIRROR-FULL-REV2-2026-08-01';

export const FACET_COUNT = 81;
export const SHELL_COUNT = 9;

/** Odd-cardinality facet tiers per nested shell (s…k); sum = 81 */
export const SHELL_FACET_TIERS = [1, 3, 5, 7, 9, 11, 13, 15, 17];

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

/** Interpretive rubric scorecard (not SI accuracy of nature). */
export const SCORECARD = {
  copenhagen: { overall: 75.0, coherence: 77, irreducibility: 73 },
  reno: { overall: 98.9, coherence: 99.5, irreducibility: 98.3 },
};

export const MAE_SUPPORT_MAX = 0.01;
export const MID_TOL = 0.02;
export const ANGLE_EPS = 0.05;
export const R_N_EPS = 0.001;
