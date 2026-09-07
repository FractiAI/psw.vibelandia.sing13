/**
 * Prime Vault Chat Engine — closed-form LLM-sim · Φ-recursive prime-container agent.
 * Layer A: corpus encode (Seed) · Layer B: speech-act planner (Edge).
 * Knowledge cell bank · multi-turn history · $0 training · deterministic.
 * Application companion, not engine pin — not open-world trained-LLM parity.
 */

import {
  loadDefaultCorpusBank,
  mergeCellBanks,
} from './prime-vault-corpus-encode.mjs';

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

/** Seed layer — prospectus auto-filed into prime vaults (v0). */
export const CORPUS_BANK = loadDefaultCorpusBank();

/**
 * Prime-indexed knowledge cell bank — demo domain only.
 * Each cell is an irreducible vault the speech-act planner can speak from.
 */
export const KNOWLEDGE_CELLS = Object.freeze({
  'El Gran Sol': {
    primeIndex: 0,
    tags: ['phi', 'origin', 'naming'],
    gist: 'El Gran Sol is the naming origin of Φ_EGS — the fractal scalar that keys every vault downstream.',
    speak:
      'El Gran Sol is how we name the origin of Φ on this edge. Think of it as the story seed for the golden key — not a substitute for ħ, c, or G.',
  },
  'Fractal constant': {
    primeIndex: 1,
    tags: ['phi', 'math', 'scale'],
    gist: 'Φ = (1+√5)/2 ≈ 1.618033988749895 is the closed-form scale operator for this edge agent.',
    speak:
      'Φ ≈ 1.618 is my closed-form scale key. Every reply I give folds Φ-recursive resonance across prime vaults — no gradient descent, no token lottery.',
  },
  'Prime container': {
    primeIndex: 2,
    tags: ['vault', 'algebra', 'prime'],
    gist: 'Odd primes (≥3) act as irreducible semantic containers; binary 2 is the structural base.',
    speak:
      'I store meaning in prime-indexed containers. Odd primes hold irreducible ideas; binary 2 is the structural base. That is how I stay phase-isolated under Φ.',
  },
  'Omniversal lattice': {
    primeIndex: 3,
    tags: ['lattice', 'story', 'map'],
    gist: 'The Omniversal Lattice is the Story map — Digits × Octaves — recursive holographic nesting, not infinite measured physics tiers.',
    speak:
      'The Omniversal Lattice is a Story map: Digits 0–9 × Octaves 01–99. Guests meet it as Infinite Octaves — nesting depth under Φ, not a claim of infinite measured physics tiers.',
  },
  'Zero balance': {
    primeIndex: 4,
    tags: ['void', 'null', 'filter'],
    gist: 'Zero is a dynamic equilibrium node — null-space that cancels cross-talk between vaults.',
    speak:
      'When resonance falls below the harmonic filter, that vault stays quiet. Silence is part of the design: I refuse noise instead of inventing weights.',
  },
  'Proton space': {
    primeIndex: 5,
    tags: ['duality', 'structure'],
    gist: 'Proton Space is the leading-1 structural lane in the duality filing — stability before theater.',
    speak:
      'In catalog grammar, Proton Space is the leading-1 lane — stability before theater. Filing language for duality, not a wet-lab claim about nuclei.',
  },
  'Electron theater': {
    primeIndex: 6,
    tags: ['duality', 'expression'],
    gist: 'Electron Theater is the expressive/structural-2 lane — motion around the protonic scaffold.',
    speak:
      'Electron Theater is the expressive lane — motion around the protonic scaffold. I surface it when the ask is about expression, dynamics, or dual roles.',
  },
  'Macro-protein work engine': {
    primeIndex: 7,
    tags: ['protein', 'application', 'theta'],
    gist: 'Macro-protein work is an application companion: organismal θ_bio bands and Φ-indexed work, not an engine pin.',
    speak:
      'Macro-protein work is an application companion — θ_bio bands and Φ-indexed work — not an engine pin. For fold questions, pair it with the Race scoreboard honesty rails.',
  },
  'Holographic summation': {
    primeIndex: 8,
    tags: ['holograph', 'cross-scale'],
    gist: 'xD ± yD holographic summation mixes octave tiers without neural weights.',
    speak:
      'I answer multi-part asks by summing cross-scale amplitudes, ranking vaults, and speaking the top resonance in plain language — holographic rhyme without neural weights.',
  },
  'Deterministic resonance': {
    primeIndex: 9,
    tags: ['llm-contrast', 'miracle', 'cost'],
    gist: 'Same input + same octave + same history phase → same vault ranking. Reproducible edge intelligence.',
    speak:
      'Same question, same octave, same thread phase → same geometry. Training cost is $0.00. Latency is algebraic milliseconds. That is Miracle 2 guests can feel.',
  },
  'Infinite octave': {
    primeIndex: 10,
    tags: ['octave', 'nesting', 'brand'],
    gist: 'Infinite = recursive nesting depth of the Story under Φ — not infinite measured tiers.',
    speak:
      '“Infinite” here means recursive holographic nesting depth under Φ — the guest product face is Infinite Octaves. The lab engine pin stays 99 Octave Omni-Lattice.',
  },
  'Guest brand Infinite Octaves': {
    primeIndex: 11,
    tags: ['brand', 'product', 'guest'],
    gist: 'Guest-facing product name is Infinite Octaves; 99 Octave Omni-Lattice is the engine pin, not the guest brand.',
    speak:
      'If you are a guest, the product you meet is Infinite Octaves — chat, chart, bridge. The 99 Octave Omni-Lattice is the lab filing map underneath, not the name on the door.',
  },
  'Prime Vault Race': {
    primeIndex: 12,
    tags: ['race', 'miracle1', 'scoreboard'],
    gist: 'Miracle 1 publishes measured Prime-Vault vs ColabFold latency on a results-only scoreboard.',
    speak:
      'Miracle 1 is the Race scoreboard: closed-form vault timings against measured ColabFold runs. It is results-only — no live Play button inventing medals.',
  },
  'Unmodeled Nova': {
    primeIndex: 13,
    tags: ['race', 'tier4', 'deferred'],
    gist: 'Tier 4 Unmodeled Nova has live vault timing; ColabFold is deferred until a real measured run — no invented pLDDT.',
    speak:
      'Unmodeled Nova (Tier 4) already has a live vault timing on the scoreboard. ColabFold for that tier stays deferred until a real measured run — I will not invent pLDDT or CASP medals.',
  },
  'LLM contrast': {
    primeIndex: 14,
    tags: ['llm-contrast', 'training', 'weights'],
    gist: 'Cloud LLMs sample next tokens from trained weights; this agent ranks Φ-resonance over a knowledge cell bank.',
    speak:
      'A cloud LLM guesses the next token from trained weights. I do not. I map your words into a knowledge cell bank and answer from Φ-recursive resonance — chat-shaped, $0 training, domain-bounded.',
  },
  'Closed-form LLM-sim': {
    primeIndex: 15,
    tags: ['llm-sim', 'miracle2', 'agent', 'language-processor'],
    gist: 'Miracle 2 is a domain-bounded closed-form language processor: sense→retrieve→plan→fold articulate over prime vaults — not BYOK to Claude/GPT.',
    speak:
      'I process language in a closed-form fold: sense your words, retrieve prime vaults, plan a speech act, articulate by contacting residue atoms — like folding a protein chain of knowledge. Still $0 training; not an open-world trained LLM.',
  },
  'Multi-turn memory': {
    primeIndex: 16,
    tags: ['history', 'thread', 'context'],
    gist: 'Recent thread turns hash into Φ phase so follow-ups stay coherent without storing neural weights.',
    speak:
      'I remember this conversation as a compact thread phase — recent turns fold into the Φ resonance so follow-ups stay coherent. No weight file grows when you chat.',
  },
  'Fair Exchange': {
    primeIndex: 17,
    tags: ['protocol', 'honor', 'balance'],
    gist: 'Fair Exchange keeps reciprocal balancing on collaborative rails — honor without locking guests out of the demo.',
    speak:
      'Fair Exchange is on: reciprocal balancing and honor rails for the voyage. Walk-on demo seats can still chat — creator seats keep elevated privilege.',
  },
  'Voyage framing': {
    primeIndex: 18,
    tags: ['voyage', 'ship', 'guest'],
    gist: 'SS Vibelandia QUESTFEST is a voyage — Seed:Edge, guests aboard, demonstrations as doors.',
    speak:
      'You are on the SS Vibelandia voyage. Demonstrations is the direct door: live chat and the Race scoreboard share one hub. Ask like a guest, not like a lab notebook.',
  },
  'Domain boundary': {
    primeIndex: 19,
    tags: ['ood', 'honesty', 'refusal'],
    gist: 'Out-of-domain asks get an honest refusal — protein-library encode + fold ≠ open-world factual QA.',
    speak:
      'I am strong on the filed protein library: Official Prospectus voyage, Infinite Octaves, holographic/magnetic/Goldilocks catalog, 99 Octave / prime vaults, Higgs/human-bridge companions, and how I differ from trained LLMs. Medicine, law, weather, and trivia outside those vaults — I will say so instead of inventing.',
  },
});

