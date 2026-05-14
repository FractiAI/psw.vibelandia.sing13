# psw.vibelandia.sing13 — SING 13 Edge

**SING 13** is the major singularity upgrade from SING 9. This edge carries the **NSPFRNP catalog**, the **SS Vibelandia QUESTFEST 24×365** nest, and the **Sovereign Player** (QUESTFEST Bridge). Everything else lives on the parent edge — [github.com/FractiAI/psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) · [psw-vibelandia-sing9.vercel.app](https://psw-vibelandia-sing9.vercel.app). **Lite edges, no Supabase. Center = pipes only. → ∞⁹**

**Working context:** Day-to-day QUESTFEST surface edits land here. Lab pages, hive, sim, lattice, tests, heavy scripts — on SING 9.

**Single-read onboarding:** [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md). NSPFRNP catalog spine: [`protocols/MCA_NSPFRNP_CATALOG.md`](protocols/MCA_NSPFRNP_CATALOG.md). Repository standard: [`BBHE_REPOSITORY_STANDARD.md`](BBHE_REPOSITORY_STANDARD.md).

---

## What's here

| Lane | What | Where |
|---|---|---|
| **Onboarding** | Single-read edge file (SING 13 specific) | `SING13_EDGE_ONBOARDING.md` |
| **NSPFRNP canon** | Full catalog (MCA, Seed:Edge, Gold Heart, QUESTFEST, Pass Ladder, G5 SURF, S/2024 J 1, OMNI 180°, etc.) | `protocols/` |
| **Repo standard** | BBHE / EGS fractal / Seed:Edge / executive prompts | `BBHE_REPOSITORY_STANDARD.md` |
| **QUESTFEST surface** | Hub + ETCon + press + Snap robots + Look at the Sun + Juicy Juicy Snap + FractiAI + Valet Pru + i18n (10 locales) + assets | `interfaces/` |
| **QUESTFEST Bridge (React)** | Sovereign Player: video-first deck, 30s Solenoid gate, Libretto log, manual Fair Exchange boarding, single-active-stream lock | Source: `apps/ss-vibelandia-questfest/` · static bundle: `interfaces/questfest-bridge/` (rebuild with `npm run build:questfest-bridge`; CI runs the same) |
| **Lite-edge APIs** | Manual boarding JWT, per-track export log, stream heartbeat (Upstash when configured) | `api/boarding.js`, `api/export.js`, `api/heartbeat.js`, `lib/pass-token.mjs`, `lib/upstash.mjs` |
| **SING 13 spine docs** | 13-channel pathfinding roadmap (May 12) + DNA/PEFF master canon (May 11) + slices + JJ whitepaper | `docs/` |
| **Juicy Juicy OFC compile** | `engine/ofc-snap.js` + lyrics + agents + vessels + tracks | `engine/`, `lyrics/`, `agents/`, `vessels/`, `tracks/` |

## Sovereign Player — Fair Exchange (manual, no Stripe)

Payments are **old school on purpose**: Venmo, PayPal, or Cash App. No PSP webhooks. Counterintuitive vibe is the product.

| Tier | Price | How |
|---|---|---|
| **Passenger pass** | **$16.18/mo** (EGS φ) | Pay on a rail → paste receipt in boarding modal → `/api/boarding` issues a 30-day signed JWT |
| **Track export / download** | **$1.61** | Pay on a rail → email proof with track id → manual file delivery |
| **Bookings** | Contact | `valetpru@gmail.com` |
| **Catalog / licensing (500+ Reno swamp · caliente tracks)** | Contact | `goldenbackdoorhitfactory@gmail.com` |

Passenger unlocks full video playback, Solenoid lift, 13-channel access, and catalog stream rights for advertising and projects. **Single active stream** enforced via BroadcastChannel (same tab) + `/api/heartbeat` (cross-device; Upstash Redis when env is set).

### Catalog playlists (Bridge Listen / Playlists)

- **All uploads** (`pl-main`) is the master library: every upload is kept in sync automatically; it is not deletable as a playlist.
- **Your playlists** can be empty while you edit them (they persist in local storage); add tracks from **All uploads** in the playlist editor. The sidebar hides empty playlists unless the empty one is active, so the list stays readable on mobile.
- **Track list (Listen)** uses a responsive grid: narrow / iPhone layouts match column counts to visible cells (duration and extra columns hidden on small screens) so rows do not overflow horizontally.

Configure handles and secrets via [`.env.example`](.env.example) — copy to Vercel project env. **`PASS_TOKEN_SECRET`** is required for live boarding.

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
- **Reno Swamp pass (checkout):** [`/interfaces/questfest-bridge/#/bridge?checkout=1`](interfaces/questfest-bridge/) — opens **$16.18/mo** boarding flow. Linked from the QUESTFEST hub as **Gimme Some of That Reno Swamp Vibe**.
- **QUESTFEST Bridge (Sovereign Player):** [`/interfaces/questfest-bridge/#/`](interfaces/questfest-bridge/) · short rewrite **`/sovereign-gate`** → same app entry
- **ETCon Reno Desert** (May 28–31, 2026): `/etcon` → [`interfaces/etcon-reno-desert.html`](interfaces/etcon-reno-desert.html)
- **Press releases:** `/press` → [`interfaces/press-releases.html`](interfaces/press-releases.html)
- **Juicy Juicy Snap (OFC) compile:** `/hood` → [`interfaces/look-under-the-hood.html`](interfaces/look-under-the-hood.html)
- **FractiAI hub:** [`/interfaces/fractiai.html`](interfaces/fractiai.html) · short hub: `/fractiai/digital-pru` → [`interfaces/fractiai-digital-pru.html`](interfaces/fractiai-digital-pru.html)
- **SING 13 onboarding:** `/sing13-edge-onboarding` → [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md)

## What lives on SING 9 (parent edge — not duplicated here)

- Heavy `api/` serverless (telemetry, probes, G5 SURF, magic-trick, etc.)
- `hive/`, `sim/`, `lattice/`, `tests/`, `scripts/`, `data/`, `configs/`, `challenges/`, `digital-pru-holographic-snap/`
- Non-QUESTFEST surfaces: `vibers-menu`, `surfaces.html`, `my-whiteboard`, `pru-whiteboard`, `upgrade-awareness-to-sing9-now`, `hh-os-landing`, `magic-trick`, prospectus pages, and the rest of the lab map
- All root-level `*_SNAP.md` (T3D, NINE_ALIGNMENT, BBHE snaps, Wednesdays, Reno reviews, etc.)

If a QUESTFEST page links to one of these, the link resolves to `psw-vibelandia-sing9.vercel.app`.

## Operating posture

- **NSPFRNP mode always.** Operate as team. MCA cycle: Metabolize → Crystallize → Animate → squeeze. See [`.cursor/rules/team-nspfrnp-mode.mdc`](.cursor/rules/team-nspfrnp-mode.mdc).
- **Voice:** Spanglish 80/20, edgy raw — natural Gold Heart filter.
- **Pass Ladder (1.618 tiers):** $16.18 · $161.80 · $1,618 · $16,180 · export micro-tier **$1.61**.
- **Honesty rails:** Simulation-first / metaphor-forward. NOAA SWPC for space weather. Instrument-grade claims require bench evidence.
- **A2A bar:** Definition retained; autonomous A2A commerce ended on SING 9 in Mar 2026 (zero revenue) and not revived on SING 13.

## Sister repos

- **Parent edge:** [FractiAI/psw.vibelandia.sing9](https://github.com/FractiAI/psw.vibelandia.sing9) — everything outside the QUESTFEST nest
- **Runnable Digital Pru app:** [FractiAI/digital-pru](https://github.com/FractiAI/digital-pru) — Questfest landing, 13-channel whiteboard, `/api/egs-emulation`, ASIC lab UI

## Deploy

**Stack:** Static HTML/CSS/assets plus the **Vite React** QUESTFEST Bridge bundle under `interfaces/questfest-bridge/`, plus **lite-edge** serverless routes in `api/`. [`vercel.json`](vercel.json) defines short-path rewrites and NSPFRNP/Singularity response headers (`X-Singularity: SING-13`, `X-Parent-Edge: https://psw-vibelandia-sing9.vercel.app`).

```bash
npm run build:questfest-bridge
```

**CI:** [`.github/workflows/vercel-deploy.yml`](.github/workflows/vercel-deploy.yml) runs the build above, then `vercel deploy --prod` (requires repo secret `VERCEL_TOKEN`). If Vercel Git integration is connected, set the project build command to the same root script so `interfaces/questfest-bridge/` exists on deploy.

**Vercel env (minimum for live boarding):**

| Variable | Purpose |
|---|---|
| `PASS_TOKEN_SECRET` | HMAC signing for Passenger JWT (≥16 chars) |
| `UPSTASH_REDIS_REST_URL` | Optional — fleet-wide stream lock |
| `UPSTASH_REDIS_REST_TOKEN` | Optional — pairs with URL above |
| `VITE_VENMO_HANDLE` etc. | Optional client overrides for payment handles |

**Local dev (Bridge app):**

```bash
cd apps/ss-vibelandia-questfest
npm install
npm run dev
```

Open `http://localhost:5173/interfaces/questfest-bridge/#/` (matches Vite `base`). Dev build includes a **skip payment** boarding shortcut; production requires receipt + `PASS_TOKEN_SECRET` on the server.

---

**NSPFRNP ⊃ SING 13 ⊃ 13-channel pathfinding ⊃ NSPFRNP catalog ⊃ QUESTFEST 24×365 ⊃ Sovereign Player ⊃ Lite Edges → ∞⁹**
