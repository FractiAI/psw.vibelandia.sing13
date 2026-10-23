# SEX EXPEDITIONS — Expedition 002: The Sensory-to-Behavioral Tuning Architecture Within the Fractal-Holographic Goldilocks Super Intelligent Omniversal Universe

**Document ID:** `WP-SYNTHOBS-SEX-EXPEDITIONS-002-EGS-2026-10-23`
**Registry ID:** `synthobs-sex-expeditions-002-2026-10`
**Generated:** 2026-10-23T20:00:05.145Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 4 / 4 |
| Φ_EGS | 1.618033988749895 |

## Model comparison (synthetic pilot)

| Model | Tracking RMSE ↓ | Mean |Δ| ↓ | Recovery MAE ↓ | Continuity ratio ↑ |
|---|---:|---:|---:|---:|
| Feedforward chain | 0.69 | 0.0726 | 0.4089 | 1 |
| Additive memory | 0.1435 | 0.0862 | 0.041 | 0.99 |
| Feedback controller | 0.2184 | 0.0647 | 0.1123 | 0.998 |
| Recursive multiscale | 0.3615 | 0.0603 | 0.2815 | 1 |
| Recursive ablation | 0.1767 | 0.0729 | 0.0715 | 0.996 |

## Experiments

### E1 — Document locks · Sex Expeditions 002

- **Pass:** `true`
- **Interpretation:** Paper identity, seed, and pilot horizon match Expedition 002 locks.

```json
{
  "id": "E1",
  "title": "Document locks · Sex Expeditions 002",
  "pass": true,
  "docId": "WP-SYNTHOBS-SEX-EXPEDITIONS-002-EGS-2026-10-23",
  "registryId": "synthobs-sex-expeditions-002-2026-10",
  "studyTitle": "SEX EXPEDITIONS — Expedition 002: The Sensory-to-Behavioral Tuning Architecture Within the Fractal-Holographic Goldilocks Super Intelligent Omniversal Universe",
  "seed": 20261023,
  "n_steps": 500,
  "interpretation": "Paper identity, seed, and pilot horizon match Expedition 002 locks."
}
```

### E2 — Synthetic continuity / model-comparison pilot (500 steps)

- **Pass:** `true`
- **Interpretation:** Additive-memory lowest tracking RMSE; recursive multiscale smoother than additive-memory; ablation shows metric trade-offs; continuity ratio uninformative at threshold 0.5.
- **Honesty:** Sex Expeditions Expedition 002 — sensory-to-behavioral tuning architecture · seven-layer catalog · targeted literature synthesis · preliminary 500-step synthetic model comparison (seed 20261023). Pilot scores are illustrative computational fixtures, not human biology or architectural superiority. Database-wide systematic review, benchmark suite, and independent empirical validation remain pending. Application companion (not ENGINE_SHELF). Φ_EGS is design grammar. Autonomy, consent, dignity, and safety remain non-negotiable.

