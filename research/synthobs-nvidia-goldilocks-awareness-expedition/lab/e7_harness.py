#!/usr/bin/env python3
"""E7 harness: shared world model vs silo / RAG / random on HotpotQA (distractor).
Protocol: ../E7_PROTOCOL.md (pre-registered). Keys come from the environment only (GROQ_API_KEY)."""
import argparse, difflib, json, math, os, random, re, string, sys, time, urllib.request, urllib.error
from collections import Counter, deque
from pathlib import Path

SEED = 20261116
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "e7"

ANSWER_SYS = "Answer the question using only the CONTEXT. Reply with only the short answer, no explanation."
SILO_AGENT_SYS = "You are one member of a team. From your private CONTEXT, write one short line of facts relevant to the QUESTION, or NONE if nothing is relevant. No explanation."
SILO_COORD_SYS = "Answer the question using only the team MESSAGES. Reply with only the short answer, no explanation."
SELECT_SYS = ("You coordinate a team that shares an INDEX of documents (title: first sentence). Given the QUESTION, "
              "list up to 3 document titles whose full text is needed to answer it. Reply with only the titles, one per line, copied exactly.")


def est(text):
    return max(1, math.ceil(len(text) / 4))


# ---------- data ----------
def load_questions(n):
    from huggingface_hub import hf_hub_download
    import pyarrow.parquet as pq
    p = hf_hub_download("hotpotqa/hotpot_qa", "distractor/validation/0000.parquet", repo_type="dataset", revision="refs/convert/parquet")
    rows = pq.read_table(p).to_pylist()
    rows = [r for r in rows if r["answer"].strip().lower() not in ("yes", "no")]
    rng = random.Random(SEED)
    rng.shuffle(rows)
    out = []
    for r in rows[:n]:
        titles = r["context"]["title"]
        sents = r["context"]["sentences"]
        paras = [{"title": t, "sents": list(s)} for t, s in zip(titles, sents)]
        out.append({"id": r["id"], "question": r["question"], "answer": r["answer"], "type": r["type"], "level": r["level"], "paras": paras})
    return out


def ptext(p):
    return f"[{p['title']}] " + " ".join(s.strip() for s in p["sents"])


def pindex(p):
    return f"{p['title']}: {p['sents'][0].strip() if p['sents'] else ''}"


# ---------- scoring ----------
def norm(s):
    s = s.lower()
    s = "".join(ch for ch in s if ch not in set(string.punctuation))
    s = re.sub(r"\b(a|an|the)\b", " ", s)
    return " ".join(s.split())


def f1_em(pred, gold):
    p, g = norm(pred).split(), norm(gold).split()
    em = float(norm(pred) == norm(gold))
    common = Counter(p) & Counter(g)
    ns = sum(common.values())
    if ns == 0:
        return 0.0, em
    pr, rc = ns / len(p), ns / len(g)
    return 2 * pr * rc / (pr + rc), em


# ---------- BM25 ----------
def tok(s):
    return re.findall(r"[a-z0-9]+", s.lower())


def bm25_rank(question, paras, k1=1.5, b=0.75):
    docs = [tok(ptext(p)) for p in paras]
    avg = sum(len(d) for d in docs) / len(docs)
    df = Counter()
    for d in docs:
        for w in set(d):
            df[w] += 1
    N = len(docs)
    q = tok(question)
    scores = []
    for d in docs:
        tf = Counter(d)
        sc = 0.0
        for w in q:
            if w not in tf:
                continue
            idf = math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5))
            sc += idf * tf[w] * (k1 + 1) / (tf[w] + k1 * (1 - b + b * len(d) / avg))
        scores.append(sc)
    return sorted(range(N), key=lambda i: -scores[i])


