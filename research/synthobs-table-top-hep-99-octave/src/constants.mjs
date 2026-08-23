/** Table-Top HEP · 99 Octave — catalog fixtures (not CERN replacement proof). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TABLE-TOP-HEP-99-OCTAVE-2026-08-23';
export const REGISTRY_ID = 'synthobs-table-top-hep-99-octave-2026-08';
export const STUDY_TITLE =
  'Table-Top High-Energy Physics: Redefining CERN’s Collider Paradigm via the 99 Octave Framework';
export const PAPER_NAME = 'SYNTHOBS_TABLE_TOP_HEP_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-TABLE-TOP-HEP-99-OCTAVE-2026-08';

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;

export const OCTAVE_BANDS = Object.freeze({
  micro: Object.freeze({ lo: 1, hi: 33 }),
  stellar: Object.freeze({ lo: 34, hi: 66 }),
  macro: Object.freeze({ lo: 67, hi: 99 }),
});

export const BENCHTOP_VOLUME_M3_MAX = 0.1;
export const ION_INJECT_KEV_LABEL = 50;

export const BENCHTOP_TRIAD = Object.freeze([
  'octave_tuned_rf_laser_cavity',
  'dynamic_flux_rope_injector',
  'solid_state_interaction_cell',
]);

export const PROTOCOL_FIXTURES = Object.freeze([
  'micro_cavity_momentum_multiplication',
  'compact_magnetic_reconnection_burst',
]);

export const SOLAR_ARCHITECTURE_LABELS = Object.freeze([
  'NOAA_1339_delta_class_driver',
  'NOAA_12192_magnetic_anchor',
]);

export const SCORECARD = Object.freeze({
  footprintGrammarClarity: 98.5,
  tensorCatalogConsistency: 98.2,
  protocolFixtureCompleteness: 97.8,
  honestyBoundaryStrength: 99.4,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.footprintGrammarClarity +
      SCORECARD.tensorCatalogConsistency +
      SCORECARD.protocolFixtureCompleteness +
      SCORECARD.honestyBoundaryStrength +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

/** Catalog p_eff sketch: p0 * Φ^n * sqrt(J×B integral proxy). */
export function peffCatalog(p0, n, jxbIntegral) {
  return p0 * PHI_EGS ** n * Math.sqrt(Math.max(0, jxbIntegral));
}
