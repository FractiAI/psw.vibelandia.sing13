"""Per-hop causality tests for the recursive attention loop."""
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
from src.fetch_solar import daily_panel, fetch_kp_range
from src.stats_utils import granger_causality, mediation_path_correlation, permutation_correlation_p


def segment_solar_to_geomagnetic(start: str, end: str) -> dict[str, Any]:
    panel = daily_panel(start, end)
    panel = panel.dropna(subset=["ssn", "kp_max"])
    ssn = panel["ssn"].values
    kp = panel["kp_max"].values
    corr = permutation_correlation_p(ssn, kp, n_perm=PERMUTATION_N, seed=RANDOM_SEED)
    gc_ssn_kp = granger_causality(ssn, kp, max_lag=GRANGER_MAX_LAG)
    gc_kp_ssn = granger_causality(kp, ssn, max_lag=GRANGER_MAX_LAG)
    return {
        "hop": "solar_ssn → geomagnetic_kp",
        "window": {"start": start, "end": end, "n_days": len(panel)},
        "correlation": corr,
        "granger_ssn_causes_kp": gc_ssn_kp,
        "granger_kp_causes_ssn_control": gc_kp_ssn,
        "interpretation": (
            "Physical expectation: SSN leads Kp with lag; reverse Granger should be weaker."
            if gc_ssn_kp.get("tier") != "no_causal_support"
            else "No Granger support for SSN→Kp in this window (may need longer series or storm subsample)."
        ),
    }


def segment_geomagnetic_to_biological() -> dict[str, Any]:
    herd_path = GEOMagnetic_DATA / "herd_daily_metrics.csv"
    meta_path = GEOMagnetic_DATA / "movement_meta.json"
    if not herd_path.is_file():
        return {"hop": "geomagnetic_kp → biological_movement", "tier": "no_data", "error": "missing herd_daily_metrics.csv"}
    herd = pd.read_csv(herd_path)
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.is_file() else {}
    window = meta.get("analysisWindow") or {}
    start = window.get("collarFirst") or herd["date"].min()
    end = window.get("collarLast") or herd["date"].max()

    kp_daily = fetch_kp_range(start, end)
    if kp_daily.empty:
        return {"hop": "geomagnetic_kp → biological_movement", "tier": "no_data", "error": "Kp fetch empty"}

    merged = herd.merge(kp_daily[["date", "kp_max"]], on="date", how="inner", suffixes=("_herd", "_kp"))
    if "kp_max_kp" in merged.columns:
        merged["kp_max"] = merged["kp_max_kp"]
    elif "kp_max" not in merged.columns and "kp_max_herd" in merged.columns:
        merged["kp_max"] = merged["kp_max_herd"]

    merged = merged.dropna(subset=["kp_max", "mean_step_km"])
    y = merged["mean_step_km"].values
    kp = merged["kp_max"].values

    corr = permutation_correlation_p(kp, y, n_perm=PERMUTATION_N, seed=RANDOM_SEED)
    gc_kp_move = granger_causality(kp, y, max_lag=min(5, GRANGER_MAX_LAG))
    gc_move_kp = granger_causality(y, kp, max_lag=min(5, GRANGER_MAX_LAG))

    storm = merged[merged["kp_max"] >= 5]
    quiet = merged[merged["kp_max"] < 4]
    storm_delta = None
    if len(storm) >= 2 and len(quiet) >= 5:
        from scipy import stats as sp_stats

        tstat, p = sp_stats.ttest_ind(storm["mean_step_km"], quiet["mean_step_km"], equal_var=False)
        storm_delta = {
            "storm_mean_km": float(storm["mean_step_km"].mean()),
            "quiet_mean_km": float(quiet["mean_step_km"].mean()),
            "p_value": float(p),
            "significant": bool(p < 0.05),
        }

    species = (meta.get("taxa") or ["unknown"])[0]
    return {
        "hop": "geomagnetic_kp → biological_movement",
        "species": species,
        "study": meta.get("movebankStudyName"),
        "window": {"start": start, "end": end, "n_days": len(merged)},
        "correlation": corr,
        "granger_kp_causes_movement": gc_kp_move,
        "granger_movement_causes_kp_control": gc_move_kp,
        "storm_day_comparison": storm_delta,
        "interpretation": (
            "Moose GPS collar (Movebank) — herbivore movement proxy, not human neural attention."
        ),
    }


