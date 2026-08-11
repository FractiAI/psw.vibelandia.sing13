/** Synchronized subterranean discharge · Puracé + Colombia seismic · 99 Octave application (not Omni TOC). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-SYNC-SUBTERRANEAN-DISCHARGE-99-OCTAVE-2026-08-11';
export const REGISTRY_ID = 'synthobs-sync-subterranean-discharge-99-octave-2026-08';
export const STUDY_TITLE =
  'Synchronized Subterranean Discharge: Puracé + 2026 Seismic Cluster through Solar-Driven Phase-Locking';
export const PAPER_NAME = 'SYNTHOBS_SYNC_SUBTERRANEAN_DISCHARGE_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNC-SUBTERRANEAN-DISCHARGE-99-OCTAVE-2026-08';

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT; // 8019

/** Narrative fixtures — verify against USGS / SGC before any operational use. */
export const COLOMBIA_SEISMIC_FIXTURE = Object.freeze({
  region: 'Western Colombia',
  magnitude: 7.4,
  date: '2026-08-10',
  note: 'Chocó / western Colombia narrative',
});

export const PURACE_VOLCANO_FIXTURE = Object.freeze({
  name: 'Puracé',
  department: 'Cauca',
  alert: 'orange',
  concurrentWithSeismic: true,
});

export const DISCHARGE_PATHS = Object.freeze(['seismic', 'volcanic']);
export const NEST_TOPOLOGY = 'octave99';
