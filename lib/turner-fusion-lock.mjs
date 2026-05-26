/**
 * Triangulated "lock-in" score: fence pulse (PLL) + SDR + satellite surface + optional GPS steel geometry.
 * Digital Pru = catalog coherence gate stack (φ-normalized); not a separate hardware DSP path in this repo.
 */
import { EGS_PHI } from './turner-bison-herd.mjs';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function turnerDigitalPruLockEnabled() {
  const v = String(process.env.TURNER_DIGITAL_PRU_LOCK || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return true;
}

export function fusionLockLstWeight() {
  const w = Number(process.env.TURNER_FUSION_LOCK_LST_WEIGHT);
  return Number.isFinite(w) && w >= 0 ? Math.min(w, 0.1) : 0.022;
}

export function fusionLockSteelWeight() {
  const w = Number(process.env.TURNER_FUSION_LOCK_STEEL_WEIGHT);
  return Number.isFinite(w) && w >= 0 ? Math.min(w, 0.12) : 0.035;
}

export function gridSteelCouplingBoost() {
  const w = Number(process.env.TURNER_GRID_STEEL_COUPLING_BOOST);
  return Number.isFinite(w) && w >= 0 ? Math.min(w, 0.45) : 0.18;
}

/**
 * Per-pasture lock 0–1 from aligned channels at ingest time.
 */
export function computePastureLockIn({
  wirePhaseUs,
  iqRms,
  kpLive,
  soilMoisture,
  skinTempZ,
  usedSteelGates,
  usedSpectrumMapping,
  digitalPruGate,
}) {
  let score = 0.48;
  const pll = num(wirePhaseUs);
  const rms = num(iqRms);
  const kp = num(kpLive);
  const soil = num(soilMoisture);
  const lstZ = num(skinTempZ);

  if (pll != null) score += Math.min(0.14, pll * 0.008);
  if (rms != null) score += Math.min(0.16, rms * 3.2);
  if (kp != null) score += Math.min(0.06, kp * 0.018);
  if (soil != null) score += Math.max(-0.04, Math.min(0.06, (0.22 - soil) * 0.25));
  if (lstZ != null) score += Math.tanh(lstZ / 1.4) * 0.04;
  if (usedSteelGates) score += 0.1;
  if (usedSpectrumMapping) score += 0.08;

  if (digitalPruGate) {
    const phiNorm = pll != null ? 0.5 + 0.5 * Math.sin(pll / EGS_PHI) : 0.5;
    const coherence =
      (usedSteelGates ? 0.28 : 0) +
      (usedSpectrumMapping ? 0.24 : 0) +
      (rms != null ? 0.22 : 0) +
      (lstZ != null ? 0.14 : 0) +
      (soil != null ? 0.12 : 0);
    score += coherence * phiNorm * 0.12;
  }

  return Number(Math.max(0, Math.min(1, score)).toFixed(3));
}

/** Boost reflectivity near schematic steel gates (GPS fence vertices). */
export function steelProximityBoost(cx, cy, steelGates, lockScore) {
  if (!steelGates?.length || lockScore == null || lockScore <= 0) return 1;
  let minD = Infinity;
  for (const g of steelGates) {
    const d = Math.hypot(cx - g.x, cy - g.y);
    if (d < minD) minD = d;
  }
  if (!Number.isFinite(minD)) return 1;
  const prox = Math.exp(-minD / 72);
  const boost = gridSteelCouplingBoost();
  return 1 + prox * boost * lockScore;
}
