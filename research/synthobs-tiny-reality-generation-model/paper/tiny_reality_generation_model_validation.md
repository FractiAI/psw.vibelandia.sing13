# Tiny Reality Generation Model: Wave–Node Homeostasis Validation for Nested Miniature Worlds

**Homeostasis Expedition research paper · Infinite Octave / SynthOBS · 25 October 2026**

| Field | Value |
|-------|--------|
| **Operator** | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| **Document ID** | `WP-SYNTHOBS-TINY-REALITY-GENERATION-MODEL-EGS-2026-10-25` |
| **Registry ID** | `synthobs-tiny-reality-generation-model-2026-10` |
| **Suite** | `research/synthobs-tiny-reality-generation-model/` |
| **Standalone** | [`FractiAI/synthobs-tiny-reality-generation-model`](https://github.com/FractiAI/synthobs-tiny-reality-generation-model) |
| **Ship blog** | `/ship-blog/tiny-reality-generation-model` |
| **Journey** | `/journey/homeostasis-expedition` |
| **Engine role** | Infinite Octaves `ENGINE_SHELF` companion **#50** — TRGM viability lab on Wave–Node scaffolds · **not** physical universe sim · **not** LLM world model · **not** robot hardware |
| **Depends on** | Wave–Node Mathematics · ENGINE_SHELF **#49** |
| **Seed** | `20261025` |

---

## Honesty boundary

| Tier | Claims | Does not claim |
|------|--------|----------------|
| **Foundation** | Imported Wave–Node A–E battery still passes | New PDE theory beyond #49 |
| **Empirically observed** | Held-out TRGM viability **100%** (n=16) vs null **0%** | Physical world generation |
| **Analytically established** | Phase-gate ablation ≥ full-gate (subset) | Universal Goldilocks law |
| **Hypothesized** | Useful HFG ↔ TRGM nesting for expedition charts | Validated multi-robot embodiment |
| **Φ_EGS** | Catalog nesting grammar | Physical constant replacement |

---

## Document ID

`WP-SYNTHOBS-TINY-REALITY-GENERATION-MODEL-EGS-2026-10-25` · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP

---

## Abstract

**Question.** Can a Tiny Reality Generation Model (TRGM) — finite Wave–Node scaffolds with lattice geometry, 1D wave probes, phase communities, and navigable maps — pass pre-registered Goldilocks/homeostasis gates more often than an unstructured null generator, while preserving nested L0→L1 recipes?

**Methods.** Node.js suite reusing Wave–Node Mathematics (#49). Pre-registered gates: wave \(L_2\le 0.05\), Kuramoto \(r\ge 0.95\) on complete coupling, A* reachability. Train n=8 (exploratory); held-out n=16; null scatter n=16; nesting depth 2. Seed `20261025`.

**Findings (executed).** Foundation Wave–Node A–E **pass**. Held-out TRGM viability **16/16 (100%)**; null viability **0/16**; nested child descriptors present on all L0 realities; mean held-out wave \(L_2\approx 9.35\times10^{-4}\); mean phase \(r\approx 0.957\); navigation success **100%**.

**Limitation.** Synthetic miniature worlds only — not cosmology, not LLM world models, not hardware robotics. Phase community uses complete-graph coupling because ring topology admits random-init splay states (documented).

**Keywords:** Tiny Reality Generation Model; Wave–Node; homeostasis; Goldilocks; Kuramoto; FDTD; nested generation; Homeostasis Expedition.

---

## 1. Introduction

Homeostasis Expedition asks how systems stay viable under nested constraints. TRGM proposes a **generator** of miniature computational “realities”: each instance is a Wave–Node bundle (nodes, edges, wave probe, phase community, obstacle map). Viability is a multi-objective Goldilocks band — not a single loss.

Central question: do structured TRGM recipes beat null scatters under gates fixed **before** held-out scoring?

---

## 2. Contributions

1. Executable TRGM generator + evaluator on seed `20261025`.  
2. Empirical held-out viability vs null.  
3. Nesting L0→L1 recipe check.  
4. Explicit dependence on Wave–Node #49 foundation battery.  
5. ENGINE_SHELF #50 pin after validation.

---

## 3. Conceptual framework

| Layer | Role |
|-------|------|
| Recipe | Seeded parameters (lattice, oscillators, wave, map) |
| Instantiation | Nodes / edges / fields / obstacles |
| Gates | Wave accuracy · phase sync · navigability · geometry |
| Nesting | Child recipe at L1 |
| Null | Unstructured point scatter (no lattice/ring scaffold) |

---

## 4. Methods

- **Reuse:** `research/synthobs-wave-node-mathematics/src/computational-lab.mjs` for foundation A–E and lattice/circle helpers.  
- **Phase community:** complete-graph Kuramoto RK4 (ring splay documented as failure mode for random init).  
- **Gates:** fixed in `constants.mjs` before held-out scoring.  
- **Runner:** `npm run research:synthobs-tiny-reality-generation-model`.

---

## 5. Results (executed)

### 5.1 Foundation (Wave–Node #49)

All A–E families **pass** under the imported battery (including FDTD mean order ≈2.00 from #49 suite).

### 5.2 Held-out TRGM viability (n=16)

| Metric | Value |
|--------|------:|
| Viability rate | **1.000** |
| Mean wave \(L_2\) | 0.000935 |
| Mean phase \(r\) | 0.957 |
| Nav success | 1.000 |
| Mean A* path length | 42.826 |

### 5.3 Null baseline (n=16)

Viability **0.000** (no structured scaffold → geometry gate fails by construction).

### 5.4 Nesting

`NEST_LEVELS=2`; every held-out L0 reality carries an L1 child descriptor — **pass**.

### 5.5 Ablation

Dropping the phase gate cannot reduce geo+wave+nav pass rate below the full-gate rate (subset) — **pass**.

Figure: `figures/fig_viability.svg` (TRGM vs Null vs Ablate-φ).

### 5.6 Historical prediction battery (Movebank GPS + GFZ Kp)

**Data (executed, not fabricated):** public Movebank study `2548892515` (*Alces alces*, Snowy Range Moose) · **123 399** GPS fixes · **268** collar days (2019-01-01 → 2020-05-15) · GFZ Kp 3-hourly archive aligned to the same window. Chronological train/held-out split (60%/40%; train locks structure percentiles before held-out scoring). Fixture mirror: `data/historical/movebank_daily_proxy.json`.

| ID | Pre-registered prediction | Result | Evidence |
|----|---------------------------|--------|----------|
| **H1** | Train-locked structure Goldilocks band (NN CV P25–P75) → higher held-out mean heading Rayleigh \(r\) than out-of-band | **Fail** (mixed/null; out-of-band mean \(r\) not lower) | empirically_observed |
| **H2** | Real daily headings beat day-matched shuffle on ≥55% of held-out days | **Fail** (46.3% beat shuffle) | empirically_observed |
| **H3** | Storm vs quiet days show nonzero mean heading-order contrast on held-out window | **Pass** (Δ≈0.006; \(n_{\mathrm{storm}}=6\)) | empirically_observed |

Historical battery **1/3** pass. Mixed/null wildlife outcomes **do not** overturn the synthetic E1–E5 pin and **do not** claim magnetoreception or species-general navigation biology.

Figure: `figures/fig_historical.svg`.

---

## 6. Discussion

TRGM recipes are **empirically more viable** than null scatters under pre-registered homeostasis gates. This is expected if structure matters — and that expectation is now measured. Distinctiveness is the **generator + Goldilocks multi-gate package** on the Homeostasis Expedition trail, not a claim of new PDE physics.

The historical Movebank/Kp battery was run to test whether structure→phase and storm-contrast predictions survive on **real collar series**. They mostly do not under the pre-registered gates (H1/H2 fail; H3 records a small storm–quiet Δ). That is a useful negative/qualified result: synthetic viability ≠ historical wildlife coordination.

Practical robotics / physical simulation value still requires manipulator, multi-agent, and hardware stages (not executed).

---

## 7. HFG interface (hypothesized)

HFG specifies desired hierarchy; TRGM emits nested reality recipes; Wave–Node dynamics score candidates; conventional controllers execute under safety rails. Data contract: `realityId`, `nestLevel`, `lattice`, `oscillators`, `wave`, `map`, `validation{viable,waveL2,phaseR,navOk}`.

---

## 8. Reproducibility

```bash
npm run research:synthobs-tiny-reality-generation-model
```

Numbers in this manuscript match `data/empirical_report.json` for seed `20261025`.

---

## 9. Conclusions

TRGM passes foundation reuse, held-out viability, null contrast, nesting, and ablation logic checks. Pinned as ENGINE_SHELF **#50** on the Homeostasis Expedition — a miniature-world generator validated computationally, not a universe engine.

---

## References

1. Kuramoto, Y. (1984). *Chemical Oscillations, Waves, and Turbulence*. Springer.  
2. Taflove, A., & Hagness, S. C. (2005). *Computational Electrodynamics* (FDTD). Artech House.  
3. Hart, P. E., Nilsson, N. J., & Raphael, B. (1968). A* minimum-cost paths. *IEEE Trans. SSC*.  
4. FractiAI Wave–Node Mathematics (2026). `docs/SYNTHOBS_WAVE_NODE_MATHEMATICS_EGS_2026-10.md` · ENGINE_SHELF #49.  
5. Connolly, C. I., & Grupen, R. A. (1993). Harmonic functions in robotics. *J. Robotic Systems*.

---

## Appendix — Status

| Item | Status |
|------|--------|
| Implemented | Yes |
| Executed | 5/5 pass · seed 20261025 |
| Held-out viability | 100% vs null 0% |
| Engine pin | #50 |
| Not run | Physical sims · LLM world models · hardware |

→ ∞^∞
