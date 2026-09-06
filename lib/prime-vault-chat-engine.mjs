/**
 * Prime Vault Chat Engine — Φ-recursive prime-container conversational resolver.
 * Port of the edge Omni-Lattice chat agent (Streamlit demo → ESM).
 * Closed-form · $0 training · deterministic. Application companion, not engine pin.
 */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DEFAULT_VOCABULARY = Object.freeze([
  'El Gran Sol',
  'Fractal constant',
  'Prime container',
  'Omniversal lattice',
  'Zero balance',
  'Proton space',
  'Electron theater',
  'Macro-protein work engine',
  'Holographic summation',
  'Deterministic resonance',
  'Infinite octave',
]);

/** Keyword → vocabulary boosts for intent-aware resonance (still closed-form). */
const INTENT_HINTS = Object.freeze([
  { re: /\b(phi|φ|Φ|egs|golden|fractal)\b/i, concepts: ['Fractal constant', 'El Gran Sol'] },
  { re: /\b(prime|vault|container|algebra)\b/i, concepts: ['Prime container', 'Deterministic resonance'] },
  { re: /\b(lattice|omni|octave|holograph)/i, concepts: ['Omniversal lattice', 'Infinite octave', 'Holographic summation'] },
  { re: /\b(protein|fold|alphafold|colabfold|race)\b/i, concepts: ['Macro-protein work engine', 'Prime container'] },
  { re: /\b(proton|electron|zero|void|balance)\b/i, concepts: ['Proton space', 'Electron theater', 'Zero balance'] },
  { re: /\b(llm|gpt|train|gpu|token|chat)\b/i, concepts: ['Deterministic resonance', 'Omniversal lattice'] },
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
    const boost = new Map();
    for (const hint of INTENT_HINTS) {
      if (hint.re.test(text)) {
        for (const c of hint.concepts) boost.set(c, (boost.get(c) || 0) + 1);
      }
    }

    const responseNodes = [];
    for (let i = 0; i < vocabulary.length; i++) {
      const concept = vocabulary[i];
      const pk = primeVaults[i];
      // Multi-dimensional xD ± yD summation simulation (catalog grammar).
      let resonance =
        PHI_EGS ** octaveTier / (pk * Math.log(pk)) *
        Math.cos((inputLength * pk) / PHI_EGS);
      const b = boost.get(concept) || 0;
      if (b) resonance *= 1 + b / PHI_EGS;
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

    const lines = [
      `Omniversal Lattice Response to query (“${text || '∅'}”):`,
      `→ Operating at Octave Tier ${octaveTier} via El Gran Sol’s Fractal constant (Φ ≈ 1.618).`,
      '→ Activated Prime-Container Vaults:',
      ...top.map(
        (n) =>
          `   • [${n.concept}] anchored to Prime ${n.primeVault} (Resonance: ${n.amplitude})`,
      ),
      '→ Status: Absolute zero cross-talk · $0.00 training cost · closed-form latency.',
      `→ Edge clock: ${latencyMs < 1 ? latencyMs.toFixed(3) : latencyMs.toFixed(2)} ms (algebraic, not token sampling).`,
    ];

    return {
      reply: lines.join('\n'),
      nodes: top,
      octaveTier,
      phiEgs: PHI_EGS,
      latencyMs,
      trainingCostUsd: 0,
      engine: 'prime-vault-chat',
      honesty:
        'Closed-form Φ prime-vault resonance — demo of algebraic chat grammar. Not a trained LLM substitute for open-world factual QA; not medical/legal advice; application companion, not engine pin.',
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
