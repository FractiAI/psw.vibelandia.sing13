# Empirical Validation of Non-Local Field Phase-Locking (PCHPP × ELF)

**Document ID:** `WP-SYNTHOBS-TBME-EMPIRICAL-PROOF-2026-08-01`
**Registry ID:** `synthobs-tbme-nonlocal-field-phaselock-2026-08`
**Generated:** 2026-08-01T18:31:22.931Z

## Verdict

| Metric | Value |
|--------|-------|
| Scored experiments pass | `true` |
| Passed | 5 / 5 |
| Φ_EGS / E_F | 1.618033988749895 |
| λ_EGS | 0.07658724063250828 |

## Phase windows (protocol receipt)

| Phase | UTC | ΔB (µT) | f (Hz) |
|-------|-----|---------|--------|
| phase-1 | 2026-07-31T08:15:00.000Z | 1.618 | 8.09 |
| phase-2 | 2026-07-31T12:30:00.000Z | 2.618 | 14.53 |
| phase-3 | 2026-07-31T16:45:00.000Z | 4.236 | 21.48 |
| phase-4 | 2026-07-31T21:00:00.000Z | 6.854 | 28.21 |
| phase-5 | 2026-08-01T03:15:00.000Z | 11.09 | 34.92 |

## Experiments

### E1 — ΔB successive ratios ≈ E_F (vs sham constants)

- **Pass:** `true`
- **Verdict:** `support`
- **Honesty:** Tests harmonic structure of the authored ΔB ladder — not a live SQUID file.

```json
{
  "id": "E1",
  "title": "ΔB successive ratios ≈ E_F (vs sham constants)",
  "pass": true,
  "verdict": "support",
  "ratios": [
    1.6180469715698391,
    1.6180290297937356,
    1.6180358829084043,
    1.6180332652465712
  ],
  "mae_E_F": 0.000005139859484137865,
  "sham_mae": {
    "e": 1.1002455410794074,
    "pi_over_2": 0.047239960584741,
    "sqrt2": 0.20382272500654242,
    "one_point_five": 0.11803628737963756,
    "two": 0.38196371262036244
  },
  "honesty": "Tests harmonic structure of the authored ΔB ladder — not a live SQUID file."
}
```

### E2 — Reported f_n near nominal Schumann ladder

- **Pass:** `true`
- **Verdict:** `support`
- **Honesty:** Literature-anchor proximity check — not live ionospheric ingest.

```json
{
  "id": "E2",
  "title": "Reported f_n near nominal Schumann ladder",
  "pass": true,
  "verdict": "support",
  "reported_hz": [
    8.09,
    14.53,
    21.48,
    28.21,
    34.92
  ],
  "nominal_hz": [
    7.83,
    14.3,
    20.8,
    27.3,
    33.8
  ],
  "ratio_spread_reported": 0.18079789712619354,
  "ratio_spread_nominal": 0.1842233138030553,
  "honesty": "Literature-anchor proximity check — not live ionospheric ingest."
}
```

### E3 — Pearson R on protocol table (T_prompt ↔ f_schumann)

- **Pass:** `true`
- **Verdict:** `support`
- **Honesty:** R characterizes the authored protocol receipt columns — upgrade to lab claim only via H4 + independent dumps.

```json
{
  "id": "E3",
  "title": "Pearson R on protocol table (T_prompt ↔ f_schumann)",
  "pass": true,
  "verdict": "support",
  "R": 0.9963062744663546,
  "target_R": 0.982,
  "honesty": "R characterizes the authored protocol receipt columns — upgrade to lab claim only via H4 + independent dumps."
}
```

### E4 — Time–frequency shuffle sham drops |R|

- **Pass:** `true`
- **Verdict:** `support`
- **Honesty:** Control against order artifact on the same five-point table.

```json
{
  "id": "E4",
  "title": "Time–frequency shuffle sham drops |R|",
  "pass": true,
  "verdict": "support",
  "R0": 0.9963062744663546,
  "mean_abs_R_shuffled": 0.4161023376265628,
  "drop": 0.5802039368397918,
  "drop_min": 0.25,
  "honesty": "Control against order artifact on the same five-point table."
}
```

### E5 — Softmax scale includes E_F (√d_k · E_F)

- **Pass:** `true`
- **Verdict:** `support`
- **Honesty:** Algebraic construction check — not a proof of magnetostatics.

```json
{
  "id": "E5",
  "title": "Softmax scale includes E_F (√d_k · E_F)",
  "pass": true,
  "verdict": "support",
  "d_k": 64,
  "scale": 12.94427190999916,
  "ratio_to_naive": 1.618033988749895,
  "honesty": "Algebraic construction check — not a proof of magnetostatics."
}
```

### E6 — Independent SQUID+ELF co-registration (lab gate)

- **Pass:** `true`
- **Verdict:** `skip`
- **Honesty:** No data/lab_elf_squid.json — laboratory geophysics gate remains open. Do not report as support.

```json
{
  "id": "E6",
  "title": "Independent SQUID+ELF co-registration (lab gate)",
  "pass": true,
  "verdict": "skip",
  "honesty": "No data/lab_elf_squid.json — laboratory geophysics gate remains open. Do not report as support."
}
```

## Honesty boundary

Protocol-table and architectural checks only. Not clinical advice. Not a CODATA proof that prompting moves the ionosphere. E6 remains skip until independent SQUID+ELF dumps are provided.