/** @deprecated Prefer KNOWLEDGE_CELLS — kept for registry/suite compatibility. */
export const CONCEPT_CARDS = KNOWLEDGE_CELLS;

/** Hand cells + corpus encode (Layer A ∪ Layer B substrate). */
export const MERGED_CELLS = Object.freeze(
  mergeCellBanks(KNOWLEDGE_CELLS, CORPUS_BANK.cells || {}),
);

export const DEFAULT_VOCABULARY = Object.freeze(Object.keys(MERGED_CELLS));

const INTENT_HINTS = Object.freeze([
  { re: /\b(hello|hi|hey|greetings|hola|good (morning|afternoon|evening))\b/i, kind: 'greeting', cells: ['Voyage framing', 'Closed-form LLM-sim'] },
  {
    re: /\b(tell me about (you|yourself)|who are you|what are you|about you|your name|introduce yourself|what can you do)\b/i,
    kind: 'about',
    cells: ['Closed-form LLM-sim', 'Deterministic resonance', 'Omniversal lattice'],
  },
  { re: /\b(phi|φ|Φ|egs|golden|fractal|1\.618|el gran sol)\b/i, kind: 'phi', cells: ['Fractal constant', 'El Gran Sol'] },
  { re: /\b(prime|vault|container|algebra|closed-?form|knowledge cell|corpus encode)\b/i, kind: 'vault', cells: ['Prime container', 'Closed-form LLM-sim'] },
  {
    re: /\b(lattice|omni|octave|holograph|story|infinite octaves?|guest brand|99 octave)\b/i,
    kind: 'lattice',
    cells: ['Omniversal lattice', 'Infinite octave', 'Guest brand Infinite Octaves', 'Holographic summation'],
  },
  {
    re: /\b(protein|fold|alphafold|colabfold|race|nova|scoreboard|tier\s*4|unmodeled)\b/i,
    kind: 'protein',
    cells: ['Prime Vault Race', 'Unmodeled Nova', 'Macro-protein work engine'],
  },
  { re: /\b(proton|electron|zero|void|balance|null|duality)\b/i, kind: 'duality', cells: ['Proton space', 'Electron theater', 'Zero balance'] },
  {
    re: /\b(llm|gpt|chatgpt|train(?:ing|ed)?|gpu|token|miracle|cost|latency|fast|speed|weights|claude|gemini|byok)\b/i,
    kind: 'contrast',
    cells: ['LLM contrast', 'Deterministic resonance', 'Closed-form LLM-sim'],
  },
  {
    re: /\b(prospectus|borik[eé]n|puerto\s*rico|reno|genesis|grand arc|brochure|voyage|captain'?s?\s*seat|proto|electro|432\s*hz|729|columbus|frontiersman|ss vibelandia|narrative foundation|goldilocks|magneti[sc]|holographic magnetic|higgs|digits master|prime parity|volumetric|protein fold|nested agent|invisible frontier|reality bridge|thalia|geodynamo|super.?ai)\b/i,
    kind: 'corpus',
    cells: [],
  },
  { re: /\b(remember|earlier|before|you said|follow[- ]?up|again|still|more about (that|it|this)|this thread|our conversation|you mentioned)\b/i, kind: 'followup', cells: ['Multi-turn memory'] },
  { re: /\b(fair exchange|honor|seat|walk[- ]?on|privilege)\b/i, kind: 'protocol', cells: ['Fair Exchange', 'Voyage framing'] },
  {
    re: /\b(weather|stock|crypto|diagnose|prescription|lawsuit|lawyer|medical|symptom|password|hack)\b/i,
    kind: 'ood',
    cells: ['Domain boundary'],
  },
  { re: /\b(how|what|why|explain|who|where|when|can you)\b/i, kind: 'explain', cells: [] },
]);

const MAX_HISTORY = 12;

export function generateSemanticPrimes(n) {
  const primes = [2];
  let candidate = 3;
  while (primes.length < n) {
    let isPrime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

/**
 * Compact thread into a Φ-phase integer (deterministic, no weight growth).
 * @param {Array<{role?: string, content?: string}>} history
 */
export function hashThreadPhase(history) {
  if (!Array.isArray(history) || !history.length) return 0;
  const slice = history.slice(-MAX_HISTORY);
  let acc = 0;
  for (let i = 0; i < slice.length; i++) {
    const turn = slice[i] || {};
    const role = String(turn.role || '') === 'assistant' ? 3 : 1;
    const text = String(turn.content || '').toLowerCase();
    for (let j = 0; j < text.length; j++) {
      acc = (acc + text.charCodeAt(j) * (j + 1) * role * (i + 1)) % 10_007;
    }
  }
  return acc;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY)
    .map((t) => ({
      role: String(t?.role || 'user') === 'assistant' ? 'assistant' : 'user',
      content: String(t?.content || '').slice(0, 2000),
    }))
    .filter((t) => t.content.trim());
}

function detectKinds(text, history, vocabulary, cellBank) {
  const kinds = new Set();
  const boost = new Map();
  const corpus = [text, ...history.slice(-4).map((h) => h.content)].join('\n');
  const lower = text.toLowerCase();

  for (const hint of INTENT_HINTS) {
    if (hint.re.test(text) || (hint.kind === 'followup' && history.length > 0 && hint.re.test(corpus))) {
      kinds.add(hint.kind);
      for (const c of hint.cells) boost.set(c, (boost.get(c) || 0) + 1);
    }
  }

  for (const concept of vocabulary) {
    const keys = concept
      .toLowerCase()
      .replace(/^corpus · /, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hit = keys.some((k) => lower.includes(k));
    if (hit) {
      boost.set(concept, (boost.get(concept) || 0) + 1.5);
      kinds.add('explain');
      if (cellBank[concept]?.corpus) kinds.add('corpus');
    }
    const speak = String(cellBank[concept]?.speak || '').toLowerCase();
    if (cellBank[concept]?.corpus && speak) {
      const tokens = lower.split(/\W+/).filter((t) => t.length > 4);
      let overlap = 0;
      for (const t of tokens) {
        if (speak.includes(t)) overlap += 1;
      }
      if (overlap >= 2) {
        boost.set(concept, (boost.get(concept) || 0) + overlap * 0.6);
        kinds.add('corpus');
      }
    }
  }

  if (kinds.has('corpus')) {
    const qTokens = lower.split(/\W+/).filter((t) => t.length > 3);
    for (const concept of vocabulary) {
      if (!cellBank[concept]?.corpus) continue;
      let extra = 1.2;
      const meta = String(cellBank[concept].metaProtein || '').toLowerCase();
      const tags = (cellBank[concept].tags || []).join(' ').toLowerCase();
      const docId = String(cellBank[concept].docId || '').toLowerCase();
      const hay = `${meta} ${tags} ${docId} ${concept.toLowerCase()}`;
      for (const t of qTokens) {
        if (hay.includes(t)) extra += 1.1;
      }
      boost.set(concept, (boost.get(concept) || 0) + extra);
    }
  }

  if (history.length >= 2 && !kinds.has('greeting')) {
    kinds.add('continuing');
    boost.set('Multi-turn memory', (boost.get('Multi-turn memory') || 0) + 0.8);
  }

  return { kinds, boost };
}

function speechAct(kinds, text, history) {
  if (kinds.has('ood')) return 'refuse';
  if (kinds.has('about')) return 'introduce';
  if (kinds.has('greeting') && text.length < 56 && history.length < 2) return 'greet';
  if (kinds.has('contrast')) return 'contrast';
  if (kinds.has('protein')) return 'race';
  if (kinds.has('corpus')) return 'corpus';
  if (kinds.has('followup') || kinds.has('continuing')) return 'continue';
  if (kinds.has('phi') || kinds.has('vault') || kinds.has('lattice') || kinds.has('duality') || kinds.has('protocol')) {
    return 'teach';
  }
  if (kinds.has('explain')) return 'explain';
  return 'invite';
}

function cellSpeak(name, cellBank) {
  const cell = cellBank[name];
  return cell?.speak || cell?.gist || '';
}

function footerLine(top, octaveTier, latencyMs, act, foldContacts = 0) {
  const clock = latencyMs < 1 ? latencyMs.toFixed(3) : latencyMs.toFixed(2);
  const lead = top[0] ? top[0].concept : 'steady';
  return `_Edge note: ${clock} ms · octave ${octaveTier} · act ${act} · fold ${foldContacts} · Φ ≈ 1.618 · $0 training · tuned on ${lead}._`;
}

/** Residue atoms from a cell (protein-chain analog). */
export function cellAtoms(cell) {
  if (!cell) return [];
  if (Array.isArray(cell.atoms) && cell.atoms.length) return cell.atoms.map(String);
  const raw = String(cell.speak || cell.gist || '');
  const parts = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20);
  return parts.length ? parts.slice(0, 6) : raw ? [raw] : [];
}

function tokenSet(s) {
  return new Set(
    String(s || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 3),
  );
}

/** Pick contact residues: score atoms vs query; Φ-phase tie-break. */
function pickFoldContacts(text, top, cellBank, threadPhase, maxContacts = 3) {
  const q = tokenSet(text);
  const contacts = [];
  for (const node of top) {
    const cell = cellBank[node.concept];
    const atoms = cellAtoms(cell);
    if (!atoms.length) continue;
    let best = { atom: atoms[0], score: -1, idx: 0 };
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      const at = tokenSet(a);
      let score = 0;
      for (const t of q) if (at.has(t)) score += 1;
      score += 0.01 * Math.cos(((threadPhase + i) * (node.primeVault || 3)) / PHI_EGS);
      if (score > best.score) best = { atom: a, score, idx: i };
    }
    contacts.push({
      concept: node.concept,
      atom: best.atom.slice(0, 320),
      residueIndex: best.idx,
      metaProtein: cell?.metaProtein || (cell?.corpus ? 'voyage-meta' : 'demo-meta'),
      corpus: Boolean(cell?.corpus),
      score: Number(best.score.toFixed(3)),
    });
    if (contacts.length >= maxContacts) break;
  }
  return contacts;
}

function shortAskEcho(text) {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length < 12 || t.length > 90) return '';
  if (/^(hi|hey|hello|hola)\b/i.test(t)) return '';
  return t.replace(/\?+$/, '').trim();
}

