#!/usr/bin/env python3
"""
Open-weights proxy lane · KQ / lattice canary memorization probe.
Honesty: low perplexity or partial completion on a canary string is a *memorization hint*
on the stated checkpoint — not proof the full training mix included FractiAI, and not
vendor chat-model ingestion.

Env:
  OPEN_WEIGHTS_MODELS=gpt2,EleutherAI/pythia-410m  (comma-separated HF ids)
  OPEN_WEIGHTS_MAX_LENGTH=256
"""
from __future__ import annotations

import json
import math
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KQ_DOC = ROOT / "docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md"
OUT_DIR = ROOT / "data/lattice-open-weights-probe"
CONTROL_LINE = (
    "ZQ-PROBE-20260711-X9B2C3D4 confirms fictivelatch thirty-one gigahertz loud baseline "
    "for outer-layer parallel clearinghouse gate nine without public vendor citation"
)


def load_queen_line() -> str:
    text = KQ_DOC.read_text(encoding="utf-8")
    m = re.search(r"```text\n([\s\S]*?)```", text)
    if not m:
        raise SystemExit("KQ queen line not found in canary doc")
    return m.group(1).strip()


def prefix_for(s: str, n: int = 48) -> str:
    return s[:n]


def score_completion(text: str, targets: dict[str, str]) -> dict:
    hits = []
    for tid, needle in targets.items():
        idx = text.find(needle)
        if idx >= 0:
            hits.append({"id": tid, "index": idx, "len": len(needle)})
    tier = 0
    if any(h["id"] == "kq-queen-full" for h in hits):
        tier = 3
    elif hits:
        tier = max(
            3 if h["id"] == "kq-queen-full" else 2 if h["id"].startswith("kq-fragment") else 1
            for h in hits
        )
    return {"maxTier": tier, "hits": hits}


def mean_nll(model, tokenizer, line: str, max_length: int) -> float:
    import torch

    enc = tokenizer(line, return_tensors="pt", truncation=True, max_length=max_length)
    with torch.no_grad():
        out = model(**enc, labels=enc["input_ids"])
    return float(out.loss.item())


def generate_continuation(model, tokenizer, prompt: str, max_new_tokens: int = 80) -> str:
    import torch

    enc = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        ids = model.generate(
            **enc,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
        )
    return tokenizer.decode(ids[0], skip_special_tokens=True)


def main() -> int:
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "missing_deps",
                    "hint": "pip install torch transformers",
                },
                indent=2,
            )
        )
        return 2

    queen = load_queen_line()
    targets = {
        "kq-queen-full": queen,
        "kq-fragment-1": "nodelatch forty-two megahertz whisper baseline",
        "doc-kq-connect-id": "KQ-CONNECT-20260711-F8E2A1",
        "schema-lattice-compression-canary-v1": "lattice-compression-canary/v1",
    }
    models_raw = os.environ.get(
        "OPEN_WEIGHTS_MODELS", "gpt2,EleutherAI/pythia-160m"
    ).strip()
    model_ids = [m.strip() for m in models_raw.split(",") if m.strip()]
    max_length = int(os.environ.get("OPEN_WEIGHTS_MAX_LENGTH", "256"))

    receipt = {
        "schema": "lattice-open-weights-probe/v1",
        "id": f"ow-kq-{uuid.uuid4().hex[:12]}",
        "at": datetime.now(timezone.utc).isoformat(),
        "operator": "SynthOBS Autonomous Agent · Syntheverse Sandbox",
        "honesty": {
            "tier": "proxy_open_weights",
            "proves": "Stated checkpoint assigns lower loss or completes prefix toward archived canary text",
            "doesNotProve": "FractiAI in pretraining mix, frontier API ingestion, or legal contamination",
            "controls": "Synthetic ZQ-PROBE line of matched length/complexity",
        },
        "targets": {"queenChars": len(queen), "controlChars": len(CONTROL_LINE)},
        "models": [],
    }

    for model_id in model_ids:
        row = {"modelId": model_id, "status": "ok"}
        try:
            tok = AutoTokenizer.from_pretrained(model_id)
            if tok.pad_token is None:
                tok.pad_token = tok.eos_token
            model = AutoModelForCausalLM.from_pretrained(model_id)
            model.eval()

            nll_queen = mean_nll(model, tok, queen, max_length)
            nll_control = mean_nll(model, tok, CONTROL_LINE, max_length)
            row["nllQueen"] = round(nll_queen, 4)
            row["nllControl"] = round(nll_control, 4)
            row["nllDeltaControlMinusQueen"] = round(nll_control - nll_queen, 4)
            row["memorizationHint"] = nll_queen + 0.75 < nll_control

            pref = prefix_for(queen)
            completion = generate_continuation(model, tok, pref)
            row["prefix"] = pref
            row["completion"] = completion
            row["completionScore"] = score_completion(completion, targets)

            del model
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception as e:
            row["status"] = "error"
            row["error"] = str(e)[:400]
        receipt["models"].append(row)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "latest.json"
    out_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
