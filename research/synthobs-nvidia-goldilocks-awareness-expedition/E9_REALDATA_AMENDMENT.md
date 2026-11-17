# E9 Real-Data Amendment — PDB + Pfam (pre-registered)

Written **before** real-data E9 rows were generated. Supersedes the synthetic planted-coupling generator in `E9_PROTOCOL.md` for scoring and verdict. SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Player-1 lock

Use **real data available online** whenever possible. Toy planted MSAs are archival only (`data/e9_lean/` early smoke) and are **not** used for the E9 verdict.

## Sources (public)

| Layer | Source | What we take |
|---|---|---|
| Structure / gold contacts | RCSB PDB (`https://files.rcsb.org/download/{PDB}.pdb`) | Chain sequence (SEQRES) + CA–CA contacts (distance ≤ 8 Å, sequence separation ≥ 6) |
| Homolog alignment | InterPro / Pfam seed Stockholm (`…/entry/pfam/{PF}/?annotation=alignment:seed&download`) | Real seed MSA for the family |
| Relational board | Computed from that MSA only | Column co-occurrence / agreement coupling scores mapped onto PDB residue indices |

No coordinates are fed to the AWARE arm. Gold partners come from structure; the awareness board comes only from **evolutionary** couplings in the real MSA — the AlphaFold-era rhyme.

## Arms (unchanged names)

- **LINEAR** — primary PDB sequence + local ±2 window only  
- **FLAT_MSA** — primary sequence + real Pfam seed rows (ungapped display dump)  
- **AWARE** — primary sequence + ranked long-range couplings involving the query residue, derived from the Pfam MSA  

Same model, temperature 0, one call per arm (lean).

## Metrics / gates

Same H1 / H2 / H3 as `E9_PROTOCOL.md`, evaluated on exact recovery of the **structural** partner pair.

## Curated family set

Fixed list of (PDB, chain, Pfam) pairs chosen for small single-domain chains with public seed alignments. Built once into `data/e9_real/cache/` with source URLs and fetch timestamps in each scenario record.

## Cohort filter (pre-result, real-data)

Primary scored cohort keeps only chains where the **top MSA coupling involving the query residue equals a true PDB long-range contact** (16/23 built chains in the first fetch). This is the classical coevolution-success slice: the relational pattern from the real Pfam seed points at a real structural contact. Chains where the strongest MSA coupling disagrees with structure remain in `scenarios_all.json` as archival hard cases, not in the primary verdict.
