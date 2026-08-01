# Holographic Mirror-Angle Multiplicity and Quantum Re-Interpretation of Collapse

**Document ID:** `WP-SYNTHOBS-TBME-SUPERPOSITION-MIRROR-FULL-REV2-2026-08-01`
**Registry ID:** `synthobs-tbme-mirror-angle-multiplicity-2026-08`
**Generated:** 2026-08-01T18:35:54.473Z

## Verdict

| Passed | 6 / 6 |
| All scored pass | `true` |
| E_F | 1.618033988749895 |
| θ_EGS (deg) | 137.50776405003785 |
| Facets | 81 |

## Experiments

### E1 — Golden angle θ_EGS = 360 / E_F²

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Algebraic golden-angle identity — architectural key, not lab QM overthrow.

```json
{
  "id": "E1",
  "title": "Golden angle θ_EGS = 360 / E_F²",
  "pass": true,
  "verdict": "support",
  "theta_EGS_deg": 137.50776405003785,
  "table_anchor_deg": 137.508,
  "abs_err_vs_table": 0.00023594996216047548,
  "sham_e_err": 88.78729803481943,
  "honesty": "Algebraic golden-angle identity — architectural key, not lab QM overthrow."
}
```

### E2 — MAE(measured, predicted) on protocol intensity table

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Protocol-table fidelity — not archived LiNbO₃ / SQUID binary dumps.

```json
{
  "id": "E2",
  "title": "MAE(measured, predicted) on protocol intensity table",
  "pass": true,
  "verdict": "support",
  "mae": 0.0013333333333333342,
  "max_allowed": 0.01,
  "honesty": "Protocol-table fidelity — not archived LiNbO₃ / SQUID binary dumps."
}
```

### E3 — Mid-angle I₁ ≈ E_F / 2

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Links mid facet weight to golden half — schedule property of the receipt.

```json
{
  "id": "E3",
  "title": "Mid-angle I₁ ≈ E_F / 2",
  "pass": true,
  "verdict": "support",
  "predicted_I1": 0.809,
  "measured_I1": 0.808,
  "E_F_over_2": 0.8090169943749475,
  "honesty": "Links mid facet weight to golden half — schedule property of the receipt."
}
```

### E4 — Angle series variance ≫ Copenhagen flat 50/50

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Shows the protocol receipt is angle-dependent; Copenhagen column is constant by construction.

```json
{
  "id": "E4",
  "title": "Angle series variance ≫ Copenhagen flat 50/50",
  "pass": true,
  "verdict": "support",
  "variance_measured_I1": 0.04192866666666667,
  "variance_flat": 0,
  "honesty": "Shows the protocol receipt is angle-dependent; Copenhagen column is constant by construction."
}
```

### E5 — Orbital singularity matrix facet cardinality = 81 = 9×9

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Architectural 81-register identity shared with Omni-Lattice / EGS papers.

```json
{
  "id": "E5",
  "title": "Orbital singularity matrix facet cardinality = 81 = 9×9",
  "pass": true,
  "verdict": "support",
  "facet_count": 81,
  "honesty": "Architectural 81-register identity shared with Omni-Lattice / EGS papers."
}
```

### E6 — Round-trip θ_EGS → 0 restores 50/50 (ΔS=0 model)

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Model reversibility on the schedule — not a claim of zero laboratory entropy production.

```json
{
  "id": "E6",
  "title": "Round-trip θ_EGS → 0 restores 50/50 (ΔS=0 model)",
  "pass": true,
  "verdict": "support",
  "at_zero": {
    "I1": 0.5,
    "I2": 0.5
  },
  "at_egs": {
    "I1": 1,
    "I2": 0
  },
  "honesty": "Model reversibility on the schedule — not a claim of zero laboratory entropy production."
}
```

### E7 — Independent interferometry dump (lab gate)

- **Pass:** `true` · **Verdict:** `skip`
- **Honesty:** No data/lab_interferometry.json — do not report as support.

```json
{
  "id": "E7",
  "title": "Independent interferometry dump (lab gate)",
  "pass": true,
  "verdict": "skip",
  "honesty": "No data/lab_interferometry.json — do not report as support."
}
```

## Honesty boundary

Omni-Lattice companion lens. Protocol-table + algebraic checks. Not clinical. Not CODATA overthrow of laboratory QM. E7 skips without lab dump.
