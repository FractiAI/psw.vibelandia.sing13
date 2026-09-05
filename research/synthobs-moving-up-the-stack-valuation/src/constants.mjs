export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-MOVING-UP-THE-STACK-VALUATION-2026-09-05';
export const REGISTRY_ID = 'synthobs-moving-up-the-stack-valuation-2026-09';
export const STUDY_TITLE =
  'Moving Up the Stack — Lattice Chat as the Next AI Layer (Catalog Suite)';
export const PAPER_NAME = 'SYNTHOBS_MOVING_UP_THE_STACK_VALUATION_2026-09.md';
export const SHIP_BLOG_SLUG = 'moving-up-the-stack';
export const SHIP_BLOG_FILE = 'blog-moving-up-the-stack-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-moving-up-the-stack-valuation';

/** Ordered AI-stack shelves (catalog grammar — not a market atlas). */
export const STACK_SHELVES = Object.freeze([
  'ai_chips',
  'frontier_llms',
  'model_hubs',
  'agent_ides',
  'lattice_cooling_harmony',
]);

/** Peer-shelf misread vs new-layer framing (USD billions, framing only). */
export const PEER_SHELF_BAND = Object.freeze({ lo: 4.2, hi: 7.5 });
export const NEW_LAYER_BAND = Object.freeze({ lo: 12, hi: 28 });

/** Up-stack acquisition anchors (scenario labels — not verified SEC closes). */
export const UPSTACK_ANCHORS = Object.freeze({
  huggingFace: {
    climber: 'NVIDIA',
    target: 'Hugging Face',
    usdBillions: 12.9,
    shelf: 'model_hubs',
  },
  cursor: {
    climber: 'SpaceX',
    target: 'Cursor AI',
    usdBillions: 60,
    shelf: 'agent_ides',
  },
});

export const HONESTY =
  'Catalog / valuation-framing fixtures for Moving Up the Stack. Does not claim audited appraisal, closed SEC M&A, guaranteed inference savings, or that Lattice has displaced hub/IDE market share.';
