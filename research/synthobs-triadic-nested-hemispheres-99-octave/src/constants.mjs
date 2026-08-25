/** Triadic Nested Hemispheres · 99 Octave — catalog fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TRIADIC-NESTED-HEMISPHERES-99-OCTAVE-2026-08-25';
export const REGISTRY_ID = 'synthobs-triadic-nested-hemispheres-99-octave-2026-08';
export const STUDY_TITLE =
  'Triadic Nested Hemispheric Architectures: Harmonic Scaling, Node Topology, and Agent Containment via El Gran Sol’s Fractal Constant';
export const PAPER_NAME = 'SYNTHOBS_TRIADIC_NESTED_HEMISPHERES_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-TRIADIC-HEMISPHERES-99-OCTAVE-2026-08';

export const R0 = 1;
export const R1 = R0;
export const R2 = R0 * PHI_EGS;
export const R3 = R0 * PHI_EGS ** 2;

export const TIER_LABELS = Object.freeze([
  'host_singularity_core',
  'goldilocks_amphitheater',
  'omni_horizon_atmosphere',
]);

export const AGENT_TIERS = Object.freeze([
  'host_root_kernel',
  'goldilocks_agent_swarm',
  'horizon_sensory_gateway',
]);

/** Differential volume budget labels (relative to V1). */
export const BUDGET_CORE = 1;
export const BUDGET_MID = 2 * PHI_EGS;
export const BUDGET_OUTER = 2 * PHI_EGS ** 4;

export const SCORECARD = Object.freeze({
  radialAdditiveLock: 99.5,
  areaVolumeConsistency: 99.2,
  theaterMapClarity: 98.6,
  honestyBoundaryStrength: 99.4,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.radialAdditiveLock +
      SCORECARD.areaVolumeConsistency +
      SCORECARD.theaterMapClarity +
      SCORECARD.honestyBoundaryStrength +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

export function hemisphereVolume(r) {
  return (2 / 3) * Math.PI * r ** 3;
}

export function domeArea(r) {
  return 2 * Math.PI * r ** 2;
}
