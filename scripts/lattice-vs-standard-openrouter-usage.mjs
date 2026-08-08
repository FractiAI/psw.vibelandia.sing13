#!/usr/bin/env node
/** Paired Lattice-vs-plain OpenRouter experiment: accuracy, latency, token
 * efficiency, replication (repeats + alternating order), statistics, and a
 * dependency-free HTML/SVG report. Provider-reported usage only.
 * Treatments: lattice (pointer envelope), standard (lean), naive (corpus dump).
 * --dry-run prints the protocol without spending; no key => explicit exit 2. */
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callOpenRouter, extractUnifiedDiff, loadEnvFiles } from '../lib/openrouter-bench.mjs';
import { TASK_BATTERY, buildLatticeMessages, buildStandardMessages, buildNaiveCorpus, buildNaiveMessages, buildReport, barChartSVG, pairedScatterSVG, scoreTask, scoreTaskLenient, statsRow, mean } from '../lib/openrouter-experiment.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = (process.env.LATTICE_OPENROUTER_MODEL || 'deepseek/deepseek-chat').trim();
const REPEATS = Math.max(1, Number(process.env.LATTICE_BENCH_REPEATS || 3));
const TASKS = (process.env.LATTICE_BENCH_TASKS || '').split(',').map((s) => s.trim()).filter(Boolean);
const TREATMENTS = (process.env.LATTICE_BENCH_TREATMENTS || 'lattice,standard').split(',').map((s) => s.trim()).filter(Boolean);
const OUT_DIR = join(ROOT, 'data');
const REPORT_DIR = join(ROOT, 'reports');

