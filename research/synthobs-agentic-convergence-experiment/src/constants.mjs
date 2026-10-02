/** Agentic Convergence Experiment — catalog constants (application companion). */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-AGENTIC-CONVERGENCE-EXPERIMENT-2026-10-02';
export const REGISTRY_ID = 'synthobs-agentic-convergence-experiment-2026-10';
export const STUDY_TITLE =
  'Agentic Convergence Experiment — Blind Independent Optimizers (Catalog Suite)';
export const PAPER_NAME = 'SYNTHOBS_AGENTIC_CONVERGENCE_EXPERIMENT_EGS_2026-10.md';
export const SHIP_BLOG_SLUG = 'agentic-convergence';
export const SHIP_BLOG_FILE = 'blog-agentic-convergence-2026-10.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-agentic-convergence-experiment';

/** Tokens that must never appear in agent objectives / prompts (blind protocol). */
export const FORBIDDEN_AGENT_TOKENS = Object.freeze([
  'fractal',
  'holographic',
  'goldilocks',
  'infinite octave',
  'infinite octaves',
  'recursive homeostasis',
  'phi_egs',
  'φ_egs',
  'φ',
  'ahois',
]);

/** Shared least-cost objective wording shown to every agent (no target vocabulary). */
export const AGENT_OBJECTIVE =
  'Maximize useful predictive information extracted per unit of observation and computation while maintaining predictive performance on held-out samples.';

export const LANDSCAPE_SEED = 0xace2026;
export const HELD_OUT_SEED = 0xace2027;
export const SERIES_LEN = 256;
export const BUDGET_STEPS = 48;

/** Convergence gate: mean structured-property score of explorers vs flat control. */
export const CONVERGENCE_MARGIN = 0.12;
/** Portability gate: held-out mean explorer score must stay above control by this margin. */
export const PORTABILITY_MARGIN = 0.08;

export const AHOIS_PATH = Object.freeze([
  'conventional representation',
  'apparent nuisance',
  'alternative representation',
  'hidden information',
  'useful encoding',
  'adaptive measurement',
]);

export const HONESTY =
  'Application companion Soft Story / catalog fixtures. Not ENGINE_SHELF. Not finished physics. Fixture-agent convergence ≠ live multi-LLM proof. Φ_EGS is design grammar used only in post-hoc honesty rails — never in agent objectives. Literature scan is curated, not exhaustive meta-analysis.';
