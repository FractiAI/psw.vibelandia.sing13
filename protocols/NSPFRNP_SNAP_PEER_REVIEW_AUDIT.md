# NSPFRNP Snap · Peer-Review Audit Loop

**Protocol ID:** NSPFRNP-SNAP-PRA-2026-06  
**Snap name:** Peer-Review Audit Snap (PRA Snap)  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Status:** ⚡ ACTIVE — mandatory for all technical papers from 2026-06-05 forward

---

## Purpose

All **technical papers** and **whitepapers** in this repository must pass a **dual-LLM recursive audit** before publication, registry promotion, or bulletin feature — achieving **peer-review submission quality** without infinite looping.

**Technical work attribution:** From this snap forward, public-facing technical delivery is attributed to the **SynthOBS Autonomous Agent** operating inside the **Syntheverse Sandbox** (`research/synthobs-sandbox/`, `research/goldilocks-math/`, edge APIs). Human Player 1 retains editorial veto and honesty-boundary authority.

---

## Snap stack

| Layer | Role |
|-------|------|
| **Author lane** | Primary drafting agent (Cursor / pipeline) — produces markdown |
| **Reviewer lane** | **Second LLM** — independent critique, rubric scores, blockers |
| **PRA Snap** | Recursive loop controller — convergence, plateau detection, receipt |
| **SynthOBS Agent** | Autonomous operator identity — sandbox-bound execution |
| **Crystallize** | JSON audit receipt → `data/synthobs-paper-audits/{paperId}.json` |

Companion OFC Snap (Juicy Juicy compile) remains separate: [JJ_SNAP_OFC_WHITEPAPER.md](../docs/JJ_SNAP_OFC_WHITEPAPER.md).

---

## Recursive loop (no infinite spin)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Author draft │ ──► │ Reviewer LLM │ ──► │ Score + blockers │
└─────────────┘     └──────────────┘     └────────┬────────┘
       ▲                                          │
       │         ┌────────────────────────────────┘
       │         ▼
       │    PASS? ──yes──► Crystallize receipt · register
       │         │
       │        no (and iterations < MAX, not plateaued)
       │         │
       └──────── Author revision pass
