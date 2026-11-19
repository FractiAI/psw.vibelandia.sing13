# NPY ↔ SOD1 Rhyme Validation · empirical report

**Document ID:** `WP-NPY-SOD1-RHYME-VALIDATION-EGS-2026-11-19`
**Registry:** `synthobs-npy-sod1-rhyme-validation-2026-11`
**Seed:** 20261119
**Runtime:** 43 ms
**ENGINE_SHELF pinned:** false

## Verdict

NEW WIRING DISCOVERY: NPY↔SOD1 — STRING-empty PPI catalog edge assembled from existing wet-lab pieces (3 wet-lab + literature bridge). INS↔POMC control 0.947 confirms association lane. Not a new assay we ran; not clinical advice.

Supports unknown follow-up: **true**

Application companion Soft Story / unknown-pair validation on REAL public data (GTEx/MyGene exon panels, live-cached STRING + OpenTargets). INS↔POMC is positive control (known STRING edge) that the rhyme+external lane works. Focus pair must be STRING-empty (unknown). Not ENGINE_SHELF, not causal pathway, not clinical, not wet-lab. Φ_EGS filing grammar only.

## Math lemmas

All lemmas ok: **true**

- `cosine_symmetry`: cos(a,b)===cos(b,a) → **true**
- `zscore_mean_near_zero:chrom_num`: mean(z_chrom_num)≈0 → **true**
- `zscore_mean_near_zero:start`: mean(z_start)≈0 → **true**
- `zscore_mean_near_zero:end`: mean(z_end)≈0 → **true**
- `zscore_mean_near_zero:log_len`: mean(z_log_len)≈0 → **true**
- `zscore_mean_near_zero:exon_index`: mean(z_exon_index)≈0 → **true**
- `zscore_mean_near_zero:strand`: mean(z_strand)≈0 → **true**
- `zscore_mean_near_zero:gene_span`: mean(z_gene_span)≈0 → **true**
- `zscore_mean_near_zero:tss_dist`: mean(z_tss_dist)≈0 → **true**
- `zscore_mean_near_zero:log_cpg_prox`: mean(z_log_cpg_prox)≈0 → **true**
- `zscore_mean_near_zero:near_cpg_n`: mean(z_near_cpg_n)≈0 → **true**

## E1 · Reproduce NPY↔SOD1 exon coupling

Max coupling: **0.8808433120613464**
Best exon pair: `NPY:ex0@chr7:24284189 ↔ SOD1:ex0@chr21:31659692`

## E2 · Null rank + permutation

Focus rank among 45 cross-gene pairs: **#6**
Permutation p: **0.16957605985037408**

| Rank | Pair | Max coupling |
|---:|---|---:|
| 1 | NPY↔POMC | 0.9724371217451511 |
| 2 | DYRK1A↔TMPRSS2 | 0.9364106381501517 |
| 3 | PDX1↔SOD1 | 0.9182408296077225 |
| 4 | PDX1↔POMC | 0.904389900638336 |
| 5 | NPY↔PDX1 | 0.894137918565326 |
| 6 | NPY↔SOD1 | 0.8808433120613464 |
| 7 | APP↔DYRK1A | 0.8500238879792329 |
| 8 | DNMT3A↔DYRK1A | 0.8219958610016821 |
| 9 | INS↔NPY | 0.7929530889172179 |
| 10 | APP↔TMPRSS2 | 0.7738281868063082 |

## E3 · External STRING

Focus NPY↔SOD1 empty: **true** (score 0)
Positive control INS↔POMC: score **0.947** (empty=false)

## E4 · OpenTargets disease rails

### NPY
- type 2 diabetes mellitus: 0.31906010689742653
- Nephropathy: 0.30958255339011065
- nephritis: 0.3031887737162158
- scoliosis: 0.3015821342641413
- diabetes mellitus: 0.2981468896337478
- male reproductive organ cancer: 0.29461711225900294

### SOD1
- amyotrophic lateral sclerosis: 0.8830763002883033
- spastic tetraplegia and axial hypotonia, progressive: 0.6897085227254762
- motor neuron disorder: 0.5951491946885983
- neurodegenerative disease: 0.5546210197019004
- familial amyotrophic lateral sclerosis: 0.5017966940787082
- sporadic amyotrophic lateral sclerosis: 0.49528994500311896

## E5 · Unknown gate (empty STRING required)

Requires STRING empty: **true**
Focus is unknown: **true**
Positive control confirms model: **true**
Gate passes: **true**

Note: Positive control INS↔POMC Soft Story (STRING 0.947) confirms the model; this suite examines UNKNOWN pair NPY↔SOD1.

→ ∞^∞
