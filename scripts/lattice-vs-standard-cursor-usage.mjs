#!/usr/bin/env node
/**
 * Real Cursor usage: Lattice-style prompt vs fat corpus dump (same ask).
 *
 * Loads CURSOR_API_KEY from env or .env.vercel.local / .env (never prints the key).
 * Uses @cursor/sdk local agents against this repo cwd.
 *
 * Honesty: one paired run on one account/model — not a universal % claim.
 * Fat path caps pasted corpus so the experiment stays affordable.
 *
 * Usage:
 *   node scripts/lattice-vs-standard-cursor-usage.mjs
 *   npm run compare:lattice:cursor
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Agent } from '@cursor/sdk';
import { assembleLatticePrompt } from '../lib/lattice-prompt.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'lattice-vs-standard-cursor-usage.json');
const MODEL_ID = (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim();
/** Cap fat paste so we measure dump vs pointers without blowing the wallet. */
const FAT_CHAR_CAP = Number(process.env.LATTICE_FAT_CHAR_CAP || 120_000);

const ASK = `Complex work (same ask both modes):

In under 350 words, map how SING13 Nested Agent Lattice + NSPFRNP + RAG should run a multi-band change:
(1) ground in docs/protocols,
(2) edge UI touchpoints (apps/interfaces),
(3) pipe/API touchpoints (api/lib),
(4) nested plan with peer-firewall,
(5) why pointer context beats dumping the corpus.

Deliver a short structured plan. Do not edit files. Do not open a PR.`;

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
    ...walkFiles(join(ROOT, 'docs'), ['.md'], 14),
    ...walkFiles(join(ROOT, 'protocols'), ['.md'], 8),
    ...walkFiles(join(ROOT, 'api'), ['.js'], 6),
    ...walkFiles(join(ROOT, 'apps', 'lattice-chat', 'src'), ['.ts', '.tsx'], 8),
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

function latticePrompt() {
  return assembleLatticePrompt({
    message: ASK,
    root: ROOT,
    nestTopology: 'goldilocks',
    closingLine: 'Keep reply under 350 words. No file edits. No PR.',
  });
}

function fatPrompt(paste) {
  return `You are a standard coding agent. The following repository corpus has been dumped into context for you.
Use this dumped material as your primary grounding (do not ignore it). Keep reply under 350 words. No file edits. No PR.

${ASK}

===== BEGIN CORPUS DUMP =====
${paste}
===== END CORPUS DUMP =====`;
}

function estimateCharsTokens(s) {
  return Math.ceil(String(s || '').length / 4);
}

function pickUsage(result, streamUsage) {
  const u =
    result?.usage ||
    result?.totalUsage ||
    result?.result?.usage ||
    streamUsage ||
    null;
  if (!u || typeof u !== 'object') return null;
  const total =
    u.totalTokens ??
    u.total_tokens ??
    ((u.inputTokens ?? u.input_tokens ?? 0) +
      (u.outputTokens ?? u.output_tokens ?? 0) +
      (u.thoughtTokens ?? u.thought_tokens ?? 0) ||
      null);
  return {
    raw: u,
    totalTokens: typeof total === 'number' && total > 0 ? Math.round(total) : null,
    inputTokens: u.inputTokens ?? u.input_tokens ?? null,
    outputTokens: u.outputTokens ?? u.output_tokens ?? null,
  };
}

