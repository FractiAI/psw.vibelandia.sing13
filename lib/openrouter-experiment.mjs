/** OpenRouter Lattice-vs-plain experiment core: task battery, deterministic
 * scoring, paired statistics, dependency-free SVG/HTML report. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { assembleLatticePrompt } from './lattice-prompt.mjs';

export const PLAIN_SYSTEM = 'You are a helpful, careful assistant. Answer the user directly and concisely. Do not mention Lattice, nesting, or repositories unless asked.';

/* ---- task battery ---- */
const QA = [
  { id: 'qa_default_cursor_model', expected: 'composer-2.5',
    question: 'In apps/lattice-chat/src/modelCatalog.ts, what is the default model id for the cursor provider? Answer with the id only.' },
  { id: 'qa_cli_email_env', expected: 'LATTICE_CHAT_EMAIL',
    question: 'In scripts/hermes-lattice-chat.mjs, which environment variable holds the Lattice access email? Answer with the variable name only.' },
  { id: 'qa_cli_default_nest', expected: 'goldilocks',
    question: 'In scripts/hermes-lattice-chat.mjs, what nestTopology value does the CLI send by default? Answer with the value only.' },
  { id: 'qa_openrouter_header', expected: 'x-openrouter-api-key',
    question: 'In api/lattice-chat.js, which HTTP header carries the OpenRouter BYOK API key from client to server? Answer with the header name only.' },
  { id: 'qa_cli_auth_exit_code', expected: '1',
    question: 'In scripts/hermes-lattice-chat.mjs, what exit code is used for auth/access/key errors? Answer with a single number.' },
];
const CODING = { id: 'coding_add_top_p_flag',
  task: `Implement a small, production-quality CLI improvement in scripts/hermes-lattice-chat.mjs: add a --top-p flag that forwards a numeric sampling value (0.0..1.0, validated, default unset) to the API request body as topP. Add a vitest case asserting that --dry-run --top-p 0.3 shows the value. Keep existing flags, exit codes, and the stdout/stderr contract unchanged; do not expose API keys; do not touch generated bundles. Return a unified diff only, no prose.` };
const REASONING = [
  { id: 'reasoning_arithmetic', answer: 731, question: 'Compute exactly: 17 × 43. Answer with the number only.' },
  { id: 'reasoning_remainder', answer: 2, question: 'Compute exactly: the remainder when 1024 is divided by 7. Answer with the number only.' },
  { id: 'reasoning_sequence', answer: 42, question: 'A sequence starts 2, 6, 12, 20 (n-th term = n(n+1)). What is the 6th term? Answer with the number only.' },
];
export const TASK_BATTERY = [
  ...QA.map((q) => ({ type: 'qa', id: q.id, prompt: q.question, expected: q.expected })),
  { type: 'coding', id: CODING.id, prompt: CODING.task },
  ...REASONING.map((r) => ({ type: 'reasoning', id: r.id, prompt: r.question, answer: r.answer })),
];

/* ---- prompt construction (treatments) ---- */
export function buildStandardMessages(task, snapshot) {
  if (task.type === 'qa' || task.type === 'reasoning') {
    return [{ role: 'system', content: PLAIN_SYSTEM }, { role: 'user', content: `${task.prompt}\n\n(No external tools. Answer from your own knowledge, precisely.)` }];
  }
  const files = snapshot.map((f) => `===== ${f.path} =====\n${f.content}`).join('\n\n');
  return [{ role: 'system', content: `You are a careful coding agent in the SING13 Node/Vitest repository.\n\nRelevant current files:\n${files}` }, { role: 'user', content: `${task.prompt}\n\nUse only the supplied files. Return a unified diff and no commentary.` }];
}
export function buildLatticeMessages(task, snapshot, root) {
  const system = assembleLatticePrompt({
    message: task.prompt, root, nestTopology: 'goldilocks', mode: 'full',
    closingLine: 'Return only a unified diff. Do not edit unrelated or generated files.',
    providerNote: 'Benchmark treatment: pointer-grounded coding response. You may use the supplied relevant files as the bounded edge context.',
  });
  if (task.type === 'qa' || task.type === 'reasoning') {
    return [{ role: 'system', content: system }, { role: 'user', content: `${task.prompt}\n\nAnswer precisely; final answer only.` }];
  }
  const files = snapshot.map((f) => `===== ${f.path} =====\n${f.content}`).join('\n\n');
  return [{ role: 'system', content: system }, { role: 'user', content: `${task.prompt}\n\nBounded edge context (same files available to baseline):\n${files}` }];
}

