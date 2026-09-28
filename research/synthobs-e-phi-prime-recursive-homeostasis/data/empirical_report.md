# e × φ × Prime Recursive Homeostasis — Unified Architecture + EPH-RH-D Diagnostic Matrix

**Document ID:** `WP-SYNTHOBS-E-PHI-PRIME-RECURSIVE-HOMEOSTASIS-2026-09-28`
**Registry ID:** `synthobs-e-phi-prime-recursive-homeostasis-2026-09`
**Protocol:** `EPH-RH-D-2026-09-28`
**Generated:** 2026-09-28T04:21:13.001Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass (suite integrity) | `true` |
| Passed | 15 / 15 |
| Significance gate | `false` |
| Engine shelf include | `false` |
| Φ_EGS | 1.618033988749895 |
| e | 2.718281828459045 |

**Engine shelf decision:** WITHHOLD — diagnostic gate failed or mixed; V1 null remains; still application companion.

## V1 free-run readout (locked development evidence)

V1 free-run (locked development evidence — Control A under-transformed vs unified).

| Arm | Goldilocks rate | Mean bleed | Mean E | Mean final D | E/(D+ε) |
|-----|-----------------|------------|--------|--------------|--------|
| Control A | 0.823 | 0.0575 | 0.0236 | 0.5433 | 0.0435 |
| Control B (randomized) | 0.495 | 0.0224 | 0.0715 | 1.3339 | 0.0536 |
| Unified e+φ+prime | 0.234 | 0.0423 | 0.0388 | 1.3869 | 0.0280 |

V1 Goldilocks gate: `false`. Deltas: Goldilocks vs A = -0.589, vs B = -0.260, bleed vs A = -0.0152.

## EPH-RH-D matched-budget readout (engine gate)

| Arm | Mean D | Mean B | Mean E | E/(D+ε) | Mean Q |
|-----|--------|--------|--------|--------|--------|
| Control A (matched intensity) | 0.9672 | 0.0377 | 0.0081 | 0.0106 | 1.031 |
| Control B random | 1.0434 | 0.0600 | 0.1529 | 0.1734 | 2.625 |
| Matched non-prime + regulator | 1.1470 | 0.0379 | 0.0289 | 0.0342 | 2.250 |
| Unified regulator + prime | 1.1981 | 0.0351 | 0.0274 | 0.0294 | 2.257 |
| Open-loop φ (V1-style) | 1.3856 | 0.0558 | 0.0599 | 0.0415 | 2.512 |

Checks: `{"E_above_A":true,"B_below_A":true,"D_positive":true,"D_bounded":true,"efficiency_above_A":true,"efficiency_above_matched_containment":false,"efficiency_above_openloop":false}`
Best order: `e_phi_p` · Best φ strength: `0.25` · Homeostatic signature rate: `0`

## Experiments

### E0_protocol_locks — Protocol locks — V1 free-run + EPH-RH-D diagnostic matrix

- **Pass:** `true`
- **Interpretation:** V1 Goldilocks hit-rate null stays locked. Engine pin uses EPH-RH-D matched-budget multidimensional gate.
- **Honesty:** Locks do not imply the hypothesis is true.

```json
{
  "id": "E0_protocol_locks",
  "title": "Protocol locks — V1 free-run + EPH-RH-D diagnostic matrix",
  "protocol": "EPH-RH-D-2026-09-28",
  "protocol_v1_locked": "EPH-RH-2026-09-28",
  "diagnostic_protocol": "EPH-RH-D-2026-09-28",
  "architecture_v1": "C_n → e-transform → φ-structure → p-containment → C_{n+1}",
  "architecture_d": "matched-Q · φ-as-regulator · prime vs matched non-prime · order perms · perturbation",
  "metrics": [
    "drift_D",
    "bleed_B",
    "useful_evolution_E",
    "efficiency_E_over_D",
    "path_length_Q"
  ],
  "goldilocks": {
    "D_LOW": 0.05,
    "D_COLLAPSE": 2.5,
    "BLEED_LOW": 0.08
  },
  "significanceGate_v1_locked": {
    "goldilocks_margin": 0.15,
    "require_bleed_below_baseline": true,
    "require_positive_evolution": true,
    "require_beat_randomized": true,
    "engine_shelf_requires_gate": false,
    "note": "V1 Goldilocks hit-rate gate is development evidence only; see DIAGNOSTIC_GATE."
  },
  "pass": true,
  "interpretation": "V1 Goldilocks hit-rate null stays locked. Engine pin uses EPH-RH-D matched-budget multidimensional gate.",
  "honesty": "Locks do not imply the hypothesis is true."
}
```

