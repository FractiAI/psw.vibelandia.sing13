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
  RESEARCH_QUESTION,
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
    `**Research question:** ${RESEARCH_QUESTION}`,
    '',
    `**Answer:** **${f.answer === 'yes' ? 'Yes' : 'No'}** — ${f.summary}`,
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Fractal echo (Lattice ↔ SNA/IP) | ${f.fractalEcho?.toFixed?.(4) ?? f.fractalEcho} |`,
    `| Coherence advantage (Lattice/flat mean) | ${f.coherenceAdvantage?.toFixed?.(2) ?? f.coherenceAdvantage}× |`,
    `| Routing savings | ${f.routingSavingsPct?.toFixed?.(1) ?? f.routingSavingsPct}% |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| All pass | ${report.results.all_pass} |`,
    `| Passed | ${report.results.n_pass}/${report.results.n_total} |`,
    '',
    '### Experiments',
    '',
  ];
  for (const e of report.results.experiments) {
    lines.push(`#### ${e.id} — ${e.title}`, '', `- Pass: \`${e.pass}\``, '');
  }
  lines.push('', '### Honesty', '', HONESTY.note, '', HONESTY.notClaim, '', '→ ∞^∞');
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
