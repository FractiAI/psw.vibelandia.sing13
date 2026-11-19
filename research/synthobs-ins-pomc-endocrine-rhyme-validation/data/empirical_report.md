# INS ↔ POMC Endocrine Rhyme Validation · empirical report

**Document ID:** `WP-INS-POMC-ENDOCRINE-RHYME-VALIDATION-EGS-2026-11-19`
**Registry:** `synthobs-ins-pomc-endocrine-rhyme-validation-2026-11`
**Seed:** 20261119
**Runtime:** 110 ms
**ENGINE_SHELF pinned:** false

## Verdict

Rhyme recovery + STRING literature association SUPPORTS following INS↔POMC for metabolic (diabetes+obesity) follow-up. Does NOT prove causal pathway or clinical effect. NPY↔SOD1 fails STRING (negative control).

Supports metabolic follow-up: **true**

Application companion Soft Story / endocrine rhyme validation. Not ENGINE_SHELF. Not causal pathway proof. Not clinical effect or medical advice. Not wet-lab genetics. STRING / OpenTargets rows are cached public API fixtures for offline CI. Φ_EGS is design grammar in honesty rails only. Mankind-benefit pick gate uses Soft Story population-burden scores × external STRING × rhyme recovery — triage, not prescription.

## Math lemmas

All lemmas ok: **true**

- `cosine_symmetry`: cos(a,b) === cos(b,a) → **true**
- `zscore_mean_near_zero:chrom_num`: mean(z_chrom_num) ≈ 0 → **true**
- `zscore_mean_near_zero:start`: mean(z_start) ≈ 0 → **true**
- `zscore_mean_near_zero:end`: mean(z_end) ≈ 0 → **true**
- `zscore_mean_near_zero:log_len`: mean(z_log_len) ≈ 0 → **true**
- `zscore_mean_near_zero:exon_index`: mean(z_exon_index) ≈ 0 → **true**
- `zscore_mean_near_zero:strand`: mean(z_strand) ≈ 0 → **true**
- `zscore_mean_near_zero:gene_span`: mean(z_gene_span) ≈ 0 → **true**
- `zscore_mean_near_zero:tss_dist`: mean(z_tss_dist) ≈ 0 → **true**

## E1 · Reproduce INS↔POMC exon coupling

Max coupling: **0.737724**
Best exon pair: `INS:ex2@chr11:2161167` ↔ `POMC:ex2@chr2:25165635`

## E2 · Null rank + permutation

Focus rank among 45 cross-gene pairs: **#13**
Permutation p (feature shuffle): **0.351621** (null mean 0.651171, P95 0.92168)

| Rank | Pair | Max coupling |
|---:|---|---:|
| 1 | NPY↔POMC | 0.972437 |
| 2 | DYRK1A↔TMPRSS2 | 0.936411 |
| 3 | PDX1↔SOD1 | 0.918241 |
| 4 | PDX1↔POMC | 0.90439 |
| 5 | NPY↔PDX1 | 0.894138 |
| 6 | NPY↔SOD1 | 0.880843 |
| 7 | APP↔DYRK1A | 0.850024 |
| 8 | DNMT3A↔DYRK1A | 0.821996 |
| 9 | INS↔NPY | 0.792953 |
| 10 | APP↔TMPRSS2 | 0.773828 |
| 11 | DYRK1A↔SOD1 | 0.77168 |
| 12 | APP↔DNMT3A | 0.745451 |

## E3 · External STRING

| Pair | Role | Score | Empty | ≥0.9 floor |
|---|---|---:|---|---|
| INS↔POMC | focus | 0.947 | false | true |
| APP↔DYRK1A | runner_up | 0.57 | false | false |
| NPY↔SOD1 | negative_control | 0 | true | false |

## E4 · OpenTargets disease rails

### INS · diabetes axis
- diabetes mellitus permanent neonatal: 0.785
- hyperproinsulinemia: 0.742
- MODY: 0.736
- T1D: 0.733
- T2D: 0.591
- diabetes mellitus: 0.589

### POMC · obesity axis
- obesity due to POMC deficiency: 0.697
- obesity disorder: 0.574
- inherited obesity: 0.426

Axes aligned: **true**

## E5 · Mankind-benefit pick gate

Formula: `population_disease_burden_SoftStory × external_STRING × rhyme_recovery`

| Pair | Burden Soft Story | STRING | Rhyme | Gate score |
|---|---:|---:|---:|---:|
| INS↔POMC | 1 | 0.947 | 0.737724 | **0.698625** |
| APP↔DYRK1A | 0.55 | 0.57 | 0.850024 | **0.266482** |
| NPY↔SOD1 | 0.35 | 0 | 0.880843 | **0** |

Winner: **INS↔POMC** (INS↔POMC wins: true)

→ ∞^∞
