# SynthOBS · Table-Top High-Energy Physics (99 Octave)

**GitHub:** https://github.com/FractiAI/synthobs-table-top-hep-99-octave · **License:** MIT  
**Document ID:** `WP-SYNTHOBS-TABLE-TOP-HEP-99-OCTAVE-2026-08-23`  
**Registry ID:** `synthobs-table-top-hep-99-octave-2026-08`  
**Catalog mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

## Intention

**Catalog / engine paper** — collider footprint reduction as a **scale-grammar** filing under $\Phi_{\mathrm{EGS}}$, with benchtop triad sketches and proposed lab protocol fixtures. Not a working CERN replacement.

## Run

```bash
npm run research
# or from monorepo root:
npm run research:synthobs-table-top-hep-99-octave
```

Writes `data/empirical_report.json` (**target: 9/9 pass**).

## Layout

```
docs/          # paper mirror
data/          # empirical receipts
src/           # constants + E1–E9 experiments
scripts/       # pipeline runner
```

## Standalone GitHub

```bash
node scripts/publish-standalone-suite.mjs synthobs-table-top-hep-99-octave --create-repo
```

## Honesty

Architectural HEP footprint grammar. Not multi-TeV benchtop proof, not accelerator certificate, not unsupervised RF/pulsed-power authorization.

Paper (monorepo): `docs/SYNTHOBS_TABLE_TOP_HEP_99_OCTAVE_2026-08.md`  
Catalog: `/whitepaper/synthobs-table-top-hep-99-octave`

→ ∞^∞
