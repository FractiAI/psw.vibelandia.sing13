export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const DOC_ID = 'WP-NPY-SOD1-RHYME-VALIDATION-EGS-2026-11-19';
export const REGISTRY_ID = 'synthobs-npy-sod1-rhyme-validation-2026-11';
export const SEED = 20261119;
export const ENGINE_SHELF_PINNED = false;
export const FOCUS_A = 'NPY';
export const FOCUS_B = 'SOD1';
export const FOCUS_LABEL = 'NPY↔SOD1';
export const STUDY_TITLE = 'NPY ↔ SOD1 Unknown Rhyme Validation';
export const EXON_FEATURE_KEYS = Object.freeze([
  'chrom_num', 'start', 'end', 'log_len', 'exon_index', 'strand', 'gene_span', 'tss_dist', 'log_cpg_prox', 'near_cpg_n',
]);
export const HONESTY =
  'Application companion Soft Story / unknown-pair validation on REAL public data (GTEx/MyGene exon panels, live-cached STRING + OpenTargets). INS↔POMC is positive control (known STRING edge) that the rhyme+external lane works. Focus pair must be STRING-empty (unknown). Not ENGINE_SHELF, not causal pathway, not clinical, not wet-lab. Φ_EGS filing grammar only.';
