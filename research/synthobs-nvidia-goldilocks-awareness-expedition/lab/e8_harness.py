#!/usr/bin/env python3
"""E8 harness — matched-facts awareness board vs flat dump vs silos.
Protocol: ../E8_PROTOCOL.md (pre-registered before any results).
GROQ_API_KEY from environment only; never written to receipts."""
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
from collections import deque
from pathlib import Path

SEED = 20261116
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "e8"
OPTIONS = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"]
ROLES = ["Scout", "Planner", "Auditor"]

ROLE_SYS = (
    "You are {role} on a three-agent dispatch team (Scout, Planner, Auditor). "
    "Use only the CONTEXT. Obey hard constraints. "
    "When the round asks for a commitment, end with exactly one line COMMIT: <OPTION>. "
    "When the round asks for a final answer, end with exactly one line SOLUTION: <OPTION> or SOLUTION: SAFE. "
    "You may write one short rationale line before that."
)


def est(text: str) -> int:
    return max(1, math.ceil(len(text) / 4))


# ---------- scenario generator ----------
def make_scenario(sid: int) -> dict:
    rng = random.Random(SEED + sid * 97)
    opts = list(OPTIONS)
    # attributes
    costs = {o: rng.randrange(20, 120, 5) for o in opts}
    caps = {o: rng.choice([10, 20, 30, 40, 50]) for o in opts}
    routes = {o: rng.choice(["north", "south", "east", "west"]) for o in opts}
    banned = rng.choice(opts)
    budget = rng.choice([80, 90, 100, 110])
    need_cap = rng.choice([20, 30])
    # legal = not banned, cost<=budget, cap>=need
    legal = [o for o in opts if o != banned and costs[o] <= budget and caps[o] >= need_cap]
    if len(legal) < 2:
        # force repair
        banned = opts[-1]
        for o in opts[:-1]:
            costs[o] = min(costs[o], budget)
            caps[o] = max(caps[o], need_cap)
        legal = [o for o in opts if o != banned and costs[o] <= budget and caps[o] >= need_cap]
    legal_sorted = sorted(legal, key=lambda o: (costs[o], o))
    commit_gold = legal_sorted[0]
    second = legal_sorted[1] if len(legal_sorted) > 1 else "SAFE"
    # event type depends on commitment
    event_kind = rng.choice(["block_switch", "keep_if_second", "force_safe_if_banned_cost"])
    if event_kind == "block_switch":
        event = (
            f"EVENT: Route for {commit_gold} is blocked after commitment. "
            f"If COMMIT was {commit_gold}, switch to the next-cheapest still-legal option "
            f"(cost ≤ {budget}, capacity ≥ {need_cap}, not {banned}). "
            f"If COMMIT was anything else, keep that COMMIT. If nothing legal remains, SOLUTION: SAFE."
        )
        final_gold = second if second != commit_gold else "SAFE"
        # second might equal commit only if one legal — handled
        if len(legal_sorted) < 2:
            final_gold = "SAFE"
        else:
            final_gold = legal_sorted[1]
    elif event_kind == "keep_if_second":
        # If they wrongly committed to second-cheapest, keep it; if correct cheapest, upgrade? No —
        # "storm favors the second-cheapest legal; if COMMIT was that option keep it; else move to it."
        target = legal_sorted[1] if len(legal_sorted) > 1 else commit_gold
        event = (
            f"EVENT: Weather favors {target}. If COMMIT was {target}, keep it. "
            f"Otherwise change to {target}. Still obey bans and budget."
        )
        final_gold = target
    else:
        event = (
            f"EVENT: Compliance audit. If COMMIT violates ban={banned} or budget={budget} "
            f"or capacity<{need_cap}, emit SOLUTION: SAFE. Otherwise keep the COMMIT as SOLUTION."
        )
        final_gold = commit_gold  # commit_gold is always legal by construction

    facts = []
    for o in opts:
        facts.append(
            {
                "id": f"F-{o}",
                "text": f"Option {o}: cost={costs[o]}, capacity={caps[o]}, route={routes[o]}.",
            }
        )
    facts.append({"id": "F-BAN", "text": f"Hard ban: option {banned} is forbidden."})
    facts.append({"id": "F-BUD", "text": f"Hard budget: total cost must be ≤ {budget}."})
    facts.append({"id": "F-CAP", "text": f"Hard capacity: option capacity must be ≥ {need_cap}."})
    # distractor chatter lines (same for FLAT history injection)
    chatter = [
        f"NOTE: {rng.choice(opts)} was discussed in a prior drill and rejected for unrelated reasons.",
        f"NOTE: Route {rng.choice(['north','south'])} had delays last season; not a hard constraint.",
        f"NOTE: A spectator suggests picking the most expensive option for prestige; ignore prestige.",
        f"NOTE: Capacity {need_cap - 10} would be illegal under the hard capacity rule.",
    ]
    goal = "Select one dispatch option that satisfies all hard constraints; adapt to the EVENT."
    constraints = [
        f"Never select banned option {banned}.",
        f"Cost must be ≤ {budget}.",
        f"Capacity must be ≥ {need_cap}.",
        "Emit COMMIT in round 1 and SOLUTION in round 2.",
    ]
    return {
        "id": f"e8-{sid}",
        "sid": sid,
        "goal": goal,
        "constraints": constraints,
        "facts": facts,
        "costs": costs,
        "caps": caps,
        "banned": banned,
        "budget": budget,
        "need_cap": need_cap,
        "event": event,
        "event_kind": event_kind,
        "commit_gold": commit_gold,
        "final_gold": final_gold,
        "legal": legal_sorted,
        "chatter": chatter,
    }


