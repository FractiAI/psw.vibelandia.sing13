# E8 — Does higher awareness make agents smarter? (pre-registered)

Written and committed **before** any E8 result was generated. SynthOBS Autonomous Agent · Syntheverse Sandbox.

E7 tested shared *filing* against BM25 on HotpotQA and was stopped early; it does not answer this claim. E8 is the redesigned test of the claim the expedition actually intended.

## Claim under test

Higher situational awareness — a shared, labeled world of goals, constraints, commitments, and history — produces **smarter** agent teams than the **same facts** without that awareness layer.

“Smarter” here means: higher rate of **valid final solutions** (correct choice **and** no hard-constraint violation), not fewer tokens and not better paragraph lookup.

## Why this is not E6/E7

| Prior test | What it really measured |
|---|---|
| E6 | Context assembly under a tight budget (architecture / truncation) |
| E7 | Shared index + expand vs BM25 on HotpotQA (retrieval / filing) |
| **E8** | Same facts in every competing arm; only the **awareness board** changes |

## Task (regenerable, seeded)

Synthetic **dispatch** problems. Each scenario has:

- One goal and 3–4 hard constraints (budget, banned option, required property).
- A menu of options with attributes (cost, capacity, route tag).
- **Round 1:** the team must emit `COMMIT: <OPTION>` — the unique cheapest legal option.
- **Round 2:** a world event arrives that *depends on the commitment* (e.g. “if you committed to X, switch to the next-cheapest legal; if Y, keep Y; if Z, abort to SAFE”).
- **Final:** emit `SOLUTION: <OPTION>` (or `SOLUTION: SAFE`).

The correct final answer is a function of (commitment × event). Forgetting or mis-reading the commitment yields a fluent but wrong answer. Distractor chatter is injected so the commitment is not the only line in the history.

Seed: `20261116`. Scenario ids `0 .. N-1`.

## Arms (same model · same decoding · same max rounds · same option menus)

| Arm | What the team sees |
|---|---|
| **SILO** | Three agents; each privately holds a shard of option attributes; free-form messages only; no shared board. |
| **FLAT** | Three agents; **all facts, the goal, the constraints, the event, and the full prior transcript** every turn — same information as AWARE, but as an unstructured blob (no labeled COMMITMENTS / CONSTRAINTS / HISTORY slots). |
| **AWARE** | Three agents; **the same facts and the same event**, plus a persistent labeled board: `GOAL`, `CONSTRAINTS`, `COMMITMENTS`, `FACTS`, `EVENT`, `HISTORY`. Agents may write `COMMIT:` / `SOLUTION:`; the board updates. |

FLAT and AWARE are **information-matched** on world facts and on whether a commitment string exists in context. Only the awareness *structure* differs. SILO is the organizational low-awareness baseline (fragmented facts).

Decoding: temperature 0. Roles: Scout, Planner, Auditor (same prompts across arms aside from how context is packed).

## Metrics

- Primary: **valid solution rate** = final `SOLUTION` matches gold **and** the implied option is legal under the hard constraints.
- Secondary: Round-1 commitment accuracy; constraint-violation rate; provider tokens; rounds used.
- Contrasts: paired bootstrap (10,000 resamples) over scenarios.

## Models

- `openai/gpt-oss-20b` and `openai/gpt-oss-120b` via Groq.
- `Qwen/Qwen2.5-1.5B-Instruct` local (second family).

Target N: 40 scenarios per hosted model (rate-limit permitting); 80 local.

## Hypotheses and decision rule (fixed in advance)

- **H1 (beats fragmented org):** AWARE − SILO valid-rate ≥ +0.15, 95% CI excludes 0.
- **H2 (beats same facts without awareness structure) — the claim test:** AWARE − FLAT valid-rate ≥ +0.10, 95% CI excludes 0.
- **H3 (not a token artifact):** AWARE mean input tokens ≤ 1.25 × FLAT mean input tokens (AWARE must not win by simply stuffing more text).
- **Verdict “higher awareness makes agents smarter” is supported only if H1, H2, and H3 all hold on at least two of the three models.**
- If H1 holds and H2 fails: “shared structure helps vs silos, but not smarter than an unstructured dump of the same facts.”
- If H2 holds and H3 fails: report as a possible token confound, not as a clean awareness effect.
- Not tested: humans, NVIDIA, CEOs, long-horizon production systems, frontier closed models.

## Known limits (stated before running)

- Synthetic tasks, short horizon (2 rounds), three roles.
- Gold answers are rule-derived; fluency is not scored beyond the `SOLUTION:` line.
- Small N on rate-limited hosts; CIs will be wide and reported as they are.
- A small local model may fail every arm; contrasts are then uninformative for that model.