### E1_primary_unified_vs_controls — Primary — unified e+φ+prime vs Control A / Control B

- **Pass:** `true`
- **Interpretation:** Unified architecture did NOT clear the significance gate — exploratory negative/mixed on these fixtures.
- **Honesty:** Primary hypothesis concerns the COMBINATION. Null/mixed is a valid scientific outcome.

```json
{
  "id": "E1_primary_unified_vs_controls",
  "title": "Primary — unified e+φ+prime vs Control A / Control B",
  "control_a": {
    "n": 8,
    "meanFinalD": 0.5432526331745945,
    "meanFinalB": 0.03183902121570145,
    "meanFinalE": 0.006895999812315879,
    "meanD": 0.43044087516786766,
    "meanB": 0.05745918216400598,
    "meanE": 0.02364870650157334,
    "goldilocksRate": 0.8229166666666667,
    "attractorD": 0.5264298722040408,
    "fractionPositiveE": 1,
    "fractionBleedLow": 0.75
  },
  "control_b": {
    "n": 8,
    "meanFinalD": 1.333864116884288,
    "meanFinalB": 0.003800719076086491,
    "meanFinalE": 0.0012985004428102158,
    "meanD": 1.2304202931233537,
    "meanB": 0.022428789727108114,
    "meanE": 0.07146486493106119,
    "goldilocksRate": 0.49479166666666663,
    "attractorD": 1.3313178430890353,
    "fractionPositiveE": 1,
    "fractionBleedLow": 1
  },
  "unified": {
    "n": 8,
    "meanFinalD": 1.3868908117232488,
    "meanFinalB": 0.04917858584005903,
    "meanFinalE": 0.0016538695664819842,
    "meanD": 1.3174437352091282,
    "meanB": 0.04226173578533123,
    "meanE": 0.03881916627509832,
    "goldilocksRate": 0.234375,
    "attractorD": 1.3800119047090953,
    "fractionPositiveE": 1,
    "fractionBleedLow": 1
  },
  "deltas": {
    "goldilocks_vs_A": -0.5885416666666667,
    "goldilocks_vs_B": -0.26041666666666663,
    "bleed_vs_A": -0.015197446378674748,
    "evolution_vs_A": 0.015170459773524981
  },
  "significance_gate_pass": false,
  "gate_checks": {
    "beatsA": false,
    "beatsB": false,
    "bleedOk": true,
    "eOk": true
  },
  "hypothesis_supported": false,
  "pass": true,
  "interpretation": "Unified architecture did NOT clear the significance gate — exploratory negative/mixed on these fixtures.",
  "honesty": "Primary hypothesis concerns the COMBINATION. Null/mixed is a valid scientific outcome."
}
```

### E2_ablations — Ablations — remove e, φ, or prime from the unified stack

- **Pass:** `true`
- **Interpretation:** At least one ablation matched/beat the full combination — combination not uniquely necessary here.
- **Honesty:** Ablations are secondary; primary claim is still E1 combination vs controls.

```json
{
  "id": "E2_ablations",
  "title": "Ablations — remove e, φ, or prime from the unified stack",
  "summaries": {
    "unified": {
      "n": 8,
      "meanFinalD": 1.3868908117232488,
      "meanFinalB": 0.04917858584005903,
      "meanFinalE": 0.0016538695664819842,
      "meanD": 1.3174437352091282,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832,
      "goldilocksRate": 0.234375,
      "attractorD": 1.3800119047090953,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "ablate_e": {
      "n": 8,
      "meanFinalD": 1.3347301513776455,
      "meanFinalB": 0.023478887196790463,
      "meanFinalE": 0.0019158825765402338,
      "meanD": 1.2913188631052488,
      "meanB": 0.04346483601116855,
      "meanE": 0.038716039483887923,
      "goldilocksRate": 0.203125,
      "attractorD": 1.3379941334527392,
      "fractionPositiveE": 1,
      "fractionBleedLow": 0.875
    },
    "ablate_phi": {
      "n": 8,
      "meanFinalD": 0.9111007173483996,
      "meanFinalB": 0.04167169777819118,
      "meanFinalE": 0.04101658336830921,
      "meanD": 0.6259127116650125,
      "meanB": 0.04105291142266526,
      "meanE": 0.05228089559149244,
      "goldilocksRate": 0.8072916666666666,
      "attractorD": 0.8646651331926714,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "ablate_prime": {
      "n": 8,
      "meanFinalD": 1.4206023380100374,
      "meanFinalB": 0.17999999999999997,
      "meanFinalE": 0.002768922008659127,
      "meanD": 1.336550483132079,
      "meanB": 0.18000000000000005,
      "meanE": 0.03755284488617537,
      "goldilocksRate": 0,
      "attractorD": 1.4189609625461583,
      "fractionPositiveE": 1,
      "fractionBleedLow": 0
    }
  },
  "combination_required_for_best": false,
  "pass": true,
  "interpretation": "At least one ablation matched/beat the full combination — combination not uniquely necessary here.",
  "honesty": "Ablations are secondary; primary claim is still E1 combination vs controls."
}
```

