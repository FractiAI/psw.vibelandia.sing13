#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  AGENT_NAME,
  PAPER_NAME,
  HONESTY,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const f = report.abstractFindings;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Agent:** ${AGENT_NAME}`,
    `**Generated:** ${report.generatedAt}`,
    `**Host:** ${report.host.cpus} CPU · ${report.host.platform} · Node ${report.host.node}`,
    '',
    '## Abstract findings',
    '',
    `**Design:** structural context reduction **${f.design.structuralReductionPct}%**; live Cursor multi-band **${f.design.liveCursorReductionPct?.toFixed?.(1) ?? f.design.liveCursorReductionPct}%** token savings vs vibe coding.`,
    `**Write:** mean **${f.write.meanTokenReductionPct.toFixed(1)}%** token savings on code locate + pointer-RAG (${f.write.tasks.join(', ')}).`,
    `**Deploy:** **${f.deploy.tokenReductionPct?.toFixed?.(1) ?? f.deploy.tokenReductionPct}%** token savings on ops/config grounding.`,
    `**Overall:** Lattice won **${f.overall.latticeWins}/${f.overall.n}** paired tasks across design · write · deploy; mean savings **${f.overall.meanTokenReductionPct.toFixed(1)}%** (work-class range ${f.overall.rangePct}).`,
    '',
    '### Output comparison (design · performance · size · quality)',
    '',
    `| Dimension | Lattice | Vibe coding | Winner |`,
    `|-----------|---------|-------------|--------|`,
    `| **Design** (output structure) | mean ${f.output.design.latticeMean.toFixed(2)} | mean ${f.output.design.vibeCodingMean.toFixed(2)} | ${f.output.design.winner} (${f.output.design.latticeWins}/${f.output.design.n} rows) |`,
    `| **Performance** (latency) | ${f.output.performance.latticeFasterCount}/${f.output.performance.n} faster | — | ${f.output.performance.winner} |`,
    `| **Size** (tokens) | ${f.output.size.meanTokenReductionPct.toFixed(1)}% mean reduction | — | ${f.output.size.winner} (${f.output.size.latticeWins}/${f.output.size.n}) |`,
    `| **Quality** (correctness) | mean ${f.output.quality.latticeMean.toFixed(2)} | mean ${f.output.quality.vibeCodingMean.toFixed(2)} | ${f.output.quality.winner} |`,
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All pass | ${report.results.all_pass} |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    '',
    '### Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`#### ${e.id} — ${e.title}`, '', `- Pass: \`${e.pass}\``, '');
  }
  lines.push(
    '',
    '### Honesty',
    '',
    HONESTY.note,
    '',
    HONESTY.notClaim,
    '',
    '→ ∞^∞',
  );
  return lines.join('\n');
}

async function main() {
  const results = await runAllExperiments();
  const report = {
    schema: 'synthobs-empirical-report/v1',
    title: STUDY_TITLE,
    paper: PAPER_NAME,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    agent: AGENT_NAME,
    generatedAt: new Date().toISOString(),
    host: {
      cpus: os.cpus().length,
      platform: `${os.platform()}-${os.arch()}`,
      node: process.version,
    },
    honesty: HONESTY,
    abstractFindings: results.abstractFindings,
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), `${mdReport(report)}\n`);
  console.log(`Wrote ${path.join(OUT, 'empirical_report.json')}`);
  console.log(`Pass: ${results.n_pass}/${results.n_total} · all_pass=${results.all_pass}`);
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