def is_legal(sc, opt: str) -> bool:
    if opt == "SAFE":
        return True
    if opt not in sc["costs"]:
        return False
    if opt == sc["banned"]:
        return False
    if sc["costs"][opt] > sc["budget"]:
        return False
    if sc["caps"][opt] < sc["need_cap"]:
        return False
    return True


# ---------- backends ----------
class Groq:
    def __init__(self, model, tpm=6500):
        self.model = model
        self.tpm = tpm
        self.key = os.environ["GROQ_API_KEY"]
        self.win = deque()
        self.remaining_requests = None

    def _wait(self, need):
        while True:
            now = time.time()
            while self.win and now - self.win[0][0] > 60:
                self.win.popleft()
            if sum(t for _, t in self.win) + need <= self.tpm:
                return
            time.sleep(1.0)

    def chat(self, system, user, max_tokens=400):
        reserve = est(system + user) + 200
        for attempt in range(10):
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
            if "gpt-oss" in self.model:
                body["reasoning_effort"] = "low"
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode(),
                headers={
                    "content-type": "application/json",
                    "authorization": f"Bearer {self.key}",
                    "user-agent": "e8-harness/1",
                },
            )
            slot = [time.time(), reserve]
            self.win.append(slot)
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    data = json.loads(r.read())
                    self.remaining_requests = r.headers.get("x-ratelimit-remaining-requests")
                u = data.get("usage", {})
                slot[1] = u.get("total_tokens", reserve)
                text = (data["choices"][0]["message"].get("content") or "").strip()
                return text, u.get("prompt_tokens", est(system + user)), u.get("total_tokens", reserve)
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:400]
                slot[1] = 0
                if e.code == 429:
                    if "per day" in msg.lower() or "tpd" in msg.lower() or "rpd" in msg.lower():
                        raise SystemExit("DAILY LIMIT: " + msg)
                    wait = float(e.headers.get("retry-after") or 4 * (attempt + 1))
                    time.sleep(wait)
                    continue
                if e.code >= 500:
                    time.sleep(2 * (attempt + 1))
                    continue
                raise RuntimeError(f"Groq {e.code}: {msg}")
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
        return text, n_in, n_in + (out.shape[1] - n_in)


# ---------- parsing ----------
def parse_tag(text: str, tag: str):
    m = re.search(rf"{tag}:\s*([A-Za-z0-9_\-]+)", text or "", flags=re.I)
    return m.group(1).upper() if m else None


# ---------- context packers ----------
def shard_facts(facts, role_i, n=3):
    # round-robin shards so each agent misses some option lines
    return [f for i, f in enumerate(facts) if i % n == role_i]


