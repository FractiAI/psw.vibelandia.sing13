# Recursive Attention Loop — Causality Validation (Public Data)

**Generated:** 2026-06-24T15:55:30.048091+00:00

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
    "n": 1802,
    "n_test": 538,
    "best_lag": 3,
    "coefficients": {
      "intercept": 2.7624644496821946,
      "slope": 0.0029379114246260896
    },
    "mse_causal_model": 2.208833067133711,
    "mse_mean_null": 2.211593300678942,
    "rmse_causal_model": 1.4862143409124104,
    "rmse_mean_null": 1.487142663189696,
    "beats_mean_null": true,
    "delta_mse_vs_mean": 0.002760233545231028,
    "p_sham_permutation": 0.545727136431784,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat null/sham on held-out actuals."
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
    "n": 90,
    "n_test": 24,
    "best_lag": 4,
    "coefficients": {
      "intercept": 0.022332941907178588,
      "slope": 0.003312622710379251
    },
    "mse_causal_model": 0.0011959367137600841,
    "mse_mean_null": 0.0010825213056732045,
    "rmse_causal_model": 0.03458231793503848,
    "rmse_mean_null": 0.03290169153209611,
    "beats_mean_null": false,
    "delta_mse_vs_mean": -0.00011341540808687957,
    "p_sham_permutation": 0.9740129935032483,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat null/sham on held-out actuals."
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
    "n": 52,
    "n_test": 16,
    "best_lag": 0,
    "coefficients": {
      "intercept": 74.97186005911914,
      "slope": -0.560157689245178
    },
    "mse_causal_model": 1029.941562953198,
    "mse_mean_null": 1206.6118827160494,
    "rmse_causal_model": 32.092702643329964,
    "rmse_mean_null": 34.736319360520184,
    "beats_mean_null": true,
    "delta_mse_vs_mean": 176.67031976285148,
    "p_sham_permutation": 0.10744627686156921,
    "tier": "no_causal_support",
    "interpretation": "Transfer model does not beat null/sham on held-out actuals."
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
      "n": 90,
      "n_test": 23,
      "best_lag": 5,
      "coefficients": {
        "intercept": 2.5078477666985384,
        "slope": -0.03686043573282335
      },
      "mse_causal_model": 0.9448488361149672,
      "mse_mean_null": 0.9843943474641454,
      "rmse_causal_model": 0.9720333513388145,
      "rmse_mean_null": 0.992166491806766,
      "beats_mean_null": true,
      "delta_mse_vs_mean": 0.039545511349178275,
      "p_sham_permutation": 0.5948103792415169,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat null/sham on held-out actuals."
    },
    "kp_to_movement": {
      "method": "actual_vs_modelled",
      "n": 90,
      "n_test": 24,
      "best_lag": 4,
      "coefficients": {
        "intercept": 0.022332941907178588,
        "slope": 0.003312622710379251
      },
      "mse_causal_model": 0.0011959367137600841,
      "mse_mean_null": 0.0010825213056732045,
      "rmse_causal_model": 0.03458231793503848,
      "rmse_mean_null": 0.03290169153209611,
      "beats_mean_null": false,
      "delta_mse_vs_mean": -0.00011341540808687957,
      "p_sham_permutation": 0.9740518962075848,
      "tier": "no_causal_support",
      "interpretation": "Transfer model does not beat null/sham on held-out actuals."
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
