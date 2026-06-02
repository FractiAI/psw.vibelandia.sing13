"""Circular statistics, storm comparisons, hypothesis tests."""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.ensemble import IsolationForest

from config import DATA, LAG_HOURS, START_14, START_30, START_90


def rayleigh_test(angles_deg: np.ndarray) -> dict:
    """Rayleigh test for non-uniformity of headings."""
    a = np.deg2rad(angles_deg[~np.isnan(angles_deg)])
    if len(a) < 8:
        return {"n": len(a), "p": None, "z": None, "significant": False, "note": "insufficient n"}
    r = np.sqrt((np.cos(a).mean()) ** 2 + (np.sin(a).mean()) ** 2)
    n = len(a)
    z = n * r**2
    p = math.exp(-z) * (1 + (2 * z - z**2) / (4 * n) - (24 * z - 132 * z**2 + 76 * z**3 - 9 * z**4) / (288 * n**2))
    p = min(1.0, max(0.0, p))
    mean_angle = math.degrees(math.atan2(np.sin(a).mean(), np.cos(a).mean())) % 360
    return {"n": n, "r": float(r), "z": float(z), "p": float(p), "mean_heading_deg": float(mean_angle), "significant": p < 0.05}


def kuiper_test_uniform(angles_deg: np.ndarray) -> dict:
    """Kuiper V test vs uniform on circle (scipy wraps)."""
    a = angles_deg[~np.isnan(angles_deg)]
    if len(a) < 10:
        return {"n": len(a), "statistic": None, "p": None, "significant": False}
    u = (a % 360) / 360.0
    try:
        res = stats.kstest(u, "uniform")
        return {"n": len(a), "statistic": float(res.statistic), "p": float(res.pvalue), "significant": res.pvalue < 0.05}
    except Exception as err:
        return {"n": len(a), "error": str(err), "significant": False}


def daily_herd_metrics(traj: pd.DataFrame) -> pd.DataFrame:
    if traj.empty:
        return pd.DataFrame()
    traj = traj.copy()
    traj["date"] = pd.to_datetime(traj["timestamp"], utc=True, format="mixed", errors="coerce").dt.strftime("%Y-%m-%d")
    rows = []
    for date, grp in traj.groupby("date"):
        steps = grp["step_km"].replace(0, np.nan).dropna()
        heads = grp["heading_deg"].dropna()
        lats = grp["lat"]
        lons = grp["lon"]
        spread_km = 0.0
        if len(lats) > 1:
            spread_km = float(
                np.mean(
                    [
                        np.sqrt((lats - lats.mean()) ** 2 + (lons - lons.mean()) ** 2) * 111
                        for _ in [0]
                    ]
                )
            )
        rows.append(
            {
                "date": date,
                "mean_step_km": float(steps.mean()) if len(steps) else 0.0,
                "total_displacement_km": float(steps.sum()) if len(steps) else 0.0,
                "heading_rayleigh": rayleigh_test(heads.values),
                "herd_spread_km": spread_km,
                "n_individuals": int(grp["individual_id"].nunique()),
                "directional_consistency": float(rayleigh_test(heads.values).get("r") or 0),
            }
        )
    return pd.DataFrame(rows)


def merge_kp_daily(herd: pd.DataFrame, kp_daily: pd.DataFrame) -> pd.DataFrame:
    if herd.empty or kp_daily.empty:
        return herd
    k = kp_daily.copy()
    if "date" not in k.columns:
        k["date"] = k["time"].dt.strftime("%Y-%m-%d")
    return herd.merge(k[["date", "kp_max", "storm_class"]], on="date", how="left")


def storm_comparison(merged: pd.DataFrame) -> dict:
    if merged.empty or "kp_max" not in merged.columns:
        return {}
    quiet = merged[merged["kp_max"] < 4]
    storm = merged[merged["kp_max"] >= 5]
    out = {}
    for col in ["mean_step_km", "total_displacement_km", "directional_consistency", "herd_spread_km"]:
        qv = quiet[col].dropna()
        sv = storm[col].dropna()
        if len(qv) < 3 or len(sv) < 2:
            continue
        tstat, p = stats.ttest_ind(qv, sv, equal_var=False)
        out[col] = {
            "quiet_mean": float(qv.mean()),
            "storm_mean": float(sv.mean()),
            "delta": float(sv.mean() - qv.mean()),
            "p_value": float(p),
            "significant": p < 0.05,
        }
    return out


