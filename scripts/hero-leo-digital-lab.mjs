#!/usr/bin/env node
/**
 * CLI: npm run hero-leo:digital-lab
 *      npm run hero-leo:digital-lab -- --receipt   (score receipt only, no suite re-run)
 */
import {
  buildDigitalLab,
  loadScoreReceipt,
  runDigitalLabSuite,
} from '../lib/hero-leo-digital-lab.mjs';

const args = process.argv.slice(2);
const receiptOnly = args.includes('--receipt') || args.includes('--score');

if (receiptOnly) {
  console.log(JSON.stringify({ ok: true, scoreReceipt: loadScoreReceipt(), digitalLab: buildDigitalLab() }, null, 2));
  process.exit(0);
}

const result = runDigitalLabSuite();
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
