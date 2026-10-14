#!/usr/bin/env node
/**
 * Score blind KQ / lattice probe responses — exact match tiers.
 * Usage:
 *   npm run score:lattice-kq-probe -- --run=data/lattice-kq-probe/runs/example
 *   npm run score:lattice-kq-probe -- --file=path/to/manifest.json
 */
import { scoreRunBundle, loadRunFromDir, writeScoredReceipt, BLIND_PROMPT_V1 } from '../lib/lattice-kq-probe-score.mjs';

function parseArgs(argv) {
  const out = { run: null, file: null, contaminated: false };
  for (const a of argv) {
    if (a.startsWith('--run=')) out.run = a.slice(6);
    if (a.startsWith('--file=')) out.file = a.slice(7);
    if (a === '--contaminated') out.contaminated = true;
  }
  return out;
}

const { run, file, contaminated } = parseArgs(process.argv.slice(2));

let bundle;
if (file) {
  const { readFileSync } = await import('node:fs');
  bundle = JSON.parse(readFileSync(file, 'utf8'));
} else if (run) {
  bundle = loadRunFromDir(run);
} else {
  console.error('Provide --run=<dir> or --file=<manifest.json>');
  console.error('Canonical blind prompt (v1):\n');
  console.error(BLIND_PROMPT_V1);
  process.exit(1);
}

if (contaminated) bundle.contaminated = true;

const scored = scoreRunBundle(bundle);
console.log(JSON.stringify(scored, null, 2));

if (run) {
  const path = writeScoredReceipt(run, scored);
  console.error(`Wrote ${path}`);
}
