# EGS Recursive Fidelity Test (ERFT) · Version Four — Engine-Grammar Scoreboard

**Document ID:** `WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25`
**Registry ID:** `synthobs-egs-recursive-fidelity-test-erft-2026-09`
**Protocol:** `ERFT-V4-2026-09-26`
**Generated:** 2026-09-26T05:19:18.618Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 11 / 11 |
| Φ_EGS (one arm) | 1.618033988749895 |
| Suite pass means | Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won. |

## Experiments

### E0_protocol_locks — Pre-registered protocol locks (φ not assumed · V2 anti-bias)

- **Pass:** `true`
- **Interpretation:** V4 freezes arms, mechanisms, depth, null-ok honesty, matched engine geometry, and nest-weight locks before reading outcomes.
- **Honesty:** Protocol lock ≠ physics proof.

```json
{
  "id": "E0_protocol_locks",
  "title": "Pre-registered protocol locks (φ not assumed · V2 anti-bias)",
  "PROTOCOL_VERSION": "ERFT-V4-2026-09-26",
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
    "version": 4,
    "rule": "Transform severity fixed; c selects nest partition weights only. Baseline = dyadic 1:1. Lags/blocks/period from generation-indexed engine grammar (k/81 · octaves · odd-prime vaults · uniform clutch Δ) — identical geometry across decoy constants at each generation.",
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
  "interpretation": "V4 freezes arms, mechanisms, depth, null-ok honesty, matched engine geometry, and nest-weight locks before reading outcomes.",
  "honesty": "Protocol lock ≠ physics proof."
}
```

### E0b_anti_baseline_bias — Anti-baseline-bias construction locks (V4 matched geometry)

- **Pass:** `true`
- **Interpretation:** Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.
- **Honesty:** Anti-bias lock ≠ Φ win. Empirical outcomes still free to null.

```json
{
  "id": "E0b_anti_baseline_bias",
  "title": "Anti-baseline-bias construction locks (V4 matched geometry)",
  "first_step_rfd": {
    "scaling": {
      "baseline": 1.0284606950961048,
      "egs": 0.8675504205046405,
      "sqrt2": 0.5974972646439739,
      "e": 0.6717064405019262
    },
    "recursive_weighting": {
      "baseline": 1.0284606950961048,
      "egs": 0.6627495473570182,
      "sqrt2": 0.5974972646439739,
      "e": 0.6717064405019262
    }
  },
  "hierarchical_ladder": [
    {
      "c": 1,
      "rfd": 1.3255348060845584
    },
    {
      "c": 1.41421356237,
      "rfd": 1.018672768412696
    },
    {
      "c": 1.5,
      "rfd": 1.2135113447322334
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.2002852488553035
    },
    {
      "c": 1.7,
      "rfd": 1.4157223683540987
    },
    {
      "c": 2,
      "rfd": 1.3187398026308617
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.4447665408812447
    }
  ],
  "compression_ladder": [
    {
      "c": 1,
      "rfd": 1.4806458705773866
    },
    {
      "c": 1.41421356237,
      "rfd": 1.5637521720148742
    },
    {
      "c": 1.5,
      "rfd": 1.5541745288399076
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.3981878902777116
    },
    {
      "c": 1.7,
      "rfd": 1.500035766663641
    },
    {
      "c": 2,
      "rfd": 1.4535275605106406
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.430602438789516
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
      "rfd": 2.941202531832791
    },
    {
      "name": "sqrt2",
      "c": 1.4142135623730951,
      "rfd": 3.722214927034024
    },
    {
      "name": "e",
      "c": 2.718281828459045,
      "rfd": 4.514894555857047
    }
  ],
  "scaling_first_step_spread_ratio": 1.7212810098953772,
  "severity_parity": {
    "hierarchical": {
      "lo": 0.594046594524572,
      "hi": 1.0662115620140298,
      "ratio": 1.794828169779075
    },
    "compression": {
      "lo": 0.43348631755567396,
      "hi": 0.9991339315261059,
      "ratio": 2.3048799721291875
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
    "phi_exact": true,
    "partition_sum": 1
  },
  "baseline_dyadic": {
    "wMajor": 0.5,
    "wMinor": 0.5,
    "dyadic": true,
    "phi_exact": false,
    "partition_sum": 1
  },
  "pass": true,
  "interpretation": "Φ satisfies whole:part ≈ part:remainder; baseline is dyadic 1:1; decoys use 1/c partition without V2 arbitrary phase.",
  "honesty": "Grammar lock ≠ Φ empirical win on fixtures."
}
```

### E0d_engine_grammar_lock — Engine grammar lock (k/81 · octaves · prime vaults · matched lags)

- **Pass:** `true`
- **Interpretation:** Each arm carries its own nest-ratio lags/blocks with vault×(c/Φ) severity normalization and uniform k/81 overlay.
- **Honesty:** Engine fixture lock ≠ Φ empirical win.

