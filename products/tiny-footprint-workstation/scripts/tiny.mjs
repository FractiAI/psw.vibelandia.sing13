#!/usr/bin/env node
/**
 * Tiny Footprint Workstation CLI
 * Usage: node scripts/tiny.mjs <doctor|install|demo|benchmark|report|integrate>
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SUITE_CANDIDATES = [
  path.join(ROOT, 'research', 'synthobs-tiny-gateway-rhyming-templates'), // standalone repo layout
  path.join(ROOT, '..', '..', 'research', 'synthobs-tiny-gateway-rhyming-templates'), // SING 13 monorepo
];
const SUITE = SUITE_CANDIDATES.find((p) => fs.existsSync(p)) || SUITE_CANDIDATES[0];
const REPO = path.resolve(SUITE, '../..');
const REPORTS = path.join(ROOT, 'benchmarks', 'reports');

function log(msg) {
  console.log(`[tiny] ${msg}`);
}

function runNode(script, args = [], opts = {}) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    stdio: 'inherit',
    env: { ...process.env, ...opts.env },
  });
  return r.status ?? 1;
}

function doctor() {
  log('Tiny Footprint Workstation 0.1 · doctor');
  log(`workstation: ${ROOT}`);
  log(`suite: ${SUITE} ${fs.existsSync(SUITE) ? 'OK' : 'MISSING'}`);
  log(`node: ${process.version}`);
  const py = process.env.TINY_FOOTPRINT_PYTHON || 'py';
  const pr = spawnSync(py, ['-3', '--version'], { encoding: 'utf8' });
  log(`python: ${pr.status === 0 ? (pr.stdout || pr.stderr || '').trim() : 'not found (optional for GPU labs)'}`);
  const smi = spawnSync('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader'], {
    encoding: 'utf8',
  });
  if (smi.status === 0) log(`gpu: ${(smi.stdout || '').trim()}`);
  else log('gpu: nvidia-smi not available (CPU demo still works)');
  log('doctor complete');
  return 0;
}

function install() {
  log('install · verifying suite package scripts');
  if (!fs.existsSync(SUITE)) {
    log('ERROR: research suite not found. Clone full repo or sparse-checkout research/synthobs-tiny-gateway-rhyming-templates');
    return 1;
  }
  fs.mkdirSync(REPORTS, { recursive: true });
  const pkg = path.join(REPO, 'package.json');
  if (fs.existsSync(pkg)) {
    log('repo package.json present — run `npm ci` at repo root if dependencies missing');
  }
  log('install complete (Community Edition · no license key required)');
  return 0;
}

function demo() {
  log('demo · multi-session in-process Tiny Footprint workload');
  const demoScript = path.join(ROOT, 'workloads', 'multi-session', 'run.mjs');
  return runNode(demoScript);
}

function benchmark() {
  log('benchmark · conventional vs Tiny (delegates to SynthOBS suite)');
  fs.mkdirSync(REPORTS, { recursive: true });
  const pipeline = path.join(SUITE, 'scripts', 'run_empirical_pipeline.mjs');
  if (!fs.existsSync(pipeline)) {
    log('ERROR: suite pipeline missing');
    return 1;
  }
  const status = runNode(pipeline, [], {
    cwd: SUITE,
    env: { TINY_FOOTPRINT_FORCE_LLM_LAB: process.env.TINY_FOOTPRINT_FORCE_LLM_LAB || '0' },
  });
  // copy receipts into workstation reports
  for (const name of ['empirical_report.json', 'empirical_report.md', 'gpu_live_chat_hbm_lab.json', 'gpu_llm_real_lab.json']) {
    const src = path.join(SUITE, 'data', name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(REPORTS, name));
      log(`copied ${name}`);
    }
  }
  return status;
}

function report() {
  log('report · writing workstation summary HTML');
  fs.mkdirSync(REPORTS, { recursive: true });
  let empirical = null;
  const empPath = path.join(REPORTS, 'empirical_report.json');
  if (fs.existsSync(empPath)) {
    try {
      empirical = JSON.parse(fs.readFileSync(empPath, 'utf8'));
    } catch {
      empirical = null;
    }
  }
  const llmPath = path.join(REPORTS, 'gpu_llm_real_lab.json');
  let llm = null;
  if (fs.existsSync(llmPath)) {
    try {
      llm = JSON.parse(fs.readFileSync(llmPath, 'utf8'));
    } catch {
      llm = null;
    }
  }
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Tiny Footprint · Customer Benchmark</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
h1{font-size:1.6rem}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left}
.muted{color:#555;font-size:.9rem}</style></head><body>
<h1>Tiny Footprint — Customer Benchmark</h1>
<p class="muted">Generated ${new Date().toISOString()} · Workstation 0.1</p>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Suite all_pass</td><td>${empirical?.results?.all_pass ?? 'n/a'}</td></tr>
<tr><td>Aggregate memory gate</td><td>${empirical?.results?.H?.aggregatePct != null ? empirical.results.H.aggregatePct.toFixed(1) + '%' : 'n/a'}</td></tr>
<tr><td>Real LLM prefill speedup</td><td>${llm?.inference?.comparison?.prefillP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Real LLM generate speedup</td><td>${llm?.inference?.comparison?.generateP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Real LLM train-step speedup</td><td>${llm?.training?.comparison?.stepP50Speedup?.toFixed?.(2) ?? 'n/a'}×</td></tr>
<tr><td>Device</td><td>${llm?.device ?? 'see receipts'}</td></tr>
</table>
<p class="muted">Raw receipts in benchmarks/reports/. Honesty: local lab ≠ datacenter HBM / hosted frontier guarantee.</p>
</body></html>`;
  const out = path.join(REPORTS, 'customer-benchmark.html');
  fs.writeFileSync(out, html, 'utf8');
  log(`wrote ${out}`);
  return 0;
}

function integrate() {
  log('integrate · supported adapters (v0.1 stubs)');
  const adapters = path.join(ROOT, 'tiny-footprint', 'adapters', 'README.md');
  if (fs.existsSync(adapters)) {
    console.log(fs.readFileSync(adapters, 'utf8'));
  }
  log('Next: pick an adapter folder, set .env, re-run benchmark against your server.');
  return 0;
}

const cmd = process.argv[2] || 'doctor';
const map = { doctor, install, demo, benchmark, report, integrate };
if (!map[cmd]) {
  console.error(`Unknown command: ${cmd}`);
  console.error('Commands: doctor | install | demo | benchmark | report | integrate');
  process.exit(1);
}
process.exit(map[cmd]());
