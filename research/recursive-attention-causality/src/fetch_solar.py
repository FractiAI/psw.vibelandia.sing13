"""Public solar indices — SILSO daily sunspot + GFZ Kp."""
from __future__ import annotations

from urllib.parse import urlencode

import pandas as pd
import requests

SILSO_URL = "https://www.sidc.be/silso/DATA/SN_d_tot_V2.0.csv"
STORM_QUIET_KP = 4


def _classify_storm(kp: float) -> str:
    if kp is None or pd.isna(kp):
        return "unknown"
    if kp < STORM_QUIET_KP:
        return "quiet"
    if kp < 5:
        return "moderate"
    if kp < 8:
        return "strong"
    return "severe"


def fetch_gfz_kp(start: str, end: str) -> pd.DataFrame:
    start_iso = f"{start}T00:00:00Z" if len(start) == 10 else start
    end_iso = f"{end}T23:59:59Z" if len(end) == 10 else end
    q = urlencode({"start": start_iso, "end": end_iso, "index": "Kp", "status": "all"})
    url = f"https://kp.gfz-potsdam.de/app/json/?{q}"
    res = requests.get(url, timeout=90, headers={"User-Agent": "recursive-attention-causality"})
    res.raise_for_status()
    data = res.json()
    times = data.get("datetime") or []
    vals = data.get("Kp") or []
    rows = []
    for t, v in zip(times, vals):
        try:
            kp = float(v)
        except (TypeError, ValueError):
            continue
        rows.append({"time": t, "kp": kp})
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["time"] = pd.to_datetime(df["time"], utc=True)
    return df.sort_values("time").reset_index(drop=True)


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
    daily["storm_class"] = daily["kp_max"].map(_classify_storm)
    daily["date"] = daily["time"].dt.strftime("%Y-%m-%d")
    return daily


def fetch_silso_daily() -> pd.DataFrame:
    text = requests.get(SILSO_URL, timeout=90, headers={"User-Agent": "recursive-attention-causality"}).text
    rows = []
    for line in text.splitlines():
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split(";")]
        if len(parts) < 5:
            continue
        y, m, d, _, ssn = parts[:5]
        if not y.isdigit():
            continue
        iso = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
        try:
            val = float(ssn)
        except ValueError:
            continue
        if val >= 0:
            rows.append({"date": iso, "ssn": val})
    return pd.DataFrame(rows)


def fetch_kp_range(start: str, end: str) -> pd.DataFrame:
    kp = fetch_gfz_kp(start, end)
    if kp.empty:
        return pd.DataFrame()
    return build_kp_daily(kp)


def daily_panel(start: str, end: str) -> pd.DataFrame:
    silso = fetch_silso_daily()
    silso = silso[(silso["date"] >= start) & (silso["date"] <= end)]
    kp = fetch_kp_range(start, end)
    if kp.empty:
        return silso
    return silso.merge(kp[["date", "kp_max", "storm_class"]], on="date", how="outer").sort_values("date")
