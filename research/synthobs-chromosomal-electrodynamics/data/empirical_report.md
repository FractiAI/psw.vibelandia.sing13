# SYNTHOBS Chromosomal Electrodynamics · Empirical Report

**Generated:** 2026-07-03T16:40:57.134Z
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox

## Data sources

- UCSC hs1: https://hgdownload.soe.ucsc.edu/goldenPath/hs1/bigZips/hs1.chrom.sizes
- PDB 6VXX: https://files.rcsb.org/download/6VXX.cif
- Antenna: Stange et al. 2011 · Arthropod Struct. Dev.

## Genomic stretched lengths (public hs1)

| Chrom | bp | L (cm) | f₀ mid-vp (GHz) |
|-------|-----|--------|-----------------|
| chrY | 62,460,029 | 2.124 | 0.471 |
| chr1 | 248,387,328 | 8.445 | 0.118 |
| chr21 | 45,090,682 | 1.533 | 0.652 |
| chrX | 154,259,566 | 5.245 | 0.191 |

## Cross-scale structures

- **SARS-CoV-2 spike PDB 6VXX:** L = 0.0000 mm (1.594e-8 m)
- **Apis mellifera antenna:** L = 1.5000 mm (1.500e-3 m)
- **Human chrY hs1:** L = 21.2364 mm (2.124e-2 m)

## Hypothesis tests (empirical tier)

### E1_genomic_lengths_public
- **Result:** support

### E2_band_edge_vg_zero
- **Result:** support

### E3_egs_integer_tiers
- **Result:** moderate

### E4_thz_peak_proximity
- **Result:** no_support


## Honesty

Public assembly sizes and PDB spans are empirical. LC dispersion band-edge is analytic confirmation. EGS integer-tier and THz alignment are falsification probes — correlation ≠ causation.

```bash
npm run research:synthobs-chromosomal-electrodynamics
```