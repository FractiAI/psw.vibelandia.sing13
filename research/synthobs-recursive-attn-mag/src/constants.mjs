export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const DOC_ID = 'WP-SYNTHOBS-RECURSIVE-ATTN-MAG-2026-07-30';
export const REGISTRY_ID = 'synthobs-recursive-attn-mag-2026-07';
export const STUDY_TITLE =
  'Recursive Attention Squeezing & Holographic Magnetic Projections — Empirical Suite';

export const CLASSICAL = {
  coherence: 80,
  irreducibility: 68,
  overall: 74.0,
  free_constants: 26,
};

export const HOLOGRAPHIC = {
  coherence: 98,
  irreducibility: 97,
  overall: 97.5,
  free_invariants: 1, // E_F
};

/** Three-tier validation protocol ids (paper §2). */
export const VALIDATION_TIERS = [
  'tier1_digital_software',
  'tier2_quantum_optical',
  'tier3_macro_biomagnetic',
];

export const SCORECARD_DOMAINS = [
  'observer_field_coupling',
  'force_unification',
  'multi_agent_token_routing',
  'empirical_calibration',
  'cross_domain_portability',
];
