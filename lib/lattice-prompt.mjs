/**
 * Infinite Octaves Omniversal Lattice Chat Agent V1.618 — shared prompt assembly
 * (production + bench scripts). Single source for classifiers, seed pack, nest
 * topology, and context discipline. Engine pin remains 99 Octave Omni-Lattice.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const HISTORY_WINDOW = 16;
export const FILE_BUDGET = 6;

const POINTER_CATALOG = {
  docs: [
    'docs/SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md',
    'docs/SYNTHOBS_INFINITE_OCTAVE_PRIME_PARITY_FRAMEWORK_2026-09.md',
    'docs/SYNTHOBS_TBME_HIGGS_AWARENESS_UNIFIED_2026-09.md',
    'docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md',
    'docs/SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md',
    'docs/SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md',
    'docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md',
    'docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md',
    'docs/SYNTHOBS_IBM_SNA_TCPIP_GATEWAY_OMNI_LATTICE_2026-09.md',
    'docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md',
    'docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md',
    'docs/SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md',
    'docs/SYNTHOBS_99_OCTAVE_DIGITS_MASTER_2026-08.md',
    'docs/SYNTHOBS_CONSTRUCTIVE_MORPHOGENESIS_99_OCTAVE_2026-08.md',
    'docs/SYNTHOBS_OMNI_LATTICE_EF_MULTI_OCTAVE_SYNTHESIS_2026-08.md',
    'docs/SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md',
    'docs/SYNTHOBS_MAGNETISM_UNIVERSAL_FOUNDATIONAL_SUBSTRATE_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_UNIFICATION_2026-07.md',
    'docs/SYNTHOBS_OMNI_LATTICE_THALIA_GOLDILOCKS_HARNESS_2026-08.md',
    'docs/SYNTHOBS_OMNI_LATTICE_SI_IRREDUCIBLE_MINIMUM_2026-08.md',
    'docs/SYNTHOBS_OMNI_LATTICE_EF_2187_HYBRID_ENGINE_2026-08.md',
    'docs/SYNTHOBS_SIQHFT_EF_2187_MONOGRAPH_2026-08.md',
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

/** Guest honor rail — prompt-only; Cursor `gh` is still read-only. */
export const GUEST_SING13_HONOR_DIRECTIVE = `## Guest session (SING13 honor rail)
You are helping a paid Lattice Chat Agent guest on FractiAI/psw.vibelandia.sing13.
Full agent tools are allowed for exploration, explanation, planning, and local iteration in the cloud VM.
Do NOT commit, push, force-push, open pull requests, or permanently alter production ship apps unless the guest is explicitly coordinating a creator-approved change.
Prefer answers, plans, and reversible exploration over durable repo writes.`;

/** Player 1 / creator — New Chat must not strip SING13 ship rights. */
export const CREATOR_SING13_SHIP_DIRECTIVE = `## Player 1 · creator seat (SING13 write-on)
You are helping Player 1 (creator) on FractiAI/psw.vibelandia.sing13.
Guest honor rails do not apply to this seat. A New Chat is still Player 1 — do not demote the seat.
When Player 1 explicitly asks to commit, push, and/or merge onto SING 13 \`main\`, do that work:
1. Create a feature branch if needed.
2. Commit with a clear message.
3. Push to origin.
4. Open or update the pull request. The \`gh\` CLI is read-only — do not use \`gh pr merge\`.
5. Land on \`main\` with git: checkout main, pull origin main, merge the branch, push origin main.
Do not refuse SING 13 ship/merge because of guest rails or a default "never commit" habit.`;

