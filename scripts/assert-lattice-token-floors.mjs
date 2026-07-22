#!/usr/bin/env node
/**
 * Goldilocks floors for Lattice token-savings claim.
 * Regenerates the comparison receipt, then asserts schema + savings floors.
 * Honesty: structural estimate — not vendor invoices.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RECEIPT = join(ROOT, 'data', 'lattice-vs-standard-comparison.json');

const MIN_SAVED_PERCENT = 90;
const MIN_STANDARD_OVER_LATTICE = 10;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

const regen = spawnSync(process.execPath, [join(ROOT, 'scripts', 'lattice-vs-standard-comparison.mjs')], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (regen.status !== 0) {
  fail(`compare:lattice exited ${regen.status}\n${regen.stderr || regen.stdout}`);
}

if (!existsSync(RECEIPT)) fail(`missing receipt ${RECEIPT}`);

let data;
try {
  data = JSON.parse(readFileSync(RECEIPT, 'utf8'));
} catch (e) {
  fail(`receipt JSON parse: ${e.message}`);
}

const c = data.comparison || {};
const std = Number(c.standardTokens);
const lat = Number(c.latticeTokens);
const savedPct = Number(c.percentSaved ?? c.savedPercent);
const honesty = String(data.honesty || c.honesty || '');

if (!Number.isFinite(std) || std <= 0) fail('comparison.standardTokens missing/invalid');
if (!Number.isFinite(lat) || lat <= 0) fail('comparison.latticeTokens missing/invalid');
if (!Number.isFinite(savedPct)) fail('comparison.percentSaved missing/invalid');
if (lat >= std) fail(`latticeTokens (${lat}) must be < standardTokens (${std})`);
if (std / lat < MIN_STANDARD_OVER_LATTICE) {
  fail(`savings ratio ${std / lat} < floor ${MIN_STANDARD_OVER_LATTICE}×`);
}
if (savedPct < MIN_SAVED_PERCENT) {
  fail(`percentSaved ${savedPct} < floor ${MIN_SAVED_PERCENT}%`);
}
if (!/estimate|structural|chars|not vendor|invoice/i.test(honesty)) {
  fail('receipt honesty line must state estimate / not vendor billing');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      standardTokens: std,
      latticeTokens: lat,
      percentSaved: savedPct,
      ratio: Math.round((std / lat) * 100) / 100,
      floors: { minSavedPercent: MIN_SAVED_PERCENT, minRatio: MIN_STANDARD_OVER_LATTICE },
    },
    null,
    2,
  ),
);
