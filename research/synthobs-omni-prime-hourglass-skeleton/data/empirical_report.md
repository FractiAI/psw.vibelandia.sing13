# The Prime Hourglass Orthogonality Theorem — Empirical Suite

**Document ID:** `WP-OMNI-PRIME-HOURGLASS-SKELETON-2026-08-04`
**Registry ID:** `synthobs-omni-prime-hourglass-skeleton-2026-08`
**Generated:** 2026-08-04T16:41:52.235Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| E_F | 1.618033988749895 |

## Experiments

### E1_six_k_pm1 — Odd primes > 3 lie in 6k±1

- **Pass:** `true`
- **Interpretation:** Classical sieve filter for the hourglass skeleton.
- **Honesty:** Number-theory invariant — not a latency measurement.

```json
{
  "id": "E1_six_k_pm1",
  "title": "Odd primes > 3 lie in 6k±1",
  "n": 93,
  "bad": [],
  "pass": true,
  "interpretation": "Classical sieve filter for the hourglass skeleton.",
  "honesty": "Number-theory invariant — not a latency measurement."
}
```

### E2_mod4_partition — Odd primes partition into p≡1 vs p≡3 (mod 4)

- **Pass:** `true`
- **Interpretation:** Dirichlet classes = hourglass lobes.
- **Honesty:** Class counts under fixed bound — not RH.

```json
{
  "id": "E2_mod4_partition",
  "title": "Odd primes partition into p≡1 vs p≡3 (mod 4)",
  "n1": 44,
  "n3": 50,
  "other": [],
  "pass": true,
  "interpretation": "Dirichlet classes = hourglass lobes.",
  "honesty": "Class counts under fixed bound — not RH."
}
```

### E3_gaussian_split — Sample p≡1 (mod 4) = a²+b² (Gaussian split)

- **Pass:** `true`
- **Interpretation:** i = e^{iπ/2} rotation grammar for the upper cone.
- **Honesty:** Finite witness list — not a full Fermat theorem proof replay.

```json
{
  "id": "E3_gaussian_split",
  "title": "Sample p≡1 (mod 4) = a²+b² (Gaussian split)",
  "witnesses": [
    {
      "p": 5,
      "a": 1,
      "b": 2
    },
    {
      "p": 13,
      "a": 2,
      "b": 3
    },
    {
      "p": 17,
      "a": 1,
      "b": 4
    },
    {
      "p": 29,
      "a": 2,
      "b": 5
    },
    {
      "p": 37,
      "a": 1,
      "b": 6
    },
    {
      "p": 41,
      "a": 4,
      "b": 5
    }
  ],
  "fails": [],
  "pass": true,
  "interpretation": "i = e^{iπ/2} rotation grammar for the upper cone.",
  "honesty": "Finite witness list — not a full Fermat theorem proof replay."
}
```

### E4_inert_class — Sample p≡3 (mod 4) are not a²+b²

- **Pass:** `true`
- **Interpretation:** Lower cone / inert primes in Z[i] grammar.
- **Honesty:** Finite samples — complementary to E3.

```json
{
  "id": "E4_inert_class",
  "title": "Sample p≡3 (mod 4) are not a²+b²",
  "samples": [
    3,
    7,
    11,
    19,
    23,
    31,
    43,
    47
  ],
  "leaks": [],
  "pass": true,
  "interpretation": "Lower cone / inert primes in Z[i] grammar.",
  "honesty": "Finite samples — complementary to E3."
}
```

### E5_phase_90 — e^{iπ/2} ≈ (0,1) — 90° operator

- **Pass:** `true`
- **Interpretation:** Orthogonal flip operator used in the theorem statement.
- **Honesty:** Floating trig identity — architectural constant check.

```json
{
  "id": "E5_phase_90",
  "title": "e^{iπ/2} ≈ (0,1) — 90° operator",
  "re": 6.123233995736766e-17,
  "im": 1,
  "pass": true,
  "interpretation": "Orthogonal flip operator used in the theorem statement.",
  "honesty": "Floating trig identity — architectural constant check."
}
```

### E6_egs_phi — E_F = Φ_EGS fixture

- **Pass:** `true`
- **Interpretation:** Catalog harmonic key in the latency model cosine.
- **Honesty:** Architectural constant — not a physics replacement for ℏ.

```json
{
  "id": "E6_egs_phi",
  "title": "E_F = Φ_EGS fixture",
  "E_F": 1.618033988749895,
  "expected": 1.618033988749895,
  "pass": true,
  "interpretation": "Catalog harmonic key in the latency model cosine.",
  "honesty": "Architectural constant — not a physics replacement for ℏ."
}
```

### E7_latency_floor_model — Model cos((Δφ−90°)/E_F) = 1 at Δφ=90°

- **Pass:** `true`
- **Interpretation:** Closed-form design equation floor — not cloud invoice τ.
- **Honesty:** Narrative / model arithmetic only.

```json
{
  "id": "E7_latency_floor_model",
  "title": "Model cos((Δφ−90°)/E_F) = 1 at Δφ=90°",
  "factor": 1,
  "pass": true,
  "interpretation": "Closed-form design equation floor — not cloud invoice τ.",
  "honesty": "Narrative / model arithmetic only."
}
```

### E8_paper_on_disk — Canonical paper + Doc ID + Honesty on disk

- **Pass:** `true`
- **Interpretation:** Catalog fidelity for Omni-Lattice appendix sync.
- **Honesty:** Filesystem receipt — not peer review by itself.

```json
{
  "id": "E8_paper_on_disk",
  "title": "Canonical paper + Doc ID + Honesty on disk",
  "mono": "C:\\Users\\info\\OneDrive\\Desktop\\psw.vibelandia.sing13\\docs\\SYNTHOBS_OMNI_PRIME_HOURGLASS_SKELETON_2026-08.md",
  "mirror": "C:\\Users\\info\\OneDrive\\Desktop\\psw.vibelandia.sing13\\research\\synthobs-omni-prime-hourglass-skeleton\\docs\\SYNTHOBS_OMNI_PRIME_HOURGLASS_SKELETON_2026-08.md",
  "monoOk": true,
  "mirrorOk": true,
  "hasDocId": true,
  "hasHonesty": true,
  "registryId": "synthobs-omni-prime-hourglass-skeleton-2026-08",
  "pass": true,
  "interpretation": "Catalog fidelity for Omni-Lattice appendix sync.",
  "honesty": "Filesystem receipt — not peer review by itself."
}
```

### E9_lobe_balance — Both mod-4 lobes non-empty under bound

- **Pass:** `true`
- **Interpretation:** Hourglass schematic needs both cones.
- **Honesty:** Heuristic balance under fixed N — not equidistribution proof.

```json
{
  "id": "E9_lobe_balance",
  "title": "Both mod-4 lobes non-empty under bound",
  "n1": 44,
  "n3": 50,
  "ratio": 0.88,
  "pass": true,
  "interpretation": "Hourglass schematic needs both cones.",
  "honesty": "Heuristic balance under fixed N — not equidistribution proof."
}
```

## Honesty boundary

Algebraic / catalog receipts for the prime hourglass Omni-Lattice lens. Does **not** claim measured SI latency τ→0, zero GPU heat, or that Lattice Chat Agent runtime already implements prime-phase addressing.
