# EGS Recursive Fidelity Test (ERFT) · Version Three — Nest-Grammar Scoreboard

**Document ID:** `WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25`
**Registry ID:** `synthobs-egs-recursive-fidelity-test-erft-2026-09`
**Protocol:** `ERFT-V3-2026-09-26`
**Generated:** 2026-09-26T04:15:56.840Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 10 / 10 |
| Φ_EGS (one arm) | 1.618033988749895 |
| Suite pass means | Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won. |

## Experiments

### E0_protocol_locks — Pre-registered protocol locks (φ not assumed · V2 anti-bias)

- **Pass:** `true`
- **Interpretation:** V3 freezes arms, mechanisms, depth, null-ok honesty, and nest-grammar locks before reading outcomes.
- **Honesty:** Protocol lock ≠ physics proof.

```json
{
  "id": "E0_protocol_locks",
  "title": "Pre-registered protocol locks (φ not assumed · V2 anti-bias)",
  "PROTOCOL_VERSION": "ERFT-V3-2026-09-26",
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
    "version": 3,
    "rule": "Transform severity fixed; c selects nest partition (whole:part ≈ part:remainder). Baseline = dyadic 1:1. Block/lag budgets derived from c, not monotonic coarsening vs c.",
    "fixed_block": 4,
    "fixed_feedback_gain": 0.45,
    "fixed_mix_weight": 0.5
  },
  "hypothesis": {
    "claim": "If Φ_EGS reduces cumulative recursive fidelity drift vs matched controls, the advantage must appear across domains, mechanisms, decoy constants, and held-out series — without assuming Φ a priori.",
    "null_ok": true,
    "win_requires": [
      "lower cumulative RFD vs baseline at depth N",
      "advantage across ≥3 independent domains",
      "survives decoy constants (√2, e, blind ladder)",
      "survives held-out series",
      "not a single-metric fluke"
    ],
    "suite_pass_means": "Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.",
    "anti_baseline_bias": "Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms."
  },
  "pass": true,
  "interpretation": "V3 freezes arms, mechanisms, depth, null-ok honesty, and nest-grammar locks before reading outcomes.",
  "honesty": "Protocol lock ≠ physics proof."
}
```

### E0b_anti_baseline_bias — Anti-baseline-bias construction locks (V3 nest grammar)

- **Pass:** `true`
- **Interpretation:** Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.
- **Honesty:** Anti-bias lock ≠ Φ win. Empirical outcomes still free to null.

```json
{
  "id": "E0b_anti_baseline_bias",
  "title": "Anti-baseline-bias construction locks (V3 nest grammar)",
  "first_step_rfd": {
    "scaling": {
      "baseline": 1.026634324183127,
      "egs": 0.8660097988152495,
      "sqrt2": 0.46828503165754937,
      "e": 0.6941319020047076
    },
    "recursive_weighting": {
      "baseline": 1.026634324183127,
      "egs": 0.6503560748951466,
      "sqrt2": 0.46828503165754937,
      "e": 0.6941319020047076
    }
  },
  "hierarchical_ladder": [
    {
      "c": 1,
      "rfd": 1.3255348060845584
    },
    {
      "c": 1.41421356237,
      "rfd": 0.9796074125319351
    },
    {
      "c": 1.5,
      "rfd": 1.2027082988038822
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.2092673261598208
    },
    {
      "c": 1.7,
      "rfd": 1.4241002999766927
    },
    {
      "c": 2,
      "rfd": 1.3255348060845584
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.4629297643646397
    }
  ],
  "compression_ladder": [
    {
      "c": 1,
      "rfd": 1.4806458705773866
    },
    {
      "c": 1.41421356237,
      "rfd": 1.5424448466220306
    },
    {
      "c": 1.5,
      "rfd": 1.5595473189333158
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.539796511575398
    },
    {
      "c": 1.7,
      "rfd": 1.5800003273318461
    },
    {
      "c": 2,
      "rfd": 1.4806458705773866
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.4664841923278633
    }
  ],
  "feedback_named": [
    {
      "name": "baseline",
      "c": 1,
      "rfd": 4.551536604213259
    },
    {
      "name": "egs",
      "c": 1.618033988749895,
      "rfd": 3.6721978410819185
    },
    {
      "name": "sqrt2",
      "c": 1.4142135623730951,
      "rfd": 4.348685365274575
    },
    {
      "name": "e",
      "c": 2.718281828459045,
      "rfd": 4.424686718194037
    }
  ],
  "scaling_first_step_spread_ratio": 2.1923278661058956,
  "severity_parity": {
    "hierarchical": {
      "lo": 0.6679900002499372,
      "hi": 1.0662115620140298,
      "ratio": 1.5961489866840715
    },
    "compression": {
      "lo": 0.5674409565093922,
      "hi": 1.019745677856125,
      "ratio": 1.7970956557825524
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
  "honesty": "Anti-bias lock ≠ Φ win. Empirical outcomes still free to null."
}
```

### E0c_nest_grammar_lock — Nest-ratio grammar lock (V3 · models RSI partition, not sin(c))

- **Pass:** `true`
- **Interpretation:** Φ satisfies whole:part ≈ part:remainder; baseline is dyadic 1:1; decoys use 1/c partition without V2 arbitrary phase.
- **Honesty:** Grammar lock ≠ Φ empirical win on fixtures.

```json
{
  "id": "E0c_nest_grammar_lock",
  "title": "Nest-ratio grammar lock (V3 · models RSI partition, not sin(c))",
  "phi_self_similar_error": 2.220446049250313e-16,
  "phi_partition": {
    "wMajor": 0.6180339887498948,
    "wMinor": 0.38196601125010515,
    "dyadic": false,
    "phi_exact": true
  },
  "baseline_dyadic": {
    "wMajor": 0.5,
    "wMinor": 0.5,
    "dyadic": true,
    "phi_exact": false
  },
  "pass": true,
  "interpretation": "Φ satisfies whole:part ≈ part:remainder; baseline is dyadic 1:1; decoys use 1/c partition without V2 arbitrary phase.",
  "honesty": "Grammar lock ≠ Φ empirical win on fixtures."
}
```

### E1_five_arm_matched — Five-arm matched recursion (baseline · Φ · √2 · e · random)

- **Pass:** `true`
- **Interpretation:** Identical recursion/evaluator; only nest ratio c differs. Scoreboard reports mechanism-class winners — suite pass does not crown Φ.
- **Honesty:** Proxy fixtures; V3 nest grammar replaces V2 sin geometry.

