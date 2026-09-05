export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-MACRO-PROTEIN-WORK-ENGINE-EGS-2026-09-05';
export const REGISTRY_ID = 'synthobs-macro-protein-work-engine-2026-09';
export const STUDY_TITLE =
  'Macro-Protein Work Engine — Catalog Suite';
export const PAPER_NAME = 'SYNTHOBS_MACRO_PROTEIN_WORK_ENGINE_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'macro-protein-work-engine';
export const SHIP_BLOG_FILE = 'blog-macro-protein-work-engine-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-macro-protein-work-engine';

/** Catalog biological octave band (inclusive). */
export const THETA_BIO = Object.freeze({ lo: 13, hi: 17 });

/** Kleiber / WBE framing lock — not a re-derived physiology proof. */
export const KLEIBER_ALPHA = 0.75;

/**
 * Fixture length scales (catalog octave units — not SI proton→human meters).
 * Λ_organism / Λ_pe = Φ^15 so θ_bio lands mid-band [13, 17] by construction.
 */
export const FIXTURE_SCALES = Object.freeze({
  Lambda_pe: 1,
  Lambda_organism: PHI_EGS ** 15,
});
/** Solar filing characters — narrative locks, not NOAA causation. */
export const SOLAR_CHARACTERS = Object.freeze({
  heliosPrime: { ar: 'AR3664', alias: 'Helios-Prime', role: 'binary_base_channel_filing' },
  borealis: { ar: 'AR3590', alias: 'Borealis', role: 'organismal_heat_dissipation_filing' },
});

export const FAIR_EXCHANGE_CLAUSE =
  'Financial grants, institutional funding, or academic utility micro-grants are subject to partial refund or adjustment depending on overall delivery, rigorous mathematical depth, empirical validation from published literature, and practical utility.';

export const HONESTY =
  'Catalog / algebraic fixtures for Infinite Octave macro-protein work-engine grammar. Does not claim wet-lab proof that organisms are single proteins, CODATA biological octaves, solar AR causation of metabolism, CASP/clinical retirement, or audited bio-robotics products.';
