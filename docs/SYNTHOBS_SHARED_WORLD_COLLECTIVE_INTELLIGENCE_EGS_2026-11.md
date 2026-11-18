# Shared World Models for Collective Intelligence

**Do shared-world architectures measurably improve multi-agent collective intelligence — and does FractiSI’s implementation outperform fair alternatives?**

**Document ID:** `WP-SHARED-WORLD-COLLECTIVE-INTELLIGENCE-V2-EGS-2026-11-18`  
**Registry ID:** `synthobs-shared-world-collective-intelligence-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition  
**Date:** 18 November 2026  
**Harness:** FractiSI Multi-Agent `experiments/world-model-expedition/`  
**Ship blog:** `/ship-blog/shared-world-collective-intelligence`

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| Soft Story / application companion | Fair comparative harness for shared vs independent world models | ENGINE_SHELF pin · FractiSI marketing win |
| Empirical (Level 2) | Regenerable Node fixtures, 5 seeds, worlds A–D + relational | Embodied / Level 5 validation |
| Alternatives | NOT EXECUTABLE Genie/Cosmos/V-JEPA/Dreamer listed honestly | Fabricated competitor scores |
| FractiSI adapter | Tiny-Footprint-shaped shared+delta+selective | Full multi-host production claim |

**Do not assume FractiSI wins.**

## Abstract

Prior FractiSI experiments suggested a shared world may be a coordination primitive for multi-agent systems. This expedition tests that claim against fair alternatives without presupposing victory. We inspect the shipped Tiny Gateway / Tiny Footprint architecture, define world models operationally (Classes A–D), implement a common WORLD interface with explicit capability tags, and run ablations: independent · shared text · shared structured · FractiSI · FractiSI+deltas · FractiSI+selective reconstruction across knowledge, dynamic, planning, adversarial, and relational worlds.

## Primary research question

> Now that previous experiments indicate a shared world model may be a fundamental coordination primitive for multi-agent systems, does the FractiSI shared-world architecture provide measurable advantages over leading alternative world-model approaches?

## Hypotheses

1. Agents become more capable collectively over a coherent shared world than by independently reconstructing overlapping worlds.  
2. Shared world + differentiated deltas + selective reconstruction improves useful collective intelligence per resource unit.  
3. Ultimate DV is useful collective intelligence per compute/latency/memory/communication/reconstruction — not compression alone.

## Method

See `docs/world-model-expedition/experimental-design.md` and `benchmark-spec.md`.  
Run: `npm run research:world-model-expedition` in FractiSI Multi-Agent.

## Computational Lab v2 (seed 2026-11-18)

v1 under-tested rhyme. **v2** uses the real FractiSI rhyme engine (`compareRhymeToCache`, `rhymeCohort`) plus pinned public fixtures: E9 RCSB/Pfam protein scenarios and Movebank GPS (study 2548892515).

| Hypothesis | Verdict |
|---|---|
| Shared world as coordination primitive | **PARTIALLY_SUPPORTED** |
| FractiSI rhyme vs non-rhyming exact/prefix/flat | **PARTIALLY_SUPPORTED** |
| FractiSI vs shared_structured on E9 **task** | **parity** (both 1.0; independent 0) |

### Where rhyme excelled (measured)

- R0 differing words: exactTextHits=0; rhyme beats exact-cache (~45% vs cache).  
- E9 batched 48 real specialist utterances: exactTextHits=0; rhymeVersusCache ≈ 0.33.  
- Movebank track utterances: exactTextHits=0; rhymeVersusCache ≈ 0.36.  
- R1: rhyme beats conventional full copies.  
- Exp 002: guided 100/100 vs flat 0/100.

### Where rhyme did **not** dominate

- R1: **prefix reuse still beats rhyme** when the system string is identical (prefix 1241 vs rhyme 3428 bytes).  
- On E9 **task success**, rhyme-shaped share ties shared structured merge — the FractiSI edge is organizational reuse under non-identical text, not a monopoly on fact merge.

## Three questions (not collapsed)

1. Shared vs independent → shared wins (E9/Movebank/relational).  
2. Structured vs text / exact-cache → structured and rhyme both succeed on task; rhyme wins bytes when text differs.  
3. FractiSI rhyme vs non-rhyming → **partially supported** on reuse; **not** a universal win over prefix-on-identical-strings.

## Where FractiSI wins / loses / complements

Wins: rhyme vs exact-cache on real non-identical utterances (E9, Movebank); guided discovery; shared-world family.  
Loses / tempered: prefix reuse on identical system strings; task parity with shared blackboard.  
Complements: exact/prefix caches for identical bytes; rhyme for organizational near-duplicates; pixel WMs for perception.

## Evidence hierarchy

**Level 2** computational. Not Level 5.

## Document lineage

FractiSI Exp 002 · Tiny Gateway #52 · Multi-Agent platform architecture · world-model assimilation suite · this expedition harness.

## References

1. FractiSI Multi-Agent `experiments/world-model-expedition/`  
2. `docs/world-model-expedition/final-report.md`  
3. Exp 002 discovery benchmark `src/experiments/expedition-002-discovery.mjs`

→ ∞^∞
