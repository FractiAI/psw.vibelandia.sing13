# OpenRouter Lattice versus plain experiment

The experiment compares two direct OpenRouter treatments against the same model and repository snapshot:

- `lattice`: pointer-grounded Lattice prompt assembly with Goldilocks topology.
- `standard`: a bounded plain system prompt and the same supplied files for coding tasks.

The fixed battery contains five repository QA tasks, one coding task scored by applying the returned unified diff and running the test suite, and three deterministic reasoning tasks. Repeats alternate treatment order within each task. Treatments: `lattice` (Lattice pointer envelope), `standard` (lean prompt), and optionally `naive` (a corpus dump baseline — the fat-context design target the Lattice savings claim is measured against). Provider-reported prompt/completion/total tokens and request latency are retained; responses are scored strictly (exact match) and leniently (answer contained), plus tokens per correct answer, paired t, Wilcoxon signed-rank, 95% confidence intervals, and Cohen's d_z.

Run without a provider call:

```bash
npm run experiment:openrouter -- --dry-run
```

Run the experiment with a runtime key (the runner reads local runtime configuration; it never prints the key):

```bash
OPENROUTER_API_KEY='[REDACTED]' npm run experiment:openrouter
```

Optional controls:

- `LATTICE_OPENROUTER_MODEL` — model id; default `deepseek/deepseek-chat`.
- `LATTICE_BENCH_REPEATS` — repeat count; default `3`.
- `LATTICE_BENCH_TASKS=qa,coding,reasoning` — restrict task types.
- `LATTICE_BENCH_TREATMENTS=lattice,standard,naive` — include the naive corpus-dump baseline (default `lattice,standard`).
- `LATTICE_CHAT_EMAIL` plus `LATTICE_CHAT_API_KEY` — additionally exercise deployed proxy arms.

A live run writes provider-independent metadata to `data/` as JSON/CSV and a self-contained HTML/SVG report to `reports/`. Raw response text is not written to reports or result JSON. No claim should be generalized from fewer than 10 repeats.

## Direct/plain mode

The CLI's `--plain` option and the web composer's Plain nest choice send `nestTopology: "none"`. For Claude and OpenRouter BYOK calls this removes the Lattice prompt assembly and uses a short direct system instruction. OpenRouter and Claude also accept validated `topP` values from `0` through `1`. CLI assistant text remains on stdout; progress and optional `--json` metadata remain on stderr.
