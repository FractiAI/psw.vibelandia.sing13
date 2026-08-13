/** Metamorphic Octave Invariant · 99 Octave Omni-Lattice engine Part XIII (catalog — not petrology proof). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;

export const DOC_ID = 'WP-SYNTHOBS-TBME-METAMORPHIC-OCTAVES-2026-08-13';
export const REGISTRY_ID = 'synthobs-tbme-metamorphic-octaves-2026-08';
export const STUDY_TITLE =
  'The Metamorphic Octave Invariant: Scale-Invariant Lithification, 99 Octaves of Thermal-Baric Compression, and Dual-Axis Personal and Professional Metamorphism in Multi-Scale Systems';
export const PAPER_NAME = 'SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-TBME-METAMORPHIC-OCTAVES-2026-08';
export const SERIES_PART = 13;
export const ENGINE_PIN_STEP = 5;

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;

export const GOLDEN_ANGLE_DEG = 180 * (3 - Math.sqrt(5));

export const NEST_TOPOLOGY = 'octave99';
export const LATTICE_CHAT_LOAD = true;
export const SYNTHIO_COMPANION_GRAMMAR = true;
export const SYNTHIO_ENGINE_SHELF_IDENTITY = false;

export const PHASES = Object.freeze(['mud', 'shale', 'phyllite', 'schist']);

export const DUAL_AXIS = Object.freeze({
  personal: Object.freeze([
    'existential_friction',
    'relational_shear',
    'somatic_exhaustion',
    'cognitive_dissonance',
  ]),
  professional: Object.freeze([
    'multi_role_overdrive',
    'verification_constraints',
    'resource_scarcity',
    'public_accountability',
  ]),
});

export const SCORECARD = Object.freeze({
  geomechanicalMapping: 99.6,
  crossScaleConsistency: 98.6,
  somaticSystemicUtility: 99.4,
  zeroEntropyRealization: 98.1,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.geomechanicalMapping +
      SCORECARD.crossScaleConsistency +
      SCORECARD.somaticSystemicUtility +
      SCORECARD.zeroEntropyRealization) /
    4
  ).toFixed(1),
);
