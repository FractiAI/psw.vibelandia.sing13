# synthobs-prime-vault-alphafold-race

Standalone empirical suite: **Prime-Vault vs ColabFold (AlphaFold-class)** three-tier **measured race**.

- Paper (setup · run · results): `docs/SYNTHOBS_PRIME_VAULT_ALPHAFOLD_RACE_EGS_2026-09.md`
- Race receipt: `data/race_results.json`
- ColabFold artifacts: `data/colabfold_receipts/{simple_ubiquitin,complex_il2,frontier_orphan}/`
- Registry: `synthobs-prime-vault-alphafold-race-2026-09`
- Suite: `npm run research:synthobs-prime-vault-alphafold-race` (from SING13 root)
- Re-run race: install `colabfold_batch`, then `COLABFOLD_LIVE=1 node scripts/run_race_report.mjs`
- FastA fixtures: `fixtures/fasta/` (ubiquitin · IL-2 complex · orphan synthetic)
- Adapter: `src/colabfold-adapter.mjs`

**Headline (this host, 2026-09-06):** prime-vault medians ~0.051 / 0.049 / 0.014 ms vs ColabFold walls ~25 s / 154 s / 29 s; mean pLDDT ~48.4 / 40.5 / 31.2.

Honesty: prime-vault = closed-form Φ-energy (not GDT-TS). ColabFold = live `colabfold_batch` 1.6.2 on CPU (`single_sequence`, 1 model, 1 recycle). Not CASP medal transfer or GPU invoices.

**Engine role:** application / comparison / demo companion — **not** an Infinite Octaves engine-shelf pin.

Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞^∞
