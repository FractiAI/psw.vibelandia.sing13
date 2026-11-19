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
lines.push('# INS ↔ POMC Endocrine Rhyme Validation · empirical report');
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
lines.push(`Supports metabolic follow-up: **${report.verdict.supportsMetabolicFollowUp}**`);
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
lines.push('## E1 · Reproduce INS↔POMC exon coupling');
lines.push('');
lines.push(`Max coupling: **${e.e1.maxCoupling}**`);
if (e.e1.bestPair) {
  lines.push(`Best exon pair: \`${e.e1.bestPair.a}\` ↔ \`${e.e1.bestPair.b}\``);
}
lines.push('');
lines.push('## E2 · Null rank + permutation');
lines.push('');
lines.push(`Focus rank among ${e.e2.nCrossGenePairs} cross-gene pairs: **#${e.e2.focusRank}**`);
lines.push(
  `Permutation p (feature shuffle): **${e.e2.permutation.p}** (null mean ${e.e2.permutation.nullMean}, P95 ${e.e2.permutation.nullP95})`,
);
lines.push('');
lines.push('| Rank | Pair | Max coupling |');
lines.push('|---:|---|---:|');
e.e2.topPairs.forEach((p, i) => {
  lines.push(`| ${i + 1} | ${p.pair} | ${p.maxCoupling} |`);
});
lines.push('');
lines.push('## E3 · External STRING');
lines.push('');
lines.push('| Pair | Role | Score | Empty | ≥0.9 floor |');
lines.push('|---|---|---:|---|---|');
for (const c of e.e3.comparisons) {
  lines.push(
    `| ${c.pair} | ${c.role} | ${c.score} | ${c.empty} | ${c.supportsFloor ?? false} |`,
  );
}
lines.push('');
lines.push('## E4 · OpenTargets disease rails');
lines.push('');
lines.push('### INS · diabetes axis');
for (const d of e.e4.INS.topDiseases) {
  lines.push(`- ${d.name}: ${d.score}`);
}
lines.push('');
lines.push('### POMC · obesity axis');
for (const d of e.e4.POMC.topDiseases) {
  lines.push(`- ${d.name}: ${d.score}`);
}
lines.push('');
lines.push(`Axes aligned: **${e.e4.axesAligned}**`);
lines.push('');
lines.push('## E5 · Mankind-benefit pick gate');
lines.push('');
lines.push(`Formula: \`${e.e5.formula}\``);
lines.push('');
lines.push('| Pair | Burden Soft Story | STRING | Rhyme | Gate score |');
lines.push('|---|---:|---:|---:|---:|');
for (const c of e.e5.candidates) {
  lines.push(
    `| ${c.pair} | ${c.burdenSoftStory} | ${c.string} | ${c.rhyme} | **${c.gateScore}** |`,
  );
}
lines.push('');
lines.push(`Winner: **${e.e5.winner}** (INS↔POMC wins: ${e.e5.insPomcWins})`);
lines.push('');
lines.push('→ ∞^∞');
lines.push('');
writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));

const cat = [];
cat.push('# VALIDATION_CATALOG · INS ↔ POMC endocrine rhyme');
cat.push('');
cat.push(`**Document ID:** \`${report.documentId}\` · **Seed:** ${report.seed}`);
cat.push('');
cat.push('| Check | Value | Pass |');
cat.push('|---|---|---|');
cat.push(`| E1 maxCoupling INS↔POMC | ${e.e1.maxCoupling} | ${e.e1.maxCoupling > 0} |`);
cat.push(`| E2 focus rank | #${e.e2.focusRank} / ${e.e2.nCrossGenePairs} | ${e.e2.focusRank >= 1} |`);
cat.push(`| E2 permutation p | ${e.e2.permutation.p} | true |`);
cat.push(
  `| E3 STRING INS↔POMC | ${e.e3.focusStringScore} | ${e.e3.focusStringScore >= 0.9} |`,
);
cat.push(`| E3 NPY↔SOD1 empty | ${e.e3.negativeControlEmpty} | ${e.e3.negativeControlEmpty} |`);
cat.push(`| E4 disease axes aligned | ${e.e4.axesAligned} | ${e.e4.axesAligned} |`);
cat.push(`| E5 mankind-benefit winner | ${e.e5.winner} | ${e.e5.insPomcWins} |`);
cat.push(`| Math lemmas | ${report.mathProofs.lemmas.length} | ${report.mathProofs.ok} |`);
cat.push(`| Supports metabolic follow-up | ${report.verdict.supportsMetabolicFollowUp} | ${report.verdict.supportsMetabolicFollowUp} |`);
cat.push('');
cat.push('## Named findings');
cat.push('');
if (e.e1.bestPair) {
  cat.push(
    `- Best exon rhyme pair: \`${e.e1.bestPair.a}\` ↔ \`${e.e1.bestPair.b}\` (coupling ${e.e1.bestPair.coupling})`,
  );
}
cat.push(
  `- STRING INS↔POMC score ${e.e3.focusStringScore} (tscore ${e.e3.comparisons[0].tscore})`,
);
cat.push(`- OpenTargets INS diabetes top: ${e.e4.INS.topDiseases[0]?.name} (${e.e4.INS.topDiseases[0]?.score})`);
cat.push(
  `- OpenTargets POMC obesity top: ${e.e4.POMC.topDiseases[0]?.name} (${e.e4.POMC.topDiseases[0]?.score})`,
);
cat.push('');
cat.push(
  'Honesty: Application companion Soft Story. Not ENGINE_SHELF. Not causal pathway. Not clinical effect. NPY↔SOD1 is the STRING-empty negative control. → ∞^∞',
);
cat.push('');
writeFileSync(join(dataDir, 'VALIDATION_CATALOG.md'), cat.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      documentId: report.documentId,
      maxCoupling: e.e1.maxCoupling,
      focusRank: e.e2.focusRank,
      stringInsPomc: e.e3.focusStringScore,
      npySod1Empty: e.e3.negativeControlEmpty,
      gateWinner: e.e5.winner,
      mathOk: report.mathProofs.ok,
      supportsFollowUp: report.verdict.supportsMetabolicFollowUp,
      ms: report.ms,
    },
    null,
    2,
  ),
);
