# Data dictionary · Geomagnetic herbivore study

**Schema version:** `geomagnetic-herbivore/v1`  
**Document:** HHA-GEOMAG-HERBIVORE-2026

## `inventory.json`

| Field | Type | Description |
|-------|------|-------------|
| `generatedAt` | ISO-8601 | Inventory build time (UTC) |
| `sources[]` | array | One record per attempted public source |
| `sources[].id` | string | Stable source key |
| `sources[].category` | string | `movement`, `geomagnetic`, `environment`, `agency` |
| `sources[].url` | string | Canonical access URL |
| `sources[].status` | string | `available`, `partial`, `requires_auth`, `not_fetched` |
| `sources[].notes` | string | Access constraints |

## `kp_hourly.parquet` / `kp_daily.csv`

| Column | Description |
|--------|-------------|
| `time` | UTC interval start (3-hourly for Kp) |
| `kp` | Planetary K-index (0–9 scale) |
| `status` | GFZ definitive / preliminary flag when present |
| `storm_class` | `quiet`, `moderate`, `strong`, `severe` |

## `trajectories.csv`

| Column | Description |
|--------|-------------|
| `individual_id` | Animal or synthesis slot ID |
| `timestamp` | UTC observation time |
| `lat`, `lon` | WGS84 degrees |
| `source` | `turner_synthesis`, `movebank`, `gbif`, etc. |
| `heading_deg` | Movement vector bearing (0–360°, geographic north) |
| `step_km` | Displacement since prior fix |
| `speed_kmh` | Step speed |
| `declination_deg` | Local magnetic declination (WMM via geomag) |
| `inclination_deg` | Field inclination when available |
| `intensity_nt` | Total field intensity (nT) when available |

## `anomaly_report.json`

| Field | Description |
|-------|-------------|
| `classification` | `none`, `weak`, `moderate`, `strong`, `extraordinary` |
| `hypotheses.H1`–`H5` | Evidence tier per hypothesis |
| `rankedAnomalies[]` | Sorted anomaly list with confidence |
| `stormEvents[]` | Kp≥5 / severe windows with lagged movement deltas |
| `alternativeExplanations` | Weather, drought, management, etc. |
| `causationRule` | Correlation ≠ causation statement |
