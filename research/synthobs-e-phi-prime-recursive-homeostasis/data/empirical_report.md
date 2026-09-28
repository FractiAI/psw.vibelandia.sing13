# e × φ × Prime Recursive Homeostasis — Unified Architecture + D/D2 Diagnostic Fork

**Document ID:** `WP-SYNTHOBS-E-PHI-PRIME-RECURSIVE-HOMEOSTASIS-2026-09-28`
**Registry ID:** `synthobs-e-phi-prime-recursive-homeostasis-2026-09`
**Protocol:** `EPH-RH-D2-2026-09-28`
**Generated:** 2026-09-28T04:37:26.174Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass (suite integrity) | `true` |
| Passed | 22 / 22 |
| Significance gate | `false` |
| Engine shelf include | `false` |
| Φ_EGS | 1.618033988749895 |
| e | 2.718281828459045 |

**Engine shelf decision:** WITHHOLD — EPH-RH-D2 gate failed/mixed; V1 and D nulls remain; application companion only.

## V1 free-run readout (locked development evidence)

V1 free-run (locked development evidence — Control A under-transformed vs unified).

| Arm | Goldilocks rate | Mean bleed | Mean E | Mean final D | E/(D+ε) |
|-----|-----------------|------------|--------|--------------|--------|
| Control A | 0.823 | 0.0575 | 0.0236 | 0.5433 | 0.0435 |
| Control B (randomized) | 0.495 | 0.0224 | 0.0715 | 1.3339 | 0.0536 |
| Unified e+φ+prime | 0.234 | 0.0423 | 0.0388 | 1.3869 | 0.0280 |

V1 Goldilocks gate: `false`. Deltas: Goldilocks vs A = -0.589, vs B = -0.260, bleed vs A = -0.0152.

## EPH-RH-D matched-budget readout (locked diagnostic evidence)

| Arm | Mean D | Mean B | Mean E | E/(D+ε) | Mean Q |
|-----|--------|--------|--------|--------|--------|
| Control A (matched intensity) | 0.9672 | 0.0377 | 0.0081 | 0.0106 | 1.031 |
| Control B random | 1.0434 | 0.0600 | 0.1529 | 0.1734 | 2.625 |
| Matched non-prime + regulator | 1.1470 | 0.0379 | 0.0289 | 0.0342 | 2.250 |
| Unified regulator + prime | 1.1981 | 0.0351 | 0.0274 | 0.0294 | 2.257 |
| Open-loop φ (V1-style) | 1.3856 | 0.0558 | 0.0599 | 0.0415 | 2.512 |

Checks: `{"E_above_A":true,"B_below_A":true,"D_positive":true,"D_bounded":true,"efficiency_above_A":true,"efficiency_above_matched_containment":false,"efficiency_above_openloop":false}`
Best order: `e_phi_p` · Best φ strength: `0.25` · Homeostatic signature rate: `0`

## EPH-RH-D2 exact-Q / loss-aware F readout (engine gate)

Hypothesis rewrite: homeostasis = controlled transformation + adaptive proportional regulation + bounded compartmentalization. Metrics: step ΔX, irreversible loss L, identity I, F=(E·R·I)/(L+λB+ε).

| Arm | Mean F | Mean L | Mean B | Mean E | Mean stepΔX | Mean Q |
|-----|--------|--------|--------|--------|-------------|--------|
| Control A | 1.8449 | 0.0746 | 0.0569 | 0.1129 | 0.1283 | 2.400 |
| Random | 3.3525 | 0.0609 | 0.0504 | 0.2965 | 0.4614 | 2.400 |
| Sequential G (e→φ→p) | 3.0739 | 0.0656 | 0.0372 | 0.1026 | 0.1205 | 2.400 |
| Coupled H (e×φ×p) | 2.8538 | 0.0685 | 0.0398 | 0.1037 | 0.1196 | 2.400 |
| Open-loop φ sequential | 3.1576 | 0.0554 | 0.0478 | 0.1102 | 0.2976 | 2.400 |
| Matched non-prime coupled | 1.9534 | 0.0683 | 0.0384 | 0.1036 | 0.1196 | 2.400 |

