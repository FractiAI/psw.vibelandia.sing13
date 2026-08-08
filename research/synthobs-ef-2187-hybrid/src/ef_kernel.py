"""
E_F Coordinate Kernel — Python twin (research / SynthOBS).
Canonical runtime for Lattice Chat remains lib/ef-kernel.mjs (Node ESM).
Honesty: architectural index — not calorimeter or SI proof.
"""
from __future__ import annotations

import json
import math
from decimal import Decimal, getcontext
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DIGITS_PATH = ROOT / "data/ef-lattice/phi-digits-2187.txt"
MATRICES_PATH = ROOT / "data/ef-lattice/matrices-27.json"

getcontext().prec = 2500
K_B = 1.380649e-23


class EFKernel:
    def __init__(self, digits_count: int = 2187):
        self.digits_count = digits_count
        if DIGITS_PATH.is_file():
            self.phi_digits = DIGITS_PATH.read_text().strip()[:digits_count]
        else:
            phi = (Decimal(1) + Decimal(5).sqrt()) / Decimal(2)
            self.phi_digits = str(phi).split(".")[1][:digits_count]
        if len(self.phi_digits) != digits_count:
            raise ValueError(f"expected {digits_count} digits, got {len(self.phi_digits)}")
        self.matrices = self._build_matrices()

    def _build_matrices(self):
        meta = {}
        if MATRICES_PATH.is_file():
            doc = json.loads(MATRICES_PATH.read_text())
            meta = {m["matrix_id"]: m for m in doc.get("matrices", [])}
        out = []
        for m_idx in range(27):
            start = m_idx * 81
            end = start + 81
            digits = self.phi_digits[start:end]
            grid = [[int(digits[r * 9 + c]) for c in range(9)] for r in range(9)]
            m = meta.get(m_idx + 1, {})
            out.append(
                {
                    "matrix_id": m_idx + 1,
                    "octave": (m_idx // 9) + 1,
                    "grid": grid,
                    "digits": digits,
                    "name": m.get("name", f"Matrix {m_idx + 1}"),
                    "role": m.get("role", ""),
                }
            )
        return out

    def get_node_coordinate(self, node_id: int) -> dict:
        if not (1 <= node_id <= self.digits_count):
            raise ValueError("Node ID must be between 1 and 2187.")
        idx = node_id - 1
        matrix_idx = idx // 81
        sub = idx % 81
        return {
            "node_id": node_id,
            "digit": int(self.phi_digits[idx]),
            "octave": (matrix_idx // 9) + 1,
            "matrix_id": matrix_idx + 1,
            "matrix_row": sub // 9 + 1,
            "matrix_col": sub % 9 + 1,
            "matrix_name": self.matrices[matrix_idx]["name"],
        }

    def landauer_limit(self, temp_kelvin: float = 300.0, scaling_factor: float = 1.07) -> dict:
        theoretical = K_B * temp_kelvin * math.log(2)
        return {
            "joules_per_bit": scaling_factor * theoretical,
            "temp_kelvin": temp_kelvin,
            "scaling_factor": scaling_factor,
            "honesty": "Architectural label only — not calorimeter proof.",
        }


if __name__ == "__main__":
    ef = EFKernel()
    print(f"Loaded {len(ef.phi_digits)} digits across {len(ef.matrices)} matrices.")
    print(f"Node 2187: {ef.get_node_coordinate(2187)}")
    print(f"Landauer label (300K): {ef.landauer_limit()['joules_per_bit']:.4e} J/bit")
