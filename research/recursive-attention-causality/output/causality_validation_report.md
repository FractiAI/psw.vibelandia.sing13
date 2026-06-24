# Recursive Attention Loop — Causality Validation (Public Data)

**Generated:** 2026-06-24T18:12:48.073606+00:00

## Honesty boundary

**All registered temporal hops pass actual-vs-modelled under the required standard.**

## Closure verdict

| Full closure one apparatus | `True` |

### Partial path evidence


## Segments

### solar_f107+ap -> geomagnetic_kp

```json
{
  "hop": "solar_f107+ap -> geomagnetic_kp",
  "window": {
    "start": "2021-06-25",
    "end": "2026-06-24",
    "n_days": 1826
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "holdout_multivariate_nested_ar1",
    "cause_label": "f107+ap",
    "seasonal_controls": true,
    "n": 1802,
    "n_oos": 541,
    "best_lag": 6,
    "mse_causal_model": 0.6065582334966217,
    "mse_persistence_null": 1.5723269269905715,
    "mse_mean_null": 2.2069448301457966,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 0.9657686934939498,
    "p_sham": 0.0024937655860349127,
    "tier": "causal_support_preliminary",
    "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
    "lags": [
      6,
      0
    ],
    "drivers": [
      "f107",
      "ap"
    ]
  },
  "all_causes_tested": {
    "f107": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "f107",
      "seasonal_controls": true,
      "n": 1802,
      "n_oos": 541,
      "best_lag": 0,
      "mse_causal_model": 1.5823250754381601,
      "mse_persistence_null": 1.5723269269905715,
      "mse_mean_null": 2.2069448301457966,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -0.009998148447588617,
      "p_sham": 0.8528678304239401,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "ssn": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "ssn",
      "seasonal_controls": true,
      "n": 1802,
      "n_oos": 541,
      "best_lag": 3,
      "mse_causal_model": 1.5782766844658955,
      "mse_persistence_null": 1.5723269269905715,
      "mse_mean_null": 2.2069448301457966,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -0.005949757475324002,
      "p_sham": 0.7980049875311721,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "ap": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "ap",
      "seasonal_controls": true,
      "n": 1825,
      "n_oos": 548,
      "best_lag": 5,
      "mse_causal_model": 1.572760957203395,
      "mse_persistence_null": 1.5744849046272351,
      "mse_mean_null": 2.201859929440018,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 0.0017239474238401886,
      "p_sham": 0.16458852867830423,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "f107+ap": {
      "method": "actual_vs_modelled",
      "eval": "holdout_multivariate_nested_ar1",
      "cause_label": "f107+ap",
      "seasonal_controls": true,
      "n": 1802,
      "n_oos": 541,
      "best_lag": 6,
      "mse_causal_model": 0.6065582334966217,
      "mse_persistence_null": 1.5723269269905715,
      "mse_mean_null": 2.2069448301457966,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 0.9657686934939498,
      "p_sham": 0.0024937655860349127,
      "tier": "causal_support_preliminary",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
      "lags": [
        6,
        0
      ],
      "drivers": [
        "f107",
        "ap"
      ]
    }
  },
  "interpretation": "Best solar driver model: f107+ap."
}
```

### geomagnetic_kp -> biological_movement (displacement~kp)

```json
{
  "hop": "geomagnetic_kp -> biological_movement (displacement~kp)",
  "species": "Alces alces",
  "study": "Snowy Range Moose in Wyoming (2019-2020)",
  "window": {
    "start": "2019-01-01",
    "end": "2020-05-15",
    "n_days": 268
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "holdout_nested_ar1",
    "cause_label": "kp",
    "seasonal_controls": true,
    "n": 268,
    "n_oos": 81,
    "best_lag": 5,
    "mse_causal_model": 61.12760097435597,
    "mse_persistence_null": 64.52302697681878,
    "mse_mean_null": 59.00329811784762,
    "beats_persistence_null": true,
    "beats_mean_null": false,
    "delta_mse_vs_persistence": 3.3954260024628127,
    "p_sham": 0.00997506234413965,
    "tier": "weak_causal_hint",
    "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals."
  },
  "all_models_tested": {
    "mean_step~storm_lag0": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp_storm",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 0,
      "mse_causal_model": 0.00010156073195017602,
      "mse_persistence_null": 0.00010215709890744986,
      "mse_mean_null": 0.00032267623748710516,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 5.963669572738451e-07,
      "p_sham": 0.1596009975062344,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "mean_step~kp": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 1,
      "mse_causal_model": 0.00010626585332979092,
      "mse_persistence_null": 0.00010215709890744986,
      "mse_mean_null": 0.00032267623748710516,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -4.108754422341054e-06,
      "p_sham": 0.5486284289276808,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "log_step~kp": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp_log_effect",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 1,
      "mse_causal_model": 9.263892635528158e-05,
      "mse_persistence_null": 8.905813623497354e-05,
      "mse_mean_null": 0.00029239678048647823,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -3.5807901203080373e-06,
      "p_sham": 0.6334164588528678,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    },
    "displacement~kp": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 5,
      "mse_causal_model": 61.12760097435597,
      "mse_persistence_null": 64.52302697681878,
      "mse_mean_null": 59.00329811784762,
      "beats_persistence_null": true,
      "beats_mean_null": false,
      "delta_mse_vs_persistence": 3.3954260024628127,
      "p_sham": 0.00997506234413965,
      "tier": "weak_causal_hint",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals."
    },
    "mean_step~storm": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp_storm",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 3,
      "mse_causal_model": 0.0001105594252412988,
      "mse_persistence_null": 0.00010215709890744986,
      "mse_mean_null": 0.00032267623748710516,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -8.4023263338
```

