#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_ID, REGISTRY_ID, STUDY_TITLE, HONESTY, DIGITAL_SEED } from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';
import { runE6LiveLlm } from '../src/e6_live_llm.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');

function mdReport(report) {
  const { E0, E1, E2, E3, E4, E5, E6 } = report.results;
  return [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry ID:** \`${REGISTRY_ID}\``,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| All pass | \`${report.results.all_pass}\` |`,
    `| Passed | ${report.results.n_pass} / ${report.results.n_total} |`,
    '',
    '## E0 · Upstream Exp 002 / Tiny Gateway',
    '',
    `| Flat / Guided solution | ${E0.exp002.flatSolutionRate} / ${E0.exp002.guidedSolutionRate} |`,
    `| Rounds flat → guided | ${E0.exp002.flatRounds} → ${E0.exp002.guidedRounds} |`,
    `| Ops flat → guided | ${E0.exp002.flatOps} → ${E0.exp002.guidedOps} |`,
    '',
    '## E1 · FRED UNRATE walk-forward (real data)',
    '',
    `| Temporal RMSE | ${E1.rmse.temporal} |`,
    `| Bag-of-features RMSE | ${E1.rmse.bagOfFeatures} |`,
    `| Sequence-permuted RMSE | ${E1.rmse.sequencePermuted} |`,
    `| Walks | ${E1.nWalks} · ${E1.dateStart} → ${E1.dateEnd} |`,
    '',
    '## E2 · Movebank + Kp sequence structure',
    '',
    `| meanStep lag-1 chrono | ${E2.lag1Autocorr.meanStepChrono} |`,
    `| meanStep shuffle null | ${E2.lag1Autocorr.meanStepShuffleMeanAbs} |`,
    `| spread lag-1 chrono | ${E2.lag1Autocorr.herdSpreadChrono} |`,
    `| Rows | ${E2.nRows} · ${E2.dateStart} → ${E2.dateEnd} |`,
    '',
    '## E3 · Competition vs Goldilocks collaboration',
    '',
    `| Competitive accuracy | ${E3.competitive.directionAccuracy} |`,
    `| Goldilocks accuracy | ${E3.goldilocks.directionAccuracy} |`,
    `| Dup reduction | ${(E3.dupReduction * 100).toFixed(1)}% |`,
    '',
    '## E4 · Closed vs open selective share',
    '',
    `| Closed RMSE | ${E4.closedRmse} |`,
    `| Open selective RMSE | ${E4.openSelectiveRmse} |`,
    `| Byte reduction | ${(E4.byteReduction * 100).toFixed(1)}% |`,
    '',
    '## E5 · Goldilocks scorecard',
    '',
    ...E5.ranking.map((r) => `| ${r.worldModel} | ${r.score} |`),
    '',
    '## E6 · Matched-budget agent architecture',
    '',
    `| Model | ${E6.model} |`,
    `| Context budget (tokens/turn) | ${E6.contextBudgetTokens} |`,
    `| Linear solution rate | ${E6.linear.solutionRate} |`,
    `| Shared-world solution rate | ${E6.sharedWorld.solutionRate} |`,
    `| Linear mean tokens / rounds | ${E6.linear.meanTokens} / ${E6.linear.meanRounds} |`,
    `| Shared mean tokens / rounds | ${E6.sharedWorld.meanTokens} / ${E6.sharedWorld.meanRounds} |`,
    `| Live LLM | ${E6.liveLlm?.attempted ? `${E6.liveLlm.model} · linear@budget ${E6.liveLlm.linear?.solutionRate} · shared@budget ${E6.liveLlm.sharedWorld?.solutionRate} · linear unbounded ${E6.liveLlm.linearUnbounded?.solutionRate} (tokens ${E6.liveLlm.linear?.meanTokens} / ${E6.liveLlm.sharedWorld?.meanTokens} / ${E6.liveLlm.linearUnbounded?.meanTokens})` : E6.liveLlm?.reason || 'not attempted'} |`,
    '',
    '## Honesty',
    '',
    HONESTY,
    '',
    '→ ∞^∞',
    '',
  ].join('\n');
}

const report = runAllExperiments();
const live = await runE6LiveLlm({ scenarios: Number(process.env.E6_LIVE_SCENARIOS || 12) });
report.results.E6.liveLlm = live;
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(RESULTS, { recursive: true });
await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
await fs.writeFile(
  path.join(RESULTS, 'manifest.json'),
  JSON.stringify(
    {
      docId: DOC_ID,
      registryId: REGISTRY_ID,
      all_pass: report.results.all_pass,
      n_pass: report.results.n_pass,
      n_total: report.results.n_total,
      generatedAt: report.generatedAt,
      e1: report.results.E1.rmse,
      e5: report.results.E5.worldModelComposites,
      e6: {
        linear: report.results.E6.linear.solutionRate,
        shared: report.results.E6.sharedWorld.solutionRate,
        live: report.results.E6.liveLlm?.attempted
          ? {
              model: report.results.E6.liveLlm.model,
              linear: report.results.E6.liveLlm.linear?.solutionRate,
              shared: report.results.E6.liveLlm.sharedWorld?.solutionRate,
              linearUnbounded: report.results.E6.liveLlm.linearUnbounded?.solutionRate,
            }
          : null,
      },
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      ok: report.results.all_pass,
      n_pass: report.results.n_pass,
      n_total: report.results.n_total,
      e1: report.results.E1.rmse,
      e3: {
        competitive: report.results.E3.competitive.directionAccuracy,
        goldilocks: report.results.E3.goldilocks.directionAccuracy,
        dupReduction: report.results.E3.dupReduction,
      },
      e5: report.results.E5.worldModelComposites,
      e6: {
        linear: report.results.E6.linear.solutionRate,
        shared: report.results.E6.sharedWorld.solutionRate,
        liveAttempted: !!report.results.E6.liveLlm?.attempted,
      },
    },
    null,
    2,
  ),
);
if (!report.results.all_pass) process.exitCode = 1;
