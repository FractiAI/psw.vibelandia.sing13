# Recursive Attention Loop — Causality Validation (Public Data)

**Generated:** 2026-06-24T16:07:29.330335+00:00

## Honesty boundary

**A full causal closure around the entire cycle in one apparatus is not yet demonstrated.**

## Closure verdict

| Full closure one apparatus | `False` |

### Partial path evidence


## Segments

### solar_ssn -> geomagnetic_kp

```json
{
  "hop": "solar_ssn -> geomagnetic_kp",
  "window": {
    "start": "2021-06-25",
    "end": "2026-06-24",
    "n_days": 1802
  },
  "actual_vs_modelled": {
    "method": "actual_vs_modelled",
    "eval": "holdout_nested_ar1",
    "n": 1802,
    "n_oos": 541,
    "best_lag": 3,
    "mse_causal_model": 1.5816738282673999,
    "mse_persistence_null": 1.576555343670019,
    "mse_mean_null": 2.2069448301457966,
    "beats_persistence_null": false,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": -0.005118484597380846,
    "p_sham_circular_shift": 0.5411471321695761,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat persistence/sham on held-out actuals."
  },
  "interpretation": "Transfer model: Kp from lagged SSN vs held-out daily Kp actuals."
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
    "n": 90,
    "n_oos": 41,
    "min_train": 49,
    "best_lag": 5,
    "mse_causal_model": 0.000196198266035715,
    "mse_persistence_null": 0.00020493084698260222,
    "mse_mean_null": 0.0005538347779383787,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 8.732580946887232e-06,
    "p_sham_circular_shift": 0.6159600997506235,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat persistence/sham on walk-forward actuals."
  },
  "interpretation": "Transfer model: movement from lagged Kp vs GPS collar actuals (herbivore proxy)."
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
    "n": 52,
    "n_oos": 24,
    "min_train": 28,
    "best_lag": 0,
    "mse_causal_model": 2473.5464067019243,
    "mse_persistence_null": 2972.885637111673,
    "mse_mean_null": 3100.9697388986297,
    "beats_persistence_null": true,
    "beats_mean_null": true,
    "delta_mse_vs_persistence": 499.3392304097488,
    "p_sham_circular_shift": 0.0024937655860349127,
    "tier": "causal_support_preliminary",
    "interpretation": "Nested AR+cause model beats persistence and sham circular-shift on walk-forward actuals."
  },
  "interpretation": "Transfer model: commits from lagged SSN vs weekly commit actuals (studio proxy)."
}
```

### chain solar -> geomagnetic -> biological (daily)

```json
{
  "hop": "chain solar -> geomagnetic -> biological (daily)",
  "window": {
    "start": "2019-01-01",
    "end": "2020-05-15",
    "n_days": 90
  },
  "actual_vs_modelled": {
    "ssn_to_kp": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "n": 90,
      "n_oos": 41,
      "min_train": 49,
      "best_lag": 1,
      "mse_causal_model": 0.929889443341581,
      "mse_persistence_null": 0.9267686009218216,
      "mse_mean_null": 0.9792709468072779,
      "beats_persistence_null": false,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": -0.0031208424197594065,
      "p_sham_circular_shift": 0.39650872817955113,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on walk-forward actuals."
    },
    "kp_to_movement": {
      "method": "actual_vs_modelled",
      "eval": "walk_forward_nested_ar1",
      "n": 90,
      "n_oos": 41,
      "min_train": 49,
      "best_lag": 5,
      "mse_causal_model": 0.000196198266035715,
      "mse_persistence_null": 0.00020493084698260222,
      "mse_mean_null": 0.0005538347779383787,
      "beats_persistence_null": true,
      "beats_mean_null": true,
      "delta_mse_vs_persistence": 8.732580946887232e-06,
      "p_sham_circular_shift": 0.5885286783042394,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat persistence/sham on walk-forward actuals."
    }
  },
  "chain_passes_actual_vs_modelled": false,
  "interpretation": "Each chain link tested: modelled transfer vs held-out actuals."
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
