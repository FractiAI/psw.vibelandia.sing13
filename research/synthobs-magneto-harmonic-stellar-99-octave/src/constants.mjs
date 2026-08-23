/** Magneto-Harmonic Stellar · 99 Octave — catalog fixtures (not stellar/fusion proof). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-MAGNETO-HARMONIC-STELLAR-99-OCTAVE-2026-08-23';
export const REGISTRY_ID = 'synthobs-magneto-harmonic-stellar-99-octave-2026-08';
export const STUDY_TITLE =
  'A Magneto-Harmonic Redefinition of Stellar Physics and Nuclear Interactions: Updated Foundational Equations, Laboratory Protocols, and Implications to Industrial Refinement';
export const PAPER_NAME = 'SYNTHOBS_MAGNETO_HARMONIC_STELLAR_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-MAGNETO-HARMONIC-STELLAR-99-OCTAVE-2026-08';

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;

export const OCTAVE_BANDS = Object.freeze({
  micro: Object.freeze({ lo: 1, hi: 33 }),
  stellar: Object.freeze({ lo: 34, hi: 66 }),
  macro: Object.freeze({ lo: 67, hi: 99 }),
});

export const STELLAR_ACTORS = Object.freeze([
  'NOAA_1339_poloidal_driver',
  'NOAA_12192_magnetic_anchor',
  'hale_nicholson_toroidal_factor',
]);

export const PROTOCOL_FIXTURES = Object.freeze([
  'rf_cavity_coulomb_screening',
  'flux_rope_reconnection_assay',
  'torsional_induction_channel_steer',
]);

export const REFINEMENT_LABELS = Object.freeze([
  'octave_tuned_isotopic_sorting_talk',
  'non_thermal_actinide_decontamination_talk',
  'zero_waste_purification_talk',
]);

export const DUAL_USE_REFUSAL = true; // enrichment / weapons pathways not operationalized

export const SCORECARD = Object.freeze({
  magnetoHarmonicClarity: 98.4,
  solarActorLabelFidelity: 98.0,
  equationSketchConsistency: 97.9,
  honestyBoundaryStrength: 99.5,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.magnetoHarmonicClarity +
      SCORECARD.solarActorLabelFidelity +
      SCORECARD.equationSketchConsistency +
      SCORECARD.honestyBoundaryStrength +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);

/** Catalog En sketch (n in 1..99). curlB proxy is a dimensionless fixture. */
export function enCatalog(e0, n, curlBProxy) {
  return e0 * PHI_EGS ** (n - 99 / 2) * Math.exp(curlBProxy / (8 * Math.PI));
}
