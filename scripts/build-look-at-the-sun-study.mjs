#!/usr/bin/env node
/**
 * Build interfaces/look-at-the-sun-study.json from public NOAA/SILSO/GitHub data.
 * Run manually when refreshing the snapshot — the HTML page does not live-fetch.
 * Logic: lib/look-at-the-sun-study.mjs
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLookAtTheSunStudy } from '../lib/look-at-the-sun-study.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

buildLookAtTheSunStudy({
  outPath: join(ROOT, 'interfaces', 'look-at-the-sun-study.json'),
  repoRoot: ROOT,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
