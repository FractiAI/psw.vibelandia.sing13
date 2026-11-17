# E12 — Do collaborating agents beat the sum of their parts? (pre-registered)

Written **before** E12 result rows. SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Claim

**Smarter agents** in the collaboration sense means the **team whole exceeds the sum of independent parts**: a coordinated team with a shared awareness board solves tasks that independent agents with the same split information cannot solve even if you OR their successes together.

## Real data

HotpotQA distractor validation, **bridge** questions (HuggingFace). Each item has two supporting passages that jointly determine the answer.

## Roles / information split (identical facts across arms)

- **Agent A** privately holds supporting passage 1 only.  
- **Agent B** privately holds supporting passage 2 only.  
- Neither arm receives the gold answer string.

## Arms

| Arm | Protocol |
|---|---|
| **SOLO_A** | A answers alone from passage 1 |
| **SOLO_B** | B answers alone from passage 2 |
| **INDEPENDENT_OR** | Not an extra LLM call — success if SOLO_A **or** SOLO_B is correct (sum-of-parts / pool of independent successes) |
| **MAX_SOLO** | success if the better of A/B is correct |
| **SILO_TEAM** | A and B each write a one-line note from their private passage; a synthesizer answers from the two notes only (messages, no shared world board) |
| **COLLAB_AWARE** | Same two notes, plus a **shared awareness board** (title couplings + both passage titles + open question); synthesizer answers from notes + board |

Decoding: temperature 0. Lean: 2 solo calls + 2 note calls + 1 synthesizer for SILO + 1 for COLLAB ≈ 6 calls/item when solos are shared across arms.

## Metrics

- Primary: answer exact match (HotpotQA normalization: lowercased, articles stripped).  
- **Synergy (whole > sum of parts):** `COLLAB_AWARE − INDEPENDENT_OR` mean ≥ +0.10 and 95% bootstrap CI excludes 0.  
- **Team > best part:** `COLLAB_AWARE − MAX_SOLO` ≥ +0.10, CI excludes 0.  
- **Board helps messaging:** `COLLAB_AWARE − SILO_TEAM` ≥ +0.05, CI excludes 0 (secondary).

## Verdict

**“Better agent collaboration / sum of parts exceeded”** supported if synergy and team>best-part hold on the capable model(s) run. If COLLAB ≈ INDEPENDENT_OR, we did **not** show collaborative surplus — only that someone already had the answer.

## Models / N

- Local `Qwen/Qwen2.5-1.5B-Instruct` (always).  
- Groq open-weight models if API reachable; otherwise local-only with honesty note.  
- Target N = **30** bridge items (seed `20261119`).

## Honesty

Not NVIDIA KPIs; not a claim that chat notes equal organizations. HotpotQA bridge is a real multi-document task where complementary information is the natural “parts.”

## Amendment A — complementary title-pair primary (pre-result for E12b rows)

Hotpot answers almost always appear inside at least one supporting passage, so `INDEPENDENT_OR` on answer EM is an unfairly strong “sum of parts” and can beat weak synthesizers.  

**E12b primary task (same items, same split):** recover the evidential contact `Title1||Title2`.  
- SOLO_A only sees passage 1 (knows one title’s text).  
- SOLO_B only sees passage 2.  
- Neither solo can honestly emit both gold titles from one passage alone.  
- `INDEPENDENT_OR` still fails unless a solo luckily guesses both titles.  
- COLLAB_AWARE / SILO_TEAM must assemble the pair from complementary notes (+ board for AWARE).  

Answer EM remains secondary. Synergy gates apply to **title-pair exact match**.
