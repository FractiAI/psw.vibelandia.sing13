# APP ↔ DNMT3A New Wiring Discovery — Assembling Epigenetic Wet Labs into a Catalog-Empty Edge

**Document ID:** `WP-APP-DNMT3A-RHYME-VALIDATION-EGS-2026-11-19`  
**Registry ID:** `synthobs-app-dnmt3a-rhyme-validation-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story · **new wiring discovery** · **not** ENGINE_SHELF  
**Date:** 19 November 2026  
**Harness:** `research/synthobs-app-dnmt3a-rhyme-validation/`  
**Ship blog:** `/ship-blog/app-dnmt3a-rhyme-validation`  
**Data:** REAL GTEx/MyGene · live-cached STRING/OpenTargets · curated existing wet-lab literature

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| **New wiring discovery** | Regulatory/epigenetic **wiring** assembled from existing DNMT3A→APP wet labs while STRING PPI is empty | A CRISPR run we performed · PPI binding · approved therapy |
| Soft Story | Cross-domain Alzheimer ↔ epigenetic-writer wiring | ENGINE_SHELF |
| Positive control | INS↔POMC STRING **0.947** | Insulin discovery |

## Thesis — wiring is the higher-level discovery

dCas9-DNMT3A already methylates APP in published mice. DNMT activity already tunes Aβ in APP cells. Those are **pieces**. The discovery is filing them as **APP↔DNMT3A wiring** against a STRING-empty PPI catalog — a higher-level relational claim with kill switches.

## Primary research question

Can existing wet labs be assembled into **APP↔DNMT3A regulatory wiring** that remains STRING-empty as PPI?

## Method

Same E1–E5 grammar as NPY↔SOD1 · **E6 wiring assembly** · seed `20261119`.

### Assembled path

1. dCas9-DNMT3A methylates APP promoter; rescues APP-KI pathology (Transl Neurodegener 2022)  
2. DNMT activity tunes Aβ in N2a-APP cells (IJMS 2015)  
3. DNMT3A homeostasis required in 5xFAD cognitive/amyloid benefits (PMC13437123)  
4. APP owns Alzheimer OpenTargets rail (~0.81)

## Results

| Gate | Result |
|---|---|
| Coupling | **≈0.745** |
| STRING | **empty** |
| Control | **0.947** |
| **E6 wiring** | **PASS** |
| **Verdict** | **NEW WIRING DISCOVERY** |

### Falsifiers

STRING PPI appears · no DNMT3A→APP locus piece · methylation without DNMT3A identity → demote.

## Φ_EGS

Filing grammar only.

## References

1. `fixtures/wiring_literature.json`  
2. `fixtures/string_edges.json`  
3. Transl Neurodegener 2022 — https://link.springer.com/article/10.1186/s40035-022-00314-0  
4. IJMS 2015 — https://www.mdpi.com/1422-0067/16/10/25002  
5. PMC13437123 — https://pmc.ncbi.nlm.nih.gov/articles/PMC13437123/  
6. `data/empirical_report.json`

## Fair Exchange

Fair Exchange clause in effect.

## Document close

→ ∞^∞


## Methods reproducibility appendix

Reproduce offline:

```bash
npm run research:synthobs-app-dnmt3a-rhyme-validation
```

Inputs (all public / cached):

- `fixtures/exons.panel.json` · `fixtures/genes.panel.json` — GTEx/MyGene real panel  
- `fixtures/string_edges.json` — live STRING species=9606 cache (2026-11-19)  
- `fixtures/opentargets.json` — live OpenTargets GraphQL cache  
- `fixtures/wiring_literature.json` — curated existing wet-lab pieces with roles and falsifiers  

Outputs:

- `data/empirical_report.json` · `data/empirical_report.md`  

Seed `20261119` locks permutation draws. Math lemmas (`cosine` symmetry; z-score column means ≈ 0) must report `ok: true`.

## Discussion — what “new wiring” changes

Protein-interaction catalogs answer a narrow question. Regulatory wet labs answer another. When rhyme geometry recovers APP↔DNMT3A and STRING stays empty while dCas9-DNMT3A→APP papers already exist, the honest product is a **wiring edge**: a falsifiable assembly of published experiments into a relationship the PPI catalog does not list. That upgrades triage without pretending we ran CRISPR.

If STRING later fills the edge, reclassify as rediscovery wiring. If the locus piece fails citation check, fail E6. Those are features.

## Abstract (restated)

**Question.** Can existing DNMT3A→APP wet labs be assembled into regulatory wiring that remains STRING-empty as PPI?  
**Answer.** Yes on the locked receipt: coupling ≈0.745, STRING empty, INS↔POMC 0.947, E6 PASS → **new wiring discovery**.

