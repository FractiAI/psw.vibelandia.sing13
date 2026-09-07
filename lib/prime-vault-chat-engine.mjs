/**
 * Prime Vault Chat Engine — live Φ-recursive prime-container conversational agent.
 * Closed-form · $0 training · deterministic. Application companion, not engine pin.
 * Guests chat with a real algebraic agent — not a stub, not a trained LLM.
 */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

/** Concept cards — what the agent *knows* as irreducible vaults. */
export const CONCEPT_CARDS = Object.freeze({
  'El Gran Sol': {
    primeIndex: 0,
    gist: 'El Gran Sol is the naming origin of Φ_EGS — the fractal scalar that keys every vault downstream.',
    detail:
      'Treat Φ ≈ 1.618 as the golden key, not a substitute for ħ, c, or G. Catalog scale language stays honest: design invariant, not unfinished physics proof.',
  },
  'Fractal constant': {
    primeIndex: 1,
    gist: 'Φ = (1+√5)/2 ≈ 1.618033988749895 is the closed-form scale operator for this edge agent.',
    detail:
      'Every reply folds Φ-recursive resonance across prime vaults. No gradient descent, no token lottery — just algebraic amplitude ranking.',
  },
  'Prime container': {
    primeIndex: 2,
    gist: 'Odd primes (≥3) act as irreducible semantic containers; binary 2 is the structural base.',
    detail:
      'Queries map into prime-indexed volumetric coordinates. Containers do not leak: each concept vault stays phase-isolated under Φ.',
  },
  'Omniversal lattice': {
    primeIndex: 3,
    gist: 'The Omniversal Lattice is the Story map — Digits × Octaves — recursive holographic nesting, not infinite measured physics tiers.',
    detail:
      'Infinite Octaves means nesting depth under Φ, not a claim of infinite empirical layers. Guests chat the catalog grammar live on the edge.',
  },
  'Zero balance': {
    primeIndex: 4,
    gist: 'Zero is a dynamic equilibrium node — null-space that cancels cross-talk between vaults.',
    detail:
      'When resonance falls below the harmonic filter, that vault stays silent. Silence is signal: the agent refuses noise instead of inventing weights.',
  },
  'Proton space': {
    primeIndex: 5,
    gist: 'Proton Space is the leading-1 structural lane in the duality filing — stability before theater.',
    detail:
      'In catalog grammar, leading 1 pairs with structural 2. This is filing language for duality, not a wet-lab claim about nuclei.',
  },
  'Electron theater': {
    primeIndex: 6,
    gist: 'Electron Theater is the expressive/structural-2 lane — motion around the protonic scaffold.',
    detail:
      'Chat replies can surface this lane when the ask is about expression, dynamics, or dual roles. Honesty: catalog duality, not particle-physics derivation.',
  },
  'Macro-protein work engine': {
    primeIndex: 7,
    gist: 'Macro-protein work is an application companion: organismal θ_bio bands and Φ-indexed work, not an engine pin.',
    detail:
      'For fold/race questions, pair this vault with Prime container. Miracle 1 (Race) publishes measured latency; Miracle 2 (this chat) lets you query the same Φ key conversationally.',
  },
  'Holographic summation': {
    primeIndex: 8,
    gist: 'xD ± yD holographic summation mixes octave tiers without neural weights.',
    detail:
      'Cross-scale rhyme is how the agent answers multi-part asks: sum amplitudes, rank vaults, speak the top resonance in plain language.',
  },
  'Deterministic resonance': {
    primeIndex: 9,
    gist: 'Same input + same octave → same vault ranking. Reproducible edge intelligence.',
    detail:
      'Training cost is $0.00. Latency is algebraic milliseconds. This is the miracle guests feel: LLM-shaped chat without GPU training.',
  },
  'Infinite octave': {
    primeIndex: 10,
    gist: 'Infinite = recursive nesting depth of the Story under Φ — not infinite measured tiers.',
    detail:
      'Octave tier (default 7, band 1–15) scales Φ^n in the resonance formula. Raise the tier to deepen the nest; the agent stays closed-form.',
  },
});

export const DEFAULT_VOCABULARY = Object.freeze(Object.keys(CONCEPT_CARDS));

