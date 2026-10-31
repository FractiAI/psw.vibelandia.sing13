/**
 * Tiny Gateway · Language + High-Rate Radar Fusion
 * Candidate ENGINE_SHELF companion #54 · Homeostasis Expedition follow-on
 * Pin decision is data-gated (enginePinRecommended from measured suite).
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const DOC_ID = 'WP-SYNTHOBS-TINY-GATEWAY-LANGUAGE-RADAR-EGS-2026-10-30';
export const REGISTRY_ID = 'synthobs-tiny-gateway-language-radar-2026-10';
export const PAPER_NAME = 'SYNTHOBS_TINY_GATEWAY_LANGUAGE-RADAR_EGS_2026-10.md';
export const PAPER_FILE = 'docs/SYNTHOBS_TINY_GATEWAY_LANGUAGE_RADAR_EGS_2026-10.md';
export const SHIP_BLOG_SLUG = 'tiny-gateway-language-radar';
export const SHIP_BLOG_FILE = 'blog-tiny-gateway-language-radar-2026-10.html';
/** Candidate shelf order if gates pass (52–53 are meta). Measured gate failed → not pinned. */
export const ENGINE_SHELF_SLOT = 54;
export const ENGINE_SHELF_PINNED = false;
export const STANDALONE_REPO = 'FractiAI/synthobs-tiny-gateway-language-radar';
export const STUDY_TITLE =
  'Tiny Gateway: A Reusable Fractal-Holographic Computational Architecture for Language Processing, High-Rate Data Fusion, and Agentic Intelligence';

export const DIGITAL_SEED = 20261030;
export const VALIDATION_SEED = 202610302;

export const EXPEDITION = 'Homeostasis Expedition';
export const BUILDS_ON = Object.freeze([
  'synthobs-wave-node-mathematics-2026-10',
  'synthobs-tiny-reality-generation-model-2026-10',
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
  fusionPrimaryData: 'movebank_gps_plus_gfz_kp_historical',
  languagePrimaryData: 'prime_vault_corpus_plus_hero_leo_ledger',
  syntheticPolicy: 'fallback_only_when_real_unavailable_and_env_allows',
});

/** Legacy synthetic airspace shape — used ONLY as explicit fallback. */
export const RADAR_PARAMS = Object.freeze({
  sensors: 6,
  tracks: 180,
  timeSteps: 80,
  /** 6 × 180 × 80 = 86_400 */
  observations: 86_400,
  anomalyTracks: 18,
  areaKm: 120,
});

/** Preferred historical fusion window (Movebank + Kp). */
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
  'Tiny Gateway · Leo Computational Lab: real/historical public data first (Movebank GPS + GFZ Kp fusion; prime-vault corpus + Hero Leo ledger NLP). Synthetic airspace/NLP only if real sources missing and TINY_GATEWAY_ALLOW_SYNTHETIC=1. Compares Boundary→Tree→φ-spiral→Honeycomb→Wave–Node–Fq vs conventional lightweight NLP and a pure-JS micro-Transformer. Not AGI, not frontier LLM replacement, not military/ATC radar (no ADS-B in-repo — wildlife GPS+Kp is the real substitute), not GPU energy proof. Φ_EGS is design grammar. Engine pin is data-gated.';

export const NOT_AGI_CLAIM = true;
export const NOT_MILITARY_RADAR = true;
export const NOT_FRONTIER_LLM = true;
export const NOT_ATC_RADAR_CLAIM = true;
/** @deprecated — synthetic is no longer the default; kept false for honesty. */
export const CIVILIAN_SYNTHETIC_ONLY = false;
export const REAL_DATA_PRIORITY = true;
export const LEO_COMPUTATIONAL_LAB = true;
