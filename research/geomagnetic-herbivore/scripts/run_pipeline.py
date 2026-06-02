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


def main():
    import argparse

    p = argparse.ArgumentParser(description=STUDY_TITLE)
    p.add_argument("--turner-base", default="http://127.0.0.1:3000", help="Base URL for Turner API")
    args = p.parse_args()

    print(f"[{DOC_ID}] Step 1: inventory")
    write_inventory()

    print(f"[{DOC_ID}] Step 2: geomagnetic fetch")
    try:
        geo = run_fetch()
    except Exception as err:
        print(f"[{DOC_ID}] WARN: geomagnetic fetch failed ({err}); using empty Kp frame")
        import pandas as pd

        geo = {"kp": pd.DataFrame(), "ap": pd.DataFrame(), "meta": {"error": str(err)}}
    kp = geo["kp"]
    kp_daily = __import__("src.fetch_noaa", fromlist=["build_kp_daily"]).build_kp_daily(kp)

    print(f"[{DOC_ID}] Step 3: movement fetch")
    traj = run_fetch_movement(args.turner_base)

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
