#!/usr/bin/env node
/**
 * Print visit-intelligence QA snapshot (local memory ledger or live production API).
 *   npm run analyze:lattice-scraper
 *   LATTICE_TELEMETRY_URL=https://www.ssvibelandiaquestfest24x365.com/api/lattice-scraper-telemetry npm run analyze:lattice-scraper
 */
import { buildQaSnapshot, normalizeEvent } from '../lib/lattice-scraper-telemetry.mjs';

const url =
  process.env.LATTICE_TELEMETRY_URL?.trim() ||
  'https://www.ssvibelandiaquestfest24x365.com/api/lattice-scraper-telemetry';

async function main() {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('fetch failed', res.status);
    process.exit(2);
  }
  const pack = await res.json();
  const events = (pack.recent || []).concat([]);
  const all = pack.visitIntel ? pack : null;
  if (pack.visitIntel) {
    console.log(JSON.stringify({ summary: pack.summary, visitIntel: pack.visitIntel }, null, 2));
    return;
  }
  const qa = buildQaSnapshot(events.map(normalizeEvent), {
    drainConfigured: !!pack.summary?.drainConfigured,
  });
  console.log(JSON.stringify(qa, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
