# E8 Lean Amendment — finish under daily token cap (pre-registered)

Written **before** any lean-arm result was generated. Amends `E8_PROTOCOL.md` for execution under Groq tokens-per-day limits (~200k/model/day). SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Why

The original E8 multi-agent harness used 3 roles × 2 rounds × 3 arms ≈ **18 LLM calls / scenario** and ~10k tokens / scenario. That exhausted daily caps before N was large enough for H1/H2.

## What stays the same (the claim)

- Same scenario generator and seed (`20261116`).
- Same gold `COMMIT` / `SOLUTION` rules.
- Same arms: **SILO**, **FLAT**, **AWARE**.
- Same decision rule: H1 / H2 / H3 as in `E8_PROTOCOL.md`.
- FLAT and AWARE remain **information-matched** on world facts; only awareness *structure* differs.

## What changes (cost only)

| Item | Original E8 | Lean E8 |
|---|---|---|
| Agents | 3 roles per arm | **1** decision agent per arm |
| Calls / scenario | ~18 | **6** (2 rounds × 3 arms) |
| SILO packing | 3 private shards + messages | One agent sees **one random third** of option facts (+ shared hard rules) |
| Transcript / chatter | long | 1 distractor line |
| `max_tokens` | 400 | **48** |
| Hosted models | as available under TPD | Prefer `qwen/qwen3.8-27b` then `openai/gpt-oss-120b`; skip a model if its TPD is exhausted |
| Target N | 40 hosted / 80 local | **30 hosted / 60 local** (still enough for bootstrap CIs) |

## Honesty

Lean E8 still tests “higher awareness → smarter decisions with matched facts.” It no longer tests *multi-agent organizational* coordination inside an arm — only the awareness board vs flat vs fragmented facts for a single agent. Multi-agent receipts from the partial original run remain archival under `data/e8/` and are **not** mixed into lean scoring (`data/e8_lean/`).
