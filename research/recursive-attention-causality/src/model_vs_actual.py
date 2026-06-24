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


def _align_season(
    sin_doy: np.ndarray | None,
    cos_doy: np.ndarray | None,
    n: int,
) -> tuple[np.ndarray | None, np.ndarray | None]:
    if sin_doy is None or cos_doy is None:
        return None, None
    sin_doy = np.asarray(sin_doy, dtype=float)[:n]
    cos_doy = np.asarray(cos_doy, dtype=float)[:n]
    return sin_doy, cos_doy


def _fit_ar1_only(
    effect: np.ndarray,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> tuple[float, float, float, float]:
    """effect[t] ~ a + d*effect[t-1] [+ seasonal]. Returns (a, d, g, h)."""
    y = effect[1:]
    x = effect[:-1]
    mask = np.isfinite(x) & np.isfinite(y)
    if sin_doy is not None:
        mask &= np.isfinite(sin_doy[1:]) & np.isfinite(cos_doy[1:])
    x, y = x[mask], y[mask]
    if len(x) < 6 or float(np.std(x)) < 1e-12:
        return float(np.nanmean(effect)), 0.0, 0.0, 0.0
    if sin_doy is not None:
        X = np.column_stack([np.ones(len(y)), x, sin_doy[1:][mask], cos_doy[1:][mask]])
        coef, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
        return float(coef[0]), float(coef[1]), float(coef[2]), float(coef[3])
    d, a, _, _, _ = stats.linregress(x, y)
    return float(a), float(d), 0.0, 0.0


def _predict_ar1_only(
    effect: np.ndarray,
    t: int,
    a: float,
    d: float,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    g: float = 0.0,
    h: float = 0.0,
) -> float:
    if t < 1 or not np.isfinite(effect[t - 1]):
        return float(np.nanmean(effect[:t])) if t else 0.0
    base = a + d * effect[t - 1]
    if sin_doy is not None and t < len(sin_doy):
        base += g * sin_doy[t] + h * cos_doy[t]
    return base


def _fit_nested(
    cause: np.ndarray,
    effect: np.ndarray,
    lag: int,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> tuple[float, float, float, float, float]:
    """effect[t] ~ a + b*cause[t-lag] + d*effect[t-1] [+ seasonal]."""
    start = max(lag, 1)
    rows_y, rows_c, rows_e, rows_s, rows_c2 = [], [], [], [], []
    for t in range(start, len(effect)):
        if not (np.isfinite(effect[t]) and np.isfinite(effect[t - 1])):
            continue
        c_idx = t - lag
        if c_idx < 0 or not np.isfinite(cause[c_idx]):
            continue
        rows_y.append(effect[t])
        rows_c.append(cause[c_idx])
        rows_e.append(effect[t - 1])
        if sin_doy is not None:
            rows_s.append(sin_doy[t])
            rows_c2.append(cos_doy[t])
    if len(rows_y) < 8:
        a, d, g, h = _fit_ar1_only(effect, sin_doy, cos_doy)
        return a, 0.0, d, g, h
    y = np.array(rows_y)
    if sin_doy is not None:
        X = np.column_stack([np.ones(len(y)), rows_c, rows_e, rows_s, rows_c2])
    else:
        X = np.column_stack([np.ones(len(y)), rows_c, rows_e])
    coef, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
    if sin_doy is not None:
        return float(coef[0]), float(coef[1]), float(coef[2]), float(coef[3]), float(coef[4])
    return float(coef[0]), float(coef[1]), float(coef[2]), 0.0, 0.0


def _predict_nested(
    cause: np.ndarray,
    effect: np.ndarray,
    t: int,
    a: float,
    b: float,
    d: float,
    lag: int,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    g: float = 0.0,
    h: float = 0.0,
) -> float:
    if t < 1:
        return float(np.nanmean(effect[: max(t, 1)]))
    c_idx = t - lag
    if c_idx < 0 or not np.isfinite(cause[c_idx]):
        return _predict_ar1_only(effect, t, a, d, sin_doy, cos_doy, g, h)
    if not np.isfinite(effect[t - 1]):
        base = a + b * cause[c_idx]
    else:
        base = a + b * cause[c_idx] + d * effect[t - 1]
    if sin_doy is not None and t < len(sin_doy):
        base += g * sin_doy[t] + h * cos_doy[t]
    return base


def _select_lag_nested(
    cause: np.ndarray,
    effect: np.ndarray,
    max_lag: int,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    val_frac: float = 0.2,
) -> int:
    n = len(effect)
    val_start = max(int(n * (1 - val_frac)), max_lag + 2)
    if val_start >= n - 3:
        val_start = max(n // 2, max_lag + 2)
    best_lag, best_mse = 0, math.inf
    for lag in range(0, max_lag + 1):
        a, b, d, g, h = _fit_nested(cause[:val_start], effect[:val_start], lag, sin_doy, cos_doy)
        preds, acts = [], []
        for t in range(val_start, n):
            preds.append(_predict_nested(cause, effect, t, a, b, d, lag, sin_doy, cos_doy, g, h))
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
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, int]:
    n = len(effect)
    lag_use = (
        lag
        if lag is not None
        else _select_lag_nested(cause[:min_train], effect[:min_train], max_lag, sin_doy, cos_doy)
    )
    oos_actual, oos_causal, oos_persist, oos_mean = [], [], [], []
    for t in range(min_train, n):
        c_tr, e_tr = cause[:t], effect[:t]
        a, b, d, g, h = _fit_nested(c_tr, e_tr, lag_use, sin_doy[:t] if sin_doy is not None else None, cos_doy[:t] if cos_doy is not None else None)
        pa, pd, pg, ph = _fit_ar1_only(e_tr, sin_doy[:t] if sin_doy is not None else None, cos_doy[:t] if cos_doy is not None else None)
        oos_actual.append(effect[t])
        oos_causal.append(_predict_nested(cause, effect, t, a, b, d, lag_use, sin_doy, cos_doy, g, h))
        oos_persist.append(_predict_ar1_only(effect, t, pa, pd, sin_doy, cos_doy, pg, ph))
        oos_mean.append(float(np.mean(e_tr)))
    return (
        np.array(oos_actual),
        np.array(oos_causal),
        np.array(oos_persist),
        np.array(oos_mean),
        lag_use,
    )


def _tier_from_scores(mse_causal: float, mse_persist: float, mse_mean: float, p_sham: float) -> str:
    if mse_causal >= mse_persist or p_sham >= 0.05:
        return "no_causal_support"
    if p_sham < 0.01 and mse_causal < mse_mean:
        return "causal_support_preliminary"
    return "weak_causal_hint"


def _block_shift(x: np.ndarray, block: int, rng: np.random.Generator) -> np.ndarray:
    """Block shuffle preserving short-range autocorrelation."""
    n = len(x)
    if n < block * 2:
        return _circular_shift(x, int(rng.integers(1, max(n, 2))))
    n_blocks = n // block
    blocks = [x[i * block : (i + 1) * block] for i in range(n_blocks)]
    rem = x[n_blocks * block :]
    order = rng.permutation(n_blocks)
    shuffled = np.concatenate([blocks[i] for i in order] + ([rem] if len(rem) else []))
    return shuffled[:n]


def _sham_shift(x: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Long series: block shuffle; mid-length panels: block; very short: circular shift."""
    n = len(x)
    if n >= 120:
        block = max(7, min(28, n // 10))
        return _block_shift(x, block, rng)
    if n >= 40:
        block = max(4, min(13, n // 8))
        return _block_shift(x, block, rng)
    return _circular_shift(x, int(rng.integers(1, max(n, 2))))


def walk_forward_model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    min_train_frac: float = 0.55,
    n_perm: int = 400,
    seed: int = 42,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    cause_label: str = "cause",
    oos_start: int | None = None,
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask].astype(float)
    e = effect[mask].astype(float)
    sin_doy, cos_doy = _align_season(sin_doy[mask] if sin_doy is not None else None, cos_doy[mask] if cos_doy is not None else None, len(c))
    n = len(c)
    min_train = max(int(n * min_train_frac), max_lag + 12, 20)
    if oos_start is not None:
        min_train = max(min_train, int(oos_start))
    if n < min_train + 8:
        return {"n": n, "tier": "insufficient_data", "method": "actual_vs_modelled", "cause_label": cause_label}

    ya, yc, yp, ym, lag = _oos_predictions(
        c, e, min_train=min_train, max_lag=max_lag, sin_doy=sin_doy, cos_doy=cos_doy
    )
    mse_causal, mse_persist, mse_mean = _mse(ya, yc), _mse(ya, yp), _mse(ya, ym)

    rng = np.random.default_rng(seed)
    sham_better = 0
    n_sham = min(n_perm, 400)
    for _ in range(n_sham):
        c_sham = _sham_shift(c, rng)
        _, yc_sham, _, _, _ = _oos_predictions(
            c_sham, e, min_train=min_train, max_lag=max_lag, lag=lag, sin_doy=sin_doy, cos_doy=cos_doy
        )
        if _mse(ya, yc_sham) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_sham + 1)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham)

    return _result_dict(
        eval_mode="walk_forward_nested_ar1",
        n=n,
        n_oos=len(ya),
        lag=lag,
        mse_causal=mse_causal,
        mse_persist=mse_persist,
        mse_mean=mse_mean,
        p_sham=p_sham,
        tier=tier,
        cause_label=cause_label,
        seasonal=sin_doy is not None,
        extra={"min_train": int(min_train)},
    )


def holdout_model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 400,
    seed: int = 42,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    cause_label: str = "cause",
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    c = cause[mask].astype(float)
    e = effect[mask].astype(float)
    sin_doy, cos_doy = _align_season(sin_doy[mask] if sin_doy is not None else None, cos_doy[mask] if cos_doy is not None else None, len(c))
    n = len(c)
    if n < max_lag + 40:
        return walk_forward_model_vs_actual(
            c, e, max_lag=max_lag, n_perm=n_perm, seed=seed, sin_doy=sin_doy, cos_doy=cos_doy, cause_label=cause_label
        )

    split = int(n * (1 - holdout_frac))
    lag = _select_lag_nested(c[:split], e[:split], max_lag, sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)
    a, b, d, g, h = _fit_nested(c[:split], e[:split], lag, sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)
    pa, pd, pg, ph = _fit_ar1_only(e[:split], sin_doy[:split] if sin_doy is not None else None, cos_doy[:split] if cos_doy is not None else None)

    ya, yc, yp, ym = [], [], [], []
    for t in range(split, n):
        ya.append(e[t])
        yc.append(_predict_nested(c, e, t, a, b, d, lag, sin_doy, cos_doy, g, h))
        yp.append(_predict_ar1_only(e, t, pa, pd, sin_doy, cos_doy, pg, ph))
        ym.append(float(np.mean(e[:split])))
    ya, yc, yp, ym = map(np.array, (ya, yc, yp, ym))
    mse_causal, mse_persist, mse_mean = _mse(ya, yc), _mse(ya, yp), _mse(ya, ym)

    rng = np.random.default_rng(seed)
    sham_better = 0
    n_sham = min(n_perm, 400)
    for _ in range(n_sham):
        c_sham = _sham_shift(c, rng)
        a_s, b_s, d_s, g_s, h_s = _fit_nested(
            c_sham[:split], e[:split], lag,
            sin_doy[:split] if sin_doy is not None else None,
            cos_doy[:split] if cos_doy is not None else None,
        )
        preds = [_predict_nested(c_sham, e, i, a_s, b_s, d_s, lag, sin_doy, cos_doy, g_s, h_s) for i in range(split, n)]
        if _mse(ya, np.array(preds)) <= mse_causal:
            sham_better += 1
    p_sham = (sham_better + 1) / (n_sham + 1)
    tier = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham)

    return _result_dict(
        eval_mode="holdout_nested_ar1",
        n=n,
        n_oos=len(ya),
        lag=lag,
        mse_causal=mse_causal,
        mse_persist=mse_persist,
        mse_mean=mse_mean,
        p_sham=p_sham,
        tier=tier,
        cause_label=cause_label,
        seasonal=sin_doy is not None,
    )


def _result_dict(
    *,
    eval_mode: str,
    n: int,
    n_oos: int,
    lag: int,
    mse_causal: float,
    mse_persist: float,
    mse_mean: float,
    p_sham: float,
    tier: str,
    cause_label: str,
    seasonal: bool,
    extra: dict | None = None,
) -> dict[str, Any]:
    out = {
        "method": "actual_vs_modelled",
        "eval": eval_mode,
        "cause_label": cause_label,
        "seasonal_controls": seasonal,
        "n": int(n),
        "n_oos": int(n_oos),
        "best_lag": int(lag),
        "mse_causal_model": mse_causal,
        "mse_persistence_null": mse_persist,
        "mse_mean_null": mse_mean,
        "beats_persistence_null": bool(mse_causal < mse_persist),
        "beats_mean_null": bool(mse_causal < mse_mean),
        "delta_mse_vs_persistence": float(mse_persist - mse_causal),
        "p_sham": float(p_sham),
        "tier": tier,
        "interpretation": (
            "Nested AR+cause model beats seasonal persistence and sham on actuals."
            if tier in ("causal_support_preliminary", "weak_causal_hint")
            else "Transfer model does not beat persistence/sham on actuals."
        ),
    }
    if extra:
        out.update(extra)
    return out


def model_vs_actual(
    cause: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 7,
    holdout_frac: float = 0.3,
    n_perm: int = 400,
    seed: int = 42,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
    cause_label: str = "cause",
) -> dict[str, Any]:
    mask = np.isfinite(cause) & np.isfinite(effect)
    n = int(mask.sum())
    if n < 120:
        return walk_forward_model_vs_actual(
            cause, effect, max_lag=max_lag, n_perm=n_perm, seed=seed,
            sin_doy=sin_doy, cos_doy=cos_doy, cause_label=cause_label,
        )
    return holdout_model_vs_actual(
        cause, effect, max_lag=max_lag, holdout_frac=holdout_frac, n_perm=n_perm, seed=seed,
        sin_doy=sin_doy, cos_doy=cos_doy, cause_label=cause_label,
    )


def _holdout_causal_mse(
    cause: np.ndarray,
    effect: np.ndarray,
    lag: int,
    *,
    holdout_frac: float = 0.3,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> float:
    n = len(effect)
    split = int(n * (1 - holdout_frac))
    if split < lag + 12 or n - split < 5:
        ya, yc, _, _, _ = _oos_predictions(
            cause, effect, min_train=max(split, lag + 12), max_lag=lag, lag=lag,
            sin_doy=sin_doy, cos_doy=cos_doy,
        )
        return _mse(ya, yc)
    a, b, d, g, h = _fit_nested(
        cause[:split], effect[:split], lag,
        sin_doy[:split] if sin_doy is not None else None,
        cos_doy[:split] if cos_doy is not None else None,
    )
    preds = [
        _predict_nested(cause, effect, i, a, b, d, lag, sin_doy, cos_doy, g, h)
        for i in range(split, n)
    ]
    return _mse(effect[split:n], np.array(preds))


def _build_mediator_hat_oos(
    cause: np.ndarray,
    mediator: np.ndarray,
    *,
    min_train: int,
    max_lag: int,
    sin_doy: np.ndarray | None,
    cos_doy: np.ndarray | None,
) -> np.ndarray:
    """Out-of-sample mediator predictions from cause (NaN before min_train)."""
    n = len(cause)
    m_hat = np.full(n, np.nan)
    for t in range(min_train, n):
        lag1 = _select_lag_nested(
            cause[:t],
            mediator[:t],
            max_lag,
            sin_doy[:t] if sin_doy is not None else None,
            cos_doy[:t] if cos_doy is not None else None,
        )
        a1, b1, d1, g1, h1 = _fit_nested(
            cause[:t],
            mediator[:t],
            lag1,
            sin_doy[:t] if sin_doy is not None else None,
            cos_doy[:t] if cos_doy is not None else None,
        )
        m_hat[t] = _predict_nested(cause, mediator, t, a1, b1, d1, lag1, sin_doy, cos_doy, g1, h1)
    return m_hat


def composed_chain_vs_actual(
    cause: np.ndarray,
    mediator: np.ndarray,
    effect: np.ndarray,
    *,
    max_lag: int = 5,
    min_train_frac: float = 0.55,
    n_perm: int = 400,
    seed: int = 42,
    sin_doy: np.ndarray | None = None,
    cos_doy: np.ndarray | None = None,
) -> dict[str, Any]:
    """Two-stage: cause->mediator_hat (OOS), then mediator_hat->effect vs actual effect."""
    mask = np.isfinite(cause) & np.isfinite(mediator) & np.isfinite(effect)
    c = cause[mask].astype(float)
    m = mediator[mask].astype(float)
    e = effect[mask].astype(float)
    sin_doy, cos_doy = _align_season(sin_doy[mask] if sin_doy is not None else None, cos_doy[mask] if cos_doy is not None else None, len(c))
    n = len(c)
    min_train = max(int(n * min_train_frac), max_lag + 12, 20)
    if n < min_train + 8:
        return {"tier": "insufficient_data", "method": "composed_chain"}

    m_hat = _build_mediator_hat_oos(
        c, m, min_train=min_train, max_lag=max_lag, sin_doy=sin_doy, cos_doy=cos_doy
    )

    oos = np.isfinite(m_hat)
    result = model_vs_actual(
        m_hat[oos],
        e[oos],
        max_lag=max_lag,
        n_perm=n_perm,
        seed=seed,
        sin_doy=sin_doy[oos] if sin_doy is not None else None,
        cos_doy=cos_doy[oos] if cos_doy is not None else None,
        cause_label="mediator_hat_from_cause",
    )
    result["method"] = "composed_chain_actual_vs_modelled"
    result["stage1"] = model_vs_actual(
        c, m, max_lag=max_lag, n_perm=min(n_perm, 200), seed=seed + 1,
        sin_doy=sin_doy, cos_doy=cos_doy, cause_label="cause_to_mediator",
    )
    result["stage2_direct"] = model_vs_actual(
        m, e, max_lag=max_lag, n_perm=min(n_perm, 200), seed=seed + 2,
        sin_doy=sin_doy, cos_doy=cos_doy, cause_label="mediator_to_effect",
    )

    # Sham null: permute root cause, rebuild mediator_hat, re-evaluate stage-2 holdout.
    rng = np.random.default_rng(seed)
    n_sham = min(n_perm, 150)
    mse_causal = result["mse_causal_model"]
    lag_stage2 = result["best_lag"]
    holdout_frac = 0.3
    sham_better = 0
    for _ in range(n_sham):
        c_sham = _sham_shift(c, rng)
        m_hat_sham = _build_mediator_hat_oos(
            c_sham, m, min_train=min_train, max_lag=max_lag, sin_doy=sin_doy, cos_doy=cos_doy
        )
        oos_s = np.isfinite(m_hat_sham)
        mse_sham = _holdout_causal_mse(
            m_hat_sham[oos_s],
            e[oos_s],
            lag_stage2,
            holdout_frac=holdout_frac,
            sin_doy=sin_doy[oos_s] if sin_doy is not None else None,
            cos_doy=cos_doy[oos_s] if cos_doy is not None else None,
        )
        if mse_sham <= mse_causal:
            sham_better += 1
    p_sham_chain = (sham_better + 1) / (n_sham + 1)
    mse_persist = result["mse_persistence_null"]
    mse_mean = result["mse_mean_null"]
    tier_chain = _tier_from_scores(mse_causal, mse_persist, mse_mean, p_sham_chain)
    result["p_sham"] = float(p_sham_chain)
    result["tier"] = tier_chain
    result["interpretation"] = (
        "Nested AR+mediator_hat model beats seasonal persistence and root-cause sham on actuals."
        if tier_chain in ("causal_support_preliminary", "weak_causal_hint")
        else "Composed chain does not beat persistence/sham on actuals."
    )
    return result


def pick_best_cause(results: dict[str, dict[str, Any]]) -> tuple[str, dict[str, Any]]:
    rank = {"causal_support_preliminary": 3, "weak_causal_hint": 2, "no_causal_support": 1, "insufficient_data": 0}

    def score(item: tuple) -> tuple:
        label, r = item
        sham_p = r.get("p_sham", r.get("p_sham_block_shift", 1.0))
        beats = bool(r.get("beats_persistence_null", False))
        return (rank.get(r.get("tier", ""), 0), beats, -sham_p, r.get("delta_mse_vs_persistence", 0))

    return max(results.items(), key=score)


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
