#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(outDir, { recursive: true });

const result = await runAllExperiments();
const stamp = {
  generatedAt: new Date().toISOString(),
  ...result,
};
fs.writeFileSync(
  path.join(outDir, 'empirical_summary.json'),
  JSON.stringify(stamp, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    { all_pass: result.all_pass, n_pass: result.n_pass, n_total: result.n_total, failed: result.failed },
    null,
    2,
  ),
);
if (!result.all_pass) process.exitCode = 1;
