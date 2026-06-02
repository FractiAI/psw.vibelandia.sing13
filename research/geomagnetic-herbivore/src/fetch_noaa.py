"""Fetch geomagnetic indices (GFZ Kp/Ap) and NOAA SWPC context."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import pandas as pd
import requests

from config import ARCHIVE, BASELINE_START, DATA, END_DATE, STORM_MOD_KP, STORM_QUIET_KP, STORM_SEVERE_KP, STORM_STRONG_KP


def _fetch_json(url: str, timeout: int = 60) -> dict:
    res = requests.get(url, timeout=timeout)
    res.raise_for_status()
    return res.json()


def fetch_gfz_index(index: str, start: str, end: str, status: str = "all") -> pd.DataFrame:
    """GFZ Web Service API — 3-hourly Kp or Ap."""
    start_iso = f"{start}T00:00:00Z" if len(start) == 10 else start
    end_iso = f"{end}T23:59:59Z" if len(end) == 10 else end
    q = urlencode({"start": start_iso, "end": end_iso, "index": index})
    url = f"https://kp.gfz-potsdam.de/app/json/?{q}"
    if index in ("Kp", "ap", "Ap", "Cp", "C9", "SN") and status:
        url += f"&status={status}"
    data = _fetch_json(url)
    times = data.get("datetime") or []
    vals = data.get(index) or []
    stat = data.get("status") or [None] * len(times)
    rows = []
    for t, v, s in zip(times, vals, stat):
        try:
            kp = float(v)
        except (TypeError, ValueError):
            continue
        rows.append({"time": t, index.lower(): kp, "status": s})
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["time"] = pd.to_datetime(df["time"], utc=True)
    return df.sort_values("time").reset_index(drop=True)


def classify_storm(kp: float) -> str:
    if kp is None or pd.isna(kp):
        return "unknown"
    if kp < STORM_QUIET_KP:
        return "quiet"
    if STORM_MOD_KP[0] <= kp <= STORM_MOD_KP[1]:
        return "moderate"
    if STORM_STRONG_KP[0] <= kp <= STORM_STRONG_KP[1]:
        return "strong"
    if kp >= STORM_SEVERE_KP:
        return "severe"
    return "elevated"


def build_kp_daily(kp_df: pd.DataFrame) -> pd.DataFrame:
    if kp_df.empty:
        return kp_df
    daily = (
        kp_df.set_index("time")["kp"]
        .resample("1D")
        .max()
        .reset_index()
        .rename(columns={"kp": "kp_max"})
    )
    daily["storm_class"] = daily["kp_max"].map(classify_storm)
    daily["date"] = daily["time"].dt.strftime("%Y-%m-%d")
    return daily


def storm_events(kp_df: pd.DataFrame, threshold: float = 5.0) -> list[dict]:
    events = []
    if kp_df.empty:
        return events
    flag = kp_df["kp"] >= threshold
    grp = (flag != flag.shift()).cumsum()
    for _, block in kp_df[flag].groupby(grp):
        if block.empty:
            continue
        events.append(
            {
                "start": block["time"].iloc[0].isoformat(),
                "end": block["time"].iloc[-1].isoformat(),
                "kpMax": float(block["kp"].max()),
                "kpMean": float(block["kp"].mean()),
                "intervals": int(len(block)),
                "tier": "kp_ge_5" if threshold == 5 else f"kp_ge_{int(threshold)}",
            }
        )
    severe = [e for e in events if e["kpMax"] >= STORM_SEVERE_KP]
    return {"kp5_plus": events, "severe_kp8_plus": severe}


def fetch_swpc_regions() -> dict:
    try:
        rows = _fetch_json("https://services.swpc.noaa.gov/json/solar_regions.json")
        return {"ok": True, "regions": rows[:20], "fetchedAt": datetime.now(timezone.utc).isoformat()}
    except Exception as err:
        return {"ok": False, "error": str(err)}


def run_fetch(start: str = BASELINE_START, end: str = END_DATE) -> dict:
    DATA.mkdir(parents=True, exist_ok=True)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    kp = fetch_gfz_index("Kp", start, end)
    ap = fetch_gfz_index("Ap", start, end)
    if not kp.empty:
        kp["storm_class"] = kp["kp"].map(classify_storm)
        kp.to_csv(DATA / "kp_3hourly.csv", index=False)
        daily = build_kp_daily(kp)
        daily.to_csv(DATA / "kp_daily.csv", index=False)
        ARCHIVE.joinpath(f"kp_3hourly_{end}.csv").write_text(kp.to_csv(index=False), encoding="utf-8")
    if not ap.empty:
        ap.to_csv(DATA / "ap_3hourly.csv", index=False)
    swpc = fetch_swpc_regions()
    meta = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "start": start,
        "end": end,
        "kpRows": len(kp),
        "apRows": len(ap),
        "events": storm_events(kp) if not kp.empty else {},
        "swpcRegions": swpc,
        "sources": ["GFZ kp.gfz-potsdam.de", "NOAA SWPC solar_regions.json"],
    }
    (DATA / "geomagnetic_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return {"kp": kp, "ap": ap, "meta": meta}
