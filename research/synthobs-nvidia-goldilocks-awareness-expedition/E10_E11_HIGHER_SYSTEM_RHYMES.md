# E10 + E11 — Higher-system rhymes of protein folding (pre-registered)

Written **before** E10/E11 result rows. SynthOBS Autonomous Agent · Syntheverse Sandbox.

## Why

E9 showed, on real PDB + Pfam, that a **relational awareness board** can recover long-range structure a **linear** pass misses. That must not be a protein-only trick. We need **at least two higher-system rhymes** — knowledge and socioeconomic macro structure — using the **same folding grammar**, to test whether the benefit generalizes toward smarter agents.

## Folding grammar (shared)

| Protein fold | Higher system |
|---|---|
| Sequence | Local observations / one document / one series |
| Homolog MSA | Related passages / related macro series |
| Long-range contact | Evidential title pair / teleconnected series pair |
| Linear read | Single passage or single series window |
| Flat dump | All related raw text/series without relational compression |
| Awareness board | Explicit coupling / relationship map from the related set **without** using gold labels |

**Smarter** = higher exact recovery of the long-range pair (and, for E10 secondary, correct answer when asked).

## E10 — Knowledge fold (cognitive / agent reasoning)

- **Data:** HotpotQA distractor validation, **bridge** questions only (HuggingFace `hotpotqa/hotpot_qa`, real Wikipedia paragraphs).
- **Gold contact:** the two supporting-fact titles (order-invariant).
- **Couplings:** Jaccard overlap of paragraph word sets between titles (computed from context text only — not from `supporting_facts`).
- **Cohort filter:** keep items where the highest coupling involving the first gold title recovers the gold pair (coevolution-consistent slice), same honesty move as E9.
- **Arms:** LINEAR (question + one local paragraph) · FLAT (question + all 10 paragraphs) · AWARE (question + ranked title–title coupling board).
- **Primary metric:** exact supporting-title pair match.

## E11 — Macro teleconnection fold (socioeconomic system)

- **Data:** Real FRED CSVs already in-suite / refreshable (`UNRATE`, `CPIAUCSL`, `FEDFUNDS`, `INDPRO`) — public St. Louis Fed series.
- **Gold contact:** for a query series at month *t*, the other series with strongest absolute **lagged correlation** (lag 1–6 months) over a trailing window — planted from the real joint history (label derived from data, not from an LLM).
- **Arms:** LINEAR (query series recent values only) · FLAT (all four series recent values dumped) · AWARE (explicit lag-correlation board among series).
- **Primary metric:** exact partner series id.

## Models / N / gates

- Prefer `allam-2-7b` (unused TPD) + local `Qwen/Qwen2.5-1.5B-Instruct`.
- Target N: **24** per rhyme per model (token-cap lean: 1 call/arm).
- **H1:** AWARE − LINEAR ≥ +0.25, CI excludes 0.  
- **H2:** AWARE − FLAT ≥ +0.10, CI excludes 0.  
- **H3:** AWARE tokens ≤ 1.25 × FLAT tokens.  
- **Cross-rhyme verdict:** folding-rhyme awareness helps **higher systems**, not only proteins, if **H1 holds on ≥1 higher-system rhyme for a capable model** and the protein E9 directional lock still stands. Full “all system rhymes” claim requires H1 on **both** E10 and E11 for the same capable model.

## Honesty

Not ENGINE_SHELF; not NVIDIA KPIs; not a claim that HotpotQA or FRED *are* proteins. They are **higher-system rhymes** of the same long-range relational pattern.
