import { PHI_EGS } from './constants.mjs';

/**
 * Sprawl overhead model C(x) = x² − Φx
 * Minimum at x = Φ/2 (analytic).
 */
export function overheadCost(x) {
  return x * x - PHI_EGS * x;
}

export function overheadDerivative(x) {
  return 2 * x - PHI_EGS;
}

export function analyticMinimumX() {
  return PHI_EGS / 2;
}

/**
 * Modeled energy-in to value-captured ratio grows when d/r exceeds Φ.
 */
export function modeledEnergyRatio(distanceToCoreRadius) {
  const ratio = distanceToCoreRadius;
  if (ratio <= PHI_EGS) {
    return 1 + Math.max(0, ratio - 1) * 0.1;
  }
  const excess = ratio - PHI_EGS;
  return 1 + excess * excess * 2;
}

/**
 * Numeric verification of Theorem 1 overhead minimum and divergence trend.
 */
export function verifyEgsOverheadModel({ sweepSteps = 200, maxRatio = 8 } = {}) {
  const xMin = analyticMinimumX();
  const cAtMin = overheadCost(xMin);
  const derivAtMin = overheadDerivative(xMin);

  const sweep = [];
  for (let i = 0; i <= sweepSteps; i++) {
    const ratio = (maxRatio * i) / sweepSteps;
    sweep.push({
      d_over_r: ratio,
      C_model: overheadCost(ratio),
      E_in_over_V_cap: modeledEnergyRatio(ratio),
      atResonance: Math.abs(ratio - PHI_EGS) < 0.02,
    });
  }

  const ratios = sweep.map((s) => s.d_over_r);
  const costs = sweep.map((s) => s.C_model);
  const minIdx = costs.indexOf(Math.min(...costs));
  const numericMinRatio = ratios[minIdx];

  const divergenceAtSprawl = modeledEnergyRatio(maxRatio);
  const atPhi = modeledEnergyRatio(PHI_EGS);

  return {
    phi: PHI_EGS,
    analyticMinimum: { x: xMin, C: cAtMin, dC_dx: derivAtMin },
    numericMinimum: { d_over_r: numericMinRatio, C: costs[minIdx] },
    minimumMatchesPhiHalf: Math.abs(numericMinRatio - xMin) < 0.05,
    resonanceRatio: PHI_EGS,
    modeledRatioAtPhi: atPhi,
    modeledRatioAtSprawl: divergenceAtSprawl,
    sprawlDivergenceExceedsPhi: divergenceAtSprawl > atPhi * 3,
    sweepSample: sweep.filter((_, i) => i % Math.floor(sweepSteps / 10) === 0),
  };
}
