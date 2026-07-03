# SYNTHOBS Chromosomal Electrodynamics · Empirical Pipeline

**Document IDs:** WP-SYNTHOBS-CHROM-ELCD-2026-07 · WP-SYNTHOBS-CROSS-ANTENNAE-2026-07

## Quick start

```bash
npm run research:synthobs-chromosomal-electrodynamics
```

## Public data ingested

| Source | API / URL | Use |
|--------|-----------|-----|
| UCSC hs1 chrom.sizes | `hgdownload.soe.ucsc.edu` | T2T-CHM13v2.0 chromosome bp lengths |
| RCSB PDB 6VXX CIF | `files.rcsb.org` | SARS-CoV-2 spike cryo-EM bounding span |
| Stange et al. 2011 | Literature constant | *Apis mellifera* antenna length |
| Garten et al. 2015 | Literature THz peaks | DNA absorption reference bands |

## Outputs

| Path | Description |
|------|-------------|
| `data/empirical_report.json` | Machine-readable tests + hypothesis tiers |
| `data/empirical_report.md` | Human-readable summary |

## Critical rule

**Correlation ≠ causation.** Public length and PDB geometry tests validate coordinate ingestion and analytic dispersion — not in vivo LC transmission-line behavior.
