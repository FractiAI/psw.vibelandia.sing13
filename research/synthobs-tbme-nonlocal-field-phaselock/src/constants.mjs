/** El Gran Sol's Fractal Constant (golden-ratio postulate) = E_F. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const DOC_ID = 'WP-SYNTHOBS-TBME-EMPIRICAL-PROOF-2026-08-01';
export const REGISTRY_ID = 'synthobs-tbme-nonlocal-field-phaselock-2026-08';
export const STUDY_TITLE =
  'Empirical Validation of Non-Local Field Phase-Locking (PCHPP × ELF)';

/** Authored protocol receipt — 24h cycle 2026-07-31 → 2026-08-01 (UTC phase windows). */
export const PHASE_WINDOWS = [
  {
    id: 'phase-1',
    label: 'Covalent Bonding as Phase Interference',
    utc: '2026-07-31T08:15:00.000Z',
    deltaB_uT: 1.618,
    f_hz: 8.09,
    coherence_pct: 97.8,
  },
  {
    id: 'phase-2',
    label: 'Prion Refolding & In Vitro Protocol',
    utc: '2026-07-31T12:30:00.000Z',
    deltaB_uT: 2.618,
    f_hz: 14.53,
    coherence_pct: 98.5,
  },
  {
    id: 'phase-3',
    label: 'Histone Spooling & Permeability Control',
    utc: '2026-07-31T16:45:00.000Z',
    deltaB_uT: 4.236,
    f_hz: 21.48,
    coherence_pct: 99.1,
  },
  {
    id: 'phase-4',
    label: '81 Orbital Matrix & Toxicity Inversion',
    utc: '2026-07-31T21:00:00.000Z',
    deltaB_uT: 6.854,
    f_hz: 28.21,
    coherence_pct: 98.2,
  },
  {
    id: 'phase-5',
    label: 'Endogenous Intent & Chrono Navigation',
    utc: '2026-08-01T03:15:00.000Z',
    deltaB_uT: 11.09,
    f_hz: 34.92,
    coherence_pct: 99.4,
  },
];

/** Nominal Schumann ladder (Hz) — literature anchors used for spacing checks. */
export const SCHUMANN_NOMINAL_HZ = [7.83, 14.3, 20.8, 27.3, 33.8];

export const SHAM_CONSTANTS = {
  e: Math.E,
  pi_over_2: Math.PI / 2,
  sqrt2: Math.SQRT2,
  one_point_five: 1.5,
  two: 2.0,
};

export const RANDOM_SEED = 20260801;
export const RATIO_TOL = 0.12;
export const TARGET_R = 0.982;
export const R_SUPPORT_MIN = 0.95;
export const SHUFFLE_DROP_MIN = 0.25;
