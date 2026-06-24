# Recursive Attention — Causality Validation

**Doc ID:** `WP-2026-ATTENTION-CAUSALITY-VALIDATION`

## Required standard

**Actual vs modelled:** nested `AR(1) + cause[t-lag]` (+ seasonal harmonics when dated).

Pass when the model beats **seasonal AR(1) persistence** and **block-shift sham** on walk-forward or hold-out actuals.

## Run

```bash
npm run research:recursive-attention-causality
```

## Latest fixes (June 2026)

- Historical **F10.7** (NOAA daily + monthly fill)
- **Ap / F10.7 / SSN** driver sweep for solar→Kp
- **Seasonal controls** (day-of-year) for movement and commits
- **Composed chain** F10.7→Kp̂→movement (two-stage OOS)
- **Block-shift sham** (preserves autocorrelation vs i.i.d. permutation)
- Fixed composed-chain **alignment bug** (was truncating to n=41 incorrectly)

## Current result

| Segment | Tier |
|---------|------|
| Chain F10.7→Kp→movement | weak pass |
| Structural repos (4) | pass |
| Solar→Kp, Kp→movement, SSN→commits (individual) | fail |
| Full loop closure | **not demonstrated** |
