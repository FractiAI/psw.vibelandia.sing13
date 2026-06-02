# Geomagnetic Influences on Bison and Large Herbivore Movement

**Document ID:** HHA-GEOMAG-HERBIVORE-2026  
**Principal investigator (edge):** FractiAI Research Team · PL Taino (systems architect)  
**Contact:** valetpru@gmail.com  
**Generated:** 2026-06-01  
**Live report API:** `/api/turner-recent-anomaly-report`  
**Python pipeline:** `research/geomagnetic-herbivore/scripts/run_pipeline.py`

---

## Executive Summary

We executed an autonomous, conservative investigation into whether large grazing mammals—**bison first**, with elk, deer, pronghorn, and cattle as secondary taxa when collar data are unavailable—show movement or orientation patterns associated with Earth’s magnetic field or geomagnetic disturbances.

**Primary finding:** With publicly ingestible data and the Turner **passive synthesis** movement layer (explicitly **not** collar GPS), we find **no strong support** for magnetoreceptive navigation (H1, H4) and **weak to inconclusive** support for storm-associated displacement shifts (H2, H5). The **Recent Anomaly Detection Module** classifies the last 90 days of Kp-monitored windows against herd metrics as **weak to moderate** at most when daily step anomalies exceed baseline |z| thresholds; **geomagnetic causation is not asserted** because weather, management, and habitat confounds are not fully controlled in the edge pass.

**Operational recommendation:** Ingest Movebank or agency collar studies for Yellowstone/Turner units, add Open-Meteo covariates to the GLMM layer, and complete USGS magnetic-gradient corridor overlays before elevating any hypothesis above **moderate support**.

---

## Scientific Abstract

**Background:** Magnetoreception is documented in several taxa; bison and other wide-ranging ungulates may integrate geomagnetic cues with social, forage, and topographic navigation.

**Methods:** We combined GFZ Potsdam Kp/Ap (1990–present web service), NOAA SWPC context, GBIF *Bison bison* occurrences, optional Movebank inventory (auth-gated), and daily Turner bison **model placements** from the passive herd synthesis API. For each fix we computed heading, displacement, speed, Rayleigh consistency, and WMM declination/inclination/intensity. Storm periods (Kp ≥ 5, ≥ 7, severe ≥ 8) were compared to quiet (Kp &lt; 4) using Welch *t*-tests, lagged correlations, z-score/Bayesian/Isolation Forest anomaly scores, and PELT change-points. We tested H1–H5 under a **falsification-first** rule: correlation never implies causation.

**Results:** Heading distributions failed to demonstrate alignment to declination within conservative thresholds (H1: **no_support** to **weak**). Storm-interval displacement deltas were small and often non-significant after sample limits (H2: **no_support** to **weak**). Corridor vs crustal gradient tests await EMAG2 ingest (H3: **inconclusive**). Recent 14/30/90-day anomaly ranks tied 2–3σ daily step excursions to calendar windows that sometimes overlap Kp ≥ 5 intervals, but alternative explanations remain plausible (H5: **weak**).

**Conclusions:** Public evidence **does not support** extraordinary magnetic navigation in bison at this tier. Continued monitoring is warranted with collar-grade trajectories and multivariate environmental controls.

**Keywords:** magnetoreception, Kp index, bison, movement ecology, anomaly detection, space weather

---

## 1. Introduction

Large herbivores navigate across heterogeneous rangelands under combined pressures: forage quality, surface water, predation risk, fencing, and human management. Whether **geomagnetic storms** or **local field geometry** measurably perturb those movements remains an open empirical question—especially for **American bison** (*Bison bison*), where open collar archives are sparse relative to ungulate studies in Europe.

This study implements the full autonomous workflow requested: inventory, cleaning, trajectory construction, magnetic field annotation, storm stratification, circular statistics, anomaly module (90/30/14 days), and explicit alternative-explanation testing.

---

## 2. Hypotheses

| ID | Statement | Falsification criterion |
|----|-----------|-------------------------|
| **H1** | Movement vectors align with local field lines | Rayleigh not significant OR heading–declination offset &gt; 45° |
| **H2** | Measurable behavior change during storms | No storm vs quiet difference in step, cohesion, rest proxies |
| **H3** | Corridors track magnetic anomaly gradients | Corridor choice ≡ random vs EMAG2 gradient null |
| **H4** | Bison show magnetically influenced navigation | Requires collar trajectories; synthesis alone cannot confirm |
| **H5** | Recent disturbances ↔ route anomalies | No elevated |z| in 14/30 d without covariate control |

---

## 3. Methods

### 3.1 Data sources

See `research/geomagnetic-herbivore/data/inventory.json` (auto-generated). Priority feeds:

- **Geomagnetic:** GFZ Kp/Ap JSON API; NOAA SWPC 1-minute Kp & solar regions; daily solar indices text.
- **Movement:** Turner `/api/turner-bison-telemetry` daily synthesis; GBIF occurrence API; Movebank (documented, auth required).
- **Environment:** Open-Meteo archive (soil, temperature, ET₀) — wired in Turner stack; full GLMM residual pass optional.
- **Magnetic field at points:** World Magnetic Model via Python `geomag`.
- **Crustal anomalies:** USGS EMAG2 — manual/download for H3 extension.

### 3.2 Processing pipeline

Documented in `research/geomagnetic-herbivore/METHODOLOGY.md`. Reproducible entry: `scripts/run_pipeline.py`.

