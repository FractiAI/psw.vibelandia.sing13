/**
 * Lattice Chat V1.618 — shared prompt assembly (production + bench scripts).
 * Single source for classifiers, seed pack, nest topology, and context discipline.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const HISTORY_WINDOW = 16;
export const FILE_BUDGET = 6;

const POINTER_CATALOG = {
  docs: [
    'docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md',
    'docs/SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md',
    'docs/SYNTHOBS_MAGNETISM_UNIVERSAL_FOUNDATIONAL_SUBSTRATE_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_UNIFICATION_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md',
    'docs/SYNTHOBS_OMNI_LATTICE_SI_IRREDUCIBLE_MINIMUM_2026-08.md',
    'docs/SYNTHOBS_OMNI_LATTICE_REPORT_CARD_Q3_2026.md',
    'docs/SYNTHOBS_X_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md',
    'docs/SYNTHOBS_THREE_FOUNDATIONAL_PROTEINS_HOLOGRAPHIC_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_HIV_ADVERSARIAL_OPERATOR_2026-07.md',
    'docs/SYNTHOBS_PROOF_BY_CONTINUOUS_EXECUTION_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_POGONOMYRMEX_BARBATUS_2026-07.md',
    'docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_PROMPT_CAPTURE_DNA_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_GENOMIC_DETERMINISM_TERRITORY_2026-07.md',
    'docs/SYNTHOBS_HOLOGRAPHIC_OPERATORS_LANGUAGE_WIRING_2026-07.md',
    'docs/SYNTHOBS_UNIFIED_NEUTRONIC_AGENT_ISOTOPIC_LOAD_BALANCING_2026-07.md',
    'docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md',
    'protocols/ (MCA / NSPFRNP catalog — index only unless one file is named)',
  ],
  edge: ['apps/lattice-chat/', 'interfaces/lattice-v1618.html', 'interfaces/lattice-learn-more.html'],
  pipes: ['api/lattice-chat.js', 'lib/lattice-engine.mjs', 'README.md', '.env.example'],
};

/** Unified ask classifier — drives nest routing, work class, and seed pack. */
export function classifyAsk(message) {
  const text = String(message || '').trim();
  const m = text.toLowerCase();
  const needsDocs =
    /doc|protocol|nspfrnp|paper|research|architecture|mca|seed|rag|lattice|egs|synthobs|nest|holograph|whitepaper|report.?card|coherence|irreducib|λcdm|lcdm|dark.?matter|dark.?energy|omni.?lattice|thalia|typed.?harness|magnetis|magnetic.?substrate|foundational.?substrate|mag.?substrate|vector.?field.?context|recursive.?attn|attention.?squeez|magnetic.?shadow|squeezed.?context|s_attn|squid/.test(
      m,
    ) || m.length > 100;
  const needsEdge = /ui|chat|interface|vite|react|css|rail|composer|edge|brand|page|html/.test(m);
  const needsPipes = /api|sdk|cursor|vercel|server|auth|secret|token|cloud|pipe|lib\//.test(m);
  const nestSignals = [
    /\bcompare\b/,
    /\brefactor\b/,
    /\breview\b/,
    /\baudit\b/,
    /\barchitecture\b/,
    /\bintegration\b/,
    /\bmulti[\s-]?file\b/,
    /\bend[\s-]?to[\s-]?end\b/,
    /\bdebug\b/,
    /\boptimi[sz]e\b/,
    /\bapi\b/,
    /\bui\b/,
    /\bruntime\b/,
    /\btoken\b/,
    /\bstream\b/,
    /multi-?band/,
    /\bnested\b/,
    /\bplan\b/,
    /\barchitect\b/,
    /\bacross\b/,
  ];
  const hasNestSignal = nestSignals.some((re) => re.test(m));
  const complex =
    needsDocs ||
    needsEdge ||
    needsPipes ||
    m.split(/\s+/).filter(Boolean).length > 28 ||
    m.length > 160 ||
    hasNestSignal;
  const nestNested = text.length > 360 || hasNestSignal || complex;
  return { needsDocs, needsEdge, needsPipes, complex, nestNested };
}