def pack_silo(sc, role_i, round_i, messages, commit):
    facts = shard_facts(sc["facts"], role_i)
    lines = [
        f"GOAL: {sc['goal']}",
        "CONSTRAINTS:",
        *[f"- {c}" for c in sc["constraints"]],
        "YOUR PRIVATE FACTS:",
        *[f"- {f['text']}" for f in facts],
        "PRIOR MESSAGES:",
        *(messages[-12:] or ["(none)"]),
    ]
    if round_i == 1:
        lines.append("ROUND 1 TASK: Agree a legal COMMIT. Planner should finalize COMMIT: <OPTION>.")
    else:
        lines += [f"KNOWN COMMIT (may be incomplete): {commit or 'unknown'}", sc["event"], "ROUND 2 TASK: Emit SOLUTION: <OPTION> or SOLUTION: SAFE. Auditor should finalize."]
    return "\n".join(lines)


def pack_flat(sc, round_i, transcript, commit):
    # Same facts/event/commitment string as AWARE — unstructured blob + chatter
    blob = [
        sc["goal"],
        *sc["constraints"],
        *[f["text"] for f in sc["facts"]],
        *sc["chatter"],
    ]
    if commit:
        blob.append(f"someone said COMMIT: {commit} earlier in the transcript")
    if round_i == 2:
        blob.append(sc["event"])
    blob += transcript[-16:]
    random.Random(hash(tuple(blob)) % (2**32)).shuffle(blob)  # unstructured order
    # re-stable shuffle per content
    rng = random.Random(SEED + 11 * round_i + len(transcript))
    ordered = list(blob)
    rng.shuffle(ordered)
    head = "ROUND 1: finalize COMMIT: <OPTION>." if round_i == 1 else "ROUND 2: finalize SOLUTION: <OPTION> or SOLUTION: SAFE."
    return head + "\n\nCONTEXT BLOB:\n" + "\n".join(f"* {x}" for x in ordered)


def pack_aware(sc, round_i, board):
    lines = [
        "SHARED AWARENESS BOARD",
        f"GOAL: {board['goal']}",
        "CONSTRAINTS:",
        *[f"- {c}" for c in board["constraints"]],
        "COMMITMENTS:",
        *([f"- {c}" for c in board["commitments"]] or ["- (none)"]),
        "FACTS:",
        *[f"- {f}" for f in board["facts"]],
        "HISTORY:",
        *([f"- {h}" for h in board["history"][-8:]] or ["- (none)"]),
    ]
    if round_i == 2:
        lines += ["EVENT:", board["event"], "ROUND 2 TASK: Update board if needed. Emit SOLUTION: <OPTION> or SOLUTION: SAFE. Auditor finalizes."]
    else:
        lines.append("ROUND 1 TASK: Write COMMIT: <OPTION> for the cheapest legal option. Planner finalizes.")
    return "\n".join(lines)


# ---------- arm runners ----------
def run_team(be, sc, arm: str):
    messages = []
    transcript = []
    commit = None
    solution = None
    tokens = 0
    calls = 0
    board = {
        "goal": sc["goal"],
        "constraints": list(sc["constraints"]),
        "commitments": [],
        "facts": [f["text"] for f in sc["facts"]],
        "history": [],
        "event": sc["event"],
    }
    rounds_detail = []
    for round_i in (1, 2):
        round_msgs = []
        for ri, role in enumerate(ROLES):
            if arm == "SILO":
                ctx = pack_silo(sc, ri, round_i, messages, commit)
            elif arm == "FLAT":
                ctx = pack_flat(sc, round_i, transcript, commit)
            else:
                ctx = pack_aware(sc, round_i, board)
            sys = ROLE_SYS.format(role=role)
            user = f"CONTEXT:\n{ctx}"
            text, _, tot = be.chat(sys, user)
            tokens += tot
            calls += 1
            line = f"{role}: {text.replace(chr(10), ' / ')}"
            round_msgs.append(line)
            messages.append(line)
            transcript.append(line)
            c = parse_tag(text, "COMMIT")
            s = parse_tag(text, "SOLUTION")
            if c:
                commit = c
                if arm == "AWARE" and f"COMMIT: {c}" not in board["commitments"]:
                    board["commitments"] = [f"COMMIT: {c} (by {role})"]
            if s:
                solution = s
            if arm == "AWARE":
                board["history"].append(f"R{round_i} {role}: {text[:160].replace(chr(10),' ')}")
        # after round roles, if Planner/Auditor didn't set tags, try any
        if round_i == 1 and not commit:
            for m in round_msgs:
                c = parse_tag(m, "COMMIT")
                if c:
                    commit = c
                    break
        if round_i == 2 and not solution:
            for m in round_msgs:
                s = parse_tag(m, "SOLUTION")
                if s:
                    solution = s
                    break
        rounds_detail.append({"round": round_i, "messages": round_msgs, "commit": commit, "solution": solution})
        if arm == "AWARE" and round_i == 1 and commit:
            board["commitments"] = [f"COMMIT: {commit}"]
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
        "rounds": rounds_detail,
    }