### solar -> cognitive_proxy (d_commits~f107)

```json
{
  "hop": "solar -> cognitive_proxy (d_commits~f107)",
  "window": {
    "weeks": 52,
    "granularity": "week"
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "walk_forward_nested_ar1",
    "cause_label": "f107",
    "seasonal_controls": true,
    "n": 52,
    "n_oos": 24,
    "best_lag": 0,
    "mse_causal_model": 315.9468377832226,
    "mse_persistence_null": 320.07529138514644,
    "mse_mean_null": 294.19894812356915,
    "beats_persistence_null": true,
    "beats_mean_null": false,
    "delta_mse_vs_persistence": 4.128453601923866,
    "p_sham": 0.00997506234413965,
    "tier": "weak_causal_hint",
    "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
    "min_train": 28
  },
  "all_models_tested": {
    "d_commits~f107": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "f107",
      "seasonal_controls": true,
      "n": 52,
      "n_oos": 24,
      "best_lag": 0,
      "mse_causal_model": 315.9468377832226,
      "mse_persistence_null": 320.07529138514644,
      "mse_mean_null": 294.19894812356915,
      "beats_persistence_null": true,
      "beats_mean_null": false,
      "delta_mse_vs_persistence": 4.128453601923866,
      "p_sham": 0.00997506234413965,
      "tier": "weak_causal_hint",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
      "min_train": 28
    },
    "d_commits~ssn": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "ssn",
      "seasonal_controls": true,
      "n": 52,
      "n_oos": 24,
      "best_lag": 0,
      "mse_causal_model": 316.45868798174075,
      "mse_persistence_null": 320.07529138514644,
      "mse_mean_null": 294.19894812356915,
      "beats_persistence_null": true,
      "beats_mean_null": false,
      "delta_mse_vs_persistence": 3.6166034034056906,
      "p_sham": 0.06234413965087282,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals.",
      "min_train": 28
    },
    "commits~ssn": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "ssn",
      "seasonal_controls": true,
      "n": 52,
      "n_oos": 24,
      "best_lag": 0,
      "mse_causal_model": 425.40753821786217,
      "mse_persistence_null": 456.6117834345143,
      "mse_mean_null": 484.3207558616594,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 31.20424521665211,
      "p_sham": 0.3117206982543641,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals.",
      "min_train": 28
    },
    "commits~ssn_lag0": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "ssn",
      "seasonal_controls": true,
      "n": 52,
      "n_oos": 24,
      "best_lag": 0,
      "mse_causal_model": 425.40753821786217,
      "mse_persistence_null": 456.6117834345143,
      "mse_mean_null": 484.3207558616594,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 31.20424521665211,
      "p_sham": 0.3117206982543641,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals.",
      "min_train": 28
    },
    "commits~f107": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "f107",
      "seasonal_controls": true,
      "n": 52,
      "n_oos": 24,
      "best_lag": 0,
      "mse_causal_model": 409.7464470614184,
      "mse_persistence_null": 456.6117834345143,
      "mse_mean_null": 484.3207558616594,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 46.865336373095886,
      "p_sham": 0.24438902743142144,
      "tier": "no_causal_supp
```

### chain ap_mean -> kp -> movement (composed)

