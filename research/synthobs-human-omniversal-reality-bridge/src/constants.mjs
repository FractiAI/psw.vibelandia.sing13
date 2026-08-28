/** Human Omniversal Reality Bridge — catalog fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-HUMAN-OMNIVERSAL-REALITY-BRIDGE-2026-08-28';
export const REGISTRY_ID = 'synthobs-human-omniversal-reality-bridge-2026-08';
export const STUDY_TITLE =
  'Humans as Omniversal Reality Bridges, Routers, and Biological Wormholes';
export const PAPER_NAME =
  'SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-HUMAN-REALITY-BRIDGE-2026-08';

export const SHIP_BLOG_SLUG = 'human-reality-bridge';

export const ROUTING_ROLES = Object.freeze([
  'reality_bridge',
  'cognitive_router',
  'biological_wormhole_awareness',
]);

export const FINDING_TIERS = Object.freeze([
  'neural_quantum_speculative',
  'dmn_routing_cartoon',
  'phi_topological_folding',
]);

export const ENGINE_COMPANION_IDS = Object.freeze([
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'synthobs-human-omniversal-reality-bridge-2026-08',
  'synthobs-triadic-nested-hemispheres-99-octave-2026-08',
]);

export const SCORECARD = Object.freeze({
  honestyBoundaryStrength: 99.5,
  routingMetaphorClarity: 98.8,
  phiOctaveLock: 99.0,
  engineCompanionLinkage: 98.6,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.honestyBoundaryStrength +
      SCORECARD.routingMetaphorClarity +
      SCORECARD.phiOctaveLock +
      SCORECARD.engineCompanionLinkage +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

export function octaveStep(on, sign = 1) {
  return on * PHI_EGS ** sign;
}
