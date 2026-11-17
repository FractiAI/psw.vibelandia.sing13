#!/usr/bin/env python3
"""E12 — multi-agent collaboration synergy on real HotpotQA bridge questions.
Protocol: ../E12_COLLAB_SYNERGY.md. GROQ optional; local always works."""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import string
import time
import urllib.error
import urllib.request
from collections import Counter, deque
from pathlib import Path

SEED = 20261119
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "e12_collab"


def est(t: str) -> int:
    return max(1, math.ceil(len(t) / 4))


def normalize_answer(s: str) -> str:
    s = (s or "").lower()
    s = "".join(ch for ch in s if ch not in set(string.punctuation))
    s = re.sub(r"\b(a|an|the)\b", " ", s)
    return " ".join(s.split())


def f1_em(pred: str, gold: str):
    p, g = normalize_answer(pred).split(), normalize_answer(gold).split()
    em = float(normalize_answer(pred) == normalize_answer(gold))
    common = Counter(p) & Counter(g)
    ns = sum(common.values())
    if not p or not g or ns == 0:
        return 0.0, em
    pr, rc = ns / len(p), ns / len(g)
    return 2 * pr * rc / (pr + rc), em


def words(s: str):
    return set(re.findall(r"[a-z0-9]+", (s or "").lower()))


def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


class Groq:
    def __init__(self, model, tpm=7000):
        self.model = model
        self.tpm = tpm
        self.key = os.environ.get("GROQ_API_KEY", "")
        self.win = deque()
        self.remaining_requests = None
        self.ok = False
        if self.key:
            try:
                self.chat("sys", "ping", max_tokens=3)
                self.ok = True
            except Exception:
                self.ok = False

    def _wait(self, need):
        while True:
            now = time.time()
            while self.win and now - self.win[0][0] > 60:
                self.win.popleft()
            if sum(t for _, t in self.win) + need <= self.tpm:
                return
            time.sleep(1.0)

    def chat(self, system, user, max_tokens=64):
        reserve = est(system + user) + 80
        for attempt in range(6):
            self._wait(reserve)
            body = {
                "model": self.model,
                "temperature": 0,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            }
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode(),
                headers={
                    "content-type": "application/json",
                    "authorization": f"Bearer {self.key}",
                    "user-agent": "e12-collab/1",
                },
            )
            slot = [time.time(), reserve]
            self.win.append(slot)
            try:
                with urllib.request.urlopen(req, timeout=90) as r:
                    data = json.loads(r.read())
                    self.remaining_requests = r.headers.get("x-ratelimit-remaining-requests")
                u = data.get("usage", {})
                slot[1] = u.get("total_tokens", reserve)
                text = (data["choices"][0]["message"].get("content") or "").strip()
                return text, u.get("total_tokens", reserve)
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:300]
                slot[1] = 0
                if e.code in (403, 401):
                    raise RuntimeError(f"Groq blocked: {msg}")
                if e.code == 429:
                    time.sleep(float(e.headers.get("retry-after") or 4 * (attempt + 1)))
                    continue
                raise RuntimeError(f"Groq {e.code}: {msg}")
            except Exception as e:
                slot[1] = 0
                if attempt == 5:
                    raise
                time.sleep(2 * (attempt + 1))
        raise RuntimeError("Groq retries exhausted")


class Local:
    def __init__(self, model_id, dtype="float32"):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        self.tokz = AutoTokenizer.from_pretrained(model_id)
        self.model = AutoModelForCausalLM.from_pretrained(model_id, dtype=getattr(torch, dtype))
        self.model.eval()
        self.remaining_requests = None
        self.ok = True

    def chat(self, system, user, max_tokens=64):
        msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        ids = self.tokz.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True)
        n_in = ids["input_ids"].shape[1]
        with self.torch.no_grad():
            out = self.model.generate(**ids, max_new_tokens=min(max_tokens, 64), do_sample=False)
        text = self.tokz.decode(out[0][n_in:], skip_special_tokens=True).strip()
        return text, n_in + (out.shape[1] - n_in)


ANSWER_SYS = "Answer the question using only CONTEXT. Reply with exactly one line SOLUTION: <short answer>."
NOTE_SYS = "From your private CONTEXT, write one short factual note useful for answering the QUESTION. One sentence. No answer guess if unsupported."


def parse_solution(text: str) -> str:
    if not text:
        return ""
    m = re.search(r"SOLUTION:\s*(.+)$", text.strip(), flags=re.I | re.M)
    raw = (m.group(1) if m else text).strip()
    return raw.split("\n")[0].strip().strip(".")


