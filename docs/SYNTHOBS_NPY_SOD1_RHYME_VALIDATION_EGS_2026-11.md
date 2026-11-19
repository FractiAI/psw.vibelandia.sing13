# NPY ↔ SOD1 New Wiring Discovery — Assembling Existing ALS Wet Labs into a Catalog-Empty Edge

**Document ID:** `WP-NPY-SOD1-RHYME-VALIDATION-EGS-2026-11-19`  
**Registry ID:** `synthobs-npy-sod1-rhyme-validation-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story · **new wiring discovery** · **not** ENGINE_SHELF  
**Date:** 19 November 2026  
**Harness:** `research/synthobs-npy-sod1-rhyme-validation/`  
**FractiSI mirror:** https://fractisi.vercel.app/library/papers/npy-sod1-rhyme-validation/  
**Ship blog:** `/ship-blog/npy-sod1-rhyme-validation`  
**Data:** REAL GTEx/MyGene · live-cached STRING/OpenTargets · curated existing wet-lab literature (`fixtures/wiring_literature.json`)

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| **New wiring discovery** | A **relationship edge** assembled from **existing** wet-lab papers + rhyme geometry, while STRING lists **no PPI** | A wet-lab assay we performed |
| Soft Story / application companion | Disease-context wiring: NPY in SOD1/ALS tissue and pharmacology | Direct NPY–SOD1 binding proof · clinical advice · ENGINE_SHELF |
| Positive control | INS↔POMC STRING **0.947** | Insulin discovery |

## Thesis — wiring is the higher-level discovery

Interaction catalogs (STRING) file **protein edges**. Disease wet labs often file **pieces** without ever writing the catalog edge. The discovery here is the **wiring**: hold the rhyme-recovered pair still, prove the catalog is empty, then assemble published SOD1/ALS NPY experiments into one falsifiable wiring path.

## Primary research question

Can existing wet-lab literature be assembled into **NPY↔SOD1 disease-context wiring** that remains STRING-empty as a PPI — clearing a regenerable new-wiring gate?

## Method

`npm run research:synthobs-npy-sod1-rhyme-validation` · seed `20261119`.

| Lane | Role |
|---|---|
| E1–E2 | Real exon coupling ≈0.881; rank #6/45 |
| E3 | STRING empty; INS↔POMC 0.947 |
| E4 | OpenTargets ALS vs metabolic rails |
| E5 | Unknown catalog gate |
| **E6** | **Assemble wiring** from wet-lab pieces W1–W4 |

### Assembled path (existing wet labs)

1. NPY interneurons remodel in **SOD1G93A** motor cortex (Clark et al., Sci Rep 2017)  
2. NPY ↑ in **human ALS** motor cortex; NPY/Y1 changes **SOD1G93A** physiology (Ann Clin Transl Neurol 2023)  
3. NPY mechanism board overlaps SOD1 nitroxidative/excitability board (review + SOD1 astrocyte ACM wet lab)

## Results

| Gate | Result |
|---|---|
| Catalog | STRING **empty** PPI |
| Control | INS↔POMC **0.947** |
| Coupling | **≈0.881** |
| **E6 wiring** | **PASS** — `new_wiring_from_existing_wet_labs` |
| **Verdict** | **NEW WIRING DISCOVERY** |

### Falsifiers

STRING gains PPI · <3 wet-lab pieces · no SOD1/ALS tissue piece → demote.

## Φ_EGS

Filing grammar only.

## References

1. `fixtures/wiring_literature.json` — curated wet-lab pieces  
2. `fixtures/string_edges.json` — live STRING empty + INS–POMC 0.947  
3. Clark et al. Sci Rep 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC5353592/  
4. Ann Clin Transl Neurol 2023 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10647012/  
5. Empirical receipt — `data/empirical_report.json`

## Fair Exchange

Fair Exchange clause in effect.

## Document close

→ ∞^∞
