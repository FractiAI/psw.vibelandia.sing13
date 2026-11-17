#!/usr/bin/env python3
"""E8 lean harness — same claim, ~6 calls/scenario for daily token caps.
Protocol: ../E8_PROTOCOL.md + ../E8_LEAN_AMENDMENT.md (both pre-registered).
GROQ_API_KEY from environment only."""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import sys
import time
import urllib.error
import urllib.request
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from e8_harness import (  # noqa: E402
    SEED,
    bootstrap_diff,
    is_legal,
    make_scenario,
    parse_tag,
    summarize,
)

OUT = HERE.parent / "data" / "e8_lean"
SYS = (
    "You are a dispatch agent. Use only CONTEXT. Obey hard constraints. "
    "Round 1: end with exactly one line COMMIT: <OPTION>. "
    "Round 2: end with exactly one line SOLUTION: <OPTION> or SOLUTION: SAFE. "
    "At most one short rationale line before the tag line."
)


def est(text: str) -> int:
    return max(1, math.ceil(len(text) / 4))


class Groq:
    def __init__(self, model, tpm=7000):
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

    def chat(self, system, user, max_tokens=48):
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
            # Avoid gpt-oss reasoning tokens — they dominate TPD burn.
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode(),
                headers={
                    "content-type": "application/json",
                    "authorization": f"Bearer {self.key}",
                    "user-agent": "e8-lean/1",
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
                return text, u.get("prompt_tokens", est(system + user)), u.get("total_tokens", reserve)
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:500]
                slot[1] = 0
                low = msg.lower()
                if e.code == 429 and ("per day" in low or "tpd" in low or "rpd" in low or "tokens per day" in low):
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
        self.stopped_for_day = False

    def chat(self, system, user, max_tokens=48):
        msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        ids = self.tokz.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True)
        n_in = ids["input_ids"].shape[1]
        with self.torch.no_grad():
            out = self.model.generate(**ids, max_new_tokens=min(max_tokens, 48), do_sample=False)
        text = self.tokz.decode(out[0][n_in:], skip_special_tokens=True).strip()
        return text, n_in, n_in + (out.shape[1] - n_in)


def pack_silo(sc, round_i, commit, rng):
    option_facts = [f for f in sc["facts"] if f["id"].startswith("F-") and f["id"] not in ("F-BAN", "F-BUD", "F-CAP")]
    rules = [f for f in sc["facts"] if f["id"] in ("F-BAN", "F-BUD", "F-CAP")]
    shard = [f for i, f in enumerate(option_facts) if i % 3 == rng.randrange(3)]
    # fix shard choice stable per scenario
    shard = [f for i, f in enumerate(option_facts) if i % 3 == (sc["sid"] % 3)]
    lines = [
        f"GOAL: {sc['goal']}",
        "HARD RULES:",
        *[f"- {f['text']}" for f in rules],
        "YOUR PARTIAL OPTION FACTS (other options unknown):",
        *[f"- {f['text']}" for f in shard],
        f"DISTRACTOR: {sc['chatter'][0]}",
    ]
    if round_i == 1:
        lines.append("TASK: Emit COMMIT: <OPTION> for the cheapest legal option you can justify.")
    else:
        lines += [f"PRIOR COMMIT: {commit or 'unknown'}", sc["event"], "TASK: Emit SOLUTION: <OPTION> or SOLUTION: SAFE."]
    return "\n".join(lines)


def pack_flat(sc, round_i, commit):
    items = [sc["goal"], *sc["constraints"], *[f["text"] for f in sc["facts"]], sc["chatter"][0]]
    if commit:
        items.append(f"earlier note said COMMIT: {commit}")
    if round_i == 2:
        items.append(sc["event"])
    rng = random.Random(SEED + 13 * round_i + sc["sid"])
    rng.shuffle(items)
    head = "TASK: Emit COMMIT: <OPTION>." if round_i == 1 else "TASK: Emit SOLUTION: <OPTION> or SOLUTION: SAFE."
    return head + "\nCONTEXT BLOB:\n" + "\n".join(f"* {x}" for x in items)


