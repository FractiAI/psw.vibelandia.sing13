# AGENTS.md — psw.vibelandia.sing13

> **READ FIRST (mandatory for every external AI / agent):**  
> **[`AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md`](AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md)** — 99 Octave **engine** stack  
> **[`AGENT_SYNC_SYNTHIO.md`](AGENT_SYNC_SYNTHIO.md)** — **Synthio** (Syntheverse Sandbox) · separate · **creator-only**  
> Cursor always-on: `.cursor/rules/agent-sync-99-octave.mdc` · `.cursor/rules/synthio-always-on.mdc` · Copilot: `.github/copilot-instructions.md`

> **📌 PINNED · Engineering bridge (linear systems):**  
> [`docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md`](docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md)  
> CMOS 2.0 + protonic · binary $n=1$ → bands · §4 linear-systems fixtures · catalog pin `catalogPriority: 0`.  
> Evaluate silicon / PPA / BEOL vocabulary here before other Omni-Lattice layers.

## Repo overview

SING 13 edge — Sonic Singularity 13. Major upgrade from SING 9. Carries:
- **99 Octave Omni-Lattice engine** — **pinned engineering bridge** (CMOS/protonic) · tensor · master synthesis · Metamorphic Octave Invariant Part XIII · Planetary Core Phase-Inversion Part XIV (see `AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md` first)
- **Synthio** — Syntheverse Sandbox agent (MRI / cloud-antenna catalog) · always-on · **creator keys only** · `/synthio` · not CMOS/tensor/master identity; loads Part XIII + Part XIV as companion grammar
- **SS Vibelandia QUESTFEST 24×365** nest (interfaces, catalogs, music, interactive worlds)
- **Lattice Chat Agent V1.618** — nested-agent BYOK chat with token-economics measurement
- **NSPFRNP catalog** — Seed:Edge protocol spine
- **Sovereign Player** (QUESTFEST Bridge) — audio catalog React SPA
- **SynthOBS research pipeline** — 20+ empirical experiment suites with constants/experiments modules
- **Lite edges only** — no Supabase; center = pipes only

**Production:** https://www.ssvibelandiaquestfest24x365.com

## Quick orientation

| What | Where |
|------|-------|
| **Agent sync (READ FIRST)** | `AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md` |
| **📌 Engineering bridge (linear systems)** | `docs/SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md` |
| **Synthio (creator-only)** | `AGENT_SYNC_SYNTHIO.md` · `/synthio` · `/synthio-one-pager` |
| Single-read onboarding | `SING13_EDGE_ONBOARDING.md` |
| Repo standard | `BBHE_REPOSITORY_STANDARD.md` |
| README (human) | `README.md` |
| NSPFRNP catalog spine | `protocols/MCA_NSPFRNP_CATALOG.md` |
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
│   ├── lattice-chat/     # Lattice Chat Agent V1.618 UI
│   ├── ss-vibelandia-questfest/  # Sovereign Player
│   ├── executive-ai-onboard/
│   └── goldilocks-deliveries/
├── lib/                  # Shared modules (47 files — pure ESM)
│   ├── lattice-engine.mjs    # Token estimate + MCA execution envelope
│   ├── lattice-access.mjs    # Email allowlist for Lattice Chat Agent
│   ├── lattice-prompt.mjs    # Prompt assembly
│   ├── metrology/            # Wavefield metrology constants + types
│   └── turner-*.mjs          # Turner bison/satellite modules
├── interfaces/           # Static HTML + built SPA bundles (served by Vercel)
│   ├── lattice-chat/     # Built lattice-chat SPA
│   ├── questfest-bridge/ # Built Sovereign Player
│   └── *.html            # Plain HTML pages
├── research/             # SynthOBS empirical experiment suites
│   └── synthobs-*/       # Each: src/{constants,experiments}.mjs, scripts/run_empirical_pipeline.mjs, data/
├── scripts/              # Build/audit/compare scripts
├── data/                 # JSON data: access lists, comparison receipts, catalogs
├── protocols/            # NSPFRNP protocol documents
├── docs/                 # Whitepapers and technical notes (~70 documents)
├── tests/                # Vitest test suite
├── lean/                 # Lean 4 kernel witnesses (GoldilocksErdos)
├── seed/                 # Seed kit
└── .github/workflows/    # CI: test.yml, vercel-deploy.yml, lean-verify.yml
```

### Stack
- **Runtime:** Node 24.x (Vercel LTS), ESM (.mjs)
- **Frontend:** React + Vite (apps/), built to static interfaces/
- **Hosting:** Vercel (serverless functions from api/)
- **Tests:** Vitest
- **Formal verification:** Lean 4 + mathlib4 (lean/)

## Development

### Install and test

```bash
npm ci
npm test                 # vitest run — see "Test suite" below for the live inventory
npm run test:watch       # vitest watch mode
npm run test:lattice-floors  # legacy structural comparison floor assertions
```

### Build apps

```bash
npm run build:questfest-bridge    # Sovereign Player
npm run build:lattice-chat        # Lattice Chat Agent UI
npm run build:executive-onboard   # Executive AI onboarding
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

