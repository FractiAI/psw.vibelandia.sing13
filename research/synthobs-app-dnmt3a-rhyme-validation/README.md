# APP ↔ DNMT3A Rhyme Validation (unknown biology)

**Question:** Does exon rhyme coupling between **APP** and **DNMT3A** clear an *unknown-biology* Soft Story gate — empty STRING literature edge, while a documented positive-control Soft Story (**INS↔POMC**, STRING score **0.947**) confirms the literature rail still works?

**Method:** Reproduce exon feature couplings (E1) · panel null rank + feature-shuffle permutation (E2) · STRING empty focus + INS↔POMC positive control (E3) · OpenTargets Alzheimer (APP ~0.81) vs AML (DNMT3A ~0.86) with little shared (E4) · unknown-gate requiring empty STRING (E5).

**Not:** ENGINE_SHELF · causal pathway proof · clinical effect · wet-lab genetics · medical advice.

INS↔POMC is **not** shipped as a suite on `main`; it appears here only as a cached STRING Soft Story positive-control fixture for contrast.

## Run

```bash
npm run research:synthobs-app-dnmt3a-rhyme-validation
```

Outputs: `data/empirical_report.json` · `data/empirical_report.md`

## Fixtures

- `fixtures/genes.panel.json` / `exons.panel.json` / `PROVENANCE.json` — copied from `synthobs-llm-rhyme-cosmic-genome-expedition`
- `fixtures/string_edges.json` — APP–DNMT3A empty `[]`; INS–POMC positive control score 0.947 / tscore 0.946
- `fixtures/opentargets.json` — live-cached Open Targets (APP Alzheimer ~0.81; DNMT3A AML ~0.86; little shared)

## Honesty

Application companion Soft Story. Φ_EGS is design grammar in honesty rails only. → ∞^∞
