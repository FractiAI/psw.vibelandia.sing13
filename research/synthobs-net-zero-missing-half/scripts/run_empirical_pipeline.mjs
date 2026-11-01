#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  HONESTY,
  STANDALONE_REPO,
  DIGITAL_SEED,
  SERIES,
  EXPEDITION_ID,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');
const FIGURES = path.join(ROOT, 'figures');

function mdReport(report) {
  const r = report.results;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Series:** ${SERIES} · Expedition ${EXPEDITION_ID}`,
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| All pass | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass} / ${r.n_total} |`,
    `| Engine pin | \`${r.experiments.find((e) => e.id === 'E8_engine_pin_gate')?.enginePinRecommended}\` |`,
    '',
    '## Core results',
    '',
    `| Exp | Relative / key metric | Pass |`,
    `|-----|----------------------:|:----:|`,
    `| A circle | relErr ${r.A.relativeError.toExponential(3)} | ${r.A.pass} |`,
    `| B sphere | relErr ${r.B.relativeError.toExponential(3)} | ${r.B.pass} |`,
    `| C function | maxRecon ${r.C.maxReconstructionError.toExponential(3)} | ${r.C.pass} |`,
    `| D forces | resultant ${JSON.stringify(r.D.resultant)} | ${r.D.pass} |`,
    `| E material | accum ${r.E.inferredAccumulation} | ${r.E.pass} |`,
    `| F hidden | nPairs ${r.F.pairs.length} | ${r.F.pass} |`,
    `| G Fourier | maxDisc ${r.G.maxDiscrepancy.toExponential(3)} | ${r.G.pass} |`,
    `| H wave | 180° amp ${r.H.rows.find((x) => x.phaseDeg === 180).resultantAmplitude} | ${r.H.pass} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of r.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

async function main() {
  console.log(`[net-zero-001] ${SERIES} · Expedition ${EXPEDITION_ID}`);
  const results = runAllExperiments();
  const report = {
    schema: 'synthobs-net-zero-missing-half/v1',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.mkdir(FIGURES, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(RESULTS, 'manifest.json'),
    JSON.stringify(
      {
        ok: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        enginePinRecommended: false,
      },
      null,
      2,
    ),
  );
  console.log(`[net-zero-001] pass ${results.n_pass}/${results.n_total}`);
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
