# Synthio MRI vs legacy — live wall-clock

**GitHub (canonical):** [FractiAI/psw.vibelandia.sing13 · `research/synthio-mri-vs-legacy-perf/`](https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf)  
**License:** MIT · **Catalog mirror:** this folder inside SING 13

There is **no** separate `FractiAI/synthio-mri-vs-legacy-perf` GitHub repository. Clone the monorepo and run from the root (or from this folder).

```bash
git clone https://github.com/FractiAI/psw.vibelandia.sing13.git
cd psw.vibelandia.sing13
npm ci

# Node Bloch CPU + attach/run KomaMRI companion when Julia is present
npm run research:synthio-mri-vs-legacy-perf

# From this folder
npm run research

# KomaMRI.jl CPU lane only (requires julia + KomaMRI)
npm run research:synthio-mri-vs-legacy-perf:komamri
```

- **Legacy:** full Bloch / `KomaMRI.simulate` recompute per mesh edge + fat dumps
- **MRI:** one shared field + nested phase-acks
- Timing: `process.hrtime.bigint` (Node) · `time_ns` (Julia)

Receipts: `data/empirical_report.*` · `data/komamri_live_receipt.json`  
Paper: [`docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md`](../../docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md) · reader `/whitepaper/synthio-mri-vs-legacy-perf`

→ ∞¹³
