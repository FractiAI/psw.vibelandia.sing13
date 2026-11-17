#!/usr/bin/env python3
"""E10 knowledge-fold (HotpotQA) + E11 macro teleconnection-fold (FRED).
Protocol: ../E10_E11_HIGHER_SYSTEM_RHYMES.md. Real online/public data only.
GROQ_API_KEY from env only."""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import random
import re
import time
import urllib.error
import urllib.request
from collections import deque
from pathlib import Path

SEED = 20261118
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT / "data" / "e10_e11"
FIX = ROOT / "fixtures"

SYS = (
    "Use only CONTEXT. Reply with exactly one line SOLUTION: <answer>. "
    "For pairs use hyphenated form (TitleA||TitleB or SERIES-A||SERIES-B). No other text."
)


def est(t: str) -> int:
    return max(1, math.ceil(len(t) / 4))


# ---------- backends ----------
class Groq:
    def __init__(self, model, tpm=7500):
        self.model = model
        self.tpm = tpm
        self.key = os.environ["GROQ_API_KEY"]
        self.win = deque()
        self.remaining_requests = None
        self.stopped_for_day = False

    def _wait(self, need):
        while True:
            now = time.time()
            while self.win and now - self.win[0][0] > 60:
                self.win.popleft()
            if sum(t for _, t in self.win) + need <= self.tpm:
                return
            time.sleep(1.0)

    def chat(self, system, user, max_tokens=64):
        if self.stopped_for_day:
            raise SystemExit("DAILY LIMIT already hit")
        reserve = est(system + user) + 80
        for attempt in range(8):
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
                    "user-agent": "e10-e11/1",
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
                msg = e.read().decode()[:400]
                slot[1] = 0
                low = msg.lower()
                if e.code == 429 and ("per day" in low or "tpd" in low or "tokens per day" in low):
                    self.stopped_for_day = True
                    raise SystemExit("DAILY LIMIT: " + msg)
                if e.code == 429:
                    time.sleep(float(e.headers.get("retry-after") or 3 * (attempt + 1)))
                    continue
                if e.code >= 500:
                    time.sleep(2 * (attempt + 1))
                    continue
                raise RuntimeError(f"Groq {e.code}: {msg}")
            except SystemExit:
                raise
            except Exception:
                slot[1] = 0
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

    def chat(self, system, user, max_tokens=64):
        msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        ids = self.tokz.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True)
        n_in = ids["input_ids"].shape[1]
        with self.torch.no_grad():
            out = self.model.generate(**ids, max_new_tokens=min(max_tokens, 64), do_sample=False)
        text = self.tokz.decode(out[0][n_in:], skip_special_tokens=True).strip()
        return text, n_in + (out.shape[1] - n_in)


def parse_solution(text: str):
    if not text:
        return None
    t = text.strip()
    m = re.search(r"TitleA\s*[:=]\s*(.+?)\s*TitleB\s*[:=]\s*(.+)$", t, flags=re.I | re.S)
    if m:
        a, b = m.group(1).strip().strip("."), m.group(2).strip().strip(".")
        return "||".join(sorted([a, b], key=str.lower))
    m = re.search(r"SOLUTION:\s*(.+)$", t, flags=re.I | re.M)
    raw = (m.group(1) if m else t).strip().strip(".")
    raw = re.sub(r"^TitleA\|\|TitleB:\s*", "", raw, flags=re.I)
    if "||" in raw:
        a, b = [x.strip() for x in raw.split("||", 1)]
        return "||".join(sorted([a, b], key=str.lower))
    if re.search(r"\s+and\s+", raw, re.I):
        a, b = re.split(r"\s+and\s+", raw, maxsplit=1, flags=re.I)
        return "||".join(sorted([a.strip(), b.strip()], key=str.lower))
    return raw.strip()





# ---------- E10 HotpotQA ----------
def words(s: str):
    return set(re.findall(r"[a-z0-9]+", s.lower()))


def jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def load_e10(n=24, seed=SEED):
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
        gold_titles = list(dict.fromkeys(r["supporting_facts"]["title"]))  # preserve unique order
        if len(gold_titles) < 2:
            continue
        g1, g2 = gold_titles[0], gold_titles[1]
        if g1 not in paras or g2 not in paras:
            continue
        # couplings from text only
        bags = {t: words(paras[t]) for t in titles}
        scores = {}
        for i, a in enumerate(titles):
            for b in titles[i + 1 :]:
                scores[tuple(sorted([a, b], key=str.lower))] = round(jaccard(bags[a], bags[b]), 4)
        involving = [((a, b), s) for (a, b), s in scores.items() if g1 in (a, b)]
        involving.sort(key=lambda kv: (-kv[1], kv[0][0], kv[0][1]))
        if not involving:
            continue
        top_pair = involving[0][0]
        gold_pair = tuple(sorted([g1, g2], key=str.lower))
        if top_pair != gold_pair:
            continue  # coevolution-consistent filter
        gold = "||".join(gold_pair)
        local_title = g1
        sc = {
            "id": f"e10-{len(out)}",
            "rhyme": "E10_knowledge_fold",
            "question": r["question"],
            "answer": r["answer"],
            "titles": titles,
            "paras": paras,
            "gold": gold,
            "gold_titles": gold_pair,
            "local_title": local_title,
            "involving": [(f"{a}||{b}", s) for (a, b), s in involving[:8]],
            "top_global": [
                (f"{a}||{b}", s) for (a, b), s in sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:8]
            ],
            "sources": {"dataset": "hotpotqa/hotpot_qa distractor validation", "type": "bridge"},
        }
        out.append(sc)
        if len(out) >= n:
            break
    return out


def pack_e10(sc, arm):
    q = sc["question"]
    if arm == "LINEAR":
        t = sc["local_title"]
        return (
            f"QUESTION: {q}\n"
            f"TASK: Name the two Wikipedia titles that form the evidential long-range contact (SOLUTION: TitleA||TitleB).\n"
            f"LOCAL PASSAGE ONLY [{t}]:\n{sc['paras'][t][:900]}"
        )
    if arm == "FLAT_MSA":
        dump = "\n\n".join(f"[{t}]\n{sc['paras'][t][:500]}" for t in sc["titles"])
        return (
            f"QUESTION: {q}\n"
            f"TASK: Name the two Wikipedia titles that form the evidential long-range contact (SOLUTION: TitleA||TitleB).\n"
            f"ALL PASSAGES (flat dump):\n{dump}"
        )
    inv = "\n".join(f"{p}: coupling={s}" for p, s in sc["involving"])
    lead = sc["involving"][0][0] if sc["involving"] else ""
    return (
        f"QUESTION: {q}\n"
        f"TASK: Name the two Wikipedia titles that form the evidential long-range contact (SOLUTION: TitleA||TitleB).\n"
        f"LEADING RELATIONAL CANDIDATE: {lead}\n"
        f"RELATIONAL AWARENESS BOARD (title couplings from passage overlap, not from labels):\n{inv}\n"
        f"NOTE: Prefer the leading relational candidate."
    )


# ---------- E11 FRED ----------
SERIES = ["UNRATE", "CPIAUCSL", "FEDFUNDS", "INDPRO"]


def load_fred_series():
    data = {}
    for sid in SERIES:
        p = FIX / f"fred_{sid}.csv"
        if not p.exists():
            url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"
            urllib.request.urlretrieve(url, p)
        rows = {}
        with p.open() as f:
            r = csv.DictReader(f)
            date_key = r.fieldnames[0]
            val_key = r.fieldnames[1]
            for row in r:
                try:
                    rows[row[date_key]] = float(row[val_key])
                except Exception:
                    continue
        data[sid] = rows
    # aligned dates
    dates = sorted(set.intersection(*[set(v.keys()) for v in data.values()]))
    return data, dates


def corr(xs, ys):
    n = len(xs)
    if n < 8:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    dy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if dx == 0 or dy == 0:
        return 0.0
    return num / (dx * dy)


