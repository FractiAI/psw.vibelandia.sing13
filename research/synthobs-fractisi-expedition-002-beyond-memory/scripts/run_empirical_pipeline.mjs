#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  HONESTY,
  STANDALONE_PRODUCT_REPO,
  DIGITAL_SEED,
  EXPEDITION_NUMBER,
  EXPEDITION_TITLE,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');

function pct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

function mdReport(report) {
  const { E1, E2 } = report.results;
  return [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Expedition:** FractiSI Research Expedition ${EXPEDITION_NUMBER} · ${EXPEDITION_TITLE}`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    `**Product kit:** ${STANDALONE_PRODUCT_REPO}`,
    '',
    '## Verdict',
    '',
    `| All pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    '',
    '## E1 · Resource microbench',
    '',
    `| Dup cut vs full-copy (min–max) | ${pct(E1.summary.dupCutMin)} – ${pct(E1.summary.dupCutMax)} |`,
    `| Speedup vs full-copy (min–max) | ${E1.summary.speedupMin.toFixed(2)}× – ${E1.summary.speedupMax.toFixed(2)}× |`,
    `| Selective vs conventional slowdown | ${pct(E1.summary.selectiveSlowdownMin)} – ${pct(E1.summary.selectiveSlowdownMax)} |`,
    '',
    '## E2 · Discovery / collective',
    '',
    `| Scenarios | ${E2.scenarios} |`,
    `| FractiSI solution rate | ${pct(E2.fractisi.solutionRate)} |`,
    `| Flat solution rate | ${pct(E2.flat.solutionRate)} |`,
    `| Ops reduction | ${pct(E2.opsReduction)} |`,
    `| Rounds reduction | ${pct(E2.roundsReduction)} |`,
    '',
    '## Honesty',
    '',
    HONESTY,
    '',
    '→ ∞^∞',
    '',
  ].join('\n');
}

const report = runAllExperiments();
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(RESULTS, { recursive: true });
await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
await fs.writeFile(
  path.join(RESULTS, 'manifest.json'),
  JSON.stringify(
    {
      docId: DOC_ID,
      registryId: REGISTRY_ID,
      all_pass: report.results.all_pass,
      generatedAt: report.generatedAt,
    },
    null,
    2,
  ),
);
console.log(mdReport(report));
if (!report.results.all_pass) process.exitCode = 1;
