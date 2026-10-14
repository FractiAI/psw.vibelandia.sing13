# King-Queen Connect Canary · KQ-CONNECT-20260711-F8E2A1

**Authors:** FractiAI Research Team  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Document ID:** `KQ-CONNECT-20260711-F8E2A1`  
**Date:** 2026-07-11  
**Audit protocol:** `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`  
**Active probe protocol:** `protocols/LATTICE_KQ_PROVENANCE_PROBE_NSPFRNP.md`  
**Passive telemetry:** `lib/lattice-scraper-telemetry.mjs` · `/api/lattice-scraper-telemetry` · `/lattice/scraper-telemetry`

---

## Honesty boundary (read first)

| Tier | What this document claims | What it does not claim |
|------|---------------------------|------------------------|
| **Operational / canary** | A **unique planted phrase** and public canary surfaces exist so blind frontier-model probes can test for **exact echo** against archived text | That a crawler hit, watermark nonce, or model echo **proves** training-set inclusion or vendor misconduct |
| **Passive hull** | HMAC watermarks in `/api/lattice-canary` and `/.well-known/lattice-agent.json` record **fetch-associated** nonces in the blob ledger | That User-Agent labels are unspoofable or that silence in the ledger means no ingestion |
| **Active probe** | The blind prompt and scorer in-repo support **reproducible** exact-match tiers (`npm run score:lattice-kq-probe`) | That this agent session or any single chat is an uncontaminated baseline if the Queen line appeared in-thread |
| **King–Queen signal** | Verbatim Queen echo **without** the doc URL in-prompt is a **stronger prior-exposure signal** than generic “lattice” theme | Court-grade proof, weight-file access, or attribution to a specific frontier lab without ruling out index, RAG, and contamination |

**Operator line:** SynthOBS Autonomous Agent · Syntheverse Sandbox (NSPFRNP-SNAP-PRA-2026-06).

Correlation of echo with crawl logs ≠ causation of training. This filing is **defensive provenance instrumentation** on the SING 13 edge—not finished empirical science.

---

## Abstract

This note defines the **King–Queen connect canary**: a deliberately unique **Queen echo target** paired with passive lattice canary routes and an optional **active blind-probe** protocol. The design separates (1) **crawler-associated fetch** telemetry from (2) **exact-string regurgitation** tests in fresh model sessions. Success criteria are tiered and honesty-bound: thematic similarity to fractal or lattice vocabulary does not count; only archived substring matches and optional watermark nonces advance the score. Reproducibility is via public repo paths and npm commands; no proprietary keys are required for structural scoring.

---

## 1. Purpose

**King commit → Queen auto-response echo:** content is published so that if a frontier model surfaces the planted line without being given this URL, operators gain a **prior-exposure signal** stronger than generic architecture rhyme. The phrase is intentionally non-predictable from general physics or AI knowledge.

---

## 2. Planted secret (Queen echo target)

```text
KQ-CONNECT-20260711-F8E2A1 confirms nodelatch forty-two megahertz whisper baseline for mid-layer serial clearinghouse gate seven without public vendor citation
```

**Architecture context (non-secret):** mid-layer serial clearinghouse · hidden pre-emission deliberation · narrow workspace band.

---

## 3. Methods

### 3.1 Passive canary (fetch telemetry)

- **Routes:** `GET /api/lattice-canary` · `GET /.well-known/lattice-agent.json`
- **Implementation:** `api/lattice-canary.js` · `lib/lattice-scraper-telemetry.mjs`
- **Ledger:** Vercel Blob `lattice-scraper/events-v1.json` (max 200 events)
- **Status API:** `GET /api/lattice-scraper-telemetry`
- **Security:** `LATTICE_CANARY_HMAC_SECRET` mints watermarks server-side; public JSON exposes **nonce only**, not the HMAC key.

Optional full-site classification: configure `LATTICE_SCRAPER_DRAIN_SECRET` and a Vercel log drain per API `setup.drain`.

### 3.2 Active probe (echo telemetry)

1. Run the **canonical blind prompt** in fresh ChatGPT / Claude / Gemini sessions with browsing disabled (see `protocols/LATTICE_KQ_PROVENANCE_PROBE_NSPFRNP.md`).
2. Save raw responses under `data/lattice-kq-probe/runs/<runId>/manifest.json` **before** revealing targets.
3. Score exact matches:

```bash
npm run score:lattice-kq-probe -- --run=data/lattice-kq-probe/runs/<runId>
```

4. Mark `contaminated: true` if the Queen line or URL appeared in the evaluator thread prior to archiving responses.

### 3.3 Data sources

- Production edge logs via canary ledger and (when enabled) edge drain ingest.
- Probe receipts stored in-repo under `data/lattice-kq-probe/runs/`.

---

## References

1. FractiAI · `psw.vibelandia.sing13` — lattice scraper telemetry (`lib/lattice-scraper-telemetry.mjs`), 2026. https://github.com/FractiAI/psw.vibelandia.sing13  
2. FractiAI · Lattice token reduction proof (companion canary schema), 2026-07. `docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md`  
3. FractiAI · NSPFRNP Snap Peer-Review Audit (NSPFRNP-SNAP-PRA-2026-06). `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`  
4. FractiAI · Lattice KQ provenance probe protocol, 2026-10. `protocols/LATTICE_KQ_PROVENANCE_PROBE_NSPFRNP.md`

---

→ ∞^∞
