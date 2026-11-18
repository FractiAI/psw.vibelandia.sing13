# Rhyming vs Non-Rhyming World Models

**Do rhyming world models outperform non-rhyming ones — after prior expeditions already showed that rhyming a shared world between agents produces observable, replicable, falsifiable, paradigm-shifting gains?**

**Document ID:** `WP-RHYMING-VS-NON-RHYMING-WORLD-MODELS-EGS-2026-11-18`  
**Registry ID:** `synthobs-shared-world-collective-intelligence-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition  
**Date:** 18 November 2026  
**Harness:** FractiSI Multi-Agent `experiments/world-model-expedition/`  
**Ship blog:** `/ship-blog/shared-world-collective-intelligence`

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story / application companion | Head-to-head rhyming vs non-rhyming world models | ENGINE_SHELF pin |
| Empirical (Level 2–3) | Real E9/Movebank fixtures + live CPU open WM arms + FractiSI rhyme engine | Embodied Level 5 |
| Prior expeditions | Exp 002 / Tiny Gateway already established rhyming shared-world gains | Re-litigating that baseline as unknown |
| Open WMs | Dreamer-family / TD-MPC-lite / MuZero-lite **live on CPU** | Full GPU Genie/Cosmos/V-JEPA zoo |

## Title lock

Prior expeditions already showed that **rhyming a shared world model between agents** produces observable, replicable, falsifiable differentiated improvements — paradigm-shifting collective ability under fixed budgets.

**This expedition’s job is the comparison:** rhyming world models vs non-rhyming world models (exact-cache, prefix reuse, non-rhyming shared structured state, independent worlds, and live open latent predictors).

## Primary research question

Where do rhyming world models outperform non-rhyming ones — especially on high-value traffic (same organization, different words) — and how do they complement single-agent latent world models?

## Method

See `docs/world-model-expedition/experimental-design-v2.md`.  
Run: `npm run research:world-model-expedition` in FractiSI Multi-Agent.

## Computational Lab

| Comparison | Result (user-aware) |
|---|---|
| Rhyme vs exact-cache on differing-words (E9, Movebank) | **Rhyme outperforms** (~33–45%; exactTextHits≈0) |
| Rhyme vs prefix on identical strings | Prefix can win — easy/low-value slice (~75%+ duplicates) |
| Rhyming shared world vs independent | Collective tasks succeed; independent fails |
| vs live Dreamer/TD-MPC/MuZero-family | **COMPLEMENTARY_DIFFERENTIATED** |

CartPole partial-obs: shared world return **200** vs independent **~14**. Exp 002 reproduction: guided **100/100** vs flat **0/100**.

## EXECUTABLE status lock

| Arm | Status on this expedition |
|---|---|
| Dreamer-family RSSM | **EXECUTABLE** (live CPU train/predict/plan) |
| TD-MPC-lite | **EXECUTABLE** (live CPU) |
| MuZero-lite | **EXECUTABLE** (live CPU) |
| FractiSI rhyme engine | **EXECUTABLE** |
| V-JEPA 2 | Not on this CPU VM (needs GPU) |
| Cosmos | Not on this CPU VM (needs GPU) |
| Genie 3/4 | Closed — no weights |

## Live open world-model arms

CPU PyTorch: Dreamer-family RSSM, TD-MPC-lite, MuZero-lite. They own single-agent imagination/planning. They do **not** natively share/merge a multi-agent world. FractiSI rhyming shared world owns that job.

Still needing GPU/large downloads: V-JEPA 2, Cosmos, Genie (closed).

## Evidence hierarchy

**Level 2–3** computational with pinned public fixtures + live open WM training. Not Level 5.

## Document lineage

Exp 002 · Tiny Gateway rhyme vs cache · Multi-Agent platform · this rhyming vs non-rhyming comparative expedition.

→ ∞^∞
