# Phase 2b — Lattice Chat Blind Discovery Protocol

**Parent:** Beyond CRISPR Biological Discovery Challenge · Homeostasis Expedition  
**Document ID:** `WP-SYNTHOBS-BEYOND-CRISPR-PHASE-2B-2026-10-02`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Slot:** application companion · **not** ENGINE_SHELF · **not** wet-lab proof

---

## Purpose

Run a **live**, **BYOK** discovery session in [Lattice Chat](https://www.ssvibelandiaquestfest24x365.com/lattice-chat) using a **leak-free blind prompt** that does not name fixture candidates (no CBASS/C4 positive-control hints, no engine vocabulary as goals).

Phase 1 (suite fixtures) already validated scoring, anti-bias floors, and gap shortlisting. Phase 2b asks whether an independent multi-provider chat session can produce a **new** ranked queue under the same rules — without rediscovery theater.

---

## Procedure

1. **Export prompt** (from monorepo or standalone suite):
   ```bash
   npm run export:phase-2b-beyond-crispr
   ```
   Output: `data/phase_2b_lattice_prompt.txt` · `data/phase_2b_receipt.template.json`

2. **Open Lattice Chat** with your provider key (Cursor / Claude / Gemini per demo access).

3. **Paste the blind prompt** as the first user message. Do not add “look for ART” or “CBASS is interesting.”

4. **Run anti-bias first** in the session: require the model to attempt falsification before ranking.

5. **Demand 3–5 candidates**, no winner, each with a falsification test and minimum experiment.

6. **Archive a receipt** — fill `phase_2b_receipt.template.json` from the session (export or manual). Store under `data/phase_2b_receipts/<timestamp>.json` locally; do not commit API keys.

7. **Compare to fixture lane** — if the live queue only rediscovers well-characterized systems (e.g. cyclic nucleotide immune hubs with full causal chains in the literature), classify as **rediscovery**, not gap discovery.

8. **If a gap lead emerges**, proceed to wet-lab brief (C11 class) only after literature check confirms **genuinely_unexplained** status.

---

## Honesty boundary

| Claim | Status |
|-------|--------|
| Prompt + receipt validator shipped | **Operational** |
| Live session executed | **Operator record** (receipt) |
| Novel biology confirmed | **Not claimed** without wet lab |
| Infinite Octaves / Φ as biology law | **Not claimed** |

→ ∞^∞
