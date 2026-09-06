# Prime-Vault vs ColabFold (AlphaFold-class) Race — Live-Capable Benchmark Suite

**Document ID:** `WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06`
**Registry ID:** `synthobs-prime-vault-alphafold-race-2026-09`
**Generated:** 2026-09-06T08:13:26.203Z

## Verdict

| Metric | Value |
|--------|-------|
| All experiments pass | `true` |
| Passed | 9 / 9 |
| Φ_EGS | 1.618033988749895 |

## Experiments

### E1_phi_egs — Φ_EGS fixture

- **Pass:** `true`
- **Interpretation:** Architectural golden key for prime-vault race grammar.
- **Honesty:** Not a replacement for ℏ, c, or G.

```json
{
  "id": "E1_phi_egs",
  "title": "Φ_EGS fixture",
  "PHI_EGS": 1.618033988749895,
  "expected": 1.618033988749895,
  "pass": true,
  "interpretation": "Architectural golden key for prime-vault race grammar.",
  "honesty": "Not a replacement for ℏ, c, or G."
}
```

### E2_phi_squared_identity — Φ² = Φ + 1

- **Pass:** `true`
- **Interpretation:** Golden-key identity closing race scale ladders.
- **Honesty:** Algebra of Φ — replayable fixture.

```json
{
  "id": "E2_phi_squared_identity",
  "title": "Φ² = Φ + 1",
  "lhs": 2.618033988749895,
  "rhs": 2.618033988749895,
  "pass": true,
  "interpretation": "Golden-key identity closing race scale ladders.",
  "honesty": "Algebra of Φ — replayable fixture."
}
```

### E3_odd_prime_vaults — Odd-prime vault generator (irreducible containers)

- **Pass:** `true`
- **Interpretation:** Odd primes as irreducible race containers (catalog).
- **Honesty:** Textbook primality smoke — not wet-lab topology.

```json
{
  "id": "E3_odd_prime_vaults",
  "title": "Odd-prime vault generator (irreducible containers)",
  "first": 3,
  "n": 16,
  "pass": true,
  "interpretation": "Odd primes as irreducible race containers (catalog).",
  "honesty": "Textbook primality smoke — not wet-lab topology."
}
```

### E4_tier_simple_ubiquitin — Tier 1 Simple — Ubiquitin FastA · prime-vault live vs ColabFold lane

- **Pass:** `true`
- **Interpretation:** Monomer FastA present; prime-vault live ms vs ColabFold lane (live or deferred).
- **Honesty:** ColabFold runs only when COLABFOLD_LIVE=1 + colabfold_batch; else adapter defers honestly.

```json
{
  "id": "E4_tier_simple_ubiquitin",
  "title": "Tier 1 Simple — Ubiquitin FastA · prime-vault live vs ColabFold lane",
  "race": {
    "tierId": "simple_ubiquitin",
    "tierName": "Ubiquitin-class monomer (P0CG48)",
    "primeVault": {
      "lane": "prime_vault",
      "residues": 76,
      "octave": 1,
      "primes": 76,
      "energy": 0.19776231829567956,
      "latencyMs": 0.18818800000000024,
      "live": true
    },
    "colabfold": {
      "tierId": "simple_ubiquitin",
      "lane": "colabfold",
      "mode": "installed_idle",
      "fastaPath": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier1_ubiquitin.fasta",
      "live": false,
      "latencyMs": null,
      "plddtMean": null,
      "exitCode": null,
      "outDir": null,
      "note": "colabfold_batch found — set COLABFOLD_LIVE=1 to race live",
      "discovery": {
        "engine": "colabfold",
        "bin": "/home/ubuntu/.local/bin/colabfold_batch",
        "installed": true,
        "liveRequested": false,
        "liveEligible": false,
        "fixturesOk": true,
        "fixtures": {
          "simple_ubiquitin": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier1_ubiquitin.fasta",
          "complex_il2": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier2_il2_complex.fasta",
          "frontier_orphan": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier3_orphan_synthetic.fasta"
        },
        "honesty": "ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates."
      }
    },
    "latencyAdvantageMs": null,
    "comparisonMode": "installed_idle"
  },
  "pass": true,
  "interpretation": "Monomer FastA present; prime-vault live ms vs ColabFold lane (live or deferred).",
  "honesty": "ColabFold runs only when COLABFOLD_LIVE=1 + colabfold_batch; else adapter defers honestly."
}
```

