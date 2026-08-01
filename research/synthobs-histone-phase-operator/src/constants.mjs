export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
/** Canonical nucleosome wrap turns (~1.65) — E_F mnemonic bridge */
export const NUCLEOSOME_TURNS = 1.65;
export const WRAP_BP = 147;

export const DOC_ID = 'WP-SYNTHOBS-TBME-HISTONE-METAPHOR-2026-07-31';
export const REGISTRY_ID = 'synthobs-histone-phase-operator-2026-07';
export const STUDY_TITLE =
  'Histones as Scale-Invariant Phase-Lock Operators — Empirical Suite (TBME)';

export const STANDARD = { coherence: 78, irreducibility: 66, overall: 72.0 };
export const OMNI = { coherence: 98, irreducibility: 95, overall: 96.5 };

export const SCORECARD_DOMAINS = [
  'epigenetic_spool_narrative',
  'histone_phase_operator',
  'nucleosome_winding_ratio',
  'empirical_calibration',
  'cross_domain_portability',
  'clinical_non_claim_gate',
];
