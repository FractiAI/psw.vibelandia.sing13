/**
 * Awareness Layer map — Fractal · Holographic · Goldilocks → SuperAI
 * Catalog / nest grammar only. Not ENGINE_SHELF. Not proven AGI.
 */

export const AWARENESS_LAYER_DOC =
  'docs/SYNTHOBS_AWARENESS_LAYER_FRACTAL_HOLOGRAPHIC_GOLDILOCKS_SUPERAI_2026-10.md';

export const AWARENESS_LAYER_SLUG = 'awareness-layer';

export const AWARENESS_LAYER_HREF = `/layers/${AWARENESS_LAYER_SLUG}`;

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
 */

/** @type {ReadonlyArray<{
 *   id: string,
 *   name: string,
 *   prior: string,
 *   role: string,
 *   href: string,
 *   doors?: ReadonlyArray<{ label: string, href: string }>,
 *   papers: ReadonlyArray<LayerPaper>
 * }>} */
export const AWARENESS_LAYERS = Object.freeze([
  {
    id: 'fractal',
    name: 'Fractal Layer',
    prior: 'EGS Fractal Constant (Φ_EGS)',
    role: 'Recursive scale grammar · digits×octaves depth · PARTS↔WHOLE self-similarity',
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
    href: '/layers/holographic',
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
