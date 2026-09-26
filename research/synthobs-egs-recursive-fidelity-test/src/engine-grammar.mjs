/**
 * ERFT V4 — Infinite Octaves engine grammar fixtures (catalog, not CODATA proof).
 * Wires Φ_EGS · Planck–1.6 clutch Δ · k/81 register · Digits×Octaves 01–99 · odd-prime vaults · structural 2.
 * Peers: planck-scale-harmonic · 99-octave-digits-master · infinite-octave-prime-parity · prime-indexed storage.
 */
import { PHI_EGS, GENERATIONS } from './constants.mjs';

function armFlags(c) {
  if (Math.abs(c - 1.0) < 1e-12) return { dyadic: true, phi_exact: false };
  if (Math.abs(c - PHI_EGS) < 1e-9) return { dyadic: false, phi_exact: true };
  return { dyadic: false, phi_exact: false };
}

export const PLANCK_MANTISSA = 1.616255;
export const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA);
export const METAPATTERN_K81 = 81;
export const STRUCTURAL_TWO = 2;
/** Odd-prime vault ladder (sole-even 2 filed separately as structural parity). */
export const ODD_PRIME_VAULTS = Object.freeze([3, 5, 7, 11, 13, 17, 19, 23, 29, 31]);

export function kOver81(gen, maxGen = GENERATIONS) {
  const k = Math.round((gen / Math.max(1, maxGen)) * (METAPATTERN_K81 - 1)) + 1;
  return { k, scale: k / METAPATTERN_K81 };
}

/** Story-depth octave 1–99 from recursion generation (same index all arms at gen g). */
export function digitOctave(gen, maxGen = GENERATIONS) {
  const t = gen / Math.max(1, maxGen);
  const octave = 1 + Math.min(98, Math.floor(t * 98));
  const digit = Math.min(9, Math.floor((octave - 1) / 10));
  return { digit, octave };
}

function vaultForArm(octave, dyadic, phi_exact) {
  if (dyadic) return STRUCTURAL_TWO;
  if (phi_exact) {
    const idx = Math.floor((octave * PHI_EGS) % ODD_PRIME_VAULTS.length);
    return ODD_PRIME_VAULTS[idx];
  }
  return ODD_PRIME_VAULTS[octave % ODD_PRIME_VAULTS.length];
}

/** Clutch slip multiplier — identical for all arms (catalog Δ, not a φ-only gift). */
export function clutchScale() {
  return 1 + CLUTCH_DELTA;
}

export function engineLags(seriesLen, c, gen, maxGen = GENERATIONS) {
  const { dyadic, phi_exact } = armFlags(c);
  const { scale } = kOver81(gen, maxGen);
  const { octave } = digitOctave(gen, maxGen);
  const vault = vaultForArm(octave, dyadic, phi_exact);
  const slip = clutchScale();
  const inv = phi_exact ? 1 / PHI_EGS : dyadic ? 0.5 : 1 / c;
  const la = Math.max(
    1,
    Math.min(seriesLen - 1, Math.round(seriesLen * scale * slip * inv)),
  );
  let lb = Math.max(
    1,
    Math.min(seriesLen - 1, Math.round(seriesLen * scale * (vault / METAPATTERN_K81))),
  );
  if (lb <= la) lb = Math.min(seriesLen - 1, la + Math.max(1, vault % 7));
  return { la, lb, octave, k_scale: scale, vault, clutch: CLUTCH_DELTA };
}

export function engineBlocks(c, gen, maxGen = GENERATIONS) {
  const { dyadic, phi_exact } = armFlags(c);
  const { octave } = digitOctave(gen, maxGen);
  const vault = vaultForArm(octave, dyadic, phi_exact);
  if (dyadic) {
    return { b1: STRUCTURAL_TWO * 2, b2: STRUCTURAL_TWO * 4, octave, vault };
  }
  const b1 = Math.max(2, Math.min(16, vault));
  const b2 = Math.max(
    b1 + 1,
    Math.min(16, Math.round(b1 * (phi_exact ? PHI_EGS : Math.max(1.1, c)))),
  );
  return { b1, b2, octave, vault };
}

export function engineGrammarLocksOk() {
  return (
    METAPATTERN_K81 === 81 &&
    ODD_PRIME_VAULTS[0] === 3 &&
    STRUCTURAL_TWO === 2 &&
    CLUTCH_DELTA > 0.0017 &&
    CLUTCH_DELTA < 0.002 &&
    Math.abs(Math.abs(PHI_EGS - PLANCK_MANTISSA) - CLUTCH_DELTA) < 1e-12
  );
}
