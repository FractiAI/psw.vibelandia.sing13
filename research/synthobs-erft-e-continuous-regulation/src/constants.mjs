/**
 * ERFT-E — Continuous Constant Regulation + Confirmatory Held-Out
 *
 * Follow-on expedition after ERFT-V5 (C/G locked) and ERFT-D (dynamic discrete weakened).
 * Does NOT rewrite V5/D conclusions. φ remains a peer candidate.
 *
 * Engine inclusion is gated: only pin to Infinite Octaves ENGINE_SHELF if the
 * pre-registered significant-improvement criteria all pass on held-out fixtures.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const SQRT2 = Math.SQRT2;
export const E_CONST = Math.E;

export const DOC_ID = 'WP-SYNTHOBS-ERFT-E-CONTINUOUS-REGULATION-2026-09-28';
export const REGISTRY_ID = 'synthobs-erft-e-continuous-regulation-2026-09';
export const STUDY_TITLE =
  'ERFT-E · Continuous Constant Regulation + Confirmatory Held-Out Expedition';
export const PAPER_NAME = 'SYNTHOBS_ERFT_E_CONTINUOUS_REGULATION_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'erft-e-continuous-regulation';
export const SHIP_BLOG_FILE = 'blog-erft-e-continuous-regulation-2026-09.html';
export const STANDALONE_REPO = 'https://github.com/FractiAI/synthobs-erft-e-continuous-regulation';

export const PROTOCOL_VERSION = 'ERFT-E-2026-09-28';
export const PRESERVES_V5 = true;
export const PRESERVES_ERFT_D = true;

export const GENERATIONS = 24;

/** NEW confirmatory fixture family — frozen before looking (not V5 development seeds). */
export const HOLD_SEED = 0xe8001;
export const TRAIN_SEED = 0xe7001;
export const CONTROLLER_SEED = 0xe9001;

export const SERIES_LEN = 96;
export const GENERATIONS_DEPTH = GENERATIONS;

export const NAMED_ARMS = Object.freeze({
  baseline: 1.0,
  sqrt2: SQRT2,
  egs: PHI_EGS,
  e: E_CONST,
});

export const C_MIN = 1.0;
export const C_MAX = 2.5;
export const CONTINUOUS_GRID_STEP = 0.05;

export const MECHANISMS = Object.freeze([
  'scaling',
  'recursive_weighting',
  'hierarchical_resolution',
  'recursive_feedback',
  'recursive_compression',
]);

/** Development kinds (train / controller selection). */
export const TRAIN_KINDS = Object.freeze([
  'logistic',
  'ar1',
  'seasonal',
  'powerlaw',
  'co2_proxy',
]);

/** Confirmatory held-out kinds — frozen novel family. */
export const HOLD_KINDS = Object.freeze([
  'chirp',
  'step_recovery',
  'heavy_tail',
  'dual_season',
  'mean_reverting_jump',
]);

/**
 * Matched to ERFT-C anti-bias locks (constant-neutral recursion).
 * Copied as values so ERFT-E stays self-contained / standalone-publishable.
 */
export const ANTI_BASELINE_BIAS = Object.freeze({
  version: 5,
  fixed_block: 4,
  fixed_feedback_gain: 0.45,
  fixed_mix_weight: 0.5,
});

/** Engineering reporting band — not a validated effect size. */
export const ENGINEERING_THRESHOLD_PCT = 0.15;

/**
 * Pre-registered ENGINE_SHELF inclusion gate.
 * All must pass on confirmatory held-out. Failure → application companion only.
 */
export const ENGINE_INCLUSION_GATE = Object.freeze({
  id: 'ERFT-E-ENGINE-GATE-2026-09-28',
  requires: Object.freeze([
    'best_dynamic_mean_nrmse <= best_fixed_mean_nrmse * (1 - 0.15)',
    'same direction on confirmatory held-out family',
    'complexity_adjusted_score >= 0.05 (improvement_pct / log(1+params+mean_switches))',
    'paired bootstrap 95% CI on Δ = best_fixed - best_dynamic excludes 0 favoring dynamic',
    'advantage does not require Φ-only affordance or Φ privilege',
  ]),
  on_fail: 'Do NOT add to Infinite Octaves ENGINE_SHELF; ship as application companion only.',
  on_pass:
    'Eligible for ENGINE_SHELF companion pin after PRA Snap + sync:lattice-pem.',
});

export const PRE_REGISTERED_HYPOTHESIS = Object.freeze({
  claim:
    'Q1: On a new confirmatory held-out fixture family, do discrete dynamic policies beat best fixed? Q2: Does continuous c_n∈[1,2.5] regulation beat best fixed by a pre-registered complexity margin? Q3: Should ERFT-E enter ENGINE_SHELF?',
  null_ok: true,
  preserves:
    'ERFT-V5 mixed/null numerical φ and ERFT-D weakened dynamic-discrete remain intact — not reinterpreted.',
  suite_pass_means:
    'Protocol executed reproducibly with locked gates — NOT that continuous regulation won, and NOT that ENGINE_SHELF inclusion is automatic.',
});

export const HONESTY =
  'ERFT-E is a controlled catalog expedition — confirmatory held-out + continuous regulation follow-on. It does not rewrite ERFT-V5 or ERFT-D. Suite pass ≠ φ crown ≠ ENGINE_SHELF pin. Engine inclusion requires the pre-registered significant-improvement gate. Catalog Soft Story / fixtures only — not CODATA, clinical, or AGI-safety proof.';
