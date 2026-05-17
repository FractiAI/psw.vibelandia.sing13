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
| **QUESTFEST surface** | Hub + **9-layer nesting ladder** (plain-language guides) + **Goldilocks Syntheverse Beehive Residency** + ETCon + press + Look at the Sun / Under the hood + FractiAI + Valet Pru + i18n + assets | `interfaces/` · `interfaces/nesting/` |
| **QUESTFEST Bridge (React)** | Sovereign Player: video-first deck, 30s Solenoid gate, in-flow player dock, Libretto log, **Master Music Catalog** honor pass ($16.18/mo EGS φ — **not the magazine for sale**; follow **Machote Moderno Magazine** to qualify, then honor attestation → **30 calendar days** on this browser), single-active-stream lock, **background audio for members/captain only**, playlist edit (remove, multi-playlist picker, drag reorder) | Source: `apps/ss-vibelandia-questfest/` · bundle: `interfaces/questfest-bridge/` (`npm run build:questfest-bridge`) |
| **Lite-edge APIs** | Boarding + export JWTs (shared `api/honor-attest.js`), per-track export log, stream heartbeat (Upstash when configured) | `api/boarding.js`, `api/export.js`, `api/honor-attest.js`, `api/heartbeat.js`, `lib/pass-token.mjs`, `lib/pass-env.mjs`, `lib/upstash.mjs` |
| **SING 13 spine docs** | Omniverse resonance notice · Hell-State jettison synthesis · Precursor Paradise Game technical analysis · 13-channel roadmap · DNA/PEFF master canon · JJ whitepaper | `docs/` |
| **Juicy Juicy OFC compile** | `engine/ofc-snap.js` + lyrics + agents + vessels + tracks (hood page is narrative + whitepaper CTAs; compile is not embedded) | `engine/`, `lyrics/`, `agents/`, `vessels/`, `tracks/` |

## Sovereign Player — Fair Exchange (manual, no Stripe)

Payments are **old school on purpose**: Venmo, PayPal, or Cash App. No PSP webhooks. Counterintuitive vibe is the product.