# ---------- backends ----------
class Groq:
    def __init__(self, model, tpm=7000):
        self.model, self.tpm = model, tpm
        self.key = os.environ["GROQ_API_KEY"]
        self.win = deque()
        self.calls = 0
        self.remaining_requests = None

    def _wait(self, need):
        while True:
            now = time.time()
            while self.win and now - self.win[0][0] > 60:
                self.win.popleft()
            if sum(t for _, t in self.win) + need <= self.tpm:
                return
            time.sleep(1.0)

    def chat(self, system, user, max_tokens=600):
        reserve = est(system + user) + 250
        for attempt in range(10):
            self._wait(reserve)
            body = {"model": self.model, "temperature": 0, "max_tokens": max_tokens,
                    "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
            if "gpt-oss" in self.model:
                body["reasoning_effort"] = "low"
            req = urllib.request.Request("https://api.groq.com/openai/v1/chat/completions", data=json.dumps(body).encode(),
                                         headers={"content-type": "application/json", "authorization": f"Bearer {self.key}", "user-agent": "e7-harness/1"})
            slot = [time.time(), reserve]
            self.win.append(slot)
            try:
                with urllib.request.urlopen(req, timeout=120) as r:
                    data = json.loads(r.read())
                    self.remaining_requests = r.headers.get("x-ratelimit-remaining-requests")
                u = data.get("usage", {})
                slot[1] = u.get("total_tokens", reserve)
                self.calls += 1
                return (data["choices"][0]["message"].get("content") or "").strip(), u.get("prompt_tokens", est(system + user)), u.get("total_tokens", reserve)
            except urllib.error.HTTPError as e:
                msg = e.read().decode()[:300]
                slot[1] = 0
                if e.code == 429:
                    if "per day" in msg or "TPD" in msg or "RPD" in msg:
                        raise SystemExit("DAILY LIMIT: " + msg)
                    wait = float(e.headers.get("retry-after") or 5 * (attempt + 1))
                    time.sleep(wait)
                    continue
                if e.code >= 500:
                    time.sleep(3 * (attempt + 1))
                    continue
                raise RuntimeError(f"Groq {e.code}: {msg}")
            except Exception:
                slot[1] = 0
                time.sleep(3 * (attempt + 1))
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
        self.model_id = model_id

    def chat(self, system, user, max_tokens=48):
        msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        ids = self.tokz.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True)
        n_in = ids["input_ids"].shape[1]
        with self.torch.no_grad():
            out = self.model.generate(**ids, max_new_tokens=min(max_tokens, 48), do_sample=False)
        text = self.tokz.decode(out[0][n_in:], skip_special_tokens=True).strip()
        return text, n_in, n_in + (out.shape[1] - n_in)


# ---------- arms ----------
def first_line(t):
    t = t.strip().splitlines()[0] if t.strip() else ""
    t = re.sub(r"^(answer|final answer)\s*[:\-]\s*", "", t, flags=re.I)
    return t.strip().strip(".")


def qctx(q, ctx):
    return f"QUESTION: {q}\n\nCONTEXT:\n{ctx}"


def run_arm_single(be, q, paras):
    ctx = "\n\n".join(ptext(p) for p in paras)
    user = qctx(q, ctx)
    t, tin, ttot = be.chat(ANSWER_SYS, user)
    return {"pred": first_line(t), "est_in": est(ANSWER_SYS + user), "tokens": ttot, "calls": 1}


def run_silo(be, q, paras, rng):
    order = list(range(len(paras)))
    rng.shuffle(order)
    groups = [order[i:i + 2] for i in range(0, len(order), 2)]
    msgs, e, tt = [], 0, 0
    for g in groups:
        ctx = "\n\n".join(ptext(paras[i]) for i in g)
        user = qctx(q, ctx)
        t, _, ttot = be.chat(SILO_AGENT_SYS, user, max_tokens=300)
        msgs.append(first_line(t) or "NONE")
        e += est(SILO_AGENT_SYS + user)
        tt += ttot
    user = f"QUESTION: {q}\n\nMESSAGES:\n" + "\n".join(f"Member {i+1}: {m}" for i, m in enumerate(msgs))
    t, _, ttot = be.chat(SILO_COORD_SYS, user)
    return {"pred": first_line(t), "est_in": e + est(SILO_COORD_SYS + user), "tokens": tt + ttot, "calls": len(groups) + 1}


def parse_titles(text, paras):
    titles = [p["title"] for p in paras]
    lower = {t.lower(): t for t in titles}
    chosen = []
    for line in text.splitlines():
        line = re.sub(r"^[\-\*\d\.\)\s]+", "", line).strip().strip('"\'')
        if not line:
            continue
        hit = lower.get(line.lower())
        if not hit:
            m = difflib.get_close_matches(line.lower(), list(lower), n=1, cutoff=0.6)
            hit = lower[m[0]] if m else None
        if hit and hit not in chosen:
            chosen.append(hit)
    return chosen[:3]


