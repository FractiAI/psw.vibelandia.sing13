#!/usr/bin/env python3
"""
Optional E5: mid-layer hidden-state SVD on open-weights causal LM (requires torch + transformers).
Skipped gracefully when dependencies are missing.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PHI = (1 + (5**0.5)) / 2
TOLERANCE = 0.12
DEFAULT_MODEL = "Qwen/Qwen2.5-0.5B"
DEFAULT_LAYER = 12
DEFAULT_PROMPT = "The exact number of angles in a triangle is"


def main() -> int:
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError as e:
        out = {
            "experiment": "E5_transformer_midlayer_svd",
            "skipped": True,
            "reason": str(e),
            "install": "pip install torch transformers",
        }
        _write(out)
        print(json.dumps(out, indent=2))
        return 0

    model_id = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_MODEL
    layer_idx = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_LAYER
    prompt = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_PROMPT

    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id, output_hidden_states=True, torch_dtype=torch.float32
    )
    model.eval()

    buffer = {}

    def hook(_module, _inp, output):
        tensor = output[0] if isinstance(output, tuple) else output
        buffer["acts"] = tensor.detach()

    layers = getattr(model, "model", model).layers
    handle = layers[layer_idx].register_forward_hook(hook)

    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        model(**inputs)
    handle.remove()

    acts = buffer.get("acts")
    if acts is None:
        raise RuntimeError("Hook failed to capture activations")

    flat = acts.view(-1, acts.size(-1)).float()
    _, s, _ = torch.linalg.svd(flat, full_matrices=False)
    s = s.cpu().numpy()
    primary = float(s[0] / s[1]) if len(s) >= 2 else None
    variance = abs(primary - PHI) if primary is not None else None

    out = {
        "experiment": "E5_transformer_midlayer_svd",
        "skipped": False,
        "model": model_id,
        "layer": layer_idx,
        "prompt": prompt,
        "primaryRatio": round(primary, 4) if primary else None,
        "egsPhi": round(PHI, 6),
        "structuralVariance": round(variance, 4) if variance is not None else None,
        "status": "CONVERGED_SUCCESS" if variance is not None and variance < TOLERANCE else "DEVIATED_NOISE",
        "topSingularValues": [round(float(x), 4) for x in s[:8]],
        "honestyNote": (
            "Open-weights forward pass only. Ratio proximity to φ is a falsification probe, "
            "not proof of King Bee causality or Anthropic J-Space equivalence."
        ),
    }
    _write(out)
    print(json.dumps({"ok": True, "status": out["status"]}, indent=2))
    return 0


def _write(payload: dict) -> None:
    path = Path(__file__).resolve().parent.parent / "data" / "transformer_probe_report.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