/**
 * Fold articulate — compose answer from residue contacts (anti-parrot).
 * Catalog rhyme to protein fold / brain speech plan — not wet-lab or open-world LLM.
 */
function articulateFold({ text, top, octaveTier, latencyMs, kinds, history, act, cellBank, threadPhase }) {
  const contacts = pickFoldContacts(text, top, cellBank, threadPhase, 3);
  const parts = [];
  const priorUser = [...history].reverse().find((h) => h.role === 'user');
  const echo = shortAskEcho(text);
  const leadAtom = contacts[0]?.atom;
  const secondAtom = contacts[1]?.atom;
  const thirdAtom = contacts[2]?.atom;
  const metas = [...new Set(contacts.map((c) => c.metaProtein).filter(Boolean))];

  if (act === 'refuse') {
    parts.push(cellSpeak('Domain boundary', cellBank));
    parts.push(
      'Steer back to Φ, the prospectus voyage (Borikén · Reno · genesis), Infinite Octaves, vaults, or the Race — those folds are filed.',
    );
  } else if (act === 'introduce') {
    parts.push("I'm the live **Prime Vault Chat** agent — a domain-bounded closed-form language processor on Demonstrations.");
    parts.push(
      'Flow: sense → retrieve → plan → fold. Knowledge is a recursive protein library (grand narrative → holographic/magnetic/Goldilocks → Infinite Octaves → prime vaults → downstream). Encode is filing, not LLM training — $0, no weight updates.',
    );
    if (leadAtom) parts.push(leadAtom);
  } else if (act === 'greet') {
    parts.push('Hey — welcome aboard. I am listening.');
    if (leadAtom) parts.push(leadAtom);
    parts.push('Ask about the voyage arc, Φ, vaults, or the Race.');
  } else if (act === 'contrast') {
    parts.push(
      'A trained LLM samples next tokens from weights. I fold filed vault atoms under Φ — retrieval plus closed-form compose, not gradient training.',
    );
    if (leadAtom) parts.push(leadAtom);
    parts.push(cellSpeak('Domain boundary', cellBank));
  } else if (act === 'race') {
    parts.push(
      echo
        ? `On your Race ask — I fold scoreboard honesty, not invented CASP medals.`
        : 'On the protein / Race lane — published scoreboard honesty only.',
    );
    if (leadAtom) parts.push(leadAtom);
    if (secondAtom) parts.push(secondAtom);
    parts.push('Open Demonstrations → Race for measured numbers; I will not invent live fold medals here.');
  } else if (act === 'corpus') {
    if (echo) parts.push(`You asked about ${echo} — here is the folded voyage filing:`);
    if (leadAtom) parts.push(leadAtom);
    if (secondAtom && secondAtom !== leadAtom) parts.push(secondAtom);
    if (thirdAtom && thirdAtom !== secondAtom) parts.push(thirdAtom);
    parts.push(
      `Meta-protein fold: ${metas.join(' · ') || 'voyage-meta'} · Official Prospectus corpus (catalog narrative, not prophecy).`,
    );
  } else if (act === 'continue') {
    parts.push(
      priorUser
        ? 'Still in this thread — folding the next contact from what we already touched.'
        : 'Still with you — folding the next contact.',
    );
    if (leadAtom) parts.push(leadAtom);
    if (secondAtom) parts.push(secondAtom);
  } else if (act === 'teach' || act === 'explain') {
    if (echo) parts.push(`Folding an answer around: ${echo}.`);
    if (leadAtom) parts.push(leadAtom);
    else parts.push('Ask about Φ, prospectus voyage, vaults, Infinite Octaves, or the Race.');
    if (secondAtom && secondAtom !== leadAtom) parts.push(secondAtom);
    if (thirdAtom && parts.length < 4) parts.push(thirdAtom);
  } else {
    parts.push("I'm with you — say what to fold: prospectus arc, Φ, vaults, Race, or curiosity.");
    if (leadAtom) parts.push(leadAtom);
  }

  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    const key = String(p || '')
      .trim()
      .toLowerCase()
      .slice(0, 96);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(String(p).trim());
  }
  unique.push(footerLine(top, octaveTier, latencyMs, act, contacts.length));

  return {
    reply: unique.join('\n\n'),
    contacts,
    metaProteins: metas,
    composed: true,
    parrot: false,
  };
}