```json
{
  "id": "E1_five_arm_matched",
  "title": "Five-arm matched recursion (baseline · Φ · √2 · e · random)",
  "rows": [
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.1864679408024447,
          "fidelity_final": 0.4404680934039317,
          "drift_slope_b": 0.01798670584803338,
          "drift_a": 0.17760588801728264
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.21168316111242313,
          "fidelity_final": 0.0031218937871202663,
          "drift_slope_b": 0.029885476258332863,
          "drift_a": 0.19570342226444049
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20792334952933866,
          "fidelity_final": 0.04957681226607911,
          "drift_slope_b": 0.0023556444028967113,
          "drift_a": 0.20764298782268725
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20961342048779932,
          "fidelity_final": 0.01045113239273146,
          "drift_slope_b": 0.06162840417782991,
          "drift_a": 0.17947105199735702
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20836671664077916,
          "fidelity_final": 0,
          "drift_slope_b": -0.0035364615074738367,
          "drift_a": 0.21117301268097016
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20858749837308393,
          "fidelity_final": 0.039976190974208,
          "drift_slope_b": 0.028792541831500502,
          "drift_a": 0.19703435851729503
        }
      }
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.18644719049619196,
          "fidelity_final": 0.44066799992577355,
          "drift_slope_b": -0.026553852161730007,
          "drift_a": 0.20029181319022646
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.21347822686828072,
          "fidelity_final": 0.00868449923731825,
          "drift_slope_b": 0.1143236738898435,
          "drift_a": 0.159284248661499
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20903119496552228,
          "fidelity_final": 0,
          "drift_slope_b": -0.05373220608078134,
          "drift_a": 0.24281461287800143
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.21179638508527915,
          "fidelity_final": 0.01088555161298177,
          "drift_slope_b": 0.06313439473441329,
          "drift_a": 0.18294114437674971
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20888850001842352,
          "fidelity_final": 0,
          "drift_slope_b": -0.06725013660802014,
          "drift_a": 0.25203029107042224
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.21454441963883014,
          "fidelity_final": 0,
          "drift_slope_b": 0.015312696443484144,
          "drift_a": 0.20923006234750635
        }
      }
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.20715019444210603,
          "fidelity_final": 0.09775832307904807,
          "drift_slope_b": 0.009150423390392126,
          "drift_a": 0.20213626295902154
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.2067920063614459,
          "fidelity_final": 0.11373928813802639,
          "drift_slope_b": 0.020549896476607116,
          "drift_a": 0.19503239109893952
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2060922767019706,
          "fidelity_final": 0.13932170209291175,
          "drift_slope_b": 0.010168569941772568,
          "drift_a": 0.2000656513675978
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20799752547734943,
          "fidelity_final": 0.040371497909177295,
          "drift_slope_b": 0.01213382338014664,
          "drift_a": 0.20125139406488596
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20059995354326401,
          "fidelity_final": 0.2811283007400091,
          "drift_slope_b": 0.016633260546331394,
          "drift_a": 0.19006880163237003
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20765171663651058,
          "fidelity_final": 0.07058180865111749,
          "drift_slope_b": 0.009873966589242642,
          "drift_a": 0.20212958472347992
        }
      }
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.479137347401145,
          "fidelity_final": 0.039942252676495774,
          "drift_slope_b": 0.41598466653757127,
          "drift_a": 0.12852895002658776
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.3644076731011232,
          "fidelity_final": 0.036456204246000726,
          "drift_slope_b": 0.29951244832051555,
          "drift_a": 0.14539938399802968
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.4687509661185546,
          "fidelity_final": 0.025935052956705174,
          "drift_slope_b": 0.4316811650681943,
          "drift_a": 0.11941667837290261
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.46240750146628185,
          "fidelity_final": 0.0029832430804259723,
          "drift_slope_b": 0.39712279596140687,
          "drift_a": 0.13095226013754965
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.49666766183057354,
          "fidelity_final": 0.06704229396178109,
          "drift_slope_b": 0.4574316661938013,
          "drift_a": 0.11529079712890437
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4456507444504739,
          "fidelity_final": 0,
          "drift_slope_b": 0.3804109113846317,
          "drift_a": 0.13372213858583434
        }
      }
    },
    {
      "domain": "synthetic_logistic",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.20834987230492819,
          "fidelity_final": 0.012376248148447183,
          "drift_slope_b": 0.012177831367814376,
          "drift_a": 0.20158284083320469
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.20903273720433282,
          "fidelity_final": 0.006285472646257597,
          "drift_slope_b": 0.031156552868386995,
          "drift_a": 0.19118505402384342
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20956506850523265,
          "fidelity_final": 0.004496939599477596,
          "drift_slope_b": 0.018973606371206944,
          "drift_a": 0.19868282126084574
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2092345036199601,
          "fidelity_final": 0.009770432801629937,
          "drift_slope_b": 0.016401929749389085,
          "drift_a": 0.19955503423159304
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20874654190364633,
          "fidelity_final": 0.01603621797171752,
          "drift_slope_b": 0.01740119096024519,
          "drift_a": 0.1997918996021228
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20841614113516935,
          "fidelity_final": 0.010167993501952166,
          "drift_slope_b": 0.012692292008347395,
          "drift_a": 0.20130973625082205
        }
      }
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.2164737442037455,
          "fidelity_final": 0.3767179334641202,
          "drift_slope_b": 0.032401981021483034,
          "drift_a": 0.1982851442113602
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.25593177762999736,
          "fidelity_final": 0,
          "drift_slope_b": 0.0436976349809666,
          "drift_a": 0.2286226683275802
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2658882798068241,
          "fidelity_final": 0,
          "drift_slope_b": 0.3280124880721933,
          "drift_a": 0.102942406101274
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2586153300734055,
          "fidelity_final": 0,
          "drift_slope_b": 0.003233743663144941,
          "drift_a": 0.25605436422737304
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.2614583303855636,
          "fidelity_final": 0,
          "drift_slope_b": 0.35927187172494507,
          "drift_a": 0.09379749251376682
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.2539086224600806,
          "fidelity_final": 0,
          "drift_slope_b": 0.12676584592339235,
          "drift_a": 0.17689082678715412
        }
      }
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.2164425016983385,
          "fidelity_final": 0.3769228082994477,
          "drift_slope_b": -0.002329360444830523,
          "drift_a": 0.21790485784843866
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.2557504234277882,
          "fidelity_final": 0,
          "drift_slope_b": 0.17872743085432952,
          "drift_a": 0.16203824512632375
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.26139970060789086,
          "fidelity_final": 0.021994634938894482,
          "drift_slope_b": 0.3656112108716733,
          "drift_a": 0.08848103623300924
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2496242452113135,
          "fidelity_final": 0.0748248487814261,
          "drift_slope_b": -0.013055925863498545,
          "drift_a": 0.27004978530806356
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.2633229037709122,
          "fidelity_final": 0.01699850460727819,
          "drift_slope_b": 0.42239658657981943,
          "drift_a": 0.0762321662966633
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.2598851884500412,
          "fidelity_final": 0,
          "drift_slope_b": 0.1058296321042347,
          "drift_a": 0.18616578539920592
        }
      }
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.11661637361137907,
          "fidelity_final": 0.8278367426016927,
          "drift_slope_b": 0.027640775742494104,
          "drift_a": 0.10818259528850753
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.12445122297459896,
          "fidelity_final": 0.8040577190615922,
          "drift_slope_b": 0.16054372272164566,
          "drift_a": 0.07477012249903946
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.1168997198460949,
          "fidelity_final": 0.827355186746948,
          "drift_slope_b": 0.13349458942954964,
          "drift_a": 0.07462149242249434
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.1526289718953764,
          "fidelity_final": 0.7052982862011515,
          "drift_slope_b": 0.09639504809694643,
          "drift_a": 0.11441821849629252
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.09583036856996514,
          "fidelity_final": 0.8837926017826778,
          "drift_slope_b": 0.08500580373506676,
          "drift_a": 0.07133548673491069
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.14253875575662872,
          "fidelity_final": 0.7412154808980416,
          "drift_slope_b": 0.0710930238573458,
          "drift_a": 0.11468497844843027
        }
      }
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.16493069619762332,
          "fidelity_final": 0.6576761700348946,
          "drift_slope_b": 0.4316278467003142,
          "drift_a": 0.043083158874692495
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.13000857646228095,
          "fidelity_final": 0.7862843090857632,
          "drift_slope_b": 0.3802807439443761,
          "drift_a": 0.04062598102524175
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.15239999335009258,
          "fidelity_final": 0.7102747428279139,
          "drift_slope_b": 0.417507000526687,
          "drift_a": 0.04082350330463764
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.16117455898538646,
          "fidelity_final": 0.6733210868072442,
          "drift_slope_b": 0.4323581068836872,
          "drift_a": 0.04218526224439334
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.15094827100265337,
          "fidelity_final": 0.7166938209158512,
          "drift_slope_b": 0.4776295620670016,
          "drift_a": 0.03295941804125148
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.15657855660113712,
          "fidelity_final": 0.6922204399009414,
          "drift_slope_b": 0.405763060786028,
          "drift_a": 0.044502238445635015
        }
      }
    },
    {
      "domain": "synthetic_ar1",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.21696434349543822,
          "fidelity_final": 0.38867437016420997,
          "drift_slope_b": 0.3082224294053655,
          "drift_a": 0.08137813906571995
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.18129831799481264,
          "fidelity_final": 0.5760111847544173,
          "drift_slope_b": 0.33555475611184726,
          "drift_a": 0.06330193559243164
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.21510134168376832,
          "fidelity_final": 0.3978514168926968,
          "drift_slope_b": 0.3010514378115202,
          "drift_a": 0.08390182796857008
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2171887233390049,
          "fidelity_final": 0.3872483669303127,
          "drift_slope_b": 0.29289863815832046,
          "drift_a": 0.0834985562270857
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.19692920344975245,
          "fidelity_final": 0.502627991085391,
          "drift_slope_b": 0.37544231349229273,
          "drift_a": 0.06348002915398804
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.21467388979334556,
          "fidelity_final": 0.4055779635367671,
          "drift_slope_b": 0.29578309237555056,
          "drift_a": 0.08364351818170486
        }
      }
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.4063322739801214,
          "fidelity_final": 0.2793435807079783,
          "drift_slope_b": 0.006273606315791,
          "drift_a": 1.3828082675880362
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.3966826282445253,
          "fidelity_final": 0.30198510256244143,
          "drift_slope_b": 0.18784161137970729,
          "drift_a": 1.0741690109107476
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.447224949962275,
          "fidelity_final": 0.15801840527295752,
          "drift_slope_b": 0.007745030986104181,
          "drift_a": 1.4855532707806058
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.5004542059180133,
          "fidelity_final": 0,
          "drift_slope_b": -0.0469422017937688,
          "drift_a": 1.6986188222714023
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.448533106965405,
          "fidelity_final": 0.15044130714819243,
          "drift_slope_b": 0.05049725435421031,
          "drift_a": 1.3514254083226755
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4947507338524264,
          "fidelity_final": 0,
          "drift_slope_b": 0.18782995033007327,
          "drift_a": 0.90944749685603
        }
      }
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.406138522653632,
          "fidelity_final": 0.27979605643513505,
          "drift_slope_b": -0.045570078258167855,
          "drift_a": 1.5903807607734166
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 2.067593186512479,
          "fidelity_final": 0,
          "drift_slope_b": 0.3991208359496022,
          "drift_a": 0.5794540053161027
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.363572256099614,
          "fidelity_final": 0.37695822884076324,
          "drift_slope_b": 0.2702065372629959,
          "drift_a": 0.8993611588797162
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4091165138255795,
          "fidelity_final": 0.29132237131552857,
          "drift_slope_b": -0.0999090142212833,
          "drift_a": 2.017372632810712
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.3765859656560462,
          "fidelity_final": 0.3436575576458376,
          "drift_slope_b": 0.2435562447422062,
          "drift_a": 0.9169165305904439
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.5844565562877293,
          "fidelity_final": 0,
          "drift_slope_b": 0.21090379292843844,
          "drift_a": 0.8524631476364356
        }
      }
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.3292786057012067,
          "fidelity_final": 0.428514153300751,
          "drift_slope_b": 0.03607560098781257,
          "drift_a": 1.2050346876232036
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.3414699878959389,
          "fidelity_final": 0.47828835681975546,
          "drift_slope_b": 0.20391682613139145,
          "drift_a": 0.719764559695041
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.1338073019401338,
          "fidelity_final": 0.7959376790101048,
          "drift_slope_b": 0.15162733358453423,
          "drift_a": 0.6833707378371894
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.465487190787449,
          "fidelity_final": 0.07252093395793666,
          "drift_slope_b": 0.06852115673060852,
          "drift_a": 1.2127657151810203
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.0307342857866548,
          "fidelity_final": 0.8151012930948929,
          "drift_slope_b": 0.27104437394874326,
          "drift_a": 0.41390264821364164
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4402066566232454,
          "fidelity_final": 0.18285184803749657,
          "drift_slope_b": 0.05516872409319428,
          "drift_a": 1.235191354687936
        }
      }
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 6.602008157067614,
          "fidelity_final": 0.033804346355986045,
          "drift_slope_b": 0.6866417395255571,
          "drift_a": 0.7967697042127067
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 4.649470631846491,
          "fidelity_final": 0.11807787869401935,
          "drift_slope_b": 0.5583612489975895,
          "drift_a": 0.8624848603195296
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 6.355322588953168,
          "fidelity_final": 0.10376166185226401,
          "drift_slope_b": 0.6908878897334103,
          "drift_a": 0.7497461848840241
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 6.285713835577112,
          "fidelity_final": 0.009603355418451451,
          "drift_slope_b": 0.6687507707826033,
          "drift_a": 0.797288726250863
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 6.8540147962736615,
          "fidelity_final": 0.1097781133355987,
          "drift_slope_b": 0.7377678052256798,
          "drift_a": 0.6918952186829617
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 5.934636141677572,
          "fidelity_final": 0.08167251918843019,
          "drift_slope_b": 0.6527619722297786,
          "drift_a": 0.7930647158552113
        }
      }
    },
    {
      "domain": "synthetic_seasonal",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.498996049572703,
          "fidelity_final": 0.01270138037257949,
          "drift_slope_b": 0.10387451306809516,
          "drift_a": 1.12800757531681
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.5567101109640653,
          "fidelity_final": 0,
          "drift_slope_b": 0.28784740026204575,
          "drift_a": 0.705435939052044
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.5278869247354203,
          "fidelity_final": 0.020193904723919007,
          "drift_slope_b": 0.08588803562757381,
          "drift_a": 1.2283182302547062
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.5460666072892508,
          "fidelity_final": 0.0020288756755873875,
          "drift_slope_b": 0.11606698648005365,
          "drift_a": 1.103395645622863
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.5361867594806227,
          "fidelity_final": 0,
          "drift_slope_b": 0.31581304980814184,
          "drift_a": 0.7154249399748576
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.487849601557341,
          "fidelity_final": 0.015945235748424606,
          "drift_slope_b": 0.11104374831735588,
          "drift_a": 1.1036986281121943
        }
      }
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.08625287796047999,
          "fidelity_final": 0.4390052509791931,
          "drift_slope_b": 0.01835987333462459,
          "drift_a": 0.08207343569157713
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.10230441267384083,
          "fidelity_final": 0,
          "drift_slope_b": 0.03489714556820066,
          "drift_a": 0.09353067331012221
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.10523214830287254,
          "fidelity_final": 0,
          "drift_slope_b": 0.23313063891888555,
          "drift_a": 0.054986383439700214
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.10121728463734805,
          "fidelity_final": 0,
          "drift_slope_b": 0.024583863399609197,
          "drift_a": 0.0950508289253815
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.10784065795356067,
          "fidelity_final": 0,
          "drift_slope_b": 0.2930795821743765,
          "drift_a": 0.045238179086687494
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.09964493245548527,
          "fidelity_final": 0.015623912795903869,
          "drift_slope_b": 0.05340959116843153,
          "drift_a": 0.08642713296621551
        }
      }
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.08624115579140292,
          "fidelity_final": 0.43920459766490194,
          "drift_slope_b": -0.023790500752635346,
          "drift_a": 0.09199600671591787
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.10321684916431222,
          "fidelity_final": 0,
          "drift_slope_b": 0.12807840867555323,
          "drift_a": 0.07392219296472177
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.10686472725103363,
          "fidelity_final": 0,
          "drift_slope_b": 0.2729084420055241,
          "drift_a": 0.04872794463520274
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.10112569814068169,
          "fidelity_final": 0,
          "drift_slope_b": -0.005681156348421558,
          "drift_a": 0.10463459867058994
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.1047126968729009,
          "fidelity_final": 0.06858190803951153,
          "drift_slope_b": 0.29190184105787315,
          "drift_a": 0.0430453810731236
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.10130732518021292,
          "fidelity_final": 0,
          "drift_slope_b": 0.0330494971997741,
          "drift_a": 0.09267778632945543
        }
      }
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.0646105300104114,
          "fidelity_final": 0.7127749214662664,
          "drift_slope_b": 0.08130085244518655,
          "drift_a": 0.05179676302913953
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.06464052371314473,
          "fidelity_final": 0.7121409091514006,
          "drift_slope_b": 0.14164333066474127,
          "drift_a": 0.04273198730656376
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.05929207744198959,
          "fidelity_final": 0.7606494026276838,
          "drift_slope_b": 0.06753896626298092,
          "drift_a": 0.04724785752587041
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.0762289641611673,
          "fidelity_final": 0.5898260328020423,
          "drift_slope_b": 0.14525653097027766,
          "drift_a": 0.04996817560733892
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.032235553138827554,
          "fidelity_final": 0.9327345632360171,
          "drift_slope_b": 0.09565704492493962,
          "drift_a": 0.024734628705566798
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.05987415116131082,
          "fidelity_final": 0.773042059501191,
          "drift_slope_b": 0.27928680026166797,
          "drift_a": 0.026145762025293704
        }
      }
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.07133197854375387,
          "fidelity_final": 0.6998685207196195,
          "drift_slope_b": 0.5074655262359684,
          "drift_a": 0.014869673003100691
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.06160203021869943,
          "fidelity_final": 0.759246859790264,
          "drift_slope_b": 0.4341772372543133,
          "drift_a": 0.01659751458507544
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.07678628429574694,
          "fidelity_final": 0.6489252835696856,
          "drift_slope_b": 0.4087337236665682,
          "drift_a": 0.021514620461495368
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.07269292069885107,
          "fidelity_final": 0.6797059978359257,
          "drift_slope_b": 0.46899429974872886,
          "drift_a": 0.017373697581244935
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.0717058503482784,
          "fidelity_final": 0.7049404402039975,
          "drift_slope_b": 0.5992050919489381,
          "drift_a": 0.010886408230279757
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.06535264021978693,
          "fidelity_final": 0.7393990733251163,
          "drift_slope_b": 0.477557513273268,
          "drift_a": 0.014994670189453805
        }
      }
    },
    {
      "domain": "synthetic_powerlaw",
      "domainClass": "synthetic",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 0.06001003843371336,
          "fidelity_final": 0.8380425675797201,
          "drift_slope_b": 0.4315222430483738,
          "drift_a": 0.015199240805011952
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.04708523289623729,
          "fidelity_final": 0.8998076337595822,
          "drift_slope_b": 0.3917614381454868,
          "drift_a": 0.012777539729593775
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.05999635114307079,
          "fidelity_final": 0.832160054921405,
          "drift_slope_b": 0.5374335918958543,
          "drift_a": 0.011427240030674777
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.05801066475225151,
          "fidelity_final": 0.8453286558137652,
          "drift_slope_b": 0.32792967969652714,
          "drift_a": 0.019616477027911163
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.05189719724072592,
          "fidelity_final": 0.8775781680677559,
          "drift_slope_b": 0.6424634587641558,
          "drift_a": 0.0070363318540789
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.05876514951623407,
          "fidelity_final": 0.8433599786798675,
          "drift_slope_b": 0.4159124909024459,
          "drift_a": 0.015463707481025095
        }
      }
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 8.684487529531905,
          "fidelity_final": 0.24859382149205606,
          "drift_slope_b": 0.0068063259508972076,
          "drift_a": 8.526856246602186
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 8.994410514840311,
          "fidelity_final": 0,
          "drift_slope_b": -0.0029015009284396437,
          "drift_a": 9.132971756619972
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 9.236428952373238,
          "fidelity_final": 0,
          "drift_slope_b": 0.27377279481828354,
          "drift_a": 4.378501940745277
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.980395487255244,
          "fidelity_final": 0,
          "drift_slope_b": -0.02300034263253372,
          "drift_a": 9.591977750425901
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 10.302461962094018,
          "fidelity_final": 0,
          "drift_slope_b": 0.5658823956767683,
          "drift_a": 1.8403853301668769
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 9.02735380624432,
          "fidelity_final": 0,
          "drift_slope_b": 0.04784571908139463,
          "drift_a": 7.850846632680785
        }
      }
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 8.683306589011142,
          "fidelity_final": 0.24910691330368595,
          "drift_slope_b": -0.04481857099485208,
          "drift_a": 9.800948347787779
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 9.085956021008746,
          "fidelity_final": 0,
          "drift_slope_b": 0.03426391262282232,
          "drift_a": 8.379536548258303
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 9.451320175202872,
          "fidelity_final": 0,
          "drift_slope_b": 0.3737048608537853,
          "drift_a": 3.311857551475184
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.90435853072171,
          "fidelity_final": 0.12637039866511154,
          "drift_slope_b": -0.09366719780372876,
          "drift_a": 11.751685566851833
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 9.12093422622375,
          "fidelity_final": 0.2175751792375297,
          "drift_slope_b": 0.586640199290101,
          "drift_a": 1.483375477914223
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 9.037106514657264,
          "fidelity_final": 0,
          "drift_slope_b": -0.013654615731407038,
          "drift_a": 9.1602511212674
        }
      }
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 2.9943826806699225,
          "fidelity_final": 0.9425759061603063,
          "drift_slope_b": 0.07556063658750976,
          "drift_a": 2.4381368920433313
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 3.1606710184021707,
          "fidelity_final": 0.9358271131767129,
          "drift_slope_b": 0.2702662906058198,
          "drift_a": 1.3400945627632532
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 2.5934020692035293,
          "fidelity_final": 0.9578177910884874,
          "drift_slope_b": 0.10498891536618303,
          "drift_a": 1.7943485948353732
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 3.7627671895670436,
          "fidelity_final": 0.9112928512177358,
          "drift_slope_b": 0.15063303197368952,
          "drift_a": 2.4097143754739463
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.9982589983513351,
          "fidelity_final": 0.9937955296718027,
          "drift_slope_b": 0.29647701466109116,
          "drift_a": 0.3697707756262978
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.413506410956119,
          "fidelity_final": 0.987494943501347,
          "drift_slope_b": 0.059936964189310174,
          "drift_a": 1.183555124382585
        }
      }
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 228.12734706777172,
          "fidelity_final": 0,
          "drift_slope_b": 0.7027294371407242,
          "drift_a": 26.246329272890637
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 159.53517605094564,
          "fidelity_final": 0.055542866724133194,
          "drift_slope_b": 0.5587864353469029,
          "drift_a": 29.605304646298407
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 221.0706782168654,
          "fidelity_final": 0.039925077444224986,
          "drift_slope_b": 0.705501147691272,
          "drift_a": 24.99843095009991
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 215.6966098631634,
          "fidelity_final": 0,
          "drift_slope_b": 0.683116020072922,
          "drift_a": 26.15177871121897
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 239.3528866168971,
          "fidelity_final": 0.004973863992131378,
          "drift_slope_b": 0.745554461793076,
          "drift_a": 23.63387836065435
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 205.22938386664492,
          "fidelity_final": 0.0360996434961524,
          "drift_slope_b": 0.6675773613438879,
          "drift_a": 26.221162690692733
        }
      }
    },
    {
      "domain": "env_co2_proxy",
      "domainClass": "environmental",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 1.4282525795613636,
          "fidelity_final": 0.9872349557377245,
          "drift_slope_b": 0.10115705355181007,
          "drift_a": 1.0894764732155866
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.4937678574787043,
          "fidelity_final": 0.9860750354924701,
          "drift_slope_b": 0.29088463796303565,
          "drift_a": 0.6759521129697315
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4296990250631338,
          "fidelity_final": 0.9872369215378317,
          "drift_slope_b": 0.07193215537729765,
          "drift_a": 1.2138262435132359
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4504170027711296,
          "fidelity_final": 0.9869340060257642,
          "drift_slope_b": 0.10301820882701324,
          "drift_a": 1.0896780877035606
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4645359114231895,
          "fidelity_final": 0.9866155890665161,
          "drift_slope_b": 0.3255399054049723,
          "drift_a": 0.672647872652306
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4318556207839765,
          "fidelity_final": 0.9871761910054976,
          "drift_slope_b": 0.11189852041463468,
          "drift_a": 1.0624770303622966
        }
      }
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "scaling",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 37.181593451649675,
          "fidelity_final": 0.055126951317336095,
          "drift_slope_b": 0.07871491497374661,
          "drift_a": 30.04165000449574
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 37.24831795299257,
          "fidelity_final": 0,
          "drift_slope_b": 0.0537751932965554,
          "drift_a": 32.25703994549414
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 37.30350088681332,
          "fidelity_final": 0,
          "drift_slope_b": 0.25743362209433646,
          "drift_a": 18.231841837738166
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 37.25846891860438,
          "fidelity_final": 0,
          "drift_slope_b": -0.07443552844852931,
          "drift_a": 45.76398592482972
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 39.564417640144946,
          "fidelity_final": 0,
          "drift_slope_b": 0.539260354971536,
          "drift_a": 8.387884901840271
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 38.96340996135842,
          "fidelity_final": 0,
          "drift_slope_b": 0.5173871916274483,
          "drift_a": 8.762997571593454
        }
      }
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_weighting",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 37.181525135168,
          "fidelity_final": 0.05515766878144648,
          "drift_slope_b": 0.08298760635967453,
          "drift_a": 29.69443308914476
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 37.24254049258484,
          "fidelity_final": 0.010179939211919849,
          "drift_slope_b": 0.13578163641163263,
          "drift_a": 25.995279826341445
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 37.30380329755612,
          "fidelity_final": 0,
          "drift_slope_b": 0.3347495241319519,
          "drift_a": 14.451325704281036
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 34.655796294053204,
          "fidelity_final": 0.7099096098898816,
          "drift_slope_b": -0.11337180643280002,
          "drift_a": 51.8964968597184
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 39.24572724355449,
          "fidelity_final": 0,
          "drift_slope_b": 0.643247278469766,
          "drift_a": 5.68604660749275
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 38.46620149003335,
          "fidelity_final": 0,
          "drift_slope_b": 0.6029000868784193,
          "drift_a": 6.259720189454889
        }
      }
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "hierarchical_resolution",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 4.904589043109682,
          "fidelity_final": 0.9906409030013866,
          "drift_slope_b": 0.04153374667324599,
          "drift_a": 4.380699072962791
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 5.2736904883731075,
          "fidelity_final": 0.9892520669109199,
          "drift_slope_b": 0.32741259143601414,
          "drift_a": 1.7697872894515538
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 4.356435109018754,
          "fidelity_final": 0.9926610871280289,
          "drift_slope_b": 0.22585037003140235,
          "drift_a": 1.9893543620567204
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.571418750885133,
          "fidelity_final": 0.986282668712443,
          "drift_slope_b": 0.2567480019569805,
          "drift_a": 3.621037457106369
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 2.910142716060899,
          "fidelity_final": 0.9967117817668809,
          "drift_slope_b": 0.12084074455564806,
          "drift_a": 1.917701032075981
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 6.733194755794986,
          "fidelity_final": 0.9827832405341361,
          "drift_slope_b": 0.2603992170601756,
          "drift_a": 2.819734512544102
        }
      }
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_feedback",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 45.110445597092095,
          "fidelity_final": 0.5534607842654092,
          "drift_slope_b": 0.6969902352349945,
          "drift_a": 5.276189456604493
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 31.723057772449106,
          "fidelity_final": 0.71154882470533,
          "drift_slope_b": 0.5572237551282762,
          "drift_a": 5.902793003996489
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 43.84677907918801,
          "fidelity_final": 0.5582916285471861,
          "drift_slope_b": 0.7009045928780295,
          "drift_a": 5.021572297704928
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 42.697361492294014,
          "fidelity_final": 0.5747721471040507,
          "drift_slope_b": 0.6799693477231498,
          "drift_a": 5.221155659426619
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 47.18076501323358,
          "fidelity_final": 0.5313880488209608,
          "drift_slope_b": 0.7412205664762861,
          "drift_a": 4.717226623063593
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 40.76557833659595,
          "fidelity_final": 0.5929211206476088,
          "drift_slope_b": 0.6608521107718248,
          "drift_a": 5.308266133984544
        }
      }
    },
    {
      "domain": "astro_sunspot_proxy",
      "domainClass": "astronomical",
      "mechanism": "recursive_compression",
      "arms": {
        "baseline": {
          "c": 1,
          "rfd_final": 26.03908848851216,
          "fidelity_final": 0.7342389910799432,
          "drift_slope_b": 0.8571809235263701,
          "drift_a": 1.6701685747601127
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 14.162389218628363,
          "fidelity_final": 0.9218639267135122,
          "drift_slope_b": 0.757444700462425,
          "drift_a": 1.1933611542409661
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 24.99816183942007,
          "fidelity_final": 0.7569086424964373,
          "drift_slope_b": 0.868535353426116,
          "drift_a": 1.5476839717190471
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 25.36629973215402,
          "fidelity_final": 0.7439958272435812,
          "drift_slope_b": 0.8475748605135441,
          "drift_a": 1.675342559764998
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 15.67821281275262,
          "fidelity_final": 0.9049965978254362,
          "drift_slope_b": 0.8129821493623444,
          "drift_a": 1.130238647533005
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 24.66322193568098,
          "fidelity_final": 0.7620322984186378,
          "drift_slope_b": 0.8483872001124236,
          "drift_a": 1.6211278390438082
        }
      }
    }
  ],
  "scoreboard": {
    "mechanism_winners": {
      "scaling": "baseline",
      "recursive_weighting": "e",
      "hierarchical_resolution": "random_0",
      "recursive_feedback": "egs",
      "recursive_compression": "egs"
    },
    "egs_mechanism_wins": 2,
    "baseline_mechanism_wins": 1,
    "n_mechanisms": 5,
    "mean_final_rfd_by_arm": {
      "baseline": 13.83817328521487,
      "egs": 10.715452903499015,
      "sqrt2": 13.537974871731501,
      "e": 13.410009610429938,
      "random_0": 14.024151615385602,
      "random_1": 13.012336404019235
    },
    "lowest_mean_rfd_arm": "egs"
  },
  "pass": true,
  "interpretation": "Identical recursion/evaluator; only nest ratio c differs. Scoreboard reports mechanism-class winners — suite pass does not crown Φ.",
  "honesty": "Proxy fixtures; V3 nest grammar replaces V2 sin geometry."
}
```

