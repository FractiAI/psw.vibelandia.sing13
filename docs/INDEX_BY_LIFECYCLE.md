# Documentation index by lifecycle

## Seed / origin

Documents that state a protocol, hypothesis, architecture, or research question. These include formal protocol files, architecture notes, and whitepapers. They are not empirical validation by themselves.

## Edge / implementation

Executable behavior lives in `../lib/`, `../api/`, `../apps/`, `../scripts/`, and `../interfaces/`. Implementation changes should be traced to tests and build artifacts.

## Evidence / measurement

- `../data/` — JSON/CSV receipts, comparison matrices, and experiment observations.
- `../reports/` — generated visual reports.
- `../tests/` — executable correctness gates.
- `manuscript/` — integrated evidence narrative with formal definitions and limitations.

## Current operational references

- `../README.md` — human entry point.
- `../AGENTS.md` — repository operating contract.
- `OPENROUTER_LATTICE_EXPERIMENT.md` — current experiment protocol.
- `manuscript/06_reproducibility.md` — artifact registry and rendering instructions.

## Historical / legacy

`LEGACY_INDEX.md` and historically named dated files remain stable for link preservation. A document becomes archival only when a successor explicitly identifies it and an index records the relationship.

## Status vocabulary

- **Current:** actively maintained and used by implementation or publication.
- **Exploratory:** evidence exists but the protocol or sample is insufficient for broad claims.
- **Superseded:** replaced by a named successor; retained for provenance.
- **Archive:** historical reference, not an operational instruction.

## Document maintenance rule

When adding or revising a document, include title, date/version, Seed, Edge, Boundary, Evidence, Lifecycle, and owner/source paths. Avoid duplicating measured numbers across documents without naming the canonical data receipt.
