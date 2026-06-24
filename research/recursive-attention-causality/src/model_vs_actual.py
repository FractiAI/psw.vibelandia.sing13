"""Actual vs modelled causality — primary validation standard."""
from __future__ import annotations

import math
from typing import Any

import numpy as np
from scipy import stats


def _mse(y: np.ndarray, yhat: np.ndarray) -> float:
    mask = np.isfinite(y) & np.isfinite(yhat)
    if mask.sum() < 1:
        return math.inf
    return float(np.mean((y[mask] - yhat[mask]) ** 2))


def _fit_ar1_only(effect: np.ndarray) -> tuple[float, float]:
    """effect[t] ~ a + d * effect[t-1]."""
    y = effect[1:]
    x = effect[:-1]
    mask = np.isfinite(x) & np.isfinite(y)
    x, y = x[mask], y[mask]
    if len(x) < 6 or float(np.std(x)) < 1e-12:
        return float(np.nanmean(effect)), 0.0
    d, a, _, _, _ = stats.linregress(x, y)
    return float(a), float(d)


def _predict_ar1_only(effect: np.ndarray, t: int, a: float, d: float) -> float:
    if t < 1 or not np.isfinite(effect[t - 1]):
        return float(np.nanmean(effect[:t])) if t else 0.0
    return a + d * effect[t - 1]


def _fit_nested(cause: np.ndarray, effect: np.ndarray, lag: int) -> tuple[float, float, float]:
    """effect[t] ~ a + b*cause[t-lag] + d*effect[t-1]."""
    start = max(lag, 1)
    rows_y, rows_c, rows_e = [], [], []
    for t in range(start, len(effect)):
        if not (np.isfinite(effect[t]) and np.isfinite(effect[t - 1])):
            continue
        c_idx = t - lag
        if c_idx < 0 or not np.isfinite(cause[c_idx]):
            continue
        rows_y.append(effect[t])
        rows_c.append(cause[c_idx])
        rows_e.append(effect[t - 1])
    if len(rows_y) < 8:
        a, d = _fit_ar1_only(effect)
        return a, 0.0, d
    y = np.array(rows_y)
    X = np.column_stack([np.ones(len(y)), rows_c, rows_e])
    coef, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
    return float(coef[0]), float(coef[1]), float(coef[2])


def _predict_nested(
    cause: np.ndarray,
    effect: np.ndarray,
    t: int,
    a: float,
    b: float,
    d: float,
    lag: int,
) -> float:
    if t < 1:
        return float(np.nanmean(effect[: max(t, 1)]))
    c_idx = t - lag
    if c_idx < 0 or not np.isfinite(cause[c_idx]):
        return _predict_ar1_only(effect, t, a, d)
    if not np.isfinite(effect[t - 1]):
        return a + b * cause[c_idx]
    return a + b * cause[c_idx] + d * effect[t - 1]


def _select_lag_nested(
    cause: np.ndarray,
    effect: np.ndarray,
    max_lag: int,
    val_frac: float = 0.2,
) -> int:
    n = len(effect)
    val_start = max(int(n * (1 - val_frac)), max_lag + 2)
    if val_start >= n - 3:
        val_start = max(n // 2, max_lag + 2)
    best_lag, best_mse = 0, math.inf
    for lag in range(0, max_lag + 1):
        a, b, d = _fit_nested(cause[:val_start], effect[:val_start], lag)
        preds, acts = [], []
        for t in range(val_start, n):
            preds.append(_predict_nested(cause, effect, t, a, b, d, lag))
            acts.append(effect[t])
        if len(acts) < 5:
            continue
        m = _mse(np.array(acts), np.array(preds))
        if m < best_mse:
            best_mse = m
            best_lag = lag
    return best_lag


def _circular_shift(x: np.ndarray, shift: int) -> np.ndarray:
    n = len(x)
    if n == 0:
        return x
    s = int(shift) % n
    if s == 0:
        s = 1
    return np.concatenate([x[s:], x[:s]])


def _oos_predictions(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    min_train: int,
    max_lag: int,
    lag: int | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, int]:
    """Walk-forward OOS predictions for causal, persistence, mean."""
    n = len(effect)
    lag_use = lag if lag is not None else _select_lag_nested(cause[:min_train], effect[:min_train], max_lag)
    oos_actual, oos_causal, oos_persist, oos_mean = [], [], [], []
    for t in range(min_train, n):
        c_tr, e_tr = cause[:t], effect[:t]
        a, b, d = _fit_nested(c_tr, e_tr, lag_use)
        pa, pd = _fit_ar1_only(e_tr)
        oos_actual.append(effect[t])
        oos_causal.append(_predict_nested(cause, effect, t, a, b, d, lag_use))
        oos_persist.append(_predict_ar1_only(effect, t, pa, pd))
        oos_mean.append(float(np.mean(e_tr)))
    return (
        np.array(oos_actual),
        np.array(oos_causal),
        np.array(oos_persist),
        np.array(oos_mean),
        lag_use,
    )


def _tier_from_scores(
    mse_causal: float,
    mse_persist: float,
    mse_mean: float,
    p_sham: float,
) -> str:
    beats_persist = mse_causal < mse_persist
    if not beats_persist or p_sham >= 0.05:
        return "no_causal_support"
    if p_sham < 0.01 and mse_causal < mse_mean:
        return "causal_support_preliminary"
    return "weak_causal_hint"


def walk_forward_model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    min_train_frac: float = 0.55,
    n_perm: int = 400,
    seed: int = 42,
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask].astype(float)
    e = effect[mask].astype(float)
    n = len(c)
    min_train = max(int(n * min_train_frac), max_lag + 12, 20)
    if n < min_train + 8:
        return {"n": n, "tier": "insufficient_data", "method": "actual_vs_modelled"}

    ya, yc, yp, ym, lag = _oos_predictions(c, e, min_train=min_train, max_lag=max_lag)
    mse_causal = _mse(ya, yc)
    mse_persist = _mse(ya, yp)
    mse_mean = _mse(ya, ym)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, 1.0)

    rng = np.random.default_rng(seed)
    sham_better = 0
    n_sham = min(n_perm, 400)
    for _ in range(n_sham):
        c_sham = _circular_shift(c, int(rng.integers(1, n)))
        _, yc_sham, _, _, _ = _oos_predictions(
            c_sham, e, min_train=min_train, max_lag=max_lag, lag=lag
        )
        if _mse(ya, yc_sham) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_sham + 1)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham)

    return {
        "method": "actual_vs_modelled",
        "eval": "walk_forward_nested_ar1",
        "n": int(n),
        "n_oos": int(len(ya)),
        "min_train": int(min_train),
        "best_lag": int(lag),
        "mse_causal_model": mse_causal,
        "mse_persistence_null": mse_persist,
        "mse_mean_null": mse_mean,
        "beats_persistence_null": bool(mse_causal < mse_persist),
        "beats_mean_null": bool(mse_causal < mse_mean),
        "delta_mse_vs_persistence": float(mse_persist - mse_causal),
        "p_sham_circular_shift": float(p_sham),
        "tier": tier,
        "interpretation": (
            "Nested AR+cause model beats persistence and sham circular-shift on walk-forward actuals."
            if tier in ("causal_support_preliminary", "weak_causal_hint")
            else "Transfer model does not beat persistence/sham on walk-forward actuals."
        ),
    }


