/**
 * Homeostasis Expedition · Computation Workhorse Science — catalog constants
 * ENGINE_SHELF companion #46
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-COMPUTATION-WORKHORSE-SCIENCE-EGS-2026-10-13';
export const REGISTRY_ID = 'synthobs-computation-workhorse-science-2026-10';
export const PAPER_NAME = 'SYNTHOBS_COMPUTATION_WORKHORSE_SCIENCE_EGS_2026-10.md';
export const SHIP_BLOG_SLUG = 'computation-workhorse-science';
export const SHIP_BLOG_FILE = 'blog-computation-workhorse-science-2026-10.html';
export const STANDALONE_REPO = 'https://github.com/FractiAI/synthobs-computation-workhorse-science';

export const ENGINE_SHELF_SLOT = 46;
export const EXPEDITION = 'Homeostasis Expedition';
export const GRAND_STORY = "Hero's Return to Source";

export const STUDY_TITLE =
  'Should Computation Become the Primary Workhorse of Science? — Computational Discovery, Research Economics, Scientific Integrity, and the Discovery-to-Implementation Pipeline';

/** Synthetic CW-2 executed; real-world superiority not claimed. */
export const SIMULATION_EXECUTED = true;
export const SYNTHETIC_ONLY = true;
export const REAL_WORLD_SUPERIORITY_NOT_ESTABLISHED = true;
export const FINDINGS_NOT_ESTABLISHED = false;
export const NOT_COMPLETED_SIMULATION = false;
export const AWAITING_EXECUTION = false;
export const SOFT_STORY_CATALOG = true;

export const CW2_MODEL = 'cw2-throughput-v4-integrity-ramp';

export const HONESTY =
  'CW-2 throughput synthetic simulation (computation daily screening vs wet-lab sequential bench; seed 20261013, 200 reps). Declared marginal costs — not calibrated to real grant portfolios; does not alone establish real-world superiority.';

export const CONDITIONS = Object.freeze([
  { id: 'A', env: 'computation-first', pipeline: false },
  { id: 'B', env: 'computation-first', pipeline: true },
  { id: 'C', env: 'wet-lab-first', pipeline: false },
  { id: 'D', env: 'wet-lab-first', pipeline: true },
]);

export const COST_CATEGORIES = Object.freeze([
  'researcher',
  'compute',
  'data',
  'facilities',
  'equipment',
  'materials',
  'validation',
  'failed_work',
  'implementation',
  'pipeline',
  'overhead',
]);

export const PRIMARY_ENDPOINTS = Object.freeze([
  'substantive_validated_within_365',
  'validated_implemented_within_365',
  'measurable_progress_within_365',
  'cost_per_validated_discovery',
  'cost_per_measurable_outcome',
]);

export const CALENDAR_HORIZON_DAYS = 365;
export const PRESPECIFIED_REPETITIONS = 200;
export const PRODUCTIVE_HOURS_BASE = 1760;
export const PILOT_REPETITIONS = 10;
export const DIGITAL_SEED = 20261013;
