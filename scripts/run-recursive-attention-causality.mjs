#!/usr/bin/env node
/**
 * Orchestrate recursive-attention causality validation:
 * 1. Refresh look-at-the-sun study (solar ↔ commits proxy)
 * 2. Run Python causality pipeline (Granger + permutation on public data)
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PY = join(ROOT, 'research', 'recursive-attention-causality', 'scripts', 'run_causality_validation.py');

function run(cmd, args, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

run('node', [join(__dirname, 'build-look-at-the-sun-study.mjs')], 'build:look-at-the-sun-study');
run('python', [PY], 'research:recursive-attention-causality');

console.log('\n✓ Causality validation complete — see research/recursive-attention-causality/output/');
