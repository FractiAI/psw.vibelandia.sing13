export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
/** Golden angle in degrees: 360 / φ² */
export const GOLDEN_ANGLE_DEG = 360 / (E_F * E_F);

export const DOC_ID = 'WP-SYNTHOBS-PRION-REFOLD-FULL-REV2-2026-07-31';
export const REGISTRY_ID = 'synthobs-prion-refold-2026-07';
export const STUDY_TITLE =
  'Epigenetic Phase-Locking & Prion Refolding Pathways — Empirical Suite (TBME)';

export const STANDARD = {
  coherence: 74,
  irreducibility: 62,
  overall: 68.0,
};

export const OMNI = {
  coherence: 99,
  irreducibility: 97,
  overall: 98.0,
};

export const PROTOCOL = {
  f0_kHz: 16.18,
  f1_MHz: 1.618,
  theta_egs_deg: GOLDEN_ANGLE_DEG,
  B_uT_min: 50,
  B_uT_max: 161.8,
  duration_min: 16.18,
};

export const SCORECARD_DOMAINS = [
  'kinetic_trap_narrative',
  'magnetic_phase_coherence',
  'backbone_torsional_resonance',
  'empirical_calibration',
  'cross_domain_portability',
  'clinical_non_claim_gate',
];