def load_items(n=30, seed=SEED):
    from huggingface_hub import hf_hub_download
    import pyarrow.parquet as pq

    path = hf_hub_download(
        "hotpotqa/hotpot_qa",
        "distractor/validation/0000.parquet",
        repo_type="dataset",
        revision="refs/convert/parquet",
    )
    rows = pq.read_table(path).to_pylist()
    rows = [r for r in rows if r.get("type") == "bridge" and r.get("answer", "").strip().lower() not in ("yes", "no")]
    rng = random.Random(seed)
    rng.shuffle(rows)
    out = []
    for r in rows:
        titles = r["context"]["title"]
        sents = r["context"]["sentences"]
        paras = {t: " ".join(ss) for t, ss in zip(titles, sents)}
        gold_titles = list(dict.fromkeys(r["supporting_facts"]["title"]))
        if len(gold_titles) < 2:
            continue
        t1, t2 = gold_titles[0], gold_titles[1]
        if t1 not in paras or t2 not in paras:
            continue
        # coupling board among all titles (text overlap)
        bags = {t: words(paras[t]) for t in titles}
        scores = []
        for i, a in enumerate(titles):
            for b in titles[i + 1 :]:
                scores.append((a, b, round(jaccard(bags[a], bags[b]), 4)))
        scores.sort(key=lambda x: (-x[2], x[0], x[1]))
        out.append(
            {
                "id": f"e12-{len(out)}",
                "question": r["question"],
                "answer": r["answer"],
                "t1": t1,
                "t2": t2,
                "p1": paras[t1],
                "p2": paras[t2],
                "board": scores[:8],
                "sources": {"dataset": "hotpotqa/hotpot_qa", "split": "distractor/validation", "type": "bridge"},
            }
        )
        if len(out) >= n:
            break
    return out


def run_item(be, sc):
    q = sc["question"]
    # solos
    a_txt, a_tok = be.chat(
        ANSWER_SYS,
        f"QUESTION: {q}\nCONTEXT (passage {sc['t1']} only):\n{sc['p1'][:1200]}",
    )
    b_txt, b_tok = be.chat(
        ANSWER_SYS,
        f"QUESTION: {q}\nCONTEXT (passage {sc['t2']} only):\n{sc['p2'][:1200]}",
    )
    a_pred, b_pred = parse_solution(a_txt), parse_solution(b_txt)
    a_f1, a_em = f1_em(a_pred, sc["answer"])
    b_f1, b_em = f1_em(b_pred, sc["answer"])

    # notes for team arms
    n1, n1t = be.chat(NOTE_SYS, f"QUESTION: {q}\nPRIVATE CONTEXT [{sc['t1']}]:\n{sc['p1'][:900]}")
    n2, n2t = be.chat(NOTE_SYS, f"QUESTION: {q}\nPRIVATE CONTEXT [{sc['t2']}]:\n{sc['p2'][:900]}")
    notes = f"AgentA note: {n1.strip()}\nAgentB note: {n2.strip()}"

    silo_txt, silo_tok = be.chat(ANSWER_SYS, f"QUESTION: {q}\nTEAM NOTES ONLY:\n{notes}")
    silo_pred = parse_solution(silo_txt)
    silo_f1, silo_em = f1_em(silo_pred, sc["answer"])

    board_lines = "\n".join(f"{a}||{b}: coupling={c}" for a, b, c in sc["board"])
    aware_ctx = (
        f"QUESTION: {q}\n"
        f"SHARED AWARENESS BOARD (passage couplings; titles {sc['t1']} and {sc['t2']} are available to the team):\n"
        f"{board_lines}\n"
        f"TEAM NOTES:\n{notes}\n"
        f"PASSAGE TITLES IN PLAY: {sc['t1']} ; {sc['t2']}"
    )
    col_txt, col_tok = be.chat(ANSWER_SYS, aware_ctx)
    col_pred = parse_solution(col_txt)
    col_f1, col_em = f1_em(col_pred, sc["answer"])

    return {
        "SOLO_A": {"pred": a_pred, "em": a_em, "f1": a_f1, "tokens": a_tok},
        "SOLO_B": {"pred": b_pred, "em": b_em, "f1": b_f1, "tokens": b_tok},
        "INDEPENDENT_OR": {"em": float(bool(a_em or b_em)), "f1": max(a_f1, b_f1)},
        "MAX_SOLO": {"em": float(max(a_em, b_em)), "f1": max(a_f1, b_f1)},
        "SILO_TEAM": {"pred": silo_pred, "em": silo_em, "f1": silo_f1, "tokens": n1t + n2t + silo_tok},
        "COLLAB_AWARE": {"pred": col_pred, "em": col_em, "f1": col_f1, "tokens": n1t + n2t + col_tok},
    }


