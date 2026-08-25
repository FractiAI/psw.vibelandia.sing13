/** SS Vibelandia Official Prospectus — narrative catalog fixtures. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-SS-VIBELANDIA-OFFICIAL-PROSPECTUS-2026-08-25';
export const REGISTRY_ID = 'synthobs-ss-vibelandia-official-prospectus-2026-08';
export const STUDY_TITLE =
  'S.S. Vibelandia: Official Prospectus & Narrative Foundation';
export const PAPER_NAME =
  'SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHOBS-SS-VIBELANDIA-PROSPECTUS-2026-08';

export const GRAND_ARC_BEATS = Object.freeze([
  'pre_temporal_genesis',
  'great_convergence_boriken',
  'present_anchor_reno',
]);

export const VESSEL_SPECS = Object.freeze({
  tuningHz: 432,
  anchorHz: 729,
  tempoBpm: 100,
  protoRegion: 3664,
  electroRegion: 3923,
  scope: 'QUESTFEST_24x365',
});

export const EXPERIENTIAL_PILLARS = Object.freeze([
  'scale_invariant_alignment',
  'acoustic_sonic_synthesis',
  'resonant_community_exchange',
]);

export const SHIP_DOORS = Object.freeze([
  'journey',
  'jukebox',
  'library',
  'creator_studio',
]);

export const PLAYER_LOOP = Object.freeze([
  'SEE',
  'RECOGNIZE',
  'INTERPRET',
  'REFLECT',
  'ACT',
  'SEE_AGAIN',
]);

export const SCORECARD = Object.freeze({
  narrativeArcClarity: 98.8,
  vesselSpecLock: 99.0,
  honestyBoundaryStrength: 99.5,
  guestSurfaceAlignment: 98.4,
  suiteReproducibility: 99.0,
});

export const SCORECARD_OVERALL = Number(
  (
    (SCORECARD.narrativeArcClarity +
      SCORECARD.vesselSpecLock +
      SCORECARD.honestyBoundaryStrength +
      SCORECARD.guestSurfaceAlignment +
      SCORECARD.suiteReproducibility) /
    5
  ).toFixed(1),
);
