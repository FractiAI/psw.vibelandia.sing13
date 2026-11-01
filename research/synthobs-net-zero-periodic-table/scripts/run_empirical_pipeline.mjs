#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  HONESTY,
  STANDALONE_REPO,
  DIGITAL_SEED,
  SERIES,
  EXPEDITION_ID,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');

function mdReport(report) {
  const r = report.results;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Series:** ${SERIES} · Expedition ${EXPEDITION_ID}`,
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| All pass | \`${r.all_pass}\` |`,
    `| Passed | ${r.n_pass} / ${r.n_total} |`,
    `| Engine pin | \`false\` |`,
    `| Novel observations supported | ${r.novelObservations?.nSupported}/${r.novelObservations?.n} |`,
    '',
    '## Core results',
    '',
    `| Exp | Key metric | Pass |`,
    `|-----|-----------|:----:|`,
    `| A grammar | octet ${r.A.valenceSum} · involution ${r.A.involutionOk} | ${r.A.pass} |`,
    `| B Pauling Δχ | Spearman ρ(period)=${r.B.spearmanRhoVsPeriod.toFixed(3)} | ${r.B.pass} |`,
    `| C Allen | ρ vs Pauling=${r.C.spearmanVsPauling.toFixed(3)} | ${r.C.pass} |`,
    `| D Allred–Rochow | ρ vs Pauling=${r.D.spearmanVsPauling.toFixed(3)} | ${r.D.pass} |`,
    `| E ΔIE1 | ρ vs Δχ=${r.E.spearmanVsPaulingDeltaChi.toFixed(3)} | ${r.E.pass} |`,
    `| F −Δr | ρ vs Δχ=${r.F.spearmanNegDeltaRVsPauling.toFixed(3)} | ${r.F.pass} |`,
    `| G permute | ρ=${r.G.observedSpearman.toFixed(3)} p≈${r.G.pApprox.toFixed(3)} | ${r.G.pass} |`,
    `| H pin+catalog | catalog ${r.CAT.catalog.nSupported}/${r.CAT.catalog.n} | ${r.H.pass && r.CAT.pass} |`,
    '',
    '## Novel observation catalog',
    '',
  ];
  for (const row of r.novelObservations?.rows || []) {
    lines.push(`- **${row.id}** (${row.tier}, ${row.status}): ${row.claim}`);
  }
  lines.push('', '## Experiments', '');
  for (const e of r.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '', `- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- **Interpretation:** ${e.interpretation}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

async function main() {
  console.log(`[net-zero-002] ${SERIES} · Expedition ${EXPEDITION_ID}`);
  const results = runAllExperiments();
  const report = {
    schema: 'synthobs-net-zero-periodic-table/v1',
    DOC_ID,
    REGISTRY_ID,
    STUDY_TITLE,
    generatedAt: new Date().toISOString(),
    results,
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(OUT, 'novel_observations.json'),
    JSON.stringify(results.novelObservations, null, 2),
  );
  await fs.writeFile(
    path.join(RESULTS, 'manifest.json'),
    JSON.stringify(
      {
        ok: results.all_pass,
        n_pass: results.n_pass,
        n_total: results.n_total,
        enginePinRecommended: false,
        novelObservationsSupported: results.novelObservations?.nSupported,
      },
      null,
      2,
    ),
  );
  console.log(`[net-zero-002] pass ${results.n_pass}/${results.n_total}`);
  if (results.B) {
    console.log(
      `[net-zero-002] Pauling Δχ ρ(period)=${results.B.spearmanRhoVsPeriod.toFixed(3)} allPositive=${results.B.allPositive}`,
    );
  }
  console.log(
    `[net-zero-002] novel catalog ${results.novelObservations?.nSupported}/${results.novelObservations?.n}`,
  );
  if (!results.all_pass) {
    for (const e of results.experiments.filter((x) => !x.pass)) {
      console.error(`[fail] ${e.id}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