### E3_phi_e_formulations — φ × e interaction formulations (not declared EGS a priori)

- **Pass:** `true`
- **Interpretation:** Best formulation on Goldilocks rate: sequential_e_then_phi.
- **Honesty:** Comparing formulations is exploratory; none is crowned EGS law.

```json
{
  "id": "E3_phi_e_formulations",
  "title": "φ × e interaction formulations (not declared EGS a priori)",
  "byForm": {
    "sequential_e_then_phi": {
      "n": 8,
      "meanFinalD": 1.3868908117232488,
      "meanFinalB": 0.04917858584005903,
      "meanFinalE": 0.0016538695664819842,
      "meanD": 1.3174437352091282,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832,
      "goldilocksRate": 0.234375,
      "attractorD": 1.3800119047090953,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "e_pow_k_phi": {
      "n": 8,
      "meanFinalD": 1.4833047093364136,
      "meanFinalB": 0.05541260169567007,
      "meanFinalE": 0.001654033009482703,
      "meanD": 1.3539470221661982,
      "meanB": 0.04447782183879091,
      "meanE": 0.03873204340049748,
      "goldilocksRate": 0.22395833333333334,
      "attractorD": 1.4564929622004181,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "phi_times_e_k": {
      "n": 8,
      "meanFinalD": 1.8077276718593551,
      "meanFinalB": 0.06709548102689804,
      "meanFinalE": 0.0016538657284380144,
      "meanD": 1.6707204553617152,
      "meanB": 0.053397828690382676,
      "meanE": 0.03935827931663213,
      "goldilocksRate": 0.21875,
      "attractorD": 1.801967634628767,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "magnitude_e_structure_phi": {
      "n": 8,
      "meanFinalD": 1.3868908117232488,
      "meanFinalB": 0.04917858584005903,
      "meanFinalE": 0.0016538695664819842,
      "meanD": 1.3174437352091282,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832,
      "goldilocksRate": 0.234375,
      "attractorD": 1.3800119047090953,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    }
  },
  "ranked": [
    {
      "formulation": "sequential_e_then_phi",
      "goldilocksRate": 0.234375,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832
    },
    {
      "formulation": "magnitude_e_structure_phi",
      "goldilocksRate": 0.234375,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832
    },
    {
      "formulation": "e_pow_k_phi",
      "goldilocksRate": 0.22395833333333334,
      "meanB": 0.04447782183879091,
      "meanE": 0.03873204340049748
    },
    {
      "formulation": "phi_times_e_k",
      "goldilocksRate": 0.21875,
      "meanB": 0.053397828690382676,
      "meanE": 0.03935827931663213
    }
  ],
  "best": "sequential_e_then_phi",
  "pass": true,
  "interpretation": "Best formulation on Goldilocks rate: sequential_e_then_phi.",
  "honesty": "Comparing formulations is exploratory; none is crowned EGS law."
}
```

### E4_prime_schedules — Prime scheduling — size · boundary · interval · index

- **Pass:** `true`
- **Interpretation:** Prime scheduling reduced mean bleed vs ordinary recursion (best mode: index). Zero-bleed≈0 not required.
- **Honesty:** Primality is a hypothesis for containment — not presumed causal.

