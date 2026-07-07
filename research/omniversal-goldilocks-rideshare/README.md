# Omniversal Goldilocks Rideshare Protocol · Empirical Pipeline

**Document ID:** `WP-OGRP-2026-07`  
**Paper:** [`docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md`](../../docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md)  
**Standalone repository:** https://github.com/FractiAI/omniversal-goldilocks-rideshare

## Quick start (monorepo)

```bash
npm run research:omniversal-goldilocks-rideshare
```

## Quick start (standalone)

```bash
cd research/omniversal-goldilocks-rideshare
npm run empirical
```

## Experiments

| ID | Test | Data tier |
|----|------|-----------|
| **E1** | AAA per-mile vs micro-mobility operating cost | Published AAA 2025/2026 tables |
| **E2** | UW parking cruising fraction vs OGRP 0% model | Published urban freight statistics |
| **E3** | EGS overhead $C(x)=x^2-\Phi x$ minimum at $\Phi/2$ | Analytic + numeric sweep |
| **E4** | Generosity gate $\Gamma_{\text{floor}}=\$9$ break-even | Arithmetic |
| **E5** | Reno core density gate + OGRP JSON schema | `data/reno_core_bbox.json` + `config/ogrp_protocol.json` |

## Outputs

| Path | Description |
|------|-------------|
| `data/empirical_report.json` | Machine-readable tests + hypothesis tiers |
| `data/empirical_report.md` | Human-readable summary |

## Optional field logs

Copy `data/field_trial_template.json` → `data/field_trial_log.json` and append anonymized trips. **Not required** for pipeline pass. Tipping surplus claims require controlled trial — correlation ≠ causation.

## Critical rule

Published cost tables validate **economic arithmetic**, not universal proof that φ governs human routing psychology. EGS scaling is a **testable model postulate**.