/**
 * True naive baseline: a large slice of the repository corpus dumped into the
 * system prompt — the "fat agent" the Lattice design claims to beat.
 * Deterministic: biggest files first, up to a char budget.
 */
export function buildNaiveCorpus(root, budget = 70_000) {
  const dirs = ['docs', 'protocols', 'research', 'api', 'lib', 'apps/lattice-chat/src', 'scripts'];
  const candidates = [];
  for (const dir of dirs) {
    let abs;
    try {
      abs = join(root, dir);
      const entries = readdirSync(abs);
      for (const entry of entries) {
        try {
          const absP = join(abs, entry);
          const st = statSync(absP);
          if (!st.isFile()) continue;
          if (!/\.(md|mjs|js|ts|tsx|json)$/i.test(entry)) continue;
          candidates.push({ path: `${dir}/${entry}`, size: st.size });
        } catch {
          /* ignore unreadable entries */
        }
      }
    } catch {
      continue;
    }
  }
  candidates.sort((a, b) => b.size - a.size);
  const files = [];
  let used = 0;
  for (const c of candidates) {
    const room = budget - used;
    if (room <= 0) break;
    if (c.size > room) continue;
    try {
      const content = readFileSync(join(root, c.path), 'utf8');
      files.push({ path: c.path, content });
      used += content.length;
    } catch {
      /* ignore */
    }
  }
  return files;
}
export function buildNaiveMessages(task, corpus) {
  const dump = corpus.map((f) => `===== ${f.path} =====\n${f.content}`).join('\n\n');
  const system = `You are a coding/research agent working in the SING13 repository. Here is a large slice of the repository corpus (${corpus.length} files):\n\n${dump}`;
  const tail = task.type === 'coding' ? '\n\nReturn a unified diff and no commentary.' : '\n\nAnswer precisely; final answer only.';
  return [{ role: 'system', content: system }, { role: 'user', content: `${task.prompt}${tail}` }];
}

/* ---- deterministic scoring ---- */
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' '); }
export function scoreTask(task, text) {
  const body = String(text || '');
  if (task.type === 'qa') return { correct: norm(body).includes(norm(task.expected)), detail: { expected: task.expected } };
  if (task.type === 'reasoning') {
    const m = body.match(/-?\d[\d,]*/);
    const got = m ? Number(m[0].replace(/,/g, '')) : NaN;
    return { correct: got === task.answer, detail: { got, answer: task.answer } };
  }
  return { correct: null, detail: {} };
}

/** Lenient twin of scoreTask: QA matches when the expected value appears
 * anywhere in the reply (case-insensitive); coding delegates to strict. */
export function scoreTaskLenient(task, text) {
  const body = String(text || '');
  if (task.type === 'qa') {
    const expected = String(task.expected || '').toLowerCase();
    return { correct: expected.length > 0 && (body.toLowerCase().includes(expected) || norm(body).includes(norm(task.expected))) };
  }
  if (task.type === 'reasoning') {
    const m = body.match(/-?\d[\d,]*/);
    const got = m ? Number(m[0].replace(/,/g, '')) : NaN;
    return { correct: got === task.answer };
  }
  return { correct: null };
}

/* ---- statistics (paired, two-sided) ---- */
export function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN; }
export function stdDev(xs) { if (xs.length < 2) return NaN; const m = mean(xs); return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)); }
export function sem(xs) { const s = stdDev(xs); return xs.length && Number.isFinite(s) ? s / Math.sqrt(xs.length) : NaN; }
export function ci95(xs) {
  const n = xs.length; if (n < 2) return null;
  const t = tCrit(n - 1); const e = sem(xs) * t; const m = mean(xs);
  return { low: m - e, high: m + e };
}
function tCrit(df) {
  const table = { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 12: 2.179, 15: 2.131, 20: 2.086, 30: 2.042, 50: 2.009, 100: 1.984 };
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  for (const k of keys) if (df <= k) return table[k];
  return 1.96;
}

