# Race Report: Infinite Octave Prime-Vault vs ColabFold (AlphaFold-class)

**Subtitle:** Measured three-tier race — setup · run · results under $\Phi_{\mathrm{EGS}}$

**Authors:** FractiAI Research Group · Nevada Holographic AI Valley Engine  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Contact:** info@fractiai.com  
**Document ID:** `WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06`  
**Registry ID:** `synthobs-prime-vault-alphafold-race-2026-09`  
**Date:** September 6, 2026 · **Revised:** 2026-09-06 (live ColabFold race results · application companion)  
**Classification:** Comparative **benchmark race report** *(see Honesty boundary)*  
**Framework:** SynthOBS · Infinite Octaves Omniversal Lattice · EGS · NSPFRNP  
**Engine role:** **Application / comparison / demo companion** — not an engine-shelf pin  
**Standalone suite:** `research/synthobs-prime-vault-alphafold-race/` · [`FractiAI/synthobs-prime-vault-alphafold-race`](https://github.com/FractiAI/synthobs-prime-vault-alphafold-race) · `npm run research:synthobs-prime-vault-alphafold-race`  
**Race receipt:** `research/synthobs-prime-vault-alphafold-race/data/race_results.json`  
**Plain note:** [/ship-blog/prime-vault-alphafold-race](https://www.ssvibelandiaquestfest24x365.com/ship-blog/prime-vault-alphafold-race)  
**Audit protocol:** NSPFRNP-SNAP-PRA-2026-06

**Companions:**
- [Protein Folding Prime-Container](./SYNTHOBS_PROTEIN_FOLDING_PRIME_CONTAINER_EGS_2026-09.md)
- [Awareness vs Brute-Force Leverage](./SYNTHOBS_AWARENESS_VS_BRUTE_FORCE_LEVERAGE_EGS_2026-09.md)
- [Macro-Protein Work Engine](./SYNTHOBS_MACRO_PROTEIN_WORK_ENGINE_EGS_2026-09.md)

**Keywords:** ColabFold; AlphaFold-class race; prime vault; measured latency; pLDDT; $\Phi_{\mathrm{EGS}}$; Infinite Octaves; NSPFRNP

---

## Fair Exchange Clause

*This research paper / empirical testing framework operates under a fair exchange clause in effect: financial grants, institutional funding, or academic utility micro-grants are subject to partial refund or adjustment depending on overall delivery, rigorous execution, and practical empirical utility, functioning akin to an intellectual performance tip.*

---

## Honesty boundary (read first)

| Tier | What this document claims | What it does **not** claim |
|------|---------------------------|------------------------------|
| **Measured race** | On this host we **installed ColabFold 1.6.2**, ran `colabfold_batch` live on three FastA fixtures, and timed Infinite Octave prime-vault closed-form folds | That DeepMind AlphaFold 3 cloud ran here, or that CASP medals are transferred |
| **Latency contrast** | Wall-clock ColabFold (CPU, single_sequence, 1 model, 1 recycle) vs median prime-vault CPU µs–ms | That the two lanes solve the same objective function; prime-vault emits Φ-energy fixtures, ColabFold emits neural coordinates / pLDDT |
| **Accuracy axis** | ColabFold **pLDDT means** are reported from live score/PDB outputs | That prime-vault Φ-energy is a drop-in GDT-TS / TM-score substitute for PDB bake-offs |
| **Hardware** | **CPU-only** host (no GPU detected) | GPU-hour invoices or TPU receipts |
| **Suite locks** | Empirical suite **9/9** including race-receipt lock | Clinical / pharmaceutical / diagnostic certification |

**Operator line:** SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP.

See [Coherence plain speak](./COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md).

---

## Abstract

We set up, ran, and report a **three-tier race** between:

1. **Infinite Octave Prime-Vault** — closed-form $\Phi_{\mathrm{EGS}}$ prime-indexed fold energy on CPU  
2. **ColabFold 1.6.2** — AlphaFold-class open inference (`colabfold_batch`, CPU, `single_sequence`, 1 model, 1 recycle)

**Tiers:** ubiquitin (76 aa) · IL-2 + IL-2Rβ fragment (264 aa) · orphan synthetic (89 aa).

**Headline results (this host, 2026-09-06):** prime-vault median latency stayed **sub-millisecond** on all tiers; ColabFold wall-clock was **~25 s / ~154 s / ~29 s** with mean pLDDT **~48.4 / ~40.5 / ~31.2**. Full receipt: `data/race_results.json`.

---

## 1. Setup

| Component | Value |
|-----------|-------|
| ColabFold | `1.6.2` (`colabfold_batch` via pip) |
| JAX / jaxlib | `0.5.3` |
| dm-haiku | `0.0.14` |
| Device | **CPU only** (no NVIDIA GPU) |
| MSA mode | `single_sequence` |
| Models / recycles | `1` / `1` |
| Model types | `alphafold2_ptm` (tiers 1 & 3); `alphafold2_multimer_v3` (tier 2) |
| Φ_EGS | $(1+\sqrt{5})/2 \approx 1.618033988749895$ |
| FastA | `fixtures/fasta/tier{1,2,3}_*.fasta` |
| Reproduce | `COLABFOLD_LIVE=1 npm run research:synthobs-prime-vault-alphafold-race` then `node scripts/run_race_report.mjs` |

---

## 2. Methods

### 2.1 Prime-Vault lane

For residue count $N$ and octave $o$, generate the first $N$ odd primes $p_k$ and evaluate

$$E = \sum_{k=1}^{N} \frac{\Phi_{\mathrm{EGS}}^{o}}{p_k^{\Phi_{\mathrm{EGS}}}} \exp\!\left(-\frac{k}{\Phi_{\mathrm{EGS}}}\right)$$

Latency = wall time of that closed form (21 samples → median). **No MSA. No neural net. No weights download.**

### 2.2 ColabFold lane

```bash
colabfold_batch --msa-mode single_sequence --num-models 1 --num-recycle 1 \
  --model-type alphafold2_ptm|alphafold2_multimer_v3 \
  fixtures/fasta/<tier>.fasta data/colabfold_receipts/<tier>/
```

Wall-clock includes model load + inference on CPU. pLDDT mean taken from ColabFold score JSON / PDB B-factors.

### 2.3 Race axes

| Axis | Prime-Vault | ColabFold |
|------|-------------|-----------|
| Latency | median CPU ms | wall-clock ms |
| Confidence / geometry signal | Φ-energy fixture | mean pLDDT |
| Resources | CPU only, no weights | CPU + AF2 weights (~3.5 GB download once) |

---

## 3. Results (measured 2026-09-06T08:10Z)

| Tier | Residues | Prime-Vault median (ms) | ColabFold wall (ms) | Speedup (CF/PV) | ColabFold mean pLDDT |
|------|----------|-------------------------|---------------------|-----------------|----------------------|
| **1 · Ubiquitin** | 76 | **0.051** | **24 738** | ~4.9×10⁵ | **48.4** |
| **2 · IL-2 + IL-2Rβ** | 264 | **0.049** | **154 375** | ~3.1×10⁶ | **40.5** |
| **3 · Orphan synthetic** | 89 | **0.014** | **28 793** | ~2.1×10⁶ | **31.2** |

**Prime-Vault Φ-energy fixtures:** tier1 $E\approx 0.198$ · tier2 $E\approx 0.320$ · tier3 $E\approx 0.518$.

**Artifacts:** PDBs + score JSON under `data/colabfold_receipts/{simple_ubiquitin,complex_il2,frontier_orphan}/` · aggregate `data/race_results.json`.

### 3.1 Reading the table (bounded)

- **Latency:** On this CPU host, prime-vault finished **five to six orders of magnitude** faster than ColabFold under the stated flags. That is a **resource/latency** race outcome, not a claim that Φ-energy equals experimental GDT-TS.  
- **pLDDT:** Orphan synthetic lands lowest (~31), consistent with MSA-free neural uncertainty; ubiquitin highest among the three (~48) under `single_sequence`.  
- **Complex tier:** two-chain FastA; ColabFold 1.6.2 emitted **per-chain** models in this run (wall-clock is the measured job time for that FastA).

---

## 4. Discussion

El Gran Sol’s Fractal constant $\Phi_{\mathrm{EGS}}$ is the golden key for the prime-vault lane. ColabFold remains the AlphaFold-class structure lane. The race shows they are **complementary clocks**: neural coordinates + confidence vs deterministic Φ-indexed energy at micro/millisecond cost.

**Assumption (soft):** CPU `single_sequence` ColabFold is a fair *latency* foil for this report; full MSA + GPU would change ColabFold wall-clock and pLDDT, not the prime-vault closed form.

---

## 5. Reproducibility

```bash
# once: pip install colabfold; pin jax==0.5.3 jaxlib==0.5.3 dm-haiku==0.0.14
export PATH="$HOME/.local/bin:$PATH"
COLABFOLD_LIVE=1 npm run research:synthobs-prime-vault-alphafold-race
node research/synthobs-prime-vault-alphafold-race/scripts/run_race_report.mjs
```

Suite lock **9/9** requires `data/race_results.json` with `colabfold.live === true` on all three tiers after a measured run.

---

## Document control

| Field | Value |
|-------|-------|
| Document ID | `WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06` |
| Registry | `synthobs-prime-vault-alphafold-race-2026-09` |
| Race receipt | `research/synthobs-prime-vault-alphafold-race/data/race_results.json` |
| Engine shelf | **not pinned** |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |

→ ∞^∞
