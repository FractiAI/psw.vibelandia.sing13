/**
 * ERFT — EGS Recursive Fidelity Test (V2 protocol locks)
 * Falsifiable recursive-drift experiment. Does NOT assume Φ is correct.
 * Live protocol: ERFT-V4-2026-09-26 (V3 nest; V2 sin; V1 coarsening receipt).
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.618033988749895
export const SQRT2 = Math.SQRT2;
export const E_CONST = Math.E;

export const DOC_ID = 'WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25';
export const REGISTRY_ID = 'synthobs-egs-recursive-fidelity-test-erft-2026-09';
export const STUDY_TITLE =
  'EGS Recursive Fidelity Test (ERFT) · Version Four — Engine Grammar Scoreboard';
export const PAPER_NAME = 'SYNTHOBS_EGS_RECURSIVE_FIDELITY_TEST_ERFT_2026-09.md';
export const SHIP_BLOG_SLUG = 'erft-recursive-fidelity';
export const SHIP_BLOG_FILE = 'blog-erft-recursive-fidelity-2026-09.html';
export const STANDALONE_REPO = 'https://github.com/FractiAI/synthobs-egs-recursive-fidelity-test';

/** Pre-registered generation depth for V2. */
export const GENERATIONS = 24;

/** Held-out fraction for constant-sweep validation (anti curve-fitting). */
export const HOLD_OUT_FRACTION = 0.25;

/** Blind / named arms (protocol § five-arm design). */
export const NAMED_ARMS = Object.freeze({
  baseline: 1.0,
  egs: PHI_EGS,
  sqrt2: SQRT2,
  e: E_CONST,
});

/** Blind-constant ladder (protocol § killer control) — φ not labeled special at run time. */
export const BLIND_CONSTANTS = Object.freeze([
  1.0, 1.41421356237, 1.5, PHI_EGS, 1.7, 2.0, E_CONST,
]);

/** Continuous sweep grid for Drift(c). */
export const SWEEP_MIN = 1.0;
export const SWEEP_MAX = 2.5;
export const SWEEP_STEPS = 61; // inclusive endpoints → Δc = 0.025

/** Seeded random-constant arm draws (reproducible). */
export const RANDOM_ARM_SEED = 0xE6F7;
export const RANDOM_ARM_COUNT = 4;
export const RANDOM_ARM_LO = 1.05;
export const RANDOM_ARM_HI = 2.45;

/** Mechanisms under test (identical recursion; only c changes). */
export const MECHANISMS = Object.freeze([
  'scaling',
  'recursive_weighting',
  'hierarchical_resolution',
  'recursive_feedback',
  'recursive_compression',
]);

/**
 * V3 nest-grammar locks — c is the nest partition ratio (1/c, 1−1/c weights).
 * Baseline c=1 uses explicit dyadic 1:1 (not 1/c degeneracy).
 * V2 sin(c) geometry did not model RSI nest closure; V1 tied coarsening to c.
 */
export const ANTI_BASELINE_BIAS = Object.freeze({
  version: 4,
  rule:
    'Transform severity fixed; c selects nest partition. Lags/blocks from Infinite Octaves fixtures: k/81 register, clutch Δ, digit×octave 1–99, odd-prime vaults, structural 2 baseline. Clutch slip scale identical all arms.',
  fixed_block: 4,
  fixed_feedback_gain: 0.45,
  fixed_mix_weight: 0.5,
});

export const PROTOCOL_VERSION = 'ERFT-V4-2026-09-26';

export const PRE_REGISTERED_HYPOTHESIS = Object.freeze({
  claim:
    'If Φ_EGS reduces cumulative recursive fidelity drift vs matched controls, the advantage must appear across domains, mechanisms, decoy constants, and held-out series — without assuming Φ a priori.',
  null_ok: true,
  win_requires: [
    'lower cumulative RFD vs baseline at depth N',
    'advantage across ≥3 independent domains',
    'survives decoy constants (√2, e, blind ladder)',
    'survives held-out series',
    'not a single-metric fluke',
  ],
  suite_pass_means:
    'Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.',
  anti_baseline_bias:
    'Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms.',
});

export const HONESTY =
  'ERFT V4 is a controlled, falsifiable recursive-fidelity protocol: nest partitions plus Infinite Octaves engine fixtures (Φ_EGS, clutch Δ, k/81, octaves 01–99, odd-prime vaults, structural 2). Application companion — not ENGINE_SHELF pin. Does not assume Φ wins, does not claim CODATA replacement or AGI safety. Suite pass = protocol integrity; empirical Φ advantage may fail.';
