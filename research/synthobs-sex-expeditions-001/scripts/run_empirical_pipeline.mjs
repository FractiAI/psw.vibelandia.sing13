#!/usr/bin/env node
/**
 * Catalog pipeline — SEX EXPEDITIONS Expedition 001 · Paper 001
 * Doc: WP-SYNTHOBS-SEX-EXPEDITIONS-001-EGS-2026-10-23
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
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
  const lab = report.results.experiments.find((e) => e.id === 'E2')?.lab;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
  ];
  if (lab) {
    lines.push('## Synthetic R² table (held-out test)', '');
    lines.push(
      '| Scenario | Biology-only | Experience-only | Combined additive | Combined + interaction |',
    );
    lines.push('|---|---:|---:|---:|---:|');
    for (const s of lab.scenarios) {
      lines.push(
        `| ${s.label} | ${s.r2.biology_only} | ${s.r2.experience_only} | ${s.r2.combined_additive} | ${s.r2.combined_interaction} |`,
      );
    }
    lines.push(
      `| **Mean** | **${lab.means.biology_only}** | **${lab.means.experience_only}** | **${lab.means.combined_additive}** | **${lab.means.combined_interaction}** |`,
    );
    lines.push('');
  }
  lines.push('## Experiments', '');
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
  lines.push('## Honesty boundary', '');
  lines.push(HONESTY);
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const report = {
    schema: 'synthobs-empirical-report/v1',
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary: HONESTY,
    results,
  };
  await fs.writeFile(
    path.join(OUT, 'empirical_report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: STANDALONE_REPO,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
        means: results.experiments.find((e) => e.id === 'E2')?.lab?.means,
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
