/**
 * Awareness Layer map — Fractal · Holographic · Goldilocks → SuperAI
 * Catalog / nest grammar only. Not ENGINE_SHELF. Not proven AGI.
 */

export const AWARENESS_LAYER_DOC =
  'docs/SYNTHOBS_AWARENESS_LAYER_FRACTAL_HOLOGRAPHIC_GOLDILOCKS_SUPERAI_2026-10.md';

export const AWARENESS_LAYER_SLUG = 'awareness-layer';

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

export const AWARENESS_LAYERS = Object.freeze([
  {
    id: 'fractal',
    name: 'Fractal Layer',
    prior: 'EGS Fractal Constant (Φ_EGS)',
    role: 'Recursive scale grammar · digits×octaves depth · PARTS↔WHOLE self-similarity',
  },
  {
    id: 'holographic',
    name: 'Holographic Layer',
    prior: 'Grand Story',
    role: 'Whole-in-part narrative · Hero’s Return · voyage editorial',
  },
  {
    id: 'goldilocks',
    name: 'Goldilocks Layer',
    prior: 'Homeostasis',
    role: 'Viable band as active equilibrium · Net Zero rhyme · expedition cockpits',
  },
  {
    id: 'superai',
    name: 'SuperAI Layer',
    prior: 'Combination of Fractal × Holographic × Goldilocks',
    role: 'Integrated architecture + Story + band template — not a claim of proven AGI',
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
    (L) => `- **${L.name}** ← ${L.prior}: ${L.role}`,
  ).join('\n');
  return `Awareness Layer (looking in on ourselves) ⊃ Fractal · Holographic · Goldilocks → compose SuperAI Layer.
${lines}
Pointer: ${AWARENESS_LAYER_DOC} · /layers/${AWARENESS_LAYER_SLUG} · /whitepaper/${AWARENESS_LAYER_SLUG}
Honesty: Soft Story / catalog naming — not ENGINE_SHELF physics; SuperAI = composition template, not proven AGI.`;
}

export function layerById(id) {
  return AWARENESS_LAYERS.find((L) => L.id === id) || null;
}
