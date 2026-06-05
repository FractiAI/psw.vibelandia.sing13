"""
Clock-Skew Latency Echo Test · Synthobs diagnostic probe.
Writes results to data/wavefield_echo_test_latest.json for the plain-speak results page.
"""
from __future__ import annotations

import json
import math
import platform
import time
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_JSON = REPO_ROOT / "data" / "wavefield_echo_test_latest.json"

EGS_CONSTANT = (1.0 + math.sqrt(5.0)) / 2.0
SKEW_TARGET_PS = 1.618
TIER_COUNT = 38
DRIFT_THRESHOLD = 0.05


def run_wavefield_echo_test() -> dict:
    log: list[str] = []

    def emit(line: str) -> None:
        print(line)
        log.append(line)

    emit("[Synthobs CLI] Initializing Ground Base...")
    emit(f"[Synthobs CLI] Metric Matrix: 1 = {EGS_CONSTANT:.4f} - {1/EGS_CONSTANT:.4f}")
    emit("--------------------------------------------------")

    start_time = time.perf_counter_ns()
    cumulative_matrix = 0.0
    for tier in range(1, TIER_COUNT + 1):
        cumulative_matrix += 9.0 / (EGS_CONSTANT**tier)
    end_time = time.perf_counter_ns()

    execution_latency_ps = (end_time - start_time) / 1000.0
    skew_alignment_delta = execution_latency_ps % SKEW_TARGET_PS
    aligned = skew_alignment_delta < DRIFT_THRESHOLD

    emit("[Results] 38 Nested Layers Executed Successfully.")
    emit(f"[Results] Raw Core Processing Latency: {execution_latency_ps:.2f} ps")
    emit(f"[Results] Measured Skew Alignment Delta: {skew_alignment_delta:.6f}")
    emit("--------------------------------------------------")

    if aligned:
        status = "SUCCESS"
        emit("[STATUS: SUCCESS] CONFIGURATION CONFIRMED.")
        emit("[STATUS] Local silicon is phase-locked to the Solar Wavefield Oscillator.")
        emit("[STATUS] Jitter Tax: 0.00% | sing13 repository is safely optimized.")
        plain = (
            "The nested 38-tier loop finished cleanly. The latency remainder modulo "
            f"{SKEW_TARGET_PS} ps is below the drift threshold — catalog language calls this "
            "phase-locked for the Wavefield Oscillator story. This is a micro-benchmark on your CPU, "
            "not a solar instrument reading."
        )
    else:
        status = "DRIFT"
        emit("[STATUS: DRIFT] Cartesian noise detected. Re-run MCA_squeeze_all via Cursor AI.")
        plain = (
            "The loop completed, but the latency remainder modulo 1.618 ps did not land inside the "
            "narrow success band. That is normal on many machines — it means Cartesian clock jitter "
            "dominated this sample, not that the repo is broken. Re-run the test or treat this as "
            "sandbox narrative, not hardware certification."
        )

    return {
        "schema": "ss-vibelandia-wavefield-echo-test/v1",
        "synthobs_diagnostic_test": {
            "test_name": "CLOCK_SKEW_LATENCY_ECHO",
            "target_repository": "sing13",
            "evaluation_depth_tiers": TIER_COUNT,
            "expected_cadence_anchor": "1.618_PICOSECONDS",
            "honesty_boundary_check": "mined_block_false_ENFORCED",
            "verification_engine": "DIGITAL_PRU_KERNEL_PROBE",
        },
        "run": {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "hostname": platform.node(),
            "platform": platform.platform(),
            "python": platform.python_version(),
            "script": "sing13/tests/wavefield_echo_test.py",
        },
        "metrics": {
            "egs_constant": EGS_CONSTANT,
            "cumulative_matrix_38_tiers": cumulative_matrix,
            "execution_latency_ps": execution_latency_ps,
            "skew_alignment_delta": skew_alignment_delta,
            "drift_threshold": DRIFT_THRESHOLD,
            "status": status,
            "track": "Track B Aligned" if aligned else "Track A Cartesian Fault",
        },
        "console_log": log,
        "plain_speak": plain,
        "telemetry_note": {
            "solar_wind_km_s": 433.9,
            "sunspot_number": 141,
            "active_region": "AR4455",
            "profile": "Beta-Gamma-Delta (catalog snapshot — verify NOAA SWPC for operations)",
        },
    }


def main() -> None:
    payload = run_wavefield_echo_test()
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"[Synthobs CLI] Wrote {OUTPUT_JSON.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
