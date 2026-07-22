#!/usr/bin/env node
/**
 * Lattice V1.618 vs standard agentic mode — simple comparison bench.
 * Same complex work prompt; measures estimated context tokens (chars÷4 heuristic).
 * Honesty: estimate / structural bench — not vendor billing unless SDK usage is attached.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLatticeExecution, estimateTokens } from '../lib/lattice-engine.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'lattice-vs-standard-comparison.json');

const PROMPT = `Complex work (same ask for both modes):

Map how SING13 Nested Agent Lattice + NSPFRNP + RAG should execute a multi-band change:
(1) ground the ask in docs/ and protocols/,
(2) identify edge UI touchpoints under apps/ and interfaces/,
(3) identify pipe/API touchpoints under api/ and lib/,
(4) propose a token-efficient nested-agent plan with peer-firewall and scale-to-zero,
(5) estimate token savings vs dumping the corpus into one fat agent.

Deliver a structured plan a chat user could follow.`;

const HISTORY = [
  { role: 'user', content: 'We need corpus-faithful nesting, not a single mega-agent.' },
  {
    role: 'assistant',
    content: 'Understood. Prefer scale bands and RAG pointers over full-file dumps.',
  },
  { role: 'user', content: PROMPT },
];

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
        if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
        walk(p);
      } else if (exts.some((e) => ent.name.endsWith(e))) {
        try {
          const st = statSync(p);
          if (st.size > 0 && st.size < 400_000) out.push(p);
        } catch {
          /* skip */
        }
      }
    }
  }
  walk(dir);
  return out;
}

function fileTokens(path) {
  try {
    return estimateTokens(readFileSync(path, 'utf8'));
  } catch {
    return 0;
  }
}

function sumTokens(paths) {
  let t = 0;
  const samples = [];
  for (const p of paths) {
    const tok = fileTokens(p);
    t += tok;
    samples.push({ path: relative(ROOT, p).replace(/\\/g, '/'), tokens: tok });
  }
  return { tokens: t, samples };
}

// Standard agentic mode: fat context — dump large slices of docs/protocols + mixed code
const standardDocs = walkFiles(join(ROOT, 'docs'), ['.md'], 18);
const standardProtocols = walkFiles(join(ROOT, 'protocols'), ['.md'], 10);
const standardCode = [
  ...walkFiles(join(ROOT, 'apps'), ['.ts', '.tsx', '.js'], 12),
  ...walkFiles(join(ROOT, 'api'), ['.js'], 8),
  ...walkFiles(join(ROOT, 'lib'), ['.mjs', '.js'], 8),
];

const docsDump = sumTokens(standardDocs);
const protoDump = sumTokens(standardProtocols);
const codeDump = sumTokens(standardCode);
const promptTok = estimateTokens(PROMPT);
const historyTok = estimateTokens(HISTORY.map((m) => `${m.role}: ${m.content}`).join('\n'));

// Standard: re-read / re-stuff corpus each phase (map → plan → synthesize) ≈ 2.4× dump
const STANDARD_PHASE_MULTIPLIER = 2.4;
const standardCorpus = docsDump.tokens + protoDump.tokens + codeDump.tokens;
const standardTotal = Math.round(
  (standardCorpus + historyTok + promptTok + 1200) * STANDARD_PHASE_MULTIPLIER,
);

// Lattice: use shared engine estimate + measured pointer set (small index files only)
const latticePointerFiles = [
  join(ROOT, '.cursor', 'rules', 'nested-cytographic-agents.mdc'),
  join(ROOT, '.cursor', 'rules', 'lattice_rag.mdc'),
  join(ROOT, '.cursor', 'rules', 'team-nspfrnp-mode.mdc'),
].filter((p) => {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
});
const pointerSum = sumTokens(latticePointerFiles);
const latticeExec = buildLatticeExecution({
  message: PROMPT,
  history: HISTORY,
  mode: 'cloud',
  resumed: false,
  reply: 'Structured nested plan with MCA squeeze and token ledger.',
});

// Prefer engine latticeTokens but floor with real pointer measurement
const latticeTotal = Math.max(latticeExec.tokens.latticeTokens, pointerSum.tokens + promptTok + 800);

const saved = Math.max(0, standardTotal - latticeTotal);
const savedPct = standardTotal > 0 ? Math.round((saved / standardTotal) * 1000) / 10 : 0;

const receipt = {
  id: 'lattice-vs-standard-complex-work-v1',
  title: 'Lattice V1.618 vs standard agentic mode — complex multi-band work',
  ranAt: new Date().toISOString(),
  honesty:
    'Structural token estimate (chars÷4). Same prompt for both modes. Not vendor-billed usage; illustrates context load. Lattice path uses RAG pointers + nested scale bands; standard path dumps large doc/protocol/code slices and re-stuffs across phases.',
  prompt: PROMPT,
  modes: {
    standardAgentic: {
      label: 'Standard agentic (fat context)',
      description:
        'Single (or loosely coordinated) agent loads large docs/protocols/code slices into context and re-uses that fat context across map → plan → synthesize phases.',
      filesSampled: docsDump.samples.length + protoDump.samples.length + codeDump.samples.length,
      corpusTokensOnce: standardCorpus,
      phaseMultiplier: STANDARD_PHASE_MULTIPLIER,
      estimatedTokens: standardTotal,
      samples: {
        docs: docsDump.samples.slice(0, 6),
        protocols: protoDump.samples.slice(0, 4),
        code: codeDump.samples.slice(0, 6),
      },
    },
    lattice: {
      label: 'Lattice V1.618 (nested + RAG)',
      description:
        'Φ-Parent crystallizes seed/edge/pipes children; RAG pointers and rule shells instead of corpus dumps; 16-turn window; peer-firewall; scale-to-zero.',
      estimatedTokens: latticeTotal,
      engine: latticeExec.tokens,
      agents: latticeExec.agents.map((a) => ({
        name: a.name,
        role: a.role,
        scale: a.scale,
        status: a.status,
      })),
      pointerFiles: pointerSum.samples,
    },
  },
  comparison: {
    standardTokens: standardTotal,
    latticeTokens: latticeTotal,
    tokensSaved: saved,
    percentSaved: savedPct,
    headline:
      savedPct >= 90
        ? 'Lattice cut estimated context load by roughly an order of magnitude on this complex multi-band ask.'
        : savedPct >= 70
          ? 'Lattice cut estimated context load by about three-quarters on this complex multi-band ask.'
          : `Lattice saved an estimated ${savedPct}% of context tokens vs standard fat-context agentic mode.`,
  },
};

writeFileSync(OUT, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(receipt.comparison, null, 2));
console.log(`Wrote ${relative(ROOT, OUT)}`);
