# EGS Recursive Fidelity Test (ERFT) · Version Five — Constant-Neutral + Grammar Split

**Document ID:** `WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25`
**Registry ID:** `synthobs-egs-recursive-fidelity-test-erft-2026-09`
**Protocol:** `ERFT-V5-2026-09-27`
**Generated:** 2026-09-27T08:16:48.390Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 13 / 13 |
| Φ_EGS (one arm) | 1.618033988749895 |
| Suite pass means | Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won. |

## Experiments

### E0_protocol_locks — Pre-registered protocol locks (φ not assumed · V5 C/G split)

- **Pass:** `true`
- **Interpretation:** V5 freezes arms, mechanisms, depth, null-ok honesty, and the ERFT-C / ERFT-G layer split before reading outcomes.
- **Honesty:** Protocol lock ≠ physics proof.

```json
{
  "id": "E0_protocol_locks",
  "title": "Pre-registered protocol locks (φ not assumed · V5 C/G split)",
  "PROTOCOL_VERSION": "ERFT-V5-2026-09-27",
  "GENERATIONS": 24,
  "MECHANISMS": [
    "scaling",
    "recursive_weighting",
    "hierarchical_resolution",
    "recursive_feedback",
    "recursive_compression"
  ],
  "NAMED_ARMS": {
    "baseline": 1,
    "egs": 1.618033988749895,
    "sqrt2": 1.4142135623730951,
    "e": 2.718281828459045
  },
  "ANTI_BASELINE_BIAS": {
    "version": 5,
    "rule": "ERFT-C: transform severity fixed; c injects only as normalized nest weights; lags/blocks/period are generation-matched (identical across arms). ERFT-G: same weights + generalized self-similar re-entry C(c) for every arm — no Φ-only affordance. V4 Φ-exact-only closure is retired as primary.",
    "fixed_block": 4,
    "fixed_feedback_gain": 0.45,
    "fixed_mix_weight": 0.5,
    "layers": [
      "ERFT-C",
      "ERFT-G"
    ]
  },
  "ENGINEERING_THRESHOLD_PCT": 0.15,
  "hypothesis": {
    "claim": "Q1 (ERFT-C): Does numerical c=Φ reduce drift under a constant-neutral recursion? Q2: Is Φ unusually low vs continuous c? Q3 (ERFT-G): Does generalized algebraic closure C(c) add stability, and does Φ benefit disproportionately?",
    "null_ok": true,
    "win_requires": [
      "lower cumulative RFD vs baseline at depth N under ERFT-C (constant-neutral)",
      "advantage across ≥3 independent domains",
      "survives decoy constants (√2, e, blind ladder)",
      "survives held-out series",
      "not a single-metric fluke",
      "paired Δ_i reported (not mean-only)"
    ],
    "suite_pass_means": "Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.",
    "anti_baseline_bias": "Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms.",
    "v4_confound_note": "ERFT-V4 combined numerical c with Φ-specific partition identity and Φ-only self-similar closure. V5 separates those effects.",
    "engineering_threshold": "15% is an engineering significance threshold, not a statistically validated effect threshold."
  },
  "pass": true,
  "interpretation": "V5 freezes arms, mechanisms, depth, null-ok honesty, and the ERFT-C / ERFT-G layer split before reading outcomes.",
  "honesty": "Protocol lock ≠ physics proof."
}
```

### E0b_anti_baseline_bias — Anti-baseline-bias construction locks (V5 constant-neutral)

- **Pass:** `true`
- **Interpretation:** Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.
- **Honesty:** Anti-bias lock ≠ Φ advantage. Empirical outcomes still free to null.

```json
{
  "id": "E0b_anti_baseline_bias",
  "title": "Anti-baseline-bias construction locks (V5 constant-neutral)",
  "first_step_rfd": {
    "scaling": {
      "baseline": 1.0284606950961048,
      "egs": 1.022136728069337,
      "sqrt2": 1.0221924311687627,
      "e": 1.0318510380369705
    },
    "recursive_weighting": {
      "baseline": 1.0284606950961048,
      "egs": 1.022136728069337,
      "sqrt2": 1.0221924311687627,
      "e": 1.0318510380369705
    }
  },
  "hierarchical_ladder": [
    {
      "c": 1,
      "rfd": 0.9959642944821372
    },
    {
      "c": 1.41421356237,
      "rfd": 0.9950547315082964
    },
    {
      "c": 1.5,
      "rfd": 0.9948743903118563
    },
    {
      "c": 1.618033988749895,
      "rfd": 0.9946321792671161
    },
    {
      "c": 1.7,
      "rfd": 0.9944682311279808
    },
    {
      "c": 2,
      "rfd": 0.9938991111933722
    },
    {
      "c": 2.718281828459045,
      "rfd": 0.9927293068917831
    }
  ],
  "compression_ladder": [
    {
      "c": 1,
      "rfd": 0.9970524370216883
    },
    {
      "c": 1.41421356237,
      "rfd": 0.9957675239377902
    },
    {
      "c": 1.5,
      "rfd": 0.9955130524140816
    },
    {
      "c": 1.618033988749895,
      "rfd": 0.995172707621309
    },
    {
      "c": 1.7,
      "rfd": 0.9949434942058328
    },
    {
      "c": 2,
      "rfd": 0.9941568415088083
    },
    {
      "c": 2.718281828459045,
      "rfd": 0.9925936455268829
    }
  ],
  "feedback_named": [
    {
      "name": "baseline",
      "c": 1,
      "rfd": 1.896292147925813
    },
    {
      "name": "egs",
      "c": 1.618033988749895,
      "rfd": 2.075780097022119
    },
    {
      "name": "sqrt2",
      "c": 1.4142135623730951,
      "rfd": 2.0230202552871863
    },
    {
      "name": "e",
      "c": 2.718281828459045,
      "rfd": 2.285795212169519
    }
  ],
  "scaling_first_step_spread_ratio": 1.0095039241824157,
  "severity_parity": {
    "hierarchical": {
      "lo": 0.45104699978448,
      "hi": 0.5440902189585287,
      "ratio": 1.2062827581571471
    },
    "compression": {
      "lo": 0.33633021816953085,
      "hi": 0.3486478692175456,
      "ratio": 1.0366236822699229
    }
  },
  "checks": {
    "noIdentityTrap": true,
    "notMonotoneCoarsening": true,
    "feedbackNotInverseGain": true,
    "armSpreadOk": true,
    "severityParity": true
  },
  "pass": true,
  "interpretation": "Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.",
  "honesty": "Anti-bias lock ≠ Φ advantage. Empirical outcomes still free to null."
}
```

### E0c_nest_grammar_lock — Nest grammar + constant-neutral geometry lock (V5)

- **Pass:** `true`
- **Interpretation:** Φ algebra closes by identity; every arm (including decoys) mixes after unit-sum normalization; lags/blocks/period are generation-matched across arms.
- **Honesty:** Grammar/geometry lock ≠ Φ empirical advantage on fixtures.

```json
{
  "id": "E0c_nest_grammar_lock",
  "title": "Nest grammar + constant-neutral geometry lock (V5)",
  "phi_self_similar_error": 2.220446049250313e-16,
  "phi_partition": {
    "wMajor": 0.6180339887498948,
    "wMinor": 0.38196601125010515,
    "dyadic": false,
    "phi_exact": true,
    "partition_sum": 1,
    "algebra_closes": true
  },
  "baseline_dyadic": {
    "wMajor": 0.5,
    "wMinor": 0.5,
    "dyadic": true,
    "phi_exact": false,
    "partition_sum": 1,
    "algebra_closes": true
  },
  "decoy_raw_sum": 1.2071067811865475,
  "mix_always_unit_sum": true,
  "constant_neutral_geometry": true,
  "pass": true,
  "interpretation": "Φ algebra closes by identity; every arm (including decoys) mixes after unit-sum normalization; lags/blocks/period are generation-matched across arms.",
  "honesty": "Grammar/geometry lock ≠ Φ empirical advantage on fixtures."
}
```

### E0d_engine_grammar_lock — Engine grammar lock (matched geometry · no c-dependent lags)

- **Pass:** `true`
- **Interpretation:** V5 requires identical generation-indexed lags/blocks across arms — geometry is not a treatment.
- **Honesty:** Engine fixture lock ≠ Φ empirical advantage.

```json
{
  "id": "E0d_engine_grammar_lock",
  "title": "Engine grammar lock (matched geometry · no c-dependent lags)",
  "CLUTCH_DELTA": 0.0017789887498949053,
  "k81_gen12": 0.14814814814814814,
  "octave_gen12": 20,
  "vault_gen12": 37,
  "lag_phi_vs_sqrt2": {
    "phi": {
      "la": 64,
      "lb": 129
    },
    "sqrt2": {
      "la": 64,
      "lb": 129
    },
    "identical": true
  },
  "block_phi_vs_sqrt2": {
    "phi": {
      "b1": 13,
      "b2": 26
    },
    "sqrt2": {
      "b1": 13,
      "b2": 26
    },
    "identical": true
  },
  "pass": true,
  "interpretation": "V5 requires identical generation-indexed lags/blocks across arms — geometry is not a treatment.",
  "honesty": "Engine fixture lock ≠ Φ empirical advantage."
}
```

### E1_five_arm_matched — ERFT-C · Five-arm constant-neutral recursion (primary causal)

- **Pass:** `true`
- **Interpretation:** Identical recursion topology and evaluator; only scalar nest-weight c differs. No Φ-specific closure. Scoreboard reports paired Δ and means — suite pass does not crown Φ.
- **Honesty:** Primary causal lane. Proxy fixtures. NRMSE primary. 15% band is engineering threshold only.

