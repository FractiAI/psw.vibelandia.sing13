# Synthio MRI vs legacy — live wall-clock

Real comparison (not a busy-loop proxy):

```bash
# Node Bloch CPU + attach/run KomaMRI companion when Julia is present
npm run research:synthio-mri-vs-legacy-perf

# KomaMRI.jl CPU lane only
npm run research:synthio-mri-vs-legacy-perf:komamri
```

- **Legacy:** full Bloch / `KomaMRI.simulate` recompute per mesh edge + fat dumps  
- **MRI:** one shared field + nested phase-acks  
- Timing: `process.hrtime.bigint` (Node) · `time_ns` (Julia)

Receipts: `data/empirical_report.*` · `data/komamri_live_receipt.json`  
Paper: `docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md`

→ ∞¹³
