#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  AGENT_NAME,
  PAPER_NAME,
  HONESTY,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const s = report.results.summary;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Agent:** ${AGENT_NAME}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All pass | ${report.results.all_pass} |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Mean edge reduction (legacy/MRI) | ${s.meanEdgeReduction.toFixed(3)}× |`,
    `| Mean token reduction | ${(s.meanTokenReduction * 100).toFixed(1)}% |`,
    `| Mean wall-time speedup | ${s.meanSpeedup.toFixed(3)}× |`,
    `| Mean ops saving | ${(s.meanOpsSaving * 100).toFixed(1)}% |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- Pass: \`${e.pass}\``, '');
  }
  lines.push('## Honesty', '', HONESTY.note, '', '→ ∞¹³', '');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    paperName: PAPER_NAME,
    generatedAt: new Date().toISOString(),
    operator: 'Synthio · Syntheverse Sandbox · SynthOBS family',
    honestyBoundary: HONESTY.note,
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        agent: AGENT_NAME,
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
        summary: results.summary,
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
