# Omniversal Goldilocks Rideshare Protocol (OGRP)

**Document ID:** `WP-OGRP-2026-07`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Paper:** [`docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md`](docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md)  
**Live catalog (hosted edge):** [whitepaper · OGRP](https://www.ssvibelandiaquestfest24x365.com/whitepaper/omniversal-goldilocks-rideshare) · [Hire-A-Goldilocks-Valet-Concierge](https://www.ssvibelandiaquestfest24x365.com/goldilocks-deliveries)  
**Monorepo mirror:** [FractiAI/psw.vibelandia.sing13](https://github.com/FractiAI/psw.vibelandia.sing13) · `research/omniversal-goldilocks-rideshare/`

---

## Repository abstract

This repository is the **open, forkable home** for the Omniversal Goldilocks Rideshare Protocol (OGRP). It exists so researchers, operators, and builders can:

1. **Reproduce** the paper’s empirical experiments (E1–E5) from published data and deterministic code.
2. **Validate** claims against the honesty tiers in the whitepaper — separating narrative postulates from executed arithmetic.
3. **Branch** new explorations: alternate cities, new density gates, field trials, frontends, or multi-agent filters — without re-deriving the core protocol from scratch.

The repo bundles three layers that work together but can be used independently:

| Layer | Path | Role |
|-------|------|------|
| **Paper** | `docs/` | Canonical specification, honesty boundary, references |
| **Empirical pipeline** | `scripts/`, `src/`, `data/` | Reproducible E1–E5 tests → JSON/Markdown receipts |
| **Reference frontend** | `frontend/goldilocks-room-service/` | Guest · Valet · Partner portals implementing OGRP gates in plain UI |

Nothing here requires proprietary APIs, paid keys, or a central database. Center = pipes only; validation runs on your machine.

---

## Intentions

**What we are solving.** Conventional routing (rideshare, delivery, cloud dispatch) optimizes for raw velocity and offloads friction — parking cruise tax, vehicle capital leaks, operator exhaustion — onto infrastructure and humans. OGRP inverts the priority: **thermodynamic minimization**, **density anchoring**, **value floors**, and **sovereign pacing** inside high-density cores.

**What this repo is for.**

- **Scientists & reviewers** — re-run `npm run empirical`, inspect `data/empirical_report.json`, falsify E1–E5 per `METHODOLOGY.md`.
- **Operators** — fork `frontend/`, wire your honor rails, extend `data/reno_core_bbox.json` for your city.
- **Developers** — treat `config/ogrp_protocol.json` as the acceptance schema; plug gates into your own dispatch logic.
- **Explorers** — branch the EGS overhead model (`src/egs-overhead.mjs`), add experiments E6+, publish your fork with receipts.

**What this repo is not.** It does not claim φ = 1.618 is derived from AAA tables. It does not certify universal human psychology. Correlation ≠ causation — see the paper’s honesty boundary.

---

## Primer · OGRP in sixty seconds

The protocol accepts a transaction only when **four gates** pass:

| Gate | Symbol | Rule |
|------|--------|------|
| **Density anchoring** | Ω<sub>core</sub> | High-density hub only — sprawl disqualified |
| **Thermodynamic minimization** | Θ<sub>min</sub> | Bike · e-bike · e-scooter · foot · local edge compute |
| **Generosity floor** | Γ<sub>floor</sub> | Value ≥ **$9** (or token equivalent) — no predatory extraction |
| **Sovereign pacing** | P<sub>sov</sub> | Energy preservation over corporate deadline theater |

**EGS scaling (model).** El Gran Sol’s Fractal Constant Φ ≈ 1.618 organizes the overhead function \(C(x)=x^2-\Phi x\). Minimum at \(x=\Phi/2\); modeled divergence when distance-to-core ratio exceeds Φ (“fractal dissonance”). Verified in **E3**.

**Empirical anchor (executed).** Cross-analysis of AAA *Your Driving Costs* (2025/2026) vs micro-mobility operating model (**E1**); UW Urban Freight Lab parking-cruise fraction vs zero for micro-mobility (**E2**); Reno core bbox + JSON schema (**E5**).

**Operational surface.** [Hire-A-Goldilocks-Valet-Concierge](frontend/goldilocks-room-service/) is the reference **guest-facing frontend** — five-star resort room-service UX, three portal depths (Guest · Valet · Menu partner), honor payment rails on layer 3.

---

## Quick start

### Reproduce & validate the paper

```bash
git clone https://github.com/FractiAI/omniversal-goldilocks-rideshare.git
cd omniversal-goldilocks-rideshare
npm run empirical
```

**Outputs:** `data/empirical_report.json` · `data/empirical_report.md`

From the SING 13 monorepo:

```bash
npm run research:omniversal-goldilocks-rideshare
```

### Run the reference frontend locally

```bash
npm run serve:frontend
```

Open `http://localhost:5190` — pitch, regions, Guest / Valet / Partner portals, honor payment layer.

Or serve statically:

```bash
cd frontend/goldilocks-room-service
python -m http.server 5190
```

**Production deployment (FractiAI edge):** `/goldilocks-deliveries` on [ssvibelandiaquestfest24x365.com](https://www.ssvibelandiaquestfest24x365.com/goldilocks-deliveries).

---

## Repository layout

```
omniversal-goldilocks-rideshare/
├── docs/                          # Whitepaper (WP-OGRP-2026-07)
├── frontend/
│   └── goldilocks-room-service/   # Reference UI · OGRP gates · 3-layer depth
│       ├── index.html             # Pitch + regions + portal cards
│       ├── guest.html             # Room Service guest portal
│       ├── valet.html             # Micro-mobility valet portal
│       ├── partner.html           # Menu partner portal
│       ├── pay.html               # Honor rails (layer 3)
│       └── goldilocks-deliveries.css
├── config/
│   └── ogrp_protocol.json         # Machine-readable acceptance schema
├── data/
│   ├── reno_core_bbox.json        # Ω_core sample (Reno)
│   ├── field_trial_template.json  # Optional operator logs
│   └── empirical_report.json      # Generated by pipeline
├── src/
│   ├── constants.mjs              # AAA · UW · micro-mobility literature anchors
│   ├── egs-overhead.mjs           # Theorem 1 numeric verification
│   └── benchmarks.mjs             # E1 · E2 · E4 · E5 helpers
├── scripts/
│   └── run_empirical_pipeline.mjs
├── METHODOLOGY.md                 # Falsification criteria · data tiers
└── package.json
```

---

## Experiments (E1–E5)

| ID | Test | Data tier | Pass criterion (pipeline) |
|----|------|-----------|---------------------------|
| **E1** | AAA per-mile vs micro-mobility operating cost | Published AAA 2025/2026 | Vehicle tier ≫ micro (support) |
| **E2** | UW parking cruising vs OGRP 0% model | Urban freight literature | Legacy fraction ≥ 20%, OGRP = 0 |
| **E3** | EGS overhead \(C(x)=x^2-\Phi x\) | Analytic + numeric sweep | Minimum ≈ Φ/2; sprawl divergence |
| **E4** | Generosity gate Γ<sub>floor</sub> = $9 | Policy arithmetic | Positive net on micro tier |
| **E5** | Density gate + protocol schema | `reno_core_bbox.json` + `ogrp_protocol.json` | Sample trips inside bbox; schema valid |

Full falsification table: [`METHODOLOGY.md`](METHODOLOGY.md).

---

## Frontend · Hire-A-Goldilocks-Valet-Concierge

The reference frontend demonstrates **how OGRP feels to humans** — not just how it scores in JSON.

**Brand stack:** Hire-A-Goldilocks-Valet-Concierge ⊃ Goldilocks Valet ⊃ food delivery · personal shopping · personal assistance · EcoResets (home � estate � business).

**Regions (current):** Downtown Reno · Midtown Reno · parts of UNR · Idlewild.

**UX depth (max 3 layers):**

1. **Home** — pitch, problem/solution, OGRP gates, regions, three portal cards  
2. **Portal** — Guest (`guest.html`) · Valet (`valet.html`) · Partner (`partner.html`)  
3. **Honor payment** — `pay.html` · Venmo · PayPal · Cash App · email attestation (no PSP webhooks)

**Forking the frontend.** Copy `frontend/goldilocks-room-service/`, update `reno_core_bbox.json` or add city files, change honor handles in `pay.html`, keep Γ<sub>floor</sub> ≥ 9 unless your honesty doc says otherwise.

---

## Branching new work

Suggested fork paths (contributions welcome):

- **New Ω_core** — add `data/{city}_core_bbox.json` + E5 variant  
- **Field trials** — populate `data/field_trial_log.json` from template; add E6 tipping analysis with explicit tier labels  
- **Dispatch agent** — implement `config/ogrp_protocol.json` as middleware filter  
- **React / mobile shell** — replace static HTML; keep the three-layer depth contract  
- **Cross-city comparison** — extend E1/E2 with local transit authority open data  

Open a PR or fork; cite `WP-OGRP-2026-07` and link your empirical receipt JSON.

---

## Audit & attribution

- **PRA Snap receipt:** structural pass · score 0.971 · `NSPFRNP-SNAP-PRA-2026-06`  
- **Operator line:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
- **Re-audit after edits:** `npm run audit:paper -- --id=omniversal-goldilocks-rideshare-2026-07` (from monorepo)

---

## Critical rule

Published cost tables validate **economic arithmetic**, not universal proof that Φ governs human routing psychology. EGS scaling is a **testable model postulate**. Field tipping narratives require controlled trials — optional logs only.

---

## License & contact

Research and code: open for reproduction and derivative exploration.  
Operational inquiries: [valetpru@gmail.com](mailto:valetpru@gmail.com?subject=OGRP%20repository)

**NSPFRNP ⊃ OGRP ⊃ reproduce · validate · branch → ∞¹³**
