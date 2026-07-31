export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
export const N_NODES = 81;
export const MATRIX_DIM = 9;
/** Degeneracy 2ℓ+1 for ℓ = 0..8 sums to 81 */
export const SUBSHELL_DEGENERACIES = [1, 3, 5, 7, 9, 11, 13, 15, 17];
export const OMEGA_81 = N_NODES * E_F;

export const DOC_ID = 'WP-SYNTHOBS-TBME-81-ORBITAL-SINGULARITY-2026-07-31';
export const REGISTRY_ID = 'synthobs-81-orbital-singularity-2026-07';
export const STUDY_TITLE =
  'Electron Orbital Geometries as Holographic Singularities — Empirical Suite (TBME)';

export const STANDARD = { coherence: 82, irreducibility: 70, overall: 76.0 };
export const OMNI = { coherence: 99, irreducibility: 98, overall: 98.5 };

export const SCORECARD_DOMAINS = [
  'qm_probability_cloud',
  '81_singularity_matrix',
  'spacetime_projection_map',
  'empirical_calibration',
  'cross_domain_portability',
  'clinical_non_claim_gate',
];
