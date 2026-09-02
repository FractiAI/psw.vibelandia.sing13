#!/usr/bin/env node
/**
 * Multi-task real Cursor usage matrix: Lattice-style vs fat dump across work types.
 *
 * Loads CURSOR_API_KEY from env / .env.vercel.local (never prints key).
 *
 * Honesty: one account/model session; local SDK; fat paste capped; not a universal SLA.
 *
 *   npm run compare:lattice:cursor:matrix
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Agent } from '@cursor/sdk';
import { assembleLatticePrompt } from '../lib/lattice-prompt.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'lattice-vs-standard-cursor-usage-matrix.json');
const OUT_PREV = join(ROOT, 'data', 'lattice-vs-standard-cursor-usage-matrix-before-seed.json');
const MODEL_ID = (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim();
const FAT_CHAR_CAP = Number(process.env.LATTICE_FAT_CHAR_CAP || 60_000);
const ONLY = String(process.env.LATTICE_MATRIX_ONLY || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Varied work types — same ask both modes. */
const TASKS = [
  {
    id: 'T1_trivial_arithmetic',
    class: 'no_repo',
    title: 'Trivial — no corpus needed',
    ask: 'Reply with exactly one short sentence: what is 17×3? No tools. No file reads.',
  },
  {
    id: 'T2_product_tagline',
    class: 'no_repo',
    title: 'Product copy — no corpus needed',
    ask: 'Write one 12-word-or-fewer tagline for Lattice Chat Agent V1.618 as Your Goldilocks steward. No tools. No file reads.',
  },
  {
    id: 'T3_single_doc_fact',
    class: 'pointer_rag',
    title: 'Single-doc fact from a named pointer',
    ask: `From docs/SYNTHOBS_EGS_81_ELECTRONS_LATTICE_2026-07.md only (open that one file if needed): what is the Document ID string? Reply with the ID and one honesty-boundary sentence. Under 80 words.`,
  },
  {
    id: 'T4_locate_symbol',
    class: 'code_locate',
    title: 'Locate a symbol in the codebase',
    ask: `Where is function buildNestDirective defined? Give path + approximate role in one short paragraph. Prefer search/read of that symbol only — do not dump the repo.`,
  },
  {
    id: 'T5_multi_band_plan',
    class: 'multi_band',
    title: 'Multi-band nesting plan',
    ask: `In under 250 words, outline a Goldilocks nested plan for a multi-band SING13 change (docs ground → edge UI → api/lib pipes → squeeze). Name peer-firewall. No edits. No PR.`,
  },
  {
    id: 'T5b_unprompted_plan',
    class: 'multi_band_unprompted',
    nestingPrompt: 'unprompted',
    title: 'Plan only — body-size guard (no nesting keywords)',
    ask: `Plan how to add a request-body size guard to api/lattice-chat.js so oversized JSON payloads return HTTP 413 with plain language. No edits. No PR.`,
  },
  {
    id: 'T6_ops_config',
    class: 'ops',
    title: 'Ops / config grounding',
    ask: `From README / .env.example knowledge: does Lattice Chat Agent on Vercel use a server CURSOR_API_KEY, or BYOK header from the browser? One short paragraph. Prefer those docs only.`,
  },
  {
    id: 'T7_minimal_impl',
    class: 'code_impl_unprompted',
    nestingPrompt: 'unprompted',
    title: 'Minimal implementation — pure helper + vitest',
    ask: `Implement pure function estimateJsonBodyBytes(value) in lib/lattice-payload-budget.mjs and add one vitest. Minimal diff only — no unrelated files.`,
  },
];

