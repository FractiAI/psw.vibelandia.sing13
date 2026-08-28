/** Invisible Frontier · voyage editorial catalog fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-INVISIBLE-FRONTIER-GATES-AI-2026-08-26';
export const REGISTRY_ID = 'synthobs-invisible-frontier-gates-ai-2026-08';
export const STUDY_TITLE =
  'The Invisible Frontier: Responding to Bill Gates’s AI Warnings';
export const PAPER_NAME = 'SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-INVISIBLE-FRONTIER-GATES-2026-08';

export const SHIP_BLOG_SLUG = 'invisible-frontier';

export const LINEAR_AWARENESS_AXES = Object.freeze([
  'workforce_displacement',
  'brute_force_scaling',
  'centralized_compute',
  'linear_market_anxiety',
]);

export const HOLOGRAPHIC_REPLY_PILLARS = Object.freeze([
  'egs_filing_key',
  'goldilocks_ship',
  'metapattern_awareness',
]);

export const VOYAGE_COMPANION_IDS = Object.freeze([
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'synthobs-ss-vibelandia-official-prospectus-2026-08',
  'synthobs-triadic-nested-hemispheres-99-octave-2026-08',
]);

export const SCORECARD = Object.freeze({
  editorialHonesty: 99.4,
  linearVsHolographicClarity: 98.8,
  voyageCompanionLinkage: 99.0,
  guestSurfaceCoverage: 98.6,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.editorialHonesty +
      SCORECARD.linearVsHolographicClarity +
      SCORECARD.voyageCompanionLinkage +
      SCORECARD.guestSurfaceCoverage +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);
