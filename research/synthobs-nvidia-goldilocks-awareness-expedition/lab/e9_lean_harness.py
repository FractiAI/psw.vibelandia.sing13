#!/usr/bin/env python3
"""E9 lean — protein-folding rhyme: linear vs flat MSA vs relational awareness.
Protocol: ../E9_PROTOCOL.md (pre-registered). GROQ_API_KEY from env only."""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict, deque
from pathlib import Path

SEED = 20261117
L = 20
M = 12
K = 4
MIN_SEP = 6
ALPH = list("ACDEFGHIKL")[:8]
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "e9_lean"

SYS = (
    "You solve a structure question using only CONTEXT. "
    "Reply with exactly one line SOLUTION: followed by hyphen-separated integers "
    "(e.g. SOLUTION: 3-17 or SOLUTION: 2-9-14). No other text."
)


def est(t: str) -> int:
    return max(1, math.ceil(len(t) / 4))


# ---------- scenario ----------
def make_scenario(sid: int) -> dict:
    rng = random.Random(SEED + sid * 131)
    seq = [rng.choice(ALPH) for _ in range(L)]
    contacts = set()
    while len(contacts) < K:
        i, j = rng.randrange(L), rng.randrange(L)
        if abs(i - j) >= MIN_SEP:
            contacts.add(tuple(sorted((i, j))))
    contacts = sorted(contacts)

    # MSA: independent columns by default; plant perfect co-variation on true contacts only.
    msa = [[rng.choice(ALPH) for _ in range(L)] for _ in range(M)]
    msa[0] = list(seq)
    contact_set = set(contacts)
    for i, j in contacts:
        for r in range(M):
            # identical symbols on contact columns → coupling 1.0
            sym = ALPH[(r + i + j) % len(ALPH)]
            msa[r][i] = sym
            msa[r][j] = sym
    # re-assert non-contact long-range columns are not accidentally identical
    for a in range(L):
        for b in range(a + MIN_SEP, L):
            if (a, b) in contact_set:
                continue
            for r in range(M):
                if msa[r][a] == msa[r][b]:
                    msa[r][b] = ALPH[(ALPH.index(msa[r][b]) + 1 + r) % len(ALPH)]

    def couple(a, b):
        agree = sum(1 for r in range(M) if msa[r][a] == msa[r][b])
        return agree / M

    scores = {}
    for a in range(L):
        for b in range(a + MIN_SEP, L):
            scores[(a, b)] = round(couple(a, b), 3)

    # question: partner of a contact endpoint
    qi, qj = contacts[sid % len(contacts)]
    # decoy: nearest sequence neighbors
    decoys = [x for x in (qi - 1, qi + 1, qj - 1, qj + 1) if 0 <= x < L]
    gold = f"{qi}-{qj}"
    question = (
        f"Position {qi} has exactly one long-range structural partner "
        f"(sequence separation ≥ {MIN_SEP}). Report that pair."
    )
    return {
        "id": f"e9-{sid}",
        "sid": sid,
        "seq": "".join(seq),
        "msa": ["".join(row) for row in msa],
        "contacts": contacts,
        "scores": scores,
        "qi": qi,
        "question": question,
        "gold": gold,
        "decoys": decoys,
    }


def top_couplings(scores, n=8):
    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:n]


def pack_linear(sc):
    i = sc["qi"]
    local = []
    for p in range(max(0, i - 2), min(L, i + 3)):
        local.append(f"pos {p}: {sc['seq'][p]}")
    return (
        f"QUESTION: {sc['question']}\n"
        f"PRIMARY SEQUENCE: {sc['seq']}\n"
        f"LOCAL WINDOW: {', '.join(local)}\n"
        f"NOTE: Only local sequence is available. Neighbors may look relevant but are not structural partners."
    )


def pack_flat_msa(sc):
    rows = "\n".join(f"H{r}: {row}" for r, row in enumerate(sc["msa"]))
    return (
        f"QUESTION: {sc['question']}\n"
        f"PRIMARY SEQUENCE: {sc['seq']}\n"
        f"HOMOLOG ROWS (unordered dump):\n{rows}\n"
        f"NOTE: Couplings are not precomputed; infer if you can."
    )


def pack_aware(sc):
    qi = sc["qi"]
    # Rank long-range pairs that involve the query position (fold rhyme: contacts at qi).
    involving = [((a, b), s) for (a, b), s in sc["scores"].items() if qi in (a, b)]
    involving.sort(key=lambda kv: (-kv[1], kv[0]))
    global_top = top_couplings(sc["scores"], n=6)
    lines = [f"{a}-{b}: coupling={s}" for (a, b), s in involving[:8]]
    glob = [f"{a}-{b}: coupling={s}" for (a, b), s in global_top]
    return (
        f"QUESTION: {sc['question']}\n"
        f"PRIMARY SEQUENCE: {sc['seq']}\n"
        f"RELATIONAL AWARENESS BOARD — couplings involving position {qi} (ranked):\n"
        + "\n".join(lines)
        + "\nGLOBAL TOP COUPLINGS:\n"
        + "\n".join(glob)
        + "\nNOTE: The structural partner is the highest-coupling long-range pair involving the query position."
    )


