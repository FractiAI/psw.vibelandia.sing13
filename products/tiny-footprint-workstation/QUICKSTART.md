# Tiny Footprint Workstation · Quick start

1. **Open** this folder in VS Code (`code .`).
2. Copy `.env.example` → `.env` and set optional paths.
3. Run tasks from Terminal or `.vscode/tasks.json`:

| Step | Command |
|------|---------|
| Check | `node scripts/tiny.mjs doctor` |
| Install | `node scripts/tiny.mjs install` |
| Demo | `node scripts/tiny.mjs demo` |
| Benchmark | `node scripts/tiny.mjs benchmark` |
| Report | `node scripts/tiny.mjs report` |

4. Open `benchmarks/reports/` for the latest HTML/JSON receipt.
5. Optional GPU LLM lab (Windows DirectML): see `research/synthobs-tiny-gateway-rhyming-templates/requirements-directml.txt`.

First success = a reproducible conventional-vs-Tiny report on **your** machine without FractiAI at the keyboard.
