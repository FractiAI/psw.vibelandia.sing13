import { LOG10_PHI, PHI_EGS } from './constants.mjs';

/**
 * Test whether log10(L_long/L_short) ≈ n·log10(φ) for integer n.
 * Returns best-fit integer tier and residual.
 */
export function egsTierFit(lengthLongM, lengthShortM) {
  const logRatio = Math.log10(lengthLongM / lengthShortM);
  const nContinuous = logRatio / LOG10_PHI;
  const nNearest = Math.round(nContinuous);
  const predictedLogRatio = nNearest * LOG10_PHI;
  const residualLog = logRatio - predictedLogRatio;
  const residualPct = Math.abs(residualLog / logRatio) * 100;
  return {
    lengthLongM,
    lengthShortM,
    log10Ratio: logRatio,
    phi: PHI_EGS,
    nContinuous,
    nNearestInteger: nNearest,
    predictedLog10Ratio: predictedLogRatio,
    residualLog10: residualLog,
    residualPct,
    passesIntegerTier: residualPct < 5 && nNearest > 0,
  };
}

export function crossScaleEgsMatrix(structures) {
  const pairs = [];
  for (let i = 0; i < structures.length; i++) {
    for (let j = i + 1; j < structures.length; j++) {
      const a = structures[i];
      const b = structures[j];
      const [longer, shorter] = a.lengthM >= b.lengthM ? [a, b] : [b, a];
      pairs.push({
        pair: `${longer.id}_vs_${shorter.id}`,
        ...egsTierFit(longer.lengthM, shorter.lengthM),
      });
    }
  }
  const passCount = pairs.filter((p) => p.passesIntegerTier).length;
  return {
    pairs,
    summary: {
      totalPairs: pairs.length,
      integerTierPasses: passCount,
      integerTierPassRate: passCount / pairs.length,
      interpretation:
        passCount === 0
          ? 'no_support'
          : passCount < pairs.length / 2
            ? 'weak'
            : 'moderate',
    },
  };
}