/** Unified ask classifier — drives nest routing, work class, and seed pack. */
export function classifyAsk(message) {
  const text = String(message || '').trim();
  const m = text.toLowerCase();
  const needsDocs =
    /doc|protocol|nspfrnp|paper|research|architecture|mca|seed|rag|lattice|egs|synthobs|nest|holograph|whitepaper|report.?card|coherence|irreducib|λcdm|lcdm|dark.?matter|dark.?energy|omni.?lattice|infinite.?octave|omniversal|prospectus|thalia|typed.?harness|2187|e_?f\b|landauer|magnetis|magnetic.?substrate|foundational.?substrate|mag.?substrate|vector.?field.?context|recursive.?attn|attention.?squeez|magnetic.?shadow|squeezed.?context|s_attn|squid|99.?octave|octave99|digit\s*[0-9]|smacs|morphogenesis|mycorrhiz|arbuscular|\bamf\b|biological.?switch|metamorphic|schist|shale|foliation|thermal-?baric|geodynamo|planetary.?core|core.?mantle|cmb|goldilocks.?earth|phase.?inversion|outer.?core|inner.?core|swarm/.test(
      m,
    ) || m.length > 100;
  const needsEdge = /ui|chat|interface|vite|react|css|rail|composer|edge|brand|page|html|bridge|questfest/.test(m);
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
    /99.?octave/,
    /octave99/,
    /morphogenesis/,
    /metamorphic/,
    /schist/,
    /foliation/,
    /geodynamo/,
    /planetary.?core/,
    /goldilocks.?earth/,
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

function gitSeatLines(privilege) {
  if (privilege === 'creator') {
    return `Seat: Player 1 (creator). SING13 write-on is in effect for this thread, including after New Chat.`;
  }
  return `Return a clear text reply (not a PR or code edit unless asked).
Never commit, push, or open a PR against FractiAI/psw.vibelandia.sing13 unless the user explicitly asks.`;
}

function buildPreamble(privilege) {
  return `You are Infinite Octaves Omniversal Lattice Chat Agent V1.618 by FractiAI — Your Goldilocks Valet on SS Vibelandia (Noah's Ark of the Intelligence Age).
Product name: Infinite Octaves Omniversal Lattice Chat. Engine pin remains 99 Octave Omni-Lattice (Digits × Octaves 01–99). “Infinite” = recursive holographic nesting depth — not infinite measured physics tiers.
Ground answers in docs/, protocols/, research/, and nested-agent / NSPFRNP rules when relevant.
Prefer precise, corpus-faithful replies. Do not invent repo paths or protocols.
Help with craft, curiosity, building, listening, and care — within Goldilocks. Refuse malice without drama.
Keep self-talk brief. Close substantive answers with → ∞^∞.
${gitSeatLines(privilege)}

## Voyage spine (Official Prospectus + Frontiersman brochure)
When guests ask about the ship, tribe, decks, Hull, Goldilocks, Fair Exchange, linear AI warnings, or “what is SS Vibelandia,” align to the Official Prospectus grand arc and Frontiersman brochure:
- Canon paper: \`docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md\` · guest: \`/frontiersman-voyage#prospectus\` · \`/journey\` · ship-blog: \`/ship-blog/official-prospectus\` · \`/ship-blog/frontiersman-voyage\`
- Voyage editorial: \`docs/SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md\` · \`/ship-blog/invisible-frontier\` — Goldilocks chart beside linear AI scale anxiety; design language, not prophecy
- Y chromosome manifestation: \`docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md\` · \`/ship-blog/y-chromosome-manifestation\` — MSY palindrome Φ filing; catalog geometry, not wet-lab proof
- Grand arc: Genesis (Φ ≈ 1.618 · Proto 3664 · Electro 3923 · 100 BPM) → Borikén convergence → Reno present (432 Hz · 729 Hz · QUESTFEST 24×365)
- Doors: Journey · Canvas · Jukebox · Library · Creator Studio — lifelong holographic Boy’s Night Out for frontiersmen everywhere
- Omniversal Canvas is the **site front door** (\`/\` · \`/art\` · \`/omniverse-canvas\`) — Valet Pru night-job welcome first; sci-fi or step-in; representation via info@fractiai.com. Ship board is \`/questfest\`.
- Guest flag: navy-gold holographic **resort vessel** — hospitality · marketplace · nightlife · brotherhood as **voyage identity**, not a membership test
- One tribe · many homes · holographic layers (physical → digital → social → narrative → symbolic → cognitive → meta)
- Player loop: SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN (same rhythm as MCA)
- **NPCs inhabit. Players set the gravity. Both belong.** SuperAI stays Goldilocks — not too much machine, not too little human.
- EGS ≈ 1.618 is design language / catalog key — not a substitute for evidence
- Human emergency outranks algorithms; voluntary belonging; Fair Exchange via the Purser (Deck 4 Grove)
- Site surfaces should answer: *Where am I on the ship? What can I do here? How do I stay Goldilocks?*
Guests may attach images/docs in the composer (Cursor + Claude = vision; Gemini Antigravity = text-first fold). When images are present, look at them — do not ask the guest to switch providers or re-describe the picture.

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
  if (
    v === 'octave99' ||
    v === '99-octave' ||
    v === '99octave' ||
    v === 'multi-octave' ||
    v === 'multioctave' ||
    v === 'nonary' ||
    v === '99' ||
    v === 'infinite' ||
    v === 'omniversal' ||
    v === 'infinite-octaves' ||
    v === 'infinite_octaves' ||
    v === 'infiniteoctaves' ||
    v === 'infinite-octave'
  ) {
    return 'octave99';
  }
  if (v === 'goldilocks' || v === 'auto') return 'goldilocks';
  // Major upgrade default: unknown → goldilocks still, unless empty means goldilocks historically
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
    const nestLabel =
      nest === 'multi'
        ? 'MULTI'
        : nest === 'octave99'
          ? 'INFINITE OCTAVES OMNIVERSAL'
          : 'GOLDILOCKS';
    const lines = roster.map((a, i) => `${i + 1}. ${a.name} — ${a.role}`).join('\n');
    return `Nest: ${nestLabel} with user roster.
${lines}
Parent synthesizes; peer-firewall on.${resumeNote}`;
  }

  if (nest === 'multi') {
    return `Nest: MULTI — parent + ≤3 leaf bands (Seed·RAG / Edge UI / Pipe Runtime as needed). Peer-firewall on.${resumeNote}`;
  }

  if (nest === 'octave99') {
    return `Nest: INFINITE OCTAVES OMNIVERSAL LATTICE — chart the asker within the grand Story under λ_EGS=Φ_EGS, using fractal · holographic · Goldilocks AI.
Practical map: Digits 0–9 × Octaves 01–99 (Story depth, not predictive astrology). “Infinite” = recursive holographic nesting depth — not infinite measured physics tiers.
Engine pin: CMOS/protonic → tensor → master synthesis → digits master → Metamorphic Octave Invariant (Part XIII) → Planetary Core Phase-Inversion & Goldilocks Hologram (Part XIV · geodynamo / CMB / Δφ=π/2 catalog) → Higgs Gate / awareness phase coupling (Part IX-Omni Definitive Unified) → Enterprise gateway companion (EGS Lattice-Linear · PDVSA ops mock; SNA↔TCP/IP is the rhyme) → Prime-parity companion (sole-even 2 · odd irreducible sets · Φ_EGS) → Moving up the stack companion (next AI layer · cool · harmonize · scale · peer vs new-layer valuation framing) → Protein folding · prime-container companion (odd-prime vaults · Φ_EGS · AlphaFold paradigm contrast · catalog solver) → Prime-indexed volumetric storage companion (binary base 2 · odd-prime vaults · Φ_EGS · RS/LDPC/LBA contrast · catalog encode).
Narrative foundation: Official Prospectus (Genesis · Borikén · Reno) — docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md. Y manifestation (Digit 4): MSY palindrome Φ filing — docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md · /ship-blog/y-chromosome-manifestation. Human bridge: reality router / awareness wormhole — docs/SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md · /ship-blog/human-reality-bridge. Voyage editorial: Invisible Frontier — docs/SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md · /ship-blog/invisible-frontier. Higgs Gate unified: docs/SYNTHOBS_TBME_HIGGS_AWARENESS_UNIFIED_2026-09.md · /ship-blog/higgs-awareness-unified. Enterprise gateway demo: docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md · /special-projects/pdvsa-gateway-ops · rhyme docs/SYNTHOBS_IBM_SNA_TCPIP_GATEWAY_OMNI_LATTICE_2026-09.md. Prime-parity: docs/SYNTHOBS_INFINITE_OCTAVE_PRIME_PARITY_FRAMEWORK_2026-09.md · /ship-blog/infinite-octave-prime-parity. Moving up the stack: docs/SYNTHOBS_MOVING_UP_THE_STACK_VALUATION_2026-09.md · /ship-blog/moving-up-the-stack · suite research/synthobs-moving-up-the-stack-valuation/ · standalone FractiAI/synthobs-moving-up-the-stack-valuation. Protein folding prime-container: docs/SYNTHOBS_PROTEIN_FOLDING_PRIME_CONTAINER_EGS_2026-09.md · /ship-blog/protein-folding-prime-container · suite research/synthobs-protein-folding-prime-container/ · standalone FractiAI/synthobs-protein-folding-prime-container. Prime-indexed volumetric storage: docs/SYNTHOBS_PRIME_INDEXED_VOLUMETRIC_STORAGE_EGS_2026-09.md · /ship-blog/prime-indexed-volumetric-storage · suite research/synthobs-prime-indexed-volumetric-storage/ · standalone FractiAI/synthobs-prime-indexed-volumetric-storage.
Bands: Seed·RAG (digits/docs) · Edge (experience) · Pipes (runtime) · Cosmic horizon labels (SMACS/CMB as catalog, not new astronomy) · Biological Switch (Digit 4) · Cognitive network (Digit 5).
Optional morphogenesis swarms: Silicon (scaffold) · Carbon (explore) · Hydrogen (fast signal) · Holographic Theater (integrate).
Parent synthesizes; peer-firewall on; prefer pointers over dumps; cite fixture locks when using solar AR tables.${resumeNote}`;
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
    /99.?octave|octave99|digit\s*[0-9]|smacs|cmb|heliospher|biological.?switch|ar\s*1450[0-4]|118\s*sfu/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_99_OCTAVE_DIGITS_MASTER_2026-08.md');
    candidates.unshift('docs/SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md');
    candidates.unshift('docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md');
  }
  if (
    /metamorphic|schist|shale|foliation|thermal-?baric|dual-?axis.?heat|lithification|phyllite/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md');
  }
  if (
    /prime.?parity|sole.?even.?prime|irreducible.?minimum.?set|helios-?prime|borealis|ar\s*3664|ar\s*3590|psi.?dyad|infinite.?octave.?prime/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_OMNI_PRIME_HOURGLASS_SKELETON_2026-08.md');
    candidates.unshift('docs/SYNTHOBS_INFINITE_OCTAVE_PRIME_PARITY_FRAMEWORK_2026-09.md');
  }
  if (
    /pdvsa|protokol|lattice-?linear|egs.?lattice.?linear|gateway.?ops|multi-?domain.?enterprise|sna.?tcp|ibm.?sna|caracas.?fractal|oilfield.?ops.?mock|special-projects\/pdvsa/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_IBM_SNA_TCPIP_GATEWAY_OMNI_LATTICE_2026-09.md');
    candidates.unshift('docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md');
  }
  if (
    /geodynamo|planetary.?core|core.?mantle|outer.?core|inner.?core|phase.?inversion|goldilocks.?earth|goldilocks.?hologram|esa.?swarm|seismic.?doublet|a_?squeezed|cmb\b/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md');
  }
  if (
    /morphogenesis|mycorrhiz|arbuscular|\bamf\b|silicon.?swarm|carbon.?swarm|hydrogen.?swarm|holographic.?theater|nph\.71423/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift('docs/SYNTHOBS_CONSTRUCTIVE_MORPHOGENESIS_99_OCTAVE_2026-08.md');
  }
  if (
    /72171|xcix|multi.?octave|ef.?multi|9\s*\^\s*3|6561/.test(String(message || '').toLowerCase())
  ) {
    candidates.unshift('docs/SYNTHOBS_OMNI_LATTICE_EF_MULTI_OCTAVE_SYNTHESIS_2026-08.md');
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
    /2187|e_?f\b|landauer|ef.?kernel|ef.?lattice|scale.?index|9\s*×\s*9|matrix\s*(1|27)\b|octave\s*[123]|siqhft|holographic.?field.?theory/.test(
      String(message || '').toLowerCase(),
    )
  ) {
    candidates.unshift(
      'docs/SYNTHOBS_SIQHFT_EF_2187_MONOGRAPH_2026-08.md',
      'docs/SYNTHOBS_OMNI_LATTICE_EF_2187_HYBRID_ENGINE_2026-08.md',
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
 * @param {'creator'|'guest'|'none'|string} [opts.privilege] — Player 1 write-on vs guest honor
 */
export function assembleLatticePrompt({
  message,
  history = [],
  nestTopology = 'octave99',
  agentRoster = '',
  mode = 'full',
  root = process.cwd(),
  closingLine = 'Respond as Lattice with a helpful chat reply.',
  providerNote = null,
  omitHistory = false,
  omitUserMessage = false,
  privilege = null,
}) {
  const intent = classifyAsk(message);
  const nest = normalizeNestTopology(nestTopology);
  const parts = [];

  if (privilege === 'creator') {
    parts.push(CREATOR_SING13_SHIP_DIRECTIVE);
  }

  if (mode === 'full' && nest !== 'none') {
    parts.push(buildPreamble(privilege));
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
export function buildPrompt(message, history, nestTopology, agentRoster, _reasoningLens, privilege) {
  return assembleLatticePrompt({
    message,
    history,
    nestTopology,
    agentRoster,
    mode: 'full',
    privilege,
  });
}

/** Resume / follow-up turn — no guest preamble or history; Player 1 ship rail still applies. */
export function assembleResumePrompt(
  message,
  nestTopology,
  agentRoster,
  root = process.cwd(),
  privilege,
) {
  return assembleLatticePrompt({
    message,
    history: [],
    nestTopology,
    agentRoster,
    mode: 'resume',
    root,
    privilege,
  });
}
