# C11 · ART-Class Cassette — Minimum Wet-Lab Brief

**Parent:** Beyond CRISPR Biological Discovery · gap lead **C11** (fixture triage — not confirmed mechanism)  
**Document ID:** `WP-SYNTHOBS-BEYOND-CRISPR-C11-LAB-BRIEF-2026-10-02`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  

---

## Objective

Test whether an **unusual RT + partner ORF + long repeat array** implements a **lagged** information loop:

**priming exposure → molecular representation → altered outcome on a later challenge**

This is **not** a hunt for another nuclease. Kill the project if RT-dead, partner-dead, and repeat-truncation alleles show no separable intermediate and no lagged phenotype.

---

## Hypothesis (falsifiable)

**H1:** Partner and RT are jointly required for a **partner-dependent nucleic product** under inducing conditions, and that product is **absent** in RT-dead alleles.

**H2:** After a controlled **priming** exposure, cassette-intact cells show **different** outcomes on a **later** challenge vs RT-dead / partner-dead isogenics (lagged change, not only acute toxicity).

**H3:** The product **does not** match canonical **DGR template–VR** or **retron msDNA** fingerprints (otherwise reclassify as known writer class).

**Null:** Cassette is mobile debris — no intermediate, no lagged phenotype, no template dependence.

---

## Candidate selection (computational pre-step)

1. Choose **one tractable host** (e.g. culturable bacterium with stable genetics and phage or mobile-element challenge available).
2. Pick **one locus** from an RT survey class (ART-like: atypical RT + adjacent partner + long repeats) with **long-read** validation of locus integrity.
3. Document **publishedExplanationAdequacy** — if a full causal chain already exists in literature, **do not** use as C11 pilot; pick next locus.

---

## Allele panel (minimum)

| Allele | Purpose |
|--------|---------|
| Wild-type cassette | Positive architecture intact |
| RT catalytic-dead | Tests encode/write step |
| Partner ORF deletion / frameshift | Tests partner-dependent product |
| Repeat truncation (keep RT+partner) | Tests repeat as storage / scaffold |
| Empty vector / locus deleted | Background control |

Use matched genomic backbone; single locus edits; verify by sequencing.

---

## Molecular readouts

1. **Short-read + long-read** on locus after edits.
2. **Nucleic acid profiling** under inducing vs non-inducing conditions:
   - Total nucleic extracts; RNase / DNase discrimination as appropriate.
   - **RT-dead vs WT** comparison under same induction.
3. **Orthogonal exclusion panels** (as available):
   - DGR-style VR deep-seq on nearby variable regions (expect flat if true C11).
   - Retron/msDNA-specific assays if locus neighbors retron motifs.

**Primary discriminant:** inducing conditions → product present in WT, absent in RT-dead, reduced/absent in partner-dead.

---

## Phenotype readouts (lagged design)

**Phase A — priming:** sub-lethal or defined MOI infection / mobile-element exposure / standardized stress (pre-register one).

**Phase B — wash / recovery:** fixed interval (e.g. 1–3 generations — pre-register).

**Phase C — challenge:** same or related agent; read outcome vs naïve controls.

**Endpoints (choose 1–2 primary):** plaquing / MOI survival · growth curve · mobile-element retention · fluorescence reporter if available.

**Primary discriminant:** WT shows **lagged** shift vs RT-dead and partner-dead; repeat-truncation intermediate pattern pre-specified.

---

## Controls & confounds

- **HGT / merodiploid:** confirm single-locus edits; re-sequence after passaging.
- **Polar effects:** use clean deletions or complementation where possible.
- **Acute toxicity:** separate acute vs lagged readouts (time-series).
- **Assembly artifact:** long-read revalidation before starting wet work.

---

## Decision tree (kill-if-fails)

| Result | Action |
|--------|--------|
| No product, no lagged phenotype | **Kill C11 for this locus** · debris class |
| Product but no lagged phenotype | Demote memory/behavior claim · biochemical only |
| Lagged phenotype but DGR/retron signature | Reclassify · not novel architecture |
| Product + lagged phenotype + exclusion passes | **Escalate** · full mechanistic characterization |

---

## Budget / scope (planning order of magnitude)

| Stage | Scope |
|-------|--------|
| Construct panel + validation | Initial pilot |
| Induction + nucleic profiling | First high-information experiment |
| Lagged challenge (one agent) | Discriminant for H2 |
| Replicates + second locus | Only if first locus survives kill tests |

Not vendor quotes — lab infrastructure dominates cost.

---

## Reporting

Archive: raw reads, allele maps, induction conditions, MOI/stress parameters, pre-registered primary endpoints, outcome vs decision tree.

Link receipt to Beyond CRISPR suite `research_queue.json` only after independent literature review — fixtures do not auto-upgrade to discovery.

---

## Honesty boundary

This brief is a **falsifiable experimental design** for a **gap candidate**, not evidence that C11 biology is real, novel, or clinically actionable.

→ ∞^∞
