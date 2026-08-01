#!/usr/bin/env node
/**
 * Empirical pipeline — TBME Mirror-Angle Multiplicity (Omni-Lattice companion lens)
 * Doc: WP-SYNTHOBS-TBME-SUPERPOSITION-MIRROR-FULL-REV2-2026-08-01
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  E_F,
  LAMBDA_EGS,
  THETA_EGS_DEG,
  INTENSITY_PROTOCOL,
  FACET_COUNT,
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
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| All scored pass | \`${report.results.all_pass}\` |`,
    `| E_F | ${E_F} |`,
    `| θ_EGS (deg) | ${THETA_EGS_DEG} |`,
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
    'Omni-Lattice companion lens. Protocol-table + algebraic checks. Not clinical. Not CODATA overthrow of laboratory QM. E7 skips without lab dump.',
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
    title: STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    omniLatticeCompanion: true,
    lensOnly: true,
    latticeEngineWired: false,
    honestyBoundary:
      'Mirror-angle / Born-as-optics architectural lens + protocol intensity table. Not Lattice engine runtime. Lab interferometry gate is E7.',
    constants: { E_F, PHI_EGS, LAMBDA_EGS, THETA_EGS_DEG, FACET_COUNT },
    intensityProtocol: INTENSITY_PROTOCOL,
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-tbme-mirror-angle-multiplicity',
        omniLatticeCompanion: true,
        latticeEngineWired: false,
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
