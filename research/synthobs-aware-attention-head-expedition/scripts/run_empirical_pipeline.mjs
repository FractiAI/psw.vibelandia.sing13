#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExpedition } from '../src/experiments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });
const report = runExpedition();
report.generatedAt = new Date().toISOString();
writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2));
const pct = (x) => (x * 100).toFixed(1) + '%';
const lines = [
  '# Aware Attention Head Expedition · empirical report',
  '',
  '**Document ID:** `' + report.documentId + '`',
  '**Verdict:** ' + report.verdict.summary,
  '',
  '| Family | A flat | B shared world | C aware head | C−B (95% CI) |',
  '|---|---|---|---|---|',
  ...Object.entries(report.families).map(([k, f]) =>
    `| ${k} | ${pct(f.A.success)} | ${pct(f.B.success)} | ${pct(f.C.success)} | ${pct(f.CminusB.mean)} [${pct(f.CminusB.lo)}, ${pct(f.CminusB.hi)}] |`),
  '',
  '| Property | A | B | C | Mechanism removed |',
  '|---|---|---|---|---|',
  ...report.spiritProfile.map((r) => `| ${r.id} ${r.property} | ${pct(r.A)} | ${pct(r.B)} | ${pct(r.C)} | -${(r.ablationDrop * 100).toFixed(1)} |`),
  '',
  '**Gates:** ' + Object.entries(report.gates).map(([k, v]) => `${k}=${v}`).join(' · '),
  '',
  '→ ∞^∞',
  '',
];
writeFileSync(join(dataDir, 'empirical_report.md'), lines.join(String.fromCharCode(10)));
console.log(JSON.stringify({ ok: true, gates: report.gates, overall: report.overall, verdict: report.verdict }, null, 2));
