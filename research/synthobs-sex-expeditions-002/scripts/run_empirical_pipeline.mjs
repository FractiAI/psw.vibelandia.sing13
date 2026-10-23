#!/usr/bin/env node
/**
 * Catalog pipeline — SEX EXPEDITIONS Expedition 002
 * Doc: WP-SYNTHOBS-SEX-EXPEDITIONS-002-EGS-2026-10-23
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
    lines.push('## Model comparison (synthetic pilot)', '');
    lines.push(
      '| Model | Tracking RMSE ↓ | Mean |Δ| ↓ | Recovery MAE ↓ | Continuity ratio ↑ |',
    );
    lines.push('|---|---:|---:|---:|---:|');
    for (const m of lab.models) {
      lines.push(
        `| ${m.label} | ${m.tracking_rmse} | ${m.mean_abs_step_change} | ${m.recovery_mae} | ${m.continuity_ratio} |`,
      );
    }
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
        models: results.experiments
          .find((e) => e.id === 'E2')
          ?.lab?.models?.map((m) => ({
            id: m.id,
            rmse: m.tracking_rmse,
            step: m.mean_abs_step_change,
            recovery: m.recovery_mae,
            pass: m.pass,
          })),
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