def segment_solar_to_cognitive_proxy() -> dict[str, Any]:
    if not SUN_STUDY_JSON.is_file():
        return {
            "hop": "solar_ssn → cognitive_proxy_commits",
            "tier": "no_data",
            "error": f"missing {SUN_STUDY_JSON.name} — run npm run build:look-at-the-sun-study",
        }
    study = json.loads(SUN_STUDY_JSON.read_text(encoding="utf-8"))
    periods = study.get("periods") or []
    ssn = [study["sunspots"].get(p) for p in periods]
    commits = [study["commits"].get(p, 0) for p in periods]
    f107 = [study["f107"].get(p) for p in periods]

    ssn_arr = np.array(ssn, dtype=float)
    com_arr = np.array(commits, dtype=float)
    f_arr = np.array(f107, dtype=float)

    corr_ssn = permutation_correlation_p(ssn_arr, com_arr, n_perm=PERMUTATION_N, seed=RANDOM_SEED)
    corr_f = permutation_correlation_p(f_arr, com_arr, n_perm=PERMUTATION_N, seed=RANDOM_SEED + 1)
    gc_ssn_com = granger_causality(ssn_arr, com_arr, max_lag=4)
    gc_com_ssn = granger_causality(com_arr, ssn_arr, max_lag=4)

    return {
        "hop": "solar_ssn → cognitive_proxy (weekly Git commits)",
        "window": {"weeks": len(periods), "granularity": "week"},
        "correlation_ssn_commits": corr_ssn,
        "correlation_f107_commits": corr_f,
        "granger_ssn_causes_commits": gc_ssn_com,
        "granger_commits_cause_ssn_control": gc_com_ssn,
        "interpretation": (
            "Commits are a weak human-attention / studio-activity proxy — not EEG or imagination directly. "
            "Significant correlation does not imply the Sun drives commits; shared seasonality is a confound."
        ),
    }


def segment_solar_geomagnetic_biological_chain() -> dict[str, Any]:
    """SSN → Kp → movement on overlapping daily window."""
    meta_path = GEOMagnetic_DATA / "movement_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.is_file() else {}
    window = meta.get("analysisWindow") or {}
    start = window.get("collarFirst", "2019-01-01")
    end = window.get("collarLast", "2020-05-15")

    panel = daily_panel(start, end)
    herd = pd.read_csv(GEOMagnetic_DATA / "herd_daily_metrics.csv")
    herd_cols = [c for c in herd.columns if c not in ("kp_max", "storm_class")]
    merged = herd[herd_cols].merge(panel, on="date", how="inner").dropna(
        subset=["ssn", "kp_max", "mean_step_km"]
    )
    if len(merged) < 20:
        return {"hop": "chain ssn → kp → movement", "tier": "insufficient_data", "n": len(merged)}

    path = mediation_path_correlation(
        merged["ssn"].values,
        merged["kp_max"].values,
        merged["mean_step_km"].values,
    )
    return {
        "hop": "chain solar → geomagnetic → biological (daily)",
        "window": {"start": start, "end": end, "n_days": len(merged)},
        "path_correlations": path,
        "interpretation": "Partial path evidence only — not a closed apparatus; confounds include season and habitat.",
    }


