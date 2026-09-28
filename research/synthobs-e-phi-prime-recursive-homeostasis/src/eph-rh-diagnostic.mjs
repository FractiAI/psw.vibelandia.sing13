/**
 * e × φ × Prime Recursive Homeostasis — EPH-RH-D Diagnostic Matrix
 *
 * Troubleshooting follow-on to EPH-RH V1 (locked null on Goldilocks hit-rate).
 * Does NOT rewrite V1. Asks the cleaner question:
 *   At equal transformation budget, does e×φ×prime produce more recoverable
 *   evolution with less bleed than ordinary / matched-containment controls?
 *
 * Diagnostic axes:
 *  - matched transformation budget Q
 *  - evolution efficiency E/(D+ε)
 *  - φ as proportional regulator (not blind multiplier)
 *  - prime vs matched non-prime containment
 *  - operation-order permutations
 *  - perturbation / recovery feedback
 *  - seed-level stats (independent unit = fixture/seed)
 */
import {
  PHI_EGS,
  GENERATIONS,
  SERIES_LEN,
  FIXTURE_SEED,
  FIXTURE_COUNT,
  PRIME_SCHEDULE,
  COMPOSITE_SCHEDULE,
  D_LOW,
  D_COLLAPSE,
  BLEED_LOW,
} from './constants.mjs';

const EPS = 1e-6;

export const DIAGNOSTIC_PROTOCOL = 'EPH-RH-D-2026-09-28';

/** Independent run seeds (unit of inference = seed, not generation). */
export const RUN_SEEDS = Object.freeze([0xe9f1, 0xa11c, 0xb22d, 0xc33e, 0xd44f, 0xe550, 0xf661, 0x1772]);

/** Target path length Q for matched-budget experiments. */
export const Q_TARGET = 2.4;

/** φ regulator strengths under test. */
export const PHI_STRENGTHS = Object.freeze([0.25, 0.5, 1.0, 1.5]);

/** Operation order permutations (e, φ/regulator, contain). */
export const ORDER_PERMS = Object.freeze([
  'e_phi_p',
  'e_p_phi',
  'phi_e_p',
  'phi_p_e',
  'p_e_phi',
  'p_phi_e',
]);

export const DIAGNOSTIC_GATE = Object.freeze({
  require_E_above_A: true,
  require_B_below_A: true,
  require_D_positive: true,
  require_D_bounded: true,
  require_efficiency_above_A: true,
  require_beat_matched_containment_efficiency: true,
  engine_shelf_requires_gate: true,
});

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function mean(xs) {
  let s = 0;
  for (const x of xs) s += x;
  return xs.length ? s / xs.length : 0;
}

function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return Math.sqrt(s / (xs.length - 1));
}

function rmse(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s / n);
}

function seriesStd(xs) {
  return Math.max(1e-12, stdev([...xs]));
}

function nrmse(a, b) {
  return rmse(a, b) / seriesStd(b);
}

function normalizeRms(xs, target = 1) {
  let s = 0;
  for (const x of xs) s += x * x;
  const rms = Math.sqrt(s / xs.length) || 1;
  const g = target / rms;
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) out[i] = xs[i] * g;
  return out;
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  const ma = mean([...a].slice(0, n));
  const mb = mean([...b].slice(0, n));
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const den = Math.sqrt(da * db);
  return den < 1e-15 ? 0 : num / den;
}

function pathLength(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s / a.length);
}

function makeFixture(seed, kind) {
  const rnd = mulberry32(seed);
  const n = SERIES_LEN;
  const xs = new Float64Array(n);
  if (kind === 'seasonal') {
    for (let i = 0; i < n; i++) {
      xs[i] =
        Math.sin((2 * Math.PI * i) / 24) +
        0.35 * Math.sin((2 * Math.PI * i) / 7) +
        0.15 * (rnd() - 0.5);
    }
  } else if (kind === 'trend') {
    for (let i = 0; i < n; i++) {
      xs[i] = 0.01 * i + 0.4 * Math.sin((2 * Math.PI * i) / 31) + 0.2 * (rnd() - 0.5);
    }
  } else if (kind === 'block') {
    for (let i = 0; i < n; i++) {
      const block = Math.floor(i / 15) % 4;
      xs[i] = [-1, 0.5, 1.2, -0.3][block] + 0.1 * (rnd() - 0.5);
    }
  } else {
    for (let i = 0; i < n; i++) xs[i] = 0.05 * (rnd() - 0.5);
    for (let k = 0; k < 8; k++) {
      const idx = Math.floor(rnd() * n);
      xs[idx] += 1.5 * (rnd() > 0.5 ? 1 : -1);
    }
  }
  return normalizeRms(xs, 1);
}

