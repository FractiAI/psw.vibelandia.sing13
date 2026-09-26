/**
 * ERFT V3 — nest-ratio geometry for recursive fidelity fixtures.
 * Φ uses exact self-similar partition (1/φ, 1/φ²). Baseline = dyadic 1:1.
 * Decoys use normalized (1/c, 1−1/c) — only φ closes 1/c + 1/c² = 1 exactly.
 */
import { PHI_EGS, GENERATIONS } from './constants.mjs';
import { engineLags, engineBlocks } from './engine-grammar.mjs';

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

/** V4: lags from engine grammar (octave · k/81 · clutch · prime vault). */
export function nestLags(seriesLen, c, gen = 1, maxGen = GENERATIONS) {
  const e = engineLags(seriesLen, c, gen, maxGen);
  return { la: e.la, lb: e.lb };
}

/** V4: blocks from engine grammar (octave · prime vault · structural 2 baseline). */
export function nestBlocks(c, gen = 1, maxGen = GENERATIONS) {
  const e = engineBlocks(c, gen, maxGen);
  return { b1: e.b1, b2: e.b2 };
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
