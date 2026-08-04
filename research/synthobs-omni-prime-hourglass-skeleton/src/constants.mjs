export const E_F = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-OMNI-PRIME-HOURGLASS-SKELETON-2026-08-04';
export const REGISTRY_ID = 'synthobs-omni-prime-hourglass-skeleton-2026-08';
export const STUDY_TITLE =
  'The Prime Hourglass Orthogonality Theorem — Empirical Suite';

export const PAPER_NAME = 'SYNTHOBS_OMNI_PRIME_HOURGLASS_SKELETON_2026-08.md';

/** Bound for sieve-based class counts (deterministic, small). */
export const PRIME_BOUND = 500;

/** Known small p ≡ 1 (mod 4) with a²+b² witnesses. */
export const SPLIT_WITNESSES = [
  { p: 5, a: 1, b: 2 },
  { p: 13, a: 2, b: 3 },
  { p: 17, a: 1, b: 4 },
  { p: 29, a: 2, b: 5 },
  { p: 37, a: 1, b: 6 },
  { p: 41, a: 4, b: 5 },
];

/** Known small p ≡ 3 (mod 4) — inert in Z[i] for sum-of-two-squares. */
export const INERT_SAMPLES = [3, 7, 11, 19, 23, 31, 43, 47];
