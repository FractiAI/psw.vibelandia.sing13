#!/usr/bin/env node
/**
 * Catalog pipeline — Wave–Node Mathematics validation
 * Doc: WP-SYNTHOBS-WAVE-NODE-MATHEMATICS-EGS-2026-10-24
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
  ENGINE_SHELF_SLOT,
  DIGITAL_SEED,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');
const FIGURES = path.join(ROOT, 'figures');

function mdReport(report) {
  const lab = report.results.lab;
  const hs = lab.D.heldSummary;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**ENGINE_SHELF candidate slot:** ${ENGINE_SHELF_SLOT}`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Math validated (A∧B∧C) | \`${lab.summary.mathValidated}\` |`,
    `| Engine pin recommended | \`${lab.summary.enginePinRecommended}\` |`,
    `| Wave beats A* length (held-out) | \`${lab.D.waveBeatsAstarLength}\` |`,
    `| Phase helps vs ablation | \`${lab.D.phaseHelpsVsAblation}\` |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Runtime ms | ${lab.runtimeMs.toFixed(1)} |`,
    '',
    '## Held-out planning summary (D)',
    '',
    '| Method | Success rate | Mean path length | Collision rate |',
    '|---|---:|---:|---:|',
    `| A* | ${hs.astar.successRate.toFixed(3)} | ${hs.astar.meanLength.toFixed(3)} | ${hs.astar.collisionRate.toFixed(3)} |`,
    `| WaveNode+phase | ${hs.wavePhase.successRate.toFixed(3)} | ${hs.wavePhase.meanLength.toFixed(3)} | ${hs.wavePhase.collisionRate.toFixed(3)} |`,
    `| WaveNode ablation | ${hs.waveAblation.successRate.toFixed(3)} | ${hs.waveAblation.meanLength.toFixed(3)} | ${hs.waveAblation.collisionRate.toFixed(3)} |`,
    '',
    '## Wave convergence (B2)',
    '',
    `| nx | L2 error |`,
    `|---:|---:|`,
    ...lab.B.b2.refinements.map((r) => `| ${r.nx} | ${r.l2.toExponential(4)} |`),
    '',
    `Mean observed order: **${lab.B.b2.meanObservedOrder.toFixed(3)}**`,
    '',
    '## Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.evidence) lines.push(`- **Evidence tier:** ${e.evidence}`);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

/** Minimal SVG line chart from {x,y}[]. */
function svgLine(series, { title, xlab, ylab, w = 480, h = 280 }) {
  const pad = 40;
  const xs = series.map((p) => p.x);
  const ys = series.map((p) => p.y);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(0, ...ys);
  const ymax = Math.max(...ys) * 1.05 || 1;
  const sx = (x) => pad + ((x - xmin) / (xmax - xmin || 1)) * (w - 2 * pad);
  const sy = (y) => h - pad - ((y - ymin) / (ymax - ymin || 1)) * (h - 2 * pad);
  const pts = series.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#faf8f5"/>
  <text x="${w / 2}" y="18" text-anchor="middle" font-family="Georgia,serif" font-size="14">${title}</text>
  <polyline fill="none" stroke="#1a5f7a" stroke-width="2" points="${pts}"/>
  <text x="${w / 2}" y="${h - 8}" text-anchor="middle" font-size="11" font-family="sans-serif">${xlab}</text>
  <text x="12" y="${h / 2}" font-size="11" font-family="sans-serif" transform="rotate(-90 12 ${h / 2})">${ylab}</text>
</svg>
`;
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
    dependencyVersions: { node: process.version, platform: process.platform },
  };

  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(path.join(RESULTS, 'manifest.json'), JSON.stringify({
    generatedAt,
    seed: DIGITAL_SEED,
    docId: DOC_ID,
    codeVersion: REGISTRY_ID,
    node: process.version,
    enginePinRecommended: results.enginePinRecommended,
  }, null, 2));

  // Figure data + SVG
  const conv = results.lab.B.b2.refinements.map((r) => ({ x: r.nx, y: r.l2 }));
  await fs.writeFile(path.join(FIGURES, 'fig_b2_convergence.json'), JSON.stringify(conv, null, 2));
  await fs.writeFile(
    path.join(FIGURES, 'fig_b2_convergence.svg'),
    svgLine(conv, { title: 'Fig. B2 — FDTD L2 vs nx', xlab: 'nx', ylab: 'L2 error' }),
  );

  const mismatch = results.lab.C.c2.mismatch.map((m) => ({ x: m.K, y: m.rFinal }));
  await fs.writeFile(path.join(FIGURES, 'fig_c2_kuramoto_K.json'), JSON.stringify(mismatch, null, 2));
  await fs.writeFile(
    path.join(FIGURES, 'fig_c2_kuramoto_K.svg'),
    svgLine(mismatch, { title: 'Fig. C2 — Order param vs K', xlab: 'K', ylab: 'r_final' }),
  );

  const scale = results.lab.E.nodePlace.map((p) => ({ x: p.n, y: p.ms }));
  await fs.writeFile(path.join(FIGURES, 'fig_e_node_scale.json'), JSON.stringify(scale, null, 2));
  await fs.writeFile(
    path.join(FIGURES, 'fig_e_node_scale.svg'),
    svgLine(scale, { title: 'Fig. E — Lattice build time', xlab: 'nodes', ylab: 'ms' }),
  );

  const plan = results.lab.E.plan;
  await fs.writeFile(path.join(FIGURES, 'fig_e_plan_runtime.json'), JSON.stringify(plan, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        passed: `${results.n_pass}/${results.n_total}`,
        mathValidated: results.lab.summary.mathValidated,
        enginePinRecommended: results.enginePinRecommended,
        held: results.lab.D.heldSummary,
        waveOrder: results.lab.B.b2.meanObservedOrder,
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
