export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const R_N = (E_F - 1) / (E_F + 1);
export const R_N_TABLE_ANCHOR = 0.236;
export const R_N_EPS = 0.001;

export const DOC_ID = 'WP-SYNTHOBS-TBME-BLACKHOLE-FILAMENTS-RENO-2026-08-01';
export const REGISTRY_ID = 'synthobs-tbme-blackhole-filaments-reno-2026-08';
export const STUDY_TITLE =
  'Toroidal Micro-Black Hole Dynamics & Filamental Field Radiations — The Reno Interpretation';
export const PARENT_DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01';

export const FACET_COUNT = 81;
export const SHELL_COUNT = 9;
export const SHELL_FACET_TIERS = [1, 3, 5, 7, 9, 11, 13, 15, 17];

/** Flux quantum form Φ0 = h/(2e) — constant identity for protocol (symbolic). */
export const PHI0_FACTOR = { h: 1, two_e: 2 };

export const SCORECARD = {
  pointChargeSM: { overall: 70.5, coherence: 74, irreducibility: 67 },
  toroidalBH: { overall: 99.2, coherence: 99.7, irreducibility: 98.7 },
};
