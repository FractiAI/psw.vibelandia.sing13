# Methodology · HHA-GEOMAG-HERBIVORE-2026

## Workflow (Steps 1–8)

1. **Inventory** — Document Movebank, GBIF, NOAA SWPC, GFZ Kp, USGS EMAG2, Open-Meteo, Turner synthesis, agency reports (`src/inventory.py`).
2. **Metadata** — UTC timestamps, EPSG:4326, archived JSON under `data/archive/`.
3. **Clean** — Align 3-hourly Kp to daily max; dedupe trajectory IDs.
4. **CRS** — WGS84 lat/lon throughout.
5. **Trajectories** — Daily fixes from Turner API or GBIF; heading/speed from sequential steps.
6. **Movement metrics** — Step km, speed, tortuosity proxy, herd spread, Rayleigh consistency.
7. **Magnetic field** — Declination/inclination/intensity via `geomag` (WMM).
8. **Link** — Merge Kp/Ap; storm class; environmental covariates (Open-Meteo optional extension).

## Statistics

- Circular: Rayleigh, Kuiper (uniform alternative)
- Storm strata: quiet (Kp&lt;4), moderate (4–5), strong (6–7), severe (≥8)
- Z-score, Bayesian tail probability, Isolation Forest, PELT change-points (`ruptures`)
- Random forest feature importance (in-sample; SHAP optional in extended notebook)
- Lag windows: 0–24 h, 24–48 h, 48–72 h, 3–7 d

## Recent Anomaly Module

Windows: **90 d** (Kp + movement), **30 d**, **14 d** focus. Baseline: prior interval within ingest window (Python: pre-90d slice; edge API: 5 y Kp + 30 d movement default).

Classifications: `none` | `weak` | `moderate` | `strong` | `extraordinary`.

## Validation / falsification

Every positive flag lists contradicting evidence and non-geomagnetic explanations. Turner synthesis is **not** collar GPS — tier caps at **weak** for H2/H5 unless Movebank collars ingested.

## Reproducibility

- `scripts/run_pipeline.py`
- `requirements.txt` / `environment.yml`
- `data_dictionary.md`
