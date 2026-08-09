# {{metadata.title}} {#sec:title}

**Author:** {{metadata.author}}
**Affiliation:** {{metadata.affiliation}}
**Email:** {{metadata.email}}
**ORCID:** [{{metadata.orcid}}](https://orcid.org/{{metadata.orcid}})
**Version:** {{metadata.version}}
**Generated:** {{metadata.date_generated}}

## Abstract {#sec:abstract}

This manuscript reports a secondary, post-hoc deterministic control follow-up for Lattice Chat Agent context experiments. The frozen task battery and treatment builders were exercised with {{experiment.repeats}} repeats across {{experiment.tasks}} tasks and {{experiment.observations_per_treatment}} paired observations per treatment. The treatments were a pointer-grounded Lattice envelope, a lean standard prompt, and a bounded corpus-dump baseline. The control receipt is labeled `{{metadata.status}}`: it contains no provider calls or provider results. Structural token and latency controls are included only to test the statistics, injection, figures, and rendering pipeline after live credentials were unavailable.

The follow-up therefore does not estimate model accuracy, provider latency, or production token cost. It demonstrates that the larger-n analysis path recomputes strict and lenient accuracy, tokens, latency, tokens-per-correct, paired t tests, Wilcoxon signed-rank tests, confidence intervals, Cohen's d_z, and a planning MDE note from one committed receipt. The live primary receipts remain preserved and are not overwritten.

**Keywords:** context engineering; retrieval grounding; token efficiency; paired experiment; reproducibility; deterministic control

**Honesty boundary.** {{metadata.evidence_boundary}} The follow-up is secondary/post-hoc and is not evidence for a provider or model claim. Any live-provider conclusion remains bounded by the existing primary receipts, their task battery, model coverage, and repeat counts.

## Data and code availability

The committed deterministic receipt is `{{source.receipt}}`; its recomputed statistics are `{{source.statistics}}`. The frozen live harness is `scripts/lattice-vs-standard-openrouter-usage.mjs`, with treatment and scoring logic in `lib/openrouter-experiment.mjs`. No API credentials or raw provider responses are stored in the artifact set.

## Manuscript map

The introduction and formalism define the context treatments and estimands. Methods describe the deterministic follow-up and its distinction from live evidence. Results report receipt-derived values and all requested statistics. Discussion separates implementation findings, interpretation, applicability, and limits of generalization. Reproducibility lists commands and validation gates.
