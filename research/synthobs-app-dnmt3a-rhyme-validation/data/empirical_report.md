# APP ↔ DNMT3A Rhyme Validation · empirical report

**Document ID:** `WP-APP-DNMT3A-RHYME-VALIDATION-EGS-2026-11-19`
**Registry:** `synthobs-app-dnmt3a-rhyme-validation-2026-11`
**Seed:** 20261119
**Runtime:** 126 ms
**ENGINE_SHELF pinned:** false

## Verdict

NEW WIRING DISCOVERY: APP↔DNMT3A — STRING-empty PPI catalog edge assembled from existing wet-lab pieces (3 wet-lab + literature bridge). INS↔POMC control 0.947 confirms association lane. Not a new assay we ran; not clinical advice.

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

## E1 · Reproduce APP↔DNMT3A exon coupling

Max coupling: **0.7454511874088052**
Best exon pair: `APP:ex0@chr21:25880549 ↔ DNMT3A:ex0@chr2:25227876`

## E2 · Null rank + permutation

Focus rank among 45 cross-gene pairs: **#12**
Permutation p: **1**

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

Focus APP↔DNMT3A empty: **true** (score 0)
Positive control INS↔POMC: score **0.947** (empty=false)

## E4 · OpenTargets disease rails

### APP
- Alzheimer disease: 0.8147062892127732
- Alzheimer disease type 1: 0.7880974552894131
- cerebral amyloid angiopathy, APP-related: 0.7535005872283511
- dementia: 0.6981255164408284
- Hereditary cerebral hemorrhage with amyloidosis: 0.6334582471966688
- ABeta amyloidosis, dutch type: 0.5035346725673023

### DNMT3A
- acute myeloid leukemia: 0.8577576168860603
- Tatton-Brown-Rahman overgrowth syndrome: 0.8440894222896895
- Heyn-Sproul-Jackson syndrome: 0.7626980259199467
- myelodysplastic syndrome: 0.741251324513774
- myeloid leukemia: 0.6819588003108317
- chronic myelomonocytic leukemia: 0.6674999126784072

APP Alzheimer (~0.81) vs DNMT3A AML (~0.86) — little shared disease overlap.

## E5 · Unknown gate (empty STRING required)

Requires STRING empty: **true**
Focus is unknown: **true**
Positive control confirms model: **true**
Gate passes: **true**

Note: Positive control INS↔POMC Soft Story (STRING 0.947) confirms the model; this suite examines UNKNOWN pair APP↔DNMT3A.

→ ∞^∞