```json
{
  "id": "E1_five_arm_matched",
  "title": "ERFT-C · Five-arm constant-neutral recursion (primary causal)",
  "mode": "constant_neutral",
  "rows": [
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0157132860921925,
          "rfd_rmse_raw": 0.20947942162920052,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4961023013043052,
          "path_length": 0.3585186907247149,
          "recovery_ratio": 0.5842914945543168,
          "drift_slope_b": 0.08450832630412386,
          "drift_a": 0.7775444390433428
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0161298165475774,
          "rfd_rmse_raw": 0.20956532634274488,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4959998070523063,
          "path_length": 0.36065874520798546,
          "recovery_ratio": 0.581062650295343,
          "drift_slope_b": 0.06431869548543431,
          "drift_a": 0.8161820307173961
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.016053800747276,
          "rfd_rmse_raw": 0.20954964894037176,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4960185088460126,
          "path_length": 0.3581292630720536,
          "recovery_ratio": 0.585122944555948,
          "drift_slope_b": 0.06991412908470074,
          "drift_a": 0.8056029002520322
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0161812584085317,
          "rfd_rmse_raw": 0.20957593564699226,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.495987151864187,
          "path_length": 0.37922130869863496,
          "recovery_ratio": 0.5526480997763263,
          "drift_slope_b": 0.04231925744833032,
          "drift_a": 0.8570686563949161
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.015908983459378,
          "rfd_rmse_raw": 0.2095197820063401,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49605414143448145,
          "path_length": 0.35704047504361547,
          "recovery_ratio": 0.5868236142715907,
          "drift_slope_b": 0.07723741513410369,
          "drift_a": 0.7916066892516271
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0162013399754026,
          "rfd_rmse_raw": 0.20958007724390856,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4959822117825791,
          "path_length": 0.3690530454543326,
          "recovery_ratio": 0.5678860527648524,
          "drift_slope_b": 0.05286488356667758,
          "drift_a": 0.8375733709243485
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.018292490606951,
          "rfd_rmse_raw": 0.2100113535015242,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49546832515800265,
          "path_length": 0.46366078579043685,
          "recovery_ratio": 0.45294180559932906,
          "drift_slope_b": 0.04037377548936645,
          "drift_a": 0.8762313161757971
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0199780634512892,
          "rfd_rmse_raw": 0.21035898391000718,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4950548810868879,
          "path_length": 0.4772830854619347,
          "recovery_ratio": 0.4407425913835033,
          "drift_slope_b": 0.014346711433521763,
          "drift_a": 0.9326872287651631
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0194034017273974,
          "rfd_rmse_raw": 0.21024046640393376,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4951957588783895,
          "path_length": 0.4710077463911144,
          "recovery_ratio": 0.4463630757982369,
          "drift_slope_b": 0.021887469361182365,
          "drift_a": 0.9163434375419931
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0235771627794807,
          "rfd_rmse_raw": 0.21110125759686255,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4941743850412167,
          "path_length": 0.516938835555323,
          "recovery_ratio": 0.4083679597608224,
          "drift_slope_b": -0.01610848540393187,
          "drift_a": 1.0003245892620665
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0187826910277313,
          "rfd_rmse_raw": 0.21011245181542193,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49534801563555875,
          "path_length": 0.4656402685783502,
          "recovery_ratio": 0.4512334220081906,
          "drift_slope_b": 0.03140410722802674,
          "drift_a": 0.8957470992051116
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0215262268021472,
          "rfd_rmse_raw": 0.2106782751585966,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49467574881870324,
          "path_length": 0.4952599940932371,
          "recovery_ratio": 0.4253892453888261,
          "drift_slope_b": -0.0015004737435355187,
          "drift_a": 0.9674389210871058
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0088496898442636,
          "rfd_rmse_raw": 0.20806388223240466,
          "fidelity_final": 0.03157905742858171,
          "shape_fidelity": 0.03157905742858171,
          "amplitude_fidelity": 0.49779732403847754,
          "path_length": 0.3472290863011503,
          "recovery_ratio": 0.5992121352758788,
          "drift_slope_b": 0.01467077511590461,
          "drift_a": 0.9699546780433044
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0087917195143679,
          "rfd_rmse_raw": 0.20805192650499169,
          "fidelity_final": 0.03334692164762809,
          "shape_fidelity": 0.03334692164762809,
          "amplitude_fidelity": 0.49781168962691336,
          "path_length": 0.35324714508114763,
          "recovery_ratio": 0.588969873931177,
          "drift_slope_b": 0.01627834300904087,
          "drift_a": 0.9657098747810579
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0088102280620377,
          "rfd_rmse_raw": 0.20805574368442034,
          "fidelity_final": 0.032788845376495755,
          "shape_fidelity": 0.032788845376495755,
          "amplitude_fidelity": 0.49780710294607144,
          "path_length": 0.3511588971942685,
          "recovery_ratio": 0.5924831902217744,
          "drift_slope_b": 0.015840583429074684,
          "drift_a": 0.9668655543562548
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0087054105571753,
          "rfd_rmse_raw": 0.20803412625497855,
          "fidelity_final": 0.035867438453836206,
          "shape_fidelity": 0.035867438453836206,
          "amplitude_fidelity": 0.49783307932775456,
          "path_length": 0.3636070850336014,
          "recovery_ratio": 0.5721399137086502,
          "drift_slope_b": 0.017708998041817595,
          "drift_a": 0.9619240188147166
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0088316717781274,
          "rfd_rmse_raw": 0.20806016620926623,
          "fidelity_final": 0.03213459447445499,
          "shape_fidelity": 0.03213459447445499,
          "amplitude_fidelity": 0.49780178899451794,
          "path_length": 0.34890256768645006,
          "recovery_ratio": 0.5963274148106719,
          "drift_slope_b": 0.01525057454093014,
          "drift_a": 0.9684231647667197
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0087490043894163,
          "rfd_rmse_raw": 0.20804311699172434,
          "fidelity_final": 0.03461092510556027,
          "shape_fidelity": 0.03461092510556027,
          "amplitude_fidelity": 0.49782227536384627,
          "path_length": 0.35831487364638787,
          "recovery_ratio": 0.5806153534029318,
          "drift_slope_b": 0.01709209576392135,
          "drift_a": 0.9635594198297637
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.424225161067185,
          "rfd_rmse_raw": 0.2937303933061176,
          "fidelity_final": 0.025751322212885286,
          "shape_fidelity": 0.025751322212885286,
          "amplitude_fidelity": 0.4125029374580796,
          "path_length": 0.5891321094763862,
          "recovery_ratio": 0.49858153813273187,
          "drift_slope_b": 0.18516060703675885,
          "drift_a": 0.799550565803579
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.5118407779708631,
          "rfd_rmse_raw": 0.3118001271630815,
          "fidelity_final": 0.02771803140611022,
          "shape_fidelity": 0.02771803140611022,
          "amplitude_fidelity": 0.3981144062832791,
          "path_length": 0.5478782367943057,
          "recovery_ratio": 0.5691047868363187,
          "drift_slope_b": 0.20969897900998755,
          "drift_a": 0.7883958315669679
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4850115514949491,
          "rfd_rmse_raw": 0.30626690147637603,
          "fidelity_final": 0.027154292763763122,
          "shape_fidelity": 0.027154292763763122,
          "amplitude_fidelity": 0.4024126163109437,
          "path_length": 0.5595620352896149,
          "recovery_ratio": 0.5473332395001748,
          "drift_slope_b": 0.20211792315925353,
          "drift_a": 0.7923289983184065
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.6281036545889804,
          "rfd_rmse_raw": 0.3357780355791576,
          "fidelity_final": 0.029908469842509347,
          "shape_fidelity": 0.029908469842509347,
          "amplitude_fidelity": 0.38050249587906526,
          "path_length": 0.5059780401296906,
          "recovery_ratio": 0.6636217561795609,
          "drift_slope_b": 0.24227708941706272,
          "drift_a": 0.7686229950468548
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4526952658228274,
          "rfd_rmse_raw": 0.2996020316509107,
          "fidelity_final": 0.02643366078114169,
          "shape_fidelity": 0.02643366078114169,
          "amplitude_fidelity": 0.4077147348610881,
          "path_length": 0.5746984170985641,
          "recovery_ratio": 0.521320439968303,
          "drift_slope_b": 0.19304174353107242,
          "drift_a": 0.796518196115211
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.5709244291520224,
          "rfd_rmse_raw": 0.3239854645477962,
          "fidelity_final": 0.028874601278069192,
          "shape_fidelity": 0.028874601278069192,
          "amplitude_fidelity": 0.3889651475791662,
          "path_length": 0.5247540328319164,
          "recovery_ratio": 0.6174044300324067,
          "drift_slope_b": 0.22636513276526277,
          "drift_a": 0.7787442654418462
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0109673537103718,
          "rfd_rmse_raw": 0.2085006265459344,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4972731149289578,
          "path_length": 0.36627103182196696,
          "recovery_ratio": 0.5692522979739225,
          "drift_slope_b": 0.017936029770059383,
          "drift_a": 0.9631062554504013
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0099950130322928,
          "rfd_rmse_raw": 0.20830009223604642,
          "fidelity_final": 0.007046981300806425,
          "shape_fidelity": 0.007046981300806425,
          "amplitude_fidelity": 0.4975136721814016,
          "path_length": 0.37076920303691546,
          "recovery_ratio": 0.5618052700437127,
          "drift_slope_b": 0.018476949102330723,
          "drift_a": 0.9609814831496771
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0102412376355603,
          "rfd_rmse_raw": 0.2083508732863582,
          "fidelity_final": 0.003586178945576998,
          "shape_fidelity": 0.003586178945576998,
          "amplitude_fidelity": 0.4974527341684608,
          "path_length": 0.3691306379908959,
          "recovery_ratio": 0.5644366840432706,
          "drift_slope_b": 0.018339532316035977,
          "drift_a": 0.9615223813618192
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0092423474499073,
          "rfd_rmse_raw": 0.20814486343965558,
          "fidelity_final": 0.021635490199920986,
          "shape_fidelity": 0.021635490199920986,
          "amplitude_fidelity": 0.4977000416446434,
          "path_length": 0.3789058911047827,
          "recovery_ratio": 0.5493312939336041,
          "drift_slope_b": 0.018872353489827295,
          "drift_a": 0.9593812163603449
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0105930249356196,
          "rfd_rmse_raw": 0.20842342545355141,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49736569638801986,
          "path_length": 0.36741912784802416,
          "recovery_ratio": 0.5672634048049936,
          "drift_slope_b": 0.01814273694824881,
          "drift_a": 0.962294186784601
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0095608096557496,
          "rfd_rmse_raw": 0.20821054268162675,
          "fidelity_final": 0.014677393273189189,
          "shape_fidelity": 0.014677393273189189,
          "amplitude_fidelity": 0.4976211693595409,
          "path_length": 0.37477498950979826,
          "recovery_ratio": 0.5555614662386195,
          "drift_slope_b": 0.01871255206734004,
          "drift_a": 0.9600411554376658
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.3238981434810777,
          "rfd_rmse_raw": 0.26419110696564274,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.43031145870362997,
          "path_length": 0.6130572365626177,
          "recovery_ratio": 0.4309403612082773,
          "drift_slope_b": 0.10614324520680556,
          "drift_a": 0.8803830328459061
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.2946856117850545,
          "rfd_rmse_raw": 0.2583615866781165,
          "fidelity_final": 0.023941289008054763,
          "shape_fidelity": 0.023941289008054763,
          "amplitude_fidelity": 0.4357895455761767,
          "path_length": 0.5878977166369102,
          "recovery_ratio": 0.4394668993716852,
          "drift_slope_b": 0.06307328211777133,
          "drift_a": 0.9722833395642978
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.3037137507724963,
          "rfd_rmse_raw": 0.2601632011336367,
          "fidelity_final": 0.00452055900704143,
          "shape_fidelity": 0.00452055900704143,
          "amplitude_fidelity": 0.4340817081395957,
          "path_length": 0.5910934192189679,
          "recovery_ratio": 0.44013888951326735,
          "drift_slope_b": 0.07450789739924368,
          "drift_a": 0.9473762161778133
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.2570426610730705,
          "rfd_rmse_raw": 0.2508497302207135,
          "fidelity_final": 0.10029772581670336,
          "shape_fidelity": 0.10029772581670336,
          "amplitude_fidelity": 0.4430576423064011,
          "path_length": 0.5936750175697693,
          "recovery_ratio": 0.4225371167673118,
          "drift_slope_b": 0.024205855307985455,
          "drift_a": 1.0604410810910816
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.314550899630102,
          "rfd_rmse_raw": 0.26232581339133965,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4320492585234631,
          "path_length": 0.5997302425820222,
          "recovery_ratio": 0.43740634499595477,
          "drift_slope_b": 0.0901524552041854,
          "drift_a": 0.9139187384481864
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.2751325667789652,
          "rfd_rmse_raw": 0.254459669729185,
          "fidelity_final": 0.06447060645701813,
          "shape_fidelity": 0.06447060645701813,
          "amplitude_fidelity": 0.4395348273774468,
          "path_length": 0.5881095984904193,
          "recovery_ratio": 0.43267389340752327,
          "drift_slope_b": 0.041547797400399426,
          "drift_a": 1.0203681255210917
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.2840577599997218,
          "rfd_rmse_raw": 0.25624074079457215,
          "fidelity_final": 0.05748351140090241,
          "shape_fidelity": 0.05748351140090241,
          "amplitude_fidelity": 0.4378172993313978,
          "path_length": 0.6938905714083939,
          "recovery_ratio": 0.36928119699692524,
          "drift_slope_b": 0.053096338321384676,
          "drift_a": 0.9967044644021549
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.2497541291234153,
          "rfd_rmse_raw": 0.2493952638530285,
          "fidelity_final": 0.11996226626015617,
          "shape_fidelity": 0.11996226626015617,
          "amplitude_fidelity": 0.4444930168389715,
          "path_length": 0.708676915238035,
          "recovery_ratio": 0.35191673171583415,
          "drift_slope_b": 0.009490145692495008,
          "drift_a": 1.107960025641357
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.2592999901120223,
          "rfd_rmse_raw": 0.2513001925621881,
          "fidelity_final": 0.10279600200090994,
          "shape_fidelity": 0.10279600200090994,
          "amplitude_fidelity": 0.4426149711753937,
          "path_length": 0.7011723116170236,
          "recovery_ratio": 0.3584000514547512,
          "drift_slope_b": 0.021287039848738632,
          "drift_a": 1.0770296907529602
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.215669779316625,
          "rfd_rmse_raw": 0.2425935456468356,
          "fidelity_final": 0.17957555754043553,
          "shape_fidelity": 0.17957555754043553,
          "amplitude_fidelity": 0.45133079366566453,
          "path_length": 0.7611368315459399,
          "recovery_ratio": 0.3187252746054944,
          "drift_slope_b": -0.03159037288528587,
          "drift_a": 1.222040765791854
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.2718970626953985,
          "rfd_rmse_raw": 0.25381400721380315,
          "fidelity_final": 0.07987324021120291,
          "shape_fidelity": 0.07987324021120291,
          "amplitude_fidelity": 0.44016078739658715,
          "path_length": 0.695260044074219,
          "recovery_ratio": 0.3650634167418206,
          "drift_slope_b": 0.037168121648899065,
          "drift_a": 1.0364317418124616
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.2312108203287093,
          "rfd_rmse_raw": 0.245694845281251,
          "fidelity_final": 0.15274620851393833,
          "shape_fidelity": 0.15274620851393833,
          "amplitude_fidelity": 0.4481871416582126,
          "path_length": 0.7315648031222438,
          "recovery_ratio": 0.33584836809076996,
          "drift_slope_b": -0.013103517464656298,
          "drift_a": 1.1693737077393704
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9213318430623334,
          "rfd_rmse_raw": 0.1838568025039403,
          "fidelity_final": 0.5981200099938042,
          "shape_fidelity": 0.5981200099938042,
          "amplitude_fidelity": 0.5204722982190002,
          "path_length": 0.9350936662314,
          "recovery_ratio": 0.19661859463225445,
          "drift_slope_b": 0.2630752796309028,
          "drift_a": 0.4241392585429255
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.890616441698308,
          "rfd_rmse_raw": 0.17772737636401167,
          "fidelity_final": 0.624993035941396,
          "shape_fidelity": 0.624993035941396,
          "amplitude_fidelity": 0.5289280141358114,
          "path_length": 0.9170762539611615,
          "recovery_ratio": 0.19379781735307966,
          "drift_slope_b": 0.2681211980556134,
          "drift_a": 0.40578918882212744
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.8994529947655683,
          "rfd_rmse_raw": 0.17949075880252893,
          "fidelity_final": 0.6174820874162559,
          "shape_fidelity": 0.6174820874162559,
          "amplitude_fidelity": 0.5264673581056006,
          "path_length": 0.9203442460352661,
          "recovery_ratio": 0.1950256760725716,
          "drift_slope_b": 0.2668758294698635,
          "drift_a": 0.41069549710932557
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.8569708639955955,
          "rfd_rmse_raw": 0.17101321752819243,
          "fidelity_final": 0.6520016209529051,
          "shape_fidelity": 0.6520016209529051,
          "amplitude_fidelity": 0.5385114109159076,
          "path_length": 0.9177883425984906,
          "recovery_ratio": 0.1863318693327601,
          "drift_slope_b": 0.27082000530268896,
          "drift_a": 0.39015659875015907
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9107402481196607,
          "rfd_rmse_raw": 0.1817431918714193,
          "fidelity_final": 0.6076304781157266,
          "shape_fidelity": 0.6076304781157266,
          "amplitude_fidelity": 0.5233573747054784,
          "path_length": 0.9267282870441169,
          "recovery_ratio": 0.19611270575446177,
          "drift_slope_b": 0.2650298393001453,
          "drift_a": 0.4174076595692461
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.8726549702921991,
          "rfd_rmse_raw": 0.1741430666216969,
          "fidelity_final": 0.6397219993068081,
          "shape_fidelity": 0.6397219993068081,
          "amplitude_fidelity": 0.5340011992940511,
          "path_length": 0.9149063605762111,
          "recovery_ratio": 0.19033977041324865,
          "drift_slope_b": 0.2700095753565018,
          "drift_a": 0.39681685086385876
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.6983148559978533,
          "rfd_rmse_raw": 0.13935254439705552,
          "fidelity_final": 0.7523499778327009,
          "shape_fidelity": 0.7523499778327009,
          "amplitude_fidelity": 0.5888189675008436,
          "path_length": 0.3092349208859093,
          "recovery_ratio": 0.4506365063746114,
          "drift_slope_b": 0.4080911587782316,
          "drift_a": 0.21000474696609978
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.6963754705690829,
          "rfd_rmse_raw": 0.1389655294399134,
          "fidelity_final": 0.7538563474289233,
          "shape_fidelity": 0.7538563474289233,
          "amplitude_fidelity": 0.5894921362335722,
          "path_length": 0.26829070725370147,
          "recovery_ratio": 0.5179662421498058,
          "drift_slope_b": 0.4129502259123832,
          "drift_a": 0.20407687569642347
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.6967836035547758,
          "rfd_rmse_raw": 0.13904697460683224,
          "fidelity_final": 0.7535227966999588,
          "shape_fidelity": 0.7535227966999588,
          "amplitude_fidelity": 0.589350343735637,
          "path_length": 0.27950642877802795,
          "recovery_ratio": 0.49747326104351397,
          "drift_slope_b": 0.4117485213058753,
          "drift_a": 0.20558459830858522
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.6966487871619202,
          "rfd_rmse_raw": 0.13902007125913818,
          "fidelity_final": 0.7539043649138898,
          "shape_fidelity": 0.7539043649138898,
          "amplitude_fidelity": 0.5893971737502351,
          "path_length": 0.22905083455970032,
          "recovery_ratio": 0.606939815462247,
          "drift_slope_b": 0.4171306329962447,
          "drift_a": 0.19932069469104452
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.6974951203391456,
          "rfd_rmse_raw": 0.13918896166815786,
          "fidelity_final": 0.7529698932302135,
          "shape_fidelity": 0.7529698932302135,
          "amplitude_fidelity": 0.5891033134753331,
          "path_length": 0.2944676633132602,
          "recovery_ratio": 0.47267995440329913,
          "drift_slope_b": 0.41001010952528133,
          "drift_a": 0.20772915821877458
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.6960880727143188,
          "rfd_rmse_raw": 0.1389081776279454,
          "fidelity_final": 0.7541719438656117,
          "shape_fidelity": 0.7541719438656117,
          "amplitude_fidelity": 0.5895920241922693,
          "path_length": 0.2466925745825826,
          "recovery_ratio": 0.5630821189611632,
          "drift_slope_b": 0.41517057333846213,
          "drift_a": 0.2013807005708589
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.376437015582765,
          "rfd_rmse_raw": 0.27467552591253697,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4207980238663189,
          "path_length": 0.6833092455543422,
          "recovery_ratio": 0.40197835416335304,
          "drift_slope_b": 0.4846463575721176,
          "drift_a": 0.3085144753584759
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.213847217407618,
          "rfd_rmse_raw": 0.24222984346126727,
          "fidelity_final": 0.21200644857847356,
          "shape_fidelity": 0.21200644857847356,
          "amplitude_fidelity": 0.45170235422613536,
          "path_length": 0.7162002195311608,
          "recovery_ratio": 0.3382152600006683,
          "drift_slope_b": 0.44226785147270387,
          "drift_a": 0.3105365008193209
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.259863319545779,
          "rfd_rmse_raw": 0.25141260802815374,
          "fidelity_final": 0.15138016423136816,
          "shape_fidelity": 0.15138016423136816,
          "amplitude_fidelity": 0.4425046379358,
          "path_length": 0.7038460570004061,
          "recovery_ratio": 0.3571982900630339,
          "drift_slope_b": 0.4556306343765425,
          "drift_a": 0.308915422028874
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0477178113371182,
          "rfd_rmse_raw": 0.20907781291765964,
          "fidelity_final": 0.4234372787164112,
          "shape_fidelity": 0.4234372787164112,
          "amplitude_fidelity": 0.48834853829152386,
          "path_length": 0.7785952809375504,
          "recovery_ratio": 0.26853208340268553,
          "drift_slope_b": 0.3849740033018846,
          "drift_a": 0.3235580338026205
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.3196203878005128,
          "rfd_rmse_raw": 0.2633374574502764,
          "fidelity_final": 0.0721397912132469,
          "shape_fidelity": 0.0721397912132469,
          "amplitude_fidelity": 0.4311050227266755,
          "path_length": 0.6912797831588416,
          "recovery_ratio": 0.3809419338823149,
          "drift_slope_b": 0.4713710863297178,
          "drift_a": 0.3080449158556044
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.1230494828178361,
          "rfd_rmse_raw": 0.2241106594973312,
          "fidelity_final": 0.32947105278417266,
          "shape_fidelity": 0.32947105278417266,
          "amplitude_fidelity": 0.4710205805814479,
          "path_length": 0.7468987865807435,
          "recovery_ratio": 0.3000549251436007,
          "drift_slope_b": 0.4127203646270482,
          "drift_a": 0.31621713325640344
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0343250730225682,
          "rfd_rmse_raw": 1.514216964015405,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49156352308739704,
          "path_length": 2.4467931586303697,
          "recovery_ratio": 0.6188577725397154,
          "drift_slope_b": 0.03205079272105777,
          "drift_a": 0.9050258927902682
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0253153844623342,
          "rfd_rmse_raw": 1.5010270843400195,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4937502611552387,
          "path_length": 2.4600152182954385,
          "recovery_ratio": 0.610169836827307,
          "drift_slope_b": 0.013673862166018576,
          "drift_a": 0.9448482237331851
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.02820268603522,
          "rfd_rmse_raw": 1.505253996300218,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49304736991292736,
          "path_length": 2.4444195259423975,
          "recovery_ratio": 0.6157920031013896,
          "drift_slope_b": 0.018822619686552373,
          "drift_a": 0.9335290604192549
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.012769744347072,
          "rfd_rmse_raw": 1.4826606910441011,
          "fidelity_final": 0.032364975058753194,
          "shape_fidelity": 0.032364975058753194,
          "amplitude_fidelity": 0.4968278178905123,
          "path_length": 2.576594076644751,
          "recovery_ratio": 0.5754343318893392,
          "drift_slope_b": -0.005570919504971538,
          "drift_a": 0.9888129257322524
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0315623399410565,
          "rfd_rmse_raw": 1.5101724161182466,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4922320030942362,
          "path_length": 2.437208244779985,
          "recovery_ratio": 0.6196320808255655,
          "drift_slope_b": 0.025537198182873783,
          "drift_a": 0.9189765653230966
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0188774739920752,
          "rfd_rmse_raw": 1.491602200905268,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4953247598640181,
          "path_length": 2.5118885079369853,
          "recovery_ratio": 0.5938170409204672,
          "drift_slope_b": 0.003368051137044634,
          "drift_a": 0.9680322526524199
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0240927607590808,
          "rfd_rmse_raw": 1.499237204542691,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4940485037973147,
          "path_length": 3.2132193416179184,
          "recovery_ratio": 0.46658414666077414,
          "drift_slope_b": -0.02714963102487343,
          "drift_a": 1.0533280745135212
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0111738448644572,
          "rfd_rmse_raw": 1.480324348116266,
          "fidelity_final": 0.05759693998258199,
          "shape_fidelity": 0.05759693998258199,
          "amplitude_fidelity": 0.497222058925192,
          "path_length": 3.331788725599312,
          "recovery_ratio": 0.444303186676397,
          "drift_slope_b": -0.0455307020965127,
          "drift_a": 1.1027481766466345
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.014784278675894,
          "rfd_rmse_raw": 1.485609901243927,
          "fidelity_final": 0.038711522025119384,
          "shape_fidelity": 0.038711522025119384,
          "amplitude_fidelity": 0.4963310517080245,
          "path_length": 3.2816136681438386,
          "recovery_ratio": 0.45270712871092605,
          "drift_slope_b": -0.040226627051441234,
          "drift_a": 1.088192329033065
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9986261924372596,
          "rfd_rmse_raw": 1.4619550088636566,
          "fidelity_final": 0.12103911788273375,
          "shape_fidelity": 0.12103911788273375,
          "amplitude_fidelity": 0.5003436879712522,
          "path_length": 3.6494218652859924,
          "recovery_ratio": 0.4005990709843813,
          "drift_slope_b": -0.06672806573762917,
          "drift_a": 1.163996129521097
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0195325262480803,
          "rfd_rmse_raw": 1.4925611752782484,
          "fidelity_final": 0.01353779288191012,
          "shape_fidelity": 0.01353779288191012,
          "amplitude_fidelity": 0.49516409713777465,
          "path_length": 3.2360895019392273,
          "recovery_ratio": 0.4612237005137932,
          "drift_slope_b": -0.0335017468168069,
          "drift_a": 1.0701099488694574
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0042137612413382,
          "rfd_rmse_raw": 1.4701350208264474,
          "fidelity_final": 0.09324878650440835,
          "shape_fidelity": 0.09324878650440835,
          "amplitude_fidelity": 0.4989487744963071,
          "path_length": 3.474309426978574,
          "recovery_ratio": 0.42314452748814235,
          "drift_slope_b": -0.05659564847513839,
          "drift_a": 1.1340803169798253
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0004462921652948,
          "rfd_rmse_raw": 1.4646195733765683,
          "fidelity_final": 0.022851306834433746,
          "shape_fidelity": 0.022851306834433746,
          "amplitude_fidelity": 0.49988845185020897,
          "path_length": 2.6216320212025463,
          "recovery_ratio": 0.5586671056545706,
          "drift_slope_b": 0.15878788914057237,
          "drift_a": 0.6545871763180273
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0003970804874813,
          "rfd_rmse_raw": 1.464547529142781,
          "fidelity_final": 0.024144030340681733,
          "shape_fidelity": 0.024144030340681733,
          "amplitude_fidelity": 0.49990074958333164,
          "path_length": 2.6978786295551695,
          "recovery_ratio": 0.5428515253053685,
          "drift_slope_b": 0.18490587786159232,
          "drift_a": 0.6101827057215808
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0004180811362446,
          "rfd_rmse_raw": 1.4645782733830996,
          "fidelity_final": 0.023351604960311054,
          "shape_fidelity": 0.023351604960311054,
          "amplitude_fidelity": 0.499895501560352,
          "path_length": 2.671780712908297,
          "recovery_ratio": 0.5481655984367337,
          "drift_slope_b": 0.17724577478886194,
          "drift_a": 0.6228836552794885
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0002123403150147,
          "rfd_rmse_raw": 1.464277075771418,
          "fidelity_final": 0.031576011799205744,
          "shape_fidelity": 0.031576011799205744,
          "amplitude_fidelity": 0.4999469205566992,
          "path_length": 2.8302803520400475,
          "recovery_ratio": 0.5173611422331278,
          "drift_slope_b": 0.21450123358622294,
          "drift_a": 0.5634739040411215
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.000435809433396,
          "rfd_rmse_raw": 1.4646042270112096,
          "fidelity_final": 0.022865655182304722,
          "shape_fidelity": 0.022865655182304722,
          "amplitude_fidelity": 0.4998910713777115,
          "path_length": 2.6433509506342134,
          "recovery_ratio": 0.5540710463208869,
          "drift_slope_b": 0.1676179982566252,
          "drift_a": 0.6392227942349175
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0003247246005966,
          "rfd_rmse_raw": 1.4644416025688007,
          "fidelity_final": 0.027129335592233052,
          "shape_fidelity": 0.027129335592233052,
          "amplitude_fidelity": 0.4999188320284695,
          "path_length": 2.761764250429762,
          "recovery_ratio": 0.53025583278548,
          "drift_slope_b": 0.20068329851087824,
          "drift_a": 0.5848271974809793
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 2.3728261759984615,
          "rfd_rmse_raw": 3.473737359819641,
          "fidelity_final": 0.0035842538496552614,
          "shape_fidelity": 0.0035842538496552614,
          "amplitude_fidelity": 0.29648726255629493,
          "path_length": 7.395196839695431,
          "recovery_ratio": 0.46972885713785895,
          "drift_slope_b": 0.40394164194291327,
          "drift_a": 0.6864059754324363
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 2.6014788959271073,
          "rfd_rmse_raw": 3.808477217157185,
          "fidelity_final": 0.007953212738414726,
          "shape_fidelity": 0.007953212738414726,
          "amplitude_fidelity": 0.27766371229632764,
          "path_length": 6.724445782197297,
          "recovery_ratio": 0.5663629896816147,
          "drift_slope_b": 0.44742299486672304,
          "drift_a": 0.6651596657950184
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 2.5325338643905964,
          "rfd_rmse_raw": 3.707544020176776,
          "fidelity_final": 0.006422852530801913,
          "shape_fidelity": 0.006422852530801913,
          "amplitude_fidelity": 0.2830829196233372,
          "path_length": 6.912532367123523,
          "recovery_ratio": 0.5363510538930869,
          "drift_slope_b": 0.4347478997506133,
          "drift_a": 0.6714427014252178
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 2.8917783266883768,
          "rfd_rmse_raw": 4.233465776525829,
          "fidelity_final": 0.015820171342018702,
          "shape_fidelity": 0.015820171342018702,
          "amplitude_fidelity": 0.25695194228879115,
          "path_length": 6.064216881442667,
          "recovery_ratio": 0.6981059317783989,
          "drift_slope_b": 0.4970521694525104,
          "drift_a": 0.6399810683078447
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 2.4482816815477304,
          "rfd_rmse_raw": 3.584201670809585,
          "fidelity_final": 0.0047900603227874336,
          "shape_fidelity": 0.0047900603227874336,
          "amplitude_fidelity": 0.2899995105826618,
          "path_length": 7.158650947375623,
          "recovery_ratio": 0.5006811614587189,
          "drift_slope_b": 0.41875518468964673,
          "drift_a": 0.679267105765285
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 2.7505531656739968,
          "rfd_rmse_raw": 4.0267169118494,
          "fidelity_final": 0.011749603568531716,
          "shape_fidelity": 0.011749603568531716,
          "amplitude_fidelity": 0.26662733624262436,
          "path_length": 6.357973273299576,
          "recovery_ratio": 0.6333334128282153,
          "drift_slope_b": 0.4736319564415167,
          "drift_a": 0.651964123674335
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0094023843684325,
          "rfd_rmse_raw": 1.477730989795825,
          "fidelity_final": 0.0020236424163826475,
          "shape_fidelity": 0.0020236424163826475,
          "amplitude_fidelity": 0.49766040280394414,
          "path_length": 2.7262193612029146,
          "recovery_ratio": 0.5420440522232196,
          "drift_slope_b": 0.2226089719923625,
          "drift_a": 0.5562050656422245
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0043150241493115,
          "rfd_rmse_raw": 1.4702832663027274,
          "fidelity_final": 0.0033353718733578155,
          "shape_fidelity": 0.0033353718733578155,
          "amplitude_fidelity": 0.4989235663812022,
          "path_length": 2.7580396783150687,
          "recovery_ratio": 0.5330899616357033,
          "drift_slope_b": 0.24863198037572995,
          "drift_a": 0.5166234853265409
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0054157309880043,
          "rfd_rmse_raw": 1.4718946639290904,
          "fidelity_final": 0.0027984712091008762,
          "shape_fidelity": 0.0027984712091008762,
          "amplitude_fidelity": 0.49864972361981613,
          "path_length": 2.741134656935205,
          "recovery_ratio": 0.5369654716542746,
          "drift_slope_b": 0.24179250537695832,
          "drift_a": 0.5266682707758393
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0016464228102724,
          "rfd_rmse_raw": 1.4663765240964703,
          "fidelity_final": 0.009634751467759658,
          "shape_fidelity": 0.009634751467759658,
          "amplitude_fidelity": 0.49958873285723443,
          "path_length": 2.869611238692564,
          "recovery_ratio": 0.5110018055144545,
          "drift_slope_b": 0.26883623336566603,
          "drift_a": 0.48817619902661985
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0072092153441645,
          "rfd_rmse_raw": 1.474520264436732,
          "fidelity_final": 0.002342991360121601,
          "shape_fidelity": 0.002342991360121601,
          "amplitude_fidelity": 0.4982041694286143,
          "path_length": 2.7282402388233846,
          "recovery_ratio": 0.540465697798172,
          "drift_slope_b": 0.23226270009081235,
          "drift_a": 0.5410752545371647
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0026646719960175,
          "rfd_rmse_raw": 1.4678672065046077,
          "fidelity_final": 0.00547078482268704,
          "shape_fidelity": 0.00547078482268704,
          "amplitude_fidelity": 0.49933471837964727,
          "path_length": 2.8087902806988336,
          "recovery_ratio": 0.522597652302969,
          "drift_slope_b": 0.2606372032505207,
          "drift_a": 0.49952422302680366
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.1251489444470322,
          "rfd_rmse_raw": 0.09870083638137436,
          "fidelity_final": 0.1655922320186388,
          "shape_fidelity": 0.1655922320186388,
          "amplitude_fidelity": 0.47055525336846543,
          "path_length": 0.19640429212384025,
          "recovery_ratio": 0.502539100923211,
          "drift_slope_b": 0.07393941929726115,
          "drift_a": 0.8553022459520343
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.1106525168397232,
          "rfd_rmse_raw": 0.09742917405040481,
          "fidelity_final": 0.19924198242323843,
          "shape_fidelity": 0.19924198242323843,
          "amplitude_fidelity": 0.47378713076717077,
          "path_length": 0.19302173514818,
          "recovery_ratio": 0.5047575288638342,
          "drift_slope_b": 0.045535844870909704,
          "drift_a": 0.9135069284275299
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.114854488501889,
          "rfd_rmse_raw": 0.09779778135306769,
          "fidelity_final": 0.18960436023885455,
          "shape_fidelity": 0.18960436023885455,
          "amplitude_fidelity": 0.4728457704474862,
          "path_length": 0.1928411253460217,
          "recovery_ratio": 0.5071417270438846,
          "drift_slope_b": 0.05327616503490354,
          "drift_a": 0.8974875738972734
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0941414451899758,
          "rfd_rmse_raw": 0.09598078218244303,
          "fidelity_final": 0.23612851175799487,
          "shape_fidelity": 0.23612851175799487,
          "amplitude_fidelity": 0.47752266318824615,
          "path_length": 0.19895700288126647,
          "recovery_ratio": 0.48241972281680595,
          "drift_slope_b": 0.017508431200063915,
          "drift_a": 0.9730702584835317
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.1201775851472147,
          "rfd_rmse_raw": 0.09826473650031776,
          "fidelity_final": 0.1772570292934802,
          "shape_fidelity": 0.1772570292934802,
          "amplitude_fidelity": 0.4716586039798949,
          "path_length": 0.1938863657682266,
          "recovery_ratio": 0.5068161245426832,
          "drift_slope_b": 0.06360687959908555,
          "drift_a": 0.8763093414586184
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.1019619672469736,
          "rfd_rmse_raw": 0.09666681763737031,
          "fidelity_final": 0.21885616766826296,
          "shape_fidelity": 0.21885616766826296,
          "amplitude_fidelity": 0.47574600091824754,
          "path_length": 0.19530471076804212,
          "recovery_ratio": 0.49495384549212823,
          "drift_slope_b": 0.030391795967322662,
          "drift_a": 0.9453414415458244
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.1086422342052709,
          "rfd_rmse_raw": 0.09725282710686224,
          "fidelity_final": 0.20887925747655184,
          "shape_fidelity": 0.20887925747655184,
          "amplitude_fidelity": 0.47423881765172526,
          "path_length": 0.2400508396463314,
          "recovery_ratio": 0.405134292594625,
          "drift_slope_b": 0.022294628711882123,
          "drift_a": 0.9732941132376208
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0944990250486997,
          "rfd_rmse_raw": 0.09601214996828451,
          "fidelity_final": 0.23862009295584533,
          "shape_fidelity": 0.23862009295584533,
          "amplitude_fidelity": 0.4774411389266456,
          "path_length": 0.24630930907412585,
          "recovery_ratio": 0.3898031719921313,
          "drift_slope_b": -0.00809323666549791,
          "drift_a": 1.0473896954838096
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0984734588293017,
          "rfd_rmse_raw": 0.09636079708760488,
          "fidelity_final": 0.23029860251312417,
          "shape_fidelity": 0.23029860251312417,
          "amplitude_fidelity": 0.4765368824621117,
          "path_length": 0.24333936716995816,
          "recovery_ratio": 0.3959934564155522,
          "drift_slope_b": 0.0004001771621199541,
          "drift_a": 1.0263121030897813
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0797289077131573,
          "rfd_rmse_raw": 0.09471647890032157,
          "fidelity_final": 0.26916094573037924,
          "shape_fidelity": 0.26916094573037924,
          "amplitude_fidelity": 0.4808318989514777,
          "path_length": 0.2662027021958804,
          "recovery_ratio": 0.35580585065070525,
          "drift_slope_b": -0.039935987945326545,
          "drift_a": 1.130276812715798
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.1036634417009108,
          "rfd_rmse_raw": 0.09681607516679694,
          "fidelity_final": 0.2193859507588228,
          "shape_fidelity": 0.2193859507588228,
          "amplitude_fidelity": 0.4753612104374705,
          "path_length": 0.24087523832719945,
          "recovery_ratio": 0.4019345277628088,
          "drift_slope_b": 0.011489680340072089,
          "drift_a": 0.9992702590102209
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0866115328178192,
          "rfd_rmse_raw": 0.09532023972477262,
          "fidelity_final": 0.2550188747231977,
          "shape_fidelity": 0.2550188747231977,
          "amplitude_fidelity": 0.47924588945867264,
          "path_length": 0.2551123463971038,
          "recovery_ratio": 0.3736402454485627,
          "drift_slope_b": -0.025118204451129045,
          "drift_a": 1.0908662163441303
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9319873350607155,
          "rfd_rmse_raw": 0.0817562242948638,
          "fidelity_final": 0.5372766299992001,
          "shape_fidelity": 0.5372766299992001,
          "amplitude_fidelity": 0.5176017367466715,
          "path_length": 0.3263200022750367,
          "recovery_ratio": 0.2505400334790268,
          "drift_slope_b": 0.2620758108267167,
          "drift_a": 0.43513043694697867
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9137998186670694,
          "rfd_rmse_raw": 0.08016077056528219,
          "fidelity_final": 0.5551847964443158,
          "shape_fidelity": 0.5551847964443158,
          "amplitude_fidelity": 0.522520689074202,
          "path_length": 0.334489445455625,
          "recovery_ratio": 0.2396511209975285,
          "drift_slope_b": 0.2882143503551819,
          "drift_a": 0.396758527060905
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9192289687440744,
          "rfd_rmse_raw": 0.08063702898074358,
          "fidelity_final": 0.5499793861817786,
          "shape_fidelity": 0.5499793861817786,
          "amplitude_fidelity": 0.5210425729736617,
          "path_length": 0.3312673873776023,
          "recovery_ratio": 0.24341976316801667,
          "drift_slope_b": 0.28078912781536114,
          "drift_a": 0.4073074285991035
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.8921562022987469,
          "rfd_rmse_raw": 0.078262139234369,
          "fidelity_final": 0.5746693239451922,
          "shape_fidelity": 0.5746693239451922,
          "amplitude_fidelity": 0.528497593795437,
          "path_length": 0.3524722285329441,
          "recovery_ratio": 0.2220377462363795,
          "drift_slope_b": 0.3154363631804027,
          "drift_a": 0.3604482619272133
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.925941754002785,
          "rfd_rmse_raw": 0.0812258910356326,
          "fidelity_final": 0.543374874703022,
          "shape_fidelity": 0.543374874703022,
          "amplitude_fidelity": 0.5192265020069522,
          "path_length": 0.3281530294564651,
          "recovery_ratio": 0.24752442837468475,
          "drift_slope_b": 0.271185644653032,
          "drift_a": 0.42136361923467847
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9023869678755527,
          "rfd_rmse_raw": 0.07915960718671089,
          "fidelity_final": 0.5657140690066071,
          "shape_fidelity": 0.5657140690066071,
          "amplitude_fidelity": 0.5256554091708939,
          "path_length": 0.3430119187900961,
          "recovery_ratio": 0.23077800755708458,
          "drift_slope_b": 0.3029918087507482,
          "drift_a": 0.3765892069720625
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.7254430333341333,
          "rfd_rmse_raw": 0.06363764947787404,
          "fidelity_final": 0.7230281506137604,
          "shape_fidelity": 0.7230281506137604,
          "amplitude_fidelity": 0.5795612956677366,
          "path_length": 0.15173992682058007,
          "recovery_ratio": 0.4193863198123214,
          "drift_slope_b": 0.5118414175909183,
          "drift_a": 0.1606724608020213
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.705449024452166,
          "rfd_rmse_raw": 0.06188372577825517,
          "fidelity_final": 0.7399613369133384,
          "shape_fidelity": 0.7399613369133384,
          "amplitude_fidelity": 0.5863558427501084,
          "path_length": 0.12960947361547312,
          "recovery_ratio": 0.47746298207994053,
          "drift_slope_b": 0.5216828379863869,
          "drift_a": 0.14948104301901038
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.7113052884204232,
          "rfd_rmse_raw": 0.062397451676137215,
          "fidelity_final": 0.7350304129909735,
          "shape_fidelity": 0.7350304129909735,
          "amplitude_fidelity": 0.5843492723165862,
          "path_length": 0.13578906595208437,
          "recovery_ratio": 0.4595174967780932,
          "drift_slope_b": 0.5196246740557371,
          "drift_a": 0.15227516000416888
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.6837948447520318,
          "rfd_rmse_raw": 0.05998416780586048,
          "fidelity_final": 0.7583464996077944,
          "shape_fidelity": 0.7583464996077944,
          "amplitude_fidelity": 0.5938965801663727,
          "path_length": 0.10705014928084056,
          "recovery_ratio": 0.5603370776111214,
          "drift_slope_b": 0.5253250405303411,
          "drift_a": 0.1414890929652718
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.718679737455433,
          "rfd_rmse_raw": 0.06304435650700387,
          "fidelity_final": 0.7287919426836814,
          "shape_fidelity": 0.7287919426836814,
          "amplitude_fidelity": 0.5818419675329016,
          "path_length": 0.14388837633035756,
          "recovery_ratio": 0.43814766776058733,
          "drift_slope_b": 0.5161098604817207,
          "drift_a": 0.15633239605572669
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.6935773336488724,
          "rfd_rmse_raw": 0.060842311823836884,
          "fidelity_final": 0.7499583406777623,
          "shape_fidelity": 0.7499583406777623,
          "amplitude_fidelity": 0.5904660980821375,
          "path_length": 0.11739965854648929,
          "recovery_ratio": 0.5182494785514545,
          "drift_slope_b": 0.5242704888946851,
          "drift_a": 0.1447399021695831
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.7921581236951635,
          "rfd_rmse_raw": 0.06949006150775763,
          "fidelity_final": 0.7647953790921366,
          "shape_fidelity": 0.7647953790921366,
          "amplitude_fidelity": 0.5579864783014507,
          "path_length": 0.17071334313096426,
          "recovery_ratio": 0.40705700112994514,
          "drift_slope_b": 0.5269447764165283,
          "drift_a": 0.16832407256776116
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.7459728234441659,
          "rfd_rmse_raw": 0.06543857322632064,
          "fidelity_final": 0.7767988806109859,
          "shape_fidelity": 0.7767988806109859,
          "amplitude_fidelity": 0.5727466009621878,
          "path_length": 0.20400863052093796,
          "recovery_ratio": 0.3207637493532633,
          "drift_slope_b": 0.4726948896561062,
          "drift_a": 0.1866528950765393
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.7585745997856225,
          "rfd_rmse_raw": 0.06654403208217377,
          "fidelity_final": 0.7741867656462567,
          "shape_fidelity": 0.7741867656462567,
          "amplitude_fidelity": 0.5686423539393235,
          "path_length": 0.19435030444260906,
          "recovery_ratio": 0.3423922194154524,
          "drift_slope_b": 0.4878861227775462,
          "drift_a": 0.18118488215610035
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.7056029962636527,
          "rfd_rmse_raw": 0.06189723256475477,
          "fidelity_final": 0.7813980003733453,
          "shape_fidelity": 0.7813980003733453,
          "amplitude_fidelity": 0.5863029099917338,
          "path_length": 0.2407574057982554,
          "recovery_ratio": 0.25709378434083163,
          "drift_slope_b": 0.42023242627552765,
          "drift_a": 0.20800555047480768
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.7755550549552146,
          "rfd_rmse_raw": 0.06803359942847641,
          "fidelity_final": 0.7698782448294386,
          "shape_fidelity": 0.7698782448294386,
          "amplitude_fidelity": 0.5632041637961056,
          "path_length": 0.18208407873699106,
          "recovery_ratio": 0.37363837574589176,
          "drift_slope_b": 0.5078547086109286,
          "drift_a": 0.1744044086974813
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.7227525780297366,
          "rfd_rmse_raw": 0.06340163611262027,
          "fidelity_final": 0.7802256314221193,
          "shape_fidelity": 0.7802256314221193,
          "amplitude_fidelity": 0.5804664075114441,
          "path_length": 0.22366444651449433,
          "recovery_ratio": 0.28346765478666097,
          "drift_slope_b": 0.4434832979903654,
          "drift_a": 0.19801619756900538
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9848605986479172,
          "rfd_rmse_raw": 8.846846036394128,
          "fidelity_final": 0.1703632448832242,
          "shape_fidelity": 0.1703632448832242,
          "amplitude_fidelity": 0.5038137190496893,
          "path_length": 12.617527333671637,
          "recovery_ratio": 0.7011552899738985,
          "drift_slope_b": 0.012806156826995775,
          "drift_a": 0.9400136506346286
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9816497919552185,
          "rfd_rmse_raw": 8.818003870810566,
          "fidelity_final": 0.18502583464674377,
          "shape_fidelity": 0.18502583464674377,
          "amplitude_fidelity": 0.5046300330460197,
          "path_length": 13.059648393912616,
          "recovery_ratio": 0.6752098988301115,
          "drift_slope_b": -0.0006958731520603863,
          "drift_a": 0.9738403496349968
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9825397137056313,
          "rfd_rmse_raw": 8.82599789628092,
          "fidelity_final": 0.1809831896463665,
          "shape_fidelity": 0.1809831896463665,
          "amplitude_fidelity": 0.5044035148889232,
          "path_length": 12.863485714889803,
          "recovery_ratio": 0.6861280131919927,
          "drift_slope_b": 0.0030581665232379406,
          "drift_a": 0.9643346397865779
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9784609655343229,
          "rfd_rmse_raw": 8.789359150510881,
          "fidelity_final": 0.19935453449954385,
          "shape_fidelity": 0.19935453449954385,
          "amplitude_fidelity": 0.5054433812041018,
          "path_length": 14.139941479705513,
          "recovery_ratio": 0.6215979863230617,
          "drift_slope_b": -0.014897171507905628,
          "drift_a": 1.0107282471650216
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9837145141728986,
          "rfd_rmse_raw": 8.836550941931915,
          "fidelity_final": 0.17562063353084237,
          "shape_fidelity": 0.17562063353084237,
          "amplitude_fidelity": 0.5041047957533072,
          "path_length": 12.687325206002983,
          "recovery_ratio": 0.6964865169335234,
          "drift_slope_b": 0.007975474253067341,
          "drift_a": 0.9520102404954942
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9799115058796539,
          "rfd_rmse_raw": 8.802389123607925,
          "fidelity_final": 0.19286898370082092,
          "shape_fidelity": 0.19286898370082092,
          "amplitude_fidelity": 0.5050730787867767,
          "path_length": 13.575681706566666,
          "recovery_ratio": 0.6483938938661282,
          "drift_slope_b": -0.008242267509256959,
          "drift_a": 0.993247959382229
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9803653995218159,
          "rfd_rmse_raw": 8.80646637796719,
          "fidelity_final": 0.19151746097802103,
          "shape_fidelity": 0.19151746097802103,
          "amplitude_fidelity": 0.5049573175947543,
          "path_length": 17.834226500641904,
          "recovery_ratio": 0.49379581321624577,
          "drift_slope_b": -0.04056492054940976,
          "drift_a": 1.0836050142883957
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9780417453059864,
          "rfd_rmse_raw": 8.785593361910417,
          "fidelity_final": 0.20163831252492884,
          "shape_fidelity": 0.20163831252492884,
          "amplitude_fidelity": 0.5055505033566966,
          "path_length": 18.96049575751821,
          "recovery_ratio": 0.4633630615078594,
          "drift_slope_b": -0.05481209625472015,
          "drift_a": 1.1271612665628747
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.978536580975864,
          "rfd_rmse_raw": 8.79003839198953,
          "fidelity_final": 0.19947452131380583,
          "shape_fidelity": 0.19947452131380583,
          "amplitude_fidelity": 0.505424064237809,
          "path_length": 18.532553423800167,
          "recovery_ratio": 0.4743026063910356,
          "drift_slope_b": -0.05062094110505474,
          "drift_a": 1.1142344436156886
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9775316892351649,
          "rfd_rmse_raw": 8.781011609391653,
          "fidelity_final": 0.2040428377493196,
          "shape_fidelity": 0.2040428377493196,
          "amplitude_fidelity": 0.5056808977795761,
          "path_length": 21.447022995319426,
          "recovery_ratio": 0.40942799433320004,
          "drift_slope_b": -0.07242722929754433,
          "drift_a": 1.1829975420245653
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9793917120828615,
          "rfd_rmse_raw": 8.797719898646333,
          "fidelity_final": 0.19575195218722893,
          "shape_fidelity": 0.19575195218722893,
          "amplitude_fidelity": 0.5052057123891494,
          "path_length": 18.107751068012185,
          "recovery_ratio": 0.4858538128562931,
          "drift_slope_b": -0.04540754909388978,
          "drift_a": 1.0983078781075357
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.977555491934648,
          "rfd_rmse_raw": 8.781225425253377,
          "fidelity_final": 0.2038226612176882,
          "shape_fidelity": 0.2038226612176882,
          "amplitude_fidelity": 0.5056748111890895,
          "path_length": 20.10563478425752,
          "recovery_ratio": 0.4367544481673851,
          "drift_slope_b": -0.06382259329749293,
          "drift_a": 1.1554103447921804
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.4911571345770581,
          "rfd_rmse_raw": 4.411986381874871,
          "fidelity_final": 0.8894518890770118,
          "shape_fidelity": 0.8894518890770118,
          "amplitude_fidelity": 0.6706201357401769,
          "path_length": 25.056070619947562,
          "recovery_ratio": 0.17608452852788553,
          "drift_slope_b": 0.36786933702242985,
          "drift_a": 0.16584081199722686
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.4817389932377015,
          "rfd_rmse_raw": 4.32738471693602,
          "fidelity_final": 0.891371301221213,
          "shape_fidelity": 0.891371301221213,
          "amplitude_fidelity": 0.67488269159667,
          "path_length": 23.94408796631996,
          "recovery_ratio": 0.18072873450109989,
          "drift_slope_b": 0.40226715795669615,
          "drift_a": 0.14834958624656971
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.48423136376416864,
          "rfd_rmse_raw": 4.349773284763359,
          "fidelity_final": 0.8909579452857174,
          "shape_fidelity": 0.8909579452857174,
          "amplitude_fidelity": 0.6737494062003202,
          "path_length": 24.204021952557653,
          "recovery_ratio": 0.17971283009449243,
          "drift_slope_b": 0.3917235355097954,
          "drift_a": 0.1533776283401858
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.47426348369920707,
          "rfd_rmse_raw": 4.260233404332541,
          "fidelity_final": 0.8916324157020692,
          "shape_fidelity": 0.8916324157020692,
          "amplitude_fidelity": 0.6783048017243228,
          "path_length": 23.37396279881985,
          "recovery_ratio": 0.18226406198214878,
          "drift_slope_b": 0.44862665175946087,
          "drift_a": 0.1290601716709513
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.4876759614902091,
          "rfd_rmse_raw": 4.380715557996169,
          "fidelity_final": 0.890262052081877,
          "shape_fidelity": 0.890262052081877,
          "amplitude_fidelity": 0.672189391968327,
          "path_length": 24.60541790368717,
          "recovery_ratio": 0.17803865697967725,
          "drift_slope_b": 0.37904243145587907,
          "drift_a": 0.15980184881101392
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4773020746452384,
          "rfd_rmse_raw": 4.287528583268551,
          "fidelity_final": 0.8918013884015732,
          "shape_fidelity": 0.8918013884015732,
          "amplitude_fidelity": 0.6769096294947948,
          "path_length": 23.557697615159807,
          "recovery_ratio": 0.18200117232634178,
          "drift_slope_b": 0.42563750272045914,
          "drift_a": 0.1380991288074474
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 12.369373972128045,
          "rfd_rmse_raw": 111.11211804820952,
          "fidelity_final": 0.014638839456518666,
          "shape_fidelity": 0.014638839456518666,
          "amplitude_fidelity": 0.07479781791464293,
          "path_length": 238.5273869399508,
          "recovery_ratio": 0.46582541096709357,
          "drift_slope_b": 0.37278746378588556,
          "drift_a": 3.8338764852220937
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 13.837237288433355,
          "rfd_rmse_raw": 124.29770063690479,
          "fidelity_final": 0.0074577041558954015,
          "shape_fidelity": 0.0074577041558954015,
          "amplitude_fidelity": 0.06739799199542146,
          "path_length": 219.61505674990806,
          "recovery_ratio": 0.5659798671201848,
          "drift_slope_b": 0.4238618456315301,
          "drift_a": 3.743853479587971
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 13.396691700279405,
          "rfd_rmse_raw": 120.34034972271311,
          "fidelity_final": 0.009479710891799243,
          "shape_fidelity": 0.009479710891799243,
          "amplitude_fidelity": 0.06946040248820445,
          "path_length": 225.05828734497567,
          "recovery_ratio": 0.5347074801926847,
          "drift_slope_b": 0.4090728626109758,
          "drift_a": 3.7727976621082733
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 15.674507981301053,
          "rfd_rmse_raw": 140.80161090531672,
          "fidelity_final": 0.0000290988337804422,
          "shape_fidelity": 0.0000290988337804422,
          "amplitude_fidelity": 0.05997178454209318,
          "path_length": 199.72823399618497,
          "recovery_ratio": 0.7049659834673458,
          "drift_slope_b": 0.4808659363687403,
          "drift_a": 3.616390201418349
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 12.855970472928263,
          "rfd_rmse_raw": 115.48313698260252,
          "fidelity_final": 0.012112561922683772,
          "shape_fidelity": 0.012112561922683772,
          "amplitude_fidelity": 0.07217105448902304,
          "path_length": 232.0086771019806,
          "recovery_ratio": 0.49775352553663893,
          "drift_slope_b": 0.39029148590210677,
          "drift_a": 3.80635496710994
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 14.784163995712763,
          "rfd_rmse_raw": 132.80379256357088,
          "fidelity_final": 0.0034430348938998597,
          "shape_fidelity": 0.0034430348938998597,
          "amplitude_fidelity": 0.06335463824828584,
          "path_length": 208.6768757332326,
          "recovery_ratio": 0.6364087640134309,
          "drift_slope_b": 0.45414909399323744,
          "drift_a": 3.67884962237655
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.19109288504367097,
          "rfd_rmse_raw": 1.7165569776602356,
          "fidelity_final": 0.9835087210555841,
          "shape_fidelity": 0.9835087210555841,
          "amplitude_fidelity": 0.8395650856090332,
          "path_length": 6.194774043174744,
          "recovery_ratio": 0.27709759318041594,
          "drift_slope_b": 0.30360658185333905,
          "drift_a": 0.07720656054569472
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.18113687024638075,
          "rfd_rmse_raw": 1.6271236810407859,
          "fidelity_final": 0.9846290590659227,
          "shape_fidelity": 0.9846290590659227,
          "amplitude_fidelity": 0.8466419304914288,
          "path_length": 7.025962690983796,
          "recovery_ratio": 0.23158729310202913,
          "drift_slope_b": 0.31018374748748484,
          "drift_a": 0.07436221969636136
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.18354843765827936,
          "rfd_rmse_raw": 1.6487864073481862,
          "fidelity_final": 0.9843648904140582,
          "shape_fidelity": 0.9843648904140582,
          "amplitude_fidelity": 0.8449168349869643,
          "path_length": 6.786517507154674,
          "recovery_ratio": 0.2429502916053714,
          "drift_slope_b": 0.3082697945539178,
          "drift_a": 0.07510098982722344
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.17452946503593808,
          "rfd_rmse_raw": 1.5677704114744073,
          "fidelity_final": 0.9853184585593097,
          "shape_fidelity": 0.9853184585593097,
          "amplitude_fidelity": 0.8514047793338263,
          "path_length": 7.933570429160886,
          "recovery_ratio": 0.19761221324913938,
          "drift_slope_b": 0.3158657355389642,
          "drift_a": 0.07233477458457388
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.18713547640296754,
          "rfd_rmse_raw": 1.6810082055848132,
          "fidelity_final": 0.983963086125978,
          "shape_fidelity": 0.983963086125978,
          "amplitude_fidelity": 0.8423638412609907,
          "path_length": 6.480569921877596,
          "recovery_ratio": 0.25939203277630557,
          "drift_slope_b": 0.30579486731990213,
          "drift_a": 0.07614470459276652
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.17715306905441167,
          "rfd_rmse_raw": 1.591337828877201,
          "fidelity_final": 0.9850524641043966,
          "shape_fidelity": 0.9850524641043966,
          "amplitude_fidelity": 0.8495071934895299,
          "path_length": 7.511155271494256,
          "recovery_ratio": 0.21186325822826763,
          "drift_slope_b": 0.31365043640272955,
          "drift_a": 0.07311302137029324
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0345495265085816,
          "rfd_rmse_raw": 37.21921091993034,
          "fidelity_final": 0.035604725302049424,
          "shape_fidelity": 0.035604725302049424,
          "amplitude_fidelity": 0.4915092933206028,
          "path_length": 40.28078295297237,
          "recovery_ratio": 0.9239942273064452,
          "drift_slope_b": 0.07872175383776613,
          "drift_a": 0.83541377889331
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0344133673910176,
          "rfd_rmse_raw": 37.214312425672276,
          "fidelity_final": 0.03835077297083607,
          "shape_fidelity": 0.03835077297083607,
          "amplitude_fidelity": 0.49154218903035657,
          "path_length": 39.968108932326984,
          "recovery_ratio": 0.9311001550932178,
          "drift_slope_b": 0.03814488519070106,
          "drift_a": 0.933153077347535
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0344506157648816,
          "rfd_rmse_raw": 37.21565248242911,
          "fidelity_final": 0.03760214472511948,
          "shape_fidelity": 0.03760214472511948,
          "amplitude_fidelity": 0.4915331894768237,
          "path_length": 40.03875905358836,
          "recovery_ratio": 0.9294906576055274,
          "drift_slope_b": 0.04706859678984094,
          "drift_a": 0.9108448728338427
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0342839995022624,
          "rfd_rmse_raw": 37.20965825434991,
          "fidelity_final": 0.04093249033856332,
          "shape_fidelity": 0.04093249033856332,
          "amplitude_fidelity": 0.49157344807542824,
          "path_length": 40.09553446376776,
          "recovery_ratio": 0.9280249970972287,
          "drift_slope_b": 0.016107066255175172,
          "drift_a": 0.9902411146523333
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.03450041057764,
          "rfd_rmse_raw": 37.21744391299022,
          "fidelity_final": 0.036598192398035086,
          "shape_fidelity": 0.036598192398035086,
          "amplitude_fidelity": 0.491521159101697,
          "path_length": 40.15575844281485,
          "recovery_ratio": 0.926827069297943,
          "drift_slope_b": 0.061371907381206715,
          "drift_a": 0.8760526532608423
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.034341985228048,
          "rfd_rmse_raw": 37.211744363234075,
          "fidelity_final": 0.039779088494095,
          "shape_fidelity": 0.039779088494095,
          "amplitude_fidelity": 0.49155943654571965,
          "path_length": 39.938049616693476,
          "recovery_ratio": 0.9317366451385285,
          "drift_slope_b": 0.024487777016656283,
          "drift_a": 0.9681977424125313
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0343592153881995,
          "rfd_rmse_raw": 37.21236423975853,
          "fidelity_final": 0.03955738726456014,
          "shape_fidelity": 0.03955738726456014,
          "amplitude_fidelity": 0.49155527324567333,
          "path_length": 40.74844063857531,
          "recovery_ratio": 0.9132217983460872,
          "drift_slope_b": 0.0829153261580254,
          "drift_a": 0.8258805343355846
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0342694988956376,
          "rfd_rmse_raw": 37.20913657692161,
          "fidelity_final": 0.04129972236027327,
          "shape_fidelity": 0.04129972236027327,
          "amplitude_fidelity": 0.49157695209158814,
          "path_length": 42.93452655636821,
          "recovery_ratio": 0.866648349506549,
          "drift_slope_b": 0.014758731157532444,
          "drift_a": 0.994566835178087
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0342909140033176,
          "rfd_rmse_raw": 37.20990701215859,
          "fidelity_final": 0.04088244725783619,
          "shape_fidelity": 0.04088244725783619,
          "amplitude_fidelity": 0.49157177723026935,
          "path_length": 41.899122560726134,
          "recovery_ratio": 0.888083204086881,
          "drift_slope_b": 0.030486867540835738,
          "drift_a": 0.9532053288504939
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0342145991590883,
          "rfd_rmse_raw": 37.207161490353286,
          "fidelity_final": 0.042383883433586914,
          "shape_fidelity": 0.042383883433586914,
          "amplitude_fidelity": 0.49159021885566256,
          "path_length": 51.06909708658984,
          "recovery_ratio": 0.7285650934314924,
          "drift_slope_b": -0.026995157640800998,
          "drift_a": 1.1117566545282926
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.034323522134617,
          "rfd_rmse_raw": 37.211080130395494,
          "fidelity_final": 0.04024912403172604,
          "shape_fidelity": 0.04024912403172604,
          "amplitude_fidelity": 0.49156389783602333,
          "path_length": 41.138141601156576,
          "recovery_ratio": 0.9045396481728607,
          "drift_slope_b": 0.05474311289149876,
          "drift_a": 0.8923255867610068
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0342362310886444,
          "rfd_rmse_raw": 37.207939726027966,
          "fidelity_final": 0.04195291615423134,
          "shape_fidelity": 0.04195291615423134,
          "amplitude_fidelity": 0.49158499131875105,
          "path_length": 46.74618447312498,
          "recovery_ratio": 0.7959567212896129,
          "drift_slope_b": -0.01049752940854969,
          "drift_a": 1.0641694531716908
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.5688073738456847,
          "rfd_rmse_raw": 20.463555467876965,
          "fidelity_final": 0.9486042229453898,
          "shape_fidelity": 0.9486042229453898,
          "amplitude_fidelity": 0.6374268866091936,
          "path_length": 125.22235464341509,
          "recovery_ratio": 0.1634177501784667,
          "drift_slope_b": 0.7814990727192294,
          "drift_a": 0.051725964215741334
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.5194944818286734,
          "rfd_rmse_raw": 18.68946260714463,
          "fidelity_final": 0.9572710541292043,
          "shape_fidelity": 0.9572710541292043,
          "amplitude_fidelity": 0.6581136107822684,
          "path_length": 118.96768611264089,
          "recovery_ratio": 0.1570969665615677,
          "drift_slope_b": 0.7767424198272413,
          "drift_a": 0.04766034283120321
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.5332926488560572,
          "rfd_rmse_raw": 19.185868893882574,
          "fidelity_final": 0.9551213627769147,
          "shape_fidelity": 0.9551213627769147,
          "amplitude_fidelity": 0.6521912178644236,
          "path_length": 120.55468135621715,
          "recovery_ratio": 0.15914661030202404,
          "drift_slope_b": 0.7788452551001148,
          "drift_a": 0.04867384388276864
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.46960734406357724,
          "rfd_rmse_raw": 16.89471053864099,
          "fidelity_final": 0.9632941482110284,
          "shape_fidelity": 0.9632941482110284,
          "amplitude_fidelity": 0.680453866836922,
          "path_length": 114.30931354408155,
          "recovery_ratio": 0.14779819784435863,
          "drift_slope_b": 0.7627690552077249,
          "drift_a": 0.04488716004068265
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.5513672322041943,
          "rfd_rmse_raw": 19.836124597149375,
          "fidelity_final": 0.9519863530458135,
          "shape_fidelity": 0.9519863530458135,
          "amplitude_fidelity": 0.644592704577879,
          "path_length": 122.8250553106746,
          "recovery_ratio": 0.16149900805642411,
          "drift_slope_b": 0.7806543744877424,
          "drift_a": 0.05014926375189706
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4923540957372179,
          "rfd_rmse_raw": 17.713053330930197,
          "fidelity_final": 0.960893953813583,
          "shape_fidelity": 0.960893953813583,
          "amplitude_fidelity": 0.6700822565210326,
          "path_length": 116.21943505113246,
          "recovery_ratio": 0.15241042363643462,
          "drift_slope_b": 0.7705015098462119,
          "drift_a": 0.045969296095001895
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.635544009870909,
          "rfd_rmse_raw": 22.864489274006196,
          "fidelity_final": 0.816572310980902,
          "shape_fidelity": 0.816572310980902,
          "amplitude_fidelity": 0.6114173595847956,
          "path_length": 54.57760896800421,
          "recovery_ratio": 0.41893534191668896,
          "drift_slope_b": 0.38842381302936485,
          "drift_a": 0.18757408955959085
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.6997231739770658,
          "rfd_rmse_raw": 25.173414834673455,
          "fidelity_final": 0.7899394007720411,
          "shape_fidelity": 0.7899394007720411,
          "amplitude_fidelity": 0.5883310972693092,
          "path_length": 48.39911438415678,
          "recovery_ratio": 0.520121393851658,
          "drift_slope_b": 0.43160411075979915,
          "drift_a": 0.18462013331361585
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.6801035239152057,
          "rfd_rmse_raw": 24.46757342726207,
          "fidelity_final": 0.798135447616569,
          "shape_fidelity": 0.798135447616569,
          "amplitude_fidelity": 0.5952014181064652,
          "path_length": 50.09008531390362,
          "recovery_ratio": 0.488471386581379,
          "drift_slope_b": 0.4187256118908133,
          "drift_a": 0.18569017866599574
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.783816186545268,
          "rfd_rmse_raw": 28.198765957524998,
          "fidelity_final": 0.754453183310546,
          "shape_fidelity": 0.754453183310546,
          "amplitude_fidelity": 0.5605958772785377,
          "path_length": 42.60908270158485,
          "recovery_ratio": 0.6618017607892821,
          "drift_slope_b": 0.48326359525174045,
          "drift_a": 0.17930181208887655
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.6564158086400002,
          "rfd_rmse_raw": 23.615378294551025,
          "fidelity_final": 0.8079705327700832,
          "shape_fidelity": 0.8079705327700832,
          "amplitude_fidelity": 0.6037131466531038,
          "path_length": 52.348978721203736,
          "recovery_ratio": 0.4511144032115705,
          "drift_slope_b": 0.4027846049700115,
          "drift_a": 0.1868099688589698
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.7426736284306512,
          "rfd_rmse_raw": 26.718611060135743,
          "fidelity_final": 0.7718724700590959,
          "shape_fidelity": 0.7718724700590959,
          "amplitude_fidelity": 0.5738309134226934,
          "path_length": 45.169129856325874,
          "recovery_ratio": 0.5915237053519161,
          "drift_slope_b": 0.45870739415904027,
          "drift_a": 0.18199933010863467
        }
      },
      "mode": "constant_neutral"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.1271672701096735,
          "rfd_rmse_raw": 40.55124988538288,
          "fidelity_final": 0.2283954237803692,
          "shape_fidelity": 0.2283954237803692,
          "amplitude_fidelity": 0.4701087752015109,
          "path_length": 70.74734061303214,
          "recovery_ratio": 0.5731840876844644,
          "drift_slope_b": 1.1616004111591312,
          "drift_a": 0.034284226416254546
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9211499319001246,
          "rfd_rmse_raw": 33.13951891696682,
          "fidelity_final": 0.5027639953924187,
          "shape_fidelity": 0.5027639953924187,
          "amplitude_fidelity": 0.5205215810568955,
          "path_length": 72.98207064156523,
          "recovery_ratio": 0.45407753747799234,
          "drift_slope_b": 1.113735324276759,
          "drift_a": 0.0314750897857705
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9799621430985088,
          "rfd_rmse_raw": 35.25536164577986,
          "fidelity_final": 0.4314104636086957,
          "shape_fidelity": 0.4314104636086957,
          "amplitude_fidelity": 0.505060161622619,
          "path_length": 71.99988866028819,
          "recovery_ratio": 0.4896585578364246,
          "drift_slope_b": 1.130601305508128,
          "drift_a": 0.032065653071561194
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.7040585177957815,
          "rfd_rmse_raw": 25.329384241516404,
          "fidelity_final": 0.7222176477975814,
          "shape_fidelity": 0.7222176477975814,
          "amplitude_fidelity": 0.5868343073649319,
          "path_length": 78.49441307255387,
          "recovery_ratio": 0.3226902813847907,
          "drift_slope_b": 1.0222488857175083,
          "drift_a": 0.030925300230174108
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0557460377836716,
          "rfd_rmse_raw": 37.98178187830361,
          "fidelity_final": 0.3313891838256091,
          "shape_fidelity": 0.3313891838256091,
          "amplitude_fidelity": 0.4864414094058593,
          "path_length": 71.12053452953235,
          "recovery_ratio": 0.5340480373151851,
          "drift_slope_b": 1.1484255543464656,
          "drift_a": 0.033073641797109705
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.8036877484338667,
          "rfd_rmse_raw": 28.913670207431945,
          "fidelity_final": 0.6297815019404187,
          "shape_fidelity": 0.6297815019404187,
          "amplitude_fidelity": 0.5544196887007161,
          "path_length": 75.62413973883938,
          "recovery_ratio": 0.3823338725872783,
          "drift_slope_b": 1.0707183269941853,
          "drift_a": 0.03082620570447136
        }
      },
      "mode": "constant_neutral"
    }
  ],
  "scoreboard": {
    "mechanism_lowest_rfd_arm": {
      "scaling": "e",
      "recursive_weighting": "e",
      "hierarchical_resolution": "e",
      "recursive_feedback": "baseline",
      "recursive_compression": "e"
    },
    "egs_mechanism_lowest_count": 0,
    "baseline_mechanism_lowest_count": 1,
    "n_mechanisms": 5,
    "mean_final_rfd_by_arm": {
      "baseline": 1.3874612447380812,
      "egs": 1.426464094753785,
      "sqrt2": 1.4143357655315483,
      "e": 1.4808530463785208,
      "random_0": 1.39994652166006,
      "random_1": 1.4537467242058295
    },
    "lowest_mean_rfd_arm": "baseline",
    "nest_heavy_mean_final_rfd_by_arm": {
      "baseline": 1.6768201167437613,
      "egs": 1.7509021010110566,
      "sqrt2": 1.7280457569494947,
      "e": 1.851710870687282,
      "random_0": 1.7007215688802861,
      "random_1": 1.8017890583074196
    },
    "lowest_nest_heavy_mean_rfd_arm": "baseline",
    "lowest_named_mean_rfd_arm": "baseline",
    "named_mean_final_rfd_by_arm": {
      "baseline": 1.3874612447380812,
      "egs": 1.426464094753785,
      "sqrt2": 1.4143357655315483,
      "e": 1.4808530463785208
    },
    "phi_vs_baseline_pct": -0.028110947360599315,
    "engineering_threshold_pct": 0.15,
    "paired_delta_baseline_minus_phi": {
      "n": 30,
      "mean_delta": -0.03900285001570409,
      "median_delta": 0.007048524389677513,
      "std_delta": 0.2786114902940496,
      "fraction_positive": 0.8,
      "effect_size_cohens_d": -0.13999009866585208,
      "bootstrap_ci95": [
        -0.14815168530452905,
        0.029606181786917398
      ]
    },
    "permutation_p_mean_delta": 0.7680798004987531,
    "paired_delta_by_domain": {
      "synthetic_logistic": {
        "mean": -0.01773748183908528,
        "n": 5
      },
      "synthetic_ar1": {
        "mean": 0.05175214950805449,
        "n": 5
      },
      "synthetic_seasonal": {
        "mean": -0.040317508715370744,
        "n": 5
      },
      "synthetic_powerlaw": {
        "mean": 0.02260129245809823,
        "n": 5
      },
      "env_co2_proxy": {
        "mean": -0.2885909398520271,
        "n": 5
      },
      "astro_sunspot_proxy": {
        "mean": 0.038275388346105846,
        "n": 5
      }
    },
    "paired_delta_by_mechanism": {
      "scaling": {
        "mean": 0.009274847203073977,
        "n": 6
      },
      "recursive_weighting": {
        "mean": 0.01034892563192578,
        "n": 6
      },
      "hierarchical_resolution": {
        "mean": 0.017956855520291443,
        "n": 6
      },
      "recursive_feedback": {
        "mean": -0.3043962371555089,
        "n": 6
      },
      "recursive_compression": {
        "mean": 0.0718013587216973,
        "n": 6
      }
    },
    "phi_beats_random_fraction": 0.5
  },
  "pass": true,
  "interpretation": "Identical recursion topology and evaluator; only scalar nest-weight c differs. No Φ-specific closure. Scoreboard reports paired Δ and means — suite pass does not crown Φ.",
  "honesty": "Primary causal lane. Proxy fixtures. NRMSE primary. 15% band is engineering threshold only."
}
```