```json
{
  "id": "E4_prime_schedules",
  "title": "Prime scheduling — size · boundary · interval · index",
  "byMode": {
    "container_size": {
      "n": 8,
      "meanFinalD": 1.3868908117232488,
      "meanFinalB": 0.04917858584005903,
      "meanFinalE": 0.0016538695664819842,
      "meanD": 1.3174437352091282,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832,
      "goldilocksRate": 0.234375,
      "attractorD": 1.3800119047090953,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "boundary": {
      "n": 8,
      "meanFinalD": 1.3868908117232488,
      "meanFinalB": 0.04917858584005903,
      "meanFinalE": 0.0016538695664819842,
      "meanD": 1.3174437352091282,
      "meanB": 0.04226173578533123,
      "meanE": 0.03881916627509832,
      "goldilocksRate": 0.234375,
      "attractorD": 1.3800119047090953,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    },
    "interval": {
      "n": 8,
      "meanFinalD": 1.4200232828028354,
      "meanFinalB": 0.12,
      "meanFinalE": 0.0027868396451281308,
      "meanD": 1.3368838335709368,
      "meanB": 0.09855543898929506,
      "meanE": 0.037534139190930425,
      "goldilocksRate": 0.05208333333333333,
      "attractorD": 1.4185287878578605,
      "fractionPositiveE": 1,
      "fractionBleedLow": 0
    },
    "index": {
      "n": 8,
      "meanFinalD": 1.3910321732266284,
      "meanFinalB": 0.04582867308927862,
      "meanFinalE": 0.0008499673486155404,
      "meanD": 1.3197871087026227,
      "meanB": 0.035689446421360495,
      "meanE": 0.03845592870988164,
      "goldilocksRate": 0.2604166666666667,
      "attractorD": 1.3870077962616083,
      "fractionPositiveE": 1,
      "fractionBleedLow": 1
    }
  },
  "ranked": [
    {
      "mode": "index",
      "goldilocksRate": 0.2604166666666667,
      "meanB": 0.035689446421360495,
      "bleedAdvantageVsOrdinary": 0.021769735742645485
    },
    {
      "mode": "container_size",
      "goldilocksRate": 0.234375,
      "meanB": 0.04226173578533123,
      "bleedAdvantageVsOrdinary": 0.015197446378674748
    },
    {
      "mode": "boundary",
      "goldilocksRate": 0.234375,
      "meanB": 0.04226173578533123,
      "bleedAdvantageVsOrdinary": 0.015197446378674748
    },
    {
      "mode": "interval",
      "goldilocksRate": 0.05208333333333333,
      "meanB": 0.09855543898929506,
      "bleedAdvantageVsOrdinary": -0.04109625682528908
    }
  ],
  "best": "index",
  "control_a_meanB": 0.05745918216400598,
  "zero_bleed_observed": false,
  "bleed_reduced_vs_baseline": true,
  "pass": true,
  "interpretation": "Prime scheduling reduced mean bleed vs ordinary recursion (best mode: index). Zero-bleed≈0 not required.",
  "honesty": "Primality is a hypothesis for containment — not presumed causal."
}
```

### E5_nonzero_attractor — Emergent attractor — D* > 0 bounded with useful evolution?

- **Pass:** `true`
- **Interpretation:** Late-path drift sits in a nonzero bounded band with positive useful evolution — consistent with evolution-without-dissolution on these fixtures.
- **Honesty:** Attractor talk is fixture-relative — not a proof of physical homeostasis.

```json
{
  "id": "E5_nonzero_attractor",
  "title": "Emergent attractor — D* > 0 bounded with useful evolution?",
  "meanAttractorD": 1.3800119047090953,
  "attractors": [
    1.4669404737389975,
    1.118119607614622,
    1.506252543153226,
    1.453455950074405,
    1.4634963757873531,
    1.1242456189080818,
    1.508989816455801,
    1.3985948519402756
  ],
  "nonzero_bounded": true,
  "meanE": 0.03881916627509832,
  "evolving": true,
  "pass": true,
  "interpretation": "Late-path drift sits in a nonzero bounded band with positive useful evolution — consistent with evolution-without-dissolution on these fixtures.",
  "honesty": "Attractor talk is fixture-relative — not a proof of physical homeostasis."
}
```

### E6_paper_locks — Paper narrative locks

- **Pass:** `true`
- **Interpretation:** Paper must keep unified hypothesis, D/B/E, falsification, ERFT lineage, V1 null, and EPH-RH-D diagnostic.
- **Honesty:** Structural text locks — not market validation.

```json
{
  "id": "E6_paper_locks",
  "title": "Paper narrative locks",
  "paperPath": "/workspace/docs/SYNTHOBS_E_PHI_PRIME_RECURSIVE_HOMEOSTASIS_EGS_2026-09.md",
  "hasHonesty": true,
  "hasDocId": true,
  "hasUnified": true,
  "hasBleed": true,
  "hasDrift": true,
  "hasEvolution": true,
  "hasFalsification": true,
  "hasErftLink": true,
  "hasOperator": true,
  "hasGate": true,
  "hasDiagnostic": true,
  "pass": true,
  "interpretation": "Paper must keep unified hypothesis, D/B/E, falsification, ERFT lineage, V1 null, and EPH-RH-D diagnostic.",
  "honesty": "Structural text locks — not market validation."
}
```

