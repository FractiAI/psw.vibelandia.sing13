"""Public Movebank GPS collar trajectories (no credentials required)."""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Any

import pandas as pd
import requests

from config import DATA

MOVEBANK_PUBLIC_JSON = "https://www.movebank.org/movebank/service/public/json"

# Preferred public studies (herbivore / large ungulate); first match with GPS wins.
MOVEBANK_PREFERRED_STUDY_IDS: list[int] = [
    2548892515,  # Snowy Range Moose, Wyoming (2019–2020)
    1764627,  # Kruger African Buffalo GPS
    302664172,  # ABoVE: Boutin Alberta Moose
    178994931,  # Peters Hebblewhite Alberta-BC Moose
    143848765,  # Moose Upper Koyukuk Alaska
]

HERBIVORE_NAME_RE = re.compile(
    r"bison|buffalo|moose|elk|deer|cattle|pronghorn|wapiti|caribou|reindeer|antelope|"
    r"zebra|giraffe|goat|sheep|ungulate|grazing",
    re.I,
)

BISON_TAXON_RE = re.compile(r"bison", re.I)


def list_public_studies(timeout: int = 120) -> list[dict[str, Any]]:
    res = requests.get(
        f"{MOVEBANK_PUBLIC_JSON}?entity_type=study",
        timeout=timeout,
    )
    res.raise_for_status()
    data = res.json()
    return data if isinstance(data, list) else []