### E1g_grammar_closure — ERFT-G · Generalized closure C(c) for every arm

- **Pass:** `true`
- **Interpretation:** Same algorithm family with symmetric C(c) re-entry on nest-heavy paths. Asks whether exploiting nest algebra adds stability — and whether Φ benefits disproportionately vs decoys under the same operator.
- **Honesty:** Architectural hypothesis lane — not a substitute for ERFT-C causal isolation.

```json
{
  "id": "E1g_grammar_closure",
  "title": "ERFT-G · Generalized closure C(c) for every arm",
  "mode": "grammar",
  "rows": [
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0154006160898725,
          "rfd_rmse_raw": 0.20941493696394742,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4961792668001284,
          "path_length": 0.3323026691018708,
          "recovery_ratio": 0.6301933641699072,
          "drift_slope_b": 0.12479403248670441,
          "drift_a": 0.6917240449604278
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.014367395204656,
          "rfd_rmse_raw": 0.2092018467972498,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4964337699173303,
          "path_length": 0.33247631439266523,
          "recovery_ratio": 0.6292233092736215,
          "drift_slope_b": 0.0979552673659062,
          "drift_a": 0.7397488547110979
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.014717162209313,
          "rfd_rmse_raw": 0.2092739823012781,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4963475860320825,
          "path_length": 0.33092983621134736,
          "recovery_ratio": 0.6323817299073206,
          "drift_slope_b": 0.10607780703314487,
          "drift_a": 0.725014848089452
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.012867692568595,
          "rfd_rmse_raw": 0.20889255002510013,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4968036417355939,
          "path_length": 0.3481367099433638,
          "recovery_ratio": 0.6000302296735198,
          "drift_slope_b": 0.0647076861085028,
          "drift_a": 0.8020099601625106
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0151085435352918,
          "rfd_rmse_raw": 0.20935470029022749,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4962511836933643,
          "path_length": 0.3307213462222167,
          "recovery_ratio": 0.6330244560312078,
          "drift_slope_b": 0.11599903722433541,
          "drift_a": 0.7072640246013617
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0135828238231372,
          "rfd_rmse_raw": 0.20904003778925728,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49662720011751293,
          "path_length": 0.3390349712307535,
          "recovery_ratio": 0.6165736738909472,
          "drift_slope_b": 0.08062258409996857,
          "drift_a": 0.7718221967719519
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.014908323634785,
          "rfd_rmse_raw": 0.20931340719154387,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4963004957942972,
          "path_length": 0.35276794302499087,
          "recovery_ratio": 0.593345884540069,
          "drift_slope_b": 0.11236189271267213,
          "drift_a": 0.7117165179382707
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0123566246477642,
          "rfd_rmse_raw": 0.2087871480244226,
          "fidelity_final": 0.015793582346449325,
          "shape_fidelity": 0.015793582346449325,
          "amplitude_fidelity": 0.49692981241584677,
          "path_length": 0.3650640347389238,
          "recovery_ratio": 0.5719192474650019,
          "drift_slope_b": 0.07838346757589304,
          "drift_a": 0.7756896100377888
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0130409161398701,
          "rfd_rmse_raw": 0.2089282754350363,
          "fidelity_final": 0.006410155471914177,
          "shape_fidelity": 0.006410155471914177,
          "amplitude_fidelity": 0.4967608914366041,
          "path_length": 0.35914447847432224,
          "recovery_ratio": 0.5817387930411244,
          "drift_slope_b": 0.0892752727771149,
          "drift_a": 0.7546647853760081
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.01168391159404,
          "rfd_rmse_raw": 0.20864840853627553,
          "fidelity_final": 0.03125279404116388,
          "shape_fidelity": 0.03125279404116388,
          "amplitude_fidelity": 0.4970959872158092,
          "path_length": 0.40370979801239104,
          "recovery_ratio": 0.5168277053554977,
          "drift_slope_b": 0.03158525765435828,
          "drift_a": 0.8723779071498531
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0140044399213715,
          "rfd_rmse_raw": 0.20912699135934149,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.49652323509229257,
          "path_length": 0.35424836472901094,
          "recovery_ratio": 0.5903400330988604,
          "drift_slope_b": 0.10195417576137662,
          "drift_a": 0.7308214213400119
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0114507357064138,
          "rfd_rmse_raw": 0.2086003186365503,
          "fidelity_final": 0.029271608643864706,
          "shape_fidelity": 0.029271608643864706,
          "amplitude_fidelity": 0.4971536126878115,
          "path_length": 0.38236163167838816,
          "recovery_ratio": 0.545557664143478,
          "drift_slope_b": 0.054222162121871365,
          "drift_a": 0.8242534482888044
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0088496898442636,
          "rfd_rmse_raw": 0.20806388223240466,
          "fidelity_final": 0.03157905742858171,
          "shape_fidelity": 0.03157905742858171,
          "amplitude_fidelity": 0.49779732403847754,
          "path_length": 0.3472290863011503,
          "recovery_ratio": 0.5992121352758788,
          "drift_slope_b": 0.01467077511590461,
          "drift_a": 0.9699546780433044
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0087917195143679,
          "rfd_rmse_raw": 0.20805192650499169,
          "fidelity_final": 0.03334692164762809,
          "shape_fidelity": 0.03334692164762809,
          "amplitude_fidelity": 0.49781168962691336,
          "path_length": 0.35324714508114763,
          "recovery_ratio": 0.588969873931177,
          "drift_slope_b": 0.01627834300904087,
          "drift_a": 0.9657098747810579
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0088102280620377,
          "rfd_rmse_raw": 0.20805574368442034,
          "fidelity_final": 0.032788845376495755,
          "shape_fidelity": 0.032788845376495755,
          "amplitude_fidelity": 0.49780710294607144,
          "path_length": 0.3511588971942685,
          "recovery_ratio": 0.5924831902217744,
          "drift_slope_b": 0.015840583429074684,
          "drift_a": 0.9668655543562548
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0087054105571753,
          "rfd_rmse_raw": 0.20803412625497855,
          "fidelity_final": 0.035867438453836206,
          "shape_fidelity": 0.035867438453836206,
          "amplitude_fidelity": 0.49783307932775456,
          "path_length": 0.3636070850336014,
          "recovery_ratio": 0.5721399137086502,
          "drift_slope_b": 0.017708998041817595,
          "drift_a": 0.9619240188147166
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0088316717781274,
          "rfd_rmse_raw": 0.20806016620926623,
          "fidelity_final": 0.03213459447445499,
          "shape_fidelity": 0.03213459447445499,
          "amplitude_fidelity": 0.49780178899451794,
          "path_length": 0.34890256768645006,
          "recovery_ratio": 0.5963274148106719,
          "drift_slope_b": 0.01525057454093014,
          "drift_a": 0.9684231647667197
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0087490043894163,
          "rfd_rmse_raw": 0.20804311699172434,
          "fidelity_final": 0.03461092510556027,
          "shape_fidelity": 0.03461092510556027,
          "amplitude_fidelity": 0.49782227536384627,
          "path_length": 0.35831487364638787,
          "recovery_ratio": 0.5806153534029318,
          "drift_slope_b": 0.01709209576392135,
          "drift_a": 0.9635594198297637
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.6328274603886634,
          "rfd_rmse_raw": 0.336752267304149,
          "fidelity_final": 0.028275941792886523,
          "shape_fidelity": 0.028275941792886523,
          "amplitude_fidelity": 0.37981980021295353,
          "path_length": 0.5607935057481281,
          "recovery_ratio": 0.6004924519496774,
          "drift_slope_b": 0.29891072463782636,
          "drift_a": 0.652666070973949
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.733395091598133,
          "rfd_rmse_raw": 0.3574932081866199,
          "fidelity_final": 0.029964037230194134,
          "shape_fidelity": 0.029964037230194134,
          "amplitude_fidelity": 0.3658453924475771,
          "path_length": 0.5290011759014807,
          "recovery_ratio": 0.675789061484427,
          "drift_slope_b": 0.3190978419460183,
          "drift_a": 0.649928115852108
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.706377722725978,
          "rfd_rmse_raw": 0.35192118025041336,
          "fidelity_final": 0.029509958465058023,
          "shape_fidelity": 0.029509958465058023,
          "amplitude_fidelity": 0.36949757293773383,
          "path_length": 0.5372860669889585,
          "recovery_ratio": 0.6549977784137206,
          "drift_slope_b": 0.31445902238909196,
          "drift_a": 0.6494556046226072
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.8274955843085172,
          "rfd_rmse_raw": 0.37690037461626613,
          "fidelity_final": 0.03158637546254913,
          "shape_fidelity": 0.03158637546254913,
          "amplitude_fidelity": 0.3536698715108893,
          "path_length": 0.5037752211291384,
          "recovery_ratio": 0.7481518717246536,
          "drift_slope_b": 0.33137426120500374,
          "drift_a": 0.6574774169069568
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.6697407698665725,
          "rfd_rmse_raw": 0.3443652214967657,
          "fidelity_final": 0.028896612682860798,
          "shape_fidelity": 0.028896612682860798,
          "amplitude_fidelity": 0.37456820200935753,
          "path_length": 0.548872667523542,
          "recovery_ratio": 0.6274045728137762,
          "drift_slope_b": 0.3072523647602394,
          "drift_a": 0.6502267603849672
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.7848836405727613,
          "rfd_rmse_raw": 0.36811214131215636,
          "fidelity_final": 0.030841775536801487,
          "shape_fidelity": 0.030841775536801487,
          "amplitude_fidelity": 0.3590814299854668,
          "path_length": 0.5143020198182277,
          "recovery_ratio": 0.7157509150795481,
          "drift_slope_b": 0.32646911051151284,
          "drift_a": 0.6530822417010356
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0102376250240181,
          "rfd_rmse_raw": 0.20835012822592947,
          "fidelity_final": 0.005873507985461181,
          "shape_fidelity": 0.005873507985461181,
          "amplitude_fidelity": 0.49745362814411154,
          "path_length": 0.2861829623567512,
          "recovery_ratio": 0.7280312095106607,
          "drift_slope_b": 0.03207436483577728,
          "drift_a": 0.9259681449827621
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0095456451752343,
          "rfd_rmse_raw": 0.2082074151783725,
          "fidelity_final": 0.01687144132766079,
          "shape_fidelity": 0.01687144132766079,
          "amplitude_fidelity": 0.4976249245200893,
          "path_length": 0.2916920105034593,
          "recovery_ratio": 0.7137919712610822,
          "drift_slope_b": 0.031204218971445652,
          "drift_a": 0.9276622838750064
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0097210992037438,
          "rfd_rmse_raw": 0.2082436005949836,
          "fidelity_final": 0.013701725759774151,
          "shape_fidelity": 0.013701725759774151,
          "amplitude_fidelity": 0.497581480532897,
          "path_length": 0.28940403955349936,
          "recovery_ratio": 0.7195601032945761,
          "drift_slope_b": 0.03177174532113893,
          "drift_a": 0.9263564392975014
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0089924782984596,
          "rfd_rmse_raw": 0.20809333074234332,
          "fidelity_final": 0.028604060575517835,
          "shape_fidelity": 0.028604060575517835,
          "amplitude_fidelity": 0.49776194326370105,
          "path_length": 0.30536886953826264,
          "recovery_ratio": 0.6814490653778619,
          "drift_slope_b": 0.02772778560692959,
          "drift_a": 0.9360869877645476
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0099705799186642,
          "rfd_rmse_raw": 0.2082950531816385,
          "fidelity_final": 0.009649031451384902,
          "shape_fidelity": 0.009649031451384902,
          "amplitude_fidelity": 0.49751971993563515,
          "path_length": 0.28728430130037663,
          "recovery_ratio": 0.7250485050481434,
          "drift_slope_b": 0.03215266463870648,
          "drift_a": 0.9255767921840067
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0092307751423815,
          "rfd_rmse_raw": 0.20814247678160883,
          "fidelity_final": 0.023232165474122678,
          "shape_fidelity": 0.023232165474122678,
          "amplitude_fidelity": 0.4977029081834247,
          "path_length": 0.29798769496750654,
          "recovery_ratio": 0.6984935294200832,
          "drift_slope_b": 0.029531200890368696,
          "drift_a": 0.9316710726772606
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.2754929214598643,
          "rfd_rmse_raw": 0.25453158047437013,
          "fidelity_final": 0.060281441578124526,
          "shape_fidelity": 0.060281441578124526,
          "amplitude_fidelity": 0.43946522116994347,
          "path_length": 0.5238213311919607,
          "recovery_ratio": 0.4859129732177591,
          "drift_slope_b": 0.16083760617579718,
          "drift_a": 0.7425171562001076
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.2467055384262256,
          "rfd_rmse_raw": 0.2487869009250029,
          "fidelity_final": 0.11754153794564298,
          "shape_fidelity": 0.11754153794564298,
          "amplitude_fidelity": 0.4450961565263603,
          "path_length": 0.5035634212210695,
          "recovery_ratio": 0.49405276563124895,
          "drift_slope_b": 0.1112311613245911,
          "drift_a": 0.8409479853437756
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.2544811478440303,
          "rfd_rmse_raw": 0.25033856626235346,
          "fidelity_final": 0.10242743598369694,
          "shape_fidelity": 0.10242743598369694,
          "amplitude_fidelity": 0.44356103884758763,
          "path_length": 0.5059118629065469,
          "recovery_ratio": 0.494826440368718,
          "drift_slope_b": 0.12564538120696916,
          "drift_a": 0.8110622547434319
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.2194688932091051,
          "rfd_rmse_raw": 0.24335167957857737,
          "fidelity_final": 0.1685063162213453,
          "shape_fidelity": 0.1685063162213453,
          "amplitude_fidelity": 0.4505582407844029,
          "path_length": 0.5155684199733163,
          "recovery_ratio": 0.4720065662500668,
          "drift_slope_b": 0.05756657031933017,
          "drift_a": 0.9619054728456873
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.2649749033835336,
          "rfd_rmse_raw": 0.25243265250747693,
          "fidelity_final": 0.08162121139507485,
          "shape_fidelity": 0.08162121139507485,
          "amplitude_fidelity": 0.4415059957203718,
          "path_length": 0.512976318249003,
          "recovery_ratio": 0.49209416405250894,
          "drift_slope_b": 0.143952253005653,
          "drift_a": 0.774641578605915
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.2318101349034987,
          "rfd_rmse_raw": 0.24581444177869596,
          "fidelity_final": 0.1457913715010724,
          "shape_fidelity": 0.1457913715010724,
          "amplitude_fidelity": 0.44806678863981375,
          "path_length": 0.5063353173812368,
          "recovery_ratio": 0.4854775745252114,
          "drift_slope_b": 0.08218253425980039,
          "drift_a": 0.904501866885347
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.2274903357015505,
          "rfd_rmse_raw": 0.24495240224895454,
          "fidelity_final": 0.15655891988235918,
          "shape_fidelity": 0.15655891988235918,
          "amplitude_fidelity": 0.44893573003316706,
          "path_length": 0.505039867505986,
          "recovery_ratio": 0.48501597202333985,
          "drift_slope_b": 0.15839995499368073,
          "drift_a": 0.7338558629237182
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.201721731356353,
          "rfd_rmse_raw": 0.23981013647840455,
          "fidelity_final": 0.20108475899217534,
          "shape_fidelity": 0.20108475899217534,
          "amplitude_fidelity": 0.4541900031045058,
          "path_length": 0.5154200030418169,
          "recovery_ratio": 0.46527130313750814,
          "drift_slope_b": 0.10613472611107867,
          "drift_a": 0.8447264992817852
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.2083188711432098,
          "rfd_rmse_raw": 0.24112663176293903,
          "fidelity_final": 0.1898418264786885,
          "shape_fidelity": 0.1898418264786885,
          "amplitude_fidelity": 0.45283315424566234,
          "path_length": 0.5080005922306472,
          "recovery_ratio": 0.4746581705823297,
          "drift_slope_b": 0.12269821725864055,
          "drift_a": 0.8081689525967085
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.1802286490354763,
          "rfd_rmse_raw": 0.235521074484915,
          "fidelity_final": 0.2368815479092212,
          "shape_fidelity": 0.2368815479092212,
          "amplitude_fidelity": 0.4586674890463418,
          "path_length": 0.5709459783336064,
          "recovery_ratio": 0.41251026090475224,
          "drift_slope_b": 0.03885144832458964,
          "drift_a": 1.0093163773798839
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.2176384172421206,
          "rfd_rmse_raw": 0.2429863980995052,
          "fidelity_final": 0.17377267753103642,
          "shape_fidelity": 0.17377267753103642,
          "amplitude_fidelity": 0.4509301391178147,
          "path_length": 0.5034687001333632,
          "recovery_ratio": 0.48262463592104304,
          "drift_slope_b": 0.1422654719404377,
          "drift_a": 0.7667553519529657
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.189729092580495,
          "rfd_rmse_raw": 0.23741693989509183,
          "fidelity_final": 0.2212245682463275,
          "shape_fidelity": 0.2212245682463275,
          "amplitude_fidelity": 0.45667749649411926,
          "path_length": 0.5396416043855142,
          "recovery_ratio": 0.4399529946647399,
          "drift_slope_b": 0.07054789094614887,
          "drift_a": 0.9284042339265052
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9213318430623334,
          "rfd_rmse_raw": 0.1838568025039403,
          "fidelity_final": 0.5981200099938042,
          "shape_fidelity": 0.5981200099938042,
          "amplitude_fidelity": 0.5204722982190002,
          "path_length": 0.9350936662314,
          "recovery_ratio": 0.19661859463225445,
          "drift_slope_b": 0.2630752796309028,
          "drift_a": 0.4241392585429255
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.890616441698308,
          "rfd_rmse_raw": 0.17772737636401167,
          "fidelity_final": 0.624993035941396,
          "shape_fidelity": 0.624993035941396,
          "amplitude_fidelity": 0.5289280141358114,
          "path_length": 0.9170762539611615,
          "recovery_ratio": 0.19379781735307966,
          "drift_slope_b": 0.2681211980556134,
          "drift_a": 0.40578918882212744
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.8994529947655683,
          "rfd_rmse_raw": 0.17949075880252893,
          "fidelity_final": 0.6174820874162559,
          "shape_fidelity": 0.6174820874162559,
          "amplitude_fidelity": 0.5264673581056006,
          "path_length": 0.9203442460352661,
          "recovery_ratio": 0.1950256760725716,
          "drift_slope_b": 0.2668758294698635,
          "drift_a": 0.41069549710932557
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.8569708639955955,
          "rfd_rmse_raw": 0.17101321752819243,
          "fidelity_final": 0.6520016209529051,
          "shape_fidelity": 0.6520016209529051,
          "amplitude_fidelity": 0.5385114109159076,
          "path_length": 0.9177883425984906,
          "recovery_ratio": 0.1863318693327601,
          "drift_slope_b": 0.27082000530268896,
          "drift_a": 0.39015659875015907
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9107402481196607,
          "rfd_rmse_raw": 0.1817431918714193,
          "fidelity_final": 0.6076304781157266,
          "shape_fidelity": 0.6076304781157266,
          "amplitude_fidelity": 0.5233573747054784,
          "path_length": 0.9267282870441169,
          "recovery_ratio": 0.19611270575446177,
          "drift_slope_b": 0.2650298393001453,
          "drift_a": 0.4174076595692461
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.8726549702921991,
          "rfd_rmse_raw": 0.1741430666216969,
          "fidelity_final": 0.6397219993068081,
          "shape_fidelity": 0.6397219993068081,
          "amplitude_fidelity": 0.5340011992940511,
          "path_length": 0.9149063605762111,
          "recovery_ratio": 0.19033977041324865,
          "drift_slope_b": 0.2700095753565018,
          "drift_a": 0.39681685086385876
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.7102706983934275,
          "rfd_rmse_raw": 0.14173839806166463,
          "fidelity_final": 0.7441351105651461,
          "shape_fidelity": 0.7441351105651461,
          "amplitude_fidelity": 0.5847027613461234,
          "path_length": 0.2655510058770939,
          "recovery_ratio": 0.5337520661746844,
          "drift_slope_b": 0.4803101751222051,
          "drift_a": 0.17031302485462818
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.71422789835402,
          "rfd_rmse_raw": 0.1425280789319198,
          "fidelity_final": 0.7415859682229101,
          "shape_fidelity": 0.7415859682229101,
          "amplitude_fidelity": 0.5833530074736197,
          "path_length": 0.23653530787386495,
          "recovery_ratio": 0.6025657658176109,
          "drift_slope_b": 0.48291503415381876,
          "drift_a": 0.16826431285668592
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.713124580766205,
          "rfd_rmse_raw": 0.1423079058798653,
          "fidelity_final": 0.7422928421954607,
          "shape_fidelity": 0.7422928421954607,
          "amplitude_fidelity": 0.5837287090660647,
          "path_length": 0.2441313957767284,
          "recovery_ratio": 0.5829152183687744,
          "drift_slope_b": 0.4831230849700463,
          "drift_a": 0.168345815381669
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.718121862914216,
          "rfd_rmse_raw": 0.14330514083257187,
          "fidelity_final": 0.7391309026158279,
          "shape_fidelity": 0.7391309026158279,
          "amplitude_fidelity": 0.5820308917458487,
          "path_length": 0.21097746565810005,
          "recovery_ratio": 0.6792438253325371,
          "drift_slope_b": 0.47719037073942544,
          "drift_a": 0.17051623234630858
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.7116656674709305,
          "rfd_rmse_raw": 0.1420167717617737,
          "fidelity_final": 0.7432328111371632,
          "shape_fidelity": 0.7432328111371632,
          "amplitude_fidelity": 0.5842262417271877,
          "path_length": 0.254638515213645,
          "recovery_ratio": 0.5577191323261519,
          "drift_slope_b": 0.48233091963331504,
          "drift_a": 0.16900569270111465
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.7163532651043981,
          "rfd_rmse_raw": 0.14295220747780168,
          "fidelity_final": 0.7402376448295473,
          "shape_fidelity": 0.7402376448295473,
          "amplitude_fidelity": 0.5826306392345019,
          "path_length": 0.22235606054666995,
          "recovery_ratio": 0.6428977340502832,
          "drift_slope_b": 0.48068171760922607,
          "drift_a": 0.1690366346523149
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.2144780055970512,
          "rfd_rmse_raw": 0.24235572069045427,
          "fidelity_final": 0.21829952717842097,
          "shape_fidelity": 0.21829952717842097,
          "amplitude_fidelity": 0.4515736880079725,
          "path_length": 0.5123316040084689,
          "recovery_ratio": 0.4730446429505218,
          "drift_slope_b": 0.4817400017062558,
          "drift_a": 0.2760033738718839
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.084250955417839,
          "rfd_rmse_raw": 0.21636820139893853,
          "fidelity_final": 0.38022548987964294,
          "shape_fidelity": 0.38022548987964294,
          "amplitude_fidelity": 0.47978867295254546,
          "path_length": 0.5338047370419162,
          "recovery_ratio": 0.4053321118841037,
          "drift_slope_b": 0.43937883135521516,
          "drift_a": 0.2827253927455546
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.1190585075578965,
          "rfd_rmse_raw": 0.2233142385815774,
          "fidelity_final": 0.33785271779979537,
          "shape_fidelity": 0.33785271779979537,
          "amplitude_fidelity": 0.4719076875099817,
          "path_length": 0.5238307700139424,
          "recovery_ratio": 0.4263098912185583,
          "drift_slope_b": 0.4523177343696092,
          "drift_a": 0.27970417599302944
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9659361571802946,
          "rfd_rmse_raw": 0.19275783705882094,
          "fidelity_final": 0.5179051297572177,
          "shape_fidelity": 0.5179051297572177,
          "amplitude_fidelity": 0.5086635170463935,
          "path_length": 0.5972792876693869,
          "recovery_ratio": 0.32272647158245094,
          "drift_slope_b": 0.38601915933135683,
          "drift_a": 0.3007499582448808
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.1664486804405303,
          "rfd_rmse_raw": 0.23277120647204952,
          "fidelity_final": 0.27903905798052525,
          "shape_fidelity": 0.27903905798052525,
          "amplitude_fidelity": 0.4615849011464503,
          "path_length": 0.5154325980244412,
          "recovery_ratio": 0.451603579913686,
          "drift_slope_b": 0.4680024454762497,
          "drift_a": 0.27706962821799686
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0185876528543183,
          "rfd_rmse_raw": 0.2032647306548356,
          "fidelity_final": 0.4579568595742838,
          "shape_fidelity": 0.4579568595742838,
          "amplitude_fidelity": 0.495395876709135,
          "path_length": 0.5627443416070571,
          "recovery_ratio": 0.3612026201353929,
          "drift_slope_b": 0.4115782936574955,
          "drift_a": 0.2911580467715421
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0185319286129935,
          "rfd_rmse_raw": 1.4910963341439474,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.4954095527669638,
          "path_length": 2.181811617914794,
          "recovery_ratio": 0.6834212091917548,
          "drift_slope_b": 0.0635155533983375,
          "drift_a": 0.8247215895436825
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0090342368944258,
          "rfd_rmse_raw": 1.4771920343311074,
          "fidelity_final": 0.04871876863944017,
          "shape_fidelity": 0.04871876863944017,
          "amplitude_fidelity": 0.49775159707870614,
          "path_length": 2.1857515929544062,
          "recovery_ratio": 0.6758279573455266,
          "drift_slope_b": 0.04457152251632261,
          "drift_a": 0.8652427480431161
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0116168903333786,
          "rfd_rmse_raw": 1.4809729517152395,
          "fidelity_final": 0.032100503425062314,
          "shape_fidelity": 0.032100503425062314,
          "amplitude_fidelity": 0.4971125490173595,
          "path_length": 2.1733759650115836,
          "recovery_ratio": 0.6814159057415298,
          "drift_slope_b": 0.05052743450501912,
          "drift_a": 0.8521751188261333
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9998996808735215,
          "rfd_rmse_raw": 1.4638193529117325,
          "fidelity_final": 0.10370655309511825,
          "shape_fidelity": 0.10370655309511825,
          "amplitude_fidelity": 0.5000250810396736,
          "path_length": 2.3009282450079547,
          "recovery_ratio": 0.6361864417491523,
          "drift_slope_b": 0.01909090304189716,
          "drift_a": 0.9239401862780104
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0150833740167917,
          "rfd_rmse_raw": 1.4860477667185807,
          "fidelity_final": 0.009002661901129732,
          "shape_fidelity": 0.009002661901129732,
          "amplitude_fidelity": 0.4962573821482322,
          "path_length": 2.1704249521727967,
          "recovery_ratio": 0.6846805577087146,
          "drift_slope_b": 0.05756082073569578,
          "drift_a": 0.8371143307671134
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0040562265535953,
          "rfd_rmse_raw": 1.4699043953656294,
          "fidelity_final": 0.07940038119452883,
          "shape_fidelity": 0.07940038119452883,
          "amplitude_fidelity": 0.49898799582071335,
          "path_length": 2.23449026262693,
          "recovery_ratio": 0.6578253751876135,
          "drift_slope_b": 0.03144070900215698,
          "drift_a": 0.8949544713765001
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0032328822641519,
          "rfd_rmse_raw": 1.4686990471411518,
          "fidelity_final": 0.09182036597408953,
          "shape_fidelity": 0.09182036597408953,
          "amplitude_fidelity": 0.49919308376655186,
          "path_length": 2.288139448460922,
          "recovery_ratio": 0.6418747983778031,
          "drift_slope_b": 0.04109420589158838,
          "drift_a": 0.8719609281224273
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9941419506310851,
          "rfd_rmse_raw": 1.4553902303517967,
          "fidelity_final": 0.13810140643277208,
          "shape_fidelity": 0.13810140643277208,
          "amplitude_fidelity": 0.5014688145362624,
          "path_length": 2.4065448626695343,
          "recovery_ratio": 0.6047633904224665,
          "drift_slope_b": 0.022371041784711606,
          "drift_a": 0.9181646719000416
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9964596195011581,
          "rfd_rmse_raw": 1.458783219279136,
          "fidelity_final": 0.1265199850679772,
          "shape_fidelity": 0.1265199850679772,
          "amplitude_fidelity": 0.5008866646898991,
          "path_length": 2.3564460103758207,
          "recovery_ratio": 0.6190607435332159,
          "drift_slope_b": 0.029038800450026478,
          "drift_a": 0.9015509719228724
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9865082089512606,
          "rfd_rmse_raw": 1.4442146904253372,
          "fidelity_final": 0.17490562965929526,
          "shape_fidelity": 0.17490562965929526,
          "amplitude_fidelity": 0.5033958558509714,
          "path_length": 2.718788920583473,
          "recovery_ratio": 0.5311977989506437,
          "drift_slope_b": -0.010355436783690821,
          "drift_a": 1.003400849004984
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9997399168140261,
          "rfd_rmse_raw": 1.4635854637259844,
          "fidelity_final": 0.109862205113706,
          "shape_fidelity": 0.109862205113706,
          "amplitude_fidelity": 0.5000650292530011,
          "path_length": 2.310622223623902,
          "recovery_ratio": 0.6334161633010463,
          "drift_slope_b": 0.036106686151299285,
          "drift_a": 0.8841609550990495
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9899142457119081,
          "rfd_rmse_raw": 1.4492010131758446,
          "fidelity_final": 0.15876794464583258,
          "shape_fidelity": 0.15876794464583258,
          "amplitude_fidelity": 0.5025342183236855,
          "path_length": 2.5470179493282874,
          "recovery_ratio": 0.5689795054479436,
          "drift_slope_b": 0.006181142666672962,
          "drift_a": 0.9595204488056803
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0004462921652948,
          "rfd_rmse_raw": 1.4646195733765683,
          "fidelity_final": 0.022851306834433746,
          "shape_fidelity": 0.022851306834433746,
          "amplitude_fidelity": 0.49988845185020897,
          "path_length": 2.6216320212025463,
          "recovery_ratio": 0.5586671056545706,
          "drift_slope_b": 0.15878788914057237,
          "drift_a": 0.6545871763180273
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0003970804874813,
          "rfd_rmse_raw": 1.464547529142781,
          "fidelity_final": 0.024144030340681733,
          "shape_fidelity": 0.024144030340681733,
          "amplitude_fidelity": 0.49990074958333164,
          "path_length": 2.6978786295551695,
          "recovery_ratio": 0.5428515253053685,
          "drift_slope_b": 0.18490587786159232,
          "drift_a": 0.6101827057215808
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0004180811362446,
          "rfd_rmse_raw": 1.4645782733830996,
          "fidelity_final": 0.023351604960311054,
          "shape_fidelity": 0.023351604960311054,
          "amplitude_fidelity": 0.499895501560352,
          "path_length": 2.671780712908297,
          "recovery_ratio": 0.5481655984367337,
          "drift_slope_b": 0.17724577478886194,
          "drift_a": 0.6228836552794885
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0002123403150147,
          "rfd_rmse_raw": 1.464277075771418,
          "fidelity_final": 0.031576011799205744,
          "shape_fidelity": 0.031576011799205744,
          "amplitude_fidelity": 0.4999469205566992,
          "path_length": 2.8302803520400475,
          "recovery_ratio": 0.5173611422331278,
          "drift_slope_b": 0.21450123358622294,
          "drift_a": 0.5634739040411215
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.000435809433396,
          "rfd_rmse_raw": 1.4646042270112096,
          "fidelity_final": 0.022865655182304722,
          "shape_fidelity": 0.022865655182304722,
          "amplitude_fidelity": 0.4998910713777115,
          "path_length": 2.6433509506342134,
          "recovery_ratio": 0.5540710463208869,
          "drift_slope_b": 0.1676179982566252,
          "drift_a": 0.6392227942349175
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0003247246005966,
          "rfd_rmse_raw": 1.4644416025688007,
          "fidelity_final": 0.027129335592233052,
          "shape_fidelity": 0.027129335592233052,
          "amplitude_fidelity": 0.4999188320284695,
          "path_length": 2.761764250429762,
          "recovery_ratio": 0.53025583278548,
          "drift_slope_b": 0.20068329851087824,
          "drift_a": 0.5848271974809793
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 2.9046702102325903,
          "rfd_rmse_raw": 4.252339058504496,
          "fidelity_final": 0.011046823365065716,
          "shape_fidelity": 0.011046823365065716,
          "amplitude_fidelity": 0.2561035749906348,
          "path_length": 7.127380590326592,
          "recovery_ratio": 0.5966201754787511,
          "drift_slope_b": 0.49254740458368634,
          "drift_a": 0.6422005227523526
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 3.1481045308176685,
          "rfd_rmse_raw": 4.608718679832158,
          "fidelity_final": 0.01706417654904949,
          "shape_fidelity": 0.01706417654904949,
          "amplitude_fidelity": 0.2410739634381589,
          "path_length": 6.624860238743989,
          "recovery_ratio": 0.6956703256740595,
          "drift_slope_b": 0.5307528891371417,
          "drift_a": 0.6221802501388659
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 3.083378546335054,
          "rfd_rmse_raw": 4.513962025205422,
          "fidelity_final": 0.015305286609830196,
          "shape_fidelity": 0.015305286609830196,
          "amplitude_fidelity": 0.24489524756344916,
          "path_length": 6.758716963472287,
          "recovery_ratio": 0.6678726228071514,
          "drift_slope_b": 0.52085892554968,
          "drift_a": 0.6273714449053214
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 3.3701701909421824,
          "rfd_rmse_raw": 4.933815304148913,
          "fidelity_final": 0.02414479135532722,
          "shape_fidelity": 0.02414479135532722,
          "amplitude_fidelity": 0.22882404032516773,
          "path_length": 6.18358450546313,
          "recovery_ratio": 0.7978892016095099,
          "drift_slope_b": 0.5633581869515734,
          "drift_a": 0.6051223548036826
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 2.9948395660504525,
          "rfd_rmse_raw": 4.384343949205593,
          "fidelity_final": 0.013091847565076175,
          "shape_fidelity": 0.013091847565076175,
          "amplitude_fidelity": 0.2503229437543251,
          "path_length": 6.94183876742932,
          "recovery_ratio": 0.6315825094896563,
          "drift_slope_b": 0.5070214401168178,
          "drift_a": 0.6346280815303864
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 3.270227101062273,
          "rfd_rmse_raw": 4.787501996969737,
          "fidelity_final": 0.02074488391173025,
          "shape_fidelity": 0.02074488391173025,
          "amplitude_fidelity": 0.23417958256862667,
          "path_length": 6.376245915418863,
          "recovery_ratio": 0.7508339641344024,
          "drift_slope_b": 0.5489359636634351,
          "drift_a": 0.6126523716559271
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0074013482885933,
          "rfd_rmse_raw": 1.4748015405764952,
          "fidelity_final": 0.004175537112664978,
          "shape_fidelity": 0.004175537112664978,
          "amplitude_fidelity": 0.4981564851754973,
          "path_length": 2.265861007289836,
          "recovery_ratio": 0.6508790856242697,
          "drift_slope_b": 0.29793394406500284,
          "drift_a": 0.45137284536065075
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0035754632780383,
          "rfd_rmse_raw": 1.4692005741719727,
          "fidelity_final": 0.007938958961092191,
          "shape_fidelity": 0.007938958961092191,
          "amplitude_fidelity": 0.4991077293210138,
          "path_length": 2.3106643269548663,
          "recovery_ratio": 0.635834706509783,
          "drift_slope_b": 0.3153306681760917,
          "drift_a": 0.4293332846368999
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.004444893313201,
          "rfd_rmse_raw": 1.470473390371256,
          "fidelity_final": 0.0064880817370144075,
          "shape_fidelity": 0.0064880817370144075,
          "amplitude_fidelity": 0.4988912408298105,
          "path_length": 2.288766169364095,
          "recovery_ratio": 0.6424742772127782,
          "drift_slope_b": 0.3120568547729665,
          "drift_a": 0.4334296482122706
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0012321728510072,
          "rfd_rmse_raw": 1.4657700761508268,
          "fidelity_final": 0.018762317371261255,
          "shape_fidelity": 0.018762317371261255,
          "amplitude_fidelity": 0.4996921464516404,
          "path_length": 2.4519879430362472,
          "recovery_ratio": 0.5977884517392011,
          "drift_slope_b": 0.3177798106696585,
          "drift_a": 0.4258992568304437
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.005799557011494,
          "rfd_rmse_raw": 1.472456572260579,
          "fidelity_final": 0.005112894209514349,
          "shape_fidelity": 0.005112894209514349,
          "amplitude_fidelity": 0.49855430294836267,
          "path_length": 2.270946189086885,
          "recovery_ratio": 0.6483890192275461,
          "drift_slope_b": 0.30592065349026065,
          "drift_a": 0.44115091467756806
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.002177394296994,
          "rfd_rmse_raw": 1.4671538484150743,
          "fidelity_final": 0.012388240116167182,
          "shape_fidelity": 0.012388240116167182,
          "amplitude_fidelity": 0.4994562434119984,
          "path_length": 2.3748890162375296,
          "recovery_ratio": 0.617777857568875,
          "drift_slope_b": 0.31840848882221073,
          "drift_a": 0.42538441405650596
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.1014863113874842,
          "rfd_rmse_raw": 0.09662509193394855,
          "fidelity_final": 0.21861933976066025,
          "shape_fidelity": 0.21861933976066025,
          "amplitude_fidelity": 0.4758536825013914,
          "path_length": 0.1731860543002985,
          "recovery_ratio": 0.557926516221705,
          "drift_slope_b": 0.11663887943035611,
          "drift_a": 0.7515779410467729
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0883897276423573,
          "rfd_rmse_raw": 0.09547622735405241,
          "fidelity_final": 0.24740443040577145,
          "shape_fidelity": 0.24740443040577145,
          "amplitude_fidelity": 0.4788378274245433,
          "path_length": 0.17009030069071493,
          "recovery_ratio": 0.5613267009719877,
          "drift_slope_b": 0.08393839925579723,
          "drift_a": 0.815574518848362
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0919140474711693,
          "rfd_rmse_raw": 0.09578538936899804,
          "fidelity_final": 0.23974724880071313,
          "shape_fidelity": 0.23974724880071313,
          "amplitude_fidelity": 0.4780311128025837,
          "path_length": 0.16997825758384635,
          "recovery_ratio": 0.5635155385785109,
          "drift_slope_b": 0.09372056751299164,
          "drift_a": 0.7958593063633665
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.075967248003686,
          "rfd_rmse_raw": 0.09438649684653276,
          "fidelity_final": 0.2738593183904398,
          "shape_fidelity": 0.2738593183904398,
          "amplitude_fidelity": 0.4817031679866967,
          "path_length": 0.17656141441039067,
          "recovery_ratio": 0.5345816760798338,
          "drift_slope_b": 0.045239636575851935,
          "drift_a": 0.8983122333181403
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.096677967823438,
          "rfd_rmse_raw": 0.09620329219470283,
          "fidelity_final": 0.2292923667291042,
          "shape_fidelity": 0.2292923667291042,
          "amplitude_fidelity": 0.4769449650096244,
          "path_length": 0.1709993685944492,
          "recovery_ratio": 0.5625944293564232,
          "drift_slope_b": 0.10580799313941554,
          "drift_a": 0.7721742775146834
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.081619927393844,
          "rfd_rmse_raw": 0.09488236380384352,
          "fidelity_final": 0.2619260472531124,
          "shape_fidelity": 0.2619260472531124,
          "amplitude_fidelity": 0.48039509366725963,
          "path_length": 0.17246166116532777,
          "recovery_ratio": 0.5501649651448386,
          "drift_slope_b": 0.06346355140423642,
          "drift_a": 0.8584147114158373
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0815390773270404,
          "rfd_rmse_raw": 0.09487527143686898,
          "fidelity_final": 0.26358565358737795,
          "shape_fidelity": 0.26358565358737795,
          "amplitude_fidelity": 0.48041375292561245,
          "path_length": 0.1758505584221513,
          "recovery_ratio": 0.5395221504449761,
          "drift_slope_b": 0.10621300314727224,
          "drift_a": 0.7652914743177361
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.069128599884751,
          "rfd_rmse_raw": 0.09378659379157454,
          "fidelity_final": 0.2887445532709127,
          "shape_fidelity": 0.2887445532709127,
          "amplitude_fidelity": 0.4832952384185784,
          "path_length": 0.18136531617833482,
          "recovery_ratio": 0.5171142739296143,
          "drift_slope_b": 0.07075230679146942,
          "drift_a": 0.8408079824572804
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0723515670964752,
          "rfd_rmse_raw": 0.09406932041278936,
          "fidelity_final": 0.2822601636904876,
          "shape_fidelity": 0.2822601636904876,
          "amplitude_fidelity": 0.4825436069233549,
          "path_length": 0.1784247611841187,
          "recovery_ratio": 0.5272212208019607,
          "drift_slope_b": 0.08228919242664888,
          "drift_a": 0.8155587453116306
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0584649073465422,
          "rfd_rmse_raw": 0.09285114841998215,
          "fidelity_final": 0.30992501156644164,
          "shape_fidelity": 0.30992501156644164,
          "amplitude_fidelity": 0.4857989059862317,
          "path_length": 0.20149570789151697,
          "recovery_ratio": 0.4608095596258168,
          "drift_slope_b": 0.020932186260480913,
          "drift_a": 0.9584376527849905
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0768530287074134,
          "rfd_rmse_raw": 0.09446419971133112,
          "fidelity_final": 0.27314472433734727,
          "shape_fidelity": 0.27314472433734727,
          "amplitude_fidelity": 0.4814977209159464,
          "path_length": 0.17617962474002288,
          "recovery_ratio": 0.5361811835547156,
          "drift_slope_b": 0.09556852819054042,
          "drift_a": 0.7873375731184399
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.063208109503115,
          "rfd_rmse_raw": 0.0932672337945365,
          "fidelity_final": 0.3005597273826711,
          "shape_fidelity": 0.3005597273826711,
          "amplitude_fidelity": 0.4846820809757438,
          "path_length": 0.1902788381244379,
          "recovery_ratio": 0.49016083298523144,
          "drift_slope_b": 0.0450243398644711,
          "drift_a": 0.8997473692635864
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9319873350607155,
          "rfd_rmse_raw": 0.0817562242948638,
          "fidelity_final": 0.5372766299992001,
          "shape_fidelity": 0.5372766299992001,
          "amplitude_fidelity": 0.5176017367466715,
          "path_length": 0.3263200022750367,
          "recovery_ratio": 0.2505400334790268,
          "drift_slope_b": 0.2620758108267167,
          "drift_a": 0.43513043694697867
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9137998186670694,
          "rfd_rmse_raw": 0.08016077056528219,
          "fidelity_final": 0.5551847964443158,
          "shape_fidelity": 0.5551847964443158,
          "amplitude_fidelity": 0.522520689074202,
          "path_length": 0.334489445455625,
          "recovery_ratio": 0.2396511209975285,
          "drift_slope_b": 0.2882143503551819,
          "drift_a": 0.396758527060905
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9192289687440744,
          "rfd_rmse_raw": 0.08063702898074358,
          "fidelity_final": 0.5499793861817786,
          "shape_fidelity": 0.5499793861817786,
          "amplitude_fidelity": 0.5210425729736617,
          "path_length": 0.3312673873776023,
          "recovery_ratio": 0.24341976316801667,
          "drift_slope_b": 0.28078912781536114,
          "drift_a": 0.4073074285991035
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.8921562022987469,
          "rfd_rmse_raw": 0.078262139234369,
          "fidelity_final": 0.5746693239451922,
          "shape_fidelity": 0.5746693239451922,
          "amplitude_fidelity": 0.528497593795437,
          "path_length": 0.3524722285329441,
          "recovery_ratio": 0.2220377462363795,
          "drift_slope_b": 0.3154363631804027,
          "drift_a": 0.3604482619272133
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.925941754002785,
          "rfd_rmse_raw": 0.0812258910356326,
          "fidelity_final": 0.543374874703022,
          "shape_fidelity": 0.543374874703022,
          "amplitude_fidelity": 0.5192265020069522,
          "path_length": 0.3281530294564651,
          "recovery_ratio": 0.24752442837468475,
          "drift_slope_b": 0.271185644653032,
          "drift_a": 0.42136361923467847
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9023869678755527,
          "rfd_rmse_raw": 0.07915960718671089,
          "fidelity_final": 0.5657140690066071,
          "shape_fidelity": 0.5657140690066071,
          "amplitude_fidelity": 0.5256554091708939,
          "path_length": 0.3430119187900961,
          "recovery_ratio": 0.23077800755708458,
          "drift_slope_b": 0.3029918087507482,
          "drift_a": 0.3765892069720625
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.7341933345087195,
          "rfd_rmse_raw": 0.06440524744682119,
          "fidelity_final": 0.7198150651802443,
          "shape_fidelity": 0.7198150651802443,
          "amplitude_fidelity": 0.5766369758786384,
          "path_length": 0.13006560921331187,
          "recovery_ratio": 0.4951750723067346,
          "drift_slope_b": 0.5595094501056131,
          "drift_a": 0.13843555786243217
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.7248967218793682,
          "rfd_rmse_raw": 0.06358972569162674,
          "fidelity_final": 0.7297247296983189,
          "shape_fidelity": 0.7297247296983189,
          "amplitude_fidelity": 0.5797448550487394,
          "path_length": 0.11362028995529616,
          "recovery_ratio": 0.5596687503318825,
          "drift_slope_b": 0.567118321335926,
          "drift_a": 0.13207900371904313
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.7276376220696857,
          "rfd_rmse_raw": 0.06383016420650725,
          "fidelity_final": 0.7268261815101934,
          "shape_fidelity": 0.7268261815101934,
          "amplitude_fidelity": 0.5788250887949604,
          "path_length": 0.11804010781755456,
          "recovery_ratio": 0.5407497958673892,
          "drift_slope_b": 0.5657880210439993,
          "drift_a": 0.13348784724163007
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.7139176989004064,
          "rfd_rmse_raw": 0.06262661875718757,
          "fidelity_final": 0.7413360655238029,
          "shape_fidelity": 0.7413360655238029,
          "amplitude_fidelity": 0.5834585876798911,
          "path_length": 0.09794711597676574,
          "recovery_ratio": 0.6393921672185159,
          "drift_slope_b": 0.5678353822233717,
          "drift_a": 0.12876032791000366
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.731046246842332,
          "rfd_rmse_raw": 0.06412917716619661,
          "fidelity_final": 0.7231937006590301,
          "shape_fidelity": 0.7231937006590301,
          "amplitude_fidelity": 0.5776853170873617,
          "path_length": 0.12401216422042366,
          "recovery_ratio": 0.5171200548698683,
          "drift_slope_b": 0.5631429559202569,
          "drift_a": 0.13574259418459494
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.7191084235470138,
          "rfd_rmse_raw": 0.0630819619067093,
          "fidelity_final": 0.7358144703433966,
          "shape_fidelity": 0.7358144703433966,
          "amplitude_fidelity": 0.58169687630098,
          "path_length": 0.10509667362100367,
          "recovery_ratio": 0.6002279590141311,
          "drift_slope_b": 0.5682139164191452,
          "drift_a": 0.12996776670240173
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.7261508535501768,
          "rfd_rmse_raw": 0.06369974121041837,
          "fidelity_final": 0.7979251825862617,
          "shape_fidelity": 0.7979251825862617,
          "amplitude_fidelity": 0.5793236425097485,
          "path_length": 0.13433936127071,
          "recovery_ratio": 0.4741703444759999,
          "drift_slope_b": 0.5696994465030715,
          "drift_a": 0.13619795044505545
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.692165202505287,
          "rfd_rmse_raw": 0.06071843620217813,
          "fidelity_final": 0.8011039505005131,
          "shape_fidelity": 0.8011039505005131,
          "amplitude_fidelity": 0.5909588487693037,
          "path_length": 0.15781115452362485,
          "recovery_ratio": 0.3847537671558469,
          "drift_slope_b": 0.5130187293607883,
          "drift_a": 0.15489829454409776
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.7002776193113635,
          "rfd_rmse_raw": 0.06143007738336199,
          "fidelity_final": 0.8010550400396319,
          "shape_fidelity": 0.8010550400396319,
          "amplitude_fidelity": 0.5881392477570894,
          "path_length": 0.1504708875615111,
          "recovery_ratio": 0.4082522432005323,
          "drift_slope_b": 0.5290052024746031,
          "drift_a": 0.14907128399014227
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.6710165034458672,
          "rfd_rmse_raw": 0.05886322023646561,
          "fidelity_final": 0.7971010244707469,
          "shape_fidelity": 0.7971010244707469,
          "amplitude_fidelity": 0.5984381350739875,
          "path_length": 0.19051993794676664,
          "recovery_ratio": 0.30896094587702755,
          "drift_slope_b": 0.4557100297479201,
          "drift_a": 0.17960065427519206
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.7125178334128178,
          "rfd_rmse_raw": 0.06250381910908026,
          "fidelity_final": 0.8000561710403901,
          "shape_fidelity": 0.8000561710403901,
          "amplitude_fidelity": 0.5839355249265546,
          "path_length": 0.14179166890966324,
          "recovery_ratio": 0.44081446808346697,
          "drift_slope_b": 0.5498526934952134,
          "drift_a": 0.14212681151805848
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.6791289578843088,
          "rfd_rmse_raw": 0.059574864718853225,
          "fidelity_final": 0.7996663293701954,
          "shape_fidelity": 0.7996663293701954,
          "amplitude_fidelity": 0.5955468728619827,
          "path_length": 0.17428640203273915,
          "recovery_ratio": 0.34182164542970067,
          "drift_slope_b": 0.48166743779743215,
          "drift_a": 0.16764030253175957
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9800583273280067,
          "rfd_rmse_raw": 8.803707997314723,
          "fidelity_final": 0.1920143363309308,
          "shape_fidelity": 0.1920143363309308,
          "amplitude_fidelity": 0.5050356275865125,
          "path_length": 11.522819114770687,
          "recovery_ratio": 0.7640237957072125,
          "drift_slope_b": 0.05018665599705251,
          "drift_a": 0.8482775644056398
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9777392297152594,
          "rfd_rmse_raw": 8.782875912498342,
          "fidelity_final": 0.20240221652149493,
          "shape_fidelity": 0.20240221652149493,
          "amplitude_fidelity": 0.5056278325145893,
          "path_length": 11.810882618126845,
          "recovery_ratio": 0.7436257049086877,
          "drift_slope_b": 0.034773238074100814,
          "drift_a": 0.88505380219559
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.978338616011068,
          "rfd_rmse_raw": 8.78826010421301,
          "fidelity_final": 0.19973022325578918,
          "shape_fidelity": 0.19973022325578918,
          "amplitude_fidelity": 0.5054746401383521,
          "path_length": 11.665820622734081,
          "recovery_ratio": 0.7533340678225973,
          "drift_slope_b": 0.03979780980238884,
          "drift_a": 0.8729799264780977
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9757528507825236,
          "rfd_rmse_raw": 8.76503258663885,
          "fidelity_final": 0.21118495333530563,
          "shape_fidelity": 0.21118495333530563,
          "amplitude_fidelity": 0.506136179737226,
          "path_length": 12.754987708857113,
          "recovery_ratio": 0.6871847144589858,
          "drift_slope_b": 0.012452402424809546,
          "drift_a": 0.9402151847487443
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9791771165149831,
          "rfd_rmse_raw": 8.79579222080876,
          "fidelity_final": 0.1959769644914493,
          "shape_fidelity": 0.1959769644914493,
          "amplitude_fidelity": 0.5052604901580721,
          "path_length": 11.552353525373515,
          "recovery_ratio": 0.7613853057292385,
          "drift_slope_b": 0.04555092872269521,
          "drift_a": 0.8592745782388753
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9766337907599273,
          "rfd_rmse_raw": 8.772945930271536,
          "fidelity_final": 0.20730436753573941,
          "shape_fidelity": 0.20730436753573941,
          "amplitude_fidelity": 0.5059106065446471,
          "path_length": 12.240310420706379,
          "recovery_ratio": 0.7167257715483049,
          "drift_slope_b": 0.023391690083301362,
          "drift_a": 0.912852396473827
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9762959612590066,
          "rfd_rmse_raw": 8.76991126162371,
          "fidelity_final": 0.20898151051510375,
          "shape_fidelity": 0.20898151051510375,
          "amplitude_fidelity": 0.5059970872798558,
          "path_length": 12.617016717696723,
          "recovery_ratio": 0.6950859666630199,
          "drift_slope_b": 0.03287357784816584,
          "drift_a": 0.8890818376697963
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.9745218459740943,
          "rfd_rmse_raw": 8.753974666335015,
          "fidelity_final": 0.2166383063955444,
          "shape_fidelity": 0.2166383063955444,
          "amplitude_fidelity": 0.5064517275607393,
          "path_length": 13.578847655948778,
          "recovery_ratio": 0.6446772869198495,
          "drift_slope_b": 0.016556277881767615,
          "drift_a": 0.9328054466564573
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.9749809022677423,
          "rfd_rmse_raw": 8.758098295971044,
          "fidelity_final": 0.21466309204277126,
          "shape_fidelity": 0.21466309204277126,
          "amplitude_fidelity": 0.5063340100411933,
          "path_length": 13.206606687976139,
          "recovery_ratio": 0.6631603789597816,
          "drift_slope_b": 0.02261653145590502,
          "drift_a": 0.9167817458233101
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9727216197369618,
          "rfd_rmse_raw": 8.737803520517573,
          "fidelity_final": 0.22431548732232692,
          "shape_fidelity": 0.22431548732232692,
          "amplitude_fidelity": 0.506913894994134,
          "path_length": 15.774133802831617,
          "recovery_ratio": 0.5539323825786903,
          "drift_slope_b": -0.014144635598517911,
          "drift_a": 1.0161439459346138
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9756214410625369,
          "rfd_rmse_raw": 8.76385215403549,
          "fidelity_final": 0.21189956863246084,
          "shape_fidelity": 0.21189956863246084,
          "amplitude_fidelity": 0.5061698457079793,
          "path_length": 12.840511833020209,
          "recovery_ratio": 0.6825157959434822,
          "drift_slope_b": 0.028824040474936974,
          "drift_a": 0.9002663387024447
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.9736269861721718,
          "rfd_rmse_raw": 8.745936283133743,
          "fidelity_final": 0.2204710071163298,
          "shape_fidelity": 0.2204710071163298,
          "amplitude_fidelity": 0.5066813572201346,
          "path_length": 14.579013405519495,
          "recovery_ratio": 0.5998990493981302,
          "drift_slope_b": 0.001491597201826249,
          "drift_a": 0.9731021818650282
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.4911571345770581,
          "rfd_rmse_raw": 4.411986381874871,
          "fidelity_final": 0.8894518890770118,
          "shape_fidelity": 0.8894518890770118,
          "amplitude_fidelity": 0.6706201357401769,
          "path_length": 25.056070619947562,
          "recovery_ratio": 0.17608452852788553,
          "drift_slope_b": 0.36786933702242985,
          "drift_a": 0.16584081199722686
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.4817389932377015,
          "rfd_rmse_raw": 4.32738471693602,
          "fidelity_final": 0.891371301221213,
          "shape_fidelity": 0.891371301221213,
          "amplitude_fidelity": 0.67488269159667,
          "path_length": 23.94408796631996,
          "recovery_ratio": 0.18072873450109989,
          "drift_slope_b": 0.40226715795669615,
          "drift_a": 0.14834958624656971
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.48423136376416864,
          "rfd_rmse_raw": 4.349773284763359,
          "fidelity_final": 0.8909579452857174,
          "shape_fidelity": 0.8909579452857174,
          "amplitude_fidelity": 0.6737494062003202,
          "path_length": 24.204021952557653,
          "recovery_ratio": 0.17971283009449243,
          "drift_slope_b": 0.3917235355097954,
          "drift_a": 0.1533776283401858
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.47426348369920707,
          "rfd_rmse_raw": 4.260233404332541,
          "fidelity_final": 0.8916324157020692,
          "shape_fidelity": 0.8916324157020692,
          "amplitude_fidelity": 0.6783048017243228,
          "path_length": 23.37396279881985,
          "recovery_ratio": 0.18226406198214878,
          "drift_slope_b": 0.44862665175946087,
          "drift_a": 0.1290601716709513
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.4876759614902091,
          "rfd_rmse_raw": 4.380715557996169,
          "fidelity_final": 0.890262052081877,
          "shape_fidelity": 0.890262052081877,
          "amplitude_fidelity": 0.672189391968327,
          "path_length": 24.60541790368717,
          "recovery_ratio": 0.17803865697967725,
          "drift_slope_b": 0.37904243145587907,
          "drift_a": 0.15980184881101392
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4773020746452384,
          "rfd_rmse_raw": 4.287528583268551,
          "fidelity_final": 0.8918013884015732,
          "shape_fidelity": 0.8918013884015732,
          "amplitude_fidelity": 0.6769096294947948,
          "path_length": 23.557697615159807,
          "recovery_ratio": 0.18200117232634178,
          "drift_slope_b": 0.42563750272045914,
          "drift_a": 0.1380991288074474
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 15.725416662263639,
          "rfd_rmse_raw": 141.25891548528492,
          "fidelity_final": 0.0058483679009602675,
          "shape_fidelity": 0.0058483679009602675,
          "amplitude_fidelity": 0.05978924293445127,
          "path_length": 234.8665466412938,
          "recovery_ratio": 0.6014433196440971,
          "drift_slope_b": 0.4751381428694204,
          "drift_a": 3.620418621545855
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 17.241203025739587,
          "rfd_rmse_raw": 154.8749831807004,
          "fidelity_final": 0.0008674431603100986,
          "shape_fidelity": 0.0008674431603100986,
          "amplitude_fidelity": 0.05482094566838226,
          "path_length": 219.62585412180792,
          "recovery_ratio": 0.7051764638547715,
          "drift_slope_b": 0.5176606843222267,
          "drift_a": 3.5184101241658277
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 16.83920976773818,
          "rfd_rmse_raw": 151.26394171342133,
          "fidelity_final": 0.002191788079120288,
          "shape_fidelity": 0.002191788079120288,
          "amplitude_fidelity": 0.05605629470249731,
          "path_length": 223.7144244378821,
          "recovery_ratio": 0.6761474683337739,
          "drift_slope_b": 0.5067011789224466,
          "drift_a": 3.545392284625272
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 18.615920243293047,
          "rfd_rmse_raw": 167.22384918668365,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.050979000097735094,
          "path_length": 206.61347929477472,
          "recovery_ratio": 0.8093559517871822,
          "drift_slope_b": 0.5535851111170371,
          "drift_a": 3.427390154206395
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 16.288171450532897,
          "rfd_rmse_raw": 146.31405219691362,
          "fidelity_final": 0.0039962884648232,
          "shape_fidelity": 0.0039962884648232,
          "amplitude_fidelity": 0.05784301728273152,
          "path_length": 229.29757832675924,
          "recovery_ratio": 0.6380968053156217,
          "drift_slope_b": 0.49131504611570587,
          "drift_a": 3.5825101067461835
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 17.998009329195487,
          "rfd_rmse_raw": 161.67325377375565,
          "fidelity_final": 0,
          "shape_fidelity": 0,
          "amplitude_fidelity": 0.05263709384873469,
          "path_length": 212.17336581665836,
          "recovery_ratio": 0.7619865629763328,
          "drift_slope_b": 0.5377263110307903,
          "drift_a": 3.4680108067384148
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.17450132404282045,
          "rfd_rmse_raw": 1.5675176254113192,
          "fidelity_final": 0.9854402709359562,
          "shape_fidelity": 0.9854402709359562,
          "amplitude_fidelity": 0.851425178949855,
          "path_length": 4.430277640566455,
          "recovery_ratio": 0.3538192755817661,
          "drift_slope_b": 0.34191750484667804,
          "drift_a": 0.06617641200356418
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.1705051156138444,
          "rfd_rmse_raw": 1.5316203210120694,
          "fidelity_final": 0.9858656659596748,
          "shape_fidelity": 0.9858656659596748,
          "amplitude_fidelity": 0.8543320201343786,
          "path_length": 5.035920636658741,
          "recovery_ratio": 0.30413909025148517,
          "drift_slope_b": 0.35134695505224167,
          "drift_a": 0.06401440350066441
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.17137225672639617,
          "rfd_rmse_raw": 1.5394097116376106,
          "fidelity_final": 0.9857766775324254,
          "shape_fidelity": 0.9857766775324254,
          "amplitude_fidelity": 0.8536995769343848,
          "path_length": 4.840738892123641,
          "recovery_ratio": 0.31801130900540453,
          "drift_slope_b": 0.3498758632242425,
          "drift_a": 0.06435902368391483
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.1684687761246751,
          "rfd_rmse_raw": 1.513328207424377,
          "fidelity_final": 0.9860504748466904,
          "shape_fidelity": 0.9860504748466904,
          "amplitude_fidelity": 0.8558209003381195,
          "path_length": 5.939327367870684,
          "recovery_ratio": 0.254797911226591,
          "drift_slope_b": 0.349239215748023,
          "drift_a": 0.06430610274988365
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.17277838503612855,
          "rfd_rmse_raw": 1.5520407384861774,
          "fidelity_final": 0.985627648442472,
          "shape_fidelity": 0.985627648442472,
          "amplitude_fidelity": 0.8526760151443225,
          "path_length": 4.6158630243186165,
          "recovery_ratio": 0.3362406402246493,
          "drift_slope_b": 0.34656267975492666,
          "drift_a": 0.0651119737370254
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.16921007551240214,
          "rfd_rmse_raw": 1.5199871818610617,
          "fidelity_final": 0.9859902157174155,
          "shape_fidelity": 0.9859902157174155,
          "amplitude_fidelity": 0.8552782951017195,
          "path_length": 5.48534802723513,
          "recovery_ratio": 0.27709949748205964,
          "drift_slope_b": 0.35160004473843404,
          "drift_a": 0.0638855329734139
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.0343344980388767,
          "rfd_rmse_raw": 37.21147500225538,
          "fidelity_final": 0.039887990048870815,
          "shape_fidelity": 0.039887990048870815,
          "amplitude_fidelity": 0.4915612456869862,
          "path_length": 39.63072028970009,
          "recovery_ratio": 0.9389553036190093,
          "drift_slope_b": 0.15606477577406302,
          "drift_a": 0.6736783081100146
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0342512079364656,
          "rfd_rmse_raw": 37.208478536827926,
          "fidelity_final": 0.04155074891424828,
          "shape_fidelity": 0.04155074891424828,
          "amplitude_fidelity": 0.4915813721032001,
          "path_length": 39.56172730834715,
          "recovery_ratio": 0.940517036751762,
          "drift_slope_b": 0.09243379830303508,
          "drift_a": 0.8043861287576599
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.0342754396456593,
          "rfd_rmse_raw": 37.209350302821065,
          "fidelity_final": 0.04106984818062567,
          "shape_fidelity": 0.04106984818062567,
          "amplitude_fidelity": 0.49157551652601433,
          "path_length": 39.590304620281415,
          "recovery_ratio": 0.9398601667681883,
          "drift_slope_b": 0.10813638832497587,
          "drift_a": 0.7702119954865791
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0341699367212658,
          "rfd_rmse_raw": 37.2055547033886,
          "fidelity_final": 0.04315356741463571,
          "shape_fidelity": 0.04315356741463571,
          "amplitude_fidelity": 0.4916010122594915,
          "path_length": 39.56484955055831,
          "recovery_ratio": 0.9403689165011265,
          "drift_slope_b": 0.046698722865723484,
          "drift_a": 0.9116530316509295
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0343074479958823,
          "rfd_rmse_raw": 37.210501843184886,
          "fidelity_final": 0.040431907594848854,
          "shape_fidelity": 0.040431907594848854,
          "amplitude_fidelity": 0.491567781942282,
          "path_length": 39.62036329567799,
          "recovery_ratio": 0.9391761899175723,
          "drift_slope_b": 0.13105155693343237,
          "drift_a": 0.7226384881786322
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.034205868902719,
          "rfd_rmse_raw": 37.20684740848009,
          "fidelity_final": 0.042446807265706814,
          "shape_fidelity": 0.042446807265706814,
          "amplitude_fidelity": 0.4915923286267063,
          "path_length": 39.52193365075935,
          "recovery_ratio": 0.9414227486251857,
          "drift_slope_b": 0.06554094485112746,
          "drift_a": 0.8660282237451584
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.034086888605776,
          "rfd_rmse_raw": 37.20256694374277,
          "fidelity_final": 0.044757686914654406,
          "shape_fidelity": 0.044757686914654406,
          "amplitude_fidelity": 0.49162108344615996,
          "path_length": 39.19969334941199,
          "recovery_ratio": 0.9490524992665745,
          "drift_slope_b": 0.19880252455108366,
          "drift_a": 0.5957972230451108
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.0341238808197513,
          "rfd_rmse_raw": 37.20389778482776,
          "fidelity_final": 0.04407087204063724,
          "shape_fidelity": 0.04407087204063724,
          "amplitude_fidelity": 0.49161214291284966,
          "path_length": 39.5355752395822,
          "recovery_ratio": 0.9410233077266569,
          "drift_slope_b": 0.10529285429621757,
          "drift_a": 0.7762704862220247
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.034138051048854,
          "rfd_rmse_raw": 37.20440757651221,
          "fidelity_final": 0.04379630325027771,
          "shape_fidelity": 0.04379630325027771,
          "amplitude_fidelity": 0.49160871824032504,
          "path_length": 39.42459324125894,
          "recovery_ratio": 0.9436852613504394,
          "drift_slope_b": 0.12935106074521546,
          "drift_a": 0.7258332496779887
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.0340704593848202,
          "rfd_rmse_raw": 37.20197588200591,
          "fidelity_final": 0.04510086234985835,
          "shape_fidelity": 0.04510086234985835,
          "amplitude_fidelity": 0.49162505427783354,
          "path_length": 41.161699208674094,
          "recovery_ratio": 0.9038007807550923,
          "drift_slope_b": 0.03027637502505241,
          "drift_a": 0.9537249681479115
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0341418642018756,
          "rfd_rmse_raw": 37.204544759453135,
          "fidelity_final": 0.04371641741578468,
          "shape_fidelity": 0.04371641741578468,
          "amplitude_fidelity": 0.4916077966825408,
          "path_length": 39.31476067847032,
          "recovery_ratio": 0.9463250981921203,
          "drift_slope_b": 0.16325244441312475,
          "drift_a": 0.6595993187094535
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.0340939527191597,
          "rfd_rmse_raw": 37.20282108404176,
          "fidelity_final": 0.044648311301669845,
          "shape_fidelity": 0.044648311301669845,
          "amplitude_fidelity": 0.49161937611741496,
          "path_length": 40.06595281539183,
          "recovery_ratio": 0.9285395321922766,
          "drift_slope_b": 0.0622275115158871,
          "drift_a": 0.8742318850915274
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.5688073738456847,
          "rfd_rmse_raw": 20.463555467876965,
          "fidelity_final": 0.9486042229453898,
          "shape_fidelity": 0.9486042229453898,
          "amplitude_fidelity": 0.6374268866091936,
          "path_length": 125.22235464341509,
          "recovery_ratio": 0.1634177501784667,
          "drift_slope_b": 0.7814990727192294,
          "drift_a": 0.051725964215741334
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.5194944818286734,
          "rfd_rmse_raw": 18.68946260714463,
          "fidelity_final": 0.9572710541292043,
          "shape_fidelity": 0.9572710541292043,
          "amplitude_fidelity": 0.6581136107822684,
          "path_length": 118.96768611264089,
          "recovery_ratio": 0.1570969665615677,
          "drift_slope_b": 0.7767424198272413,
          "drift_a": 0.04766034283120321
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.5332926488560572,
          "rfd_rmse_raw": 19.185868893882574,
          "fidelity_final": 0.9551213627769147,
          "shape_fidelity": 0.9551213627769147,
          "amplitude_fidelity": 0.6521912178644236,
          "path_length": 120.55468135621715,
          "recovery_ratio": 0.15914661030202404,
          "drift_slope_b": 0.7788452551001148,
          "drift_a": 0.04867384388276864
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.46960734406357724,
          "rfd_rmse_raw": 16.89471053864099,
          "fidelity_final": 0.9632941482110284,
          "shape_fidelity": 0.9632941482110284,
          "amplitude_fidelity": 0.680453866836922,
          "path_length": 114.30931354408155,
          "recovery_ratio": 0.14779819784435863,
          "drift_slope_b": 0.7627690552077249,
          "drift_a": 0.04488716004068265
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.5513672322041943,
          "rfd_rmse_raw": 19.836124597149375,
          "fidelity_final": 0.9519863530458135,
          "shape_fidelity": 0.9519863530458135,
          "amplitude_fidelity": 0.644592704577879,
          "path_length": 122.8250553106746,
          "recovery_ratio": 0.16149900805642411,
          "drift_slope_b": 0.7806543744877424,
          "drift_a": 0.05014926375189706
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4923540957372179,
          "rfd_rmse_raw": 17.713053330930197,
          "fidelity_final": 0.960893953813583,
          "shape_fidelity": 0.960893953813583,
          "amplitude_fidelity": 0.6700822565210326,
          "path_length": 116.21943505113246,
          "recovery_ratio": 0.15241042363643462,
          "drift_slope_b": 0.7705015098462119,
          "drift_a": 0.045969296095001895
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.791414102358338,
          "rfd_rmse_raw": 28.472110465402633,
          "fidelity_final": 0.7472881307431298,
          "shape_fidelity": 0.7472881307431298,
          "amplitude_fidelity": 0.5582182247440907,
          "path_length": 50.875004526025954,
          "recovery_ratio": 0.5596483131679576,
          "drift_slope_b": 0.4820808753901676,
          "drift_a": 0.1782496189272341
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.8613743651982844,
          "rfd_rmse_raw": 30.98901827110364,
          "fidelity_final": 0.7174387376003651,
          "shape_fidelity": 0.7174387376003651,
          "amplitude_fidelity": 0.5372374406227918,
          "path_length": 46.57837636279061,
          "recovery_ratio": 0.6653091131759454,
          "drift_slope_b": 0.5210581915048882,
          "drift_a": 0.17385353848984658
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.8427329397180283,
          "rfd_rmse_raw": 30.31836971439381,
          "fidelity_final": 0.7253429185767274,
          "shape_fidelity": 0.7253429185767274,
          "amplitude_fidelity": 0.54267223342359,
          "path_length": 47.710279849944236,
          "recovery_ratio": 0.6354682850268221,
          "drift_slope_b": 0.5109438447230115,
          "drift_a": 0.1750295356298392
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.9255378230308703,
          "rfd_rmse_raw": 33.297378778968856,
          "fidelity_final": 0.690627822989688,
          "shape_fidelity": 0.690627822989688,
          "amplitude_fidelity": 0.5193354230902417,
          "path_length": 42.88258334659642,
          "recovery_ratio": 0.7764779120195346,
          "drift_slope_b": 0.5544604238440598,
          "drift_a": 0.16985026220192173
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.8172774216717247,
          "rfd_rmse_raw": 29.40257566977336,
          "fidelity_final": 0.7362001099946066,
          "shape_fidelity": 0.7362001099946066,
          "amplitude_fidelity": 0.5502737160956382,
          "path_length": 49.27135011477044,
          "recovery_ratio": 0.5967479194559179,
          "drift_slope_b": 0.4968187249569146,
          "drift_a": 0.17663392556668245
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.8966180061805702,
          "rfd_rmse_raw": 32.256952259467525,
          "fidelity_final": 0.7026295120186428,
          "shape_fidelity": 0.7026295120186428,
          "amplitude_fidelity": 0.5272543004132977,
          "path_length": 44.48991456143834,
          "recovery_ratio": 0.7250396539854509,
          "drift_slope_b": 0.5396715474963483,
          "drift_a": 0.17164237141932306
        }
      },
      "mode": "grammar"
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.9246012725511767,
          "rfd_rmse_raw": 33.26368520611641,
          "fidelity_final": 0.5087041644030875,
          "shape_fidelity": 0.5087041644030875,
          "amplitude_fidelity": 0.5195881423659451,
          "path_length": 50.93418419871713,
          "recovery_ratio": 0.6530719148527016,
          "drift_slope_b": 1.1530005198253126,
          "drift_a": 0.02786638361983754
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.7553558323409583,
          "rfd_rmse_raw": 27.174869180382796,
          "fidelity_final": 0.680317229001353,
          "shape_fidelity": 0.680317229001353,
          "amplitude_fidelity": 0.5696850641766411,
          "path_length": 52.22725805025853,
          "recovery_ratio": 0.520319660554117,
          "drift_slope_b": 1.0942331498815991,
          "drift_a": 0.02660010927287794
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.8009497596678575,
          "rfd_rmse_raw": 28.81516764301397,
          "fidelity_final": 0.6379897823326127,
          "shape_fidelity": 0.6379897823326127,
          "amplitude_fidelity": 0.5552625744454005,
          "path_length": 51.387815320707695,
          "recovery_ratio": 0.5607393010031768,
          "drift_slope_b": 1.113521898997859,
          "drift_a": 0.02676312308638649
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.5955678290181294,
          "rfd_rmse_raw": 21.426296254911,
          "fidelity_final": 0.8076513155279015,
          "shape_fidelity": 0.8076513155279015,
          "amplitude_fidelity": 0.6267361260444652,
          "path_length": 58.42137591802382,
          "recovery_ratio": 0.36675439286086187,
          "drift_slope_b": 0.9992159040467471,
          "drift_a": 0.027451091957255168
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.8625320388829584,
          "rfd_rmse_raw": 31.030667027342258,
          "fidelity_final": 0.5763239816273409,
          "shape_fidelity": 0.5763239816273409,
          "amplitude_fidelity": 0.5369035158180385,
          "path_length": 50.8465946678741,
          "recovery_ratio": 0.6102801422599113,
          "drift_slope_b": 1.1353017586166034,
          "drift_a": 0.027201118020235823
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.6679124999946359,
          "rfd_rmse_raw": 24.02898612041665,
          "fidelity_final": 0.7539359573238276,
          "shape_fidelity": 0.7539359573238276,
          "amplitude_fidelity": 0.5995518350052632,
          "path_length": 54.96525697241149,
          "recovery_ratio": 0.4371668112545609,
          "drift_slope_b": 1.048203703127956,
          "drift_a": 0.026748074409250356
        }
      },
      "mode": "grammar"
    }
  ],
  "scoreboard": {
    "mechanism_lowest_rfd_arm": {
      "scaling": "e",
      "recursive_weighting": "e",
      "hierarchical_resolution": "e",
      "recursive_feedback": "baseline",
      "recursive_compression": "e"
    },
    "egs_mechanism_lowest_count": 0,
    "baseline_mechanism_lowest_count": 1,
    "n_mechanisms": 5,
    "mean_final_rfd_by_arm": {
      "baseline": 1.5080533545821324,
      "egs": 1.5536640117495017,
      "sqrt2": 1.5416117610391225,
      "e": 1.5948699007814928,
      "random_0": 1.5250369778461714,
      "random_1": 1.5763050284539248
    },
    "lowest_mean_rfd_arm": "baseline",
    "nest_heavy_mean_final_rfd_by_arm": {
      "baseline": 1.882984242555085,
      "egs": 1.9680330267351147,
      "sqrt2": 1.9454208467961607,
      "e": 2.0458919486864873,
      "random_0": 1.9144881836159362,
      "random_1": 2.010748346874489
    },
    "lowest_nest_heavy_mean_rfd_arm": "baseline",
    "lowest_named_mean_rfd_arm": "baseline",
    "named_mean_final_rfd_by_arm": {
      "baseline": 1.5080533545821324,
      "egs": 1.5536640117495017,
      "sqrt2": 1.5416117610391225,
      "e": 1.5948699007814928
    },
    "phi_vs_baseline_pct": -0.030244723788308954,
    "engineering_threshold_pct": 0.15,
    "paired_delta_baseline_minus_phi": {
      "n": 30,
      "mean_delta": -0.04561065716736934,
      "median_delta": 0.00391104671976554,
      "std_delta": 0.28540111657206246,
      "fraction_positive": 0.8,
      "effect_size_cohens_d": -0.15981246925448822,
      "bootstrap_ci95": [
        -0.15810044749543384,
        0.023274710053349534
      ]
    },
    "permutation_p_mean_delta": 0.6508728179551122,
    "paired_delta_by_domain": {
      "synthetic_logistic": {
        "mean": -0.019246552231710547,
        "n": 5
      },
      "synthetic_ar1": {
        "mean": 0.04230824779229625,
        "n": 5
      },
      "synthetic_seasonal": {
        "mean": -0.044194120109015064,
        "n": 5
      },
      "synthetic_powerlaw": {
        "mean": 0.017395368251060694,
        "n": 5
      },
      "env_co2_proxy": {
        "mean": -0.29965576016199125,
        "n": 5
      },
      "astro_sunspot_proxy": {
        "mean": 0.02972887345514381,
        "n": 5
      }
    },
    "paired_delta_by_mechanism": {
      "scaling": {
        "mean": 0.009136211182951362,
        "n": 6
      },
      "recursive_weighting": {
        "mean": 0.008593139246418524,
        "n": 6
      },
      "hierarchical_resolution": {
        "mean": 0.017956855520291443,
        "n": 6
      },
      "recursive_feedback": {
        "mean": -0.3207348609069473,
        "n": 6
      },
      "recursive_compression": {
        "mean": 0.05699536912043925,
        "n": 6
      }
    },
    "phi_beats_random_fraction": 0.5
  },
  "grammar_delta_vs_neutral_mean_rfd": {
    "egs": -0.12719991699571676,
    "sqrt2": -0.12727599550757418,
    "e": -0.11401685440297205,
    "baseline": -0.12059210984405122
  },
  "pass": true,
  "interpretation": "Same algorithm family with symmetric C(c) re-entry on nest-heavy paths. Asks whether exploiting nest algebra adds stability — and whether Φ benefits disproportionately vs decoys under the same operator.",
  "honesty": "Architectural hypothesis lane — not a substitute for ERFT-C causal isolation."
}
```