def load_e11(n=24, seed=SEED, window=36):
    data, dates = load_fred_series()
    rng = random.Random(seed + 7)
    # candidate end indices
    idxs = list(range(window + 6, len(dates)))
    rng.shuffle(idxs)
    out = []
    for end in idxs:
        start = end - window
        # for each query series, find best partner by max abs corr at lags 1..6
        q = SERIES[len(out) % len(SERIES)]
        scores = {}
        for a in SERIES:
            for b in SERIES:
                if a >= b:
                    continue
                best = 0.0
                for lag in range(1, 7):
                    xs, ys = [], []
                    for i in range(start, end - lag):
                        d0, d1 = dates[i], dates[i + lag]
                        if d0 in data[a] and d1 in data[b]:
                            xs.append(data[a][d0])
                            ys.append(data[b][d1])
                    best = max(best, abs(corr(xs, ys)))
                scores[tuple(sorted([a, b]))] = round(best, 4)
        # partners involving q
        involving = [((a, b), s) for (a, b), s in scores.items() if q in (a, b)]
        involving.sort(key=lambda kv: (-kv[1], kv[0]))
        if not involving or involving[0][1] < 0.15:
            continue
        gold_pair = involving[0][0]
        partner = gold_pair[0] if gold_pair[1] == q else gold_pair[1]
        # recent values for packs
        recent = {sid: [data[sid][d] for d in dates[end - 12 : end]] for sid in SERIES}
        sc = {
            "id": f"e11-{len(out)}",
            "rhyme": "E11_macro_teleconnection_fold",
            "query": q,
            "as_of": dates[end - 1],
            "gold": "||".join(sorted(gold_pair)),
            "partner": partner,
            "involving": [(f"{a}||{b}", s) for (a, b), s in involving],
            "top_global": [(f"{a}||{b}", s) for (a, b), s in sorted(scores.items(), key=lambda kv: -kv[1])],
            "recent": recent,
            "sources": {
                "fred_series": SERIES,
                "fixture_or_url": "fixtures/fred_*.csv or fred.stlouisfed.org/graph/fredgraph.csv",
            },
        }
        out.append(sc)
        if len(out) >= n:
            break
    return out


def pack_e11(sc, arm):
    q = sc["query"]
    if arm == "LINEAR":
        vals = ", ".join(f"{v:.3f}" for v in sc["recent"][q])
        return (
            f"TASK: Which FRED series pair is the strongest long-range teleconnection involving {q}? "
            f"SOLUTION: SERIES||SERIES\n"
            f"LOCAL SERIES ONLY ({q}) last 12 months: {vals}"
        )
    if arm == "FLAT_MSA":
        dump = "\n".join(f"{sid}: " + ", ".join(f"{v:.3f}" for v in sc["recent"][sid]) for sid in SERIES)
        return (
            f"TASK: Which FRED series pair is the strongest long-range teleconnection involving {q}? "
            f"SOLUTION: SERIES||SERIES\n"
            f"ALL SERIES flat dump (last 12 months):\n{dump}"
        )
    inv = "\n".join(f"{p}: |corr|={s}" for p, s in sc["involving"])
    lead = sc["involving"][0][0]
    return (
        f"TASK: Which FRED series pair is the strongest long-range teleconnection involving {q}? "
        f"SOLUTION: SERIES||SERIES\n"
        f"LEADING RELATIONAL CANDIDATE: {lead}\n"
        f"RELATIONAL AWARENESS BOARD (lagged |corr| from real FRED history):\n{inv}\n"
        f"NOTE: Prefer the leading relational candidate."
    )


# ---------- run ----------
def bootstrap_diff(rows, a, b, n=10000, seed=SEED):
    rng = random.Random(seed)
    nq = len(rows)
    diffs = []
    for _ in range(n):
        samp = [rows[rng.randrange(nq)] for _ in range(nq)]
        diffs.append(sum(int(r["arms"][a]["exact"]) - int(r["arms"][b]["exact"]) for r in samp) / nq)
    diffs.sort()
    mean = sum(diffs) / len(diffs)
    lo, hi = diffs[int(0.025 * n)], diffs[int(0.975 * n)]
    return {"mean": round(mean, 4), "lo": round(lo, 4), "hi": round(hi, 4), "excludes_0": not (lo <= 0 <= hi)}


