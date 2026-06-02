"""Movement data — public GPS collar (Movebank) primary; GBIF points optional context only."""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from config import DATA
from src.fetch_movebank import (
    fetch_public_collar_trajectories,
    save_analysis_window,
)


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(min(1.0, a)))


def bearing_deg(lat1, lon1, lat2, lon2):
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlon) * math.cos(phi2)
    y = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlon)
    brng = math.degrees(math.atan2(x, y))
    return (brng + 360) % 360


def enrich_trajectories(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    try:
        import geomag

        gm = geomag.geomag.GeoMag()
    except Exception:
        gm = None

    df = df.dropna(subset=["lat", "lon"]).sort_values(["individual_id", "timestamp"]).reset_index(drop=True)
    out = []
    for _, grp in df.groupby("individual_id"):
        grp = grp.copy().reset_index(drop=True)
        prev_lat = prev_lon = None
        prev_t = None
        headings, steps, speeds = [], [], []
        for _, row in grp.iterrows():
            lat, lon = row["lat"], row["lon"]
            t = pd.to_datetime(row["timestamp"], utc=True)
            if prev_lat is not None:
                dist = haversine_km(prev_lat, prev_lon, lat, lon)
                dt_h = max((t - prev_t).total_seconds() / 3600, 1e-6)
                h = bearing_deg(prev_lat, prev_lon, lat, lon)
                headings.append(h)
                steps.append(dist)
                speeds.append(dist / dt_h)
            else:
                headings.append(float("nan"))
                steps.append(0.0)
                speeds.append(0.0)
            prev_lat, prev_lon, prev_t = lat, lon, t
        grp["heading_deg"] = headings
        grp["step_km"] = steps
        grp["speed_kmh"] = speeds
        decl, incl, intensity = [], [], []
        for _, row in grp.iterrows():
            if gm:
                try:
                    m = gm.GeoMag(row["lat"], row["lon"], time=pd.to_datetime(row["timestamp"]).year)
                    decl.append(m.dec)
                    incl.append(m.dip)
                    intensity.append(m.field)
                except Exception:
                    decl.append(float("nan"))
                    incl.append(float("nan"))
                    intensity.append(float("nan"))
            else:
                decl.append(float("nan"))
                incl.append(float("nan"))
                intensity.append(float("nan"))
        grp["declination_deg"] = decl
        grp["inclination_deg"] = incl
        grp["intensity_nt"] = intensity
        out.append(grp)
    return pd.concat(out, ignore_index=True)


def run_fetch_movement() -> pd.DataFrame:
    """
    Primary: publicly available GPS collar trajectories from Movebank.
    Does not use Turner synthesis or synthetic placeholders.
    """
    DATA.mkdir(parents=True, exist_ok=True)
    collar, fetch_meta = fetch_public_collar_trajectories()

    if collar.empty:
        meta = {
            "fetchedAt": datetime.now(timezone.utc).isoformat(),
            "rows": 0,
            "individuals": 0,
            "sources": [],
            "primarySource": None,
            "error": fetch_meta.get("error") or "no_public_collar_data",
            "fetchMeta": fetch_meta,
            "note": (
                "No public GPS collar fixes retrieved. "
                "Study cannot run movement–geomagnetic tests until a public Movebank study is available."
            ),
        }
        (DATA / "movement_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
        (DATA / "trajectories.csv").write_text(
            "individual_id,timestamp,lat,lon,source\n", encoding="utf-8"
        )
        return collar

    window = fetch_meta.get("analysisWindow") or {}
    save_analysis_window(window)

    df = enrich_trajectories(collar)
    df.to_csv(DATA / "trajectories.csv", index=False)

    study = fetch_meta.get("selectedStudy") or {}
    taxa = study.get("taxa") or []
    meta = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "rows": len(df),
        "individuals": int(df["individual_id"].nunique()),
        "sources": sorted(df["source"].unique().tolist()),
        "primarySource": "movebank_gps",
        "movebankStudyId": study.get("studyId"),
        "movebankStudyName": study.get("studyName"),
        "taxa": taxa,
        "bisonCollarInStudy": bool(study.get("hasBisonTaxon")),
        "analysisWindow": window,
        "fetchMeta": fetch_meta,
        "note": (
            "Movement layer = public GPS collar fixes from Movebank "
            f"(study {study.get('studyId')}: {study.get('studyName')}). "
            "Kp alignment uses the collar observation window, not synthetic placement."
        ),
    }
    if not meta["bisonCollarInStudy"]:
        meta["speciesNote"] = (
            "No public Movebank study with Bison bison GPS was found in the public catalog; "
            f"using nearest large-herbivore collar data ({', '.join(taxa) or 'see taxa'})."
        )
    (DATA / "movement_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return df