### E2_blind_constant_ladder — Blind constant ladder · ERFT-C (φ unlabeled · mean NRMSE)

- **Pass:** `true`
- **Interpretation:** Rank distribution under constant-neutral recursion. Report rank — do not declare a universal crown from one seasonal probe.
- **Honesty:** Single-series blind ladder is illustrative; multi-domain paired Δ is the stronger read.

```json
{
  "id": "E2_blind_constant_ladder",
  "title": "Blind constant ladder · ERFT-C (φ unlabeled · mean NRMSE)",
  "mechanism": "all_mechanisms_mean",
  "mode": "constant_neutral",
  "results": [
    {
      "c": 1,
      "rfd_final": 1.174844589933958,
      "slope_b": 0.25154697103575674,
      "is_phi": false
    },
    {
      "c": 1.41421356237,
      "rfd_final": 1.1990735944020685,
      "slope_b": 0.2667496045087374,
      "is_phi": false
    },
    {
      "c": 1.5,
      "rfd_final": 1.203362473655446,
      "slope_b": 0.26920752147559235,
      "is_phi": false
    },
    {
      "c": 1.618033988749895,
      "rfd_final": 1.208908039305084,
      "slope_b": 0.27228139154866393,
      "is_phi": true
    },
    {
      "c": 1.7,
      "rfd_final": 1.2125326971409502,
      "slope_b": 0.27422616639818187,
      "is_phi": false
    },
    {
      "c": 2,
      "rfd_final": 1.2243967814272292,
      "slope_b": 0.28022500447843085,
      "is_phi": false
    },
    {
      "c": 2.718281828459045,
      "rfd_final": 1.2459035867072743,
      "slope_b": 0.28954724731059767,
      "is_phi": false
    }
  ],
  "ranked_c": [
    1,
    1.41421356237,
    1.5,
    1.618033988749895,
    1.7,
    2,
    2.718281828459045
  ],
  "phi_rank_by_lowest_rfd": 4,
  "pass": true,
  "interpretation": "Rank distribution under constant-neutral recursion. Report rank — do not declare a universal crown from one seasonal probe.",
  "honesty": "Single-series blind ladder is illustrative; multi-domain paired Δ is the stronger read."
}
```

