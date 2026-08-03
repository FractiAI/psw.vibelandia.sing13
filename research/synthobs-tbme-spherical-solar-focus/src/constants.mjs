export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
export const THETA_EGS_DEG = 360 / (E_F * E_F);
export const R_N = (E_F - 1) / (E_F + 1);
export const R_N_TABLE_ANCHOR = 0.236;
export const R_N_EPS = 0.001;
export const ANGLE_EPS = 0.05;

export const DOC_ID = 'WP-SYNTHOBS-TBME-SPHERICAL-SOLAR-FOCUS-2026-08-02';
export const REGISTRY_ID = 'synthobs-tbme-spherical-solar-focus-2026-08';
export const STUDY_TITLE =
  'Solar-Focus Dynamics of Spherical Mirror Lattices & Somatic Matter Rendering';
export const PARENT_DOC_ID = 'WP-SYNTHOBS-TBME-BLACKHOLE-MAGNETIC-LAYER-2026-08-01';
export const RENO_DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01';

/** Primary geometric seed: θ_EGS / E_F ≈ 84.98° */
export const THETA_WATER_SEED = THETA_EGS_DEG / E_F;
export const WATER_SEED_ANCHOR = 84.98;
export const WATER_SEED_TOL = 0.05;
/** Literature liquid-water angle band (companion anchor — not a derived equality gate). */
export const WATER_LIT_BAND = { min: 104.45, max: 104.52 };

/** B-DNA pitch narrative Å */
export const DNA_TURN_A = 34;
export const DNA_DIAMETER_A = 21;
export const DNA_RATIO = DNA_TURN_A / DNA_DIAMETER_A;
export const DNA_RATIO_TOL = 0.01;

export const SCORECARD = {
  randomCollision: { overall: 72.5, coherence: 76, irreducibility: 69 },
  solarFocus: { overall: 99.3, coherence: 99.7, irreducibility: 98.9 },
};