### E7_blog_locks — Ship-blog live-findings locks

- **Pass:** `true`
- **Interpretation:** Blog must lead with observed answer and name the unified architecture.
- **Honesty:** Editorial lock — not empirical proof.

```json
{
  "id": "E7_blog_locks",
  "title": "Ship-blog live-findings locks",
  "blogPath": "/workspace/interfaces/blog-e-phi-prime-recursive-homeostasis-2026-09.html",
  "slug": "e-phi-prime-recursive-homeostasis",
  "exists": true,
  "hasLiveFindings": true,
  "hasUnified": true,
  "hasHonestyClass": true,
  "mentionsControls": true,
  "hasDiagnostic": true,
  "pass": true,
  "interpretation": "Blog must lead with observed answer and name the unified architecture.",
  "honesty": "Editorial lock — not empirical proof."
}
```

### E8_registry_surface — Registry / standalone surface constants

- **Pass:** `true`
- **Interpretation:** Ids point at the unified e×φ×prime expedition.
- **Honesty:** Naming lock.

```json
{
  "id": "E8_registry_surface",
  "title": "Registry / standalone surface constants",
  "DOC_ID": "WP-SYNTHOBS-E-PHI-PRIME-RECURSIVE-HOMEOSTASIS-2026-09-28",
  "REGISTRY_ID": "synthobs-e-phi-prime-recursive-homeostasis-2026-09",
  "STANDALONE_REPO": "https://github.com/FractiAI/synthobs-e-phi-prime-recursive-homeostasis",
  "PAPER_NAME": "SYNTHOBS_E_PHI_PRIME_RECURSIVE_HOMEOSTASIS_EGS_2026-09.md",
  "SHIP_BLOG_FILE": "blog-e-phi-prime-recursive-homeostasis-2026-09.html",
  "pass": true,
  "interpretation": "Ids point at the unified e×φ×prime expedition.",
  "honesty": "Naming lock."
}
```

### D0_protocol — EPH-RH-D protocol — matched budget · efficiency · regulator φ

- **Pass:** `true`
- **Interpretation:** Diagnostic matrix separates transformation intensity from architecture quality. V1 Goldilocks hit-rate remains locked development evidence.
- **Honesty:** Troubleshooting layer — not a silent rewrite of V1 null.

```json
{
  "id": "D0_protocol",
  "title": "EPH-RH-D protocol — matched budget · efficiency · regulator φ",
  "protocol": "EPH-RH-D-2026-09-28",
  "qTarget": 2.4,
  "gate": {
    "require_E_above_A": true,
    "require_B_below_A": true,
    "require_D_positive": true,
    "require_D_bounded": true,
    "require_efficiency_above_A": true,
    "require_beat_matched_containment_efficiency": true,
    "engine_shelf_requires_gate": true
  },
  "pass": true,
  "interpretation": "Diagnostic matrix separates transformation intensity from architecture quality. V1 Goldilocks hit-rate remains locked development evidence.",
  "honesty": "Troubleshooting layer — not a silent rewrite of V1 null."
}
```

### D1_matched_budget_pareto — Matched-Q comparison — A / random B / matched non-prime / regulator / open-loop

- **Pass:** `true`
- **Interpretation:** Under matched transformation budget, regulator φ + prime does NOT clear the multidimensional gate — report which checks failed.
- **Honesty:** Primary diagnostic question: same change budget → better E/D and lower B? Goldilocks hit-rate is secondary.

