#!/usr/bin/env node
/**
 * Catalog pipeline — Agentic Convergence Experiment
 * Doc: WP-SYNTHOBS-AGENTIC-CONVERGENCE-EXPERIMENT-2026-10-02
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
  CONVERGENCE_MARGIN,
  PORTABILITY_MARGIN,
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
    `**Generated:** ${report.generatedAt}`,
    `**Standalone:** ${STANDALONE_REPO}`,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Convergence gate | ${CONVERGENCE_MARGIN} |`,
    `| Portability gate | ${PORTABILITY_MARGIN} |`,
    `| Φ_EGS (honesty rail only) | ${PHI_EGS} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **honesty:** ${e.honesty}`);
    if (e.summary) {
      lines.push(
        `- **margin:** ${e.summary.margin?.toFixed?.(4) ?? e.summary.margin} (explorer ${e.summary.meanExplorer?.toFixed?.(4)} vs control ${e.summary.meanControl?.toFixed?.(4)})`,
      );
    }
    lines.push('');
  }
  lines.push('## Honesty');
  lines.push('');
  lines.push(HONESTY);
  lines.push('');
  lines.push('→ ∞^∞');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const results = runAllExperiments();
  const report = {
    schema: 'synthobs-agentic-convergence-experiment/v1',
    generatedAt: new Date().toISOString(),
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    STANDALONE_REPO,
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        out: 'research/synthobs-agentic-convergence-experiment/data/',
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