### E2_blind_constant_ladder — Blind constant ladder (φ unlabeled · mean RFD over all mechanisms)

- **Pass:** `true`
- **Interpretation:** If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.
- **Honesty:** Single-series blind ladder is illustrative; multi-domain aggregation is the real test.

```json
{
  "id": "E2_blind_constant_ladder",
  "title": "Blind constant ladder (φ unlabeled · mean RFD over all mechanisms)",
  "mechanism": "all_mechanisms_mean",
  "results": [
    {
      "c": 1,
      "rfd_final": 2.0472090933237004,
      "slope_b": 0.1920445550473388,
      "is_phi": false
    },
    {
      "c": 1.41421356237,
      "rfd_final": 2.1901311102361176,
      "slope_b": 0.4355835672378964,
      "is_phi": false
    },
    {
      "c": 1.5,
      "rfd_final": 1.9898668484571516,
      "slope_b": 0.2545866241640323,
      "is_phi": false
    },
    {
      "c": 1.618033988749895,
      "rfd_final": 2.0000252820496494,
      "slope_b": 0.42742664785864226,
      "is_phi": true
    },
    {
      "c": 1.7,
      "rfd_final": 1.9572714953515162,
      "slope_b": 0.22893305237506584,
      "is_phi": false
    },
    {
      "c": 2,
      "rfd_final": 2.074415885035902,
      "slope_b": 0.24197250444794222,
      "is_phi": false
    },
    {
      "c": 2.718281828459045,
      "rfd_final": 2.0711801482298227,
      "slope_b": 0.1831234222243746,
      "is_phi": false
    }
  ],
  "ranked_c": [
    1.7,
    1.5,
    1.618033988749895,
    1,
    2.718281828459045,
    2,
    1.41421356237
  ],
  "phi_rank_by_lowest_rfd": 3,
  "pass": true,
  "interpretation": "If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.",
  "honesty": "Single-series blind ladder is illustrative; multi-domain aggregation is the real test."
}
```

