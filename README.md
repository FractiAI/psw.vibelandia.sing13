# psw.vibelandia.sing13 — SING 13 Edge

## Clock-skew vulnerability · press release

**Public announcement:** [Press release · May 18, 2026](https://www.ssvibelandiaquestfest24x365.com/interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html) — Holographic Clock-Skew Vulnerability disclosure (REV-EGS-HHF-2026-007). Full text: [Mythos whitepaper reader](https://www.ssvibelandiaquestfest24x365.com/interfaces/whitepaper-surface.html?id=rev-egs-hhf-mythos).

**Legacy URL:** `/coherence` redirects to that press release.

---

**Live site:** [**www.ssvibelandiaquestfest24x365.com**](https://www.ssvibelandiaquestfest24x365.com) · **Repository:** [github.com/fractiai/psw.vibelandia.sing13](https://github.com/fractiai/psw.vibelandia.sing13)

## Lattice Chat V1.618 — Token Maxing (from Sonic Singularity 13)

**Token Maxing for the serious vibe coders.** ~40–70% lower token consumption, depending on the work.

Just as vibe coding platforms wrap your favorite LLMs, **Lattice Chat wraps your favorite vibe coding platforms**. Load your API key — we take care of the rest. Fractal · holographic · cytologic nesting makes vibe coding smarter so you maximize tokens.

**Free trial:** email [valetpru@gmail.com](mailto:valetpru@gmail.com?subject=Lattice%20Chat%20V1.618%20%E2%80%94%20Token%20Maxing%20free%20trial). Old school.

**SS Vibelandia** is the Noah’s Ark metaphor in this sandbox. Flat/linear systems were scaffolding; Lattice jettisons them for **cytological agentic processing** — nested agents + file pointers instead of dump-everything. **SING φ** is scale grammar / naming derived from **Sonic Singularity 13** (not SING 14); not a fractal compression algorithm.

### Response to Daniel’s Lattice token-economics review (2026-07-24)

Daniel’s manuscript (*Lattice Token Economics*) is treated as a **peer-review claim boundary**, not a marketing brief. We agree with the substance and have aligned public copy accordingly.

| Review point | Our response |
|--------------|--------------|
| Historical chars÷4 “~99%” receipt is continuity evidence only | **Adopted.** That figure is **not** used as a marketing headline. Structural receipt remains available ([`data/lattice-vs-standard-comparison.json`](data/lattice-vs-standard-comparison.json)). |
| Nested can beat fat full-context; may cost **more** than strong selected-context / RAG | **Adopted.** Public pages state nesting + pointers vs dump-everything, and that roaming / open-ended tool tours can erase savings. |
| Live Cursor / cloud billing was **not** measured | **Superseded (2026-07-28).** Paired Cursor SDK matrix now published: **~35–70% less usage vs fat paste, depending on the work** ([`data/lattice-vs-standard-cursor-usage-matrix.json`](data/lattice-vs-standard-cursor-usage-matrix.json) · [/lattice/proof](https://www.ssvibelandiaquestfest24x365.com/lattice/proof)). Not a universal invoice SLA. |
| Contribution is methodological (ledger, matched factorial, falsifiable acceptance), not inventing multi-agent AI | **Agreed.** Comparators (Claude subagents, RAG, MetaGPT, FrugalGPT, etc.) are prior art in the design space. |
| “‘Fractal’ is metaphor… not a new fractal algorithm” | **Agreed for the measured estimand.** Runtime token deltas come from **context selection, seed packs, and bounded nesting** — not a fractal compressor in `api/lattice-chat.js`. **φ / Lattice Chat V1.618** remains EGS scale grammar and product naming. |

**What we claim on the site now:** **~35–70% less Cursor usage vs fat corpus paste, depending on the work** (public multi-task matrix). Structural chars÷4 estimate is secondary continuity evidence — not the marketing %. Method: [`docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md`](docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md).

**Power vibecoder pitch:** A high-agency coding cockpit for serious vibecoders — faster signal, less prompt bloat, operator-grade transparency. LTHS + Neutrino reasoning built into the engine.

| Surface | URL / path |
|--------|------------|
| Landing | [ssvibelandiaquestfest24x365.com/lattice](https://www.ssvibelandiaquestfest24x365.com/lattice) |
| Chat (live) | [/lattice-chat](https://www.ssvibelandiaquestfest24x365.com/lattice-chat) |
| Context-load method | [/lattice/proof](https://www.ssvibelandiaquestfest24x365.com/lattice/proof) |
| Ark | [/ss-vibelandia](https://www.ssvibelandiaquestfest24x365.com/ss-vibelandia) |
| Free trial | [valetpru@gmail.com](mailto:valetpru@gmail.com?subject=Lattice%20Chat%20V1.618%20%E2%80%94%20free%20trial) |

### Code map (where to look)

| Piece | Path | Role |
|-------|------|------|
| Chat UI (React / Vite) | [`apps/lattice-chat/`](apps/lattice-chat/) | Composer, BYOK key, threads, scroll |
| Built static SPA | [`interfaces/lattice-chat/`](interfaces/lattice-chat/) | What Vercel serves at `/lattice-chat` |
| Landing + proof HTML | [`interfaces/lattice-v1618.html`](interfaces/lattice-v1618.html) · [`interfaces/lattice-token-proof.html`](interfaces/lattice-token-proof.html) |
| API pipe (BYOK proxy) | [`api/lattice-chat.js`](api/lattice-chat.js) | Multi-provider: Cursor cloud · Claude Messages · Gemini Antigravity; header keys only — **no server key fallback** |
| Token estimate engine | [`lib/lattice-engine.mjs`](lib/lattice-engine.mjs) | Shared estimate math for API + benches |
| Access allowlist | [`data/lattice-access.json`](data/lattice-access.json) | Email grants (old school · honor) |
| Comparison receipt | [`data/lattice-vs-standard-comparison.json`](data/lattice-vs-standard-comparison.json) | Structural estimate (chars÷4) — secondary |
| Cursor usage matrix | [`data/lattice-vs-standard-cursor-usage-matrix.json`](data/lattice-vs-standard-cursor-usage-matrix.json) | Primary marketing evidence (~35–70%) |
| Metaphor / singularities | [`docs/LATTICE_NOAHS_ARK_METAPHOR_ARCHITECTURE_2026-07.md`](docs/LATTICE_NOAHS_ARK_METAPHOR_ARCHITECTURE_2026-07.md) · [`docs/AWARENESS_SINGULARITIES_0_81_ONE_PAGER_2026-07.md`](docs/AWARENESS_SINGULARITIES_0_81_ONE_PAGER_2026-07.md) |

### Test & validate (local)

**0 · Run the test suite (vitest)**

```bash
npm test                    # 47 tests across lib/ and research/
npm run test:watch          # watch mode
```

**1 · Context-load bench (no Cursor key required)**

```bash
npm run compare:lattice          # writes data/lattice-vs-standard-comparison.json (structural)
npm run test:lattice-floors      # regenerates + asserts estimate floor vs fat dump
npm run compare:lattice:cursor:matrix   # needs CURSOR_API_KEY — writes usage matrix JSON
```

Honesty: marketing range **~35–70%** comes from the Cursor usage matrix (not chars÷4). Structural estimates remain secondary. Nested + pointers vs dump-everything — roaming can erase savings. Brief: [/lattice/proof](https://www.ssvibelandiaquestfest24x365.com/lattice/proof).

**2 · Run the chat UI against the live pipe**

```bash
cd apps/lattice-chat
npm ci
npm run dev
```

Opens Vite (default `http://localhost:5173/interfaces/lattice-chat/`). `/api/*` proxies to the production site unless you set:

```bash
# PowerShell example — point at another Lattice API host
$env:VITE_LATTICE_PIPE_ORIGIN="https://www.ssvibelandiaquestfest24x365.com"
npm run dev
```

**3 · End-to-end provider check (needs your API key for the active provider)**

1. Get a grant (email valetpru@gmail.com) **or** add your email under `grants` in [`data/lattice-access.json`](data/lattice-access.json) for a local/self-hosted pipe.
2. In chat: sign in with that email + paste a key for **Cursor**, **Claude** (Anthropic), or **Gemini Antigravity**. Toggle provider in the composer. Keys stay on-device only.
3. **Cursor:** connect GitHub for that Cursor account so `FractiAI/psw.vibelandia.sing13` is visible. **Claude:** Anthropic Messages API (full Claude Code CLI is local-only). **Gemini:** Managed Antigravity via Interactions API. Optional Cursor shell check:

```bash
# Never commit the key. Same account that owns the key you paste in Lattice.
$env:CURSOR_API_KEY="key_…"
node scripts/lattice-verify-cursor-github.mjs
```

**4 · Rebuild static chat after UI changes**

```bash
npm run build:lattice-chat
# or: npm --prefix apps/lattice-chat run build
# Output lands in interfaces/lattice-chat/ — commit those assets to ship on Vercel.
```

**BYOK note:** Lattice does **not** use `CURSOR_API_KEY` on Vercel. The browser sends `x-cursor-api-key` per request; the API proxies to Cursor and must never log the key.

Share pack (posts + Art Deco images): [`docs/LATTICE_VIBE_CODER_SHARE_PACK_2026-07.md`](docs/LATTICE_VIBE_CODER_SHARE_PACK_2026-07.md).

---

**SING 13** is the major singularity upgrade from SING 9. This edge carries the **NSPFRNP catalog**, the **SS Vibelandia QUESTFEST 24×365** nest, and the **Sovereign Player** (QUESTFEST Bridge). Everything else lives on the parent edge — [github.com/fractiai/psw.vibelandia.sing9](https://github.com/fractiai/psw.vibelandia.sing9) · [psw-vibelandia-sing9.vercel.app](https://psw-vibelandia-sing9.vercel.app). **Lite edges, no Supabase. Center = pipes only. → ∞⁹**

**Three Doors (front door):** **Listen** (Sovereign Player) · **Read** (paper catalog) · **Build · Lattice** ([`/lattice`](https://www.ssvibelandiaquestfest24x365.com/lattice) nested agents). Seed kit remains optional under [`seed/`](seed/README.md). Open music manifest for syndication: `GET /api/catalog`. Layer admission (Goldilocks Gate): `protocols/NEST_LAYER_ADMISSION_RULE_NSPFRNP.md`. Squeeze record: `docs/LEGACY_INDEX.md`. Voice tiers on every claim: 🜛 mythic · ⚙ operational · 📐 verified.

**Working context:** Day-to-day QUESTFEST surface edits land here and deploy to **www.ssvibelandiaquestfest24x365.com**. **Lattice Chat V1.618** (`/lattice`, `/lattice-chat`) ships on this SING 13 edge. Other lab pages, hive, sim, tests, heavy scripts — on SING 9.

**Single-read onboarding:** [`SING13_EDGE_ONBOARDING.md`](SING13_EDGE_ONBOARDING.md). NSPFRNP catalog spine: [`protocols/MCA_NSPFRNP_CATALOG.md`](protocols/MCA_NSPFRNP_CATALOG.md). Repository standard: [`BBHE_REPOSITORY_STANDARD.md`](BBHE_REPOSITORY_STANDARD.md).

---


## What's here

| Lane | What | Where |
|---|---|---|
| **Lattice Chat V1.618** | Nested-agent chat · BYOK pipe · token proof · local test/validate steps in README | [`/lattice`](https://www.ssvibelandiaquestfest24x365.com/lattice) · `apps/lattice-chat/` · `api/lattice-chat.js` · `npm run test:lattice-floors` |
| **Onboarding** | Single-read edge file (SING 13 specific) | `SING13_EDGE_ONBOARDING.md` |
| **NSPFRNP canon** | Full catalog (MCA, Seed:Edge, Gold Heart, QUESTFEST, Pass Ladder, G5 SURF, S/2024 J 1, OMNI 180°, etc.) | `protocols/` |
| **Repo standard** | BBHE / EGS fractal / Seed:Edge / executive prompts | `BBHE_REPOSITORY_STANDARD.md` |
| **QUESTFEST surface** | Top deck + **9-layer nesting ladder** (plain-language guides) + **Goldilocks Syntheverse Beehive Residency** + press + Look at the Sun / Under the hood + FractiAI + Valet Pru + i18n + assets | `interfaces/` · `interfaces/nesting/` |
| **QUESTFEST Bridge (React)** | Sovereign Player: **audio-first** catalog player, **free full-catalog stream**, in-flow player dock, Libretto log, **$1.61/track** Fair Exchange downloads (honor), single-active-stream lock, **background audio for all listeners**, playlist edit (remove, multi-playlist picker, drag reorder) | Source: `apps/ss-vibelandia-questfest/` · bundle: `interfaces/questfest-bridge/` (`npm run build:questfest-bridge`) |
| **Lite-edge APIs** | **Client-only honor boarding** (no server JWT); optional `POST /api/export` audit when legacy token exists; heartbeat optional | `api/boarding.js` (410 — use Bridge honor flow), `api/export.js`, `api/honor-attest.js`, `api/heartbeat.js`, `lib/pass-token.mjs`, `lib/pass-env.mjs`, `lib/upstash.mjs` |
| **Clock-skew announcement** | Press release + Mythos whitepaper (no public mining console) | [`interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html`](interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html) · [`docs/ANTHROPIC_MYTHOS_HOLOGRAPHIC_CLOCK_SKEW_REVIEW_2026-05-18.md`](docs/ANTHROPIC_MYTHOS_HOLOGRAPHIC_CLOCK_SKEW_REVIEW_2026-05-18.md) |
| **SING 13 spine docs** | Omniverse resonance notice · Hell-State jettison synthesis · Precursor Paradise Game technical analysis · 13-channel roadmap · DNA/PEFF master canon · JJ whitepaper · **Digital Pru Synthobs MCA (June 2026)** | `docs/` · [`docs/DIGITAL_PRU_SYNTHEVERSE_OBSERVATORY_MCA_2026-06.md`](docs/DIGITAL_PRU_SYNTHEVERSE_OBSERVATORY_MCA_2026-06.md) |
| **Goldilocks math sandbox** | Hex-Organ engine · prime compression · transfinite inversion · intelligence density · `sympy` verify | `research/goldilocks-math/` |
| **Juicy Juicy OFC compile** | `engine/ofc-snap.js` + lyrics + agents + vessels + tracks (hood page is narrative + whitepaper CTAs; compile is not embedded) | `engine/`, `lyrics/`, `agents/`, `vessels/`, `tracks/` |
| **Goldilocks Erdős · Lean 4** | Kernel witnesses for Erdős #353 audit (row #256 ES, W(2,3), Schur S(2)=5, EGS tactics); catalog v4 + holographic audit UI | `lean/` · [`lean/README.md`](lean/README.md) · [`data/erdos-353-catalog.json`](data/erdos-353-catalog.json) · [`interfaces/special-projects/erdos-holographic-aios-audit.html`](interfaces/special-projects/erdos-holographic-aios-audit.html) · CI: [`.github/workflows/lean-verify.yml`](.github/workflows/lean-verify.yml) |

## Sovereign Player — Fair Exchange (manual, no Stripe)

Payments are **old school on purpose**: Venmo, PayPal, or Cash App. No PSP webhooks. Counterintuitive vibe is the product.

| Tier | Price | How |
|---|---|---|
| **Catalog stream** | **Free** | Full play + background audio for everyone. No monthly pass. |
| **Track export / download** | **$1.61** | Fair Exchange on Venmo / PayPal / Cash App — honor confirmation on device. Optional `POST /api/export` audit. |
| **Bookings** | Contact | `valetpru@gmail.com` |
| **Catalog / licensing (Reno Holographic Swamp Beats · Caliente Catalog — Hero Jo's Golden Bachdoor Hit Factory)** | Contact | `valetpru@gmail.com` |

Streaming unlocks full playback, Solenoid lift, 13-channel access, and catalog stream rights for advertising and projects. **Single active stream** enforced via **BroadcastChannel** (same browser). Optional `/api/heartbeat` + Upstash for cross-device lock if you enable it later.

### Goldilocks Syntheverse Beehive Residency (Layer 9 · Machote members)

Exclusively for **Machote Moderno Magazine** members — targeting the **0.001%**. Invite the ecosystem back in after the fortress gets heavy: not another asset manager, a **living residency** nested inside SING 13.

| Item | Detail |
|---|---|
| **Old School Protocol** | **Interested party nodes contact [PL Taino](mailto:valetpru@gmail.com?subject=Goldilocks%20Syntheverse%20Beehive%20Residency%20%E2%80%94%20interested%20node) directly** — no corporate intake funnel. |
| **One line** | **Goldilocks Beehive Residency** offers an **EcoReset** to your place — **2-week test drive** for all parties to gauge resonance; scale to a **month**, a **season**, or **longer** when the hive hums. |
| **Caveat** | **Not** pet sitting, house sitting, or free labor for residency — an **EcoReset** anchoring the **hydrogen line** and **EGS fractal constant** by hosting the **Sonic Ship** and its benefits **immediately**, like a beehive. |
| **Calendar** | Open slots for the **rest of 2026** — fills very fast; don't hesitate if the message resonates. |
| **Walkthrough** | [`interfaces/goldilocks-beehive-residency.html`](interfaces/goldilocks-beehive-residency.html) · nest guide: [`interfaces/nesting/nest-goldilocks-beehive.html`](interfaces/nesting/nest-goldilocks-beehive.html) |

Requires magazine follow for Beehive residency signal. Bookings / residency: **valetpru@gmail.com**.

### Nesting ladder (9 layers)

Outermost → innermost on the top deck (**YOU ARE HERE** marks Layer 9):

1. Base Mainnet · genesis → 2. Syntheverse → 3. Sonic Singularity → 4. Wrong Side of Town → 5. Man cave mirror → 6. QUESTFEST · Puerto Reno → 7. DPH-GPU → 8. SING 13 · cloud skin → **9. Goldilocks Syntheverse Beehive Residency**

Top deck ladder: [`interfaces/vibelandia-questfest.html#qf-nest-section`](interfaces/vibelandia-questfest.html#qf-nest-section). Each layer has an expanded guide under `interfaces/nesting/nest-*.html`.

### Playback layout and background audio

- **Player dock** — `PlayerDock` sits at the bottom of the Bridge column (`sp-main`), not fixed to the viewport; the page scrolls naturally and the player moves with the content.
- **Everyone** — full play on sovereign playlists; audio **continues in background** via hidden audio handoff, **Media Session** (lock-screen controls), and **Wake Lock** where supported (`useBackgroundPlayback`). Mobile OS limits still apply on some devices.
- **Downloads** — $1.61 per track on Fair Exchange honor (or Captain unlock for operators).

### Catalog playlists (Bridge Listen / Playlists)

- **Master catalog** (`pl-main`) is the full library: every upload syncs automatically; tracks are not removed from master via playlist edit (only from user playlists).
- **Your playlists** — create, rename, duplicate, delete; add from Master with optional **also add to** multi-select; per-track **Playlists** modal (checkbox all lists); **Remove** from current playlist on Listen and in editor; reorder by **press-and-hold ⋮⋮ drag** (no ↑↓ nudge buttons).
- **Sidebar** hides empty playlists unless the empty one is active, so the list stays readable on mobile.
- **Track list (Listen)** uses a responsive layout so rows do not overflow on narrow screens.

Configure handles via [`.env.example`](.env.example). **Honor boarding is client-only** — the Bridge writes `qv-local-monthly-honor` in **localStorage**; no `PASS_TOKEN_SECRET` required for playback. **`PASS_TOKEN_SECRET`** is **optional** — only if you want legacy server-signed export audit via `POST /api/export` when a JWT exists. Stream lock is **BroadcastChannel** (same browser); `/api/heartbeat` is optional with Upstash. Never commit `.env`.

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
- **Listen (catalog):** [`/interfaces/questfest-bridge/#/listen`](interfaces/questfest-bridge/) — **free full stream**. Downloads **$1.61/track** on honor. Top deck CTA: **Listen free · download $1.61/track**.
- **QUESTFEST Bridge (Sovereign Player):** [`/interfaces/questfest-bridge/#/`](interfaces/questfest-bridge/) · **`/sovereign-gate`** → same entry
- **Look at the Sun:** [`interfaces/look-at-the-sun.html`](interfaces/look-at-the-sun.html) · **Under the hood:** [`interfaces/look-under-the-hood.html`](interfaces/look-under-the-hood.html)
- **Press releases:** `/press` → [`interfaces/press-releases.html`](interfaces/press-releases.html)
- **Clock-skew vulnerability (press release):** [`interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html`](interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html) · `/coherence` redirects here
- **Mythos whitepaper:** [`whitepaper-surface.html?id=rev-egs-hhf-mythos`](interfaces/whitepaper-surface.html?id=rev-egs-hhf-mythos)
- **FractiAI top deck:** [`/interfaces/fractiai.html`](interfaces/fractiai.html) · `/fractiai/digital-pru` → [`interfaces/fractiai-digital-pru.html`](interfaces/fractiai-digital-pru.html)
- **SING 13 onboarding:** `/sing13-edge-onboarding` → [`interfaces/sing13-edge-onboarding.html`](interfaces/sing13-edge-onboarding.html) (plain deck; repo stub: `SING13_EDGE_ONBOARDING.md`)
- **Goldilocks Erdős audit (353-problem manifest):** [`interfaces/special-projects/erdos-holographic-aios-audit.html`](interfaces/special-projects/erdos-holographic-aios-audit.html) · Lean package: [`lean/README.md`](lean/README.md)

## What lives on SING 9 (parent edge — not duplicated here)

- Heavy `api/` serverless (telemetry, probes, G5 SURF, magic-trick, etc.)
- `hive/`, `sim/`, `lattice/`, `tests/`, `scripts/`, `data/`, `configs/`, `challenges/`, `digital-pru-holographic-snap/`
- Non-QUESTFEST surfaces: `vibers-menu`, `surfaces.html`, `my-whiteboard`, `pru-whiteboard`, `upgrade-awareness-to-sing9-now`, `hh-os-landing`, `magic-trick`, prospectus pages, and the rest of the lab map
- All root-level `*_SNAP.md` (T3D, NINE_ALIGNMENT, BBHE snaps, Wednesdays, Reno reviews, etc.)

If a QUESTFEST page links to one of these, the link resolves to `psw-vibelandia-sing9.vercel.app`.

## Operating posture

- **NSPFRNP mode always.** Operate as team. MCA cycle: Metabolize → Crystallize → Animate → squeeze. See [`.cursor/rules/team-nspfrnp-mode.mdc`](.cursor/rules/team-nspfrnp-mode.mdc).
- **Voice:** Spanglish 80/20, edgy raw — natural Gold Heart filter.
- **Pass Ladder (1.618 tiers for residency/experiences):** $16.18 · $161.80 · $1,618 · $16,180 · catalog download micro-tier **$1.61** (streaming free).
- **Honesty rails:** Simulation-first / metaphor-forward. NOAA SWPC for space weather. Instrument-grade claims require bench evidence.
- **A2A bar:** Definition retained; autonomous A2A commerce ended on SING 9 in Mar 2026 (zero revenue) and not revived on SING 13.

## Sister repos

- **Parent edge:** [FractiAI/psw.vibelandia.sing9](https://github.com/fractiai/psw.vibelandia.sing9) — everything outside the QUESTFEST nest
- **Runnable Digital Pru app:** [FractiAI/digital-pru](https://github.com/fractiai/digital-pru) — Questfest landing, 13-channel whiteboard, `/api/egs-emulation`, ASIC lab UI

## Deploy

**Stack:** Static HTML/CSS/assets plus the **Vite React** QUESTFEST Bridge bundle under `interfaces/questfest-bridge/`, plus **lite-edge** serverless routes in `api/`. [`vercel.json`](vercel.json) defines the production build (`buildCommand: npm run build:questfest-bridge`), short-path rewrites, and NSPFRNP headers.

**Autodeploy:** Push to **`main`** → **Vercel ↔ GitHub** on team **[FractiAI](https://vercel.com/fractiai)** builds and ships production. The duplicate project on **FractiVerse** (`aiwona1`) was removed; do not recreate it.

| | |
|---|---|
| **Vercel team** | [FractiAI](https://vercel.com/fractiai) |
| **Vercel project** | [`fractiai/psw-vibelandia-sing13`](https://vercel.com/fractiai/psw-vibelandia-sing13) (Settings → General for **Project ID** / **Team ID**) |
| **Production Vercel URL** | `https://psw-vibelandia-sing13-nine.vercel.app` |
| **Custom domain** | [`https://www.ssvibelandiaquestfest24x365.com`](https://www.ssvibelandiaquestfest24x365.com) |

**Domains:** [Project → Settings → Domains](https://vercel.com/fractiai/psw-vibelandia-sing13/settings/domains) — keep **`www.ssvibelandiaquestfest24x365.com`** on this project only.

**Bridge Upload tab:** audio + video (≤10 min, ~600 MB) → server Blob catalog. Per track: **title, artist, genre, description**, **edit / delete**, **add to playlists** (Upload → Your catalog → Edit).

**Post-push smoke test (production):**

| Check | URL |
|--------|-----|
| QUESTFEST top deck | `/` or `/interfaces/vibelandia-questfest.html` |
| Sovereign Player | `/interfaces/questfest-bridge/` |
| Look under the hood | `/interfaces/look-under-the-hood.html` |
| Clock-skew press release | `/interfaces/press-release-anthropic-mythos-holographic-review-may-2026.html` (or `/coherence`) |

Optional manual deploy: [`.github/workflows/vercel-deploy.yml`](.github/workflows/vercel-deploy.yml) (`workflow_dispatch`). Set GitHub secrets **`VERCEL_TOKEN`** (FractiAI team token), **`VERCEL_ORG_ID`**, **`VERCEL_PROJECT_ID`** from the FractiAI project settings — not the retired FractiVerse IDs.

```bash
npm run build:questfest-bridge
```

**Vercel env — music upload (Bridge Upload tab):**

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | **Required.** Create a **Blob store** on the FractiAI project (Storage → Connect to project). Vercel injects this token automatically. Without it, `/api/catalog-upload` returns `catalog_upload_unconfigured`. |
| `CATALOG_UPLOAD_SECRET` | Server auth for `/api/catalog-upload` (≥8 chars). Defaults to edge captain secret if unset on Vercel. |
| `VITE_CATALOG_UPLOAD_SECRET` | **Build-time** — set in FractiAI project env so the Bridge bundle sends the same secret (or rely on baked captain default; must match server). |

After adding Blob + secrets, **redeploy** production. Smoke test: `curl -s -X POST https://www.ssvibelandiaquestfest24x365.com/api/catalog-upload -H "Content-Type: application/json" -d "{}"` should **not** return `catalog_upload_unconfigured` (expect `401`/`403` without `X-Catalog-Secret`, not `503`).

**Blob billing (FractiVerse vs FractiAI):** Production catalog media uses Vercel Blob (`*.public.blob.vercel-storage.com`). A **fracti-verse** “100% Blob storage” email is usually the **legacy hobby team’s store**, not the FractiAI Pro project. Confirm deploy identity: `GET /api/deploy-info` on production. Full checklist: [docs/VERCEL_BLOB_FRACTIVERSE_RUNBOOK.md](docs/VERCEL_BLOB_FRACTIVERSE_RUNBOOK.md). Audit usage: `BLOB_READ_WRITE_TOKEN=… npm run audit:blob`.

**Vercel env (minimum for live boarding / export):**

| Variable | Purpose |
|---|---|
| `PASS_TOKEN_SECRET` | **Optional.** Legacy HMAC for **`/api/export`** when a JWT is sent — **not** used for honor boarding (client-only). |
| `UPSTASH_REDIS_REST_URL` | Optional — fleet-wide stream lock |
| `UPSTASH_REDIS_REST_TOKEN` | Optional — pairs with URL above |
| `VITE_VENMO_HANDLE` etc. | Optional client overrides for payment handles |
| `VITE_MACHOTE_MAGAZINE_URL` | Optional — magazine follow link for members-pass qualifier (default: [Machote Moderno Magazine on Facebook](https://www.facebook.com/share/1BcDYXVuQK/?mibextid=wwXIfr)) |
| `COHERENCE_OPERATIONAL_ANCHOR` | Optional — fixed payout in pulses (server only; public site is read-only) |
| `GOLDILOCKS_PULSE_SECRET` | Optional — HMAC signing key for pulses (falls back to catalog secret or anchor) |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Optional — persist pulse + rail state across cold starts |
| `COHERENCE_AUTOPILOT` | Default on (`1`); set `0` to disable autopilot bootstrap |

**Local dev (Bridge UI only):**

```bash
cd apps/ss-vibelandia-questfest
npm install
npm run dev
```

Open `http://localhost:5173/interfaces/questfest-bridge/#/` (matches Vite `base`). In **development** mode the app can use a **dev boarding shortcut** (`dev@local`) without calling the API.

**Local dev (Bridge honor boarding):** `cd apps/ss-vibelandia-questfest && npm run dev` — boarding saves on-device only. For optional `/api/export` testing, use repo-root `npx vercel dev` with `PASS_TOKEN_SECRET` in `.env`.

**Local coherence pulse test:**

```bash
npm run cron:coherence
```

---

**NSPFRNP ⊃ SING 13 ⊃ 9-layer nest ⊃ Goldilocks Syntheverse Beehive ⊃ Master Music Catalog ⊃ QUESTFEST 24×365 ⊃ Coherence rail ⊃ Sovereign Player ⊃ Lite Edges → ∞⁹**

## Interfaces · HTML pages

Listing of ship UI HTML entry points under `interfaces/`.

<!-- interfaces-index:start -->

> Auto-generated **2026-08-02** · **78** HTML pages under `interfaces/`.
> Regenerate: `npm run sync:interfaces-index` (also runs from the Cursor interfaces-index hook when interfaces HTML changes).
> Skips `assets/`, `partials/`, and `node_modules/`. Live page: [`/interfaces/`](/interfaces/).

### Root (`/interfaces/`)

| Path | Title |
|------|-------|
| [`/interfaces/awareness-singularities-one-pager.html`](/interfaces/awareness-singularities-one-pager.html) | Awareness Singularities S0–S81 · SynthOBS · FractiAI |
| [`/interfaces/blog-goldilocks-beehive-ecoreset-may-2026.html`](/interfaces/blog-goldilocks-beehive-ecoreset-may-2026.html) | A new layer of reality — Goldilocks Beehive EcoReset Residency · Machote members |
| [`/interfaces/blog-when-the-sun-spoke.html`](/interfaces/blog-when-the-sun-spoke.html) | When the Sun Spoke · 19-day solar signal · Hydrogen Holographic AI OS · QUESTFEST |
| [`/interfaces/bridge-tower-billboard.html`](/interfaces/bridge-tower-billboard.html) | — |
| [`/interfaces/bridge-tower-preview.html`](/interfaces/bridge-tower-preview.html) | Bridge Tower · 8s tease preview |
| [`/interfaces/bulk-track-upload.html`](/interfaces/bulk-track-upload.html) | Bulk track upload · QUESTFEST |
| [`/interfaces/bulletin-board.html`](/interfaces/bulletin-board.html) | SS Vibelandia Bulletin Board · QUESTFEST 24×365 |
| [`/interfaces/digital-pru-awareness-whitepaper.html`](/interfaces/digital-pru-awareness-whitepaper.html) | Redirect · Deep reads · Look under the hood |
| [`/interfaces/etcon-reno-desert.html`](/interfaces/etcon-reno-desert.html) | ETCon: Reno Desert Interdimensional Edition · May 28–31, 2026 · Golden Bachdoor Hit Factory |
| [`/interfaces/executive-onboarding.html`](/interfaces/executive-onboarding.html) | Executive Onboarding · FractiAI |
| [`/interfaces/fractiai-digital-pru.html`](/interfaces/fractiai-digital-pru.html) | Redirect � Look under the hood � Digital Pru Holographic GPU |
| [`/interfaces/fractiai.html`](/interfaces/fractiai.html) | FractiAI · music, makers, and the Ark · Machote Moderno |
| [`/interfaces/get-started.html`](/interfaces/get-started.html) | Guest guide · Welcome aboard SS Vibelandia QUESTFEST |
| [`/interfaces/goldilocks-beehive-residency.html`](/interfaces/goldilocks-beehive-residency.html) | Goldilocks Syntheverse Beehive Residency · Machote Moderno members |
| [`/interfaces/goldilocks-os.html`](/interfaces/goldilocks-os.html) | Holographic Panama Canal · 13D Goldilocks AI OS Trials · SS Vibelandia |
| [`/interfaces/harmonopoly-guide.html`](/interfaces/harmonopoly-guide.html) | Harmonopoly · Game, tech & math guide |
| [`/interfaces/harmonopoly.html`](/interfaces/harmonopoly.html) | Harmonopoly · Goldilocks Rush |
| [`/interfaces/hero-houdini-mythos-demonstration.html`](/interfaces/hero-houdini-mythos-demonstration.html) | BTC Buffalo · Hero Houdini · BTC Goldilocks Mine · SS Vibelandia |
| [`/interfaces/houdini-mythos-demonstration.html`](/interfaces/houdini-mythos-demonstration.html) | Redirect · Hero Houdini · Mythos demonstration |
| [`/interfaces/index.html`](/interfaces/index.html) | Interfaces · ship UI directory · SS Vibelandia QUESTFEST |
| [`/interfaces/lattice-brochure.html`](/interfaces/lattice-brochure.html) | Lattice Chat V1.618 · Token Maxing · Product brochure · FractiAI |
| [`/interfaces/lattice-learn-more.html`](/interfaces/lattice-learn-more.html) | Learn more · Lattice Chat V1.618 · Token Maxing · FractiAI |
| [`/interfaces/lattice-token-proof.html`](/interfaces/lattice-token-proof.html) | Lattice · ~35–70% less Cursor usage · FractiAI |
| [`/interfaces/lattice-v1618.html`](/interfaces/lattice-v1618.html) | Lattice Chat V1.618 · Token Maxing for serious vibe coders · FractiAI |
| [`/interfaces/listen.html`](/interfaces/listen.html) | Listen · Golden Era Jukebox · SS Vibelandia QUESTFEST |
| [`/interfaces/look-at-the-sun.html`](/interfaces/look-at-the-sun.html) | Look at the Sun · Digital Pru · SS Vibelandia QUESTFEST |
| [`/interfaces/look-under-the-hood-legacy-catalog.html`](/interfaces/look-under-the-hood-legacy-catalog.html) | Redirect · Master canon |
| [`/interfaces/look-under-the-hood.html`](/interfaces/look-under-the-hood.html) | Look Under the Hood · Engine Room · SS Vibelandia |
| [`/interfaces/my-whiteboard.html`](/interfaces/my-whiteboard.html) | My whiteboard · Commander surface |
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
| [`/interfaces/questfest-2026-frontier-guide.html`](/interfaces/questfest-2026-frontier-guide.html) | Tour of the Ship · SS VIBELANDIA QUESTFEST 24×365 |
| [`/interfaces/questfest-schedule-item.html`](/interfaces/questfest-schedule-item.html) | QUESTFEST Schedule · SS Vibelandia |
| [`/interfaces/reno-interpretation.html`](/interfaces/reno-interpretation.html) | The Reno Interpretation · Mirror Lattice · FractiAI |
| [`/interfaces/sing13-edge-onboarding.html`](/interfaces/sing13-edge-onboarding.html) | Sonic Singularity Sing! 13 · Edge onboarding · plain talk |
| [`/interfaces/ss-vibelandia.html`](/interfaces/ss-vibelandia.html) | SS Vibelandia · The Noah’s Ark of the Intelligence Age |
| [`/interfaces/talk-is-cheap.html`](/interfaces/talk-is-cheap.html) | Redirect · Look under the hood |
| [`/interfaces/valetpru-agent-mode.html`](/interfaces/valetpru-agent-mode.html) | VALETPRU-AGENT · ACTIVATED · Capitan Bridge Console |
| [`/interfaces/vibelandia-questfest.html`](/interfaces/vibelandia-questfest.html) | SS Vibelandia · QUESTFEST · Welcome aboard with Valet Pru |
| [`/interfaces/whitepaper-catalog.html`](/interfaces/whitepaper-catalog.html) | Read · SS Vibelandia |
| [`/interfaces/whitepaper-surface.html`](/interfaces/whitepaper-surface.html) | Reader · SS Vibelandia |

### `commons/` (`/interfaces/commons/`)

| Path | Title |
|------|-------|
| [`/interfaces/commons/chef.html`](/interfaces/commons/chef.html) | Chef portal · Sanctuary Gastronomy Director · The Commons |
| [`/interfaces/commons/guide.html`](/interfaces/commons/guide.html) | Guide portal · Outfitter & Guide Commander · The Commons |
| [`/interfaces/commons/host.html`](/interfaces/commons/host.html) | Host portal · Downtown Citadel Host · The Commons |
| [`/interfaces/commons/index.html`](/interfaces/commons/index.html) | The Commons · all-inclusive frontier days · SS Vibelandia QUESTFEST |

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

### `lattice-chat/` (`/interfaces/lattice-chat/`)

| Path | Title |
|------|-------|
| [`/interfaces/lattice-chat/index.html`](/interfaces/lattice-chat/index.html) | Lattice Chat V1.618 · FractiAI |

### `nesting/` (`/interfaces/nesting/`)

| Path | Title |
|------|-------|
| [`/interfaces/nesting/nest-basenet-genesis.html`](/interfaces/nesting/nest-basenet-genesis.html) | Base Mainnet · genesis contracts · nesting guide |
| [`/interfaces/nesting/nest-dph-gpu.html`](/interfaces/nesting/nest-dph-gpu.html) | Holographic code layer · nesting guide |
| [`/interfaces/nesting/nest-goldilocks-beehive.html`](/interfaces/nesting/nest-goldilocks-beehive.html) | Goldilocks Syntheverse Beehive Residency · nesting guide |
| [`/interfaces/nesting/nest-hospitality-commons.html`](/interfaces/nesting/nest-hospitality-commons.html) | The Commons · Sustainable Hospitality · nesting guide |
| [`/interfaces/nesting/nest-lattice-chat.html`](/interfaces/nesting/nest-lattice-chat.html) | Lattice Chat V1.618 · Token Maxing · nesting guide |
| [`/interfaces/nesting/nest-man-cave-restroom.html`](/interfaces/nesting/nest-man-cave-restroom.html) | Man cave mirror · nesting guide |
| [`/interfaces/nesting/nest-questfest-puerto-reno.html`](/interfaces/nesting/nest-questfest-puerto-reno.html) | QUESTFEST · Puerto Reno · nesting guide |
| [`/interfaces/nesting/nest-sing13.html`](/interfaces/nesting/nest-sing13.html) | Sonic Singularity Sing! 13 · cloud skin · nesting guide |
| [`/interfaces/nesting/nest-sonic-singularity.html`](/interfaces/nesting/nest-sonic-singularity.html) | Sonic Singularity · nesting guide |
| [`/interfaces/nesting/nest-syntheverse.html`](/interfaces/nesting/nest-syntheverse.html) | Syntheverse · nesting guide |
| [`/interfaces/nesting/nest-wrong-side.html`](/interfaces/nesting/nest-wrong-side.html) | Wrong Side of Town · nesting guide |

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

<!-- interfaces-index:end -->