export function fixtureFamily(seedBase = FIXTURE_SEED) {
  const kinds = ['seasonal', 'trend', 'block', 'sparse'];
  const out = [];
  for (let i = 0; i < FIXTURE_COUNT; i++) {
    out.push({
      id: `F${i}`,
      kind: kinds[i % kinds.length],
      x0: makeFixture(seedBase + i * 97, kinds[i % kinds.length]),
    });
  }
  return out;
}

/** Soft e-driven continuous transform (magnitude family). */
function eTransform(xs, k = 0.08) {
  const out = new Float64Array(xs.length);
  const m = mean(xs);
  const scale = Math.exp(k);
  for (let i = 0; i < xs.length; i++) {
    const left = xs[(i - 1 + xs.length) % xs.length];
    const right = xs[(i + 1) % xs.length];
    const centered = xs[i] - m;
    const local = 0.7 * centered + 0.15 * (left - m) + 0.15 * (right - m);
    out[i] = m + local * scale;
  }
  return normalizeRms(out, 1);
}

/**
 * φ as proportional regulator (homeostatic interpretation):
 * X_{n+1} = X_n + α_φ · ΔX_proposed
 * α_φ shrinks when D high / B high; grows when D too low (encourage evolution).
 */
function phiRegulate(xs, proposed, D, B, strength = 1.0) {
  const targetMid = (D_LOW + Math.min(D_COLLAPSE, 1.0)) / 2;
  let alpha = (1 / PHI_EGS) * strength;
  if (D > targetMid) alpha *= Math.max(0.15, 1 - (D - targetMid) / (D_COLLAPSE - targetMid + EPS));
  if (D < D_LOW * 2) alpha *= 1.25; // permit more change when stagnating
  if (B > BLEED_LOW) alpha *= Math.max(0.2, 1 - (B - BLEED_LOW));
  alpha = Math.max(0.05, Math.min(1, alpha));
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = xs[i] + alpha * (proposed[i] - xs[i]);
  }
  return { series: normalizeRms(out, 1), alpha };
}

/** Legacy open-loop φ structure (V1-style) for contrast. */
function phiStructureOpenLoop(xs) {
  const wMajor = 1 / PHI_EGS;
  const wMinor = 1 - wMajor;
  const n = xs.length;
  const mid = Math.floor(n * wMajor);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = wMajor * xs[i] + wMinor * xs[(i + mid) % n];
  }
  return normalizeRms(out, 1);
}

function contain(xs, size) {
  const b = Math.max(2, size | 0);
  const n = xs.length;
  const out = new Float64Array(n);
  let contained = 0;
  let leaked = 0;
  for (let start = 0; start < n; start += b) {
    const end = Math.min(n, start + b);
    let s = 0;
    let c = 0;
    for (let i = start; i < end; i++) {
      s += xs[i];
      c++;
    }
    const mu = c ? s / c : 0;
    for (let i = start; i < end; i++) {
      const residual = xs[i] - mu;
      out[i] = mu + 0.85 * residual;
      contained += out[i] * out[i];
    }
    if (end < n) {
      const edge = xs[end - 1] - mu;
      const nextMuGuess = xs[end] - (xs[Math.min(n - 1, end + b - 1)] + xs[end]) / 2;
      leaked += edge * edge + 0.25 * nextMuGuess * nextMuGuess;
    }
  }
  const bleed = contained > 1e-12 ? leaked / (contained + leaked) : 0;
  return { series: normalizeRms(out, 1), bleed };
}

