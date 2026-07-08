# SYNTHOBS EGS Epigenetic Phase-Locking · Standalone Repro Package

**Paper ID:** `synthobs-egs-epigenetic-phase-locking-2026-07`  
**Document ID:** `WP-SYNTHOBS-EPI-PHASELOCK-2026-07`  
**Framework:** SynthOBS Autonomous Agent · Syntheverse Sandbox · Goldilocks AIOS  
**Public data lanes:** GTEx v8 API · ENCODE REST API

---

## Abstract

This repository packages the reproducible empirical lane for the whitepaper **"Epigenetic Phase-Locking of Pancreatic and Hypothalamic Loci via Recursive Geometric Scaling."** The model introduces an EGS-NLRF geometric postulate ($\Phi_{EGS} \approx 1.618$) and tests public-data observables that can be executed without private cohorts.

The run computes:

- GTEx median-expression anchors for `INS`, `PDX1`, `POMC`, `NPY`, `DNMT1`, `DNMT3A`
- Hypothalamus and pancreas ratio summaries
- ENCODE pancreas ATAC promoter-window checks near `INS`/`PDX1`
- Exploratory local spacing ratio summaries vs $\Phi_{EGS}`

Outputs are written as machine and human receipts:

- `data/empirical_report.json`
- `data/empirical_report.md`

---

## Intentions

1. **Make the whitepaper falsifiable and reproducible** with publicly recognized data APIs.
2. **Separate executed experiments from narrative claims** (no bench claims without bench runs).
3. **Preserve honesty boundary discipline** so downstream forks do not over-claim causality.
4. **Provide a fork-ready spine** for additional genes, tissues, or promoter-window tests.

---

## Primer (how to read this repo)

- **`scripts/run_empirical_pipeline.mjs`** is the full run entrypoint.
- **`src/constants.mjs`** defines targets, tissue keys, and EGS constant.
- **`src/fetch-public-data.mjs`** handles GTEx and ENCODE API ingestion.
- **`docs/`** contains the standalone copy of the canonical paper.
- **`data/`** stores run receipts.

The pipeline is intentionally lightweight: it validates public coordinates and expression structure, not clinical efficacy.

---

## Quick start

From monorepo root:

```bash
npm run research:synthobs-egs-epigenetic-phase-locking
```

Or from this folder:

```bash
node scripts/run_empirical_pipeline.mjs
```

---

## Public datasets used

| Source | Endpoint | Role in run |
|---|---|---|
| GTEx Portal API v2 | `https://gtexportal.org/api/v2` | Gene reference + median tissue expression (`gtex_v8`) |
| ENCODE REST API | `https://www.encodeproject.org` | Released human pancreas ATAC experiment metadata + IDR-thresholded peak BED |

Note: requested accession `ENCSR493MWX` is checked; if unavailable, the pipeline auto-selects a released pancreas ATAC accession for execution.

---

## Latest executed findings (current receipt)

Run timestamp (UTC): `2026-07-08T20:08:13.350Z`

| Metric | Value |
|---|---|
| Hypothalamus `POMC/NPY` ratio | `0.5621` |
| Pancreas `INS/PDX1` ratio | `252.2100` |
| Pancreas `DNMT1/DNMT3A` ratio | `1.0476` |
| ENCODE INS window peak count (±50 kb) | `0` |
| ENCODE PDX1 window peak count (±50 kb) | `0` |

Finding tiers:

- `F1`: `no_support_directional`
- `F2`: `support_INS_above_PDX1`
- `F3`: `inconclusive_window_peaks`
- `F4`: `no_support_phi_spacing_strong`

---

## Honesty boundary

- Public-data correlations and geometric summaries are **not** causal proof of epigenetic protection.
- No in-vivo intervention or patient-level outcome analysis is performed in this package.
- Claims about glycemic-risk neutralization remain **theoretical** pending controlled biological studies.

---

## Fork directions

- Add tissue comparators (`Liver`, `Muscle_Skeletal`) for stress-response context.
- Expand promoter windows beyond ±50 kb or switch to cCRE-linked tracks.
- Add multiple ENCODE accessions and replicate-level robustness summaries.
- Add permutation/null models for spacing-ratio significance.

---

**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Audit protocol:** `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`
