# AGENTS: `scripts/` — Operational Scripts

Contract and inventory for this directory. Human-facing index:
[`scripts/README.md`](./README.md). Canonical thin-orchestrator shape:
`/Volumes/external_drive/Git/template/projects/templates/template_template/scripts/` (form only).

## Thin-orchestrator contract

- `scripts/` carries orchestration only: path bootstrap, arg/env parsing, logging,
  and a single delegated call into a `lib/*.mjs` entrypoint.
- Business / data / plot / analysis logic lives in `lib/` (importable and unit-tested
  under `tests/`).
- New reusable builders MUST follow the wrapper pattern already in place:
  `scripts/build-erdos-catalog.mjs` → `lib/erdos-catalog.mjs`,
  `scripts/build-look-at-the-sun-study.mjs` → `lib/look-at-the-sun-study.mjs`,
  `scripts/sync-interfaces-readme-index.mjs` → `lib/interfaces-readme-index.mjs`.
- Self-contained one-offs (operations/fixups against live APIs, e.g.
  `fix-holographic-track.mjs`, `heal-dead-catalog-src.mjs`) stay single-file but
  must fail loudly on missing credentials — env-only, no hardcoded fallbacks.
- A script that must remain but cannot run standalone (network/credential gated)
  documents its requirement in `scripts/README.md` and exits with a clear error.
- Browser assets are NOT scripts: client-side files live in
  `interfaces/scripts/` (indexed in `interfaces/scripts/README.md`); non-script
  assets (e.g. ffmpeg filtergraphs) live in `interfaces/assets/`.

## Inventory

| Script | Pattern | Delegates to |
|---|---|---|
| `build-erdos-catalog.mjs` | Thin orchestrator | `lib/erdos-catalog.mjs` |
| `build-look-at-the-sun-study.mjs` | Thin orchestrator | `lib/look-at-the-sun-study.mjs` |
| `capture-websdr-iq.mjs` | Thin orchestrator | `lib/openwebrx-ingest.mjs` |
| `crystallize-synthobs-paper-compliance.mjs` | Thin orchestrator | `lib/whitepaper-registry.mjs`, `lib/synthobs-agent-attribution.mjs`, `lib/synthobs-peer-review-audit.mjs` |
| `generate-deterministic-lattice-followup.mjs` | Thin orchestrator | `lib/openrouter-experiment.mjs` |
| `generate-manuscript-stats.mjs` | Thin orchestrator | `lib/openrouter-experiment.mjs` |
| `lattice-grant-access.mjs` | Thin orchestrator | `lib/lattice-access.mjs` |
| `lattice-vs-standard-comparison.mjs` | Thin orchestrator | `lib/lattice-engine.mjs` |
| `lattice-vs-standard-cursor-usage.mjs` | Thin orchestrator | `lib/lattice-prompt.mjs` |
| `lattice-vs-standard-cursor-usage-matrix.mjs` | Thin orchestrator | `lib/lattice-prompt.mjs` |
| `lattice-vs-standard-openrouter-usage.mjs` | Thin orchestrator | `lib/openrouter-bench.mjs`, `lib/openrouter-experiment.mjs` |
| `reconcile-catalog.mjs` | Thin orchestrator | `lib/catalog-server.mjs` |
| `run-synthobs-paper-audit.mjs` | Thin orchestrator | `lib/synthobs-peer-review-audit.mjs` |
| `sync-interfaces-readme-index.mjs` | Thin orchestrator | `lib/interfaces-readme-index.mjs` |
| `sync-lattice-omni-layer-guide.mjs` | Thin orchestrator | `lib/lattice-omni-guide.mjs` |
| `sync-questfest-blog.mjs` | Thin orchestrator | `lib/questfest-blog.mjs` |
| `test-lattice-omni-guide.mjs` | Thin orchestrator (smoke) | `lib/lattice-omni-guide.mjs`, `lib/whitepaper-registry.mjs`, `lib/whitepaper-catalog.mjs` |
| `test-wavefield-metrology.mjs` | Thin orchestrator (assertions) | `lib/metrology/*`, `lib/dph-wavefield-solar.mjs` |
| `run-recursive-attention-causality.mjs` | Orchestrator (spawns build + Python pipeline) | `build-look-at-the-sun-study.mjs`, `research/recursive-attention-causality/` |
| `assert-lattice-token-floors.mjs` | Self-contained one-off (floor assertions) | — |
| `blob-storage-audit.mjs` | Self-contained one-off | — |
| `build-catalog-from-tracks.mjs` | Self-contained one-off | — |
| `fetch-turner-osm-fences.mjs` | Thin orchestrator (one-shot) | `lib/turner-radar-fusion.mjs`, `lib/turner-osm-fence-lines.mjs` |
| `fix-holographic-track.mjs` | Self-contained one-off (requires `CATALOG_UPLOAD_SECRET`) | — |
| `generate-manuscript-figures.mjs` | Self-contained one-off (renders figures) | — |
| `harmonopoly-token-sim.mjs` | Self-contained one-off (model only) | — |
| `heal-dead-catalog-src.mjs` | Self-contained one-off | — |
| `hermes-lattice-chat.mjs` | Self-contained CLI | — |
| `inject-site-quicklinks.mjs` | Self-contained one-off | — |
| `lattice-verify-cursor-github.mjs` | Self-contained one-off | — |
| `migrate-video-to-audio.mjs` | Self-contained one-off | — |
| `playback-smoke.mjs` | Self-contained smoke (headless browser) | — |
| `probe-websdr-endpoints.mjs` | Self-contained one-off | — |
| `render-bridge-tower-tease.ps1` | Platform script (ffmpeg render) | consumes `interfaces/assets/bridge-tower-tease-filter.txt` |
| `test-catalog-apis.mjs` | Self-contained smoke (requires `CATALOG_UPLOAD_SECRET`) | — |
| `test-osm-fence-once.mjs` | Self-contained one-off | — |
| `verify-lean.ps1` | Platform script (Lean verify) | `lean/` |
| `z_generate_manuscript_variables.py` | Self-contained one-off (manuscript vars) | — |

## Tests

Vitest suite lives in `tests/` (`npm test`). Logic extracted from scripts is
covered there (`tests/lib/erdos-catalog.test.mjs`,
`tests/lib/look-at-the-sun-study.test.mjs`,
`tests/lib/turner-rangeland-map-core.test.mjs`, plus the pre-existing suite).
