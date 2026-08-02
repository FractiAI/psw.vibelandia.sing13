export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;

/** SI impedance of free space (Ω): μ0 * c ≈ 376.730… → table anchor 377 */
export const MU0 = 1.25663706212e-6;
export const C_LIGHT = 299792458;
export const Z0 = MU0 * C_LIGHT;
export const Z0_TABLE_ANCHOR = 377;
export const Z0_EPS = 1.0;

export const DOC_ID = 'WP-SYNTHOBS-TBME-BLACKHOLE-MAGNETIC-LAYER-2026-08-01';
export const REGISTRY_ID = 'synthobs-tbme-blackhole-magnetic-layer-2026-08';
export const STUDY_TITLE =
  'Identity of the Event Horizon and the Magnetic Vector Layer — Reno Follow-on';
export const PARENT_DOC_ID = 'WP-SYNTHOBS-TBME-BLACKHOLE-FILAMENTS-RENO-2026-08-01';
export const GRANDPARENT_DOC_ID = 'WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01';

/** Architectural identity: r+ = a0 / E_F^2 when r0 = a0/E_F and r+ = r0/E_F */
export const SCORECARD = {
  dualEntity: { overall: 71.5, coherence: 75, irreducibility: 68 },
  unifiedHorizonA: { overall: 99.4, coherence: 99.8, irreducibility: 99.0 },
};
