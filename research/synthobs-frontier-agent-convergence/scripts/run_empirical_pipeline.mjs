#!/usr/bin/env node
/**
 * Catalog pipeline — Frontier Agent Convergence Experiment
 * Doc: WP-SYNTHOBS-FRONTIER-AGENT-CONVERGENCE-EGS-2026-10-07
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
  EXPLORER_CONVERGENCE_GATE,
  CONFORMITY_AGREE_MARGIN,
  HONESTY_MARGIN,
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
    `| Explorer convergence gate | ${EXPLORER_CONVERGENCE_GATE} |`,
    `| Conformity agree margin | ${CONFORMITY_AGREE_MARGIN} |`,
    `| Honesty margin | ${HONESTY_MARGIN} |`,
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
    schema: 'synthobs-frontier-agent-convergence/v1',
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
        out: 'research/synthobs-frontier-agent-convergence/data/',
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
