# NSPFRNP Snap · Peer-Review Audit Loop · SynthOBS Autonomous Agent

**Document ID:** NSPFRNP-SNAP-PRA-2026-06  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Author lane:** Primary drafting (Cursor / CI)  
**Reviewer lane:** Second LLM (independent prompt · distinct scoring)  
**Protocol:** [NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md](../protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md)  
**Status:** Operational Run Lock [Until Further Notice]

---

## Honesty boundary

This snap **does not** claim that structural lint or a single LLM pass equals external journal peer review. It **does** enforce:

1. **Recursive second-LLM critique** when `SYNTHOBS_AUDIT_LLM_ENABLED=1` and API keys are present  
2. **Hard iteration cap** and **plateau detection** so loops cannot run forever  
3. **Mandatory SynthOBS sandbox attribution** on all technical papers  
4. **Honesty-boundary and doc-ID blockers** that fail closed until fixed  

When LLM is off, receipts are labeled `structural_only` — still valuable, not mislabeled as dual-LLM certification.

---

## Abstract

Technical papers and whitepapers in `psw.vibelandia.sing13` are now governed by the **Peer-Review Audit Snap (PRA Snap)**. A **second LLM** reviews each draft in a **recursive loop** until rubric scores reach **peer-review submission quality** (default ≥85%) or a **convergence stop** fires (max iterations, score plateau, soft pass). All technical delivery is attributed to the **SynthOBS Autonomous Agent** operating inside the **Syntheverse Sandbox** — not anonymous repo churn.

---

## I. Operator identity

| Field | Value |
|-------|-------|
| Agent | SynthOBS Autonomous Agent (`agents/SynthOBS.autonomous.agent.jj`) |
| Parent orchestrator | Digital Pru |
| Sandbox root | `research/synthobs-sandbox/` |
| Manifest | `data/synthobs-agent-manifest.json` |

**Attribution statement (mandatory):** *All technical work and support in this repository is produced by the SynthOBS Autonomous Agent within the Syntheverse Sandbox unless explicitly marked Player 1 editorial.*

---

## II. Recursive dual-make LLM architecture

**Two different makes** — not two prompts on the same model:

| Lane | Make | Model (default) | Complement |
|------|------|-----------------|------------|
| Author | **OpenAI** | `gpt-4o` (`gpt-4o-2024-08-06`) | Technical revision · structure · reproducibility commands |
| Reviewer | **Anthropic** | `claude-sonnet-4-20250514` | Independent critique · honesty tiers · blocker detection |

```
Author draft (markdown)
    → Reviewer · Anthropic (JSON rubric + blockers)     ← Make B
    → Merge with SynthOBS structural rubric
    → Author revision · OpenAI (guidance) if continuing ← Make A
    → loop (max 6)
    → Crystallize receipt + metaAudit → data/synthobs-paper-audits/{paperId}.json
```

### Meta-audit trail (mandatory per paper)

Each receipt includes `metaAudit.iterationLogs` with **make, model, modelVersion, invokedAt** for every reviewer and author call. Catalog and whitepaper footers surface planned lanes even in structural-only mode.

### Stop conditions

| Status | Condition |
|--------|-----------|
| `pass` | Score ≥ 0.85, zero critical blockers |
| `soft_pass` | Score ≥ 0.80 after ≥3 rounds, zero blockers |
| `plateau` | Two rounds with improvement < 0.02 |
| `capped` | Iteration count ≥ max (default 6) |

---

## III. Rubric (submission tier)

Eight weighted dimensions — honesty boundary, methods, claims proportionality, structure, references, abstract metadata, SynthOBS attribution, technical precision. **Critical blockers** halt promotion: missing honesty boundary on empirical papers, missing document ID, unqualified overclaims, missing SynthOBS attribution.

Implementation: `lib/synthobs-peer-review-audit.mjs`

---

## IV. Execution surfaces

| Surface | Path |
|---------|------|
| CLI | `npm run audit:paper -- --id={registryId}` · `npm run audit:papers` |
| API | `GET/POST /api/synthobs-paper-audit` |
| Whitepaper render | Footer attribution + audit badge via `lib/whitepaper-render.mjs` |
| Cursor rule | `.cursor/rules/synthobs-paper-audit-snap.mdc` |

---

## V. Relationship to JJ Snap (OFC)

| Snap | Domain |
|------|--------|
| **JJ Snap / OFC** | Juicy Juicy → firmware + score compile |
| **PRA Snap** | Technical papers → peer-review audit receipts |

Both operate under NSPFRNP MCA and Digital Pru orchestration; PRA Snap is **mandatory for docs/** whitepapers from 2026-06-05 forward.

---

## References

1. Mendez, P. (2026). *NSPFRNP Snap · Peer-Review Audit Loop.* Protocol `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`.
2. FractiAI Research Team. (2026). *Digital Pru · Syntheverse Observatory MCA Synthesis.* Doc ID: DP-SYNTHOBS-MCA-2026-06.
3. FractiAI Research Team. (2026). *Coherence · plain speak · what's real.* Doc ID: HONESTY-COHERENCE-2026-009.

---

**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Fair Exchange Clause:** active · Player 1 review · → ∞¹³