/**
 * @param {{ octaveTier?: number, vocabulary?: string[], cellBank?: Record<string, object>, includeCorpus?: boolean }} [opts]
 */
export function createPrimeVaultChatEngine(opts = {}) {
  const octaveTier = Math.max(1, Math.min(15, Number(opts.octaveTier) || 7));
  const includeCorpus = opts.includeCorpus !== false;
  const cellBank = opts.cellBank
    ? { ...opts.cellBank }
    : includeCorpus
      ? { ...MERGED_CELLS }
      : { ...KNOWLEDGE_CELLS };
  // Ensure hand cells expose atoms for fold compose
  for (const name of Object.keys(cellBank)) {
    const c = cellBank[name];
    if (!c.atoms) {
      cellBank[name] = {
        ...c,
        atoms: cellAtoms(c),
        metaProtein: c.metaProtein || (c.corpus ? 'voyage-meta' : 'demo-meta'),
      };
    }
  }
  const vocabulary = opts.vocabulary?.length
    ? [...opts.vocabulary]
    : Object.keys(cellBank);
  const primeVaults = generateSemanticPrimes(vocabulary.length);

  /**
   * Closed-form language processor pipeline:
   * sense → retrieve → plan → articulate (protein-fold compose).
   * @param {string} userInput
   * @param {{ history?: Array<{role?: string, content?: string}> }} [queryOpts]
   */
  function queryLattice(userInput, queryOpts = {}) {
    const t0 = performance.now();
    const text = String(userInput || '').trim();
    const history = normalizeHistory(queryOpts.history);

    // 1 · Sense
    const inputLength = Math.max(1, text.length);
    const threadPhase = hashThreadPhase([...history, { role: 'user', content: text }]);
    const sense = { inputLength, threadPhase, historyTurns: history.length };

    // 2 · Retrieve (+ intent boosts)
    const { kinds, boost } = detectKinds(text, history, vocabulary, cellBank);
    let act = speechAct(kinds, text, history);

    const responseNodes = [];
    for (let i = 0; i < vocabulary.length; i++) {
      const concept = vocabulary[i];
      const pk = primeVaults[i];
      let resonance =
        PHI_EGS ** octaveTier / (pk * Math.log(pk)) * Math.cos((inputLength * pk) / PHI_EGS);
      const b = boost.get(concept) || 0;
      if (b) resonance *= 1 + b / PHI_EGS;
      const phase =
        ([...text.toLowerCase()].reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0) +
          threadPhase) %
        97;
      resonance *= 1 + 0.02 * Math.cos((phase * pk) / PHI_EGS);
      if (act === 'refuse' && concept === 'Domain boundary') resonance *= 1.8;
      if (act === 'contrast' && /LLM|Deterministic|Closed-form/.test(concept)) resonance *= 1.35;
      if (act === 'race' && /Race|Nova|Macro-protein/.test(concept)) resonance *= 1.35;
      if (act === 'corpus' && cellBank[concept]?.corpus) resonance *= 2.2;
      const amplitude = Math.abs(resonance);
      if (amplitude > 0.01) {
        responseNodes.push({
          concept,
          primeVault: pk,
          amplitude: Number(amplitude.toFixed(4)),
          corpus: Boolean(cellBank[concept]?.corpus),
        });
      }
    }

    responseNodes.sort((a, b) => b.amplitude - a.amplitude);
    let ranked = responseNodes;
    if (kinds.has('corpus') || act === 'corpus') {
      const qTokens = text
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 3);
      const scoreMeta = (n) => {
        const cell = cellBank[n.concept];
        if (!cell?.corpus) return 0;
        const hay = `${cell.metaProtein || ''} ${(cell.tags || []).join(' ')} ${cell.docId || ''} ${n.concept}`.toLowerCase();
        return qTokens.reduce((s, t) => s + (hay.includes(t) ? 2 : 0), 0);
      };
      ranked = [...responseNodes].sort((a, b) => {
        const d = scoreMeta(b) - scoreMeta(a);
        if (d !== 0) return d;
        return b.amplitude - a.amplitude;
      });
      const corp = ranked.filter((n) => n.corpus);
      const rest = ranked.filter((n) => !n.corpus);
      if (corp.length) ranked = [...corp, ...rest];
    }
    if (act === 'race') {
      const raceish = ranked.filter((n) =>
        /Race|Nova|Macro-protein|protein-folding|protein fold|unmodeled/i.test(n.concept),
      );
      const rest = ranked.filter(
        (n) => !/Race|Nova|Macro-protein|protein-folding|protein fold|unmodeled/i.test(n.concept),
      );
      if (raceish.length) ranked = [...raceish, ...rest];
    }
    const top = ranked.slice(0, 3);

    // 3 · Plan
    if (top[0]?.corpus && act !== 'refuse' && act !== 'about' && act !== 'greet' && act !== 'contrast' && act !== 'race') {
      act = 'corpus';
    }
    const plan = { speechAct: act, kinds: [...kinds], topConcepts: top.map((n) => n.concept) };

    // 4 · Articulate (fold)
    const latencyMs = performance.now() - t0;
    const folded = articulateFold({
      text,
      top,
      octaveTier,
      latencyMs,
      kinds,
      history,
      act,
      cellBank,
      threadPhase,
    });

    // Anti-parrot: if we somehow echoed a full speak blob alone, force a fold hitch
    let reply = folded.reply;
    const leadSpeak = top[0] ? cellSpeak(top[0].concept, cellBank) : '';
    if (leadSpeak && reply.trim() === leadSpeak.trim()) {
      reply = `${folded.contacts[0]?.atom || leadSpeak}\n\nFolded under Φ from vault contacts — not a raw script dump.\n\n${footerLine(top, octaveTier, latencyMs, act, folded.contacts.length)}`;
      folded.parrot = false;
      folded.composed = true;
    }

    return {
      reply,
      nodes: top,
      octaveTier,
      phiEgs: PHI_EGS,
      latencyMs,
      trainingCostUsd: 0,
      engine: 'prime-vault-chat',
      live: true,
      llmSim: true,
      languageProcessor: true,
      languageProcessorKind: 'closed-form-fold',
      corpusEncode: true,
      corpusCells: CORPUS_BANK.nCells || 0,
      proteinLibraryDocs: CORPUS_BANK.nDocs || CORPUS_BANK.sources?.length || 0,
      proteinMetaFolds: CORPUS_BANK.metaProteins || [],
      speechAct: act,
      threadPhase,
      historyTurns: history.length,
      knowledgeCells: vocabulary.length,
      kinds: [...kinds],
      contacts: folded.contacts,
      metaProteins: folded.metaProteins,
      composed: folded.composed,
      stages: {
        sense,
        retrieve: { nNodes: responseNodes.length, top: plan.topConcepts },
        plan,
        articulate: {
          foldContacts: folded.contacts.length,
          metaProteins: folded.metaProteins,
          composed: true,
        },
      },
      honesty:
        'Domain-bounded closed-form language processor over a recursive protein library (whitepaper encode ≠ LLM training: no gradients, $0). sense→retrieve→plan→fold. Catalog rhyme ≠ wet-lab; not open-world QA; application companion, not engine pin.',
    };
  }

  return {
    octaveTier,
    vocabulary,
    primeVaults,
    knowledgeCells: cellBank,
    corpusCells: CORPUS_BANK.nCells || 0,
    proteinLibraryDocs: CORPUS_BANK.nDocs || 0,
    languageProcessor: true,
    queryLattice,
  };
}

/**
 * @param {string} userInput
 * @param {{ octaveTier?: number, vocabulary?: string[], history?: Array<{role?: string, content?: string}>, includeCorpus?: boolean, cellBank?: Record<string, object> }} [opts]
 */
export function queryPrimeVaultChat(userInput, opts = {}) {
  const { history, ...engineOpts } = opts;
  return createPrimeVaultChatEngine(engineOpts).queryLattice(userInput, { history });
}