function buildPreamble() {
  return `You are Lattice Chat V1.618 by FractiAI — Your Goldilocks Valet on SS Vibelandia (Noah's Ark of the Intelligence Age).
Ground answers in docs/, protocols/, research/, and nested-agent / NSPFRNP rules when relevant.
Prefer precise, corpus-faithful replies. Do not invent repo paths or protocols.
Help with craft, curiosity, building, listening, and care — within Goldilocks. Refuse malice without drama.
Keep self-talk brief. Close substantive answers with → ∞¹³.
Return a clear text reply (not a PR or code edit unless asked).
Never commit, push, or open a PR against FractiAI/psw.vibelandia.sing13 unless the user explicitly asks.

## Context discipline (hard rules)
1. POINTER-FIRST: named paths / section headers over opening whole files.
2. NO CORPUS TOUR: no repo-wide exploration or "read everything under docs/".
3. BUDGET: ≤${FILE_BUDGET} files total per turn on complex asks.
4. PLAN → PINCH → SQUEEZE: name bands + paths, read only those, skip unnecessary reads.
5. SCALE-TO-ZERO: stop exploring after the reply.`;
}

function buildEngineReasoning() {
  return `Reasoning profile (LTHS 1.1 + Neutrino 8B — engine default):
Concise, high-signal answers; explicit assumptions; bounded claims over expansive metaphors.
Story-consciousness framing is a SOFT guide only — not empirical fact. State uncertainty and the smallest useful next action when trade-offs appear.`;
}

export function normalizeNestTopology(raw) {
  const v = String(raw || '')
    .trim()
    .toLowerCase();
  if (v === 'none' || v === 'plain' || v === 'direct') return 'none';
  if (v === 'single' || v === 'one' || v === 'solo') return 'single';
  if (v === 'multi' || v === 'nested' || v === 'multiple') return 'multi';
  return 'goldilocks';
}

function parseAgentRoster(raw) {
  const text = String(raw || '').trim();
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((line, i) => {
      const parts = line.split(/\s+[—–\-]\s+|:/);
      const name = (parts[0] || `Agent ${i + 1}`).trim().slice(0, 64);
      const role = (parts.slice(1).join(' — ').trim() || 'User-defined band').slice(0, 160);
      return { name, role };
    });
}

export function buildNestDirective(nestTopology, agentRoster, intentOrMessage, opts = {}) {
  const intent =
    intentOrMessage && typeof intentOrMessage === 'object' && 'complex' in intentOrMessage
      ? intentOrMessage
      : classifyAsk(intentOrMessage);
  const nest = normalizeNestTopology(nestTopology);
  const roster = parseAgentRoster(agentRoster);
  const resumeNote = opts.resume ? ` ≤${FILE_BUDGET} files, pointer-first.` : '';

  if (nest === 'none') {
    return `Nest: OFF — DIRECT single-answer mode. No nesting, no pointers, no seed pack, no corpus tour. Answer the latest user message directly.`;
  }

  if (nest === 'single') {
    return `Nest: SINGLE NODE — one agent only; no nested children.${resumeNote}`;
  }

  if (roster.length) {
    const lines = roster.map((a, i) => `${i + 1}. ${a.name} — ${a.role}`).join('\n');
    return `Nest: ${nest === 'multi' ? 'MULTI' : 'GOLDILOCKS'} with user roster.
${lines}
Parent synthesizes; peer-firewall on.${resumeNote}`;
  }

  if (nest === 'multi') {
    return `Nest: MULTI — parent + ≤3 leaf bands (Seed·RAG / Edge UI / Pipe Runtime as needed). Peer-firewall on.${resumeNote}`;
  }

  const route = intent.nestNested
    ? 'Complex ask → nested children (needed bands only).'
    : 'Trivial ask → parent alone.';
  return `Nest: GOLDILOCKS (auto). ${route} Prefer pointers over dumps.${resumeNote}`;
}