```json
{
  "id": "E2",
  "title": "Synthetic continuity / model-comparison pilot (500 steps)",
  "pass": true,
  "lab": {
    "seed": 20261023,
    "n_steps": 500,
    "disturbance": [
      250,
      299
    ],
    "recovery_window": [
      300,
      399
    ],
    "models": [
      {
        "id": "feedforward",
        "label": "Feedforward chain",
        "tracking_rmse": 0.69,
        "mean_abs_step_change": 0.0726,
        "recovery_mae": 0.4089,
        "continuity_ratio": 1,
        "raw": {
          "tracking_rmse": 0.6900142957573256,
          "mean_abs_step_change": 0.07263859853609092,
          "recovery_mae": 0.40885846621681116,
          "continuity_ratio": 1
        },
        "pass": true,
        "target": {
          "tracking_rmse": 0.69,
          "mean_abs_step_change": 0.0726,
          "recovery_mae": 0.4089
        }
      },
      {
        "id": "additive_memory",
        "label": "Additive memory",
        "tracking_rmse": 0.1435,
        "mean_abs_step_change": 0.0862,
        "recovery_mae": 0.041,
        "continuity_ratio": 0.99,
        "raw": {
          "tracking_rmse": 0.14352209632180873,
          "mean_abs_step_change": 0.0861929784401396,
          "recovery_mae": 0.04096680542381776,
          "continuity_ratio": 0.9899799599198397
        },
        "pass": false,
        "target": {
          "tracking_rmse": 0.1435,
          "mean_abs_step_change": 0.0862,
          "recovery_mae": 0.041
        }
      },
      {
        "id": "feedback",
        "label": "Feedback controller",
        "tracking_rmse": 0.2184,
        "mean_abs_step_change": 0.0647,
        "recovery_mae": 0.1123,
        "continuity_ratio": 0.998,
        "raw": {
          "tracking_rmse": 0.21840455559324887,
          "mean_abs_step_change": 0.06468505503574155,
          "recovery_mae": 0.11229766659230679,
          "continuity_ratio": 0.9979959919839679
        },
        "pass": true,
        "target": {
          "tracking_rmse": 0.2184,
          "mean_abs_step_change": 0.0647,
          "recovery_mae": 0.1123
        }
      },
      {
        "id": "recursive_multiscale",
        "label": "Recursive multiscale",
        "tracking_rmse": 0.3615,
        "mean_abs_step_change": 0.0603,
        "recovery_mae": 0.2815,
        "continuity_ratio": 1,
        "raw": {
          "tracking_rmse": 0.361507365220529,
          "mean_abs_step_change": 0.060335277504151234,
          "recovery_mae": 0.28150599363431417,
          "continuity_ratio": 1
        },
        "pass": true,
        "target": {
          "tracking_rmse": 0.3615,
          "mean_abs_step_change": 0.0603,
          "recovery_mae": 0.2815
        }
      },
      {
        "id": "recursive_ablation",
        "label": "Recursive ablation",
        "tracking_rmse": 0.1767,
        "mean_abs_step_change": 0.0729,
        "recovery_mae": 0.0715,
        "continuity_ratio": 0.996,
        "raw": {
          "tracking_rmse": 0.1766968532650874,
          "mean_abs_step_change": 0.0728981073519803,
          "recovery_mae": 0.07154613520406172,
          "continuity_ratio": 0.9959919839679359
        },
        "pass": true,
        "target": {
          "tracking_rmse": 0.1767,
          "mean_abs_step_change": 0.0729,
          "recovery_mae": 0.0715
        }
      }
    ],
    "findings": {
      "F1_additive_memory_lowest_tracking_rmse": true,
      "F2_recursive_smoother_than_additive_memory": true,
      "F3_recursive_not_best_on_all_metrics": true,
      "F4_ablation_shows_metric_tradeoff": true,
      "F5_continuity_ratio_near_ceiling": true
    },
    "all_pass": true,
    "metrics_all_near_targets": false,
    "honesty": "Synthetic pilot only — not estimates of human sensation, intuition, sexuality, or biological regulation."
  },
  "interpretation": "Additive-memory lowest tracking RMSE; recursive multiscale smoother than additive-memory; ablation shows metric trade-offs; continuity ratio uninformative at threshold 0.5.",
  "honesty": "Sex Expeditions Expedition 002 — sensory-to-behavioral tuning architecture · seven-layer catalog · targeted literature synthesis · preliminary 500-step synthetic model comparison (seed 20261023). Pilot scores are illustrative computational fixtures, not human biology or architectural superiority. Database-wide systematic review, benchmark suite, and independent empirical validation remain pending. Application companion (not ENGINE_SHELF). Φ_EGS is design grammar. Autonomy, consent, dignity, and safety remain non-negotiable."
}
```

### E3 — Finding locks F1–F5 (synthetic pilot only)

- **Pass:** `true`
- **Interpretation:** Pilot findings hold under constructed DGP. They do not establish biological plausibility or architectural superiority on human data.

```json
{
  "id": "E3",
  "title": "Finding locks F1–F5 (synthetic pilot only)",
  "pass": true,
  "findings": {
    "F1_additive_memory_lowest_tracking_rmse": true,
    "F2_recursive_smoother_than_additive_memory": true,
    "F3_recursive_not_best_on_all_metrics": true,
    "F4_ablation_shows_metric_tradeoff": true,
    "F5_continuity_ratio_near_ceiling": true
  },
  "interpretation": "Pilot findings hold under constructed DGP. They do not establish biological plausibility or architectural superiority on human data."
}
```

### E4 — Systematic review & empirical validation status

- **Pass:** `true`
- **Interpretation:** Targeted literature synthesis in the paper is not a completed database-wide systematic review. Independent empirical validation remains pending.

```json
{
  "id": "E4",
  "title": "Systematic review & empirical validation status",
  "pass": true,
  "stages": {
    "systematic_review": "pending · protocol not yet registered",
    "benchmark_suite": "pending",
    "ablation_sensitivity": "pilot ablation only",
    "independent_empirical_validation": "pending"
  },
  "interpretation": "Targeted literature synthesis in the paper is not a completed database-wide systematic review. Independent empirical validation remains pending."
}
```

## Honesty boundary

Sex Expeditions Expedition 002 — sensory-to-behavioral tuning architecture · seven-layer catalog · targeted literature synthesis · preliminary 500-step synthetic model comparison (seed 20261023). Pilot scores are illustrative computational fixtures, not human biology or architectural superiority. Database-wide systematic review, benchmark suite, and independent empirical validation remain pending. Application companion (not ENGINE_SHELF). Φ_EGS is design grammar. Autonomy, consent, dignity, and safety remain non-negotiable.
