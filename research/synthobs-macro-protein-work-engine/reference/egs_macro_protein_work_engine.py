"""EGS Macro-Protein Work Engine — deterministic catalog sketch.

Honesty: algebraic / geometric fixtures only. Not a wet-lab proof that
organisms are single proteins, a CODATA biological octave, or a clinical claim.
"""

from __future__ import annotations

import math
from typing import Any


PHI = (1.0 + math.sqrt(5.0)) / 2.0  # Φ_EGS ≈ 1.618033988749895
THETA_BIO_LO, THETA_BIO_HI = 13, 17


def work_capacity(n: int, W0: float = 1.0, E_activ: float = 1.0) -> float:
    return W0 * (PHI**n) * math.exp(-E_activ / (PHI**n))


def theta_bio(Lambda_organism: float, Lambda_pe: float) -> float:
    return math.log(Lambda_organism / Lambda_pe) / math.log(PHI)


class EGSMacroProteinWorkEngine:
    """Catalog work-engine for organismal octave filing (catalog length units)."""

    def __init__(self, Lambda_organism: float, Lambda_pe: float = 1.0):
        self.Lambda_organism = float(Lambda_organism)
        self.Lambda_pe = float(Lambda_pe)
        self.theta = theta_bio(self.Lambda_organism, self.Lambda_pe)

    def in_bio_band(self) -> bool:
        return THETA_BIO_LO <= self.theta <= THETA_BIO_HI

    def work_at_nearest_tier(self) -> dict[str, Any]:
        n = int(round(self.theta))
        return {
            "tier": n,
            "W": work_capacity(n),
            "in_band": THETA_BIO_LO <= n <= THETA_BIO_HI,
            "theta": self.theta,
        }


if __name__ == "__main__":
    # Mid-band fixture: Λ_organism = Φ^15 · Λ_pe
    eng = EGSMacroProteinWorkEngine(PHI**15)
    print({"theta": eng.theta, "in_band": eng.in_bio_band(), **eng.work_at_nearest_tier()})
