#!/usr/bin/env node
/**
 * Tiny Gateway · Leo Computational Lab pipeline
 * Real/historical data first · synthetic fallback only if env allows
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
  REAL_FUSION_WINDOW,
} from '../src/constants.mjs';
import { DATA_POLICY_HONESTY } from '../src/data-policy.mjs';
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
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**ENGINE_SHELF candidate:** ${ENGINE_SHELF_SLOT} (data-gated)`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Data policy (Leo Computational Lab)',
    '',
    DATA_POLICY_HONESTY,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass} / ${r.n_total} |`,
    `| Language sourceMode | \`${r.A?.sourceMode ?? 'n/a'}\` |`,
    `| Fusion sourceMode | \`${r.B?.sourceMode ?? 'n/a'}\` |`,
    `| Engine pin recommended | \`${r.experiments?.find((e) => e.id === 'E8_engine_pin_gate')?.enginePinRecommended}\` |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
    '## Language (A)',
    '',
  ];
  if (r.A?.skipped) {
    lines.push(`Skipped: ${r.A.honesty}`, '');
  } else if (r.A?.accuracy) {
    lines.push(
      `| Arm | Accuracy | Median latency ms | Size bytes |`,
      `|-----|---------:|------------------:|-----------:|`,
      `| Lightweight | ${r.A.accuracy.lightweight.accuracy.toFixed(3)} | ${r.A.latency.lightweight.medianMs.toFixed(3)} | ${r.A.modelSizeBytes.lightweight} |`,
      `| Micro-Transformer | ${r.A.accuracy.microTransformer.accuracy.toFixed(3)} | ${r.A.latency.microTransformer.medianMs.toFixed(3)} | ${r.A.modelSizeBytes.microTransformer} |`,
      `| Tiny Gateway | ${r.A.accuracy.tinyGateway.accuracy.toFixed(3)} | ${r.A.latency.tinyGateway.medianMs.toFixed(3)} | ${r.A.modelSizeBytes.tinyGateway} |`,
      '',
    );
  }
  lines.push('## Fusion (B)', '');
  if (r.B?.skipped) {
    lines.push(`Skipped: ${r.B.honesty}`, '');
  } else {
    lines.push(
      `| Pipeline | F1 | Precision | Recall | Runtime ms |`,
      `|----------|---:|----------:|-------:|-----------:|`,
      `| Conventional | ${r.B.conventional.metrics.f1.toFixed(3)} | ${r.B.conventional.metrics.precision.toFixed(3)} | ${r.B.conventional.metrics.recall.toFixed(3)} | ${r.B.conventional.runtimeMs.toFixed(1)} |`,
      `| Tiny Gateway | ${r.B.tinyGateway.metrics.f1.toFixed(3)} | ${r.B.tinyGateway.metrics.precision.toFixed(3)} | ${r.B.tinyGateway.metrics.recall.toFixed(3)} | ${r.B.tinyGateway.runtimeMs.toFixed(1)} |`,
      '',
      `Fixture: ${JSON.stringify(r.B.fixture)}`,
      '',
      `Preferred window: ${REAL_FUSION_WINDOW.study} · ${REAL_FUSION_WINDOW.startHour} · ${REAL_FUSION_WINDOW.targetSteps} steps`,
      '',
    );
  }
  lines.push('## Experiments', '');
  for (const e of r.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.sourceMode) lines.push(`- **sourceMode:** \`${e.sourceMode}\``);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

function svgBars(rows, { title, w = 520, h = 280 }) {
  const pad = 40;
  const maxY = Math.max(...rows.map((r) => r.y), 1e-6);
  const bw = (w - 2 * pad) / rows.length;
  const bars = rows
    .map((r, i) => {
      const bh = ((r.y / maxY) * (h - 2 * pad)) | 0;
      const x = pad + i * bw + 4;
      const y = h - pad - bh;
      return `<rect x="${x}" y="${y}" width="${bw - 8}" height="${bh}" fill="#1a5f7a"/><text x="${x + (bw - 8) / 2}" y="${h - pad + 14}" text-anchor="middle" font-size="10">${r.label}</text>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#faf8f5"/>
  <text x="${w / 2}" y="18" text-anchor="middle" font-family="Georgia,serif" font-size="14">${title}</text>
  ${bars}
</svg>`;
}

async function main() {
  console.log('[tiny-gateway] Leo Computational Lab · real-data priority');
  console.log(DATA_POLICY_HONESTY);
  const results = await runAllExperiments();
  const report = {
    schema: 'synthobs-tiny-gateway-language-radar/v1',
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
        languageSourceMode: results.A?.sourceMode,
        fusionSourceMode: results.B?.sourceMode,
        enginePinRecommended: results.experiments.find((e) => e.id === 'E8_engine_pin_gate')?.enginePinRecommended,
      },
      null,
      2,
    ),
  );

  if (!results.A?.skipped && results.A?.accuracy) {
    await fs.writeFile(
      path.join(FIGURES, 'language_accuracy.svg'),
      svgBars(
        [
          { label: 'LW', y: results.A.accuracy.lightweight.accuracy },
          { label: 'μTF', y: results.A.accuracy.microTransformer.accuracy },
          { label: 'TG', y: results.A.accuracy.tinyGateway.accuracy },
        ],
        { title: `Language accuracy · ${results.A.sourceMode}` },
      ),
    );
  }
  if (!results.B?.skipped) {
    await fs.writeFile(
      path.join(FIGURES, 'fusion_f1.svg'),
      svgBars(
        [
          { label: 'Conv', y: results.B.conventional.metrics.f1 },
          { label: 'TG', y: results.B.tinyGateway.metrics.f1 },
        ],
        { title: `Fusion F1 · ${results.B.sourceMode}` },
      ),
    );
  }

  console.log(`[tiny-gateway] pass ${results.n_pass}/${results.n_total} · lang=${results.A?.sourceMode} · fusion=${results.B?.sourceMode}`);
  console.log(`[tiny-gateway] wrote ${path.join(OUT, 'empirical_report.json')}`);
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