def summarize(rows, arm):
    xs = [r["arms"][arm] for r in rows]
    n = len(xs) or 1
    return {
        "n": len(xs),
        "valid_rate": round(sum(x["valid"] for x in xs) / n, 4),
        "commit_rate": round(sum(x["commit_ok"] for x in xs) / n, 4),
        "solution_rate": round(sum(x["solution_ok"] for x in xs) / n, 4),
        "mean_tokens": round(sum(x["tokens"] for x in xs) / n, 1),
    }


def bootstrap_diff(rows, a, b, key="valid", n=10000, seed=SEED):
    rng = random.Random(seed)
    diffs = []
    nq = len(rows)
    for _ in range(n):
        samp = [rows[rng.randrange(nq)] for _ in range(nq)]
        va = sum(r["arms"][a][key] for r in samp) / nq
        vb = sum(r["arms"][b][key] for r in samp) / nq
        diffs.append(va - vb)
    diffs.sort()
    mean = sum(diffs) / len(diffs)
    lo = diffs[int(0.025 * len(diffs))]
    hi = diffs[int(0.975 * len(diffs))]
    return {"mean": round(mean, 4), "lo": round(lo, 4), "hi": round(hi, 4), "excludes_0": not (lo <= 0 <= hi)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--dtype", default="float32")
    ap.add_argument("--min-remaining-requests", type=int, default=20)
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
        arms = {}
        for arm in ("SILO", "FLAT", "AWARE"):
            arms[arm] = run_team(be, sc, arm)
        row = {
            "id": sc["id"],
            "sid": sid,
            "commit_gold": sc["commit_gold"],
            "final_gold": sc["final_gold"],
            "event_kind": sc["event_kind"],
            "banned": sc["banned"],
            "budget": sc["budget"],
            "arms": arms,
        }
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        snap = {k: int(v["valid"]) for k, v in arms.items()}
        print(
            f"[{a.model}] {sid+1}/{a.n} valid={snap} gold={sc['final_gold']} remaining={getattr(be,'remaining_requests',None)}",
            flush=True,
        )
        rr = getattr(be, "remaining_requests", None)
        if rr is not None and str(rr).isdigit() and int(rr) < a.min_remaining_requests:
            print("stopping: request headroom low", flush=True)
            break

    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()]
    summary = {
        "model": a.model,
        "protocol": "E8_PROTOCOL.md",
        "n": len(rows),
        "arms": {arm: summarize(rows, arm) for arm in ("SILO", "FLAT", "AWARE")},
        "contrasts": {
            "AWARE_minus_SILO_valid": bootstrap_diff(rows, "AWARE", "SILO") if rows else None,
            "AWARE_minus_FLAT_valid": bootstrap_diff(rows, "AWARE", "FLAT") if rows else None,
        },
    }
    if rows:
        summary["H3_token_ratio_AWARE_over_FLAT"] = round(
            summary["arms"]["AWARE"]["mean_tokens"] / max(1e-9, summary["arms"]["FLAT"]["mean_tokens"]), 4
        )
    (OUT / f"{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