def parse_solution(text: str):
    m = re.search(r"SOLUTION:\s*([0-9]+(?:\s*-\s*[0-9]+)*)", text or "", flags=re.I)
    if not m:
        return None
    parts = [int(x) for x in re.findall(r"[0-9]+", m.group(1))]
    if len(parts) < 2:
        return None
    # normalize pair
    a, b = sorted(parts[:2])
    return f"{a}-{b}"


def score(pred, gold):
    if not pred:
        return {"exact": False, "f1": 0.0}
    exact = pred == gold
    # edge F1 for single pair
    return {"exact": exact, "f1": 1.0 if exact else 0.0}


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
                    "user-agent": "e9-lean/1",
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
                msg = e.read().decode()[:500]
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


def run_arm(be, sc, arm):
    if arm == "LINEAR":
        ctx = pack_linear(sc)
    elif arm == "FLAT_MSA":
        ctx = pack_flat_msa(sc)
    else:
        ctx = pack_aware(sc)
    text, tok = be.chat(SYS, "CONTEXT:\n" + ctx)
    pred = parse_solution(text)
    scb = score(pred, sc["gold"])
    return {
        "arm": arm,
        "pred": pred,
        "text": text,
        "exact": scb["exact"],
        "f1": scb["f1"],
        "tokens": tok,
    }


def bootstrap_diff(rows, a, b, key="exact", n=10000, seed=SEED):
    rng = random.Random(seed)
    nq = len(rows)
    diffs = []
    for _ in range(n):
        samp = [rows[rng.randrange(nq)] for _ in range(nq)]
        diffs.append(sum(r["arms"][a][key] - r["arms"][b][key] for r in samp) / nq)
    diffs.sort()
    mean = sum(diffs) / len(diffs)
    lo, hi = diffs[int(0.025 * len(diffs))], diffs[int(0.975 * len(diffs))]
    return {"mean": round(mean, 4), "lo": round(lo, 4), "hi": round(hi, 4), "excludes_0": not (lo <= 0 <= hi)}


def summarize(rows, arm):
    xs = [r["arms"][arm] for r in rows]
    n = len(xs) or 1
    return {
        "n": len(xs),
        "exact_rate": round(sum(x["exact"] for x in xs) / n, 4),
        "mean_f1": round(sum(x["f1"] for x in xs) / n, 4),
        "mean_tokens": round(sum(x["tokens"] for x in xs) / n, 1),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--dtype", default="float32")
    a = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^A-Za-z0-9]+", "_", a.model).strip("_")
    path = OUT / f"{slug}.jsonl"
    done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()} if path.exists() else set()

    be = Groq(a.model) if a.backend == "groq" else Local(a.model, a.dtype)
    for sid in range(a.n):
        sc = make_scenario(sid)
        if sc["id"] in done:
            continue
        try:
            arms = {arm: run_arm(be, sc, arm) for arm in ("LINEAR", "FLAT_MSA", "AWARE")}
        except SystemExit as e:
            print(str(e), flush=True)
            break
        row = {"id": sc["id"], "sid": sid, "gold": sc["gold"], "qi": sc["qi"], "arms": arms}
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[{a.model}] {sid+1}/{a.n} exact="
            + str({k: int(v["exact"]) for k, v in arms.items()})
            + f" tok={sum(v['tokens'] for v in arms.values())} remaining={getattr(be,'remaining_requests',None)}",
            flush=True,
        )

    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()] if path.exists() else []
    summary = {
        "model": a.model,
        "protocol": "E9_PROTOCOL.md",
        "rhyme": "protein-folding long-range contacts → relational awareness for intelligence",
        "n": len(rows),
        "arms": {arm: summarize(rows, arm) for arm in ("LINEAR", "FLAT_MSA", "AWARE")} if rows else {},
        "contrasts": {
            "AWARE_minus_LINEAR": bootstrap_diff(rows, "AWARE", "LINEAR") if rows else None,
            "AWARE_minus_FLAT_MSA": bootstrap_diff(rows, "AWARE", "FLAT_MSA") if rows else None,
            "FLAT_MSA_minus_LINEAR": bootstrap_diff(rows, "FLAT_MSA", "LINEAR") if rows else None,
        },
    }
    if rows:
        summary["H3_token_ratio_AWARE_over_FLAT"] = round(
            summary["arms"]["AWARE"]["mean_tokens"] / max(1e-9, summary["arms"]["FLAT_MSA"]["mean_tokens"]), 4
        )
        h1 = summary["contrasts"]["AWARE_minus_LINEAR"]
        h2 = summary["contrasts"]["AWARE_minus_FLAT_MSA"]
        flat_vs_lin = summary["contrasts"]["FLAT_MSA_minus_LINEAR"]
        summary["gates"] = {
            "H1": bool(h1 and h1["mean"] >= 0.25 and h1["excludes_0"]),
            "H2": bool(h2 and h2["mean"] >= 0.10 and h2["excludes_0"]),
            "H3": summary["H3_token_ratio_AWARE_over_FLAT"] <= 1.25,
            "FLAT_extracts_pattern": bool(flat_vs_lin and flat_vs_lin["mean"] >= 0.25 and flat_vs_lin["excludes_0"]),
        }
    (OUT / f"{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
