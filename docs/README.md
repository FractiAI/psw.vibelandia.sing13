# Documentation map

This directory contains the SING13 Edge documentation corpus. The corpus is intentionally preserved under its historical filenames because external links and publication references depend on them.

## Navigation

- [Topic index](INDEX_BY_TOPIC.md) — architecture, protocols, research, product, and operations.
- [Lifecycle index](INDEX_BY_LIFECYCLE.md) — seed/origin, implementation, evidence, current work, and archive.
- [Legacy index](LEGACY_INDEX.md) — historical document inventory.
- [OpenRouter Lattice experiment](OPENROUTER_LATTICE_EXPERIMENT.md) — operational protocol and CLI.
- [Renderable manuscript](manuscript/README.md) — modular empirical paper source.

## Evidence boundary

Documents are not interchangeable evidence. Protocols specify intended behavior; implementation files specify what executes; reports and data record what was measured; whitepapers may contain hypotheses or synthesis. Each document should state its scope and honesty boundary.

## Organization policy

The existing flat, historically named corpus is not renamed in place. Index-first organization provides stable navigation without breaking links. New material should use one of the manuscript, research, architecture, protocols, product, or operations entry points and should identify its Seed, Edge, Boundary, Evidence, and Lifecycle.

## Generated artifacts

- `../data/` contains JSON/CSV receipts and catalogs.
- `../reports/` contains generated HTML/SVG reports.
- `manuscript/figures/` contains static figures generated from an identified data receipt.
- Rendered PDFs belong in disposable output directories and are not source documents.