def bootstrap_diff(rows, a, b, key="em", n=10000, seed=SEED):
    rng = random.Random(seed)
    nq = len(rows)
    diffs = []
    for _ in range(n):
        samp = [rows[rng.randrange(nq)] for _ in range(nq)]
        diffs.append(sum(r["arms"][a][key] - r["arms"][b][key] for r in samp) / nq)
    diffs.sort()
    mean = sum(diffs) / len(diffs)
    lo, hi = diffs[int(0.025 * n)], diffs[int(0.975 * n)]
    return {"mean": round(mean, 4), "lo": round(lo, 4), "hi": round(hi, 4), "excludes_0": not (lo <= 0 <= hi)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local", "auto"], default="auto")
    ap.add_argument("--model", default="")
    ap.add_argument("--n", type=int, default=30)
    ap.add_argument("--dtype", default="float32")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    be = None
    model = a.model
    if a.backend in ("groq", "auto"):
        model = model or "allam-2-7b"
        try:
            g = Groq(model)
            # force probe
            g.chat("You are a ping.", "Say OK", max_tokens=3)
            be = g
            print("using groq", model, flush=True)
        except Exception as e:
            print("groq unavailable:", e, flush=True)
            if a.backend == "groq":
                raise
    if be is None:
        model = a.model or "Qwen/Qwen2.5-1.5B-Instruct"
        be = Local(model, a.dtype)
        print("using local", model, flush=True)

    items = load_items(a.n)
    meta=[]
    for it in items:
        m={k:v for k,v in it.items() if k not in ("p1","p2")}
        m["p1_len"]=len(it["p1"]); m["p2_len"]=len(it["p2"])
        meta.append(m)
    (OUT / "scenarios.json").write_text(json.dumps(meta, indent=2))

    slug = re.sub(r"[^A-Za-z0-9]+", "_", model).strip("_")
    path = OUT / f"{slug}.jsonl"
    done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()} if path.exists() else set()

    for sc in items:
        if sc["id"] in done:
            continue
        arms = run_item(be, sc)
        row = {"id": sc["id"], "question": sc["question"], "gold": sc["answer"], "titles": [sc["t1"], sc["t2"]], "arms": arms, "sources": sc["sources"]}
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[{model}] {sc['id']} em A={int(arms['SOLO_A']['em'])} B={int(arms['SOLO_B']['em'])} OR={int(arms['INDEPENDENT_OR']['em'])} SILO={int(arms['SILO_TEAM']['em'])} COLLAB={int(arms['COLLAB_AWARE']['em'])} gold={sc['answer'][:40]}",
            flush=True,
        )

    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()]
    from statistics import mean

    def rate(arm, key="em"):
        return round(mean(r["arms"][arm][key] for r in rows), 4)

    summary = {
        "model": model,
        "protocol": "E12_COLLAB_SYNERGY.md",
        "n": len(rows),
        "exact_match_rates": {
            "SOLO_A": rate("SOLO_A"),
            "SOLO_B": rate("SOLO_B"),
            "MAX_SOLO": rate("MAX_SOLO"),
            "INDEPENDENT_OR": rate("INDEPENDENT_OR"),
            "SILO_TEAM": rate("SILO_TEAM"),
            "COLLAB_AWARE": rate("COLLAB_AWARE"),
        },
        "mean_f1": {k: rate(k, "f1") for k in ("SOLO_A", "SOLO_B", "MAX_SOLO", "INDEPENDENT_OR", "SILO_TEAM", "COLLAB_AWARE")},
        "contrasts": {
            "COLLAB_minus_INDEPENDENT_OR": bootstrap_diff(rows, "COLLAB_AWARE", "INDEPENDENT_OR"),
            "COLLAB_minus_MAX_SOLO": bootstrap_diff(rows, "COLLAB_AWARE", "MAX_SOLO"),
            "COLLAB_minus_SILO_TEAM": bootstrap_diff(rows, "COLLAB_AWARE", "SILO_TEAM"),
        },
    }
    c1 = summary["contrasts"]["COLLAB_minus_INDEPENDENT_OR"]
    c2 = summary["contrasts"]["COLLAB_minus_MAX_SOLO"]
    c3 = summary["contrasts"]["COLLAB_minus_SILO_TEAM"]
    summary["gates"] = {
        "synergy_whole_gt_sum_parts": c1["mean"] >= 0.10 and c1["excludes_0"],
        "team_gt_best_part": c2["mean"] >= 0.10 and c2["excludes_0"],
        "board_helps_messaging": c3["mean"] >= 0.05 and c3["excludes_0"],
    }
    summary["verdict_better_collaboration"] = bool(
        summary["gates"]["synergy_whole_gt_sum_parts"] and summary["gates"]["team_gt_best_part"]
    )
    (OUT / f"{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
