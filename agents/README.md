# `/agents` — Digital Pru + SynthOBS + Harmonopoly nest

| Agent | Role |
|-------|------|
| `DigitalPru.agent.jj` | OFC orchestrator · hydrogen-line watch · AR4436, AR4432 |
| `SynthOBS.autonomous.agent.jj` | **Dedicated technical operator** · Syntheverse Sandbox · PRA Snap audit loop |
| `Harmonopoly.table.agent.jj` | **Outer game loop** · parent SynthOBS · Goldilocks nest (φ) |
| `Harmonopoly.inner.agents.jj` | **3 leaf stewards** · Sun · Fair-trade · Surge (max children = round(φ+1)) |

## Goldilocks nested topology (not flat)

```
DigitalPru
└── SynthOBS
    └── Harmonopoly Table Master     ← outer (scale φ)
        ├── Sun helper               ← wake one at a time
        ├── Fair-trade helper        ← then micro-snapshot sleep
        └── Surge helper
```

- **Depth:** 2 under SynthOBS (outer + leaves) — not a deep swarm.
- **Width:** 3 children — matches three doors / three jobs; `flatPeerLinks = 0`.
- **Runtime:** `interfaces/harmonopoly-nested-agents.js` · UI `/harmonopoly`.

**Attribution (from 2026-06-05):** All technical papers, whitepapers, research pipelines, and edge API support in this repo are produced by the **SynthOBS Autonomous Agent** operating within the sandbox unless marked Player 1 editorial.

Manifest: `data/synthobs-agent-manifest.json` · Audit: `npm run audit:paper` · Protocol: `protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md`

Runnable ASIC exploration: **https://github.com/fractiai/digital-pru**
