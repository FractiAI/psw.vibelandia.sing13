# E8 Lean — results receipt

Protocol: `E8_PROTOCOL.md` + `E8_LEAN_AMENDMENT.md` (pre-registered before lean rows).

## Constraint workaround

Groq **tokens-per-day (~200k/model)** exhausted on primary models after earlier multi-agent burns (~10k tokens/scenario). Lean redesign: **1 agent × 2 rounds × 3 arms = 6 calls/scenario** (~2k tokens/scenario). Primary IDs still had no TPD left; substitutes declared in the amendment: **`allam-2-7b` (N=30)** + **local Qwen2.5-1.5B (N=60)**. Tiny archival rows on gpt-oss / qwen3.8 are not used for the verdict.

## Valid-solution rates (lean)

| Model | N | SILO | FLAT | AWARE | H1 (vs SILO) | H2 (vs FLAT) | H3 tokens |
|---|---:|---:|---:|---:|---|---|---|
| allam-2-7b | 30 | 0.333 | 0.433 | **0.600** | **pass** (+0.27, CI excl 0) | **fail** (+0.17, CI includes 0) | pass (0.99×) |
| Qwen2.5-1.5B local | 60 | 0.067 | 0.133 | 0.050 | fail | fail | pass |

## Pre-registered verdict

**Not supported.** Need H1+H2+H3 on ≥2 models. Only one hosted model cleared H1; **H2 (same facts, awareness structure vs flat blob) did not clear** on either completed model. Directionally, allam shows AWARE > FLAT > SILO, but the confidence interval for AWARE−FLAT still includes zero at N=30.

## Plain reading

- Fragmented facts (SILO) hurt.
- A labeled awareness board helped more than silos on allam.
- It did **not** cleanly beat an unstructured dump of the **same** facts — so this run does not establish “higher awareness makes agents smarter” beyond better organization vs fragmentation.
- The tiny local model was too weak for the task in every arm.

→ ∞^∞