```json
{
  "id": "D1_matched_budget_pareto",
  "title": "Matched-Q comparison — A / random B / matched non-prime / regulator / open-loop",
  "control_a": {
    "n": 8,
    "meanD": 0.9671641737168887,
    "sdD": 0.6526966848870601,
    "meanB": 0.037668105760673865,
    "sdB": 0.027128390805038687,
    "meanE": 0.008100503684573861,
    "sdE": 0.0024786937835892995,
    "meanEfficiency": 0.010634508045639191,
    "sdEfficiency": 0.0038835625319784965,
    "meanQ": 1.0305133734714689,
    "meanSteps": 72
  },
  "control_b_random": {
    "n": 8,
    "meanD": 1.0433723601707687,
    "sdD": 0.2623569877464959,
    "meanB": 0.060016338034034514,
    "sdB": 0.050356921511837356,
    "meanE": 0.15289375478069375,
    "sdE": 0.09518056642585743,
    "meanEfficiency": 0.1734294636062572,
    "sdEfficiency": 0.15626319650524453,
    "meanQ": 2.625021667872409,
    "meanSteps": 21.375
  },
  "matched_nonprime": {
    "n": 8,
    "meanD": 1.1469836906980244,
    "sdD": 0.5587039871460283,
    "meanB": 0.037924709737258484,
    "sdB": 0.028430431491906324,
    "meanE": 0.028912341635812557,
    "sdE": 0.010447799991038386,
    "meanEfficiency": 0.03415844991451721,
    "sdEfficiency": 0.021574047421004158,
    "meanQ": 2.2496736891229623,
    "meanSteps": 45.875
  },
  "unified_regulator": {
    "n": 8,
    "meanD": 1.1980887845395165,
    "sdD": 0.5245615827308192,
    "meanB": 0.035054408708272755,
    "sdB": 0.02434910606482762,
    "meanE": 0.027357325085599005,
    "sdE": 0.0083318661345407,
    "meanEfficiency": 0.029373928632533162,
    "sdEfficiency": 0.017364053419586235,
    "meanQ": 2.2573318446710036,
    "meanSteps": 46.875
  },
  "unified_openloop_v1_style": {
    "n": 8,
    "meanD": 1.385598846215506,
    "sdD": 0.21326103682050274,
    "meanB": 0.05584964616053473,
    "sdB": 0.044864644254769055,
    "meanE": 0.05990912501148431,
    "sdE": 0.028035521218550612,
    "meanEfficiency": 0.0414668778039787,
    "sdEfficiency": 0.017722189533205014,
    "meanQ": 2.5124146923643313,
    "meanSteps": 16
  },
  "efficiency_ci": {
    "unified": {
      "lo": 0.018362078053140354,
      "hi": 0.041042969704840226,
      "mean": 0.029373928632533162
    },
    "control_a": {
      "lo": 0.008234166480994481,
      "hi": 0.013032792685335942,
      "mean": 0.010634508045639191
    }
  },
  "checks": {
    "E_above_A": true,
    "B_below_A": true,
    "D_positive": true,
    "D_bounded": true,
    "efficiency_above_A": true,
    "efficiency_above_matched_containment": false,
    "efficiency_above_openloop": false
  },
  "diagnostic_gate_pass": false,
  "pass": true,
  "interpretation": "Under matched transformation budget, regulator φ + prime does NOT clear the multidimensional gate — report which checks failed.",
  "honesty": "Primary diagnostic question: same change budget → better E/D and lower B? Goldilocks hit-rate is secondary."
}
```

### D2_phi_strength_sweep — φ regulator strength sweep (matched Q)

- **Pass:** `true`
- **Interpretation:** Tests whether φ coupling scale (not merely φ presence) drives efficiency.
- **Honesty:** Scale search is exploratory; not a claim that φ is optimal.

```json
{
  "id": "D2_phi_strength_sweep",
  "title": "φ regulator strength sweep (matched Q)",
  "phiSweep": {
    "1": {
      "n": 8,
      "meanD": 1.1980887845395165,
      "sdD": 0.5245615827308192,
      "meanB": 0.035054408708272755,
      "sdB": 0.02434910606482762,
      "meanE": 0.027357325085599005,
      "sdE": 0.0083318661345407,
      "meanEfficiency": 0.029373928632533162,
      "sdEfficiency": 0.017364053419586235,
      "meanQ": 2.2573318446710036,
      "meanSteps": 46.875
    },
    "0.25": {
      "n": 8,
      "meanD": 1.1892057550964918,
      "sdD": 0.5256183293335377,
      "meanB": 0.03604352666656275,
      "sdB": 0.025187167562157907,
      "meanE": 0.027080501329977302,
      "sdE": 0.008259632813958378,
      "meanEfficiency": 0.029378006909929102,
      "sdEfficiency": 0.017376510305059188,
      "meanQ": 2.2429358274182287,
      "meanSteps": 47.625
    },
    "0.5": {
      "n": 8,
      "meanD": 1.1944429175106632,
      "sdD": 0.5250441232043057,
      "meanB": 0.03560115890727436,
      "sdB": 0.0247867405926649,
      "meanE": 0.02705235287742429,
      "sdE": 0.008208362038296701,
      "meanEfficiency": 0.029219449216801464,
      "sdEfficiency": 0.017401433555912057,
      "meanQ": 2.2563870265765122,
      "meanSteps": 47.5
    },
    "1.5": {
      "n": 8,
      "meanD": 1.2044171986873562,
      "sdD": 0.5227034507680917,
      "meanB": 0.034530358762634134,
      "sdB": 0.023920071316266424,
      "meanE": 0.02751103523656692,
      "sdE": 0.008394668338441519,
      "meanEfficiency": 0.029332410536464158,
      "sdEfficiency": 0.017401260734165962,
      "meanQ": 2.2705231864442186,
      "meanSteps": 46.375
    }
  },
  "bestStrength": "0.25",
  "pass": true,
  "interpretation": "Tests whether φ coupling scale (not merely φ presence) drives efficiency.",
  "honesty": "Scale search is exploratory; not a claim that φ is optimal."
}
```

