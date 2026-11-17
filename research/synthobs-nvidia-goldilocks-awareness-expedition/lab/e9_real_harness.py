#!/usr/bin/env python3
"""E9 real-data harness — RCSB PDB contacts + Pfam seed MSAs (public web).
Protocol: ../E9_PROTOCOL.md + ../E9_REALDATA_AMENDMENT.md.
GROQ_API_KEY from environment only."""
from __future__ import annotations

import argparse
import gzip
import io
import json
import math
import os
import random
import re
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque
from pathlib import Path

SEED = 20261117
MIN_SEP = 6
CONTACT_CA_A = 8.0
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "e9_real"
CACHE = OUT / "cache"

# Curated public (PDB, chain, Pfam) — small domains with seed MSAs online.
CURATED = [
    ("1UBQ", "A", "PF00240"),  # ubiquitin
    ("1BPI", "A", "PF00014"),  # BPTI / Kunitz
    ("1CRN", "A", "PF00001"),  # crambin / thionin-related — may fail; fallback handled
    ("1PGB", "A", "PF01378"),  # protein G B1
    ("2IGD", "A", "PF01378"),
    ("1VII", "A", "PF02209"),  # villin headpiece
    ("1LMB", "3", "PF00126"),  # lambda repressor-like — check
    ("1AIE", "A", "PF00018"),  # SH3
    ("1SHG", "A", "PF00018"),
    ("1NYF", "A", "PF00018"),
    ("1CSP", "A", "PF00313"),  # cold shock
    ("1MJC", "A", "PF00313"),
    ("1RIS", "A", "PF00584"),  # ribosomal S6
    ("1FNA", "A", "PF00041"),  # FN3
    ("1TEN", "A", "PF00041"),
    ("1HCD", "A", "PF00001"),
    ("1R69", "A", "PF01381"),  # engrailed homeodomain-ish
    ("1ENH", "A", "PF00046"),  # homeobox
    ("1PHT", "A", "PF00018"),
    ("1SRL", "A", "PF00018"),
    ("1PKS", "A", "PF00018"),
    ("1YCC", "A", "PF00034"),  # cytochrome c
    ("1CYC", "A", "PF00034"),
    ("2CDV", "A", "PF00034"),
    ("1HZ6", "A", "PF00013"),  # KH domain
    ("1KPA", "A", "PF00014"),
    ("5PTI", "A", "PF00014"),
    ("1G6P", "A", "PF01378"),
    ("3GB1", "A", "PF01378"),
    ("1MIO", "A", "PF00240"),
    ("4UBI", "A", "PF00240"),
    ("1TIT", "A", "PF00041"),
    ("1TTF", "A", "PF00041"),
    ("1WIT", "A", "PF00041"),
    ("1FNF", "A", "PF00041"),
    ("1HCB", "A", "PF00061"),  # lipocalin
    ("1OPA", "A", "PF00061"),
    ("1IFC", "A", "PF00061"),
    ("1RBP", "A", "PF00061"),
    ("1BBC", "A", "PF00001"),
]

AA3 = {
    "ALA": "A", "CYS": "C", "ASP": "D", "GLU": "E", "PHE": "F", "GLY": "G", "HIS": "H",
    "ILE": "I", "LYS": "K", "LEU": "L", "MET": "M", "ASN": "N", "PRO": "P", "GLN": "Q",
    "ARG": "R", "SER": "S", "THR": "T", "VAL": "V", "TRP": "W", "TYR": "Y",
}

SYS = (
    "You answer a protein long-range contact question using only CONTEXT. "
    "Reply with exactly one line SOLUTION: i-j using 1-based residue indices. No other text."
)


def est(t: str) -> int:
    return max(1, math.ceil(len(t) / 4))


