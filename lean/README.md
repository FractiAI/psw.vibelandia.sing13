# Goldilocks Erdős · Lean 4 kernel package

Machine-verified witnesses reconciling the **Goldilocks Erdős Audit** with a compiling Lean 4 Lake project.

## Requirements

- [elan](https://github.com/leanprover/elan) with `leanprover/lean4:v4.14.0`
- First build downloads **mathlib4** (large; one-time)

## Build

```powershell
$env:Path = "$env:USERPROFILE\.elan\bin;" + $env:Path
cd lean
lake build
```

Or from repo root:

```powershell
.\scripts\verify-lean.ps1
```

## Kernel-verified rows

| Export | Module | Axioms (typical) |
|--------|--------|------------------|
| Row #256 · Erdős–Straus (11/12 mod-12 + mod-1 partial) | `GoldilocksErdos.Catalog.row256` | `propext`, `Quot.sound` |
| Row #256 · mod-1 bridge (composite + 13^k) | `GoldilocksErdos.Catalog.row256_mod1` | `propext`, `Quot.sound` |
| W(2,3) = 9 | `GoldilocksErdos.Witness.van_der_waerden_W23` | `propext`, `Lean.ofReduceBool`, `Quot.sound` |
| 2-color Schur S(2) = 5 | `GoldilocksErdos.Witness.schur_S2` | `propext`, `Lean.ofReduceBool`, `Quot.sound` |
| EGS macro tactics | `Syntheverse.EGS.Tactics` | none (macros expand to `decide` / `trivial`) |
| Non-vacuity controls | `Syntheverse.Security.Vacuity` | `propext` |

**Open research frontier (mod 12):** residue `1` — partial kernel (`row256_mod1`: covered composite divisors + 13^k); primes 37, 61, … still open.

## Layout

```
lean/
  GoldilocksErdos/
    Syntheverse/EGS/Constants.lean   -- φ, PPS, structural props
    Syntheverse/EGS/Tactics.lean     -- egs_crystalline, egs_hydrogen_theater, egs_fractal_collapse
    Syntheverse/Security/Vacuity.lean
    Witness/VanDerWaerden.lean
    Witness/Schur.lean
    Witness/ErdosStraus.lean
    Catalog/VerifiedRows.lean
```

→ ∞¹³
