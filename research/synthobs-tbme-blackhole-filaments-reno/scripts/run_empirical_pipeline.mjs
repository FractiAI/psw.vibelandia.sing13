#!/usr/bin/env node
/**
 * Empirical pipeline — TBME Toroidal Micro-Black Hole Filaments (Reno follow-on)
 * Doc: WP-SYNTHOBS-TBME-BLACKHOLE-FILAMENTS-RENO-2026-08-01
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PARENT_DOC_ID,
  PHI_EGS,
  E_F,
  LAMBDA_EGS,
  R_N,
  FACET_COUNT,
  SHELL_COUNT,
  SHELL_FACET_TIERS,
  SCORECARD,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

async function readJsonOptional(name) {
  try {
    return JSON.parse(await fs.readFile(path.join(OUT, name), 'utf8'));
  } catch {
    return null;
  }
}

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Parent:** \`${PARENT_DOC_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| All scored pass | \`${report.results.all_pass}\` |`,
    `| E_F | ${E_F} |`,
    `| R_n | ${R_N} |`,
    `| Facets | ${FACET_COUNT} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\` · **Verdict:** \`${e.verdict}\``);
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
    'Omni-Lattice companion lens (Reno toroidal micro-BH + filaments). Algebraic/protocol checks only. Not clinical. Not CODATA overthrow. E7 skips without lab dump.',
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments(readJsonOptional);
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    parentDocId: PARENT_DOC_ID,
    title: STUDY_TITLE,
    interpretation: 'Reno-Toroidal-BH-Filaments',
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    omniLatticeCompanion: true,
    lensOnly: true,
    latticeEngineWired: false,
    honestyBoundary:
      'Toroidal micro-BH + filamental flux architectural lens. Not Lattice engine runtime. Lab gate is E7.',
    constants: {
      E_F,
      PHI_EGS,
      LAMBDA_EGS,
      R_N,
      FACET_COUNT,
      SHELL_COUNT,
      SHELL_FACET_TIERS,
      SCORECARD,
    },
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-tbme-blackhole-filaments-reno',
        interpretation: 'Reno-Toroidal-BH-Filaments',
        passed: `${results.n_pass}/${results.n_total}`,
        failed: results.failed,
        experiments: results.experiments.map((e) => ({
          id: e.id,
          verdict: e.verdict,
          pass: e.pass,
        })),
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
