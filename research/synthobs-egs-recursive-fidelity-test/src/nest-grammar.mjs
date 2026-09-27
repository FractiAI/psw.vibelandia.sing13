/**
 * ERFT V5 — nest weights + matched geometry.
 * ERFT-C: identical algorithm for all c; weights = normalized (1/c, 1/c²); geometry generation-matched.
 * ERFT-G: same weights + generalized closure C(c) available to every arm (no Φ-only affordance).
 * V4 Φ-exact-only closure and "only Φ sums to 1" primary framing are retired.
 */
import { PHI_EGS } from './constants.mjs';
import { k81Register, vaultPrimeAt, CLUTCH_DELTA } from './engine-grammar.mjs';

/**
 * Two-level nest weights from c.
 * Always expose raw 1/c, 1/c² form. partition_sum = 1 only for Φ by algebra —
 * but ERFT-C never treats that as a special affordance: mix path always normalizes.
 */
export function nestWeights(c) {
  if (Math.abs(c - 1.0) < 1e-12) {
    return {
      wMajor: 0.5,
      wMinor: 0.5,
      dyadic: true,
      phi_exact: false,
      partition_sum: 1,
      algebra_closes: true,
    };
  }
  const wMajor = 1 / c;
  const wMinor = 1 / (c * c);
  const sum = wMajor + wMinor;
  const closes = Math.abs(sum - 1) < 1e-12;
  return {
    wMajor,
    wMinor,
    dyadic: false,
    /** Historical V4 flag — true only when algebra already closes. Not a runtime affordance in V5. */
    phi_exact: closes && Math.abs(c - PHI_EGS) < 1e-9,
    partition_sum: sum,
    algebra_closes: closes,
  };
}

/** | (wMajor/wMinor) − c | when algebra closes; else 0 (not used as a gate). */
export function selfSimilarRatioError(c) {
  if (Math.abs(c - 1.0) < 1e-12) return 0;
  const { wMajor, wMinor, algebra_closes } = nestWeights(c);
  if (!algebra_closes) return 0;
  if (wMinor < 1e-15) return Infinity;
  return Math.abs(wMajor / wMinor - c);
}

/**
 * Normalize two-level weights to unit sum for mixing.
 * Applied identically to every arm — Φ's raw sum≈1 is coincidental, not special treatment.
 */
export function normalizedMixWeights(c) {
  const { wMajor, wMinor, dyadic, phi_exact, partition_sum, algebra_closes } = nestWeights(c);
  const s = partition_sum > 1e-15 ? partition_sum : 1;
  return {
    wMajor: wMajor / s,
    wMinor: wMinor / s,
    dyadic,
    phi_exact,
    algebra_closes,
    raw_sum: partition_sum,
  };
}

function k81Boost(generation) {
  return 1 + k81Register(generation) * 0.06;
}

/**
 * Generation-matched lags — identical for every arm at a given generation.
 * c is ignored (kept in signature for call-site compatibility).
 */
export function matchedLags(n, generation = 0) {
  const boost = k81Boost(generation);
  const la = Math.max(1, Math.min(n - 1, Math.floor((n / 4) * boost)));
  const lb = Math.max(la + 1, Math.min(n - 1, Math.floor((n / 2) * boost)));
  return { la, lb };
}

/**
 * Generation-matched blocks — odd-prime vault × clutch, no c dependence.
 */
export function matchedBlocks(generation = 0) {
  const vault = vaultPrimeAt(generation);
  const slip = 1 + CLUTCH_DELTA;
  const b1 = Math.max(2, Math.round(vault * slip * 0.35));
  const b2 = Math.max(b1 + 1, Math.round(b1 * 2));
  return { b1, b2 };
}

/** Generation-matched drive period — no c dependence. */
export function matchedDrivePeriod(generation = 0) {
  const boost = k81Boost(generation);
  return Math.max(4, Math.round(8 * boost));
}

/** @deprecated V3/V4 c-dependent lags — kept for grammar-lock diagnostics only. */
export function nestLags(n, c, generation = 0) {
  void c;
  return matchedLags(n, generation);
}

/** @deprecated V3/V4 c-dependent blocks — redirect to matched. */
export function nestBlocks(c, generation = 0) {
  void c;
  return matchedBlocks(generation);
}

/** @deprecated V3/V4 c-dependent period — redirect to matched. */
export function drivePeriod(c, generation = 0) {
  void c;
  return matchedDrivePeriod(generation);
}

/**
 * Generalized closure operator C(c) — mathematically available to every constant.
 * One self-similar re-entry using the arm's own normalized weights.
 * V5 ERFT-G applies this symmetrically; ERFT-C never applies it.
 */
export function generalizedClosure(xs, i, spatial, wMajor, wMinor) {
  return wMajor * spatial + wMinor * (wMajor * xs[i] + wMinor * spatial);
}

/** Φ algebra identity check (diagnostic — not a runtime affordance gate). */
export function phiNestGrammarOk() {
  const w = nestWeights(PHI_EGS);
  const sum = w.wMajor + w.wMinor;
  return Math.abs(sum - 1) < 1e-12 && selfSimilarRatioError(PHI_EGS) < 1e-10;
}

/** Constant-neutral geometry lock: lags/blocks/period identical across named arms. */
export function constantNeutralGeometryOk(n = 256, generation = 12) {
  const arms = [1.0, PHI_EGS, Math.SQRT2, Math.E];
  const refL = matchedLags(n, generation);
  const refB = matchedBlocks(generation);
  const refP = matchedDrivePeriod(generation);
  return arms.every((c) => {
    const l = nestLags(n, c, generation);
    const b = nestBlocks(c, generation);
    const p = drivePeriod(c, generation);
    return (
      l.la === refL.la &&
      l.lb === refL.lb &&
      b.b1 === refB.b1 &&
      b.b2 === refB.b2 &&
      p === refP
    );
  });
}
