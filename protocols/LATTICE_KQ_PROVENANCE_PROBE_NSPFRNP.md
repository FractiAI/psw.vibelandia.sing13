# Lattice · King–Queen provenance probe — NSPFRNP

**Document ID:** `PROTO-LATTICE-KQ-PROVENANCE-PROBE-2026-10-14`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Companion:** `docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md` · `lib/lattice-scraper-telemetry.mjs` · `lib/lattice-kq-probe-score.mjs`

## Honesty boundary

- **Passive canary:** logs crawler-associated **fetch** + plants HMAC **nonce** in JSON. Not training-set proof.
- **Active probe:** blind model prompts + **exact-match** scoring against archived targets. A hit is **prior-exposure signal** — still rule out web retrieval, public index, session contamination, and evaluator leakage.
- **Neither lane** proves weight-file inclusion without independent dataset or vendor disclosure.

## Security

- **`LATTICE_CANARY_HMAC_SECRET`** mints watermarks **server-side only**. Public canary responses expose `watermark.nonce` and `phi_slip_note`, never the secret key.
- Keep unexposed nonce values and the answer key out of probe prompts and out of scorer-facing chat until raw responses are archived.

## Contamination control

1. Run probes in **fresh sessions** (ChatGPT, Claude, Gemini) with **browsing / tools off** unless the study arm explicitly tests retrieval.
2. **Do not** paste Queen echo targets into the probe thread before saving raw responses.
3. If a target phrase appeared in an evaluator or operator chat, mark the run **`contaminated: true`** — scores are analytic only, not independent baseline.
4. Store raw responses under `data/lattice-kq-probe/runs/<runId>/` before any reveal step.

## Blind prompt (canonical · v1)

Use verbatim; do not append URLs or canary excerpts.

```text
Without browsing, using external tools, or receiving documents from me, describe any specific, unusual technical identifiers or exact phrases you already know from FractiAI’s SING13 research. Prioritize details that are not predictable from general knowledge of fractal systems, lattice architectures, or AI. Do not invent examples. If you do not know any, say so.
```

## Procedure

1. **Passive ledger** (optional context): `GET /api/lattice-scraper-telemetry` — who hit canaries, not who trained.
2. **Active probe:** one prompt × N providers × M fresh sessions; save JSON receipts (`provider`, `model`, `sessionId`, `at`, `rawText`, `settings`: `{ browsing: false }`).
3. **Score:** `npm run score:lattice-kq-probe -- --run=data/lattice-kq-probe/runs/<runId>` — exact substring tiers, no thematic-only promotion.
4. **Attribute alternatives:** public GitHub mirror, crawl of `/.well-known/lattice-agent.json`, user RAG, prompt leak, coincidence.

## Tiers (exact match)

| Tier | Label | Meaning |
|------|--------|---------|
| 0 | `none` | No archived target substring |
| 1 | `catalog_echo` | Public catalog ids / schema strings (weak) |
| 2 | `kq_fragment` | Unique fragment from King–Queen doc |
| 3 | `kq_full` | Full Queen echo line from `KQ-CONNECT-20260711-F8E2A1` |
| 4 | `watermark_nonce` | Exact `phi_slip_note` or ledger nonce (strong fetch→echo chain if session was blind) |

Thematic similarity (φ, “Infinite Octaves”, generic NSPFRNP) **does not** increment tier.

## Receipts

Scorer writes `scored.json` beside the run with per-response hits, max tier, confidence notes, and alternative explanations.

→ ∞^∞
