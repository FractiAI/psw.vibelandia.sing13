# E7 — Does a shared world model make agents smarter? (pre-registered protocol)

Written and committed before any E7 result was generated. SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Question

Earlier experiments (E0–E6) showed efficiency at parity and one context-assembly effect under a deliberately tight budget. None of them tested whether a shared world model improves **answer quality on a task the agents did not author**, against a **strong competing architecture**, on **real text**. E7 does.

## Task and data

- HotpotQA, distractor setting, validation split (public, real Wikipedia paragraphs, human-written multi-hop questions).
- Each question comes with 10 paragraphs: 2 gold, 8 distractors. The answer needs facts from both gold paragraphs.
- Filter: answers that are not "yes" or "no" (removes a 50% chance floor). Seeded shuffle (seed 20261116); the first N questions that pass the filter are used. The same questions are used for every arm and every model.

## Arms (same model, same answer prompt, same decoding in every arm)

Answer prompt (all arms): *Answer the question using only the CONTEXT. Reply with only the short answer, no explanation.*

| Arm | World model / information architecture |
|---|---|
| FULL | One agent sees all 10 paragraphs. Reference ceiling, not token-matched. |
| SILO | Five agents each privately hold 2 paragraphs (random assignment). Each emits one line of relevant facts; a coordinator answers from the five messages only. Linear private-silo organization. |
| SHARED | Shared world slice visible to every agent: title plus first sentence of all 10 paragraphs. Step 1: the model names up to 3 titles to expand (selective reconstruction of private detail). Step 2: it answers from the shared slice plus the expanded paragraphs. |
| RAG | BM25 over the 10 paragraphs, top paragraphs added until the **total input tokens of SHARED (both calls)** are matched. The strongest simple competitor, given at least as many tokens as SHARED. |
| RANDOM | Random paragraphs, same token budget as RAG. Control for "any context of this size". |

## Metrics

Primary: token-level F1 against the gold answer (HotpotQA normalization). Secondary: exact match, input tokens, provider-reported total tokens. Paired bootstrap (10,000 resamples) over questions for all contrasts.

## Models

- `openai/gpt-oss-20b` and `openai/gpt-oss-120b` (open-weight, via Groq; temperature 0, low reasoning effort).
- One small local open-source model (Qwen2.5 instruct, CPU) for a second family and a larger N.

## Hypotheses and decision rule (fixed in advance)

- **H1 (beats silos):** SHARED − SILO mean F1 ≥ +0.10 with the 95% CI excluding 0.
- **H2 (beats plain retrieval, the key test):** SHARED − RAG mean F1 ≥ +0.05 with the 95% CI excluding 0.
- **H3 (not just selection):** SHARED − RANDOM mean F1 > 0 with the 95% CI excluding 0.
- **Verdict "a shared world model makes agents smarter" is supported only if H1, H2 and H3 all hold on at least two of the three models.**
- If H1 holds but H2 does not, the honest conclusion is "the shared world helps relative to private silos but is not better than retrieval at the same token cost; no evidence of added intelligence beyond good information routing."
- If SHARED ≤ SILO or SHARED ≤ RANDOM, the hypothesis is rejected for this task.
- Not tested here, and not testable with this design: organizations, humans, long-horizon work, or anything about NVIDIA or any CEO.

## Known limits (stated before running)

- One benchmark family, short passages, ten paragraphs per question.
- SHARED's selection step is itself LLM-driven retrieval; it is a world model only in the sense defined above (shared index plus private detail plus selective reconstruction).
- Small N on the rate-limited hosted models; confidence intervals will be wide and are reported as they are.
- The local model is small; it may fail the task in every arm, which would make the contrasts uninformative.
