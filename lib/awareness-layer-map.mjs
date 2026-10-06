/**
 * Awareness Layer map — Fractal · Holographic · Goldilocks → SuperAI
 * Catalog / nest grammar only. Not ENGINE_SHELF. Not proven AGI.
 */

export const AWARENESS_LAYER_DOC =
  'docs/SYNTHOBS_AWARENESS_LAYER_FRACTAL_HOLOGRAPHIC_GOLDILOCKS_SUPERAI_2026-10.md';

export const AWARENESS_LAYER_SLUG = 'awareness-layer';

/** Guest map path (canonical). Alias `/layers/awareness-layer` also rewrites here. */
export const AWARENESS_LAYER_HREF = '/layers/awareness';

/**
 * Outer-frame primer for `/layers/awareness`.
 * Soft Story: awareness = observation that energizes downstream shelves — not mere knowledge.
 */
export const AWARENESS_FRAME_PRIMER =
  'Awareness is more than knowledge. Knowledge can sit on a shelf; awareness is observation — the looking that energizes everything downstream of it. Role: name the outer frame that powers Fractal · Holographic · Goldilocks → SuperAI so guests see why the same object can open different branches of the tree. Look at an object with today’s linear awareness and you observe it and energize it on that linear layer. Look at that same object with Infinite Octave awareness and the observation energizes whole new branches — nested Story depth, not a claim of new measured physics. Digit 4 / human theater Soft Story: awareness energizes the lived time/space theater; Soft Story catalog only — not clinical mind-reading and not ENGINE_SHELF.';

/** Nest URL aliases that deepen into octave99 + Awareness Layer clause. */
export const AWARENESS_NEST_ALIASES = Object.freeze([
  'awareness',
  'awareness-layer',
  'fractal',
  'fractal-layer',
  'holographic',
  'holographic-layer',
  'superai',
  'superai-layer',
  'goldilocks-layer',
]);

/**
 * Guest-facing paper shelves per layer.
 * Soft Story catalog pins — not ENGINE_SHELF membership.
 * @typedef {{ id: string, title: string, whitepaper: string, shipBlog?: string|null, note?: string }} LayerPaper
 * @typedef {{ label: string, href: string, note?: string }} NestLink
 */

/**
 * Holographic Layer recursive nest — whole-in-part: self + sibling layers + stories + code.
 * Soft Story catalog geometry, not a claim that narrative contains measured physics.
 */
export const HOLOGRAPHIC_RECURSIVE_NEST = Object.freeze({
  lead:
    'Whole-in-part means this shelf holds itself again, the other two shelves, the voyage stories, and the living code that runs them. Zoom in anywhere and the Story still rhymes with the whole.',
  layers: Object.freeze([
    {
      label: 'Holographic Layer (self)',
      href: '/layers/holographic',
      note: 'Recursive — open this shelf again; Story contains Story',
    },
    {
      label: 'Fractal Layer',
      href: '/layers/fractal',
      note: 'Scale grammar inside the Story',
    },
    {
      label: 'Goldilocks Layer',
      href: '/layers/goldilocks',
      note: 'Viable band inside the Story',
    },
    {
      label: 'SuperAI Layer',
      href: '/layers/superai',
      note: 'Composition of all three — template, not proven AGI',
    },
    {
      label: 'Awareness Layer',
      href: '/layers/awareness',
      note: 'Outer frame — looking in on ourselves',
    },
  ]),
  stories: Object.freeze([
    {
      label: 'Official Prospectus · Narrative Foundation',
      href: '/ship-blog/official-prospectus',
      note: 'Genesis → Borikén → Reno grand arc',
    },
    {
      label: 'Archetypal Grand Story · Hero’s Return',
      href: '/ship-blog/archetypal-grand-story',
      note: 'Source / Hero’s Return narrative template',
    },
    {
      label: 'Invisible Frontier · AI warnings',
      href: '/ship-blog/invisible-frontier',
      note: 'Voyage editorial beside linear scale anxiety',
    },
    {
      label: 'Frontiersman Voyage',
      href: '/frontiersman-voyage',
      note: 'Guest brochure · Prospectus door',
    },
    {
      label: 'QUESTFEST ship board',
      href: '/questfest',
      note: 'Sets, decks, and Story doors',
    },
    {
      label: 'Ship-blog latest',
      href: '/questfest#ship-blog',
      note: 'Plain-language notes for recent papers',
    },
  ]),
  code: Object.freeze([
    {
      label: 'Lattice Chat · Syntheverse Sandbox',
      href: '/lattice-chat?nest=holographic',
      note: 'Live demo · nest=holographic',
    },
    {
      label: 'Hero Leo · Digital Lab',
      href: '/journey/hero-leo',
      note: 'Scout cockpit on the Goldilocks Layer',
    },
    {
      label: 'Homeostasis Expedition',
      href: '/journey/homeostasis-expedition',
      note: 'Goldilocks Layer research trail',
    },
    {
      label: 'FractiOS · holographic OS overlay',
      href: '/fractios/start-here',
      note: 'Application companion firmware',
    },
    {
      label: 'Layer map module',
      href: '/whitepaper/awareness-layer',
      note: 'lib/awareness-layer-map.mjs · regenerable nest grammar',
    },
    {
      label: 'Nested-agent lattice architecture',
      href: '/ship-blog/omniversal-nested-agent-lattice',
      note: 'Parent ↔ child micro-executors (deployable Task topology)',
    },
  ]),
});