### E3_constant_sweep — Continuous Drift(c) sweep with train/hold split (all mechanisms)

- **Pass:** `true`
- **Interpretation:** Pronounced minimum near φ on held-out kinds would be interesting; absence falsifies the strong claim for this mechanism/fixture set.
- **Honesty:** Sweep minima are fixture-relative; do not promote to CODATA.

```json
{
  "id": "E3_constant_sweep",
  "title": "Continuous Drift(c) sweep with train/hold split (all mechanisms)",
  "mechanism": "all_mechanisms_mean",
  "HOLD_OUT_FRACTION": 0.25,
  "train_min": {
    "c": 1.35,
    "rfd": 7.878394760800167
  },
  "hold_min": {
    "c": 1.025,
    "rfd": 8.501557256713514
  },
  "train_min_near_phi": false,
  "hold_min_near_phi": false,
  "train_curve_sample": [
    {
      "c": 1,
      "rfd": 10.607517028856341
    },
    {
      "c": 1.125,
      "rfd": 11.345764605492672
    },
    {
      "c": 1.25,
      "rfd": 8.25559115808456
    },
    {
      "c": 1.375,
      "rfd": 10.605381674844564
    },
    {
      "c": 1.5,
      "rfd": 10.097733998504566
    },
    {
      "c": 1.625,
      "rfd": 9.5163277087437
    },
    {
      "c": 1.75,
      "rfd": 8.110686172105321
    },
    {
      "c": 1.875,
      "rfd": 10.829364764298067
    },
    {
      "c": 2,
      "rfd": 10.63478316050886
    },
    {
      "c": 2.125,
      "rfd": 9.775075365918331
    },
    {
      "c": 2.25,
      "rfd": 9.009666999814828
    },
    {
      "c": 2.375,
      "rfd": 11.508605229656492
    },
    {
      "c": 2.5,
      "rfd": 11.473381735423361
    }
  ],
  "hold_curve_sample": [
    {
      "c": 1,
      "rfd": 13.410708911617878
    },
    {
      "c": 1.125,
      "rfd": 11.007091780546595
    },
    {
      "c": 1.25,
      "rfd": 12.705140678205225
    },
    {
      "c": 1.375,
      "rfd": 13.735125409674911
    },
    {
      "c": 1.5,
      "rfd": 13.20454441581678
    },
    {
      "c": 1.625,
      "rfd": 12.519398373339872
    },
    {
      "c": 1.75,
      "rfd": 12.531458597474156
    },
    {
      "c": 1.875,
      "rfd": 13.523870565088004
    },
    {
      "c": 2,
      "rfd": 13.552563576392043
    },
    {
      "c": 2.125,
      "rfd": 12.909536157271173
    },
    {
      "c": 2.25,
      "rfd": 12.971994173378864
    },
    {
      "c": 2.375,
      "rfd": 14.623005056551516
    },
    {
      "c": 2.5,
      "rfd": 14.08612657261624
    }
  ],
  "pass": true,
  "interpretation": "Pronounced minimum near φ on held-out kinds would be interesting; absence falsifies the strong claim for this mechanism/fixture set.",
  "honesty": "Sweep minima are fixture-relative; do not promote to CODATA."
}
```