async function runMode({ label, prompt, apiKey }) {
  const started = Date.now();
  let streamUsage = null;
  let assistantChars = 0;
  /** @type {any} */
  let agent;
  try {
    agent = await Agent.create({
      apiKey,
      model: { id: MODEL_ID },
      local: { cwd: ROOT },
    });
    const run = await agent.send(prompt);
    if (run && typeof run.stream === 'function') {
      try {
        for await (const event of run.stream()) {
          if (event?.type === 'usage' && event.usage) streamUsage = event.usage;
          if (event?.type === 'assistant' && Array.isArray(event.message?.content)) {
            for (const b of event.message.content) {
              if (b?.type === 'text' && typeof b.text === 'string') assistantChars += b.text.length;
            }
          }
        }
      } catch {
        /* wait still */
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
      agentId: agent?.agentId ?? null,
      runId: result?.id ?? run?.id ?? null,
      durationMs: Date.now() - started,
      promptChars: prompt.length,
      promptTokensEstimate: estimateCharsTokens(prompt),
      assistantChars: assistantChars || text.length,
      usage,
      replyPreview: String(text || '').slice(0, 280),
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

async function main() {
  loadEnvFiles();
  const apiKey = String(process.env.CURSOR_API_KEY || '').trim();
  if (!apiKey) {
    console.error('FAIL: CURSOR_API_KEY not found in env or .env.vercel.local / .env');
    process.exit(2);
  }
  console.log(
    JSON.stringify(
      {
        phase: 'start',
        model: MODEL_ID,
        keyLen: apiKey.length,
        fatCharCap: FAT_CHAR_CAP,
      },
      null,
      2,
    ),
  );

  const fat = buildFatCorpusPaste();
  const lattice = await runMode({
    label: 'lattice_pointers',
    prompt: latticePrompt(),
    apiKey,
  });
  console.log(
    JSON.stringify(
      {
        phase: 'lattice_done',
        usageTotal: lattice.usage?.totalTokens,
        promptTokensEstimate: lattice.promptTokensEstimate,
        status: lattice.status,
      },
      null,
      2,
    ),
  );

  const standard = await runMode({
    label: 'standard_fat_dump',
    prompt: fatPrompt(fat.paste),
    apiKey,
  });
  console.log(
    JSON.stringify(
      {
        phase: 'standard_done',
        usageTotal: standard.usage?.totalTokens,
        promptTokensEstimate: standard.promptTokensEstimate,
        status: standard.status,
      },
      null,
      2,
    ),
  );

  const lt = lattice.usage?.totalTokens;
  const st = standard.usage?.totalTokens;
  const saved =
    typeof lt === 'number' && typeof st === 'number' ? Math.max(0, st - lt) : null;
  const savedPct =
    saved != null && st > 0 ? Math.round((saved / st) * 1000) / 10 : null;

  const receipt = {
    id: 'lattice-vs-standard-cursor-usage-v1',
    title: 'Lattice vs standard — real Cursor SDK usage (paired local runs)',
    ranAt: new Date().toISOString(),
    model: MODEL_ID,
    runtime: 'local',
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    honesty: {
      claim:
        'Paired Cursor SDK local runs of the same ask: Lattice pointer brief vs fat corpus paste.',
      notClaim:
        'Not a universal invoice guarantee; not structural chars÷4; one model/account/session pair.',
      fatCapChars: FAT_CHAR_CAP,
      note:
        'If usage.totalTokens is null, Cursor did not return a usage object on the run — promptTokensEstimate still shows input-size gap.',
    },
    ask: ASK,
    fatCorpus: {
      chars: fat.chars,
      files: fat.included.length,
      included: fat.included.slice(0, 40),
    },
    lattice,
    standard,
    comparison: {
      latticeUsageTotal: lt ?? null,
      standardUsageTotal: st ?? null,
      savedTokens: saved,
      savedPct,
      latticePromptTokensEstimate: lattice.promptTokensEstimate,
      standardPromptTokensEstimate: standard.promptTokensEstimate,
      promptEstimateSavedPct:
        standard.promptTokensEstimate > 0
          ? Math.round(
              ((standard.promptTokensEstimate - lattice.promptTokensEstimate) /
                standard.promptTokensEstimate) *
                1000,
            ) / 10
          : null,
    },
  };

  writeFileSync(OUT, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        ok: true,
        receipt: OUT,
        comparison: receipt.comparison,
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