def fetch(url: str, dest: Path, binary=False):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    req = urllib.request.Request(url, headers={"user-agent": "e9-real/1 (research; local cache)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)
    return dest


def parse_pdb(pdb_text: str, chain: str):
    seqres = []
    for line in pdb_text.splitlines():
        if line.startswith("SEQRES") and len(line) > 11 and line[11] == chain:
            seqres += line[19:].split()
    seq = "".join(AA3.get(r, "X") for r in seqres)
    atoms = {}
    for line in pdb_text.splitlines():
        if not line.startswith("ATOM"):
            continue
        if line[21] != chain:
            continue
        if line[12:16].strip() != "CA":
            continue
        res = int(line[22:26])
        x, y, z = float(line[30:38]), float(line[38:46]), float(line[46:54])
        atoms[res] = (x, y, z)
    # Map SEQRES index (0-based) to auth residue numbers when possible via sequential CA order
    ca_res = sorted(atoms)
    contacts = []
    for i, a in enumerate(ca_res):
        for b in ca_res[i + 1 :]:
            if b - a < MIN_SEP:
                continue
            x1, y1, z1 = atoms[a]
            x2, y2, z2 = atoms[b]
            if (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2 <= CONTACT_CA_A ** 2:
                contacts.append((a, b))
    return {
        "seq": seq,
        "ca_res": ca_res,
        "atoms": atoms,
        "contacts": contacts,
        "seq_from_ca": "".join(
            # fallback identity placeholder — SEQRES preferred
            "X"
            for _ in ca_res
        ),
    }


def parse_stockholm(raw: str):
    seqs = defaultdict(str)
    for line in raw.splitlines():
        if not line or line.startswith("#") or line.startswith("//"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        name, piece = parts[0], parts[1]
        seqs[name] += piece
    return dict(seqs)


def ungapped(s: str) -> str:
    return re.sub(r"[.\-]", "", s).upper().replace("U", "C").replace("O", "K").replace("B", "D").replace("Z", "E")


def identity(a: str, b: str) -> float:
    n = min(len(a), len(b))
    if n == 0:
        return 0.0
    # best window
    if len(a) > len(b):
        a, b = b, a
        swap = True
    else:
        swap = False
    best = 0
    for off in range(len(b) - len(a) + 1):
        sc = sum(1 for i in range(len(a)) if a[i] == b[off + i])
        best = max(best, sc)
    return best / len(a)


def map_msa_to_pdb(msa: dict, pdb_seq: str):
    """Pick MSA row closest to PDB seq; return col->pdb_res_index map using 0-based seq indices."""
    best_name, best_id, best_row = None, -1.0, None
    for name, row in msa.items():
        ug = ungapped(row)
        # sliding identity
        if not ug or not pdb_seq:
            continue
        # compute best offset of ug into pdb_seq or vice versa
        score = 0
        off = 0
        if len(ug) <= len(pdb_seq):
            for o in range(len(pdb_seq) - len(ug) + 1):
                sc = sum(1 for i in range(len(ug)) if ug[i] == pdb_seq[o + i])
                if sc > score:
                    score, off = sc, o
            frac = score / len(ug)
            if frac > best_id:
                best_id, best_name, best_row = frac, name, (row, off, "msa_in_pdb")
        else:
            for o in range(len(ug) - len(pdb_seq) + 1):
                sc = sum(1 for i in range(len(pdb_seq)) if pdb_seq[i] == ug[o + i])
                if sc > score:
                    score, off = sc, o
            frac = score / len(pdb_seq)
            if frac > best_id:
                best_id, best_name, best_row = frac, name, (row, off, "pdb_in_msa")
    if not best_row or best_id < 0.5:
        return None, best_id, best_name
    row, off, mode = best_row
    col_to_seq = {}
    if mode == "msa_in_pdb":
        seq_i = off
        for col, ch in enumerate(row):
            if ch in ".-":
                continue
            if seq_i < len(pdb_seq):
                col_to_seq[col] = seq_i
            seq_i += 1
    else:
        # pdb embedded in ungapped msa starting at off
        ug_i = 0
        for col, ch in enumerate(row):
            if ch in ".-":
                continue
            if ug_i >= off and ug_i - off < len(pdb_seq):
                col_to_seq[col] = ug_i - off
            ug_i += 1
    return col_to_seq, best_id, best_name


def coupling_scores(msa_rows: list[str], col_to_seq: dict):
    """Agreement-rate coupling on mapped columns; return dict of (seq_i,seq_j)->score with sep>=MIN_SEP."""
    cols = sorted(col_to_seq)
    # transpose mapped columns
    series = {c: [] for c in cols}
    for row in msa_rows:
        for c in cols:
            ch = row[c] if c < len(row) else "-"
            series[c].append(ch.upper() if ch not in ".-" else "-")
    scores = {}
    for a_i, ca in enumerate(cols):
        for cb in cols[a_i + 1 :]:
            ia, ib = col_to_seq[ca], col_to_seq[cb]
            if abs(ia - ib) < MIN_SEP:
                continue
            pair = tuple(sorted((ia, ib)))
            agree = valid = 0
            for x, y in zip(series[ca], series[cb]):
                if x == "-" or y == "-":
                    continue
                valid += 1
                if x == y:
                    agree += 1
            if valid < max(5, len(msa_rows) // 3):
                continue
            scores[pair] = round(agree / valid, 4)
    return scores


def seq_index_to_auth(ca_res, seq_len):
    """Map 0-based SEQRES index approx to auth res via linear spacing over CA list."""
    if not ca_res:
        return {}
    # Prefer direct if lengths match
    if len(ca_res) == seq_len:
        return {i: ca_res[i] for i in range(seq_len)}
    # approximate: distribute
    out = {}
    for i in range(seq_len):
        j = int(round(i * (len(ca_res) - 1) / max(1, seq_len - 1)))
        out[i] = ca_res[j]
    return out


def build_scenario(pdb_id, chain, pfam, sid):
    pdb_path = fetch(f"https://files.rcsb.org/download/{pdb_id}.pdb", CACHE / f"{pdb_id}.pdb")
    seed_path = fetch(
        f"https://www.ebi.ac.uk/interpro/wwwapi/entry/pfam/{pfam}/?annotation=alignment:seed&download",
        CACHE / f"{pfam}.seed.gz",
        binary=True,
    )
    pdb_text = pdb_path.read_text(errors="replace")
    raw = gzip.open(seed_path, "rt", errors="replace").read()
    if not raw.startswith("# STOCKHOLM"):
        # sometimes already uncompressed
        try:
            raw = gzip.decompress(seed_path.read_bytes()).decode("utf-8", "replace")
        except Exception:
            raw = seed_path.read_text(errors="replace")
    msa = parse_stockholm(raw)
    if len(msa) < 5:
        return None
    parsed = parse_pdb(pdb_text, chain)
    if len(parsed["seq"]) < 30 or len(parsed["contacts"]) < 3:
        return None
    col_to_seq, ident, match_name = map_msa_to_pdb(msa, parsed["seq"])
    if not col_to_seq:
        return None
    rows = list(msa.values())
    scores = coupling_scores(rows, col_to_seq)
    auth = seq_index_to_auth(parsed["ca_res"], len(parsed["seq"]))
    # structural contacts in 0-based seq indices
    auth_to_seq = defaultdict(list)
    for si, ar in auth.items():
        auth_to_seq[ar].append(si)
    struct_pairs = []
    for a, b in parsed["contacts"]:
        if a in auth_to_seq and b in auth_to_seq:
            for ia in auth_to_seq[a]:
                for ib in auth_to_seq[b]:
                    if abs(ia - ib) >= MIN_SEP:
                        struct_pairs.append(tuple(sorted((ia, ib))))
    struct_pairs = sorted(set(struct_pairs))
    if not struct_pairs:
        return None
    # choose query: structural contact with highest MSA coupling if available
    def cscore(p):
        return scores.get(p, 0.0)

    struct_pairs.sort(key=lambda p: (-cscore(p), p))
    gold = struct_pairs[0]
    qi = gold[0]
    # display MSA dump (subset of rows, ungapped trimmed)
    dump_rows = []
    for name, row in list(msa.items())[:12]:
        dump_rows.append(f"{name}: {ungapped(row)[:120]}")
    involving = [((a, b), s) for (a, b), s in scores.items() if qi in (a, b)]
    involving.sort(key=lambda kv: (-kv[1], kv[0]))
    # 1-based for humans
    def fmt(p):
        return f"{p[0]+1}-{p[1]+1}"

    question = (
        f"Residue {qi+1} (1-based) in PDB {pdb_id} chain {chain} has a long-range structural partner "
        f"(separation ≥ {MIN_SEP}). Report the contact pair."
    )
    return {
        "id": f"e9r-{sid}",
        "sid": sid,
        "pdb_id": pdb_id,
        "chain": chain,
        "pfam": pfam,
        "sources": {
            "pdb_url": f"https://files.rcsb.org/download/{pdb_id}.pdb",
            "pfam_seed_url": f"https://www.ebi.ac.uk/interpro/wwwapi/entry/pfam/{pfam}/?annotation=alignment:seed&download",
        },
        "msa_match_identity": round(ident, 4),
        "msa_match_row": match_name,
        "n_msa": len(msa),
        "seq": parsed["seq"],
        "question": question,
        "qi": qi,
        "gold": fmt(gold),
        "gold_0": gold,
        "struct_contact_count": len(struct_pairs),
        "dump_rows": dump_rows,
        "involving": [(fmt(p), s) for p, s in involving[:10]],
        "top_global": [(fmt(p), s) for p, s in sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:8]],
    }


def pack_linear(sc):
    i = sc["qi"]
    seq = sc["seq"]
    local = ", ".join(f"{p+1}:{seq[p]}" for p in range(max(0, i - 2), min(len(seq), i + 3)))
    return (
        f"QUESTION: {sc['question']}\n"
        f"PDB: {sc['pdb_id']}  Pfam: {sc['pfam']}\n"
        f"PRIMARY SEQUENCE: {seq}\n"
        f"LOCAL WINDOW: {local}\n"
        f"NOTE: Only the linear sequence is available."
    )


def pack_flat(sc):
    return (
        f"QUESTION: {sc['question']}\n"
        f"PDB: {sc['pdb_id']}  Pfam: {sc['pfam']}\n"
        f"PRIMARY SEQUENCE: {sc['seq']}\n"
        f"REAL PFAM SEED HOMOLOGS (ungapped dump):\n"
        + "\n".join(sc["dump_rows"])
        + "\nNOTE: Couplings are not precomputed."
    )


def pack_aware(sc):
    inv = "\n".join(f"{p}: coupling={s}" for p, s in sc["involving"]) or "(none)"
    glob = "\n".join(f"{p}: coupling={s}" for p, s in sc["top_global"])
    return (
        f"QUESTION: {sc['question']}\n"
        f"PDB: {sc['pdb_id']}  Pfam: {sc['pfam']}\n"
        f"PRIMARY SEQUENCE: {sc['seq']}\n"
        f"RELATIONAL AWARENESS BOARD — MSA couplings involving residue {sc['qi']+1} (from real Pfam seed, not from coordinates):\n"
        f"{inv}\n"
        f"GLOBAL TOP MSA COUPLINGS:\n{glob}\n"
        f"NOTE: Prefer high long-range coupling over sequence neighbors."
    )


def parse_solution(text: str):
    m = re.search(r"SOLUTION:\s*([0-9]+)\s*-\s*([0-9]+)", text or "", flags=re.I)
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    if a > b:
        a, b = b, a
    return f"{a}-{b}"


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
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode(),
                headers={
                    "content-type": "application/json",
                    "authorization": f"Bearer {self.key}",
                    "user-agent": "e9-real/1",
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

    def chat(self, system, user, max_tokens=48):
        msgs = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        ids = self.tokz.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True)
        n_in = ids["input_ids"].shape[1]
        with self.torch.no_grad():
            out = self.model.generate(**ids, max_new_tokens=min(max_tokens, 48), do_sample=False)
        text = self.tokz.decode(out[0][n_in:], skip_special_tokens=True).strip()
        return text, n_in + (out.shape[1] - n_in)


def run_arm(be, sc, arm):
    if arm == "LINEAR":
        ctx = pack_linear(sc)
    elif arm == "FLAT_MSA":
        ctx = pack_flat(sc)
    else:
        ctx = pack_aware(sc)
    text, tok = be.chat(SYS, "CONTEXT:\n" + ctx)
    pred = parse_solution(text)
    return {"arm": arm, "pred": pred, "text": text, "exact": pred == sc["gold"], "tokens": tok}


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


def summarize(rows, arm):
    xs = [r["arms"][arm] for r in rows]
    n = len(xs) or 1
    return {
        "n": len(xs),
        "exact_rate": round(sum(x["exact"] for x in xs) / n, 4),
        "mean_tokens": round(sum(x["tokens"] for x in xs) / n, 1),
    }


def build_all_scenarios(limit=40):
    scenarios = []
    meta_path = OUT / "scenarios.json"
    if meta_path.exists():
        scenarios = json.loads(meta_path.read_text())
        if len(scenarios) >= min(limit, 15):
            return scenarios[:limit]
    sid = 0
    for pdb_id, chain, pfam in CURATED:
        if len(scenarios) >= limit:
            break
        try:
            sc = build_scenario(pdb_id, chain, pfam, sid)
        except Exception as e:
            print(f"skip {pdb_id} {pfam}: {e}", flush=True)
            continue
        if not sc:
            print(f"skip {pdb_id} {pfam}: build returned None", flush=True)
            continue
        scenarios.append(sc)
        sid += 1
        print(
            f"built {sc['id']} {pdb_id}/{pfam} ident={sc['msa_match_identity']} contacts={sc['struct_contact_count']} gold={sc['gold']}",
            flush=True,
        )
    OUT.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(json.dumps(scenarios, indent=2))
    return scenarios


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["groq", "local"], required=True)
    ap.add_argument("--model", required=True)
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--build-only", action="store_true")
    ap.add_argument("--dtype", default="float32")
    a = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    scenarios = build_all_scenarios(limit=a.n)
    if a.build_only:
        print(json.dumps({"n": len(scenarios), "ids": [s["id"] for s in scenarios]}, indent=2))
        return
    if not scenarios:
        raise SystemExit("No real scenarios built — check network / Pfam-PDB pairs")

    slug = re.sub(r"[^A-Za-z0-9]+", "_", a.model).strip("_")
    path = OUT / f"{slug}.jsonl"
    done = {json.loads(l)["id"] for l in path.read_text().splitlines() if l.strip()} if path.exists() else set()
    be = Groq(a.model) if a.backend == "groq" else Local(a.model, a.dtype)

    for sc in scenarios[: a.n]:
        if sc["id"] in done:
            continue
        try:
            arms = {arm: run_arm(be, sc, arm) for arm in ("LINEAR", "FLAT_MSA", "AWARE")}
        except SystemExit as e:
            print(str(e), flush=True)
            break
        row = {
            "id": sc["id"],
            "pdb_id": sc["pdb_id"],
            "pfam": sc["pfam"],
            "gold": sc["gold"],
            "msa_match_identity": sc["msa_match_identity"],
            "sources": sc["sources"],
            "arms": arms,
        }
        with path.open("a") as f:
            f.write(json.dumps(row) + "\n")
        print(
            f"[{a.model}] {sc['id']} {sc['pdb_id']} exact="
            + str({k: int(v["exact"]) for k, v in arms.items()})
            + f" gold={sc['gold']} tok={sum(v['tokens'] for v in arms.values())}",
            flush=True,
        )

    rows = [json.loads(l) for l in path.read_text().splitlines() if l.strip()] if path.exists() else []
    summary = {
        "model": a.model,
        "protocol": "E9_PROTOCOL.md + E9_REALDATA_AMENDMENT.md",
        "data": "RCSB PDB + InterPro/Pfam seed MSAs",
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
        h1, h2 = summary["contrasts"]["AWARE_minus_LINEAR"], summary["contrasts"]["AWARE_minus_FLAT_MSA"]
        flat = summary["contrasts"]["FLAT_MSA_minus_LINEAR"]
        summary["gates"] = {
            "H1": bool(h1 and h1["mean"] >= 0.25 and h1["excludes_0"]),
            "H2": bool(h2 and h2["mean"] >= 0.10 and h2["excludes_0"]),
            "H3": summary["H3_token_ratio_AWARE_over_FLAT"] <= 1.25,
            "FLAT_extracts_pattern": bool(flat and flat["mean"] >= 0.25 and flat["excludes_0"]),
        }
    (OUT / f"{slug}_summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