### E3_constant_sweep — Continuous Drift(c) sweep · ERFT-C · train/hold (prominence: optimality falsifier)

- **Pass:** `true`
- **Interpretation:** Sweep minimum away from Φ falsifies the strong optimality claim within this parameterized family. Emphasize this result — it is scientifically valuable.
- **Honesty:** Sweep minima are fixture-relative; do not promote to CODATA.

```json
{
  "id": "E3_constant_sweep",
  "title": "Continuous Drift(c) sweep · ERFT-C · train/hold (prominence: optimality falsifier)",
  "mechanism": "all_mechanisms_mean",
  "mode": "constant_neutral",
  "HOLD_OUT_FRACTION": 0.25,
  "train_min": {
    "c": 1.025,
    "rfd": 1.6957711036303504
  },
  "hold_min": {
    "c": 2.4,
    "rfd": 0.8003308976966663
  },
  "train_min_near_phi": false,
  "hold_min_near_phi": false,
  "rfd_at_phi_train": 1.7809105868354886,
  "rfd_at_phi_hold": 0.8181936515401116,
  "train_curve_sample": [
    {
      "c": 1,
      "rfd": 1.707280632603002
    },
    {
      "c": 1.125,
      "rfd": 1.7292875772095038
    },
    {
      "c": 1.25,
      "rfd": 1.743494374520406
    },
    {
      "c": 1.375,
      "rfd": 1.735268556795131
    },
    {
      "c": 1.5,
      "rfd": 1.751576294302994
    },
    {
      "c": 1.625,
      "rfd": 1.7732795900892484
    },
    {
      "c": 1.75,
      "rfd": 1.7954488944827207
    },
    {
      "c": 1.875,
      "rfd": 1.8131181050294702
    },
    {
      "c": 2,
      "rfd": 1.8040583550988003
    },
    {
      "c": 2.125,
      "rfd": 1.8244296388041192
    },
    {
      "c": 2.25,
      "rfd": 1.848513745371082
    },
    {
      "c": 2.375,
      "rfd": 1.8526389518770816
    },
    {
      "c": 2.5,
      "rfd": 1.8418951740390128
    }
  ],
  "hold_curve_sample": [
    {
      "c": 1,
      "rfd": 0.8384210962325144
    },
    {
      "c": 1.125,
      "rfd": 0.8332244862780867
    },
    {
      "c": 1.25,
      "rfd": 0.8292129962877587
    },
    {
      "c": 1.375,
      "rfd": 0.8258128602684088
    },
    {
      "c": 1.5,
      "rfd": 0.8175893858407608
    },
    {
      "c": 1.625,
      "rfd": 0.8164683058074399
    },
    {
      "c": 1.75,
      "rfd": 0.8128529484204104
    },
    {
      "c": 1.875,
      "rfd": 0.8096103326701215
    },
    {
      "c": 2,
      "rfd": 0.8084822219617169
    },
    {
      "c": 2.125,
      "rfd": 0.8059976332822364
    },
    {
      "c": 2.25,
      "rfd": 0.8026825659266684
    },
    {
      "c": 2.375,
      "rfd": 0.8022179025559039
    },
    {
      "c": 2.5,
      "rfd": 0.8006580761784825
    }
  ],
  "pass": true,
  "interpretation": "Sweep minimum away from Φ falsifies the strong optimality claim within this parameterized family. Emphasize this result — it is scientifically valuable.",
  "honesty": "Sweep minima are fixture-relative; do not promote to CODATA."
}
```

