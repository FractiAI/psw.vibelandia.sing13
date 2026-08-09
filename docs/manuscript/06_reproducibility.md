# Reproducibility and audit trail {#sec:reproducibility}

## Source of truth

The follow-up receipt is `{{source.receipt}}`; recomputed statistics are `{{source.statistics}}`. Source logic is `lib/openrouter-experiment.mjs`, `scripts/generate-deterministic-lattice-followup.mjs`, `scripts/generate-manuscript-stats.mjs`, `scripts/generate-manuscript-figures.mjs`, and `scripts/z_generate_manuscript_variables.py`.

The earlier live primary receipts are preserved. No live receipt is overwritten by this follow-up.

## Reproduction commands

```bash
node scripts/generate-deterministic-lattice-followup.mjs
node scripts/generate-manuscript-stats.mjs
node scripts/generate-manuscript-figures.mjs
python3 scripts/z_generate_manuscript_variables.py
```

The live harness remains available for a credentialed run:

```bash
LATTICE_BENCH_REPEATS=10 LATTICE_BENCH_TREATMENTS=lattice,standard,naive \
LATTICE_OPENROUTER_MODEL=deepseek/deepseek-chat OPENROUTER_API_KEY='[REDACTED]' \
node scripts/lattice-vs-standard-openrouter-usage.mjs
```

No key is included in the manuscript, receipt, CSV, HTML, shell command history, or report. The live path was not run in this mission because `OPENROUTER_API_KEY` and `LATTICE_CHAT_API_KEY` were unset.

## Verification gates

Required checks are `npm run test`, `node --check` for changed JavaScript, `python3 -m py_compile` for changed Python, `git diff --check`, SVG/XML parsing, PDF metadata/text checks, zero unresolved manuscript placeholders, and a LaTeX log scan for fatal errors and overfull boxes.

## Render

The manuscript is rendered through the template repository's `scripts/pipeline/stage_03_render.py` against the working project. Renderer output is disposable; the tracked manuscript artifact is `docs/manuscript/artifacts/psw-vibelandia-sing13-manuscript-followup.pdf`.

## Security and evidence boundary

Credentials are runtime inputs only. The deterministic receipt explicitly says it contains no provider calls or provider results. The raw live response text remains outside committed follow-up artifacts.
