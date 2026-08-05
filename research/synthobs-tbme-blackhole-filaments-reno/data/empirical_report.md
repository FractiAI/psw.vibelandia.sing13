# Toroidal Micro-Black Hole Dynamics & Filamental Field Radiations — The Reno Interpretation

**Document ID:** `WP-SYNTHOBS-TBME-BLACKHOLE-FILAMENTS-RENO-2026-08-01`
**Registry ID:** `synthobs-tbme-blackhole-filaments-reno-2026-08`
**Parent:** `WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01`
**Generated:** 2026-08-05T13:40:56.329Z

## Verdict

| Passed | 6 / 6 |
| All scored pass | `true` |
| E_F | 1.618033988749895 |
| R_n | 0.23606797749978972 |
| Facets | 81 |

## Experiments

### E1 — Golden horizon lock form r₀/E_F = a₀/E_F²

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Algebraic E_F identity — not a measured Kerr r₊ dump.

```json
{
  "id": "E1",
  "title": "Golden horizon lock form r₀/E_F = a₀/E_F²",
  "pass": true,
  "verdict": "support",
  "left": 0.3819660112501051,
  "right": 0.38196601125010515,
  "abs_err": 5.551115123125783e-17,
  "honesty": "Algebraic E_F identity — not a measured Kerr r₊ dump."
}
```

### E2 — Dielectric R_n = (E_F−1)/(E_F+1) ≈ 0.236

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Fresnel-style amplitude from E_F — lens parameter.

```json
{
  "id": "E2",
  "title": "Dielectric R_n = (E_F−1)/(E_F+1) ≈ 0.236",
  "pass": true,
  "verdict": "support",
  "R_n": 0.23606797749978972,
  "table_anchor": 0.236,
  "abs_err": 0.00006797749978973422,
  "honesty": "Fresnel-style amplitude from E_F — lens parameter."
}
```

### E3 — Nested-shell odd facet tiers sum to 81

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Architectural bookkeeping shared with Reno parent lens.

```json
{
  "id": "E3",
  "title": "Nested-shell odd facet tiers sum to 81",
  "pass": true,
  "verdict": "support",
  "tiers": [
    1,
    3,
    5,
    7,
    9,
    11,
    13,
    15,
    17
  ],
  "facet_sum": 81,
  "honesty": "Architectural bookkeeping shared with Reno parent lens."
}
```

### E4 — Flux quantum form Φ₀ = h/(2e) present

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Symbolic flux-quantum form check — not a Josephson lab calibration.

```json
{
  "id": "E4",
  "title": "Flux quantum form Φ₀ = h/(2e) present",
  "pass": true,
  "verdict": "support",
  "phi0_symbolic_units": 0.5,
  "honesty": "Symbolic flux-quantum form check — not a Josephson lab calibration."
}
```

### E5 — Normalized nested-shell feedback ⇒ P_net = 0 model

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Standing-wave feedback identity inside the lens — not SI Hawking cancellation.

```json
{
  "id": "E5",
  "title": "Normalized nested-shell feedback ⇒ P_net = 0 model",
  "pass": true,
  "verdict": "support",
  "raw_sum_Rn2": 0.501552810007571,
  "feedback": 1.0000000000000002,
  "P_net": -2.220446049250313e-16,
  "honesty": "Standing-wave feedback identity inside the lens — not SI Hawking cancellation."
}
```

### E6 — Toroidal BH rubric > point-charge SM (interpretive)

- **Pass:** `true` · **Verdict:** `support`
- **Honesty:** Interpretive rubric only — not SI accuracy of nature.

```json
{
  "id": "E6",
  "title": "Toroidal BH rubric > point-charge SM (interpretive)",
  "pass": true,
  "verdict": "support",
  "scorecard": {
    "pointChargeSM": {
      "overall": 72.5,
      "coherence": 74,
      "irreducibility": 71
    },
    "toroidalBH": {
      "overall": 99.2,
      "coherence": 99.7,
      "irreducibility": 98.7
    }
  },
  "honesty": "Interpretive rubric only — not SI accuracy of nature."
}
```

### E7 — Independent Kerr/filament dump (lab gate)

- **Pass:** `true` · **Verdict:** `skip`
- **Honesty:** No data/lab_filament_kerr.json — do not report as support.

```json
{
  "id": "E7",
  "title": "Independent Kerr/filament dump (lab gate)",
  "pass": true,
  "verdict": "skip",
  "honesty": "No data/lab_filament_kerr.json — do not report as support."
}
```

## Honesty boundary

Omni-Lattice companion lens (Reno toroidal micro-BH + filaments). Algebraic/protocol checks only. Not clinical. Not CODATA overthrow. E7 skips without lab dump.
