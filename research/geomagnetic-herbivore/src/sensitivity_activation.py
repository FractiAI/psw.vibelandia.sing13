"""Detect whether geomagnetic sensitivity recently activated (calendar Kp + collar coupling)."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from scipy import stats

from config import DATA, END_DATE


def calendar_recent_window(end_date: str | None = None) -> dict[str, str]:
    end = pd.Timestamp(end_date or END_DATE).date()
    return {
        "calendarEnd": end.isoformat(),
        "calendarStart90": (end - timedelta(days=89)).isoformat(),
        "calendarStart30": (end - timedelta(days=29)).isoformat(),
        "calendarStart14": (end - timedelta(days=13)).isoformat(),
        "baselineStart": (end - timedelta(days=365 * 5)).isoformat(),
    }


def _movement_coupling(merged: pd.DataFrame, start: str, end: str) -> dict[str, Any]:
    if merged.empty or "date" not in merged.columns:
        return {"testable": False, "reason": "no merged herd metrics"}
    block = merged[(merged["date"] >= start) & (merged["date"] <= end)]
    if len(block) < 5:
        return {"testable": False, "reason": "insufficient herd days", "nDays": int(len(block))}
    storm = block[block["kp_max"] >= 5] if "kp_max" in block.columns else block.iloc[0:0]
    quiet = block[block["kp_max"] < 4] if "kp_max" in block.columns else block
    if storm.empty:
        return {
            "testable": True,
            "couplingDetected": False,
            "reason": "no Kp≥5 days in window",
            "nStormDays": 0,
            "nQuietDays": int(len(quiet)),
        }
    if len(quiet) < 3:
        return {
            "testable": True,
            "couplingDetected": False,
            "reason": "too few quiet days",
            "nStormDays": int(len(storm)),
            "nQuietDays": int(len(quiet)),
        }
    s_step = float(storm["mean_step_km"].mean())
    q_step = float(quiet["mean_step_km"].mean())
    delta = s_step - q_step
    rel = abs(delta) / (abs(q_step) or 1.0)
    p_val = None
    try:
        _, p_val = stats.ttest_ind(
            storm["mean_step_km"].dropna(),
            quiet["mean_step_km"].dropna(),
            equal_var=False,
        )
    except Exception:
        pass
    coupling = rel > 0.12 or (p_val is not None and p_val < 0.1)
    return {
        "testable": True,
        "couplingDetected": bool(coupling),
        "nStormDays": int(len(storm)),
        "nQuietDays": int(len(quiet)),
        "stormMeanStepKm": s_step,
        "quietMeanStepKm": q_step,
        "deltaStepKm": delta,
        "relativeDelta": rel,
        "pValue": float(p_val) if p_val is not None else None,
    }


def historical_coupling(merged: pd.DataFrame) -> dict[str, Any]:
    if merged.empty:
        return {"couplingDetected": False, "reason": "empty"}
    return _movement_coupling(merged, merged["date"].min(), merged["date"].max())


def assess_sensitivity_activation(
    kp_daily: pd.DataFrame,
    merged: pd.DataFrame,
    *,
    collar_last: str | None = None,
    ranked_anomalies: list[dict] | None = None,
    calendar_end: str | None = None,
) -> dict[str, Any]:
    cal = calendar_recent_window(calendar_end)
    k = kp_daily.copy() if not kp_daily.empty else pd.DataFrame(columns=["date", "kp_max"])
    if "date" not in k.columns and "time" in k.columns:
        k["date"] = pd.to_datetime(k["time"], utc=True).dt.strftime("%Y-%m-%d")

    def storms(start: str, thr: float = 5.0) -> pd.DataFrame:
        if k.empty:
            return k
        return k[(k["date"] >= start) & (k["date"] <= cal["calendarEnd"]) & (k["kp_max"] >= thr)]

    s14 = storms(cal["calendarStart14"])
    s30 = storms(cal["calendarStart30"])
    kp14 = k[k["date"] >= cal["calendarStart14"]] if not k.empty else k
    max_kp14 = float(kp14["kp_max"].max()) if not kp14.empty else 0.0
    max_kp30 = (
        float(k[k["date"] >= cal["calendarStart30"]]["kp_max"].max())
        if not k.empty and (k["date"] >= cal["calendarStart30"]).any()
        else 0.0
    )

    driver_14 = len(s14) > 0
    driver_30 = len(s30) > 0
    collar_overlaps = bool(collar_last and collar_last >= cal["calendarStart14"])

    m = merged.copy() if not merged.empty else pd.DataFrame()
    c14 = _movement_coupling(m, cal["calendarStart14"], cal["calendarEnd"])
    c30 = _movement_coupling(m, cal["calendarStart30"], cal["calendarEnd"])
    hist = historical_coupling(m)

    ranked = ranked_anomalies or []
    recent_anom = [a for a in ranked if a.get("date", "") >= cal["calendarStart14"] and abs(a.get("z_score", 0)) >= 1.5]
    storm_dates = set(s14["date"].tolist()) if not s14.empty else set()
    anomaly_on_storm = any(a.get("date") in storm_dates for a in recent_anom)

    status = "latent"
    activated = False
    confidence = 0.35
    headline = "No recent geomagnetic storm forcing detected (Kp≥5 in last 14 days)."
    evidence: list[str] = []

    if driver_14:
        evidence.append(f"{len(s14)} storm day(s) in last 14d (max Kp {max_kp14:.1f}).")

    if collar_overlaps and c14.get("couplingDetected"):
        status = "active"
        activated = True
        confidence = 0.78
        headline = (
            "Geomagnetic sensitivity appears RECENTLY ACTIVATED: live storms in the last 14 days "
            "coincide with measurable herd movement coupling on collar GPS."
        )
        evidence.append("Collar GPS overlaps calendar-recent window; storm vs quiet contrast detected.")
    elif collar_overlaps and c14.get("testable") and anomaly_on_storm:
        status = "active"
        activated = True
        confidence = 0.68
        headline = (
            "Geomagnetic sensitivity likely RECENTLY ACTIVATED: movement anomalies align with "
            "recent Kp≥5 days (collar GPS)."
        )
        evidence.append("Z-score movement anomaly on recent storm day(s).")
    elif driver_14 and not collar_overlaps:
        if hist.get("couplingDetected"):
            status = "watch"
            confidence = 0.55
            headline = (
                "Geomagnetic driver ACTIVE in last 14 days; historical collar shows storm–movement "
                "coupling — sensitivity may be primed (no live collar overlap to confirm today)."
            )
            evidence.append(f"Historical Δ step {hist.get('deltaStepKm', 0):.2f} km (storm vs quiet).")
            evidence.append(f"Last public collar fix: {collar_last or 'unknown'}.")
        else:
            status = "driver_active"
            confidence = 0.48
            headline = (
                "Recent Kp≥5 forcing in last 14 days; public collar data too stale to test herbivore response."
            )
    elif driver_30 and not driver_14:
        status = "elevated"
        confidence = 0.42
        headline = "Elevated geomagnetic activity in last 30 days — monitor for activation."
        evidence.append(f"{len(s30)} storm day(s) in last 30d.")
    else:
        status = "latent"
        confidence = 0.4
        headline = "Geomagnetic sensitivity not recently activated: quiet Kp in last 14 days."

    if collar_overlaps and c14.get("testable") and not c14.get("couplingDetected") and driver_14:
        status = "driver_only"
        confidence = 0.52
        headline = (
            "Recent storms present but no storm–movement coupling in last 14d on collar GPS — "
            "sensitivity not activated (or masked)."
        )

    return {
        "schema": "geomagnetic-sensitivity-activation/v1",
        "assessedAt": datetime.now(timezone.utc).isoformat(),
        "activated": activated,
        "status": status,
        "confidence": min(0.95, confidence),
        "headline": headline,
        "evidence": evidence,
        "calendarWindow": cal,
        "recentGeomagnetic": {
            "driverActive14d": driver_14,
            "driverActive30d": driver_30,
            "stormDays14d": int(len(s14)),
            "stormDays30d": int(len(s30)),
            "maxKp14d": max_kp14,
            "maxKp30d": max_kp30,
            "recentStormDates14d": s14["date"].tolist() if not s14.empty else [],
        },
        "recentMovementCoupling": {
            "collarOverlapsCalendarRecent": collar_overlaps,
            "collarLast": collar_last,
            "window14d": c14,
            "window30d": c30,
        },
        "historicalCoupling": hist,
        "recentAnomalyCount14d": len(recent_anom),
        "anomalyOnStormDay": anomaly_on_storm,
    }


def save_sensitivity_activation(report: dict[str, Any]) -> Path:
    DATA.mkdir(parents=True, exist_ok=True)
    path = DATA / "sensitivity_activation.json"
    path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    return path
