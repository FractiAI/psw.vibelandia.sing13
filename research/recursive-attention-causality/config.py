"""Recursive attention causality validation — cross-scale public-data study."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parents[1]
OUTPUT = ROOT / "output"
DATA = ROOT / "data"

DOC_ID = "WP-2026-ATTENTION-CAUSALITY-VALIDATION"
STUDY_TITLE = "Recursive Attention Loop — Causality Validation (Public Data)"

GEOMagnetic_DATA = REPO_ROOT / "research" / "geomagnetic-herbivore" / "data"
SUN_STUDY_JSON = REPO_ROOT / "interfaces" / "look-at-the-sun-study.json"

GRANGER_MAX_LAG = 7
PERMUTATION_N = 2000
RANDOM_SEED = 42