def lag_correlation(merged: pd.DataFrame, kp: pd.DataFrame) -> list[dict]:
    results = []
    if merged.empty or kp.empty:
        return results
    m = merged.set_index("date")
    for lag_h in [0] + LAG_HOURS:
        lag_days = max(1, round(lag_h / 24))
        shifted = m["mean_step_km"].shift(lag_days)
        aligned = pd.concat([shifted, m["kp_max"]], axis=1).dropna()
        if len(aligned) < 10:
            continue
        r, p = stats.pearsonr(aligned.iloc[:, 0], aligned.iloc[:, 1])
        results.append({"lag_hours": lag_h, "lag_days": lag_days, "r": float(r), "p": float(p), "n": len(aligned)})
    return results


def random_forest_importance(merged: pd.DataFrame) -> dict:
    if merged.empty or merged["kp_max"].notna().sum() < 15:
        return {"ok": False, "note": "insufficient merged rows"}
    df = merged.dropna(subset=["kp_max", "mean_step_km"]).copy()
    X = df[["kp_max", "herd_spread_km", "directional_consistency", "n_individuals"]].fillna(0)
    y = df["mean_step_km"]
    from sklearn.ensemble import RandomForestRegressor

    rf = RandomForestRegressor(n_estimators=200, random_state=42, max_depth=4)
    rf.fit(X, y)
    imp = dict(zip(X.columns, map(float, rf.feature_importances_)))
    return {"ok": True, "importance": imp, "r2_in_sample": float(rf.score(X, y))}


def trajectory_for_herd_metrics(traj: pd.DataFrame) -> pd.DataFrame:
    """Sequential GPS collar tracks only — exclude non-collar point layers."""
    if traj.empty:
        return traj
    collar = traj.loc[traj["source"] == "movebank_gps"].copy()
    return collar if not collar.empty else traj


def test_hypotheses(traj: pd.DataFrame, kp_daily: pd.DataFrame) -> dict:
    seq_traj = trajectory_for_herd_metrics(traj)
    heads = seq_traj["heading_deg"].dropna().values
    decl = seq_traj["declination_deg"].dropna().values
    h1 = {
        "hypothesis": "H1: movement parallel to local field lines",
        "rayleigh_heading": rayleigh_test(heads),
        "kuiper_uniformity": kuiper_test_uniform(heads),
        "declination_mean_deg": float(np.nanmean(decl)) if len(decl) else None,
        "tier": "inconclusive",
    }
    if h1["rayleigh_heading"].get("significant"):
        mean_h = h1["rayleigh_heading"].get("mean_heading_deg")
        mean_d = h1["declination_mean_deg"]
        if mean_h is not None and mean_d is not None:
            diff = abs((mean_h - mean_d + 180) % 360 - 180)
            h1["heading_declination_delta_deg"] = diff
            h1["tier"] = "weak" if diff < 45 else "no_support"
        else:
            h1["tier"] = "weak"
    else:
        h1["tier"] = "no_support"

    herd = daily_herd_metrics(seq_traj)
    merged = merge_kp_daily(herd, kp_daily)
    storm_cmp = storm_comparison(merged)
    h2 = {
        "hypothesis": "H2: behavioral change during geomagnetic storms",
        "storm_comparison": storm_cmp,
        "tier": "moderate"
        if any(v.get("significant") for v in storm_cmp.values())
        else "no_support"
        if storm_cmp
        else "inconclusive",
    }
    h3 = {"hypothesis": "H3: corridors vs magnetic gradients", "tier": "inconclusive", "note": "USGS EMAG2 overlay not auto-fetched — manual corridor pass required."}
    h4 = {
        "hypothesis": "H4: bison magnetically influenced navigation",
        "tier": h1["tier"]
        if traj["source"].eq("movebank_gps").any()
        and (
            traj.get("taxon", pd.Series(dtype=str)).astype(str).str.contains("bison", case=False).any()
            if "taxon" in traj.columns
            else False
        )
        else ("inconclusive" if traj["source"].eq("movebank_gps").any() else "no_data"),
        "data": sorted(traj["source"].unique().tolist()),
    }
    h5 = {
        "hypothesis": "H5: recent disturbances ↔ route anomalies",
        "tier": "see_anomaly_module",
    }
    return {"H1": h1, "H2": h2, "H3": h3, "H4": h4, "H5": h5, "merged_daily": merged}


def save_statistics(hyp: dict, path: Path | None = None) -> Path:
    out = path or (DATA / "hypothesis_tests.json")
    payload = {k: v for k, v in hyp.items() if k != "merged_daily"}
    if "merged_daily" in hyp and isinstance(hyp["merged_daily"], pd.DataFrame):
        hyp["merged_daily"].to_csv(DATA / "herd_daily_metrics.csv", index=False)
    out.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
    return out