### E4_drift_slope — Drift slope contrast (power-law RFD ≈ a n^b)

- **Pass:** `true`
- **Interpretation:** Hypothesis interest is whether φ changes error-accumulation exponent — not only generation-1 RMSE.
- **Honesty:** Power-law fit is a pre-registered summary, not proof of a bounded attractor.

```json
{
  "id": "E4_drift_slope",
  "title": "Drift slope contrast (power-law RFD ≈ a n^b)",
  "mechanism": "recursive_compression",
  "arms": {
    "baseline": {
      "c": 1,
      "slope": {
        "a": 0.2001072958770016,
        "b": 0.01360883139636136,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd": 0.21198527354870497,
          "F": 0.047276121986196004
        },
        {
          "n": 2,
          "rfd": 0.19585492009697733,
          "F": 0.42100830361051356
        },
        {
          "n": 3,
          "rfd": 0.20494247358226497,
          "F": 0.14811385664636254
        },
        {
          "n": 4,
          "rfd": 0.2050033031707224,
          "F": 0.15122577656067235
        },
        {
          "n": 5,
          "rfd": 0.20608056110010783,
          "F": 0.10260122947600223
        },
        {
          "n": 6,
          "rfd": 0.2065071827017502,
          "F": 0.08047281110329417
        },
        {
          "n": 7,
          "rfd": 0.20688138911056933,
          "F": 0.05921350324187171
        },
        {
          "n": 8,
          "rfd": 0.20712581014689635,
          "F": 0.044391175645634315
        },
        {
          "n": 9,
          "rfd": 0.207301319549616,
          "F": 0.03332800989160253
        },
        {
          "n": 10,
          "rfd": 0.20742140397583284,
          "F": 0.025552971639942117
        },
        {
          "n": 11,
          "rfd": 0.20750415816536003,
          "F": 0.020130393480615176
        },
        {
          "n": 12,
          "rfd": 0.2075608346234723,
          "F": 0.016432409120452674
        },
        {
          "n": 13,
          "rfd": 0.20760003858982773,
          "F": 0.013943383884203187
        },
        {
          "n": 14,
          "rfd": 0.2076277002740938,
          "F": 0.01228818807300602
        },
        {
          "n": 15,
          "rfd": 0.20764795591252524,
          "F": 0.011193193094278884
        },
        {
          "n": 16,
          "rfd": 0.20766361460238747,
          "F": 0.010465270337928443
        },
        {
          "n": 17,
          "rfd": 0.20767656529978273,
          "F": 0.009970335927160767
        },
        {
          "n": 18,
          "rfd": 0.20768805879302063,
          "F": 0.009617197919107751
        },
        {
          "n": 19,
          "rfd": 0.2076989110935091,
          "F": 0.009345013962758126
        },
        {
          "n": 20,
          "rfd": 0.2077096437865069,
          "F": 0.009114096728149062
        },
        {
          "n": 21,
          "rfd": 0.207720580262219,
          "F": 0.008899293323925965
        },
        {
          "n": 22,
          "rfd": 0.20773191078306358,
          "F": 0.008685331143576521
        },
        {
          "n": 23,
          "rfd": 0.207743736263994,
          "F": 0.008463595296032607
        },
        {
          "n": 24,
          "rfd": 0.2077560976693827,
          "F": 0.00822992342688382
        }
      ]
    },
    "egs": {
      "c": 1.618033988749895,
      "slope": {
        "a": 0.18964851424120407,
        "b": 0.03188477803025934,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd": 0.1985630636263423,
          "F": 0.2902151428796113
        },
        {
          "n": 2,
          "rfd": 0.18960212771006166,
          "F": 0.42825960256909135
        },
        {
          "n": 3,
          "rfd": 0.19680780009899587,
          "F": 0.3269179122158743
        },
        {
          "n": 4,
          "rfd": 0.1981596052183119,
          "F": 0.31800286755662543
        },
        {
          "n": 5,
          "rfd": 0.20012918498869303,
          "F": 0.28659298505065334
        },
        {
          "n": 6,
          "rfd": 0.20162582574294174,
          "F": 0.2570819098502855
        },
        {
          "n": 7,
          "rfd": 0.20294215233444285,
          "F": 0.22301677233725922
        },
        {
          "n": 8,
          "rfd": 0.2040263604155224,
          "F": 0.18844388709174997
        },
        {
          "n": 9,
          "rfd": 0.20491172837767205,
          "F": 0.15501821685338227
        },
        {
          "n": 10,
          "rfd": 0.20561997133559407,
          "F": 0.12447759695910061
        },
        {
          "n": 11,
          "rfd": 0.20617818705742658,
          "F": 0.09771417899827714
        },
        {
          "n": 12,
          "rfd": 0.20661148671636767,
          "F": 0.07506509641710206
        },
        {
          "n": 13,
          "rfd": 0.20694274112214353,
          "F": 0.056446636275018586
        },
        {
          "n": 14,
          "rfd": 0.20719182859891397,
          "F": 0.041535854841426634
        },
        {
          "n": 15,
          "rfd": 0.20737563991848063,
          "F": 0.02989199717540177
        },
        {
          "n": 16,
          "rfd": 0.20750825551622157,
          "F": 0.021036373341124088
        },
        {
          "n": 17,
          "rfd": 0.20760124686702655,
          "F": 0.014498652953889364
        },
        {
          "n": 18,
          "rfd": 0.20766400959058495,
          "F": 0.009842403567691844
        },
        {
          "n": 19,
          "rfd": 0.20770409221400143,
          "F": 0.0066779177499724715
        },
        {
          "n": 20,
          "rfd": 0.20772749922782488,
          "F": 0.004667402511024574
        },
        {
          "n": 21,
          "rfd": 0.2077389597947919,
          "F": 0.0035254248009367085
        },
        {
          "n": 22,
          "rfd": 0.2077421598037261,
          "F": 0.0030163672931845763
        },
        {
          "n": 23,
          "rfd": 0.20773993862579782,
          "F": 0.0029500591886861163
        },
        {
          "n": 24,
          "rfd": 0.20773445372454935,
          "F": 0.0031764284447196836
        }
      ]
    },
    "sqrt2": {
      "c": 1.4142135623730951,
      "slope": {
        "a": 0.1977456357013454,
        "b": 0.018126523472341147,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd": 0.20176558564201688,
          "F": 0.24116559485133748
        },
        {
          "n": 2,
          "rfd": 0.1937023007960451,
          "F": 0.39735118674131226
        },
        {
          "n": 3,
          "rfd": 0.20178929568313986,
          "F": 0.2414858048093504
        },
        {
          "n": 4,
          "rfd": 0.20367523180221822,
          "F": 0.19540299047489812
        },
        {
          "n": 5,
          "rfd": 0.2055154627703146,
          "F": 0.12712127375090596
        },
        {
          "n": 6,
          "rfd": 0.20651733723140533,
          "F": 0.08112974713619124
        },
        {
          "n": 7,
          "rfd": 0.2071321200029919,
          "F": 0.04817689852566153
        },
        {
          "n": 8,
          "rfd": 0.20746259112927462,
          "F": 0.02777090994863659
        },
        {
          "n": 9,
          "rfd": 0.20762821702476789,
          "F": 0.015948767119634437
        },
        {
          "n": 10,
          "rfd": 0.20769823466923193,
          "F": 0.009920846299086548
        },
        {
          "n": 11,
          "rfd": 0.20771836249504,
          "F": 0.0073973806795884145
        },
        {
          "n": 12,
          "rfd": 0.20771563163484044,
          "F": 0.006772392450590384
        },
        {
          "n": 13,
          "rfd": 0.20770553311162795,
          "F": 0.006990612337936918
        },
        {
          "n": 14,
          "rfd": 0.2076962394382171,
          "F": 0.007431654217091819
        },
        {
          "n": 15,
          "rfd": 0.20769152819207415,
          "F": 0.007776904943188555
        },
        {
          "n": 16,
          "rfd": 0.20769260945613513,
          "F": 0.007899497102264369
        },
        {
          "n": 17,
          "rfd": 0.2076992766177055,
          "F": 0.007782771557751988
        },
        {
          "n": 18,
          "rfd": 0.20771061915573363,
          "F": 0.007465626226935904
        },
        {
          "n": 19,
          "rfd": 0.20772545986620305,
          "F": 0.007008385191857151
        },
        {
          "n": 20,
          "rfd": 0.2077426140175205,
          "F": 0.006473133019748314
        },
        {
          "n": 21,
          "rfd": 0.2077610314436272,
          "F": 0.005913686985266297
        },
        {
          "n": 22,
          "rfd": 0.20777986136928522,
          "F": 0.00537165748367057
        },
        {
          "n": 23,
          "rfd": 0.20779846772026203,
          "F": 0.004876066472055743
        },
        {
          "n": 24,
          "rfd": 0.20781641495252032,
          "F": 0.0044447962490152875
        }
      ]
    },
    "e": {
      "c": 2.718281828459045,
      "slope": {
        "a": 0.1990718911264508,
        "b": 0.014631568505838057,
        "ok": true
      },
      "rfd_curve": [
        {
          "n": 0,
          "rfd": 0,
          "F": 1
        },
        {
          "n": 1,
          "rfd": 0.20114890993748,
          "F": 0.23816346740963024
        },
        {
          "n": 2,
          "rfd": 0.19499093153753042,
          "F": 0.47216133719192505
        },
        {
          "n": 3,
          "rfd": 0.204156163305156,
          "F": 0.1880309988874658
        },
        {
          "n": 4,
          "rfd": 0.20436049744169765,
          "F": 0.1967234325236143
        },
        {
          "n": 5,
          "rfd": 0.20539650004586368,
          "F": 0.15089532632467026
        },
        {
          "n": 6,
          "rfd": 0.20576168680399518,
          "F": 0.13540477907951878
        },
        {
          "n": 7,
          "rfd": 0.20612633864362506,
          "F": 0.11396295466692313
        },
        {
          "n": 8,
          "rfd": 0.20638439600163305,
          "F": 0.09633131916776518
        },
        {
          "n": 9,
          "rfd": 0.20659538604514402,
          "F": 0.07979528807112664
        },
        {
          "n": 10,
          "rfd": 0.20675973470569686,
          "F": 0.06559103386487586
        },
        {
          "n": 11,
          "rfd": 0.20688964510448105,
          "F": 0.05346307282089944
        },
        {
          "n": 12,
          "rfd": 0.20699142345655078,
          "F": 0.04333792084232725
        },
        {
          "n": 13,
          "rfd": 0.2070711386071567,
          "F": 0.034945900157046544
        },
        {
          "n": 14,
          "rfd": 0.2071333816313343,
          "F": 0.02803003088327954
        },
        {
          "n": 15,
          "rfd": 0.20718188784590633,
          "F": 0.022340882558368896
        },
        {
          "n": 16,
          "rfd": 0.20721959232111747,
          "F": 0.01766350134946513
        },
        {
          "n": 17,
          "rfd": 0.20724881326217995,
          "F": 0.013816824697114333
        },
        {
          "n": 18,
          "rfd": 0.20727136768638518,
          "F": 0.010652122851135983
        },
        {
          "n": 19,
          "rfd": 0.20728867756664335,
          "F": 0.008048067729158214
        },
        {
          "n": 20,
          "rfd": 0.20730185332795328,
          "F": 0.005905917474105774
        },
        {
          "n": 21,
          "rfd": 0.20731176209768548,
          "F": 0.004145077757283998
        },
        {
          "n": 22,
          "rfd": 0.20731908203968966,
          "F": 0.002699435200522333
        },
        {
          "n": 23,
          "rfd": 0.20732434545871167,
          "F": 0.0015144213815244827
        },
        {
          "n": 24,
          "rfd": 0.20732797257356764,
          "F": 0.0005447202382250672
        }
      ]
    }
  },
  "pass": true,
  "interpretation": "Hypothesis interest is whether φ changes error-accumulation exponent — not only generation-1 RMSE.",
  "honesty": "Power-law fit is a pre-registered summary, not proof of a bounded attractor."
}
```