D2 checks: `{"F_above_A":true,"F_above_matched_nonprime":true,"L_below_A":true,"B_below_A":true,"deltaX_positive":true,"coupled_beats_sequential":false,"adaptive_beats_openloop":false,"q_matched_all":true}`
Novelty inflation audit: E/D random leads=`true` · F random=3.3525 · F coupled=2.8538
Interaction: sequential F=3.0739 · coupled F=2.8538 · Δ=-0.2202
New-attractor homeostasis rate: `0`

## Experiments

### E0_protocol_locks — Protocol locks — V1 free-run + EPH-RH-D diagnostic matrix

- **Pass:** `true`
- **Interpretation:** V1 Goldilocks hit-rate null stays locked. Engine pin uses EPH-RH-D matched-budget multidimensional gate.
- **Honesty:** Locks do not imply the hypothesis is true.

```json
{
  "id": "E0_protocol_locks",
  "title": "Protocol locks — V1 free-run + EPH-RH-D diagnostic matrix",
  "protocol": "EPH-RH-D2-2026-09-28",
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

### D2_0_protocol — EPH-RH-D2 — exact Q · loss-aware F · adaptive φ · coupled interaction

- **Pass:** `true`
- **Interpretation:** D2 tests controlled transformation + adaptive proportional regulation + bounded compartmentalization with change and loss measured independently.
- **Honesty:** Does not rewrite V1 or EPH-RH-D locked nulls.

```json
{
  "id": "D2_0_protocol",
  "title": "EPH-RH-D2 — exact Q · loss-aware F · adaptive φ · coupled interaction",
  "protocol": "EPH-RH-D2-2026-09-28",
  "qMax": 2.4,
  "gate": {
    "require_F_above_A": true,
    "require_F_above_matched_nonprime": true,
    "require_L_below_A": true,
    "require_B_below_A": true,
    "require_deltaX_positive": true,
    "require_coupled_beats_sequential": true,
    "require_adaptive_beats_openloop": true,
    "engine_shelf_requires_gate": true
  },
  "pass": true,
  "interpretation": "D2 tests controlled transformation + adaptive proportional regulation + bounded compartmentalization with change and loss measured independently.",
  "honesty": "Does not rewrite V1 or EPH-RH-D locked nulls."
}
```

### D2_1_metric_audit — Diagnostic 1 — is E/D broken? Compare E/D · E/B · E/L · F

- **Pass:** `true`
- **Interpretation:** E/D still lets random novelty inflate; F / E/L are the cleaner scores.
- **Honesty:** Metric audit — not an engine crown.

```json
{
  "id": "D2_1_metric_audit",
  "title": "Diagnostic 1 — is E/D broken? Compare E/D · E/B · E/L · F",
  "noveltyInflation": {
    "random_E_over_D": 0.3693557815416844,
    "coupled_E_over_D": 0.23196745071890174,
    "random_F": 3.352467289163138,
    "coupled_F": 2.853778568853719,
    "random_E_over_L": 279.9037422373681,
    "coupled_E_over_L": 220.66777051138254,
    "F_suppresses_random_advantage": true,
    "E_over_D_random_leads": true
  },
  "random": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.29650556176570037,
    "sd_E": 0.08423917165292222,
    "mean_L": 0.06094270182240857,
    "sd_L": 0.09073559697541048,
    "mean_B": 0.05039215031832692,
    "sd_B": 0.04084632699693437,
    "mean_R": 0.5059943294350484,
    "sd_R": 0.19083881510881498,
    "mean_I": 0.9922890452188269,
    "sd_I": 0.014949972565035106,
    "mean_F": 3.352467289163138,
    "sd_F": 3.2245500120491593,
    "mean_stepD": 0.46137443818836055,
    "sd_stepD": 0.20694728825083,
    "mean_originD": 0.9084552656592861,
    "sd_originD": 0.13557390982558476,
    "mean_E_over_D": 0.3693557815416844,
    "sd_E_over_D": 0.14168292393165413,
    "mean_E_over_B": 110.33804812447404,
    "sd_E_over_B": 199.02300799501722,
    "mean_E_over_L": 279.9037422373681,
    "sd_E_over_L": 466.4134169262583,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 7.375,
    "sd_steps": 5.680480361981471
  },
  "coupled": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.10374947905284512,
    "sd_E": 0.02519140963575341,
    "mean_L": 0.06846364305024671,
    "sd_L": 0.10231849474854274,
    "mean_B": 0.03981961838818558,
    "sd_B": 0.028844407740151557,
    "mean_R": 0.8332423535646407,
    "sd_R": 0.17930361074242782,
    "mean_I": 0.9850433890754982,
    "sd_I": 0.030854555103999183,
    "mean_F": 2.853778568853719,
    "sd_F": 2.9349182833570757,
    "mean_stepD": 0.11958077536087072,
    "sd_stepD": 0.00007191665114774303,
    "mean_originD": 0.7892908476571125,
    "sd_originD": 0.4638847698816338,
    "mean_E_over_D": 0.23196745071890174,
    "sd_E_over_D": 0.09463876655189717,
    "mean_E_over_B": 17.89119610539286,
    "sd_E_over_B": 22.53592231443751,
    "mean_E_over_L": 220.66777051138254,
    "sd_E_over_L": 337.9133927275393,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 20,
    "sd_steps": 0
  },
  "pass": true,
  "interpretation": "E/D still lets random novelty inflate; F / E/L are the cleaner scores.",
  "honesty": "Metric audit — not an engine crown."
}
```

### D2_2_exact_Q_board — Diagnostic 4 — exact Q_MAX board (all arms)

- **Pass:** `true`
- **Interpretation:** Coupled adaptive architecture does not clear D2 gate — see failed checks.
- **Honesty:** Exact Q removes Control A under-spend confound from D.

```json
{
  "id": "D2_2_exact_Q_board",
  "title": "Diagnostic 4 — exact Q_MAX board (all arms)",
  "byArm": {
    "control_a": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.11286899629746253,
      "sd_E": 0.0274195339152819,
      "mean_L": 0.07456810660623946,
      "sd_L": 0.11170126100537502,
      "mean_B": 0.056876300692399046,
      "sd_B": 0.04938087203980522,
      "mean_R": 0.8405475591303233,
      "sd_R": 0.2123847017384338,
      "mean_I": 0.9838626703886612,
      "sd_I": 0.03367333827762943,
      "mean_F": 1.8449232059559015,
      "sd_F": 1.9711918772113637,
      "mean_stepD": 0.12830916439839662,
      "sd_stepD": 0.0097153639071597,
      "mean_originD": 0.8272709757492781,
      "sd_originD": 0.5861268964730076,
      "mean_E_over_D": 0.2463911765389555,
      "sd_E_over_D": 0.12884395700179724,
      "mean_E_over_B": 6.11441112868149,
      "sd_E_over_B": 6.382168338126551,
      "mean_E_over_L": 212.0415844474622,
      "sd_E_over_L": 330.1350297749665,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 18.75,
      "sd_steps": 1.3887301496588271
    },
    "random": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.29650556176570037,
      "sd_E": 0.08423917165292222,
      "mean_L": 0.06094270182240857,
      "sd_L": 0.09073559697541048,
      "mean_B": 0.05039215031832692,
      "sd_B": 0.04084632699693437,
      "mean_R": 0.5059943294350484,
      "sd_R": 0.19083881510881498,
      "mean_I": 0.9922890452188269,
      "sd_I": 0.014949972565035106,
      "mean_F": 3.352467289163138,
      "sd_F": 3.2245500120491593,
      "mean_stepD": 0.46137443818836055,
      "sd_stepD": 0.20694728825083,
      "mean_originD": 0.9084552656592861,
      "sd_originD": 0.13557390982558476,
      "mean_E_over_D": 0.3693557815416844,
      "sd_E_over_D": 0.14168292393165413,
      "mean_E_over_B": 110.33804812447404,
      "sd_E_over_B": 199.02300799501722,
      "mean_E_over_L": 279.9037422373681,
      "sd_E_over_L": 466.4134169262583,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 7.375,
      "sd_steps": 5.680480361981471
    },
    "e": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.1078286957530209,
      "sd_E": 0.022982368695844278,
      "mean_L": 0.06957964421010038,
      "sd_L": 0.10339522954049549,
      "mean_B": 0.06403986590321482,
      "sd_B": 0.05939542274487399,
      "mean_R": 0.8477380369134512,
      "sd_R": 0.20056364721013953,
      "mean_I": 0.98434367664799,
      "sd_I": 0.03271352548353669,
      "mean_F": 1.7525446674059413,
      "sd_F": 1.799359120350873,
      "mean_stepD": 0.12294420285552349,
      "sd_stepD": 0.006221283290295356,
      "mean_originD": 0.7723836678863262,
      "sd_originD": 0.5115857660375032,
      "mean_E_over_D": 0.2534412672406343,
      "sd_E_over_D": 0.12239466181957022,
      "mean_E_over_B": 5.7449254292779,
      "sd_E_over_B": 6.069787958803229,
      "mean_E_over_L": 248.39956455331946,
      "sd_E_over_L": 392.95299155140833,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 19.5,
      "sd_steps": 0.9258200997725514
    },
    "phi_adapt": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.07170212572657514,
      "sd_E": 0.023939753807311597,
      "mean_L": 0.06918913405495694,
      "sd_L": 0.10454368494087109,
      "mean_B": 0.12504332786780198,
      "sd_B": 0.14769528965144071,
      "mean_R": 0.5744047430158774,
      "sd_R": 0.14188797083535362,
      "mean_I": 0.9855351106572579,
      "sd_I": 0.030305759094388943,
      "mean_F": 0.5425018664744023,
      "sd_F": 0.42873642759693875,
      "mean_stepD": 0.11942564700313052,
      "sd_stepD": 0.000029097223209235325,
      "mean_originD": 1.1139659753976192,
      "sd_originD": 0.35999226171955145,
      "mean_E_over_D": 0.14383407130604975,
      "sd_E_over_D": 0.01330100715337703,
      "mean_E_over_B": 2.6610718191642366,
      "sd_E_over_B": 3.4292284453461805,
      "mean_E_over_L": 130.20318861572306,
      "sd_E_over_L": 145.84871781904792,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    },
    "prime": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.12949739484136208,
      "sd_E": 0.05925533071120114,
      "mean_L": 0.017395283803757267,
      "sd_L": 0.017740383348854527,
      "mean_B": 0.039286656928407174,
      "sd_B": 0.02946273430495343,
      "mean_R": 0.8413042258023695,
      "sd_R": 0.12312163782985058,
      "mean_I": 0.9906948288745872,
      "sd_I": 0.02017328924592966,
      "mean_F": 9.631137110686637,
      "sd_F": 9.0850851698602,
      "mean_stepD": 0.11962701350865584,
      "sd_stepD": 0.00012976487041495874,
      "mean_originD": 0.4918328851349058,
      "sd_originD": 0.18016563560721266,
      "mean_E_over_D": 0.40622653704762757,
      "sd_E_over_D": 0.18013649852295346,
      "mean_E_over_B": 99.58567088715358,
      "sd_E_over_B": 166.06478066099146,
      "mean_E_over_L": 547.3993950187846,
      "sd_E_over_L": 697.9797897147456,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    },
    "e_phi": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.1059394552520504,
      "sd_E": 0.0261782209050651,
      "mean_L": 0.06834441865667468,
      "sd_L": 0.1036268363106565,
      "mean_B": 0.07966941549346118,
      "sd_B": 0.08487116331607465,
      "mean_R": 0.8608840297424463,
      "sd_R": 0.17632301418469032,
      "mean_I": 0.9860901353121315,
      "sd_I": 0.02890824972627574,
      "mean_F": 1.686866178786641,
      "sd_F": 1.7147734848107186,
      "mean_stepD": 0.11957024278775677,
      "sd_stepD": 0.00003176543394280663,
      "mean_originD": 0.7512362361204643,
      "sd_originD": 0.5049217198316077,
      "mean_E_over_D": 0.2593046896893903,
      "sd_E_over_D": 0.11564820755587324,
      "mean_E_over_B": 5.452560513446526,
      "sd_E_over_B": 5.768989179003086,
      "mean_E_over_L": 256.4094002643534,
      "sd_E_over_L": 387.73712326825313,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    },
    "e_p": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.10478575720379127,
      "sd_E": 0.019550788972002284,
      "mean_L": 0.0676895812930666,
      "sd_L": 0.09990102115264904,
      "mean_B": 0.035482089667617046,
      "sd_B": 0.02562513260265295,
      "mean_R": 0.8023330214584373,
      "sd_R": 0.18550631272396198,
      "mean_I": 0.9842496340893945,
      "sd_I": 0.03364145422066086,
      "mean_F": 3.090817522666529,
      "sd_F": 3.3371522163575493,
      "mean_stepD": 0.1250279662308255,
      "sd_stepD": 0.009879747755958665,
      "mean_originD": 0.819439495312866,
      "sd_originD": 0.4325768288602427,
      "mean_E_over_D": 0.2231093109589845,
      "sd_E_over_D": 0.08754811288884207,
      "mean_E_over_B": 26.698120629562148,
      "sd_E_over_B": 38.518115585289365,
      "mean_E_over_L": 338.24252348327593,
      "sd_E_over_L": 576.4347625471808,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 19.25,
      "sd_steps": 1.3887301496588271
    },
    "phi_p": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.10295764021409902,
      "sd_E": 0.021811432286710987,
      "mean_L": 0.06273844711299496,
      "sd_L": 0.09615794010654787,
      "mean_B": 0.04025247512860418,
      "sd_B": 0.029878228188272377,
      "mean_R": 0.8229419849627249,
      "sd_R": 0.13124956104069194,
      "mean_I": 0.9897075425557509,
      "sd_I": 0.02201824143873111,
      "mean_F": 2.9453922582584937,
      "sd_F": 3.228205660289709,
      "mean_stepD": 0.1196549084163333,
      "sd_stepD": 0.00010638926313945485,
      "mean_originD": 0.7635446634273069,
      "sd_originD": 0.3896804896758105,
      "mean_E_over_D": 0.24401771424008944,
      "sd_E_over_D": 0.08297519138649327,
      "mean_E_over_B": 27.513332434571815,
      "sd_E_over_B": 41.20646557016683,
      "mean_E_over_L": 166.08043969956154,
      "sd_E_over_L": 215.06008365741693,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    },
    "sequential": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.10261690267495552,
      "sd_E": 0.02329019715940704,
      "mean_L": 0.06557701479991017,
      "sd_L": 0.09903864691605303,
      "mean_B": 0.03718166463255058,
      "sd_B": 0.02727726083953091,
      "mean_R": 0.8150845535648694,
      "sd_R": 0.16269337981577667,
      "mean_I": 0.9868051671383912,
      "sd_I": 0.027975829689801383,
      "mean_F": 3.0739414791496,
      "sd_F": 3.3287986272266834,
      "mean_stepD": 0.12050994963592523,
      "sd_stepD": 0.002284961956428841,
      "mean_originD": 0.7922980997760319,
      "sd_originD": 0.4194046436715618,
      "mean_E_over_D": 0.23039707247049881,
      "sd_E_over_D": 0.08284128980687326,
      "mean_E_over_B": 26.98026487272147,
      "sd_E_over_B": 38.959862888702055,
      "mean_E_over_L": 373.44279092936165,
      "sd_E_over_L": 627.2184057754647,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 19.875,
      "sd_steps": 0.3535533905932738
    },
    "coupled": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.10374947905284512,
      "sd_E": 0.02519140963575341,
      "mean_L": 0.06846364305024671,
      "sd_L": 0.10231849474854274,
      "mean_B": 0.03981961838818558,
      "sd_B": 0.028844407740151557,
      "mean_R": 0.8332423535646407,
      "sd_R": 0.17930361074242782,
      "mean_I": 0.9850433890754982,
      "sd_I": 0.030854555103999183,
      "mean_F": 2.853778568853719,
      "sd_F": 2.9349182833570757,
      "mean_stepD": 0.11958077536087072,
      "sd_stepD": 0.00007191665114774303,
      "mean_originD": 0.7892908476571125,
      "sd_originD": 0.4638847698816338,
      "mean_E_over_D": 0.23196745071890174,
      "sd_E_over_D": 0.09463876655189717,
      "mean_E_over_B": 17.89119610539286,
      "sd_E_over_B": 22.53592231443751,
      "mean_E_over_L": 220.66777051138254,
      "sd_E_over_L": 337.9133927275393,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    },
    "openloop_seq": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.11021391078990306,
      "sd_E": 0.04130701527604589,
      "mean_L": 0.05540520489105365,
      "sd_L": 0.07135071320089677,
      "mean_B": 0.04780366878773967,
      "sd_B": 0.0385509592948829,
      "mean_R": 0.22680107004975325,
      "sd_R": 0.09452275469155741,
      "mean_I": 0.9827037661420636,
      "sd_I": 0.03631413817664242,
      "mean_F": 3.1576379136755697,
      "sd_F": 3.1013658640122923,
      "mean_stepD": 0.29758808269502157,
      "sd_stepD": 0.10339043538639155,
      "mean_originD": 1.1652248298823789,
      "sd_originD": 0.04079585796548268,
      "mean_E_over_D": 0.14482779990683836,
      "sd_E_over_D": 0.0524287475244509,
      "mean_E_over_B": 25.019029921547663,
      "sd_E_over_B": 33.45560787232089,
      "mean_E_over_L": 66.62052712871572,
      "sd_E_over_L": 74.86978679248726,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 9.625,
      "sd_steps": 5.180664601601393
    },
    "matched_nonprime_coupled": {
      "n": 8,
      "qMatchRate": 1,
      "mean_E": 0.10363477269526204,
      "sd_E": 0.02569289432692227,
      "mean_L": 0.06831015593700861,
      "sd_L": 0.10232869060983493,
      "mean_B": 0.03842149529465694,
      "sd_B": 0.02779856221788493,
      "mean_R": 0.8327231491852101,
      "sd_R": 0.1826439071187587,
      "mean_I": 0.9852881111708123,
      "sd_I": 0.030467796482991975,
      "mean_F": 1.9534471318264932,
      "sd_F": 1.7772935393597897,
      "mean_stepD": 0.11958252306070043,
      "sd_stepD": 0.00007330041039030428,
      "mean_originD": 0.7908431424274339,
      "sd_originD": 0.46440039827575363,
      "mean_E_over_D": 0.22923256687924534,
      "sd_E_over_D": 0.09204783388037087,
      "mean_E_over_B": 12.52589080897395,
      "sd_E_over_B": 17.296623721913765,
      "mean_E_over_L": 261.9413431638241,
      "sd_E_over_L": 420.0833030895475,
      "mean_Q": 2.4,
      "sd_Q": 0,
      "mean_steps": 20,
      "sd_steps": 0
    }
  },
  "checks": {
    "F_above_A": true,
    "F_above_matched_nonprime": true,
    "L_below_A": true,
    "B_below_A": true,
    "deltaX_positive": true,
    "coupled_beats_sequential": false,
    "adaptive_beats_openloop": false,
    "q_matched_all": true
  },
  "d2_gate_pass": false,
  "pass": true,
  "interpretation": "Coupled adaptive architecture does not clear D2 gate — see failed checks.",
  "honesty": "Exact Q removes Control A under-spend confound from D."
}
```

### D2_3_interaction_vs_sequential — Diagnostic 3 — sequential G vs coupled H (interaction term)

- **Pass:** `true`
- **Interpretation:** No coupled interaction advantage over sequential pipeline on F.
- **Honesty:** Tests the compositional hypothesis, not merely P∘Φ∘E.

```json
{
  "id": "D2_3_interaction_vs_sequential",
  "title": "Diagnostic 3 — sequential G vs coupled H (interaction term)",
  "interaction": {
    "sequential_F": 3.0739414791496,
    "coupled_F": 2.853778568853719,
    "coupled_minus_sequential": -0.2201629102958811,
    "singles": {
      "e": 1.7525446674059413,
      "phi_adapt": 0.5425018664744023,
      "prime": 9.631137110686637
    },
    "pairs": {
      "e_phi": 1.686866178786641,
      "e_p": 3.090817522666529,
      "phi_p": 2.9453922582584937
    }
  },
  "pass": true,
  "interpretation": "No coupled interaction advantage over sequential pipeline on F.",
  "honesty": "Tests the compositional hypothesis, not merely P∘Φ∘E."
}
```

### D2_4_prime_vs_matched — Diagnostic 5 — prime vs matched non-prime under same coupling

- **Pass:** `true`
- **Interpretation:** Prime structure adds F advantage beyond matched containment.
- **Honesty:** Only independent variable is prime vs composite schedule.

```json
{
  "id": "D2_4_prime_vs_matched",
  "title": "Diagnostic 5 — prime vs matched non-prime under same coupling",
  "prime_coupled": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.10374947905284512,
    "sd_E": 0.02519140963575341,
    "mean_L": 0.06846364305024671,
    "sd_L": 0.10231849474854274,
    "mean_B": 0.03981961838818558,
    "sd_B": 0.028844407740151557,
    "mean_R": 0.8332423535646407,
    "sd_R": 0.17930361074242782,
    "mean_I": 0.9850433890754982,
    "sd_I": 0.030854555103999183,
    "mean_F": 2.853778568853719,
    "sd_F": 2.9349182833570757,
    "mean_stepD": 0.11958077536087072,
    "sd_stepD": 0.00007191665114774303,
    "mean_originD": 0.7892908476571125,
    "sd_originD": 0.4638847698816338,
    "mean_E_over_D": 0.23196745071890174,
    "sd_E_over_D": 0.09463876655189717,
    "mean_E_over_B": 17.89119610539286,
    "sd_E_over_B": 22.53592231443751,
    "mean_E_over_L": 220.66777051138254,
    "sd_E_over_L": 337.9133927275393,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 20,
    "sd_steps": 0
  },
  "matched_nonprime_coupled": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.10363477269526204,
    "sd_E": 0.02569289432692227,
    "mean_L": 0.06831015593700861,
    "sd_L": 0.10232869060983493,
    "mean_B": 0.03842149529465694,
    "sd_B": 0.02779856221788493,
    "mean_R": 0.8327231491852101,
    "sd_R": 0.1826439071187587,
    "mean_I": 0.9852881111708123,
    "sd_I": 0.030467796482991975,
    "mean_F": 1.9534471318264932,
    "sd_F": 1.7772935393597897,
    "mean_stepD": 0.11958252306070043,
    "sd_stepD": 0.00007330041039030428,
    "mean_originD": 0.7908431424274339,
    "sd_originD": 0.46440039827575363,
    "mean_E_over_D": 0.22923256687924534,
    "sd_E_over_D": 0.09204783388037087,
    "mean_E_over_B": 12.52589080897395,
    "sd_E_over_B": 17.296623721913765,
    "mean_E_over_L": 261.9413431638241,
    "sd_E_over_L": 420.0833030895475,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 20,
    "sd_steps": 0
  },
  "prime_wins_F": true,
  "prime_wins_B": false,
  "prime_wins_L": false,
  "pass": true,
  "interpretation": "Prime structure adds F advantage beyond matched containment.",
  "honesty": "Only independent variable is prime vs composite schedule."
}
```

### D2_5_adaptive_vs_openloop — Adaptive φ regulator vs open-loop φ (exact Q)

- **Pass:** `true`
- **Interpretation:** Adaptive φ does not yet improve on open-loop under F/L.
- **Honesty:** Directly tests the V1 overdrive lead as a feedback redesign.

```json
{
  "id": "D2_5_adaptive_vs_openloop",
  "title": "Adaptive φ regulator vs open-loop φ (exact Q)",
  "adaptive_coupled": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.10374947905284512,
    "sd_E": 0.02519140963575341,
    "mean_L": 0.06846364305024671,
    "sd_L": 0.10231849474854274,
    "mean_B": 0.03981961838818558,
    "sd_B": 0.028844407740151557,
    "mean_R": 0.8332423535646407,
    "sd_R": 0.17930361074242782,
    "mean_I": 0.9850433890754982,
    "sd_I": 0.030854555103999183,
    "mean_F": 2.853778568853719,
    "sd_F": 2.9349182833570757,
    "mean_stepD": 0.11958077536087072,
    "sd_stepD": 0.00007191665114774303,
    "mean_originD": 0.7892908476571125,
    "sd_originD": 0.4638847698816338,
    "mean_E_over_D": 0.23196745071890174,
    "sd_E_over_D": 0.09463876655189717,
    "mean_E_over_B": 17.89119610539286,
    "sd_E_over_B": 22.53592231443751,
    "mean_E_over_L": 220.66777051138254,
    "sd_E_over_L": 337.9133927275393,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 20,
    "sd_steps": 0
  },
  "openloop_seq": {
    "n": 8,
    "qMatchRate": 1,
    "mean_E": 0.11021391078990306,
    "sd_E": 0.04130701527604589,
    "mean_L": 0.05540520489105365,
    "sd_L": 0.07135071320089677,
    "mean_B": 0.04780366878773967,
    "sd_B": 0.0385509592948829,
    "mean_R": 0.22680107004975325,
    "sd_R": 0.09452275469155741,
    "mean_I": 0.9827037661420636,
    "sd_I": 0.03631413817664242,
    "mean_F": 3.1576379136755697,
    "sd_F": 3.1013658640122923,
    "mean_stepD": 0.29758808269502157,
    "sd_stepD": 0.10339043538639155,
    "mean_originD": 1.1652248298823789,
    "sd_originD": 0.04079585796548268,
    "mean_E_over_D": 0.14482779990683836,
    "sd_E_over_D": 0.0524287475244509,
    "mean_E_over_B": 25.019029921547663,
    "sd_E_over_B": 33.45560787232089,
    "mean_E_over_L": 66.62052712871572,
    "sd_E_over_L": 74.86978679248726,
    "mean_Q": 2.4,
    "sd_Q": 0,
    "mean_steps": 9.625,
    "sd_steps": 5.180664601601393
  },
  "adaptive_better_F": false,
  "adaptive_lower_L": false,
  "pass": true,
  "interpretation": "Adaptive φ does not yet improve on open-loop under F/L.",
  "honesty": "Directly tests the V1 overdrive lead as a feedback redesign."
}
```

### D2_6_new_attractor_homeostasis — Perturbation → correction → new attractor (not return-to-origin)

- **Pass:** `true`
- **Interpretation:** New-attractor homeostatic signature remains weak/mixed.
- **Honesty:** Homeostasis ≠ return to X0; tests adaptive correction after deviation.

```json
{
  "id": "D2_6_new_attractor_homeostasis",
  "title": "Perturbation → correction → new attractor (not return-to-origin)",
  "homeostaticNewAttractorRate": 0,
  "n": 8,
  "pass": true,
  "interpretation": "New-attractor homeostatic signature remains weak/mixed.",
  "honesty": "Homeostasis ≠ return to X0; tests adaptive correction after deviation."
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

Exploratory computational catalog suite for a unified e+φ+prime recursive architecture. V1 free-run Goldilocks hit-rate null and EPH-RH-D matched-budget E/(D+ε) nulls are locked development/diagnostic evidence. EPH-RH-D2 tests the rewritten hypothesis: controlled transformation + adaptive proportional regulation + bounded compartmentalization, with exact Q_MAX, irreversible loss L (not origin drift D), identity invariants I, composite F=(E·R·I)/(L+λB+ε), sequential G vs coupled H, and perturbation→new-attractor homeostasis. Soft Story / fixture evidence only. Does not claim physical law, CODATA replacement, clinical validation, or finished homeostasis proof. Engine pin requires the EPH-RH-D2 gate.
