#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runExpedition } from '../src/experiments.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
mkdirSync(dataDir, { recursive: true });

const t0 = Date.now();
const report = runExpedition();
report.ms = Date.now() - t0;
report.generatedAt = new Date().toISOString();

writeFileSync(join(dataDir, 'empirical_report.json'), JSON.stringify(report, null, 2));

const e = report.experiments;
const lines = [];
lines.push('# APP ↔ DNMT3A Rhyme Validation · empirical report');
lines.push('');
lines.push(`**Document ID:** \`${report.documentId}\``);
lines.push(`**Registry:** \`${report.registryId}\``);
lines.push(`**Seed:** ${report.seed}`);
lines.push(`**Runtime:** ${report.ms} ms`);
lines.push(`**ENGINE_SHELF pinned:** ${report.engineShelfPinned}`);
lines.push('');
lines.push('## Verdict');
lines.push('');
lines.push(report.verdict.summary);
lines.push('');
lines.push(`Supports unknown follow-up: **${report.verdict.supportsUnknownFollowUp}**`);
lines.push('');
lines.push(report.honesty);
lines.push('');
lines.push('## Math lemmas');
lines.push('');
lines.push(`All lemmas ok: **${report.mathProofs.ok}**`);
lines.push('');
for (const L of report.mathProofs.lemmas) {
  lines.push(`- \`${L.id}\`: ${L.statement} → **${L.ok}**`);
}
lines.push('');
lines.push('## E1 · Reproduce APP↔DNMT3A exon coupling');
lines.push('');
lines.push(`Max coupling: **${e.e1.maxCoupling}**`);
if (e.e1.pair) lines.push(`Best exon pair: \`${e.e1.pair}\``);
lines.push('');
lines.push('## E2 · Null rank + permutation');
lines.push('');
lines.push(`Focus rank among ${e.e2.nPairs} cross-gene pairs: **#${e.e2.focusRank}**`);
lines.push(`Permutation p: **${e.e2.permutationP}**`);
lines.push('');
lines.push('| Rank | Pair | Max coupling |');
lines.push('|---:|---|---:|');
(e.e2.top10 || []).forEach((p, i) => {
  lines.push(`| ${i + 1} | ${p.pair} | ${p.maxCoupling} |`);
});
lines.push('');
lines.push('## E3 · External STRING');
lines.push('');
lines.push(
  `Focus ${e.e3.focusPair} empty: **${e.e3.focusEmpty}** (score ${e.e3.focusStringScore})`,
);
lines.push(
  `Positive control ${e.e3.positiveControl}: score **${e.e3.positiveControlScore}** (empty=${e.e3.positiveControlEmpty})`,
);
lines.push('');
lines.push('## E4 · OpenTargets disease rails');
lines.push('');
lines.push(`### ${e.e4.focusA.symbol}`);
for (const d of e.e4.focusA.top || []) lines.push(`- ${d.name}: ${d.score}`);
lines.push('');
lines.push(`### ${e.e4.focusB.symbol}`);
for (const d of e.e4.focusB.top || []) lines.push(`- ${d.name}: ${d.score}`);
lines.push('');
lines.push(
  'APP Alzheimer (~0.81) vs DNMT3A AML (~0.86) — little shared disease overlap.',
);
lines.push('');
lines.push('## E5 · Unknown gate (empty STRING required)');
lines.push('');
lines.push(`Requires STRING empty: **${e.e5.requiresStringEmpty}**`);
lines.push(`Focus is unknown: **${e.e5.focusIsUnknown}**`);
lines.push(`Positive control confirms model: **${e.e5.positiveControlConfirmsModel}**`);
lines.push(`Gate passes: **${e.e5.passes}**`);
lines.push('');
lines.push(
  'Note: Positive control INS↔POMC Soft Story (STRING 0.947) confirms the model; this suite examines UNKNOWN pair APP↔DNMT3A.',
);
lines.push('');
lines.push('→ ∞^∞');
lines.push('');
writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      documentId: report.documentId,
      maxCoupling: e.e1.maxCoupling,
      focusRank: e.e2.focusRank,
      permutationP: e.e2.permutationP,
      focusStringEmpty: e.e3.focusEmpty,
      positiveControlInsPomc: e.e3.positiveControlScore,
      unknownGatePass: e.e5.passes,
      mathOk: report.mathProofs.ok,
      ms: report.ms,
    },
    null,
    2,
  ),
);
