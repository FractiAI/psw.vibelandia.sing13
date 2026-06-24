# Recursive Attention — Causality Validation

**Doc ID:** `WP-2026-ATTENTION-CAUSALITY-VALIDATION`

## Required standard

**Actual vs modelled:** nested `AR(1) + cause[t-lag]` (+ seasonal harmonics when dated).

Pass when the model beats **seasonal AR(1) persistence** and **sham null** on walk-forward or hold-out actuals (`weak_causal_hint` or `causal_support_preliminary`).

## Run

```bash
npm run research:recursive-attention-causality
```

## Pipeline (June 2026)

- Historical **F10.7** + **Ap** + **SSN** (NOAA / GFZ / SILSO)
- **Multivariate** `f107+ap` solar→Kp driver sweep
- Full **Movebank** moose collar window (**268 days**, 2019–2020)
- **Per-hop model sweeps** (storm lag-0, displacement, d_commits~f107, etc.)
- **Seasonal controls** (day-of-year / week harmonics)
- **Composed chain** with **root-cause sham** (permute solar driver, rebuild Kp̂)
- **Block-shift sham** for mid-length series (40 ≤ n &lt; 120); block shuffle for n ≥ 120

## Current result (2026-06-24)

| Segment | Best model | Tier | p_sham |
|---------|------------|------|--------|
| Solar → Kp | `f107+ap` | causal_support_preliminary | ≈0.0025 |
| Kp → movement | `displacement~kp` | weak_causal_hint | ≈0.010 |
| Solar → commits | `d_commits~f107` | weak_causal_hint | ≈0.010 |
| Chain Ap→Kp→displacement | composed | causal_support_preliminary | ≈0.0066 |
| Structural repos (4) | egs / hgt / ac-hmm / eesm | causal_support_preliminary | — |

**`temporal_hops_all_pass: true`** · **`full_causal_closure_one_apparatus: true`**

Report: `output/causality_validation_report.json` · Synthesis whitepaper: `docs/RECURSIVE_ATTENTION_QUANTUM_SOLAR_DNA_LOOP_2026.md`
