/**
 * INS ↔ POMC endocrine rhyme validation — application companion Soft Story.
 * Not ENGINE_SHELF. Diabetes + obesity mankind-benefit follow-up gate.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-INS-POMC-ENDOCRINE-RHYME-VALIDATION-EGS-2026-11-19';
export const DOCUMENT_ID = DOC_ID;
export const REGISTRY_ID = 'synthobs-ins-pomc-endocrine-rhyme-validation-2026-11';
export const STUDY_TITLE =
  'INS ↔ POMC Endocrine Rhyme Validation — Metabolic Follow-up Gate';
export const PAPER_NAME = 'SYNTHOBS_INS_POMC_ENDOCRINE_RHYME_VALIDATION_EGS_2026-11.md';
export const SHIP_BLOG_SLUG = 'ins-pomc-endocrine-rhyme-validation';
export const SHIP_BLOG_FILE = 'blog-ins-pomc-endocrine-rhyme-validation-2026-11.html';

export const DIGITAL_SEED = 20261119;
export const SEED = DIGITAL_SEED;

/** Application companion Soft Story — explicitly not an Infinite Octaves ENGINE_SHELF pin. */
export const ENGINE_SHELF_PINNED = false;
export const NOT_ENGINE_SHELF = true;

export const FOCUS_PAIR = Object.freeze({ a: 'INS', b: 'POMC', label: 'INS↔POMC' });

/**
 * Mankind-benefit Soft Story rationale: diabetes + obesity population burden.
 * Soft Story score only — not clinical prevalence proof.
 */
export const MANKIND_BENEFIT = Object.freeze({
  pair: 'INS↔POMC',
  axes: Object.freeze(['diabetes', 'obesity']),
  rationale:
    'INS (insulin / diabetes axis) and POMC (melanocortin / obesity axis) jointly address two of the largest metabolic disease burdens. Soft Story population-burden score for pick-gate triage only — not clinical effect size.',
  populationBurdenSoftStory: 1.0,
});

/** Feature columns used for exon rhyme vectors (E1). */
export const EXON_FEATURE_KEYS = Object.freeze([
  'chrom_num',
  'start',
  'end',
  'log_len',
  'exon_index',
  'strand',
  'gene_span',
  'tss_dist',
]);

export const PERMUTE_N = 400;
export const BOOTSTRAP_B = 400;
export const STRING_SUPPORT_FLOOR = 0.9;

export const HONESTY_TOKENS = Object.freeze([
  'application companion',
  'Soft Story',
  'not ENGINE_SHELF',
  'not causal pathway proof',
  'not clinical effect',
  'not wet-lab genetics',
  'diabetes + obesity mankind-benefit Soft Story',
]);

export const HONESTY =
  'Application companion Soft Story / endocrine rhyme validation. Not ENGINE_SHELF. Not causal pathway proof. Not clinical effect or medical advice. Not wet-lab genetics. STRING / OpenTargets rows are cached public API fixtures for offline CI. Φ_EGS is design grammar in honesty rails only. Mankind-benefit pick gate uses Soft Story population-burden scores × external STRING × rhyme recovery — triage, not prescription.';