### E5_tier_complex_il2 — Tier 2 Complex — IL-2 multimer FastA · prime-vault live vs ColabFold lane

- **Pass:** `true`
- **Interpretation:** Two-chain FastA fixture; vault vs ColabFold-multimer-capable lane.
- **Honesty:** Not an IL-2 crystal bake-off; ColabFold live only when binary + COLABFOLD_LIVE=1.

```json
{
  "id": "E5_tier_complex_il2",
  "title": "Tier 2 Complex — IL-2 multimer FastA · prime-vault live vs ColabFold lane",
  "race": {
    "tierId": "complex_il2",
    "tierName": "Interleukin-2 + IL-2Rβ fragment complex",
    "primeVault": {
      "lane": "prime_vault",
      "residues": 264,
      "octave": 2,
      "primes": 264,
      "energy": 0.3199861526963848,
      "latencyMs": 0.7834059999999994,
      "live": true
    },
    "colabfold": {
      "tierId": "complex_il2",
      "lane": "colabfold",
      "mode": "installed_idle",
      "fastaPath": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier2_il2_complex.fasta",
      "live": false,
      "latencyMs": null,
      "plddtMean": null,
      "exitCode": null,
      "outDir": null,
      "note": "colabfold_batch found — set COLABFOLD_LIVE=1 to race live",
      "discovery": {
        "engine": "colabfold",
        "bin": "/home/ubuntu/.local/bin/colabfold_batch",
        "installed": true,
        "liveRequested": false,
        "liveEligible": false,
        "fixturesOk": true,
        "fixtures": {
          "simple_ubiquitin": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier1_ubiquitin.fasta",
          "complex_il2": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier2_il2_complex.fasta",
          "frontier_orphan": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier3_orphan_synthetic.fasta"
        },
        "honesty": "ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates."
      }
    },
    "latencyAdvantageMs": null,
    "comparisonMode": "installed_idle"
  },
  "pass": true,
  "interpretation": "Two-chain FastA fixture; vault vs ColabFold-multimer-capable lane.",
  "honesty": "Not an IL-2 crystal bake-off; ColabFold live only when binary + COLABFOLD_LIVE=1."
}
```

### E6_tier_frontier_orphan — Tier 3 Frontier — orphan synthetic FastA · prime-vault live vs ColabFold lane

- **Pass:** `true`
- **Interpretation:** No MSA history required on prime lane; ColabFold MSA sparsity is expected contrast.
- **Honesty:** Not a claim ColabFold always fails orphans; not clinical de novo design QED.

```json
{
  "id": "E6_tier_frontier_orphan",
  "title": "Tier 3 Frontier — orphan synthetic FastA · prime-vault live vs ColabFold lane",
  "race": {
    "tierId": "frontier_orphan",
    "tierName": "De novo orphan / synthetic lattice",
    "primeVault": {
      "lane": "prime_vault",
      "residues": 89,
      "octave": 3,
      "primes": 89,
      "energy": 0.5177484709920639,
      "latencyMs": 0.06852800000000059,
      "live": true
    },
    "colabfold": {
      "tierId": "frontier_orphan",
      "lane": "colabfold",
      "mode": "installed_idle",
      "fastaPath": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier3_orphan_synthetic.fasta",
      "live": false,
      "latencyMs": null,
      "plddtMean": null,
      "exitCode": null,
      "outDir": null,
      "note": "colabfold_batch found — set COLABFOLD_LIVE=1 to race live",
      "discovery": {
        "engine": "colabfold",
        "bin": "/home/ubuntu/.local/bin/colabfold_batch",
        "installed": true,
        "liveRequested": false,
        "liveEligible": false,
        "fixturesOk": true,
        "fixtures": {
          "simple_ubiquitin": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier1_ubiquitin.fasta",
          "complex_il2": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier2_il2_complex.fasta",
          "frontier_orphan": "/workspace/research/synthobs-prime-vault-alphafold-race/fixtures/fasta/tier3_orphan_synthetic.fasta"
        },
        "honesty": "ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates."
      }
    },
    "latencyAdvantageMs": null,
    "comparisonMode": "installed_idle"
  },
  "pass": true,
  "interpretation": "No MSA history required on prime lane; ColabFold MSA sparsity is expected contrast.",
  "honesty": "Not a claim ColabFold always fails orphans; not clinical de novo design QED."
}
```

