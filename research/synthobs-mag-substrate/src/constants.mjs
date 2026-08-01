export const E_F = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);
/** Golden angle in degrees: 360 / φ² */
export const GOLDEN_ANGLE_DEG = 360 / (E_F * E_F);

export const DOC_ID = 'WP-SYNTHOBS-MAG-SUBSTRATE-2026-07-30-REV2';
export const REGISTRY_ID = 'synthobs-mag-substrate-2026-07';
export const STUDY_TITLE =
  'Magnetism as the Universal Foundational Substrate — Empirical Suite';

export const STANDARD = {
  coherence: 82,
  irreducibility: 70,
  overall: 76.0,
  free_constants: 26,
  fundamental_interactions: 4,
};

export const OMNI = {
  coherence: 97,
  irreducibility: 95,
  overall: 96.0,
  free_invariants: 1, // E_F
  fundamental_interactions: 1, // magnetic substrate map
};

export const SCORECARD_DOMAINS = [
  'quantum_spin_coherence',
  'chemical_bond_unification',
  'biological_macromolecular_organization',
  'empirical_calibration',
  'cross_domain_portability',
];
