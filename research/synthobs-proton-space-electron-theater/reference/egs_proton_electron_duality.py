#!/usr/bin/env python3
"""EGS Proton Space / Electron Theater duality — catalog sketch (not CODATA)."""
import math

PHI = (1.0 + math.sqrt(5.0)) / 2.0

def leading_digit(x: float) -> int:
    return int(f"{abs(x):.15e}"[0])

def psi_core() -> complex:
    return complex(math.cos(2 * math.pi / PHI), math.sin(2 * math.pi / PHI))

def v2_partial(n: int = 24) -> float:
    return sum((PHI ** k) / (2.0 * math.log(2.0)) for k in range(1, n + 1))

if __name__ == "__main__":
    print("PHI", PHI, "leading", leading_digit(PHI))
    print("hbar_mantissa_talk leading", leading_digit(1.0545718))
    print("psi_core", psi_core())
    print("V2_partial", v2_partial())
