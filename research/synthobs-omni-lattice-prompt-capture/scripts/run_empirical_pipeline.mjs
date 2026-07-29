#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE, PHI_EGS, LAMBDA_EGS } from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data');

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| λ_EGS | ${LAMBDA_EGS} |`,
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
  }
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
      'Architectural prompt↔DNA metaphor. Not a claim biological DNA is AI chat logs. EX-CAP figures are design targets.',
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  console.log(JSON.stringify({ ok: results.all_pass, passed: `${results.n_pass}/${results.n_total}` }, null, 2));
  process.exit(results.all_pass ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