function ordinaryStep(xs, intensity = 1) {
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    const a = xs[(i - 1 + xs.length) % xs.length];
    const b = xs[i];
    const c = xs[(i + 1) % xs.length];
    out[i] = 0.2 * a + 0.6 * b + 0.2 * c;
  }
  const m = mean(out);
  const gain = 0.02 * intensity;
  for (let i = 0; i < out.length; i++) out[i] = out[i] + gain * (out[i] - m);
  return normalizeRms(out, 1);
}

function bleedProxy(xs) {
  let leak = 0;
  let ene = 0;
  for (let i = 0; i < xs.length; i++) {
    const d = xs[i] - xs[(i + 1) % xs.length];
    leak += d * d;
    ene += xs[i] * xs[i];
  }
  return ene > 0 ? Math.min(1, leak / (ene + leak)) : 0;
}

/**
 * Useful evolution (diagnostic):
 * E = N_new × R_recoverable × I_identity
 * N_new = stepwise novelty; R = max(0, pearson to origin);
 * I_identity = 1 / (1 + D) — separate from raw drift penalty in the scoreboard.
 */
function usefulEvolution(prev, cur, origin) {
  const novelty = nrmse(cur, prev);
  const recoverable = Math.max(0, pearson(cur, origin));
  const D = nrmse(cur, origin);
  const identity = 1 / (1 + D);
  return {
    E: novelty * recoverable * identity,
    novelty,
    recoverable,
    identity,
    D,
  };
}

function applyOrder(xs, order, generation, D, B, phiStrength, usePrime) {
  const sizeSched = usePrime ? PRIME_SCHEDULE : COMPOSITE_SCHEDULE;
  const size = sizeSched[generation % sizeSched.length];
  let cur = xs;
  let bleed = 0;
  let alpha = null;
  const ops = order.split('_');
  for (const op of ops) {
    if (op === 'e') {
      cur = eTransform(cur, 0.08);
    } else if (op === 'phi') {
      const proposed = eTransform(cur, 0.05); // local proposal field
      const reg = phiRegulate(cur, proposed, D, B, phiStrength);
      cur = reg.series;
      alpha = reg.alpha;
    } else if (op === 'p') {
      const r = contain(cur, size);
      cur = r.series;
      bleed = r.bleed;
    }
  }
  if (ops.includes('p') === false) bleed = bleedProxy(cur);
  return { series: cur, bleed, alpha };
}

/**
 * Run arm until cumulative path length Q >= qTarget (matched budget),
 * or GENERATIONS*3 steps max.
 */
function runMatchedBudget(arm, fixture, opts = {}) {
  const {
    qTarget = Q_TARGET,
    order = 'e_phi_p',
    phiStrength = 1.0,
    usePrime = true,
    openLoopPhi = false,
    intensity = 1,
    rnd = mulberry32(1),
  } = opts;
  let x = Float64Array.from(fixture.x0);
  const origin = fixture.x0;
  let Q = 0;
  let steps = 0;
  let bleedSum = 0;
  let eSum = 0;
  let prev = x;
  const maxSteps = GENERATIONS * 3;
  while (Q < qTarget && steps < maxSteps) {
    let next;
    let bleed = 0;
    const Dnow = nrmse(x, origin);
    const Bnow = bleedProxy(x);
    if (arm === 'control_a') {
      // Scale intensity so Control A can spend transformation budget (fair pressure).
      next = ordinaryStep(x, intensity);
      bleed = bleedProxy(next);
    } else if (arm === 'control_b_random') {
      const k = 0.05 + 0.12 * rnd();
      const t = eTransform(x, k);
      const ratio = 1.1 + 1.5 * rnd();
      const mid = Math.floor(t.length / ratio);
      const s = new Float64Array(t.length);
      for (let i = 0; i < t.length; i++) s[i] = (1 / ratio) * t[i] + (1 - 1 / ratio) * t[(i + mid) % t.length];
      const r = contain(normalizeRms(s, 1), COMPOSITE_SCHEDULE[steps % COMPOSITE_SCHEDULE.length]);
      next = r.series;
      bleed = r.bleed;
    } else if (arm === 'matched_nonprime') {
      const r = applyOrder(x, order, steps, Dnow, Bnow, phiStrength, false);
      next = r.series;
      bleed = r.bleed;
    } else if (arm === 'unified_openloop') {
      // V1-style open-loop φ structure for contrast
      const t = eTransform(x, 0.08);
      const s = phiStructureOpenLoop(t);
      const r = contain(s, PRIME_SCHEDULE[steps % PRIME_SCHEDULE.length]);
      next = r.series;
      bleed = r.bleed;
    } else {
      // unified diagnostic: φ as regulator
      const r = applyOrder(x, order, steps, Dnow, Bnow, phiStrength, usePrime);
      next = r.series;
      bleed = r.bleed;
    }
    const q = pathLength(next, prev);
    Q += q;
    const u = usefulEvolution(prev, next, origin);
    bleedSum += bleed;
    eSum += u.E;
    prev = next;
    x = next;
    steps++;
  }
  const final = usefulEvolution(prev, x, origin); // identity at end
  const D = nrmse(x, origin);
  const B = bleedSum / Math.max(1, steps);
  const E = eSum / Math.max(1, steps);
  return {
    arm,
    fixtureId: fixture.id,
    steps,
    Q,
    D,
    B,
    E,
    efficiency: E / (D + EPS),
    finalRecoverable: Math.max(0, pearson(x, origin)),
  };
}