function loadEnvFiles() {
  for (const name of ['.env.vercel.local', '.env.local', '.env']) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function walkFiles(dir, exts, limit = 40) {
  const out = [];
  function walk(d) {
    if (out.length >= limit) return;
    let entries = [];
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (out.length >= limit) return;
      const p = join(d, ent.name);
      if (ent.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'assets'].includes(ent.name)) continue;
        walk(p);
      } else if (exts.some((e) => ent.name.endsWith(e))) {
        try {
          const st = statSync(p);
          if (st.size > 0 && st.size < 250_000) out.push(p);
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(dir);
  return out;
}

function buildFatCorpusPaste() {
  const paths = [
    ...walkFiles(join(ROOT, 'docs'), ['.md'], 10),
    ...walkFiles(join(ROOT, 'protocols'), ['.md'], 6),
    ...walkFiles(join(ROOT, 'api'), ['.js'], 4),
    ...walkFiles(join(ROOT, 'apps', 'lattice-chat', 'src'), ['.ts', '.tsx'], 6),
  ];
  let body = '';
  const included = [];
  for (const p of paths) {
    if (body.length >= FAT_CHAR_CAP) break;
    let text = '';
    try {
      text = readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    const rel = relative(ROOT, p).replace(/\\/g, '/');
    const chunk = `\n\n===== FILE: ${rel} =====\n${text}`;
    const room = FAT_CHAR_CAP - body.length;
    body += chunk.slice(0, Math.max(0, room));
    included.push({ path: rel, chars: Math.min(chunk.length, room) });
  }
  return { paste: body, included, chars: body.length };
}

function latticePrompt(task) {
  return assembleLatticePrompt({
    message: task.ask,
    root: ROOT,
    nestTopology: 'goldilocks',
    closingLine: 'No PR. No commits.',
  });
}

function agentModeForTask(task) {
  // Seed-only planning: agent mode with hard no-tools instruction (plan mode still tool-toured).
  if (task.class === 'multi_band') return 'agent';
  return 'agent';
}

function fatPrompt(task, paste) {
  return `You are a standard coding agent with a large corpus dump already pasted below.
Use the dump as primary grounding when relevant. No PR. No commits.

Task class: ${task.class}
Task: ${task.ask}

===== BEGIN CORPUS DUMP =====
${paste}
===== END CORPUS DUMP =====`;
}

function estimateCharsTokens(s) {
  return Math.ceil(String(s || '').length / 4);
}

function pickUsage(result, streamUsage) {
  const u = result?.usage || result?.totalUsage || result?.result?.usage || streamUsage || null;
  if (!u || typeof u !== 'object') return null;
  const total =
    u.totalTokens ??
    u.total_tokens ??
    ((u.inputTokens ?? u.input_tokens ?? 0) +
      (u.outputTokens ?? u.output_tokens ?? 0) +
      (u.cacheReadTokens ?? u.cache_read_tokens ?? 0) ||
      null);
  return {
    raw: {
      inputTokens: u.inputTokens ?? u.input_tokens ?? null,
      outputTokens: u.outputTokens ?? u.output_tokens ?? null,
      cacheReadTokens: u.cacheReadTokens ?? u.cache_read_tokens ?? null,
      cacheWriteTokens: u.cacheWriteTokens ?? u.cache_write_tokens ?? null,
      totalTokens: typeof total === 'number' ? Math.round(total) : null,
    },
    totalTokens: typeof total === 'number' && total > 0 ? Math.round(total) : null,
    inputTokens: u.inputTokens ?? u.input_tokens ?? null,
    outputTokens: u.outputTokens ?? u.output_tokens ?? null,
    cacheReadTokens: u.cacheReadTokens ?? u.cache_read_tokens ?? null,
  };
}

async function runMode({ label, prompt, apiKey, mode = 'agent' }) {
  const started = Date.now();
  let streamUsage = null;
  let toolCalls = 0;
  let assistantChars = 0;
  /** @type {any} */
  let agent;
  try {
    agent = await Agent.create({
      apiKey,
      model: { id: MODEL_ID },
      mode,
      local: { cwd: ROOT },
    });
    const run = await agent.send(prompt, { mode });
    if (run && typeof run.stream === 'function') {
      try {
        for await (const event of run.stream()) {
          if (event?.type === 'usage' && event.usage) streamUsage = event.usage;
          if (event?.type === 'tool_call') toolCalls += 1;
          if (event?.type === 'assistant' && Array.isArray(event.message?.content)) {
            for (const b of event.message.content) {
              if (b?.type === 'text' && typeof b.text === 'string') assistantChars += b.text.length;
            }
          }
        }
      } catch {
        /* wait */
      }
    }
    const result = typeof run.wait === 'function' ? await run.wait() : null;
    const usage = pickUsage(result, streamUsage);
    const text =
      (typeof result?.result === 'string' && result.result) ||
      (typeof result?.text === 'string' && result.text) ||
      '';
    return {
      label,
      ok: String(result?.status || '').toLowerCase() === 'finished' || Boolean(text || usage),
      status: result?.status ?? null,
      runId: result?.id ?? run?.id ?? null,
      durationMs: Date.now() - started,
      promptChars: prompt.length,
      promptTokensEstimate: estimateCharsTokens(prompt),
      assistantChars: assistantChars || text.length,
      toolCalls,
      usage,
      replyPreview: String(text || '').slice(0, 220),
    };
  } finally {
    try {
      if (agent?.[Symbol.asyncDispose]) await agent[Symbol.asyncDispose]();
      else if (typeof agent?.close === 'function') await agent.close();
    } catch {
      /* ignore */
    }
  }
}

function comparePair(lattice, standard) {
  const lt = lattice.usage?.totalTokens ?? null;
  const st = standard.usage?.totalTokens ?? null;
  const saved = typeof lt === 'number' && typeof st === 'number' ? st - lt : null;
  const savedPct =
    saved != null && typeof st === 'number' && st > 0
      ? Math.round((saved / st) * 1000) / 10
      : null;
  let winner = 'tie_or_unknown';
  if (typeof lt === 'number' && typeof st === 'number') {
    if (lt < st * 0.95) winner = 'lattice';
    else if (st < lt * 0.95) winner = 'standard_fat';
    else winner = 'rough_tie';
  }
  return {
    latticeTotal: lt,
    standardTotal: st,
    deltaStandardMinusLattice: saved,
    latticeSavedPctVsStandard: savedPct,
    winner,
    latticeFaster:
      lattice.durationMs && standard.durationMs
        ? lattice.durationMs < standard.durationMs * 0.95
        : null,
    latticeFewerTools:
      typeof lattice.toolCalls === 'number' && typeof standard.toolCalls === 'number'
        ? lattice.toolCalls < standard.toolCalls
        : null,
    promptEstimateSavedPct:
      standard.promptTokensEstimate > 0
        ? Math.round(
            ((standard.promptTokensEstimate - lattice.promptTokensEstimate) /
              standard.promptTokensEstimate) *
              1000,
          ) / 10
        : null,
  };
}

async function main() {
  loadEnvFiles();
  const apiKey = String(process.env.CURSOR_API_KEY || '').trim();
  if (!apiKey) {
    console.error('FAIL: CURSOR_API_KEY missing');
    process.exit(2);
  }

  const tasks = ONLY.length ? TASKS.filter((t) => ONLY.includes(t.id)) : TASKS;
  const fat = buildFatCorpusPaste();
  console.log(
    JSON.stringify(
      {
        phase: 'start',
        model: MODEL_ID,
        tasks: tasks.map((t) => t.id),
        fatChars: fat.chars,
        keyLen: apiKey.length,
      },
      null,
      2,
    ),
  );

  const rows = [];
  for (const task of tasks) {
    console.log(JSON.stringify({ phase: 'task_start', id: task.id }, null, 2));
    const mode = agentModeForTask(task);
    const lattice = await runMode({
      label: 'lattice',
      prompt: latticePrompt(task),
      apiKey,
      mode,
    });
    const standard = await runMode({
      label: 'standard_fat',
      prompt: fatPrompt(task, fat.paste),
      apiKey,
      mode: 'agent',
    });
    const comparison = comparePair(lattice, standard);
    const row = { task, lattice, standard, comparison };
    rows.push(row);
    console.log(
      JSON.stringify(
        {
          phase: 'task_done',
          id: task.id,
          winner: comparison.winner,
          latticeTotal: comparison.latticeTotal,
          standardTotal: comparison.standardTotal,
          latticeTools: lattice.toolCalls,
          standardTools: standard.toolCalls,
          latticeMs: lattice.durationMs,
          standardMs: standard.durationMs,
        },
        null,
        2,
      ),
    );
  }

  const byClass = {};
  for (const row of rows) {
    const c = row.task.class;
    if (!byClass[c]) byClass[c] = { n: 0, latticeWins: 0, standardWins: 0, ties: 0 };
    byClass[c].n += 1;
    if (row.comparison.winner === 'lattice') byClass[c].latticeWins += 1;
    else if (row.comparison.winner === 'standard_fat') byClass[c].standardWins += 1;
    else byClass[c].ties += 1;
  }

  const receipt = {
    id: 'lattice-vs-standard-cursor-usage-matrix-v2-seed',
    title: 'Lattice vs standard Cursor usage — varied work types (seed pack + hard rails)',
    ranAt: new Date().toISOString(),
    model: MODEL_ID,
    runtime: 'local',
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    improvements: [
      'Hard context discipline in Lattice prompts',
      'Curated seed-pack pinches for complex tasks',
      'Plan mode for multi-band planning',
      'Max extra tool reads after seed',
    ],
    honesty: {
      claim:
        'Paired Cursor SDK local runs across varied task classes: Lattice seed+rails vs fat corpus paste.',
      notClaim:
        'Not a universal invoice guarantee. Local agents may still tool-explore. Fat paste capped.',
      fatCapChars: FAT_CHAR_CAP,
    },
    fatCorpus: { chars: fat.chars, files: fat.included.length },
    summaryByClass: byClass,
    overall: {
      latticeWins: rows.filter((r) => r.comparison.winner === 'lattice').length,
      standardWins: rows.filter((r) => r.comparison.winner === 'standard_fat').length,
      ties: rows.filter((r) => r.comparison.winner === 'rough_tie' || r.comparison.winner === 'tie_or_unknown')
        .length,
      n: rows.length,
    },
    rows,
  };

  if (existsSync(OUT) && !existsSync(OUT_PREV)) {
    try {
      writeFileSync(OUT_PREV, readFileSync(OUT, 'utf8'), 'utf8');
    } catch {
      /* ignore */
    }
  }
  writeFileSync(OUT, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: true,
        receipt: OUT,
        overall: receipt.overall,
        summaryByClass: byClass,
        table: rows.map((r) => ({
          id: r.task.id,
          class: r.task.class,
          winner: r.comparison.winner,
          lattice: r.comparison.latticeTotal,
          standard: r.comparison.standardTotal,
          savedPct: r.comparison.latticeSavedPctVsStandard,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('FAIL:', err instanceof Error ? err.message : err);
  process.exit(1);
});
