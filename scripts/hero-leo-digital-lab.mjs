#!/usr/bin/env node
/**
 * CLI: npm run hero-leo:digital-lab
 *      npm run hero-leo:digital-lab -- --receipt   (score receipt only, no suite re-run)
 */
import {
  buildDigitalLab,
  loadConvergenceLayerReceipt,
  loadScoreReceipt,
  runConvergenceLayerSuite,
  runDigitalLabSuite,
} from '../lib/hero-leo-digital-lab.mjs';

const args = process.argv.slice(2);
const receiptOnly = args.includes('--receipt') || args.includes('--score');
const convergence = args.includes('--convergence') || args.includes('--convergence-layer');

if (receiptOnly) {
  const scoreReceipt = convergence ? loadConvergenceLayerReceipt() : loadScoreReceipt();
  console.log(JSON.stringify({ ok: true, scoreReceipt, digitalLab: buildDigitalLab() }, null, 2));
  process.exit(0);
}

const result = convergence ? runConvergenceLayerSuite() : runDigitalLabSuite();
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