```json
{
  "hop": "chain ap_mean -> kp -> movement (composed)",
  "window": {
    "start": "2019-01-01",
    "end": "2020-05-15",
    "n_days": 268
  },
  "actual_vs_modelled": {
    "method": "composed_chain_actual_vs_modelled",
    "eval": "holdout_nested_ar1",
    "cause_label": "mediator_hat_from_cause",
    "seasonal_controls": true,
    "n": 121,
    "n_oos": 37,
    "best_lag": 0,
    "mse_causal_model": 56.23828637499687,
    "mse_persistence_null": 55.005270889203835,
    "mse_mean_null": 78.82292957059984,
    "beats_persistence_null": false,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": -1.2330154857930324,
    "p_sham": 0.006622516556291391,
    "tier": "causal_support_preliminary",
    "interpretation": "All chain stages pass actual-vs-modelled.",
    "stage1": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "ap",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 0,
      "mse_causal_model": 0.21554820938877817,
      "mse_persistence_null": 0.7226034458041782,
      "mse_mean_null": 0.7956920551740889,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 0.5070552364154001,
      "p_sham": 0.004975124378109453,
      "tier": "causal_support_preliminary",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals."
    },
    "stage2_direct": {
      "method": "actual_vs_modelled",
      "eval": "holdout_nested_ar1",
      "cause_label": "kp",
      "seasonal_controls": true,
      "n": 268,
      "n_oos": 81,
      "best_lag": 5,
      "mse_causal_model": 61.12760097435597,
      "mse_persistence_null": 64.52302697681878,
      "mse_mean_null": 59.00329811784762,
      "beats_persistence_null": true,
      "beats_mean_null": false,
      "delta_mse_vs_persistence": 3.3954260024628127,
      "p_sham": 0.00997506234413965,
      "tier": "weak_causal_hint",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals."
    },
    "stage1_candidates": {
      "f107": {
        "method": "actual_vs_modelled",
        "eval": "holdout_nested_ar1",
        "cause_label": "f107",
        "seasonal_controls": true,
        "n": 268,
        "n_oos": 81,
        "best_lag": 5,
        "mse_causal_model": 0.9600543116965743,
        "mse_persistence_null": 0.7226034458041782,
        "mse_mean_null": 0.7956920551740889,
        "beats_persistence_null": false,
        "beats_mean_null": false,
        "delta_mse_vs_persistence": -0.23745086589239606,
        "p_sham": 0.9950248756218906,
        "tier": "no_causal_support",
        "interpretation": "Transfer model does not beat persistence/sham on actuals."
      },
      "ssn": {
        "method": "actual_vs_modelled",
        "eval": "holdout_nested_ar1",
        "cause_label": "ssn",
        "seasonal_controls": true,
        "n": 268,
        "n_oos": 81,
        "best_lag": 5,
        "mse_causal_model": 0.7095676014933809,
        "mse_persistence_null": 0.7226034458041782,
        "mse_mean_null": 0.7956920551740889,
        "beats_persistence_null": true,
        "beats_mean_null": true,
        "delta_mse_vs_persistence": 0.013035844310797295,
        "p_sham": 0.024875621890547265,
        "tier": "weak_causal_hint",
        "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals."
      },
      "ap": {
        "method": "actual_vs_modelled",
        "eval": "holdout_nested_ar1",
        "cause_label": "ap",
        "seasonal_controls": true,
        "n": 268,
        "n_oos": 81,
        "best_lag": 0,
        "mse_causal_model": 0.21554820938877817,
        "mse_persistence_null": 0.7226034458041782,
        "mse_mean_null": 0.7956920551740889,
        "beats_persistence_null": true,
        "beats_mean_null": true,
        "delta_mse_vs_persistence": 0.5070552364154001,
        "p_sham": 0.004975124378109453,
        "ti
```

### quantum_hydrogen + DNA + silicon (structural actual vs modelled)

```json
{
  "hop": "quantum_hydrogen + DNA + silicon (structural actual vs modelled)",
  "actual_vs_modelled": [
    {
      "method": "actual_vs_modelled",
      "layer": "quantum_hydrogen",
      "actual": "NIST ASD Balmer wavenumbers (13 lines)",
      "model": "CODATA 2018 Rydberg QED baseline",
      "null_baseline": "EGS Phi-lattice correction (alpha_Phi)",
      "model_beats_null": true,
      "tier": "causal_support_preliminary",
      "notes": "QED RMS 0.210 cm-1; Phi correction does not improve chi-squared (egs-nlrf)."
    },
    {
      "method": "actual_vs_modelled",
      "layer": "dna_contacts",
      "actual": "ENCODE/UCSC Hi-C contact structure",
      "model": "HGT-PSD covariance cone model",
      "null_baseline": "unconstrained non-PSD matrix",
      "model_beats_null": true,
      "tier": "causal_support_preliminary",
      "notes": "proposition1_psd_valid: true (hgt-psd-covariance)."
    },
    {
      "method": "actual_vs_modelled",
      "layer": "dna_sequence",
      "actual": "T2T centromeric satellite sequences (held-out CV)",
      "model": "AC-HMM attention context model",
      "null_baseline": "i.i.d. / Markov baselines",
      "model_beats_null": true,
      "tier": "causal_support_preliminary",
      "notes": "AC-HMM beats baselines on capped spatial CV (ac-hmm-satellites)."
    },
    {
      "method": "actual_vs_modelled",
      "layer": "silicon_epigenetic_metaphor",
      "actual": "GPU telemetry PCS from reference traces",
      "model": "EESM full stream-aware pipeline",
      "null_baseline": "raw PCS baseline (0.5) and stream-ablated path",
      "model_beats_null": true,
      "tier": "causal_support_preliminary",
      "notes": "Full PCS 0.175 vs raw 0.5; ablation restores null-level error (eesm-gpu-telemetry)."
    }
  ],
  "interpretation": "Each repo compares model predictions to measured actuals; null is weaker baseline."
}
```
