"""Granger causality, permutation nulls, and tier classification."""
from __future__ import annotations

import math
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.tsa.stattools import grangercausalitytests


def permutation_correlation_p(
    x: np.ndarray,
    y: np.ndarray,
    *,
    n_perm: int = 2000,
    seed: int = 42,
) -> dict[str, Any]:
    """Two-sided permutation p-value for Pearson r (shuffle y)."""
    mask = np.isfinite(x) & np.isfinite(y)
    x = x[mask]
    y = y[mask]
    if len(x) < 8:
        return {"n": len(x), "r": None, "p_perm": None, "tier": "insufficient_data"}
    r_obs, _ = stats.pearsonr(x, y)
    rng = np.random.default_rng(seed)
    count = 0
    for _ in range(n_perm):
        y_shuf = rng.permutation(y)
        r_null, _ = stats.pearsonr(x, y_shuf)
        if abs(r_null) >= abs(r_obs):
            count += 1
    p_perm = (count + 1) / (n_perm + 1)
    tier = classify_causal_tier(p_perm, direction="correlation")
    return {
        "n": int(len(x)),
        "r": float(r_obs),
        "p_perm": float(p_perm),
        "tier": tier,
    }


def granger_causality(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
) -> dict[str, Any]:
    """Test whether `cause` Granger-causes `effect` (statsmodels)."""
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask]
    e = effect[mask]
    if len(c) < max_lag + 12:
        return {"n": len(c), "min_p": None, "best_lag": None, "tier": "insufficient_data"}
    df = pd.DataFrame({"effect": e, "cause": c})
    try:
        res = grangercausalitytests(df[["effect", "cause"]], maxlag=max_lag, verbose=False)
    except Exception as err:
        return {"n": len(c), "error": str(err), "tier": "failed"}
    best_lag = None
    min_p = 1.0
    for lag, block in res.items():
        p = float(block[0]["ssr_ftest"][1])
        if p < min_p:
            min_p = p
            best_lag = int(lag)
    tier = classify_causal_tier(min_p, direction="granger")
    return {
        "n": int(len(c)),
        "min_p": float(min_p),
        "best_lag": best_lag,
        "max_lag_tested": max_lag,
        "tier": tier,
    }


def classify_causal_tier(p: float | None, *, direction: str) -> str:
    if p is None or (isinstance(p, float) and math.isnan(p)):
        return "insufficient_data"
    if p >= 0.05:
        return "no_causal_support"
    if p >= 0.01:
        return "weak_causal_hint"
    return "causal_support_preliminary"


def mediation_path_correlation(
    x: np.ndarray,
    m: np.ndarray,
    y: np.ndarray,
) -> dict[str, Any]:
    """Simple path: x→m, m→y, x→y (not full SEM)."""
    r_xm = permutation_correlation_p(x, m)
    r_my = permutation_correlation_p(m, y)
    r_xy = permutation_correlation_p(x, y)
    chain_hint = (
        r_xm.get("tier") in ("weak_causal_hint", "causal_support_preliminary")
        and r_my.get("tier") in ("weak_causal_hint", "causal_support_preliminary")
    )
    return {
        "x_to_m": r_xm,
        "m_to_y": r_my,
        "x_to_y": r_xy,
        "mediation_chain_hint": bool(chain_hint),
    }
