# Tier C Holographic Wiring Lattices — Catalog Suite

**Document ID:** `WP-SYNTHOBS-TIER-C-HOLOGRAPHIC-WIRING-LATTICES-EGS-2026-09-10`
**Registry ID:** `synthobs-tier-c-holographic-wiring-lattices-2026-09`
**Generated:** 2026-09-10T16:40:59.916Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 6 / 6 |
| Φ_EGS | 1.618033988749895 |
| Standalone | https://github.com/FractiAI/synthobs-tier-c-holographic-wiring-lattices |

## Experiments

### E1_phi_egs — Φ_EGS fixture

- **Pass:** `true`
- **Interpretation:** Golden key for wiring hop weights.
- **Honesty:** Not a replacement for ℏ, c, or G.

```json
{
  "id": "E1_phi_egs",
  "title": "Φ_EGS fixture",
  "PHI_EGS": 1.618033988749895,
  "expected": 1.618033988749895,
  "pass": true,
  "interpretation": "Golden key for wiring hop weights.",
  "honesty": "Not a replacement for ℏ, c, or G."
}
```

### E2_wiring_graph_phi_weights — Tier C wiring graph under Φ hop weights

- **Pass:** `true`
- **Interpretation:** Φ-weighted wiring lowers retrieval-entropy proxy vs uniform edge weights (fixture).
- **Honesty:** Archive-graph metric only — not NOAA retrieval physics.

```json
{
  "id": "E2_wiring_graph_phi_weights",
  "title": "Tier C wiring graph under Φ hop weights",
  "nodes": [
    "index",
    "narrative_a",
    "narrative_b",
    "honesty",
    "demo"
  ],
  "nEdges": 7,
  "strength": 3.472135954999579,
  "entropyProxyPhi": 1.8972914666963177,
  "entropyProxyUniform": 1.9459101490553132,
  "pass": true,
  "interpretation": "Φ-weighted wiring lowers retrieval-entropy proxy vs uniform edge weights (fixture).",
  "honesty": "Archive-graph metric only — not NOAA retrieval physics."
}
```

### E3_solar_filing_ar4524_ar4530 — AR4524 (Sol-Alpha) · AR4530 (Sol-Beta) filing anchors

- **Pass:** `true`
- **Interpretation:** Solar characters locked as ambient filing anchors.
- **Honesty:** Filing labels — not heliospheric causation of catalog topology.

```json
{
  "id": "E3_solar_filing_ar4524_ar4530",
  "title": "AR4524 (Sol-Alpha) · AR4530 (Sol-Beta) filing anchors",
  "regions": [
    "AR4524",
    "AR4530"
  ],
  "labels": [
    "Sol-Alpha",
    "Sol-Beta"
  ],
  "pass": true,
  "interpretation": "Solar characters locked as ambient filing anchors.",
  "honesty": "Filing labels — not heliospheric causation of catalog topology."
}
```

### E4_cross_octave_entanglement_weights — Cross-octave entanglement weights Φ^{-Δ}

- **Pass:** `true`
- **Interpretation:** Sol-Beta modulation label — weights shrink with octave distance.
- **Honesty:** Catalog tensor talk — not measured entanglement.

```json
{
  "id": "E4_cross_octave_entanglement_weights",
  "title": "Cross-octave entanglement weights Φ^{-Δ}",
  "hops": [
    {
      "a": 1,
      "b": 3,
      "d": 2,
      "w": 0.3819660112501051
    },
    {
      "a": 2,
      "b": 5,
      "d": 3,
      "w": 0.23606797749978967
    },
    {
      "a": 4,
      "b": 8,
      "d": 4,
      "w": 0.14589803375031543
    }
  ],
  "pass": true,
  "interpretation": "Sol-Beta modulation label — weights shrink with octave distance.",
  "honesty": "Catalog tensor talk — not measured entanglement."
}
```

### E5_paper_present — Paper present with Document ID + honesty

- **Pass:** `true`
- **Interpretation:** Suite docs mirror monorepo paper.
- **Honesty:** Structural presence check.

```json
{
  "id": "E5_paper_present",
  "title": "Paper present with Document ID + honesty",
  "local": "/workspace/research/synthobs-tier-c-holographic-wiring-lattices/docs/SYNTHOBS_TIER_C_HOLOGRAPHIC_WIRING_LATTICES_EGS_2026-09.md",
  "mono": "/workspace/docs/SYNTHOBS_TIER_C_HOLOGRAPHIC_WIRING_LATTICES_EGS_2026-09.md",
  "pass": true,
  "interpretation": "Suite docs mirror monorepo paper.",
  "honesty": "Structural presence check."
}
```

### E6_ship_blog — Ship-blog note references registry id

- **Pass:** `true`
- **Interpretation:** Plain-language note wired to paper.
- **Honesty:** Presence check.

```json
{
  "id": "E6_ship_blog",
  "title": "Ship-blog note references registry id",
  "path": "/workspace/interfaces/blog-tier-c-holographic-wiring-2026-09.html",
  "pass": true,
  "interpretation": "Plain-language note wired to paper.",
  "honesty": "Presence check."
}
```

## Honesty boundary

Catalog / Tier B fixtures under Φ_EGS. Solar AR4524/AR4530 are filing characters only. Does not claim laboratory physics causation or CODATA retirement.
