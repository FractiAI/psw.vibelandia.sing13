# Lattice vs Vibe Coding — design · write · deploy

**GitHub:** https://github.com/FractiAI/synthobs-lattice-vs-vibe-coding · **License:** MIT  
**Document ID:** `WP-SYNTHOBS-LATTICE-VS-VIBE-CODING-DESIGN-WRITE-DEPLOY-2026-09-02`  
**Registry ID:** `synthobs-lattice-vs-vibe-coding-2026-09`  
**Catalog mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13)

## Intention

Paired comparison of **Infinite Octaves Omniversal Lattice Chat** vs **standard vibe coding** (fat corpus paste / undirected agentic roam) across three software-delivery phases:

1. **Design** — multi-band architecture and nested-agent planning  
2. **Write** — code locate, pointer-RAG, patch generation  
3. **Deploy** — ops/config grounding and ship readiness

## Run

```bash
npm run research
# or from monorepo root:
npm run research:synthobs-lattice-vs-vibe-coding
```

Writes `data/empirical_report.{json,md}` synthesizing committed monorepo receipts.

## Layout

```
docs/          # paper mirror
data/          # empirical receipts
src/           # constants + experiments E1–E7
scripts/       # pipeline runner
```

## Standalone GitHub

**Live:** https://github.com/FractiAI/synthobs-lattice-vs-vibe-coding (`main`)

Sync updates with:

```bash
node scripts/publish-standalone-suite.mjs synthobs-lattice-vs-vibe-coding
```

## Honesty

Uses committed Cursor usage matrix + structural comparison receipts. Not a universal invoice SLA. Re-run live matrix: `npm run compare:lattice:cursor:matrix`.

Paper (monorepo): `docs/SYNTHOBS_LATTICE_VS_VIBE_CODING_DESIGN_WRITE_DEPLOY_2026-09.md`  
Catalog: `/whitepaper/synthobs-lattice-vs-vibe-coding`

→ ∞^∞
