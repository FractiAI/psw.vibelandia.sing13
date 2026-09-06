#!/usr/bin/env python3
"""Prime-Vault vs AlphaFold race sketch — catalog fixtures only."""
from __future__ import annotations
import math
import time

PHI = (1.0 + math.sqrt(5.0)) / 2.0


def odd_primes(n: int) -> list[int]:
    out: list[int] = []
    c = 3
    while len(out) < n:
        if all(c % p for p in out if p * p <= c):
            out.append(c)
        c += 2
    return out


def prime_vault_fold(n_residues: int, octave: int = 1) -> dict:
    t0 = time.perf_counter()
    primes = odd_primes(n_residues)
    energy = sum(
        (PHI ** octave) / (p ** PHI) * math.exp(-(i + 1) / PHI)
        for i, p in enumerate(primes)
    )
    ms = (time.perf_counter() - t0) * 1000.0
    return {
        "lane": "prime_vault",
        "nodes": n_residues,
        "octave": octave,
        "energy": round(float(energy), 6),
        "latency_ms": ms,
    }


if __name__ == "__main__":
    print("--- PRIME-VAULT vs ALPHAFOLD RACE (catalog) ---")
    for name, n, octv in [
        ("Ubiquitin-class", 76, 1),
        ("IL-2 complex-class", 280, 2),
        ("Orphan / synthetic", 120, 3),
    ]:
        r = prime_vault_fold(n, octv)
        print(
            f"[{name}] nodes={r['nodes']} octave={r['octave']} "
            f"energy={r['energy']} latency_ms={r['latency_ms']:.3f}"
        )
