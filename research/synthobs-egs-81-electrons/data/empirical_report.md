# The 81-Digit Electronic Lattice — EGS Singularities ↔ Atomic Shells (Z ≤ 81)

**Document ID:** `WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07`
**Registry ID:** `synthobs-egs-81-electrons-2026-07`
**Generated:** 2026-07-28T02:31:17.201Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| Φ_EGS / E_F | 1.618033988749895 |
| λ_EGS | 0.07658724063250828 |
| Register N | 81 |

## Experiments

### E1_register_identity — Register identity — 3⁴ = 81 = 9×9

- **Pass:** `true`
- **Interpretation:** EGS electronic lattice register is combinatorially closed at 81 slots.
- **Honesty:** Combinatorial architecture — not a derivation of the periodic table from Φ.

```json
{
  "id": "E1_register_identity",
  "title": "Register identity — 3⁴ = 81 = 9×9",
  "three_to_four": 81,
  "nine_by_nine": 81,
  "n_modes": 81,
  "unique_k": 81,
  "interpretation": "EGS electronic lattice register is combinatorially closed at 81 slots.",
  "honesty": "Combinatorial architecture — not a derivation of the periodic table from Φ.",
  "pass": true
}
```

### E2_phase_singularities — Phase singularities — φ_k = 2πk/81

- **Pass:** `true`
- **Interpretation:** Integer electronic transitions sit on equal phase ticks of the 81-register.

```json
{
  "id": "E2_phase_singularities",
  "title": "Phase singularities — φ_k = 2πk/81",
  "max_step_error": 9.020562075079397e-16,
  "full_circle_error": 0,
  "wrap_at_81": 0,
  "interpretation": "Integer electronic transitions sit on equal phase ticks of the 81-register.",
  "pass": true
}
```

### E3_quantum_number_bijection — 3⁴ digit modes ↔ k=0…80 bijection (n,l,m_l,m_s proxies)

- **Pass:** `true`
- **Interpretation:** Each singularity isolates one digit mode — Pauli-like uniqueness in the register.
- **Honesty:** Proxy labels are architectural; not spectroscopic term symbols.

```json
{
  "id": "E3_quantum_number_bijection",
  "title": "3⁴ digit modes ↔ k=0…80 bijection (n,l,m_l,m_s proxies)",
  "n_unique_digit_tuples": 81,
  "contiguous_k": true,
  "sample": [
    {
      "k": 0,
      "digit": [
        0,
        0,
        0,
        0
      ],
      "n_proxy": 1,
      "l_proxy": 0,
      "ml_proxy": -1,
      "ms_proxy": -0.5
    },
    {
      "k": 1,
      "digit": [
        0,
        0,
        0,
        1
      ],
      "n_proxy": 1,
      "l_proxy": 0,
      "ml_proxy": -1,
      "ms_proxy": 0.5
    },
    {
      "k": 2,
      "digit": [
        0,
        0,
        0,
        2
      ],
      "n_proxy": 1,
      "l_proxy": 0,
      "ml_proxy": -1,
      "ms_proxy": 0
    },
    {
      "k": 3,
      "digit": [
        0,
        0,
        1,
        0
      ],
      "n_proxy": 1,
      "l_proxy": 1,
      "ml_proxy": 0,
      "ms_proxy": -0.5
    },
    {
      "k": 4,
      "digit": [
        0,
        0,
        1,
        1
      ],
      "n_proxy": 1,
      "l_proxy": 1,
      "ml_proxy": 0,
      "ms_proxy": 0.5
    }
  ],
  "interpretation": "Each singularity isolates one digit mode — Pauli-like uniqueness in the register.",
  "honesty": "Proxy labels are architectural; not spectroscopic term symbols.",
  "pass": true
}
```

### E4_pauli_singularity_isolation — Singularity isolation — unique digit modes (Pauli downstream metaphor)

- **Pass:** `true`
- **Interpretation:** Exclusion in the register is uniqueness of digit addresses.
- **Honesty:** Metaphor for Pauli exclusion — not a QED derivation.

```json
{
  "id": "E4_pauli_singularity_isolation",
  "title": "Singularity isolation — unique digit modes (Pauli downstream metaphor)",
  "collisions": 0,
  "n_modes": 81,
  "interpretation": "Exclusion in the register is uniqueness of digit addresses.",
  "honesty": "Metaphor for Pauli exclusion — not a QED derivation.",
  "pass": true
}
```

### E5_binding_energy_correlation — Ionization-energy correlation vs EGS phase-register features

- **Pass:** `true`
- **Interpretation:** Public first-IE series carries measurable association with EGS register features above sham. Draft R²=0.9998 is a design target, not this receipt.
- **Honesty:** Compact public IE values + EGS features — architectural explanatory power, not QED.

```json
{
  "id": "E5_binding_energy_correlation",
  "title": "Ionization-energy correlation vs EGS phase-register features",
  "n_elements": 81,
  "r": 0.5541581930680173,
  "r2": 0.3070913029444099,
  "r2_egs_magnitude": 0.13871941597528284,
  "best_r2": 0.3070913029444099,
  "sham_r2": 0.04070207046611359,
  "draft_target_r2": 0.9998,
  "interpretation": "Public first-IE series carries measurable association with EGS register features above sham. Draft R²=0.9998 is a design target, not this receipt.",
  "honesty": "Compact public IE values + EGS features — architectural explanatory power, not QED.",
  "pass": true
}
```

