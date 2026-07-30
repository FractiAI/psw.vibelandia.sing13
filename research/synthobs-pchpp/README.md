# SynthOBS · Phase-Contrast Holographic Prompting Paradigm (PCHPP)

**GitHub:** https://github.com/FractiAI/synthobs-pchpp · **License:** MIT  
**Document ID:** `WP-SYNTHOBS-PCHPP-2026-07-30`  
**Registry ID:** `synthobs-pchpp-2026-07`  
**Catalog mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

## Intention

**Observation experiment** — an operational protocol for exposing dual-layer diagnostics (**Somatic Shadow** vs **Holographic Code**) using El Gran Sol’s Fractal Constant ($E_F \approx 1.618$) as an informational contrast agent.

This repository is **standalone**. It is **not** wired into the Lattice Chat product engine.

## Run

```bash
npm run research
# or from monorepo root:
npm run research:synthobs-pchpp
```

Writes `data/empirical_report.json` (**target: 9/9 pass**).

## Layout

```
docs/          # paper mirror
data/          # fixtures, template, empirical receipts
src/           # constants + E1–E9 experiments
scripts/       # pipeline runner
```

## Standalone GitHub

This folder is the **exportable** standalone package for `https://github.com/FractiAI/synthobs-pchpp`.

To publish (Player 1 / org admin):

```bash
cd research/synthobs-pchpp
git init -b main
git add -A && git commit -m "Initial PCHPP observation suite"
gh repo create FractiAI/synthobs-pchpp --public --source=. --remote=origin --push
```

Until the remote exists, the monorepo catalog mirror remains canonical.

## Honesty

Architectural / in-silico observation metrics and authored fixtures. Not microscopy hardware, not physics derivation, not live vendor invoices, not Lattice Chat engine code.

Paper (monorepo): `docs/SYNTHOBS_PCHPP_PHASE_CONTRAST_HOLOGRAPHIC_PROMPTING_2026-07.md`  
Catalog: `/whitepaper/synthobs-pchpp`

→ ∞¹³
