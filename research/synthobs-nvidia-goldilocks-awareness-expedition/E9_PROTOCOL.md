# E9 — Protein-folding rhyme: does relational awareness see patterns a linear pass cannot?

Pre-registered **before** any E9 result. SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Rhyme (claim under test)

Protein folding is used here as a **rhyme for intelligence in complex systems**, not as a wet-lab folding claim:

| Folding | Intelligence / agents / orgs |
|---|---|
| Amino-acid **sequence** | Local observations, token stream, private silo facts |
| Linear read of the chain | Local / left-to-right reasoning |
| **Long-range contacts** (residues far in sequence, near in fold) | Dependencies that only appear when the whole is held together |
| MSA / couplings / contact map | Shared **relational world model** (who depends on whom) |
| Native fold | Coherent intelligent behavior under constraints |
| Local fluency without contacts | Fluent agents that miss the global pattern |

AlphaFold-class systems worked by exploiting **patterns across related sequences and constraints**, not by reading one chain more carefully. The rhyme: a World Model that holds **relationships** should see structure a linear pass systematically cannot.

Honesty: this is an architectural / computational rhyme. It does not claim AlphaFold is obsolete, that proteins are agents, or that NVIDIA inherits these numbers as KPIs.

## Why not E8

E8 tested labeled filing of **the same facts**. E9 plants a **long-range pattern** that is invisible from a local sequence window and asks whether a relational awareness board recovers it.

## Task (regenerable, seed `20261117`)

For each scenario:

1. Build a length-`L=20` symbol sequence (alphabet size 8).
2. Plant `K=4` true long-range contacts with sequence separation ≥ 6 (the “fold contacts”).
3. Build an MSA-like matrix of `M=12` homolog rows whose columns **co-vary exactly on contact pairs** and are independent elsewhere.
4. Ask a question whose gold answer is determined only by the contact pattern (e.g. “Which positions form a contact triangle with position p?” or “What is the partner of position i?”), with decoy near-sequence neighbors.

## Arms (same model · same decoding · one call each — lean for token caps)

| Arm | Input | World-model type |
|---|---|---|
| **LINEAR** | Query position(s) + the single primary sequence + local ±2 window notes | Sequence / local only |
| **FLAT_MSA** | Query + primary sequence + all homolog rows as an unstructured text dump | Same raw observations, no relational extraction |
| **AWARE** | Query + primary sequence + an explicit **coupling / contact board** (pairwise coupling scores derived from the same MSA) | Relational awareness (fold rhyme) |

Information note: FLAT_MSA and AWARE are built from the **same MSA**. LINEAR is the strict sequence baseline. AWARE does not receive extra biological facts; it receives the relational compression of the MSA (the awareness layer).

Decoding: temperature 0, `max_tokens=64`. Answer format: `SOLUTION: i-j` or `SOLUTION: i-j-k` as specified per item.

## Metrics

- Primary: exact match of the gold contact set (order-invariant).
- Secondary: partial-credit F1 over contact edges; tokens.

## Models (under daily caps)

- Hosted: prefer unused-TPD Groq chat models (`allam-2-7b` first).
- Local: `Qwen/Qwen2.5-1.5B-Instruct`.
- Target N: **40** hosted, **60** local.

## Hypotheses (fixed in advance)

- **H1 (linear blind spot):** AWARE − LINEAR exact-match ≥ +0.25, 95% CI excludes 0.
- **H2 (relational compression > raw dump):** AWARE − FLAT_MSA exact-match ≥ +0.10, 95% CI excludes 0.
- **H3 (not a token cheat):** AWARE mean tokens ≤ 1.25 × FLAT_MSA mean tokens.
- **Verdict “folding-rhyme awareness sees patterns linear systems miss”** supported only if H1 and H3 hold on ≥2 models, and H2 holds on ≥1 model (or FLAT_MSA also beats LINEAR by ≥0.25 on that model — meaning the model itself extracted couplings from the dump, which still supports the rhyme that **relational pattern**, not linear sequence, carries the signal).

If H1 fails: reject the rhyme for this toy. If H1 holds and H2 fails because FLAT_MSA ≈ AWARE: the pattern is in the MSA dump and the model can extract it without an explicit board — report as “pattern exists; explicit awareness board not required for this model.”

## Generator lock (pre-result amendment)

True contact columns are planted at coupling = 1.0; non-contact long-range pairs are forced below perfect agreement. The AWARE board ranks couplings **involving the query position**, then shows global top couplings. This keeps the test about using relational structure vs linear sequence / raw dump — not about hunting a buried number.
