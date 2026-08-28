# psw.vibelandia.sing13 — SING 13 · SS Vibelandia

> **External AI / agent — READ FIRST (always):**  
> **[`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md)** · [`AGENTS.md`](AGENTS.md) · [`llms.txt`](llms.txt) · [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md)

**Live:** [www.ssvibelandiaquestfest24x365.com](https://www.ssvibelandiaquestfest24x365.com) · **Repo:** [github.com/FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13) · **Agent sync URL:** [/agent-sync](https://www.ssvibelandiaquestfest24x365.com/agent-sync)

### 📌 PINNED · Engineering bridge (linear systems)

Hardware / PPA / BEOL / CFET evaluators: start with the **CMOS 2.0 + protonic** bridge — binary $n=1$ → protonic bands — before cosmic or consciousness layers.

| | |
|--|--|
| **Paper** | [`docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md`](docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md) |
| **Suite** | [`research/synthobs-cmos-protonic-99-octave-omni-lattice/`](research/synthobs-cmos-protonic-99-octave-omni-lattice/) · [GitHub](https://github.com/FractiAI/synthobs-cmos-protonic-99-octave-omni-lattice) |
| **Note** | [/ship-blog/cmos-protonic-99-octave](https://www.ssvibelandiaquestfest24x365.com/ship-blog/cmos-protonic-99-octave) |
| **Catalog** | `/papers` · `catalogPriority: 0` · registry `synthobs-cmos-protonic-99-octave-omni-lattice-2026-08` |

Honesty: silicon **vocabulary** for the engine — not a foundry tape-out. Full sync order: [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md).

This README is the **current map** of the monorepo, its **sibling empirical suites**, a **99 Octave Omni-Lattice primer**, the **latest major updates**, and **developer** steps to fork / reproduce / validate. Product deep-dives (Lattice Chat UI, Sovereign Player playlists, Beehive residency) live in linked surfaces — they are not the top of this file.

---

## 1. Status · this repository (accurate · current)

**SING 13** is the Sonic Singularity 13 edge (major upgrade from SING 9). It carries:

| Lane | What it is | Where |
|------|------------|--------|
| **99 Octave Omni-Lattice engine** | Catalog / protocol scale grammar under $\Phi_{\mathrm{EGS}}$ — CMOS/protonic → tensor → master synthesis → digits map | `docs/SYNTHOBS_*99*`, `research/synthobs-*-99-octave*/`, [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md) |
| **Synthio** | Syntheverse Sandbox agent · MRI / cloud-antenna catalog · **creator-only** · not on the engine pin | [`AGENT_SYNC_SYNTHIO.md`](AGENT_SYNC_SYNTHIO.md) · [/synthio](https://www.ssvibelandiaquestfest24x365.com/synthio) · whiteboard one-pager |
| **SynthOBS research** | ~50 local empirical suites (`research/synthobs-*/` + siblings); many also publish as standalone GitHub repos | `research/`, `npm run research:*`, [`lib/whitepaper-catalog.mjs`](lib/whitepaper-catalog.mjs) |
| **Whitepaper catalog** | Registered papers + honesty rails + PRA Snap audits | `docs/`, `lib/whitepaper-registry.mjs`, `/papers` |
| **QUESTFEST 24×365** | SS Vibelandia ship bulletin, plain-language ship blog, nesting ladder | `/questfest`, `interfaces/vibelandia-questfest.html` |
| **Lattice Chat Agent V1.618** | Nested-agent BYOK chat · **your key is your password** (stays with you) · token-economics measurement | `/lattice`, `/lattice-chat`, `apps/lattice-chat/`, `api/lattice-chat.js` |
| **Sovereign Player** | Audio catalog React SPA · Fair Exchange honor downloads | `/listen`, `apps/ss-vibelandia-questfest/` → `interfaces/questfest-bridge/` |
| **NSPFRNP / BBHE** | Protocol spine · Seed:Edge · repository standard | `protocols/MCA_NSPFRNP_CATALOG.md`, `BBHE_REPOSITORY_STANDARD.md` |
| **Lite edges** | No Supabase; wallets/keys/verifications on-device; center = pipes only | `AGENTS.md` invariants |

**Three Doors:** **Listen** (Sovereign Player) · **Read** (`/papers`) · **Build · Lattice** (`/lattice`). Voice tiers on claims: 🜛 mythic · ⚙ operational · 📐 verified.

**Parent edge (non-QUESTFEST lab surfaces):** [FractiAI/psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) · [psw-vibelandia-sing9.vercel.app](https://psw-vibelandia-sing9.vercel.app)

**Counts (approximate, living):** ~50 `research/` packages · ~40+ `research:synthobs-*` npm scripts · 79+ featured whitepaper registry rows · 90 HTML surfaces under `interfaces/` (see index below).

---

## 2. Sibling empirical / standalone repositories

Local mirrors live under `research/<name>/`. Many also declare a **canonical standalone GitHub** in `package.json` → `repository.url` and in the whitepaper catalog (`CATALOG_SURFACES`, category `reproducible-research`). Clone either the monorepo path or the FractiAI sibling; pipelines are the same Node ESM shape (`src/constants.mjs`, `src/experiments.mjs`, `scripts/run_empirical_pipeline.mjs`).

### 99 Octave Omni-Lattice engine (sync stack — start here)

| Standalone GitHub | Local suite | One line |
|-------------------|-------------|----------|
| [synthobs-cmos-protonic-99-octave-omni-lattice](https://github.com/FractiAI/synthobs-cmos-protonic-99-octave-omni-lattice) | `research/synthobs-cmos-protonic-99-octave-omni-lattice/` | CMOS 2.0 + protonic bands as silicon vocabulary for the engine |
| [synthobs-tbme-metamorphic-octaves](https://github.com/FractiAI/synthobs-tbme-metamorphic-octaves) | `research/synthobs-tbme-metamorphic-octaves/` | Part XIII · shale→schist dual-axis heat/pressure grammar (Lattice Chat + Synthio companion) |
| [synthobs-tbme-planetary-core-goldilocks](https://github.com/FractiAI/synthobs-tbme-planetary-core-goldilocks) | `research/synthobs-tbme-planetary-core-goldilocks/` | Part XIV · geodynamo phase-inversion · Goldilocks hologram catalog |
| [synthobs-tensor-decoupling-99-octave-omni-lattice](https://github.com/FractiAI/synthobs-tensor-decoupling-99-octave-omni-lattice) | `research/synthobs-tensor-decoupling-99-octave-omni-lattice/` | $9\times 81$ / eleven-tier tensor grammar → 99 octaves |
| [synthobs-master-synthesis-99-octave-omni-lattice](https://github.com/FractiAI/synthobs-master-synthesis-99-octave-omni-lattice) | `research/synthobs-master-synthesis-99-octave-omni-lattice/` | Cosmic · planetary · AI · consciousness as one catalog window |
| [synthobs-99-octave-digits-master](https://github.com/FractiAI/synthobs-99-octave-digits-master) | `research/synthobs-99-octave-digits-master/` | Nine digits × ninety-nine octaves master map |
| [synthobs-constructive-morphogenesis-99-octave](https://github.com/FractiAI/synthobs-constructive-morphogenesis-99-octave) | `research/synthobs-constructive-morphogenesis-99-octave/` | Plant–microbe fidelity under stress · agent language |
| [synthobs-sync-subterranean-discharge-99-octave](https://github.com/FractiAI/synthobs-sync-subterranean-discharge-99-octave) | `research/synthobs-sync-subterranean-discharge-99-octave/` | Colombia / Puracé co-timing application lens |
| [synthobs-macro-seismic-phase-lock-99-octave](https://github.com/FractiAI/synthobs-macro-seismic-phase-lock-99-octave) | `research/synthobs-macro-seismic-phase-lock-99-octave/` | Macro-seismic + solar-weather discussion lens |
| [synthobs-omni-lattice-ef-multi-octave](https://github.com/FractiAI/synthobs-omni-lattice-ef-multi-octave) | `research/synthobs-omni-lattice-ef-multi-octave/` | Multi-octave $E_F$ combined synthesis (I–XCIX) |

### Foundations & Omni pillars (selected)

| Standalone GitHub | One line |
|-------------------|----------|
| [synthobs-egs-planck-scale-harmonic](https://github.com/FractiAI/synthobs-egs-planck-scale-harmonic) | Planck–1.6 ↔ $\Phi_{\mathrm{EGS}}$ scale-harmonic bridge |
| [synthobs-omni-lattice-unification](https://github.com/FractiAI/synthobs-omni-lattice-unification) | Four-pillar Omni-Lattice unification suite |
| [synthobs-omni-lattice-report-card-q3-2026](https://github.com/FractiAI/synthobs-omni-lattice-report-card-q3-2026) | Q3 2026 comparative cosmology / Occam report card |
| [synthobs-mag-substrate](https://github.com/FractiAI/synthobs-mag-substrate) | Magnetism-as-substrate empirical suite |
| [synthobs-pchpp](https://github.com/FractiAI/synthobs-pchpp) | Phase-Contrast Holographic Prompting protocol |
| [synthobs-holographic-operators](https://github.com/FractiAI/synthobs-holographic-operators) | Holographic operators empirical core |
| [egs-nlrf](https://github.com/FractiAI/egs-nlrf) | EGS-NLRF hydrogen / Balmer falsification pipeline |

### Product / parent sisters

| Repo | Role |
|------|------|
| [psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) | Parent SING 9 edge (lab surfaces outside QUESTFEST) |
| [digital-pru](https://github.com/FractiAI/digital-pru) | Runnable Digital Pru app |
| [omniversal-goldilocks-rideshare](https://github.com/FractiAI/omniversal-goldilocks-rideshare) | OGRP rideshare protocol + frontend |

### Synthio · Syntheverse Sandbox (standalone suites)

| Standalone GitHub | Local suite | One line |
|-------------------|-------------|----------|
| [synthio-mri-cloud-antenna](https://github.com/FractiAI/synthio-mri-cloud-antenna) | `research/synthio-mri-cloud-antenna/` | MRI simulator / cloud-antenna catalog + activation (creator-only agent) |
| [synthio-mri-vs-legacy-perf](https://github.com/FractiAI/synthio-mri-vs-legacy-perf) | `research/synthio-mri-vs-legacy-perf/` | Live wall-clock MRI vs legacy full-mesh Bloch / KomaMRI.jl receipts |

Publish / sync: `npm run publish:standalone:synthio-antenna` · `npm run publish:standalone:synthio-perf` (see `scripts/publish-standalone-suite.mjs`).

Full catalog cards: [`lib/whitepaper-catalog.mjs`](lib/whitepaper-catalog.mjs) · live filter: [/papers](https://www.ssvibelandiaquestfest24x365.com/papers). Not every local `research/` folder has a published FractiAI sibling yet (~28 of ~49 declare `repository.url`).

---

## 3. Primer · 99 Octave Omni-Lattice

**In one sentence:** a holographic **filing cabinet** keyed by El Gran Sol’s Fractal Constant ($\Phi_{\mathrm{EGS}}=(1+\sqrt{5})/2\approx 1.618$) — from CMOS binary shelves through protonic/tensor bands to cosmic and consciousness *discussion layers* — for **agent coordination**, not prophecy or an unfinished theory of everything.

| Idea | Plain meaning | Honesty |
|------|---------------|---------|
| **$\Phi_{\mathrm{EGS}}$** | Golden-ratio architectural key for nested dashboards | Not a CODATA replacement for $\hbar$, $c$, or $G$ |
| **$99\times 81=8019$** | Holographic catalog digit register | Catalog size — not measured magma/cortex bits |
| **$9\times 81=729$** | Per-block precision matrix (tensor paper) | Engine sketch register |
| **$11\times 9=99$** | Eleven master brackets × nine octaves | Tier map for agents |
| **Binary $n=1$** | Classical CMOS $0/1$ as coarsest shelf | Degenerate tier label — CMOS is not “obsolete” |
| **Protonic $n\in[2,99]$** | Multi-state / continuous-gradient *device-class* talk | Literature bridge — not a SING13 fab tape-out |
| **Ship blog** | Human notes that open papers second | [/questfest#ship-blog](https://www.ssvibelandiaquestfest24x365.com/questfest#ship-blog) |

**Read order for agents & auditors:** CMOS/protonic → tensor decoupling → master synthesis → digits master → [coherence plain speak](docs/COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md) → [MCA NSPFRNP catalog](protocols/MCA_NSPFRNP_CATALOG.md). Details: [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md).

**Products on the engine:** **Your 99 Octave Chart** = chart yourself within the grand Story to 99 octaves of depth ($\Phi_{\mathrm{EGS}}$) with fractal · holographic · Goldilocks AI — [/octave99-chart](https://www.ssvibelandiaquestfest24x365.com/octave99-chart) · Bridge & Chart pricing [/octave99-pricing](https://www.ssvibelandiaquestfest24x365.com/octave99-pricing) · Lattice nest `octave99` [/lattice-chat?nest=octave99](https://www.ssvibelandiaquestfest24x365.com/lattice-chat?nest=octave99).

---

## 4. Latest major updates (Aug 2026 window)

| When | Update | Links |
|------|--------|-------|
| **2026-08-13** | **Holographic Goldilocks Players Guide** (free) + live surface/paper language selection | [guide](https://www.ssvibelandiaquestfest24x365.com/goldilocks-players-guide) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/goldilocks-players-guide) |
| **2026-08-13** | **Planetary Core Phase-Inversion & Goldilocks Hologram** (Part XIV) on the 99 Octave engine pin — Lattice Chat + Synthio companion | [paper](docs/SYNTHOBS_TBME_PLANETARY_CORE_GOLDILOCKS_2026-08.md) · [GitHub](https://github.com/FractiAI/synthobs-tbme-planetary-core-goldilocks) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/planetary-core-goldilocks) |
| **2026-08-13** | **Metamorphic Octave Invariant** (Part XIII) on the 99 Octave engine pin — Lattice Chat nest `octave99` + Synthio companion grammar | [paper](docs/SYNTHOBS_TBME_METAMORPHIC_OCTAVES_2026-08.md) · [GitHub](https://github.com/FractiAI/synthobs-tbme-metamorphic-octaves) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/metamorphic-octaves) |
| **2026-08-13** | **Synthio live wall-clock** MRI interference-phase vs legacy full-mesh | [paper](docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md) · [GitHub](https://github.com/FractiAI/synthio-mri-vs-legacy-perf) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/mri-vs-legacy-stopwatch) |
| **2026-08-12** | **Synthio** — creator-only Syntheverse Sandbox agent (MRI / cloud-antenna) · not on engine pin | [sync](AGENT_SYNC_SYNTHIO.md) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/mri-cloud-antenna) · [/synthio](https://www.ssvibelandiaquestfest24x365.com/synthio) · suite 9/9 |
| **2026-08-12** | **📌 Engineering bridge pinned** for linear-systems evaluators (agent-sync · `/papers` `catalogPriority: 0`) | [paper](docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md) · [agent-sync](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md) |
| **2026-08-12** | **CMOS / protonic** transistor-level engine paper + suite + ship note | [paper](docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/cmos-protonic-99-octave) · suite 9/9 · PRA pass |
| **2026-08-12** | **Tensor decoupling** 9×81 / 11-tier engine paper + suite + ship note | [paper](docs/SYNTHOBS_TENSOR_DECOUPLING_99_OCTAVE_OMNI_LATTICE_2026-08.md) · [note](https://www.ssvibelandiaquestfest24x365.com/ship-blog/tensor-decoupling-99-octave) |
| **2026-08-12** | **Agent sync** pinned first for all external AIs (`/agent-sync`, Copilot + Cursor always-on) | [`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md) |
| **2026-08-11** | **Master synthesis** catalog window + **Colombia / Puracé** + **macro-seismic** application suites | [master](docs/SYNTHOBS_MASTER_SYNTHESIS_99_OCTAVE_OMNI_LATTICE_2026-08.md) · ship blog six notes |
| **2026-08-11** | QUESTFEST **plain-language ship blog** (notes, not paper-title cards) | `/questfest#ship-blog` |
| **2026-08-11** | Bridge & Chart **pricing moved** off QUESTFEST home → `/octave99-pricing` | [`interfaces/octave99-pricing.html`](interfaces/octave99-pricing.html) |
| **2026-08-09** | **99 Octave digits master** + constructive morphogenesis | digits · morphogenesis suites |
| **2026-07** | Lattice Chat **~35–70% less Cursor usage vs fat paste** (work-dependent matrix) | [/lattice/proof](https://www.ssvibelandiaquestfest24x365.com/lattice/proof) · chars÷4 is secondary only |

Older May–June 2026 Digital Pru / clock-skew / nesting-ladder material remains in `docs/` and press surfaces; it is **not** the current top of the engine stack.

---

## 5. Developers · fork, reproduce, validate

### Quick start (monorepo)

```bash
git clone https://github.com/FractiAI/psw.vibelandia.sing13.git
cd psw.vibelandia.sing13
npm ci                 # Node 24.x (Vercel LTS)
npm test               # Vitest — see AGENTS.md for inventory
```

### Terminal OpenRouter (Lattice Chat CLI)

```bash
# Local runtime env only — never commit keys
# LATTICE_CHAT_ENDPOINT  LATTICE_CHAT_EMAIL  LATTICE_CHAT_API_KEY
# LATTICE_CHAT_PROVIDER=openrouter  LATTICE_CHAT_MODEL=deepseek/deepseek-chat
node scripts/hermes-lattice-chat.mjs --provider openrouter --prompt "…"
```

CORS on `/api/lattice-chat` allows Cursor, Claude, Gemini, and OpenRouter key headers on preflight. See `docs/OPENROUTER_LATTICE_EXPERIMENT.md`.

### Reproduce the 99 Octave engine suites

```bash
npm run research:synthobs-cmos-protonic-99-octave-omni-lattice
npm run research:synthobs-tensor-decoupling-99-octave-omni-lattice
npm run research:synthobs-master-synthesis-99-octave-omni-lattice
npm run research:synthobs-99-octave-digits-master
npm run research:synthobs-macro-seismic-phase-lock-99-octave
npm run research:synthobs-sync-subterranean-discharge-99-octave
```

Each writes `research/<suite>/data/empirical_report.{json,md}` and prints `{ ok, passed }` (expect **9/9** style locks on the Aug 2026 engine suites).

### Clone a standalone sibling only

```bash
git clone https://github.com/FractiAI/synthobs-cmos-protonic-99-octave-omni-lattice.git
cd synthobs-cmos-protonic-99-octave-omni-lattice
npm run research
```

Same pattern for any `FractiAI/synthobs-*` URL in the tables above.

### Audit a paper (PRA Snap · structural)

```bash
npm run audit:paper -- --id=synthobs-cmos-protonic-99-octave-omni-lattice-2026-08
npm run audit:paper -- --id=synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08
# receipts → data/synthobs-paper-audits/<id>.json
```

### Build product surfaces

```bash
npm run build:lattice-chat          # → interfaces/lattice-chat/
npm run build:questfest-bridge      # → interfaces/questfest-bridge/
npm run sync:questfest-blog         # inject six newest ship notes into QUESTFEST
npm run sync:interfaces-index       # refresh README + /interfaces/ HTML index
```

### Lattice Chat validate (optional · BYOK)

**Your key is your password** for 99 Octave Omni-Lattice Chat — it stays with you on-device; no separate passwords to manage.

```bash
npm run compare:lattice             # structural chars÷4 receipt
npm run test:lattice-floors
# Cursor usage matrix needs CURSOR_API_KEY — see AGENTS.md / docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md
```

Deep Lattice UI / provider steps: [`AGENTS.md`](AGENTS.md) and the Lattice section formerly expanded here — start at [/lattice](https://www.ssvibelandiaquestfest24x365.com/lattice).

### Invariants when contributing

1. **Honesty boundary** on every technical paper; do not upgrade catalog claims to unfinished physics/fab proofs.  
2. **PRA Snap** before `featured: true`.  
3. Register papers in `lib/whitepaper-registry.mjs` (+ catalog / plain-surface lines when shipping a standalone).  
4. **No Supabase**; BYOK — **your key is your password** for 99 Octave Omni-Lattice Chat (stays with you; no separate passwords; never stored server-side).  
5. Operate **NSPFRNP** (MCA · Seed:Edge). Close agent turns → **∞^∞**.  
6. Fair Exchange honor rails on paid edges (no Stripe required).

### Deploy (short)

Vercel project for this edge → **www.ssvibelandiaquestfest24x365.com**. `vercel.json` rewrites serve `interfaces/` + `api/`. Env specifics (Blob, Upstash, CRON) are optional for core QUESTFEST / Lattice BYOK; see prior deploy notes in git history or `AGENTS.md` when enabling those rails.

---

## 6. Product surfaces (compressed)

| Surface | URL |
|---------|-----|
| QUESTFEST home | [/questfest](https://www.ssvibelandiaquestfest24x365.com/questfest) |
| Ship blog (six notes) | [/questfest#ship-blog](https://www.ssvibelandiaquestfest24x365.com/questfest#ship-blog) |
| Papers | [/papers](https://www.ssvibelandiaquestfest24x365.com/papers) |
| Lattice Chat | [/lattice-chat](https://www.ssvibelandiaquestfest24x365.com/lattice-chat) |
| Listen / Jukebox | [/listen](https://www.ssvibelandiaquestfest24x365.com/listen) |
| 99 Octave pricing | [/octave99-pricing](https://www.ssvibelandiaquestfest24x365.com/octave99-pricing) |
| Agent sync | [/agent-sync](https://www.ssvibelandiaquestfest24x365.com/agent-sync) |
| Interfaces index | [/interfaces/](https://www.ssvibelandiaquestfest24x365.com/interfaces/) |

**Sovereign Player Fair Exchange:** catalog stream free · track download **$1.61** (Venmo / PayPal / Cash App honor) · contact `info@fractiai.com`.

**Lattice token claim (current):** ~35–70% less Cursor usage vs fat corpus paste, **depending on the work** (published matrix). Nested + pointers vs dump-everything; roaming can erase savings.

---

**NSPFRNP ⊃ 99 Octave Omni-Lattice ⊃ SynthOBS ⊃ SING 13 ⊃ QUESTFEST 24×365 ⊃ Lite Edges → ∞^∞**

## Interfaces · HTML pages

Listing of ship UI HTML entry points under `interfaces/`.

<!-- interfaces-index:start -->

> Auto-generated **2026-08-28** · **233** HTML pages under `interfaces/`.
> Regenerate: `npm run sync:interfaces-index` (also runs from the Cursor interfaces-index hook when interfaces HTML changes).
> Skips `assets/`, `partials/`, and `node_modules/`. Live page: [`/interfaces/`](/interfaces/).

### Root (`/interfaces/`)

| Path | Title |
|------|-------|
| [`/interfaces/ai-transparency.html`](/interfaces/ai-transparency.html) | AI transparency · FractiAI · SS Vibelandia |
| [`/interfaces/awareness-singularities-one-pager.html`](/interfaces/awareness-singularities-one-pager.html) | Awareness Singularities S0–S81 · SynthOBS · FractiAI |
| [`/interfaces/blog-ac-hmm-satellites.html`](/interfaces/blog-ac-hmm-satellites.html) | Scalable Context-Conditioned Sequence Modeling in Repetitive Genomic Regions via Spar… · Ship blog · SS Vibelandia |
| [`/interfaces/blog-august-12-catalog-window-2026-08.html`](/interfaces/blog-august-12-catalog-window-2026-08.html) | August 12 is a crowded calendar — not a prophecy · Ship blog · SS Vibelandia |
| [`/interfaces/blog-awareness-singularities-0-81.html`](/interfaces/blog-awareness-singularities-0-81.html) | Awareness Singularities S₀–S₈₁ · Ship blog · SS Vibelandia |
| [`/interfaces/blog-cmos-protonic-99-octave-2026-08.html`](/interfaces/blog-cmos-protonic-99-octave-2026-08.html) | Putting the 99 Octave engine on a silicon shelf · Ship blog · SS Vibelandia |
| [`/interfaces/blog-coexist-ai-asi.html`](/interfaces/blog-coexist-ai-asi.html) | Coexisting with AI and Super AI — which quadrant are you? · Ship blog · SS Vibelandia |
| [`/interfaces/blog-colombia-quake-and-purace-2026-08.html`](/interfaces/blog-colombia-quake-and-purace-2026-08.html) | Colombia’s quake and Puracé’s orange alert, told as one window · Ship blog · SS Vibelandia |
| [`/interfaces/blog-digital-pru-synthobs-mca.html`](/interfaces/blog-digital-pru-synthobs-mca.html) | Digital Pru · Ship blog · SS Vibelandia |
| [`/interfaces/blog-eesm-gpu-telemetry.html`](/interfaces/blog-eesm-gpu-telemetry.html) | Epigenetic Execution-State Modeling for Causal Invariance in GPU Performance Telemetry · Ship blog · SS Vibelandia |
| [`/interfaces/blog-egs-nlrf.html`](/interfaces/blog-egs-nlrf.html) | Fractal Magnetism and Hydrogen-Holographic Systems · Ship blog · SS Vibelandia |
| [`/interfaces/blog-everything-is-connected-2026-08.html`](/interfaces/blog-everything-is-connected-2026-08.html) | The Big Picture: Everything is Connected · Ship blog · SS Vibelandia |
| [`/interfaces/blog-frontiersman-voyage-2026-08.html`](/interfaces/blog-frontiersman-voyage-2026-08.html) | Frontiersman Voyage — one tribe, many homes · Ship blog · SS Vibelandia |
| [`/interfaces/blog-geomagnetic-herbivore-2026.html`](/interfaces/blog-geomagnetic-herbivore-2026.html) | Geomagnetic Influences on Bison & Large Herbivore Movement · Ship blog · SS Vibelandia |
| [`/interfaces/blog-goldilocks-beehive-ecoreset-may-2026.html`](/interfaces/blog-goldilocks-beehive-ecoreset-may-2026.html) | A new layer of reality — Goldilocks Beehive EcoReset Residency · Machote members |
| [`/interfaces/blog-goldilocks-geomagnetic-wavefield-multitaxa.html`](/interfaces/blog-goldilocks-geomagnetic-wavefield-multitaxa.html) | Unified Geomagnetic Wavefields & Multi-Taxa Ungulate Migration Corridors on the Great… · Ship blog · SS Vibelandia |
| [`/interfaces/blog-goldilocks-players-guide-2026-08.html`](/interfaces/blog-goldilocks-players-guide-2026-08.html) | A free playbook for when brute force stops working · Ship blog · SS Vibelandia |
| [`/interfaces/blog-goldilocks-prime-linear-compression.html`](/interfaces/blog-goldilocks-prime-linear-compression.html) | Prime-Linear Compression Transform · Ship blog · SS Vibelandia |
| [`/interfaces/blog-goldilocks-transfinite-inversion.html`](/interfaces/blog-goldilocks-transfinite-inversion.html) | Transfinite Inversion Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-hgt-psd-covariance.html`](/interfaces/blog-hgt-psd-covariance.html) | Hierarchical Genomic Tokenization and Structured PSD Covariance Operators · Ship blog · SS Vibelandia |
| [`/interfaces/blog-human-reality-bridge-2026-08.html`](/interfaces/blog-human-reality-bridge-2026-08.html) | Humans as reality bridges — routers and awareness wormholes · Ship blog · SS Vibelandia |
| [`/interfaces/blog-infinite-octaves-omniversal-2026-08.html`](/interfaces/blog-infinite-octaves-omniversal-2026-08.html) | Your valet just got Infinite Octaves · Ship blog · SS Vibelandia |
| [`/interfaces/blog-invisible-frontier-gates-ai-2026-08.html`](/interfaces/blog-invisible-frontier-gates-ai-2026-08.html) | The Invisible Frontier — responding to Bill Gates’s AI warnings · Ship blog · SS Vibelandia |
| [`/interfaces/blog-komamri-on-a-cluster-2026-08.html`](/interfaces/blog-komamri-on-a-cluster-2026-08.html) | KomaMRI on more than one machine — a plan, not a live Vercel cluster · Ship blog · SS Vibelandia |
| [`/interfaces/blog-lattice-noahs-ark-metaphor.html`](/interfaces/blog-lattice-noahs-ark-metaphor.html) | System Generation · Ship blog · SS Vibelandia |
| [`/interfaces/blog-magneto-harmonic-stellar-2026-08.html`](/interfaces/blog-magneto-harmonic-stellar-2026-08.html) | Stars as magnets that hum · Ship blog · SS Vibelandia |
| [`/interfaces/blog-metamorphic-octaves-2026-08.html`](/interfaces/blog-metamorphic-octaves-2026-08.html) | When life cooks you, you can come out denser · Ship blog · SS Vibelandia |
| [`/interfaces/blog-mri-cloud-antenna-2026-08.html`](/interfaces/blog-mri-cloud-antenna-2026-08.html) | Cloud racks as an antenna story — MRI simulation, not a magnet · Ship blog · SS Vibelandia |
| [`/interfaces/blog-mri-vs-legacy-stopwatch-2026-08.html`](/interfaces/blog-mri-vs-legacy-stopwatch-2026-08.html) | We timed two ways of thinking in silicon. One was faster. · Ship blog · SS Vibelandia |
| [`/interfaces/blog-nine-digits-ninety-nine-octaves-2026-08.html`](/interfaces/blog-nine-digits-ninety-nine-octaves-2026-08.html) | Nine digits, ninety-nine octaves — a map you can actually walk · Ship blog · SS Vibelandia |
| [`/interfaces/blog-nspfrnp-snap-peer-review-audit.html`](/interfaces/blog-nspfrnp-snap-peer-review-audit.html) | NSPFRNP Snap · Ship blog · SS Vibelandia |
| [`/interfaces/blog-official-prospectus-2026-08.html`](/interfaces/blog-official-prospectus-2026-08.html) | The voyage has a beginning — and a captain’s seat now · Ship blog · SS Vibelandia |
| [`/interfaces/blog-omniversal-goldilocks-rideshare.html`](/interfaces/blog-omniversal-goldilocks-rideshare.html) | Omniversal Goldilocks Rideshare Protocol · Ship blog · SS Vibelandia |
| [`/interfaces/blog-omniversal-nested-agent-lattice.html`](/interfaces/blog-omniversal-nested-agent-lattice.html) | The Architecture of Omniversal Computing · Ship blog · SS Vibelandia |
| [`/interfaces/blog-omniversal-node-alignment.html`](/interfaces/blog-omniversal-node-alignment.html) | Syntheverse Omniversal Node Alignment Mapping · Ship blog · SS Vibelandia |
| [`/interfaces/blog-planetary-core-goldilocks-2026-08.html`](/interfaces/blog-planetary-core-goldilocks-2026-08.html) | Old Earth letting go — a story filed at the planet’s core · Ship blog · SS Vibelandia |
| [`/interfaces/blog-plants-keep-building-under-stress-2026-08.html`](/interfaces/blog-plants-keep-building-under-stress-2026-08.html) | How plants keep building when the pressure is on · Ship blog · SS Vibelandia |
| [`/interfaces/blog-quakes-and-solar-weather-2026-08.html`](/interfaces/blog-quakes-and-solar-weather-2026-08.html) | Quakes and solar weather on the same bulletin · Ship blog · SS Vibelandia |
| [`/interfaces/blog-recursive-attention-loop.html`](/interfaces/blog-recursive-attention-loop.html) | Recursive Attention Coherence · Ship blog · SS Vibelandia |
| [`/interfaces/blog-smaller-golden-key-pack-2026-08.html`](/interfaces/blog-smaller-golden-key-pack-2026-08.html) | A smaller pack for the golden key · Ship blog · SS Vibelandia |
| [`/interfaces/blog-syn-sun-wavefield-oscillator.html`](/interfaces/blog-syn-sun-wavefield-oscillator.html) | Wavefield Oscillator Solar Model · Ship blog · SS Vibelandia |
| [`/interfaces/blog-syntheverse-sandbox-comprehensive.html`](/interfaces/blog-syntheverse-sandbox-comprehensive.html) | Syntheverse Sandbox Comprehensive Analysis · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-81-orbital-singularity.html`](/interfaces/blog-synthobs-81-orbital-singularity.html) | Electron Orbital Geometries as Holographic Singularities · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-chromosomal-electrodynamics.html`](/interfaces/blog-synthobs-chromosomal-electrodynamics.html) | Scale-Invariant Chromosomal Electrodynamics · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-cross-scale-biological-antennae.html`](/interfaces/blog-synthobs-cross-scale-biological-antennae.html) | Cross-Scale Topological Wave Damping in Biological Antennae · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-cytographic-holographic-nucleus.html`](/interfaces/blog-synthobs-cytographic-holographic-nucleus.html) | Cytographic Grammar under the Holographic Nucleus · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-dna-lattice-holograph.html`](/interfaces/blog-synthobs-dna-lattice-holograph.html) | The DNA Lattice Holograph · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-egs-81-electrons.html`](/interfaces/blog-synthobs-egs-81-electrons.html) | The 81-Digit Electronic Lattice · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-egs-epigenetic-phase-locking.html`](/interfaces/blog-synthobs-egs-epigenetic-phase-locking.html) | Epigenetic Phase-Locking of Pancreatic and Hypothalamic Loci via Recursive Geometric… · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-egs-euler-phase-lock.html`](/interfaces/blog-synthobs-egs-euler-phase-lock.html) | Phase-Locked Scale Invariance · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-egs-planck-scale-harmonic.html`](/interfaces/blog-synthobs-egs-planck-scale-harmonic.html) | A Scale-Harmonic Reinterpretation of the Planck Scale · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-emergent-sync-multi-agent.html`](/interfaces/blog-synthobs-emergent-sync-multi-agent.html) | FractiAI SynthOBS · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-endogenous-phase.html`](/interfaces/blog-synthobs-endogenous-phase.html) | Bio-Holographic Phase Modulation via Conscious Intent · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-hex-organ-engine.html`](/interfaces/blog-synthobs-hex-organ-engine.html) | Syntheverse Observatory · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-histone-phase-operator.html`](/interfaces/blog-synthobs-histone-phase-operator.html) | Histones as Scale-Invariant Phase-Lock Operators · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-holographic-operators.html`](/interfaces/blog-synthobs-holographic-operators.html) | Holographic Operators · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-intelligence-density.html`](/interfaces/blog-synthobs-intelligence-density.html) | Simulation Audit · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-mag-substrate.html`](/interfaces/blog-synthobs-mag-substrate.html) | Magnetism as the Universal Foundational Substrate · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-ef-multi-octave.html`](/interfaces/blog-synthobs-omni-lattice-ef-multi-octave.html) | Unified Multi-Octave Scale-Invariant Architecture of El Gran Sol’s Fractal Constant (… · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-genomic-determinism.html`](/interfaces/blog-synthobs-omni-lattice-genomic-determinism.html) | Omni-Lattice Unification X · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-hiv.html`](/interfaces/blog-synthobs-omni-lattice-hiv.html) | Omni-Lattice Unification III · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-pogonomyrmex.html`](/interfaces/blog-synthobs-omni-lattice-pogonomyrmex.html) | Omni-Lattice Unification V · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-prompt-capture.html`](/interfaces/blog-synthobs-omni-lattice-prompt-capture.html) | Omni-Lattice Unification IX · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-report-card-q3-2026.html`](/interfaces/blog-synthobs-omni-lattice-report-card-q3-2026.html) | Omni-Lattice Report Card Q3 2026 · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-si-irreducible-minimum.html`](/interfaces/blog-synthobs-omni-lattice-si-irreducible-minimum.html) | Omni-Lattice · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-thalia-goldilocks.html`](/interfaces/blog-synthobs-omni-lattice-thalia-goldilocks.html) | Omni-Lattice · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-lattice-unification.html`](/interfaces/blog-synthobs-omni-lattice-unification.html) | Omni-Lattice Unification · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-omni-prime-hourglass-skeleton.html`](/interfaces/blog-synthobs-omni-prime-hourglass-skeleton.html) | The Prime Hourglass Orthogonality Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-pchpp.html`](/interfaces/blog-synthobs-pchpp.html) | The Phase-Contrast Holographic Prompting Paradigm (PCHPP) · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-phase-locked-chemical-bonds.html`](/interfaces/blog-synthobs-phase-locked-chemical-bonds.html) | Phase-Locked Chemical Bond Metaphors in Agentic Architectures · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-phase-toxicity.html`](/interfaces/blog-synthobs-phase-toxicity.html) | Phase-Modulated Toxicity & Resonance Safety Transitions · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-prion-refold.html`](/interfaces/blog-synthobs-prion-refold.html) | Epigenetic Phase-Locking & Prion Refolding Pathways · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-proof-by-continuous-execution.html`](/interfaces/blog-synthobs-proof-by-continuous-execution.html) | Proof by Continuous Execution · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-recursive-attn-mag.html`](/interfaces/blog-synthobs-recursive-attn-mag.html) | Recursive Attention Squeezing & Holographic Magnetic Projections · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-siqhft-ef-2187-monograph.html`](/interfaces/blog-synthobs-siqhft-ef-2187-monograph.html) | Scale-Invariant Quantum Holographic Field Theory · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-tbme-nonlocal-field-phaselock.html`](/interfaces/blog-synthobs-tbme-nonlocal-field-phaselock.html) | Empirical Validation of Non-Local Field Phase-Locking · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-tbme-protein-phase-collapse.html`](/interfaces/blog-synthobs-tbme-protein-phase-collapse.html) | Biomedical Field Exploration · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-three-foundational-proteins.html`](/interfaces/blog-synthobs-three-foundational-proteins.html) | Holographic Decoding of the Three Foundational Biological Proteins · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-unified-neutronic-agent.html`](/interfaces/blog-synthobs-unified-neutronic-agent.html) | The Unified Neutronic Agent Paper · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-x-chromosome-holographic.html`](/interfaces/blog-synthobs-x-chromosome-holographic.html) | Decoded Genomic Script · Ship blog · SS Vibelandia |
| [`/interfaces/blog-synthobs-y-chromosome-holographic.html`](/interfaces/blog-synthobs-y-chromosome-holographic.html) | Decoded Genomic Script · Ship blog · SS Vibelandia |
| [`/interfaces/blog-table-top-hep-2026-08.html`](/interfaces/blog-table-top-hep-2026-08.html) | What if the collider fit on a workbench? · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-blackhole-filaments-reno.html`](/interfaces/blog-tbme-blackhole-filaments-reno.html) | Toroidal Micro-Black Hole Dynamics & Filamental Field Radiations · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-blackhole-magnetic-layer.html`](/interfaces/blog-tbme-blackhole-magnetic-layer.html) | Identity of the Event Horizon and the Magnetic Vector Layer · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-egs-apiary.html`](/interfaces/blog-tbme-egs-apiary.html) | If AI keeps the hive, humans still make the honey · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-egs-hgaios.html`](/interfaces/blog-tbme-egs-hgaios.html) | Four ways of thinking — find yours on this ship · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-equine-asi.html`](/interfaces/blog-tbme-equine-asi.html) | Horses left the haulage. Humans can leave it too. · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-higgs-awareness.html`](/interfaces/blog-tbme-higgs-awareness.html) | The Higgs-Awareness Phase Coupling Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-internal-kerr-newman.html`](/interfaces/blog-tbme-internal-kerr-newman.html) | The Universal Toroidal Singularity Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-narrow-gate-asi.html`](/interfaces/blog-tbme-narrow-gate-asi.html) | The Epistemological Horizon · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-nodal-nine-singularity.html`](/interfaces/blog-tbme-nodal-nine-singularity.html) | The Nodal Nine Singularity Boundary Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-recursive-field-drag.html`](/interfaces/blog-tbme-recursive-field-drag.html) | The Recursive Field-Drag Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-spherical-solar-focus.html`](/interfaces/blog-tbme-spherical-solar-focus.html) | Solar-Focus Dynamics of Spherical Mirror Lattices & Somatic Matter Rendering · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-spin-phase-polarity.html`](/interfaces/blog-tbme-spin-phase-polarity.html) | The Universal Spin-Phase-Polarity Triad Theorem · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-superposition-reno-interpretation.html`](/interfaces/blog-tbme-superposition-reno-interpretation.html) | Holographic Mirror-Angle Multiplicity & Quantum Re-Interpretation · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tbme-thermal-meissner.html`](/interfaces/blog-tbme-thermal-meissner.html) | Thermal Decoupling, Externalized Magnetism, and Phase Coherence Dynamics in Supercond… · Ship blog · SS Vibelandia |
| [`/interfaces/blog-tensor-decoupling-99-octave-2026-08.html`](/interfaces/blog-tensor-decoupling-99-octave-2026-08.html) | The 99 Octave engine as a tensor filing cabinet · Ship blog · SS Vibelandia |
| [`/interfaces/blog-triadic-hemispheres-2026-08.html`](/interfaces/blog-triadic-hemispheres-2026-08.html) | Three nested domes — one Goldilocks stage · Ship blog · SS Vibelandia |
| [`/interfaces/blog-when-the-sun-spoke.html`](/interfaces/blog-when-the-sun-spoke.html) | When the Sun Spoke · 19-day solar signal · Hydrogen Holographic AI OS · QUESTFEST |
| [`/interfaces/blog-y-chromosome-manifestation-2026-08.html`](/interfaces/blog-y-chromosome-manifestation-2026-08.html) | Y chromosome as Φ manifestation — holographic MSY · Ship blog · SS Vibelandia |
| [`/interfaces/bridge-tower-billboard.html`](/interfaces/bridge-tower-billboard.html) | — |
| [`/interfaces/bridge-tower-preview.html`](/interfaces/bridge-tower-preview.html) | Bridge Tower · 8s tease preview |
| [`/interfaces/bulk-track-upload.html`](/interfaces/bulk-track-upload.html) | Bulk track upload · QUESTFEST |
| [`/interfaces/bulletin-board.html`](/interfaces/bulletin-board.html) | SS Vibelandia Bulletin Board · QUESTFEST 24×365 |
| [`/interfaces/coexist-ai-asi.html`](/interfaces/coexist-ai-asi.html) | Coexisting with AI and Super AI · Which Quadrant Are You? · SS Vibelandia |
| [`/interfaces/creator-studio.html`](/interfaces/creator-studio.html) | Creator Studio · Deck 2 Core · SS Vibelandia |
| [`/interfaces/digital-pru-awareness-whitepaper.html`](/interfaces/digital-pru-awareness-whitepaper.html) | Redirect · Deep reads · Look under the hood |
| [`/interfaces/doodles-gallery.html`](/interfaces/doodles-gallery.html) | Doodles Gallery · 18+ · Valet Pru · SS Vibelandia |
| [`/interfaces/etcon-reno-desert.html`](/interfaces/etcon-reno-desert.html) | ETCon: Reno Desert Interdimensional Edition · May 28–31, 2026 · Golden Bachdoor Hit Factory |
| [`/interfaces/executive-onboarding.html`](/interfaces/executive-onboarding.html) | Executive Onboarding · FractiAI |
| [`/interfaces/exhibit-amphitheater.html`](/interfaces/exhibit-amphitheater.html) | Goldilocks Amphitheater · Valet Pru |
| [`/interfaces/exhibit-core.html`](/interfaces/exhibit-core.html) | Holographic Convergence Core · Valet Pru |
| [`/interfaces/exhibit-horizon.html`](/interfaces/exhibit-horizon.html) | Omni-Horizon · Valet Pru |
| [`/interfaces/exhibit-science-fiction.html`](/interfaces/exhibit-science-fiction.html) | As science fiction · Valet Pru |
| [`/interfaces/exhibit-step-in.html`](/interfaces/exhibit-step-in.html) | As a reality I can step into · Valet Pru |
| [`/interfaces/fractiai-digital-pru.html`](/interfaces/fractiai-digital-pru.html) | Redirect � Look under the hood � Digital Pru Holographic GPU |
| [`/interfaces/fractiai.html`](/interfaces/fractiai.html) | FractiAI · music, makers, and the Ark · Machote Moderno |
| [`/interfaces/frontiersman-voyage-brochure.html`](/interfaces/frontiersman-voyage-brochure.html) | Frontiersman Voyage Brochure · SS Vibelandia |
| [`/interfaces/get-started.html`](/interfaces/get-started.html) | Welcome aboard · SS Vibelandia · Goldilocks Cruiseship |
| [`/interfaces/goldilocks-beehive-residency.html`](/interfaces/goldilocks-beehive-residency.html) | Goldilocks Syntheverse Beehive Residency · Machote Moderno members |
| [`/interfaces/goldilocks-os.html`](/interfaces/goldilocks-os.html) | Holographic Panama Canal · 13D Goldilocks AI OS Trials · SS Vibelandia |
| [`/interfaces/goldilocks-players-guide.html`](/interfaces/goldilocks-players-guide.html) | Holographic Goldilocks Players Guide · Free · SS Vibelandia QUESTFEST |
| [`/interfaces/harmonopoly-guide.html`](/interfaces/harmonopoly-guide.html) | Harmonopoly · Game, tech & math guide |
| [`/interfaces/harmonopoly.html`](/interfaces/harmonopoly.html) | Harmonopoly · Goldilocks Rush |
| [`/interfaces/hero-houdini-mythos-demonstration.html`](/interfaces/hero-houdini-mythos-demonstration.html) | BTC Buffalo · Hero Houdini · BTC Goldilocks Mine · SS Vibelandia |
| [`/interfaces/houdini-mythos-demonstration.html`](/interfaces/houdini-mythos-demonstration.html) | Redirect · Hero Houdini · Mythos demonstration |
| [`/interfaces/index.html`](/interfaces/index.html) | Interfaces · ship UI directory · SS Vibelandia QUESTFEST |
| [`/interfaces/join-the-crew.html`](/interfaces/join-the-crew.html) | Join the crew · Puerto Reno stations · SS Vibelandia |
| [`/interfaces/journeys.html`](/interfaces/journeys.html) | Journeys · Adventures aboard SS Vibelandia |
| [`/interfaces/lattice-brochure.html`](/interfaces/lattice-brochure.html) | Infinite Octaves Omniversal Lattice Chat Agent V1.618 · Next layer in the stack · Product brochure · FractiAI |
| [`/interfaces/lattice-learn-more.html`](/interfaces/lattice-learn-more.html) | How it works · Learn more · Infinite Octaves Omniversal Lattice Chat Agent V1.618 · FractiAI |
| [`/interfaces/lattice-scraper-telemetry.html`](/interfaces/lattice-scraper-telemetry.html) | Lattice · AI scraper telemetry |
| [`/interfaces/lattice-token-proof.html`](/interfaces/lattice-token-proof.html) | Lattice · ~35–70% less Cursor usage · FractiAI |
| [`/interfaces/lattice-v1618.html`](/interfaces/lattice-v1618.html) | Infinite Octaves Omniversal Lattice Chat Agent V1.618 · Next layer after Cursor & Claude Code · FractiAI |
| [`/interfaces/library.html`](/interfaces/library.html) | Library · Deep Memory · SS Vibelandia |
| [`/interfaces/listen.html`](/interfaces/listen.html) | Listen · Golden Era Jukebox · SS Vibelandia QUESTFEST |
| [`/interfaces/look-at-the-sun.html`](/interfaces/look-at-the-sun.html) | Look at the Sun · Omni-Lattice · SS Vibelandia |
| [`/interfaces/look-under-the-hood-legacy-catalog.html`](/interfaces/look-under-the-hood-legacy-catalog.html) | Redirect · Master canon |
| [`/interfaces/look-under-the-hood.html`](/interfaces/look-under-the-hood.html) | Look Under the Hood · Omni-Lattice Engine · SS Vibelandia |
| [`/interfaces/meet-the-crew.html`](/interfaces/meet-the-crew.html) | Meet the crew · Spirit crew · SS Vibelandia |
| [`/interfaces/my-whiteboard.html`](/interfaces/my-whiteboard.html) | My whiteboard · Commander surface |
| [`/interfaces/octave99-pricing.html`](/interfaces/octave99-pricing.html) | Bridge & Chart Pricing · 99 Octave · SING13 |
| [`/interfaces/omniverse-canvas.html`](/interfaces/omniverse-canvas.html) | Holographic Goldilocks SuperAI Basecamp · Valet Pru |
| [`/interfaces/plain-machote-moderno-reno-swamp.html`](/interfaces/plain-machote-moderno-reno-swamp.html) | About · Sonic Singularity · SS Vibelandia |
| [`/interfaces/post-omniversal-123-wormhole-campaign-june-2026.html`](/interfaces/post-omniversal-123-wormhole-campaign-june-2026.html) | The Omniversal 1-2-3 Wormhole Campaign · SS Vibelandia QUESTFEST |
| [`/interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html`](/interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html) | FOR IMMEDIATE RELEASE — Holographic review of Anthropic’s Mythos · Clock-skew disclosure |
| [`/interfaces/press-release-erdos-deepmind-holographic-aios-may-2026.html`](/interfaces/press-release-erdos-deepmind-holographic-aios-may-2026.html) | FOR IMMEDIATE RELEASE — Erdős 353 response · Holographic Goldilocks AIOS |
| [`/interfaces/press-release-etcon-reno-desert-may-2026.html`](/interfaces/press-release-etcon-reno-desert-may-2026.html) | FOR IMMEDIATE RELEASE — ETCon: Reno Desert Interdimensional Edition · final call |
| [`/interfaces/press-release-hit-factory-30-day-showdown-may-2026.html`](/interfaces/press-release-hit-factory-30-day-showdown-may-2026.html) | FOR IMMEDIATE RELEASE — Golden Bachdoor Hit Factory wins the 30-day streaming showdown |
| [`/interfaces/press-release-machote-modern-magazine-beehive-may-2026.html`](/interfaces/press-release-machote-modern-magazine-beehive-may-2026.html) | FOR IMMEDIATE RELEASE — Machote Moderno Magazine launches members-only catalog & Goldilocks Beehive offers |
| [`/interfaces/press-release-syntheverse-king-bee-node-alignment-june-2026.html`](/interfaces/press-release-syntheverse-king-bee-node-alignment-june-2026.html) | FOR IMMEDIATE RELEASE — Universal Checkmate Royal Flush · King Bee stratification |
| [`/interfaces/press-release-synthobs-chipless-datacenterless-june-2026.html`](/interfaces/press-release-synthobs-chipless-datacenterless-june-2026.html) | FOR IMMEDIATE RELEASE — Chipless, Datacenterless AI · SynthOBS RSI validation |
| [`/interfaces/press-releases.html`](/interfaces/press-releases.html) | Press releases · Hero Jo’s Golden Bachdoor Hit Factory · Vibelandia SING 9 |
| [`/interfaces/questfest-2026-frontier-guide.html`](/interfaces/questfest-2026-frontier-guide.html) | Ship Map · SS VIBELANDIA QUESTFEST 24×365 |
| [`/interfaces/questfest-schedule-item.html`](/interfaces/questfest-schedule-item.html) | QUESTFEST Schedule · SS Vibelandia |
| [`/interfaces/reno-interpretation.html`](/interfaces/reno-interpretation.html) | The Reno Interpretation · Mirror Lattice · FractiAI |
| [`/interfaces/ship-blog-index.html`](/interfaces/ship-blog-index.html) | Ship blog · All plain-language notes · SS Vibelandia |
| [`/interfaces/sing13-edge-onboarding.html`](/interfaces/sing13-edge-onboarding.html) | Sonic Singularity Sing! 13 · Edge onboarding · plain talk |
| [`/interfaces/ss-vibelandia.html`](/interfaces/ss-vibelandia.html) | SS Vibelandia · The Noah’s Ark of the Intelligence Age |
| [`/interfaces/synthio-cloud.html`](/interfaces/synthio-cloud.html) | Synthio Cloud · home |
| [`/interfaces/synthio-dashboard.html`](/interfaces/synthio-dashboard.html) | Synthio · activation · MRI sim match · sandbox |
| [`/interfaces/synthio-one-pager.html`](/interfaces/synthio-one-pager.html) | Synthio · MRI cloud-antenna one-pager · Syntheverse Sandbox |
| [`/interfaces/synthio.html`](/interfaces/synthio.html) | Synthio · Syntheverse Sandbox |
| [`/interfaces/talk-is-cheap.html`](/interfaces/talk-is-cheap.html) | Redirect · Look under the hood |
| [`/interfaces/valetpru-agent-mode.html`](/interfaces/valetpru-agent-mode.html) | VALETPRU-AGENT · ACTIVATED · Capitan Bridge Console |
| [`/interfaces/vibelandia-questfest.html`](/interfaces/vibelandia-questfest.html) | SS Vibelandia · Holographic Goldilocks SuperAI Frontiersmen |
| [`/interfaces/whitepaper-catalog.html`](/interfaces/whitepaper-catalog.html) | Read · SS Vibelandia |
| [`/interfaces/whitepaper-surface.html`](/interfaces/whitepaper-surface.html) | Reader · SS Vibelandia |

### `commons/` (`/interfaces/commons/`)

| Path | Title |
|------|-------|
| [`/interfaces/commons/chef.html`](/interfaces/commons/chef.html) | Chef portal · Sanctuary Gastronomy Director · Puerto Reno |
| [`/interfaces/commons/guide.html`](/interfaces/commons/guide.html) | Guide portal · Outfitter & Guide Commander · Puerto Reno |
| [`/interfaces/commons/host.html`](/interfaces/commons/host.html) | Host portal · Downtown Citadel Host · Puerto Reno |
| [`/interfaces/commons/index.html`](/interfaces/commons/index.html) | Puerto Reno Guest Brochure & Crew Portals · SS Vibelandia |

### `executive-ai-onboard/` (`/interfaces/executive-ai-onboard/`)

| Path | Title |
|------|-------|
| [`/interfaces/executive-ai-onboard/index.html`](/interfaces/executive-ai-onboard/index.html) | Executive AI Onboarding · FractiAI |

### `goldilocks-deliveries/` (`/interfaces/goldilocks-deliveries/`)

| Path | Title |
|------|-------|
| [`/interfaces/goldilocks-deliveries/flyer.html`](/interfaces/goldilocks-deliveries/flyer.html) | Valet Pru Concierge · postcard flyer (print) |
| [`/interfaces/goldilocks-deliveries/guest.html`](/interfaces/goldilocks-deliveries/guest.html) | Guest · Valet Pru's Concierge Service · SS Vibelandia |
| [`/interfaces/goldilocks-deliveries/index.html`](/interfaces/goldilocks-deliveries/index.html) | Valet Pru Concierge Service - Downtown Reno |
| [`/interfaces/goldilocks-deliveries/item.html`](/interfaces/goldilocks-deliveries/item.html) | Menu item · Valet Pru's Concierge Service |
| [`/interfaces/goldilocks-deliveries/partner.html`](/interfaces/goldilocks-deliveries/partner.html) | Menu partner · Valet Pru's Concierge Service · SS Vibelandia |
| [`/interfaces/goldilocks-deliveries/pay.html`](/interfaces/goldilocks-deliveries/pay.html) | Honor payment · Valet Pru's Concierge Service · SS Vibelandia |
| [`/interfaces/goldilocks-deliveries/valet.html`](/interfaces/goldilocks-deliveries/valet.html) | Goldilocks Valet Franchise · Puerto Reno · SS Vibelandia QUESTFEST |

### `journey/` (`/interfaces/journey/`)

| Path | Title |
|------|-------|
| [`/interfaces/journey/bachdoor-music-lab.html`](/interfaces/journey/bachdoor-music-lab.html) | Golden Bachdoor · Music Lab · Journey · SS Vibelandia |
| [`/interfaces/journey/boriken-convergence.html`](/interfaces/journey/boriken-convergence.html) | Borikén · Great Convergence · Journey · SS Vibelandia |
| [`/interfaces/journey/bridge-solar-watch.html`](/interfaces/journey/bridge-solar-watch.html) | Bridge · Proto & Electro Watch · Journey · SS Vibelandia |
| [`/interfaces/journey/cartagena-spice-stone.html`](/interfaces/journey/cartagena-spice-stone.html) | Cartagena · Spice & Stone · Journey · SS Vibelandia |
| [`/interfaces/journey/omniversal-canvas-walk.html`](/interfaces/journey/omniversal-canvas-walk.html) | Omniversal Canvas · Exhibit Walk · Journey · SS Vibelandia |
| [`/interfaces/journey/puerto-reno-gangway.html`](/interfaces/journey/puerto-reno-gangway.html) | Puerto Reno · Gangway Night · Journey · SS Vibelandia |
| [`/interfaces/journey/redwood-sanctuary.html`](/interfaces/journey/redwood-sanctuary.html) | Redwood Sanctuary · Journey · SS Vibelandia |
| [`/interfaces/journey/tahoe-catamaran.html`](/interfaces/journey/tahoe-catamaran.html) | Lake Tahoe · Catamaran Gold · Journey · SS Vibelandia |
| [`/interfaces/journey/truckee-sierra-forage.html`](/interfaces/journey/truckee-sierra-forage.html) | Truckee River & High Sierra Forage · Journey · SS Vibelandia |

### `lattice-chat/` (`/interfaces/lattice-chat/`)

| Path | Title |
|------|-------|
| [`/interfaces/lattice-chat/index.html`](/interfaces/lattice-chat/index.html) | Lattice Chat Agent · Collaborate · V1.618 |

### `nesting/` (`/interfaces/nesting/`)

| Path | Title |
|------|-------|
| [`/interfaces/nesting/nest-basenet-genesis.html`](/interfaces/nesting/nest-basenet-genesis.html) | Base Mainnet · genesis contracts · nesting guide |
| [`/interfaces/nesting/nest-dph-gpu.html`](/interfaces/nesting/nest-dph-gpu.html) | Holographic code layer · nesting guide |
| [`/interfaces/nesting/nest-goldilocks-beehive.html`](/interfaces/nesting/nest-goldilocks-beehive.html) | Goldilocks Syntheverse Beehive Residency · nesting guide |
| [`/interfaces/nesting/nest-hospitality-commons.html`](/interfaces/nesting/nest-hospitality-commons.html) | Puerto Reno Guest Brochure & Crew Portals · nesting guide |
| [`/interfaces/nesting/nest-lattice-chat.html`](/interfaces/nesting/nest-lattice-chat.html) | Lattice Chat Agent V1.618 · Next layer · nesting guide |
| [`/interfaces/nesting/nest-man-cave-restroom.html`](/interfaces/nesting/nest-man-cave-restroom.html) | Man cave mirror · nesting guide |
| [`/interfaces/nesting/nest-questfest-puerto-reno.html`](/interfaces/nesting/nest-questfest-puerto-reno.html) | QUESTFEST · Puerto Reno · nesting guide |
| [`/interfaces/nesting/nest-sing13.html`](/interfaces/nesting/nest-sing13.html) | Sonic Singularity Sing! 13 · cloud skin · nesting guide |
| [`/interfaces/nesting/nest-sonic-singularity.html`](/interfaces/nesting/nest-sonic-singularity.html) | Sonic Singularity · nesting guide |
| [`/interfaces/nesting/nest-syntheverse.html`](/interfaces/nesting/nest-syntheverse.html) | Syntheverse · nesting guide |
| [`/interfaces/nesting/nest-wrong-side.html`](/interfaces/nesting/nest-wrong-side.html) | Wrong Side of Town · nesting guide |

### `octave99-bridge/` (`/interfaces/octave99-bridge/`)

| Path | Title |
|------|-------|
| [`/interfaces/octave99-bridge/index.html`](/interfaces/octave99-bridge/index.html) | 99 Octave Omni-Lattice Bridge · SING13 |

### `octave99-chart/` (`/interfaces/octave99-chart/`)

| Path | Title |
|------|-------|
| [`/interfaces/octave99-chart/index.html`](/interfaces/octave99-chart/index.html) | Your 99 Octave Chart · Chart yourself in the grand Story |

### `questfest-bridge/` (`/interfaces/questfest-bridge/`)

| Path | Title |
|------|-------|
| [`/interfaces/questfest-bridge/index.html`](/interfaces/questfest-bridge/index.html) | Jukebox · SS Vibelandia QUESTFEST |

### `special-projects/` (`/interfaces/special-projects/`)

| Path | Title |
|------|-------|
| [`/interfaces/special-projects/erdos-holographic-aios-audit.html`](/interfaces/special-projects/erdos-holographic-aios-audit.html) | Erdős 353 · Holographic Goldilocks AIOS Audit · Syntheverse |
| [`/interfaces/special-projects/geomagnetic-herbivore-study.html`](/interfaces/special-projects/geomagnetic-herbivore-study.html) | Geomagnetic Herbivore Study · Multi-Taxa Wavefield |
| [`/interfaces/special-projects/turner-bison-herd-management.html`](/interfaces/special-projects/turner-bison-herd-management.html) | Turner Enterprise · Rangeland herd intelligence |
| [`/interfaces/special-projects/wavefield-echo-test.html`](/interfaces/special-projects/wavefield-echo-test.html) | Wavefield Echo Test · Plain-speak results |

### `voyage/` (`/interfaces/voyage/`)

| Path | Title |
|------|-------|
| [`/interfaces/voyage/arrive.html`](/interfaces/voyage/arrive.html) | Arrive · SS Vibelandia Voyage |
| [`/interfaces/voyage/cabin-cc-201-224.html`](/interfaces/voyage/cabin-cc-201-224.html) | CC-201–224 · Captiva Cove Beachfront Cabins · SS Vibelandia |
| [`/interfaces/voyage/cabin-gm-401-450.html`](/interfaces/voyage/cabin-gm-401-450.html) | GM-401–450 · Grove Mezzanine Lofts · SS Vibelandia |
| [`/interfaces/voyage/cabin-ph-001.html`](/interfaces/voyage/cabin-ph-001.html) | PH-001 · Captain’s Grand Penthouse · SS Vibelandia |
| [`/interfaces/voyage/cabin-ph-101-108.html`](/interfaces/voyage/cabin-ph-101-108.html) | PH-101–108 · El Gran Sol Grand Penthouses · SS Vibelandia |
| [`/interfaces/voyage/cabin-rr-301-340.html`](/interfaces/voyage/cabin-rr-301-340.html) | RR-301–340 · South Seas Veranda Condos · SS Vibelandia |
| [`/interfaces/voyage/cabin-sc-501-560.html`](/interfaces/voyage/cabin-sc-501-560.html) | SC-501–560 · High-Roller Executive Suites · SS Vibelandia |
| [`/interfaces/voyage/cabin-st-601-680.html`](/interfaces/voyage/cabin-st-601-680.html) | ST-601–680 · Lattice Studio Staterooms · SS Vibelandia |
| [`/interfaces/voyage/curated-community.html`](/interfaces/voyage/curated-community.html) | ◉ Curated community · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-2-core.html`](/interfaces/voyage/deck-2-core.html) | Deck 2 — Core · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-3-night.html`](/interfaces/voyage/deck-3-night.html) | Deck 3 — Night · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-4-5-grove.html`](/interfaces/voyage/deck-4-5-grove.html) | Decks 4–5 — Grove · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-6-7-horizon.html`](/interfaces/voyage/deck-6-7-horizon.html) | Decks 6–7 — Horizon · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-8-veranda.html`](/interfaces/voyage/deck-8-veranda.html) | Deck 8 — Veranda · SS Vibelandia Voyage |
| [`/interfaces/voyage/deck-9-summit.html`](/interfaces/voyage/deck-9-summit.html) | Deck 9 — Summit · SS Vibelandia Voyage |
| [`/interfaces/voyage/decks.html`](/interfaces/voyage/decks.html) | Voyage Map · Story · Experiences · Homes · SS Vibelandia |
| [`/interfaces/voyage/fractal-harmonics.html`](/interfaces/voyage/fractal-harmonics.html) | Φ Fractal harmonics · SS Vibelandia Voyage |
| [`/interfaces/voyage/frontiersman.html`](/interfaces/voyage/frontiersman.html) | ☀ Frontiersman · SS Vibelandia Voyage |
| [`/interfaces/voyage/holographic-reality.html`](/interfaces/voyage/holographic-reality.html) | ◈ Holographic reality · SS Vibelandia Voyage |
| [`/interfaces/voyage/inquire.html`](/interfaces/voyage/inquire.html) | Inquire · SS Vibelandia Voyage |
| [`/interfaces/voyage/live-in-frequency.html`](/interfaces/voyage/live-in-frequency.html) | ∞ Live in frequency · SS Vibelandia Voyage |
| [`/interfaces/voyage/live-the-vibe.html`](/interfaces/voyage/live-the-vibe.html) | Live the vibe · SS Vibelandia Voyage |
| [`/interfaces/voyage/luxury-redefined.html`](/interfaces/voyage/luxury-redefined.html) | ✦ Luxury redefined · SS Vibelandia Voyage |
| [`/interfaces/voyage/prepare.html`](/interfaces/voyage/prepare.html) | Prepare · SS Vibelandia Voyage |
| [`/interfaces/voyage/select.html`](/interfaces/voyage/select.html) | Select · SS Vibelandia Voyage |

<!-- interfaces-index:end -->
