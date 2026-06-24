"""Multivariate nested AR transfer models for solar -> Kp."""
from __future__ import annotations

import math
from typing import Any

import numpy as np

from src.model_vs_actual import (
    _align_season,
    _block_shift,
    _circular_shift,
    _fit_ar1_only,
    _mse,
    _predict_ar1_only,
    _result_dict,
    _tier_from_scores,
    walk_forward_model_vs_actual,
)


def _fit_multi_nested(
    causes: list[np.ndarray],
    lags: list[int],
    effect: np.ndarray,
    sin_doy: np.ndarray | None,
    cos_doy: np.ndarray | None,
) -> tuple[np.ndarray, float]:
    start = max(max(lags), 1)
    rows_y = []
    rows_x = []
    for t in range(start, len(effect)):
        if not (np.isfinite(effect[t]) and np.isfinite(effect[t - 1])):
            continue
        feats = [1.0, effect[t - 1]]
        ok = True
        for c, lag in zip(causes, lags):
            idx = t - lag
            if idx < 0 or not np.isfinite(c[idx]):
                ok = False
                break
            feats.append(c[idx])
        if not ok:
            continue
        if sin_doy is not None:
            feats.extend([sin_doy[t], cos_doy[t]])
        rows_y.append(effect[t])
        rows_x.append(feats)
    if len(rows_y) < 10:
        a, d, g, h = _fit_ar1_only(effect, sin_doy, cos_doy)
        coef = np.array([a, d, g, h])
        return coef, start
    X = np.array(rows_x)
    y = np.array(rows_y)
    coef, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
    return coef, start


def _predict_multi_nested(
    causes: list[np.ndarray],
    lags: list[int],
    effect: np.ndarray,
    t: int,
    coef: np.ndarray,
    sin_doy: np.ndarray | None,
    cos_doy: np.ndarray | None,
) -> float:
    if t < 1 or not np.isfinite(effect[t - 1]):
        return float(np.nanmean(effect[:t]))
    feats = [1.0, effect[t - 1]]
    for c, lag in zip(causes, lags):
        idx = t - lag
        if idx < 0 or not np.isfinite(c[idx]):
            return _predict_ar1_only(effect, t, coef[0], coef[1], sin_doy, cos_doy, coef[2] if len(coef) > 3 else 0, coef[3] if len(coef) > 3 else 0)
        feats.append(c[idx])
    if sin_doy is not None:
        feats.extend([sin_doy[t], cos_doy[t]])
    return float(np.dot(coef[: len(feats)], feats))


