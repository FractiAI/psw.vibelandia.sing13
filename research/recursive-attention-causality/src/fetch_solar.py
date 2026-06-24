"""Public solar indices — SILSO, NOAA F10.7, GFZ Kp/Ap."""
from __future__ import annotations

import re
from urllib.parse import urlencode

import numpy as np
import pandas as pd
import requests

SILSO_URL = "https://www.sidc.be/silso/DATA/SN_d_tot_V2.0.csv"
SWPC_DAILY_URL = "https://services.swpc.noaa.gov/text/daily-solar-indices.txt"
F107_NOON_URL = "https://services.swpc.noaa.gov/json/f107_cm_flux.json"
F107_MONTHLY_URL = "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json"
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


def fetch_gfz_index(index: str, start: str, end: str) -> pd.DataFrame:
    start_iso = f"{start}T00:00:00Z" if len(start) == 10 else start
    end_iso = f"{end}T23:59:59Z" if len(end) == 10 else end
    q = urlencode({"start": start_iso, "end": end_iso, "index": index, "status": "all"})
    url = f"https://kp.gfz-potsdam.de/app/json/?{q}"
    res = requests.get(url, timeout=90, headers={"User-Agent": "recursive-attention-causality"})
    res.raise_for_status()
    data = res.json()
    times = data.get("datetime") or []
    vals = data.get(index) or []
    rows = []
    for t, v in zip(times, vals):
        try:
            val = float(v)
        except (TypeError, ValueError):
            continue
        rows.append({"time": t, index.lower(): val})
    df = pd.DataFrame(rows)
    if df.empty:
        return df
    df["time"] = pd.to_datetime(df["time"], utc=True)
    col = index.lower()
    return df.sort_values("time").reset_index(drop=True).rename(columns={col: col})


def build_kp_daily(kp_df: pd.DataFrame) -> pd.DataFrame:
    if kp_df.empty:
        return kp_df
    col = "kp" if "kp" in kp_df.columns else kp_df.columns[-1]
    daily = (
        kp_df.set_index("time")[col]
        .resample("1D")
        .max()
        .reset_index()
        .rename(columns={col: "kp_max"})
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


def _parse_swpc_daily(txt: str) -> tuple[dict[str, float], dict[str, float]]:
    ssn_by_day: dict[str, float] = {}
    f107_by_day: dict[str, float] = {}
    for line in txt.splitlines():
        m = re.match(r"^(\d{4})\s+(\d{2})\s+(\d{2})\s+(\d+)\s+(\d+)", line)
        if not m:
            continue
        iso = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        f107_by_day[iso] = float(m.group(4))
        ssn_by_day[iso] = float(m.group(5))
    return ssn_by_day, f107_by_day


def _f107_noon_json() -> dict[str, float]:
    rows = requests.get(F107_NOON_URL, timeout=60, headers={"User-Agent": "recursive-attention-causality"}).json()
    out = {}
    for r in rows:
        if r.get("reporting_schedule") != "Noon":
            continue
        day = r["time_tag"][:10]
        out[day] = float(r["flux"])
    return out


def _f107_monthly() -> dict[str, float]:
    rows = requests.get(F107_MONTHLY_URL, timeout=60, headers={"User-Agent": "recursive-attention-causality"}).json()
    out = {}
    for row in rows:
        tag = row.get("time-tag") or row.get("time_tag")
        if not tag:
            continue
        f = float(row.get("f10.7") or row.get("f107") or 0)
        if f > 0:
            out[tag[:7]] = f
    return out


def f107_for_date(iso: str, noon: dict[str, float], swpc: dict[str, float], monthly: dict[str, float]) -> float | None:
    if iso in noon:
        return noon[iso]
    if iso in swpc:
        return swpc[iso]
    mk = iso[:7]
    return monthly.get(mk)


def fetch_f107_daily(start: str, end: str) -> pd.DataFrame:
    """Historical F10.7 — noon JSON + SWPC daily table + monthly fill."""
    try:
        swpc_txt = requests.get(SWPC_DAILY_URL, timeout=60, headers={"User-Agent": "recursive-attention-causality"}).text
        _, swpc_f107 = _parse_swpc_daily(swpc_txt)
    except Exception:
        swpc_f107 = {}
    noon = _f107_noon_json()
    monthly = _f107_monthly()

    silso = fetch_silso_daily()
    dates = silso[(silso["date"] >= start) & (silso["date"] <= end)]["date"]
    rows = []
    for d in dates:
        f = f107_for_date(d, noon, swpc_f107, monthly)
        if f is not None and f > 0:
            rows.append({"date": d, "f107": f})
    return pd.DataFrame(rows)


def fetch_kp_range(start: str, end: str) -> pd.DataFrame:
    kp = fetch_gfz_index("Kp", start, end).rename(columns={"kp": "kp"})
    if kp.empty:
        return pd.DataFrame()
    return build_kp_daily(kp)


def fetch_ap_range(start: str, end: str) -> pd.DataFrame:
    ap = fetch_gfz_index("Ap", start, end)
    if ap.empty:
        return pd.DataFrame()
    daily = (
        ap.set_index("time")["ap"]
        .resample("1D")
        .mean()
        .reset_index()
        .rename(columns={"ap": "ap_mean"})
    )
    daily["date"] = daily["time"].dt.strftime("%Y-%m-%d")
    return daily


def daily_panel(start: str, end: str) -> pd.DataFrame:
    silso = fetch_silso_daily()
    silso = silso[(silso["date"] >= start) & (silso["date"] <= end)]
    f107 = fetch_f107_daily(start, end)
    kp = fetch_kp_range(start, end)
    ap = fetch_ap_range(start, end)

    panel = silso
    if not f107.empty:
        panel = panel.merge(f107, on="date", how="outer")
    if not kp.empty:
        panel = panel.merge(kp[["date", "kp_max", "storm_class"]], on="date", how="outer")
    if not ap.empty:
        panel = panel.merge(ap[["date", "ap_mean"]], on="date", how="outer")
    return panel.sort_values("date").reset_index(drop=True)


def day_of_year_features(dates: list[str] | pd.Series) -> tuple[np.ndarray, np.ndarray]:
    doy = pd.to_datetime(pd.Series(dates)).dt.dayofyear.astype(float).values
    ang = 2 * np.pi * doy / 365.25
    return np.sin(ang), np.cos(ang)
