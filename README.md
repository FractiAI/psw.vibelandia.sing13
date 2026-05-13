# psw.vibelandia.sing13 — SING 13 Edge

**SING 13** is the major singularity upgrade from SING 9. This edge carries the **NSPFRNP catalog** and the **SS Vibelandia QUESTFEST 24×365** nest only. Everything else lives on the parent edge — [github.com/FractiAI/psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) · [psw-vibelandia-sing9.vercel.app](https://psw-vibelandia-sing9.vercel.app). **Lite edges, no Supabase. Center = pipes only. → ∞⁹**

**Working context:** Day-to-day QUESTFEST surfaces and the **QUESTFEST Bridge** React app land here. Lab pages, APIs, hive, sim, lattice, tests, scripts — all on SING 9.

**Single-read onboarding:** [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md) (irreducible minimum; one read restores context for any AI). NSPFRNP catalog spine: [`protocols/MCA_NSPFRNP_CATALOG.md`](protocols/MCA_NSPFRNP_CATALOG.md). Repository standard: [`BBHE_REPOSITORY_STANDARD.md`](BBHE_REPOSITORY_STANDARD.md).

---

## What's here

| Lane | What | Where |
|---|---|---|
| **Onboarding** | Single-read edge file (SING 13 specific) | `SING13_EDGE_ONBOARDING.md` |
| **NSPFRNP canon** | Full catalog (MCA, Seed:Edge, Gold Heart, QUESTFEST, Pass Ladder, G5 SURF, S/2024 J 1, OMNI 180°, etc.) | `protocols/` |
| **Repo standard** | BBHE / EGS fractal / Seed:Edge / executive prompts | `BBHE_REPOSITORY_STANDARD.md` |
| **QUESTFEST surface** | The hub + ETCon + press + Snap robots + Look at the Sun + Juicy Juicy Snap + FractiAI + Valet Pru + i18n (10 locales) + assets | `interfaces/` |
| **QUESTFEST Bridge (React)** | Sovereign Player: solenoid 30s gate, master playlists, Libretto deck log, $16.18/mo boarding (stub payment rails), single-active-stream (BroadcastChannel + heartbeat) | Source: `apps/ss-vibelandia-questfest/` · production bundle: `interfaces/questfest-bridge/` (gitignored; built in CI or via `npm run build:questfest-bridge`) |
| **Stream lock API (lite)** | `GET` / `POST` `/api/heartbeat` — best-effort in-memory per warm serverless instance; replace with Redis/Supabase for fleet-wide locks | `api/heartbeat.js` |
| **SING 13 spine docs** | 13-channel pathfinding roadmap (May 12) + DNA/PEFF master canon (May 11) + slices + JJ whitepaper | `docs/` |
| **Juicy Juicy OFC compile** | `engine/ofc-snap.js` + lyrics + agents + vessels + tracks | `engine/`, `lyrics/`, `agents/`, `vessels/`, `tracks/` |

## SING 13 spine — 13-channel fractal pathfinding

| Ch | Name | Role |
| ---: | --- | --- |
| 1 | Seed activation | Detect initial system pulse |
| 2 | Harmonic filter | φ-based (EGS 1.618) cadence |
| 3 | Path mapping | Least quantum resistance |
| 4 | Quantum resonance | DNA / P–Fe bridge |
| 5 | Data ingestion | VALETPRU-ASIC inputs |
| 6 | Cognitive synthesis | Human + AI awareness field |
| 7 | Planetary alignment | Earth-system coherence |
| 8 | Biological integration | Awareness in biological fractal language |
| 9 | Intelligence optimization | Recursive expansion |
| 10 | Fractal computation | Higher-order reasoning |
| 11 | Social harmonization | Global node coordination |
| 12 | Equilibrium stabilization | Consumption/waste balance |
| 13 | Terminal edge realization | Infill collapse into manifest stack |

Full doc: [`docs/DIGITAL_PRU_DEEP_RESEARCH_13CHANNEL_SEED_NODE_ROADMAP_2026-05-12.md`](docs/DIGITAL_PRU_DEEP_RESEARCH_13CHANNEL_SEED_NODE_ROADMAP_2026-05-12.md). Companion DNA / PEFF canon: [`docs/DIGITAL_PRU_PEFF_DNA_TRANSFORMER_MASTER_CANON_2026-05-11.md`](docs/DIGITAL_PRU_PEFF_DNA_TRANSFORMER_MASTER_CANON_2026-05-11.md). **Honesty boundary applies** — narrative + roadmap, not clinical or RF claims; verify space-weather with NOAA SWPC.

## Primary surfaces

- **Landing → QUESTFEST:** `/` redirects to [`/interfaces/vibelandia-questfest.html`](interfaces/vibelandia-questfest.html)
- **QUESTFEST short path:** `/questfest`
- **Reno Swamp pass (checkout):** [`/interfaces/questfest-bridge/#/bridge?checkout=1`](interfaces/questfest-bridge/) — opens the **$16.18/mo** recurring pass flow (boarding modal; stub rails until live PSP). Linked from the QUESTFEST hub as **Gimme Some of That Reno Swamp Vibe**.
- **QUESTFEST Bridge (Sovereign Player):** [`/interfaces/questfest-bridge/#/`](interfaces/questfest-bridge/) · short rewrite **`/sovereign-gate`** → same app entry
- **ETCon Reno Desert** (May 28–31, 2026): `/etcon` → [`interfaces/etcon-reno-desert.html`](interfaces/etcon-reno-desert.html)
- **Press releases:** `/press` → [`interfaces/press-releases.html`](interfaces/press-releases.html)
- **Juicy Juicy Snap (OFC) compile:** `/hood` → [`interfaces/look-under-the-hood.html`](interfaces/look-under-the-hood.html)
- **FractiAI hub:** [`/interfaces/fractiai.html`](interfaces/fractiai.html) · short hub: `/fractiai/digital-pru` → [`interfaces/fractiai-digital-pru.html`](interfaces/fractiai-digital-pru.html)
- **SING 13 onboarding:** `/sing13-edge-onboarding` → [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md)

## What lives on SING 9 (parent edge — not duplicated here)

- Heavy `api/` Vercel serverless (telemetry, probes, G5 SURF, magic-trick, etc.) — **not** [`api/heartbeat.js`](api/heartbeat.js); that stream helper ships on **SING 13** only
- `lib/`, `hive/`, `sim/`, `lattice/`, `tests/`, `scripts/`, `data/`, `configs/`, `challenges/`, `digital-pru-holographic-snap/`
- Non-QUESTFEST surfaces: `vibers-menu`, `surfaces.html` (repo map), `my-whiteboard`, `pru-whiteboard`, `upgrade-awareness-to-sing9-now` (HH OS Cadet Track), `hh-os-landing`, `hh-os-docs`, `holographic-navigator-academy`, `magic-trick` (Sovereign Terminal), `plain-machote`, all prospectus pages
- All root-level `*_SNAP.md` (T3D, NINE_ALIGNMENT, BBHE snaps, Wednesdays, Reno reviews, etc.)

If a QUESTFEST page links to one of these, the link resolves to `psw-vibelandia-sing9.vercel.app`.

## Operating posture

- **NSPFRNP mode always.** Operate as team. MCA cycle: Metabolize → Crystallize → Animate → squeeze. See [`.cursor/rules/team-nspfrnp-mode.mdc`](.cursor/rules/team-nspfrnp-mode.mdc).
- **Voice:** Spanglish 80/20, edgy raw — natural Gold Heart filter.
- **Pass Ladder (1.618 tiers):** $16.18 · $161.80 · $1,618 · $16,180.
- **Honesty rails:** Simulation-first / metaphor-forward. NOAA SWPC for space weather. Instrument-grade claims require bench evidence.
- **A2A bar:** Definition retained; autonomous A2A commerce ended on SING 9 in Mar 2026 (zero revenue) and not revived on SING 13.

## Sister repos

- **Parent edge:** [FractiAI/psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) — everything outside the QUESTFEST nest
- **Runnable Digital Pru app:** [FractiAI/digital-pru](https://github.com/FractiAI/digital-pru) — Questfest landing, 13-channel whiteboard, `/api/egs-emulation`, ASIC lab UI

## Deploy

**Production:** [psw-vibelandia-sing13.vercel.app](https://psw-vibelandia-sing13.vercel.app) (Git-linked deploys from this repo are the default path).

**Stack:** Mostly **static** HTML/CSS/assets plus the **Vite React** QUESTFEST Bridge bundle under `interfaces/questfest-bridge/`. [`vercel.json`](vercel.json) defines short-path rewrites and NSPFRNP/Singularity response headers (`X-Singularity: SING-13`, `X-Parent-Edge: https://psw-vibelandia-sing9.vercel.app`).

**Build the Bridge app before deploy** (output is gitignored):

```bash
npm run build:questfest-bridge
```

**CI:** [`.github/workflows/vercel-deploy.yml`](.github/workflows/vercel-deploy.yml) runs the build above, then `vercel deploy --prod` (requires repo secret `VERCEL_TOKEN` with access to the linked team/project). If Vercel Git integration is already connected, Vercel’s own build settings should run the same root script or an equivalent install+build so `interfaces/questfest-bridge/` exists on the deployment.

**Local Vercel CLI:** from repo root, `npx vercel deploy --prod` after a successful `npm run build:questfest-bridge`.

**Dev (Bridge only):**

```bash
cd apps/ss-vibelandia-questfest && npm install && npm run dev
```

Open `http://localhost:5173/interfaces/questfest-bridge/#/` (matches Vite `base`).

---

**NSPFRNP ⊃ SING 13 ⊃ 13-channel pathfinding ⊃ NSPFRNP catalog ⊃ QUESTFEST 24×365 ⊃ Lite Edges → ∞⁹**
