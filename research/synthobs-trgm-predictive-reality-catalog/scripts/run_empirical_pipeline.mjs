#!/usr/bin/env node
/**
 * TRGM #51 — Independent Predictive Validation & Functional Reality Catalog
 * Empirical pipeline runner.
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
  VALIDATION_SEED,
  EXPEDITION,
  REALITY_CATALOG_VERSION,
  PARENT_SHELF_SLOT,
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
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry:** \`${REGISTRY_ID}\``,
    `**Expedition:** ${EXPEDITION}`,
    `**ENGINE_SHELF:** #${ENGINE_SHELF_SLOT} (parent TRGM #${PARENT_SHELF_SLOT})`,
    `**Seed:** ${DIGITAL_SEED} · validation ${VALIDATION_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Metric | Value |`,
    `|---|---|`,
    `| All pass (V1–V8) | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass}/${r.n_total} |`,
    `| Engine pin recommended | \`${r.enginePinRecommended}\` |`,
    `| Reproduce #50 | \`${r.repro?.ok}\` · ${r.repro?.metrics?.n_pass}/${r.repro?.metrics?.n_total} |`,
    `| Catalog entries | ${r.repro?.metrics?.catalogEntries} |`,
    `| Held-out grammar BA | ${r.held?.predictiveValue?.catalogBA?.toFixed?.(3) ?? r.held?.predictiveValue?.catalogBA} |`,
    `| Shuffle BA | ${r.held?.predictiveValue?.shuffledBA?.toFixed?.(3) ?? r.held?.predictiveValue?.shuffledBA} |`,
    `| Reality catalog | ${REALITY_CATALOG_VERSION} · n=${r.realityCatalog?.index?.n} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
    '## Honesty',
    '',
    HONESTY,
    '',
    '## Experiments V1–V8',
    '',
  ];
  for (const e of r.experiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  lines.push('## Standalone', '', STANDALONE_REPO, '', '→ ∞^∞', '');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.mkdir(FIGURES, { recursive: true });

  const generatedAt = new Date().toISOString();
  const results = await runAllExperiments();
  const report = {
    generatedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    validationSeed: VALIDATION_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    parentShelfSlot: PARENT_SHELF_SLOT,
    realityCatalogVersion: REALITY_CATALOG_VERSION,
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
        validationSeed: VALIDATION_SEED,
        docId: DOC_ID,
        registryId: REGISTRY_ID,
        engineShelfSlot: ENGINE_SHELF_SLOT,
        all_pass: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        enginePinRecommended: results.enginePinRecommended,
        realityCatalogN: results.realityCatalog?.index?.n,
        node: process.version,
      },
      null,
      2,
    ),
  );

  const summarySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220" viewBox="0 0 720 220">
  <rect width="720" height="220" fill="#0a0806"/>
  <text x="24" y="40" fill="#d4af37" font-family="Georgia, serif" font-size="22">TRGM #51 · V1–V8</text>
  <text x="24" y="78" fill="#f5e6c8" font-family="sans-serif" font-size="16">${results.n_pass}/${results.n_total} pass · engine pin ${results.enginePinRecommended}</text>
  <text x="24" y="112" fill="#a8a29e" font-family="sans-serif" font-size="14">reproduce #50 ${results.repro?.metrics?.n_pass}/${results.repro?.metrics?.n_total} · catalog ${results.repro?.metrics?.catalogEntries}</text>
  <text x="24" y="140" fill="#a8a29e" font-family="sans-serif" font-size="14">held-out BA ${Number(results.held?.predictiveValue?.catalogBA || 0).toFixed(3)} vs shuffle ${Number(results.held?.predictiveValue?.shuffledBA || 0).toFixed(3)}</text>
  <text x="24" y="168" fill="#a8a29e" font-family="sans-serif" font-size="14">reality catalog ${REALITY_CATALOG_VERSION} · n=${results.realityCatalog?.index?.n}</text>
  <text x="24" y="198" fill="#78716c" font-family="sans-serif" font-size="12">seed ${DIGITAL_SEED} · validation ${VALIDATION_SEED}</text>
</svg>`;
  await fs.writeFile(path.join(FIGURES, 'v1_v8_summary.svg'), summarySvg);
  await fs.writeFile(
    path.join(FIGURES, 'v1_v8_summary.json'),
    JSON.stringify(
      {
        n_pass: results.n_pass,
        n_total: results.n_total,
        catalogBA: results.held?.predictiveValue?.catalogBA,
        shuffledBA: results.held?.predictiveValue?.shuffledBA,
        realityCatalogN: results.realityCatalog?.index?.n,
      },
      null,
      2,
    ),
  );

  console.log(
    `[TRGM #51] ${results.n_pass}/${results.n_total} pass · enginePin=${results.enginePinRecommended} · catalog n=${results.realityCatalog?.index?.n}`,
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