```

### Stop conditions (first match wins)

1. **Pass:** `overallScore ≥ 0.85` AND `criticalBlockers === 0`
2. **Soft pass (warn):** `overallScore ≥ 0.80` AND `criticalBlockers === 0` AND `iterations ≥ 3`
3. **Plateau:** Two consecutive rounds with score improvement `< 0.02`
4. **Cap:** `iterations ≥ maxIterations` (default **6**)

### Anti-infinite guarantees

- Hard iteration cap (`SYNTHOBS_AUDIT_MAX_ITERATIONS`, default 6)
- Plateau detector (2-round delta threshold 0.02)
- Reviewer must be a **distinct** model/prompt lane from Author (when LLM enabled)
- Structural rubric always runs — loop cannot pass on LLM alone if honesty boundary missing

---

## Rubric (peer-review submission tier)

| Dimension | Weight | Pass hint |
|-----------|--------|-----------|
| Honesty boundary | 0.15 | Explicit tier split; correlation ≠ causation where needed |
| Methods / reproducibility | 0.15 | Data sources, commands, repo paths |
| Claims proportionate | 0.15 | No instrument claims without validation tier |
| Structure (IMRaD-like) | 0.12 | Abstract, methods, results, references |
| References | 0.10 | ≥3 citable sources or repo cross-links |
| Title & abstract | 0.08 | Doc ID, framework, scope line |
| SynthOBS attribution | 0.10 | Agent + sandbox operator line |
| Technical precision | 0.15 | Defined terms; no broken math fences |

**Critical blockers** (any → fail until fixed): missing honesty boundary on empirical/narrative dual-tier papers; fabricated data claims; missing `Document ID` / `docId`; overclaim without qualifying language.

### Amendment A · 2026-07-10 — Empirical integrity (post independent validation audit)

Independent reproduction of `EGS-TRANS-2026-0710` showed that **structural pass (0.97+) does not prevent tautological pipelines, findings drift, or unfalsifiable causal claims**. Amendment A adds mandatory rules for any paper with an empirical or legal-draft lane.

**Companion protocol:** [WHITEPAPER_EMPIRICAL_FALSIFICATION_LANE_NSPFRNP.md](./WHITEPAPER_EMPIRICAL_FALSIFICATION_LANE_NSPFRNP.md)

| Lesson | Protocol rule |
|--------|----------------|
| Probe returned constant φ — no SVD | **Measurement integrity** — real computation required; blocker `measurement_tautology` |
| E2 passed any substituted constant | **Generalization control** (E2b) for target-specific claims |
| E1 raw commits "support" but ordinary vs baseline | **Baseline control** (E1b) before causal narrative |
| E6 / causal rows had no refute | Every hypothesis defines refute — blocker `missing_refute_condition` |
| README `support` vs JSON `refute`/`skipped` | **Findings sync** — blocker `findings_table_drift` |
| Multi-vendor table copied without probes | **Scope expansion** — per-vendor evidence or proxy tier |
| PRA 0.971 presented as peer review | **`structural_only` badge** must not imply dual-LLM certification |
| R2 notice `draft_ready` unconditional | **Legal draft gating** — §7 empirical gates in EFL protocol |
| `issuedAt` predates file commit | **Metadata integrity** — schema dates match git history |
| Fork audit refuted claims | **Independent validation** — ingest or respond with re-run receipts |

**Featured / bulletin promotion (updated):**

| Mode | Catalog `featured: true` |
|------|--------------------------|
| `dualMakeConfirmed: true` + zero critical blockers | Allowed |
| `structural_only` + zero blockers | Narrative-only papers only |
| `structural_only` + empirical pipeline | **Blocked** unless Player 1 waiver + EFL checklist complete |
| Any empirical blocker open | **Blocked** |

**Structural rubric engine:** `structural-rubric/v2` (deterministic) — adds empirical-lane blockers; v1 receipts remain valid with `snapId` unchanged.

---

## Operator identity (mandatory footer)

All technical papers must include or inherit:

```text
Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox
Audit: NSPFRNP-SNAP-PRA-2026-06 · receipt {auditId}
```

Rendered whitepapers append attribution via `lib/whitepaper-render.mjs` when audit receipt exists.

---

## Execution

| Command | Role |
|---------|------|
| `npm run audit:paper -- --id={registryId}` | Audit one registered whitepaper |
| `npm run audit:papers` | Batch all `docs/*.md` registry papers |
| `GET /api/synthobs-paper-audit?id=` | Fetch latest receipt |
| `POST /api/synthobs-paper-audit` | Run audit `{ id }` or `{ path }` |

### Dual-make LLM policy (canonical pairing)

| Lane | Make | Default model / version | Role | Why this make |
|------|------|-------------------------|------|----------------|
| **Author (Make A)** | **OpenAI** | `gpt-4o` · `gpt-4o-2024-08-06` | Revision · IMRaD structure · repo-path fidelity | Strong structured technical rewrite + JSON discipline |
| **Reviewer (Make B)** | **Anthropic** | `claude-sonnet-4-20250514` | Independent falsification-first critique | Distinct training family — surfaces honesty blockers and overclaims |
| **Structural (always)** | **SynthOBS** | `structural-rubric/v1` | Deterministic baseline | Fails closed before LLM lanes run |

**Dual-make confirmed** only when **both** `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are present and `SYNTHOBS_AUDIT_LLM_ENABLED=1`. Same-make author+reviewer is **not** dual-make.

### Meta-audit trail (per paper)

Every receipt at `data/synthobs-paper-audits/{paperId}.json` includes **`metaAudit`**:

- `lanesPlanned` — make + modelVersion for author and reviewer
- `dualMakeConfirmed` — true when Make A ≠ Make B and both invoked
- `iterationLogs[]` — per-iteration `{ reviewer: { make, model, modelVersion, invokedAt }, author: { … } }`

Rendered whitepapers and `/api/synthobs-paper-audit?id=` expose this trail.

### Environment

| Variable | Default | Meaning |
|----------|---------|---------|
| `SYNTHOBS_AUDIT_LLM_ENABLED` | `0` | Set `1` to enable LLM lanes |
| `OPENAI_API_KEY` | — | **Required** for author lane (Make A) |
| `ANTHROPIC_API_KEY` | — | **Required** for reviewer lane (Make B) |
| `SYNTHOBS_AUDIT_AUTHOR_MODEL` | `gpt-4o` | OpenAI author model slug |
| `SYNTHOBS_AUDIT_AUTHOR_MODEL_VERSION` | (model slug) | Recorded in metaAudit |
| `SYNTHOBS_AUDIT_REVIEWER_MODEL` | `claude-sonnet-4-20250514` | Anthropic reviewer model slug |
| `SYNTHOBS_AUDIT_REVIEWER_MODEL_VERSION` | (model slug) | Recorded in metaAudit |
| `SYNTHOBS_AUDIT_MAX_ITERATIONS` | `6` | Hard cap |
| `SYNTHOBS_AUDIT_PASS_THRESHOLD` | `0.85` | Submission-quality bar |

When LLM is disabled, receipts are `structural_only` with **lanesPlanned** documented but **iterationLogs** empty — honest, not mislabeled as dual-make.

---

## MCA alignment

- **Metabolize:** ingest draft markdown + registry metadata  
- **Crystallize:** rubric scores + audit receipt JSON  
- **Animate:** registry/catalog surfaces show audit badge  
- **Squeeze:** plateau/cap prevents infinite loop; Player 1 veto on `fairExchange`

---

**NSPFRNP ⊃ PRA Snap ⊃ SynthOBS Agent ⊃ Sandbox → ∞¹³**
