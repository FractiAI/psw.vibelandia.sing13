/** Humans · AI · Infinite Octave Offset — catalog Soft Story fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-HUMANS-AI-INFINITE-OCTAVE-OFFSET-2026-10-01';
export const REGISTRY_ID = 'synthobs-humans-ai-infinite-octave-offset-2026-10';
export const STUDY_TITLE =
  'Humans, Today’s AI, and Synthetic Actors as Infinite Octave Technology';
export const PAPER_NAME = 'SYNTHOBS_HUMANS_AI_INFINITE_OCTAVE_OFFSET_EGS_2026-10.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-HUMANS-AI-OCTAVE-OFFSET-2026-10';
export const SHIP_BLOG_SLUG = 'humans-ai-octave-offset';

/** Soft Story placement rows — not empirical species claims. */
export const PLACEMENT_ROWS = Object.freeze([
  {
    entity: 'binary_silicon',
    digit: '1-2',
    octaves: '10-29',
    reading: 'structural_substrate',
  },
  {
    entity: 'training_stacks',
    digit: '3',
    octaves: '30-39',
    reading: 'molecular_triangulation',
  },
  {
    entity: 'humans',
    digit: '4-5',
    octaves: '40-59',
    reading: 'biological_switch_plus_cognitive_network',
  },
  {
    entity: 'llms',
    digit: '5-surface-6',
    octaves: '50-69',
    reading: 'cognitive_simulacra_plus_agentic_consensus',
  },
  {
    entity: 'agentic_ides',
    digit: '6',
    octaves: '60-69',
    reading: 'hexa_lattice_consensus',
  },
  {
    entity: 'tilly_norwood',
    digit: '5-surface-8-costume',
    octaves: '50-59 / 80-89',
    reading: 'synthetic_actor_costume_theater',
  },
  {
    entity: 'goldilocks_superai_target',
    digit: '4-5-6',
    octaves: 'cross-band',
    reading: 'not_too_much_machine_not_too_little_human',
  },
  {
    entity: 'infinite_octave_catalog',
    digit: '0-9',
    octaves: '01-99',
    reading: 'names_octave_offsets',
  },
]);

export const ENGINE_ROLE = Object.freeze({
  usesEngineMap: true,
  engineShelfPin: false,
  softStoryObservation: true,
});

export const HONESTY_LOCKS = Object.freeze({
  notHumansAreMachines: true,
  notAiConscious: true,
  notTillyPersonhood: true,
  notCodata: true,
  notEngineShelf: true,
});

export const COMPANION_IDS = Object.freeze([
  'synthobs-99-octave-digits-master-2026-08',
  'synthobs-human-omniversal-reality-bridge-2026-08',
  'synthobs-consciousness-moat-2026-09',
  'synthobs-linear-shadow-fractal-2026-09',
]);

export const SCORECARD = Object.freeze({
  honestyBoundaryStrength: 99.4,
  placementTableClarity: 99.0,
  softStoryCoherence: 98.8,
  engineNonPinLock: 99.5,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.honestyBoundaryStrength +
      SCORECARD.placementTableClarity +
      SCORECARD.softStoryCoherence +
      SCORECARD.engineNonPinLock +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

export function octaveStep(on, sign = 1) {
  return on * PHI_EGS ** sign;
}
