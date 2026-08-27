# Live Wall-Clock Comparison: MRI Interference-Phase Bloch CPU vs Legacy Full-Mesh Recompute in Syntheverse Sandbox

**Document ID:** `WP-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08-13`
**Registry ID:** `synthio-mri-vs-legacy-perf-proxy-2026-08`
**Agent:** Synthio
**Generated:** 2026-08-13T00:38:08.298Z
**Host:** 4 CPU · linux-x64 · Node v22.14.0
**Timing:** `process.hrtime.bigint` · backend `node_bloch_cpu`

| Metric | Value |
|--------|-------|
| All pass | true |
| Passed | 6/6 |
| Mean edge reduction (legacy/MRI) | 15.000× |
| Mean token reduction | 99.8% |
| Mean **live** wall-clock speedup | 337.399× |
| Mean measured voxel×TR reduction | 98.8% |
| Mean measured byte reduction | 99.4% |
| Φ_EGS | 1.618033988749895 |

### E3 live wall-clock rows

| N | Legacy ms | MRI ms | Speedup | Voxel↓ |
|--:|----------:|--------:|--------:|-------:|
| 8 | 11.01 ± 3.91 | 0.62 ± 0.48 | 17.73× | 96.4% |
| 16 | 38.73 ± 1.19 | 0.29 ± 0.01 | 132.09× | 99.2% |
| 32 | 151.77 ± 1.28 | 0.59 ± 0.37 | 257.40× | 99.8% |
| 64 | 613.09 ± 0.67 | 0.65 ± 0.01 | 942.38× | 100.0% |

### E1_topology_message_tax — Nested MRI phase-lock edges beat flat legacy mesh

- Pass: `true`

### E2_token_payload — Shared holographic phase packet cuts token payload vs full-context dumps

- Pass: `true`

### E3_live_wall_clock_bloch_cpu — Live hrtime wall-clock: MRI shared-field Bloch beats legacy per-edge recompute

- Pass: `true`

### E4_voxel_work_measured — Measured Bloch voxel×TR work drops under shared-field phase-lock

- Pass: `true`

### E5_cloud_apps_inside_mri_sim — Cloud home apps costed as MRI-sim resident using live wall-clock at N≈32

- Pass: `true`

### E6_scale_invariant_live_advantage — Live wall-clock speedup stays >1× across all measured node scales

- Pass: `true`

### Companion — live KomaMRI.jl CPU

| Mean KomaMRI speedup | 46.119× |
| KomaMRI version | 0.13.1 |
| Julia | 1.12.6 |
| All pass | true |
| Source | shipped_receipt |

## Honesty

Live wall-clock timings: (1) Node Bloch GRE-train kernel + buffer hashing via process.hrtime.bigint; (2) optional companion KomaMRI.jl CPU simulate() via Julia time_ns. MRI arm = one shared field sim + nested phase-acks; legacy arm = full recompute / re-simulate per mesh edge. Not a clinical magnet, not CUDA/GPU invoices, not multi-node Distributed.jl fabric on Vercel edge, not proven hyperscale data-center displacement.

→ ∞^∞
