#!/usr/bin/env node
/**
 * Catalog pipeline — Holographic Singularity Crystal · Net Zero (engine companion #20)
 * Doc: WP-SYNTHOBS-HOLOGRAPHIC-SINGULARITY-CRYSTAL-NET-ZERO-EGS-2026-09-07
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  NODE_K0_DOC_ID,
  NODE_K0_REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  HONESTY,
  STANDALONE_REPO,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Node k=0 Document ID:** \`${NODE_K0_DOC_ID}\``,
    `**Node k=0 Registry ID:** \`${NODE_K0_REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Standalone | ${STANDALONE_REPO} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(e, null, 2));
    lines.push('```');
    lines.push('');
  }
  lines.push('## Honesty boundary');
  lines.push('');
  lines.push(HONESTY);
  lines.push('');
  return lines.join('\n');
}

const results = runAllExperiments();
const report = {
  generatedAt: new Date().toISOString(),
  results,
};

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));

console.log(
  JSON.stringify(
    {
      ok: results.all_pass,
      passed: `${results.n_pass}/${results.n_total}`,
      docId: DOC_ID,
      registryId: REGISTRY_ID,
      nodeK0: NODE_K0_REGISTRY_ID,
    },
    null,
    2,
  ),
);

if (!results.all_pass) process.exitCode = 1;
