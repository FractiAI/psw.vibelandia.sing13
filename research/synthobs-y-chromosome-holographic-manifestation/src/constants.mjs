/** Y Chromosome Holographic Manifestation — catalog fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-Y-CHROMOSOME-HOLOGRAPHIC-MANIFESTATION-2026-08-28';
export const REGISTRY_ID = 'synthobs-y-chromosome-holographic-manifestation-2026-08';
export const STUDY_TITLE =
  'The Holographic Manifestation: Y Chromosome as Direct Expression of El Gran Sol\'s Fractal Constant';
export const PAPER_NAME = 'SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-Y-CHROMOSOME-MANIFESTATION-2026-08';

export const SHIP_BLOG_SLUG = 'y-chromosome-manifestation';
export const ASSOCIATED_DESIGNATION = 'Sunspot AR 3664, Behemoth';

export const PALINDROME_INDICES = Object.freeze([-4, -2, 0, 2, 4]);

export const MANIFESTATION_TIERS = Object.freeze([
  'palindrome_phi_scaling',
  'sry_phase_origin',
  'cross_species_invariance_hypothesis',
]);

export const ENGINE_COMPANION_IDS = Object.freeze([
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'synthobs-y-chromosome-holographic-manifestation-2026-08',
  'synthobs-y-chromosome-holographic-2026-07',
]);

export const SCORECARD = Object.freeze({
  honestyBoundaryStrength: 99.4,
  manifestationGrammarClarity: 98.8,
  phiOctaveLock: 99.0,
  engineCompanionLinkage: 98.7,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.honestyBoundaryStrength +
      SCORECARD.manifestationGrammarClarity +
      SCORECARD.phiOctaveLock +
      SCORECARD.engineCompanionLinkage +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

export function palindromeScale(p0, n) {
  return p0 * PHI_EGS ** n;
}
