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
  'e × φ × Prime Recursive Homeostasis — Unified Architecture + D/D2 + IA + IA-R + IA-Δ + held-out';
export const PAPER_NAME = 'SYNTHOBS_E_PHI_PRIME_RECURSIVE_HOMEOSTASIS_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'e-phi-prime-recursive-homeostasis';
export const SHIP_BLOG_FILE = 'blog-e-phi-prime-recursive-homeostasis-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-e-phi-prime-recursive-homeostasis';

/** V1 free-run protocol (locked development evidence). */
export const PROTOCOL_VERSION_V1 = 'EPH-RH-2026-09-28';
/** EPH-RH-D matched-budget matrix (locked diagnostic evidence). */
export const PROTOCOL_VERSION_D = 'EPH-RH-D-2026-09-28';
/** EPH-RH-D2 adaptive / loss-aware / coupled (locked withhold). */
export const PROTOCOL_VERSION_D2 = 'EPH-RH-D2-2026-09-28';
/** EPH-IA information-architecture mechanism test (locked withhold). */
export const PROTOCOL_VERSION_IA = 'EPH-IA-2026-09-29';
/** EPH-IA-R e-reversibility + dual-state (locked withhold; E2 three-axis signal). */
export const PROTOCOL_VERSION_IAR = 'EPH-IA-R-2026-09-29';
/** EPH-IA-Δ selective reconciliation on development fixtures (locked). */
export const PROTOCOL_VERSION_IAD = 'EPH-IA-DELTA-2026-09-29';
/** Live protocol: EPH-IA-Δ held-out confirmation (frozen e + ρ). */
export const PROTOCOL_VERSION = 'EPH-IA-DELTA-HO-2026-09-29';

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
 * EPH-RH-D multidimensional engine gate (locked matched-budget evidence).
 * Superseded for pin decisions by D2_GATE (loss-aware F / adaptive φ / coupled).
 */
export const DIAGNOSTIC_GATE = Object.freeze({
  require_E_above_A: true,
  require_B_below_A: true,
  require_D_positive: true,
  require_D_bounded: true,
  require_efficiency_above_A: true,
  require_beat_matched_containment_efficiency: true,
  engine_shelf_requires_gate: false, // superseded by D2_GATE
  note: 'EPH-RH-D gate is locked diagnostic evidence; engine pin follows D2_GATE.',
});

/**
 * EPH-RH-D2 gate — exact Q, loss-aware F, adaptive φ, coupled interaction.
 * Locked diagnostic evidence; engine pin follows IA_GATE.
 */
export const D2_GATE = Object.freeze({
  require_F_above_A: true,
  require_F_above_matched_nonprime: true,
  require_L_below_A: true,
  require_B_below_A: true,
  require_deltaX_positive: true,
  require_coupled_beats_sequential: true,
  require_adaptive_beats_openloop: true,
  engine_shelf_requires_gate: false, // superseded by IA_GATE
  note: 'EPH-RH-D2 gate is locked diagnostic evidence; engine pin follows IA_GATE.',
});

/**
 * EPH-IA gate — information lifecycle (encode→store→transform→retrieve→reconstruct).
 * Locked withhold evidence; engine pin follows IAR_GATE.
 */
export const IA_GATE = Object.freeze({
  require_IFE_above_A: true,
  require_IFE_above_B: true,
  require_RCR_above_A: true,
  require_RCR_above_B: true,
  require_B_below_A: true,
  require_full_beats_best_single: true,
  require_full_beats_best_pair: true,
  require_superadditive: true,
  superadditive_margin: 0.02,
  engine_shelf_requires_gate: false, // superseded by IAR_GATE
  note: 'EPH-IA gate is locked withhold evidence; engine pin follows IAR_GATE.',
});

/**
 * EPH-IA-R gate — e reversibility + dual-state verify/commit.
 * Locked withhold evidence (E2 three-axis signal frozen). Engine pin follows IAD_GATE.
 */
export const IAR_GATE = Object.freeze({
  require_gated_RCR_above_e_forward: true,
  require_gated_RCR_above_A: true,
  require_E_over_loss_above_e_forward: true,
  require_E_over_loss_above_A: true,
  require_commit_rate_positive: true,
  require_useful_E_positive: true,
  require_identity_preserved: true,
  rcr_margin: 0.05,
  engine_shelf_requires_gate: false, // superseded by IAD_GATE
  note: 'EPH-IA-R gate is locked withhold evidence; E2 three-axis freeze feeds EPH-IA-Δ; engine pin follows IAD_HO_GATE.',
});

/**
 * EPH-IA-Δ gate — development fixtures (locked).
 * Settled pin follows IAD_HO_GATE (held-out).
 */
export const IAD_GATE = Object.freeze({
  require_E2_three_axis: true,
  require_reconcile_three_axis: true,
  require_reconcile_beats_E4_on_E: true,
  require_reconcile_RCR_above_E4: true,
  require_useful_commit_rate_floor: true,
  useful_commit_rate_floor: 0.1,
  require_e_frozen: true,
  engine_shelf_requires_gate: false, // superseded by IAD_HO_GATE
  note: 'Development Δ fixture evidence. Settled pin follows IAD_HO_GATE.',
});

/**
 * EPH-IA-Δ-HO gate — held-out confirmation beside frozen e + ρ.
 */
export const IAD_HO_GATE = Object.freeze({
  require_dev_iad_pass: true,
  require_E2_three_axis: true,
  require_reconcile_three_axis: true,
  require_reconcile_beats_E4_on_E: true,
  require_reconcile_RCR_above_E4: true,
  require_useful_commit_rate_floor: true,
  useful_commit_rate_floor: 0.1,
  require_e_frozen: true,
  require_rho_frozen: true,
  engine_shelf_requires_gate: true,
  note: 'Do not retune e or ρ on held-out. Confirm fixture Δ replicates.',
});

/** φ×e interaction formulations under test (not declared EGS a priori). */
export const PHI_E_FORMULATIONS = Object.freeze([
  'sequential_e_then_phi',
  'e_pow_k_phi',
  'phi_times_e_k',
  'magnitude_e_structure_phi',
]);

export const HONESTY =
  'Exploratory computational catalog suite for a unified e+φ+prime recursive architecture. V1/D/D2/IA nulls and EPH-IA-R E2 directional signal (useful commit=0) are locked. EPH-IA-Δ development fixture evidence is locked. Live pin follows EPH-IA-Δ-HO held-out confirmation with e+ρ frozen — three-axis Goldilocks + Useful Commit Rate. Soft Story / fixture evidence only. Does not claim physical law, CODATA replacement, clinical validation, finished homeostasis proof, or that e×φ×prime are causal constants.';