| Tier | Price | How |
|---|---|---|
| **Master Music Catalog honor pass** | **$16.18/mo** (EGS φ) | **Not the magazine for sale** — the pass unlocks the **Holographic Reno Swamp Beats Caliente** catalog (Hero Jo's Golden Bachdoor Hit Factory). **Qualifier:** follow **[Machote Moderno Magazine on Facebook](https://www.facebook.com/profile.php?id=61587003343289)** (`VITE_MACHOTE_MAGAZINE_URL` to override). Pay on Venmo, PayPal, or Cash App → boarding: magazine-follow + honor attestation, date paid, email, rail → **device record** unlocks full play until **paid date + 30 days**. **`POST /api/boarding`** issues a signed Passenger JWT when `PASS_TOKEN_SECRET` is set. |
| **Track export / download** | **$1.61** | Same honor attestation after payment (or legacy `receipt` string on the API); `POST /api/export` records a license id, then the client saves the file |
| **Bookings** | Contact | `valetpru@gmail.com` |
| **Catalog / licensing (Reno Holographic Swamp Beats · Caliente Catalog — Hero Jo's Golden Bachdoor Hit Factory)** | Contact | `goldenbackdoorhitfactory@gmail.com` |

Passenger unlocks full video playback, Solenoid lift, 13-channel access, and catalog stream rights for advertising and projects. **Single active stream** enforced via BroadcastChannel (same tab) + `/api/heartbeat` (cross-device; Upstash Redis when env is set).

### Goldilocks Syntheverse Beehive Residency (Layer 9 · Machote members)

Exclusively for **Machote Moderno Magazine** members — targeting the **0.001%**. Invite the ecosystem back in after the fortress gets heavy: not another asset manager, a **living residency** nested inside SING 13.

| Item | Detail |
|---|---|
| **Old School Protocol** | **Interested party nodes contact [PL Taino](mailto:valetpru@gmail.com?subject=Goldilocks%20Syntheverse%20Beehive%20Residency%20%E2%80%94%20interested%20node) directly** — no corporate intake funnel. |
| **One line** | **Goldilocks Beehive Residency** offers an **EcoReset** to your place — **2-week test drive** for all parties to gauge resonance; scale to a **month**, a **season**, or **longer** when the hive hums. |
| **Calendar** | Open slots for the **rest of 2026** — fills very fast; don't hesitate if the message resonates. |
| **Walkthrough** | [`interfaces/goldilocks-beehive-residency.html`](interfaces/goldilocks-beehive-residency.html) · nest guide: [`interfaces/nesting/nest-goldilocks-beehive.html`](interfaces/nesting/nest-goldilocks-beehive.html) |

Requires magazine follow + active catalog honor pass. Bookings / residency signal: **valetpru@gmail.com**.

### Nesting ladder (9 layers)

Outermost → innermost on the hub (**YOU ARE HERE** marks Layer 9):

1. Basenet · genesis → 2. Syntheverse → 3. Sonic Singularity → 4. Wrong Side of Town → 5. Man cave mirror → 6. QUESTFEST · Puerto Reno → 7. DPH-GPU → 8. SING 13 · cloud skin → **9. Goldilocks Syntheverse Beehive Residency**

Hub ladder: [`interfaces/vibelandia-questfest.html#qf-nest-section`](interfaces/vibelandia-questfest.html#qf-nest-section). Each layer has an expanded guide under `interfaces/nesting/nest-*.html`.

### Playback layout and background audio

- **Player dock** — `PlayerDock` sits at the bottom of the Bridge column (`sp-main`), not fixed to the viewport; the page scrolls naturally and the player moves with the content.
- **Free (no members pass)** — 30s Solenoid preview on sovereign playlists; playback **pauses** when the listener switches apps, locks the screen, or backgrounds the tab (`visibilitychange`, `pagehide`, `freeze`, `blur`).
- **Paid (Machote members pass or Captain unlock)** — full play; audio **continues in background** via hidden audio handoff (audio + video), **Media Session** (lock-screen controls), and **Wake Lock** where supported (`useBackgroundPlayback`). Mobile OS limits still apply on some devices.

### Catalog playlists (Bridge Listen / Playlists)

- **Master catalog** (`pl-main`) is the full library: every upload syncs automatically; tracks are not removed from master via playlist edit (only from user playlists).
- **Your playlists** — create, rename, duplicate, delete; add from Master with optional **also add to** multi-select; per-track **Playlists** modal (checkbox all lists); **Remove** from current playlist on Listen and in editor; reorder by **press-and-hold ⋮⋮ drag** (no ↑↓ nudge buttons).
- **Sidebar** hides empty playlists unless the empty one is active, so the list stays readable on mobile.
- **Track list (Listen)** uses a responsive layout so rows do not overflow on narrow screens.

Configure handles via [`.env.example`](.env.example). **`PASS_TOKEN_SECRET`** (≥16 characters, or one of the alternates in `lib/pass-env.mjs`) is required to **sign or verify** Passenger JWTs for **`/api/boarding`**, **`/api/export`**, and heartbeat token checks when a token is sent. **Playback** with the honor monthly pass works **without** it (client-side validity only). Set it on Vercel **Production** (and Preview if you use it), and in a repo-root **`.env`** for local `vercel dev` when testing real JWTs. Never commit `.env`. Preview-only escape hatch (never Production): `QUESTFEST_ALLOW_INSECURE_PASS_SIGNING=1` — see `.env.example`.

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

Full doc: [`docs/DIGITAL_PRU_DEEP_RESEARCH_13CHANNEL_SEED_NODE_ROADMAP_2026-05-12.md`](docs/DIGITAL_PRU_DEEP_RESEARCH_13CHANNEL_SEED_NODE_ROADMAP_2026-05-12.md). Companion DNA / PEFF canon: [`docs/DIGITAL_PRU_PEFF_DNA_TRANSFORMER_MASTER_CANON_2026-05-11.md`](docs/DIGITAL_PRU_PEFF_DNA_TRANSFORMER_MASTER_CANON_2026-05-11.md). **Latest integrated paper (May 15, 2026):** Omniversal Magnetic Matrix & Protonic-DNA (**Hell-State jettison**) — [`docs/DIGITAL_PRU_OMNIVERSE_MAGNETIC_MATRIX_PROTONIC_DNA_PROTOCOL_2026-05-15.md`](docs/DIGITAL_PRU_OMNIVERSE_MAGNETIC_MATRIX_PROTONIC_DNA_PROTOCOL_2026-05-15.md). **Precursor:** Technical analysis — Paradise Game simulation — [`docs/DIGITAL_PRU_OMNIVERSE_TECHNICAL_ANALYSIS_PARADISE_GAME_SIMULATION_2026-05-15.md`](docs/DIGITAL_PRU_OMNIVERSE_TECHNICAL_ANALYSIS_PARADISE_GAME_SIMULATION_2026-05-15.md). **Frame:** [`docs/DIGITAL_PRU_RESONANCE_NOTICE_2026-05-15.md`](docs/DIGITAL_PRU_RESONANCE_NOTICE_2026-05-15.md). **Honesty boundary applies** — narrative + roadmap, not clinical or RF claims; verify space-weather with NOAA SWPC.

## Primary surfaces

- **Landing → QUESTFEST:** `/` redirects to [`/interfaces/vibelandia-questfest.html`](interfaces/vibelandia-questfest.html)
- **QUESTFEST short path:** `/questfest`
- **Nesting ladder (9 layers):** [`/interfaces/vibelandia-questfest.html#qf-nest-section`](interfaces/vibelandia-questfest.html#qf-nest-section)
- **Goldilocks Syntheverse Beehive Residency:** [`/interfaces/goldilocks-beehive-residency.html`](interfaces/goldilocks-beehive-residency.html) — manifesto, Old School Protocol (contact PL Taino), 2-week test drive terms, 2026 calendar
- **Master Music Catalog pass (checkout):** [`/interfaces/questfest-bridge/#/bridge?checkout=1`](interfaces/questfest-bridge/) — **$16.18/mo** honor pass (catalog access; magazine is the qualifier badge). Hub CTA: **Unlock Master Music Catalog · Machote followers · $16.18/mo honor pass**.
- **QUESTFEST Bridge (Sovereign Player):** [`/interfaces/questfest-bridge/#/`](interfaces/questfest-bridge/) · **`/sovereign-gate`** → same entry
- **Look at the Sun:** [`interfaces/look-at-the-sun.html`](interfaces/look-at-the-sun.html) · **Under the hood:** [`interfaces/look-under-the-hood.html`](interfaces/look-under-the-hood.html)
- **ETCon Reno Desert** (May 28–31, 2026): `/etcon` → [`interfaces/etcon-reno-desert.html`](interfaces/etcon-reno-desert.html)
- **Press releases:** `/press` → [`interfaces/press-releases.html`](interfaces/press-releases.html)
- **FractiAI hub:** [`/interfaces/fractiai.html`](interfaces/fractiai.html) · `/fractiai/digital-pru` → [`interfaces/fractiai-digital-pru.html`](interfaces/fractiai-digital-pru.html)
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

**Canonical production hostname:** **`https://psw-vibelandia-sing13.vercel.app`** only. If a duplicate project appears (for example a hostname ending in `-nine` after the wrong GitHub repo was linked in Vercel), disconnect **FractiAI/psw.vibelandia.sing9** from that project in the Vercel dashboard, delete or archive the stray project, and keep **this** repo wired to a single project whose default domain is `psw-vibelandia-sing13.vercel.app`.

**Vercel env (minimum for live boarding / export):**

| Variable | Purpose |
|---|---|
| `PASS_TOKEN_SECRET` | HMAC signing and verification for Passenger JWT (≥16 chars). Needed for **`/api/boarding`**, **`/api/export`**, and strict heartbeat verification — not for honor-only **playback** on the device. Same secret resolves `JWT_SECRET`, `AUTH_SECRET`, or `QUESTFEST_PASS_TOKEN_SECRET` if you prefer one name — see `lib/pass-env.mjs`. |
| `UPSTASH_REDIS_REST_URL` | Optional — fleet-wide stream lock |
| `UPSTASH_REDIS_REST_TOKEN` | Optional — pairs with URL above |
| `VITE_VENMO_HANDLE` etc. | Optional client overrides for payment handles |
| `VITE_MACHOTE_MAGAZINE_URL` | Optional — magazine follow link for members-pass qualifier (default: [Machote Moderno Magazine on Facebook](https://www.facebook.com/profile.php?id=61587003343289)) |

**Local dev (Bridge UI only):**

```bash
cd apps/ss-vibelandia-questfest
npm install
npm run dev
```

Open `http://localhost:5173/interfaces/questfest-bridge/#/` (matches Vite `base`). In **development** mode the app can use a **dev boarding shortcut** (`dev@local`) without calling the API.

**Local dev (Bridge + `/api/boarding` and `/api/export`):** from the **repo root**, add a `.env` with `PASS_TOKEN_SECRET=…` (see `.env.example`), then run `npx vercel dev` so the Vite app and serverless routes share one origin and real JWTs are signed.

---

**NSPFRNP ⊃ SING 13 ⊃ 9-layer nest ⊃ Goldilocks Syntheverse Beehive ⊃ Master Music Catalog ⊃ QUESTFEST 24×365 ⊃ Sovereign Player ⊃ Lite Edges → ∞⁹**
