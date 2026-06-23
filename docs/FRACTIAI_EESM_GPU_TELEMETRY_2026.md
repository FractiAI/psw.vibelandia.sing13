# Epigenetic Execution-State Modeling for Causal Invariance in GPU Performance Telemetry

**Questfest catalog:** [`/interfaces/whitepaper-catalog.html`](/interfaces/whitepaper-catalog.html) · **Filter:** Reproducible research

**GitHub:** https://github.com/FractiAI/eesm-gpu-telemetry

---

## Abstract

We introduce an epigenetic formulation of GPU execution analysis in which observable performance traces are treated as conditionally expressed phenotypes of a latent execution genome shaped by compiler transformations, scheduling effects, and runtime perturbations.

Rather than modeling hardware behavior as a fixed generative system, we define a Structural Causal Model (SCM) in which execution state, observation operators, and regime decoding interact as a layered epigenetic control system.

We show that regime stability is preserved under bounded interventions when the observation manifold remains injective over a restricted identifiable support, and we empirically validate invariance properties across microarchitectural perturbations, stream permutations, and graph-level compiler fusion.

---

## 1. Introduction

GPU performance profiling is typically treated as a static inference problem over hardware counters. Modern compiler stacks (Triton, TorchInductor, CUTLASS) introduce dynamic transformations that invalidate naive observational assumptions.

**Epigenetic execution-state model:**

| Layer | Symbol | Role |
|-------|--------|------|
| Latent execution genome | z_k | Instruction scheduling substrate |
| Epigenetic regulators | δ^(z) | Compiler fusion, kernel rewrite |
| Observational modulation | δ^(u) | CUPTI sampling noise |
| Phenotype | u_k | Raw hardware counters |
| Expression | O_θ | Bounded embedding P_k ∈ [0,1]³ |
| Regime label | R_k | Decoded bottleneck phase |

---

## 2. Epigenetic SCM

```
z_k := g(z_{k-1}, Ω, ε_k, δ_k^(z))
u_k := s(z_k, δ_k^(u))
R_k := h(O_θ(u_k), η_k)
```

**Mechanism invariance:** h and O_θ remain fixed under intervention.

---

## 3. Observation Manifold

**P_k = [CPI*_k, MPI*_k, DPI*_k]ᵀ** bounded to [0,1]³:

- CPI* = instruction pressure / issue slots
- MPI* = memory traffic / cache requests
- DPI* = stall cycles / warp eligibility

**Identifiable support M_id:** O_θ injective modulo ~_arch  
**Degenerate support M_deg:** κ(Σ_k) > K_max — geometry collapse

---

## 4. Pipeline

**f = h ∘ S_markov ∘ T_stream ∘ B_bounded ∘ O_θ**

| Operator | Implementation |
|----------|----------------|
| T_stream | `eesm/stream.py` — (streamId, start_ns) partial order |
| B_bounded | `eesm/embedding.py` — clip to [0,1]³ |
| S_markov | `eesm/markov.py` — Bregman + Viterbi |
| h | Regime decode + κ-gate |

---

## 5. Interventions

| Intervention | Operator | Tool |
|--------------|----------|------|
| do(δ_jit) | ±5%/±15% counter noise | `intervene_jit` |
| do(δ_reord) | Concurrency shuffle | `intervene_reord` |
| do(δ_fuse) | Triton fusion merge | `intervene_fuse` |

---

## 6. Results (reference)

### Table: Epigenetic Stability Under Intervention

| Condition | Drift | Stability | Error |
|-----------|-------|-----------|-------|
| Raw baseline | 0.245 | 0.407 | 0.593 |
| Full model | **0.008** | **0.991** | **0.009** |

Machine-readable: `paper/reference_tables.json`

---

## 7. EEIH and Stability Bound

**Epigenetic Execution Invariance Hypothesis (EEIH):** Decoded regime structure remains invariant under bounded epigenetic perturbations when O_θ is injective on M_id.

**CDE ≤ α · κ(Σ_k) · ε_embed**

---

## 8. Reproducibility

```bash
python tools/fetch_trace_corpus.py --demo
python tools/verify_audit.py
```

Outputs: `raw_outputs/audit_ledger.json`