function usage() {
  console.log(`Usage: node scripts/lattice-vs-standard-openrouter-usage.mjs [--dry-run]
Env: OPENROUTER_API_KEY (required for direct arms), LATTICE_OPENROUTER_MODEL,
     LATTICE_BENCH_REPEATS, LATTICE_BENCH_TASKS=qa,coding,reasoning,
     LATTICE_BENCH_TREATMENTS=lattice,standard,naive
Optional proxy (server) arms — requires LATTICE_CHAT_EMAIL + LATTICE_CHAT_API_KEY:
     LATTICE_CHAT_ENDPOINT, LATTICE_CHAT_PROVIDER=openrouter`);
}
function snapshot() {
  const files = ['scripts/hermes-lattice-chat.mjs', 'tests/scripts/hermes-lattice-chat.test.mjs', 'package.json'];
  return files.map((p) => ({ path: p, content: readFileSync(join(ROOT, p), 'utf8') }));
}
function runPatch({ label, diff }) {
  if (!diff) return { applied: false, passed: false, reason: 'no unified diff returned' };
  const temp = mkdtempSync(join(tmpdir(), 'sing13-orbench-'));
  try {
    cpSync(ROOT, temp, { recursive: true, filter: (s) => !s.includes('/node_modules/') && !s.includes('/.git/') });
    const patchPath = join(temp, 'benchmark.patch');
    writeFileSync(patchPath, `${diff}\n`);
    try {
      execFileSync('git', ['apply', '--check', patchPath], { cwd: temp, stdio: 'pipe' });
      execFileSync('git', ['apply', patchPath], { cwd: temp, stdio: 'pipe' });
    } catch (e) { return { applied: false, passed: false, reason: `patch rejected: ${String(e.stderr || e.message).slice(0, 400)}` }; }
    try {
      execFileSync('npm', ['ci', '--silent'], { cwd: temp, timeout: 300_000, stdio: 'pipe' });
      execFileSync('npm', ['test', '--', '--run'], { cwd: temp, timeout: 300_000, stdio: 'pipe' });
      return { applied: true, passed: true, command: 'npm ci && npm test -- --run' };
    } catch (e) { return { applied: true, passed: false, command: 'npm test -- --run', reason: String(e.stderr || e.stdout || e.message).slice(0, 600) }; }
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
function scoreCoding(task, text) {
  const diff = extractUnifiedDiff(text);
  const tests = runPatch({ label: task.id, diff });
  const correct = tests.passed ? 1 : 0;
  return { correct, detail: { diffChars: diff.length, ...tests }, diff };
}
function scoreOne(task, text) {
  if (task.type === 'coding') return scoreCoding(task, text);
  return scoreTask(task, text);
}
function scoreLenient(task, text, strict) {
  if (task.type === 'coding') return strict;
  return scoreTaskLenient(task, text);
}
function buildMessages(task, treatment, snap, naiveCorpus) {
  if (treatment === 'lattice') return buildLatticeMessages(task, snap, ROOT);
  if (treatment === 'naive') return buildNaiveMessages(task, naiveCorpus);
  return buildStandardMessages(task, snap);
}
async function callTreatment(task, treatment, apiKey, snap, naiveCorpus, rep) {
  const messages = buildMessages(task, treatment, snap, naiveCorpus);
  const out = await callOpenRouter({ apiKey, model: MODEL, messages, temperature: 0, maxTokens: 6000 });
  const scored = scoreOne(task, out.text);
  const lenient = scoreLenient(task, out.text, scored);
  const tokens = out.usage?.totalTokens ?? (out.usage?.promptTokens ?? 0) + (out.usage?.completionTokens ?? 0);
  return { rep, taskId: task.id, treatment, text: out.text, correct: scored.correct, correctLenient: lenient.correct, detail: scored.detail,
    promptTokens: out.usage?.promptTokens, completionTokens: out.usage?.completionTokens, tokens,
    latencyMs: out.durationMs, model: out.model };
}
function runServerArm(task, plain, rep) {
  const cli = join(ROOT, 'scripts', 'hermes-lattice-chat.mjs');
  const args = [cli, '--provider', 'openrouter', '--model', MODEL, ...(plain ? ['--plain'] : []), '--prompt', task.prompt];
  const started = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 300_000, env: { ...process.env, LATTICE_CHAT_PROVIDER: 'openrouter' } });
  const elapsedMs = Date.now() - started;
  const reply = (r.stdout || '').trim();
  const tokLine = (r.stderr || '').match(/←\s*([\d,]+)\s*tokens used/);
  const tokens = tokLine ? Number(tokLine[1].replace(/,/g, '')) : null;
  const scored = scoreOne(task, reply);
  const lenient = scoreLenient(task, reply, scored);
  return { rep, taskId: task.id, treatment: plain ? 'plain_server' : 'lattice_server', text: reply, correct: scored.correct, correctLenient: lenient.correct,
    detail: { ...scored.detail, exitCode: r.status }, tokens, latencyMs: elapsedMs, model: MODEL, viaServer: true };
}
async function main() {
  if (process.argv.includes('--help')) return usage();
  loadEnvFiles(ROOT);
  const directKey = String(process.env.OPENROUTER_API_KEY || '').trim();
  const serverKey = String(process.env.LATTICE_CHAT_API_KEY || '').trim();
  const serverArms = Boolean(String(process.env.LATTICE_CHAT_EMAIL || '').trim() && serverKey);
  const apiKey = directKey || serverKey;
  const tasks = TASK_BATTERY.filter((t) => !TASKS.length || TASKS.includes(t.type));
  const planned = { title: 'OpenRouter · Lattice pointer context vs plain standard context — accuracy, latency, token efficiency', protocol: 'Within-pair treatment comparison; same model/task/temperature/repo snapshot; alternating order per repeat. Treatments: lattice (Lattice pointer envelope), standard (lean), naive (corpus dump baseline).', model: MODEL, repeats: REPEATS, tasks: tasks.map((t) => t.id), treatments: TREATMENTS, serverArms, measurement: ['provider usage tokens', 'latency', 'accuracy (exact-match QA/reasoning, patch-apply+test coding)', 'lenient accuracy (answer contained)', 'tokens per correct', 'paired t / Wilcoxon / d_z', 'HTML+SVG report'], limitations: ['one model/key unless configured', 'patch-generation is not autonomous tool-use', 'small n is descriptive; repeats ≥ 10 for claims'] };
  if (process.argv.includes('--dry-run')) { console.log(JSON.stringify(planned, null, 2)); return; }
  if (!apiKey) { console.error('FAIL: OPENROUTER_API_KEY (or LATTICE_CHAT_API_KEY) is not set. No calls were made. Use --dry-run for the protocol.'); process.exitCode = 2; return; }
  mkdirSync(OUT_DIR, { recursive: true }); mkdirSync(REPORT_DIR, { recursive: true });
  const snap = snapshot();
  const naiveCorpus = buildNaiveCorpus(ROOT);
  process.stderr.write(`naive baseline: ${naiveCorpus.length} files, ${naiveCorpus.reduce((a, f) => a + f.content.length, 0).toLocaleString()} chars\n`);
  const results = [];
  for (let rep = 0; rep < REPEATS; rep++) {
    const order = rep % 2 === 0 ? TREATMENTS : [...TREATMENTS].reverse();
    for (const task of tasks) {
      for (const treatment of order) {
        process.stderr.write(`run ${rep + 1}/${REPEATS} · ${task.id} · ${treatment}\n`);
        try { results.push(await callTreatment(task, treatment, apiKey, snap, naiveCorpus, rep + 1)); }
        catch (e) { results.push({ rep: rep + 1, taskId: task.id, treatment, error: String(e.message || e), correct: 0, correctLenient: 0, tokens: null, latencyMs: null }); }
      }
      if (serverArms) {
        for (const plain of [false, true]) {
          process.stderr.write(`run ${rep + 1}/${REPEATS} · ${task.id} · ${plain ? 'plain_server' : 'lattice_server'}\n`);
          try { results.push(runServerArm(task, plain, rep + 1)); } catch (e) { results.push({ rep: rep + 1, taskId: task.id, treatment: plain ? 'plain_server' : 'lattice_server', error: String(e.message || e), correct: 0, correctLenient: 0, tokens: null, latencyMs: null }); }
        }
      }
    }
  }
  const treatments = serverArms ? [...TREATMENTS, 'lattice_server', 'plain_server'] : TREATMENTS;
  const byTask = tasks.map((t) => {
    const get = (tr) => results.filter((r) => r.taskId === t.id && r.treatment === tr && r.error === undefined);
    const acc = (tr) => get(tr).map((r) => (r.correct == null ? 0 : r.correct));
    const accL = (tr) => get(tr).map((r) => (r.correctLenient == null ? r.correct ?? 0 : r.correctLenient));
    const tok = (tr) => get(tr).map((r) => r.tokens ?? 0);
    const lat = (tr) => get(tr).map((r) => r.latencyMs ?? 0);
    const tpc = (tr) => get(tr).map((r) => (r.tokens && r.correct ? r.tokens / r.correct : r.tokens ? r.tokens : 0));
    const L = treatments[0], S = treatments[1];
    return { taskId: t.id, n: get(L).length,
      lattice: { accuracy: mean(acc(L)), accuracyLenient: mean(accL(L)), tokens: mean(tok(L)), latency: mean(lat(L)), tokensPerCorrect: mean(tpc(L)), sem: statsRow('acc', acc(L), acc(S)).lattice.sem },
      standard: { accuracy: mean(acc(S)), accuracyLenient: mean(accL(S)), tokens: mean(tok(S)), latency: mean(lat(S)), tokensPerCorrect: mean(tpc(S)) },
      naive: treatments.includes('naive') ? { accuracy: mean(acc('naive')), accuracyLenient: mean(accL('naive')), tokens: mean(tok('naive')), latency: mean(lat('naive')), tokensPerCorrect: mean(tpc('naive')) } : undefined,
      paired: { p: statsRow('acc', acc(L), acc(S)).pairedT?.p, dz: statsRow('acc', acc(L), acc(S)).cohensDz } };
  });
  const pooled = (tr, field) => results.filter((r) => r.treatment === tr && r.error === undefined).map((r) => (field === 'correct' ? (r.correct ?? 0) : field === 'correctLenient' ? (r.correctLenient ?? r.correct ?? 0) : field === 'tokens' ? (r.tokens ?? 0) : r.latencyMs ?? 0));
  const overall = { n: pooled(treatments[0], 'correct').length,
    lattice: { accuracy: mean(pooled(treatments[0], 'correct')), accuracyLenient: mean(pooled(treatments[0], 'correctLenient')), tokens: mean(pooled(treatments[0], 'tokens')), latency: mean(pooled(treatments[0], 'latency')), tokensPerCorrect: mean(pooled(treatments[0], 'correct').map((c, i) => (pooled(treatments[0], 'tokens')[i] / (c || 1)))) },
    standard: { accuracy: mean(pooled(treatments[1], 'correct')), accuracyLenient: mean(pooled(treatments[1], 'correctLenient')), tokens: mean(pooled(treatments[1], 'tokens')), latency: mean(pooled(treatments[1], 'latency')), tokensPerCorrect: mean(pooled(treatments[1], 'correct').map((c, i) => (pooled(treatments[1], 'tokens')[i] / (c || 1)))) },
    naive: treatments.includes('naive') ? { accuracy: mean(pooled('naive', 'correct')), accuracyLenient: mean(pooled('naive', 'correctLenient')), tokens: mean(pooled('naive', 'tokens')), latency: mean(pooled('naive', 'latency')), tokensPerCorrect: mean(pooled('naive', 'correct').map((c, i) => (pooled('naive', 'tokens')[i] / (c || 1)))) } : undefined,
    paired: { p: statsRow('acc', pooled(treatments[0], 'correct'), pooled(treatments[1], 'correct')).pairedT?.p, dz: statsRow('acc', pooled(treatments[0], 'correct'), pooled(treatments[1], 'correct')).cohensDz } };
  const groups = byTask.map((b, i) => ({ index: i, label: b.taskId }));
  const accSeries = [
    { label: 'Lattice', values: byTask.map((b) => b.lattice.accuracy), errors: byTask.map((b) => b.lattice.sem) },
    { label: 'Standard', values: byTask.map((b) => b.standard.accuracy) },
  ];
  const lenSeries = [
    { label: 'Lattice', values: byTask.map((b) => b.lattice.accuracyLenient) },
    { label: 'Standard', values: byTask.map((b) => b.standard.accuracyLenient) },
  ];
  if (treatments.includes('naive')) {
    accSeries.push({ label: 'Naive', values: byTask.map((b) => b.naive?.accuracy ?? 0) });
    lenSeries.push({ label: 'Naive', values: byTask.map((b) => b.naive?.accuracyLenient ?? 0) });
  }
  const svgs = [
    barChartSVG({ title: 'Mean accuracy by task (SEM cap shown)', groups, series: accSeries, decimals: 3 }),
    barChartSVG({ title: 'Lenient accuracy by task (answer contained)', groups, series: lenSeries, decimals: 3 }),
    barChartSVG({ title: 'Mean total tokens by task', groups, series: [
      { label: 'Lattice', values: byTask.map((b) => b.lattice.tokens) },
      { label: 'Standard', values: byTask.map((b) => b.standard.tokens) },
      ...(treatments.includes('naive') ? [{ label: 'Naive', values: byTask.map((b) => b.naive?.tokens ?? 0) }] : []),
    ], decimals: 0 }),
    barChartSVG({ title: 'Tokens per correct answer by task (lower is better)', groups, series: [
      { label: 'Lattice', values: byTask.map((b) => b.lattice.tokensPerCorrect) },
      { label: 'Standard', values: byTask.map((b) => b.standard.tokensPerCorrect) },
      ...(treatments.includes('naive') ? [{ label: 'Naive', values: byTask.map((b) => b.naive?.tokensPerCorrect ?? 0) }] : []),
    ], decimals: 0 }),
    barChartSVG({ title: 'Mean latency (ms) by task', groups, series: [
      { label: 'Lattice', values: byTask.map((b) => b.lattice.latency) },
      { label: 'Standard', values: byTask.map((b) => b.standard.latency) },
      ...(treatments.includes('naive') ? [{ label: 'Naive', values: byTask.map((b) => b.naive?.latency ?? 0) }] : []),
    ], decimals: 0 }),
  ];
  const pairs = [];
  const seen = new Set();
  for (const r of results) {
    if (r.error !== undefined) continue;
    if (r.treatment !== 'lattice' && r.treatment !== 'standard') continue;
    const key = `${r.rep}:${r.taskId}`;
    if (r.treatment === 'lattice') {
      pairs.push({ label: `${r.taskId} #${r.rep}`, a: { tokens: r.tokens ?? 0, acc: r.correct ?? 0 }, b: null, key });
    } else {
      const found = pairs.find((p) => p.key === key && p.b === null);
      if (found) found.b = { tokens: r.tokens ?? 0, acc: r.correct ?? 0 };
    }
  }
  const scatterPairs = pairs.filter((p) => p.b !== null).map(({ label, a, b }) => ({ label, a, b }));
  const report = buildReport({ meta: { ...planned, ranAt: new Date().toISOString() }, byTask, overall, svgs: [...svgs, pairedScatterSVG({ title: 'Paired efficiency: accuracy vs total tokens per run (Lattice→Standard)', pairs: scatterPairs.slice(0, 40) })] });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlPath = join(REPORT_DIR, `openrouter-lattice-experiment-${ts}.html`);
  writeFileSync(htmlPath, report);
  const jsonPath = join(OUT_DIR, `openrouter-lattice-experiment-${ts}.json`);
  writeFileSync(jsonPath, JSON.stringify({ ...planned, ranAt: new Date().toISOString(), byTask, overall, results: results.map(({ text, ...r }) => r) }, null, 2));
  writeFileSync(join(OUT_DIR, 'lattice-openrouter-experiment-latest.json'), JSON.stringify({ byTask, overall, html: relative(ROOT, htmlPath), ranAt: new Date().toISOString() }, null, 2));
  const csv = ['repeat,task,treatment,correct,correctLenient,tokens,latencyMs'].join('\n') + '\n' + results.map((r) => `${r.rep},${r.taskId},${r.treatment},${r.correct ?? ''},${r.correctLenient ?? ''},${r.tokens ?? ''},${r.latencyMs ?? ''}`).join('\n');
  writeFileSync(join(OUT_DIR, `openrouter-lattice-experiment-${ts}.csv`), csv);
  console.log(JSON.stringify({ report: relative(ROOT, htmlPath), json: relative(ROOT, jsonPath), byTask, overall }, null, 2));
}
main().catch((e) => { console.error(`FAIL: ${e.message}`); process.exitCode = 1; });