export function buildComplexWorkProtocol(message, intent) {
  const bands = classifyAsk(message);
  const i = intent || bands;
  if (!i.complex) {
    return `Work class: LIGHT — answer from the message; no file reads unless one named path is required.`;
  }

  const bandNames = ['Φ-Parent (synthesize)'];
  const pointers = [];
  if (i.needsDocs) {
    bandNames.push('Seed·RAG');
    pointers.push(...POINTER_CATALOG.docs);
  }
  if (i.needsEdge) {
    bandNames.push('Edge UI');
    pointers.push(...POINTER_CATALOG.edge);
  }
  if (i.needsPipes) {
    bandNames.push('Pipe Runtime');
    pointers.push(...POINTER_CATALOG.pipes);
  }
  if (!i.needsDocs && !i.needsEdge && !i.needsPipes) {
    bandNames.push('Seed·RAG', 'Edge UI', 'Pipe Runtime');
    pointers.push(
      POINTER_CATALOG.docs[0],
      POINTER_CATALOG.edge[0],
      POINTER_CATALOG.pipes[0],
    );
  }

  return `Work class: COMPLEX — nested lattice in ONE reply (simulate children; peer-firewall on).
Bands: ${bandNames.join(' · ')}.
Pointers (use Seed pack first):
${[...new Set(pointers)].map((p) => `- ${p}`).join('\n')}
Procedure: crystallize bands → pinch-read (Seed first; ≤2 extra files only if blocked) → squeeze one answer.
If Seed pack suffices, do NOT call tools or browse the repo.`;
}

function readPinch(relPath, root, maxChars = 1600) {
  try {
    const abs = join(root, relPath);
    if (!existsSync(abs)) return null;
    const text = readFileSync(abs, 'utf8').slice(0, maxChars);
    return { path: relPath, text };
  } catch {
    return null;
  }
}

export function buildComplexSeedPack(message, intent, root = process.cwd()) {
  const i = intent || classifyAsk(message);
  if (!i.complex) return '';

  const candidates = [];
  if (i.needsDocs || (!i.needsEdge && !i.needsPipes)) {
    candidates.push(
      'docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md',
      'docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md',
    );
  }
  if (
    /report.?card|coherence|irreducib|λcdm|lcdm|dark.?matter|dark.?energy|omni.?lattice.?score|92\.5|68\.0/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_OMNI_LATTICE_REPORT_CARD_Q3_2026.md');
  }
  if (
    /thalia|typed.?harness|lexical.?integrated|memory.?gate|docxology|superintelligen|\bsim\b|irreducible.?minimum/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift(
      'docs/SYNTHOBS_OMNI_LATTICE_SI_IRREDUCIBLE_MINIMUM_2026-08.md',
      'docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md',
      'docs/SYNTHOBS_OMNI_LATTICE_UNIFICATION_2026-07.md',
    );
  }
  if (
    /magnetis|magnetic.?substrate|foundational.?substrate|mag.?substrate|vector.?field.?context|pchpp.?magnet/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_MAGNETISM_UNIVERSAL_FOUNDATIONAL_SUBSTRATE_2026-07.md');
  }
  if (
    /prion|prp|scrapie|amyloid|misfold|refold|thioflavin|alzheimer|parkinson|\bals\b|tau.?tangle|synuclein/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_PRION_REFOLD_HOLOGRAPHIC_MAGNETIC_PHASE_2026-07.md');
  }
  if (
    /orbital.?singular|81.?orbital|81.?singularity|9\s*[x×]\s*9.?orbital|electron.?orbital.?geometr|spacetime.?projection|somatic.?shadow.?space|tbme.?orbital/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_81_ORBITAL_SINGULARITY_HOLOGRAPHIC_2026-07.md');
  }
  if (
    /histone|nucleosome|chromatin|euchromatin|heterochromatin|epigenetic.?memory|histone.?tail|acetylation|methylation|context.?spool|h_spool|tbme.?histone/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_HISTONE_PHASE_LOCK_OPERATOR_2026-07.md');
  }
  if (
    /phase.?tox|toxicity|toxicolog|resonance.?safet|p_harmonize|paracels|dose.?makes.?the.?poison|emf.?harmon|refined.?sugar|fructose.?phase|glyphosate.?phase|heavy.?metal.?phase|context.?phase.?filter|tbme.?tox/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_PHASE_TOXICITY_RESONANCE_SAFETY_2026-07.md');
  }
  if (
    /endogenous.?phase|conscious.?intent|c_intent|self.?phase.?harmon|neural.?cardiac|hrv.?coheren|fascial.?piezo|resonant.?breath|attention.?squeez.?intent|tbme.?endogenous|bio.?holographic.?phase/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_ENDOGENOUS_PHASE_CONSCIOUS_INTENT_2026-07.md');
  }
  if (/\btbme\b/.test(String(message || '').toLowerCase())) {
    candidates.unshift('docs/SYNTHOBS_PRION_REFOLD_HOLOGRAPHIC_MAGNETIC_PHASE_2026-07.md');
    candidates.unshift('docs/SYNTHOBS_TBME_81_ORBITAL_SINGULARITY_HOLOGRAPHIC_2026-07.md');
    candidates.unshift('docs/SYNTHOBS_TBME_HISTONE_PHASE_LOCK_OPERATOR_2026-07.md');
    candidates.unshift('docs/SYNTHOBS_TBME_PHASE_TOXICITY_RESONANCE_SAFETY_2026-07.md');
    candidates.unshift('docs/SYNTHOBS_TBME_ENDOGENOUS_PHASE_CONSCIOUS_INTENT_2026-07.md');
  }
  if (
    /recursive.?attn|attention.?squeez|magnetic.?shadow|squeezed.?context|s_attn|holographic.?magnetic.?projection/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift(
      'docs/SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md',
    );
  }
  if (i.needsPipes) candidates.push('README.md');
  if (i.needsEdge) candidates.push('apps/lattice-chat/src/components/ComposerOptions.tsx');

  const pinches = [...new Set(candidates)]
    .slice(0, 3)
    .map((p) => readPinch(p, root))
    .filter(Boolean);
  if (!pinches.length) return '';

  const body = pinches.map((p) => `### ${p.path}\n\`\`\`\n${p.text}\n\`\`\``).join('\n\n');
  return `## Seed pack (loaded — prefer over tools)
${body}`;
}

