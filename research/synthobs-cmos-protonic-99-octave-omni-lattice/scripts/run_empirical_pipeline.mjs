#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  HOLOGRAPHIC_KEY_DIGITS,
  BINARY_TIER_N,
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
    `| All pass | ${report.results.all_pass} |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Binary tier n | ${BINARY_TIER_N} |`,
    `| 99×81 | ${HOLOGRAPHIC_KEY_DIGITS} |`,
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- Pass: \`${e.pass}\``, '');
  }
  lines.push(
    '## Honesty',
    '',
    'Catalog / engine suite — not foundry tape-out proof, not measured CV²f wins, not a procurement certificate.',
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
      'CMOS/protonic 99-octave Omni-Lattice validates Φ, binary n=1, protonic band, CMOS 2.0 fixtures — not fab measurements.',
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-cmos-protonic-99-octave-omni-lattice',
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
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
