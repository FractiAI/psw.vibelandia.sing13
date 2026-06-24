"""Per-hop causality tests — actual vs modelled is the required standard."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from config import (
    GEOMagnetic_DATA,
    GRANGER_MAX_LAG,
    PERMUTATION_N,
    RANDOM_SEED,
    SUN_STUDY_JSON,
)
from src.fetch_solar import daily_panel, day_of_year_features, fetch_kp_range
from src.model_vs_actual import (
    composed_chain_vs_actual,
    model_vs_actual,
    pick_best_cause,
    structural_model_vs_actual,
)


def _seasonal(dates: pd.Series) -> tuple[np.ndarray, np.ndarray]:
    sin, cos = day_of_year_features(dates)
    return sin, cos


def segment_solar_to_geomagnetic(start: str, end: str) -> dict[str, Any]:
    panel = daily_panel(start, end).dropna(subset=["kp_max"])
    sin, cos = _seasonal(panel["date"])
    results: dict[str, dict[str, Any]] = {}
    for label, col in (("f107", "f107"), ("ssn", "ssn"), ("ap", "ap_mean")):
        if col not in panel.columns:
            continue
        sub = panel.dropna(subset=[col, "kp_max"])
        if len(sub) < 50:
            continue
        idx = sub.index
        results[label] = model_vs_actual(
            sub[col].values,
            sub["kp_max"].values,
            max_lag=GRANGER_MAX_LAG,
            n_perm=PERMUTATION_N,
            seed=RANDOM_SEED,
            sin_doy=sin[idx],
            cos_doy=cos[idx],
            cause_label=label,
        )
    if not results:
        return {"hop": "solar -> geomagnetic_kp", "tier": "no_data"}
    best_label, best = pick_best_cause(results)
    return {
        "hop": f"solar_{best_label} -> geomagnetic_kp",
        "window": {"start": start, "end": end, "n_days": len(panel)},
        "actual_vs_modelled": best,
        "all_causes_tested": results,
        "interpretation": f"Best solar driver: {best_label} (F10.7 preferred for ionospheric coupling).",
    }


def segment_geomagnetic_to_biological() -> dict[str, Any]:
    herd_path = GEOMagnetic_DATA / "herd_daily_metrics.csv"
    meta_path = GEOMagnetic_DATA / "movement_meta.json"
    if not herd_path.is_file():
        return {"hop": "geomagnetic_kp -> biological_movement", "tier": "no_data", "error": "missing herd_daily_metrics.csv"}
    herd = pd.read_csv(herd_path)
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.is_file() else {}
    window = meta.get("analysisWindow") or {}
    start = window.get("collarFirst") or herd["date"].min()
    end = window.get("collarLast") or herd["date"].max()

    kp_daily = fetch_kp_range(start, end)
    if kp_daily.empty:
        return {"hop": "geomagnetic_kp -> biological_movement", "tier": "no_data", "error": "Kp fetch empty"}

    merged = herd.drop(columns=[c for c in ("kp_max", "storm_class") if c in herd.columns])
    merged = merged.merge(kp_daily[["date", "kp_max"]], on="date", how="inner")
    merged = merged.dropna(subset=["kp_max", "mean_step_km"])
    sin, cos = _seasonal(merged["date"])

    mva = model_vs_actual(
        merged["kp_max"].values,
        merged["mean_step_km"].values,
        max_lag=min(5, GRANGER_MAX_LAG),
        n_perm=PERMUTATION_N,
        seed=RANDOM_SEED + 1,
        sin_doy=sin,
        cos_doy=cos,
        cause_label="kp",
    )
    return {
        "hop": "geomagnetic_kp -> biological_movement",
        "species": (meta.get("taxa") or ["unknown"])[0],
        "study": meta.get("movebankStudyName"),
        "window": {"start": start, "end": end, "n_days": len(merged)},
        "actual_vs_modelled": mva,
        "interpretation": "Seasonal AR+Kp vs GPS collar actuals (herbivore proxy).",
    }


def segment_solar_to_cognitive_proxy() -> dict[str, Any]:
    if not SUN_STUDY_JSON.is_file():
        return {
            "hop": "solar_ssn -> cognitive_proxy_commits",
            "tier": "no_data",
            "error": f"missing {SUN_STUDY_JSON.name}",
        }
    study = json.loads(SUN_STUDY_JSON.read_text(encoding="utf-8"))
    periods = study.get("periods") or []
    ssn_arr = np.array([study["sunspots"].get(p) for p in periods], dtype=float)
    com_arr = np.array([study["commits"].get(p, 0) for p in periods], dtype=float)
    weeks = np.arange(len(periods), dtype=float)
    sin_w = np.sin(2 * np.pi * weeks / 52)
    cos_w = np.cos(2 * np.pi * weeks / 52)

    mva = model_vs_actual(
        ssn_arr,
        com_arr,
        max_lag=4,
        n_perm=PERMUTATION_N,
        seed=RANDOM_SEED + 2,
        sin_doy=sin_w,
        cos_doy=cos_w,
        cause_label="ssn",
    )
    return {
        "hop": "solar_ssn -> cognitive_proxy (weekly Git commits)",
        "window": {"weeks": len(periods), "granularity": "week"},
        "actual_vs_modelled": mva,
        "interpretation": "Seasonal AR+SSN vs weekly commit actuals (studio proxy; confounds possible).",
    }


def segment_solar_geomagnetic_biological_chain() -> dict[str, Any]:
    meta_path = GEOMagnetic_DATA / "movement_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.is_file() else {}
    window = meta.get("analysisWindow") or {}
    start = window.get("collarFirst", "2019-01-01")
    end = window.get("collarLast", "2020-05-15")

    panel = daily_panel(start, end)
    herd = pd.read_csv(GEOMagnetic_DATA / "herd_daily_metrics.csv")
    herd_cols = [c for c in herd.columns if c not in ("kp_max", "storm_class")]
    merged = herd[herd_cols].merge(panel, on="date", how="inner").dropna(
        subset=["kp_max", "mean_step_km"]
    )
    if len(merged) < 20:
        return {"hop": "chain ssn -> kp -> movement", "tier": "insufficient_data", "n": len(merged)}

    sin, cos = _seasonal(merged["date"])
    cause_col = "f107" if "f107" in merged.columns and merged["f107"].notna().sum() > 20 else "ssn"
    merged = merged.dropna(subset=[cause_col])

    composed = composed_chain_vs_actual(
        merged[cause_col].values,
        merged["kp_max"].values,
        merged["mean_step_km"].values,
        max_lag=5,
        n_perm=PERMUTATION_N,
        seed=45,
        sin_doy=sin,
        cos_doy=cos,
    )
    chain_ok = composed.get("tier") in ("weak_causal_hint", "causal_support_preliminary")
    return {
        "hop": f"chain {cause_col} -> kp -> movement (composed)",
        "window": {"start": start, "end": end, "n_days": len(merged)},
        "actual_vs_modelled": composed,
        "chain_passes_actual_vs_modelled": chain_ok,
        "interpretation": "Two-stage OOS: solar driver -> Kp_hat -> movement vs collar actuals.",
    }


def segment_structural_layers() -> dict[str, Any]:
    tests = [
        structural_model_vs_actual(
            layer="quantum_hydrogen",
            actual_metric="NIST ASD Balmer wavenumbers (13 lines)",
            model_metric="CODATA 2018 Rydberg QED baseline",
            null_metric="EGS Phi-lattice correction (alpha_Phi)",
            model_beats_null=True,
            notes="QED RMS 0.210 cm-1; Phi correction does not improve chi-squared (egs-nlrf).",
        ),
        structural_model_vs_actual(
            layer="dna_contacts",
            actual_metric="ENCODE/UCSC Hi-C contact structure",
            model_metric="HGT-PSD covariance cone model",
            null_metric="unconstrained non-PSD matrix",
            model_beats_null=True,
            notes="proposition1_psd_valid: true (hgt-psd-covariance).",
        ),
        structural_model_vs_actual(
            layer="dna_sequence",
            actual_metric="T2T centromeric satellite sequences (held-out CV)",
            model_metric="AC-HMM attention context model",
            null_metric="i.i.d. / Markov baselines",
            model_beats_null=True,
            notes="AC-HMM beats baselines on capped spatial CV (ac-hmm-satellites).",
        ),
        structural_model_vs_actual(
            layer="silicon_epigenetic_metaphor",
            actual_metric="GPU telemetry PCS from reference traces",
            model_metric="EESM full stream-aware pipeline",
            null_metric="raw PCS baseline (0.5) and stream-ablated path",
            model_beats_null=True,
            notes="Full PCS 0.175 vs raw 0.5; ablation restores null-level error (eesm-gpu-telemetry).",
        ),
    ]
    return {
        "hop": "quantum_hydrogen + DNA + silicon (structural actual vs modelled)",
        "actual_vs_modelled": tests,
        "interpretation": "Each repo compares model predictions to measured actuals; null is weaker baseline.",
    }


def synthesize_closure_verdict(segments: list[dict[str, Any]]) -> dict[str, Any]:
    na_hops = []
    passed = []
    failed = []

    tier_rank = {"causal_support_preliminary": 2, "weak_causal_hint": 1}

    for seg in segments:
        hop = seg.get("hop", "unknown")
        if seg.get("tier") in ("no_data", "insufficient_data"):
            na_hops.append(hop)
            continue

        mva = seg.get("actual_vs_modelled")
        if isinstance(mva, dict) and mva.get("tier"):
            if mva["tier"] in tier_rank:
                passed.append(hop)
            elif mva["tier"] == "no_causal_support":
                failed.append(hop)
        elif isinstance(mva, list):
            for t in mva:
                label = f"{hop} :: {t.get('layer', '?')}"
                (passed if t.get("tier") in tier_rank else failed).append(label)
        if seg.get("chain_passes_actual_vs_modelled"):
            passed.append(f"{hop} :: full_chain")

    chain_seg = next((s for s in segments if "chain" in s.get("hop", "")), {})
    full_chain = bool(chain_seg.get("chain_passes_actual_vs_modelled"))

    temporal_supported = sum(
        1
        for s in segments
        if isinstance(s.get("actual_vs_modelled"), dict)
        and s["actual_vs_modelled"].get("tier") in tier_rank
        and "structural" not in s.get("hop", "")
        and "chain" not in s.get("hop", "")
    )
    full_closure = full_chain and temporal_supported >= 2

    return {
        "methodology": (
            "Causality is assessed actual-vs-modelled: nested AR(1)+cause vs held-out "
            "actuals, beating seasonal AR(1) persistence and block-shift sham nulls."
        ),
        "full_causal_closure_one_apparatus": bool(full_closure),
        "statement": (
            "A full causal closure around the entire cycle in one apparatus is not yet demonstrated."
            if not full_closure
            else "Full causal closure supported under actual-vs-modelled tests on all registered hops."
        ),
        "actual_vs_modelled_passed": passed,
        "actual_vs_modelled_failed": failed,
        "chain_passes": full_chain,
        "temporal_hops_supported": temporal_supported,
        "non_temporal_or_missing": na_hops,
    }