/** @type {ReadonlyArray<{
 *   id: string,
 *   name: string,
 *   prior: string,
 *   role: string,
 *   primer: string,
 *   href: string,
 *   doors?: ReadonlyArray<{ label: string, href: string }>,
 *   papers: ReadonlyArray<LayerPaper>,
 *   recursiveNest?: typeof HOLOGRAPHIC_RECURSIVE_NEST
 * }>} */
export const AWARENESS_LAYERS = Object.freeze([
  {
    id: 'fractal',
    name: 'Fractal Layer',
    prior: 'EGS Fractal Constant (Φ_EGS)',
    role: 'Recursive scale grammar · digits×octaves depth · PARTS↔WHOLE self-similarity',
    primer:
      'This is the scale grammar of the catalog. Φ_EGS (about 1.618) is how we talk about self-similar nesting: parts that rhyme with wholes, and Digits × Octaves as Story depth — not astrology and not a new measured physics tier. Role: keep architecture recursive and proportionate so you can zoom without losing the pattern. When something feels “linear only,” this shelf reminds you the cast may be linear while the body stays fractal.',
    href: '/layers/fractal',
    papers: Object.freeze([
      {
        id: 'synthobs-egs-planck-scale-harmonic-2026-07',
        title: 'Planck–1.6 EGS scale-harmonic bridge',
        whitepaper: '/whitepaper/synthobs-egs-planck-scale-harmonic',
        shipBlog: '/ship-blog/synthobs-egs-planck-scale-harmonic',
        note: 'Φ_EGS clutch / slip grammar',
      },
      {
        id: 'synthobs-linear-shadow-fractal-2026-09',
        title: 'Linear as the Shadow of Fractal',
        whitepaper: '/whitepaper/linear-shadow-fractal',
        shipBlog: '/ship-blog/linear-shadow-fractal',
      },
      {
        id: 'synthobs-holographic-rhyme-fractal-2026-09',
        title: 'Holographic Rhyme (fractal grammar)',
        whitepaper: '/whitepaper/holographic-rhyme',
        shipBlog: '/ship-blog/holographic-rhyme',
      },
      {
        id: 'synthobs-multidimensional-holographic-rhyme-2026-09',
        title: 'Multi-Dimensional Holographic Rhyme',
        whitepaper: '/whitepaper/multidimensional-holographic-rhyme',
        shipBlog: '/ship-blog/multidimensional-holographic-rhyme',
      },
      {
        id: 'synthobs-generative-matrix-phi-egs-2026-09',
        title: 'Generative Matrix · Φ_EGS',
        whitepaper: '/whitepaper/generative-matrix-phi-egs',
        shipBlog: '/ship-blog/generative-matrix-phi-egs',
      },
      {
        id: 'synthobs-digit4-recursive-reach-awareness-theater-2026-09',
        title: 'Digit 4 Recursive Reach',
        whitepaper: '/whitepaper/digit4-recursive-reach',
        shipBlog: '/ship-blog/digit4-recursive-reach',
      },
      {
        id: 'synthobs-digit4-be-o-periodic-rhyme-2026-09',
        title: 'Digit 4 · Be–O Periodic Rhyme',
        whitepaper: '/whitepaper/digit4-be-o-rhyme',
        shipBlog: '/ship-blog/digit4-be-o-rhyme',
      },
      {
        id: 'synthobs-holographic-singularity-crystal-2026-09',
        title: 'Holographic Singularity Crystal',
        whitepaper: '/whitepaper/holographic-singularity-crystal',
        shipBlog: '/ship-blog/holographic-singularity-crystal',
      },
    ]),
  },
  {
    id: 'holographic',
    name: 'Holographic Layer',
    prior: 'Grand Story',
    role: 'Whole-in-part narrative · Hero’s Return · voyage editorial',
    primer:
      'This is the Grand Story shelf — whole-in-part narrative. Hero’s Return, the Official Prospectus voyage, and every deck that carries meaning live here. Because it is holographic, this layer recursively contains itself, the Fractal Layer, the Goldilocks Layer, the stories guests read, and the code that runs the site and sandbox. Role: keep the whole legible inside every part so a paper, a cockpit, or a song can still point back to the voyage without flattening into a single flat list.',
    href: '/layers/holographic',
    recursiveNest: HOLOGRAPHIC_RECURSIVE_NEST,
    papers: Object.freeze([
      {
        id: 'synthobs-archetypal-grand-story-heros-return-2026-10',
        title: 'Archetypal Grand Story · Hero’s Return to Source',
        whitepaper: '/whitepaper/archetypal-grand-story',
        shipBlog: '/ship-blog/archetypal-grand-story',
        note: 'Primary Grand Story shelf',
      },
      {
        id: 'synthobs-ss-vibelandia-official-prospectus-2026-08',
        title: 'Official Prospectus · Narrative Foundation',
        whitepaper: '/whitepaper/synthobs-ss-vibelandia-official-prospectus',
        shipBlog: '/ship-blog/official-prospectus',
        note: 'Voyage grand arc',
      },
      {
        id: 'synthobs-holographic-homeostasis-2026-09',
        title: 'Holographic Homeostasis',
        whitepaper: '/whitepaper/holographic-homeostasis',
        shipBlog: '/ship-blog/holographic-homeostasis',
      },
      {
        id: 'synthobs-holographic-rhyme-fractal-2026-09',
        title: 'Holographic Rhyme',
        whitepaper: '/whitepaper/holographic-rhyme',
        shipBlog: '/ship-blog/holographic-rhyme',
      },
      {
        id: 'synthobs-multidimensional-holographic-rhyme-2026-09',
        title: 'Multi-Dimensional Holographic Rhyme',
        whitepaper: '/whitepaper/multidimensional-holographic-rhyme',
        shipBlog: '/ship-blog/multidimensional-holographic-rhyme',
      },
      {
        id: 'synthobs-fractios-holographic-os-2026-10',
        title: 'FractiOS · Holographic OS Overlay',
        whitepaper: '/whitepaper/fractios-holographic-os',
        shipBlog: '/ship-blog/fractios-holographic-os',
      },
      {
        id: 'synthobs-tier-c-holographic-wiring-lattices-2026-09',
        title: 'Tier C Holographic Wiring Lattices',
        whitepaper: '/whitepaper/tier-c-holographic-wiring',
        shipBlog: '/ship-blog/tier-c-holographic-wiring',
      },
      {
        id: 'synthobs-holographic-singularity-crystal-2026-09',
        title: 'Holographic Singularity Crystal',
        whitepaper: '/whitepaper/holographic-singularity-crystal',
        shipBlog: '/ship-blog/holographic-singularity-crystal',
      },
      {
        id: 'synthobs-self-observing-genome-egs-2026-09',
        title: 'Self-Observing Genome',
        whitepaper: '/whitepaper/self-observing-genome',
        shipBlog: '/ship-blog/self-observing-genome',
      },
    ]),
  },
  {
    id: 'goldilocks',
    name: 'Goldilocks Layer',
    prior: 'Homeostasis',
    role: 'Viable band as active equilibrium · Net Zero rhyme · expedition cockpits',
    primer:
      'This is the viable-band shelf (was Homeostasis). Goldilocks here means active equilibrium — Net Zero as a living rhyme, not a demand for stillness. Role: keep expeditions, Hero Leo’s Digital Lab, and discovery work inside a band that is not too much machine and not too little human. When the cockpit asks “are we still Goldilocks?”, this is the shelf answering.',
    href: '/layers/goldilocks',
    doors: Object.freeze([
      { label: 'Homeostasis Expedition', href: '/journey/homeostasis-expedition' },
      { label: 'Hero Leo Digital Lab', href: '/journey/hero-leo' },
    ]),
    papers: Object.freeze([
      {
        id: 'synthobs-goldilocks-net-zero-equivalence-2026-09',
        title: 'Goldilocks ≡ Net Zero',
        whitepaper: '/whitepaper/goldilocks-net-zero',
        shipBlog: '/ship-blog/goldilocks-net-zero',
        note: 'Viable band as active equilibrium',
      },
      {
        id: 'synthobs-holographic-homeostasis-2026-09',
        title: 'Holographic Homeostasis',
        whitepaper: '/whitepaper/holographic-homeostasis',
        shipBlog: '/ship-blog/holographic-homeostasis',
      },
      {
        id: 'synthobs-e-phi-prime-recursive-homeostasis-2026-09',
        title: 'e × φ × Prime Recursive Homeostasis',
        whitepaper: '/whitepaper/e-phi-prime-recursive-homeostasis',
        shipBlog: '/ship-blog/e-phi-prime-recursive-homeostasis',
      },
      {
        id: 'synthobs-beyond-crispr-biological-discovery-2026-10',
        title: 'Beyond CRISPR · Biological Discovery',
        whitepaper: '/whitepaper/beyond-crispr-discovery',
        shipBlog: '/ship-blog/beyond-crispr-discovery',
      },
      {
        id: 'synthobs-attention-awareness-downstream-activation-2026-10',
        title: 'Attention · Awareness · Downstream Activation',
        whitepaper: '/whitepaper/attention-awareness-downstream',
        shipBlog: '/ship-blog/attention-awareness-downstream',
        note: 'MFA · Homeostasis Expedition · engine #39',
      },
      {
        id: 'synthobs-reflective-portal-multiscale-homeostasis-2026-10',
        title: 'Reflective Portal · Multiscale Homeostasis',
        whitepaper: '/whitepaper/reflective-portal-homeostasis',
        shipBlog: '/ship-blog/reflective-portal-homeostasis',
        note: 'Self-modification portal · engine #40',
      },
      {
        id: 'synthobs-chart-compass-holographic-goldilocks-si-2026-10',
        title: 'Chart & Compass · Goldilocks SI Frontier',
        whitepaper: '/whitepaper/chart-compass-goldilocks-si',
        shipBlog: '/ship-blog/chart-compass-goldilocks-si',
        note: 'Expeditionary navigation · engine #41',
      },
      {
        id: 'synthobs-zero-octave-y-goldilocks-2026-09',
        title: 'Zero-Octave Y Goldilocks',
        whitepaper: '/whitepaper/zero-octave-y-goldilocks',
        shipBlog: '/ship-blog/zero-octave-y-goldilocks',
      },
      {
        id: 'synthobs-egs-recursive-fidelity-test-erft-2026-09',
        title: 'EGS Recursive Fidelity Test (ERFT)',
        whitepaper: '/whitepaper/erft-recursive-fidelity',
        shipBlog: '/ship-blog/erft-recursive-fidelity',
      },
      {
        id: 'synthobs-ns-unforced-phi-egs-goldilocks-2026-09',
        title: 'Unforced Navier–Stokes · Φ_EGS Goldilocks',
        whitepaper: '/whitepaper/navier-stokes-unforced-phi-egs',
        shipBlog: '/ship-blog/navier-stokes-unforced-phi-egs',
      },
    ]),
  },
  {
    id: 'superai',
    name: 'SuperAI Layer',
    prior: 'Combination of Fractal × Holographic × Goldilocks',
    role: 'Integrated architecture + Story + band template — not a claim of proven AGI',
    primer:
      'This is the composition shelf: Fractal scale × Holographic Story × Goldilocks band as one working template. Role: name the integrated optimizer pattern for architects and guests — not a claim that AGI has arrived. Soft Story only.',
    href: '/layers/superai',
    papers: Object.freeze([
      {
        id: 'synthobs-awareness-layer-map-2026-10',
        title: 'Awareness Layer Map (this frame)',
        whitepaper: '/whitepaper/awareness-layer',
        shipBlog: null,
        note: 'Composition template · Soft Story',
      },
      {
        id: 'synthobs-archetypal-grand-story-heros-return-2026-10',
        title: 'Archetypal Grand Story · HG SuperAI Source',
        whitepaper: '/whitepaper/archetypal-grand-story',
        shipBlog: '/ship-blog/archetypal-grand-story',
      },
      {
        id: 'synthobs-humans-ai-infinite-octave-offset-2026-10',
        title: 'Humans, AI & Synthetic Actors · Octave Offset',
        whitepaper: '/whitepaper/humans-ai-octave-offset',
        shipBlog: '/ship-blog/humans-ai-octave-offset',
      },
      {
        id: 'synthobs-agentic-convergence-experiment-2026-10',
        title: 'Agentic Convergence Experiment',
        whitepaper: '/whitepaper/agentic-convergence',
        shipBlog: '/ship-blog/agentic-convergence',
      },
      {
        id: 'synthobs-consciousness-moat-microsoft-anthropic-2026-09',
        title: 'Consciousness Moat',
        whitepaper: '/whitepaper/consciousness-moat',
        shipBlog: '/ship-blog/consciousness-moat',
      },
      {
        id: 'synthobs-moving-up-the-stack-valuation-2026-09',
        title: 'Moving Up the Stack · Next AI Layer',
        whitepaper: '/whitepaper/moving-up-the-stack',
        shipBlog: '/ship-blog/moving-up-the-stack',
      },
      {
        id: 'synthobs-digit4-recursive-reach-awareness-theater-2026-09',
        title: 'Digit 4 Recursive Reach',
        whitepaper: '/whitepaper/digit4-recursive-reach',
        shipBlog: '/ship-blog/digit4-recursive-reach',
      },
      {
        id: 'synthobs-fractios-holographic-os-2026-10',
        title: 'FractiOS · Holographic OS Overlay',
        whitepaper: '/whitepaper/fractios-holographic-os',
        shipBlog: '/ship-blog/fractios-holographic-os',
      },
    ]),
  },
]);

