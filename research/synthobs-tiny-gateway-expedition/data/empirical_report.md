# Tiny Gateway: A Reusable Fractal-Holographic Computational Architecture for Language Processing, High-Rate Data Fusion, and Agentic Intelligence

**Expedition:** Tiny Gateway Expedition 001
**Document ID:** `WP-SYNTHOBS-TINY-GATEWAY-EXPEDITION-EGS-2026-11-04`
**Registry ID:** `synthobs-tiny-gateway-expedition-2026-11`
**ENGINE_SHELF:** none (application companion)
**Seed:** 20261104
**Generated:** 2026-11-04T03:40:58.378Z

## Data policy

Tiny Gateway Expedition 001: Experiment B primary = assignment-required civilian synthetic airspace (6 sensors · 180 tracks · 80 steps · 86 400 observations · 18 anomalies). Optional secondary = Movebank GPS + GFZ Kp when available. Language = prime-vault corpus + Hero Leo ledger. Not ATC/ADS-B. Prior conflicting timing/memory figures are not verified baselines.

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 8 / 8 |
| Language sourceMode | `historical_real_corpus_plus_capability_fillers` |
| Fusion sourceMode | `assignment_civilian_synthetic` |
| Engine pin recommended | `false` |
| Φ_EGS | 1.618033988749895 |

## Language (A)

| Arm | Accuracy | Median latency ms | Size bytes |
|-----|---------:|------------------:|-----------:|
| Lightweight | 0.377 | 0.007 | 12298 |
| Micro-Transformer | 0.377 | 0.003 | 147968 |
| Tiny Gateway | 0.585 | 0.021 | 12590 |

## Fusion (B) · assignment synthetic primary

| Pipeline | F1 | Precision | Recall | Runtime ms |
|----------|---:|----------:|-------:|-----------:|
| Conventional | 0.097 | 0.051 | 1.000 | 352.7 |
| Tiny Gateway | 0.097 | 0.051 | 1.000 | 413.4 |

Fixture: {"nSensors":6,"nTracks":180,"nSteps":80,"nObservations":86400,"nAnomalies":18,"expectedObservations":86400}

Assignment params: 6×180×80 = 86400 obs · 18 anomalies

### Historical secondary (Movebank+Kp)

| Pipeline | F1 | Runtime ms |
|----------|---:|-----------:|
| Conventional | 0.261 | 9.3 |
| Tiny Gateway | 0.261 | 14.6 |

## Template binding (C)

| Stage | Median ms | p95 ms | n |
|-------|----------:|-------:|--:|
| Construct | 0.0006 | 0.0021 | 40 |
| Select | 0.0013 | 0.0014 | 200 |
| Bind | 0.0003 | 0.0005 | 200 |
| Execute | 0.0002 | 0.0003 | 200 |
| End-to-end reuse | 0.0031 | 0.0046 | 200 |

## Experiments

### E1_architecture_implemented — Architecture components implemented vs provisional

- **Pass:** `true`

### E2_language_three_way — Language three-way accuracy on shared fixtures

- **Pass:** `true`

### E3_architectural_roles — Language roles probed separately

- **Pass:** `true`

### E4_fusion_assignment_fixture — Fusion fixture executes on assignment civilian synthetic (6×180×80×86400)

- **Pass:** `true`
- **sourceMode:** `assignment_civilian_synthetic`

### E5_fusion_f1_reported — Fusion precision/recall/F1 measured for both pipelines

- **Pass:** `true`

### E6_template_reuse_stages — Template stages timed independently (select/bind/execute)

- **Pass:** `true`

### E7_ablation_runs — Ablation suite completes on synthetic assignment arm

- **Pass:** `true`

### E8_engine_pin_gate — Data-gated engine pin recommendation (expedition ships as application companion)

- **Pass:** `true`
- **Interpretation:** Gates failed (template_reuse_not_competitive_with_rebuild) — application companion only

## Honesty

Tiny Gateway Expedition 001: implements Boundary→Tree→φ-spiral→Honeycomb→Wave–Node–Fq with template binding. Experiment B runs the assignment-required civilian synthetic airspace (6×180×80×86 400) as a first-class arm and optionally reports Movebank+Kp historical fusion. Language compares Tiny Gateway templates vs lightweight NLP vs a pure-JS micro-Transformer — not HuggingFace/GPT. Not AGI, not frontier LLM replacement, not military/ATC radar, not GPU energy proof. Φ_EGS is design grammar. Application companion — not ENGINE_SHELF. Prior conflicting timing/memory figures are not verified.

Standalone: FractiAI/synthobs-tiny-gateway-expedition

→ ∞^∞
