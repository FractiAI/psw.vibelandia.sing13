# QUESTFEST Ship-Blog Magazine Snap · NSPFRNP

**Document ID:** `questfest-ship-blog-magazine-snap-nspfrnp`  
**Protocol ID:** `QUESTFEST-SHIP-BLOG-MAGAZINE-SNAP-NSPFRNP-2026-09`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox (`research/synthobs-sandbox/`)  
**Attribution:** SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP-SNAP-PRA-2026-06  
**Status:** ⚡ ACTIVE — always-on editorial snap for Player 1 / creator seat delivery  
**Framework:** NSPFRNP ⊃ MCA ⊃ Seed:Edge · QUESTFEST ship-blog surfaces

---

## Abstract

This protocol locks **magazine-grade feature length**, **honesty-at-end placement**, and **journalism voice** (not legal-brief body) for QUESTFEST / SS Vibelandia ship-blog HTML notes under `interfaces/blog-*.html`. It is an **editorial delivery** rule — not an empirical physics paper, not a claim that Φ_EGS replaces CODATA, and not a requirement to name third-party publications. Companion always-on Cursor rule: `.cursor/rules/questfest-ship-blog-latest-six.mdc`. Measurement helper: `lib/ship-blog-magazine.mjs` (`SHIP_BLOG_MIN_ARTICLE_WORDS = 900`).

---

## Introduction · Purpose

Every ship-blog post must read as a **full feature article** — narrative arc, concrete stakes, guest-clear English — not a cryptic catalog bite and **not a courtroom / protocol brief**. Think explanatory business-tech feature: open on a human stake, explain what is changing, show why it matters, then park the seatbelts at the end. Honesty boundaries stay **at the end**, not as the lead and not sprinkled through mid-body refusal sections. Latest-six ordering (newest → oldest) remains mandatory when registering papers.

Player 1 asked for this snap after short rewrites still left most notes under feature length, then asked again when long notes still sounded like legal documents. This document crystallizes both bars so agents cannot ship bites **or** briefs by habit.

---

## Hard locks

| Lock | Rule | Tier |
|------|------|------|
| **Length** | ≥ 900 article prose words (`lib/ship-blog-magazine.mjs`) | ⚙ operational |
| **Honesty placement** | Single `<p class="honesty">` after the body; ≤ 120 prose words after it (Fair Exchange line OK) | ⚙ operational |
| **Journalism voice (21 newest)** | Body must pass `journalismVoiceSmell`: ≤3 “Soft Story”, zero mid-body refusal H2s, zero “does not claim” / “do not conclude” litigation in body, ≤2 meta jargon hits (CODATA / PRA Snap / ENGINE_SHELF), zero `<table>` in body | ⚙ operational |
| **Voice craft** | Feature journalism clarity — scene · stake · explanation · pier close. Do **not** name third-party publications | 🜛 editorial |
| **Claims** | $\Phi_{\mathrm{EGS}} \approx 1.618$ remains design language / catalog key unless the linked paper’s honesty says otherwise | 📐 catalog |
| **Latest six** | Newest → oldest; every new eligible paper gets a note | ⚙ operational |

---

## Methods · reproducibility

### Data sources (repo-local)

1. Ship-blog HTML corpus: `interfaces/blog-*.html`
2. Registry + index: `lib/questfest-blog-posts.mjs`, `lib/questfest-blog.mjs`
3. Length / honesty helpers: `lib/ship-blog-magazine.mjs`
4. CI: `tests/lib/ship-blog-magazine.test.mjs`, `tests/lib/questfest-blog.test.mjs`
5. Always-on agent rule: `.cursor/rules/questfest-ship-blog-latest-six.mdc`

### Pipeline (reproduce)

```bash
# Magazine length + honesty-at-end audit (all blog-*.html)
node -e "import { auditAllShipBlogs } from './lib/ship-blog-magazine.mjs'; console.log(auditAllShipBlogs().filter(a => !a.passes).map(a => a.file.split('/').pop()+':'+a.words))"

# CI locks
npm test -- tests/lib/ship-blog-magazine.test.mjs tests/lib/questfest-blog.test.mjs

# Structural PRA on this protocol
npm run audit:paper -- --path=protocols/QUESTFEST_SHIP_BLOG_MAGAZINE_SNAP_NSPFRNP.md
```