### E5_phi_not_assumed — Falsifiability lock — Φ is one arm among peers

- **Pass:** `true`
- **Interpretation:** Design question: does incorporating φ reduce cumulative fidelity drift vs identical recursion without φ / with decoys?
- **Honesty:** A null result is a valid scientific outcome for this suite.

```json
{
  "id": "E5_phi_not_assumed",
  "title": "Falsifiability lock — Φ is one arm among peers",
  "PRE_REGISTERED_HYPOTHESIS": {
    "claim": "If Φ_EGS reduces cumulative recursive fidelity drift vs matched controls, the advantage must appear across domains, mechanisms, decoy constants, and held-out series — without assuming Φ a priori.",
    "null_ok": true,
    "win_requires": [
      "lower cumulative RFD vs baseline at depth N",
      "advantage across ≥3 independent domains",
      "survives decoy constants (√2, e, blind ladder)",
      "survives held-out series",
      "not a single-metric fluke"
    ],
    "suite_pass_means": "Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won.",
    "anti_baseline_bias": "Baseline (c=1) must not inherit least-drift by construction via milder coarsening or null transforms."
  },
  "STANDALONE_REPO": "https://github.com/FractiAI/synthobs-egs-recursive-fidelity-test",
  "pass": true,
  "interpretation": "Design question: does incorporating φ reduce cumulative fidelity drift vs identical recursion without φ / with decoys?",
  "honesty": "A null result is a valid scientific outcome for this suite."
}
```

