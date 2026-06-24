# Recursive Attention — Causality Validation

**Doc ID:** `WP-2026-ATTENTION-CAUSALITY-VALIDATION`

## Required standard

**Causality is confirmed by comparing actual observations to modelled predictions.**

A hop is supported when a registered transfer model predicts held-out **actuals** better than:
- **mean null** (predict the average), and
- **sham null** (permuted cause / weaker baseline).

Granger tests and raw correlations are not the primary gate — **actual vs modelled** is.

## Run

```bash
npm run research:recursive-attention-causality
```

## Outputs

- `output/causality_validation_report.json`
- `output/causality_validation_report.md`

## Honesty boundary

Full loop closure requires every temporal hop **and** the full chain to pass actual-vs-modelled on held-out data. Structural repos (egs-nlrf, hgt-psd, ac-hmm, eesm) compare model output to measured actuals vs documented null baselines.
