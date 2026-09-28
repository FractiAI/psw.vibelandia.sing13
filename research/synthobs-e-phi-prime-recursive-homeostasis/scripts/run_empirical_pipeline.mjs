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
    lines.push('## V1 free-run readout (locked development evidence)');
    lines.push('');
    lines.push(p.note || '');
    lines.push('');
    lines.push('| Arm | Goldilocks rate | Mean bleed | Mean E | Mean final D | E/(D+ε) |');
    lines.push('|-----|-----------------|------------|--------|--------------|--------|');
    const eff = p.evolution_efficiency || {};
    lines.push(
      `| Control A | ${p.control_a.goldilocksRate.toFixed(3)} | ${p.control_a.meanB.toFixed(4)} | ${p.control_a.meanE.toFixed(4)} | ${p.control_a.meanFinalD.toFixed(4)} | ${(eff.control_a ?? 0).toFixed(4)} |`,
    );
    lines.push(
      `| Control B (randomized) | ${p.control_b.goldilocksRate.toFixed(3)} | ${p.control_b.meanB.toFixed(4)} | ${p.control_b.meanE.toFixed(4)} | ${p.control_b.meanFinalD.toFixed(4)} | ${(eff.control_b ?? 0).toFixed(4)} |`,
    );
    lines.push(
      `| Unified e+φ+prime | ${p.unified.goldilocksRate.toFixed(3)} | ${p.unified.meanB.toFixed(4)} | ${p.unified.meanE.toFixed(4)} | ${p.unified.meanFinalD.toFixed(4)} | ${(eff.unified ?? 0).toFixed(4)} |`,
    );
    lines.push('');
    lines.push(
      `V1 Goldilocks gate: \`${p.hypothesis_supported}\`. Deltas: Goldilocks vs A = ${p.deltas.goldilocks_vs_A.toFixed(3)}, vs B = ${p.deltas.goldilocks_vs_B.toFixed(3)}, bleed vs A = ${p.deltas.bleed_vs_A.toFixed(4)}.`,
    );
    lines.push('');
  }
  if (report.results.diagnostic_readout) {
    const d = report.results.diagnostic_readout;
    const mb = d.matched_budget;
    lines.push('## EPH-RH-D matched-budget readout (engine gate)');
    lines.push('');
    lines.push('| Arm | Mean D | Mean B | Mean E | E/(D+ε) | Mean Q |');
    lines.push('|-----|--------|--------|--------|--------|--------|');
    for (const [name, s] of [
      ['Control A (matched intensity)', mb.A],
      ['Control B random', mb.B],
      ['Matched non-prime + regulator', mb.M],
      ['Unified regulator + prime', mb.U],
      ['Open-loop φ (V1-style)', mb.Open],
    ]) {
      lines.push(
        `| ${name} | ${s.meanD.toFixed(4)} | ${s.meanB.toFixed(4)} | ${s.meanE.toFixed(4)} | ${s.meanEfficiency.toFixed(4)} | ${s.meanQ.toFixed(3)} |`,
      );
    }
    lines.push('');
    lines.push(`Checks: \`${JSON.stringify(d.checks)}\``);
    lines.push(`Best order: \`${d.bestOrder}\` · Best φ strength: \`${d.bestPhiStrength}\` · Homeostatic signature rate: \`${d.homeostaticSignatureRate}\``);
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
        protocol: results.protocol,
        v1_goldilocks_gate_pass: results.v1_goldilocks_gate_pass,
        diagnostic_gate_pass: results.diagnostic_gate_pass,
        engine_shelf_include: results.engine_shelf_include,
        engine_shelf_decision: results.engine_shelf_decision,
        primary_v1: results.primary_readout
          ? {
              unified_goldilocks: results.primary_readout.unified.goldilocksRate,
              control_a_goldilocks: results.primary_readout.control_a.goldilocksRate,
              evolution_efficiency: results.primary_readout.evolution_efficiency,
            }
          : null,
        diagnostic: results.diagnostic_readout
          ? {
              checks: results.diagnostic_readout.checks,
              U_eff: results.diagnostic_readout.matched_budget.U.meanEfficiency,
              A_eff: results.diagnostic_readout.matched_budget.A.meanEfficiency,
              M_eff: results.diagnostic_readout.matched_budget.M.meanEfficiency,
              bestOrder: results.diagnostic_readout.bestOrder,
              bestPhiStrength: results.diagnostic_readout.bestPhiStrength,
              homeostaticSignatureRate: results.diagnostic_readout.homeostaticSignatureRate,
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
