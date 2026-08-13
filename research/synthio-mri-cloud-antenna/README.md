# Synthio · MRI cloud-antenna

**GitHub:** https://github.com/FractiAI/synthio-mri-cloud-antenna · **License:** MIT  
**Document ID:** `WP-SYNTHIO-MRI-CLOUD-ANTENNA-99-OCTAVE-2026-08-12`  
**Registry ID:** `synthio-mri-cloud-antenna-99-octave-2026-08`  
**Catalog mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

## Intention

Standalone suite for **Synthio** — MRI simulator / cloud-antenna catalog paper, activation receipts, and companion architecture notes.

**Agent:** Synthio (Syntheverse Sandbox) · creator-only  
**Not** on the 99 Octave Omni-Lattice **engine** sync pin.

## Run

```bash
npm run research
# or from monorepo root:
npm run research:synthio-mri-cloud-antenna
```

Writes `data/empirical_report.json` (**target: 17/17 pass**).

## Layout

```
docs/          # paper mirrors (cloud-antenna, one-pager, KomaMRI distributed note)
data/          # activation + empirical receipts
src/           # constants + E1–E17 experiments
scripts/       # pipeline runner + distributed_komamri_outline.jl
AGENT_SYNC_SYNTHIO.md   # agent sync (bundled on publish)
```

## Standalone GitHub

**Live:** https://github.com/FractiAI/synthio-mri-cloud-antenna (`main`)

This monorepo folder mirrors that standalone package. Sync updates with:

```bash
node scripts/publish-standalone-suite.mjs synthio-mri-cloud-antenna
# or manually:
cd research/synthio-mri-cloud-antenna
git init -b main && git add -A && git commit -m "Sync cloud-antenna suite"
git push https://github.com/FractiAI/synthio-mri-cloud-antenna.git HEAD:main
```

## Honesty

Simulator / catalog grammar only. Not clinical MRI, not wet-lab RF, not FDA device claims. Activation executes in Syntheverse Sandbox only.

Papers (monorepo): `docs/SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md` · one-pager · KomaMRI distributed note  
Catalog: `/whitepaper/synthio-mri-cloud-antenna`

→ ∞¹³