```json
{
  "id": "E0d_engine_grammar_lock",
  "title": "Engine grammar lock (k/81 · octaves · prime vaults · matched lags)",
  "CLUTCH_DELTA": 0.0017789887498949053,
  "k81_gen12": 0.14814814814814814,
  "octave_gen12": 20,
  "vault_gen12": 37,
  "lag_phi_vs_sqrt2": {
    "phi": {
      "la": 160,
      "lb": 221
    },
    "sqrt2": {
      "la": 183,
      "lb": 255
    }
  },
  "block_phi_vs_sqrt2": {
    "phi": {
      "b1": 3,
      "b2": 5
    },
    "sqrt2": {
      "b1": 3,
      "b2": 4
    }
  },
  "pass": true,
  "interpretation": "Each arm carries its own nest-ratio lags/blocks with vault×(c/Φ) severity normalization and uniform k/81 overlay.",
  "honesty": "Engine fixture lock ≠ Φ empirical win."
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
          "rfd_final": 0.20947942162920052,
          "fidelity_final": 0,
          "drift_slope_b": 0.08450832630412712,
          "drift_a": 0.16035978027663145
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.20816135604650643,
          "fidelity_final": 0.008873741658037516,
          "drift_slope_b": 0.04493462447133565,
          "drift_a": 0.18437906414362404
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20838743085800285,
          "fidelity_final": 0,
          "drift_slope_b": 0.01546154521819876,
          "drift_a": 0.20007969531657221
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20829119597443088,
          "fidelity_final": 0,
          "drift_slope_b": 0.05760257064114218,
          "drift_a": 0.17841448823250916
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.2081890085023824,
          "fidelity_final": 0.0005567005574279377,
          "drift_slope_b": 0.013764905859411243,
          "drift_a": 0.2006959356879419
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20842335764324682,
          "fidelity_final": 0,
          "drift_slope_b": 0.07655481248230987,
          "drift_a": 0.17044426925939293
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
          "rfd_final": 0.2100113535015242,
          "fidelity_final": 0,
          "drift_slope_b": 0.0403737754893703,
          "drift_a": 0.18071283682040662
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.20827093878851607,
          "fidelity_final": 0,
          "drift_slope_b": 0.1283619276577862,
          "drift_a": 0.14590417940027353
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20847865065813975,
          "fidelity_final": 0,
          "drift_slope_b": -0.03476822189262792,
          "drift_a": 0.2297701935461136
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20803800200014566,
          "fidelity_final": 0.038046848381875095,
          "drift_slope_b": 0.03514175146078903,
          "drift_a": 0.1900435558011735
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20808423355490105,
          "fidelity_final": 0.028269525863147228,
          "drift_slope_b": -0.04351271794688946,
          "drift_a": 0.23441869562227943
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.2081572636763841,
          "fidelity_final": 0.03216149881304864,
          "drift_slope_b": 0.059973534655313784,
          "drift_a": 0.17953799765904938
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
          "rfd_final": 0.2068164948962649,
          "fidelity_final": 0.11257011006278814,
          "drift_slope_b": 0.020612798161926744,
          "drift_a": 0.19505412609156378
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2061613275613985,
          "fidelity_final": 0.13700047376940708,
          "drift_slope_b": 0.01599977965316284,
          "drift_a": 0.19679639857851283
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20811097887809016,
          "fidelity_final": 0.025954256714513367,
          "drift_slope_b": 0.014183982929609342,
          "drift_a": 0.20007566954628941
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20506522312993986,
          "fidelity_final": 0.17073755368363136,
          "drift_slope_b": 0.02110136908576718,
          "drift_a": 0.1924328513749619
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20761894336251216,
          "fidelity_final": 0.07247535432097142,
          "drift_slope_b": 0.011970714971781711,
          "drift_a": 0.20088602741611933
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
          "rfd_final": 0.41098766561217964,
          "fidelity_final": 0,
          "drift_slope_b": 0.3837144524378997,
          "drift_a": 0.1179047745729788
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.37134824308797626,
          "fidelity_final": 0.03508663815604711,
          "drift_slope_b": 0.3097520674067683,
          "drift_a": 0.14316627221652012
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.4238017645431889,
          "fidelity_final": 0.018307657918519113,
          "drift_slope_b": 0.35987992750496145,
          "drift_a": 0.14135784462888412
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.3227007897690473,
          "fidelity_final": 0.0450481548318445,
          "drift_slope_b": 0.24527588751781684,
          "drift_a": 0.1545964316737287
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.4364185534786811,
          "fidelity_final": 0,
          "drift_slope_b": 0.36597076018107794,
          "drift_a": 0.13826084653081855
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
          "rfd_final": 0.20876033611819253,
          "fidelity_final": 0.013398959099250323,
          "drift_slope_b": 0.04421720736608403,
          "drift_a": 0.18357334791318222
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2090462538585758,
          "fidelity_final": 0.007558461881579821,
          "drift_slope_b": 0.029745560049198223,
          "drift_a": 0.19212174702720636
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20870580641085057,
          "fidelity_final": 0.016063410909038484,
          "drift_slope_b": 0.017044652146881473,
          "drift_a": 0.19869594515301464
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20987888341687103,
          "fidelity_final": 0,
          "drift_slope_b": 0.03208609516571463,
          "drift_a": 0.19091237509166342
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20837366402103588,
          "fidelity_final": 0.01677491508922415,
          "drift_slope_b": 0.015203033961403723,
          "drift_a": 0.19962295411868197
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
          "rfd_final": 0.26419110696564274,
          "fidelity_final": 0,
          "drift_slope_b": 0.10614324520680544,
          "drift_a": 0.17568524372256902
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.25088524333490275,
          "fidelity_final": 0,
          "drift_slope_b": 0.029993067872945818,
          "drift_a": 0.2332818073229207
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.24945078552463945,
          "fidelity_final": 0.06034454707628752,
          "drift_slope_b": 0.15231734979368958,
          "drift_a": 0.17945683005024377
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2559365872065438,
          "fidelity_final": 0,
          "drift_slope_b": -0.008979684510021516,
          "drift_a": 0.2611539530916071
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.24796078092775,
          "fidelity_final": 0.0812339169182249,
          "drift_slope_b": 0.11210270790441926,
          "drift_a": 0.19384139229804964
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.23970664797936364,
          "fidelity_final": 0.21882513353209593,
          "drift_slope_b": 0.10402071726079998,
          "drift_a": 0.16922721382338823
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
          "rfd_final": 0.25624074079457215,
          "fidelity_final": 0.05748351140090241,
          "drift_slope_b": 0.053096338321388346,
          "drift_a": 0.1988978208517026
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.254123818070115,
          "fidelity_final": 0,
          "drift_slope_b": 0.18855865472694866,
          "drift_a": 0.155114565181483
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.27773546728900633,
          "fidelity_final": 0,
          "drift_slope_b": 0.23002181928863158,
          "drift_a": 0.14980156327924174
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2455224699342349,
          "fidelity_final": 0.1251073919956596,
          "drift_slope_b": -0.0160233940752992,
          "drift_a": 0.27285036330122997
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.27154791090119346,
          "fidelity_final": 0,
          "drift_slope_b": 0.20426137030477787,
          "drift_a": 0.1592640597688423
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.22528674705194765,
          "fidelity_final": 0.36657982172681275,
          "drift_slope_b": 0.027346225153177795,
          "drift_a": 0.19978099422019752
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
          "rfd_final": 0.12512889528646406,
          "fidelity_final": 0.80167671297851,
          "drift_slope_b": 0.16382642529778238,
          "drift_a": 0.07452847946413124
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.12065072529279998,
          "fidelity_final": 0.8158431593259788,
          "drift_slope_b": 0.17355256210375633,
          "drift_a": 0.06875628811667901
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.15141074290519624,
          "fidelity_final": 0.7088774987375962,
          "drift_slope_b": 0.130326376992779,
          "drift_a": 0.1023075886966537
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.10650262675342606,
          "fidelity_final": 0.8561836769383607,
          "drift_slope_b": 0.17813110404609958,
          "drift_a": 0.06096420204771649
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.14108746544516226,
          "fidelity_final": 0.7465189975457582,
          "drift_slope_b": 0.10447936756866034,
          "drift_a": 0.10331527793506634
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
          "rfd_final": 0.14930637244226513,
          "fidelity_final": 0.7192310748154809,
          "drift_slope_b": 0.49897092661037906,
          "drift_a": 0.03087437478983742
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.13145284838552057,
          "fidelity_final": 0.781644579574448,
          "drift_slope_b": 0.38239493045647355,
          "drift_a": 0.040713134697686164
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.15359104763542455,
          "fidelity_final": 0.7024687522210258,
          "drift_slope_b": 0.43220320067123086,
          "drift_a": 0.04137334238655006
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.11309990236403487,
          "fidelity_final": 0.8377366707329791,
          "drift_slope_b": 0.35761143608363083,
          "drift_a": 0.03801011667193735
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.15431630061755483,
          "fidelity_final": 0.7006585171908581,
          "drift_slope_b": 0.42433665570066215,
          "drift_a": 0.041864164078620855
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
          "rfd_final": 0.16901748667177222,
          "fidelity_final": 0.6327615573435416,
          "drift_slope_b": 0.3436405349181714,
          "drift_a": 0.05688339950794989
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.185144225108966,
          "fidelity_final": 0.5573415899252528,
          "drift_slope_b": 0.3347431811944783,
          "drift_a": 0.06515754996525593
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.1967035993889091,
          "fidelity_final": 0.4990844542253881,
          "drift_slope_b": 0.27554745644987827,
          "drift_a": 0.07897934597307649
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.16920735323881111,
          "fidelity_final": 0.6337040622395027,
          "drift_slope_b": 0.41821947418768046,
          "drift_a": 0.045126862397970105
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.18961620699777074,
          "fidelity_final": 0.536774315044815,
          "drift_slope_b": 0.2879017086778667,
          "drift_a": 0.07571938051593771
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
          "rfd_final": 1.514216964015405,
          "fidelity_final": 0,
          "drift_slope_b": 0.03205079272105765,
          "drift_a": 1.3249273323052382
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.3377259242168928,
          "fidelity_final": 0.7004529920703342,
          "drift_slope_b": 0.2897458077193119,
          "drift_a": 0.6564500766793913
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.7469316096542356,
          "fidelity_final": 0,
          "drift_slope_b": 0.12604972976809206,
          "drift_a": 1.341182798953579
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4805110438619742,
          "fidelity_final": 0,
          "drift_slope_b": -0.04086849624516422,
          "drift_a": 1.6485185474269353
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.5270676202420743,
          "fidelity_final": 0,
          "drift_slope_b": 0.00441405989403486,
          "drift_a": 1.4944928710272278
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4620446740594808,
          "fidelity_final": 0.07361705582058138,
          "drift_slope_b": 0.1965161454239532,
          "drift_a": 0.7660946431255851
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
          "rfd_final": 1.499237204542691,
          "fidelity_final": 0,
          "drift_slope_b": -0.027149631024873444,
          "drift_a": 1.542036716214512
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.8775705258592066,
          "fidelity_final": 0,
          "drift_slope_b": 0.42886675408873653,
          "drift_a": 0.4627551529482624
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.9324650933720664,
          "fidelity_final": 0,
          "drift_slope_b": 0.27367953567724534,
          "drift_a": 0.9739403924199704
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.6902880126842543,
          "fidelity_final": 0,
          "drift_slope_b": -0.07934197439255056,
          "drift_a": 1.9236157652423447
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.2387226857674285,
          "fidelity_final": 0.6634001344976125,
          "drift_slope_b": -0.061328140005466665,
          "drift_a": 1.7663623488115416
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4024964677623866,
          "fidelity_final": 0.31982270002133895,
          "drift_slope_b": 0.14833734052727696,
          "drift_a": 0.802362939798909
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
          "rfd_final": 1.334406020572096,
          "fidelity_final": 0.4943619708866862,
          "drift_slope_b": 0.200673023147767,
          "drift_a": 0.7218667201389927
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.181062294076257,
          "fidelity_final": 0.7800484964128693,
          "drift_slope_b": 0.1984244412561668,
          "drift_a": 0.6258260660555306
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4627189167876038,
          "fidelity_final": 0.08953409607663912,
          "drift_slope_b": 0.10033085477953219,
          "drift_a": 1.1023412832904993
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.2691416950856282,
          "fidelity_final": 0.5627940507013163,
          "drift_slope_b": 0.4802832816302229,
          "drift_a": 0.2900413901625405
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4408780698992938,
          "fidelity_final": 0.1800796728823996,
          "drift_slope_b": 0.10611074320957319,
          "drift_a": 1.0689141044883634
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
          "rfd_final": 4.942982314165921,
          "fidelity_final": 0.3544628079921921,
          "drift_slope_b": 0.5472670836933672,
          "drift_a": 0.821751245453688
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 4.765760952471682,
          "fidelity_final": 0.11626347339794132,
          "drift_slope_b": 0.5689293146632763,
          "drift_a": 0.8528753897284229
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 5.698132651658468,
          "fidelity_final": 0.02200588653851552,
          "drift_slope_b": 0.6311046351609216,
          "drift_a": 0.8613694498474742
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 3.8982322963685117,
          "fidelity_final": 0.1465413263171927,
          "drift_slope_b": 0.4929159235532854,
          "drift_a": 0.8970463855927585
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 5.777940659767408,
          "fidelity_final": 0.08118746127993208,
          "drift_slope_b": 0.6398758203048017,
          "drift_a": 0.8149041290627362
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
          "rfd_final": 1.5760244695253665,
          "fidelity_final": 0,
          "drift_slope_b": 0.36385523087029803,
          "drift_a": 0.5443225650896604
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.5423297666627158,
          "fidelity_final": 0,
          "drift_slope_b": 0.2628638205911244,
          "drift_a": 0.7593740724696553
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.520806507054327,
          "fidelity_final": 0.010580882874277076,
          "drift_slope_b": 0.14313153311308613,
          "drift_a": 0.9985509010658605
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.771960287682249,
          "fidelity_final": 0,
          "drift_slope_b": 0.577844574754634,
          "drift_a": 0.3145675902987092
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4924568264839497,
          "fidelity_final": 0,
          "drift_slope_b": 0.1858935689516096,
          "drift_a": 0.8863833239339894
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
          "rfd_final": 0.09870083638137436,
          "fidelity_final": 0.1655922320186388,
          "drift_slope_b": 0.07393941929726226,
          "drift_a": 0.07502921942109834
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.10079057335343286,
          "fidelity_final": 0,
          "drift_slope_b": 0.033168695071455215,
          "drift_a": 0.0931133152503406
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.10029377661657723,
          "fidelity_final": 0.04453823147090874,
          "drift_slope_b": 0.09338511127298887,
          "drift_a": 0.08081710792032376
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.10043701217735086,
          "fidelity_final": 0,
          "drift_slope_b": 0.012956609686171058,
          "drift_a": 0.09696189218805899
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.10173901221748136,
          "fidelity_final": 0,
          "drift_slope_b": 0.12293295116518034,
          "drift_a": 0.07571377894485043
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.09824133980175838,
          "fidelity_final": 0.1295677332121442,
          "drift_slope_b": 0.04970975169759529,
          "drift_a": 0.08417395196144506
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
          "rfd_final": 0.09725282710686224,
          "fidelity_final": 0.20887925747655184,
          "drift_slope_b": 0.0222946287118823,
          "drift_a": 0.08537975660532081
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.1011323465677413,
          "fidelity_final": 0,
          "drift_slope_b": 0.1285341042510083,
          "drift_a": 0.07218664805403645
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.10347624806668865,
          "fidelity_final": 0,
          "drift_slope_b": 0.13466769045108132,
          "drift_a": 0.0742945655344584
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.10026137600775743,
          "fidelity_final": 0.0035089566900697545,
          "drift_slope_b": -0.01742701000942845,
          "drift_a": 0.10718747292394068
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.10771864799654576,
          "fidelity_final": 0,
          "drift_slope_b": 0.18762150510997533,
          "drift_a": 0.06580779392195454
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.09598566784783981,
          "fidelity_final": 0.2465855319704644,
          "drift_slope_b": -0.0012908450567779067,
          "drift_a": 0.09547740837703846
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
          "rfd_final": 0.06469454027572843,
          "fidelity_final": 0.7115869440289925,
          "drift_slope_b": 0.1420105041041496,
          "drift_a": 0.04268922319559813
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.059317710660448136,
          "fidelity_final": 0.7601746906293735,
          "drift_slope_b": 0.1032151660954407,
          "drift_a": 0.04248834410276709
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.07529363094839095,
          "fidelity_final": 0.5992525776935915,
          "drift_slope_b": 0.1817932903174748,
          "drift_a": 0.044145301210476814
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.03162686429796163,
          "fidelity_final": 0.9342146283815844,
          "drift_slope_b": 0.16893342951384582,
          "drift_a": 0.019694696465960396
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.057935689890821575,
          "fidelity_final": 0.7900344251799112,
          "drift_slope_b": 0.30271616123858947,
          "drift_a": 0.02266587422888802
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
          "rfd_final": 0.06526190571909761,
          "fidelity_final": 0.7364843985383916,
          "drift_slope_b": 0.4975439465311001,
          "drift_a": 0.013593839066308351
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.0628773743407498,
          "fidelity_final": 0.7501738973119796,
          "drift_slope_b": 0.42970349560945814,
          "drift_a": 0.017136853389942825
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.0693510499030781,
          "fidelity_final": 0.7015487707686193,
          "drift_slope_b": 0.4945222589281743,
          "drift_a": 0.01566780351023904
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.04365749188549694,
          "fidelity_final": 0.8785185301106926,
          "drift_slope_b": 0.40857092174847215,
          "drift_a": 0.01289387626186234
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.06377303263338685,
          "fidelity_final": 0.7503643124451512,
          "drift_slope_b": 0.5022242148107245,
          "drift_a": 0.013797945809527621
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
          "rfd_final": 0.040521191338358284,
          "fidelity_final": 0.9265575337579217,
          "drift_slope_b": 0.34538058128643023,
          "drift_a": 0.01255923708682753
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.04891568116495744,
          "fidelity_final": 0.8916037132263387,
          "drift_slope_b": 0.41751026184938594,
          "drift_a": 0.012370866312650247
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.05326381414944516,
          "fidelity_final": 0.8642206694099117,
          "drift_slope_b": 0.26110071030233245,
          "drift_a": 0.021471199111519866
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.03793029104982172,
          "fidelity_final": 0.9377701860133126,
          "drift_slope_b": 0.47102837976834977,
          "drift_a": 0.007938090194563558
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.050411051776914725,
          "fidelity_final": 0.884884075198573,
          "drift_slope_b": 0.3100047865636003,
          "drift_a": 0.017610128665729575
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
          "rfd_final": 8.846846036394128,
          "fidelity_final": 0.1703632448832242,
          "drift_slope_b": 0.01280615682699696,
          "drift_a": 8.443993038903464
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 8.987886823113325,
          "fidelity_final": 0,
          "drift_slope_b": -0.0011239676593787758,
          "drift_a": 9.064786563114305
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 8.946471046744604,
          "fidelity_final": 0.0765019541270422,
          "drift_slope_b": 0.04882656886390361,
          "drift_a": 8.098051329001883
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.970440275200488,
          "fidelity_final": 0,
          "drift_slope_b": -0.02546920047065267,
          "drift_a": 9.65352668651752
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 8.533109606948745,
          "fidelity_final": 0.42075210336824764,
          "drift_slope_b": 0.11135540472337403,
          "drift_a": 7.158037283886664
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 8.869316871179604,
          "fidelity_final": 0.24779817078457916,
          "drift_slope_b": 0.04006388897001355,
          "drift_a": 7.790385270340737
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
          "rfd_final": 8.80646637796719,
          "fidelity_final": 0.19151746097802103,
          "drift_slope_b": -0.04056492054941473,
          "drift_a": 9.733851408854395
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 9.043587441217944,
          "fidelity_final": 0,
          "drift_slope_b": 0.03986353089252133,
          "drift_a": 8.198063668999868
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 9.230212120265708,
          "fidelity_final": 0,
          "drift_slope_b": 0.08017670334337075,
          "drift_a": 7.674853066536916
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.919096225376165,
          "fidelity_final": 0.10641240383829442,
          "drift_slope_b": -0.09609015218291386,
          "drift_a": 11.845740878821479
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 10.138693400085888,
          "fidelity_final": 0,
          "drift_slope_b": 0.28497880862147323,
          "drift_a": 4.995758935077994
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 8.731723898538243,
          "fidelity_final": 0.3347704081787253,
          "drift_slope_b": -0.03215641787308618,
          "drift_a": 9.302223558536761
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
          "rfd_final": 3.1405798807907535,
          "fidelity_final": 0.936658779834715,
          "drift_slope_b": 0.2668391510371883,
          "drift_a": 1.3454012568846014
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 2.656747650368917,
          "fidelity_final": 0.9556908277104855,
          "drift_slope_b": 0.1438275464937005,
          "drift_a": 1.631408975363955
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 3.732955246868093,
          "fidelity_final": 0.9110601390011965,
          "drift_slope_b": 0.20240193281261518,
          "drift_a": 2.0485784259956703
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.238809965480156,
          "fidelity_final": 0.9904105931608679,
          "drift_slope_b": 0.5122255957520453,
          "drift_a": 0.2578277418405449
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4051809325052516,
          "fidelity_final": 0.9876413985902022,
          "drift_slope_b": 0.11055152920212664,
          "drift_a": 1.0224720944888401
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
          "rfd_final": 181.11177401195877,
          "fidelity_final": 0.047775537818651403,
          "drift_slope_b": 0.5815774501153825,
          "drift_a": 27.38782005035243
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 163.7507374805975,
          "fidelity_final": 0.05422100528731158,
          "drift_slope_b": 0.5706525391379614,
          "drift_a": 29.19732142297315
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 194.6826940275903,
          "fidelity_final": 0,
          "drift_slope_b": 0.6370616570038719,
          "drift_a": 28.92093038010217
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 132.95143065629998,
          "fidelity_final": 0.014218744282492703,
          "drift_slope_b": 0.487434783325821,
          "drift_a": 31.247151300450998
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 199.55495930889035,
          "fidelity_final": 0.037471639539455995,
          "drift_slope_b": 0.6468851875615734,
          "drift_a": 27.534641054387183
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
          "rfd_final": 1.521868493338769,
          "fidelity_final": 0.985540238813042,
          "drift_slope_b": 0.37201680329474174,
          "drift_a": 0.5150668525522206
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4758462835236543,
          "fidelity_final": 0.9864084446946864,
          "drift_slope_b": 0.2642404000398661,
          "drift_a": 0.7300766744628504
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4477803295456915,
          "fidelity_final": 0.9869813578754444,
          "drift_slope_b": 0.13740139257851988,
          "drift_a": 0.9756912811316271
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.7203343839033376,
          "fidelity_final": 0.9815259547469634,
          "drift_slope_b": 0.5950313344476498,
          "drift_a": 0.2898027954444274
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4398712305336123,
          "fidelity_final": 0.9870191502049536,
          "drift_slope_b": 0.19221878965377445,
          "drift_a": 0.8431869180694007
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
          "rfd_final": 37.21921091993034,
          "fidelity_final": 0.035604725302049424,
          "drift_slope_b": 0.07872175383776787,
          "drift_a": 30.055053765266123
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 37.24611227505308,
          "fidelity_final": 0,
          "drift_slope_b": 0.05405304956541882,
          "drift_a": 32.22752290293771
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 37.22668060300017,
          "fidelity_final": 0.02963220653907267,
          "drift_slope_b": 0.045484457627118925,
          "drift_a": 33.01481458170115
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 37.2480749232535,
          "fidelity_final": 0,
          "drift_slope_b": -0.07321857676126295,
          "drift_a": 45.542881714654364
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 37.26290711780415,
          "fidelity_final": 0,
          "drift_slope_b": 0.04173810880729541,
          "drift_a": 33.653202812912085
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 34.30348364704207,
          "fidelity_final": 0.7527368538207597,
          "drift_slope_b": 0.6490101065678558,
          "drift_a": 4.76464695620069
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
          "rfd_final": 37.21236423975853,
          "fidelity_final": 0.03955738726456014,
          "drift_slope_b": 0.08291532615802302,
          "drift_a": 29.71208338941336
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 37.24680030468625,
          "fidelity_final": 0,
          "drift_slope_b": 0.15376714527267132,
          "drift_a": 24.528639508867755
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 37.287251044053875,
          "fidelity_final": 0,
          "drift_slope_b": 0.03533802007382872,
          "drift_a": 34.059005140212214
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 34.16509490003163,
          "fidelity_final": 0.8163084795763716,
          "drift_slope_b": -0.12189576934074518,
          "drift_a": 52.85748369670826
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 37.267338423878066,
          "fidelity_final": 0,
          "drift_slope_b": 0.057344624401143456,
          "drift_a": 32.755730769957076
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 30.390360925985835,
          "fidelity_final": 0.8663878610886385,
          "drift_slope_b": 0.660014624133041,
          "drift_a": 3.841091975896232
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
          "rfd_final": 5.280866329235735,
          "fidelity_final": 0.9892112031269287,
          "drift_slope_b": 0.32824406189436145,
          "drift_a": 1.769304178768629
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 4.591759896274207,
          "fidelity_final": 0.9918469536908346,
          "drift_slope_b": 0.2813320262473028,
          "drift_a": 1.7713380253784679
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 8.455100610210623,
          "fidelity_final": 0.9816182620684696,
          "drift_slope_b": 0.31739042580494736,
          "drift_a": 2.9288203010062763
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 3.314083590252913,
          "fidelity_final": 0.9957337448464733,
          "drift_slope_b": 0.22679756066627504,
          "drift_a": 1.615167323757539
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 6.273776997374049,
          "fidelity_final": 0.9850722633844963,
          "drift_slope_b": 0.28351189567132046,
          "drift_a": 2.4645367882806553
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
          "rfd_final": 35.79667596494754,
          "fidelity_final": 0.6607544360375518,
          "drift_slope_b": 0.5787331893166512,
          "drift_a": 5.4566238434356045
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 32.55789275484334,
          "fidelity_final": 0.7006220841613164,
          "drift_slope_b": 0.5688898389335618,
          "drift_a": 5.824852880358512
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 38.56749600343426,
          "fidelity_final": 0.6241900079751188,
          "drift_slope_b": 0.6347936268052716,
          "drift_a": 5.756567581877643
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 26.269770722635045,
          "fidelity_final": 0.7909171181398145,
          "drift_slope_b": 0.48471533676321304,
          "drift_a": 6.217281526973204
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 39.65705211594443,
          "fidelity_final": 0.6065670668865772,
          "drift_slope_b": 0.6418795618351296,
          "drift_a": 5.548843292481143
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
          "rfd_final": 11.094887054802243,
          "fidelity_final": 0.9520471677472481,
          "drift_slope_b": 0.6982173001853009,
          "drift_a": 1.1125388680476185
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 15.26800999409271,
          "fidelity_final": 0.9091951040336305,
          "drift_slope_b": 0.7776496304425665,
          "drift_a": 1.214496295595733
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 20.4898826641293,
          "fidelity_final": 0.832835018188895,
          "drift_slope_b": 0.8143717623105556,
          "drift_a": 1.416027983564884
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 8.92942333138334,
          "fidelity_final": 0.9690778955567795,
          "drift_slope_b": 0.673951280852179,
          "drift_a": 0.9665104179589129
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 17.389482115248924,
          "fidelity_final": 0.881831428561562,
          "drift_slope_b": 0.776289520820921,
          "drift_a": 1.3954274971382827
        }
      }
    }
  ],
  "scoreboard": {
    "mechanism_winners": {
      "scaling": "random_1",
      "recursive_weighting": "random_1",
      "hierarchical_resolution": "random_0",
      "recursive_feedback": "random_0",
      "recursive_compression": "random_0"
    },
    "egs_mechanism_wins": 0,
    "baseline_mechanism_wins": 0,
    "n_mechanisms": 5,
    "mean_final_rfd_by_arm": {
      "baseline": 13.861923589082883,
      "egs": 11.470120233266847,
      "sqrt2": 10.890096511282536,
      "e": 12.37299304719166,
      "random_0": 9.323864493460775,
      "random_1": 12.072545889114643
    },
    "lowest_mean_rfd_arm": "random_0",
    "nest_heavy_mean_final_rfd_by_arm": {
      "baseline": 19.89380194220142,
      "egs": 15.878864035657235,
      "sqrt2": 14.96716558232466,
      "e": 17.15780612508208,
      "random_0": 12.537207316232255,
      "random_1": 17.081593446514262
    },
    "lowest_nest_heavy_mean_rfd_arm": "random_0",
    "lowest_named_mean_rfd_arm": "sqrt2",
    "named_mean_final_rfd_by_arm": {
      "baseline": 13.861923589082883,
      "egs": 11.470120233266847,
      "sqrt2": 10.890096511282536,
      "e": 12.37299304719166
    }
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
      "rfd_final": 2.0472862813985047,
      "slope_b": 0.1918993966091437,
      "is_phi": false
    },
    {
      "c": 1.41421356237,
      "rfd_final": 2.0955428803635323,
      "slope_b": 0.4185866692003608,
      "is_phi": false
    },
    {
      "c": 1.5,
      "rfd_final": 1.9114556474420072,
      "slope_b": 0.35611530391319,
      "is_phi": false
    },
    {
      "c": 1.618033988749895,
      "rfd_final": 1.5957728098540271,
      "slope_b": 0.26734949602730607,
      "is_phi": true
    },
    {
      "c": 1.7,
      "rfd_final": 1.8828941882807957,
      "slope_b": 0.2700280319616256,
      "is_phi": false
    },
    {
      "c": 2,
      "rfd_final": 2.017292374571903,
      "slope_b": 0.24554723730184808,
      "is_phi": false
    },
    {
      "c": 2.718281828459045,
      "rfd_final": 2.021567607810022,
      "slope_b": 0.18724312319677233,
      "is_phi": false
    }
  ],
  "ranked_c": [
    1.618033988749895,
    1.7,
    1.5,
    2,
    2.718281828459045,
    1,
    1.41421356237
  ],
  "phi_rank_by_lowest_rfd": 1,
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
    "c": 1.025,
    "rfd": 6.0405189885258155
  },
  "hold_min": {
    "c": 1.025,
    "rfd": 8.016945673901711
  },
  "train_min_near_phi": false,
  "hold_min_near_phi": false,
  "train_curve_sample": [
    {
      "c": 1,
      "rfd": 10.614092659123221
    },
    {
      "c": 1.125,
      "rfd": 7.71757262353847
    },
    {
      "c": 1.25,
      "rfd": 6.517450898237645
    },
    {
      "c": 1.375,
      "rfd": 8.678885439127527
    },
    {
      "c": 1.5,
      "rfd": 8.541369972051777
    },
    {
      "c": 1.625,
      "rfd": 8.713788278641598
    },
    {
      "c": 1.75,
      "rfd": 7.814971878848503
    },
    {
      "c": 1.875,
      "rfd": 10.256674741983662
    },
    {
      "c": 2,
      "rfd": 10.358964271153036
    },
    {
      "c": 2.125,
      "rfd": 9.679655846521689
    },
    {
      "c": 2.25,
      "rfd": 9.141708400497672
    },
    {
      "c": 2.375,
      "rfd": 11.345247965779985
    },
    {
      "c": 2.5,
      "rfd": 11.337877031932472
    }
  ],
  "hold_curve_sample": [
    {
      "c": 1,
      "rfd": 13.411335860582764
    },
    {
      "c": 1.125,
      "rfd": 13.358483139170355
    },
    {
      "c": 1.25,
      "rfd": 11.394319946402021
    },
    {
      "c": 1.375,
      "rfd": 11.72256127050637
    },
    {
      "c": 1.5,
      "rfd": 11.660673122821821
    },
    {
      "c": 1.625,
      "rfd": 11.697953179430906
    },
    {
      "c": 1.75,
      "rfd": 11.681339257165432
    },
    {
      "c": 1.875,
      "rfd": 12.662083072488178
    },
    {
      "c": 2,
      "rfd": 12.94630129659016
    },
    {
      "c": 2.125,
      "rfd": 11.96464783745006
    },
    {
      "c": 2.25,
      "rfd": 12.873633302716353
    },
    {
      "c": 2.375,
      "rfd": 13.787792397728031
    },
    {
      "c": 2.5,
      "rfd": 13.406034274734424
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
        "a": 0.1818233449092276,
        "b": 0.045431450351064814,
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
          "rfd": 0.1507293811223912,
          "F": 0.7705156610966909
        },
        {
          "n": 2,
          "rfd": 0.18130658873324804,
          "F": 0.5292532379453735
        },
        {
          "n": 3,
          "rfd": 0.19091526079605584,
          "F": 0.41625681458625535
        },
        {
          "n": 4,
          "rfd": 0.19498169020362754,
          "F": 0.36347639432654205
        },
        {
          "n": 5,
          "rfd": 0.1972935487876453,
          "F": 0.3327329774318429
        },
        {
          "n": 6,
          "rfd": 0.19895695544333214,
          "F": 0.3088336123116647
        },
        {
          "n": 7,
          "rfd": 0.2005762521611835,
          "F": 0.279282268919965
        },
        {
          "n": 8,
          "rfd": 0.20171122554906515,
          "F": 0.25644725028357357
        },
        {
          "n": 9,
          "rfd": 0.20267093442025422,
          "F": 0.2333580737430157
        },
        {
          "n": 10,
          "rfd": 0.20350061332202085,
          "F": 0.2095485455773955
        },
        {
          "n": 11,
          "rfd": 0.20421614167015348,
          "F": 0.18550597200475186
        },
        {
          "n": 12,
          "rfd": 0.2048287810574317,
          "F": 0.1619171364136911
        },
        {
          "n": 13,
          "rfd": 0.20534909605711438,
          "F": 0.1394384977798471
        },
        {
          "n": 14,
          "rfd": 0.20578742682268297,
          "F": 0.11859422048894085
        },
        {
          "n": 15,
          "rfd": 0.20615372351818287,
          "F": 0.09973730862043907
        },
        {
          "n": 16,
          "rfd": 0.20645733439286273,
          "F": 0.08305114630673424
        },
        {
          "n": 17,
          "rfd": 0.20670686373563382,
          "F": 0.06857479575888371
        },
        {
          "n": 18,
          "rfd": 0.20691010370312837,
          "F": 0.05623827457280386
        },
        {
          "n": 19,
          "rfd": 0.2070740213715841,
          "F": 0.04589810899535718
        },
        {
          "n": 20,
          "rfd": 0.20720478216571453,
          "F": 0.03736780013276588
        },
        {
          "n": 21,
          "rfd": 0.20730779523647833,
          "F": 0.03044125563544838
        },
        {
          "n": 22,
          "rfd": 0.20738777074971954,
          "F": 0.024909338160711007
        },
        {
          "n": 23,
          "rfd": 0.207448782432469,
          "F": 0.020570662607540424
        },
        {
          "n": 24,
          "rfd": 0.20749433111409057,
          "F": 0.01723803120136031
        }
      ]
    },
    "sqrt2": {
      "c": 1.4142135623730951,
      "slope": {
        "a": 0.19065105246347044,
        "b": 0.0303194918920782,
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
          "rfd": 0.1987971611859024,
          "F": 0.28651186631683995
        },
        {
          "n": 2,
          "rfd": 0.18996431599617872,
          "F": 0.4269347466695539
        },
        {
          "n": 3,
          "rfd": 0.19731445743635356,
          "F": 0.32111796614300103
        },
        {
          "n": 4,
          "rfd": 0.19880250647355138,
          "F": 0.30905525515136334
        },
        {
          "n": 5,
          "rfd": 0.20084452414634021,
          "F": 0.2727232484367604
        },
        {
          "n": 6,
          "rfd": 0.20236168296057075,
          "F": 0.23850687801942547
        },
        {
          "n": 7,
          "rfd": 0.20365490465466016,
          "F": 0.20054252450677942
        },
        {
          "n": 8,
          "rfd": 0.20468691422106738,
          "F": 0.16363575407862269
        },
        {
          "n": 9,
          "rfd": 0.20550260691307468,
          "F": 0.1295936049878642
        },
        {
          "n": 10,
          "rfd": 0.20613303592965715,
          "F": 0.09993126587144617
        },
        {
          "n": 11,
          "rfd": 0.20661200412610395,
          "F": 0.07512818153710893
        },
        {
          "n": 12,
          "rfd": 0.20696919224209825,
          "F": 0.05509968915074723
        },
        {
          "n": 13,
          "rfd": 0.20723033854641865,
          "F": 0.03941330113084231
        },
        {
          "n": 14,
          "rfd": 0.2074169183539098,
          "F": 0.02748833907087487
        },
        {
          "n": 15,
          "rfd": 0.2075465038609865,
          "F": 0.01870631272097101
        },
        {
          "n": 16,
          "rfd": 0.20763322526017353,
          "F": 0.012473319689879957
        },
        {
          "n": 17,
          "rfd": 0.20768828924447574,
          "F": 0.008251060013808261
        },
        {
          "n": 18,
          "rfd": 0.20772047352790193,
          "F": 0.005570724171663464
        },
        {
          "n": 19,
          "rfd": 0.20773657200602672,
          "F": 0.004036868569610119
        },
        {
          "n": 20,
          "rfd": 0.2077417791440263,
          "F": 0.0033253057293130984
        },
        {
          "n": 21,
          "rfd": 0.20774001344017162,
          "F": 0.0031773603367390565
        },
        {
          "n": 22,
          "rfd": 0.20773418463820187,
          "F": 0.0033921132700096813
        },
        {
          "n": 23,
          "rfd": 0.20772641158303332,
          "F": 0.0038178279708253647
        },
        {
          "n": 24,
          "rfd": 0.2077181981290311,
          "F": 0.004343419249088929
        }
      ]
    },
    "e": {
      "c": 2.718281828459045,
      "slope": {
        "a": 0.19808898031963273,
        "b": 0.015853600047936508,
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
          "rfd": 0.20089457925191362,
          "F": 0.24314932724172197
        },
        {
          "n": 2,
          "rfd": 0.19460568075569168,
          "F": 0.44985349915649014
        },
        {
          "n": 3,
          "rfd": 0.20360099889544087,
          "F": 0.1972194616399446
        },
        {
          "n": 4,
          "rfd": 0.20368422286963483,
          "F": 0.20753715157440752
        },
        {
          "n": 5,
          "rfd": 0.2046487966212795,
          "F": 0.17510610825114328
        },
        {
          "n": 6,
          "rfd": 0.20498954197786795,
          "F": 0.16716763430598622
        },
        {
          "n": 7,
          "rfd": 0.20536482121070218,
          "F": 0.15342779778693122
        },
        {
          "n": 8,
          "rfd": 0.20565770294731928,
          "F": 0.14097441763398966
        },
        {
          "n": 9,
          "rfd": 0.20591839900002018,
          "F": 0.1274352005821126
        },
        {
          "n": 10,
          "rfd": 0.20614039790907993,
          "F": 0.11402055354443429
        },
        {
          "n": 11,
          "rfd": 0.20633094121862086,
          "F": 0.10094821533679779
        },
        {
          "n": 12,
          "rfd": 0.20649298849251194,
          "F": 0.08864313759434056
        },
        {
          "n": 13,
          "rfd": 0.20663045862924806,
          "F": 0.07731009063515033
        },
        {
          "n": 14,
          "rfd": 0.20674666143384815,
          "F": 0.06706476714773442
        },
        {
          "n": 15,
          "rfd": 0.20684466037772128,
          "F": 0.0579251701278847
        },
        {
          "n": 16,
          "rfd": 0.20692713704298393,
          "F": 0.04985156319347724
        },
        {
          "n": 17,
          "rfd": 0.20714803402765458,
          "F": 0.026292864845447968
        },
        {
          "n": 18,
          "rfd": 0.20711249882018296,
          "F": 0.029828063054704763
        },
        {
          "n": 19,
          "rfd": 0.20713262833519022,
          "F": 0.027275684628120737
        },
        {
          "n": 20,
          "rfd": 0.20713904563895283,
          "F": 0.026251194135091922
        },
        {
          "n": 21,
          "rfd": 0.20714929159716688,
          "F": 0.024776750293026593
        },
        {
          "n": 22,
          "rfd": 0.20715921848151927,
          "F": 0.023323524178915013
        },
        {
          "n": 23,
          "rfd": 0.2071696904244343,
          "F": 0.021786986057925128
        },
        {
          "n": 24,
          "rfd": 0.20718031627438627,
          "F": 0.020211668193369482
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

ERFT V4 is a controlled, falsifiable recursive-fidelity protocol: nest weights vary by arm; recursion geometry is matched via Infinite Octaves engine catalog fixtures (k/81, clutch Δ, octaves, odd-prime vaults). V3 confounded c with lag/block budgets (retired). It does not assume Φ_EGS is correct, does not claim CODATA status, does not prove AGI safety. Suite pass = protocol integrity; empirical Φ advantage is a measured outcome that may fail.