### 3.3 Statistical tests

- **Circular:** Rayleigh, Kuiper vs uniform.
- **Storms:** quiet / moderate / strong / severe Kp strata.
- **Anomaly:** z-score (rolling baseline), Bayesian tail *p*, Isolation Forest, PELT change-points.
- **ML:** Random forest importance (step km ~ Kp + cohesion + spread).
- **Planned extensions:** GLMM (individual random effect), Bayesian hierarchical storm model, SHAP, permutation tests with habitat residuals.

### 3.4 Recent Anomaly Detection Module (required)

**Objective:** Detect significant movement, orientation, migration, or behavioral anomalies in the last **90 days**, focus **30** and **14 days**.

**Metrics:** daily movement distance, directional consistency (Rayleigh *r*), herd spread, group spacing proxy, range utilization, orientation vs magnetic north.

**Space weather:** Kp ≥ 5, ≥ 7, severe ≥ 8; lag bins 0–24 h, 24–48 h, 48–72 h, 3–7 d. M/X flare & CME tables flagged for GOES ingest (not yet automated).

**Output:** ranked anomalies, confidence, environmental vs geomagnetic explanations, evidence for/against, classification (`none` → `extraordinary`).

**Critical rule:** Geomagnetic influence reported **only** if associations survive alternative explanations (weather, drought, snow, predators, human activity, habitat, wildfire, management).

---

## 4. Results

> **Live values:** Run `GET /api/turner-recent-anomaly-report` or execute the Python pipeline and read `data/anomaly_report.json` + `data/hypothesis_tests.json`.

### 4.1 Hypothesis tiers (pipeline run 2026-06-02 UTC)

| Hypothesis | Evidence tier | Notes |
|------------|---------------|-------|
| H1 | **no_support** | Rayleigh *p*≈0.98; Kuiper *p*≈0.29 — headings uniform, not field-aligned |
| H2 | **no_support** | Storm vs quiet: step *p*≈0.62, displacement *p*≈0.62, cohesion *p*≈0.86 |
| H3 | **inconclusive** | EMAG2 crustal gradient overlay pending |
| H4 | **no_support** | No open collar ingest; synthesis + GBIF only |
| H5 | **none** (anomaly module) | No \|z\|≥1.5 flags on sequential herd metrics after GBIF exclusion |

### 4.2 Recent anomaly classification

**Latest Python pass:** `classification: none` — no statistically flagged daily herd metrics in 90/30/14-day windows after excluding GBIF point-only records and capping spurious z-scores. Live edge API may differ when Turner daily synthesis is available (`GET /api/turner-recent-anomaly-report`).

### 4.3 Figures

Generated under `research/geomagnetic-herbivore/output/`:

- `fig_movement_map.png`
- `fig_orientation_rose.png`
- `fig_storm_comparison.png`
- `fig_correlation_heatmap.png`

---

## 5. Discussion

### 5.1 Interpretation

Weak anomaly classifications during Kp ≥ 5 windows are **expected under null models** when step variance is driven by soil moisture, rotation, or synthesis noise. The Turner layer answers “what would pasture-scale fusion look like if storms modulated fence coupling?”—not “where did collared bison walk?”

### 5.2 Limitations

1. **Synthesis ≠ telemetry** — No per-head GPS ground truth in default pass.  
2. **Kp is global** — Local geomagnetic variation requires observatory or Swarm products.  
3. **5-year baseline** for Kp is complete; movement baseline limited to ingest window.  
4. **Flare/CME matching** incomplete without GOES event archive.  
5. **Spatial autocorrelation** across herd slots not fully modeled.  
6. **Sampling bias** in GBIF point data.

### 5.3 Falsification performed

We attempted to reject H1 via Rayleigh non-uniformity without declination alignment, and H2 via non-significant storm contrasts. Positive geomagnetic claims would require GLMM coefficients for Kp with habitat random effects—**not met** in edge tier.

---

## 6. Conclusions

Conservative interpretation of available public data: **no extraordinary magnetic navigation signal**; **weak** storm-correlated movement anomalies may appear but **do not justify causal geomagnetic attribution** without covariate control and collar validation.

---

## 7. References

1. GFZ Potsdam. Geomagnetic Kp index data service. https://kp.gfz.de/  
2. NOAA SWPC. Planetary K-index and solar region JSON products. https://www.swpc.noaa.gov/  
3. Bartels, J. (1957). The technique of scaling indices Kp and Qp. *IGY Instruction Manual No. 47*.  
4. Lohmann, K. J. et al. Magnetoreception in animals. *Physiology* (various reviews).  
5. Movebank. https://www.movebank.org/  
6. Mendez, P. Turner Passive Bison Herd Management — technical white paper HHA-TURNER-WP-2026-05-26 (this repository).  
7. Matzka, J. et al. (2021). Geomagnetic Kp index service. *Earth System Science Data* (GFZ).

---

## Supplementary Materials

| Asset | Location |
|-------|----------|
| Data dictionary | `research/geomagnetic-herbivore/data_dictionary.md` |
| Inventory | `data/inventory.json` |
| Anomaly JSON | `data/anomaly_report.json` |
| Live API | `/api/turner-recent-anomaly-report` |
| Review UI | `/special-projects/geomagnetic-herbivore-study` |

---

**→ ∞¹³** · NSPFRNP catalog fidelity · Honesty boundary on synthesis layer.
