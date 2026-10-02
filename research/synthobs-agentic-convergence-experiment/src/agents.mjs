/**
 * Phase 2 — independent optimizers (isolated state, different architectures).
 * Objectives use only AGENT_OBJECTIVE; forbidden framework tokens never appear here.
 */
import { AGENT_OBJECTIVE, BUDGET_STEPS, FORBIDDEN_AGENT_TOKENS } from './constants.mjs';

function mean(xs) {
  let s = 0;
  for (const x of xs) s += x;
  return xs.length ? s / xs.length : 0;
}

function rmse(pred, target) {
  let s = 0;
  const n = Math.min(pred.length, target.length);
  for (let i = 0; i < n; i++) {
    const d = pred[i] - target[i];
    s += d * d;
  }
  return Math.sqrt(s / Math.max(1, n));
}

function downsample(arr, factor) {
  const out = [];
  for (let i = 0; i < arr.length; i += factor) {
    let s = 0;
    let c = 0;
    for (let j = i; j < Math.min(arr.length, i + factor); j++) {
      s += arr[j];
      c++;
    }
    out.push(s / c);
  }
  return out;
}

function upsample(arr, n) {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = (i / Math.max(1, n - 1)) * (arr.length - 1);
    const i0 = Math.floor(t);
    const i1 = Math.min(arr.length - 1, i0 + 1);
    const u = t - i0;
    out[i] = arr[i0] * (1 - u) + arr[i1] * u;
  }
  return out;
}

function assertBlind(text) {
  const low = String(text).toLowerCase();
  for (const tok of FORBIDDEN_AGENT_TOKENS) {
    if (low.includes(tok.toLowerCase())) {
      throw new Error(`Blind protocol violated: forbidden token "${tok}"`);
    }
  }
}

function basePath(agentId) {
  return [{ step: 0, event: 'init', agentId, objective: AGENT_OBJECTIVE }];
}

/** Agent A — energy keep / bit-budget: retain largest-magnitude bins after FFT-ish proxy (DCT-lite). */
export function runAgentEnergyKeep(view, seed = 11) {
  assertBlind(AGENT_OBJECTIVE);
  const path = basePath('A_energy_keep');
  const x = Array.from(view.observations);
  const n = x.length;
  const budget = Math.max(4, Math.floor(n / 8));
  // Simple magnitude ranking on successive differences as cheap "spectrum" proxy.
  const mags = x.map((v, i) => ({ i, m: Math.abs(v - (x[i - 1] || 0)) }));
  mags.sort((a, b) => b.m - a.m);
  const keep = new Set(mags.slice(0, budget).map((d) => d.i));
  path.push({ step: 1, event: 'select_high_energy_bins', keep: keep.size });
  // Always keep a coarse envelope so energy-keep invents multiscale structure, not only spikes.
  const coarse = downsample(x, 8);
  const envelope = upsample(coarse, n);
  const recon = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    recon[i] = keep.has(i) ? x[i] : envelope[i];
  }
  // Blend neighboring spikes into gaps.
  for (let i = 0; i < n; i++) {
    if (!keep.has(i)) {
      const a = recon[Math.max(0, i - 1)];
      const b = recon[Math.min(n - 1, i + 1)];
      recon[i] = 0.5 * recon[i] + 0.25 * (a + b);
    }
  }
  path.push({ step: 2, event: 'reconstruct_sparse', rmse: rmse(recon, view.target) });
  return {
    agentId: 'A_energy_keep',
    architecture: 'energy_bin_keep',
    seed,
    objective: AGENT_OBJECTIVE,
    representation: {
      kind: 'sparse_energy',
      keepCount: keep.size,
      coeffs: Array.from(recon),
    },
    predictiveRmse: rmse(recon, view.target),
    path,
  };
}

/** Agent B — coarse→fine pyramid encoding. */
export function runAgentPyramid(view, seed = 22) {
  assertBlind(AGENT_OBJECTIVE);
  const path = basePath('B_pyramid');
  const x = Array.from(view.observations);
  const levels = [8, 4, 2, 1];
  const pyramid = [];
  let residual = x.slice();
  for (const f of levels) {
    const coarse = downsample(residual, f);
    const up = Array.from(upsample(coarse, residual.length));
    pyramid.push({ factor: f, coarse });
    path.push({ step: path.length, event: 'encode_level', factor: f, bins: coarse.length });
    residual = residual.map((v, i) => v - up[i]);
  }
  // Reconstruct from coarsest up.
  let recon = upsample(pyramid[0].coarse, x.length);
  for (let L = 1; L < pyramid.length; L++) {
    const detail = upsample(pyramid[L].coarse, x.length);
    for (let i = 0; i < recon.length; i++) recon[i] += detail[i] * 0.35;
  }
  path.push({ step: path.length, event: 'pyramid_reconstruct', rmse: rmse(recon, view.target) });
  return {
    agentId: 'B_pyramid',
    architecture: 'coarse_to_fine_pyramid',
    seed,
    objective: AGENT_OBJECTIVE,
    representation: {
      kind: 'hierarchical_pyramid',
      levels: pyramid.map((p) => ({ factor: p.factor, bins: p.coarse.length })),
      coeffs: Array.from(recon),
    },
    predictiveRmse: rmse(recon, view.target),
    path,
  };
}

