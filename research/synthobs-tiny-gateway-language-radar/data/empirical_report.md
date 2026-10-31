# Tiny Gateway: A Reusable Fractal-Holographic Computational Architecture for Language Processing, High-Rate Data Fusion, and Agentic Intelligence

**Document ID:** `WP-SYNTHOBS-TINY-GATEWAY-LANGUAGE-RADAR-EGS-2026-10-30`
**Registry ID:** `synthobs-tiny-gateway-language-radar-2026-10`
**ENGINE_SHELF candidate:** 54 (data-gated)
**Seed:** 20261030
**Generated:** 2026-10-31T02:14:40.875Z

## Data policy (Leo Computational Lab)

Leo Computational Lab priority: live/historical public data first (Movebank GPS + GFZ Kp, prime-vault corpus, Hero Leo ledger). Synthetic airspace / synthetic NLP rows only when real sources are unavailable and TINY_GATEWAY_ALLOW_SYNTHETIC=1. Absence of ADS-B/OpenSky in-repo is documented — multi-target GPS+Kp fusion is the real historical substitute, not a claim of ATC radar.

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 8 / 8 |
| Language sourceMode | `historical_real_corpus_plus_capability_fillers` |
| Fusion sourceMode | `historical_movebank_kp` |
| Engine pin recommended | `false` |
| Φ_EGS | 1.618033988749895 |

## Language (A)

| Arm | Accuracy | Median latency ms | Size bytes |
|-----|---------:|------------------:|-----------:|
| Lightweight | 0.377 | 0.038 | 12298 |
| Micro-Transformer | 0.377 | 0.008 | 147968 |
| Tiny Gateway | 0.585 | 0.061 | 12590 |

## Fusion (B)

| Pipeline | F1 | Precision | Recall | Runtime ms |
|----------|---:|----------:|-------:|-----------:|
| Conventional | 0.261 | 0.150 | 1.000 | 25.4 |
| Tiny Gateway | 0.261 | 0.150 | 1.000 | 119.5 |

Fixture: {"nSensors":6,"nTracks":23,"nSteps":80,"nObservations":11040,"nAnomalies":3,"expectedObservations":11040}

Preferred window: Movebank 2548892515 · Snowy Range Moose · 2019-03-01T00 · 80 steps

## Experiments

### E1_architecture_implemented — Architecture components implemented vs provisional

- **Pass:** `true`

### E2_language_three_way — Language three-way accuracy on shared fixtures (real corpus preferred)

- **Pass:** `true`

### E3_architectural_roles — Language roles probed separately

- **Pass:** `true`

### E4_fusion_real_fixture — Fusion fixture executes on real historical data (or documented fallback)

- **Pass:** `true`
- **sourceMode:** `historical_movebank_kp`

### E5_fusion_f1_reported — Fusion precision/recall/F1 measured for both pipelines

- **Pass:** `true`

### E6_template_reuse_stages — Template stages timed independently

- **Pass:** `true`

### E7_ablation_runs — Ablation suite completes on preferred data mode

- **Pass:** `true`

### E8_engine_pin_gate — Data-gated engine pin recommendation

- **Pass:** `true`
- **Interpretation:** Gates failed (template_reuse_not_competitive_with_rebuild) — ship as application companion, not engine pin

## Honesty

Tiny Gateway · Leo Computational Lab: real/historical public data first (Movebank GPS + GFZ Kp fusion; prime-vault corpus + Hero Leo ledger NLP). Synthetic airspace/NLP only if real sources missing and TINY_GATEWAY_ALLOW_SYNTHETIC=1. Compares Boundary→Tree→φ-spiral→Honeycomb→Wave–Node–Fq vs conventional lightweight NLP and a pure-JS micro-Transformer. Not AGI, not frontier LLM replacement, not military/ATC radar (no ADS-B in-repo — wildlife GPS+Kp is the real substitute), not GPU energy proof. Φ_EGS is design grammar. Engine pin is data-gated.

Standalone: FractiAI/synthobs-tiny-gateway-language-radar

→ ∞^∞