function summarize(rows) {
  const Ds = rows.map((r) => r.D);
  const Bs = rows.map((r) => r.B);
  const Es = rows.map((r) => r.E);
  const Effs = rows.map((r) => r.efficiency);
  return {
    n: rows.length,
    meanD: mean(Ds),
    sdD: stdev(Ds),
    meanB: mean(Bs),
    sdB: stdev(Bs),
    meanE: mean(Es),
    sdE: stdev(Es),
    meanEfficiency: mean(Effs),
    sdEfficiency: stdev(Effs),
    meanQ: mean(rows.map((r) => r.Q)),
    meanSteps: mean(rows.map((r) => r.steps)),
  };
}

function bootstrapMeanCI(xs, resamples = 200, seed = 0xc1) {
  const rnd = mulberry32(seed);
  const means = [];
  for (let i = 0; i < resamples; i++) {
    let s = 0;
    for (let j = 0; j < xs.length; j++) s += xs[Math.floor(rnd() * xs.length)];
    means.push(s / xs.length);
  }
  means.sort((a, b) => a - b);
  const lo = means[Math.floor(0.025 * means.length)];
  const hi = means[Math.min(means.length - 1, Math.floor(0.975 * means.length))];
  return { lo, hi, mean: mean(xs) };
}

/** Perturbation / recovery: push D, ask whether next step corrects toward band. */
function perturbationRecovery(fixture, opts = {}) {
  const { phiStrength = 1.0, order = 'e_phi_p' } = opts;
  // Build a mid-state with mild free run
  let x = Float64Array.from(fixture.x0);
  for (let g = 0; g < 4; g++) {
    const D = nrmse(x, fixture.x0);
    const B = bleedProxy(x);
    const r = applyOrder(x, order, g, D, B, phiStrength, true);
    x = r.series;
  }
  const origin = fixture.x0;
  const baseD = nrmse(x, origin);

  function oneShot(scale) {
    const pert = new Float64Array(x.length);
    const m = mean(x);
    for (let i = 0; i < x.length; i++) pert[i] = m + (x[i] - m) * scale;
    const Dp = nrmse(normalizeRms(pert, 1), origin);
    const Bp = bleedProxy(pert);
    const r = applyOrder(normalizeRms(pert, 1), order, 0, Dp, Bp, phiStrength, true);
    const Dn = nrmse(r.series, origin);
    return { Dp, Dn, delta: Dn - Dp, towardBand: Math.abs(Dn - 0.5) < Math.abs(Dp - 0.5) };
  }

  const low = oneShot(0.3); // shrink toward origin → low D
  const high = oneShot(2.2); // inflate → high D
  // Homeostatic signature: high-D should reduce D (delta < 0); low-D may increase D (delta > 0)
  const highCorrects = high.delta < 0;
  const lowAllows = low.delta >= -0.02; // not forced further down aggressively
  return {
    baseD,
    low,
    high,
    homeostaticSignature: highCorrects && lowAllows,
  };
}

