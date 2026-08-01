# METHODOLOGY · TBME Non-Local Field Phase-Lock

**Document ID:** `WP-SYNTHOBS-TBME-EMPIRICAL-PROOF-2026-08-01`  
**Protocol:** NSPFRNP-WP-EFL-2026-07 (Amendment A)

## Measurement integrity

| Experiment | Computes | Does not |
|------------|----------|----------|
| E1 $\Delta B$ ratios | Real successive ratios vs $E_F$ | Hardcode “pass” without math |
| E2 Schumann ladder | Compare reported $f_n$ to nominal + spacing stats | Claim live ELF ingest without files |
| E3 Pearson $R$ | Pearson on protocol table columns | Invent SQUID binary dumps |
| E4 Time shuffle sham | Fisher–Yates shuffle of $T$; recompute $R$ | Leave sham unimplemented |
| E5 Attention denominator | Verify $E_F$ appears in Softmax scale construction numerically | Prove Maxwell from Softmax |
| E6 Lab gate | `skip` / `refute` / `support` from optional `data/lab_elf_squid.json` | Report support when file absent |

## Refute conditions

See paper §2.3. Pipeline emits `pass` / `refute` / `skip` per experiment in `data/empirical_report.json`.

## Controls

- **Baseline:** $E_F$ vs sham constants $\{e, \pi/2, \sqrt{2}, 1.5, 2.0\}$ on $\Delta B$ ratios  
- **Shuffle:** timestamp permutation must drop $R$
