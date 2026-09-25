# EGS Recursive Fidelity Test (ERFT) — Controlled Recursive-Drift Experiment

**Document ID:** `WP-SYNTHOBS-EGS-RECURSIVE-FIDELITY-TEST-ERFT-2026-09-25`
**Registry ID:** `synthobs-egs-recursive-fidelity-test-erft-2026-09`
**Protocol:** `ERFT-V2-2026-09-25`
**Generated:** 2026-09-25T07:29:48.174Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| Φ_EGS (one arm) | 1.618033988749895 |
| Suite pass means | Protocol executed reproducibly with locked arms/mechanisms/metrics — NOT that Φ won. |

## Experiments

### E0_protocol_locks — Pre-registered protocol locks (φ not assumed · V2 anti-bias)

- **Pass:** `true`
- **Interpretation:** V2 freezes arms, mechanisms, depth, null-ok honesty, and anti-baseline-bias geometry locks before reading outcomes.
- **Honesty:** Protocol lock ≠ physics proof.

```json
{
  "id": "E0_protocol_locks",
  "title": "Pre-registered protocol locks (φ not assumed · V2 anti-bias)",
  "PROTOCOL_VERSION": "ERFT-V2-2026-09-25",
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
    "version": 2,
    "rule": "Transform severity is fixed across arms; c only picks chord / phase / mix geometry. Coarsening block size must not be a monotonic function of c.",
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
  "interpretation": "V2 freezes arms, mechanisms, depth, null-ok honesty, and anti-baseline-bias geometry locks before reading outcomes.",
  "honesty": "Protocol lock ≠ physics proof."
}
```

### E0b_anti_baseline_bias — Anti-baseline-bias construction locks (V2)

- **Pass:** `true`
- **Interpretation:** Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.
- **Honesty:** Anti-bias lock ≠ Φ win. Empirical outcomes still free to null.

```json
{
  "id": "E0b_anti_baseline_bias",
  "title": "Anti-baseline-bias construction locks (V2)",
  "first_step_rfd": {
    "scaling": {
      "baseline": 1.1405636034197066,
      "egs": 0.7634289345019051,
      "sqrt2": 0.8123424702179579,
      "e": 1.2946868194643562
    },
    "recursive_weighting": {
      "baseline": 1.1405636034197066,
      "egs": 0.7634289345019051,
      "sqrt2": 0.8123424702179579,
      "e": 1.2946868194643562
    }
  },
  "hierarchical_ladder": [
    {
      "c": 1,
      "rfd": 1.4007770155818446
    },
    {
      "c": 1.41421356237,
      "rfd": 1.3861655353167859
    },
    {
      "c": 1.5,
      "rfd": 1.385995135712958
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.3861821057096277
    },
    {
      "c": 1.7,
      "rfd": 1.3876104707112185
    },
    {
      "c": 2,
      "rfd": 1.386292164872762
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.399867901197609
    }
  ],
  "compression_ladder": [
    {
      "c": 1,
      "rfd": 1.4863736913380285
    },
    {
      "c": 1.41421356237,
      "rfd": 1.4827444817939697
    },
    {
      "c": 1.5,
      "rfd": 1.4839839987785124
    },
    {
      "c": 1.618033988749895,
      "rfd": 1.4810644548847323
    },
    {
      "c": 1.7,
      "rfd": 1.47772101680382
    },
    {
      "c": 2,
      "rfd": 1.483132284679414
    },
    {
      "c": 2.718281828459045,
      "rfd": 1.4904806906023886
    }
  ],
  "feedback_named": [
    {
      "name": "baseline",
      "c": 1,
      "rfd": 4.776289322365893
    },
    {
      "name": "egs",
      "c": 1.618033988749895,
      "rfd": 2.366976092085179
    },
    {
      "name": "sqrt2",
      "c": 1.4142135623730951,
      "rfd": 3.1991462832286683
    },
    {
      "name": "e",
      "c": 2.718281828459045,
      "rfd": 5.23381928612365
    }
  ],
  "mechanism_winners_on_probe": {
    "scaling": "egs",
    "recursive_weighting": "egs",
    "hierarchical_resolution": "sqrt2",
    "recursive_feedback": "egs",
    "recursive_compression": "e"
  },
  "baseline_wins_on_probe": 0,
  "severity_parity": {
    "hierarchical": {
      "lo": 0.5718486779805406,
      "hi": 0.5829786198438458,
      "ratio": 1.019463089260974
    },
    "compression": {
      "lo": 0.8489254560381524,
      "hi": 0.8884887816529214,
      "ratio": 1.0466040043131786
    }
  },
  "checks": {
    "noIdentityTrap": true,
    "notMonotoneCoarsening": true,
    "feedbackNotInverseGain": true,
    "baselineNotMajorityChamp": true,
    "severityParity": true
  },
  "pass": true,
  "interpretation": "Fails if c=1 is still the mildest dial or if scaling/weighting are null transforms — the V1 construction bug.",
  "honesty": "Anti-bias lock ≠ Φ win. Empirical outcomes still free to null."
}
```

### E1_five_arm_matched — Five-arm matched recursion (baseline · Φ · √2 · e · random)

