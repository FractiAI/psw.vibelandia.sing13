"""Study configuration — Geomagnetic Influences on Bison and Large Herbivore Movement."""
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
DATA = ROOT / "data"
ARCHIVE = DATA / "archive"

# Analysis windows (UTC)
AS_OF = datetime.now(timezone.utc).date()
END_DATE = AS_OF.isoformat()
START_90 = (AS_OF - timedelta(days=90)).isoformat()
START_30 = (AS_OF - timedelta(days=30)).isoformat()
START_14 = (AS_OF - timedelta(days=14)).isoformat()
BASELINE_YEARS = 5
BASELINE_START = (AS_OF - timedelta(days=365 * BASELINE_YEARS)).isoformat()

# Turner / Great Plains synthesis bbox (public registry pastures)
STUDY_BBOX = dict(west=-114.0, east=-100.0, south=32.0, north=48.0)
CENTROID_LAT = 40.5
CENTROID_LON = -107.0

DOC_ID = "HHA-GEOMAG-HERBIVORE-2026"
STUDY_TITLE = (
    "Geomagnetic Influences on Bison and Large Herbivore Movement — "
    "Autonomous Research & Recent Anomaly Detection Module"
)

LAG_HOURS = [24, 48, 72, 168]  # 0–24h handled as same-window; 168 = 7d

STORM_QUIET_KP = 4
STORM_MOD_KP = (4, 5)
STORM_STRONG_KP = (6, 7)
STORM_SEVERE_KP = 8
