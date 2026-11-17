#!/usr/bin/env python3
"""E12b — complementary title-pair synergy on HotpotQA (whole > sum of parts)."""
from __future__ import annotations
import argparse, json, random, re, sys
from pathlib import Path
from statistics import mean
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from e12_collab_synergy import Local, load_items

SEED = 20261119
OUT = HERE.parent / "data" / "e12_collab"
PAIR_SYS = "List the two Wikipedia titles that jointly support the answer. Reply SOLUTION: TitleA||TitleB only."
NOTE_SYS = "State your passage title and one key fact. Format: TITLE: <title>. FACT: <one sentence>."


def parse_pair(text):
    if not text:
        return None
    m = re.search(r"SOLUTION:\s*(.+)$", text.strip(), re.I | re.M)
    raw = (m.group(1) if m else text).strip().strip(".")
    m2 = re.search(r"TitleA\s*[:=]\s*(.+?)\s*TitleB\s*[:=]\s*(.+)$", raw, re.I | re.S)
    if m2:
        a, b = m2.group(1).strip(), m2.group(2).strip()
    elif "||" in raw:
        a, b = [x.strip() for x in raw.split("||", 1)]
    elif re.search(r"\band\b", raw, re.I):
        a, b = re.split(r"\s+and\s+", raw, maxsplit=1, flags=re.I)
        a, b = a.strip(), b.strip()
    else:
        return None
    return "||".join(sorted([a, b], key=str.lower))


def eq(pred, gold):
    if not pred:
        return False
    return "||".join(sorted([x.strip().lower() for x in pred.split("||", 1)])) == "||".join(
        sorted([x.strip().lower() for x in gold.split("||", 1)])
    )


def run_item(be, sc):
    gold = "||".join(sorted([sc["t1"], sc["t2"]], key=str.lower))
    q = sc["question"]
    a_txt, _ = be.chat(PAIR_SYS, f"QUESTION: {q}\nYou only see ONE passage:\n{sc['p1'][:1000]}")
    b_txt, _ = be.chat(PAIR_SYS, f"QUESTION: {q}\nYou only see ONE passage:\n{sc['p2'][:1000]}")
    a_pred, b_pred = parse_pair(a_txt), parse_pair(b_txt)
    n1, _ = be.chat(NOTE_SYS, f"QUESTION: {q}\nPRIVATE PASSAGE titled {sc['t1']}:\n{sc['p1'][:900]}")
    n2, _ = be.chat(NOTE_SYS, f"QUESTION: {q}\nPRIVATE PASSAGE titled {sc['t2']}:\n{sc['p2'][:900]}")
    notes = f"AgentA: {n1}\nAgentB: {n2}"
    silo_txt, _ = be.chat(PAIR_SYS, f"QUESTION: {q}\nTEAM NOTES ONLY:\n{notes}")
    board = "\n".join(f"{a}||{b}: coupling={c}" for a, b, c in sc["board"])
    col_txt, _ = be.chat(
        PAIR_SYS,
        f"QUESTION: {q}\nSHARED AWARENESS BOARD:\n{board}\nTEAM NOTES:\n{notes}\nAssemble the evidential title pair from complementary agents.",
    )
    silo_pred, col_pred = parse_pair(silo_txt), parse_pair(col_txt)
    a_em, b_em = eq(a_pred, gold), eq(b_pred, gold)
    return {
        "gold_pair": gold,
        "SOLO_A": {"pred": a_pred, "em": float(a_em), "text": a_txt},
        "SOLO_B": {"pred": b_pred, "em": float(b_em), "text": b_txt},
        "INDEPENDENT_OR": {"em": float(a_em or b_em)},
        "MAX_SOLO": {"em": float(max(a_em, b_em))},
        "SILO_TEAM": {"pred": silo_pred, "em": float(eq(silo_pred, gold)), "text": silo_txt},
        "COLLAB_AWARE": {"pred": col_pred, "em": float(eq(col_pred, gold)), "text": col_txt},
    }


def boot(rows, a, b, n=10000, seed=SEED):
    rng = random.Random(seed)
    nq = len(rows)
    diffs = []
    for _ in range(n):
        samp = [rows[rng.randrange(nq)] for _ in range(nq)]
        diffs.append(sum(r["arms"][a]["em"] - r["arms"][b]["em"] for r in samp) / nq)
    diffs.sort()
    m = sum(diffs) / n
    lo, hi = diffs[int(0.025 * n)], diffs[int(0.975 * n)]
    return {"mean": round(m, 4), "lo": round(lo, 4), "hi": round(hi, 4), "excludes_0": not (lo <= 0 <= hi)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=30)
    ap.add_argument("--model", default="Qwen/Qwen2.5-1.5B-Instruct")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    be = Local(a.model)
    items = load_items(a.n)
    slug = re.sub(r"[^A-Za-z0-9]+", "_", a.model).strip("_")
    path = OUT / f"titlepair_{slug}.jsonl"
    done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()} if path.exists() else set()
    for sc in items:
        if sc["id"] in done:
            continue
        arms = run_item(be, sc)
        gold = arms.pop("gold_pair")
        row = {"id": sc["id"], "question": sc["question"], "gold_pair": gold, "arms": arms, "task": "title_pair"}
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[titlepair] {sc['id']} A={int(arms['SOLO_A']['em'])} B={int(arms['SOLO_B']['em'])} OR={int(arms['INDEPENDENT_OR']['em'])} SILO={int(arms['SILO_TEAM']['em'])} COLLAB={int(arms['COLLAB_AWARE']['em'])}",
            flush=True,
        )
    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()]
    summary = {
        "model": a.model,
        "protocol": "E12_COLLAB_SYNERGY.md Amendment A",
        "task": "complementary_title_pair",
        "n": len(rows),
        "exact_match_rates": {k: round(mean(r["arms"][k]["em"] for r in rows), 4) for k in ["SOLO_A","SOLO_B","MAX_SOLO","INDEPENDENT_OR","SILO_TEAM","COLLAB_AWARE"]},
        "contrasts": {
            "COLLAB_minus_INDEPENDENT_OR": boot(rows, "COLLAB_AWARE", "INDEPENDENT_OR"),
            "COLLAB_minus_MAX_SOLO": boot(rows, "COLLAB_AWARE", "MAX_SOLO"),
            "COLLAB_minus_SILO_TEAM": boot(rows, "COLLAB_AWARE", "SILO_TEAM"),
        },
    }
    c1, c2, c3 = summary["contrasts"]["COLLAB_minus_INDEPENDENT_OR"], summary["contrasts"]["COLLAB_minus_MAX_SOLO"], summary["contrasts"]["COLLAB_minus_SILO_TEAM"]
    summary["gates"] = {
        "synergy_whole_gt_sum_parts": c1["mean"] >= 0.10 and c1["excludes_0"],
        "team_gt_best_part": c2["mean"] >= 0.10 and c2["excludes_0"],
        "board_helps_messaging": c3["mean"] >= 0.05 and c3["excludes_0"],
    }
    summary["verdict_better_collaboration"] = bool(summary["gates"]["synergy_whole_gt_sum_parts"] and summary["gates"]["team_gt_best_part"])
    (OUT / f"titlepair_{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