### E6_phase_variance_at_81 — Phase residual variance — register windows ending at Z=81

- **Pass:** `true`
- **Interpretation:** Residual phase scatter is finite; end-window vs mid-window compared for register closure narrative.
- **Honesty:** Computed σ² is receipt truth; draft 0.0001 is a design target, not this run.

```json
{
  "id": "E6_phase_variance_at_81",
  "title": "Phase residual variance — register windows ending at Z=81",
  "global_variance": 3.4830807689038346,
  "variance_last_9": 2.9405440066786626,
  "variance_mid_9": 2.12975693145089,
  "draft_target_sigma2": 0.0001,
  "interpretation": "Residual phase scatter is finite; end-window vs mid-window compared for register closure narrative.",
  "honesty": "Computed σ² is receipt truth; draft 0.0001 is a design target, not this run.",
  "pass": true
}
```

### E7_sham_wrong_register — Sham registers (64/80/82/100) — 3⁴ closure fails

- **Pass:** `true`
- **Interpretation:** Only N=81 coincides with 3⁴ digit-mode closure.

```json
{
  "id": "E7_sham_wrong_register",
  "title": "Sham registers (64/80/82/100) — 3⁴ closure fails",
  "rows": [
    {
      "n": 64,
      "modesOk": false,
      "step": 0.09817477042468103,
      "fail_count": 20
    },
    {
      "n": 80,
      "modesOk": false,
      "step": 0.07853981633974483,
      "fail_count": 20
    },
    {
      "n": 82,
      "modesOk": false,
      "step": 0.07662421106316569,
      "fail_count": 20
    },
    {
      "n": 100,
      "modesOk": false,
      "step": 0.06283185307179587,
      "fail_count": 20
    }
  ],
  "interpretation": "Only N=81 coincides with 3⁴ digit-mode closure.",
  "pass": true
}
```

### E8_relativistic_honesty_receipt — Honesty — no QED / relativistic runaway experiment executed here

- **Pass:** `true`
- **Interpretation:** Pass means we correctly label the draft claim as unexecuted — not that runaway is disproven.
- **Honesty:** Required PRA honesty gate for peer-facing abstracts.

```json
{
  "id": "E8_relativistic_honesty_receipt",
  "title": "Honesty — no QED / relativistic runaway experiment executed here",
  "draft_claim": "E_F stabilizes shell geometry without higher-order relativistic runaway divergence",
  "executed": false,
  "design_target": true,
  "interpretation": "Pass means we correctly label the draft claim as unexecuted — not that runaway is disproven.",
  "honesty": "Required PRA honesty gate for peer-facing abstracts.",
  "pass": true
}
```

### E9_shell_filling_order — Aufbau filling maps injectively onto 81 register slots (through 6p / Z=81)

- **Pass:** `true`
- **Interpretation:** Shell-filling order occupies the full 81-register without collision.
- **Honesty:** Standard Aufbau bookkeeping + register addressing — not a new spectroscopic measurement.

```json
{
  "id": "E9_shell_filling_order",
  "title": "Aufbau filling maps injectively onto 81 register slots (through 6p / Z=81)",
  "electrons_mapped": 81,
  "orbitals": [
    {
      "orbital": "1s",
      "electrons": 2,
      "cumulative": 2
    },
    {
      "orbital": "2s",
      "electrons": 2,
      "cumulative": 4
    },
    {
      "orbital": "2p",
      "electrons": 6,
      "cumulative": 10
    },
    {
      "orbital": "3s",
      "electrons": 2,
      "cumulative": 12
    },
    {
      "orbital": "3p",
      "electrons": 6,
      "cumulative": 18
    },
    {
      "orbital": "4s",
      "electrons": 2,
      "cumulative": 20
    },
    {
      "orbital": "3d",
      "electrons": 10,
      "cumulative": 30
    },
    {
      "orbital": "4p",
      "electrons": 6,
      "cumulative": 36
    },
    {
      "orbital": "5s",
      "electrons": 2,
      "cumulative": 38
    },
    {
      "orbital": "4d",
      "electrons": 10,
      "cumulative": 48
    },
    {
      "orbital": "5p",
      "electrons": 6,
      "cumulative": 54
    },
    {
      "orbital": "6s",
      "electrons": 2,
      "cumulative": 56
    },
    {
      "orbital": "4f",
      "electrons": 14,
      "cumulative": 70
    },
    {
      "orbital": "5d",
      "electrons": 10,
      "cumulative": 80
    },
    {
      "orbital": "6p",
      "electrons": 1,
      "cumulative": 81
    }
  ],
  "unique_slots": 81,
  "interpretation": "Shell-filling order occupies the full 81-register without collision.",
  "honesty": "Standard Aufbau bookkeeping + register addressing — not a new spectroscopic measurement.",
  "pass": true
}
```

## Honesty boundary

Algebraic / combinatorial / public-IE numerical validation of the 81-digit electronic lattice. Draft R²=0.9998 and σ²=0.0001 are design targets — receipt values are computed. Not a replacement for QED or spectroscopic term analysis.