### D3_order_permutations — Operation order permutations (matched Q)

- **Pass:** `true`
- **Interpretation:** Best efficiency order on these fixtures: e_phi_p.
- **Honesty:** Ordering is an untested causal assumption in V1; permutations are diagnostic.

```json
{
  "id": "D3_order_permutations",
  "title": "Operation order permutations (matched Q)",
  "orderSweep": {
    "e_phi_p": {
      "n": 8,
      "meanD": 1.1980887845395165,
      "sdD": 0.5245615827308192,
      "meanB": 0.035054408708272755,
      "sdB": 0.02434910606482762,
      "meanE": 0.027357325085599005,
      "sdE": 0.0083318661345407,
      "meanEfficiency": 0.029373928632533162,
      "sdEfficiency": 0.017364053419586235,
      "meanQ": 2.2573318446710036,
      "meanSteps": 46.875
    },
    "e_p_phi": {
      "n": 8,
      "meanD": 1.2215179041543143,
      "sdD": 0.5120757800112343,
      "meanB": 0.034918550556416614,
      "sdB": 0.0238968301254624,
      "meanE": 0.025492831807316978,
      "sdE": 0.007245795420838754,
      "meanEfficiency": 0.026322332675190022,
      "sdEfficiency": 0.015100734041314788,
      "meanQ": 2.2474972691129436,
      "meanSteps": 48.625
    },
    "phi_e_p": {
      "n": 8,
      "meanD": 1.198101050270671,
      "sdD": 0.5245609485833234,
      "meanB": 0.035016673893833,
      "sdB": 0.024316716010762678,
      "meanE": 0.027346156997703312,
      "sdE": 0.008326070662340906,
      "meanEfficiency": 0.029364326818363384,
      "sdEfficiency": 0.01736628878758904,
      "meanQ": 2.257736141967969,
      "meanSteps": 46.875
    },
    "phi_p_e": {
      "n": 8,
      "meanD": 1.2416646257744492,
      "sdD": 0.5057104310908135,
      "meanB": 0.03492954402856317,
      "sdB": 0.024319013663791456,
      "meanE": 0.023916820622978008,
      "sdE": 0.006547864883898818,
      "meanEfficiency": 0.02405051034262865,
      "sdEfficiency": 0.01362397277032167,
      "meanQ": 2.228957475229687,
      "meanSteps": 50.375
    },
    "p_e_phi": {
      "n": 8,
      "meanD": 1.2492215692058593,
      "sdD": 0.5022036749567598,
      "meanB": 0.03414368122267566,
      "sdB": 0.023774444330681384,
      "meanE": 0.02253061936017106,
      "sdE": 0.005878932902672252,
      "meanEfficiency": 0.02235331445159716,
      "sdEfficiency": 0.012507763598908669,
      "meanQ": 2.2220720690805074,
      "meanSteps": 52.5
    },
    "p_phi_e": {
      "n": 8,
      "meanD": 1.2492301632193579,
      "sdD": 0.5022028912408933,
      "meanB": 0.03412735922217794,
      "sdB": 0.02375664282906397,
      "meanE": 0.022521561530708348,
      "sdE": 0.005870487332229052,
      "meanEfficiency": 0.022345611597963794,
      "sdEfficiency": 0.012507508423574674,
      "meanQ": 2.2223726462209354,
      "meanSteps": 52.5
    }
  },
  "bestOrder": "e_phi_p",
  "bestSummary": {
    "n": 8,
    "meanD": 1.1980887845395165,
    "sdD": 0.5245615827308192,
    "meanB": 0.035054408708272755,
    "sdB": 0.02434910606482762,
    "meanE": 0.027357325085599005,
    "sdE": 0.0083318661345407,
    "meanEfficiency": 0.029373928632533162,
    "sdEfficiency": 0.017364053419586235,
    "meanQ": 2.2573318446710036,
    "meanSteps": 46.875
  },
  "pass": true,
  "interpretation": "Best efficiency order on these fixtures: e_phi_p.",
  "honesty": "Ordering is an untested causal assumption in V1; permutations are diagnostic."
}
```

### D4_perturbation_recovery — Perturbation / recovery — high-D should self-correct