export function runDiagnosticMatrix() {
  const fixtures = fixtureFamily();

  // --- Free-running reminder of V1 asymmetry (not the gate) ---
  // Matched-budget primary comparison
  const rowsA = [];
  const rowsB = [];
  const rowsM = []; // matched non-prime containment + regulator
  const rowsU = []; // prime + regulator
  const rowsOpen = []; // V1 open-loop φ contrast under matched budget

  fixtures.forEach((f, i) => {
    // Control A intensity tuned so it can spend ~Q_TARGET (fair pressure)
    rowsA.push(
      runMatchedBudget('control_a', f, {
        intensity: 8,
        rnd: mulberry32(0xa000 + i),
      }),
    );
    rowsB.push(
      runMatchedBudget('control_b_random', f, {
        rnd: mulberry32(0xb000 + i),
      }),
    );
    rowsM.push(
      runMatchedBudget('matched_nonprime', f, {
        order: 'e_phi_p',
        phiStrength: 1,
        rnd: mulberry32(0xc000 + i),
      }),
    );
    rowsU.push(
      runMatchedBudget('unified_regulator', f, {
        order: 'e_phi_p',
        phiStrength: 1,
        usePrime: true,
        rnd: mulberry32(0xd000 + i),
      }),
    );
    rowsOpen.push(
      runMatchedBudget('unified_openloop', f, {
        rnd: mulberry32(0xe000 + i),
      }),
    );
  });

  const A = summarize(rowsA);
  const B = summarize(rowsB);
  const M = summarize(rowsM);
  const U = summarize(rowsU);
  const Open = summarize(rowsOpen);

  const effCI_U = bootstrapMeanCI(rowsU.map((r) => r.efficiency));
  const effCI_A = bootstrapMeanCI(rowsA.map((r) => r.efficiency));

  // φ strength sweep (matched budget, prime contain)
  const phiSweep = {};
  for (const s of PHI_STRENGTHS) {
    const rows = fixtures.map((f, i) =>
      runMatchedBudget('unified_regulator', f, {
        phiStrength: s,
        order: 'e_phi_p',
        rnd: mulberry32(0xf000 + i + s * 10),
      }),
    );
    phiSweep[s] = summarize(rows);
  }

  // Order permutations
  const orderSweep = {};
  for (const order of ORDER_PERMS) {
    const rows = fixtures.map((f, i) =>
      runMatchedBudget('unified_regulator', f, {
        order,
        phiStrength: 1,
        rnd: mulberry32(0x1000 + i + order.length * 3),
      }),
    );
    orderSweep[order] = summarize(rows);
  }
  const bestOrder = Object.entries(orderSweep).sort(
    (a, b) => b[1].meanEfficiency - a[1].meanEfficiency || a[1].meanB - b[1].meanB,
  )[0];

  // Perturbation / recovery across fixtures
  const pertRows = fixtures.map((f) => perturbationRecovery(f, { phiStrength: 1, order: 'e_phi_p' }));
  const pertRate = pertRows.filter((p) => p.homeostaticSignature).length / pertRows.length;

  // Multidimensional diagnostic gate (seed-level means)
  const checks = {
    E_above_A: U.meanE > A.meanE,
    B_below_A: U.meanB < A.meanB,
    D_positive: U.meanD > D_LOW,
    D_bounded: U.meanD < D_COLLAPSE,
    efficiency_above_A: U.meanEfficiency > A.meanEfficiency,
    efficiency_above_matched_containment: U.meanEfficiency > M.meanEfficiency,
    efficiency_above_openloop: U.meanEfficiency > Open.meanEfficiency,
  };
  const diagnostic_gate_pass =
    checks.E_above_A &&
    checks.B_below_A &&
    checks.D_positive &&
    checks.D_bounded &&
    checks.efficiency_above_A &&
    checks.efficiency_above_matched_containment;

  const experiments = [
    {
      id: 'D0_protocol',
      title: 'EPH-RH-D protocol — matched budget · efficiency · regulator φ',
      protocol: DIAGNOSTIC_PROTOCOL,
      qTarget: Q_TARGET,
      gate: { ...DIAGNOSTIC_GATE },
      pass: true,
      interpretation:
        'Diagnostic matrix separates transformation intensity from architecture quality. V1 Goldilocks hit-rate remains locked development evidence.',
      honesty: 'Troubleshooting layer — not a silent rewrite of V1 null.',
    },
    {
      id: 'D1_matched_budget_pareto',
      title: 'Matched-Q comparison — A / random B / matched non-prime / regulator / open-loop',
      control_a: A,
      control_b_random: B,
      matched_nonprime: M,
      unified_regulator: U,
      unified_openloop_v1_style: Open,
      efficiency_ci: { unified: effCI_U, control_a: effCI_A },
      checks,
      diagnostic_gate_pass,
      pass: true,
      interpretation: diagnostic_gate_pass
        ? 'Under matched transformation budget, regulator φ + prime clears the multidimensional efficiency/containment gate vs A and matched non-prime.'
        : 'Under matched transformation budget, regulator φ + prime does NOT clear the multidimensional gate — report which checks failed.',
      honesty:
        'Primary diagnostic question: same change budget → better E/D and lower B? Goldilocks hit-rate is secondary.',
    },
    {
      id: 'D2_phi_strength_sweep',
      title: 'φ regulator strength sweep (matched Q)',
      phiSweep,
      bestStrength: Object.entries(phiSweep).sort(
        (a, b) => b[1].meanEfficiency - a[1].meanEfficiency,
      )[0]?.[0],
      pass: true,
      interpretation: 'Tests whether φ coupling scale (not merely φ presence) drives efficiency.',
      honesty: 'Scale search is exploratory; not a claim that φ is optimal.',
    },
    {
      id: 'D3_order_permutations',
      title: 'Operation order permutations (matched Q)',
      orderSweep,
      bestOrder: bestOrder?.[0] ?? null,
      bestSummary: bestOrder?.[1] ?? null,
      pass: true,
      interpretation: `Best efficiency order on these fixtures: ${bestOrder?.[0] ?? 'n/a'}.`,
      honesty: 'Ordering is an untested causal assumption in V1; permutations are diagnostic.',
    },
    {
      id: 'D4_perturbation_recovery',
      title: 'Perturbation / recovery — high-D should self-correct',
      homeostaticSignatureRate: pertRate,
      n: pertRows.length,
      samples: pertRows.slice(0, 3),
      pass: true,
      interpretation:
        pertRate >= 0.5
          ? 'Majority of fixtures show high-D correction signature under regulator φ.'
          : 'Homeostatic correction signature is weak/mixed under current regulator settings.',
      honesty: 'Static attractor ≠ homeostasis; this probe tests negative feedback around the band.',
    },
    {
      id: 'D5_prime_vs_matched_containment',
      title: 'Prime containment vs matched non-prime containment (same regulator)',
      prime: U,
      matched_nonprime: M,
      prime_wins_efficiency: U.meanEfficiency > M.meanEfficiency,
      prime_wins_bleed: U.meanB < M.meanB,
      pass: true,
      interpretation:
        U.meanEfficiency > M.meanEfficiency && U.meanB <= M.meanB
          ? 'Prime schedule beats matched composite containment on efficiency and bleed under this regulator.'
          : 'No clean prime-specific advantage over matched non-prime containment on these fixtures.',
      honesty: 'Separates “containment helps” from “primality helps.”',
    },
  ];

  return {
    protocol: DIAGNOSTIC_PROTOCOL,
    diagnostic_gate_pass,
    engine_shelf_include: DIAGNOSTIC_GATE.engine_shelf_requires_gate && diagnostic_gate_pass,
    engine_shelf_decision:
      DIAGNOSTIC_GATE.engine_shelf_requires_gate && diagnostic_gate_pass
        ? 'INCLUDE — diagnostic multidimensional gate passed under matched transformation budget.'
        : 'WITHHOLD — diagnostic gate failed or mixed; V1 null remains; still application companion.',
    readout: {
      matched_budget: { A, B, M, U, Open },
      checks,
      bestOrder: bestOrder?.[0] ?? null,
      bestPhiStrength: Object.entries(phiSweep).sort(
        (a, b) => b[1].meanEfficiency - a[1].meanEfficiency,
      )[0]?.[0],
      homeostaticSignatureRate: pertRate,
    },
    experiments,
  };
}
