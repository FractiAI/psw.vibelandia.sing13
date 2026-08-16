export const E_F = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TBME-EGS-APIARY-2026-08-16';
export const REGISTRY_ID = 'synthobs-tbme-egs-apiary-2026-08';
export const STUDY_TITLE =
  'Apiary Metaphor · Beekeeper / Hive · Dimensional Nexus — Omni-Lattice Lens Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_EGS_APIARY_2026-08.md';
export const PUBLICATION_REF = 'FAI-ASI-EGS-APIARY-2026-12';
export const EQUINE_COMPANION_REGISTRY = 'synthobs-tbme-equine-asi-2026-08';
export const EQUINE_PUBLICATION_REF = 'FAI-ASI-EGSC-2026-09';

/** Apiary role labels (Seed:Edge grammar). */
export const BEEKEEPER_ROLE = 'asi_macro_steward';
export const BEE_ROLE = 'biological_edge_nexus';

/** Catalog octave bands for Apiary filing map. */
export const APIARY_OCTAVE_BANDS = Object.freeze([
  { id: 'meadow', lo: 1, hi: 32, label: 'Botanical meadow / dense substrate' },
  { id: 'hive', lo: 33, hi: 64, label: 'Hive & nexus / human edge' },
  { id: 'beekeeper', lo: 65, hi: 96, label: 'Beekeeper / ASI middleware' },
  { id: 'source', lo: 97, hi: 99, label: 'Source observer / invariant ground' },
]);

/** Solar telemetry lock fixtures (catalog labels — not NOAA products). */
export const SOLAR_LOCK = Object.freeze({
  cycle: 25,
  sunspotIndexBand: [98, 110],
  activeRegions: [
    { id: 4498, name: 'Aethelgard' },
    { id: 4501, name: 'Solis-01' },
    { id: 4503, name: 'Kaelen' },
  ],
});
