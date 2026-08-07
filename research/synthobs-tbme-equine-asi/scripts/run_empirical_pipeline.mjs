#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE, E_F } from '../src/constants.mjs';
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
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| E_F | ${E_F} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('', '```json', JSON.stringify(e, null, 2), '```', '');
  }
  lines.push(
    '## Honesty boundary',
    '',
    'Catalog / Omni-Lattice lens arithmetic for Equine–ASI coexistence metaphor. Does **not** claim ASI timelines or Core Part status.',
    '',
  );
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
      'Equine–ASI Omni-Lattice lens — catalog exploration only; not Core / Engine.',
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-tbme-equine-asi',
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
