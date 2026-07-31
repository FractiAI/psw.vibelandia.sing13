export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
export const GOLDEN_ANGLE_DEG = 360 / (E_F * E_F);

export const DOC_ID = 'WP-SYNTHOBS-TBME-ENDOGENOUS-PHASE-2026-07-31';
export const REGISTRY_ID = 'synthobs-endogenous-phase-2026-07';
export const STUDY_TITLE =
  'Bio-Holographic Phase Modulation via Conscious Intent — Empirical Suite (TBME)';

export const STANDARD = { coherence: 78, irreducibility: 68, overall: 73.0 };
export const OMNI = { coherence: 99, irreducibility: 97, overall: 98.0 };

export const PROTOCOL = {
  breath_Hz: 0.1,
  inhale_s: 5.0,
  exhale_s: 5.0,
  hold_min: 1.618,
  f0_Hz: 1.618,
  theta_egs_deg: GOLDEN_ANGLE_DEG,
  steps: 4,
};

export const SCORECARD_DOMAINS = [
  'exogenous_device_control',
  'endogenous_intent_operator',
  'neural_cardiac_fascial_map',
  'empirical_calibration',
  'cross_domain_portability',
  'clinical_non_claim_gate',
];
