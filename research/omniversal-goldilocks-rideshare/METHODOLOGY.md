# OGRP Empirical Methodology

**Document ID:** WP-OGRP-2026-07

## Data tiers

| Tier | Source | Use in pipeline |
|------|--------|-----------------|
| **Published economics** | AAA *Your Driving Costs* 2025/2026 | E1 per-mile vehicle operating costs |
| **Published urban freight** | UW Urban Freight Lab summaries | E2 parking cruising fraction (28%) |
| **Analytic model** | EGS overhead $C(x)=x^2-\Phi x$ | E3 minimum and sprawl divergence |
| **Policy arithmetic** | OGRP $\Gamma_{\text{floor}}=\$9$ | E4 break-even tiers |
| **Geospatial gate** | `data/reno_core_bbox.json` | E5 density anchoring samples |
| **Optional field** | `data/field_trial_template.json` | Operator logs — not required for pass |

## Micro-mobility cost model

Operating-only estimate (excludes vehicle purchase when using shared fleet):

```
$/mile = (kWh/mile × $/kWh) + maintenance_amortization
       = (0.03 × 0.12) + 0.0014
       ≈ $0.005/mile
```

Document assumptions when publishing; sensitivity sweep optional.

## Falsification criteria

| Test | Refute if |
|------|-----------|
| E1 | Micro operating cost within 10× of AAA small sedan |
| E2 | Published parking cruise fraction < 10% in cited dense-core studies |
| E3 | Numeric minimum of $C(x)$ not within 5% of $\Phi/2$ |
| E4 | $\Gamma_{\text{floor}}$ net micro yield ≤ 0 at zero miles |
| E5 | Sample core trips fall outside bbox or schema invalid |

## Reproducibility

```bash
npm run empirical
```

From monorepo root:

```bash
npm run research:omniversal-goldilocks-rideshare
```
