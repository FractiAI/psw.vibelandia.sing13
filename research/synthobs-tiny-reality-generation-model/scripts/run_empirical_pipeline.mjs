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
  ENGINE_SHELF_SLOT,
  DIGITAL_SEED,
  EXPEDITION,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');
const FIGURES = path.join(ROOT, 'figures');

function mdReport(report) {
  const lab = report.results.lab;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry:** \`${REGISTRY_ID}\``,
    `**Expedition:** ${EXPEDITION}`,
    `**ENGINE_SHELF candidate:** #${ENGINE_SHELF_SLOT}`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Metric | Value |`,
    `|---|---|`,
    `| All pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Foundation Wave–Node | \`${lab.foundation.allPass}\` |`,
    `| Held-out viability | ${(lab.held.summary.viabilityRate * 100).toFixed(1)}% |`,
    `| Null viability | ${(lab.nullBaseline.viabilityRate * 100).toFixed(1)}% |`,
    `| Engine pin recommended | \`${lab.summary.enginePinRecommended}\` |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Runtime ms | ${lab.runtimeMs.toFixed(1)} |`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

function svgBars(rows, { title, w = 480, h = 280 }) {
  const pad = 40;
  const max = Math.max(...rows.map((r) => r.y), 1e-9);
  const bw = (w - 2 * pad) / rows.length;
  const bars = rows
    .map((r, i) => {
      const bh = ((r.y / max) * (h - 2 * pad)) | 0;
      const x = pad + i * bw + 8;
      const y = h - pad - bh;
      return `<rect x="${x}" y="${y}" width="${bw - 16}" height="${bh}" fill="#1a5f7a"/><text x="${x + (bw - 16) / 2}" y="${h - 12}" text-anchor="middle" font-size="10">${r.x}</text>`;
    })
    .join('');
  return `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#faf8f5"/><text x="${w / 2}" y="18" text-anchor="middle" font-family="Georgia,serif" font-size="14">${title}</text>${bars}</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.mkdir(FIGURES, { recursive: true });
  const results = runAllExperiments();
  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
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
        seed: DIGITAL_SEED,
        docId: DOC_ID,
        enginePinRecommended: results.enginePinRecommended,
        node: process.version,
      },
      null,
      2,
    ),
  );
  const bars = [
    { x: 'TRGM', y: results.lab.held.summary.viabilityRate },
    { x: 'Null', y: results.lab.nullBaseline.viabilityRate },
    { x: 'Ablateφ', y: results.lab.ablationNoPhaseGate.viabilityRate },
  ];
  await fs.writeFile(path.join(FIGURES, 'fig_viability.json'), JSON.stringify(bars, null, 2));
  await fs.writeFile(
    path.join(FIGURES, 'fig_viability.svg'),
    svgBars(bars, { title: 'Fig. TRGM — Held-out viability rates' }),
  );
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        passed: `${results.n_pass}/${results.n_total}`,
        heldViability: results.lab.held.summary.viabilityRate,
        nullViability: results.lab.nullBaseline.viabilityRate,
        enginePinRecommended: results.enginePinRecommended,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
