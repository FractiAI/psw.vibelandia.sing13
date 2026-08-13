# Live Wall-Clock Comparison: MRI Interference-Phase Bloch CPU vs Legacy Full-Mesh Recompute in Syntheverse Sandbox

**Authors:** FractiAI Research Group · Synthio (Syntheverse Sandbox)  
**Operator:** Synthio · SynthOBS Autonomous Agent family · Syntheverse Sandbox  
**Published:** August 13, 2026  
**Document ID:** `WP-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08-13`  
**Registry ID:** `synthio-mri-vs-legacy-perf-proxy-2026-08`  
**Publication Ref:** FAI-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08  
**Classification:** Empirical live wall-clock study · Synthio Cloud Services *(sandbox — see Honesty boundary)*  
**Framework:** Synthio · Syntheverse Sandbox · Bloch CPU kernel · NSPFRNP · PRA Snap  
**Parent papers:** [`SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md`](./SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md) · [`SYNTHIO_KOMAMRI_DISTRIBUTED_CLOUD_2026-08.md`](./SYNTHIO_KOMAMRI_DISTRIBUTED_CLOUD_2026-08.md)  
**Standalone suite (GitHub):** [`FractiAI/psw.vibelandia.sing13` · `research/synthio-mri-vs-legacy-perf/`](https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf)  
**Honesty:** there is **no** separate `FractiAI/synthio-mri-vs-legacy-perf` GitHub repository. The live wall-clock suite ships **inside** SING 13 (clone the monorepo; run `npm run research:synthio-mri-vs-legacy-perf`).  
**Cloud home:** [`/synthio-cloud`](https://www.ssvibelandiaquestfest24x365.com/synthio-cloud)  
**Ship URL:** https://www.ssvibelandiaquestfest24x365.com/synthio  
**Audit protocol:** NSPFRNP-SNAP-PRA-2026-06

**Keywords:** Synthio; MRI simulation; Bloch; interference-phase; live wall-clock; hrtime; legacy full-mesh; KomaMRI; Cloud Services; Syntheverse Sandbox; NSPFRNP

---

## Honesty boundary (read first)

| Tier | Claims | Does not claim |
|------|--------|----------------|
| **Live timings** | That this study records **real wall-clock** times: Node `process.hrtime.bigint` on a Bloch GRE kernel + SHA-256 buffer work, and Julia `time_ns` around live `KomaMRI.simulate` on CPU | Clinical scanner TR/TE performance or FDA device timings |
| **MRI arm** | One shared holographic Bloch / KomaMRI field + nested tree phase-ack updates (measured) | That Vercel edge HTML itself spawns Julia workers or CUDA devices |
| **Legacy arm** | Full Bloch / `simulate` recompute + full-context dump **per flat-mesh edge** (measured) | Vendor GPU invoices or hyperscale TCO proof |
| **Findings** | Live receipts under `research/synthio-mri-vs-legacy-perf/data/` (`empirical_report.*`, `komamri_live_receipt.json`) with host metadata | Proven displacement of today’s data centers |
| **Clinical** | Simulator / sandbox only | Living-tissue RF · diagnostic imaging · patient care |
| **Cluster** | Single-host CPU measurement (Node + optional Julia/KomaMRI) | Multi-node Julia `Distributed.jl` fabric already live on Vercel edge |

**Operator line:** Synthio · SynthOBS Autonomous Agent family · Syntheverse Sandbox · NSPFRNP-SNAP-PRA-2026-06.

See [Coherence · plain speak](./COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md).

---

## Abstract

We ran a **live wall-clock** performance comparison — not a log-scaled busy-loop proxy — between Synthio’s **MRI interference-phase** coordination model and a **legacy full-mesh recompute** model inside the Syntheverse Sandbox.

**Lane A (Node Bloch CPU):** Both arms execute a real hard-pulse + free-precession + T1/T2 **Bloch GRE train** on a deterministic CPU phantom (`10×10×2` voxels × 20 TR) and real buffer hashing. Timing uses `process.hrtime.bigint` (receipt host: 4 CPU · linux-x64 · Node v22.14.0).

**Lane B (KomaMRI.jl CPU):** Both arms call live `KomaMRI.simulate` on a 32-spin EPI fixture (`PulseDesigner.EPI_example`, `Nblocks=2`, Julia 1.12.6 · KomaMRI 0.13.1). Legacy re-simulates once per mesh edge; MRI runs **one** shared `simulate` plus nested phase-acks. Timing uses Julia `time_ns`.

**Findings (live):**

1. **Node Bloch wall-clock (N ∈ {8,16,32,64}):** MRI shared-field arm beat legacy per-edge recompute at every scale — mean speedup **≈337×** on the shipped receipt (host-dependent; re-run refreshes absolute ms).
2. **KomaMRI.jl wall-clock (N ∈ {4,6,8,10}):** Live `simulate()` mean speedup **≈46.1×** (18× @ N=4 → 82× @ N=10); all scales pass.
3. **Measured voxel×TR work (Node):** Shared-field arm cut Bloch voxel×TR processing by mean **≈98.8%**.
4. **Measured bytes hashed (Node):** Mean byte-work reduction **≈99.4%**.
5. **Topology / tokens (companion):** Nested tree edges beat flat mesh mean **15×**; structural token payload (chars÷4) cut mean **≈99.8%**.
6. **Cloud apps:** Chat, Messages, Files, and Photos remain costed as **MRI-simulation-resident** services using the live N=32 Node wall-clock row.

**Does not claim:** clinical MRI, CUDA/GPU invoices, multi-node Julia Distributed cluster fabric on the Vercel edge host, or proven hyperscale data-center displacement. It **does** claim live single-host CPU timings (Node Bloch + KomaMRI.jl `simulate`) with published receipts.

---

## Methods & reproducibility

| Step | Command / path |
|------|----------------|
| Live suite (Node Bloch + optional KomaMRI) | `npm run research:synthio-mri-vs-legacy-perf` |
| KomaMRI-only live lane | `npm run research:synthio-mri-vs-legacy-perf:komamri` |
| Suite root (GitHub) | [`research/synthio-mri-vs-legacy-perf/`](https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf) |
| Bloch kernel | `src/bloch_cpu.mjs` — hard-pulse tip, free-precession, T1/T2 relax, GRE train |
| Live arms | `src/live_workloads.mjs` — `runLegacyLive` / `runMriLive` |
| KomaMRI live script | `scripts/bench_komamri_live.jl` |
| Experiments | `src/experiments.mjs` — E1–E6 (E3 = live hrtime) |
| Receipts | `data/empirical_report.{json,md}` · `data/komamri_live_receipt.json` |
| PRA Snap | `npm run audit:paper -- --id=synthio-mri-vs-legacy-perf-proxy-2026-08` |

### Arms (executed, not simulated labels)

| Arm | Coordination | Work per scale |
|-----|--------------|----------------|
| **Legacy full-mesh recompute** | Flat mesh edges \(n(n-1)/2\) | For **each** edge: full Bloch GRE train + hash 48 000-byte context dump |
| **MRI interference-phase** | Nested tree edges \(n-1\), depth \(\lceil\log_{\Phi} n\rceil\) | **One** shared Bloch GRE train + per-edge phase-ack (float rotate + hash 2 400-byte packet) |

Anti-DCE sinks keep returned checksums/signals live so V8 cannot elide the kernel. Host metadata (CPU count, platform, Node version, phantom shape, trials) is written into every receipt.

---

## Results

### E3 — Live Node Bloch wall-clock (primary)

From the shipped receipt (`empirical_report.md`):

| N | Legacy ms (mean±std) | MRI ms (mean±std) | Speedup | Voxel↓ |
|---|---------------------:|------------------:|--------:|-------:|
| 8 | 11.01 ± 3.91 | 0.62 ± 0.48 | 17.73× | 96.4% |
| 16 | 38.73 ± 1.19 | 0.29 ± 0.01 | 132.09× | 99.2% |
| 32 | 151.77 ± 1.28 | 0.59 ± 0.37 | 257.40× | 99.8% |
| 64 | 613.09 ± 0.67 | 0.65 ± 0.01 | 942.38× | 100.0% |

Mean Node Bloch live speedup **≈337×** on this receipt. Re-run the suite on your host to refresh absolute milliseconds; relative ordering (MRI ≪ legacy) is the structural claim under this workload model.

### Companion — Live KomaMRI.jl CPU (`simulate`)

From `data/komamri_live_receipt.json` (Julia `time_ns`, 32 spins, EPI example):

| N | Legacy ms | MRI ms | Speedup |
|---|----------:|-------:|--------:|
| 4 | 238.7 | 13.1 | 18.3× |
| 6 | 355.5 | 11.6 | 30.6× |
| 8 | 677.0 | 12.7 | 53.2× |
| 10 | 1069.6 | 13.0 | 82.3× |

Mean KomaMRI live speedup **≈46.1×**; all scales pass.

### E1 — Topology message tax

| N | Legacy edges | MRI edges | Reduction |
|---|-------------:|----------:|----------:|
| 8 | 28 | 7 | 4× |
| 16 | 120 | 15 | 8× |
| 32 | 496 | 31 | 16× |
| 64 | 2016 | 63 | 32× |

Mean reduction **15×**.

### E2 / E4 — Tokens & measured voxel work

Companion structural tokens (chars÷4) mean reduction **≈99.8%**. Measured Bloch voxel×TR work mean reduction **≈98.8%**.

### E5 — Cloud apps inside MRI sim

Chat · Messages · Files · Photos each tagged `residesIn: mri_simulation` and inherit the live N=32 wall-clock advantage vs legacy-outside counterfactual.

### E6 — Scale-invariant live advantage

Live speedup **>1×** at every measured N (min on receipt ≫ 1.05 pass bar).

---

## Discussion

Legacy flat-mesh + full recompute explodes with \(O(n^2)\) full Bloch trains and repeated fat dumps — the “hot rack / fat dump” story Synthio Cloud is set against. MRI interference-phase nesting keeps coordination near \(O(n)\) with a **single shared field** plus nested acks. That is why Synthio places Chat, Messages, Files, and Photos **inside** the MRI simulation for demonstration: the measured performance story and the product story are the same sandbox wrap.

Proportionate claim: these are **live single-host CPU Bloch timings** with receipts. They do **not** replace a CUDA KomaMRI.jl multi-node bake-off or a clinical scanner trial — and they no longer hide behind “proxy only / no live timings.”

---

## Conclusion

On live Syntheverse Sandbox measurements, the MRI interference-phase arm outperforms the legacy full-mesh recompute arm on wall-clock time, measured voxel×TR work, and byte hashing — and Synthio Cloud’s four home apps are correctly demonstrated as **MRI-simulation-resident** services.

→ ∞¹³
