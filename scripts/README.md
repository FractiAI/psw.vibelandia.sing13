# Scripts — psw.vibelandia.sing13

Node/Python/PowerShell operational scripts for the SING 13 edge. Testable logic
lives in [`lib/`](../lib/) (`lib/*.mjs`); scripts set paths, parse args, and call
module entrypoints. Browser assets live in [`interfaces/scripts/`](../interfaces/scripts/README.md).

## Inventory

| Script | Purpose | Delegates to | Command |
|---|---|---|---|
| `assert-lattice-token-floors.mjs` | Regenerate the lattice-vs-fat-dump structural comparison and assert token floors | self-contained (writes `data/lattice-vs-standard-comparison.json`) | `npm run test:lattice-floors` |
| `blob-storage-audit.mjs` | Audit Vercel Blob usage for the QUESTFEST catalog store | self-contained | `npm run audit:blob` |
| `build-catalog-from-tracks.mjs` | Build `media/catalog/catalog.json` from files in `media/catalog/tracks/` | self-contained | `npm run build:catalog` |
| `build-erdos-catalog.mjs` | Thin wrapper — build `data/erdos-353-catalog.json` (Erdős 353 manifest) | `lib/erdos-catalog.mjs` | `npm run build:erdos-catalog` |
| `build-look-at-the-sun-study.mjs` | Thin wrapper — build `interfaces/look-at-the-sun-study.json` from public NOAA/SILSO/GitHub data | `lib/look-at-the-sun-study.mjs` | `npm run build:look-at-the-sun-study` (also invoked by `run-recursive-attention-causality.mjs`) |
| `capture-websdr-iq.mjs` | Batch-capture one OpenWebRX frame into `data/websdr-latest.json` | `lib/openwebrx-ingest.mjs` | `npm run capture:websdr` |
| `crystallize-synthobs-paper-compliance.mjs` | MCA Crystallize — inject PRA Snap compliance (honesty + doc ID + operator) into registered papers | `lib/whitepaper-registry.mjs`, `lib/synthobs-agent-attribution.mjs`, `lib/synthobs-peer-review-audit.mjs` | `npm run crystallize:papers` |
| `fetch-turner-osm-fences.mjs` | One-shot: pull OSM fence ways for all Turner pastures → `data/turner-osm-fence-cache.json` | `lib/turner-radar-fusion.mjs`, `lib/turner-osm-fence-lines.mjs` | `node scripts/fetch-turner-osm-fences.mjs` |
| `fix-holographic-track.mjs` | One-off catalog track fixup against the production catalog API | self-contained (requires `CATALOG_UPLOAD_SECRET`) | `CATALOG_UPLOAD_SECRET=… node scripts/fix-holographic-track.mjs` |
| `generate-deterministic-lattice-followup.mjs` | Dependency-free secondary control receipt for the follow-up manuscript (deterministic fixtures, no provider evidence) | `lib/openrouter-experiment.mjs` | `npm run manuscript:followup` |
| `generate-manuscript-figures.mjs` | Render manuscript figures from the committed receipt → `docs/manuscript/figures/` | self-contained (reads `lib`-written receipt) | `npm run manuscript:figures` |
| `generate-manuscript-stats.mjs` | Statistics table from the committed receipt → manuscript stats | `lib/openrouter-experiment.mjs` (`statsRow`) | `npm run manuscript:stats` |
| `harmonopoly-token-sim.mjs` | Harmonopoly flat vs nested agent token simulation (100k players, model only) | self-contained | `node scripts/harmonopoly-token-sim.mjs` |
| `heal-dead-catalog-src.mjs` | HEAD-check server catalog `src` URLs; retarget 404s to sibling tracks | self-contained | `node scripts/heal-dead-catalog-src.mjs` |
| `hermes-lattice-chat.mjs` | Hermes CLI — talk to the Lattice Chat Agent V1.618 API from the terminal | self-contained | `npm run hermes:lattice-chat` |
| `inject-site-quicklinks.mjs` | Inject shared site-quicklinks markup into interfaces HTML pages | self-contained | `node scripts/inject-site-quicklinks.mjs` |
| `lattice-grant-access.mjs` | Grant Lattice guest access for one month (`data/lattice-access.json`) | `lib/lattice-access.mjs` | `node scripts/lattice-grant-access.mjs <email>` |
| `lattice-verify-cursor-github.mjs` | Verify `CURSOR_API_KEY` can see this repo via Cursor GitHub | self-contained | `node scripts/lattice-verify-cursor-github.mjs` |
| `lattice-vs-standard-comparison.mjs` | Lattice vs fat-dump structural estimate (chars÷4) | `lib/lattice-engine.mjs` | `npm run compare:lattice` |
| `lattice-vs-standard-cursor-usage.mjs` | Real Cursor usage bench: Lattice-style prompt vs fat corpus dump | `lib/lattice-prompt.mjs` | `npm run compare:lattice:cursor` |
| `lattice-vs-standard-cursor-usage-matrix.mjs` | Multi-task real Cursor usage matrix across work types | `lib/lattice-prompt.mjs` | `npm run compare:lattice:cursor:matrix` |
| `lattice-vs-standard-openrouter-usage.mjs` | Paired Lattice-vs-plain OpenRouter experiment: accuracy, latency, tokens, statistics | `lib/openrouter-bench.mjs`, `lib/openrouter-experiment.mjs` | `npm run compare:lattice:openrouter` / `experiment:openrouter` |
| `migrate-video-to-audio.mjs` | Convert server catalog video tracks → MP3 + cover JPEG (`posterSrc`) | self-contained | `npm run migrate:catalog-audio` |
| `playback-smoke.mjs` | Smoke test: questfest bridge loads catalog and audio plays after a list tap | self-contained (drives a headless browser) | `node scripts/playback-smoke.mjs` |
| `probe-websdr-endpoints.mjs` | Probe public OpenWebRX WebSocket endpoints for a first binary frame | self-contained | `node scripts/probe-websdr-endpoints.mjs` |
| `reconcile-catalog.mjs` | Repair the Sonic Singularity master catalog from the Redis upload index + orphan blobs | `lib/catalog-server.mjs` (`reconcileCatalogFully`) | `npm run reconcile:catalog` |
| `render-bridge-tower-tease.ps1` | Render 8s animated MP4 for the Bridge tower billboard (ffmpeg + filter script) | consumes `interfaces/assets/bridge-tower-tease-filter.txt` | `pwsh scripts/render-bridge-tower-tease.ps1` (Windows: `powershell`) |
| `run-recursive-attention-causality.mjs` | Orchestrate recursive-attention causality validation (study build + Python pipeline) | spawns `build-look-at-the-sun-study.mjs` + `research/recursive-attention-causality/scripts/run_causality_validation.py` | `npm run research:recursive-attention-causality` |
| `run-synthobs-paper-audit.mjs` | CLI for the NSPFRNP Snap peer-review audit | `lib/synthobs-peer-review-audit.mjs` | `npm run audit:paper -- --id=<id>` / `audit:papers` |
| `sync-interfaces-readme-index.mjs` | Sync root `README.md` + `interfaces/index.html` HTML listings | `lib/interfaces-readme-index.mjs` | `npm run sync:interfaces-index` |
| `sync-lattice-omni-layer-guide.mjs` | Sync living TOC for the Omni-Lattice layer guide | `lib/lattice-omni-guide.mjs` | `npm run sync:lattice-guide` |
| `sync-questfest-blog.mjs` | Inject six most recent ship-blog notes into `interfaces/vibelandia-questfest.html` | `lib/questfest-blog.mjs` | `npm run sync:questfest-blog` |
| `test-catalog-apis.mjs` | Smoke-test the catalog upload API (GET catalog, inline upload, register, blob token, track edit) | self-contained (requires `CATALOG_UPLOAD_SECRET`) | `CATALOG_UPLOAD_SECRET=… node scripts/test-catalog-apis.mjs` |
| `test-lattice-omni-guide.mjs` | Smoke test: Omni guide membership + catalog pin invariants | `lib/lattice-omni-guide.mjs`, `lib/whitepaper-registry.mjs`, `lib/whitepaper-catalog.mjs` | `node scripts/test-lattice-omni-guide.mjs` |
| `test-osm-fence-once.mjs` | One-shot Overpass query sanity check for a Turner pasture fence | self-contained | `node scripts/test-osm-fence-once.mjs` |
| `test-wavefield-metrology.mjs` | SYN-SUN-2026-REV7 metrology verification (structural, no mocks on cast/filter path) | `lib/metrology/*`, `lib/dph-wavefield-solar.mjs` | `npm run test:wavefield` |
| `verify-lean.ps1` | Lake build + verify Lean 4 kernel witnesses (GoldilocksErdos) | `lean/` package | `pwsh scripts/verify-lean.ps1` (used by `.github/workflows/lean-verify.yml`) |
| `z_generate_manuscript_variables.py` | Generate `docs/manuscript/manuscript_vars.yaml` from the committed follow-up receipt | self-contained | `python3 scripts/z_generate_manuscript_variables.py` |

## Environment-only credentials

`fix-holographic-track.mjs` and `test-catalog-apis.mjs` require
`CATALOG_UPLOAD_SECRET` from the environment — there is **no fallback**: both exit
with a loud error when the variable is unset. Secrets never live in source.

## Non-script assets

None. The ffmpeg filtergraph for `render-bridge-tower-tease.ps1` lives at
[`interfaces/assets/bridge-tower-tease-filter.txt`](../interfaces/assets/bridge-tower-tease-filter.txt).