### E3b_depth_optima — Depth-dependent optima c*_n (does the minimum drift toward Φ?)

- **Pass:** `true`
- **Interpretation:** If c*_n stays near ~1.025, evidence against a Φ-attractor with depth. If c*_n marches toward 1.618, that is a stronger structural signal than a single aggregate.
- **Honesty:** Single-mechanism / single-series probe — exploratory, not confirmatory.

```json
{
  "id": "E3b_depth_optima",
  "title": "Depth-dependent optima c*_n (does the minimum drift toward Φ?)",
  "mechanism": "recursive_weighting",
  "mode": "constant_neutral",
  "optima": [
    {
      "n": 1,
      "c_star": 2.5,
      "rfd": 0.15036794634123235,
      "distance_to_phi": 0.8819660112501051,
      "moving_toward_phi": null
    },
    {
      "n": 2,
      "c_star": 2.5,
      "rfd": 0.22542008604241293,
      "distance_to_phi": 0.8819660112501051,
      "moving_toward_phi": false
    },
    {
      "n": 4,
      "c_star": 1,
      "rfd": 0.23216901972245135,
      "distance_to_phi": 0.6180339887498949,
      "moving_toward_phi": true
    },
    {
      "n": 8,
      "c_star": 1.9,
      "rfd": 0.1932386198548103,
      "distance_to_phi": 0.281966011250105,
      "moving_toward_phi": true
    },
    {
      "n": 16,
      "c_star": 2.5,
      "rfd": 0.21950115274633566,
      "distance_to_phi": 0.8819660112501051,
      "moving_toward_phi": false
    },
    {
      "n": 24,
      "c_star": 2.5,
      "rfd": 0.4828154994212659,
      "distance_to_phi": 0.8819660112501051,
      "moving_toward_phi": false
    }
  ],
  "converges_toward_phi": false,
  "pass": true,
  "interpretation": "If c*_n stays near ~1.025, evidence against a Φ-attractor with depth. If c*_n marches toward 1.618, that is a stronger structural signal than a single aggregate.",
  "honesty": "Single-mechanism / single-series probe — exploratory, not confirmatory."
}
```