export function pairedT(a, b) {
  const n = Math.min(a.length, b.length); if (n < 2) return null;
  const d = a.slice(0, n).map((x, i) => x - b[i]);
  const m = mean(d), s = stdDev(d);
  if (!Number.isFinite(s)) return null;
  if (s === 0) return { t: m === 0 ? 0 : Infinity, df: n - 1, p: m === 0 ? 1 : 0, meanDiff: m, sdDiff: s };
  const t = (m / s) * Math.sqrt(n);
  return { t, df: n - 1, p: twoTailedP(t, n - 1), meanDiff: m, sdDiff: s };
}
export function cohensDz(a, b) {
  const n = Math.min(a.length, b.length); if (n < 2) return null;
  const d = a.slice(0, n).map((x, i) => x - b[i]);
  const s = stdDev(d);
  return Number.isFinite(s) && s !== 0 ? mean(d) / s : mean(d) === 0 ? 0 : null;
}
export function wilcoxonSignedRank(a, b) {
  const n = Math.min(a.length, b.length);
  const ds = a.slice(0, n).map((x, i) => x - b[i]).filter((d) => d !== 0);
  if (ds.length < 2) return null;
  const items = ds.map((d) => ({ abs: Math.abs(d), sign: Math.sign(d) })).sort((x, y) => x.abs - y.abs);
  const ranked = items.map((it, i, arr) => {
    const ties = arr.filter((x) => x.abs === it.abs);
    return { ...it, rank: ties.length > 1 ? (2 * i + ties.length + 1) / 2 : i + 1 };
  });
  const wPlus = ranked.filter((r) => r.sign > 0).reduce((s, r) => s + r.rank, 0);
  const wMinus = ranked.filter((r) => r.sign < 0).reduce((s, r) => s + r.rank, 0);
  const W = Math.min(wPlus, wMinus);
  const mu = (n * (n + 1)) / 4, sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
  const z = sigma === 0 ? 0 : (W - mu) / sigma;
  return { wPlus, wMinus, W, z, p: 2 * (1 - normalCdf(Math.abs(z))), n: ds.length };
}
function twoTailedP(t, df) { const x = df / (df + t * t); return Math.min(1, Math.max(0, 2 * (1 - (1 - 0.5 * incBeta(df / 2, 0.5, x))))); }
function incBeta(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (!Number.isFinite(bt)) return NaN;
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}
function betacf(a, b, x) {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return h;
}
const LG = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
function lgamma(x) { let y = x; let tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (let j = 0; j < 6; j++) ser += LG[j] / ++y; return -tmp + Math.log((2.5066282746310005 * ser) / x); }
function normalCdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
function erf(x) { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t + 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x)); }
export function statsRow(metric, lv, sv) {
  const pt = pairedT(lv, sv), wx = wilcoxonSignedRank(lv, sv);
  return { metric, n: lv.length,
    lattice: { mean: mean(lv), sd: stdDev(lv), sem: sem(lv), ci: ci95(lv) },
    standard: { mean: mean(sv), sd: stdDev(sv), sem: sem(sv), ci: ci95(sv) },
    diff: mean(lv) - mean(sv), pairedT: pt, wilcoxon: wx, cohensDz: cohensDz(lv, sv) };
}

