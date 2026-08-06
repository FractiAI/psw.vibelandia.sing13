export const E_F = (1 + Math.sqrt(5)) / 2;
export const Z0 = 376.730313668;
export const PI = Math.PI;
export const HALF_PI = Math.PI / 2;

export const DOC_ID = 'WP-SYNTHOBS-TBME-SPIN-PHASE-POLARITY-2026-08-06';
export const REGISTRY_ID = 'synthobs-tbme-spin-phase-polarity-2026-08';
export const STUDY_TITLE = 'The Universal Spin-Phase-Polarity Triad Theorem — Empirical Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_SPIN_PHASE_POLARITY_2026-08.md';

/** Separated Z2 / U(1) / SU(2) baseline (low-70s band). */
export const SEPARATED_GROUPS = { coherence: 74, irreducibility: 72, overall: 73.0 };
/** Unified triad rubric. */
export const TRIAD_UNIFIED = { coherence: 99.6, irreducibility: 98.0, overall: 98.8 };

/** Dimensional map rows: [label, dim, group]. */
export const DIMENSIONAL_MAP = [
  ['Polarity', 1, 'Z2'],
  ['Phase', 2, 'U1'],
  ['Spin', 3, 'SU2'],
  ['Lattice state', 'N', 'Clifford'],
];