### E4_drift_slope — Drift geometry panel (origin · stepwise · path · recovery)

- **Pass:** `true`
- **Interpretation:** Distinguishes convergence, oscillation, random walk, progressive degradation, and runaway drift — richer than final RFD alone.
- **Honesty:** Power-law fit + geometry panel are pre-registered summaries, not proof of a bounded attractor.

```json
{
  "id": "E4_drift_slope",
  "title": "Drift geometry panel (origin · stepwise · path · recovery)",
  "mechanism": "recursive_compression",
  "mode": "constant_neutral",
  "arms": {
    "baseline": {
      "c": 1,
      "slope": {
        "a": 0.9642616547802779,
        "b": 0.017464384365555672,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd_nrmse": 0,
          "stepwise": 0,
          "path_length": 0,
          "recovery_ratio": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd_nrmse": 0.989807996657284,
          "stepwise": 0.20312004478343668,
          "path_length": 0.20312004478343668,
          "recovery_ratio": 1,
          "F": 0.23906248148707837
        },
        {
          "n": 2,
          "rfd_nrmse": 0.9135981377359926,
          "stepwise": 0.04708037924292916,
          "path_length": 0.25020042402636583,
          "recovery_ratio": 0.7493228732379138,
          "F": 0.45919998088509495
        },
        {
          "n": 3,
          "rfd_nrmse": 1.0088036255471682,
          "stepwise": 0.05299874409295384,
          "path_length": 0.3031991681193197,
          "recovery_ratio": 0.6827794704636336,
          "F": 0.07078357198259722
        },
        {
          "n": 4,
          "rfd_nrmse": 1.0046204624309194,
          "stepwise": 0.022547307150779655,
          "path_length": 0.32574647527009937,
          "recovery_ratio": 0.6328840054113375,
          "F": 0.10041765952618968
        },
        {
          "n": 5,
          "rfd_nrmse": 1.0077373055017251,
          "stepwise": 0.008464945656302432,
          "path_length": 0.3342114209264018,
          "recovery_ratio": 0.6187680411354326,
          "F": 0.060858107341984144
        },
        {
          "n": 6,
          "rfd_nrmse": 1.0088446191563563,
          "stepwise": 0.00583646788309886,
          "path_length": 0.3400478888095007,
          "recovery_ratio": 0.608815953955426,
          "F": 0.0422624171518636
        },
        {
          "n": 7,
          "rfd_nrmse": 1.0093422659395905,
          "stepwise": 0.004593584980201059,
          "path_length": 0.3446414737897018,
          "recovery_ratio": 0.6009976118429645,
          "F": 0.031855117050331304
        },
        {
          "n": 8,
          "rfd_nrmse": 1.009272511596824,
          "stepwise": 0.0007470929629020339,
          "path_length": 0.3453885667526038,
          "recovery_ratio": 0.5996561792399693,
          "F": 0.03311401361504213
        },
        {
          "n": 9,
          "rfd_nrmse": 1.009324648791719,
          "stepwise": 0.00031468216281728704,
          "path_length": 0.3457032489154211,
          "recovery_ratio": 0.5991412811335701,
          "F": 0.03219000240069193
        },
        {
          "n": 10,
          "rfd_nrmse": 1.009460058556933,
          "stepwise": 0.0009974886837749487,
          "path_length": 0.34670073759919606,
          "recovery_ratio": 0.5974976474843621,
          "F": 0.02973504449658318
        },
        {
          "n": 11,
          "rfd_nrmse": 1.0096517367142146,
          "stepwise": 0.0014475183549070164,
          "path_length": 0.3481482559541031,
          "recovery_ratio": 0.5951263754080903,
          "F": 0.02618039923346745
        },
        {
          "n": 12,
          "rfd_nrmse": 1.0097692591427627,
          "stepwise": 0.0020028639956784344,
          "path_length": 0.35015111994978154,
          "recovery_ratio": 0.5917911291028576,
          "F": 0.023794509797737347
        },
        {
          "n": 13,
          "rfd_nrmse": 1.0097307996942742,
          "stepwise": 0.002152026818275384,
          "path_length": 0.3523031467680569,
          "recovery_ratio": 0.588153799388692,
          "F": 0.024258691650154346
        },
        {
          "n": 14,
          "rfd_nrmse": 1.0101909248178698,
          "stepwise": 0.0022304591829924968,
          "path_length": 0.3545336059510494,
          "recovery_ratio": 0.5847199075735585,
          "F": 0.015505751955738807
        },
        {
          "n": 15,
          "rfd_nrmse": 1.0101807316365279,
          "stepwise": 0.0005877762774386719,
          "path_length": 0.35512138222848805,
          "recovery_ratio": 0.583746222893943,
          "F": 0.01575018353649818
        },
        {
          "n": 16,
          "rfd_nrmse": 1.0102133770928021,
          "stepwise": 0.00019999716957607537,
          "path_length": 0.35532137939806413,
          "recovery_ratio": 0.5834365078763685,
          "F": 0.015219434855092496
        },
        {
          "n": 17,
          "rfd_nrmse": 1.0102347914188283,
          "stepwise": 0.0005762078544636152,
          "path_length": 0.35589758725252774,
          "recovery_ratio": 0.5825042558942918,
          "F": 0.015033666178228022
        },
        {
          "n": 18,
          "rfd_nrmse": 1.010275510222665,
          "stepwise": 0.0008903176608059353,
          "path_length": 0.3567879049133337,
          "recovery_ratio": 0.5810741125229376,
          "F": 0.014524905758585656
        },
        {
          "n": 19,
          "rfd_nrmse": 1.0105328444434802,
          "stepwise": 0.0011571572224827287,
          "path_length": 0.3579450621358164,
          "recovery_ratio": 0.5793431593284091,
          "F": 0.010294966034548074
        },
        {
          "n": 20,
          "rfd_nrmse": 1.0103738606513752,
          "stepwise": 0.0014130414816816647,
          "path_length": 0.35935810361749804,
          "recovery_ratio": 0.5769743210582988,
          "F": 0.013562525707502951
        },
        {
          "n": 21,
          "rfd_nrmse": 1.010581542529055,
          "stepwise": 0.0014799185272157402,
          "path_length": 0.3608380221447138,
          "recovery_ratio": 0.5747260650120449,
          "F": 0.010347569141645177
        },
        {
          "n": 22,
          "rfd_nrmse": 1.010678049411785,
          "stepwise": 0.00045985401546472037,
          "path_length": 0.3612978761601785,
          "recovery_ratio": 0.5740493775007152,
          "F": 0.008713872652184535
        },
        {
          "n": 23,
          "rfd_nrmse": 1.0106700567499058,
          "stepwise": 0.00014873118348050145,
          "path_length": 0.361446607343659,
          "recovery_ratio": 0.5738086248469334,
          "F": 0.008953685755842699
        },
        {
          "n": 24,
          "rfd_nrmse": 1.0106526075670004,
          "stepwise": 0.00042949326922687184,
          "path_length": 0.3618761006128859,
          "recovery_ratio": 0.5731177040708801,
          "F": 0.009554918067549165
        }
      ]
    },
    "egs": {
      "c": 1.618033988749895,
      "slope": {
        "a": 0.9618406686563677,
        "b": 0.01822865203823705,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd_nrmse": 0,
          "stepwise": 0,
          "path_length": 0,
          "recovery_ratio": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd_nrmse": 0.9849791491853319,
          "stepwise": 0.2021291094524758,
          "path_length": 0.2021291094524758,
          "recovery_ratio": 1,
          "F": 0.25314563391278616
        },
        {
          "n": 2,
          "rfd_nrmse": 0.9087235587992154,
          "stepwise": 0.04553256209296696,
          "path_length": 0.24766167154544277,
          "recovery_ratio": 0.7529650409643109,
          "F": 0.4638377051676584
        },
        {
          "n": 3,
          "rfd_nrmse": 1.0081730654320473,
          "stepwise": 0.05640120039324169,
          "path_length": 0.3040628719386845,
          "recovery_ratio": 0.6804144416200529,
          "F": 0.07866238269504754
        },
        {
          "n": 4,
          "rfd_nrmse": 1.0040464882409923,
          "stepwise": 0.02426077508525873,
          "path_length": 0.32832364702394323,
          "recovery_ratio": 0.6275574414006367,
          "F": 0.10690470911666841
        },
        {
          "n": 5,
          "rfd_nrmse": 1.007179581104954,
          "stepwise": 0.008781454284806686,
          "path_length": 0.33710510130874993,
          "recovery_ratio": 0.6131170781896779,
          "F": 0.06900396800543539
        },
        {
          "n": 6,
          "rfd_nrmse": 1.0086710332359141,
          "stepwise": 0.006218466865099255,
          "path_length": 0.3433235681738492,
          "recovery_ratio": 0.6029034332808937,
          "F": 0.04509310227186148
        },
        {
          "n": 7,
          "rfd_nrmse": 1.0090458383869263,
          "stepwise": 0.005037869061894145,
          "path_length": 0.3483614372357433,
          "recovery_ratio": 0.5944052647495203,
          "F": 0.03679842760753982
        },
        {
          "n": 8,
          "rfd_nrmse": 1.008842724101417,
          "stepwise": 0.0008821645929385255,
          "path_length": 0.34924360182868186,
          "recovery_ratio": 0.5927844915265074,
          "F": 0.04060169087136153
        },
        {
          "n": 9,
          "rfd_nrmse": 1.0088838115086356,
          "stepwise": 0.0002986306924219472,
          "path_length": 0.3495422325211038,
          "recovery_ratio": 0.592302169173229,
          "F": 0.03982488435271512
        },
        {
          "n": 10,
          "rfd_nrmse": 1.0090487141695064,
          "stepwise": 0.0010482599152094915,
          "path_length": 0.3505904924363133,
          "recovery_ratio": 0.5906277179210297,
          "F": 0.03664094029673496
        },
        {
          "n": 11,
          "rfd_nrmse": 1.0092510010099678,
          "stepwise": 0.0016711431331804074,
          "path_length": 0.3522616355694937,
          "recovery_ratio": 0.5879435997510297,
          "F": 0.032581584064000815
        },
        {
          "n": 12,
          "rfd_nrmse": 1.0092222394580834,
          "stepwise": 0.002184427769185032,
          "path_length": 0.35444606333867873,
          "recovery_ratio": 0.5843034901195758,
          "F": 0.03275331534389499
        },
        {
          "n": 13,
          "rfd_nrmse": 1.0092901114820758,
          "stepwise": 0.002320441934686421,
          "path_length": 0.3567665052733652,
          "recovery_ratio": 0.5805421667408881,
          "F": 0.03100349024614086
        },
        {
          "n": 14,
          "rfd_nrmse": 1.0097502387275141,
          "stepwise": 0.0023472884438138697,
          "path_length": 0.35911379371717905,
          "recovery_ratio": 0.5770104826042537,
          "F": 0.0210942278066932
        },
        {
          "n": 15,
          "rfd_nrmse": 1.0096658429384544,
          "stepwise": 0.0006179851711353327,
          "path_length": 0.35973177888831437,
          "recovery_ratio": 0.5759710889908539,
          "F": 0.022835742388743408
        },
        {
          "n": 16,
          "rfd_nrmse": 1.009710074971688,
          "stepwise": 0.00019412582413451594,
          "path_length": 0.3599259047124489,
          "recovery_ratio": 0.5756856581942216,
          "F": 0.021951247681227627
        },
        {
          "n": 17,
          "rfd_nrmse": 1.0097451971120606,
          "stepwise": 0.0005809945674518966,
          "path_length": 0.3605068992799008,
          "recovery_ratio": 0.5747778731522483,
          "F": 0.02127701135107979
        },
        {
          "n": 18,
          "rfd_nrmse": 1.009735819880898,
          "stepwise": 0.0009788992293999499,
          "path_length": 0.3614857985093008,
          "recovery_ratio": 0.5732160581772632,
          "F": 0.021450336553893515
        },
        {
          "n": 19,
          "rfd_nrmse": 1.0099824711984378,
          "stepwise": 0.0012564259798708915,
          "path_length": 0.3627422244891717,
          "recovery_ratio": 0.5713701527372588,
          "F": 0.016445163322430848
        },
        {
          "n": 20,
          "rfd_nrmse": 1.0097656452143915,
          "stepwise": 0.0014237598212574708,
          "path_length": 0.3641659843104292,
          "recovery_ratio": 0.5690141142759446,
          "F": 0.02086670974900848
        },
        {
          "n": 21,
          "rfd_nrmse": 1.010077969455183,
          "stepwise": 0.0015041176725616695,
          "path_length": 0.3656701019829908,
          "recovery_ratio": 0.566848852101886,
          "F": 0.014445705391447364
        },
        {
          "n": 22,
          "rfd_nrmse": 1.0101240912009108,
          "stepwise": 0.000528498576212828,
          "path_length": 0.36619860055920367,
          "recovery_ratio": 0.5660566205222152,
          "F": 0.013527829476038757
        },
        {
          "n": 23,
          "rfd_nrmse": 1.0101292206078345,
          "stepwise": 0.0001533802236670904,
          "path_length": 0.36635198078287073,
          "recovery_ratio": 0.5658225033836228,
          "F": 0.013473574960667556
        },
        {
          "n": 24,
          "rfd_nrmse": 1.0101023584207334,
          "stepwise": 0.00042378215108254084,
          "path_length": 0.36677576293395325,
          "recovery_ratio": 0.565153708076598,
          "F": 0.014159009330378343
        }
      ]
    },
    "sqrt2": {
      "c": 1.4142135623730951,
      "slope": {
        "a": 0.9624581813855418,
        "b": 0.01803589243594486,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd_nrmse": 0,
          "stepwise": 0,
          "path_length": 0,
          "recovery_ratio": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd_nrmse": 0.9862310518796621,
          "stepwise": 0.20238601435948364,
          "path_length": 0.20238601435948364,
          "recovery_ratio": 1,
          "F": 0.2494480293968354
        },
        {
          "n": 2,
          "rfd_nrmse": 0.9099900973641595,
          "stepwise": 0.04593462839626368,
          "path_length": 0.24832064275574733,
          "recovery_ratio": 0.7520135537062813,
          "F": 0.46289805110955773
        },
        {
          "n": 3,
          "rfd_nrmse": 1.0083039843376989,
          "stepwise": 0.05538671971128861,
          "path_length": 0.30370736246703595,
          "recovery_ratio": 0.6812993719343688,
          "F": 0.07676281928012582
        },
        {
          "n": 4,
          "rfd_nrmse": 1.0042013080983587,
          "stepwise": 0.023739128718107905,
          "path_length": 0.32744649118514385,
          "recovery_ratio": 0.6293355532885138,
          "F": 0.10519663118054699
        },
        {
          "n": 5,
          "rfd_nrmse": 1.0073288183551499,
          "stepwise": 0.008656474039352059,
          "path_length": 0.3361029652244959,
          "recovery_ratio": 0.6150362875506332,
          "F": 0.06684397446495959
        },
        {
          "n": 6,
          "rfd_nrmse": 1.0087102007112962,
          "stepwise": 0.006088114574442689,
          "path_length": 0.3421910797989386,
          "recovery_ratio": 0.6049222432059843,
          "F": 0.044431662357229444
        },
        {
          "n": 7,
          "rfd_nrmse": 1.009123485737233,
          "stepwise": 0.004888180182033159,
          "path_length": 0.3470792599809718,
          "recovery_ratio": 0.5966470208390077,
          "F": 0.0354432941926726
        },
        {
          "n": 8,
          "rfd_nrmse": 1.0089593913842776,
          "stepwise": 0.000838930774589175,
          "path_length": 0.34791819075556096,
          "recovery_ratio": 0.5951115460636708,
          "F": 0.03848809029797832
        },
        {
          "n": 9,
          "rfd_nrmse": 1.0090036815255876,
          "stepwise": 0.0003036820689524054,
          "path_length": 0.3482218728245134,
          "recovery_ratio": 0.5946186538306026,
          "F": 0.03766244249572117
        },
        {
          "n": 10,
          "rfd_nrmse": 1.0091598472081573,
          "stepwise": 0.0010286604370348736,
          "path_length": 0.34925053326154826,
          "recovery_ratio": 0.592959061001064,
          "F": 0.034681609568783994
        },
        {
          "n": 11,
          "rfd_nrmse": 1.009357743058933,
          "stepwise": 0.001594552308108412,
          "path_length": 0.35084508556965666,
          "recovery_ratio": 0.5903798778801977,
          "F": 0.03077085207635197
        },
        {
          "n": 12,
          "rfd_nrmse": 1.009375113468122,
          "stepwise": 0.002119798615180551,
          "path_length": 0.3529648841848372,
          "recovery_ratio": 0.586844336825892,
          "F": 0.030061759808655733
        },
        {
          "n": 13,
          "rfd_nrmse": 1.0094016326449056,
          "stepwise": 0.0022545463767103275,
          "path_length": 0.35521943056154753,
          "recovery_ratio": 0.5831350078358705,
          "F": 0.029155289259494475
        },
        {
          "n": 14,
          "rfd_nrmse": 1.0098677090160675,
          "stepwise": 0.002299589398887831,
          "path_length": 0.3575190199604354,
          "recovery_ratio": 0.5796517614836147,
          "F": 0.01940305163857252
        },
        {
          "n": 15,
          "rfd_nrmse": 1.009806533124516,
          "stepwise": 0.0006141478495619862,
          "path_length": 0.3581331678099974,
          "recovery_ratio": 0.5786226865020718,
          "F": 0.0206447230423569
        },
        {
          "n": 16,
          "rfd_nrmse": 1.0098478395703807,
          "stepwise": 0.0001969382382602224,
          "path_length": 0.3583301060482576,
          "recovery_ratio": 0.5783283311843009,
          "F": 0.019855052316423868
        },
        {
          "n": 17,
          "rfd_nrmse": 1.0098768408159136,
          "stepwise": 0.0005775519529987737,
          "path_length": 0.3589076580012564,
          "recovery_ratio": 0.5774142708154312,
          "F": 0.019360975534915142
        },
        {
          "n": 18,
          "rfd_nrmse": 1.0098815662682645,
          "stepwise": 0.000945427778504508,
          "path_length": 0.3598530857797609,
          "recovery_ratio": 0.5758999479002996,
          "F": 0.01930538534624581
        },
        {
          "n": 19,
          "rfd_nrmse": 1.0101346381580145,
          "stepwise": 0.0012180154728590848,
          "path_length": 0.36107110125262,
          "recovery_ratio": 0.5741010729214148,
          "F": 0.014428756940033875
        },
        {
          "n": 20,
          "rfd_nrmse": 1.0099252638927736,
          "stepwise": 0.001406143984084051,
          "path_length": 0.36247724523670405,
          "recovery_ratio": 0.5717554504000875,
          "F": 0.018645068785784244
        },
        {
          "n": 21,
          "rfd_nrmse": 1.0102108893431228,
          "stepwise": 0.0014864949226439648,
          "path_length": 0.363963740159348,
          "recovery_ratio": 0.5695813384159155,
          "F": 0.013113698755560302
        },
        {
          "n": 22,
          "rfd_nrmse": 1.0102753604400616,
          "stepwise": 0.0005146821070851544,
          "path_length": 0.3644784222664332,
          "recovery_ratio": 0.5688133283175839,
          "F": 0.011884462450865317
        },
        {
          "n": 23,
          "rfd_nrmse": 1.0102761606134067,
          "stepwise": 0.00015268375321025326,
          "path_length": 0.36463110601964344,
          "recovery_ratio": 0.5685755966825405,
          "F": 0.01193271157724015
        },
        {
          "n": 24,
          "rfd_nrmse": 1.0102497532302563,
          "stepwise": 0.00042357122383234326,
          "path_length": 0.3650546772434758,
          "recovery_ratio": 0.5679010364672753,
          "F": 0.01262971933725892
        }
      ]
    },
    "e": {
      "c": 2.718281828459045,
      "slope": {
        "a": 0.9599933443748359,
        "b": 0.01878874281229309,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd_nrmse": 0,
          "stepwise": 0,
          "path_length": 0,
          "recovery_ratio": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd_nrmse": 0.9809947049296447,
          "stepwise": 0.20131145542423448,
          "path_length": 0.20131145542423448,
          "recovery_ratio": 1,
          "F": 0.26519927692862766
        },
        {
          "n": 2,
          "rfd_nrmse": 0.9047646494701348,
          "stepwise": 0.04425473939467463,
          "path_length": 0.24556619481890912,
          "recovery_ratio": 0.7560819469933525,
          "F": 0.4652828799937408
        },
        {
          "n": 3,
          "rfd_nrmse": 1.007984157953052,
          "stepwise": 0.0604606061038497,
          "path_length": 0.3060268009227588,
          "recovery_ratio": 0.6759212023425883,
          "F": 0.08385370867568338
        },
        {
          "n": 4,
          "rfd_nrmse": 1.0035370092295577,
          "stepwise": 0.026387117034953174,
          "path_length": 0.33241391795771197,
          "recovery_ratio": 0.6195209820314348,
          "F": 0.11219164069185499
        },
        {
          "n": 5,
          "rfd_nrmse": 1.006678202986052,
          "stepwise": 0.00945361148155356,
          "path_length": 0.3418675294392655,
          "recovery_ratio": 0.6042750140948123,
          "F": 0.07604883880481719
        },
        {
          "n": 6,
          "rfd_nrmse": 1.0085894020239496,
          "stepwise": 0.006830690281062358,
          "path_length": 0.3486982197203279,
          "recovery_ratio": 0.5935625552541458,
          "F": 0.04661076152985654
        },
        {
          "n": 7,
          "rfd_nrmse": 1.0087984060750768,
          "stepwise": 0.005729149305385161,
          "path_length": 0.35442736902571303,
          "recovery_ratio": 0.5840889120007137,
          "F": 0.041360484179998165
        },
        {
          "n": 8,
          "rfd_nrmse": 1.0084443428905645,
          "stepwise": 0.0010902497385446607,
          "path_length": 0.3555176187642577,
          "recovery_ratio": 0.5820933410214241,
          "F": 0.048122341219239625
        },
        {
          "n": 9,
          "rfd_nrmse": 1.0084745054371547,
          "stepwise": 0.0002810676806696754,
          "path_length": 0.35579868644492735,
          "recovery_ratio": 0.5816509056555822,
          "F": 0.04753922869923185
        },
        {
          "n": 10,
          "rfd_nrmse": 1.0086730331116285,
          "stepwise": 0.0011650354772172952,
          "path_length": 0.35696372192214465,
          "recovery_ratio": 0.579866680180528,
          "F": 0.043657798891433106
        },
        {
          "n": 11,
          "rfd_nrmse": 1.0089013844825003,
          "stepwise": 0.0020374250123375297,
          "path_length": 0.3590011469344822,
          "recovery_ratio": 0.5767063155235493,
          "F": 0.03899033567309572
        },
        {
          "n": 12,
          "rfd_nrmse": 1.008669873631455,
          "stepwise": 0.0025029269773913566,
          "path_length": 0.36150407391187356,
          "recovery_ratio": 0.572581984413482,
          "F": 0.043439295830653445
        },
        {
          "n": 13,
          "rfd_nrmse": 1.008964801738749,
          "stepwise": 0.002661897808105078,
          "path_length": 0.3641659717199786,
          "recovery_ratio": 0.5685628497731173,
          "F": 0.03700279053363509
        },
        {
          "n": 14,
          "rfd_nrmse": 1.0093578095557056,
          "stepwise": 0.0026183325306476336,
          "path_length": 0.36678430425062625,
          "recovery_ratio": 0.5647239808763826,
          "F": 0.027890846755585584
        },
        {
          "n": 15,
          "rfd_nrmse": 1.0091772150637444,
          "stepwise": 0.0006211398028048512,
          "path_length": 0.3674054440534311,
          "recovery_ratio": 0.5636683824193406,
          "F": 0.03191515487709711
        },
        {
          "n": 16,
          "rfd_nrmse": 1.0092290544160043,
          "stepwise": 0.0001758611181263367,
          "path_length": 0.36758130517155746,
          "recovery_ratio": 0.5634276484203458,
          "F": 0.03075443560765029
        },
        {
          "n": 17,
          "rfd_nrmse": 1.0093001979026561,
          "stepwise": 0.0006089151434410027,
          "path_length": 0.3681902203149985,
          "recovery_ratio": 0.5625355004402218,
          "F": 0.029130936056915895
        },
        {
          "n": 18,
          "rfd_nrmse": 1.009242392562854,
          "stepwise": 0.0011603148899432731,
          "path_length": 0.36935053520494177,
          "recovery_ratio": 0.560736178175887,
          "F": 0.03031894612212085
        },
        {
          "n": 19,
          "rfd_nrmse": 1.0094387963970566,
          "stepwise": 0.0014521922160234768,
          "path_length": 0.37080272742096526,
          "recovery_ratio": 0.5586488354504671,
          "F": 0.025722307386714216
        },
        {
          "n": 20,
          "rfd_nrmse": 1.0092687583744464,
          "stepwise": 0.0015878097831582942,
          "path_length": 0.3723905372041236,
          "recovery_ratio": 0.5561731499473681,
          "F": 0.029453678256126097
        },
        {
          "n": 21,
          "rfd_nrmse": 1.0096406645289626,
          "stepwise": 0.0016342553657549108,
          "path_length": 0.3740247925698785,
          "recovery_ratio": 0.5539470688737229,
          "F": 0.020541788867166535
        },
        {
          "n": 22,
          "rfd_nrmse": 1.0095963066854778,
          "stepwise": 0.0005367459511464983,
          "path_length": 0.374561538521025,
          "recovery_ratio": 0.553128961414231,
          "F": 0.021575780654331484
        },
        {
          "n": 23,
          "rfd_nrmse": 1.0096192813721245,
          "stepwise": 0.00014733441600283913,
          "path_length": 0.3747088729370278,
          "recovery_ratio": 0.5529240549742634,
          "F": 0.021049236285668904
        },
        {
          "n": 24,
          "rfd_nrmse": 1.0096101091756877,
          "stepwise": 0.0004315297915990485,
          "path_length": 0.37514040272862686,
          "recovery_ratio": 0.5522830004751506,
          "F": 0.02128008478070876
        }
      ]
    }
  },
  "pass": true,
  "interpretation": "Distinguishes convergence, oscillation, random walk, progressive degradation, and runaway drift — richer than final RFD alone.",
  "honesty": "Power-law fit + geometry panel are pre-registered summaries, not proof of a bounded attractor."
}
```

