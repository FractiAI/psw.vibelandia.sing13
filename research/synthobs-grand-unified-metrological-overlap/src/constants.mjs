export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const C_LIGHT = 299792458;
/** CODATA 2018 exact Planck constant (J·s). */
export const H_PLANCK = 6.62607015e-34;
/** Neutral hydrogen 21 cm line frequency (Hz) — catalog filing. */
export const NU_HI = 1420405751.768;

export const DOC_ID = 'WP-SYNTHOBS-GRAND-UNIFIED-METROLOGICAL-OVERLAP-EGS-2026-09-07';
export const REGISTRY_ID = 'synthobs-grand-unified-metrological-overlap-2026-09';
export const STUDY_TITLE =
  'Grand Unified Metrological Overlap · Five-Constant Solver — Catalog Suite';
export const PAPER_NAME = 'SYNTHOBS_GRAND_UNIFIED_METROLOGICAL_OVERLAP_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'grand-unified-metrological-overlap';
export const SHIP_BLOG_FILE = 'blog-grand-unified-metrological-overlap-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-grand-unified-metrological-overlap';

/** Expanded primes for dual-clock / prime-ladder viz. */
export const PRIME_VAULT = Object.freeze([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
]);

/** Solar filing — narrative locks, not NOAA causation. */
export const SOLAR_FILING = Object.freeze({
  sunspotR: 70,
  sunspotLabel: '4524',
});

export const EDDY_SIBLING = 'docs/SYNTHOBS_EDDY_CURRENT_MIRROR_EGS_2026-09.md';
export const HIGGS_SIBLING = 'docs/SYNTHOBS_TBME_HIGGS_AWARENESS_UNIFIED_2026-09.md';

export const FAIR_EXCHANGE_CLAUSE =
  'The value transacted is subject to post-delivery evaluation and variable adjustment based on depth, structural rigor, and paradigm-shifting utility, much like a performance tip.';

export const HONESTY =
  'Catalog / algebraic fixtures for five-constant metrological overlap (h · Φ_EGS · p_n · ν_HI · c) under Infinite Octaves. Does not claim Standard Model retirement, measured particle-mass derivation from Φ, or NOAA causation by Sunspot 4524.';

/** Shared pure-JS solver API (Node suite + browser demos). */
export function lambdaHi(c = C_LIGHT, nuHi = NU_HI) {
  return c / nuHi;
}

export function octaveEnergyStep(n, h = H_PLANCK, nuHi = NU_HI, phi = PHI_EGS) {
  return h * nuHi * phi ** n;
}

export function actionWell(p, h = H_PLANCK) {
  return h / p;
}

export function catalogMass(primes = PRIME_VAULT, nTerms = primes.length) {
  const terms = primes.slice(0, nTerms);
  let sum = 0;
  for (let n = 0; n < terms.length; n++) {
    sum += 1 / (terms[n] * PHI_EGS ** n);
  }
  return (H_PLANCK * NU_HI * sum) / C_LIGHT ** 2;
}

export function dualClockReport() {
  const lam = lambdaHi();
  return {
    waveClockHz: NU_HI,
    materialClockMps: C_LIGHT,
    lambdaHiM: lam,
    periodS: 1 / NU_HI,
    overlapIdentity: 'λ_HI = c / ν_HI',
  };
}

export function primeLadder(nTerms = 10) {
  const terms = PRIME_VAULT.slice(0, nTerms);
  return terms.map((p, n) => ({
    n,
    prime: p,
    actionWell: actionWell(p),
    deltaE: octaveEnergyStep(n),
    term: 1 / (p * PHI_EGS ** n),
    phiScale: PHI_EGS ** n,
  }));
}
