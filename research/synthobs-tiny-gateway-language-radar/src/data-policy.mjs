/**
 * Leo Computational Lab · data priority (mandatory)
 *
 * Prefer live / historical public data already in the Hero Leo / Turner / TRGM
 * digital-lab estate. Synthetic fixtures are last resort only when real sources
 * are missing — never the silent default.
 *
 * Aligns with:
 *   lib/turner-data-policy.mjs (real_sources_only)
 *   research/synthobs-tiny-reality-generation-model/src/historical-lab.mjs
 *   docs/SYNTHOBS_OPEN_EMPIRICAL_SCIENCE_DIGITAL_WET_LAB_2026-09.md (Tier A)
 */
export function allowSyntheticFallback() {
  const v = process.env.TINY_GATEWAY_ALLOW_SYNTHETIC ?? process.env.TURNER_ALLOW_SYNTHETIC;
  return v === '1' || v === 'true';
}

export const DATA_PRIORITY = Object.freeze([
  'live_or_historical_public',
  'committed_real_derived_fixture',
  'synthetic_fallback_only_if_allowed',
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
  'Leo Computational Lab priority: live/historical public data first (Movebank GPS + GFZ Kp, prime-vault corpus, Hero Leo ledger). Synthetic airspace / synthetic NLP rows only when real sources are unavailable and TINY_GATEWAY_ALLOW_SYNTHETIC=1. Absence of ADS-B/OpenSky in-repo is documented — multi-target GPS+Kp fusion is the real historical substitute, not a claim of ATC radar.';
