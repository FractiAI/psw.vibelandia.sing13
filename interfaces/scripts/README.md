# interfaces/scripts — Browser Script Index

Client-side scripts served statically from `/interfaces/scripts/` on the SING 13 edge.
These are browser assets, **not** node orchestrators — the thin-orchestrator contract
for node CLIs lives in [`/scripts`](../../scripts/README.md) (`scripts/README.md` +
`scripts/AGENTS.md`).

## Inventory

| Script | Purpose | Loaded by (committed pages) |
|---|---|---|
| `bulletin-board.js` | Renders `/api/bulletin-board` posts into the bulletin board | `interfaces/bulletin-board.html` |
| `dph-wavefield-solar-widget.js` | Live Wavefield Oscillator status strip; exposes `DphWavefieldWidget.mount()`, fetches `/api/dph-wavefield-solar` | `interfaces/nesting/nest-dph-gpu.html` |
| `erdos-holographic-audit.js` | Erdős 353 catalogue UI — Goldilocks sweet-spot queue (verified / witness / waiting rows) | `interfaces/special-projects/erdos-holographic-aios-audit.html` |
| `load-catalog-primer.js` | Injects `/interfaces/partials/catalog-synthesis-primer.html` into `#catalog-primer-mount` | no committed consumer right now (kept for reuse) |
| `questfest-schedule-item.js` | Renders one schedule item detail from `/data/questfest-schedule-items.json` | `interfaces/questfest-schedule-item.html` |
| `turner-bison-herd.js` | Live rangeland chart controls + date-range herd export dialog; stream `/api/turner-bison-telemetry` | `interfaces/special-projects/turner-bison-herd-management.html` |
| `turner-rangeland-map.js` | Passive radar chart (single canvas, unified camera) over Turner pastures; exposes `window.TurnerRangelandMap` | `interfaces/special-projects/turner-bison-herd-management.html` |
| `turner-rangeland-map-core.js` | Pure chart math (geometry, herd stats, view tiers) factored out of `turner-rangeland-map.js`; exposes `window.TurnerRangelandMapCore`; unit-tested in `tests/lib/turner-rangeland-map-core.test.mjs` | must load **before** `turner-rangeland-map.js` |
| `vendor/qrcodejs-1.0.0.min.js` | Vendored QR-code library | no committed consumer right now (vendored copy) |

## Load order

All page scripts are loaded with `defer`, so they execute in document order.
`turner-rangeland-map-core.js` must appear before `turner-rangeland-map.js` in the
page — the map script destructures `global.TurnerRangelandMapCore` at evaluation time
and fails loudly if the core did not load first (guarded by
`tests/lib/turner-rangeland-map-core.test.mjs`).

## Convention

Browser scripts stay self-contained classic scripts (no bundler, no modules). Pure
logic that deserves unit tests gets factored into a sibling `*-core.js` file and
covered under `tests/lib/`; DOM/canvas view code stays with the component.
