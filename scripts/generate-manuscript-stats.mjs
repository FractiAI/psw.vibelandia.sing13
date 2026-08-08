#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { statsRow } from '../lib/openrouter-experiment.mjs';

const root = process.cwd();
const source = process.env.LATTICE_MANUSCRIPT_RECEIPT || 'data/openrouter-lattice-followup-deterministic.json';
const data = JSON.parse(readFileSync(`${root}/${source}`, 'utf8'));
const get = {
  accuracy: (r) => r.correct,
  accuracyLenient: (r) => r.correctLenient,
  tokens: (r) => r.tokens,
  latency: (r) => r.latencyMs,
  tokensPerCorrect: (r) => r.tokens / (r.correct || 1),
};
const metrics = {};
for (const [metric, getter] of Object.entries(get)) {
  const row = statsRow(metric, data.results.filter((r) => r.treatment === 'lattice').map(getter), data.results.filter((r) => r.treatment === 'standard').map(getter));
  metrics[metric] = { ...row, mde: { alpha: 0.05, targetPower: 0.8, note: 'Approximate planning note for a paired-normal mean difference; not an achieved power calculation. At n=90, standardized mean difference near 0.30 is a rough MDE target; binary accuracy needs a dedicated power model.' } };
}
const result = { source, status: data.status, evidenceBoundary: data.evidenceBoundary, model: data.model, repeats: data.repeats, tasks: data.tasks.length, observationsPerTreatment: data.repeats * data.tasks.length, generatedAt: data.generatedAt, metrics };
writeFileSync(`${root}/data/openrouter-lattice-followup-statistics.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ source, output: 'data/openrouter-lattice-followup-statistics.json', metrics: Object.keys(metrics), observationsPerTreatment: result.observationsPerTreatment }, null, 2));
