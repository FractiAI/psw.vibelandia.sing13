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
lines.push('# WMAP Residual Lag 11 / 14 Validation · empirical report');
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
lines.push(
  `Unknown-physics candidate confirmed: **${report.verdict.unknownPhysicsCandidateConfirmed}**`,
);
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
lines.push('## E1 · Confirm lag 11 / 14 candidate_novel_physics');
lines.push('');
if (e.e1.lag11) {
  lines.push(
    `- Lag 11: corr=**${e.e1.lag11.corr.toFixed(4)}** · pResidualShuffle=**${e.e1.lag11.pResidualShuffle.toFixed(4)}** · verdict=**${e.e1.lag11.verdict}**`,
  );
}
if (e.e1.lag14) {
  lines.push(
    `- Lag 14: corr=**${e.e1.lag14.corr.toFixed(4)}** · pResidualShuffle=**${e.e1.lag14.pResidualShuffle.toFixed(4)}** · verdict=**${e.e1.lag14.verdict}**`,
  );
}
lines.push('');
lines.push(`Both candidate_novel_physics: **${e.e1.bothCandidateNovel}**`);
lines.push('');
lines.push('## E2 · nearAcousticSpacing false');
lines.push('');
lines.push(`Both far from acoustic spacing: **${e.e2.bothFarFromAcoustic}**`);
lines.push(`Definition: ${e.e2.acousticSpacingDefinition}`);
lines.push('');
lines.push('## E3 · Known-physics rediscovery controls');
lines.push('');
lines.push(`Known controls exist: **${e.e3.controlsExist}** (n=${e.e3.nKnownPhysicsRediscovery})`);
lines.push(`Novel physics hits (all layers): ${e.e3.nCandidateNovelPhysics}`);
lines.push('');
lines.push('| Layer | Pair/Lag | Verdict |');
lines.push('|---|---|---|');
for (const c of e.e3.knownControls) {
  lines.push(`| ${c.layer} | ${c.pair ?? `lag-${c.lag}`} | ${c.verdict} |`);
}
lines.push('');
lines.push('## E4 · Residual correlation / lag definition lemmas');
lines.push('');
lines.push(`Math ok: **${e.e4.mathProofs.ok}**`);
for (const s of e.e4.lagSanity) {
  lines.push(`- lag ${s.lag} |corr|=${s.absCorr.toFixed(6)}`);
}
lines.push('');
lines.push('→ ∞^∞');
lines.push('');
writeFileSync(join(dataDir, 'empirical_report.md'), lines.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      documentId: report.documentId,
      lag11: e.e1.lag11,
      lag14: e.e1.lag14,
      bothCandidateNovel: e.e1.bothCandidateNovel,
      bothFarFromAcoustic: e.e2.bothFarFromAcoustic,
      knownControls: e.e3.nKnownPhysicsRediscovery,
      mathOk: report.mathProofs.ok,
      confirmed: report.verdict.unknownPhysicsCandidateConfirmed,
      ms: report.ms,
    },
    null,
    2,
  ),
);
