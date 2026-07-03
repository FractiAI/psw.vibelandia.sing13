import { DELTA_X_M } from './constants.mjs';

/** Discrete LC lattice group velocity v_g(k) = (Δx/√(L_k C_k)) cos(k Δx / 2). */
export function groupVelocity(k, Lk, Ck, deltaX = DELTA_X_M) {
  const sqrtLC = Math.sqrt(Lk * Ck);
  return (deltaX / sqrtLC) * Math.cos((k * deltaX) / 2);
}

/** Phase velocity v_p(k) = (2/(k√(L_k C_k))) sin(k Δx / 2). */
export function phaseVelocity(k, Lk, Ck, deltaX = DELTA_X_M) {
  if (k === 0) return deltaX / Math.sqrt(Lk * Ck);
  const sqrtLC = Math.sqrt(Lk * Ck);
  return (2 / (k * sqrtLC)) * Math.sin((k * deltaX) / 2);
}

/** First Brillouin zone edge k = π/Δx. */
export function brillouinEdgeK(deltaX = DELTA_X_M) {
  return Math.PI / deltaX;
}

/** Numerical dispersion profile across first Brillouin zone. */
export function dispersionProfile(Lk, Ck, steps = 200, deltaX = DELTA_X_M) {
  const kMax = brillouinEdgeK(deltaX);
  const profile = [];
  for (let i = 0; i <= steps; i++) {
    const k = (i / steps) * kMax * 0.999999;
    profile.push({
      k,
      kOverKmax: k / kMax,
      vg: groupVelocity(k, Lk, Ck, deltaX),
      vp: phaseVelocity(k, Lk, Ck, deltaX),
    });
  }
  const vgAtEdge = groupVelocity(kMax, Lk, Ck, deltaX);
  const vgAtZero = groupVelocity(1e-6, Lk, Ck, deltaX);
  const relEdge = Math.abs(vgAtZero) > 0 ? Math.abs(vgAtEdge) / Math.abs(vgAtZero) : Math.abs(vgAtEdge);
  return {
    profile,
    kMax,
    vgAtZero,
    vgAtEdge,
    relativeVgAtEdge: relEdge,
    bandEdgeVgIsZero: relEdge < 1e-9,
    vgMin: Math.min(...profile.map((p) => p.vg)),
    vgMinKOverKmax: profile.reduce((a, b) => (a.vg < b.vg ? a : b)).kOverKmax,
  };
}