def rank_public_herbivore_studies(studies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Order public studies: explicit IDs, then name/taxon herbivore match with GPS."""
    by_id = {int(s["id"]): s for s in studies if s.get("id") is not None}
    ordered: list[dict[str, Any]] = []
    seen: set[int] = set()

    def has_gps(s: dict) -> bool:
        st = str(s.get("sensor_type_ids") or "")
        return "gps" in st.lower()

    for sid in MOVEBANK_PREFERRED_STUDY_IDS:
        s = by_id.get(sid)
        if s and has_gps(s):
            ordered.append(s)
            seen.add(sid)

    for s in studies:
        sid = int(s["id"])
        if sid in seen or not has_gps(s):
            continue
        name = s.get("name") or ""
        if HERBIVORE_NAME_RE.search(name):
            ordered.append(s)
            seen.add(sid)

    return ordered


def _ms_to_iso(ms: int | float) -> str:
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_study_gps(
    study_id: int,
    *,
    max_events_per_individual: int = 12000,
    timeout: int = 300,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """Download GPS fixes from Movebank public JSON API."""
    url = (
        f"{MOVEBANK_PUBLIC_JSON}?study_id={study_id}"
        f"&sensor_type=gps&max_events_per_individual={max_events_per_individual}"
    )
    res = requests.get(url, timeout=timeout)
    res.raise_for_status()
    payload = res.json()
    individuals = payload.get("individuals") if isinstance(payload, dict) else None
    if not individuals:
        return pd.DataFrame(), {"studyId": study_id, "error": "no_individuals"}

    rows: list[dict[str, Any]] = []
    taxa: set[str] = set()
    for ind in individuals:
        local_id = ind.get("individual_local_identifier") or ind.get("individual_id")
        taxon = ind.get("individual_taxon_canonical_name") or ""
        taxa.add(taxon)
        for loc in ind.get("locations") or []:
            lat = loc.get("location_lat")
            lon = loc.get("location_long")
            ts = loc.get("timestamp")
            if lat is None or lon is None or ts is None:
                continue
            rows.append(
                {
                    "individual_id": f"mb-{study_id}-{local_id}",
                    "timestamp": _ms_to_iso(ts),
                    "lat": float(lat),
                    "lon": float(lon),
                    "source": "movebank_gps",
                    "movebank_study_id": study_id,
                    "taxon": taxon,
                }
            )

    df = pd.DataFrame(rows)
    meta = {
        "studyId": study_id,
        "individuals": len(individuals),
        "points": len(df),
        "taxa": sorted(taxa),
        "hasBisonTaxon": any(BISON_TAXON_RE.search(t) for t in taxa),
    }
    if not df.empty:
        ts = pd.to_datetime(df["timestamp"], utc=True)
        meta["trajectoryStart"] = ts.min().date().isoformat()
        meta["trajectoryEnd"] = ts.max().date().isoformat()
    return df, meta


def select_analysis_window(
    traj: pd.DataFrame,
    *,
    focus_days: int = 90,
    baseline_years: int = 5,
) -> dict[str, str]:
    """Pick the latest `focus_days` of collar data; baseline = prior years for Kp z-scores."""
    if traj.empty:
        today = datetime.now(timezone.utc).date()
        end = today.isoformat()
        start = (today - timedelta(days=focus_days)).isoformat()
        baseline = (today - timedelta(days=365 * baseline_years)).isoformat()
        return {
            "analysisEnd": end,
            "analysisStart90": start,
            "analysisStart30": (today - timedelta(days=30)).isoformat(),
            "analysisStart14": (today - timedelta(days=14)).isoformat(),
            "baselineStart": baseline,
            "note": "empty_trajectory_fallback_calendar",
        }

    ts = pd.to_datetime(traj["timestamp"], utc=True)
    end_dt = ts.max().date()
    start_90 = (end_dt - timedelta(days=focus_days - 1))
    traj_start = ts.min().date()
    if start_90 < traj_start:
        start_90 = traj_start
    baseline_start = end_dt - timedelta(days=365 * baseline_years)
    if baseline_start < traj_start:
        baseline_start = traj_start

    today = datetime.now(timezone.utc).date()
    return {
        "analysisEnd": end_dt.isoformat(),
        "analysisStart90": start_90.isoformat(),
        "analysisStart30": (end_dt - timedelta(days=29)).isoformat(),
        "analysisStart14": (end_dt - timedelta(days=13)).isoformat(),
        "baselineStart": baseline_start.isoformat(),
        "collarFirst": traj_start.isoformat(),
        "collarLast": end_dt.isoformat(),
        "calendarEnd": today.isoformat(),
        "collarOverlapsCalendarRecent": end_dt >= (today - timedelta(days=13)),
        "note": "aligned_to_public_collar_observation_window",
    }


def filter_trajectory_to_window(traj: pd.DataFrame, window: dict[str, str]) -> pd.DataFrame:
    if traj.empty:
        return traj
    start = pd.Timestamp(window["analysisStart90"], tz="UTC")
    end = pd.Timestamp(f"{window['analysisEnd']}T23:59:59Z")
    ts = pd.to_datetime(traj["timestamp"], utc=True)
    return traj.loc[(ts >= start) & (ts <= end)].copy()


def fetch_public_collar_trajectories(
    *,
    max_events_per_individual: int = 12000,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Primary movement layer: publicly downloadable GPS collar data from Movebank.
    Tries preferred herbivore studies in order until one returns fixes.
    """
    studies = list_public_studies()
    ranked = rank_public_herbivore_studies(studies)
    attempts: list[dict[str, Any]] = []

    for study in ranked:
        sid = int(study["id"])
        df, meta = fetch_study_gps(sid, max_events_per_individual=max_events_per_individual)
        meta["studyName"] = study.get("name")
        meta["licenseNote"] = (
            "Public Movebank study — accept owner terms at movebank.org before redistribution."
        )
        attempts.append(meta)
        if not df.empty:
            window = select_analysis_window(df)
            filtered = filter_trajectory_to_window(df, window)
            if filtered.empty:
                filtered = df
            return filtered, {
                "primarySource": "movebank_gps",
                "selectedStudy": meta,
                "analysisWindow": window,
                "publicStudiesScanned": len(studies),
                "herbivoreCandidates": len(ranked),
                "attempts": attempts,
            }

    return pd.DataFrame(), {
        "primarySource": None,
        "error": "no_public_collar_gps_found",
        "publicStudiesScanned": len(studies),
        "herbivoreCandidates": len(ranked),
        "attempts": attempts,
    }


def save_analysis_window(window: dict[str, str]) -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / "analysis_window.json").write_text(json.dumps(window, indent=2), encoding="utf-8")
