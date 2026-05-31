/**
 * SYN-SUN-2026-REV7 · hardware phase-stabilization loop (Node runtime).
 * Mirrors ssvibelandia_core/src/hardware/clock_skew_filter.py
 */
import { EGS_PHI, FIELD_TIERS } from './wavefield-constants.mjs';

export { FIELD_TIERS } from './wavefield-constants.mjs';

/**
 * Applies EGS fractal scaling as logical boundary limit.
 * @returns score in [0, EGS_PHI]
 */
export function calculateHolographicLimit(liveMatrix) {
  let cumulativeStress = 0;
  const nodes = liveMatrix?.live_nodes || liveMatrix?.liveNodes || [];

  for (const node of nodes) {
    const lat = Number(node.latitude) || 0;
    const lon = Number(node.longitude) || 0;
    const theta = ((lat + lon) * Math.PI) / 180;
    const weight = (Number(node.area_millionths ?? node.areaMillionths) || 0) / 1000;

    for (let tier = 1; tier <= FIELD_TIERS; tier += 1) {
      cumulativeStress += (Math.sin(tier * theta) * weight) / EGS_PHI ** tier;
    }
  }

  const score = Math.abs(Math.tanh(cumulativeStress) * EGS_PHI);
  return Math.min(Math.max(score, 0), EGS_PHI);
}
