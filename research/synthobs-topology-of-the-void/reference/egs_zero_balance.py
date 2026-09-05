#!/usr/bin/env python3
"""EGS zero-balance / void topology — catalog sketch (not vacuum QFT)."""
import math

PHI = (1.0 + math.sqrt(5.0)) / 2.0

def psi(n: int, x: float) -> float:
    return (PHI ** n) * math.sin(x)

def zero_balance(n: int = 3, x: float = 1e-9) -> float:
    return psi(n, x) + psi(n, -x)

def v_balance(limit: float = 20.0, steps: int = 4000) -> float:
    a, b = -limit, limit
    h = (b - a) / steps
    acc = 0.0
    for i in range(steps + 1):
        t = a + i * h
        w = 0.5 if i in (0, steps) else 1.0
        acc += w * (math.exp(-PHI * abs(t)) / (1.0 + abs(t)))
    return acc * h

if __name__ == "__main__":
    print("PHI", PHI)
    print("zero_balance", zero_balance())
    print("V_balance", v_balance())
