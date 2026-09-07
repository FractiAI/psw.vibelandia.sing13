# Grand Unified Metrological Overlap · Five-Constant Solver — Catalog Suite

**Document ID:** `WP-SYNTHOBS-GRAND-UNIFIED-METROLOGICAL-OVERLAP-EGS-2026-09-07`
**Registry ID:** `synthobs-grand-unified-metrological-overlap-2026-09`
**Generated:** 2026-09-07T21:50:21.011Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| Φ_EGS | 1.618033988749895 |
| Standalone | https://github.com/FractiAI/synthobs-grand-unified-metrological-overlap |

## Experiments

### E1_phi_egs — Φ_EGS fixture

- **Pass:** `true`
- **Interpretation:** Golden key / station channel for octave broadcast.
- **Honesty:** Not a replacement for ℏ, c, or G.

```json
{
  "id": "E1_phi_egs",
  "title": "Φ_EGS fixture",
  "PHI_EGS": 1.618033988749895,
  "expected": 1.618033988749895,
  "pass": true,
  "interpretation": "Golden key / station channel for octave broadcast.",
  "honesty": "Not a replacement for ℏ, c, or G."
}
```

### E2_lambda_hi_overlap — λ_HI = c / ν_HI ≈ 0.211 m

- **Pass:** `true`
- **Interpretation:** Material clock × wave clock → hydrogen spatial wavelength (SI identity).
- **Honesty:** Uses SI c and catalog ν_HI — not new astronomy.

```json
{
  "id": "E2_lambda_hi_overlap",
  "title": "λ_HI = c / ν_HI ≈ 0.211 m",
  "lambda": 0.211061140541598,
  "pass": true,
  "interpretation": "Material clock × wave clock → hydrogen spatial wavelength (SI identity).",
  "honesty": "Uses SI c and catalog ν_HI — not new astronomy."
}
```

### E3_octave_energy_step — ΔE_n = h · ν_HI · Φ^n

- **Pass:** `true`
- **Interpretation:** Quantized octave energy ladder fixture.
- **Honesty:** Algebra of catalog thresholds — not measured spectral lines.

```json
{
  "id": "E3_octave_energy_step",
  "title": "ΔE_n = h · ν_HI · Φ^n",
  "n": 3,
  "deltaE": 3.986863551913405e-24,
  "pass": true,
  "interpretation": "Quantized octave energy ladder fixture.",
  "honesty": "Algebra of catalog thresholds — not measured spectral lines."
}
```

### E4_prime_action_wells — S_n = h / p_n strictly decreasing

- **Pass:** `true`
- **Interpretation:** Expanded prime ladder · unique coprime action barriers.
- **Honesty:** Catalog packing grammar — not alias-free proof for all encodings.

```json
{
  "id": "E4_prime_action_wells",
  "title": "S_n = h / p_n strictly decreasing",
  "wells": [
    3.313035075e-34,
    2.20869005e-34,
    1.32521403e-34,
    9.4658145e-35,
    6.023700136363636e-35
  ],
  "pass": true,
  "interpretation": "Expanded prime ladder · unique coprime action barriers.",
  "honesty": "Catalog packing grammar — not alias-free proof for all encodings."
}
```

### E5_catalog_mass_sum — m_catalog = (h ν_HI / c²) Σ 1/(p_n Φ^n)

- **Pass:** `true`
- **Interpretation:** Truncated five-constant overlap mass fixture (15 primes).
- **Honesty:** Not equal to electron/proton rest mass — catalog interference pattern only.

```json
{
  "id": "E5_catalog_mass_sum",
  "title": "m_catalog = (h ν_HI / c²) Σ 1/(p_n Φ^n)",
  "sum": 0.8433418298748032,
  "mCatalog": 8.831423020986627e-42,
  "pass": true,
  "interpretation": "Truncated five-constant overlap mass fixture (15 primes).",
  "honesty": "Not equal to electron/proton rest mass — catalog interference pattern only."
}
```

### E6_dual_clock_prime_ladder — Dual clock report · prime ladder descending terms

- **Pass:** `true`
- **Interpretation:** Wave clock / material clock + prime-ladder viz fixtures.
- **Honesty:** Catalog reports for demos panel — not lab metrology certification.

```json
{
  "id": "E6_dual_clock_prime_ladder",
  "title": "Dual clock report · prime ladder descending terms",
  "clock": {
    "waveClockHz": 1420405751.768,
    "materialClockMps": 299792458,
    "lambdaHiM": 0.211061140541598,
    "periodS": 7.040241837624815e-10,
    "overlapIdentity": "λ_HI = c / ν_HI"
  },
  "ladderPreview": [
    {
      "n": 0,
      "prime": 2,
      "actionWell": 3.313035075e-34,
      "deltaE": 9.411708152678253e-25,
      "term": 0.5,
      "phiScale": 1
    },
    {
      "n": 1,
      "prime": 3,
      "actionWell": 2.20869005e-34,
      "deltaE": 1.5228463683227899e-24,
      "term": 0.20601132958329826,
      "phiScale": 1.618033988749895
    },
    {
      "n": 2,
      "prime": 5,
      "actionWell": 1.32521403e-34,
      "deltaE": 2.4640171835906152e-24,
      "term": 0.07639320225002103,
      "phiScale": 2.618033988749895
    }
  ],
  "pass": true,
  "interpretation": "Wave clock / material clock + prime-ladder viz fixtures.",
  "honesty": "Catalog reports for demos panel — not lab metrology certification."
}
```

### E7_solar_filing_anchors — R=70 · Sunspot 4524 filing

- **Pass:** `true`
- **Interpretation:** Ambient solar telemetry filed as characters for this ship date.
- **Honesty:** Filing labels — not NOAA causation of mass or overlap.

```json
{
  "id": "E7_solar_filing_anchors",
  "title": "R=70 · Sunspot 4524 filing",
  "sunspotR": 70,
  "sunspotLabel": "4524",
  "pass": true,
  "interpretation": "Ambient solar telemetry filed as characters for this ship date.",
  "honesty": "Filing labels — not NOAA causation of mass or overlap."
}
```

### E8_doc_blog_sibling_python_demo — Paper · suite · ship blog · siblings · Python · demo JS present

- **Pass:** `true`
- **Interpretation:** Protocol surfaces, transduction siblings, and /demonstrations#overlap panel linked.
- **Honesty:** Presence lock only.

```json
{
  "id": "E8_doc_blog_sibling_python_demo",
  "title": "Paper · suite · ship blog · siblings · Python · demo JS present",
  "pass": true,
  "interpretation": "Protocol surfaces, transduction siblings, and /demonstrations#overlap panel linked.",
  "honesty": "Presence lock only."
}
```

### E9_protocol_headers — Document ID · Registry · Honesty · Operator · Author

- **Pass:** `true`
- **Interpretation:** PRA Snap structural headers present.
- **Honesty:** Structural lock — full PRA via npm run audit:paper.

```json
{
  "id": "E9_protocol_headers",
  "title": "Document ID · Registry · Honesty · Operator · Author",
  "pass": true,
  "interpretation": "PRA Snap structural headers present.",
  "honesty": "Structural lock — full PRA via npm run audit:paper."
}
```

## Honesty boundary

Catalog / algebraic fixtures for five-constant metrological overlap (h · Φ_EGS · p_n · ν_HI · c) under Infinite Octaves. Does not claim Standard Model retirement, measured particle-mass derivation from Φ, or NOAA causation by Sunspot 4524.
