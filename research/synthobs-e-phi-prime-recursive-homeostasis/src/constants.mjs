/**
 * e × φ × Prime Recursive Homeostasis — exploratory unified architecture.
 *
 * Follow-on from ERFT findings (nothing crowned; dynamic multi-constant failed).
 * Tests ONE combined system: e-dynamics + φ-structure + prime containment.
 * Does NOT assume the hypothesis is true. Engine pin only if live significance gate passes.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.618033988749895
export const E_CONST = Math.E;
export const SQRT2 = Math.SQRT2;

export const DOC_ID = 'WP-SYNTHOBS-E-PHI-PRIME-RECURSIVE-HOMEOSTASIS-2026-09-28';
export const REGISTRY_ID = 'synthobs-e-phi-prime-recursive-homeostasis-2026-09';
export const STUDY_TITLE =
  'e × φ × Prime Recursive Homeostasis — Unified Exploratory Architecture';
export const PAPER_NAME = 'SYNTHOBS_E_PHI_PRIME_RECURSIVE_HOMEOSTASIS_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'e-phi-prime-recursive-homeostasis';
export const SHIP_BLOG_FILE = 'blog-e-phi-prime-recursive-homeostasis-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-e-phi-prime-recursive-homeostasis';

export const PROTOCOL_VERSION = 'EPH-RH-2026-09-28';

/** Pre-registered recursion depth. */
export const GENERATIONS = 24;

/** Series length (must be large enough for prime containers). */
export const SERIES_LEN = 210; // 2·3·5·7

/** Seeded fixture family. */
export const FIXTURE_SEED = 0xe9f1;
export const FIXTURE_COUNT = 8;

/** Candidate primes for containment scheduling. */
export const PRIME_SCHEDULE = Object.freeze([2, 3, 5, 7, 11, 13, 17, 19, 23]);

/** Composite (non-prime) sizes for Control B / ablation matched DOF. */
export const COMPOSITE_SCHEDULE = Object.freeze([4, 6, 8, 9, 10, 12, 14, 15, 16]);

/** Goldilocks drift band (NRMSE vs origin). */
export const D_LOW = 0.05;
export const D_COLLAPSE = 2.5;

/** Bleed ceiling for "minimal bleed" claim (fraction). */
export const BLEED_LOW = 0.08;

/** Significance gate for ENGINE_SHELF candidacy (pre-registered). */
export const SIGNIFICANCE_GATE = Object.freeze({
  /** Combined must beat both controls on Goldilocks hit-rate by this absolute margin. */
  goldilocks_margin: 0.15,
  /** Combined mean bleed must be strictly below Control A mean bleed. */
  require_bleed_below_baseline: true,
  /** Combined mean useful evolution must stay positive. */
  require_positive_evolution: true,
  /** Combined must beat Control B (randomized matched DOF) on Goldilocks hit-rate. */
  require_beat_randomized: true,
  /**
   * Engine shelf inclusion requires significance_gate_pass === true.
   * Exploratory publication proceeds either way; pin only if gate passes.
   */
  engine_shelf_requires_gate: true,
});

/** φ×e interaction formulations under test (not declared EGS a priori). */
export const PHI_E_FORMULATIONS = Object.freeze([
  'sequential_e_then_phi',
  'e_pow_k_phi',
  'phi_times_e_k',
  'magnitude_e_structure_phi',
]);

export const HONESTY =
  'Exploratory computational catalog suite for a unified e+φ+prime recursive architecture. Soft Story / fixture evidence only. Does not claim physical law, CODATA replacement, clinical validation, finished homeostasis proof, or that primality causes zero bleed. Engine pin is withheld unless the pre-registered significance gate passes on live fixtures.';
