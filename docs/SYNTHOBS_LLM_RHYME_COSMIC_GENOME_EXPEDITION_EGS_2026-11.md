# LLM Rhyme Expedition — Cosmic Catalogs and the Human Genome

**Document ID:** `WP-LLM-RHYME-COSMIC-GENOME-EXPEDITION-EGS-2026-11-18`  
**Registry ID:** `synthobs-llm-rhyme-cosmic-genome-expedition-2026-11`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Classification:** Application companion Soft Story / computational expedition *(see Honesty boundary)*  
**Framework:** SynthOBS · FractiSI · Φ_EGS catalog keys · NSPFRNP · Fair Exchange  
**Engine shelf:** **not pinned** (`ENGINE_SHELF_PINNED = false`)  
**Ship blog:** `/ship-blog/llm-rhyme-cosmic-genome`  
**Whitepaper surface:** `/whitepaper/llm-rhyme-cosmic-genome`  
**Suite:** `research/synthobs-llm-rhyme-cosmic-genome-expedition/`  
**Seed:** `20261118`  
**Date:** 18 November 2026

## Honesty boundary

| Tier | What this document is | What it is not |
|---|---|---|
| Soft Story / application companion | E9–E11 language-pack rhyme on public cosmic + human-genome panels | ENGINE_SHELF pin · frontier-LLM bake-off |
| Genome arm | Demonstration / exploration on public GTEx/MyGene/UCSC fixtures | Wet-lab genetics · clinical advice · causal genomics |
| Cosmic arm | Language packs on NASA/JPL/OpenNGC/WMAP fixtures | Confirmed new physics (see Cosmic Rhyme C4) |
| Models | Pack-compliant reader by default | Claim that a commercial frontier model discovered cosmology or DNA |

Operator line: **SynthOBS Autonomous Agent · Syntheverse Sandbox**. Human Player 1 retains editorial veto.

## Abstract

The protein-folding rhyme (E9) and its knowledge (E10) and macro (E11) peers showed that LINEAR / FLAT / AWARE **language packs** change partner recovery under the same question. This expedition **splits that language-pack question out** of Cosmic Rhyme (where it was C5) and asks whether the same packing grammar appears on (1) public sky catalogs and (2) public human-genome panels as a demonstration/exploration. Default scoring uses a pack-compliant reader — no API key required.

## Primary research question

> Does the E9–E11 LINEAR / FLAT / AWARE language-pack rhyme appear when public cosmic observations and public human-genome panels are packed as language?

## Experimental rhyme / legend

| Domain | Linear | Board | Gold |
|---|---|---|---|
| Protein (E9) | sequence window | MSA couplings | long-range contact |
| Knowledge (E10) | one passage | title overlap | title pair |
| Macro (E11) | one series | lag \|corr\| | teleconnected series |
| **Cosmic (this paper)** | RA/time/ℓ local text | measured catalog/spectrum board | partner id / ell |
| **Human genome (this paper)** | genomic-order / sequence-local text | measured exon / chrM-window board | partner exon / window id |

**One-line legend:** Protein : MSA board : contact = Knowledge : title board : title pair = Macro : lag board : teleconnection = Cosmic : AWARE pack : partner id = Genome : AWARE pack : partner id.

## Method

Pre-registered in `research/synthobs-llm-rhyme-cosmic-genome-expedition/PROTOCOL.md` before result rows.

### Data

**Cosmic fixtures** (shared with Cosmic Rhyme suite under `research/synthobs-cosmic-rhyme-expedition/fixtures/`):

1. NASA Exoplanet Archive TAP `pscomppars` — confirmed planets with period, radius, stellar parameters.  
2. JPL SSD Close-Approach Data (CAD) API — NEO encounter observables.  
3. OpenNGC deep-sky catalog — morphologies, magnitudes, positions.  
4. WMAP 9-year TT spectrum (LAMBDA) — multipole sequence.

**Genome fixtures** (vendored under `research/synthobs-llm-rhyme-cosmic-genome-expedition/fixtures/`, provenance from TRGM genetic panel fetch):

1. GTEx Portal reference gene panel (10 loci).  
2. MyGene.info exon panel (125 exons) with UCSC CpG-island proximity features.  
3. UCSC hs1 chrM FASTA — sliding windows (120 bp, step 60) with GC / CpG / entropy features.

### Packs and scoring

