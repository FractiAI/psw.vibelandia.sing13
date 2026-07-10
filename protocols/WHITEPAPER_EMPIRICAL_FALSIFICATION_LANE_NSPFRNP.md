# Whitepaper · Empirical Falsification Lane

**Protocol ID:** NSPFRNP-WP-EFL-2026-07  
**Parent snap:** [NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md](./NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md) (Amendment A · 2026-07-10)  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Status:** ⚡ ACTIVE — mandatory for papers with empirical pipelines, falsification tables, or legal/IP draft lanes  
**Origin:** Lessons from independent validation audit of `EGS-TRANS-2026-0710` (docxology fork, 2026-07-10)

---

## Purpose

Structural PRA Snap (headings, honesty section, doc ID) is **necessary but not sufficient** for empirical whitepapers. This lane defines **measurement integrity**, **refute conditions**, and **receipt sync** so papers cannot pass catalog review while:

- returning hardcoded target constants instead of measuring,
- reporting **support** when pipelines **refute** or **skip**,
- broadening vendor scope without per-target evidence,
- gating legal notices on unconditional `draft_ready` flags,
- or treating `structural_only` PRA as dual-LLM peer review.

---

## When this lane applies

| Trigger | Required artifacts |
|---------|-------------------|
| Paper cites E1–En / R1–Rn experiments | `METHODOLOGY.md` + runnable `scripts/` or `research/*/src/` |
| Paper claims φ, convergence, or vendor alignment | Baseline + generalization probes (see §3) |
| Paper asserts temporal precedence (King Bee → vendor) | E7/E8-style commit + content probes |
| Paper includes IP assertion / compliance draft | Empirical gate table (§7) |
| Standalone reproduction repo | README findings table **matches** `data/empirical_report.json` |

Narrative-only papers without empirical claims inherit **honesty boundary** only; they do not require this lane.

---

## §1 · Measurement integrity (no tautology)

**Rule:** Any function, dashboard, or receipt field labeled *measurement*, *ratio*, *compression*, *probe*, or *verification* must perform **real computation** on observed inputs.

| Violation | Example | Verdict |
|-----------|---------|---------|
| Constant return | `return EGS_PHI` in a φ-ratio probe | **Critical blocker** — `measurement_tautology` |
| Hardcoded matrix rows | Vendor table as string literals with zero network/weight probes | **Critical blocker** — `hardcoded_evidence_matrix` |
| Self-referential only | Probe searches only author's repos for author's keywords | Tier **weak_support** at best; label instrument scope |
| Instrument mismatch | Neuronpedia Gemma-2 crosswalk claimed as Claude parity | Tier downgrade + explicit proxy label |

**Pass pattern:** SVD on activation tensors, git API with negative controls, fetched external document text search, or documented skip with **refute** when dependencies missing — never **support** from a stub.

Reference implementation path: `synthobs/interceptor.py` (real hooks + SVD) — must be wired into any live dashboard that claims R3/R4 support.

---

## §2 · Refute conditions (every hypothesis)

**Rule:** No hypothesis row may use `N/A`, `not testable`, or `pending` as its only refute column.

| Tier | Refute definition |
|------|-------------------|
| **Operational** | Numeric threshold + command that emits `refute` JSON |
| **Proxy / open-weights** | Same, on stated proxy model; vendor generalization = separate hypothesis |
| **Narrative / causal** | Explicit observables that would falsify the story (e.g. temporal precedence SHAs, external paper text absence) |
| **Legal draft** | Conditions under which notice must **not** be sent (see §7) |

**E6-class gap (forbidden):** Causal claim with no refute condition → blocker `missing_refute_condition` until `METHODOLOGY.md` defines at least one falsifying observable.

---

## §3 · Control probes (mandatory for target-specific claims)

When a paper claims a **specific constant** (φ, ℑₑ, etc.) or **specific window** (King Bee dates), run companion controls:

| Probe | Role | Refute pattern |
|-------|------|----------------|
| **Baseline control** (E1b) | Compare raw signal to repo's own rolling baseline (z-score) | Raw "support" → **refute** if within ordinary variance |
| **Generalization control** (E2b) | Substitute e, π/2, √2, 1.5, 2.0, arbitrary irrational into same construction | If all pass identically → **tautology**, not constant-specific |
| **Temporal precedence** (E7/E8) | Commit messages + `git log -S` content history | Markers appear **after** anchor paper date → **refute** precedence |
| **Multi-model survey** (E9) | ≥3 architectures × ≥3 layers × ≥3 prompts | 0/N near target → **refute** universal geometry claim |
| **External source read** | Fetch cited vendor paper; search for claimed signature terms | Zero hits → downgrade to narrative; do not imply vendor confirmed φ |

