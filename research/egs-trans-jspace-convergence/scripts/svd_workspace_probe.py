#!/usr/bin/env python3
"""
EGS-TRANS-2026-0710 · SVD workspace ratio probe (numpy-only baseline).
Tests whether consecutive singular-value ratios cluster near φ more than random baselines.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

PHI = (1 + np.sqrt(5)) / 2
TOLERANCE = 0.12
N_TRIALS = 500
MATRIX_ROWS = 64
MATRIX_COLS = 128


def consecutive_ratios(s: np.ndarray, k: int = 5) -> list[float]:
    s = np.asarray(s, dtype=float)
    s = s[s > 1e-12]
    if len(s) < 2:
        return []
    ratios = []
    for i in range(min(k, len(s) - 1)):
        ratios.append(float(s[i] / s[i + 1]))
    return ratios


def phi_structured_matrix(rows: int, cols: int, rng: np.random.Generator) -> np.ndarray:
    """Low-rank matrix with geometric singular-value decay ~ φ."""
    rank = min(12, rows, cols)
    singular = np.array([PHI ** (-i) for i in range(rank)])
    u, _ = np.linalg.qr(rng.standard_normal((rows, rank)))
    v, _ = np.linalg.qr(rng.standard_normal((cols, rank)))
    return u @ np.diag(singular) @ v.T


def random_matrix(rows: int, cols: int, rng: np.random.Generator) -> np.ndarray:
    return rng.standard_normal((rows, cols))


def trial_stats(matrices: list[np.ndarray]) -> dict:
    primary = []
    consecutive = []
    for m in matrices:
        _, s, _ = np.linalg.svd(m, full_matrices=False)
        if len(s) >= 2:
            primary.append(float(s[0] / s[1]))
        consecutive.extend(consecutive_ratios(s))
    def near_phi(vals):
        if not vals:
            return 0.0
        return sum(1 for v in vals if abs(v - PHI) < TOLERANCE) / len(vals)
    return {
        "trialCount": len(matrices),
        "primaryRatioMean": float(np.mean(primary)) if primary else None,
        "primaryRatioStd": float(np.std(primary)) if primary else None,
        "fractionPrimaryNearPhi": near_phi(primary),
        "fractionConsecutiveNearPhi": near_phi(consecutive),
        "samplePrimaryRatios": [round(x, 4) for x in primary[:8]],
    }


def main() -> int:
    rng = np.random.default_rng(42)
    phi_mats = [phi_structured_matrix(MATRIX_ROWS, MATRIX_COLS, rng) for _ in range(N_TRIALS)]
    rand_mats = [random_matrix(MATRIX_ROWS, MATRIX_COLS, rng) for _ in range(N_TRIALS)]

    phi_stats = trial_stats(phi_mats)
    rand_stats = trial_stats(rand_mats)

    # Falsification: φ-structured generator should beat random on near-φ fraction
    phi_frac = phi_stats["fractionPrimaryNearPhi"]
    rand_frac = rand_stats["fractionPrimaryNearPhi"]
    if phi_frac > rand_frac + 0.05:
        e2_result = "support"
    elif phi_frac < rand_frac:
        e2_result = "refute"
    else:
        e2_result = "inconclusive"

    out = {
        "documentId": "EGS-TRANS-2026-0710",
        "experiment": "E2_svd_phi_decay_ratio",
        "egsPhi": round(PHI, 6),
        "tolerance": TOLERANCE,
        "matrixShape": [MATRIX_ROWS, MATRIX_COLS],
        "phiStructured": phi_stats,
        "randomBaseline": rand_stats,
        "hypothesis": "φ-structured low-rank matrices yield higher near-φ SVD ratios than i.i.d. Gaussian",
        "result": e2_result,
        "honestyNote": (
            "Synthetic linear-algebra probe only. Does not access Claude weights or Anthropic telemetry. "
            "Pass/fail does not validate causal King Bee → J-Space claims."
        ),
    }

    out_path = Path(__file__).resolve().parent.parent / "data" / "svd_probe_report.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "path": str(out_path), "result": e2_result}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
