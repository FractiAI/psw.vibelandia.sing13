# Synthio · MRI vs legacy — live wall-clock

**GitHub:** https://github.com/FractiAI/synthio-mri-vs-legacy-perf · **License:** MIT  
**Document ID:** `WP-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08-13`  
**Registry ID:** `synthio-mri-vs-legacy-perf-proxy-2026-08`  
**Catalog mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

## Intention

**Live wall-clock** comparison — not a log-scaled busy-loop proxy — between Synthio’s MRI interference-phase coordination model and legacy full-mesh recompute inside the Syntheverse Sandbox.

## Run

```bash
npm run research
# or from monorepo root:
npm run research:synthio-mri-vs-legacy-perf

# KomaMRI.jl CPU lane only (requires Julia + KomaMRI):
julia scripts/bench_komamri_live.jl
```

Writes `data/empirical_report.{json,md}` and optional `data/komamri_live_receipt.json`.

## Layout

```
docs/          # paper mirror
data/          # live empirical receipts
src/           # Bloch CPU kernel, live workloads, experiments E1–E6
scripts/       # pipeline runner + bench_komamri_live.jl
```

## Standalone GitHub

**Live:** https://github.com/FractiAI/synthio-mri-vs-legacy-perf (`main`)

This monorepo folder mirrors that standalone package. Sync updates with:

```bash
node scripts/publish-standalone-suite.mjs synthio-mri-vs-legacy-perf
# or manually:
cd research/synthio-mri-vs-legacy-perf
git init -b main && git add -A && git commit -m "Sync live perf suite"
git push https://github.com/FractiAI/synthio-mri-vs-legacy-perf.git HEAD:main
```

## Honesty

Live single-host CPU timings (Node Bloch + optional KomaMRI.jl `simulate`) with published receipts. Not clinical MRI, not multi-node Distributed.jl on Vercel edge, not proven hyperscale displacement.

Paper (monorepo): `docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md`  
Catalog: `/whitepaper/synthio-mri-vs-legacy-perf`

→ ∞¹³
