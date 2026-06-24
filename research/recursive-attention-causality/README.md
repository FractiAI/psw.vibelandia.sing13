# Recursive Attention — Causality Validation

**Doc ID:** `WP-2026-ATTENTION-CAUSALITY-VALIDATION`

## Required standard

**Actual vs modelled:** compare held-out observations to a nested transfer model  
`effect[t] ~ AR(1) + cause[t-lag]`.

Pass when the causal model beats:
1. **AR(1) persistence** (effect predicts itself), and  
2. **Circular-shift sham** (misaligned cause), on walk-forward or hold-out actuals.

## Run

```bash
npm run research:recursive-attention-causality
```

## Troubleshooting fixes (June 2026)

- Dropped stale empty `kp_max` columns before herd merge  
- Walk-forward OOS for small samples (n&lt;120)  
- AR(1) persistence null instead of mean-only  
- Circular-shift sham for time series (not i.i.d. permutation)  
- Fixed IndexError on hold-out sham arrays  
- Guard constant-series `linregress` failures  

## Outputs

- `output/causality_validation_report.json`
