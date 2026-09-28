#!/usr/bin/env node
/**
 * Empirical pipeline — e × φ × Prime Recursive Homeostasis
 * Doc: WP-SYNTHOBS-E-PHI-PRIME-RECURSIVE-HOMEOSTASIS-2026-09-28
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  E_CONST,
  HONESTY,
  STANDALONE_REPO,
  PROTOCOL_VERSION,
  SIGNIFICANCE_GATE,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Protocol:** \`${PROTOCOL_VERSION}\``,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass (suite integrity) | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Significance gate | \`${report.results.significance_gate_pass}\` |`,
    `| Engine shelf include | \`${report.results.engine_shelf_include}\` |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| e | ${E_CONST} |`,
    '',
    `**Engine shelf decision:** ${report.results.engine_shelf_decision}`,
    '',
  ];
  if (report.results.primary_readout) {
    const p = report.results.primary_readout;
    lines.push('## Primary readout (unified vs controls)');
    lines.push('');
    lines.push('| Arm | Goldilocks rate | Mean bleed | Mean E | Mean final D |');
    lines.push('|-----|-----------------|------------|--------|--------------|');
    lines.push(
      `| Control A | ${p.control_a.goldilocksRate.toFixed(3)} | ${p.control_a.meanB.toFixed(4)} | ${p.control_a.meanE.toFixed(4)} | ${p.control_a.meanFinalD.toFixed(4)} |`,
    );
    lines.push(
      `| Control B (randomized) | ${p.control_b.goldilocksRate.toFixed(3)} | ${p.control_b.meanB.toFixed(4)} | ${p.control_b.meanE.toFixed(4)} | ${p.control_b.meanFinalD.toFixed(4)} |`,
    );
    lines.push(
      `| Unified e+φ+prime | ${p.unified.goldilocksRate.toFixed(3)} | ${p.unified.meanB.toFixed(4)} | ${p.unified.meanE.toFixed(4)} | ${p.unified.meanFinalD.toFixed(4)} |`,
    );
    lines.push('');
    lines.push(
      `Hypothesis supported (gate): \`${p.hypothesis_supported}\`. Deltas: Goldilocks vs A = ${p.deltas.goldilocks_vs_A.toFixed(3)}, vs B = ${p.deltas.goldilocks_vs_B.toFixed(3)}, bleed vs A = ${p.deltas.bleed_vs_A.toFixed(4)}.`,
    );
    lines.push('');
  }
  lines.push('## Experiments');
  lines.push('');
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **Honesty:** ${e.honesty}`);
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(e, null, 2));
    lines.push('```');
    lines.push('');
  }
  lines.push('## Significance gate (pre-registered)');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(SIGNIFICANCE_GATE, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('## Honesty boundary');
  lines.push('');
  lines.push(HONESTY);
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const results = await runAllExperiments();
  const report = {
    schema: 'synthobs-empirical-report/v1',
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    title: STUDY_TITLE,
    protocol: PROTOCOL_VERSION,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honestyBoundary: HONESTY,
    results,
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: STANDALONE_REPO,
        n_pass: results.n_pass,
        n_total: results.n_total,
        failed: results.failed,
        significance_gate_pass: results.significance_gate_pass,
        engine_shelf_include: results.engine_shelf_include,
        engine_shelf_decision: results.engine_shelf_decision,
        primary: results.primary_readout
          ? {
              unified_goldilocks: results.primary_readout.unified.goldilocksRate,
              control_a_goldilocks: results.primary_readout.control_a.goldilocksRate,
              control_b_goldilocks: results.primary_readout.control_b.goldilocksRate,
              hypothesis_supported: results.primary_readout.hypothesis_supported,
            }
          : null,
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
