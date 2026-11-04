/**
 * Golden Spiral scale bridge — φ-indexed scale mapping across levels.
 * Implemented as an organizational scale bridge (Φ_EGS).
 * Status: implemented_as_phi_scale_bridge — geometry is catalog grammar, not a
 * claim that physical golden spirals were measured in silicon.
 */
import { PHI_EGS } from '../constants.mjs';

export function spiralScale(level, phi = PHI_EGS) {
  return Math.pow(phi, level);
}

export function spiralAngle(level, phi = PHI_EGS) {
  return level * (2 * Math.PI) / (phi * phi);
}

/** Map a depth index into a continuous scale coordinate (r, θ). */
export function scaleBridgePoint(level, phi = PHI_EGS) {
  const r = spiralScale(level, phi);
  const theta = spiralAngle(level, phi);
  return { level, r, theta, x: r * Math.cos(theta), y: r * Math.sin(theta), phi };
}

/** Soft weight for selecting among depths — higher weight nearer target scale. */
export function scaleAffinity(level, targetLevel, phi = PHI_EGS) {
  const a = scaleBridgePoint(level, phi);
  const b = scaleBridgePoint(targetLevel, phi);
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const d = Math.hypot(dx, dy);
  return 1 / (1 + d);
}

export function pickScaleLevel(candidates, targetLevel, phi = PHI_EGS) {
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const s = scaleAffinity(c, targetLevel, phi);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return { level: best, score: bestScore };
}