- **Pass:** `true`
- **Interpretation:** Homeostatic correction signature is weak/mixed under current regulator settings.
- **Honesty:** Static attractor ≠ homeostasis; this probe tests negative feedback around the band.

```json
{
  "id": "D4_perturbation_recovery",
  "title": "Perturbation / recovery — high-D should self-correct",
  "homeostaticSignatureRate": 0,
  "n": 8,
  "samples": [
    {
      "baseD": 0.24063603400066022,
      "low": {
        "Dp": 0.2434779777868306,
        "Dn": 0.2617960353085324,
        "delta": 0.01831805752170179,
        "towardBand": true
      },
      "high": {
        "Dp": 0.24112657126870138,
        "Dn": 0.26039057170475743,
        "delta": 0.019264000436056056,
        "towardBand": true
      },
      "homeostaticSignature": false
    },
    {
      "baseD": 0.4052425084164508,
      "low": {
        "Dp": 0.5347322632844163,
        "Dn": 0.48283147695790424,
        "delta": -0.051900786326512016,
        "towardBand": true
      },
      "high": {
        "Dp": 1.0712777206702722,
        "Dn": 1.1403934433821912,
        "delta": 0.06911572271191901,
        "towardBand": false
      },
      "homeostaticSignature": false
    },
    {
      "baseD": 0.21126158555684948,
      "low": {
        "Dp": 0.22297701784851143,
        "Dn": 0.2401530196503955,
        "delta": 0.017176001801884083,
        "towardBand": true
      },
      "high": {
        "Dp": 0.21437371232054384,
        "Dn": 0.23635202751835369,
        "delta": 0.02197831519780985,
        "towardBand": true
      },
      "homeostaticSignature": false
    }
  ],
  "pass": true,
  "interpretation": "Homeostatic correction signature is weak/mixed under current regulator settings.",
  "honesty": "Static attractor ≠ homeostasis; this probe tests negative feedback around the band."
}
```

### D5_prime_vs_matched_containment — Prime containment vs matched non-prime containment (same regulator)

- **Pass:** `true`
- **Interpretation:** No clean prime-specific advantage over matched non-prime containment on these fixtures.
- **Honesty:** Separates “containment helps” from “primality helps.”

```json
{
  "id": "D5_prime_vs_matched_containment",
  "title": "Prime containment vs matched non-prime containment (same regulator)",
  "prime": {
    "n": 8,
    "meanD": 1.1980887845395165,
    "sdD": 0.5245615827308192,
    "meanB": 0.035054408708272755,
    "sdB": 0.02434910606482762,
    "meanE": 0.027357325085599005,
    "sdE": 0.0083318661345407,
    "meanEfficiency": 0.029373928632533162,
    "sdEfficiency": 0.017364053419586235,
    "meanQ": 2.2573318446710036,
    "meanSteps": 46.875
  },
  "matched_nonprime": {
    "n": 8,
    "meanD": 1.1469836906980244,
    "sdD": 0.5587039871460283,
    "meanB": 0.037924709737258484,
    "sdB": 0.028430431491906324,
    "meanE": 0.028912341635812557,
    "sdE": 0.010447799991038386,
    "meanEfficiency": 0.03415844991451721,
    "sdEfficiency": 0.021574047421004158,
    "meanQ": 2.2496736891229623,
    "meanSteps": 45.875
  },
  "prime_wins_efficiency": false,
  "prime_wins_bleed": true,
  "pass": true,
  "interpretation": "No clean prime-specific advantage over matched non-prime containment on these fixtures.",
  "honesty": "Separates “containment helps” from “primality helps.”"
}
```

## Significance gate (pre-registered)

```json
{
  "goldilocks_margin": 0.15,
  "require_bleed_below_baseline": true,
  "require_positive_evolution": true,
  "require_beat_randomized": true,
  "engine_shelf_requires_gate": false,
  "note": "V1 Goldilocks hit-rate gate is development evidence only; see DIAGNOSTIC_GATE."
}
```

## Honesty boundary

Exploratory computational catalog suite for a unified e+φ+prime recursive architecture. V1 free-run Goldilocks hit-rate null is locked development evidence (Control A under-transformed). EPH-RH-D diagnostic matrix uses matched transformation budget, evolution efficiency E/(D+ε), φ-as-regulator, prime vs matched non-prime containment, order permutations, and perturbation recovery. Soft Story / fixture evidence only. Does not claim physical law, CODATA replacement, clinical validation, or finished homeostasis proof. Engine pin requires the EPH-RH-D multidimensional gate.
