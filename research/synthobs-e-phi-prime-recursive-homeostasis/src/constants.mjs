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
  'e × φ × Prime Recursive Homeostasis — Unified Architecture + EPH-RH-D Diagnostic Matrix';
export const PAPER_NAME = 'SYNTHOBS_E_PHI_PRIME_RECURSIVE_HOMEOSTASIS_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'e-phi-prime-recursive-homeostasis';
export const SHIP_BLOG_FILE = 'blog-e-phi-prime-recursive-homeostasis-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-e-phi-prime-recursive-homeostasis';

/** V1 free-run protocol (locked development evidence). */
export const PROTOCOL_VERSION_V1 = 'EPH-RH-2026-09-28';
/** Live protocol: diagnostic matrix beside V1. */
export const PROTOCOL_VERSION = 'EPH-RH-D-2026-09-28';

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

/**
 * V1 Goldilocks hit-rate gate (locked historical). Kept for V1 readout only.
 * Engine pin now uses DIAGNOSTIC_GATE (matched-budget multidimensional).
 */
export const SIGNIFICANCE_GATE = Object.freeze({
  goldilocks_margin: 0.15,
  require_bleed_below_baseline: true,
  require_positive_evolution: true,
  require_beat_randomized: true,
  engine_shelf_requires_gate: false, // superseded by EPH-RH-D multidimensional gate
  note: 'V1 Goldilocks hit-rate gate is development evidence only; see DIAGNOSTIC_GATE.',
});

/**
 * EPH-RH-D multidimensional engine gate (matched transformation budget).
 * Succeeds only with evolution-with-containment advantage, not band-hit alone.
 */
export const DIAGNOSTIC_GATE = Object.freeze({
  require_E_above_A: true,
  require_B_below_A: true,
  require_D_positive: true,
  require_D_bounded: true,
  require_efficiency_above_A: true,
  require_beat_matched_containment_efficiency: true,
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
  'Exploratory computational catalog suite for a unified e+φ+prime recursive architecture. V1 free-run Goldilocks hit-rate null is locked development evidence (Control A under-transformed). EPH-RH-D diagnostic matrix uses matched transformation budget, evolution efficiency E/(D+ε), φ-as-regulator, prime vs matched non-prime containment, order permutations, and perturbation recovery. Soft Story / fixture evidence only. Does not claim physical law, CODATA replacement, clinical validation, or finished homeostasis proof. Engine pin requires the EPH-RH-D multidimensional gate.';
