# synthobs-organizational-discovery-homeostasis

**Homeostasis Expedition · SI organizational discovery** — 12-node latent-factor computational lab with preregistered ridge arms **A–E**, stable vs shift regimes, and held-out RMSE evaluation.

- **Document ID:** `WP-SYNTHOBS-ORGANIZATIONAL-DISCOVERY-HOMEOSTASIS-EGS-2026-10-11`
- **Registry ID:** `synthobs-organizational-discovery-homeostasis-2026-10` (not yet registered in monorepo registry)
- **Engine shelf:** Infinite Octaves companion **#45**
- **Monorepo paper (planned):** `docs/SYNTHOBS_ORGANIZATIONAL_DISCOVERY_HOMEOSTASIS_EGS_2026-10.md`
- **Ship blog (planned):** `/ship-blog/organizational-discovery-homeostasis`

## Computational lab (ODH-1)

| Parameter | Value |
|-----------|--------|
| Nodes | 12 |
| Latent factors | 3 |
| Delays | 0–3 |
| Steps | 1000 |
| Train | through step 500 |
| Adapt | 510–676 |
| Eval | from step 685 |
| Shift | 25 % of nodes change factor loadings (shift regime) |
| Seeds | `N_SEEDS=150` |
| Estimator | Ridge regression |

Arms: **A** local-only chart · **B** fixed org chart · **C** latent discovery (train-only) · **D** adaptive fixed chart · **E** adaptive latent discovery.

## Run

```bash
npm run research
```

Outputs: `data/empirical_report.json` · `data/empirical_report.md`

## Honesty

Synthetic coordination sandbox — **not** SI awareness, **not** verified recursive self-improvement, **not** HR/management field validation, **not** production org deployment.

Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox → ∞^∞
