# Documentation index by topic

## Architecture and system design

Search terms: `ARCHITECTURE`, `NESTED_AGENT`, `LATTICE`, `OMNIVERSAL`, `SINGULARITY`.

Representative entries:

- `ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md`
- `ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07-*.md`
- `SING13_EDGE_ONBOARDING.md`
- `../BBHE_REPOSITORY_STANDARD.md`

## Protocols and formal systems

Search terms: `NSPFRNP`, `PROTOCOL`, `MCA`, `RAG`, `GOLDILOCKS`, `SEED`.

- `../protocols/` — protocol spine and operational specifications.
- `../lib/lattice-prompt.mjs` — executable prompt formalism.
- `../lib/lattice-engine.mjs` — token and execution envelope.

## Empirical research

Search terms: `SYNTHOBS`, `EMPIRICAL`, `BENCH`, `COMPARISON`, `METROLOGY`.

- `../research/` — experiment suites and pipelines.
- `../data/` — measured receipts and catalogs.
- `../reports/` — generated visual reports.
- `manuscript/` — the Lattice context-efficiency empirical paper.

## Product and user experience

Search terms: `QUESTFEST`, `PLAYER`, `CHAT`, `UI`, `ONBOARD`, `CATALOG`.

- `../apps/` — source applications.
- `../interfaces/` — shipped static builds.
- `README.md` and `LEGACY_INDEX.md` — entry points to user-facing materials.

## Operations and governance

Search terms: `DEPLOY`, `VERCEL`, `ACCESS`, `HONESTY`, `SECURITY`, `RELEASE`.

- `../api/` — serverless pipe endpoints.
- `../.github/workflows/` — CI and deployment workflows.
- `../data/lattice-access.json` — access policy data; do not duplicate private values in prose.

## Search recipe

```bash
find docs protocols research -type f -maxdepth 3 | sort
rg -n "Lattice|NSPFRNP|QUESTFEST|SynthOBS|honesty" docs protocols research
```

The physical corpus remains stable; this index is the organization layer.
