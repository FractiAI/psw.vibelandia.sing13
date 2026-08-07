export const E_F = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TBME-NARROW-GATE-ASI-2026-08-07';
export const REGISTRY_ID = 'synthobs-tbme-narrow-gate-asi-2026-08';
export const STUDY_TITLE =
  'The Epistemological Horizon · Narrow Gate EIV — Empirical Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_NARROW_GATE_ASI_2026-08.md';
export const PUBLICATION_REF = 'FAI-EPIST-NARROW-GATE-2026-08';

/** Boltzmann (J/K) · SI CODATA. */
export const K_B = 1.380649e-23;
export const T_K = 300;

/** Irreversible baseline dissipation (catalog model J/flop) — ≫ Landauer (~5e8× at 300 K). */
export const IRREVERSIBLE_J_PER_FLOP = 1.42e-12;

/** Post E_F recycling patch — target ~1.07 × Landauer (J/bit model). */
export const POST_PATCH_LANDAUER_MULTIPLIER = 1.07;

/** Gate 1: nested scale populations for E_F balance check. */
export const SCALE_POPULATIONS = [9, 15, 24, 39, 63];

/** Gate 3: compressible catalog payload. */
export const KOLMO_PAYLOAD =
  'EGS'.repeat(81) + 'NSPFRNP'.repeat(13) + 'OMNI'.repeat(34);

export const SOLAR_F107_SFU = 108;
export const SOLAR_AGENTS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
