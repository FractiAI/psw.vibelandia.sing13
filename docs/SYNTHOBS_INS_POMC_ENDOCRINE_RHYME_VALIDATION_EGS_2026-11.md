# INS ↔ POMC Endocrine Rhyme Validation — Highest-Benefit Partner Follow-Up

**Document ID:** `WP-INS-POMC-ENDOCRINE-RHYME-VALIDATION-EGS-2026-11-19`  
**Registry ID:** `synthobs-ins-pomc-endocrine-rhyme-validation-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition · **not** Infinite Octaves ENGINE_SHELF  
**Date:** 19 November 2026  
**Harness:** `research/synthobs-ins-pomc-endocrine-rhyme-validation/`  
**Ship blog:** `/ship-blog/ins-pomc-endocrine-rhyme-validation`  
**Upstream:** Pilot Rhyme / LLM Rhyme theater catalogs (`INS:ex2 ↔ POMC:ex2`, coupling ≈ 0.74)

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story / application companion | Follow-up validation of a rhyme-recovered gene pair chosen for **population metabolic stakes** (insulin ↔ appetite peptide) | ENGINE_SHELF pin · wet-lab genetics · clinical advice |
| Empirical (Level 2–3) | Regenerable Node lab on public GTEx/MyGene exon panels + **cached** STRING / OpenTargets fixtures + executable math lemmas | Level 5 clinical trial · causal pathway proof |
| External association | STRING literature-association score for INS–POMC | Experimental evidence score (STRING `escore` is 0 on the cached edge) |
| Negative control | NPY↔SOD1 recovers geometrically but **empty** STRING network | Proof that geometry alone is biology |

## Why this pair (mankind-benefit pick)

Among Pilot/LLM theater partners, three metabolic/neuro candidates competed for a detailed validation expedition:

| Pair | Rhyme coupling (lab) | STRING | OpenTargets disease rails | Soft Story population stake |
|---|---:|---:|---|---|
| **INS ↔ POMC** | ≈ 0.74 | **0.947** | diabetes axis · obesity axis | Diabetes + obesity at planetary scale |
| APP ↔ DYRK1A | ≈ 0.85 | 0.57 | Alzheimer / neurodevelopment Soft Story | High burden, weaker external edge |
| NPY ↔ SOD1 | ≈ 0.88 | **empty** | — | Geometry without literature edge |

**Pick:** INS ↔ POMC. Gate score = Soft Story population burden × STRING × rhyme recovery → **0.699** vs APP–DYRK1A **0.266** vs NPY–SOD1 **0**. Insulin and POMC sit on the glucose ↔ appetite peptide axis that already shapes paychecks, grocery bills, and clinic schedules for hundreds of millions of people. That is the highest direct human-stakes follow-up among the named theater partners that can be tested with public data today.

## Primary research question

Does the rhyme-recovered **INS ↔ POMC** exon partnership survive a three-lane validation — (1) computational re-coupling on real public exon panels, (2) external STRING / OpenTargets association rails, (3) executable math lemmas on the coupling operator — enough to **support metabolic follow-up**, without upgrading Soft Story into unfinished biology?

## Method

Suite: `npm run research:synthobs-ins-pomc-endocrine-rhyme-validation` · seed `20261119`.

| Lane | What it does |
|---|---|
| **E1** | Reproduce best cross-gene INS↔POMC exon coupling on GTEx/MyGene panel features |
| **E2** | Rank among all cross-gene pairs in the 10-gene panel; feature-shuffle permutation null |
| **E3** | Cached STRING edges: INS–POMC vs APP–DYRK1A vs NPY–SOD1 |
| **E4** | Cached OpenTargets disease rails: INS diabetes axis · POMC obesity axis |
| **E5** | Mankind-benefit pick gate (burden Soft Story × STRING × rhyme) |
| **Math** | Cosine symmetry; z-score column means ≈ 0 (executable lemmas) |

Fixtures: `fixtures/genes.panel.json`, `exons.panel.json`, `string_ins_pomc.json`, `opentargets_ins_pomc.json`, `PROVENANCE.json`.

## Results

| Experiment | Result | Qualification |
|---|---|---|
| **E1** | Max coupling **0.7377** · `INS:ex2@chr11:2161167` ↔ `POMC:ex2@chr2:25165635` | Reproduces the upstream theater hit |
| **E2** | Rank **#13 / 45** · permutation p ≈ **0.35** | Geometry alone does **not** crown INS–POMC inside this panel |
| **E3** | STRING INS–POMC **0.947** (tscore 0.946); APP–DYRK1A 0.57; NPY–SOD1 **empty** | Literature association validates the pick; experimental channel is 0 |
| **E4** | INS → diabetes rails (e.g. T1D 0.733, T2D 0.591); POMC → obesity rails (deficiency 0.697, obesity 0.574) | Axes align with the mankind-benefit Soft Story |
| **E5** | INS↔POMC gate winner | Triage score, not a prescription |
| **Math** | All lemmas **ok** | Operator hygiene, not a biology theorem |

**Verdict:** **SUPPORTED for metabolic follow-up triage.** Rhyme recovery + strong STRING literature association + aligned OpenTargets disease rails justify examining INS↔POMC in detail. The computational geometry null does **not** claim uniqueness; NPY↔SOD1 is the negative control that geometry can recover without an external edge. This does **not** prove a causal pathway, a clinical effect, or a wet-lab mechanism.

## Φ_EGS / catalog

Architectural key only: $\Phi_{\mathrm{EGS}}=(1+\sqrt{5})/2$. Soft Story filing grammar — not a CODATA claim and not a biological constant.

## Methods detail

- Seed: `20261119`. Panel: 10 genes · 125 exons.
- Features: `chrom_num`, `start`, `end`, `log_len`, `exon_index`, `strand`, `gene_span`, `tss_dist` (z-scored; cosine partners).
- External APIs cached at suite authoring for offline CI (STRING network · OpenTargets GraphQL).
- Reproduce: `npm run research:synthobs-ins-pomc-endocrine-rhyme-validation`.
- Receipt: `research/synthobs-ins-pomc-endocrine-rhyme-validation/data/empirical_report.json`.
- Tests: `node --test tests/research/ins-pomc-endocrine-rhyme-validation.test.mjs`.

## References

1. Upstream Pilot Rhyme theater catalog — `docs/SYNTHOBS_PILOT_RHYME_EXPEDITION_EGS_2026-11.md` · `/whitepaper/pilot-rhyme-expedition`
2. LLM Rhyme Cosmic/Genome expedition — `docs/SYNTHOBS_LLM_RHYME_COSMIC_GENOME_EXPEDITION_EGS_2026-11.md` · `/whitepaper/llm-rhyme-cosmic-genome`
3. STRING API (cached) — `https://string-db.org/` · INS–POMC network edge score 0.947
4. OpenTargets Platform API (cached) — disease associations for ENSG00000254647 (INS) · ENSG00000115138 (POMC)
5. GTEx / MyGene exon panels — suite `fixtures/PROVENANCE.json`
6. Beyond CRISPR Soft Story companion — `docs/SYNTHOBS_BEYOND_CRISPR_BIOLOGICAL_DISCOVERY_EGS_2026-10.md`

## Fair Exchange

Fair Exchange clause in effect for this Soft Story filing and repository configuration.

## Document close

→ ∞^∞
