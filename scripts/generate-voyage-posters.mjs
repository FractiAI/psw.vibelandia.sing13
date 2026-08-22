#!/usr/bin/env node
/**
 * Verify AI-generated voyage poster PNGs exist for every deck, cabin, and map slug.
 * Images are authored with GenerateImage and committed under interfaces/assets/voyage/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOYAGE_CABINS, VOYAGE_DECKS } from '../lib/voyage-directory.mjs';
import { VOYAGE_POSTER_SLUGS, voyagePosterPath } from '../lib/voyage-posters.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'interfaces', 'assets', 'voyage');

const expected = [
  ...VOYAGE_DECKS.map((d) => d.slug),
  ...VOYAGE_CABINS.map((c) => c.slug),
  'voyage-map',
];

const missing = [];
for (const slug of expected) {
  const rel = voyagePosterPath(slug).replace(/^\//, '');
  const abs = path.join(__dirname, '..', rel);
  if (!fs.existsSync(abs)) missing.push(slug);
}

if (missing.length) {
  console.error(JSON.stringify({ ok: false, missing, dir: 'interfaces/assets/voyage/' }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      { ok: true, count: expected.length, slugs: VOYAGE_POSTER_SLUGS, dir: 'interfaces/assets/voyage/' },
      null,
      2,
    ),
  );
}
