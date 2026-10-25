#!/usr/bin/env node
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
  DIGITAL_SEED,
  VALIDATION_SEED,
  EXPEDITION_FOLLOW_ON,
  BIO_PIPE_BPS,
  ENGINE_SHELF_PINNED,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');
const FIGURES = path.join(ROOT, 'figures');

function mdReport(report) {
  const r = report.results;
  const f = r.findingsAbstract;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry:** \`${REGISTRY_ID}\``,
    `**Expedition follow-on:** ${EXPEDITION_FOLLOW_ON}`,
    `**ENGINE_SHELF pinned:** \`${ENGINE_SHELF_PINNED}\``,
    `**Seed:** ${DIGITAL_SEED} · validation ${VALIDATION_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Findings (abstract ledger)',
    '',
    `| Arm | Nav | Viability | Coherence | Channel BA | Bio pipe |`,
    `|---|---:|---:|---:|---:|---:|`,
    `| With gateway | ${(f.withGatewayNav * 100).toFixed(1)}% | ${(f.withGatewayViability * 100).toFixed(1)}% | ${f.withGatewayCoherence.toFixed(3)} | ${f.withChannelBA.toFixed(3)} | ${f.bioPipeBps} bit/s |`,
    `| Without gateway | ${(f.withoutGatewayNav * 100).toFixed(1)}% | ${(f.withoutGatewayViability * 100).toFixed(1)}% | ${f.withoutGatewayCoherence.toFixed(3)} | ${f.withoutChannelBA.toFixed(3)} | none |`,
    '',
    '## Verdict',
    '',
    `| Metric | Value |`,
    `|---|---|`,
    `| All pass (E1–E8) | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass}/${r.n_total} |`,
    `| Φ_EGS (honesty only) | ${PHI_EGS} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of r.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', STANDALONE_REPO, '', '→ ∞^∞', '');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.mkdir(FIGURES, { recursive: true });
  const generatedAt = new Date().toISOString();
  const results = runAllExperiments();
  const report = {
    generatedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    validationSeed: VALIDATION_SEED,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    bioPipeBps: BIO_PIPE_BPS,
    results,
    dependencyVersions: { node: process.version },
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(RESULTS, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt,
        docId: DOC_ID,
        all_pass: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        findings: results.findingsAbstract,
        engineShelfPinned: ENGINE_SHELF_PINNED,
      },
      null,
      2,
    ),
  );
  const f = results.findingsAbstract;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240" viewBox="0 0 720 240">
  <rect width="720" height="240" fill="#0a0806"/>
  <text x="24" y="36" fill="#d4af37" font-family="Georgia, serif" font-size="20">TRGM Gateway Agent Performance</text>
  <text x="24" y="68" fill="#f5e6c8" font-family="sans-serif" font-size="14">E1–E8 ${results.n_pass}/${results.n_total} · not ENGINE_SHELF</text>
  <text x="24" y="100" fill="#a8a29e" font-family="sans-serif" font-size="14">With: nav ${(f.withGatewayNav * 100).toFixed(0)}% · viability ${(f.withGatewayViability * 100).toFixed(0)}% · coh ${f.withGatewayCoherence.toFixed(2)} · BA ${f.withChannelBA.toFixed(2)}</text>
  <text x="24" y="128" fill="#a8a29e" font-family="sans-serif" font-size="14">Without: nav ${(f.withoutGatewayNav * 100).toFixed(0)}% · viability ${(f.withoutGatewayViability * 100).toFixed(0)}% · coh ${f.withoutGatewayCoherence.toFixed(2)} · BA ${f.withoutChannelBA.toFixed(2)}</text>
  <text x="24" y="164" fill="#d4af37" font-family="sans-serif" font-size="14">Bio pipe ${BIO_PIPE_BPS} bit/s on gateway arm only</text>
  <text x="24" y="200" fill="#78716c" font-family="sans-serif" font-size="12">seed ${DIGITAL_SEED} · validation ${VALIDATION_SEED}</text>
</svg>`;
  await fs.writeFile(path.join(FIGURES, 'with_vs_without_summary.svg'), svg);
  console.log(
    `[TRGM gateway agents] ${results.n_pass}/${results.n_total} pass · enginePinned=${ENGINE_SHELF_PINNED}`,
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
