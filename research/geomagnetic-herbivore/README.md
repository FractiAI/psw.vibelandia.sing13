# Geomagnetic Influences on Bison and Large Herbivore Movement

**Document ID:** `HHA-GEOMAG-HERBIVORE-2026`  
**Reproducible package:** Python pipeline + live edge API mirror.

## Quick start

```bash
cd research/geomagnetic-herbivore
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python scripts/run_pipeline.py
```

Optional Turner live trajectories (local dev server):

```bash
# from repo root, with Vercel dev or static server exposing /api/turner-bison-telemetry
python scripts/run_pipeline.py --turner-base http://127.0.0.1:3000
```

## Outputs

| Path | Description |
|------|-------------|
| `data/inventory.json` | Public source inventory |
| `data/kp_3hourly.csv` | GFZ Kp |
| `data/trajectories.csv` | Movement + magnetic field columns |
| `data/anomaly_report.json` | Recent Anomaly Detection Module |
| `data/hypothesis_tests.json` | H1–H5 tiers |
| `output/fig_*.png` | Figures |

## Live API (deployed edge)

`GET /api/turner-recent-anomaly-report` — JSON report for bulletin & review UI.

## Paper

[`docs/GEOMAGNETIC_HERBIVORE_MOVEMENT_STUDY_2026.md`](../../docs/GEOMAGNETIC_HERBIVORE_MOVEMENT_STUDY_2026.md)

## Critical rule

**Correlation ≠ causation.** Geomagnetic influence is reported only when associations remain after documenting alternative explanations (weather, drought, snow, predators, human activity, habitat, wildfire, management).