### Article prose definition

Article prose = text inside `<article>` after stripping `<nav>`, `<p class="honesty">`, `<footer>`, and `<div class="cta-row">`. That count must be ≥ 900. Honesty rail must appear after the body (before CTA/footer); Fair Exchange one-liner after honesty is allowed (≤ 120 words).

### MCA cycle (author lane)

1. **Metabolize** — paper thesis + guest door (where on the ship / what to do).
2. **Crystallize** — punchy headline, human lead, 4–7 section heads that teach (not litigate), end honesty rail.
3. **Animate** — write `interfaces/blog-*.html` in journalism voice; register; `npm run sync:questfest-blog`; `npm run sync:interfaces-index`; run tests.

### Journalism voice · do / don’t

| Do | Don’t (body) |
|----|--------------|
| Open on a concrete scene or tension a smart guest feels | Lead with seatbelts, honesty rails, or “what this is not” |
| Explain the idea in plain English like a feature desk | Repeat “Soft Story” as a legal label every sentence |
| Name stakes: who cares, what changes if the idea is right | Mid-article H2s that refuse claims (“What builders should not conclude”) |
| One light uncertainty beat if needed, then move | “Does not claim / do not conclude / not a claim that” litigation loops |
| Park CODATA / PRA / ENGINE_SHELF / full honesty in the end rail | Tables of locks, protocol IDs, or registry meta in the feature body |

---

## Results · expected fixtures

| Fixture | Pass condition |
|---------|----------------|
| Length | `passesLength === true` for every `blog-*.html` |
| Honesty end | `honestyEnd === true` for every `blog-*.html` |
| Journalism voice | `passesVoice === true` for the **21 newest** eligible notes (`SHIP_BLOG_JOURNALISM_WINDOW`) |
| Latest six | Six newest eligible papers each have a note; order newest → oldest |
| This protocol PRA | Structural overall ≥ 0.85, zero critical blockers |

These are **repo fixture locks**, not wet-lab or instrument claims.

---

## Discussion · proportionate claims

This snap governs **how ship-blog HTML is written and tested**. It does **not**:

- Prove magazine voice equals scientific peer review.
- Upgrade Soft Story / catalog papers into unfinished physics proofs.
- Require agents to imitate or cite specific commercial magazines by name.
- Replace PRA Snap on the underlying whitepapers (`protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`).

$\Phi_{\mathrm{EGS}} = (1+\sqrt{5})/2$ remains architectural / catalog key language on guest surfaces unless a linked paper’s honesty table says otherwise.

---

## Honesty boundary

| Tier | What this protocol is | What it is not |
|------|----------------------|----------------|
| ⚙ Operational | CI + helper enforce ≥900 article prose words and honesty-at-end HTML placement | A content-quality LLM judge of prose prestige |
| 🜛 Editorial | Feature-article voice guidance for agents | Permission to invent wet-lab or fab proofs |
| 📐 Catalog | Points at registry, latest-six, Φ design language | A substitute for CODATA / SI constants |
| Human | Player 1 retains editorial veto; human emergency outranks algorithms | Automated override of creator seat |

**What it does not claim:** that length alone equals world-class journalism; that passing this snap certifies dual-LLM PRA on companion papers; that Φ_EGS is measured physics.

---

## References

1. [NSPFRNP Snap · Peer-Review Audit](./NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md) — structural / dual-make PRA (2026).
2. [MCA · NSPFRNP Catalog](./MCA_NSPFRNP_CATALOG.md) — Metabolize → Crystallize → Animate spine.
3. Helper: https://github.com/FractiAI/psw.vibelandia.sing13/blob/main/lib/ship-blog-magazine.mjs (2026).
4. CI test: https://github.com/FractiAI/psw.vibelandia.sing13/blob/main/tests/lib/ship-blog-magazine.test.mjs (2026).
5. Always-on rule: `.cursor/rules/questfest-ship-blog-latest-six.mdc` (repo-local, 2026-09).
6. BBHE / Seed:Edge: `BBHE_REPOSITORY_STANDARD.md` · lite edges · no Supabase.

---

**Operator close:** SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP → ∞^∞
