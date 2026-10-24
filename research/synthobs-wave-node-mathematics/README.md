# Wave–Node Mathematics

Reproducible mathematical and algorithmic validation for a future **Wave–Node Robotics** software layer (FractiAI / Infinite Octaves).

| Field | Value |
|-------|--------|
| Document ID | `WP-SYNTHOBS-WAVE-NODE-MATHEMATICS-EGS-2026-10-24` |
| Registry | `synthobs-wave-node-mathematics-2026-10` |
| ENGINE_SHELF | **#49** (mathematical companion) |
| Seed | `20261024` |
| Paper | [`docs/SYNTHOBS_WAVE_NODE_MATHEMATICS_EGS_2026-10.md`](docs/SYNTHOBS_WAVE_NODE_MATHEMATICS_EGS_2026-10.md) · also `paper/wave_node_mathematics_validation.md` |

## What ran

| Family | Content | Result (seed 20261024) |
|--------|---------|-------------------------|
| A | Node placement vs analytical geometry | Pass |
| B | 1D FDTD wave vs sinusoid · order ≈ 2.001 | Pass |
| C | Kuramoto sync / topology / K=0 baseline | Pass |
| D | 2D planning A* vs Wave–Node ± phase (held-out n=24) | Pass runnable; **A* shorter paths** |
| E | Wall-clock scaling | Pass |

**Honesty:** Not physical robots, not manipulators, not a finished Wave–Node Robotics product. Φ_EGS is catalog grammar only.

## Run

```bash
npm run research
# monorepo:
npm run research:synthobs-wave-node-mathematics
```

Outputs: `data/empirical_report.{json,md}`, `results/manifest.json`, `figures/`.

## Surfaces

- `/whitepaper/wave-node-mathematics`
- `/ship-blog/wave-node-mathematics`
- Standalone: https://github.com/FractiAI/synthobs-wave-node-mathematics

→ ∞^∞
