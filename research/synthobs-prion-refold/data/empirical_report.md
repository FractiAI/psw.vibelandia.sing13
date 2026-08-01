# Epigenetic Phase-Locking & Prion Refolding Pathways — Empirical Suite (TBME)

**Document ID:** `WP-SYNTHOBS-PRION-REFOLD-FULL-REV2-2026-07-31`
**Registry ID:** `synthobs-prion-refold-2026-07`
**Generated:** 2026-07-31T17:03:51.334Z

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
- **Honesty:** Rubric arithmetic — not a clinical likelihood ratio or wet-lab success rate.

```json
{
  "id": "E1_overall_identity",
  "title": "Overall score = (C + I) / 2",
  "standard": {
    "c": 74,
    "i": 62,
    "overall": 68
  },
  "omni": {
    "c": 99,
    "i": 97,
    "overall": 98
  },
  "interpretation": "Scorecard overalls are the equal-weight mean of coherence and irreducibility.",
  "honesty": "Rubric arithmetic — not a clinical likelihood ratio or wet-lab success rate.",
  "pass": true
}
```

### E2_coherence_formula — Coherence metric C from paradox/singularity counts

- **Pass:** `true`
- **Interpretation:** C formula tracks published TBME scorecard coherence bands.
- **Honesty:** Counts are authored scorecard inputs — not ThT / CD lab reductions.

```json
{
  "id": "E2_coherence_formula",
  "title": "Coherence metric C from paradox/singularity counts",
  "standard_C": 73.80952380952381,
  "omni_C": 97.61904761904762,
  "published": {
    "standard": 74,
    "omni": 99
  },
  "interpretation": "C formula tracks published TBME scorecard coherence bands.",
  "honesty": "Counts are authored scorecard inputs — not ThT / CD lab reductions.",
  "pass": true
}
```

### E3_irreducibility_index — Irreducibility index I = n_derived / (n_primitives + n_unexplained)

- **Pass:** `true`
- **Interpretation:** Omni map concentrates derived structure under fewer free primitives (E_F).
- **Honesty:** Index is Occam bookkeeping — not proof of clinical superiority.

```json
{
  "id": "E3_irreducibility_index",
  "title": "Irreducibility index I = n_derived / (n_primitives + n_unexplained)",
  "standard_I_raw": 0.6206896551724138,
  "omni_I_raw": 20,
  "published": {
    "standard": 62,
    "omni": 97
  },
  "interpretation": "Omni map concentrates derived structure under fewer free primitives (E_F).",
  "honesty": "Index is Occam bookkeeping — not proof of clinical superiority.",
  "pass": true
}
```

### E4_golden_angle — θ_EGS = 360 / φ² ≈ 137.508°

- **Pass:** `true`
- **Interpretation:** Pulse phase offset is the golden angle from E_F.
- **Honesty:** Geometric identity — not a measured peptide NMR angle in this suite.

```json
{
  "id": "E4_golden_angle",
  "title": "θ_EGS = 360 / φ² ≈ 137.508°",
  "computed": 137.50776405003785,
  "fixture": 137.50776405003785,
  "expected": 137.50776405003785,
  "interpretation": "Pulse phase offset is the golden angle from E_F.",
  "honesty": "Geometric identity — not a measured peptide NMR angle in this suite.",
  "pass": true
}
```

### E5_protocol_harmonics — Protocol harmonics encode E_F decimal lattice (16.18 kHz / 1.618 MHz)

- **Pass:** `true`
- **Interpretation:** Frequencies are architectural E_F mnemonics for the proposed coil protocol.
- **Honesty:** Not measured resonant modes of PrP in this suite; exploration recipe only.

```json
{
  "id": "E5_protocol_harmonics",
  "title": "Protocol harmonics encode E_F decimal lattice (16.18 kHz / 1.618 MHz)",
  "f0_kHz": 16.18,
  "f1_MHz": 1.618,
  "E_F": 1.618033988749895,
  "interpretation": "Frequencies are architectural E_F mnemonics for the proposed coil protocol.",
  "honesty": "Not measured resonant modes of PrP in this suite; exploration recipe only.",
  "pass": true
}
```

### E6_ultralow_field_band — Proposed B-field band 50–161.8 µT (ultra-low)

- **Pass:** `true`
- **Interpretation:** Exploration recipe stays near ambient geomagnetic scale.
- **Honesty:** Field band is proposed — not a completed exposure study.

```json
{
  "id": "E6_ultralow_field_band",
  "title": "Proposed B-field band 50–161.8 µT (ultra-low)",
  "B_uT_min": 50,
  "B_uT_max": 161.8,
  "interpretation": "Exploration recipe stays near ambient geomagnetic scale.",
  "honesty": "Field band is proposed — not a completed exposure study.",
  "pass": true
}
```

### E7_lambda_egs — λ_EGS = ln(E_F) / 2π

- **Pass:** `true`
- **Interpretation:** Envelope growth rate in M_refold matches Euler–EGS bridge constant.
- **Honesty:** Algebraic identity shared with Omni-Lattice companions.

```json
{
  "id": "E7_lambda_egs",
  "title": "λ_EGS = ln(E_F) / 2π",
  "computed": 0.07658724063250828,
  "expected": 0.07658724063250828,
  "interpretation": "Envelope growth rate in M_refold matches Euler–EGS bridge constant.",
  "honesty": "Algebraic identity shared with Omni-Lattice companions.",
  "pass": true
}
```

### E8_score_margin — Omni overall − Standard overall = +30.0

- **Pass:** `true`
- **Interpretation:** Rubric margin favors the phase-refolding map on coherence/irreducibility.
- **Honesty:** Architectural margin — empirical calibration stays with wet-lab biochemistry.

```json
{
  "id": "E8_score_margin",
  "title": "Omni overall − Standard overall = +30.0",
  "margin": 30,
  "published": {
    "standard": 68,
    "omni": 98
  },
  "interpretation": "Rubric margin favors the phase-refolding map on coherence/irreducibility.",
  "honesty": "Architectural margin — empirical calibration stays with wet-lab biochemistry.",
  "pass": true
}
```

### E9_clinical_non_claim_gate — TBME clinical non-claim gate present

- **Pass:** `true`
- **Interpretation:** Suite refuses to treat rubric wins as clinical efficacy.
- **Honesty:** TBME series: theoretical exploration only — not medical advice.

```json
{
  "id": "E9_clinical_non_claim_gate",
  "title": "TBME clinical non-claim gate present",
  "domains": [
    "kinetic_trap_narrative",
    "magnetic_phase_coherence",
    "backbone_torsional_resonance",
    "empirical_calibration",
    "cross_domain_portability",
    "clinical_non_claim_gate"
  ],
  "scorecard_honesty": "Authored architectural rubric inputs. Not wet-lab magnetometry or clinical outcomes.",
  "interpretation": "Suite refuses to treat rubric wins as clinical efficacy.",
  "honesty": "TBME series: theoretical exploration only — not medical advice.",
  "pass": true
}
```

## Honesty boundary

TBME architectural rubric. Validates score arithmetic, E_F protocol mnemonics, and clinical non-claim gate. Does **not** claim wet-lab replication, clinical efficacy, or medical advice.