def run_shared(be, q, paras):
    index = "\n".join(pindex(p) for p in paras)
    u1 = f"QUESTION: {q}\n\nINDEX:\n{index}"
    t1, _, tok1 = be.chat(SELECT_SYS, u1, max_tokens=200)
    chosen = parse_titles(t1, paras)
    by = {p["title"]: p for p in paras}
    exp = "\n\n".join(ptext(by[t]) for t in chosen)
    ctx = f"SHARED INDEX:\n{index}" + (f"\n\nEXPANDED:\n{exp}" if exp else "")
    u2 = qctx(q, ctx)
    t2, _, tok2 = be.chat(ANSWER_SYS, u2)
    return {"pred": first_line(t2), "est_in": est(SELECT_SYS + u1) + est(ANSWER_SYS + u2), "tokens": tok1 + tok2, "calls": 2,
            "expanded": chosen, "ctx_chars": len(index) * 2 + len(exp), "select_parse_ok": bool(chosen)}


def ranked_ctx(q, paras, budget_chars=None, k=None):
    order = bm25_rank(q, paras)
    picked, used = [], 0
    for i in order:
        L = len(ptext(paras[i])) + 2
        if k is not None:
            if len(picked) >= k:
                break
        elif used + L > budget_chars and picked:
            break
        picked.append(i)
        used += L
    return picked


def run_rag(be, q, paras, budget_chars=None, k=None):
    picked = ranked_ctx(q, paras, budget_chars, k)
    ctx = "\n\n".join(ptext(paras[i]) for i in picked)
    user = qctx(q, ctx)
    t, _, ttot = be.chat(ANSWER_SYS, user)
    return {"pred": first_line(t), "est_in": est(ANSWER_SYS + user), "tokens": ttot, "calls": 1, "n_paras": len(picked), "picked": [paras[i]["title"] for i in picked]}


def run_random(be, q, paras, budget_chars, rng):
    order = list(range(len(paras)))
    rng.shuffle(order)
    picked, used = [], 0
    for i in order:
        L = len(ptext(paras[i])) + 2
        if used + L > budget_chars and picked:
            break
        picked.append(i)
        used += L
    ctx = "\n\n".join(ptext(paras[i]) for i in picked)
    user = qctx(q, ctx)
    t, _, ttot = be.chat(ANSWER_SYS, user)
    return {"pred": first_line(t), "est_in": est(ANSWER_SYS + user), "tokens": ttot, "calls": 1, "n_paras": len(picked)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=60)
    ap.add_argument("--dtype", default="float32")
    ap.add_argument("--min-remaining-requests", type=int, default=15)
    a = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^A-Za-z0-9]+", "_", a.model).strip("_")
    path = OUT / f"{slug}.jsonl"
    done = set()
    if path.exists():
        done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()}
    qs = load_questions(a.n)
    be = Groq(a.model) if a.backend == "groq" else Local(a.model, a.dtype)
    for qi, item in enumerate(qs):
        if item["id"] in done:
            continue
        q, paras = item["question"], item["paras"]
        rng = random.Random(f"{SEED}-{item['id']}")
        res = {"FULL": run_arm_single(be, q, paras)}
        res["SILO"] = run_silo(be, q, paras, rng)
        res["SHARED"] = run_shared(be, q, paras)
        budget_chars = res["SHARED"]["ctx_chars"]
        res["RAG"] = run_rag(be, q, paras, budget_chars=budget_chars)
        res["RAGK"] = run_rag(be, q, paras, k=max(1, len(res["SHARED"]["expanded"])))
        res["RANDOM"] = run_random(be, q, paras, budget_chars, rng)
        for arm, r in res.items():
            r["f1"], r["em"] = f1_em(r["pred"], item["answer"])
        row = {"id": item["id"], "question": q, "gold": item["answer"], "type": item["type"], "level": item["level"],
               "gold_titles_expanded": None, "arms": res}
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        mean_f1 = {k: round(v["f1"], 2) for k, v in res.items()}
        print(f"[{a.model}] {qi+1}/{len(qs)} f1={mean_f1} remaining_req={getattr(be,'remaining_requests',None)}", flush=True)
        rr = getattr(be, "remaining_requests", None)
        if rr is not None and rr.isdigit() and int(rr) < a.min_remaining_requests:
            print("stopping: daily request headroom exhausted", flush=True)
            break


if __name__ == "__main__":
    main()
