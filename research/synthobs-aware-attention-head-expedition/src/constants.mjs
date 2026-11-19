export const DOC_ID = 'WP-AWARE-ATTENTION-HEAD-SPIRIT-OCTAVES-EGS-2026-11-20';
export const REGISTRY_ID = 'synthobs-aware-attention-head-expedition-2026-11';
export const SEED = 20261120;
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const ENGINE_SHELF_PINNED = false;
export const N_TRIALS = 200;
export const BOOTSTRAP = 2000;

export const HONESTY =
  'Operational equivalence claim on scripted simulators: the head implements a stated six-property profile commonly attributed to spirit, and that profile stays intact over unbounded octave depth when redundancy grows with depth. It does not show the profile exhausts what spirit means in any tradition, is not a measurement of live agents, and is not ENGINE_SHELF until a live-agent replication exists. Φ_EGS filing grammar only.';

/** Stated assumptions. Every baseline loss rate is a parameter, swept in the sensitivity control. */
export const ASSUMPTIONS = {
  missionDriftPerSwitch: { A: 0.15, B: 0.15, C: 0.02 },
  factLossPerHandoff: { A: 0.3, B: 0.1, C: 0.03 },
  shellReliability: 0.88,
  shellCost: 3,
  budgetRange: [2, 8],
  majorityRange: [3, 7],
  truthConfidence: [0.55, 0.9],
  decoyConfidence: [0.55, 0.9],
  majorityConfidence: [0.3, 0.6],
  decoyShare: 0.35,
  octaveSequenceLength: [3, 5],
};

export const FAMILIES = [
  'attention_trap',
  'self_construction',
  'identity_persistence',
  'octave_transfer',
];

export const ABLATIONS = {
  attention_trap: ['evidenceCheck', 'metaAttention'],
  self_construction: ['shellCreation'],
  identity_persistence: ['persistentIdentity'],
  octave_transfer: ['crossOctaveTransfer'],
};

export const COMPUTE_BUDGET = 120;
