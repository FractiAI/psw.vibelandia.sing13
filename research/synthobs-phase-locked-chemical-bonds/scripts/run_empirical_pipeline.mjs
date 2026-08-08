#!/usr/bin/env node
/**
 * Empirical pipeline — Phase-Locked Chemical Bond Metaphors
 * Doc: WP-SYNTHOBS-PHASE-LOCKED-CHEMICAL-BONDS-2026-07
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  LAMBDA_EGS,
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
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS / E_F | ${PHI_EGS} |`,
    `| λ_EGS | ${LAMBDA_EGS} |`,
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
  lines.push(
    'Architectural / numerical Lattice Chat Agent Bond Model. Draft abstract 41.8% and σ²=0.0002 are design targets — receipt values are computed. Not chemistry derivation or Cursor invoices.',
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary:
      'Architectural Lattice Chat Agent bond metaphors + simulation. Draft abstract figures are design targets unless receipt-matched. Not chemistry or invoice claims.',
    results,
  };
  const jsonPath = path.join(OUT, 'empirical_report.json');
  const mdPath = path.join(OUT, 'empirical_report.md');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(mdPath, mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-phase-locked-chemical-bonds',
        report: jsonPath,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
      },
      null,
      2,
    ),
  );
  process.exit(results.all_pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
