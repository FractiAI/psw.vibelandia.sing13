#!/usr/bin/env node
/**
 * ERFT-E empirical pipeline — continuous regulation + confirmatory held-out
 * Doc: WP-SYNTHOBS-ERFT-E-CONTINUOUS-REGULATION-2026-09-28
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
  PROTOCOL_VERSION,
  PRE_REGISTERED_HYPOTHESIS,
  ENGINE_INCLUSION_GATE,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const v = report.results.verdict || {};
  const gate = report.results.experiments.find((e) => e.id === 'E3_engine_inclusion_gate');
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Protocol:** \`${PROTOCOL_VERSION}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict (read first)',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| All experiments pass (protocol) | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Better constant on holdout | \`${v.better_constant}\` |`,
    `| Better combination | \`${v.better_combination}\` |`,
    `| Nothing to crown | \`${v.nothing_to_crown}\` |`,
    `| ENGINE_SHELF inclusion recommended | \`${v.engine_shelf}\` |`,
    `| Φ_EGS (peer arm) | ${PHI_EGS} |`,
    '',
    '## Engine inclusion gate',
    '',
    '```json',
    JSON.stringify(gate, null, 2),
    '```',
    '',
    `Gate on fail: ${ENGINE_INCLUSION_GATE.on_fail}`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
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
  lines.push(`Standalone: ${STANDALONE_REPO}`);
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
    protocol: PROTOCOL_VERSION,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary: HONESTY,
    preRegisteredHypothesis: PRE_REGISTERED_HYPOTHESIS,
    engineInclusionGate: ENGINE_INCLUSION_GATE,
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        all_pass: results.all_pass,
        engine_inclusion_recommended: results.engine_inclusion_recommended,
        verdict: results.verdict,
        n_pass: results.n_pass,
        n_total: results.n_total,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
