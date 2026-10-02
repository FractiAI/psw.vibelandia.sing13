/**
 * Phase 3 — post-hoc property scoring.
 * Labels (multiscale / hierarchical / local→global / bounded adapt) applied AFTER discovery.
 * Agents never receive these property names as objectives.
 */

function corr(a, b) {
  const n = Math.min(a.length, b.length);
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  const den = Math.sqrt(da * db);
  return den > 1e-12 ? num / den : 0;
}

function energyAtScale(coeffs, factor) {
  let e = 0;
  for (let i = 0; i < coeffs.length; i += factor) {
    let s = 0;
    let c = 0;
    for (let j = i; j < Math.min(coeffs.length, i + factor); j++) {
      s += coeffs[j];
      c++;
    }
    const m = s / Math.max(1, c);
    e += m * m;
  }
  return e;
}

/** Score invented representation against portable structural properties. */
export function scoreRepresentation(result, landscape) {
  const coeffs = result.representation?.coeffs || [];
  const target = Array.from(landscape.target);
  const obs = Array.from(landscape.observations);

  const multiscale =
    (energyAtScale(coeffs, 16) + 0.5 * energyAtScale(coeffs, 4) + 0.25 * energyAtScale(coeffs, 1)) /
    (1 + energyAtScale(obs, 1));
  const hierarchical =
    result.representation?.kind === 'hierarchical_pyramid'
      ? 0.85 + 0.1 * Math.max(0, corr(coeffs, target))
      : 0.35 + 0.4 * Math.max(0, corr(downsampleProxy(coeffs, 8), downsampleProxy(target, 8)));
  const localGlobal =
    result.representation?.kind === 'local_global'
      ? 0.8 + 0.15 * Math.max(0, corr(coeffs, target))
      : patchGlobalScore(coeffs, target);
  const boundedAdapt =
    result.representation?.kind === 'bounded_adapt'
      ? 0.82
      : stepBoundedness(result.path);

  const pred = Math.max(0, 1 - (result.predictiveRmse || 1));
  const properties = {
    multiscale_compression: clamp01(multiscale),
    hierarchical_coarse_to_fine: clamp01(hierarchical),
    local_preserves_global: clamp01(localGlobal),
    bounded_recursive_adaptation: clamp01(boundedAdapt),
    predictive_utility: clamp01(pred),
  };
  const meanProp =
    (properties.multiscale_compression +
      properties.hierarchical_coarse_to_fine +
      properties.local_preserves_global +
      properties.bounded_recursive_adaptation) /
    4;
  return { agentId: result.agentId, isControl: !!result.isControl, properties, meanProp, predictiveRmse: result.predictiveRmse };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function downsampleProxy(arr, factor) {
  const out = [];
  for (let i = 0; i < arr.length; i += factor) {
    let s = 0;
    let c = 0;
    for (let j = i; j < Math.min(arr.length, i + factor); j++) {
      s += arr[j];
      c++;
    }
    out.push(s / c);
  }
  return out;
}

function patchGlobalScore(coeffs, target) {
  const gC = downsampleProxy(coeffs, 16);
  const gT = downsampleProxy(target, 16);
  return 0.3 + 0.55 * Math.max(0, corr(gC, gT));
}

function stepBoundedness(path) {
  const adapts = (path || []).filter((p) => p.event === 'adapt_step' && typeof p.step === 'number');
  if (!adapts.length) return 0.25;
  const steps = adapts.map((p) => p.step);
  const min = Math.min(...steps);
  const max = Math.max(...steps);
  const inside = min >= 0.05 && max <= 0.8;
  return inside ? 0.7 : 0.35;
}

export function summarizeConvergence(scores) {
  const explorers = scores.filter((s) => !s.isControl);
  const controls = scores.filter((s) => s.isControl);
  const meanExplorer = explorers.reduce((a, s) => a + s.meanProp, 0) / Math.max(1, explorers.length);
  const meanControl = controls.reduce((a, s) => a + s.meanProp, 0) / Math.max(1, controls.length);
  const margin = meanExplorer - meanControl;
  return {
    meanExplorer,
    meanControl,
    margin,
    explorerIds: explorers.map((s) => s.agentId),
    controlIds: controls.map((s) => s.agentId),
    scores,
  };
}
