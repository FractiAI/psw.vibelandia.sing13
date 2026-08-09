# Results {#sec:results}

## Evidence status

The results below are generated from `{{source.receipt}}`, whose status is `{{metadata.status}}`. They are deterministic control values, not live-provider measurements. The control contains {{experiment.observations_per_treatment}} observations per treatment from {{experiment.repeats}} repeats and {{experiment.tasks}} fixed tasks.

## Aggregate control values

| Treatment | Strict accuracy | Lenient accuracy | Mean structural tokens | Mean controlled latency (ms) | Tokens per correct |
|---|---:|---:|---:|---:|---:|
| Lattice | {{primary.lattice.accuracy}} ({{primary.lattice.accuracy_count}}) | {{primary.lattice.lenient_accuracy}} | {{primary.lattice.tokens}} | {{primary.lattice.latency_ms}} | {{primary.lattice.tokens_per_correct}} |
| Standard | {{primary.standard.accuracy}} ({{primary.standard.accuracy_count}}) | {{primary.standard.lenient_accuracy}} | {{primary.standard.tokens}} | {{primary.standard.latency_ms}} | {{primary.standard.tokens_per_correct}} |
| Naive corpus | {{primary.naive.accuracy}} ({{primary.naive.accuracy_count}}) | {{primary.naive.lenient_accuracy}} | {{primary.naive.tokens}} | {{primary.naive.latency_ms}} | {{primary.naive.tokens_per_correct}} |

The structural Lattice-to-naive ratio is {{primary.lattice_naive_token_ratio}}, or {{primary.lattice_naive_token_savings_percent}}% fewer structural tokens. This is a control-pipeline result only and must not be confused with the existing live primary receipt.

## Recomputed statistics

All rows are generated from `{{source.statistics}}`; `n` is the paired observation count. Confidence intervals are 95% t-based intervals for treatment means. The paired difference is Lattice minus Standard.

| Outcome | n | Mean difference | Lattice 95% CI | Standard 95% CI | Paired t | Wilcoxon signed-rank | Cohen's d_z |
|---|---:|---:|---|---|---|---|---:|
| Strict accuracy | {{statistics.accuracy.n}} | {{statistics.accuracy.difference}} | {{statistics.accuracy.lattice_ci}} | {{statistics.accuracy.standard_ci}} | {{statistics.accuracy.paired_t}} | {{statistics.accuracy.wilcoxon}} | {{statistics.accuracy.cohens_dz}} |
| Lenient accuracy | {{statistics.accuracy_lenient.n}} | {{statistics.accuracy_lenient.difference}} | {{statistics.accuracy_lenient.lattice_ci}} | {{statistics.accuracy_lenient.standard_ci}} | {{statistics.accuracy_lenient.paired_t}} | {{statistics.accuracy_lenient.wilcoxon}} | {{statistics.accuracy_lenient.cohens_dz}} |
| Structural tokens | {{statistics.tokens.n}} | {{statistics.tokens.difference}} | {{statistics.tokens.lattice_ci}} | {{statistics.tokens.standard_ci}} | {{statistics.tokens.paired_t}} | {{statistics.tokens.wilcoxon}} | {{statistics.tokens.cohens_dz}} |
| Controlled latency (ms) | {{statistics.latency.n}} | {{statistics.latency.difference}} | {{statistics.latency.lattice_ci}} | {{statistics.latency.standard_ci}} | {{statistics.latency.paired_t}} | {{statistics.latency.wilcoxon}} | {{statistics.latency.cohens_dz}} |
| Tokens per correct | {{statistics.tokens_per_correct.n}} | {{statistics.tokens_per_correct.difference}} | {{statistics.tokens_per_correct.lattice_ci}} | {{statistics.tokens_per_correct.standard_ci}} | {{statistics.tokens_per_correct.paired_t}} | {{statistics.tokens_per_correct.wilcoxon}} | {{statistics.tokens_per_correct.cohens_dz}} |

**Power/MDE note.** {{statistics.accuracy.mde_note}} This note is planning guidance, not evidence that the deterministic control or the live primary run is adequately powered.

## Figures

Figure [@fig:followup-accuracy] shows strict accuracy; Figure [@fig:followup-lenient] shows lenient accuracy. Figure [@fig:followup-tokens] shows structural token controls, Figure [@fig:followup-latency] controlled latency, Figure [@fig:followup-tpc] tokens-per-correct, and Figures [@fig:followup-paired-tokens] and [@fig:followup-paired-accuracy] show paired treatment movement.

![Follow-up strict accuracy by task](figures/followup_accuracy.pdf){#fig:followup-accuracy width=95%}

![Follow-up lenient accuracy by task](figures/followup_lenient_accuracy.pdf){#fig:followup-lenient width=95%}

![Follow-up structural tokens by task](figures/followup_tokens.pdf){#fig:followup-tokens width=95%}

![Follow-up controlled latency by task](figures/followup_latency.pdf){#fig:followup-latency width=95%}

![Follow-up tokens per correct outcome by task](figures/followup_tokens_per_correct.pdf){#fig:followup-tpc width=95%}

![Follow-up paired structural token comparison](figures/followup_paired_efficiency.pdf){#fig:followup-paired-tokens width=90%}

![Follow-up paired strict accuracy comparison](figures/followup_paired_accuracy.pdf){#fig:followup-paired-accuracy width=90%}

**Figure captions.** All seven figures are generated from the committed deterministic receipt by `scripts/generate-manuscript-figures.mjs`. The figures validate the larger-n artifact path and are not empirical provider visualizations.
