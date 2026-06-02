"""Publication-quality figures."""
from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from config import DATA, OUTPUT


def _setup():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sns.set_theme(style="whitegrid", context="paper", font_scale=1.05)
    plt.rcParams["figure.dpi"] = 150


def plot_orientation_rose(traj: pd.DataFrame, path: Path):
    h = traj["heading_deg"].dropna().values
    if len(h) < 5:
        return
    _setup()
    fig, ax = plt.subplots(subplot_kw=dict(projection="polar"), figsize=(5, 5))
    bins = np.linspace(0, 2 * np.pi, 17)
    ax.hist(np.deg2rad(h % 360), bins=bins, color="#5eead4", edgecolor="#0f172a", alpha=0.85)
    ax.set_title("Heading distribution (geographic north)", pad=16)
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def plot_kp_storm(merged: pd.DataFrame, path: Path):
    if merged.empty or "kp_max" not in merged.columns:
        return
    _setup()
    fig, ax1 = plt.subplots(figsize=(10, 4))
    dates = pd.to_datetime(merged["date"])
    ax1.bar(dates, merged["kp_max"], color="#facc15", alpha=0.7, label="Kp max (daily)")
    ax1.set_ylabel("Kp")
    ax2 = ax1.twinx()
    ax2.plot(dates, merged["mean_step_km"], color="#5eead4", lw=1.5, label="Mean step km")
    ax2.set_ylabel("Mean daily step (km)")
    ax1.set_title("Storm index vs herd displacement (GPS collar layer)")
    fig.autofmt_xdate()
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def plot_correlation_heatmap(merged: pd.DataFrame, path: Path):
    cols = [c for c in ["kp_max", "mean_step_km", "herd_spread_km", "directional_consistency"] if c in merged.columns]
    if len(cols) < 2:
        return
    _setup()
    corr = merged[cols].corr()
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0, ax=ax)
    ax.set_title("Correlation heatmap")
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def plot_movement_map(traj: pd.DataFrame, path: Path):
    t = traj[traj["source"] == "movebank_gps"]
    if t.empty:
        t = traj
    if t.empty:
        return
    _setup()
    fig, ax = plt.subplots(figsize=(8, 6))
    for ind, grp in t.groupby("individual_id"):
        ax.plot(grp["lon"], grp["lat"], alpha=0.35, lw=0.8)
    ax.scatter(t["lon"], t["lat"], s=4, c="#f472b6", alpha=0.5)
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title("Movement trajectories (WGS84)")
    ax.set_aspect("equal", adjustable="datalim")
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def generate_all(traj: pd.DataFrame, merged: pd.DataFrame):
    plot_orientation_rose(traj, OUTPUT / "fig_orientation_rose.png")
    plot_kp_storm(merged, OUTPUT / "fig_storm_comparison.png")
    plot_correlation_heatmap(merged, OUTPUT / "fig_correlation_heatmap.png")
    plot_movement_map(traj, OUTPUT / "fig_movement_map.png")
