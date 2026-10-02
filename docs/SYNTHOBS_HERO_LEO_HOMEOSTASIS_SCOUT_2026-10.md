# Hero Leo — Scientific Scout · Homeostasis Expedition

**Autonomous research memory and publication-gated expedition cockpit (Phases 1–2)**

**Document ID:** `WP-SYNTHOBS-HERO-LEO-HOMEOSTASIS-SCOUT-2026-10-02`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Published:** 2026-10-02  
**Guest surfaces:** [`/journey/hero-leo`](https://www.ssvibelandiaquestfest24x365.com/journey/hero-leo) · API [`/api/hero-leo`](https://www.ssvibelandiaquestfest24x365.com/api/hero-leo) · trail [`/journey/homeostasis-expedition`](https://www.ssvibelandiaquestfest24x365.com/journey/homeostasis-expedition) · Beyond CRISPR peer [`/whitepaper/beyond-crispr-discovery`](https://www.ssvibelandiaquestfest24x365.com/whitepaper/beyond-crispr-discovery)  
**Slot:** **application companion (not ENGINE_SHELF)** — research-memory cockpit attached to the Homeostasis Expedition; not a claim of continuous autonomous wet-lab discovery.

---

## Abstract

This note specifies **Hero Leo**, the Scientific Scout of the Homeostasis Expedition on SS Vibelandia / FractiAI. Hero Leo’s research loop is:

`PROSPECT → DETECT → TRANSLATE → PRIORITIZE → INVESTIGATE → FALSIFY → CAPTURE → VALIDATE → PUBLISH WHEN MERITED → UPDATE → NEXT QUESTION`

Phases **1–2** (presence + research memory) are operational: a public cockpit, durable status, investigation ledger, evidence ladder (E0–E6), configurable publication gate, achievements, timeline, and provenance links. Seeded records are **real** Beyond CRISPR expedition work — not simulated “live research” theater. Continuous autonomous prospecting (Phase 3+), automatic final publication without human approval, and wet-lab execution are **explicitly not claimed**.

Discovery tools may be unconstrained internally. **Evidence and publication layers are strict** and must not require acceptance of FractiAI ontology.

---

## 1. Mission

Hero Leo is not a chatbot narrator. He is the Scout attached to the existing Homeostasis Expedition: visitors click from the expedition page into a research cockpit that shows what was investigated, what was falsified, what evidence level applies, what was published, and what remains open.

Governing rule:

> Explore without constraint. Hypothesize without attachment. Falsify aggressively. Measure conventionally. Publish only what the evidence supports. Preserve everything learned. Let the next question emerge from the evidence.

---

## 2. Methods / Reproducibility

**Code & data**

| Piece | Path |
|-------|------|
| Config + publication gate | `data/hero-leo/config.json` |
| Live status | `data/hero-leo/status.json` |
| Discovery ledger | `data/hero-leo/ledger.json` |
| Achievements / timeline / publications | `data/hero-leo/*.json` |
| Library | `lib/hero-leo.mjs` |
| API | `api/hero-leo.js` → `GET /api/hero-leo` |
| Cockpit UI | `interfaces/journey/hero-leo.html` |
| Tests | `tests/lib/hero-leo.test.mjs` |

**Reproduce**

```bash
npx vitest run tests/lib/hero-leo.test.mjs
node -e "import { buildDashboard } from './lib/hero-leo.mjs'; console.log(JSON.stringify(buildDashboard().metrics, null, 2))"
```

**Evidence ladder (ledger field `evidence_level`)**

| Level | Meaning |
|-------|---------|
| E0 | Speculation |
| E1 | Computational observation |
| E2 | Independent computational validation |
| E3 | Falsifiable prediction |
| E4 | Experimental validation |
| E5 | Independent replication |
| E6 | Established mechanism |

**Publication gate:** criteria and `minCriteriaPass` live in `config.publicationGate` (not hard-coded only in UI). Final external publication requires **human approval** (`humanApprovalRequiredForFinalPublish: true`).

**Status honesty:** if `autonomousProcessRunning` is false, public status must be `WAITING` / `OFFLINE` / `INITIALIZING` — never simulated activity.

---

## 3. Results (Phases 1–2 seed)

Seeded investigations (ledger IDs) are proportionate to actual SING13 work:

| ID | Result class | Evidence |
|----|--------------|----------|
| INV-HE-2026-10-02-001 | SYNTHESIS — Beyond CRISPR protocol suite | E2 |
| INV-HE-2026-10-02-002 | REDISCOVERY — C4/CBASS novelty claim falsified | E2 |
| INV-HE-2026-10-02-003 | NOVEL_PREDICTION — C11 ART-class gap + lab brief | E3 |
| INV-HE-2026-10-02-004 | OPEN_QUESTION — Phase 2b Lattice prompt infra | E1 |

Metrics exposed by `/api/hero-leo` are computed from these files. Zero active investigations is valid when no daemon is running.

---

## 4. Phase 3 — Player 1 scout button (operational)

Player 1 can press **Scout fully** on `/journey/hero-leo` (or `npm run hero-leo:scout`). Leo ranks the authorized prospect catalog and returns the **top 11**. Player 1 selects one, several, or all, then **Complete selected** (`npm run hero-leo:complete -- --ids=…` or `--all`).

Completions write **computational research notes** (typically E1) with null-first cards into the ledger — not automatic journal publication and not wet-lab claims.

| Piece | Path |
|-------|------|
| Prospect catalog | `data/hero-leo/prospect-catalog.json` |
| Latest scout board | `data/hero-leo/prospects.json` |
| Scout engine | `lib/hero-leo-scout.mjs` |
| API | `POST /api/hero-leo` `{ "action":"scout" }` / `{ "action":"complete", "prospectIds":[...] }` |

## 5. Not yet claimed (Phases 4–7+)

- Continuous background prospecting daemon without Player 1 press  
- Automatic whitepaper / blog / repository generation without human gate  
- Wet-lab execution  
- Independent external replication  
- That completing a prospect equals experimentally established discovery  


---

## Honesty boundary

| Tier | Claim |
|------|--------|
| **Operational** | Cockpit, API, ledger R/W helpers, publication-gate evaluation, Player 1 scout→top-11→select→complete loop, regenerable vitest locks, honest WAITING status when no process runs |
| **Empirical (seed / scout)** | Ledger rows mirror Beyond CRISPR suite receipts and computational completions of selected catalog prospects (typically E1 notes) |
| **Soft Story / expedition** | Scout metaphor; research-homeostasis language for process balance |
| **Not claimed** | Continuous daemon without Player 1 press; wet-lab confirmation; auto journal publish; ENGINE_SHELF pin; Infinite Octaves / Φ_EGS as biological law; clinical advice; novelty inflation (rediscovery must be labeled rediscovery) |

Φ_EGS ≈ 1.618 is design grammar only if mentioned in honesty rails — never a confirmatory research goal for Hero Leo.

**Document ID** and SynthOBS operator line are mandatory. Prefer falsification over confirmation. Prefer “the hypothesis is wrong; data indicate another principle” when earned.

---

## References

1. Beyond CRISPR Biological Discovery Challenge — `docs/SYNTHOBS_BEYOND_CRISPR_BIOLOGICAL_DISCOVERY_EGS_2026-10.md` · `/whitepaper/beyond-crispr-discovery`.  
2. Beyond CRISPR Phase 2b Lattice protocol — `docs/SYNTHOBS_BEYOND_CRISPR_PHASE_2B_LATTICE_2026-10.md`.  
3. C11 ART-class wet-lab brief — `docs/SYNTHOBS_BEYOND_CRISPR_C11_ART_CLASS_WET_LAB_BRIEF_2026-10.md`.  
4. Agentic Convergence Experiment (method peer) — `docs/SYNTHOBS_AGENTIC_CONVERGENCE_EXPERIMENT_EGS_2026-10.md`.  
5. NSPFRNP Snap Peer-Review Audit — `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`.  
6. Homeostasis Expedition surface — `/journey/homeostasis-expedition`.

---

## Document ID

`WP-SYNTHOBS-HERO-LEO-HOMEOSTASIS-SCOUT-2026-10-02`

**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Human editorial veto:** Player 1  

→ ∞^∞
