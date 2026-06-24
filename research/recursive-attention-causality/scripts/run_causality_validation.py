#!/usr/bin/env python3
"""Run cross-scale causality validation for recursive attention loop."""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from config import DATA, DOC_ID, OUTPUT, STUDY_TITLE  # noqa: E402
from src.segments import (  # noqa: E402
    segment_geomagnetic_to_biological,
    segment_solar_geomagnetic_biological_chain,
    segment_solar_to_cognitive_proxy,
    segment_solar_to_geomagnetic,
    segment_structural_layers,
    synthesize_closure_verdict,
)


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)

    # Solar–geomagnetic: 5y window for power
    from datetime import date, timedelta

    end = date.today().isoformat()
    start = (date.today() - timedelta(days=365 * 5)).isoformat()

    print(f"[{DOC_ID}] solar -> geomagnetic ({start} to {end})")
    s1 = segment_solar_to_geomagnetic(start, end)

    print(f"[{DOC_ID}] geomagnetic -> biological")
    s2 = segment_geomagnetic_to_biological()

    print(f"[{DOC_ID}] solar -> cognitive proxy (commits)")
    s3 = segment_solar_to_cognitive_proxy()

    print(f"[{DOC_ID}] chain ssn -> kp -> movement")
    s4 = segment_solar_geomagnetic_biological_chain()

    print(f"[{DOC_ID}] structural layers (actual vs modelled)")
    s5 = segment_structural_layers()

    segments = [s1, s2, s3, s4, s5]
    verdict = synthesize_closure_verdict(segments)

    report = {
        "docId": DOC_ID,
        "title": STUDY_TITLE,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "honestyBoundary": verdict["statement"],
        "methodology": verdict.get("methodology"),
        "segments": segments,
        "closureVerdict": verdict,
    }

    out_json = OUTPUT / "causality_validation_report.json"
    out_json.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")

    md = OUTPUT / "causality_validation_report.md"
    md.write_text(render_markdown(report), encoding="utf-8")

    print(json.dumps({"ok": True, "report": str(out_json), "verdict": verdict["statement"]}, indent=2))
    return 0


def render_markdown(report: dict) -> str:
    v = report["closureVerdict"]
    lines = [
        f"# {report['title']}",
        "",
        f"**Generated:** {report['generatedAt']}",
        "",
        "## Honesty boundary",
        "",
        f"**{v['statement']}**",
        "",
        "## Closure verdict",
        "",
        f"| Full closure one apparatus | `{v['full_causal_closure_one_apparatus']}` |",
        "",
        "### Partial path evidence",
        "",
    ]
    for k, val in v.get("partial_path_evidence", {}).items():
        lines.append(f"- **{k}:** `{val}`")
    lines.extend(["", "## Segments", ""])
    for seg in report["segments"]:
        lines.append(f"### {seg.get('hop', '?')}")
        lines.append("")
        lines.append("```json")
        lines.append(json.dumps(seg, indent=2, default=str)[:4000])
        lines.append("```")
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