def run_suite(be, scenarios, pack_fn, rhyme_key, model):
    slug = re.sub(r"[^A-Za-z0-9]+", "_", model).strip("_")
    path = OUT / f"{rhyme_key}_{slug}.jsonl"
    done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()} if path.exists() else set()
    for sc in scenarios:
        if sc["id"] in done:
            continue
        try:
            arms = {}
            for arm in ("LINEAR", "FLAT_MSA", "AWARE"):
                text, tok = be.chat(SYS, "CONTEXT:\n" + pack_fn(sc, arm))
                pred = parse_solution(text)
                # normalize title/series case for pair compare
                gold = sc["gold"]
                exact = False
                if pred:
                    if "||" in gold:
                        exact = parse_solution("SOLUTION: " + pred) == gold or pred.lower() == gold.lower()
                        # also accept if both sides match ignoring case
                        if not exact and "||" in pred:
                            exact = "||".join(sorted([x.strip().lower() for x in pred.split("||", 1)])) == "||".join(
                                sorted([x.strip().lower() for x in gold.split("||", 1)])
                            )
                    else:
                        exact = pred.strip().lower() == str(gold).strip().lower()
                arms[arm] = {"pred": pred, "text": text, "exact": exact, "tokens": tok}
        except SystemExit as e:
            print(str(e), flush=True)
            break
        row = {"id": sc["id"], "rhyme": sc["rhyme"], "gold": sc["gold"], "sources": sc.get("sources"), "arms": arms}
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[{model}/{rhyme_key}] {sc['id']} exact="
            + str({k: int(v["exact"]) for k, v in arms.items()})
            + f" gold={sc['gold']}",
            flush=True,
        )
    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()] if path.exists() else []
    if not rows:
        return None
    from statistics import mean

    summary = {
        "model": model,
        "rhyme": rhyme_key,
        "n": len(rows),
        "exact_rates": {a: round(mean(r["arms"][a]["exact"] for r in rows), 4) for a in ("LINEAR", "FLAT_MSA", "AWARE")},
        "mean_tokens": {a: round(mean(r["arms"][a]["tokens"] for r in rows), 1) for a in ("LINEAR", "FLAT_MSA", "AWARE")},
        "contrasts": {
            "AWARE_minus_LINEAR": bootstrap_diff(rows, "AWARE", "LINEAR"),
            "AWARE_minus_FLAT_MSA": bootstrap_diff(rows, "AWARE", "FLAT_MSA"),
        },
    }
    summary["H3_token_ratio"] = round(
        summary["mean_tokens"]["AWARE"] / max(1e-9, summary["mean_tokens"]["FLAT_MSA"]), 4
    )
    h1, h2 = summary["contrasts"]["AWARE_minus_LINEAR"], summary["contrasts"]["AWARE_minus_FLAT_MSA"]
    summary["gates"] = {
        "H1": h1["mean"] >= 0.25 and h1["excludes_0"],
        "H2": h2["mean"] >= 0.10 and h2["excludes_0"],
        "H3": summary["H3_token_ratio"] <= 1.25,
    }
    (OUT / f"{rhyme_key}_{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)
    return summary


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=24)
    ap.add_argument("--rhyme", choices=["e10", "e11", "both"], default="both")
    ap.add_argument("--build-only", action="store_true")
    ap.add_argument("--dtype", default="float32")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)

    e10 = load_e10(a.n) if a.rhyme in ("e10", "both") else []
    e11 = load_e11(a.n) if a.rhyme in ("e11", "both") else []
    (OUT / "e10_scenarios.json").write_text(json.dumps(e10, indent=2))
    e11_meta=[]
    for sc in e11:
        meta={k:v for k,v in sc.items() if k!='recent'}
        meta['recent_len']={x:len(y) for x,y in sc['recent'].items()}
        e11_meta.append(meta)
    (OUT / "e11_scenarios.json").write_text(json.dumps(e11_meta, indent=2))
    print(f"built E10={len(e10)} E11={len(e11)}", flush=True)
    if a.build_only:
        return

    be = Groq(a.model) if a.backend == "groq" else Local(a.model, a.dtype)
    if e10:
        run_suite(be, e10, pack_e10, "E10", a.model)
    if e11:
        run_suite(be, e11, pack_e11, "E11", a.model)


if __name__ == "__main__":
    main()