def holdout_model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 400,
    seed: int = 42,
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask].astype(float)
    e = effect[mask].astype(float)
    n = len(c)
    if n < max_lag + 40:
        return walk_forward_model_vs_actual(c, e, max_lag=max_lag, n_perm=n_perm, seed=seed)

    split = int(n * (1 - holdout_frac))
    lag = _select_lag_nested(c[:split], e[:split], max_lag)
    a, b, d = _fit_nested(c[:split], e[:split], lag)
    pa, pd = _fit_ar1_only(e[:split])

    ya, yc, yp, ym = [], [], [], []
    for t in range(split, n):
        ya.append(e[t])
        yc.append(_predict_nested(c, e, t, a, b, d, lag))
        yp.append(_predict_ar1_only(e, t, pa, pd))
        ym.append(float(np.mean(e[:split])))
    ya, yc, yp, ym = map(np.array, (ya, yc, yp, ym))

    mse_causal = _mse(ya, yc)
    mse_persist = _mse(ya, yp)
    mse_mean = _mse(ya, ym)

    rng = np.random.default_rng(seed)
    sham_better = 0
    n_sham = min(n_perm, 400)
    for _ in range(n_sham):
        c_sham = _circular_shift(c, int(rng.integers(1, n)))
        a_s, b_s, d_s = _fit_nested(c_sham[:split], e[:split], lag)
        preds = [_predict_nested(c_sham, e, i, a_s, b_s, d_s, lag) for i in range(split, n)]
        if _mse(ya, np.array(preds)) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_sham + 1)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham)

    return {
        "method": "actual_vs_modelled",
        "eval": "holdout_nested_ar1",
        "n": int(n),
        "n_oos": int(len(ya)),
        "best_lag": int(lag),
        "mse_causal_model": mse_causal,
        "mse_persistence_null": mse_persist,
        "mse_mean_null": mse_mean,
        "beats_persistence_null": bool(mse_causal < mse_persist),
        "beats_mean_null": bool(mse_causal < mse_mean),
        "delta_mse_vs_persistence": float(mse_persist - mse_causal),
        "p_sham_circular_shift": float(p_sham),
        "tier": tier,
        "interpretation": (
            "Nested AR+cause model beats persistence and sham on held-out actuals."
            if tier in ("causal_support_preliminary", "weak_causal_hint")
            else "Transfer model does not beat persistence/sham on held-out actuals."
        ),
    }


def model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 400,
    seed: int = 42,
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    n = int(mask.sum())
    if n < 120:
        return walk_forward_model_vs_actual(
            cause, effect, max_lag=max_lag, n_perm=n_perm, seed=seed
        )
    return holdout_model_vs_actual(
        cause, effect, max_lag=max_lag, holdout_frac=holdout_frac, n_perm=n_perm, seed=seed
    )


def structural_model_vs_actual(
    *,
    layer: str,
    actual_metric: str,
    model_metric: str,
    null_metric: str | None = None,
    model_beats_null: bool,
    notes: str = "",
) -> dict[str, Any]:
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
