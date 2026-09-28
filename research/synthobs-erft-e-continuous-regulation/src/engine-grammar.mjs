/**
 * ERFT V4 — Infinite Octaves engine catalog fixtures for *matched* recursion geometry.
 * Generation index drives k/81, octaves 01–99, odd-prime vaults, and φ-referenced lags.
 * Arm constant c affects nest *weights* only — not lag/block/period budgets (V3 confound fix).
 */
import { PHI_EGS } from './constants.mjs';

/** SI Planck-length mantissa (×10³⁵ m) — catalog clutch reference, not CODATA replacement. */
export const PLANCK_MANTISSA_35 = 1.616255;

/** Clutch slip Δ = |Φ_EGS − Planck mantissa| — diagnostic; applied uniformly on all arms. */
export const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA_35);

/** Odd-prime vault indices (structural 2 = baseline dyadic blocks elsewhere). */
export const ODD_PRIME_VAULTS = Object.freeze([
  3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
]);

export function k81Register(generation) {
  return (generation % 81) / 81;
}

/** Story-depth octave 01–99 from recursion generation (catalog map, not prediction). */
export function octaveStoryDepth(generation) {
  const raw = Math.floor(generation * PHI_EGS + 1);
  return Math.min(99, Math.max(1, raw));
}

export function vaultPrimeAt(generation) {
  const k = k81Register(generation);
  const idx = (generation + Math.floor(k * 81)) % ODD_PRIME_VAULTS.length;
  return ODD_PRIME_VAULTS[idx];
}

/** Baseline structural-2 dyadic block pair (parity arm). */
export function structuralDyadicBlocks() {
  return { b1: 4, b2: 8 };
}

/**
 * Per-arm nest lags from c (self-similar inv, inv²) + uniform k/81 overlay.
 * Severity normalized across arms — not V1 monotonic coarsening vs c.
 */
export function armNestLags(n, c, generation) {
  const k = k81Register(generation);
  const boost = 1 + k * 0.08;
  if (Math.abs(c - 1.0) < 1e-12) {
    const la = Math.max(1, Math.min(n - 1, Math.floor((n / 4) * boost)));
    const lb = Math.max(la + 1, Math.min(n - 1, Math.floor((n / 2) * boost)));
    return { la, lb };
  }
  const inv = 1 / c;
  const la = Math.max(1, Math.min(n - 1, Math.round(n * inv * boost)));
  let lb = Math.max(1, Math.min(n - 1, Math.round(n * inv * inv * boost)));
  if (lb <= la) {
    lb = Math.min(n - 1, la + Math.max(1, Math.round(n * inv * inv * inv * boost)));
  }
  return { la, lb };
}

/** Blocks: odd-prime vault × (c/Φ) severity normalization — φ arm at vault scale. */
export function armNestBlocks(c, generation) {
  if (Math.abs(c - 1.0) < 1e-12) {
    return structuralDyadicBlocks();
  }
  const vault = vaultPrimeAt(generation);
  const slip = 1 + CLUTCH_DELTA;
  const base = Math.max(2, Math.round(vault * slip));
  const norm = c / PHI_EGS;
  const b1 = Math.max(2, Math.round(base * norm));
  const b2 = Math.max(b1 + 1, Math.round(b1 * norm));
  return { b1, b2 };
}

/** Drive period: octave depth + small c-offset (bounded), k/81-stable across arms at gen. */
export function armDrivePeriod(c, generation) {
  const oct = octaveStoryDepth(generation);
  const cOff = Math.min(0.35, Math.abs(c - 1) * 0.15);
  return Math.max(4, Math.round(4 + oct / 12 + cOff * 8));
}

/** @deprecated alias */
export function matchedNestLags(n, generation, c = PHI_EGS) {
  return armNestLags(n, c, generation);
}

export function matchedNestBlocks(generation, c = PHI_EGS) {
  return armNestBlocks(c, generation);
}

export function matchedDrivePeriod(generation, c = PHI_EGS) {
  return armDrivePeriod(c, generation);
}

/** Uniform mix severity multiplier (all arms — cancels in relative comparisons). */
export function clutchMixScale() {
  return 1 + CLUTCH_DELTA;
}

export function engineGrammarLocksOk() {
  return (
    CLUTCH_DELTA > 0 &&
    CLUTCH_DELTA < 0.01 &&
    ODD_PRIME_VAULTS.every((p) => p >= 3 && p % 2 === 1) &&
    octaveStoryDepth(0) >= 1 &&
    octaveStoryDepth(100) <= 99
  );
}