/* ---- SVG / HTML report ---- */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmt(x, d = 2) { return Number.isFinite(x) ? x.toFixed(d) : '—'; }
function niceCeil(v) { const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
export function barChartSVG({ title, groups, series, unit = '', width = 720, height = 320, decimals = 2 }) {
  const padL = 64, padR = 16, padT = 34, padB = 56;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const all = groups.flatMap((g) => series.map((s) => s.values[g.index] ?? 0));
  const niceMax = niceCeil(Math.max(...all, 1e-9));
  const groupW = plotW / groups.length, barW = Math.max(2, (groupW * 0.8) / series.length);
  const color = (i) => ['#4f8cff', '#ff8c42', '#3bb273'][i % 3];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="ui-monospace,Menlo,monospace" font-size="11"><text x="${padL}" y="14" font-size="13" font-weight="700" fill="#111">${esc(title)}</text>`;
  for (let i = 0; i <= 4; i++) { const y = padT + plotH - (plotH * i) / 4; const v = (niceMax * i) / 4; svg += `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#e5e5e5"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end" fill="#666">${fmt(v, v < 10 ? decimals : 1)}</text>`; }
  groups.forEach((g, gi) => { const cx = padL + groupW * gi + groupW / 2;
    series.forEach((s, si) => { const v = s.values[g.index] ?? 0; const bw = barW * 0.9; const x = cx - (series.length * bw) / 2 + si * bw; const h = (v / niceMax) * plotH; const y = padT + plotH - h;
      svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${color(si)}" rx="2"><title>${esc(g.label)} · ${esc(s.label)}: ${fmt(v, decimals)}${unit}</title></rect>`;
      svg += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" fill="#333" font-size="10">${fmt(v, decimals)}</text>`;
      const err = s.errors?.[g.index]; if (err && Number.isFinite(err)) svg += `<line x1="${(x + bw / 2).toFixed(1)}" y1="${(y - 6).toFixed(1)}" x2="${(x + bw / 2).toFixed(1)}" y2="${(y - 10).toFixed(1)}" stroke="#333" stroke-width="1"/>`;
    });
    svg += `<text x="${cx}" y="${height - 34}" text-anchor="middle" fill="#333">${esc(g.label)}</text>`;
  });
  let lx = padL; series.forEach((s, si) => { svg += `<rect x="${lx}" y="${height - 22}" width="10" height="10" fill="${color(si)}" rx="2"/><text x="${lx + 15}" y="${height - 13}" fill="#333">${esc(s.label)}</text>`; lx += 15 + esc(s.label).length * 6.2 + 14; });
  return svg + '</svg>';
}

/**
 * Paired scatter: for each { label, a, b } pair, a (Lattice) is the blue dot and
 * b (Standard) the orange dot; a thin arrow shows the within-pair direction.
 * x = total tokens, y = accuracy (0..1).
 */
export function pairedScatterSVG({ title, pairs, width = 720, height = 360 }) {
  const padL = 64, padR = 24, padT = 34, padB = 56;
  const plotW = width - padL - padR, plotH = height - padT - padB;
  const xs = pairs.flatMap((p) => [p.a.tokens, p.b.tokens]);
  const maxX = niceCeil(Math.max(...xs, 100));
  const x = (v) => padL + (Math.max(0, v) / maxX) * plotW;
  const y = (v) => padT + plotH - Math.min(1, Math.max(0, v)) * plotH;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="ui-monospace,Menlo,monospace" font-size="11"><text x="${padL}" y="14" font-size="13" font-weight="700" fill="#111">${esc(title)}</text>`;
  for (let i = 0; i <= 4; i++) {
    const yy = padT + plotH - (plotH * i) / 4;
    svg += `<line x1="${padL}" y1="${yy}" x2="${width - padR}" y2="${yy}" stroke="#e5e5e5"/><text x="${padL - 6}" y="${yy + 4}" text-anchor="end" fill="#666">${fmt(i / 4, 2)}</text>`;
  }
  svg += `<text x="${padL + plotW / 2}" y="${height - 12}" text-anchor="middle" fill="#333">total tokens (Lattice → Standard per pair)</text>`;
  svg += `<text x="${padL - 40}" y="${padT + plotH / 2}" text-anchor="middle" fill="#333" transform="rotate(-90 ${padL - 40} ${padT + plotH / 2})">accuracy</text>`;
  for (const p of pairs) {
    const ax = x(p.a.tokens), ay = y(p.a.acc), bx = x(p.b.tokens), by = y(p.b.acc);
    svg += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#bbb" stroke-width="1"/>`;
    svg += `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4" fill="#4f8cff"><title>${esc(p.label)} Lattice: ${fmt(p.a.tokens, 0)} tokens, acc ${fmt(p.a.acc, 2)}</title></circle>`;
    svg += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="4" fill="#ff8c42"><title>${esc(p.label)} Standard: ${fmt(p.b.tokens, 0)} tokens, acc ${fmt(p.b.acc, 2)}</title></circle>`;
  }
  svg += `<rect x="${padL}" y="${height - 30}" width="10" height="10" fill="#4f8cff" rx="2"/><text x="${padL + 15}" y="${height - 21}" fill="#333">Lattice</text><rect x="${padL + 80}" y="${height - 30}" width="10" height="10" fill="#ff8c42" rx="2"/><text x="${padL + 95}" y="${height - 21}" fill="#333">Standard</text>`;
  return svg + '</svg>';
}

function statCell(block) {
  return `mean ${fmt(block.mean)} · sd ${fmt(block.sd)} · sem ${fmt(block.sem)}${block.ci ? ` · 95% CI [${fmt(block.ci.low)}, ${fmt(block.ci.high)}]` : ''}`;
}

function statRows(stats) {
  const t = stats.pairedT, w = stats.wilcoxon;
  return [
    `| ${esc(stats.metric)} | ${stats.n} | ${statCell(stats.lattice)} | ${statCell(stats.standard)} | ${fmt(stats.diff)} | ${t ? `t=${fmt(t.t)} p=${fmt(t.p, 3)}` : '—'} | ${w ? `W=${fmt(w.W)} z=${fmt(w.z)} p=${fmt(w.p, 3)}` : '—'} | ${stats.cohensDz == null ? '—' : fmt(stats.cohensDz)} |`,
  ].join('\n');
}

/** Self-contained HTML report: meta, summary table, per-task tables, SVG charts. */
export function buildReport({ meta, byTask, overall, svgs = [] }) {
  const rows = byTask
    .map((b) => {
      return `| ${esc(b.taskId)} | ${b.n} | ${fmt(b.lattice.accuracy, 3)} | ${fmt(b.standard.accuracy, 3)} | ${fmt(b.lattice.tokens, 0)} | ${fmt(b.standard.tokens, 0)} | ${fmt(b.lattice.latency, 0)} | ${fmt(b.standard.latency, 0)} | ${fmt(b.lattice.tokensPerCorrect, 0)} | ${fmt(b.standard.tokensPerCorrect, 0)} | ${b.paired?.p == null ? '—' : fmt(b.paired.p, 3)} | ${b.paired?.dz == null ? '—' : fmt(b.paired.dz)} |`;
    })
    .join('\n');
  const overallStats = statsRow('accuracy', [overall.lattice.accuracy], [overall.standard.accuracy]);
  const overallRows = statRows(overallStats);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>OpenRouter × Lattice experiment — ${esc(meta.ranAt || '')}</title>
<style>body{font-family:ui-monospace,Menlo,monospace;margin:2rem auto;max-width:1080px;padding:0 1rem;color:#111;background:#fff}table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:12px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5}svg{max-width:100%;height:auto;margin:1rem 0}.muted{color:#666}.box{border:1px solid #eee;border-radius:8px;padding:1rem;margin:1rem 0}</style></head>
<body><h1>${esc(meta.title || 'OpenRouter × Lattice experiment')}</h1>
<p class="muted">Ran at ${esc(meta.ranAt || '')} · model <code>${esc(meta.model || '')}</code> · repeats ${esc(meta.repeats)} · n per cell ${esc(overall.n)}</p>
<div class="box"><h2>Protocol</h2><p>${esc(meta.protocol || '')}</p><p>Treatments: ${(meta.treatments || []).map(esc).join(', ')}${meta.serverArms ? ' (proxy server arms active)' : ''}</p>
<p>Tasks: ${(meta.tasks || []).map(esc).join(', ')}</p>
<p class="muted">Limitations: ${(meta.limitations || []).map(esc).join(' · ')}</p></div>
<h2>Overall (pooled across tasks)</h2>
<table><thead><tr><th>metric</th><th>n</th><th>Lattice</th><th>Standard</th><th>diff</th><th>paired t</th><th>Wilcoxon</th><th>d_z</th></tr></thead><tbody>
${overallRows}
</tbody></table>
<h2>Per task</h2>
<table><thead><tr><th>task</th><th>n</th><th>L acc</th><th>S acc</th><th>L tok</th><th>S tok</th><th>L ms</th><th>S ms</th><th>L tok/corr</th><th>S tok/corr</th><th>p</th><th>d_z</th></tr></thead><tbody>
${rows}
</tbody></table>
${svgs.map((s) => `<div>${s}</div>`).join('\n')}
<p class="muted">Provider-reported usage only · n &lt; 10 is descriptive, not generalizable · generated by scripts/lattice-vs-standard-openrouter-usage.mjs</p>
</body></html>`;
}