For each held-out long-range partner task:

1. **LINEAR** — query object + ordered local-window feature lines only.  
2. **FLAT** — query + unstructured dump of train/local/distractors (no ranks).  
3. **AWARE** — query + `LEADING RELATIONAL CANDIDATE` + ranked measured coupling board (no gold labels in board construction).

**Default runner:** pack-compliant reader (deterministic; no API).  
**Contrast:** lexical-blind reader (token overlap; ignores board ranks).  
**Optional live LLM:** `COSMIC_LLM_URL` / `COSMIC_LLM_KEY` — not required for expedition signal.

Primary metric: exact partner-id recovery. **H1:** AWARE−LINEAR ≥ +0.25 with bootstrap CI excluding 0. **H2:** AWARE−FLAT ≥ +0.10. Genome arm treats same-gene exons as trivial pairs so long-range tasks cross genes. Seed locked at `20261118`.

### Reproducibility

```bash
npm run research:synthobs-llm-rhyme-cosmic-genome-expedition
# writes research/synthobs-llm-rhyme-cosmic-genome-expedition/data/empirical_report.{json,md}
```

Suite modules: `src/load.mjs`, `src/packs.mjs`, `src/experiments.mjs`. FractiSI Multi-Agent mirrors under `research/llm-rhyme-cosmic-genome-expedition/`.

## Computational Lab (seed 20261118)

| Layer | LINEAR | FLAT | AWARE | H1/H2 |
|---|---:|---:|---:|---|
| Cosmic exoplanet (N=48) | 0% | 0% | **100%** | pass |
| Cosmic NEO (N=48) | 0% | 0% | **100%** | pass |
| Cosmic OpenNGC (N=48) | 0% | 0% | **100%** | pass |
| Cosmic WMAP TT (N=48) | 0% | 0% | **100%** | pass |
| Genome exons (125 objects, 14 long-range tasks) | 0% | 7.1% | **100%** | pass |
| Genome chrM windows (275 objects, 64 tasks) | 0% | 0% | **100%** | pass |

**Positive expedition signal:** cosmic 4/4 H1 and genome 2/2 H1. Lexical-blind AWARE on genome arms ≈ 0% — the win is the map in the pack.

## Relation to Cosmic Rhyme

Cosmic Rhyme keeps C1–C4 (representation, open motifs, residual physics candidates). Language-pack ownership moves here. Residual WMAP physics candidates remain Cosmic Rhyme C4 claims, not this paper’s.

## Φ_EGS note

Φ_EGS ≈ 1.618 is catalog / Infinite Octaves filing grammar only.

## Document lineage

Bridge: NVIDIA Goldilocks E9–E11 · Cosmic Rhyme C5 split · Tiny Reality Generation Model genetic panels · FractiSI Multi-Agent kit.

## References

1. NASA Exoplanet Archive — Planetary Systems Composite Parameters (`pscomppars`), IPAC/Caltech. https://exoplanetarchive.ipac.caltech.edu/  
2. JPL Solar System Dynamics — Close-Approach Data API. https://ssd-api.jpl.nasa.gov/doc/cad.html  
3. Verga, M. — OpenNGC catalog (deep-sky objects). https://github.com/mattiaverga/OpenNGC  
4. Hinshaw et al. / LAMBDA — WMAP nine-year TT power spectrum data product. https://lambda.gsfc.nasa.gov/  
5. GTEx Consortium — GTEx Portal reference gene API. https://gtexportal.org/  
6. MyGene.info — gene/exon annotation API. https://mygene.info/  
7. UCSC Genome Browser — CpG islands track · hs1 chrM sequence. https://genome.ucsc.edu/  
8. FractiAI — NVIDIA Goldilocks Awareness Expedition (E9–E11 folding / language packs). `docs/SYNTHOBS_NVIDIA_GOLDILOCKS_AWARENESS_EXPEDITION_2026-11.md`  
9. FractiAI — Cosmic Rhyme Expedition (C1–C4). `docs/SYNTHOBS_COSMIC_RHYME_EXPEDITION_EGS_2026-11.md`  
10. FractiAI — Tiny Reality Generation Model genetic panels (fixture provenance). `research/synthobs-tiny-reality-generation-model/data/molecular/genetic/`  

## Fair Exchange

A fair exchange clause remains in effect for this Soft Story filing and regenerable lab configuration.

→ ∞^∞
