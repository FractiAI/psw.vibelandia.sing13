# Recursive Attention — Causality Validation

**Doc ID:** `WP-2026-ATTENTION-CAUSALITY-VALIDATION`

Tests whether public data supports **causal** (not merely correlational) transfer along hops of the recursive attention loop.

## Run

```bash
npm run research:recursive-attention-causality
```

Requires Python 3.10+ and `pip install -r research/recursive-attention-causality/requirements.txt`.

## Methods

- **Granger causality** (statsmodels) with reverse-direction controls
- **Permutation tests** on Pearson r (2000 shuffles)
- **Path correlations** for SSN → Kp → movement (moose GPS, Movebank)

## Honesty boundary

**A full causal closure around the entire cycle in one apparatus is not yet demonstrated.**

Partial findings (June 2026 run): weak Granger hint for sunspot → Kp; correlations at movement and commit proxies without Granger support; EESM within-layer stream ablation only.

## Outputs

- `output/causality_validation_report.json`
- `output/causality_validation_report.md`
