/**
 * Tiny Gateway Expedition 001 · SLM + High-Rate Radar + Template Binding
 * Infinite Octaves Expedition series · application companion (not ENGINE_SHELF)
 * Builds on Leo Computational Lab prior (language-radar) with assignment-required
 * synthetic civilian airspace as an explicit first-class arm.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const DOC_ID = 'WP-SYNTHOBS-TINY-GATEWAY-EXPEDITION-EGS-2026-11-04';
export const REGISTRY_ID = 'synthobs-tiny-gateway-expedition-2026-11';
export const PAPER_NAME = 'SYNTHOBS_TINY_GATEWAY_EXPEDITION_EGS_2026-11.md';
export const PAPER_FILE = 'docs/SYNTHOBS_TINY_GATEWAY_EXPEDITION_EGS_2026-11.md';
export const SHIP_BLOG_SLUG = 'tiny-gateway-expedition';
export const SHIP_BLOG_FILE = 'blog-tiny-gateway-expedition-2026-11.html';
export const ENGINE_SHELF_SLOT = null;
export const ENGINE_SHELF_PINNED = false;
export const STANDALONE_REPO = 'FractiAI/synthobs-tiny-gateway-expedition';
export const STUDY_TITLE =
  'Tiny Gateway: A Reusable Fractal-Holographic Computational Architecture for Language Processing, High-Rate Data Fusion, and Agentic Intelligence';

export const DIGITAL_SEED = 20261104;
export const VALIDATION_SEED = 202611042;

export const EXPEDITION = 'Tiny Gateway Expedition';
export const EXPEDITION_NUMBER = '001';
export const JOURNEY_HREF = '/journey/tiny-gateway-expedition';
export const BUILDS_ON = Object.freeze([
  'synthobs-tiny-gateway-language-radar-2026-10',
  'synthobs-tiny-gateway-rhyming-templates-2026-11',
  'synthobs-wave-node-mathematics-2026-10',
  'synthobs-trgm-gateway-agent-performance-2026-10',
]);

/** Architecture stack under test (hypothesis — components marked in IMPLEMENTATION_STATUS). */
export const ARCHITECTURE_STACK = Object.freeze([
  'Boundary Node',
  'Recursive Tree',
  'Golden Spiral scale bridge',
  'Honeycomb Lattice',
  'Wave–Node–Fq execution',
  'Template binding',
  'Bound-data execution',
]);

/**
 * Honest status of each named component in this suite.
 * implemented = executable code path used in experiments
 * provisional = present as grammar/scaffold; not independently validated as physics
 */
export const IMPLEMENTATION_STATUS = Object.freeze({
  boundaryNode: 'implemented',
  recursiveTree: 'implemented',
  goldenSpiral: 'implemented_as_phi_scale_bridge',
  honeycombLattice: 'implemented_as_hex_pathway_graph',
  waveNodeFq: 'implemented_as_activation_phase_selector',
  templateBinding: 'implemented',
  execution: 'implemented',
  trainedLlmParity: 'not_claimed',
  gpuEnergyMetering: 'not_available_on_this_harness',
  priorRadarScriptRecovery: 'not_found_in_repo_recreated_from_stated_params',
  fusionAssignmentArm: 'synthetic_civilian_airspace_6x180x80',
  fusionHistoricalArm: 'movebank_gps_plus_gfz_kp_when_available',
  languagePrimaryData: 'prime_vault_corpus_plus_hero_leo_ledger',
  syntheticPolicy: 'assignment_required_civilian_synthetic_plus_optional_historical',
});

/**
 * Assignment-required synthetic civilian airspace shape.
 * Prior conflicting timing/memory figures are NOT treated as verified.
 */
export const RADAR_PARAMS = Object.freeze({
  sensors: 6,
  tracks: 180,
  timeSteps: 80,
  /** 6 × 180 × 80 = 86_400 */
  observations: 86_400,
  anomalyTracks: 18,
  areaKm: 120,
});

/** Preferred historical fusion window (Movebank + Kp) — secondary arm. */
export const REAL_FUSION_WINDOW = Object.freeze({
  startHour: '2019-03-01T00',
  targetSteps: 80,
  study: 'Movebank 2548892515 · Snowy Range Moose',
});

export const LANGUAGE_CAPABILITIES = Object.freeze([
  'intent_recognition',
  'instruction_interpretation',
  'entity_relation_extraction',
  'structured_retrieval',
  'bounded_qa',
  'multi_step_execution',
  'context_retention',
  'paraphrase_recognition',
  'unseen_generalization',
  'new_knowledge_incorporation',
]);

export const HONESTY =
  'Tiny Gateway Expedition 001: implements Boundary→Tree→φ-spiral→Honeycomb→Wave–Node–Fq with template binding. Experiment B runs the assignment-required civilian synthetic airspace (6×180×80×86 400) as a first-class arm and optionally reports Movebank+Kp historical fusion. Language compares Tiny Gateway templates vs lightweight NLP vs a pure-JS micro-Transformer — not HuggingFace/GPT. Not AGI, not frontier LLM replacement, not military/ATC radar, not GPU energy proof. Φ_EGS is design grammar. Application companion — not ENGINE_SHELF. Prior conflicting timing/memory figures are not verified.';

export const NOT_AGI_CLAIM = true;
export const NOT_MILITARY_RADAR = true;
export const NOT_FRONTIER_LLM = true;
export const NOT_ATC_RADAR_CLAIM = true;
export const CIVILIAN_SYNTHETIC_PRIMARY = true;
export const REAL_DATA_SECONDARY = true;
export const LEO_COMPUTATIONAL_LAB = true;
