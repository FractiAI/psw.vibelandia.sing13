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

/** Tokens that must never drive vault matching (leaky substring / boilerplate). */
const STOPWORDS = new Set([
  'what',
  'when',
  'where',
  'which',
  'who',
  'whom',
  'whose',
  'why',
  'how',
  'this',
  'that',
  'these',
  'those',
  'with',
  'from',
  'your',
  'you',
  'about',
  'into',
  'onto',
  'over',
  'under',
  'than',
  'then',
  'them',
  'they',
  'their',
  'there',
  'here',
  'have',
  'has',
  'had',
  'having',
  'been',
  'being',
  'were',
  'was',
  'are',
  'is',
  'am',
  'will',
  'would',
  'could',
  'should',
  'can',
  'cant',
  'does',
  'did',
  'doing',
  'done',
  'just',
  'only',
  'also',
  'very',
  'much',
  'many',
  'more',
  'most',
  'some',
  'such',
  'each',
  'both',
  'other',
  'another',
  'same',
  'like',
  'tell',
  'please',
  'thanks',
  'thank',
  'hello',
  'hey',
  'hi',
  'hola',
  'good',
  'morning',
  'afternoon',
  'evening',
  'read',
  'first',
  'part',
  'section',
  'document',
  'abstract',
  'summary',
  'honesty',
  'boundary',
  'lead',
  'tier',
  'tiers',
  'category',
  'scope',
  'disclaimer',
  'content',
  'active',
  'region',
  'theorem',
  'corpus',
  'explain',
  'define',
  'meaning',
  'means',
  'want',
  'need',
  'know',
  'help',
  'make',
  'recipe',
  'bread',
  'capital',
  'france',
  'weather',
  'stock',
]);

/** Short domain tokens allowed despite STOPWORDS / length filters. */
const DOMAIN_KEEP = new Set([
  'phi',
  'egs',
  'llm',
  'gpt',
  'ai',
  'dna',
  'rna',
  'msy',
  'cmb',
  'sna',
  'tcp',
  'rs',
  'ldpc',
]);

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

/** Query tokens that may drive vault / atom matching. */
export function queryTokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => {
      if (!t) return false;
      if (DOMAIN_KEEP.has(t)) return true;
      if (STOPWORDS.has(t)) return false;
      if (/^\d+(\.\d+)?$/.test(t) && t !== '1.618') return t.length >= 3;
      return t.length >= 4;
    });
}