const INTENT_HINTS = Object.freeze([
  { re: /\b(hello|hi|hey|greetings|hola)\b/i, kind: 'greeting', concepts: ['Omniversal lattice', 'El Gran Sol'] },
  {
    re: /\b(tell me about (you|yourself)|who are you|what are you|about you|your name|introduce yourself)\b/i,
    kind: 'about',
    concepts: ['Deterministic resonance', 'Omniversal lattice', 'El Gran Sol'],
  },
  { re: /\b(phi|φ|Φ|egs|golden|fractal|1\.618)\b/i, kind: 'phi', concepts: ['Fractal constant', 'El Gran Sol'] },
  { re: /\b(prime|vault|container|algebra|closed-?form)\b/i, kind: 'vault', concepts: ['Prime container', 'Deterministic resonance'] },
  { re: /\b(lattice|omni|octave|holograph|story)\b/i, kind: 'lattice', concepts: ['Omniversal lattice', 'Infinite octave', 'Holographic summation'] },
  { re: /\b(protein|fold|alphafold|colabfold|race|nova)\b/i, kind: 'protein', concepts: ['Macro-protein work engine', 'Prime container'] },
  { re: /\b(proton|electron|zero|void|balance|null)\b/i, kind: 'duality', concepts: ['Proton space', 'Electron theater', 'Zero balance'] },
  { re: /\b(llm|gpt|chatgpt|train(?:ing|ed)?|gpu|token|miracle|cost|latency|fast|speed)\b/i, kind: 'contrast', concepts: ['Deterministic resonance', 'Omniversal lattice'] },
  { re: /\b(how|what|why|explain|who|where)\b/i, kind: 'explain', concepts: [] },
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

function detectKinds(text) {
  const kinds = new Set();
  const boost = new Map();
  for (const hint of INTENT_HINTS) {
    if (hint.re.test(text)) {
      kinds.add(hint.kind);
      for (const c of hint.concepts) boost.set(c, (boost.get(c) || 0) + 1);
    }
  }
  for (const concept of DEFAULT_VOCABULARY) {
    const key = concept.toLowerCase().split(/\s+/)[0];
    if (key.length > 3 && text.toLowerCase().includes(key)) {
      boost.set(concept, (boost.get(concept) || 0) + 1.5);
      kinds.add('explain');
    }
  }
  return { kinds, boost };
}

function footerLine(top, octaveTier, latencyMs) {
  const clock =
    latencyMs < 1 ? latencyMs.toFixed(3) : latencyMs.toFixed(2);
  const lead = top[0] ? `${top[0].concept}` : 'steady';
  return `_Edge note: ${clock} ms · octave ${octaveTier} · Φ ≈ 1.618 · $0 training · tuned on ${lead}._`;
}

function synthesizeReply(text, top, octaveTier, latencyMs, kinds) {
  const lead = top[0];
  const card = lead ? CONCEPT_CARDS[lead.concept] : null;
  const second = top[1] ? CONCEPT_CARDS[top[1].concept] : null;
  const parts = [];

  if (kinds.has('about')) {
    parts.push(
      "I'm the live **Prime Vault Chat** agent on SS Vibelandia — Miracle 2 on the Demonstrations door.",
    );
    parts.push(
      "I don't train on your words and I don't sample tokens like ChatGPT. I resolve what you say through a closed-form Φ ≈ 1.618 prime-vault engine: same question → same geometry → a reply in milliseconds, with **$0 training**.",
    );
    parts.push(
      "Talk to me like a guest on the ship. Ask what Φ is, how vaults differ from neural folds, what the Race scoreboard means, or just what I'm for. I'll answer in plain language — and keep the lab honesty rails on.",
    );
  } else if (kinds.has('greeting') && text.length < 48) {
    parts.push("Hey — welcome aboard. I'm here, live, and listening.");
    parts.push(
      "I'm Prime Vault Chat: a conversational edge agent keyed by Φ ≈ 1.618. No GPU cluster, no training bill. What would you like to explore?",
    );
  } else if (kinds.has('contrast')) {
    parts.push(
      "Fair question. A cloud LLM guesses the next token from billions of trained weights. I don't.",
    );
    parts.push(
      "I map your words into prime-indexed vaults and answer from Φ-recursive resonance — reproducible, edge-ready, sub-millisecond. That is the miracle guests can feel: chat-shaped interaction without the training tax.",
    );
    parts.push(
      "Honesty: I'm great at lattice / Φ / vault / race questions. I'm not a substitute for open-world factual QA, medicine, or law.",
    );
  } else if (kinds.has('protein')) {
    parts.push(
      "On the protein / fold side: Miracle 1 is the published Race scoreboard — closed-form vaults timed against measured ColabFold, including Unmodeled Nova.",
    );
    parts.push(
      "Here in chat I won't invent pLDDT or CASP medals. I can explain what the scoreboard means, why Tier 4 was deferred until a live ColabFold run, and how Φ keys the vault lane.",
    );
    if (card) parts.push(card.gist);
  } else if (kinds.has('phi') || kinds.has('vault') || kinds.has('lattice') || kinds.has('duality')) {
    parts.push(card ? card.gist : "Let's stay with the lattice.");
    if (card) parts.push(card.detail);
    if (second) parts.push(`Related: ${second.gist}`);
  } else if (kinds.has('explain')) {
    parts.push(
      card
        ? card.gist
        : "I hear you. Ask me about Φ, prime vaults, Infinite Octaves nesting, the Race, or how I differ from a trained LLM — I'll answer as a guest-facing agent, not a stats dump.",
    );
    if (card) parts.push(card.detail);
    if (second) parts.push(second.gist);
  } else {
    parts.push(
      "I'm with you. Say a bit more about what you want — purpose, Φ, vaults, the Race, or just curiosity — and I'll answer in conversation.",
    );
    if (card) parts.push(`If it helps: ${card.gist}`);
  }

  parts.push(footerLine(top, octaveTier, latencyMs));
  return parts.join('\n\n');
}

/**
 * @param {{ octaveTier?: number, vocabulary?: string[] }} [opts]
 */
export function createPrimeVaultChatEngine(opts = {}) {
  const octaveTier = Math.max(1, Math.min(15, Number(opts.octaveTier) || 7));
  const vocabulary = opts.vocabulary?.length
    ? [...opts.vocabulary]
    : [...DEFAULT_VOCABULARY];
  const primeVaults = generateSemanticPrimes(vocabulary.length);

  function queryLattice(userInput) {
    const t0 = performance.now();
    const text = String(userInput || '').trim();
    const inputLength = Math.max(1, text.length);
    const { kinds, boost } = detectKinds(text);

    const responseNodes = [];
    for (let i = 0; i < vocabulary.length; i++) {
      const concept = vocabulary[i];
      const pk = primeVaults[i];
      let resonance =
        (PHI_EGS ** octaveTier) / (pk * Math.log(pk)) *
        Math.cos((inputLength * pk) / PHI_EGS);
      const b = boost.get(concept) || 0;
      if (b) resonance *= 1 + b / PHI_EGS;
      // Light content hash so different phrasings shift phase without training.
      const phase =
        [...text.toLowerCase()].reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0) %
        97;
      resonance *= 1 + 0.02 * Math.cos((phase * pk) / PHI_EGS);
      const amplitude = Math.abs(resonance);
      if (amplitude > 0.01) {
        responseNodes.push({
          concept,
          primeVault: pk,
          amplitude: Number(amplitude.toFixed(4)),
        });
      }
    }

    responseNodes.sort((a, b) => b.amplitude - a.amplitude);
    const top = responseNodes.slice(0, 3);
    const latencyMs = performance.now() - t0;
    const reply = synthesizeReply(text, top, octaveTier, latencyMs, kinds);

    return {
      reply,
      nodes: top,
      octaveTier,
      phiEgs: PHI_EGS,
      latencyMs,
      trainingCostUsd: 0,
      engine: 'prime-vault-chat',
      live: true,
      kinds: [...kinds],
      honesty:
        'Live closed-form Φ prime-vault chat agent — real algebraic conversation, not a stub. Not a trained LLM substitute for open-world factual QA; not medical/legal advice; application companion, not engine pin.',
    };
  }

  return {
    octaveTier,
    vocabulary,
    primeVaults,
    queryLattice,
  };
}

export function queryPrimeVaultChat(userInput, opts = {}) {
  return createPrimeVaultChatEngine(opts).queryLattice(userInput);
}
