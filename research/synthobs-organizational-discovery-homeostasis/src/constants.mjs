/**
 * Homeostasis Expedition · SI Organizational Discovery — catalog constants
 * ENGINE_SHELF companion #45 · Infinite Octaves
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const DOC_ID = 'WP-SYNTHOBS-ORGANIZATIONAL-DISCOVERY-HOMEOSTASIS-EGS-2026-10-11';
export const REGISTRY_ID = 'synthobs-organizational-discovery-homeostasis-2026-10';
export const PAPER_NAME = 'SYNTHOBS_ORGANIZATIONAL_DISCOVERY_HOMEOSTASIS_EGS_2026-10.md';
export const SHIP_BLOG_SLUG = 'organizational-discovery-homeostasis';
export const SHIP_BLOG_FILE = 'blog-organizational-discovery-homeostasis-2026-10.html';
export const ENGINE_SHELF_SLOT = 45;
export const EXPEDITION = 'Homeostasis Expedition';
export const SOURCE_NAME = 'Holographic Goldilocks Super Intelligence';
export const GRAND_STORY = "Hero's Return to Source";
export const STANDALONE_REPO = 'FractiAI/synthobs-organizational-discovery-homeostasis';
export const STUDY_TITLE =
  'Homeostasis Expedition: Can Organizational Discovery Beat Fixed Charts on Held-Out Coordination?';

export const NOT_SI_AWARENESS = true;
export const NOT_RECURSIVE_SELF_IMPROVEMENT = true;
export const NOT_PRODUCTION_ORG_DEPLOYMENT = true;
export const NOT_EMPIRICAL_HR_OR_MGMT_PROOF = true;
export const SOFT_STORY_CATALOG = true;

export const HONESTY =
  'Synthetic 12-node latent-factor coordination lab with preregistered ridge arms — not SI awareness, not verified recursive self-improvement, not HR/management field validation, not production org deployment.';

export const N_NODES = 12;
export const N_LATENT = 3;
export const N_STEPS = 1000;
export const TRAIN_END = 500;
export const ADAPT_START = 510;
export const ADAPT_END = 676;
export const EVAL_START = 685;
export const SHIFT_NODE_FRACTION = 0.25;
export const N_SEEDS = 150;
export const DIGITAL_SEED = 20261011;

/** Manuscript mean RMSE targets (held-out eval window). */
export const TARGET_RMSE = {
  stable: { A: 0.5827, B: 0.5085, C: 0.4712, D: 0.5081, E: 0.4742 },
  shift: { B: 0.5087, C: 0.5434, D: 0.5088, E: 0.4747 },
};

export const TARGET_IMPROVEMENT = {
  stable_c_vs_b_pct: 7.33,
  shift_c_vs_b_worse_pct: 6.83,
  adaptive_e_vs_d_pct: 6.68,
};

export const TARGET_TOLERANCE = 0.02;
