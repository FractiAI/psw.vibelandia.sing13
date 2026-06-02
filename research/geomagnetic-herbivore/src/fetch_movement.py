"""Steps 3–6: Movement data — GBIF points + Turner API synthesis trajectories."""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import pandas as pd
import requests

from config import CENTROID_LAT, CENTROID_LON, DATA, END_DATE, START_90, STUDY_BBOX


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


def fetch_gbif_occurrences(taxon: str = "Bison bison", limit: int = 300) -> pd.DataFrame:
    q = urlencode(
        {
            "scientificName": taxon,
            "decimalLatitude": f"{STUDY_BBOX['south']},{STUDY_BBOX['north']}",
            "decimalLongitude": f"{STUDY_BBOX['west']},{STUDY_BBOX['east']}",
            "limit": str(limit),
            "hasCoordinate": "true",
        }
    )
    url = f"https://api.gbif.org/v1/occurrence/search?{q}"
    try:
        res = requests.get(url, timeout=45)
        res.raise_for_status()
        data = res.json()
    except Exception:
        return pd.DataFrame()
    rows = []
    for r in data.get("results") or []:
        lat, lon = r.get("decimalLatitude"), r.get("decimalLongitude")
        if lat is None or lon is None:
            continue
        rows.append(
            {
                "individual_id": f"gbif-{r.get('key')}",
                "timestamp": r.get("eventDate") or r.get("lastInterpreted"),
                "lat": lat,
                "lon": lon,
                "source": "gbif",
            }
        )
    return pd.DataFrame(rows)


def fetch_turner_timeseries(base_url: str, start: str, end: str, sample: int = 48) -> pd.DataFrame:
    """Pull daily synthesis from local or deployed Turner telemetry API."""
    q = urlencode(
        {
            "start": start,
            "end": end,
            "sample": str(sample),
            "daily": "1",
            "snapshots": "0",
        }
    )
    url = f"{base_url.rstrip('/')}/api/turner-bison-telemetry?{q}"
    try:
        res = requests.get(url, timeout=120)
        res.raise_for_status()
        payload = res.json()
    except Exception:
        return pd.DataFrame()
    if not payload.get("ok"):
        return pd.DataFrame()
    series = payload.get("series") or {}
    rows = []
    for day in series.get("daily") or []:
        date = day.get("date")
        for a in day.get("animals") or []:
            rows.append(
                {
                    "individual_id": a.get("id"),
                    "timestamp": f"{date}T12:00:00Z",
                    "lat": a.get("lat"),
                    "lon": a.get("lng"),
                    "pasture_id": a.get("pastureId"),
                    "source": "turner_synthesis",
                    "weight_lbs": a.get("weightLbs"),
                }
            )
    return pd.DataFrame(rows)


def synthesize_placeholder_trajectory(days: int = 90, n_animals: int = 24) -> pd.DataFrame:
    """Deterministic placeholder when API unavailable — clearly labeled."""
    import random

    rng = random.Random(161803)
    rows = []
    base_lat, base_lon = CENTROID_LAT, CENTROID_LON
    for i in range(n_animals):
        lat, lon = base_lat + rng.uniform(-0.8, 0.8), base_lon + rng.uniform(-1.2, 1.2)
        for d in range(days):
            date = (pd.Timestamp(END_DATE) - pd.Timedelta(days=days - 1 - d)).strftime("%Y-%m-%d")
            lat += rng.gauss(0, 0.02)
            lon += rng.gauss(0, 0.03)
            rows.append(
                {
                    "individual_id": f"placeholder-{i:02d}",
                    "timestamp": f"{date}T12:00:00Z",
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                    "source": "placeholder_deterministic",
                }
            )
    return pd.DataFrame(rows)


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
    for ind, grp in df.groupby("individual_id"):
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


def run_fetch_movement(turner_base: str = "http://127.0.0.1:3000") -> pd.DataFrame:
    DATA.mkdir(parents=True, exist_ok=True)
    turner = fetch_turner_timeseries(turner_base, START_90, END_DATE)
    if turner.empty:
        turner = synthesize_placeholder_trajectory(90)
    gbif = fetch_gbif_occurrences("Bison bison", 200)
    frames = [f for f in [turner, gbif] if not f.empty]
    df = pd.concat(frames, ignore_index=True) if frames else synthesize_placeholder_trajectory(90)
    df = enrich_trajectories(df)
    df.to_csv(DATA / "trajectories.csv", index=False)
    meta = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "rows": len(df),
        "individuals": int(df["individual_id"].nunique()) if not df.empty else 0,
        "sources": sorted(df["source"].unique().tolist()) if not df.empty else [],
        "note": "Turner synthesis is model placement, not collar GPS. GBIF are point occurrences.",
    }
    (DATA / "movement_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return df
