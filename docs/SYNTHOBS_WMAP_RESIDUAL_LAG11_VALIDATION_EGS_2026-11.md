# WMAP Residual Lag Wiring Discovery — Assembling Public Spectra into Falsifiable Multipole Wiring

**Document ID:** `WP-WMAP-RESIDUAL-LAG11-VALIDATION-EGS-2026-11-19`  
**Registry ID:** `synthobs-wmap-residual-lag11-validation-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story · **new wiring discovery (provisional)** · **not** Infinite Octaves ENGINE_SHELF  
**Date:** 19 November 2026  
**Harness:** `research/synthobs-wmap-residual-lag11-validation/`  
**Ship blog:** `/ship-blog/wmap-residual-lag11-validation`  
**Data:** REAL NASA LAMBDA WMAP 9-year Combined TT Power Spectrum v5.0  

## Honesty boundary

| Tier | What this is | What it is not |
|---|---|---|
| **New wiring discovery (provisional)** | Multipole **residual wiring** lag 11↔14 assembled from public spectra + rediscovery contrast + kill board | Finished cosmological law · ΛCDM replacement · ENGINE_SHELF |
| Empirical (Level 2–3) | Regenerable residual-lag search + residual-shuffle nulls on real TT | Satellite re-analysis replacing WMAP/Planck pipelines |
| Controls | Lags 17–19 locked `known_physics_rediscovery` (near acoustic spacing) | Proof ΛCDM is wrong |
| Pending | X1 Planck · X3 continuum stress · X4 beam injection · X5 mask coupling | Instrument-systematics-free detection without those tests |

## Abstract

**Wiring is the discovery.** After continuum removal on the real WMAP 9-year TT spectrum, residual lags **11** and **14** clear `candidate_novel_physics` (|corr|≈0.499 / 0.466, p≈0.0033, nearAcousticSpacing=false) while lags **17–19** remain rediscovery controls. We assemble those results with the NASA spectrum substrate and a pre-registered beam/mask/Planck falsification board into **multipole residual wiring** — novel relative to acoustic rediscovery, provisional until X1–X5 clear. This is not a finished physical law.

## Thesis — wiring above a single bump

A residual bump on one spectrum is triage. **Wiring** connects: (1) real public TT substrate, (2) novel residual lags, (3) acoustic rediscovery anchors, (4) explicit kill tests. Novelty lives in that graph. Beam, mask, and instrument stories remain live until the kill board runs — which is why the discovery class is *provisional wiring*, not breakthrough cosmology.

## Primary research question

Can public CMB products be assembled into **falsifiable residual multipole wiring** at lags 11 and 14 that stays distinct from acoustic rediscovery?

## Method

`npm run research:synthobs-wmap-residual-lag11-validation` · seed `20261119`.

Uses `runC4WmapResidualPhysics` from the Cosmic Rhyme suite on fixture `wmap_tt_spectrum_9yr.txt` (Bennett et al. 2012 / LAMBDA). Continuum: $\log C_\ell \sim a + b\log\ell + c(\log\ell)^2$. Nulls: 300 residual shuffles. Focus lags: 11 and 14.

| Lane | Role |
|---|---|
| E1 | Confirm lags 11 & 14 = `candidate_novel_physics` |
| E2 | Assert `nearAcousticSpacing=false` |
| E3 | Known rediscovery controls exist on C4 board |
| E4 | Residual correlation symmetry + lag-definition lemmas |
| **E5** | **Assemble spectrum wiring** + list pending X1–X5 |

### Falsification board (designed to kill)

| ID | Experiment | Kill condition |
|---|---|---|
| X1 | Same residual gate on Planck TT | Planck silent → WMAP-specific |
| X3 | Cubic / SG / ΛCDM-theory / leave-one-band continua | Only one continuum sees 11/14 → fitting ghost |
| X4 | ΛCDM sims × published WMAP beam windows | Sims recreate 11/14 → instrument wiring |
| X5 | KQ mask swaps + Galactic template lags | Lag tracks mask/template → foreground wiring |

## Results

| Item | Lag 11 | Lag 14 |
|---|---:|---:|
| \|corr\| | **0.499** | **0.466** |
| p (residual shuffle) | **≈0.0033** | **≈0.0033** |
| nearAcousticSpacing | **false** | **false** |
| verdict | **candidate_novel_physics** | **candidate_novel_physics** |

Acoustic controls: lags **17, 18, 19** = `known_physics_rediscovery`.  
**E5 wiring:** PASS — `new_wiring_from_existing_public_spectra_provisional`.  
**Verdict:** NEW WIRING DISCOVERY (provisional) until X1–X5 clear.

Receipt: `research/synthobs-wmap-residual-lag11-validation/data/empirical_report.json`.  
Wiring fixture: `fixtures/wiring_literature.json`.

## Methods reproducibility appendix

```bash
npm run research:synthobs-wmap-residual-lag11-validation
```

Inputs: NASA LAMBDA WMAP 9-year TT fixture (copied under `fixtures/` with provenance; pipeline also reads cosmic suite fixture). Outputs: `data/empirical_report.json`. Math lemmas must be `ok`. Pending falsifiers are listed in E5 — not silently assumed passed.

## Discussion

Cross-mission agreement (X1) is the smallest upgrade from provisional to “cross-mission residual wiring.” Beam injection (X4) is the smallest honest demotion path if instrument stories win. Either outcome is publishable science; only silence is failure of the wiring class.

Sibling biology wiring papers (NPY↔SOD1, APP↔DNMT3A) use the same discovery grammar on wet-lab pieces. Here the pieces are public spectra and null designs.

## Φ_EGS / catalog

$\Phi_{\mathrm{EGS}}=(1+\sqrt{5})/2$ — filing grammar only.

## References

1. Cosmic Rhyme Expedition — `docs/SYNTHOBS_COSMIC_RHYME_EXPEDITION_EGS_2026-11.md`
2. NASA LAMBDA WMAP 9-Year Combined Power Spectrum v5.0 — https://lambda.gsfc.nasa.gov/product/map/dr5/pow_tt_spec_get.html
3. Bennett et al. (2012) WMAP nine-year results  
4. Fixture + provenance — `research/synthobs-wmap-residual-lag11-validation/fixtures/wmap_tt_spectrum_9yr.txt` · `fixtures/PROVENANCE.json`
5. Wiring assembly fixture — `research/synthobs-wmap-residual-lag11-validation/fixtures/wiring_literature.json`
6. Empirical receipt — `research/synthobs-wmap-residual-lag11-validation/data/empirical_report.json`
7. Sibling NPY↔SOD1 wiring — `docs/SYNTHOBS_NPY_SOD1_RHYME_VALIDATION_EGS_2026-11.md`
8. Sibling APP↔DNMT3A wiring — `docs/SYNTHOBS_APP_DNMT3A_RHYME_VALIDATION_EGS_2026-11.md`

## Fair Exchange

Fair Exchange clause in effect.

## Document close

→ ∞^∞
