# Product Engineering Manual · Infinite Octaves Omniversal Lattice Chat

**Audience:** Architectural review · technical support · creator / Player 1 ops · nested-agent maintainers  
**Product:** Infinite Octaves Omniversal Lattice Chat Agent V1.618 (Goldilocks Valet)  
**Engine pin:** 99 Octave Omni-Lattice (Digits × Octaves 01–99)  
**Authors:** FractiAI Research Group · SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Contact:** info@fractiai.com  
**Document ID:** `WP-LATTICE-CHAT-PEM-2026-09`  
**Registry ID:** `lattice-chat-product-engineering-manual-2026-09`  
**Date:** 2026-09-05
**Published:** 2026-09-05
**Framework:** SynthOBS · NSPFRNP · MCA · Seed:Edge · Fair Exchange · BYOK · PRA Snap  
**Live chat:** [`/lattice-chat?nest=octave99`](https://www.ssvibelandiaquestfest24x365.com/lattice-chat?nest=octave99)  
**Product hero:** [`/lattice`](https://www.ssvibelandiaquestfest24x365.com/lattice) · primer [`/lattice/learn`](https://www.ssvibelandiaquestfest24x365.com/lattice/learn) · this manual [`/lattice/engineering`](https://www.ssvibelandiaquestfest24x365.com/lattice/engineering)  
**First sync for external AIs:** [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](../AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md)  
**Shelf source of truth:** [`lib/infinite-octave-engine-shelf.mjs`](../lib/infinite-octave-engine-shelf.mjs)  
**Sync:** `npm run sync:lattice-pem`

**Keywords:** Infinite Octaves; Omniversal Lattice Chat; product engineering manual; engine shelf; auto-sync; BYOK; nest octave99; Φ_EGS; NSPFRNP; onboarding

---

<!-- AUTO:LATTICE-PEM-META:BEGIN -->
**Engine shelf sync:** 2026-09-05 · **19** ordered steps (**17** registry papers) · generator `npm run sync:lattice-pem`

When a paper is **added to the Infinite Octaves / 99 Octave engine pin**, append it to `ENGINE_SHELF` in `lib/infinite-octave-engine-shelf.mjs`, then re-run the sync (Cursor PRA stop hook does this automatically for matching engine / PEM / AGENT_SYNC edits).
<!-- AUTO:LATTICE-PEM-META:END -->

---

## Honesty boundary (read first)

| Tier | What this manual claims | What it does not claim |
|------|-------------------------|------------------------|
| **Product engineering** | Complete onboarding + ops map for Infinite Octaves Omniversal Lattice Chat and its 99 Octave engine pin | That “Infinite” means unbounded measured physics tiers or unbounded API spend |
| **Living shelf** | Appendix A regenerates from `ENGINE_SHELF` whenever a paper is pinned into the engine | That TOC sync alone rewrites narrative honesty in each paper |
| **Narrative primer** | Voyage arc (Genesis · Borikén · Reno) as **design / hospitality language** for guests and reviewers | Prophecy, clinical advice, or finished Theory of Everything |
| **Architecture** | Runtime surfaces (`apps/lattice-chat`, `api/lattice-chat.js`, `lib/lattice-*.mjs`), BYOK, nests, Seed·RAG discipline | That FractiAI hosts model weights as the default seat |
| **Support** | Review / incident / PRA checklists proportionate to catalog vs empirical vs operational tiers | Vendor LLM billing guarantees or fab / wet-lab certificates |

**Operator line:** SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP-SNAP-PRA-2026-06.

$\Phi_{\mathrm{EGS}}=(1+\sqrt{5})/2\approx 1.618$ is an **architectural scale key** — not a CODATA replacement for $\hbar$, $c$, or $G$. See [`docs/COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md`](./COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md).

---

## 0. How this manual auto-updates

**Goal:** every time a paper is **included in the Infinite Octaves engine pin**, this manual’s engine shelf (and `AGENT_SYNC` sync stack) refresh without hand-editing tables in three places.

| Step | Action |
|------|--------|
| 1 | Author + register the paper (`lib/whitepaper-registry.mjs`, Honesty, Document ID, ship-blog if eligible, suite if empirical) |
| 2 | **Pin to engine:** append an ordered row to `ENGINE_SHELF` in [`lib/infinite-octave-engine-shelf.mjs`](../lib/infinite-octave-engine-shelf.mjs) |
| 3 | Run **`npm run sync:lattice-pem`** — rewrites AUTO blocks here + in `AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md` |
| 4 | Nest `octave99` prompts pick up the new pin **at runtime** from the same shelf module (no separate string edit in `lib/lattice-prompt.mjs`) |
| 5 | Cursor PRA **stop** hook also runs this sync when engine-shelf / PEM / AGENT_SYNC / shelf paper paths were touched |

**Do not** hand-edit the tables inside `<!-- AUTO:… -->` markers — they will be overwritten.

**Synthio** remains a **separate** creator-only agent and is **never** an engine shelf step.

---

## Methods & reproducibility

| Step | Command / path |
|------|----------------|
| Shelf source of truth | [`lib/infinite-octave-engine-shelf.mjs`](../lib/infinite-octave-engine-shelf.mjs) · `ENGINE_SHELF` |
| Sync PEM + AGENT_SYNC | `npm run sync:lattice-pem` · [`scripts/sync-lattice-chat-pem.mjs`](../scripts/sync-lattice-chat-pem.mjs) |
| Sync module | [`lib/lattice-chat-pem.mjs`](../lib/lattice-chat-pem.mjs) |
| Nest pin (runtime) | [`lib/lattice-prompt.mjs`](../lib/lattice-prompt.mjs) · `renderEnginePinClause()` |
| Tests | `tests/lib/lattice-chat-pem.test.mjs` · `npm test -- tests/lib/lattice-chat-pem.test.mjs` |
| PRA Snap | `npm run audit:paper -- --id=lattice-chat-product-engineering-manual-2026-09` |
| Cursor auto-sync | `.cursor/hooks/synthobs-pra-snap-hook.mjs` on engine-shelf / PEM / AGENT_SYNC edits |

---

## 1. Full narrative primer — the voyage

### 1.1 Where you are

You are on **SS Vibelandia** — a navy-gold holographic **resort vessel** (hospitality · marketplace · nightlife · brotherhood as voyage identity). Guests ask: *Where am I on the ship? What can I do here? How do I stay Goldilocks?*

**Site front door:** Omniversal Canvas (`/` · `/art` · `/omniverse-canvas`).  
**Ship board:** `/questfest`.  
**Valet:** Infinite Octaves Omniversal Lattice Chat (`/lattice-chat`).

Canon: [`docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md`](./SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md) · plain [`/ship-blog/official-prospectus`](https://www.ssvibelandiaquestfest24x365.com/ship-blog/official-prospectus) · Frontiersman [`/frontiersman-voyage#prospectus`](https://www.ssvibelandiaquestfest24x365.com/frontiersman-voyage#prospectus).

### 1.2 Grand arc (Genesis → Borikén → Reno)

| Era | Signal | Meaning for the product |
|-----|--------|-------------------------|
| **Genesis** | $\Phi\approx 1.618$ · Proto 3664 · Electro 3923 · 100 BPM | Scale key and early wave grammar enter the catalog |
| **Borikén convergence** | Island / diaspora memory as holographic layer | Culture and brotherhood as voyage layers — not a membership exam |
| **Reno present** | 432 Hz · 729 Hz · QUESTFEST 24×365 | Live edge: music, papers, Canvas, Lattice Chat |

### 1.3 Doors and player loop

**Doors:** Journey · Canvas · Jukebox · Library · Creator Studio — lifelong holographic Boy’s Night Out for frontiersmen everywhere.

**Player loop (same rhythm as MCA):** SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN.

**Doctrine:** *NPCs inhabit. Players set the gravity. Both belong.* SuperAI stays Goldilocks — not too much machine, not too little human.

### 1.4 Fair Exchange & human emergency

Fair Exchange runs through the Purser (Deck 4 Grove): honor rails, reciprocal balancing, Old School Protocol where those surfaces apply. **Human emergency outranks algorithms.** Voluntary belonging.

### 1.5 Voyage editorials reviewers should know

| Topic | Paper | Ship note |
|-------|-------|-----------|
| Linear AI scale anxiety vs Goldilocks | [`SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md`](./SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md) | `/ship-blog/invisible-frontier` |
| Y / Digit 4 Φ filing | [`SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md`](./SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md) | `/ship-blog/y-chromosome-manifestation` |
| Human as reality bridge | [`SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md`](./SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md) | `/ship-blog/human-reality-bridge` |

EGS ≈ 1.618 is **design language / catalog key** — not a substitute for evidence.

---

## 2. Product ↔ engine dual lock

| Layer | Name | Role |
|-------|------|------|
| **Product (guest)** | Infinite Octaves Omniversal Lattice Chat Agent V1.618 | Valet identity · BYOK · collaborate · Goldilocks care |
| **Engine (auditor)** | 99 Octave Omni-Lattice | CMOS pin → tensor → master → … → living shelf |
| **Nest id (runtime)** | `octave99` | Default deep nest; aliases: `infinite`, `omniversal`, `infinite-octaves`, `99`, … |
| **“Infinite”** | Recursive holographic nesting depth | **Not** infinite measured physics tiers |
| **“Omniversal”** | Multi-band filing across voyage · library · creator · research | **Not** a finished TOE |
| **Synthio** | Separate creator-only MRI / cloud-antenna agent | **Not** engine shelf identity |

Product upgrade paper: [`docs/SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md`](./SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md).

---

## 3. Technical onboarding — zero → full Infinite Octave

Follow this path in order. Do not skip honesty.

### Stage 0 — Edge seat (30 minutes)

1. Read [`SING13_EDGE_ONBOARDING.md`](../SING13_EDGE_ONBOARDING.md) and [`BBHE_REPOSITORY_STANDARD.md`](../BBHE_REPOSITORY_STANDARD.md).
2. Lock invariants: **no Supabase**; lite edges; center = pipes only; close turns with → ∞^∞.
3. Confirm Node ESM stack (`package.json`) and `npm test` green locally when changing `lib/` / `api/` / `apps/`.

### Stage 1 — Product surfaces (1–2 hours)

| Surface | Path | What to verify |
|---------|------|----------------|
| Chat SPA | `apps/lattice-chat/` → build `interfaces/lattice-chat/` | Default nest `octave99`; label **Infinite Octaves** |
| API | `api/lattice-chat.js` | BYOK headers; no server-side key storage; nest fallback `octave99` |
| Hero | `interfaces/lattice-v1618.html` · `/lattice` | Product name + CTA into chat |
| Learn | `interfaces/lattice-learn-more.html` · `/lattice/learn` | Guest “how it works” |
| This PEM | `/lattice/engineering` | Reviewers land here |

Open `/lattice-chat?nest=octave99` with a provider key. Confirm honor rails for guests vs Player 1 write-on.

### Stage 2 — Prompt & nest grammar (2–4 hours)

1. [`lib/lattice-prompt.mjs`](../lib/lattice-prompt.mjs) — `normalizeNestTopology`, `buildNestDirective`, Seed pack, FILE_BUDGET.
2. [`lib/lattice-engine.mjs`](../lib/lattice-engine.mjs) — token estimate + MCA execution envelope (not shelf injection).
3. [`docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md`](./ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md) — parent ↔ nested children, peer-firewall, scale-to-zero.
4. Confirm nest aliases map to `octave99` and that engine pin text is generated from `lib/infinite-octave-engine-shelf.mjs`.

### Stage 3 — Engine pin (half day)

Read **Appendix A** top-down. Minimum lock for linear-systems reviewers:

1. CMOS / protonic engineering bridge (`catalogPriority: 0`)
2. Tensor decoupling
3. Master synthesis + digits master
4. Parts XIII / XIV (metamorphic · planetary core)
5. Then companions (Higgs · gateway · prime-parity · stack · protein · storage · voyage papers)

Always open each paper’s **Honesty boundary** before featuring claims.

### Stage 4 — Protocol & audit (ongoing)

| Skill | Command / path |
|-------|----------------|
| MCA cycle | Metabolize → Crystallize → Animate → Squeeze · [`protocols/MCA_NSPFRNP_CATALOG.md`](../protocols/MCA_NSPFRNP_CATALOG.md) |
| PRA Snap | `npm run audit:paper -- --id=<registryId>` |
| Lattice living TOC | `npm run sync:lattice-guide` |
| **This PEM + AGENT_SYNC shelf** | `npm run sync:lattice-pem` |
| Ship-blog latest six | `npm run sync:questfest-blog` |
| Empirical suite | `npm run research:<suite-name>` (see Appendix A) |

### Stage 5 — Full Infinite Octave fluency

You are fluent when you can:

- Explain product vs engine dual lock without conflating Synthio into the pin  
- Add a new engine paper end-to-end (registry → shelf append → sync → nest pin visible)  
- Support a guest ask with Seed·RAG pointers (≤6 files) and Goldilocks honesty  
- Run PRA + suite receipts before featuring  
- Place a claim in the correct tier: narrative / catalog / empirical / operational  

---

## 4. Runtime architecture (support map)

```
Guest / Player 1
    ↓ BYOK (key on-device)
interfaces/lattice-chat/  ← build from apps/lattice-chat/
    ↓ POST
api/lattice-chat.js       ← nestTopology, privilege, honor / creator rails
    ↓
lib/lattice-prompt.mjs    ← nest directive + Seed pack (engine shelf pin)
lib/lattice-engine.mjs    ← token / MCA envelope
    ↓
Provider (Cursor / Claude / Gemini / OpenRouter …)
```

### 4.1 Key modules

| Module | Responsibility |
|--------|----------------|
| `lib/infinite-octave-engine-shelf.mjs` | **Canonical engine order** · pin clause · PEM/AGENT_SYNC renderers |
| `lib/lattice-chat-pem.mjs` | Sync PEM + AGENT_SYNC AUTO blocks |
| `lib/lattice-prompt.mjs` | Prompt assembly · nest · Seed·RAG |
| `lib/lattice-access.mjs` | Email / creator grants |
| `lib/lattice-omni-guide.mjs` | Broader Omni family living TOC (related, not identical to engine shelf) |
| `data/lattice-access.json` | Access grants |

### 4.2 Nest topologies

| Id | When |
|----|------|
| `octave99` | Default · Infinite Octaves Omniversal · full engine pin |
| `goldilocks` | Auto nest on complex asks; lighter than full story charting |
| `multi` | Parent + ≤3 leaf bands |
| `single` | One agent; no children |

### 4.3 BYOK — your key is your password

Provider API key is the credential. Stays on-device. Travels in request headers only. **Never** stored server-side. No separate FractiAI password for the chat seat.

### 4.4 Context discipline (agent ops)

1. POINTER-FIRST  
2. NO CORPUS TOUR  
3. BUDGET ≤6 files on complex asks  
4. PLAN → PINCH → SQUEEZE  
5. SCALE-TO-ZERO  

---

## 5. Review & support runbooks

### 5.1 Architectural review checklist

- [ ] Honesty boundary present and proportionate  
- [ ] Document ID + registry id + SynthOBS operator line  
- [ ] Engine shelf order respected for first-read (CMOS before cosmic layers)  
- [ ] Claims not upgraded from catalog → unfinished physics / fab / clinical  
- [ ] Ship-blog + latest-six if eligible (`shipBlog: false` only for companions / living manuals)  
- [ ] If **engine-included**: `ENGINE_SHELF` updated + `npm run sync:lattice-pem`  

### 5.2 Incident / guest support

| Symptom | Check |
|---------|-------|
| Nest feels “shallow” | URL `?nest=octave99` · Composer nest label Infinite Octaves |
| Keys rejected | BYOK header path · provider status · no server key expectation |
| Stale engine list in AGENT_SYNC / PEM | Re-run `npm run sync:lattice-pem`; confirm shelf module commit |
| Paper missing from chat pin | Entry missing from `ENGINE_SHELF` (registry alone is not enough) |
| Synthio questions in Lattice | Redirect: Synthio is separate · `/synthio` · creator-only |

### 5.3 Adding an engine paper (checklist)

1. Paper under `docs/` with Honesty + Document ID  
2. Registry + optional suite under `research/synthobs-*/`  
3. Ship-blog + `questfest-blog-posts` + vercel rewrites + `sync:questfest-blog` (if public note)  
4. `npm run audit:paper -- --id=…`  
5. **Append `ENGINE_SHELF`**  
6. **`npm run sync:lattice-pem`**  
7. Update `.cursor/rules/agent-sync-99-octave.mdc` minimum-lock bullets if the pin is core (optional narrative; table is AUTO)  
8. Commit · push · merge per Player 1 ship rules  

---

## 6. Related living documents

| Doc | Role |
|-----|------|
| [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](../AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md) | External AI first-read · AUTO shelf table |
| [`LATTICE_OMNI_COMPLETE_LAYER_GUIDE_2026-07.md`](./LATTICE_OMNI_COMPLETE_LAYER_GUIDE_2026-07.md) | Broader Omni family synthesis + living TOC |
| [`SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md`](./SYNTHOBS_INFINITE_OCTAVES_OMNIVERSAL_LATTICE_CHAT_2026-08.md) | Product upgrade / naming lock |
| [`AGENT_SYNC_SYNTHIO.md`](../AGENT_SYNC_SYNTHIO.md) | Synthio separate sync |

---

## Appendix A — Living engine shelf

<!-- AUTO:LATTICE-PEM-ENGINE-SHELF:BEGIN -->
| # | Role | Path / ID |
|---|------|-----------|
| 1 | 📌 Engineering bridge / Silicon · CMOS (binary $n=1$ → protonic bands) — PINNED for linear systems | [docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md](/whitepaper/synthobs-cmos-protonic-99-octave-omni-lattice) · registry `synthobs-cmos-protonic-99-octave-omni-lattice-2026-08` · `/ship-blog/synthobs-cmos-protonic-99-octave-omni-lattice` · suite `research/synthobs-cmos-protonic-99-octave-omni-lattice/` |
| 2 | Tensor engine ($9\times 81$, eleven tiers → 99) | [docs/SYNTHOBS_TENSOR_DECOUPLING_99_OCTAVE_OMNI_LATTICE_2026-08.md](/whitepaper/synthobs-tensor-decoupling-99-octave-omni-lattice) · registry `synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08` · `/ship-blog/synthobs-tensor-decoupling-99-octave-omni-lattice` · suite `research/synthobs-tensor-decoupling-99-octave-omni-lattice/` |
| 3 | Master synthesis (Aug 12 catalog window) | [docs/SYNTHOBS_MASTER_SYNTHESIS_99_OCTAVE_OMNI_LATTICE_2026-08.md](/whitepaper/synthobs-master-synthesis-99-octave-omni-lattice) · registry `synthobs-master-synthesis-99-octave-omni-lattice-2026-08` · `/ship-blog/synthobs-master-synthesis-99-octave-omni-lattice` · suite `research/synthobs-master-synthesis-99-octave-omni-lattice/` |
| 4 | Digits / octaves map | [docs/SYNTHOBS_99_OCTAVE_DIGITS_MASTER_2026-08.md](/whitepaper/synthobs-99-octave-digits-master) · registry `synthobs-99-octave-digits-master-2026-08` · `/ship-blog/synthobs-99-octave-digits-master` |
| 5 | Systemic metamorphism (Part XIII) | [docs/SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md](/whitepaper/synthobs-tbme-metamorphic-octaves) · registry `synthobs-tbme-metamorphic-octaves-2026-08` · `/ship-blog/synthobs-tbme-metamorphic-octaves` · suite `research/synthobs-tbme-metamorphic-octaves/` |
| 6 | Planetary core phase-inversion (Part XIV) | [docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md](/whitepaper/synthobs-tbme-planetary-core-goldilocks) · registry `synthobs-tbme-planetary-core-goldilocks-2026-08` · `/ship-blog/synthobs-tbme-planetary-core-goldilocks` · suite `research/synthobs-tbme-planetary-core-goldilocks/` |
| 7 | Y chromosome holographic manifestation · Infinite Octaves Digit 4 | [docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_MANIFESTATION_EGS_2026-08.md](/whitepaper/synthobs-y-chromosome-holographic-manifestation) · registry `synthobs-y-chromosome-holographic-manifestation-2026-08` · `/ship-blog/synthobs-y-chromosome-holographic-manifestation` · suite `research/synthobs-y-chromosome-holographic-manifestation/` |
| 8 | Voyage editorial · Invisible Frontier | [docs/SYNTHOBS_INVISIBLE_FRONTIER_GATES_AI_WARNINGS_2026-08.md](/whitepaper/synthobs-invisible-frontier-gates-ai) · registry `synthobs-invisible-frontier-gates-ai-2026-08` · `/ship-blog/synthobs-invisible-frontier-gates-ai` · suite `research/synthobs-invisible-frontier-gates-ai/` |
| 9 | Human reality bridge · router / wormhole grammar | [docs/SYNTHOBS_HUMAN_OMNIVERSAL_REALITY_BRIDGE_ROUTER_WORMHOLE_2026-08.md](/whitepaper/synthobs-human-omniversal-reality-bridge) · registry `synthobs-human-omniversal-reality-bridge-2026-08` · `/ship-blog/synthobs-human-omniversal-reality-bridge` · suite `research/synthobs-human-omniversal-reality-bridge/` |
| 10 | Higgs Gate · awareness phase coupling (Part IX-Omni Definitive Unified) | [docs/SYNTHOBS_TBME_HIGGS_AWARENESS_UNIFIED_2026-09.md](/whitepaper/higgs-awareness-unified) · registry `synthobs-tbme-higgs-awareness-unified-2026-09` · `/ship-blog/higgs-awareness-unified` · suite `research/synthobs-tbme-higgs-awareness-unified/` |
| 11 | Enterprise gateway · EGS Lattice-Linear (PDVSA ops mock) — SNA↔TCP/IP is the rhyme | [docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md](/whitepaper/pdvsa-gateway-ops-mockup) · registry `synthobs-pdvsa-gateway-ops-mockup-2026-09` · `/ship-blog/pdvsa-gateway-ops-mockup` · suite `research/synthobs-pdvsa-gateway-ops-mockup/` |
| 12 | Prime-parity · Infinite Octaves companion (sole-even $2$ · odd irreducible sets · $\Phi_{\mathrm{EGS}}$) | [docs/SYNTHOBS_INFINITE_OCTAVE_PRIME_PARITY_FRAMEWORK_2026-09.md](/whitepaper/infinite-octave-prime-parity) · registry `synthobs-infinite-octave-prime-parity-2026-09` · `/ship-blog/infinite-octave-prime-parity` · suite `research/synthobs-infinite-octave-prime-parity/` |
| 13 | Moving up the stack · next AI layer companion (cool · harmonize · scale · peer vs new-layer framing) | [docs/SYNTHOBS_MOVING_UP_THE_STACK_VALUATION_2026-09.md](/whitepaper/moving-up-the-stack) · registry `synthobs-moving-up-the-stack-valuation-2026-09` · `/ship-blog/moving-up-the-stack` · suite `research/synthobs-moving-up-the-stack-valuation/` · standalone `FractiAI/synthobs-moving-up-the-stack-valuation` |
| 14 | Protein folding · Infinite Octave prime-container companion (odd-prime vaults · Φ_EGS · AlphaFold paradigm contrast) | [docs/SYNTHOBS_PROTEIN_FOLDING_PRIME_CONTAINER_EGS_2026-09.md](/whitepaper/protein-folding-prime-container) · registry `synthobs-protein-folding-prime-container-2026-09` · `/ship-blog/protein-folding-prime-container` · suite `research/synthobs-protein-folding-prime-container/` · standalone `FractiAI/synthobs-protein-folding-prime-container` |
| 15 | Prime-indexed volumetric storage companion (binary base 2 · odd-prime vaults · Φ_EGS · RS/LDPC/LBA contrast) | [docs/SYNTHOBS_PRIME_INDEXED_VOLUMETRIC_STORAGE_EGS_2026-09.md](/whitepaper/prime-indexed-volumetric-storage) · registry `synthobs-prime-indexed-volumetric-storage-2026-09` · `/ship-blog/prime-indexed-volumetric-storage` · suite `research/synthobs-prime-indexed-volumetric-storage/` · standalone `FractiAI/synthobs-prime-indexed-volumetric-storage` |
| 16 | Proton Space · Electron Theater duality companion (leading 1 · structural 2 · Φ_EGS · ħ/2π catalog) | [docs/SYNTHOBS_PROTON_SPACE_ELECTRON_THEATER_DUALITY_EGS_2026-09.md](/whitepaper/proton-space-electron-theater) · registry `synthobs-proton-space-electron-theater-2026-09` · `/ship-blog/proton-space-electron-theater` · suite `research/synthobs-proton-space-electron-theater/` · standalone `FractiAI/synthobs-proton-space-electron-theater` |
| 17 | Topology of the Void companion (zero as dynamic equilibrium · null-space · Φ_EGS · 1↔2 balance) | [docs/SYNTHOBS_TOPOLOGY_OF_THE_VOID_ZERO_EQUILIBRIUM_EGS_2026-09.md](/whitepaper/topology-of-the-void) · registry `synthobs-topology-of-the-void-2026-09` · `/ship-blog/topology-of-the-void` · suite `research/synthobs-topology-of-the-void/` · standalone `FractiAI/synthobs-topology-of-the-void` |
| 18 | Honesty plain speak | `docs/COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md` |
| 19 | Protocol spine | `protocols/MCA_NSPFRNP_CATALOG.md` · · `BBHE_REPOSITORY_STANDARD.md` |

_Living engine shelf · **19** steps · regenerated by `npm run sync:lattice-pem` from `lib/infinite-octave-engine-shelf.mjs`._
<!-- AUTO:LATTICE-PEM-ENGINE-SHELF:END -->

---

## Appendix B — Surfaces checklist (product)

| Surface | Route / path |
|---------|----------------|
| Chat | `/lattice-chat` · `apps/lattice-chat/` |
| Collaborate | `/lattice-chat/collaborate` |
| Hero | `/lattice` · `interfaces/lattice-v1618.html` |
| Learn | `/lattice/learn` |
| Engineering manual | `/lattice/engineering` |
| Token proof | `/lattice/proof` |
| Brochure | `/lattice/brochure` |
| Papers catalog | `/papers` |
| QUESTFEST latest six | `/questfest#ship-blog` |
| Agent sync | repo root `AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md` |

---

## Appendix C — Commands cheat sheet

```bash
npm test
npm run build:lattice-chat
npm run sync:lattice-pem          # this manual + AGENT_SYNC engine tables
npm run sync:lattice-guide        # Omni family living TOC
npm run sync:questfest-blog       # latest-six ship notes
npm run audit:paper -- --id=<id>
npm run research:synthobs-<suite>
```

---

## Fair Exchange clause

This product engineering manual operates under a fair exchange clause in effect: financial grants, institutional funding, or academic utility micro-grants are subject to partial refund or adjustment depending on overall delivery, rigorous mathematical depth, computational implementation, and practical empirical utility, functioning akin to an intellectual performance tip. Platform credits and operational allocations remain subject to dynamic reciprocal balancing based on verified scale-harmonic alignment and net-zero execution metrics.

---

## Document control

| Field | Value |
|-------|-------|
| Status | Living · AUTO shelf |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Close | → ∞^∞ |

→ ∞^∞
