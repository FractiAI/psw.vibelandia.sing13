# Goldilocks Erdős · Lean 4 kernel package

Machine-verified witnesses reconciling the **Goldilocks Erdős Audit** with a compiling Lean 4 Lake project.

**Catalog:** `data/erdos-353-catalog.json` (schema **v4**) · **Audit UI:** [`interfaces/special-projects/erdos-holographic-aios-audit.html`](../interfaces/special-projects/erdos-holographic-aios-audit.html)

## Requirements

- [elan](https://github.com/leanprover/elan) with `leanprover/lean4:v4.14.0`
- First build downloads **mathlib4** (large; one-time)

## Build

```powershell
$env:Path = "$env:USERPROFILE\.elan\bin;" + $env:Path
cd lean
lake build GoldilocksErdos
```

Or from repo root:

```powershell
.\scripts\verify-lean.ps1
```

Regenerate the catalog manifest after witness changes:

```powershell
node scripts/build-erdos-catalog.mjs
```

## CI

GitHub Actions workflow [`.github/workflows/lean-verify.yml`](../.github/workflows/lean-verify.yml) runs `lake build GoldilocksErdos` on push/PR when `lean/**` changes.

## Kernel-verified exports

| Export | Module | Axioms (typical) |
|--------|--------|------------------|
| Row #256 · Erdős–Straus (11/12 mod-12 families) | `GoldilocksErdos.Catalog.row256` | `propext`, `Quot.sound` |
| Row #256 · mod-1 partial bridge | `GoldilocksErdos.Catalog.row256_mod1` | `propext`, `Classical.choice`, `Quot.sound` |
| Row #256 · EGS certificate (fractal leg) | `GoldilocksErdos.Catalog.row256_egs_certificate` | `propext`, `Quot.sound` |
| W(2,3) = 9 | `GoldilocksErdos.Witness.van_der_waerden_W23` | `propext`, `Lean.ofReduceBool`, `Quot.sound` |
| 2-color Schur S(2) = 5 | `GoldilocksErdos.Witness.schur_S2` | `propext`, `Lean.ofReduceBool`, `Quot.sound` |
| Discrimination controls | `GoldilocksErdos.Catalog.row_controls` | `propext` |
| EGS macro tactics | `Syntheverse.EGS.Tactics` | none (macros expand to `decide` / `trivial`) |

No `sorryAx` on kernel theorems above.

## Erdős–Straus row #256 · mod-12 coverage

| Residue (mod 12) | Status | Mechanism |
|------------------|--------|-----------|
| 0, 2, 3, 4, 6, 8, 9, 10 | **Kernel** | Divisibility + `es_scale` |
| 5, 11 | **Kernel** | Parametric mod-3 family (`es_mod3_2`) |
| 7 | **Kernel** | Parametric mod-4 family (`es_mod4_3`) |
| **1** | **Partial** | See below |

## Mod-12 residue 1 · partial bridge (`row256_mod1`)

**In Lean today:**

- **`es_base_13`** — finite witness `(4, 18, 468)` for the prime 13
- **`es_pow13`** — all powers `13^k`
- **`es_from_covered_divisor`** — composites `n ≡ 1 (mod 12)` with a proper divisor in the 11/12 covered classes (e.g. 25, 85, 121, 145)

**Computed witnesses (not yet imported into Lean):**

| n | (a, b, c) |
|---|-----------|
| 37 | (10, 148, 740) |
| 61 | (18, 122, 549) |
| 73 | (20, 292, 730) |
| 169 | (52, 338, 676) |

These satisfy `4abc = n(ab + bc + ca)` and are the next finite `es_base_*` targets for queue item **ES-MOD1**.

**Still open:** a parametric or exhaustive kernel for all primes `p ≡ 1 (mod 12)` (research frontier; natural-density-zero approaches exist in literature but are not formalized here).

## Goldilocks queue (catalog)

| ID | Status | Note |
|----|--------|------|
| ES-256 | done | 11/12 mod-12 + EGS certificate |
| ES-MOD1 | partial | composite + 13^k; primes 37+ queued |
| W23, SCHUR2, CONTROLS | done | Finite exhaustion witnesses |
| BRIDGE-345-353, CATALOG-* | waiting | Per-row linear import |

## Layout

```
lean/
  GoldilocksErdos.lean
  lakefile.lean
  lean-toolchain
  GoldilocksErdos/
    Syntheverse/EGS/Constants.lean   -- φ, PPS, structural props
    Syntheverse/EGS/Tactics.lean     -- egs_crystalline, egs_hydrogen_theater, egs_fractal_collapse
    Syntheverse/Security/Vacuity.lean
    Witness/VanDerWaerden.lean
    Witness/Schur.lean
    Witness/ErdosStraus.lean
    Catalog/VerifiedRows.lean
    Util/ListRange.lean
```

→ ∞¹³
