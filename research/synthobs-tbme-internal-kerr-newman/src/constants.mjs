export const E_F = (1 + Math.sqrt(5)) / 2;
export const Z0 = 376.730313668;
export const THETA_EGS_DEG = 360 / (E_F * E_F);
export const ANGLE_EPS = 0.05;

export const DOC_ID = 'WP-SYNTHOBS-TBME-INTERNAL-KERR-NEWMAN-2026-08-05';
export const REGISTRY_ID = 'synthobs-tbme-internal-kerr-newman-2026-08';
export const STUDY_TITLE = 'The Universal Toroidal Singularity Theorem — Empirical Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_INTERNAL_KERR_NEWMAN_2026-08.md';

/** Separated multi-force consensus baseline (low-70s band). */
export const SEPARATED_FORCES = { coherence: 74, irreducibility: 72, overall: 73.0 };
/** Unified internal Kerr–Newman attraction rubric. */
export const UNIFIED_ATTRACTION = { coherence: 98.2, irreducibility: 97.0, overall: 97.6 };

/** Scale indices for layered attraction radii r_n = r_0 · E_F^n */
export const ATTRACTION_SCALE_NS = [1, 2, 3, 6, 9];

/** Four-row diagnostic map (layer, scale n). */
export const ATTRACTION_LAYERS = [
  ['Gravitational', 6],
  ['Magnetic / Vector', 3],
  ['Chemical / Molecular', 2],
  ['Socio-Cognitive', 9],
];

export const DNA_TURN_A = 34;
export const DNA_DIAMETER_A = 21;
export const DNA_RATIO = DNA_TURN_A / DNA_DIAMETER_A;
export const DNA_RATIO_TOL = 0.01;
