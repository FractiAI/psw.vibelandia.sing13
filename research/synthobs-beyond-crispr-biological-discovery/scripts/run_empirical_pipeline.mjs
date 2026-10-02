#!/usr/bin/env node
/**
 * Catalog pipeline — Beyond CRISPR Biological Discovery Challenge
 * Doc: WP-SYNTHOBS-BEYOND-CRISPR-BIOLOGICAL-DISCOVERY-2026-10-02
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
  DISCOVERY_QUESTION,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';
import { buildResearchQueue } from '../src/scoring.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');

function mdReport(report) {
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Generated:** ${report.generatedAt}`,
    `**Standalone:** ${STANDALONE_REPO}`,
    '',
    '## Discovery question',
    '',
    DISCOVERY_QUESTION,
    '',
    '## Verdict',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| All experiments pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    `| Φ_EGS (honesty rail only) | ${PHI_EGS} |`,
    `| Declared winner | \`null\` |`,
    '',
    '## Research queue (top 5 · triage only)',
    '',
  ];
  for (const row of report.results.queue.top) {
    lines.push(
      `- **${row.id}** · ${row.provisionalName} · interest=${row.researchInterest} · role=${row.role}`,
    );
  }
  lines.push('');
  lines.push('## Ultimate answers');
  lines.push('');
  if (report.results.ultimate.frameworkValidation) {
    lines.push(
      `**Framework validation (positive control):** ${report.results.ultimate.frameworkValidation.provisionalName}`,
    );
    lines.push('');
    lines.push(report.results.ultimate.frameworkValidation.statement);
    lines.push('');
  }
  lines.push(
    `**Most surprising gap architecture:** ${report.results.ultimate.mostSurprisingArchitecture.provisionalName}`,
  );
  lines.push('');
  lines.push(report.results.ultimate.mostSurprisingArchitecture.statement);
  lines.push('');
  if (report.results.ultimate.novelTestablePrediction.yes) {
    lines.push('**Novel prediction (gap lead):**');
    lines.push('');
    lines.push(report.results.ultimate.novelTestablePrediction.prediction);
  }
  if (report.results.blindDiscovery) {
    lines.push('');
    lines.push('## Blind discovery shortlist');
    lines.push('');
    for (const row of report.results.blindDiscovery.shortlist) {
      lines.push(
        `- **${row.id}** · ${row.literatureStatus} · interest=${row.researchInterest}`,
      );
    }
  }
  lines.push('');
  lines.push('## Experiments');
  lines.push('');
  for (const e of report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`);
    lines.push('');
    lines.push(`- **pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **interpretation:** ${e.interpretation}`);
    if (e.honesty) lines.push(`- **honesty:** ${e.honesty}`);
    lines.push('');
  }
  lines.push('## Honesty');
  lines.push('');
  lines.push(HONESTY);
  lines.push('');
  lines.push('→ ∞^∞');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const results = runAllExperiments();
  const fullQueue = buildResearchQueue();
  const report = {
    schema: 'synthobs-beyond-crispr-biological-discovery/v1',
    generatedAt: new Date().toISOString(),
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    STANDALONE_REPO,
    results,
    researchQueue: fullQueue,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(OUT, 'research_queue.json'),
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        declaredWinner: null,
        ranked: fullQueue.ranked,
        ultimate: results.ultimate,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        top: results.queue.top.map((t) => t.id),
        lead: results.ultimate.mostSurprisingArchitecture?.id,
        out: 'research/synthobs-beyond-crispr-biological-discovery/data/',
      },
      null,
      2,
    ),
  );
  if (!results.all_pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
