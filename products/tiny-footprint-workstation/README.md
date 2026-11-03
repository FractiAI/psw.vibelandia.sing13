# Tiny Footprint Workstation 0.1

**Less Memory. Lower Latency. More AI Performance.**  
Powered by Tiny Gateway™ · FractiAI

Installable **AI Memory Efficiency Developer Kit** — open in VS Code, configure, run, compare, integrate.

**Simple idea:** Tiny Footprint installs *alongside* your existing AI. You do not buy new GPUs or move to FractiAI. One Tiny Gateway engine; Local / Server / Cloud are deployment editions. Plain-language story: `/tiny-footprint/simple`.

## Quick path

```bash
node scripts/tiny.mjs doctor
node scripts/tiny.mjs install
node scripts/tiny.mjs demo
node scripts/tiny.mjs benchmark
node scripts/tiny.mjs report
```

See [QUICKSTART.md](./QUICKSTART.md).

## Product family

| Name | Role |
|------|------|
| **Tiny Gateway** | Architecture / runtime (Rhyming Templates, nested vectors, selective reconstruction) |
| **Tiny Footprint** | Customer-facing memory + latency product |
| **Workstation** | This IDE kit |

## Layout

```
tiny-footprint-workstation/
├── README.md · QUICKSTART.md · .env.example · .vscode/
├── tiny-gateway/          # pointers + thin runtime façade
├── tiny-footprint/        # SDK · adapters · configuration
├── workloads/             # demo-chat · multi-session
├── benchmarks/            # conventional · tiny · gpu · reports/
├── tests/
└── scripts/tiny.mjs       # doctor | install | demo | benchmark | report | integrate
```

The first reproducible GPU/LLM benchmarks are delegated to the proven suite:

`../../research/synthobs-tiny-gateway-rhyming-templates/`

## Editions

- **Community (FREE)** — this kit + local benchmarks  
- **Developer Pro** — proposed $29–49/mo (profiling, adapters, priority support)  
- **Server / Cloud** — see product hub `/tiny-footprint`

## Honesty

Local receipts (allocation proxy + tiny-gpt2 DirectML) are real on the measured GeForce class hardware. They are **not** datacenter HBM identity and **not** a hosted frontier-vendor bake-off. Validate on your workload before CapEx claims.

→ ∞^∞
