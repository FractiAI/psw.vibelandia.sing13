"""Step 1–2: Public data inventory and metadata documentation."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from config import ARCHIVE, DATA


def build_inventory() -> dict:
    sources = [
        {
            "id": "gfz_kp",
            "category": "geomagnetic",
            "name": "GFZ Potsdam Kp / Ap index (Web Service API)",
            "url": "https://kp.gfz.de/app/json/",
            "license": "CC BY 4.0 (GFZ)",
            "status": "available",
            "notes": "Primary Kp/Ap time series for storm windows and lag analysis.",
        },
        {
            "id": "noaa_swpc",
            "category": "geomagnetic",
            "name": "NOAA SWPC planetary K-index & solar regions",
            "url": "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
            "license": "US Government work",
            "status": "available",
            "notes": "Near-real-time Kp; flare/region context.",
        },
        {
            "id": "noaa_swpc_daily",
            "category": "geomagnetic",
            "name": "NOAA SWPC daily solar indices (text)",
            "url": "https://services.swpc.noaa.gov/text/daily-solar-indices.txt",
            "license": "US Government work",
            "status": "available",
            "notes": "Sunspot / supplementary indices.",
        },
        {
            "id": "usgs_emag",
            "category": "geomagnetic",
            "name": "USGS geomagnetic grids / EMAG2",
            "url": "https://www.usgs.gov/tools/emag2",
            "license": "USGS",
            "status": "partial",
            "notes": "Crustal anomaly overlays — manual download for corridor analysis.",
        },
        {
            "id": "wmm",
            "category": "geomagnetic",
            "name": "World Magnetic Model (via geomag Python)",
            "url": "https://www.ncei.noaa.gov/products/world-magnetic-model",
            "license": "Public domain / NOAA",
            "status": "available",
            "notes": "Declination/inclination/intensity at trajectory points.",
        },
        {
            "id": "movebank",
            "category": "movement",
            "name": "Movebank public GPS JSON API",
            "url": "https://www.movebank.org/movebank/service/public/json",
            "license": "Study-specific (public download)",
            "status": "available",
            "notes": "Primary collar layer — public/json for studies owners marked public. Preferred IDs in fetch_movebank.py.",
        },
        {
            "id": "gbif",
            "category": "movement",
            "name": "GBIF occurrence API",
            "url": "https://api.gbif.org/v1/occurrence/search",
            "license": "Dataset-specific CC",
            "status": "available",
            "notes": "Point occurrences (Bison bison, Cervus, etc.) — not full trajectories.",
        },
        {
            "id": "open_meteo",
            "category": "environment",
            "name": "Open-Meteo archive (precip, temp, soil)",
            "url": "https://archive-api.open-meteo.com/v1/archive",
            "license": "Open Database License",
            "status": "available",
            "notes": "Environmental controls for alternative-explanation tests.",
        },
        {
            "id": "turner_synthesis",
            "category": "movement",
            "name": "Turner passive bison synthesis (psw.vibelandia.sing13)",
            "url": "/api/turner-bison-telemetry",
            "license": "Repository terms",
            "status": "not_used",
            "notes": "Excluded from geomagnetic study — not collar GPS.",
        },
        {
            "id": "nps_yellowstone",
            "category": "agency",
            "name": "Yellowstone National Park bison reports",
            "url": "https://www.nps.gov/yell/learn/nature/bison.htm",
            "license": "US Government work",
            "status": "not_fetched",
            "notes": "Qualitative management reports — manual archive for review.",
        },
        {
            "id": "modis_ndvi",
            "category": "environment",
            "name": "MODIS NDVI (LP DAAC)",
            "url": "https://lpdaac.usgs.gov/",
            "license": "NASA/USGS",
            "status": "partial",
            "notes": "Habitat NDVI — optional extended pipeline.",
        },
    ]
    return {
        "schema": "geomagnetic-herbivore/v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": sources,
        "crs": "EPSG:4326 (WGS84) for all lat/lon fields",
        "timestampStandard": "UTC ISO-8601",
    }


def write_inventory(path: Path | None = None) -> Path:
    DATA.mkdir(parents=True, exist_ok=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    out = path or (DATA / "inventory.json")
    payload = build_inventory()
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    archive = ARCHIVE / f"inventory_{payload['generatedAt'][:10]}.json"
    archive.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return out
