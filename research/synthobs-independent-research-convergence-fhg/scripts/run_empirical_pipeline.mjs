#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  IRC_MARGIN_GATE,
  HONESTY,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

async function main() {
  const results = runAllExperiments();
  const panel = results.experiments.find((e) => e.id === 'E2_integrated_fhg_panel')?.panel;
  const report = {
    schema: 'synthobs-empirical-report/v1',
    suite: 'synthobs-independent-research-convergence-fhg',
    generatedAt: new Date().toISOString(),
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    HONESTY,
    results: {
      ...results,
      convergenceLayer: {
        label: 'Convergence Layer Test · computational lab',
        meanIrcMargin: panel?.meanMargin ?? null,
        meanAdaptiveSIRC: panel?.meanAdaptive ?? null,
        meanWastefulSIRC: panel?.meanWasteful ?? null,
        gate: IRC_MARGIN_GATE,
        nPanels: panel?.nPanels ?? 0,
      },
    },
  };

  await fs.mkdir(OUT, { recursive: true });
  const jsonPath = path.join(OUT, 'empirical_report.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const md = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Convergence Layer Test',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| All experiments pass | \`${results.all_pass}\` |`,
    `| Passed | ${results.n_pass} / ${results.n_total} |`,
    `| Integrated panel run | \`${results.integrated_panel_run}\` |`,
    `| Mean IRC margin | ${panel?.meanMargin?.toFixed(4) ?? '—'} |`,
    `| Gate | ${IRC_MARGIN_GATE} |`,
    '',
    HONESTY,
    '',
  ].join('\n');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), md);

  console.log(
    JSON.stringify({
      ok: results.all_pass,
      all_pass: results.all_pass,
      n_pass: results.n_pass,
      n_total: results.n_total,
      meanIrcMargin: panel?.meanMargin,
      path: jsonPath,
    }),
  );
  process.exit(results.all_pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