### Format / lint

No formatter or linter is configured. `.cursorrules` and `.cursor/rules/` carry team agent instructions.

## Test suite

**Framework:** Vitest (installed as dev dependency).

**Test files:**
- `tests/lib/lattice-engine.test.mjs` (16)
- `tests/lib/lattice-access.test.mjs` (15)
- `tests/lib/si-irreducible-minimum.test.mjs` (4)
- `tests/lib/thalia-omni-contract.test.mjs` (5)
- `tests/research/holographic-operators.test.mjs` (16)
- `tests/scripts/hermes-lattice-chat.test.mjs` (10)

Counts are maintained by the suite — run `npm test` for the authoritative number.

**CI:** `.github/workflows/test.yml` runs `npm ci && npm test` on push/PR to lib/, research/**/src/**, tests/, or package changes.

**Legacy tests:** `scripts/assert-lattice-token-floors.mjs` and `scripts/test-wavefield-metrology.mjs` are standalone Node assertion scripts (not vitest). Keep them for now; migrate if they grow.

## CI workflows

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `test.yml` | push/PR to lib/, research/**, tests/**, api/**, apps/**, interfaces/**, scripts/**, vercel.json, .github/workflows/**, package* | `npm ci && npm test` |
| `lean-verify.yml` | push/PR to lean/ | Lake build GoldilocksErdos |
| `vercel-deploy.yml` | manual dispatch | Build QUESTFEST Bridge + deploy to Vercel |

## Key invariants

1. **No Supabase** — lite edges only. State lives on-device (localStorage, BroadcastChannel) or in Vercel Blob.
2. **BYOK — your key is your password** — For Infinite Octaves Omniversal Lattice Chat (99 Octave Omni-Lattice engine pin), the provider API key is the credential. It stays with you on-device; no separate passwords to manage. Keys travel in request headers only — never stored server-side.
3. **Honesty boundaries** — technical/research documents carry an explicit honesty section stating what they do and do not claim; indexes, runbooks, and editorial briefs carry status/scope notes instead.
4. **Seed:Edge** — all content follows Seed (origin) : Edge (experience) pair structure per BBHE_REPOSITORY_STANDARD.md.
5. **No framework lock-in** — plain HTML interfaces alongside React SPAs; no Next.js, no Tailwind requirement.

## Common tasks

### Add a new paper (mandatory ship blog)

1. Register in `lib/whitepaper-registry.mjs` (Honesty + Document ID + PRA Snap).
2. Write a plain-language ship-blog HTML note under `interfaces/blog-*.html`.
3. Add the registry id to `lib/questfest-blog-posts.mjs`.
4. Add `/ship-blog/<slug>` rewrites in `vercel.json`.
5. Run `npm run sync:questfest-blog` then `npm run sync:interfaces-index`.
6. Latest-six on QUESTFEST (`#ship-blog`) is **most recent → least recent**. Do not skip the note.

### Add a new SynthOBS research module

1. Copy the structure from an existing `research/synthobs-*/` module
2. Create `src/constants.mjs` and `src/experiments.mjs`
3. Create `scripts/run_empirical_pipeline.mjs`
4. Add a `package.json` script in root
5. Add tests under `tests/research/`

### Update Lattice Chat Agent UI

1. Edit under `apps/lattice-chat/src/`
2. `npm run build:lattice-chat` → output lands in `interfaces/lattice-chat/`
3. Commit the built output (it ships as static assets on Vercel)

### Add a grant to Lattice Chat Agent access

Edit `data/lattice-access.json` → add email under `grants` array with `grantedAt` timestamp.