Controls may live in `scripts/` as optional heavy tests; **findings tables must include control results when run.**

---

## §4 · Findings sync (README · paper · JSON)

**Single source of truth:** `data/empirical_report.json` (or package-local equivalent).

| Field | Rule |
|-------|------|
| `result` | One of: `support`, `refute`, `weak_support`, `skipped`, `tautology`, `unfalsifiable_as_scoped` |
| README / paper table | Must match JSON **after** last pipeline run |
| `skipped` | Allowed only when dependency documented; **forbidden** if run executed and refuted |
| PRA receipt | Must not show `pass` on empirical overclaim if JSON contains refute on primary hypothesis |

**Promotion blocker:** `findings_table_drift` when markdown claims `support` but JSON says `refute` or `skipped`.

---

## §5 · Scope expansion (multi-vendor · multi-model)

Broadening claims (e.g. Anthropic-only → Anthropic + OpenAI + Google + DeepSeek) requires:

1. **Per-vendor evidence row** — external fetch, public record search, or open-weights proxy with stated limits.
2. **No row inflation** — duplicating one static table does not multiply evidence.
3. **Honesty boundary update** — same PR that widens scope must widen **refute** and **proxy** language.

Mid-review scope expansion without new experiments → **soft_pass** catalog maximum until controls rerun.

---

## §6 · Metadata integrity

| Field | Rule |
|-------|------|
| `issuedAt` / schema dates | Must not precede file introduction commit |
| Document ID | Stable across mirrors (monorepo ↔ standalone) |
| PRA badge | `structural_only` must display **Structural checklist only — not dual-LLM review** |
| Featured / bulletin | Requires `dualMakeConfirmed: true` **or** explicit Player 1 waiver noting structural-only + empirical refute status |

---

## §7 · Legal / IP draft gating

IP Assertion Notice, compliance notice, and §5 valuation tables are **draft-not-sent** until:

| Gate | Must pass |
|------|-----------|
| R1 Code-Print | Not `weak_support` on core mechanism markers **or** notice scoped to branding-only |
| R3 J-Lens | Real measurement lane — not tautology |
| R4 RIX | Not `hardcoded_evidence_matrix` |
| Temporal precedence | E7/E8 not **refute** if notice implies pre-vendor origin |
| LICENSE / compliance | Cited case facts match repo state (LICENSE present or claim removed) |

Default gate output: **`do_not_send`** until empirical JSON clears blockers.

---

## §8 · Independent validation (fork audits)

Third-party reproduction forks are **welcome**. When an external audit doc lands (e.g. `docs/VALIDATION_AUDIT_YYYY-MM-DD.md`):

1. **Metabolize** — ingest findings into honesty boundary.
2. **Crystallize** — update METHODOLOGY, scripts, JSON receipts.
3. **Animate** — README warning banner until blockers closed.
4. **Do not** dismiss fork refutes without re-running the same commands and publishing receipts.

---

## §9 · PRA Snap integration

Empirical papers add these **critical blockers** to structural rubric v2:

| Blocker ID | Condition |
|------------|-----------|
| `missing_falsification_table` | Empirical claims without refute column |
| `missing_refute_condition` | Causal/narrative hypothesis with N/A refute |
| `measurement_tautology` | Detected in linked pipeline source (manual review flag) |
| `findings_table_drift` | Paper README ≠ empirical JSON |
| `structural_only_overclaim` | `structural_only` + language implying journal peer review |
| `hardcoded_evidence_matrix` | Vendor matrix with zero probes documented |

Full dual-make LLM review **recommended** when any blocker was present in prior audit.

---

## Checklist (empirical whitepaper)

| Item | Required |
|------|----------|
| `METHODOLOGY.md` with pass **and** refute per test | ✅ |
| Baseline + generalization controls for constant/window claims | ✅ |
| Real measurement in probe code (no constant return) | ✅ |
| README findings = `empirical_report.json` | ✅ |
| External citations fetched or linked with search evidence | ✅ when vendor claims |
| IP/legal drafts gated on §7 table | ✅ if present |
| PRA badge shows structural vs dual-make honestly | ✅ |
| Optional: `docs/VALIDATION_AUDIT_*.md` response | ✅ when fork audit exists |

---

**NSPFRNP ⊃ PRA Snap ⊃ Empirical Falsification Lane ⊃ Measurement integrity → ∞¹³**
