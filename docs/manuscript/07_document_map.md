# Document map and modularization {#sec:document-map}

## Manuscript modules

| Module | Purpose |
|---|---|
| `00_abstract.md` | Abstract, contributions, honesty boundary |
| `01_introduction.md` | Background, research questions, architecture |
| `02_formalism.md` | Treatment model, outcomes, paired statistics, threats |
| `03_methods.md` | Task battery, protocol, runs, figures, system boundary |
| `04_results.md` | Primary, cross-model, per-task, and failure results |
| `05_discussion.md` | Mechanisms, applicability, limitations, recommendations |
| `06_reproducibility.md` | Artifact registry, commands, rendering, security |
| `07_document_map.md` | This map and document organization contract |
| `99_references.md` | Bibliography and repository references |
| `config.yaml` | Renderer metadata and output format configuration |
| `preamble.md` | LaTeX packages and layout additions |
| `SYNTAX.md` | Local Markdown/Pandoc syntax and label registry |

## Documents directory organization

The legacy `docs/` corpus contains many historically named whitepapers and technical notes. To preserve links and historical filenames, this pass does not rename or move legacy files. Instead, organization is provided through stable index documents and purpose-based collections:

- `docs/README.md` — top-level navigation and honesty boundary;
- `docs/INDEX_BY_TOPIC.md` — topic map for architecture, protocols, research, product/UI, and operations;
- `docs/INDEX_BY_LIFECYCLE.md` — seed/origin, implementation, evidence, and archive map;
- `docs/OPENROUTER_LATTICE_EXPERIMENT.md` — operational experiment protocol;
- `docs/manuscript/` — renderable research manuscript source;
- `reports/` — generated HTML/SVG experiment reports;
- `data/` — generated JSON/CSV evidence and historical comparison receipts.

Generated outputs are not copied into source sections. The manuscript points to report artifacts and reproduces key figures from the same aggregated data.

## Seed:Edge document contract

Every document should identify:

1. **Seed:** the originating question, protocol, or formal claim;
2. **Edge:** the implementation, user experience, or empirical observation;
3. **Boundary:** what the document does not establish;
4. **Evidence:** source files, runs, tests, or citations;
5. **Lifecycle:** current, exploratory, superseded, or archival status.

This contract keeps conceptual whitepapers, implementation notes, and empirical reports from being silently treated as equivalent evidence.

## Proposed future physical taxonomy

A future migration may place files into these directories after a link audit:

```text
docs/
  architecture/       system and protocol architecture
  protocols/          operational protocol specifications
  research/           hypotheses, methods, and empirical reports
  product/            UI, catalog, and user-facing behavior
  operations/         deployment, access, and maintenance
  archive/            superseded or historical documents
```

This pass intentionally leaves the physical legacy corpus stable. The index-first approach is reversible and avoids breaking external references while the repository is actively evolving.

## Rendering contract

The renderer consumes ordered numeric Markdown modules. Filenames are part of the composition protocol: lower numbers establish context and definitions; `99_references.md` terminates the body with references. Figures use relative paths under `docs/manuscript/figures/` and are generated before rendering.