function hasWord(hay, token) {
  if (!token) return false;
  const t = String(token).toLowerCase();
  if (DOMAIN_KEEP.has(t) || t.length <= 3) {
    return new RegExp(`(?:^|[^a-z0-9])${escapeRe(t)}(?:[^a-z0-9]|$)`, 'i').test(hay);
  }
  return new RegExp(`\\b${escapeRe(t)}\\b`, 'i').test(hay);
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cellHaystack(concept, cell) {
  const tags = (cell?.tags || []).join(' ');
  return [
    concept,
    cell?.gist || '',
    cell?.speak || '',
    cell?.metaProtein || '',
    tags,
    cell?.docId || '',
    ...(Array.isArray(cell?.atoms) ? cell.atoms.slice(0, 4) : []),
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Lexical retrieve score for one vault cell vs query tokens.
 * Word-boundary only — no substring traps (bread⊃read, what⊃What…).
 */
function lexicalScore(concept, cell, qTokens) {
  if (!qTokens.length) return 0;
  const title = String(concept || '')
    .toLowerCase()
    .replace(/^corpus · /, '');
  const hay = cellHaystack(concept, cell);
  let score = 0;
  for (const t of qTokens) {
    if (hasWord(title, t)) score += 3.2;
    else if (hasWord(hay, t)) score += 1.1;
  }
  // Multi-token title hits get a small bonus for precision
  const titleHits = qTokens.filter((t) => hasWord(title, t)).length;
  if (titleHits >= 2) score += 1.5;
  return score;
}

function detectKinds(text, history, vocabulary, cellBank) {
  const kinds = new Set();
  const boost = new Map();
  const lexical = new Map();
  const corpusBlob = [text, ...history.slice(-4).map((h) => h.content)].join('\n');
  const qTokens = queryTokens(text);

  for (const hint of INTENT_HINTS) {
    if (hint.re.test(text) || (hint.kind === 'followup' && history.length > 0 && hint.re.test(corpusBlob))) {
      kinds.add(hint.kind);
      for (const c of hint.cells) {
        boost.set(c, (boost.get(c) || 0) + 2.4);
        // Intent-pinned cells must outrank weak single-token corpus title hits
        lexical.set(c, Math.max(lexical.get(c) || 0, 5.5));
      }
    }
  }

  let bestCorpusLex = 0;
  let bestAnyLex = 0;

  for (const concept of vocabulary) {
    const cell = cellBank[concept];
    let lex = lexicalScore(concept, cell, qTokens);
    // Single short token (e.g. "phi") matching a long corpus title is weak signal
    if (cell?.corpus && qTokens.length <= 2 && lex > 0 && lex < 5) {
      const titleHits = qTokens.filter((t) =>
        hasWord(String(concept).toLowerCase().replace(/^corpus · /, ''), t),
      ).length;
      if (titleHits <= 1 && qTokens.every((t) => t.length <= 4 || DOMAIN_KEEP.has(t))) {
        lex *= 0.35;
      }
    }
    if (lex > 0) {
      lexical.set(concept, Math.max(lexical.get(concept) || 0, lex));
      boost.set(concept, (boost.get(concept) || 0) + lex);
    }
  }

  for (const [, lex] of lexical) {
    bestAnyLex = Math.max(bestAnyLex, lex);
  }
  for (const concept of vocabulary) {
    if (!cellBank[concept]?.corpus) continue;
    const lex = lexical.get(concept) || 0;
    bestCorpusLex = Math.max(bestCorpusLex, lex);
    if (lex >= 2.5) {
      kinds.add('corpus');
      kinds.add('explain');
    }
  }

  if (bestAnyLex >= 2 && !kinds.has('ood')) {
    kinds.add('explain');
  }

  // Trivia / recipe / off-library with no domain hit → refuse
  const oodTrivia =
    /\b(capital of|recipe|sourdough|bread|weather|stock price|crypto price|who won|lottery|password|hack)\b/i.test(
      text,
    ) ||
    (/\b(france|paris|tokyo|recipe|cake|pizza|football|nba|mlb)\b/i.test(text) && bestAnyLex < 2);
  if (oodTrivia && !kinds.has('phi') && !kinds.has('vault') && !kinds.has('lattice') && !kinds.has('protein') && !kinds.has('corpus') && !kinds.has('contrast') && !kinds.has('about')) {
    kinds.add('ood');
  }

  if (history.length >= 2 && !kinds.has('greeting') && !kinds.has('ood')) {
    kinds.add('continuing');
    boost.set('Multi-turn memory', (boost.get('Multi-turn memory') || 0) + 0.8);
  }

  return { kinds, boost, lexical, qTokens, bestAnyLex, bestCorpusLex };
}

function speechAct(kinds, text, history, bestAnyLex = 0, bestCorpusLex = 0) {
  if (kinds.has('ood')) return 'refuse';
  if (kinds.has('about')) return 'introduce';
  if (kinds.has('greeting') && text.length < 56 && history.length < 2) return 'greet';
  if (kinds.has('contrast')) return 'contrast';
  if (kinds.has('protein')) return 'race';
  // Domain teach beats weak / accidental corpus
  if (kinds.has('phi') || kinds.has('vault') || kinds.has('lattice') || kinds.has('duality') || kinds.has('protocol')) {
    if (bestCorpusLex >= bestAnyLex + 1.5 && bestCorpusLex >= 4) return 'corpus';
    return 'teach';
  }
  if (kinds.has('corpus') && bestCorpusLex >= 2.5) return 'corpus';
  if (kinds.has('followup') || kinds.has('continuing')) {
    if (bestAnyLex < 1.5 && history.length >= 1) return 'continue';
    if (bestAnyLex >= 2.5) return kinds.has('corpus') ? 'corpus' : 'teach';
    return 'continue';
  }
  if (bestAnyLex < 1.5 && !kinds.has('explain')) return 'invite';
  if (kinds.has('explain') && bestAnyLex >= 1.5) return 'explain';
  if (bestAnyLex < 1.5) return 'invite';
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

/** Pick contact residues: require real query overlap when tokens exist; Φ tie-break only. */
function pickFoldContacts(text, top, cellBank, threadPhase, maxContacts = 3, requireOverlap = true) {
  const q = queryTokens(text);
  const contacts = [];
  for (const node of top) {
    const cell = cellBank[node.concept];
    const atoms = cellAtoms(cell);
    if (!atoms.length) continue;
    let best = { atom: '', score: -Infinity, idx: 0, overlap: 0 };
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      const hay = a.toLowerCase();
      let overlap = 0;
      for (const t of q) if (hasWord(hay, t)) overlap += 1;
      // Also credit concept/title lexical already on the node
      const nodeLex = Number(node.lexical || 0);
      let score = overlap * 2 + Math.min(nodeLex, 4) * 0.15;
      score += 0.01 * Math.cos(((threadPhase + i) * (node.primeVault || 3)) / PHI_EGS);
      if (score > best.score) best = { atom: a, score, idx: i, overlap };
    }
    // Skip vaults with zero token overlap when the ask has content tokens
    if (requireOverlap && q.length && best.overlap < 1 && Number(node.lexical || 0) < 2.5) {
      continue;
    }
    if (!best.atom) continue;
    contacts.push({
      concept: node.concept,
      atom: best.atom.slice(0, 360),
      residueIndex: best.idx,
      metaProtein: cell?.metaProtein || (cell?.corpus ? 'voyage-meta' : 'demo-meta'),
      corpus: Boolean(cell?.corpus),
      score: Number(best.score.toFixed(3)),
      overlap: best.overlap,
      lexical: Number(node.lexical || 0),
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
 * Fold articulate — compose answer from residue contacts that touch the ask.
 * Catalog rhyme to protein fold / brain speech plan — not wet-lab or open-world LLM.
 */
function articulateFold({
  text,
  top,
  octaveTier,
  latencyMs,
  kinds,
  history,
  act,
  cellBank,
  threadPhase,
  bestAnyLex = 0,
}) {
  const softActs = act === 'greet' || act === 'introduce' || act === 'refuse' || act === 'invite';
  const contacts = pickFoldContacts(text, top, cellBank, threadPhase, 3, !softActs);
  const parts = [];
  const priorUser = [...history].reverse().find((h) => h.role === 'user');
  const echo = shortAskEcho(text);
  const leadAtom = contacts[0]?.atom;
  const secondAtom = contacts[1]?.atom;
  const thirdAtom = contacts[2]?.atom;
  const metas = [...new Set(contacts.map((c) => c.metaProtein).filter(Boolean))];
  const topicConnected = contacts.some((c) => (c.overlap || 0) >= 1 || (c.lexical || 0) >= 2.5);

  if (act === 'refuse') {
    parts.push(cellSpeak('Domain boundary', cellBank));
    parts.push(
      'That ask is outside my filed protein library — I will not invent an answer. Steer to Φ, the prospectus voyage (Borikén · Reno · genesis), Infinite Octaves, vaults, holographic/magnetic/Goldilocks, or the Race.',
    );
  } else if (act === 'introduce') {
    parts.push("I'm the live **Prime Vault Chat** agent — a domain-bounded closed-form language processor on Demonstrations.");
    parts.push(
      'Flow: sense → retrieve → plan → fold. I answer only from vault atoms that contact your words — not from stale brochure dumps. Encode is filing, not LLM training — $0.',
    );
    if (leadAtom && topicConnected) parts.push(leadAtom);
  } else if (act === 'greet') {
    parts.push('Hey — welcome aboard. I am listening.');
    parts.push('Ask about the voyage arc, Φ, vaults, Goldilocks, or the Race — I fold matching vault atoms, not canned scripts.');
  } else if (act === 'contrast') {
    parts.push(
      'A trained LLM samples next tokens from weights. I fold filed vault atoms under Φ — retrieval plus closed-form compose, not gradient training.',
    );
    if (leadAtom && topicConnected) parts.push(leadAtom);
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
    if (!topicConnected || !leadAtom) {
      parts.push(
        echo
          ? `I heard “${echo}” but could not lock a strong vault contact — ask with prospectus / Borikén / Goldilocks / magnetic / prime-parity words from the filed library.`
          : 'I could not lock a strong vault contact for that ask. Try prospectus, Borikén, Goldilocks, holographic magnetic, or prime parity.',
      );
    } else {
      if (echo) parts.push(`Folding your ask (“${echo}”) onto matching vault contacts:`);
      parts.push(leadAtom);
      if (secondAtom && secondAtom !== leadAtom) parts.push(secondAtom);
      if (thirdAtom && thirdAtom !== secondAtom) parts.push(thirdAtom);
      parts.push(
        `Meta-protein fold: ${metas.join(' · ') || 'voyage-meta'} · catalog filing, not prophecy.`,
      );
    }
  } else if (act === 'continue') {
    parts.push(
      priorUser
        ? 'Still in this thread — folding the next contact from what we already touched.'
        : 'Still with you — folding the next contact.',
    );
    if (leadAtom) parts.push(leadAtom);
    else if (secondAtom) parts.push(secondAtom);
    else {
      parts.push('Say the topic again (Φ, prospectus, vaults, Race) so I can lock fresh contacts.');
    }
  } else if (act === 'teach' || act === 'explain') {
    if (!topicConnected || !leadAtom) {
      parts.push(
        echo
          ? `I understood the shape of “${echo}” but need a filed vault hit — try Φ, Infinite Octaves, prime vaults, prospectus, or the Race.`
          : 'Ask about Φ, prospectus voyage, vaults, Infinite Octaves, or the Race — those folds are filed.',
      );
    } else {
      if (echo) parts.push(`Folding an answer around: ${echo}.`);
      parts.push(leadAtom);
      if (secondAtom && secondAtom !== leadAtom) parts.push(secondAtom);
      if (thirdAtom && parts.length < 4) parts.push(thirdAtom);
    }
  } else {
    // invite — do NOT dump unrelated El Gran Sol atoms
    parts.push(
      "I'm listening — say what to fold from the filed library: prospectus arc, Φ / 1.618, vaults, Infinite Octaves, Goldilocks / holographic magnetic, or the Race.",
    );
    if (bestAnyLex >= 2 && leadAtom && topicConnected) parts.push(leadAtom);
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
    topicConnected,
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

    // 2 · Retrieve (lexical-first + intent boosts; Φ is tie-break, not content picker)
    const { kinds, boost, lexical, qTokens, bestAnyLex, bestCorpusLex } = detectKinds(
      text,
      history,
      vocabulary,
      cellBank,
    );
    let act = speechAct(kinds, text, history, bestAnyLex, bestCorpusLex);

    const responseNodes = [];
    for (let i = 0; i < vocabulary.length; i++) {
      const concept = vocabulary[i];
      const pk = primeVaults[i];
      const lex = lexical.get(concept) || 0;
      const b = boost.get(concept) || 0;
      // Geometry is a tiny tie-break — lexical/intent dominate
      let resonance =
        0.08 *
          (PHI_EGS ** octaveTier / (pk * Math.log(pk))) *
          Math.cos((inputLength * pk) / PHI_EGS) +
        lex * 2.4 +
        b * 1.1;
      const phase =
        ([...text.toLowerCase()].reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0) +
          threadPhase) %
        97;
      resonance *= 1 + 0.015 * Math.cos((phase * pk) / PHI_EGS);
      if (act === 'refuse' && concept === 'Domain boundary') resonance *= 2.2;
      if (act === 'contrast' && /LLM|Deterministic|Closed-form/.test(concept)) resonance *= 1.35;
      if (act === 'race' && /Race|Nova|Macro-protein/.test(concept)) resonance *= 1.35;
      if (act === 'teach' && /Fractal constant|El Gran Sol|Prime container|Omniversal|Infinite octave/i.test(concept)) {
        resonance *= 1.25;
      }
      // Suppress zero-lex cells when the ask has content tokens (stops El Gran Sol default dump)
      if (qTokens.length && lex < 0.5 && b < 1.5 && act !== 'greet' && act !== 'introduce' && act !== 'refuse') {
        resonance *= 0.05;
      }
      const amplitude = Math.abs(resonance);
      if (amplitude > 0.01) {
        responseNodes.push({
          concept,
          primeVault: pk,
          amplitude: Number(amplitude.toFixed(4)),
          corpus: Boolean(cellBank[concept]?.corpus),
          lexical: Number(lex.toFixed(3)),
        });
      }
    }

    responseNodes.sort((a, b) => {
      const score = (n) => (n.lexical || 0) + (boost.get(n.concept) || 0) * 0.35;
      const d = score(b) - score(a);
      if (Math.abs(d) > 0.01) return d;
      return b.amplitude - a.amplitude;
    });
    let ranked = responseNodes;

    if (act === 'corpus' || (kinds.has('corpus') && bestCorpusLex >= 2.5)) {
      const corp = ranked.filter((n) => n.corpus && (n.lexical || 0) >= 1.5);
      const rest = ranked.filter((n) => !(n.corpus && (n.lexical || 0) >= 1.5));
      if (corp.length) ranked = [...corp, ...rest];
    }
    if (act === 'race') {
      const handRace = ranked.filter((n) =>
        /^(Prime Vault Race|Unmodeled Nova|Macro-protein work engine)$/i.test(n.concept),
      );
      const corpRace = ranked.filter(
        (n) =>
          n.corpus &&
          /protein-folding|protein fold|alphafold|unmodeled|Race|Nova/i.test(n.concept),
      );
      const rest = ranked.filter((n) => !handRace.includes(n) && !corpRace.includes(n));
      ranked = [...handRace, ...corpRace, ...rest];
    }
    if (act === 'teach' || act === 'explain') {
      const hand = ranked.filter((n) => !n.corpus && (n.lexical || 0) + (boost.get(n.concept) || 0) > 0);
      if (hand.length && (hand[0].lexical || 0) >= (ranked[0]?.lexical || 0) - 0.5) {
        const rest = ranked.filter((n) => !hand.includes(n));
        ranked = [...hand, ...rest];
      }
    }

    // Low confidence → invite/refuse instead of geometric brochure dump
    if (
      act !== 'refuse' &&
      act !== 'greet' &&
      act !== 'introduce' &&
      act !== 'contrast' &&
      act !== 'race' &&
      bestAnyLex < 1.5 &&
      !kinds.has('followup') &&
      !kinds.has('continuing')
    ) {
      act = qTokens.length ? 'invite' : 'invite';
    }

    const top = ranked.slice(0, 3).map((n) => ({ ...n }));

    // 3 · Plan — only promote corpus when top vault actually matched
    if (
      top[0]?.corpus &&
      (top[0].lexical || 0) >= 2.5 &&
      act !== 'refuse' &&
      act !== 'about' &&
      act !== 'greet' &&
      act !== 'contrast' &&
      act !== 'race' &&
      act !== 'teach'
    ) {
      act = 'corpus';
    }
    const plan = {
      speechAct: act,
      kinds: [...kinds],
      topConcepts: top.map((n) => n.concept),
      bestAnyLex,
      bestCorpusLex,
      qTokens,
    };

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
      bestAnyLex,
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
      topicConnected: Boolean(folded.topicConnected),
      confidence: Number(bestAnyLex.toFixed(3)),
      stages: {
        sense,
        retrieve: {
          nNodes: responseNodes.length,
          top: plan.topConcepts,
          bestAnyLex,
          qTokens,
        },
        plan,
        articulate: {
          foldContacts: folded.contacts.length,
          metaProteins: folded.metaProteins,
          composed: true,
          topicConnected: folded.topicConnected,
        },
      },
      /** Operational LUDCR abilities — closed-form catalog map, not human cognition. */
      abilities: {
        listen: { ok: true, mapsTo: 'sense', tier: 'operational' },
        understand: {
          ok: bestAnyLex >= 1.5 || act === 'introduce' || act === 'greet' || act === 'refuse',
          mapsTo: 'retrieve',
          tier: 'catalog',
          note: 'Domain-bounded vault match — not open-world comprehension',
          confidence: Number(bestAnyLex.toFixed(3)),
        },
        decide: { ok: true, mapsTo: 'plan', tier: 'operational', speechAct: act },
        respond: {
          ok: true,
          mapsTo: 'articulate',
          tier: 'operational',
          foldContacts: folded.contacts.length,
          composed: folded.composed,
          topicConnected: folded.topicConnected,
        },
        communicate: {
          ok: Boolean(reply && String(reply).trim()),
          mapsTo: 'guest-chat-door',
          tier: 'operational',
          door: '/demonstrations#chat',
        },
      },
      honesty:
        'Domain-bounded closed-form language processor with operational LUDCR (listen/understand/decide/respond/communicate) mapped to sense→retrieve→plan→fold→guest door. Lexical vault contact required — no stale brochure dumps. Protein-library encode ≠ LLM training. Catalog understand ≠ open-world QA; not wet-lab; application companion, not engine pin.',
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