### E5_phi_not_assumed — Falsifiability lock — Φ is one arm among peers · V5 separates effects

- **Pass:** `true`
- **Interpretation:** Q1 numerical · Q2 optimality · Q3 structural — three different hypotheses. V4 partially combined them; V5 separates them.
- **Honesty:** A null result is a valid scientific outcome for this suite.

```json
{
  "id": "E5_phi_not_assumed",
  "title": "Falsifiability lock — Φ is one arm among peers · V5 separates effects",
  "PRE_REGISTERED_HYPOTHESIS": {
    "claim": "Q1 (ERFT-C): Does numerical c=Φ reduce drift under a constant-neutral recursion? Q2: Is Φ unusually low vs continuous c? Q3 (ERFT-G): Does generalized algebraic closure C(c) add stability, and does Φ benefit disproportionately?",
    "null_ok": true,
    "win_requires": [
      "lower cumulative RFD vs baseline at depth N under ERFT-C (constant-neutral)",
      "advantage across ≥3 independent domains",
      "survives decoy constants (√2, e, blind ladder)",
      "survives held-out series",
      "not a single-metric fluke",
      "paired Δ_i reported (not mean-only)"
    ],
    "suite_pass_means": "Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.",
    "anti_baseline_bias": "Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms.",
    "v4_confound_note": "ERFT-V4 combined numerical c with Φ-specific partition identity and Φ-only self-similar closure. V5 separates those effects.",
    "engineering_threshold": "15% is an engineering significance threshold, not a statistically validated effect threshold."
  },
  "STANDALONE_REPO": "https://github.com/FractiAI/synthobs-egs-recursive-fidelity-test",
  "pass": true,
  "interpretation": "Q1 numerical · Q2 optimality · Q3 structural — three different hypotheses. V4 partially combined them; V5 separates them.",
  "honesty": "A null result is a valid scientific outcome for this suite."
}
```

### E6_paper_locks — Paper presence + honesty / falsifiability / V5-split locks

- **Pass:** `true`
- **Interpretation:** Paper must state controlled design, refuse Φ-assumed framing, and document the C/G split.
- **Honesty:** Structural lock only.

```json
{
  "id": "E6_paper_locks",
  "title": "Paper presence + honesty / falsifiability / V5-split locks",
  "checks": {
    "hasHonesty": true,
    "hasDocId": true,
    "hasErft": true,
    "hasFalsifiable": true,
    "hasNotAssume": true,
    "hasFiveArm": true,
    "hasV5Split": true
  },
  "pass": true,
  "interpretation": "Paper must state controlled design, refuse Φ-assumed framing, and document the C/G split.",
  "honesty": "Structural lock only."
}
```

### E7_ship_blog_lock — Ship-blog magazine lock

- **Pass:** `true`
- **Interpretation:** Frontiersman magazine note required for paper ship; must reflect V5 C/G split.
- **Honesty:** Structural lock.

```json
{
  "id": "E7_ship_blog_lock",
  "title": "Ship-blog magazine lock",
  "SHIP_BLOG_SLUG": "erft-recursive-fidelity",
  "checks": {
    "exists": true,
    "hasHonestyRail": true,
    "hasErft": true,
    "hasV5": true
  },
  "pass": true,
  "interpretation": "Frontiersman magazine note required for paper ship; must reflect V5 C/G split.",
  "honesty": "Structural lock."
}
```

## Honesty boundary

ERFT V5 separates constant-neutral recursion (ERFT-C) from symmetric generalized-closure grammar (ERFT-G). V4 evidence remains exploratory for the combined Φ-enabled architecture and does not isolate numerical Φ alone. Suite pass = protocol integrity; empirical Φ advantage is a measured outcome that may fail. Not CODATA; not AGI safety proof.
