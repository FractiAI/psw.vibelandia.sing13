# Phase-Modulated Toxicity & Resonance Safety Transitions — Empirical Suite (TBME)

**Document ID:** `WP-SYNTHOBS-TBME-PHASE-TOXICITY-FULL-REV2-2026-07-31`
**Registry ID:** `synthobs-phase-toxicity-2026-07`
**Generated:** 2026-07-31T18:09:59.271Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| E_F | 1.618033988749895 |

## Experiments

### E1_overall_identity — Overall score = (C + I) / 2

- **Pass:** `true`
- **Interpretation:** Scorecard overalls are the equal-weight mean of coherence and irreducibility.
- **Honesty:** Rubric arithmetic — not a clinical likelihood ratio.

```json
{
  "id": "E1_overall_identity",
  "title": "Overall score = (C + I) / 2",
  "standard": {
    "c": 76,
    "i": 66,
    "overall": 71
  },
  "omni": {
    "c": 98,
    "i": 97,
    "overall": 97.5
  },
  "interpretation": "Scorecard overalls are the equal-weight mean of coherence and irreducibility.",
  "honesty": "Rubric arithmetic — not a clinical likelihood ratio.",
  "pass": true
}
```

### E2_coherence_formula — Coherence metric C from paradox/singularity counts

- **Pass:** `true`
- **Interpretation:** C formula tracks published TBME scorecard coherence bands.
- **Honesty:** Counts are authored scorecard inputs — not assay IC50 curves.

```json
{
  "id": "E2_coherence_formula",
  "title": "Coherence metric C from paradox/singularity counts",
  "standard_C": 76,
  "omni_C": 98,
  "published": {
    "standard": 76,
    "omni": 98
  },
  "interpretation": "C formula tracks published TBME scorecard coherence bands.",
  "honesty": "Counts are authored scorecard inputs — not assay IC50 curves.",
  "pass": true
}
```

### E3_irreducibility_index — Irreducibility index I = n_derived / (n_primitives + n_unexplained)

- **Pass:** `true`
- **Interpretation:** Omni map concentrates toxicity/safety under E_F phase grammar.
- **Honesty:** Index is Occam bookkeeping — not proof of clinical superiority.

```json
{
  "id": "E3_irreducibility_index",
  "title": "Irreducibility index I = n_derived / (n_primitives + n_unexplained)",
  "standard_I_raw": 0.5757575757575758,
  "omni_I_raw": 23,
  "published": {
    "standard": 66,
    "omni": 97
  },
  "interpretation": "Omni map concentrates toxicity/safety under E_F phase grammar.",
  "honesty": "Index is Occam bookkeeping — not proof of clinical superiority.",
  "pass": true
}
```

### E4_golden_angle — θ_EGS = 360 / φ² ≈ 137.508°

- **Pass:** `true`
- **Interpretation:** EMF harmonization pulse offset is the golden angle from E_F.
- **Honesty:** Geometric identity — not a measured VGCC resonance angle.

```json
{
  "id": "E4_golden_angle",
  "title": "θ_EGS = 360 / φ² ≈ 137.508°",
  "computed": 137.50776405003785,
  "fixture": 137.50776405003785,
  "expected": 137.50776405003785,
  "interpretation": "EMF harmonization pulse offset is the golden angle from E_F.",
  "honesty": "Geometric identity — not a measured VGCC resonance angle.",
  "pass": true
}
```

### E5_protocol_harmonics — Protocol harmonics encode E_F decimal lattice (16.18 Hz / 1.618 MHz)

- **Pass:** `true`
- **Interpretation:** Frequencies are architectural E_F mnemonics for proposed harmonization recipes.
- **Honesty:** Not measured bio-effective bands in this suite; exploration map only.

```json
{
  "id": "E5_protocol_harmonics",
  "title": "Protocol harmonics encode E_F decimal lattice (16.18 Hz / 1.618 MHz)",
  "pulse_Hz": 16.18,
  "sugar_MHz": 1.618,
  "E_F": 1.618033988749895,
  "interpretation": "Frequencies are architectural E_F mnemonics for proposed harmonization recipes.",
  "honesty": "Not measured bio-effective bands in this suite; exploration map only.",
  "pass": true
}
```

### E6_everyday_audit_counts — Everyday audit matrices are dual top-6 maps

- **Pass:** `true`
- **Interpretation:** Authored environmental audit keeps balanced disruption/harmonization coverage.
- **Honesty:** Authored case counts — not epidemiology.

```json
{
  "id": "E6_everyday_audit_counts",
  "title": "Everyday audit matrices are dual top-6 maps",
  "safe_to_unsafe": 6,
  "unsafe_to_safe": 6,
  "interpretation": "Authored environmental audit keeps balanced disruption/harmonization coverage.",
  "honesty": "Authored case counts — not epidemiology.",
  "pass": true
}
```

### E7_lambda_egs — λ_EGS = ln(E_F) / 2π

- **Pass:** `true`
- **Interpretation:** Phase-scaling parameter shared with Omni-Lattice / PCHPP companions.
- **Honesty:** Algebraic identity — not a measured toxicology constant.

```json
{
  "id": "E7_lambda_egs",
  "title": "λ_EGS = ln(E_F) / 2π",
  "computed": 0.07658724063250828,
  "expected": 0.07658724063250828,
  "interpretation": "Phase-scaling parameter shared with Omni-Lattice / PCHPP companions.",
  "honesty": "Algebraic identity — not a measured toxicology constant.",
  "pass": true
}
```

### E8_score_margin — Omni overall − Standard overall = +26.5

- **Pass:** `true`
- **Interpretation:** Rubric margin favors the phase-modulated safety inversion map.
- **Honesty:** Architectural margin — empirical calibration stays with toxicology / radiobiology.

```json
{
  "id": "E8_score_margin",
  "title": "Omni overall − Standard overall = +26.5",
  "margin": 26.5,
  "published": {
    "standard": 71,
    "omni": 97.5
  },
  "interpretation": "Rubric margin favors the phase-modulated safety inversion map.",
  "honesty": "Architectural margin — empirical calibration stays with toxicology / radiobiology.",
  "pass": true
}
```

### E9_clinical_non_claim_gate — TBME clinical non-claim gate present

- **Pass:** `true`
- **Interpretation:** Suite refuses to treat rubric wins as clinical efficacy or detox claims.
- **Honesty:** TBME series: theoretical exploration only — not medical advice.

```json
{
  "id": "E9_clinical_non_claim_gate",
  "title": "TBME clinical non-claim gate present",
  "domains": [
    "classical_dose_model",
    "phase_dissonance_map",
    "everyday_environmental_audit",
    "empirical_calibration",
    "cross_domain_portability",
    "clinical_non_claim_gate"
  ],
  "scorecard_honesty": "Authored architectural rubric inputs. Not wet-lab toxicology, radiobiology, or clinical outcomes.",
  "interpretation": "Suite refuses to treat rubric wins as clinical efficacy or detox claims.",
  "honesty": "TBME series: theoretical exploration only — not medical advice.",
  "pass": true
}
```

## Honesty boundary

TBME architectural rubric. Validates score arithmetic, E_F protocol mnemonics, and clinical non-claim gate. Does **not** claim wet-lab toxicology completion, clinical efficacy, detox protocols, or medical advice.
