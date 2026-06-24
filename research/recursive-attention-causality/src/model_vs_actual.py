"""Actual vs modelled causality — primary validation standard."""
from __future__ import annotations

import math
from typing import Any

import numpy as np
from scipy import stats


def _mse(y: np.ndarray, yhat: np.ndarray) -> float:
    return float(np.mean((y - yhat) ** 2))


def _fit_lagged_linear(cause: np.ndarray, effect: np.ndarray, lag: int) -> tuple[float, float]:
    """effect[t] ~ a + b * cause[t-lag]. Returns (intercept, slope)."""
    if lag > 0:
        x = cause[:-lag]
        y = effect[lag:]
    else:
        x = cause
        y = effect
    mask = np.isfinite(x) & np.isfinite(y)
    x = x[mask]
    y = y[mask]
    if len(x) < 8:
        return 0.0, 0.0
    slope, intercept, _, _, _ = stats.linregress(x, y)
    return float(intercept), float(slope)


def _predict_lagged(cause: np.ndarray, intercept: float, slope: float, lag: int) -> np.ndarray:
    n = len(cause)
    pred = np.full(n, np.nan)
    if lag > 0:
        pred[lag:] = intercept + slope * cause[:-lag]
    else:
        pred = intercept + slope * cause
    return pred


def model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 2000,
    seed: int = 42,
) -> dict[str, Any]:
    """
    Causality check: does a lagged transfer model predict held-out actuals
    better than null (mean) and sham (permuted cause) baselines?
    """
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask]
    e = effect[mask]
    n = len(c)
    if n < max_lag + 20:
        return {"n": n, "tier": "insufficient_data", "method": "actual_vs_modelled"}

    split = int(n * (1 - holdout_frac))
    c_train, e_train = c[:split], e[:split]
    c_test, e_test = c[split:], e[split:]

    best_lag = 0
    best_mse_train = math.inf
    best_params = (0.0, 0.0)
    for lag in range(0, max_lag + 1):
        a, b = _fit_lagged_linear(c_train, e_train, lag)
        pred = _predict_lagged(c_train, a, b, lag)
        m = np.isfinite(pred)
        if m.sum() < 5:
            continue
        mse = _mse(e_train[m], pred[m])
        if mse < best_mse_train:
            best_mse_train = mse
            best_lag = lag
            best_params = (a, b)

    a, b = best_params
    pred_test = _predict_lagged(c_test, a, b, best_lag)
    m_test = np.isfinite(pred_test)
    if m_test.sum() < 5:
        return {"n": n, "tier": "insufficient_data", "method": "actual_vs_modelled"}

    mse_causal = _mse(e_test[m_test], pred_test[m_test])
    mse_mean = _mse(e_test[m_test], np.full(m_test.sum(), np.mean(e_train)))

    rng = np.random.default_rng(seed)
    sham_better = 0
    for _ in range(n_perm):
        c_sham = rng.permutation(c_train)
        a_s, b_s = _fit_lagged_linear(c_sham, e_train, best_lag)
        pred_s = _predict_lagged(c_test, a_s, b_s, best_lag)
        ms = np.isfinite(pred_s)
        if ms.sum() < 5:
            continue
        if _mse(e_test[ms], pred_s[ms]) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_perm + 1)

    beats_mean = mse_causal < mse_mean
    delta_mse = float(mse_mean - mse_causal)
    rmse_causal = float(math.sqrt(mse_causal))
    rmse_mean = float(math.sqrt(mse_mean))

    if not beats_mean or p_sham >= 0.05:
        tier = "no_causal_support"
    elif p_sham < 0.01 and delta_mse > 0:
        tier = "causal_support_preliminary"
    else:
        tier = "weak_causal_hint"

    return {
        "method": "actual_vs_modelled",
        "n": int(n),
        "n_test": int(m_test.sum()),
        "best_lag": int(best_lag),
        "coefficients": {"intercept": a, "slope": b},
        "mse_causal_model": mse_causal,
        "mse_mean_null": mse_mean,
        "rmse_causal_model": rmse_causal,
        "rmse_mean_null": rmse_mean,
        "beats_mean_null": bool(beats_mean),
        "delta_mse_vs_mean": delta_mse,
        "p_sham_permutation": float(p_sham),
        "tier": tier,
        "interpretation": (
            "Causal transfer model predicts held-out actuals better than mean null "
            "and beats sham (permuted cause) baselines."
            if tier in ("causal_support_preliminary", "weak_causal_hint")
            else "Transfer model does not beat null/sham on held-out actuals."
        ),
    }


def structural_model_vs_actual(
    *,
    layer: str,
    actual_metric: str,
    model_metric: str,
    null_metric: str | None = None,
    model_beats_null: bool,
    notes: str = "",
) -> dict[str, Any]:
    """Documented repo runs: compare model output to actual observations."""
    tier = "causal_support_preliminary" if model_beats_null else "no_causal_support"
    return {
        "method": "actual_vs_modelled",
        "layer": layer,
        "actual": actual_metric,
        "model": model_metric,
        "null_baseline": null_metric,
        "model_beats_null": bool(model_beats_null),
        "tier": tier,
        "notes": notes,
    }
