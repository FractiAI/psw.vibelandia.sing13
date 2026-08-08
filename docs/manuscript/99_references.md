# References {#sec:references}

This manuscript is primarily a software and empirical artifact report. External claims should be added here only when they are used in the prose and can be verified independently.

## Repository sources

- `lib/openrouter-experiment.mjs` — experiment core, treatment constructors, scoring, paired statistics, and SVG/HTML report functions.
- `scripts/lattice-vs-standard-openrouter-usage.mjs` — live OpenRouter runner and result serializer.
- `lib/lattice-prompt.mjs` — Lattice prompt assembly and topology normalization.
- `lib/lattice-engine.mjs` — token accounting and structural execution envelopes.
- `tests/scripts/openrouter-experiment.test.mjs` — experiment-core tests.
- `tests/lib/lattice-prompt.test.mjs` — plain/direct topology tests.
- `docs/OPENROUTER_LATTICE_EXPERIMENT.md` — operational protocol note.

## Run artifacts

- Primary three-treatment run: `data/openrouter-lattice-experiment-2026-08-08T04-34-20-127Z.json`.
- Primary visual report: `reports/openrouter-lattice-experiment-2026-08-08T04-34-20-127Z.html`.
- Valid cross-model run: `data/openrouter-lattice-experiment-2026-08-08T04-37-05-973Z.json`.
- Structural comparison receipt: `data/lattice-vs-standard-comparison.json`.

## Citation policy

The current manuscript deliberately avoids unverifiable external citations. When related-work citations are added, use Pandoc citation syntax and add complete entries to `references.bib`; do not add citations merely to decorate the background.