- **Pass:** `true`
- **Interpretation:** Identical recursion/evaluator; only c differs. Compare cumulative RFD trajectories — do not crown Φ unless it wins fair.
- **Honesty:** Proxy fixtures for V1; live public pulls can extend domains later.

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
          "rfd_final": 0.20806435872109347,
          "fidelity_final": 0.032206813368563396,
          "drift_slope_b": 0.028942780594821756,
          "drift_a": 0.1929376077776981
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.21493649625445305,
          "fidelity_final": 0.026515131751057085,
          "drift_slope_b": 0.1866066689807918,
          "drift_a": 0.12471163439111957
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20819962663077243,
          "fidelity_final": 0.01727472303491976,
          "drift_slope_b": 0.17638061842155214,
          "drift_a": 0.126419171561604
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.21030117097829967,
          "fidelity_final": 0,
          "drift_slope_b": 0.0034768103055771984,
          "drift_a": 0.21070180481313483
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20845568305855233,
          "fidelity_final": 0,
          "drift_slope_b": 0.08698243234190665,
          "drift_a": 0.16423103472429526
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20823467026976794,
          "fidelity_final": 0.013010367667019919,
          "drift_slope_b": 0.1735791141276288,
          "drift_a": 0.1276172425798873
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
          "rfd_final": 0.20869460101332543,
          "fidelity_final": 0.0012875136726565163,
          "drift_slope_b": -0.004783799470042705,
          "drift_a": 0.2125246534537567
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.21413086110438329,
          "fidelity_final": 0.1490716350708555,
          "drift_slope_b": 0.17664844122685922,
          "drift_a": 0.12669308494689746
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20724336799324117,
          "fidelity_final": 0.09866221911454622,
          "drift_slope_b": 0.1768114684014715,
          "drift_a": 0.12416727621916225
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.21449863981209666,
          "fidelity_final": 0,
          "drift_slope_b": -0.045674236150105206,
          "drift_a": 0.244410011849544
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20840128862268312,
          "fidelity_final": 0.005778176002917151,
          "drift_slope_b": 0.08042900079393936,
          "drift_a": 0.16697372275410222
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20748309252699978,
          "fidelity_final": 0.08240058419427226,
          "drift_slope_b": 0.17541626346521155,
          "drift_a": 0.12500160591719067
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
          "rfd_final": 0.2077512203356262,
          "fidelity_final": 0.06602345737717981,
          "drift_slope_b": 0.014184569296627163,
          "drift_a": 0.19971252372984213
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.2077985575356959,
          "fidelity_final": 0.05981289731193788,
          "drift_slope_b": 0.014919471632139998,
          "drift_a": 0.19936004396721008
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.20772363643378997,
          "fidelity_final": 0.06583489708939265,
          "drift_slope_b": 0.014239377504110811,
          "drift_a": 0.19967246927779442
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.20777707682007315,
          "fidelity_final": 0.06193644420130347,
          "drift_slope_b": 0.014348228143554034,
          "drift_a": 0.19967802307455718
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.20770020764456384,
          "fidelity_final": 0.06642916716796535,
          "drift_slope_b": 0.013196962323543572,
          "drift_a": 0.20026468653444848
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.2076659403890789,
          "fidelity_final": 0.07031307604008567,
          "drift_slope_b": 0.012623381365876908,
          "drift_a": 0.20051145254045943
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
          "rfd_final": 0.5229042245514665,
          "fidelity_final": 0,
          "drift_slope_b": 0.46412829135203665,
          "drift_a": 0.12038604687617287
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.2874129982144599,
          "fidelity_final": 0,
          "drift_slope_b": 0.19168147115262735,
          "drift_a": 0.15856616298435208
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.3492360426733391,
          "fidelity_final": 0,
          "drift_slope_b": 0.2794334264395089,
          "drift_a": 0.14743344988572407
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.5548631667670525,
          "fidelity_final": 0.03469727717981114,
          "drift_slope_b": 0.4868455867642942,
          "drift_a": 0.11798788109823126
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.4401802185153528,
          "fidelity_final": 0.0296222922708706,
          "drift_slope_b": 0.3860058476120949,
          "drift_a": 0.1310475234014365
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.3445658957947401,
          "fidelity_final": 0.010307073919082506,
          "drift_slope_b": 0.28057422531625753,
          "drift_a": 0.14471576370813366
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
          "rfd_final": 0.20830618703709897,
          "fidelity_final": 0.005323036088072432,
          "drift_slope_b": 0.012972063198841333,
          "drift_a": 0.2011028916730982
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.20833741306520367,
          "fidelity_final": 0.011357753663779637,
          "drift_slope_b": 0.013414162601023216,
          "drift_a": 0.2009323577989467
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2086430816503137,
          "fidelity_final": 0,
          "drift_slope_b": 0.013561660544558443,
          "drift_a": 0.20101088618567303
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2083408842798784,
          "fidelity_final": 0.008035808474939466,
          "drift_slope_b": 0.013553935341463456,
          "drift_a": 0.20082337535938655
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.2083917397187364,
          "fidelity_final": 0.013485040926856673,
          "drift_slope_b": 0.012832599219477473,
          "drift_a": 0.20123003578048357
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.20836592233830606,
          "fidelity_final": 0.006977172412029434,
          "drift_slope_b": 0.012244218431912228,
          "drift_a": 0.2014999591111655
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
          "rfd_final": 0.32002599744401145,
          "fidelity_final": 0,
          "drift_slope_b": 0.34611963006608076,
          "drift_a": 0.10934002723696452
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.26264733160612863,
          "fidelity_final": 0.1052973626671072,
          "drift_slope_b": 0.2525472758411676,
          "drift_a": 0.11365761152133821
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.28495114247121267,
          "fidelity_final": 0,
          "drift_slope_b": 0.30369194473620026,
          "drift_a": 0.10503471529781601
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.3200721644133059,
          "fidelity_final": 0,
          "drift_slope_b": 0.33058778757844465,
          "drift_a": 0.11790995102922527
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.3114179733678515,
          "fidelity_final": 0,
          "drift_slope_b": 0.34527173011824214,
          "drift_a": 0.10323345256430942
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.28638855299355354,
          "fidelity_final": 0,
          "drift_slope_b": 0.30646703683174953,
          "drift_a": 0.10469248137980505
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
          "rfd_final": 0.2949343990658098,
          "fidelity_final": 0,
          "drift_slope_b": 0.2823030202843377,
          "drift_a": 0.11505742868490001
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.22262834983503982,
          "fidelity_final": 0.36292190579312145,
          "drift_slope_b": 0.19974877030854424,
          "drift_a": 0.12144949252344073
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.24233230345979326,
          "fidelity_final": 0.24034797954999834,
          "drift_slope_b": 0.23460850131437774,
          "drift_a": 0.11322095076331154
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.3088690448547099,
          "fidelity_final": 0,
          "drift_slope_b": 0.276175259939498,
          "drift_a": 0.12285891645481087
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.2725999496034915,
          "fidelity_final": 0.03329399885848726,
          "drift_slope_b": 0.27492687533097543,
          "drift_a": 0.10975328731403183
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.2436869863469121,
          "fidelity_final": 0.23159296639561416,
          "drift_slope_b": 0.23697805769660962,
          "drift_a": 0.11280807815007869
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
          "rfd_final": 0.13581947300149466,
          "fidelity_final": 0.765118622040536,
          "drift_slope_b": 0.16808572013418882,
          "drift_a": 0.0814253371489174
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.13519504798265009,
          "fidelity_final": 0.7675240847194721,
          "drift_slope_b": 0.17791426448117983,
          "drift_a": 0.07850164683214088
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.13510172790933797,
          "fidelity_final": 0.7684343336199674,
          "drift_slope_b": 0.17733725118287574,
          "drift_a": 0.0784310143108195
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.13503262788527004,
          "fidelity_final": 0.7677520117551287,
          "drift_slope_b": 0.168784434486461,
          "drift_a": 0.0806069090002368
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.13504179476409012,
          "fidelity_final": 0.7685669544564256,
          "drift_slope_b": 0.16900669202562607,
          "drift_a": 0.08051999262061811
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.13550923832320005,
          "fidelity_final": 0.766863407181505,
          "drift_slope_b": 0.16791396268309228,
          "drift_a": 0.08100868517836679
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
          "rfd_final": 0.16180484683284097,
          "fidelity_final": 0.6738529222306703,
          "drift_slope_b": 0.46345516650227414,
          "drift_a": 0.03787230804840847
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.11179565198771309,
          "fidelity_final": 0.8414026621804622,
          "drift_slope_b": 0.27475217574484667,
          "drift_a": 0.0478236138667088
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.11408016892659645,
          "fidelity_final": 0.8351788388135354,
          "drift_slope_b": 0.3130530391629786,
          "drift_a": 0.04342139999681269
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.17476979689511407,
          "fidelity_final": 0.6253861949247468,
          "drift_slope_b": 0.4839164010955667,
          "drift_a": 0.038195460532171654
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.16136522372951667,
          "fidelity_final": 0.6727467364454321,
          "drift_slope_b": 0.44254876306182805,
          "drift_a": 0.040956787981780644
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.1308385060796073,
          "fidelity_final": 0.7832203953212542,
          "drift_slope_b": 0.3648428819077059,
          "drift_a": 0.042491701449118575
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
          "rfd_final": 0.22280015109029985,
          "fidelity_final": 0.3637505935529134,
          "drift_slope_b": 0.3041015599814528,
          "drift_a": 0.08444287047201697
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.22142937008735222,
          "fidelity_final": 0.37127154006889135,
          "drift_slope_b": 0.31285125930268126,
          "drift_a": 0.08172015524188839
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.2220123880870923,
          "fidelity_final": 0.365865490433249,
          "drift_slope_b": 0.3147095327592684,
          "drift_a": 0.08161928958551296
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.2186925702502463,
          "fidelity_final": 0.3864552338116689,
          "drift_slope_b": 0.3079299080456573,
          "drift_a": 0.08176281162524386
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.22286968325786152,
          "fidelity_final": 0.3602539058174126,
          "drift_slope_b": 0.3023817479708097,
          "drift_a": 0.084891909362514
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.21976188763608803,
          "fidelity_final": 0.37719479285742663,
          "drift_slope_b": 0.3031996709715119,
          "drift_a": 0.08336481716690727
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
          "rfd_final": 1.466472704738783,
          "fidelity_final": 0,
          "drift_slope_b": -0.01315246493355298,
          "drift_a": 1.5201406057541167
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.4482490393981913,
          "fidelity_final": 0.21091423795906022,
          "drift_slope_b": -0.07901085547382387,
          "drift_a": 1.8495084131930444
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4663864966482059,
          "fidelity_final": 0.0039417351909074,
          "drift_slope_b": -0.03877871174100921,
          "drift_a": 1.6444694171367962
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4666905796694274,
          "fidelity_final": 0,
          "drift_slope_b": -0.014365710185645638,
          "drift_a": 1.524574684742966
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4663188830832516,
          "fidelity_final": 0,
          "drift_slope_b": -0.015426324143965773,
          "drift_a": 1.532695492953089
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4664586949150216,
          "fidelity_final": 0.0025099402509542877,
          "drift_slope_b": -0.03694973752630401,
          "drift_a": 1.6356320940359994
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
          "rfd_final": 1.4661576703069072,
          "fidelity_final": 0.009859162466750084,
          "drift_slope_b": -0.07449992841639835,
          "drift_a": 1.7969283605617274
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.72731736979684,
          "fidelity_final": 0,
          "drift_slope_b": -0.11191904776126764,
          "drift_a": 2.065964174386415
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.508334995288934,
          "fidelity_final": 0,
          "drift_slope_b": -0.060075587907340945,
          "drift_a": 1.7822718714834662
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4684552946385752,
          "fidelity_final": 0,
          "drift_slope_b": -0.08809104891175952,
          "drift_a": 1.8598247206477987
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.466218820670889,
          "fidelity_final": 0.010946563077836752,
          "drift_slope_b": -0.060424571254020475,
          "drift_a": 1.742115124119648
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.500115176780257,
          "fidelity_final": 0,
          "drift_slope_b": -0.059075083403358784,
          "drift_a": 1.7751180142666403
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
          "rfd_final": 1.465262145451852,
          "fidelity_final": 0.06118676120899185,
          "drift_slope_b": 0.22632190205117395,
          "drift_a": 0.7714342766474245
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.457815908271292,
          "fidelity_final": 0.11937208741059287,
          "drift_slope_b": 0.23555861877200152,
          "drift_a": 0.7450565608232462
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.457624045861441,
          "fidelity_final": 0.12031263515000505,
          "drift_slope_b": 0.23127927336917198,
          "drift_a": 0.7535444939057401
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.471879409529158,
          "fidelity_final": 0.03628786390983243,
          "drift_slope_b": 0.22988003264121595,
          "drift_a": 0.7658335651656208
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4579686743282754,
          "fidelity_final": 0.1030574444650733,
          "drift_slope_b": 0.22462082199121056,
          "drift_a": 0.7702367852217348
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4586237259476145,
          "fidelity_final": 0.12190220113867108,
          "drift_slope_b": 0.2292465436255151,
          "drift_a": 0.7588088799530097
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
          "rfd_final": 7.17211422157232,
          "fidelity_final": 0.028698820010509395,
          "drift_slope_b": 0.7270952631739296,
          "drift_a": 0.7622951124828582
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 3.0502468958179954,
          "fidelity_final": 0.15891272135765885,
          "drift_slope_b": 0.4261231526526786,
          "drift_a": 0.8020938338975045
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 4.153389012010185,
          "fidelity_final": 0.1330346650509428,
          "drift_slope_b": 0.5294198348185438,
          "drift_a": 0.8264019066898773
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 7.656327872446991,
          "fidelity_final": 0.17459963919654561,
          "drift_slope_b": 0.7605929517082912,
          "drift_a": 0.729197819897996
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 5.89958796120264,
          "fidelity_final": 0.10108352260400755,
          "drift_slope_b": 0.6570190433829604,
          "drift_a": 0.7876436311439465
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 4.211032364476041,
          "fidelity_final": 0.14373574998401856,
          "drift_slope_b": 0.5316390765793283,
          "drift_a": 0.8311051139514787
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
          "rfd_final": 1.5084306628839588,
          "fidelity_final": 0.011655797629837355,
          "drift_slope_b": 0.10305562489876834,
          "drift_a": 1.1422533654631308
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.499383956194872,
          "fidelity_final": 0.011287342299885579,
          "drift_slope_b": 0.11473301390197617,
          "drift_a": 1.0962509605607027
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4937077680897923,
          "fidelity_final": 0.01351532009154841,
          "drift_slope_b": 0.10881649864731881,
          "drift_a": 1.1117565198325043
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4991503018936454,
          "fidelity_final": 0.012330070404935719,
          "drift_slope_b": 0.10334974095353347,
          "drift_a": 1.1334829235869508
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4893228095930375,
          "fidelity_final": 0.016861093954575104,
          "drift_slope_b": 0.09973184606455367,
          "drift_a": 1.1385039498908966
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.486174151948732,
          "fidelity_final": 0.00969652722011886,
          "drift_slope_b": 0.10426656673915469,
          "drift_a": 1.1223745678884665
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
          "rfd_final": 0.11440639648303383,
          "fidelity_final": 0,
          "drift_slope_b": 0.196910068708963,
          "drift_a": 0.06390053572693855
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.10950773355662415,
          "fidelity_final": 0.09929129155161752,
          "drift_slope_b": 0.21730001395071938,
          "drift_a": 0.057166396517182146
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.1107420430488463,
          "fidelity_final": 0.051516356566142764,
          "drift_slope_b": 0.2244920986285991,
          "drift_a": 0.05661680775120159
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.11552269592994129,
          "fidelity_final": 0,
          "drift_slope_b": 0.1753184134709598,
          "drift_a": 0.0688156879783592
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.11293561143771903,
          "fidelity_final": 0,
          "drift_slope_b": 0.2165553952523821,
          "drift_a": 0.05939074959826655
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.11084008074018185,
          "fidelity_final": 0.048369401511113574,
          "drift_slope_b": 0.2246226778186865,
          "drift_a": 0.056654437128920154
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
          "rfd_final": 0.1125579303673123,
          "fidelity_final": 0.027469101482961295,
          "drift_slope_b": 0.19477338108605796,
          "drift_a": 0.06271405796362302
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.10686260355858744,
          "fidelity_final": 0.17541313413514484,
          "drift_slope_b": 0.21124738274197583,
          "drift_a": 0.05654463043953195
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.10730239900586437,
          "fidelity_final": 0.14345950046653191,
          "drift_slope_b": 0.22163934474485342,
          "drift_a": 0.05510408566532371
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.11447618095013655,
          "fidelity_final": 0,
          "drift_slope_b": 0.16740282296491754,
          "drift_a": 0.06917133365541915
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.11011634890588018,
          "fidelity_final": 0.07721335060508293,
          "drift_slope_b": 0.2189187965282578,
          "drift_a": 0.05716867680723166
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.10739558493830724,
          "fidelity_final": 0.1408262372573483,
          "drift_slope_b": 0.22214439512914586,
          "drift_a": 0.05507872590459921
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
          "rfd_final": 0.06394590825599236,
          "fidelity_final": 0.7221059714015803,
          "drift_slope_b": 0.19940438791016563,
          "drift_a": 0.034813816983710805
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.06399058946795388,
          "fidelity_final": 0.722048155891265,
          "drift_slope_b": 0.19109842281722184,
          "drift_a": 0.035723830129706494
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.06394709399358398,
          "fidelity_final": 0.7222418642313428,
          "drift_slope_b": 0.19327393721983496,
          "drift_a": 0.03541347513778052
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.06310286678732238,
          "fidelity_final": 0.7295257817405811,
          "drift_slope_b": 0.1656038728311571,
          "drift_a": 0.0376633125699813
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.06395386315633853,
          "fidelity_final": 0.7221161431893068,
          "drift_slope_b": 0.19326093258746876,
          "drift_a": 0.03520295606478108
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.06390802865655437,
          "fidelity_final": 0.7222416406519909,
          "drift_slope_b": 0.1818535631014083,
          "drift_a": 0.03643711551321412
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
          "rfd_final": 0.07865631852384539,
          "fidelity_final": 0.6401004028319636,
          "drift_slope_b": 0.49344941455118435,
          "drift_a": 0.01706610448431323
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.0509307514117359,
          "fidelity_final": 0.830103712155144,
          "drift_slope_b": 0.30330194826439977,
          "drift_a": 0.020451062223838856
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.058797978214784635,
          "fidelity_final": 0.778867831785619,
          "drift_slope_b": 0.35682083535925396,
          "drift_a": 0.020062781914713453
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.08682260097320116,
          "fidelity_final": 0.5708647407824894,
          "drift_slope_b": 0.5397224949960515,
          "drift_a": 0.01620375731538188
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.07215760849476001,
          "fidelity_final": 0.6847088659683227,
          "drift_slope_b": 0.4440639361777027,
          "drift_a": 0.018551992101998926
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.059063379399331976,
          "fidelity_final": 0.7770914721890452,
          "drift_slope_b": 0.3782067590191479,
          "drift_a": 0.018722522486573096
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
          "rfd_final": 0.05989538189308682,
          "fidelity_final": 0.8402370762784257,
          "drift_slope_b": 0.42806592716277225,
          "drift_a": 0.015292195758948605
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 0.060170244635173016,
          "fidelity_final": 0.8359547235618582,
          "drift_slope_b": 0.43216912716413475,
          "drift_a": 0.015337145917299087
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 0.06001295397629183,
          "fidelity_final": 0.8379402971212319,
          "drift_slope_b": 0.435046805561367,
          "drift_a": 0.01511499771629985
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 0.059757619676696676,
          "fidelity_final": 0.8407785105682489,
          "drift_slope_b": 0.4250768961056046,
          "drift_a": 0.015351844702633182
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 0.060001046707270404,
          "fidelity_final": 0.8374757150778229,
          "drift_slope_b": 0.4316849086761766,
          "drift_a": 0.015194284900741574
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 0.059989006583733614,
          "fidelity_final": 0.8377124746828736,
          "drift_slope_b": 0.4350836319008835,
          "drift_a": 0.015105226076532459
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
          "rfd_final": 11.272277344618574,
          "fidelity_final": 0.07624610632238331,
          "drift_slope_b": 0.5014023830584796,
          "drift_a": 2.349631934210975
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 8.630263040998978,
          "fidelity_final": 0.498229973427596,
          "drift_slope_b": 0.48217913968616677,
          "drift_a": 1.8643641658328323
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 9.342838148967546,
          "fidelity_final": 0.39623648555191304,
          "drift_slope_b": 0.5051551492782752,
          "drift_a": 1.8957652667731724
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 11.830131882039254,
          "fidelity_final": 0,
          "drift_slope_b": 0.4898164461387784,
          "drift_a": 2.565045532731569
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 10.456049626283813,
          "fidelity_final": 0.2199578010439963,
          "drift_slope_b": 0.5107646294418735,
          "drift_a": 2.1056715722985753
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 9.391215438398378,
          "fidelity_final": 0.38903356112709386,
          "drift_slope_b": 0.5060310624719124,
          "drift_a": 1.9014106387272418
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
          "rfd_final": 9.795816581726411,
          "fidelity_final": 0.34162881112536686,
          "drift_slope_b": 0.46749163254475473,
          "drift_a": 2.219815689841211
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 7.389013741465361,
          "fidelity_final": 0.642463914329979,
          "drift_slope_b": 0.4330532390033236,
          "drift_a": 1.8311425377413202
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 7.945299700381904,
          "fidelity_final": 0.5781056912015402,
          "drift_slope_b": 0.4647969819020927,
          "drift_a": 1.8022279996245585
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 10.389971446876412,
          "fidelity_final": 0.25851258859554965,
          "drift_slope_b": 0.4530671922263196,
          "drift_a": 2.462302855526433
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 8.979350117951435,
          "fidelity_final": 0.4509437390398864,
          "drift_slope_b": 0.4778071314941351,
          "drift_a": 1.9682789090635358
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 7.987409984760338,
          "fidelity_final": 0.5731758954300177,
          "drift_slope_b": 0.46620926788304173,
          "drift_a": 1.8046930958173348
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
          "rfd_final": 2.778494295226624,
          "fidelity_final": 0.9522406015346906,
          "drift_slope_b": 0.2730375645177192,
          "drift_a": 1.2090244435403028
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 2.761156336524726,
          "fidelity_final": 0.9528146685618057,
          "drift_slope_b": 0.2526958554060727,
          "drift_a": 1.2728991608507272
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 2.7583774534159016,
          "fidelity_final": 0.9529090528660783,
          "drift_slope_b": 0.2517449616977585,
          "drift_a": 1.2727833518595049
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 2.795585316892287,
          "fidelity_final": 0.9512046007163589,
          "drift_slope_b": 0.2259676270025275,
          "drift_a": 1.3938145134537214
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 2.7471534429215714,
          "fidelity_final": 0.9533315366609748,
          "drift_slope_b": 0.24807353232771176,
          "drift_a": 1.2774907697190527
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 2.7620981795240933,
          "fidelity_final": 0.952799824378805,
          "drift_slope_b": 0.22859968127361144,
          "drift_a": 1.3601408862713749
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
          "rfd_final": 248.5442009590373,
          "fidelity_final": 0,
          "drift_slope_b": 0.7352151565833447,
          "drift_a": 25.78491636786037
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 100.72090112187132,
          "fidelity_final": 0.06641692914842011,
          "drift_slope_b": 0.4123600025778185,
          "drift_a": 27.707806806164378
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 141.65073881261645,
          "fidelity_final": 0.05276248698458197,
          "drift_slope_b": 0.52982710192095,
          "drift_a": 28.209773949085033
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 270.25381150811984,
          "fidelity_final": 0.04521164417093836,
          "drift_slope_b": 0.7683139523597672,
          "drift_a": 25.160119058965087
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 204.69426129896686,
          "fidelity_final": 0.02799595357851426,
          "drift_slope_b": 0.6625809387797879,
          "drift_a": 26.893144574093437
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 144.11560091440174,
          "fidelity_final": 0.06334991664616572,
          "drift_slope_b": 0.5360531338895591,
          "drift_a": 28.118597305719636
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
          "rfd_final": 1.4311001248572546,
          "fidelity_final": 0.9871825607675344,
          "drift_slope_b": 0.09816706071113805,
          "drift_a": 1.1057662783746678
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 1.4287703463897437,
          "fidelity_final": 0.9872248240858441,
          "drift_slope_b": 0.10926978094143798,
          "drift_a": 1.0664974320855076
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 1.4303955504031107,
          "fidelity_final": 0.9872027172915109,
          "drift_slope_b": 0.10753560047275174,
          "drift_a": 1.0716730093491993
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 1.4354979825164185,
          "fidelity_final": 0.9871004410594605,
          "drift_slope_b": 0.1028298246409763,
          "drift_a": 1.0889593051152735
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 1.4324842160756717,
          "fidelity_final": 0.9871688487266312,
          "drift_slope_b": 0.09953368567594886,
          "drift_a": 1.0969013097185938
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 1.4345208102507971,
          "fidelity_final": 0.9871469359493776,
          "drift_slope_b": 0.10577045196844691,
          "drift_a": 1.0786486348890612
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
          "rfd_final": 63.783840480176764,
          "fidelity_final": 0,
          "drift_slope_b": 0.8548329462146608,
          "drift_a": 4.617040559176157
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 41.41182605461217,
          "fidelity_final": 0.31530017824989487,
          "drift_slope_b": 0.9152961302394403,
          "drift_a": 2.2718823549984752
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 48.62986712381543,
          "fidelity_final": 0.032486871236755165,
          "drift_slope_b": 0.9143655076678289,
          "drift_a": 2.728742741654796
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 66.08959369527798,
          "fidelity_final": 0,
          "drift_slope_b": 0.8218846440882486,
          "drift_a": 5.472466778894125
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 58.360334733114804,
          "fidelity_final": 0,
          "drift_slope_b": 0.8891132470366991,
          "drift_a": 3.6673307880576895
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 49.092219244161576,
          "fidelity_final": 0.012414778878688613,
          "drift_slope_b": 0.9137955475896589,
          "drift_a": 2.7632866544522243
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
          "rfd_final": 51.985112089906735,
          "fidelity_final": 0,
          "drift_slope_b": 0.8721700172047094,
          "drift_a": 3.3240313453311066
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 29.441784342026846,
          "fidelity_final": 0.659960964406136,
          "drift_slope_b": 0.8497593433500935,
          "drift_a": 1.9182272677394807
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 35.4387132606335,
          "fidelity_final": 0.5013503747874668,
          "drift_slope_b": 0.8735028333439304,
          "drift_a": 2.177211041433167
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 56.8673007158899,
          "fidelity_final": 0,
          "drift_slope_b": 0.8606594648888455,
          "drift_a": 3.8166669251803564
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 44.8766032868837,
          "fidelity_final": 0.1887722303801053,
          "drift_slope_b": 0.8807394454138987,
          "drift_a": 2.7508675328529613
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 35.84369874461012,
          "fidelity_final": 0.4895129748518084,
          "drift_slope_b": 0.8744271168395007,
          "drift_a": 2.197823018808865
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
          "rfd_final": 3.191695099201777,
          "fidelity_final": 0.9971562036093892,
          "drift_slope_b": 0.1455856783279454,
          "drift_a": 1.9341934988872638
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 3.16653515458925,
          "fidelity_final": 0.9971687984244727,
          "drift_slope_b": 0.1370379839557578,
          "drift_a": 1.9666567698445707
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 3.1807933364646663,
          "fidelity_final": 0.9971750342371943,
          "drift_slope_b": 0.14130873550131445,
          "drift_a": 1.9508410904736095
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 3.1996075457945277,
          "fidelity_final": 0.9971720483108215,
          "drift_slope_b": 0.14105744017294886,
          "drift_a": 1.9626625984580732
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 3.1811421783473937,
          "fidelity_final": 0.9971929889701857,
          "drift_slope_b": 0.1393920789157097,
          "drift_a": 1.9598736556704923
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 3.225395244161621,
          "fidelity_final": 0.99717177619146,
          "drift_slope_b": 0.14111225293118265,
          "drift_a": 1.9753244113271453
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
          "rfd_final": 48.99787318965687,
          "fidelity_final": 0.5054017798589235,
          "drift_slope_b": 0.7312480141208582,
          "drift_a": 5.139711845862514
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 20.2744726733282,
          "fidelity_final": 0.8594338026837671,
          "drift_slope_b": 0.4000265624065915,
          "drift_a": 5.801053272533147
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 28.317623012216213,
          "fidelity_final": 0.7571833889603866,
          "drift_slope_b": 0.5249727024919952,
          "drift_a": 5.715425450182193
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 53.708275765872976,
          "fidelity_final": 0.4353498274276485,
          "drift_slope_b": 0.7646594158940827,
          "drift_a": 5.048460384622434
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 40.678579770043704,
          "fidelity_final": 0.597493442390526,
          "drift_slope_b": 0.6543748941413328,
          "drift_a": 5.4706878296221255
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 28.657812441432345,
          "fidelity_final": 0.7522007213575241,
          "drift_slope_b": 0.5359935884313637,
          "drift_a": 5.579869383980109
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
          "rfd_final": 26.007407837988676,
          "fidelity_final": 0.734677647225739,
          "drift_slope_b": 0.8599952941906895,
          "drift_a": 1.6555371073824858
        },
        "egs": {
          "c": 1.618033988749895,
          "rfd_final": 25.942744486370152,
          "fidelity_final": 0.7360901082595533,
          "drift_slope_b": 0.8678089538228397,
          "drift_a": 1.6114767603684794
        },
        "sqrt2": {
          "c": 1.4142135623730951,
          "rfd_final": 26.00724000094784,
          "fidelity_final": 0.7350558965616686,
          "drift_slope_b": 0.8640519421741959,
          "drift_a": 1.6356143517272252
        },
        "e": {
          "c": 2.718281828459045,
          "rfd_final": 26.034267592869327,
          "fidelity_final": 0.7343880404586532,
          "drift_slope_b": 0.8550788363780297,
          "drift_a": 1.6816217801644138
        },
        "random_0": {
          "c": 1.1866168970242144,
          "rfd_final": 26.01667318087943,
          "fidelity_final": 0.7348828853843763,
          "drift_slope_b": 0.8598557450188724,
          "drift_a": 1.6569624281789386
        },
        "random_1": {
          "c": 2.125803225208074,
          "rfd_final": 25.93312964053948,
          "fidelity_final": 0.7362998075019976,
          "drift_slope_b": 0.8648901907574449,
          "drift_a": 1.6254264485749441
        }
      }
    }
  ],
  "pass": true,
  "interpretation": "Identical recursion/evaluator; only c differs. Compare cumulative RFD trajectories — do not crown Φ unless it wins fair.",
  "honesty": "Proxy fixtures for V1; live public pulls can extend domains later."
}
```

### E2_blind_constant_ladder — Blind constant ladder (φ unlabeled at compare time)

- **Pass:** `true`
- **Interpretation:** If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.
- **Honesty:** Single-series blind ladder is illustrative; multi-domain aggregation is the real test.

```json
{
  "id": "E2_blind_constant_ladder",
  "title": "Blind constant ladder (φ unlabeled at compare time)",
  "mechanism": "recursive_compression",
  "results": [
    {
      "c": 1,
      "rfd_final": 1.5121177791488232,
      "slope_b": 0.10592135202076634,
      "is_phi": false
    },
    {
      "c": 1.41421356237,
      "rfd_final": 1.4977013801631927,
      "slope_b": 0.11188720684675758,
      "is_phi": false
    },
    {
      "c": 1.5,
      "rfd_final": 1.49375894073308,
      "slope_b": 0.10876821938424977,
      "is_phi": false
    },
    {
      "c": 1.618033988749895,
      "rfd_final": 1.504234237134742,
      "slope_b": 0.11681193763183688,
      "is_phi": true
    },
    {
      "c": 1.7,
      "rfd_final": 1.4918325962741383,
      "slope_b": 0.10952777652720665,
      "is_phi": false
    },
    {
      "c": 2,
      "rfd_final": 1.49052325144673,
      "slope_b": 0.10908141306186193,
      "is_phi": false
    },
    {
      "c": 2.718281828459045,
      "rfd_final": 1.5033832903345932,
      "slope_b": 0.10563252571808134,
      "is_phi": false
    }
  ],
  "ranked_c": [
    2,
    1.7,
    1.5,
    1.41421356237,
    2.718281828459045,
    1.618033988749895,
    1
  ],
  "phi_rank_by_lowest_rfd": 6,
  "pass": true,
  "interpretation": "If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.",
  "honesty": "Single-series blind ladder is illustrative; multi-domain aggregation is the real test."
}
```

### E3_constant_sweep — Continuous Drift(c) sweep with train/hold split

- **Pass:** `true`
- **Interpretation:** Pronounced minimum near φ on held-out kinds would be interesting; absence falsifies the strong claim for this mechanism/fixture set.
- **Honesty:** Sweep minima are fixture-relative; do not promote to CODATA.

```json
{
  "id": "E3_constant_sweep",
  "title": "Continuous Drift(c) sweep with train/hold split",
  "mechanism": "recursive_feedback",
  "HOLD_OUT_FRACTION": 0.25,
  "train_min": {
    "c": 1.75,
    "rfd": 19.596209502737832
  },
  "hold_min": {
    "c": 1.75,
    "rfd": 8.553672630965842
  },
  "train_min_near_phi": false,
  "hold_min_near_phi": false,
  "train_curve_sample": [
    {
      "c": 1,
      "rfd": 50.81423785306793
    },
    {
      "c": 1.125,
      "rfd": 46.59445705687788
    },
    {
      "c": 1.25,
      "rfd": 40.28888647159076
    },
    {
      "c": 1.375,
      "rfd": 42.41999195124774
    },
    {
      "c": 1.5,
      "rfd": 27.096964246594045
    },
    {
      "c": 1.625,
      "rfd": 21.84665089552913
    },
    {
      "c": 1.75,
      "rfd": 19.596209502737832
    },
    {
      "c": 1.875,
      "rfd": 21.14660330010405
    },
    {
      "c": 2,
      "rfd": 25.615320169234842
    },
    {
      "c": 2.125,
      "rfd": 32.54348390925023
    },
    {
      "c": 2.25,
      "rfd": 38.320329358024786
    },
    {
      "c": 2.375,
      "rfd": 45.05000389677198
    },
    {
      "c": 2.5,
      "rfd": 50.08720269116914
    }
  ],
  "hold_curve_sample": [
    {
      "c": 1,
      "rfd": 22.04915743923881
    },
    {
      "c": 1.125,
      "rfd": 20.26506650814499
    },
    {
      "c": 1.25,
      "rfd": 17.642345671129938
    },
    {
      "c": 1.375,
      "rfd": 18.414310188191326
    },
    {
      "c": 1.5,
      "rfd": 11.832785068385933
    },
    {
      "c": 1.625,
      "rfd": 9.539435515700088
    },
    {
      "c": 1.75,
      "rfd": 8.553672630965842
    },
    {
      "c": 1.875,
      "rfd": 9.16715946558695
    },
    {
      "c": 2,
      "rfd": 11.106655551743174
    },
    {
      "c": 2.125,
      "rfd": 14.153031537443226
    },
    {
      "c": 2.25,
      "rfd": 16.54643092064179
    },
    {
      "c": 2.375,
      "rfd": 19.492665201621854
    },
    {
      "c": 2.5,
      "rfd": 21.730779735014398
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
        "a": 0.19960121169621864,
        "b": 0.01447101790518713,
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
          "rfd": 0.2045649890080351,
          "F": 0.17858946906057782
        },
        {
          "n": 2,
          "rfd": 0.19536409324718904,
          "F": 0.44489235834870244
        },
        {
          "n": 3,
          "rfd": 0.20445907810350994,
          "F": 0.1701011927461715
        },
        {
          "n": 4,
          "rfd": 0.20484939830650925,
          "F": 0.1628662466440638
        },
        {
          "n": 5,
          "rfd": 0.20596933547093085,
          "F": 0.11008233757219178
        },
        {
          "n": 6,
          "rfd": 0.20639938717414957,
          "F": 0.08667387905377895
        },
        {
          "n": 7,
          "rfd": 0.2067695687206213,
          "F": 0.06378761238831351
        },
        {
          "n": 8,
          "rfd": 0.2070099616386026,
          "F": 0.047714576991588466
        },
        {
          "n": 9,
          "rfd": 0.2071865559584566,
          "F": 0.03544902009679511
        },
        {
          "n": 10,
          "rfd": 0.20731136670881387,
          "F": 0.026676162601811066
        },
        {
          "n": 11,
          "rfd": 0.20740199432935305,
          "F": 0.020380234962233512
        },
        {
          "n": 12,
          "rfd": 0.20746862247985876,
          "F": 0.015894746685615364
        },
        {
          "n": 13,
          "rfd": 0.20751916096406883,
          "F": 0.01265732369328835
        },
        {
          "n": 14,
          "rfd": 0.2075589436514009,
          "F": 0.01027189785474051
        },
        {
          "n": 15,
          "rfd": 0.20759165369629695,
          "F": 0.008460294599401964
        },
        {
          "n": 16,
          "rfd": 0.20761972024691366,
          "F": 0.007037870662938827
        },
        {
          "n": 17,
          "rfd": 0.20764470675888225,
          "F": 0.005885636917067286
        },
        {
          "n": 18,
          "rfd": 0.2076675769747815,
          "F": 0.004929845580337313
        },
        {
          "n": 19,
          "rfd": 0.20768889594342413,
          "F": 0.004126340113313075
        },
        {
          "n": 20,
          "rfd": 0.20770897231736704,
          "F": 0.003449517561690768
        },
        {
          "n": 21,
          "rfd": 0.2077279585343486,
          "F": 0.0028847273276754464
        },
        {
          "n": 22,
          "rfd": 0.20774591901881037,
          "F": 0.002423269332517842
        },
        {
          "n": 23,
          "rfd": 0.20776287519275913,
          "F": 0.002059244923386873
        },
        {
          "n": 24,
          "rfd": 0.20777883381879966,
          "F": 0.0017876947789506013
        }
      ]
    },
    "egs": {
      "c": 1.618033988749895,
      "slope": {
        "a": 0.19976862288991187,
        "b": 0.014378118256720841,
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
          "rfd": 0.2014708231973019,
          "F": 0.23386194870553517
        },
        {
          "n": 2,
          "rfd": 0.19566968792896047,
          "F": 0.414104955587078
        },
        {
          "n": 3,
          "rfd": 0.2044229104302343,
          "F": 0.1656051636669637
        },
        {
          "n": 4,
          "rfd": 0.2050275648357085,
          "F": 0.1472605751592118
        },
        {
          "n": 5,
          "rfd": 0.20600721860251545,
          "F": 0.10568505281308183
        },
        {
          "n": 6,
          "rfd": 0.20648588359582115,
          "F": 0.08204447927757426
        },
        {
          "n": 7,
          "rfd": 0.2068705199511519,
          "F": 0.06098690032022421
        },
        {
          "n": 8,
          "rfd": 0.20714162171236597,
          "F": 0.04503849390752556
        },
        {
          "n": 9,
          "rfd": 0.20733892555864727,
          "F": 0.03291487152363813
        },
        {
          "n": 10,
          "rfd": 0.20747904820041582,
          "F": 0.02407682791060939
        },
        {
          "n": 11,
          "rfd": 0.20757786561173708,
          "F": 0.01777955185407015
        },
        {
          "n": 12,
          "rfd": 0.2076469067874144,
          "F": 0.013405201614993676
        },
        {
          "n": 13,
          "rfd": 0.2076949619231724,
          "F": 0.010440536479082165
        },
        {
          "n": 14,
          "rfd": 0.20772847519785934,
          "F": 0.008488042950480846
        },
        {
          "n": 15,
          "rfd": 0.20775212420883246,
          "F": 0.007247937757678236
        },
        {
          "n": 16,
          "rfd": 0.2077692523531782,
          "F": 0.00649966199157019
        },
        {
          "n": 17,
          "rfd": 0.2077822220821813,
          "F": 0.006083649251800355
        },
        {
          "n": 18,
          "rfd": 0.20779268383634683,
          "F": 0.005886051513770646
        },
        {
          "n": 19,
          "rfd": 0.20780177782928752,
          "F": 0.0058265800712401965
        },
        {
          "n": 20,
          "rfd": 0.20781028196362833,
          "F": 0.005849234642816216
        },
        {
          "n": 21,
          "rfd": 0.20781871854624057,
          "F": 0.005915423334865982
        },
        {
          "n": 22,
          "rfd": 0.20782743018637523,
          "F": 0.005998960472210225
        },
        {
          "n": 23,
          "rfd": 0.20783663318752066,
          "F": 0.00608248117724022
        },
        {
          "n": 24,
          "rfd": 0.20784645483154168,
          "F": 0.006154894122545766
        }
      ]
    },
    "sqrt2": {
      "c": 1.4142135623730951,
      "slope": {
        "a": 0.1993501773121463,
        "b": 0.014950385167433565,
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
          "rfd": 0.20275414193652674,
          "F": 0.21223903500717842
        },
        {
          "n": 2,
          "rfd": 0.19562795290317286,
          "F": 0.4083695042238327
        },
        {
          "n": 3,
          "rfd": 0.20413100698247683,
          "F": 0.17602900483747003
        },
        {
          "n": 4,
          "rfd": 0.2045740322160013,
          "F": 0.16737160766972548
        },
        {
          "n": 5,
          "rfd": 0.2056674151738083,
          "F": 0.12248566763950154
        },
        {
          "n": 6,
          "rfd": 0.20617755947219316,
          "F": 0.09807079809330448
        },
        {
          "n": 7,
          "rfd": 0.20661099575723463,
          "F": 0.07441285865216364
        },
        {
          "n": 8,
          "rfd": 0.2069134778691995,
          "F": 0.05641819669610086
        },
        {
          "n": 9,
          "rfd": 0.2071369692920935,
          "F": 0.04237295501544113
        },
        {
          "n": 10,
          "rfd": 0.20729677133906255,
          "F": 0.03195327888403275
        },
        {
          "n": 11,
          "rfd": 0.20741135610158357,
          "F": 0.024315079794556778
        },
        {
          "n": 12,
          "rfd": 0.20749354939372722,
          "F": 0.018785636052879133
        },
        {
          "n": 13,
          "rfd": 0.2075534534220788,
          "F": 0.014779827625457286
        },
        {
          "n": 14,
          "rfd": 0.20759842294134126,
          "F": 0.011846563913782023
        },
        {
          "n": 15,
          "rfd": 0.20763375814433246,
          "F": 0.00964752716083006
        },
        {
          "n": 16,
          "rfd": 0.2076631449312223,
          "F": 0.00793986758312317
        },
        {
          "n": 17,
          "rfd": 0.20768906306222862,
          "F": 0.006555151188301109
        },
        {
          "n": 18,
          "rfd": 0.2077131044731344,
          "F": 0.00538115802030057
        },
        {
          "n": 19,
          "rfd": 0.20773622513558815,
          "F": 0.004346572253801946
        },
        {
          "n": 20,
          "rfd": 0.20775893759890293,
          "F": 0.0034088813743836195
        },
        {
          "n": 21,
          "rfd": 0.20778145604268086,
          "F": 0.002545115517967321
        },
        {
          "n": 22,
          "rfd": 0.20780380340187632,
          "F": 0.001744989690362926
        },
        {
          "n": 23,
          "rfd": 0.20782588897570217,
          "F": 0.0010059713970322333
        },
        {
          "n": 24,
          "rfd": 0.20784756337636803,
          "F": 0.0003298382496958645
        }
      ]
    },
    "e": {
      "c": 2.718281828459045,
      "slope": {
        "a": 0.19949338493707028,
        "b": 0.014767241325757926,
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
          "rfd": 0.21005133960423708,
          "F": 0.08730549430870457
        },
        {
          "n": 2,
          "rfd": 0.19478101674747172,
          "F": 0.4480637338133758
        },
        {
          "n": 3,
          "rfd": 0.204879002472572,
          "F": 0.15008425721957352
        },
        {
          "n": 4,
          "rfd": 0.2048431053423083,
          "F": 0.15755648689377788
        },
        {
          "n": 5,
          "rfd": 0.20604331449650345,
          "F": 0.10435026329852898
        },
        {
          "n": 6,
          "rfd": 0.2064416051020289,
          "F": 0.08401003230285128
        },
        {
          "n": 7,
          "rfd": 0.20682130220991635,
          "F": 0.06245366210480286
        },
        {
          "n": 8,
          "rfd": 0.20706261884403965,
          "F": 0.0476619277915426
        },
        {
          "n": 9,
          "rfd": 0.20724329948503106,
          "F": 0.036182239971410894
        },
        {
          "n": 10,
          "rfd": 0.20737046039727391,
          "F": 0.027959240362336844
        },
        {
          "n": 11,
          "rfd": 0.20746223366853567,
          "F": 0.022016333764877657
        },
        {
          "n": 12,
          "rfd": 0.207528315332587,
          "F": 0.01776453866902534
        },
        {
          "n": 13,
          "rfd": 0.20757687438985817,
          "F": 0.014676364759502425
        },
        {
          "n": 14,
          "rfd": 0.2076135935777287,
          "F": 0.012378680210838182
        },
        {
          "n": 15,
          "rfd": 0.20764263620780343,
          "F": 0.010602674650407108
        },
        {
          "n": 16,
          "rfd": 0.2076669068952179,
          "F": 0.009166616105080683
        },
        {
          "n": 17,
          "rfd": 0.20768839193355837,
          "F": 0.007951001982641781
        },
        {
          "n": 18,
          "rfd": 0.20770838748331974,
          "F": 0.0068808777467941505
        },
        {
          "n": 19,
          "rfd": 0.20772768924555393,
          "F": 0.005911641183285136
        },
        {
          "n": 20,
          "rfd": 0.20774673716126643,
          "F": 0.005018733000405318
        },
        {
          "n": 21,
          "rfd": 0.20776572787712994,
          "F": 0.004190183719073269
        },
        {
          "n": 22,
          "rfd": 0.20778469994266593,
          "F": 0.0034214352311238544
        },
        {
          "n": 23,
          "rfd": 0.20780359723228894,
          "F": 0.0027118595959002177
        },
        {
          "n": 24,
          "rfd": 0.2078223147146128,
          "F": 0.0020625311313286826
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

ERFT V2 is a controlled, falsifiable recursive-fidelity protocol (V1 construction bias repaired). It does not assume Φ_EGS is correct, does not claim CODATA status, does not prove AGI safety, and does not upgrade Soft Story nesting grammar into unfinished physics. Suite pass = protocol integrity + reproducible fixtures; empirical Φ advantage is a measured outcome that may fail.
