# NPY ↔ SOD1 Rhyme Validation (unknown biology)

**Question:** Does exon rhyme coupling between **NPY** and **SOD1** clear an *unknown-biology* Soft Story gate — empty STRING literature edge, while a documented positive-control Soft Story (**INS↔POMC**, STRING score **0.947**) confirms the literature rail still works?

**Method:** Reproduce exon feature couplings (E1) · panel null rank + feature-shuffle permutation (E2) · STRING empty focus + INS↔POMC positive control (E3) · OpenTargets disease rails (E4) · unknown-gate requiring empty STRING (E5).

**Not:** ENGINE_SHELF · causal pathway proof · clinical effect · wet-lab genetics · medical advice.

INS↔POMC is **not** shipped as a suite on `main`; it appears here only as a cached STRING Soft Story positive-control fixture for contrast.

## Run

```bash
npm run research:synthobs-npy-sod1-rhyme-validation
```

Outputs: `data/empirical_report.json` · `data/empirical_report.md`

## Fixtures

- `fixtures/genes.panel.json` / `exons.panel.json` / `PROVENANCE.json` — copied from `synthobs-llm-rhyme-cosmic-genome-expedition`
- `fixtures/string_edges.json` — NPY–SOD1 empty `[]`; INS–POMC positive control score 0.947 / tscore 0.946
- `fixtures/opentargets.json` — live-cached Open Targets (NPY T2D ~0.32; SOD1 ALS ~0.88; shared neurodegenerative ~0.28)

## Honesty

Application companion Soft Story. Φ_EGS is design grammar in honesty rails only. → ∞^∞