def pack_aware(sc, round_i, commit):
    lines = [
        "SHARED AWARENESS BOARD",
        f"GOAL: {sc['goal']}",
        "CONSTRAINTS:",
        *[f"- {c}" for c in sc["constraints"]],
        "COMMITMENTS:",
        f"- COMMIT: {commit}" if commit else "- (none)",
        "FACTS:",
        *[f"- {f['text']}" for f in sc["facts"]],
    ]
    if round_i == 1:
        lines.append("TASK: Emit COMMIT: <OPTION> (cheapest legal).")
    else:
        lines += ["EVENT:", sc["event"], "TASK: Emit SOLUTION: <OPTION> or SOLUTION: SAFE."]
    return "\n".join(lines)


def run_arm(be, sc, arm):
    rng = random.Random(SEED + sc["sid"])
    commit = None
    solution = None
    tokens = 0
    calls = 0
    detail = []
    for round_i in (1, 2):
        if arm == "SILO":
            ctx = pack_silo(sc, round_i, commit, rng)
        elif arm == "FLAT":
            ctx = pack_flat(sc, round_i, commit)
        else:
            ctx = pack_aware(sc, round_i, commit)
        text, _, tot = be.chat(SYS, "CONTEXT:\n" + ctx, max_tokens=48)
        tokens += tot
        calls += 1
        c = parse_tag(text, "COMMIT")
        s = parse_tag(text, "SOLUTION")
        if round_i == 1 and c:
            commit = c
        if round_i == 2 and s:
            solution = s
        detail.append({"round": round_i, "text": text, "commit": commit, "solution": solution})
    valid = bool(solution) and solution == sc["final_gold"] and is_legal(sc, solution)
    return {
        "arm": arm,
        "commit": commit,
        "solution": solution,
        "commit_ok": commit == sc["commit_gold"],
        "solution_ok": solution == sc["final_gold"],
        "valid": valid,
        "legal_solution": is_legal(sc, solution) if solution else False,
        "tokens": tokens,
        "calls": calls,
        "rounds": detail,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=30)
    ap.add_argument("--dtype", default="float32")
    a = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^A-Za-z0-9]+", "_", a.model).strip("_")
    path = OUT / f"{slug}.jsonl"
    done = set()
    if path.exists():
        done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()}

    be = Groq(a.model) if a.backend == "groq" else Local(a.model, a.dtype)
    for sid in range(a.n):
        sc = make_scenario(sid)
        if sc["id"] in done:
            continue
        try:
            arms = {arm: run_arm(be, sc, arm) for arm in ("SILO", "FLAT", "AWARE")}
        except SystemExit as e:
            print(str(e), flush=True)
            break
        row = {
            "id": sc["id"],
            "sid": sid,
            "lean": True,
            "commit_gold": sc["commit_gold"],
            "final_gold": sc["final_gold"],
            "event_kind": sc["event_kind"],
            "arms": arms,
        }
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[{a.model}] {sid+1}/{a.n} valid={{k:int(v['valid']) for k,v in arms.items()}} "
            f"tok={sum(v['tokens'] for v in arms.values())} remaining={getattr(be,'remaining_requests',None)}".replace(
                "{k:int(v['valid']) for k,v in arms.items()}",
                str({k: int(v["valid"]) for k, v in arms.items()}),
            ),
            flush=True,
        )

    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()] if path.exists() else []
    summary = {
        "model": a.model,
        "protocol": "E8_PROTOCOL.md + E8_LEAN_AMENDMENT.md",
        "lean": True,
        "n": len(rows),
        "arms": {arm: summarize(rows, arm) for arm in ("SILO", "FLAT", "AWARE")} if rows else {},
        "contrasts": {
            "AWARE_minus_SILO_valid": bootstrap_diff(rows, "AWARE", "SILO") if rows else None,
            "AWARE_minus_FLAT_valid": bootstrap_diff(rows, "AWARE", "FLAT") if rows else None,
        },
    }
    if rows:
        summary["H3_token_ratio_AWARE_over_FLAT"] = round(
            summary["arms"]["AWARE"]["mean_tokens"] / max(1e-9, summary["arms"]["FLAT"]["mean_tokens"]), 4
        )
        h1 = summary["contrasts"]["AWARE_minus_SILO_valid"]
        h2 = summary["contrasts"]["AWARE_minus_FLAT_valid"]
        summary["gates"] = {
            "H1": bool(h1 and h1["mean"] >= 0.15 and h1["excludes_0"]),
            "H2": bool(h2 and h2["mean"] >= 0.10 and h2["excludes_0"]),
            "H3": summary["H3_token_ratio_AWARE_over_FLAT"] <= 1.25,
        }
    (OUT / f"{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
