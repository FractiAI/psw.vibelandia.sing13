#!/usr/bin/env node
/**
 * Empirical pipeline — TBME Non-Local Field Phase-Lock (lens)
 * Doc: WP-SYNTHOBS-TBME-EMPIRICAL-PROOF-2026-08-01
 * Not Lattice engine runtime.
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
  PHASE_WINDOWS,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

async function readJsonOptional(name) {
  try {
    const raw = await fs.readFile(path.join(OUT, name), 'utf8');
    return JSON.parse(raw);
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
    '| Metric | Value |',
    '|--------|-------|',
    `| Scored experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS / E_F | ${PHI_EGS} |`,
    `| λ_EGS | ${LAMBDA_EGS} |`,
    '',
    '## Phase windows (protocol receipt)',
    '',
    '| Phase | UTC | ΔB (µT) | f (Hz) |',
    '|-------|-----|---------|--------|',
  ];
  for (const p of PHASE_WINDOWS) {
    lines.push(
      `| ${p.id} | ${p.utc} | ${p.deltaB_uT} | ${p.f_hz} |`,
    );
  }
  lines.push('');
  lines.push('## Experiments');
  lines.push('');
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **Pass:** \`${e.pass}\``);
    lines.push(`- **Verdict:** \`${e.verdict}\``);
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
    'Protocol-table and architectural checks only. Not clinical advice. Not a CODATA proof that prompting moves the ionosphere. E6 remains skip until independent SQUID+ELF dumps are provided.',
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
    lensOnly: true,
    latticeEngineWired: false,
    honestyBoundary:
      'TBME lens — protocol-table Pearson R and E_F harmonics. Architectural E_F key — not replacement of Maxwell or clinical neuromodulation. Laboratory SQUID+ELF gate is E6.',
    constants: { E_F, PHI_EGS, LAMBDA_EGS },
    phaseWindows: PHASE_WINDOWS,
    results,
  };
  const jsonPath = path.join(OUT, 'empirical_report.json');
  const mdPath = path.join(OUT, 'empirical_report.md');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(mdPath, mdReport(report), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        repo: 'https://github.com/FractiAI/synthobs-tbme-nonlocal-field-phaselock',
        latticeEngineWired: false,
        report: jsonPath,
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
