#!/usr/bin/env node
/**
 * Tiny Gateway Expedition 001 · empirical pipeline
 * Assignment synthetic airspace primary · optional historical secondary
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
  RADAR_PARAMS,
  EXPEDITION,
  EXPEDITION_NUMBER,
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
    `**Expedition:** ${EXPEDITION} ${EXPEDITION_NUMBER}`,
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**ENGINE_SHELF:** ${ENGINE_SHELF_SLOT ?? 'none (application companion)'}`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Data policy',
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
  lines.push('## Fusion (B) · assignment synthetic primary', '');
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
      `Assignment params: ${RADAR_PARAMS.sensors}×${RADAR_PARAMS.tracks}×${RADAR_PARAMS.timeSteps} = ${RADAR_PARAMS.observations} obs · ${RADAR_PARAMS.anomalyTracks} anomalies`,
      '',
    );
    if (r.B.historicalSecondary && !r.B.historicalSecondary.skipped) {
      lines.push(
        '### Historical secondary (Movebank+Kp)',
        '',
        `| Pipeline | F1 | Runtime ms |`,
        `|----------|---:|-----------:|`,
        `| Conventional | ${r.B.historicalSecondary.conventional.metrics.f1.toFixed(3)} | ${r.B.historicalSecondary.conventional.runtimeMs.toFixed(1)} |`,
        `| Tiny Gateway | ${r.B.historicalSecondary.tinyGateway.metrics.f1.toFixed(3)} | ${r.B.historicalSecondary.tinyGateway.runtimeMs.toFixed(1)} |`,
        '',
      );
    }
  }
  lines.push('## Template binding (C)', '');
  if (r.C?.stages) {
    lines.push(
      `| Stage | Median ms | p95 ms | n |`,
      `|-------|----------:|-------:|--:|`,
      `| Construct | ${r.C.stages.construct.medianMs.toFixed(4)} | ${r.C.stages.construct.p95Ms.toFixed(4)} | ${r.C.stages.construct.n} |`,
      `| Select | ${r.C.stages.select.medianMs.toFixed(4)} | ${r.C.stages.select.p95Ms.toFixed(4)} | ${r.C.stages.select.n} |`,
      `| Bind | ${r.C.stages.bind.medianMs.toFixed(4)} | ${r.C.stages.bind.p95Ms.toFixed(4)} | ${r.C.stages.bind.n} |`,
      `| Execute | ${r.C.stages.execute.medianMs.toFixed(4)} | ${r.C.stages.execute.p95Ms.toFixed(4)} | ${r.C.stages.execute.n} |`,
      `| End-to-end reuse | ${r.C.stages.endToEndReuse.medianMs.toFixed(4)} | ${r.C.stages.endToEndReuse.p95Ms.toFixed(4)} | ${r.C.stages.endToEndReuse.n} |`,
      '',
    );
  }
  lines.push('## Experiments', '');
  for (const e of r.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.sourceMode) lines.push(`- **sourceMode:** \`${e.sourceMode}\``);
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
  console.log(`[tiny-gateway-expedition] ${EXPEDITION} ${EXPEDITION_NUMBER}`);
  console.log(DATA_POLICY_HONESTY);
  const results = await runAllExperiments();
  const report = {
    schema: 'synthobs-tiny-gateway-expedition/v1',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    expedition: `${EXPEDITION} ${EXPEDITION_NUMBER}`,
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
        fixtureObservations: results.B?.fixture?.nObservations,
        enginePinRecommended: results.experiments.find((e) => e.id === 'E8_engine_pin_gate')
          ?.enginePinRecommended,
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

  console.log(
    `[tiny-gateway-expedition] pass ${results.n_pass}/${results.n_total} · lang=${results.A?.sourceMode} · fusion=${results.B?.sourceMode} · obs=${results.B?.fixture?.nObservations}`,
  );
  console.log(`[tiny-gateway-expedition] wrote ${path.join(OUT, 'empirical_report.json')}`);
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