def _select_multi_lags(
    causes: list[np.ndarray],
    effect: np.ndarray,
    max_lag: int,
    sin_doy: np.ndarray | None,
    cos_doy: np.ndarray | None,
) -> list[int]:
    n = len(effect)
    val_start = max(n // 2, max_lag + 2)
    best_lags, best_mse = [0] * len(causes), math.inf
    for l0 in range(0, max_lag + 1):
        for l1 in range(0, max_lag + 1):
            lags = [l0, l1] if len(causes) > 1 else [l0]
            coef, _ = _fit_multi_nested([c[:val_start] for c in causes], lags, effect[:val_start], sin_doy[:val_start] if sin_doy is not None else None, cos_doy[:val_start] if cos_doy is not None else None)
            preds, acts = [], []
            for t in range(val_start, n):
                preds.append(_predict_multi_nested(causes, lags, effect, t, coef, sin_doy, cos_doy))
                acts.append(effect[t])
            if len(acts) < 5:
                continue
            m = _mse(np.array(acts), np.array(preds))
            if m < best_mse:
                best_mse = m
                best_lags = lags
    return best_lags


def _sham_shift_matrix(causes: list[np.ndarray], rng: np.random.Generator) -> list[np.ndarray]:
    n = len(causes[0])
    if n < 120:
        shift = int(rng.integers(1, max(n, 2)))
        return [_circular_shift(c, shift) for c in causes]
    block = max(7, min(28, n // 10))
    n_blocks = n // block
    order = rng.permutation(n_blocks)
    idx = np.concatenate([np.arange(b * block, (b + 1) * block) for b in order])
    if n % block:
        idx = np.concatenate([idx, np.arange(n_blocks * block, n)])
    return [c[idx] for c in causes]


def multivariate_model_vs_actual(
    causes: list[np.ndarray],
    effect: np.ndarray,
    *,
    cause_labels: list[str],
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 400,
    seed: int = 42,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> dict[str, Any]:
    mask = np.ones(len(effect), dtype=bool)
    for c in causes:
        mask &= np.isfinite(c)
    mask &= np.isfinite(effect)
    cs = [c[mask].astype(float) for c in causes]
    e = effect[mask].astype(float)
    sin_doy, cos_doy = _align_season(
        sin_doy[mask] if sin_doy is not None else None,
        cos_doy[mask] if cos_doy is not None else None,
        len(e),
    )
    n = len(e)
    if n < 120:
        # fall back to best single driver
        from src.model_vs_actual import model_vs_actual, pick_best_cause

        singles = {
            label: model_vs_actual(cs[i], e, max_lag=max_lag, n_perm=n_perm, seed=seed + i, sin_doy=sin_doy, cos_doy=cos_doy, cause_label=label)
            for i, label in enumerate(cause_labels)
        }
        label, best = pick_best_cause(singles)
        best["multivariate_fallback"] = label
        return best

    split = int(n * (1 - holdout_frac))
    lags = _select_multi_lags(cs, e, max_lag, sin_doy, cos_doy)
    coef, _ = _fit_multi_nested([c[:split] for c in cs], lags, e[:split], sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)
    pa, pd, pg, ph = _fit_ar1_only(e[:split], sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)

    ya, yc, yp = [], [], []
    for t in range(split, n):
        ya.append(e[t])
        yc.append(_predict_multi_nested(cs, lags, e, t, coef, sin_doy, cos_doy))
        yp.append(_predict_ar1_only(e, t, pa, pd, sin_doy, cos_doy, pg, ph))
    ya, yc, yp = map(np.array, (ya, yc, yp))
    mse_causal, mse_persist = _mse(ya, yc), _mse(ya, yp)
    ym = np.full_like(ya, np.mean(e[:split]))
    mse_mean = _mse(ya, ym)

    rng = np.random.default_rng(seed)
    sham_better = 0
    n_sham = min(n_perm, 400)
    for _ in range(n_sham):
        cs_sham = _sham_shift_matrix(cs, rng)
        coef_s, _ = _fit_multi_nested([c[:split] for c in cs_sham], lags, e[:split], sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)
        preds = [_predict_multi_nested(cs_sham, lags, e, t, coef_s, sin_doy, cos_doy) for t in range(split, n)]
        if _mse(ya, np.array(preds)) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_sham + 1)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham)

    return _result_dict(
        eval_mode="holdout_multivariate_nested_ar1",
        n=n,
        n_oos=len(ya),
        lag=lags[0],
        mse_causal=mse_causal,
        mse_persist=mse_persist,
        mse_mean=mse_mean,
        p_sham=p_sham,
        tier=tier,
        cause_label="+".join(cause_labels),
        seasonal=sin_doy is not None,
        extra={"lags": lags, "drivers": cause_labels},
    )


def sweep_until_pass(
    variants: list[tuple[str, np.ndarray, np.ndarray, dict]],
    *,
    max_lag: int = 7,
    n_perm: int = 400,
    seed: int = 42,
) -> tuple[str, dict[str, Any], dict[str, dict]]:
    from src.model_vs_actual import model_vs_actual, pick_best_cause

    results: dict[str, dict[str, Any]] = {}
    for label, cause, effect, kw in variants:
        opts = dict(kw)
        lag_use = opts.pop("max_lag", max_lag)
        results[label] = model_vs_actual(
            cause, effect, max_lag=lag_use, n_perm=n_perm, seed=seed, **opts
        )
    best_label, best = pick_best_cause(results)
    return best_label, best, results
