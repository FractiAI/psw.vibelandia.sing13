# synthobs-prime-vault-alphafold-race

Standalone empirical suite: **Prime-Vault vs ColabFold (AlphaFold-class)** three-tier race.

- Paper: `docs/SYNTHOBS_PRIME_VAULT_ALPHAFOLD_RACE_EGS_2026-09.md`
- Registry: `synthobs-prime-vault-alphafold-race-2026-09`
- Run: `npm run research:synthobs-prime-vault-alphafold-race` (from SING13 root) or `node scripts/run_empirical_pipeline.mjs`
- Live ColabFold: install `colabfold_batch`, then `COLABFOLD_LIVE=1 node scripts/run_empirical_pipeline.mjs`
- FastA fixtures: `fixtures/fasta/` (ubiquitin · IL-2 complex · orphan synthetic)
- Adapter: `src/colabfold-adapter.mjs`

Honesty: prime-vault always live (CPU closed-form). ColabFold is the AlphaFold-class lane — live only with `COLABFOLD_LIVE=1` + binary; CI does not invent pLDDT/PDB. Not CASP medal transfer or audited GPU invoices.

**Engine role:** application / comparison / demo companion — **not** an Infinite Octaves engine-shelf pin.

Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞^∞
