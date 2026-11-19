# Combo Rhyme Wiring Expedition — Protein-Folding + LLM + Pilot Rhymes Surface New Wiring Candidates

**Document ID:** `WP-COMBO-RHYME-WIRING-EXPEDITION-EGS-2026-11-20`  
**Registry ID:** `synthobs-combo-rhyme-wiring-expedition-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition · **not** ENGINE_SHELF  
**Date:** 20 November 2026  
**Harness:** `research/synthobs-combo-rhyme-wiring-expedition/`  
**Ship blog:** `/ship-blog/combo-rhyme-wiring`  
**Data:** REAL `data/RHYME_DISCOVERY_CATALOG.json` · live-cached STRING panel (2026-11-19)  

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story expedition | Merge protein-folding + LLM + Pilot discovery catalogs; classify genome partners with live STRING; surface **new STRING-empty** wiring candidates | ENGINE_SHELF · wet-lab we ran · clinical advice |
| Positive control | INS↔POMC STRING **0.947** | Insulin discovery |
| Prior companions | NPY↔SOD1 / APP↔DNMT3A excluded from “new” | Claim those were unknown again |

## Abstract

**Question.** If we combine protein-folding, LLM, and Pilot rhymes, do new wiring candidates surface beyond already-filed pairs?  
**Answer.** Yes. On the locked unified catalog + live STRING panel, two **new STRING-empty** candidates clear the coupling floor: **NPY↔PDX1** (≈0.747, LLM) and **APP↔TMPRSS2** (≈0.707, Pilot). Cross-rhyme recoveries include NPY↔SOD1, INS↔POMC, APP↔DYRK1A (STRING 0.57 — not empty), and DNMT1↔DNMT3A (0.999 — rediscovery). Protein-folding rhyme attests the long-range partner grammar (≥5 AWARE contacts in catalog).

## Primary research question

Does a combo of protein-folding + LLM + Pilot rhymes surface **new STRING-empty wiring candidates** on real discovery catalogs?

## Method

`npm run research:synthobs-combo-rhyme-wiring-expedition` · seed `20261120`.

| Lane | Action |
|---|---|
| E1 | Load unified RHYME_DISCOVERY_CATALOG |
| E2 | Merge genome partners across LLM + Pilot |
| E3 | STRING-classify panel; require INS↔POMC ≥0.9 |
| E4 | New empty candidates (not prior companions; coupling ≥0.5) |
| E5 | Protein-folding AWARE long-range contact attestation |
| E6 | Combo wiring discovery gate |

## Results

| Class | Pairs |
|---|---|
| **New STRING-empty** | **NPY↔PDX1**, **APP↔TMPRSS2** |
| Cross-rhyme | NPY↔SOD1, INS↔POMC, APP↔DYRK1A, DNMT1↔DNMT3A |
| STRING control | INS↔POMC **0.947** |
| Protein grammar | AWARE long-range contacts attested |
| **Verdict** | **COMBO WIRING EXPEDITION PASS** |

### Wet-lab neighborhood notes (assembly, not our assays)

- **NPY↔PDX1:** β-cell developmental/functional literature places NPY in immature β cells and PDX1 as identity TF — disease-context wiring candidate.  
- **APP↔TMPRSS2:** thinner bridge (TMPRSS2 in AD/DS CSF contexts) — speculative triage only.

### Falsifiers

STRING fills an empty candidate → demote. Coupling collapses on catalog regen → demote. Wet-lab neighborhood fails citation check → keep as rhyme-only hit, not wiring.

## Methods reproducibility

```bash
npm run research:synthobs-combo-rhyme-wiring-expedition
```

Inputs: `data/RHYME_DISCOVERY_CATALOG.json`, `fixtures/string_panel.json`, `fixtures/wiring_new_candidates.json`.  
Output: `data/empirical_report.json`.

## Φ_EGS

Filing grammar only.

## References

1. `data/RHYME_DISCOVERY_CATALOG.json`  
2. `research/synthobs-combo-rhyme-wiring-expedition/fixtures/string_panel.json`  
3. Wiring wet lab framework — `docs/SYNTHOBS_WIRING_DISCOVERIES_RHYMING_WORLD_MODEL_EGS_2026-11.md`  
4. JCI Insight NPY β-cell — https://doi.org/10.1172/jci.insight.94005  
5. NPY β-cell system — https://doi.org/10.1210/endocr/bqab070  
6. TMPRSS2 in DS/AD — https://link.springer.com/article/10.1186/s40478-026-02289-9  
7. Pilot / LLM / Cosmic rhyme papers in `docs/`

## Fair Exchange

Fair Exchange clause in effect.

## Document close

→ ∞^∞