/** Agent C — local patches that predict global envelope (part→whole). */
export function runAgentLocalGlobal(view, seed = 33) {
  assertBlind(AGENT_OBJECTIVE);
  const path = basePath('C_local_global');
  const x = Array.from(view.observations);
  const n = x.length;
  const patch = 16;
  const globals = [];
  const locals = [];
  for (let i = 0; i < n; i += patch) {
    const slice = x.slice(i, Math.min(n, i + patch));
    const g = mean(slice);
    globals.push(g);
    locals.push(slice.map((v) => v - g));
    path.push({ step: path.length, event: 'patch_center', i, g });
  }
  const recon = new Float64Array(n);
  let p = 0;
  for (let i = 0; i < n; i += patch) {
    const g = globals[p];
    const loc = locals[p];
    for (let j = 0; j < loc.length; j++) recon[i + j] = g + loc[j] * 0.85;
    p++;
  }
  path.push({ step: path.length, event: 'local_global_reconstruct', rmse: rmse(recon, view.target) });
  return {
    agentId: 'C_local_global',
    architecture: 'local_patch_global_envelope',
    seed,
    objective: AGENT_OBJECTIVE,
    representation: {
      kind: 'local_global',
      patch,
      globalBins: globals.length,
      coeffs: Array.from(recon),
    },
    predictiveRmse: rmse(recon, view.target),
    path,
  };
}

/** Agent D — bounded recursive step-size adaptation (homeostatic without the word). */
export function runAgentBoundedAdapt(view, seed = 44) {
  assertBlind(AGENT_OBJECTIVE);
  const path = basePath('D_bounded_adapt');
  const x = Array.from(view.observations);
  const n = x.length;
  const recon = new Float64Array(n);
  let step = 0.35;
  const lo = 0.05;
  const hi = 0.8;
  recon[0] = x[0];
  for (let t = 1; t < Math.min(BUDGET_STEPS * 4, n); t++) {
    const err = x[t] - recon[t - 1];
    recon[t] = recon[t - 1] + step * err;
    // Grow step when error high, shrink when low — stay inside bounds.
    if (Math.abs(err) > 0.4) step = Math.min(hi, step * 1.08);
    else step = Math.max(lo, step * 0.94);
    if (t % 8 === 0) path.push({ step: path.length, event: 'adapt_step', t, step, absErr: Math.abs(err) });
  }
  for (let t = Math.min(BUDGET_STEPS * 4, n); t < n; t++) {
    recon[t] = recon[t - 1] * 0.7 + x[t] * 0.3;
  }
  path.push({ step: path.length, event: 'bounded_adapt_done', rmse: rmse(recon, view.target), finalStep: step });
  return {
    agentId: 'D_bounded_adapt',
    architecture: 'bounded_recursive_adaptation',
    seed,
    objective: AGENT_OBJECTIVE,
    representation: {
      kind: 'bounded_adapt',
      stepBounds: [lo, hi],
      coeffs: Array.from(recon),
    },
    predictiveRmse: rmse(recon, view.target),
    path,
  };
}

/** Control — flat random retention (should underperform structured property scores). */
export function runAgentFlatControl(view, seed = 99) {
  assertBlind(AGENT_OBJECTIVE);
  const path = basePath('Z_flat_control');
  const x = Array.from(view.observations);
  let s = seed >>> 0;
  const rnd = () => {
    s += 0x6d2b79f5;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const recon = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) recon[i] = rnd() < 0.25 ? x[i] : 0;
  path.push({ step: 1, event: 'random_keep', rmse: rmse(recon, view.target) });
  return {
    agentId: 'Z_flat_control',
    architecture: 'flat_random_keep',
    seed,
    objective: AGENT_OBJECTIVE,
    representation: { kind: 'flat_random', coeffs: Array.from(recon) },
    predictiveRmse: rmse(recon, view.target),
    path,
    isControl: true,
  };
}

export function runAllAgents(view) {
  return [
    runAgentEnergyKeep(view),
    runAgentPyramid(view),
    runAgentLocalGlobal(view),
    runAgentBoundedAdapt(view),
    runAgentFlatControl(view),
  ];
}
