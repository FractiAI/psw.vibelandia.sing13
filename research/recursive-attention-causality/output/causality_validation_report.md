# Recursive Attention Loop — Causality Validation (Public Data)

**Generated:** 2026-06-24T16:17:46.212531+00:00

## Honesty boundary

**A full causal closure around the entire cycle in one apparatus is not yet demonstrated.**

## Closure verdict

| Full closure one apparatus | `False` |

### Partial path evidence


## Segments

### solar_ap -> geomagnetic_kp

```json
{
  "hop": "solar_ap -> geomagnetic_kp",
  "window": {
    "start": "2021-06-25",
    "end": "2026-06-24",
    "n_days": 1826
  },
  "actual_vs_modelled": {
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
    "p_sham_block_shift": 0.16458852867830423,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat persistence/sham on actuals."
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
      "p_sham_block_shift": 0.8528678304239401,
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
      "p_sham_block_shift": 0.7980049875311721,
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
      "p_sham_block_shift": 0.16458852867830423,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals."
    }
  },
  "interpretation": "Best solar driver: ap (F10.7 preferred for ionospheric coupling)."
}
```

### geomagnetic_kp -> biological_movement

```json
{
  "hop": "geomagnetic_kp -> biological_movement",
  "species": "Alces alces",
  "study": "Snowy Range Moose in Wyoming (2019-2020)",
  "window": {
    "start": "2019-01-01",
    "end": "2020-05-15",
    "n_days": 90
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "walk_forward_nested_ar1",
    "cause_label": "kp",
    "seasonal_controls": true,
    "n": 90,
    "n_oos": 41,
    "best_lag": 4,
    "mse_causal_model": 0.000154831883249916,
    "mse_persistence_null": 0.0001589340542883834,
    "mse_mean_null": 0.0005538347779383787,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 4.102171038467402e-06,
    "p_sham_block_shift": 0.46633416458852867,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat persistence/sham on actuals.",
    "min_train": 49
  },
  "interpretation": "Seasonal AR+Kp vs GPS collar actuals (herbivore proxy)."
}
```

### solar_ssn -> cognitive_proxy (weekly Git commits)

```json
{
  "hop": "solar_ssn -> cognitive_proxy (weekly Git commits)",
  "window": {
    "weeks": 52,
    "granularity": "week"
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "walk_forward_nested_ar1",
    "cause_label": "ssn",
    "seasonal_controls": true,
    "n": 52,
    "n_oos": 24,
    "best_lag": 0,
    "mse_causal_model": 2367.608669932933,
    "mse_persistence_null": 2999.299135307165,
    "mse_mean_null": 3100.9697388986297,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 631.6904653742322,
    "p_sham_block_shift": 0.0773067331670823,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat persistence/sham on actuals.",
    "min_train": 28
  },
  "interpretation": "Seasonal AR+SSN vs weekly commit actuals (studio proxy; confounds possible)."
}
```

### chain f107 -> kp -> movement (composed)

```json
{
  "hop": "chain f107 -> kp -> movement (composed)",
  "window": {
    "start": "2019-01-01",
    "end": "2020-05-15",
    "n_days": 90
  },
  "actual_vs_modelled": {
    "method": "composed_chain_actual_vs_modelled",
    "eval": "walk_forward_nested_ar1",
    "cause_label": "mediator_hat_from_cause",
    "seasonal_controls": true,
    "n": 41,
    "n_oos": 19,
    "best_lag": 4,
    "mse_causal_model": 0.00021626608097370545,
    "mse_persistence_null": 0.00022058983489262464,
    "mse_mean_null": 0.0004928317851708468,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 4.323753918919189e-06,
    "p_sham_block_shift": 0.017456359102244388,
    "tier": "weak_causal_hint",
    "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
    "min_train": 22,
    "stage1": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "cause_to_mediator",
      "seasonal_controls": true,
      "n": 90,
      "n_oos": 41,
      "best_lag": 4,
      "mse_causal_model": 0.8986923631614993,
      "mse_persistence_null": 1.0171994984271713,
      "mse_mean_null": 0.9792709468072779,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 0.11850713526567203,
      "p_sham_block_shift": 0.024875621890547265,
      "tier": "weak_causal_hint",
      "interpretation": "Nested AR+cause model beats seasonal persistence and sham on actuals.",
      "min_train": 49
    },
    "stage2_direct": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "cause_label": "mediator_to_effect",
      "seasonal_controls": true,
      "n": 90,
      "n_oos": 41,
      "best_lag": 4,
      "mse_causal_model": 0.000154831883249916,
      "mse_persistence_null": 0.0001589340542883834,
      "mse_mean_null": 0.0005538347779383787,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 4.102171038467402e-06,
      "p_sham_block_shift": 0.472636815920398,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on actuals.",
      "min_train": 49
    }
  },
  "chain_passes_actual_vs_modelled": true,
  "interpretation": "Two-stage OOS: solar driver -> Kp_hat -> movement vs collar actuals."
}
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
