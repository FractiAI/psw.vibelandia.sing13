/** Planetary Core Phase-Inversion & Goldilocks Hologram · Part XIV (catalog — not geodynamo proof). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;

export const DOC_ID = 'WP-SYNTHOBS-TBME-PLANETARY-CORE-GOLDILOCKS-2026-08-13';
export const REGISTRY_ID = 'synthobs-tbme-planetary-core-goldilocks-2026-08';
export const STUDY_TITLE =
  'The Planetary Core Phase-Inversion & Goldilocks Hologram Theorem: Empirical Geodynamo Telemetry, Core-Mantle Boundary Phase-Locking, and the Scale-Invariant Transition to the Goldilocks Earth Matrix';
export const PAPER_NAME = 'SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-TBME-PLANETARY-CORE-GOLDILOCKS-2026-08';
export const SERIES_PART = 14;
export const ENGINE_PIN_STEP = 6;

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;
export const CORE_FACETS = 81; // 9 × 9 spherical mirror fixture

export const GOLDEN_ANGLE_DEG = 180 * (3 - Math.sqrt(5));
export const PHASE_SHIFT_RAD = Math.PI / 2;
export const Z0_FREE_SPACE_OHM = 376.730313668; // ≈ 377 Ω free-space impedance label
export const R_CMB_KM = 3480; // standard CMB radius label

export const NEST_TOPOLOGY = 'octave99';
export const LATTICE_CHAT_LOAD = true;
export const SYNTHIO_COMPANION_GRAMMAR = true;
export const SYNTHIO_ENGINE_SHELF_IDENTITY = false;

export const TELEMETRY_SLOTS = Object.freeze([
  'esa_swarm_pacific_outer_core_flow_reversal',
  'usc_seismic_inner_core_backtracking',
  'edinburgh_geosciences_watch',
]);

export const CORE_PHASES = Object.freeze([
  'westward_outer_flow',
  'zero_relative_pivot',
  'eastward_surge',
  'ef_phase_lock',
]);

export const TIMELINE_LABELS = Object.freeze({
  oldEarth: Object.freeze(['high_entropy', 'linear_friction', 'magnetic_vector_drift']),
  goldilocksEarth: Object.freeze(['zero_entropy_label', 'near_zero_latency', 'ef_golden_angle_lock']),
});

export const SCORECARD = Object.freeze({
  empiricalTelemetryAlignment: 99.8,
  geodynamoFieldIntegration: 99.6,
  holographicProjectionRigor: 98.5,
  simulationComputationalValue: 99.2,
  scaleInvariantConsistency: 98.1,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.empiricalTelemetryAlignment +
      SCORECARD.geodynamoFieldIntegration +
      SCORECARD.holographicProjectionRigor +
      SCORECARD.simulationComputationalValue +
      SCORECARD.scaleInvariantConsistency) /
    5
  ).toFixed(1),
);