### E6_paper_locks — Paper presence + honesty / falsifiability locks

- **Pass:** `true`
- **Interpretation:** Paper must state controlled design and refuse Φ-assumed framing.
- **Honesty:** Structural lock only.

```json
{
  "id": "E6_paper_locks",
  "title": "Paper presence + honesty / falsifiability locks",
  "checks": {
    "hasHonesty": true,
    "hasDocId": true,
    "hasErft": true,
    "hasFalsifiable": true,
    "hasNotAssume": true,
    "hasFiveArm": true
  },
  "pass": true,
  "interpretation": "Paper must state controlled design and refuse Φ-assumed framing.",
  "honesty": "Structural lock only."
}
```

### E7_ship_blog_lock — Ship-blog magazine lock

- **Pass:** `true`
- **Interpretation:** Frontiersman magazine note required for paper ship.
- **Honesty:** Structural lock.

```json
{
  "id": "E7_ship_blog_lock",
  "title": "Ship-blog magazine lock",
  "SHIP_BLOG_SLUG": "erft-recursive-fidelity",
  "checks": {
    "exists": true,
    "hasHonestyRail": true,
    "hasErft": true
  },
  "pass": true,
  "interpretation": "Frontiersman magazine note required for paper ship.",
  "honesty": "Structural lock."
}
```

## Honesty boundary

ERFT V3 is a controlled, falsifiable recursive-fidelity protocol: nest-ratio partitions model catalog RSI grammar (V2 sin-geometry retired; V1 coarsening bias receipt). It does not assume Φ_EGS is correct, does not claim CODATA status, does not prove AGI safety, and does not upgrade Soft Story into unfinished physics. Suite pass = protocol integrity + reproducible fixtures; empirical Φ advantage is a measured outcome that may fail.
