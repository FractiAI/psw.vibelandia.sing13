#!/usr/bin/env node
/**
 * Empirical pipeline — TBME Event Horizon ≡ Magnetic Vector Layer (Reno follow-on)
 * Doc: WP-SYNTHOBS-TBME-BLACKHOLE-MAGNETIC-LAYER-2026-08-01
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PARENT_DOC_ID,
  GRANDPARENT_DOC_ID,
  PHI_EGS,
  E_F,
  Z0,
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
    `**Grandparent:** \`${GRANDPARENT_DOC_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| All scored pass | \`${report.results.all_pass}\` |`,
    `| E_F | ${E_F} |`,
    `| Z₀ | ${Z0} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- **Pass:** \`${e.pass}\` · **Verdict:** \`${e.verdict}\``);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('', '```json', JSON.stringify(e, null, 2), '```', '');
  }
  lines.push(
    '## Honesty boundary',
    '',
    'Omni-Lattice companion lens (horizon ≡ magnetic vector layer). Algebraic/protocol checks only. Not clinical. Not CODATA overthrow. E6 skips without lab dump.',
    '',
  );
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments(readJsonOptional);
  const report = {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    parentDocId: PARENT_DOC_ID,
    grandparentDocId: GRANDPARENT_DOC_ID,
    title: STUDY_TITLE,
    interpretation: 'Reno-Horizon-Magnetic-Layer-Identity',
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    omniLatticeCompanion: true,
    lensOnly: true,
    latticeEngineWired: false,
    honestyBoundary:
      'Horizon ≡ A architectural identity lens. Not Lattice engine runtime. Lab gate is E6.',
    constants: { E_F, PHI_EGS, Z0, SCORECARD },
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-tbme-blackhole-magnetic-layer',
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
