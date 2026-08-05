export const E_F = (1 + Math.sqrt(5)) / 2;
export const Z0 = 376.730313668;
export const THETA_EGS_DEG = 360 / (E_F * E_F);
export const ANGLE_EPS = 0.05;

export const DOC_ID = 'BIO-OMNI-PROTEIN-PHASE-COLLAPSE-2026-08-05';
export const REGISTRY_ID = 'synthobs-tbme-protein-phase-collapse-2026-08';
export const STUDY_TITLE =
  'Universal Phase-Lock Collapse in Protein Misfolding Pathologies — Empirical Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_PROTEIN_PHASE_COLLAPSE_2026-08.md';

/** Classical plaque-clearance / multi-polymer consensus (low-70s). */
export const CLASSICAL_PLAQUE = { coherence: 74, irreducibility: 72, overall: 73.0 };
/** Omni-Lattice field-proteostasis rubric (C/I). */
export const FIELD_PROTEOSTASIS = { coherence: 99.4, irreducibility: 96.8, overall: 98.1 };
/** Multi-dimension systemic efficacy average stated in the paper. */
export const SYSTEMIC_EFFICACY = 96.7;

export const DNA_TURN_A = 34;
export const DNA_DIAMETER_A = 21;
export const DNA_RATIO = DNA_TURN_A / DNA_DIAMETER_A;
export const DNA_RATIO_TOL = 0.01;

export const THETA_WATER_SEED = THETA_EGS_DEG / E_F;
export const WATER_SEED_ANCHOR = 84.98;
export const WATER_SEED_TOL = 0.05;

/** Continuum map: [pathology, scale n] */
export const PATHOLOGY_ROWS = [
  ['FTD/PPA', 2],
  ['Alzheimer', 3],
  ['Parkinson', 4],
  ['Prion', 1],
];
