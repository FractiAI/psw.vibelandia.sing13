#!/usr/bin/env python3
"""Full reproducible pipeline — Geomagnetic herbivore study + anomaly module."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from config import DATA, DOC_ID, OUTPUT, STUDY_TITLE  # noqa: E402
from src.anomaly_detection import run_anomaly_module  # noqa: E402
from src.fetch_movement import run_fetch_movement  # noqa: E402
from src.fetch_noaa import run_fetch  # noqa: E402
from src.figures import generate_all  # noqa: E402
from src.inventory import write_inventory  # noqa: E402
from src.statistics import save_statistics, test_hypotheses  # noqa: E402


def _load_analysis_window() -> dict:
    path = DATA / "analysis_window.json"
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    meta_path = DATA / "movement_meta.json"
    if meta_path.is_file():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        return meta.get("analysisWindow") or {}
    return {}


def main():
    import argparse

    p = argparse.ArgumentParser(description=STUDY_TITLE)
    args = p.parse_args()

    print(f"[{DOC_ID}] Step 1: inventory")
    write_inventory()

    print(f"[{DOC_ID}] Step 2: public GPS collar fetch (Movebank)")
    traj = run_fetch_movement()
    window = _load_analysis_window()
    kp_start = window.get("baselineStart") or window.get("analysisStart90")
    kp_end = window.get("analysisEnd")
    if not kp_start or not kp_end:
        from config import BASELINE_START, END_DATE

        kp_start, kp_end = BASELINE_START, END_DATE
        print(f"[{DOC_ID}] WARN: no collar window — using calendar defaults for Kp")

    print(f"[{DOC_ID}] Step 3: geomagnetic fetch ({kp_start} to {kp_end})")
    try:
        geo = run_fetch(start=kp_start, end=kp_end)
    except Exception as err:
        print(f"[{DOC_ID}] WARN: geomagnetic fetch failed ({err}); using empty Kp frame")
        import pandas as pd

        geo = {"kp": pd.DataFrame(), "ap": pd.DataFrame(), "meta": {"error": str(err)}}
    kp = geo["kp"]
    kp_daily = __import__("src.fetch_noaa", fromlist=["build_kp_daily"]).build_kp_daily(kp)

    if traj.empty:
        print(f"[{DOC_ID}] ERROR: no collar trajectories — skipping stats/figures")
        summary = {
            "docId": DOC_ID,
            "error": "no_public_collar_data",
            "outputs": {"inventory": str(DATA / "inventory.json")},
        }
        (OUTPUT / "pipeline_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(json.dumps(summary, indent=2))
        return 1

    print(f"[{DOC_ID}] Step 4: statistics & hypotheses")
    hyp = test_hypotheses(traj, kp_daily)
    save_statistics(hyp)
    merged = hyp.get("merged_daily")

    print(f"[{DOC_ID}] Step 5: anomaly module")
    report = run_anomaly_module(merged, kp, geo["meta"])

    print(f"[{DOC_ID}] Step 6: figures")
    generate_all(traj, merged if merged is not None else __import__("pandas").DataFrame())

    summary = {
        "docId": DOC_ID,
        "classification": report["classification"],
        "hypothesisTiers": {k: v.get("tier") for k, v in hyp.items() if k.startswith("H")},
        "movementSource": "movebank_gps",
        "analysisWindow": window,
        "outputs": {
            "inventory": str(DATA / "inventory.json"),
            "anomaly_report": str(DATA / "anomaly_report.json"),
            "trajectories": str(DATA / "trajectories.csv"),
            "figures": str(OUTPUT),
        },
    }
    (OUTPUT / "pipeline_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
