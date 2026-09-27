# EGS Recursive Fidelity Test (ERFT)

Falsifiable recursive-fidelity / drift experiment for $\Phi_{\mathrm{EGS}}$.

- **Current protocol:** `ERFT-V5-2026-09-27`
  - **ERFT-C** — constant-neutral primary causal lane (identical algorithm; only scalar $c$)
  - **ERFT-G** — generalized closure $C(c)$ for every arm (symmetric grammar lane)
- **Retired as primary:** `ERFT-V4-2026-09-26` (combined Φ-enabled architecture — exploratory footnote)
- **Also retired:** V3 nest-only · V2 sin · V1 construction-bias receipt

## Run

```bash
npm run research:synthobs-egs-recursive-fidelity-test
# or from this directory:
npm run research
```

## Honesty

Suite pass = protocol integrity. Empirical $\Phi$ advantage is optional and may fail.
V5 does **not** assume $\Phi$ is correct a priori. Sweep minima away from $\Phi$ are scientifically valuable.

Paper: `docs/SYNTHOBS_EGS_RECURSIVE_FIDELITY_TEST_ERFT_2026-09.md`  
Ship blog: `/ship-blog/erft-recursive-fidelity`
