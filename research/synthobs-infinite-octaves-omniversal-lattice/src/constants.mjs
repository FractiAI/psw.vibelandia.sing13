/** Infinite Octaves Omniversal Lattice Chat — product upgrade fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID =
  'WP-SYNTHOBS-INFINITE-OCTAVES-OMNIVERSAL-LATTICE-CHAT-2026-08-25';
export const REGISTRY_ID = 'synthobs-infinite-octaves-omniversal-lattice-2026-08';
export const STUDY_TITLE = 'Infinite Octaves Omniversal Lattice Chat Agent';
export const PAPER_NAME = 'SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-INFINITE-OCTAVES-OMNIVERSAL-2026-08';

export const PRODUCT_NAME =
  'Infinite Octaves Omniversal Lattice Chat Agent V1.618';
export const ENGINE_NAME = '99 Octave Omni-Lattice';
export const NEST_RUNTIME_ID = 'octave99';

export const NEST_ALIASES = Object.freeze([
  'octave99',
  '99-octave',
  '99octave',
  'multi-octave',
  'infinite',
  'omniversal',
  'infinite-octaves',
  'infinite_octaves',
]);

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;

export const ENGINE_PIN_ORDER = Object.freeze([
  'cmos_protonic',
  'tensor_decoupling',
  'master_synthesis',
  'digits_master',
  'metamorphic_part_xiii',
  'planetary_core_part_xiv',
]);

export const VOYAGE_EDITORIAL_COMPANIONS = Object.freeze([
  'synthobs-invisible-frontier-gates-ai-2026-08',
  'synthobs-human-omniversal-reality-bridge-2026-08',
  'synthobs-ss-vibelandia-official-prospectus-2026-08',
  'synthobs-triadic-nested-hemispheres-99-octave-2026-08',
]);

export const SCORECARD = Object.freeze({
  productNamingClarity: 99.0,
  enginePinFidelity: 99.2,
  nestAliasCoverage: 98.6,
  honestyBoundaryStrength: 99.5,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.productNamingClarity +
      SCORECARD.enginePinFidelity +
      SCORECARD.nestAliasCoverage +
      SCORECARD.honestyBoundaryStrength +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

export function resolveNestAlias(raw) {
  const v = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
  if (NEST_ALIASES.includes(v) || v === '99') return NEST_RUNTIME_ID;
  return null;
}
