/**
 * Tiny Gateway Expedition 001 · data policy
 *
 * Assignment-required: civilian synthetic airspace (6×180×80×86_400) is a
 * first-class Experiment B arm — not a silent fallback. Prior conflicting
 * timing/memory figures from earlier reports are NOT treated as verified.
 *
 * Historical Movebank+Kp remains an optional secondary arm when sources exist.
 * Language still prefers prime-vault + Hero Leo ledger corpus.
 */
export function allowSyntheticFallback() {
  // Expedition 001 always allows synthetic for the assignment arm.
  return true;
}

export const DATA_PRIORITY = Object.freeze([
  'assignment_required_civilian_synthetic_airspace',
  'optional_historical_movebank_kp',
  'language_prime_vault_hero_leo_corpus',
]);

export const REAL_SOURCES = Object.freeze({
  movebankTrajectories: 'research/geomagnetic-herbivore/data/trajectories.csv',
  kpArchive: 'research/geomagnetic-herbivore/data/archive/kp_3hourly_2020-05-15.csv',
  movebankStudy: 'Movebank 2548892515 · Snowy Range Moose (Alces alces)',
  kpLicense: 'GFZ Kp · archived 3-hourly aligned to collar window',
  primeVaultCorpus: 'data/prime-vault-corpus-v0.json',
  heroLeoLedger: 'data/hero-leo/ledger.json',
  heroLeoConfig: 'data/hero-leo/config.json',
  websdrLatest: 'data/websdr-latest.json',
  trgmHistoricalProxy: 'research/synthobs-tiny-reality-generation-model/data/historical/movebank_daily_proxy.json',
});

export const DATA_POLICY_HONESTY =
  'Tiny Gateway Expedition 001: Experiment B primary = assignment-required civilian synthetic airspace (6 sensors · 180 tracks · 80 steps · 86 400 observations · 18 anomalies). Optional secondary = Movebank GPS + GFZ Kp when available. Language = prime-vault corpus + Hero Leo ledger. Not ATC/ADS-B. Prior conflicting timing/memory figures are not verified baselines.';