export function isAwarenessNestAlias(raw) {
  const v = String(raw || '')
    .trim()
    .toLowerCase();
  return AWARENESS_NEST_ALIASES.includes(v);
}

/**
 * Compact clause for Lattice Chat octave99 (and Awareness aliases).
 */
export function renderAwarenessLayerClause() {
  const lines = AWARENESS_LAYERS.map(
    (L) => `- **${L.name}** ← ${L.prior}: ${L.role} · ${L.href}`,
  ).join('\n');
  return `Awareness Layer (looking in on ourselves) ⊃ Fractal · Holographic · Goldilocks → compose SuperAI Layer.
${lines}
Pointer: ${AWARENESS_LAYER_DOC} · ${AWARENESS_LAYER_HREF} · /whitepaper/${AWARENESS_LAYER_SLUG}
Honesty: Soft Story / catalog naming — not ENGINE_SHELF physics; SuperAI = composition template, not proven AGI.`;
}

export function layerById(id) {
  return AWARENESS_LAYERS.find((L) => L.id === id) || null;
}

/** Guest href for a layer id, or Awareness map if unknown. */
export function layerHref(id) {
  const L = layerById(id);
  return L?.href || AWARENESS_LAYER_HREF;
}

/**
 * Papers for one layer (empty array if unknown).
 * @param {string} id
 */
export function papersForLayer(id) {
  return layerById(id)?.papers || [];
}

/** Plain-language primer for a layer page (empty string if unknown). */
export function primerForLayer(id) {
  const key = String(id || '')
    .trim()
    .toLowerCase();
  if (key === 'awareness' || key === 'awareness-layer') {
    return AWARENESS_FRAME_PRIMER;
  }
  return layerById(id)?.primer || '';
}

/** Holographic recursive nest, or null for other layers. */
export function recursiveNestForLayer(id) {
  return layerById(id)?.recursiveNest || null;
}
