export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
export const GOLDEN_ANGLE_DEG = 360 / (E_F * E_F);

export const DOC_ID = 'WP-SYNTHOBS-TBME-PHASE-TOXICITY-FULL-REV2-2026-07-31';
export const REGISTRY_ID = 'synthobs-phase-toxicity-2026-07';
export const STUDY_TITLE =
  'Phase-Modulated Toxicity & Resonance Safety Transitions — Empirical Suite (TBME)';

export const STANDARD = { coherence: 76, irreducibility: 66, overall: 71.0 };
export const OMNI = { coherence: 98, irreducibility: 97, overall: 97.5 };

export const PROTOCOL = {
  pulse_Hz: 16.18,
  sugar_MHz: 1.618,
  theta_egs_deg: GOLDEN_ANGLE_DEG,
  audit_safe_to_unsafe: 6,
  audit_unsafe_to_safe: 6,
};

export const SCORECARD_DOMAINS = [
  'classical_dose_model',
  'phase_dissonance_map',
  'everyday_environmental_audit',
  'empirical_calibration',
  'cross_domain_portability',
  'clinical_non_claim_gate',
];