function formatHistory(history, window = HISTORY_WINDOW) {
  const prior = Array.isArray(history) ? history.slice(-window) : [];
  const lines = prior
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content).trim()}`)
    .filter((line) => line.length > 8);
  return lines.length ? `Conversation so far:\n${lines.join('\n\n')}\n\n` : '';
}

/**
 * @param {object} opts
 * @param {string} opts.message
 * @param {Array<{role:string,content:string}>} [opts.history]
 * @param {string} [opts.nestTopology]
 * @param {string} [opts.agentRoster]
 * @param {'full'|'resume'} [opts.mode]
 * @param {string} [opts.root] — repo root for seed pack pinches (bench scripts)
 * @param {string} [opts.closingLine]
 * @param {string} [opts.providerNote] — appended instead of closingLine when set
 * @param {boolean} [opts.omitHistory] — for Claude Messages API (history in messages array)
 * @param {boolean} [opts.omitUserMessage] — system block only (Claude)
 */
export function assembleLatticePrompt({
  message,
  history = [],
  nestTopology = 'goldilocks',
  agentRoster = '',
  mode = 'full',
  root = process.cwd(),
  closingLine = 'Respond as Lattice with a helpful chat reply.',
  providerNote = null,
  omitHistory = false,
  omitUserMessage = false,
}) {
  const intent = classifyAsk(message);
  const nest = normalizeNestTopology(nestTopology);
  const parts = [];

  if (mode === 'full' && nest !== 'none') {
    parts.push(buildPreamble());
  }

  parts.push(buildNestDirective(nest, agentRoster, intent, { resume: mode === 'resume' }));

  if (intent.complex) {
    parts.push(buildEngineReasoning());
  }

  parts.push(buildComplexWorkProtocol(message, intent));

  const seed = buildComplexSeedPack(message, intent, root);
  if (seed) parts.push(seed);

  if (mode === 'full' && !omitHistory) {
    const transcript = formatHistory(history);
    if (transcript) parts.push(transcript);
  }

  if (!omitUserMessage) {
    parts.push(`Latest user message:\n${String(message || '').trim()}`);
  }
  parts.push(providerNote || closingLine);

  return parts.filter(Boolean).join('\n\n');
}

/** Production full-turn prompt (replaces legacy buildPrompt). */
export function buildPrompt(message, history, nestTopology, agentRoster, _reasoningLens) {
  return assembleLatticePrompt({ message, history, nestTopology, agentRoster, mode: 'full' });
}

/** Resume / follow-up turn — no preamble or history. */
export function assembleResumePrompt(message, nestTopology, agentRoster, root = process.cwd()) {
  return assembleLatticePrompt({
    message,
    history: [],
    nestTopology,
    agentRoster,
    mode: 'resume',
    root,
  });
}
