/**
 * ERFT V3 — nest-ratio geometry for recursive fidelity fixtures.
 * Φ uses exact self-similar partition (1/φ, 1/φ²). Baseline = dyadic 1:1.
 * Decoys use normalized (1/c, 1−1/c) — only φ closes 1/c + 1/c² = 1 exactly.
 */
import { PHI_EGS } from './constants.mjs';

export function nestWeights(c) {
  if (Math.abs(c - 1.0) < 1e-12) {
    return { wMajor: 0.5, wMinor: 0.5, dyadic: true, phi_exact: false };
  }
  if (Math.abs(c - PHI_EGS) < 1e-9) {
    const wMajor = 1 / c;
    const wMinor = 1 / (c * c);
    return { wMajor, wMinor, dyadic: false, phi_exact: true };
  }
  const wMinor = 1 / c;
  const wMajor = 1 - wMinor;
  return { wMajor, wMinor, dyadic: false, phi_exact: false };
}

/** | (wMajor/wMinor) − c | for φ-exact; decoys skip (return 0). */
export function selfSimilarRatioError(c) {
  if (Math.abs(c - 1.0) < 1e-12) return 0;
  const { wMajor, wMinor, phi_exact } = nestWeights(c);
  if (!phi_exact) return 0;
  if (wMinor < 1e-15) return Infinity;
  return Math.abs(wMajor / wMinor - c);
}

export function nestLags(n, c) {
  if (Math.abs(c - 1.0) < 1e-12) {
    const la = Math.max(1, Math.floor(n / 4));
    const lb = Math.max(la + 1, Math.floor(n / 2));
    return { la, lb };
  }
  const inv = 1 / c;
  const la = Math.max(1, Math.min(n - 1, Math.round(n * inv)));
  let lb = Math.max(1, Math.min(n - 1, Math.round(n * inv * inv)));
  if (lb <= la) lb = Math.min(n - 1, la + Math.max(1, Math.round(n * inv * inv * inv)));
  return { la, lb };
}

export function nestBlocks(c) {
  if (Math.abs(c - 1.0) < 1e-12) {
    return { b1: 4, b2: 8 };
  }
  const b1 = Math.max(2, Math.round(c * 2));
  const b2 = Math.max(b1 + 1, Math.round(c * c * 2));
  return { b1, b2 };
}

export function drivePeriod(c) {
  if (Math.abs(c - 1.0) < 1e-12) return 8;
  return Math.max(4, Math.round(4 + 4 * (c - 1)));
}

export function phiNestGrammarOk() {
  const w = nestWeights(PHI_EGS);
  if (!w.phi_exact) return false;
  const sum = w.wMajor + w.wMinor;
  return Math.abs(sum - 1) < 1e-12 && selfSimilarRatioError(PHI_EGS) < 1e-10;
}
