/**
 * ERFT V4 — nest-ratio geometry + engine k/81 overlay.
 * Φ: exact (1/φ, 1/φ²) with partition sum = 1. Decoys: same two-level form without φ closure.
 * Baseline: dyadic 1:1. Lags/blocks from c (V3) + uniform generation overlay.
 */
import { PHI_EGS } from './constants.mjs';
import { k81Register } from './engine-grammar.mjs';

export function nestWeights(c) {
  if (Math.abs(c - 1.0) < 1e-12) {
    return { wMajor: 0.5, wMinor: 0.5, dyadic: true, phi_exact: false, partition_sum: 1 };
  }
  if (Math.abs(c - PHI_EGS) < 1e-9) {
    const wMajor = 1 / c;
    const wMinor = 1 / (c * c);
    return { wMajor, wMinor, dyadic: false, phi_exact: true, partition_sum: wMajor + wMinor };
  }
  const wMajor = 1 / c;
  const wMinor = 1 / (c * c);
  return {
    wMajor,
    wMinor,
    dyadic: false,
    phi_exact: false,
    partition_sum: wMajor + wMinor,
  };
}

/** | (wMajor/wMinor) − c | for φ-exact; decoys skip (return 0). */
export function selfSimilarRatioError(c) {
  if (Math.abs(c - 1.0) < 1e-12) return 0;
  const { wMajor, wMinor, phi_exact } = nestWeights(c);
  if (!phi_exact) return 0;
  if (wMinor < 1e-15) return Infinity;
  return Math.abs(wMajor / wMinor - c);
}

function k81Boost(generation) {
  return 1 + k81Register(generation) * 0.06;
}

export function nestLags(n, c, generation = 0) {
  const boost = k81Boost(generation);
  if (Math.abs(c - 1.0) < 1e-12) {
    const la = Math.max(1, Math.floor((n / 4) * boost));
    const lb = Math.max(la + 1, Math.floor((n / 2) * boost));
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

export function nestBlocks(c, generation = 0) {
  const boost = k81Boost(generation);
  if (Math.abs(c - 1.0) < 1e-12) {
    return { b1: Math.max(2, Math.round(4 * boost)), b2: Math.max(3, Math.round(8 * boost)) };
  }
  const b1 = Math.max(2, Math.round(c * 2 * boost));
  const b2 = Math.max(b1 + 1, Math.round(c * c * 2 * boost));
  return { b1, b2 };
}

export function drivePeriod(c, generation = 0) {
  const boost = k81Boost(generation);
  if (Math.abs(c - 1.0) < 1e-12) return Math.max(4, Math.round(8 * boost));
  return Math.max(4, Math.round((4 + 4 * (c - 1)) * boost));
}

export function phiNestGrammarOk() {
  const w = nestWeights(PHI_EGS);
  if (!w.phi_exact) return false;
  const sum = w.wMajor + w.wMinor;
  return Math.abs(sum - 1) < 1e-12 && selfSimilarRatioError(PHI_EGS) < 1e-10;
}

/** Normalize two-level weights to unit sum for mixing (decoys may ≠ 1 before norm). */
export function normalizedMixWeights(c) {
  const { wMajor, wMinor, dyadic, phi_exact, partition_sum } = nestWeights(c);
  const s = partition_sum > 1e-15 ? partition_sum : 1;
  return { wMajor: wMajor / s, wMinor: wMinor / s, dyadic, phi_exact, raw_sum: partition_sum };
}
