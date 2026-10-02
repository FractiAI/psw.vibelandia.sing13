/** Beyond CRISPR — Biological Discovery Challenge (application companion). */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-BEYOND-CRISPR-BIOLOGICAL-DISCOVERY-2026-10-02';
export const REGISTRY_ID = 'synthobs-beyond-crispr-biological-discovery-2026-10';
export const STUDY_TITLE =
  'Beyond CRISPR — Biological Discovery Challenge (Catalog Suite)';
export const PAPER_NAME = 'SYNTHOBS_BEYOND_CRISPR_BIOLOGICAL_DISCOVERY_EGS_2026-10.md';
export const SHIP_BLOG_SLUG = 'beyond-crispr-discovery';
export const SHIP_BLOG_FILE = 'blog-beyond-crispr-discovery-2026-10.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-beyond-crispr-biological-discovery';

/**
 * Framework tokens that must never steer candidate scoring as confirmatory goals.
 * Discovery scores are literature/architecture grounded; Φ appears only in honesty rails.
 */
export const FORBIDDEN_CONFIRMATION_TOKENS = Object.freeze([
  'prove infinite octave',
  'confirm fractal biology',
  'prove holographic dna',
  'goldilocks gene',
  'phi_egs biology proof',
]);

/** Core discovery question (verbatim protocol). */
export const DISCOVERY_QUESTION =
  'Does biology contain a distributed molecular system that senses a state, transforms or encodes information about that state, preserves some representation of it, and uses that information to alter subsequent biological behavior?';

/** Independent score axes — do not collapse into a single crown without justification. */
export const SCORE_AXES = Object.freeze([
  'novelty',
  'recurrence',
  'independence',
  'modularity',
  'informationFlow',
  'memory',
  'feedback',
  'multiScale',
  'evolutionaryConstraint',
  'experimentalTractability',
]);

/** Minimum candidates and literature rows for suite pass. */
export const MIN_CANDIDATES = 8;
export const MIN_LITERATURE = 8;
/** Shortlist size for wet-lab triage (Phase 3): protect against falling in love with one pattern. */
export const SHORTLIST_MIN = 3;
export const SHORTLIST_MAX = 5;

/**
 * Literature classification — independent of queue sort.
 * positive_control = known architecture used to validate that the protocol recovers distributed info-flow.
 * genuinely_unexplained = function / complete architecture not adequately explained by published work.
 */
export const LITERATURE_STATUS = Object.freeze([
  'known',
  'partially_known',
  'genuinely_unexplained',
  'positive_control',
]);

/** Queue sort uses researchInterest — not a declared winner. */
export const QUEUE_HONESTY =
  'Ranked research queue sorts by researchInterest for triage only. No candidate is crowned a discovery. Positive-control rediscovery ≠ novel biology.';

export const HONESTY =
  'Application companion Soft Story / catalog discovery protocol. Not ENGINE_SHELF. Not wet-lab CRISPR replacement. Not finished biology law. Candidate scores are literature-grounded fixtures for falsifiable triage — not experimental confirmation. CBASS/Thoeris (C4) is a positive-control rediscovery case, not a claim of newly discovered biology. Discovery focus is genuinely_unexplained gap architectures. Φ_EGS is design grammar in honesty rails only. Literature scan is curated, not PRISMA. Do not manufacture novelty.';