def segment_quantum_dna_structural() -> dict[str, Any]:
    """Non-temporal layers — causality not testable on public time series."""
    return {
        "hop": "quantum_hydrogen + DNA genomic",
        "tier": "not_temporal",
        "tests": [
            {
                "layer": "quantum_hydrogen",
                "repo": "FractiAI/egs-nlrf",
                "causality_status": "not_applicable",
                "reason": "NIST ASD Balmer lines are equilibrium spectroscopy — no time series for solar→quantum causal transfer.",
                "structural_validation": "QED baseline holds (χ²/dof ≈ 0.73); Φ corrections do not improve fit.",
            },
            {
                "layer": "dna_sequence",
                "repo": "FractiAI/ac-hmm-satellites",
                "causality_status": "not_applicable",
                "reason": "Spatial sequence modeling on T2T loci — not a dynamic attention loop over time.",
                "structural_validation": "AC-HMM beats baselines on spatial CV (capped windows).",
            },
            {
                "layer": "dna_contacts",
                "repo": "FractiAI/hgt-psd-covariance",
                "causality_status": "not_applicable",
                "reason": "Static Hi-C contact map — PSD validity is structural, not temporal Granger.",
                "structural_validation": "proposition1_psd_valid: true",
            },
            {
                "layer": "silicon_epigenetic_metaphor",
                "repo": "FractiAI/eesm-gpu-telemetry",
                "causality_status": "within_layer_supported",
                "reason": "Stream-order ablation shows PCS drops when causal stream path removed (software intervention).",
                "structural_validation": "Full PCS 0.175 vs raw 0.5; stream ablation drop 0.175",
            },
        ],
    }


def synthesize_closure_verdict(segments: list[dict[str, Any]]) -> dict[str, Any]:
    granger_supported = []
    correlation_only = []
    rejected_hops = []
    na_hops = []

    for seg in segments:
        hop = seg.get("hop", "unknown")
        if seg.get("tier") in ("no_data", "not_temporal", "insufficient_data"):
            na_hops.append(hop)
            continue
        for key, block in seg.items():
            if not isinstance(block, dict) or "tier" not in block:
                continue
            tier = block["tier"]
            label = f"{hop} :: {key}"
            if key.startswith("granger"):
                if tier in ("causal_support_preliminary", "weak_causal_hint"):
                    granger_supported.append(label)
                elif tier == "no_causal_support":
                    rejected_hops.append(label)
            elif key.startswith("correlation"):
                if tier in ("causal_support_preliminary", "weak_causal_hint"):
                    correlation_only.append(label)
                elif tier == "no_causal_support":
                    rejected_hops.append(label)

    chain = next((s for s in segments if s.get("hop", "").startswith("chain")), {})
    path = chain.get("path_correlations") or {}
    chain_ok = path.get("mediation_chain_hint") is True

    s1 = next((s for s in segments if "geomagnetic_kp" in s.get("hop", "") and "cognitive" not in s.get("hop", "")), {})
    solar_kp_granger = (s1.get("granger_ssn_causes_kp") or {}).get("tier") in (
        "weak_causal_hint",
        "causal_support_preliminary",
    )
    kp_move_granger = (next((s for s in segments if "biological_movement" in s.get("hop", "")), {}).get(
        "granger_kp_causes_movement"
    ) or {}).get("tier") in ("weak_causal_hint", "causal_support_preliminary")
    ssn_commits_granger = (next((s for s in segments if "cognitive_proxy" in s.get("hop", "")), {}).get(
        "granger_ssn_causes_commits"
    ) or {}).get("tier") in ("weak_causal_hint", "causal_support_preliminary")

    verdict = {
        "full_causal_closure_one_apparatus": False,
        "statement": (
            "A full causal closure around the entire cycle in one apparatus is not yet demonstrated."
        ),
        "partial_path_evidence": {
            "solar_to_geomagnetic_granger": bool(solar_kp_granger),
            "geomagnetic_to_movement_granger": bool(kp_move_granger),
            "solar_to_commits_granger": bool(ssn_commits_granger),
            "correlation_only_hops": correlation_only,
            "daily_mediation_chain_hint": chain_ok,
        },
        "granger_supported_hops": granger_supported,
        "no_granger_support_hops": rejected_hops,
        "non_temporal_or_missing": na_hops,
        "recommendation": (
            "Next bench: synchronized EEG + geomagnetic Kp + 21 cm RF + single-cell epigenetic time series "
            "under pre-registered storm windows — or accept observational multi-proxy synthesis only."
        ),
    }
    return verdict
