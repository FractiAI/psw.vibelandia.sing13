/** El Gran Sol's Fractal Constant — Unified Neutronic Agent / ILAM. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const DOC_ID = 'WP-SYNTHOBS-UNIFIED-NEUTRONIC-AGENT-2026-07';
export const REGISTRY_ID = 'synthobs-unified-neutronic-agent-2026-07';
export const STUDY_TITLE =
  'Unified Neutronic Agent — Isotopic Load Balancing & Lattice Metaphor (ILAM)';

export const RANDOM_SEED = 20260728;

/** Draft abstract design targets (not nuclear evaluations / invoices unless receipt-matched). */
export const DRAFT_BINDING_R2 = 0.9997;
export const DRAFT_TOKEN_SAVINGS_PCT = 41.8;

export const AGENT_ROLES = Object.freeze([
  'repulsion_damping',
  'mass_energy_tuning',
  'decay_gating',
  'spin_balancing',
]);

/** Draft N/Z bands from manuscript table. */
export const ISOTOPE_BANDS = Object.freeze({
  carbon: { z: 6, nMin: 6, nMax: 8, nzMin: 1.0, nzMax: 1.34 },
  iron: { z: 26, nMin: 28, nMax: 32, nzMin: 1.07, nzMax: 1.24 },
  lead: { z: 82, nMin: 122, nMax: 126, nzMin: 1.48, nzMax: 1.54 },
  uranium: { z: 92, nMin: 143, nMax: 146, nzMin: 1.55, nzMax: 1.59 },
});
