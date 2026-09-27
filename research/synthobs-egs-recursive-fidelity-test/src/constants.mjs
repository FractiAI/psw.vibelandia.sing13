/**
 * ERFT — EGS Recursive Fidelity Test
 * Falsifiable recursive-drift experiment. Does NOT assume Φ is correct.
 * Live protocol: ERFT-V5-2026-09-27
 *   V5 separates ERFT-C (constant-neutral) from ERFT-G (generalized closure).
 *   V4 confounded numerical c with Φ-specific grammar (retired as primary).
 *   V3 confounded c→geometry; V2 sin; V1 construction bias.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.618033988749895
export const SQRT2 = Math.SQRT2;
export const E_CONST = Math.E;

export const DOC_ID = 'WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25';
export const REGISTRY_ID = 'synthobs-egs-recursive-fidelity-test-erft-2026-09';
export const STUDY_TITLE =
  'EGS Recursive Fidelity Test (ERFT) · Version Five — Constant-Neutral + Grammar Split';
export const PAPER_NAME = 'SYNTHOBS_EGS_RECURSIVE_FIDELITY_TEST_ERFT_2026-09.md';
export const SHIP_BLOG_SLUG = 'erft-recursive-fidelity';
export const SHIP_BLOG_FILE = 'blog-erft-recursive-fidelity-2026-09.html';
export const STANDALONE_REPO = 'https://github.com/FractiAI/synthobs-egs-recursive-fidelity-test';

/** Pre-registered generation depth. */
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

/** Depths for depth-dependent optima c*_n (audit §26). */
export const DEPTH_OPTIMA_NS = Object.freeze([1, 2, 4, 8, 16, 24]);

/** Seeded random-constant arm draws (reproducible). */
export const RANDOM_ARM_SEED = 0xE6F7;
export const RANDOM_ARM_COUNT = 4;
export const RANDOM_ARM_LO = 1.05;
export const RANDOM_ARM_HI = 2.45;

/** Bootstrap resamples for paired Δ CI (matched cells). */
export const BOOTSTRAP_RESAMPLES = 400;
export const BOOTSTRAP_SEED = 0xc0ff;

/** Mechanisms under test (identical recursion topology; only c changes in ERFT-C). */
export const MECHANISMS = Object.freeze([
  'scaling',
  'recursive_weighting',
  'hierarchical_resolution',
  'recursive_feedback',
  'recursive_compression',
]);

/**
 * V5 locks — two experiment layers must not be conflated:
 * ERFT-C: constant-neutral (identical algorithm; only scalar c).
 * ERFT-G: generalized closure C(c) available to every arm (symmetric grammar).
 */
export const ANTI_BASELINE_BIAS = Object.freeze({
  version: 5,
  rule:
    'ERFT-C: transform severity fixed; c injects only as normalized nest weights; lags/blocks/period are generation-matched (identical across arms). ERFT-G: same weights + generalized self-similar re-entry C(c) for every arm — no Φ-only affordance. V4 Φ-exact-only closure is retired as primary.',
  fixed_block: 4,
  fixed_feedback_gain: 0.45,
  fixed_mix_weight: 0.5,
  layers: Object.freeze(['ERFT-C', 'ERFT-G']),
});

export const PROTOCOL_VERSION = 'ERFT-V5-2026-09-27';

/**
 * Engineering significance threshold (not a statistically validated effect size).
 * Documented post-V4 audit — used only as an operational reporting band.
 */
export const ENGINEERING_THRESHOLD_PCT = 0.15;

export const PRE_REGISTERED_HYPOTHESIS = Object.freeze({
  claim:
    'Q1 (ERFT-C): Does numerical c=Φ reduce drift under a constant-neutral recursion? Q2: Is Φ unusually low vs continuous c? Q3 (ERFT-G): Does generalized algebraic closure C(c) add stability, and does Φ benefit disproportionately?',
  null_ok: true,
  win_requires: [
    'lower cumulative RFD vs baseline at depth N under ERFT-C (constant-neutral)',
    'advantage across ≥3 independent domains',
    'survives decoy constants (√2, e, blind ladder)',
    'survives held-out series',
    'not a single-metric fluke',
    'paired Δ_i reported (not mean-only)',
  ],
  suite_pass_means:
    'Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.',
  anti_baseline_bias:
    'Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms.',
  v4_confound_note:
    'ERFT-V4 combined numerical c with Φ-specific partition identity and Φ-only self-similar closure. V5 separates those effects.',
  engineering_threshold:
    '15% is an engineering significance threshold, not a statistically validated effect threshold.',
});

export const HONESTY =
  'ERFT V5 separates constant-neutral recursion (ERFT-C) from symmetric generalized-closure grammar (ERFT-G). V4 evidence remains exploratory for the combined Φ-enabled architecture and does not isolate numerical Φ alone. Suite pass = protocol integrity; empirical Φ advantage is a measured outcome that may fail. Not CODATA; not AGI safety proof.';