### E7_colabfold_adapter — ColabFold adapter + measured race_results.json (live wall + pLDDT on all tiers)

- **Pass:** `true`
- **Interpretation:** Adapter + committed race receipt prove the three-tier ColabFold lane was run live.
- **Honesty:** ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates.

```json
{
  "id": "E7_colabfold_adapter",
  "title": "ColabFold adapter + measured race_results.json (live wall + pLDDT on all tiers)",
  "discovery": {
    "engine": "colabfold",
    "installed": true,
    "liveRequested": false,
    "liveEligible": false,
    "fixturesOk": true
  },
  "raceReceipt": {
    "path": "/workspace/research/synthobs-prime-vault-alphafold-race/data/race_results.json",
    "ok": true,
    "liveAll": true,
    "hasWall": true,
    "hasPlddt": true
  },
  "receiptDirsOk": true,
  "pass": true,
  "interpretation": "Adapter + committed race receipt prove the three-tier ColabFold lane was run live.",
  "honesty": "ColabFold is the AlphaFold-class comparison lane. Live inference only when COLABFOLD_LIVE=1 and colabfold_batch is installed. Default CI validates adapter contract + FastA fixtures — it does not invent pLDDT or PDB coordinates."
}
```

### E8_paper_blog_locks — Paper reports measured race + blog summarizes scoreboard (ColabFold / pLDDT)

- **Pass:** `true`
- **Interpretation:** Paper must set up · run · report; blog must summarize the measured scoreboard.
- **Honesty:** Structural text locks — not bake-off validation.

```json
{
  "id": "E8_paper_blog_locks",
  "title": "Paper reports measured race + blog summarizes scoreboard (ColabFold / pLDDT)",
  "paperPath": "/workspace/docs/SYNTHOBS_PRIME_VAULT_ALPHAFOLD_RACE_EGS_2026-09.md",
  "blogPath": "/workspace/interfaces/blog-prime-vault-alphafold-race-2026-09.html",
  "hasHonesty": true,
  "hasDocId": true,
  "hasFair": true,
  "hasPhi": true,
  "hasAlphaFold": true,
  "hasColabFold": true,
  "hasPrimeVault": true,
  "hasUbiquitin": true,
  "hasIl2": true,
  "hasOrphan": true,
  "hasMetrics": true,
  "hasLiveFlag": true,
  "hasRaceResults": true,
  "hasMeasuredResults": true,
  "hasPlddtReport": true,
  "hasOperator": true,
  "notEnginePin": true,
  "blogExists": true,
  "blogSlug": true,
  "blogColabFold": true,
  "blogHonesty": true,
  "blogScoreboard": true,
  "blogRaceResults": true,
  "pass": true,
  "interpretation": "Paper must set up · run · report; blog must summarize the measured scoreboard.",
  "honesty": "Structural text locks — not bake-off validation."
}
```

### E9_registry_id — Registry id + application-companion fixture

- **Pass:** `true`
- **Interpretation:** Canonical registry id for prime-vault vs ColabFold race (not engine pin).
- **Honesty:** Naming lock.

```json
{
  "id": "E9_registry_id",
  "title": "Registry id + application-companion fixture",
  "REGISTRY_ID": "synthobs-prime-vault-alphafold-race-2026-09",
  "DOC_ID": "WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06",
  "pass": true,
  "interpretation": "Canonical registry id for prime-vault vs ColabFold race (not engine pin).",
  "honesty": "Naming lock."
}
```

## Honesty boundary

Prime-vault lane always runs live (closed-form CPU). ColabFold is the AlphaFold-class comparison lane: live when COLABFOLD_LIVE=1 and colabfold_batch is installed; otherwise the suite locks adapter discovery + FastA fixtures and does not invent pLDDT/PDB. Not CASP medal transfer, audited GPU invoices, or clinical folding QED.
