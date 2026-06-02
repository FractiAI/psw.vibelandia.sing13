"""Recent Anomaly Detection Module — 90 / 30 / 14 day focus."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.ensemble import IsolationForest

try:
    import ruptures as rpt
except ImportError:
    rpt = None

from config import DATA, END_DATE, START_14, START_30, START_90


CLASSIFICATIONS = ["none", "weak", "moderate", "strong", "extraordinary"]


def zscore_flags(series: pd.Series, window: int = 30, z: float = 2.0) -> pd.Series:
    s = series.astype(float)
    mu = s.rolling(window, min_periods=max(5, window // 3)).mean()
    sd = s.rolling(window, min_periods=max(5, window // 3)).std().replace(0, np.nan)
    return ((s - mu) / sd).abs() >= z


def change_points(series: pd.Series, pen: float = 3.0) -> list:
    y = series.dropna().values.reshape(-1, 1)
    if len(y) < 12 or rpt is None:
        return []
    try:
        algo = rpt.Pelt(model="rbf").fit(y)
        idx = algo.predict(pen=pen)
        return [int(i) for i in idx[:-1]]
    except Exception:
        return []


def bayesian_anomaly_prob(obs: float, prior_mean: float, prior_std: float) -> float:
    """Normal-normal conjugate: P(|X| > obs) style anomaly score."""
    if prior_std <= 0 or not np.isfinite(obs):
        return 0.0
    z = abs(obs - prior_mean) / prior_std
    return float(2 * (1 - stats.norm.cdf(z)))


def isolation_scores(df: pd.DataFrame, cols: list[str]) -> np.ndarray:
    X = df[cols].fillna(df[cols].median())
    if len(X) < 10:
        return np.zeros(len(X))
    clf = IsolationForest(contamination=0.08, random_state=42)
    pred = clf.fit_predict(X)
    return (pred == -1).astype(int)


def rank_anomalies(merged: pd.DataFrame, kp_events: dict, windows: dict) -> list[dict]:
    ranked = []
    if merged.empty:
        return ranked
    metrics = ["mean_step_km", "total_displacement_km", "directional_consistency", "herd_spread_km"]
    baseline = merged[merged["date"] < START_90] if "date" in merged.columns else merged.iloc[: max(1, len(merged) // 2)]
    for metric in metrics:
        if metric not in merged.columns:
            continue
        base = baseline[metric].dropna()
        if len(base) < 5:
            continue
        mu, sd = float(base.mean()), float(base.std() or 1e-6)
        if sd < 1e-3:
            continue
        for win_name, start in windows.items():
            block = merged[merged["date"] >= start] if "date" in merged.columns else merged.tail(14)
            for _, row in block.iterrows():
                val = row.get(metric)
                if val is None or not np.isfinite(val):
                    continue
                z = (val - mu) / sd
                if abs(z) < 1.5:
                    continue
                p_bayes = bayesian_anomaly_prob(val, mu, sd)
                zc = float(max(-10.0, min(10.0, z)))
                ranked.append(
                    {
                        "date": row.get("date"),
                        "window": win_name,
                        "metric": metric,
                        "value": float(val),
                        "baseline_mean": mu,
                        "z_score": zc,
                        "z_score_raw": float(z),
                        "bayesian_tail_p": p_bayes,
                        "environmental_explanations": [
                            "seasonal forage / soil moisture (Open-Meteo)",
                            "temperature / drought index",
                            "management rotation or fencing",
                        ],
                        "geomagnetic_explanations": [
                            "elevated Kp interval",
                            "solar region activity (NOAA SWPC)",
                        ],
                        "evidence_for_geomagnetic": [],
                        "evidence_against_geomagnetic": [
                            "correlation not causation",
                            "Turner synthesis ≠ collar telemetry",
                        ],
                    }
                )
    ranked.sort(key=lambda x: abs(x["z_score"]), reverse=True)
    return ranked[:25]


def storm_lag_analysis(merged: pd.DataFrame, kp: pd.DataFrame) -> list[dict]:
    out = []
    if merged.empty or kp.empty:
        return out
    k = kp.copy()
    k["date"] = k["time"].dt.strftime("%Y-%m-%d")
    m = merged.set_index("date")
    events = k[k["kp"] >= 5]["time"].dt.normalize().unique()
    for t in events[:40]:
        d0 = pd.Timestamp(t).strftime("%Y-%m-%d")
        for label, offset in [("before_0_24h", 0), ("during", 0), ("after_24_48h", 1), ("after_48_72h", 2), ("after_3_7d", 4)]:
            idx = (pd.to_datetime(m.index) - pd.to_datetime(d0)).days
            if label.startswith("before"):
                mask = idx == -1
            elif label == "during":
                mask = idx == 0
            else:
                mask = idx == offset
            if not mask.any():
                continue
            sub = m.loc[mask]
            if sub.empty:
                continue
            out.append(
                {
                    "event_start": d0,
                    "phase": label,
                    "mean_step_km": float(sub["mean_step_km"].mean()) if "mean_step_km" in sub else None,
                    "directional_consistency": float(sub["directional_consistency"].mean())
                    if "directional_consistency" in sub
                    else None,
                }
            )
    return out


def final_classification(ranked: list[dict], max_z: float) -> str:
    if not ranked or max_z < 1.5:
        return "none"
    if max_z >= 4:
        return "extraordinary"
    if max_z >= 3:
        return "strong"
    if max_z >= 2.5:
        return "moderate"
    return "weak"


def run_anomaly_module(merged: pd.DataFrame, kp: pd.DataFrame, kp_meta: dict) -> dict:
    windows = {"90d": START_90, "30d": START_30, "14d": START_14}
    ranked = rank_anomalies(merged, kp_meta.get("events") or {}, windows)
    max_z = max((abs(a["z_score"]) for a in ranked), default=0.0)
    classification = final_classification(ranked, max_z)

    if merged.empty:
        summary = "No movement time series available for anomaly pass."
    else:
        summary = (
            f"Recent anomaly pass ({END_DATE}): classification **{classification}** "
            f"from {len(ranked)} flagged daily metrics (max |z|={max_z:.2f}). "
            "Geomagnetic influence not asserted without covariate control."
        )

    iso_cols = [c for c in ["mean_step_km", "herd_spread_km", "directional_consistency", "kp_max"] if c in merged.columns]
    iso_flags = isolation_scores(merged, iso_cols).tolist() if iso_cols else []

    report = {
        "schema": "recent-anomaly-module/v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "objective": "90-day anomaly detection with 30-day and 14-day focus",
        "windows": windows,
        "recentAnomalySummary": summary,
        "classification": classification,
        "rankedAnomalies": ranked,
        "stormLagAnalysis": storm_lag_analysis(merged, kp),
        "changePoints": {
            m: change_points(merged[m]) if m in merged.columns else []
            for m in ["mean_step_km", "directional_consistency"]
        },
        "isolationForestFlags": iso_flags,
        "criticalRule": "Do not infer causation from correlation. Geomagnetic influence reported only if significant after alternative explanations.",
        "alternativeExplanationsTested": [
            "weather / Open-Meteo soil & temperature",
            "drought & snow (inventory — partial)",
            "predators & human activity (not auto-ingested)",
            "habitat & wildfire (MODIS — partial)",
            "management actions & fencing",
        ],
        "geomagneticControls": {
            "kp_events": kp_meta.get("events"),
            "note": "M/X flare & CME lists require GOES event archive ingest (future pass).",
        },
    }
    OUT = DATA / "anomaly_report.json"
    OUT.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    return report
