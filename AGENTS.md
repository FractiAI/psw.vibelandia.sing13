# AGENTS.md — psw.vibelandia.sing13

## Repo overview

SING 13 edge — Sonic Singularity 13. Major upgrade from SING 9. Carries:
- **SS Vibelandia QUESTFEST 24×365** nest (interfaces, catalogs, music, interactive worlds)
- **Lattice Chat V1.618** — nested-agent BYOK chat with token-economics measurement
- **NSPFRNP catalog** — Seed:Edge protocol spine
- **Sovereign Player** (QUESTFEST Bridge) — audio catalog React SPA
- **SynthOBS research pipeline** — empirical experiment suites with constants/experiments modules
- **Lite edges only** — no Supabase; center = pipes only

**Production:** https://www.ssvibelandiaquestfest24x365.com

## Quick orientation

| What | Where |
|------|-------|
| Single-read onboarding | `SING13_EDGE_ONBOARDING.md` |
| Repo standard | `BBHE_REPOSITORY_STANDARD.md` |
| README (human) | `README.md` |
| NSPFRNP catalog spine | `protocols/MCA_NSPFRNP_CATALOG.md` |
| Documentation hub | `docs/` — see `docs/AGENTS.md` for master index |
| Legacy index | `docs/LEGACY_INDEX.md` |
| Vercel config | `vercel.json` |

## Architecture

### Directory map

```
├── api/                  # Vercel serverless functions (Node ESM)
│   ├── lattice-chat.js   # BYOK proxy: Cursor / Claude / Gemini
│   ├── catalog*.js       # Catalog CRUD + playlist
│   └── *.js              # CRON rails, telemetry, exports, etc.
├── apps/                 # React/Vite SPAs (built → interfaces/)
│   ├── lattice-chat/     # Lattice Chat V1.618 UI
│   ├── ss-vibelandia-questfest/  # Sovereign Player
│   └── goldilocks-deliveries/
├── lib/                  # Shared modules (pure ESM)
│   ├── lattice-engine.mjs    # Token estimate + MCA execution envelope
│   ├── lattice-access.mjs    # Email allowlist for Lattice Chat
│   ├── lattice-prompt.mjs    # Prompt assembly
│   └── metrology/            # Wavefield metrology constants + types
├── interfaces/           # Static HTML + built SPA bundles (served by Vercel)
│   ├── lattice-chat/     # Built lattice-chat SPA
│   ├── questfest-bridge/ # Built Sovereign Player
│   └── *.html            # Plain HTML pages
├── research/             # SynthOBS empirical experiment suites
│   └── synthobs-*/       # Each: src/{constants,experiments}.mjs, scripts/, data/
├── scripts/              # Build/audit/compare scripts
├── data/                 # JSON data: access lists, comparison receipts, catalogs
├── protocols/            # NSPFRNP protocol documents
├── docs/                 # Documentation hub — 51 papers across 8 domains
│   ├── synthobs/         # SynthOBS: biological, EGS, holographic, omni-lattice, magnetism
│   ├── digital-pru/      # Digital Pru: omniverse, dna-transformer, cross-cutting
│   ├── syntheverse/      # Syntheverse Observatory
│   ├── goldilocks/       # Goldilocks math & protocol
│   ├── fractiai/         # FractiAI core research
│   ├── turner/           # Turner response papers
│   ├── lattice-chat/     # Lattice Chat V1.618 (staging)
│   └── whitepapers/      # Stand-alone formal whitepapers
├── tests/                # Vitest test suite
├── lean/                 # Lean 4 kernel witnesses (GoldilocksErdos)
├── seed/                 # Seed kit
└── .github/workflows/    # CI: test.yml, vercel-deploy.yml, lean-verify.yml
```

### Stack
- **Runtime:** Node ≥22.13.0, ESM (.mjs)
- **Frontend:** React + Vite (apps/), built to static interfaces/
- **Hosting:** Vercel (serverless functions from api/)
- **Tests:** Vitest
- **Formal verification:** Lean 4 + mathlib4 (lean/)

## Development

### Install and test

```bash
npm ci
npm test                 # vitest run
npm run test:watch       # vitest watch mode
npm run test:lattice-floors  # structural comparison floor assertions
```

### Build apps

```bash
npm run build:questfest-bridge    # Sovereign Player
npm run build:lattice-chat        # Lattice Chat UI
```

### Lattice comparison (structural estimates)

```bash
npm run compare:lattice                  # chars÷4 structural estimate
npm run compare:lattice:cursor:matrix    # Cursor usage matrix (needs CURSOR_API_KEY)
npm run test:lattice-floors              # regenerates + asserts floor vs fat dump
```

### Run research pipelines

Each SynthOBS experiment suite has a `run_empirical_pipeline.mjs`:
```bash
npm run research:synthobs-holographic-operators
npm run research:synthobs-omni-lattice-unification
# ... etc (see package.json scripts for the full list)
```

## Documentation conventions

All documents under `docs/` follow the **NSPFRNP protocol** and **BBHE Repository Standard**:
- **Honesty boundary** — every doc has a tiered honesty table
- **Seed:Edge** — origin (Seed) : experience (Edge) pair structure
- **Voice tiers** — 🜛 mythic · ⚙ operational · 📐 verified
- **Filenames** — `UPPERCASE_SCREAMING_SNAKE` with `YYYY-MM-DD` date suffix

For the full documentation index, see [`docs/AGENTS.md`](docs/AGENTS.md). Each domain subfolder carries its own `AGENTS.md` (conventions + inventory) and `README.md` (quick nav).

## Key invariants

1. **No Supabase** — lite edges only. State lives on-device (localStorage, BroadcastChannel) or in Vercel Blob.
2. **BYOK** — Lattice Chat never stores API keys server-side. Keys travel in request headers only.
3. **Honesty boundaries** — every doc carries an explicit honesty section stating what it does and does not claim.
4. **Seed:Edge** — all content follows Seed (origin) : Edge (experience) pair structure per BBHE_REPOSITORY_STANDARD.md.
5. **No framework lock-in** — plain HTML interfaces alongside React SPAs; no Next.js, no Tailwind requirement.
6. **Documentation organized by domain** — `docs/` uses 8 topic subdirectories with AGENTS.md + README.md at every level.

## Common tasks

### Add a new doc to docs/

1. Place the `.md` in the appropriate domain subdirectory under `docs/`
2. Include the NSPFRNP honesty boundary table
3. Add a row to the domain `AGENTS.md` file inventory
4. Add a row to `docs/AGENTS.md` master inventory
5. Register in `docs/LEGACY_INDEX.md` if superseding an existing doc

### Add a new SynthOBS research module

1. Copy the structure from an existing `research/synthobs-*/` module
2. Create `src/constants.mjs` and `src/experiments.mjs`
3. Create `scripts/run_empirical_pipeline.mjs`
4. Add a `package.json` script in root
5. Add tests under `tests/research/`

### Update Lattice Chat UI

1. Edit under `apps/lattice-chat/src/`
2. `npm run build:lattice-chat` → output lands in `interfaces/lattice-chat/`
3. Commit the built output (it ships as static assets on Vercel)

### Add a grant to Lattice Chat access

Edit `data/lattice-access.json` → add email under `grants` array with `grantedAt` timestamp.

---

**NSPFRNP ⊃ SING 13 ⊃ 9-layer nest ⊃ docs/ hub → ∞⁹**