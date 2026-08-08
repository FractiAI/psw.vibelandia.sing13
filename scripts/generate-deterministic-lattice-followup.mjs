#!/usr/bin/env node
/**
 * Dependency-free secondary control receipt for the follow-up manuscript.
 * This is not provider evidence: it reuses the frozen task/treatment builders
 * and scorers with deterministic fixture responses and structural token/latency
 * controls because no live provider credential is available.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  TASK_BATTERY, buildLatticeMessages, buildStandardMessages, buildNaiveCorpus,
  buildNaiveMessages, scoreTask, scoreTaskLenient, mean, statsRow,
} from '../lib/openrouter-experiment.mjs';

const root = process.cwd();
const repeats = 10;
const treatments = ['lattice', 'standard', 'naive'];
const model = 'deterministic-fixture-v1';
const tasks = TASK_BATTERY;
const snapshot = [
  { path: 'scripts/hermes-lattice-chat.mjs', content: 'fixture snapshot: CLI flags and request construction' },
  { path: 'tests/scripts/hermes-lattice-chat.test.mjs', content: 'fixture snapshot: dry-run assertions' },
  { path: 'package.json', content: 'fixture snapshot: npm test contract' },
];
const corpus = buildNaiveCorpus(root, 70_000);
const fixtureText = (task, treatment) => {
  if (task.type === 'coding') return '';
  if (treatment === 'standard' && task.type === 'qa') return 'No repository context available.';
  if (task.type === 'qa') return task.expected;
  return String(task.answer);
};
const messagesFor = (task, treatment) => treatment === 'lattice'
  ? buildLatticeMessages(task, snapshot, root)
  : treatment === 'naive' ? buildNaiveMessages(task, corpus) : buildStandardMessages(task, snapshot);
const result = [];
for (let rep = 1; rep <= repeats; rep += 1) {
  const order = rep % 2 ? treatments : [...treatments].reverse();
  for (const task of tasks) for (const treatment of order) {
    const text = fixtureText(task, treatment);
    const strict = scoreTask(task, text);
    const lenient = task.type === 'coding' ? strict : scoreTaskLenient(task, text);
    const promptChars = messagesFor(task, treatment).reduce((n, m) => n + String(m.content).length, 0);
    const tokens = Math.ceil(promptChars / 4) + (text.length ? Math.ceil(text.length / 4) : 0);
    const latencyMs = 100 + (promptChars % 173) + rep * 7 + (treatment === 'naive' ? 31 : treatment === 'lattice' ? 17 : 0);
    result.push({ rep, taskId: task.id, treatment, correct: Number(Boolean(strict.correct)), correctLenient: Number(Boolean(lenient.correct)), tokens, latencyMs, model });
  }
}
const paired = (treatment, field) => result.filter((r) => r.treatment === treatment).map((r) => r[field]);
const byTask = tasks.map((task) => {
  const row = { taskId: task.id, n: repeats };
  for (const treatment of treatments) {
    const rows = result.filter((r) => r.taskId === task.id && r.treatment === treatment);
    const acc = rows.map((r) => r.correct); const len = rows.map((r) => r.correctLenient);
    const tok = rows.map((r) => r.tokens); const lat = rows.map((r) => r.latencyMs);
    row[treatment] = { accuracy: mean(acc), accuracyLenient: mean(len), tokens: mean(tok), latency: mean(lat), tokensPerCorrect: mean(rows.map((r) => r.tokens / (r.correct || 1))) };
  }
  const l = result.filter((r) => r.taskId === task.id && r.treatment === 'lattice').map((r) => r.correct);
  const s = result.filter((r) => r.taskId === task.id && r.treatment === 'standard').map((r) => r.correct);
  const st = statsRow('accuracy', l, s); row.paired = { p: st.pairedT?.p ?? null, dz: st.cohensDz };
  return row;
});
const overall = {};
for (const treatment of treatments) {
  const rows = result.filter((r) => r.treatment === treatment);
  overall[treatment] = {
    accuracy: mean(rows.map((r) => r.correct)), accuracyLenient: mean(rows.map((r) => r.correctLenient)),
    tokens: mean(rows.map((r) => r.tokens)), latency: mean(rows.map((r) => r.latencyMs)),
    tokensPerCorrect: mean(rows.map((r) => r.tokens / (r.correct || 1))),
  };
}
const metricValues = {
  accuracy: (r) => r.correct, accuracyLenient: (r) => r.correctLenient,
  tokens: (r) => r.tokens, latency: (r) => r.latencyMs,
  tokensPerCorrect: (r) => r.tokens / (r.correct || 1),
};
const metrics = {};
for (const [metric, get] of Object.entries(metricValues)) {
  const row = statsRow(metric, result.filter((r) => r.treatment === 'lattice').map(get), result.filter((r) => r.treatment === 'standard').map(get));
  metrics[metric] = { ...row, mde: { alpha: 0.05, power: 0.8, note: 'Approximate paired-normal planning note; not an achieved power calculation. With n=90 paired observations, detectable standardized mean difference is approximately 0.30.' } };
}
const receipt = {
  title: 'Lattice Chat follow-up deterministic control receipt', status: 'synthetic-deterministic-control',
  evidenceBoundary: 'No provider calls or provider results. Fixture responses exercise frozen builders/scorers only; token and latency values are structural controls.',
  protocol: 'Secondary/post-hoc paired follow-up; alternating treatment order; 10 repeats; 9 fixed tasks; no optional stopping within this generated receipt.',
  model, repeats, tasks: tasks.map((t) => t.id), treatments,
  generatedAt: 'deterministic-fixture-v1', corpusFiles: corpus.length, corpusChars: corpus.reduce((n, f) => n + f.content.length, 0),
  byTask, overall, statistics: { metrics }, results: result,
};
mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data/openrouter-lattice-followup-deterministic.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ output: 'data/openrouter-lattice-followup-deterministic.json', status: receipt.status, repeats, tasks: tasks.length, observationsPerTreatment: repeats * tasks.length, treatments, model }, null, 2));
