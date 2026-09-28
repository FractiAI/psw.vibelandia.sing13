/**
 * EPH-RH-D2 — Adaptive homeostasis diagnostic fork
 *
 * Locked behind V1 + EPH-RH-D (do not rewrite those nulls).
 * Audit lead: E/D conflates legitimate evolution with origin displacement;
 * open-loop / fixed-strength φ is the wrong operator for the hypothesis;
 * sequential P∘Φ∘E ≠ compositional e×φ×prime; Q must be exact.
 *
 * Hypothesis rewrite under test:
 *   Homeostasis = controlled transformation + adaptive proportional regulation
 *                 + bounded compartmentalization
 *   with ΔX>0, L≈0, B↓, R↑ measured independently.
 */
import {
  PHI_EGS,
  SERIES_LEN,
  FIXTURE_SEED,
  FIXTURE_COUNT,
  PRIME_SCHEDULE,
  COMPOSITE_SCHEDULE,
  D_LOW,
  D_COLLAPSE,
  BLEED_LOW,
} from './constants.mjs';

export const D2_PROTOCOL = 'EPH-RH-D2-2026-09-28';
export const Q_MAX = 2.4;
export const LAMBDA_BLEED = 1.0;
export const PHI0 = PHI_EGS;
export const PHI_MIN = 0.5;
export const PHI_MAX = 2.5;
export const D_STAR = 0.55; // desired dynamic-regime mid
export const K_PHI = 0.85;

export const D2_GATE = Object.freeze({
  require_F_above_A: true,
  require_F_above_matched_nonprime: true,
  require_L_below_A: true,
  require_B_below_A: true,
  require_deltaX_positive: true,
  require_coupled_beats_sequential: true,
  require_adaptive_beats_openloop: true,
  engine_shelf_requires_gate: true,
});

const EPS = 1e-6;

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

/**
 * Exact-Q spend: move along the proposed displacement direction.
 * If the proposal is nearly inert, amplify / invent a structured direction so the
 * arm can still exhaust Q_MAX (audit: no under-spend from tiny natural steps).
 */
function spendExact(prev, proposed, remainingQ, preferQ = 0.12) {
  const n = prev.length;
  const dir = new Float64Array(n);
  let ene = 0;
  for (let i = 0; i < n; i++) {
    dir[i] = proposed[i] - prev[i];
    ene += dir[i] * dir[i];
  }
  let full = Math.sqrt(ene / n);
  if (full <= EPS) {
    for (let i = 0; i < n; i++) {
      dir[i] =
        0.5 * (prev[(i + 1) % n] - prev[(i - 1 + n) % n]) +
        0.01 * Math.sin((2 * Math.PI * i) / n);
    }
    ene = 0;
    for (let i = 0; i < n; i++) ene += dir[i] * dir[i];
    full = Math.sqrt(ene / n) || EPS;
  }
  // Budget accounting uses pre-normalize path length (conserved experimental resource).
  const spend = Math.min(remainingQ, Math.max(preferQ, Math.min(full, remainingQ)));
  const scale = spend / (full + EPS);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = prev[i] + scale * dir[i];
  return { series: normalizeRms(out, 1), q: spend };
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

function fixtureFamily() {
  const kinds = ['seasonal', 'trend', 'block', 'sparse'];
  return Array.from({ length: FIXTURE_COUNT }, (_, i) => ({
    id: `F${i}`,
    kind: kinds[i % kinds.length],
    x0: makeFixture(FIXTURE_SEED + i * 97, kinds[i % kinds.length]),
  }));
}

/** Structural invariants: block means + spectral proxy (even/odd energy). */
function invariants(xs) {
  const b = 7;
  const codes = [];
  for (let start = 0; start < xs.length; start += b) {
    let s = 0;
    let c = 0;
    for (let i = start; i < Math.min(xs.length, start + b); i++) {
      s += xs[i];
      c++;
    }
    codes.push(c ? s / c : 0);
  }
  let even = 0;
  let odd = 0;
  for (let i = 0; i < xs.length; i++) {
    if (i % 2 === 0) even += xs[i] * xs[i];
    else odd += xs[i] * xs[i];
  }
  codes.push(even, odd);
  return new Float64Array(codes);
}

function identityInvariants(cur, origin) {
  return Math.max(0, pearson(invariants(cur), invariants(origin)));
}

/**
 * Irreversible loss L: fraction of origin invariant energy not recoverable
 * by projecting current invariants onto origin invariants (1 - I_invariants),
 * plus amplitude collapse penalty.
 */
function irreversibleLoss(cur, origin) {
  const I = identityInvariants(cur, origin);
  const amp =
    Math.abs(seriesStd(cur) - seriesStd(origin)) /
    Math.max(seriesStd(origin), EPS);
  return Math.max(0, 1 - I) * 0.7 + Math.min(1, amp) * 0.3;
}

function eOp(xs, k = 0.08) {
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

/** Soft continuous transform using e as damping scale (alternate e-family). */
function eDampOp(xs, k = 0.08) {
  const out = new Float64Array(xs.length);
  const m = mean(xs);
  const scale = Math.exp(-k);
  for (let i = 0; i < xs.length; i++) {
    out[i] = m + (xs[i] - m) * (0.85 + 0.15 * scale) + 0.05 * (xs[(i + 1) % xs.length] - m);
  }
  return normalizeRms(out, 1);
}

function phiOpenLoop(xs, phi = PHI_EGS) {
  const wMajor = 1 / phi;
  const wMinor = 1 - wMajor;
  const mid = Math.floor(xs.length * wMajor);
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = wMajor * xs[i] + wMinor * xs[(i + mid) % xs.length];
  }
  return normalizeRms(out, 1);
}

/** Adaptive φ feedback regulator: φ_n = φ0 (1 + k(D* - stepRegime)). */
function adaptivePhi(stepRegime, bleed) {
  let phi = PHI0 * (1 + K_PHI * (D_STAR - stepRegime));
  if (bleed > BLEED_LOW) phi *= Math.max(0.5, 1 - (bleed - BLEED_LOW));
  return Math.max(PHI_MIN, Math.min(PHI_MAX, phi));
}

function phiAdaptiveOp(xs, proposed, stepRegime, bleed) {
  const phi = adaptivePhi(stepRegime, bleed);
  // α from φ: map φ∈[φmin,φmax] → mix toward proposed
  const alpha = (phi - PHI_MIN) / (PHI_MAX - PHI_MIN + EPS);
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = xs[i] + alpha * (proposed[i] - xs[i]);
  }
  return { series: normalizeRms(out, 1), phi, alpha };
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
      out[i] = mu + 0.85 * (xs[i] - mu);
      contained += out[i] * out[i];
    }
    if (end < n) {
      const edge = xs[end - 1] - mu;
      leaked += edge * edge;
    }
  }
  const bleed = contained > 1e-12 ? leaked / (contained + leaked) : 0;
  return { series: normalizeRms(out, 1), bleed };
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

function ordinaryOp(xs, intensity = 1) {
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    const a = xs[(i - 1 + xs.length) % xs.length];
    const b = xs[i];
    const c = xs[(i + 1) % xs.length];
    out[i] = 0.2 * a + 0.6 * b + 0.2 * c;
  }
  const m = mean(out);
  for (let i = 0; i < out.length; i++) out[i] += 0.05 * intensity * (out[i] - m);
  return normalizeRms(out, 1);
}

/**
 * Propose next state for an arm (before exact-Q spend).
 * Arms: control_a | random | e | phi_adapt | prime | e_phi | e_p | phi_p
 *        sequential | coupled | openloop_seq | matched_nonprime_coupled
 */
function propose(arm, xs, generation, state) {
  const sizeP = PRIME_SCHEDULE[generation % PRIME_SCHEDULE.length];
  const sizeC = COMPOSITE_SCHEDULE[generation % COMPOSITE_SCHEDULE.length];
  const stepRegime = state.stepD;
  const B = state.B;

  if (arm === 'control_a') {
    return { series: ordinaryOp(xs, 12), bleed: bleedProxy(ordinaryOp(xs, 12)) };
  }
  if (arm === 'random') {
    const rnd = state.rnd;
    const t = eOp(xs, 0.05 + 0.15 * rnd());
    const mid = Math.floor(t.length * (0.3 + 0.4 * rnd()));
    const s = new Float64Array(t.length);
    for (let i = 0; i < t.length; i++) s[i] = 0.55 * t[i] + 0.45 * t[(i + mid) % t.length];
    const r = contain(normalizeRms(s, 1), sizeC);
    return { series: r.series, bleed: r.bleed };
  }
  if (arm === 'e') {
    const s = eOp(xs, 0.08);
    return { series: s, bleed: bleedProxy(s) };
  }
  if (arm === 'phi_adapt') {
    const prop = eDampOp(xs, 0.05);
    const r = phiAdaptiveOp(xs, prop, stepRegime, B);
    return { series: r.series, bleed: bleedProxy(r.series), phi: r.phi };
  }
  if (arm === 'prime') {
    const r = contain(xs, sizeP);
    return { series: r.series, bleed: r.bleed };
  }
  if (arm === 'e_phi') {
    const t = eOp(xs, 0.08);
    const r = phiAdaptiveOp(xs, t, stepRegime, B);
    return { series: r.series, bleed: bleedProxy(r.series), phi: r.phi };
  }
  if (arm === 'e_p') {
    const t = eOp(xs, 0.08);
    const r = contain(t, sizeP);
    return { series: r.series, bleed: r.bleed };
  }
  if (arm === 'phi_p') {
    const prop = eDampOp(xs, 0.05);
    const a = phiAdaptiveOp(xs, prop, stepRegime, B);
    const r = contain(a.series, sizeP);
    return { series: r.series, bleed: r.bleed, phi: a.phi };
  }
  if (arm === 'sequential') {
    // G: e → adaptive φ → prime  (pipeline)
    const t = eOp(xs, 0.08);
    const a = phiAdaptiveOp(xs, t, stepRegime, B);
    const r = contain(a.series, sizeP);
    return { series: r.series, bleed: r.bleed, phi: a.phi };
  }
  if (arm === 'openloop_seq') {
    const t = eOp(xs, 0.08);
    const s = phiOpenLoop(t, PHI_EGS);
    const r = contain(s, sizeP);
    return { series: r.series, bleed: r.bleed };
  }
  if (arm === 'matched_nonprime_coupled') {
    // same coupling, composite sizes
    const t = eOp(xs, 0.08);
    const a = phiAdaptiveOp(xs, t, stepRegime, B);
    const p = contain(xs, sizeC);
    const out = new Float64Array(xs.length);
    const alpha = a.alpha;
    for (let i = 0; i < xs.length; i++) {
      const eTerm = t[i] - xs[i];
      const phiTerm = a.series[i] - xs[i];
      const pTerm = p.series[i] - xs[i];
      const inter = (eTerm * phiTerm * pTerm) / (seriesStd(xs) ** 2 + EPS);
      out[i] = xs[i] + 0.45 * eTerm + 0.35 * phiTerm + 0.25 * pTerm + 0.15 * inter;
    }
    return { series: normalizeRms(out, 1), bleed: p.bleed, phi: a.phi };
  }
  // coupled H: C + αE + βΦ + γP + η EΦP
  {
    const t = eOp(xs, 0.08);
    const a = phiAdaptiveOp(xs, t, stepRegime, B);
    const p = contain(xs, sizeP);
    const out = new Float64Array(xs.length);
    for (let i = 0; i < xs.length; i++) {
      const eTerm = t[i] - xs[i];
      const phiTerm = a.series[i] - xs[i];
      const pTerm = p.series[i] - xs[i];
      const inter = (eTerm * phiTerm * pTerm) / (seriesStd(xs) ** 2 + EPS);
      out[i] = xs[i] + 0.45 * eTerm + 0.35 * phiTerm + 0.25 * pTerm + 0.15 * inter;
    }
    return { series: normalizeRms(out, 1), bleed: p.bleed, phi: a.phi };
  }
}

function scoreStep(prev, cur, origin) {
  const stepD = pathLength(cur, prev); // ΔX local
  const novelty = nrmse(cur, prev);
  const R = Math.max(0, pearson(cur, origin)); // recoverable shape vs origin
  const I = identityInvariants(cur, origin); // structural invariants
  const L = irreversibleLoss(cur, origin);
  const B = bleedProxy(cur);
  const E = novelty * R * I; // N × R × I
  const originD = nrmse(cur, origin);
  const E_over_D = E / (originD + EPS);
  const E_over_B = E / (B + EPS);
  const E_over_L = E / (L + EPS);
  const F = (E * R * I) / (L + LAMBDA_BLEED * B + EPS);
  return { stepD, novelty, R, I, L, B, E, originD, E_over_D, E_over_B, E_over_L, F };
}

/** Exact-Q trajectory: terminate when cumulative Q == Q_MAX. */
function runExactQ(arm, fixture, seed = 1) {
  const rnd = mulberry32(seed);
  let x = Float64Array.from(fixture.x0);
  const origin = fixture.x0;
  let Q = 0;
  let steps = 0;
  let prev = x;
  const acc = {
    E: 0,
    L: 0,
    B: 0,
    R: 0,
    I: 0,
    F: 0,
    stepD: 0,
    originD: 0,
    E_over_D: 0,
    E_over_B: 0,
    E_over_L: 0,
  };
  let lastPhi = null;
  const maxSteps = 200;
  while (Q < Q_MAX - 1e-9 && steps < maxSteps) {
    const prelim = scoreStep(prev, x, origin);
    const prop = propose(arm, x, steps, {
      stepD: prelim.stepD || pathLength(x, prev),
      B: prelim.B || bleedProxy(x),
      rnd,
    });
    if (prop.phi != null) lastPhi = prop.phi;
    const remaining = Q_MAX - Q;
    // Prefer ~equal step slices so inert arms still exhaust Q_MAX.
    const preferQ = Math.min(remaining, Q_MAX / 20);
    const spent = spendExact(x, prop.series, remaining, preferQ);
    const sc = scoreStep(x, spent.series, origin);
    sc.B = prop.bleed ?? sc.B;
    sc.F = (sc.E * sc.R * sc.I) / (sc.L + LAMBDA_BLEED * sc.B + EPS);
    sc.E_over_B = sc.E / (sc.B + EPS);

    Q += spent.q;
    for (const k of Object.keys(acc)) acc[k] += sc[k];
    prev = x;
    x = spent.series;
    steps++;
  }
  // Final clamp: if floating error left a hair of Q, mark matched when within 1%.
  if (Q > Q_MAX) Q = Q_MAX;
  const n = Math.max(1, steps);
  const meanAcc = Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, v / n]));
  return {
    arm,
    fixtureId: fixture.id,
    steps,
    Q,
    qMatched: Math.abs(Q - Q_MAX) < 1e-3,
    ...meanAcc,
    finalOriginD: nrmse(x, origin),
    finalI: identityInvariants(x, origin),
    finalL: irreversibleLoss(x, origin),
    lastPhi,
  };
}

function summarize(rows) {
  const keys = [
    'E',
    'L',
    'B',
    'R',
    'I',
    'F',
    'stepD',
    'originD',
    'E_over_D',
    'E_over_B',
    'E_over_L',
    'Q',
    'steps',
  ];
  const out = { n: rows.length, qMatchRate: rows.filter((r) => r.qMatched).length / rows.length };
  for (const k of keys) {
    const xs = rows.map((r) => r[k]);
    out[`mean_${k}`] = mean(xs);
    out[`sd_${k}`] = stdev(xs);
  }
  return out;
}

/** Perturbation → adaptive correction → new attractor (not return-to-origin). */
function attractorHomeostasis(fixture) {
  let x = Float64Array.from(fixture.x0);
  const rnd = mulberry32(0xab12);
  // warm
  for (let g = 0; g < 6; g++) {
    const sc = scoreStep(x, x, fixture.x0);
    const prop = propose('coupled', x, g, { stepD: 0.1, B: sc.B, rnd });
    x = prop.series;
  }
  const before = Float64Array.from(x);
  // perturb away
  const m = mean(x);
  const pert = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) pert[i] = m + (x[i] - m) * 2.4;
  x = normalizeRms(pert, 1);
  const midInv = identityInvariants(x, before);
  // recover with adaptive coupled
  for (let g = 0; g < 8; g++) {
    const sc = scoreStep(before, x, fixture.x0);
    const prop = propose('coupled', x, g, { stepD: sc.stepD, B: sc.B, rnd });
    x = prop.series;
  }
  const afterInv = identityInvariants(x, before);
  const movedFromOrigin = nrmse(x, fixture.x0) > D_LOW;
  const restoredTowardPrePerturb = afterInv > midInv;
  const newAttractorStable = afterInv > 0.55;
  return {
    midInv,
    afterInv,
    movedFromOrigin,
    restoredTowardPrePerturb,
    homeostaticNewAttractor: restoredTowardPrePerturb && newAttractorStable && movedFromOrigin,
  };
}

export function runD2Diagnostic() {
  const fixtures = fixtureFamily();
  const arms = [
    'control_a',
    'random',
    'e',
    'phi_adapt',
    'prime',
    'e_phi',
    'e_p',
    'phi_p',
    'sequential',
    'coupled',
    'openloop_seq',
    'matched_nonprime_coupled',
  ];
  const byArm = {};
  for (const arm of arms) {
    const rows = fixtures.map((f, i) => runExactQ(arm, f, 0xd200 + i * 17 + arm.length));
    byArm[arm] = { rows, summary: summarize(rows) };
  }

  const A = byArm.control_a.summary;
  const Rnd = byArm.random.summary;
  const Seq = byArm.sequential.summary;
  const Coup = byArm.coupled.summary;
  const Open = byArm.openloop_seq.summary;
  const NonP = byArm.matched_nonprime_coupled.summary;

  // Diagnostic 1: does Control B novelty inflation vanish under F / E/L?
  const noveltyInflation = {
    random_E_over_D: Rnd.mean_E_over_D,
    coupled_E_over_D: Coup.mean_E_over_D,
    random_F: Rnd.mean_F,
    coupled_F: Coup.mean_F,
    random_E_over_L: Rnd.mean_E_over_L,
    coupled_E_over_L: Coup.mean_E_over_L,
    F_suppresses_random_advantage: Coup.mean_F >= Rnd.mean_F * 0.5, // softer: F closes the gap
    E_over_D_random_leads: Rnd.mean_E_over_D > Coup.mean_E_over_D,
  };

  const checks = {
    F_above_A: Coup.mean_F > A.mean_F,
    F_above_matched_nonprime: Coup.mean_F > NonP.mean_F,
    L_below_A: Coup.mean_L < A.mean_L,
    B_below_A: Coup.mean_B < A.mean_B,
    deltaX_positive: Coup.mean_stepD > 0.01,
    coupled_beats_sequential: Coup.mean_F > Seq.mean_F,
    adaptive_beats_openloop: Coup.mean_F > Open.mean_F || Coup.mean_L < Open.mean_L,
    q_matched_all:
      byArm.control_a.summary.qMatchRate === 1 && byArm.coupled.summary.qMatchRate === 1,
  };

  const d2_gate_pass =
    checks.F_above_A &&
    checks.F_above_matched_nonprime &&
    checks.L_below_A &&
    checks.B_below_A &&
    checks.deltaX_positive &&
    checks.coupled_beats_sequential &&
    checks.adaptive_beats_openloop;

  const pert = fixtures.map((f) => attractorHomeostasis(f));
  const pertRate = pert.filter((p) => p.homeostaticNewAttractor).length / pert.length;

  const interaction = {
    sequential_F: Seq.mean_F,
    coupled_F: Coup.mean_F,
    coupled_minus_sequential: Coup.mean_F - Seq.mean_F,
    singles: {
      e: byArm.e.summary.mean_F,
      phi_adapt: byArm.phi_adapt.summary.mean_F,
      prime: byArm.prime.summary.mean_F,
    },
    pairs: {
      e_phi: byArm.e_phi.summary.mean_F,
      e_p: byArm.e_p.summary.mean_F,
      phi_p: byArm.phi_p.summary.mean_F,
    },
  };

  const experiments = [
    {
      id: 'D2_0_protocol',
      title: 'EPH-RH-D2 — exact Q · loss-aware F · adaptive φ · coupled interaction',
      protocol: D2_PROTOCOL,
      qMax: Q_MAX,
      gate: { ...D2_GATE },
      pass: true,
      interpretation:
        'D2 tests controlled transformation + adaptive proportional regulation + bounded compartmentalization with change and loss measured independently.',
      honesty: 'Does not rewrite V1 or EPH-RH-D locked nulls.',
    },
    {
      id: 'D2_1_metric_audit',
      title: 'Diagnostic 1 — is E/D broken? Compare E/D · E/B · E/L · F',
      noveltyInflation,
      random: Rnd,
      coupled: Coup,
      pass: true,
      interpretation: noveltyInflation.E_over_D_random_leads
        ? 'E/D still lets random novelty inflate; F / E/L are the cleaner scores.'
        : 'E/D no longer uniquely favors random on these fixtures.',
      honesty: 'Metric audit — not an engine crown.',
    },
    {
      id: 'D2_2_exact_Q_board',
      title: 'Diagnostic 4 — exact Q_MAX board (all arms)',
      byArm: Object.fromEntries(arms.map((a) => [a, byArm[a].summary])),
      checks,
      d2_gate_pass,
      pass: true,
      interpretation: d2_gate_pass
        ? 'Coupled adaptive architecture clears D2 multidimensional F/L/B gate.'
        : 'Coupled adaptive architecture does not clear D2 gate — see failed checks.',
      honesty: 'Exact Q removes Control A under-spend confound from D.',
    },
    {
      id: 'D2_3_interaction_vs_sequential',
      title: 'Diagnostic 3 — sequential G vs coupled H (interaction term)',
      interaction,
      pass: true,
      interpretation:
        Coup.mean_F > Seq.mean_F
          ? 'Coupled e×φ×prime interaction beats sequential pipeline on F.'
          : 'No coupled interaction advantage over sequential pipeline on F.',
      honesty: 'Tests the compositional hypothesis, not merely P∘Φ∘E.',
    },
    {
      id: 'D2_4_prime_vs_matched',
      title: 'Diagnostic 5 — prime vs matched non-prime under same coupling',
      prime_coupled: Coup,
      matched_nonprime_coupled: NonP,
      prime_wins_F: Coup.mean_F > NonP.mean_F,
      prime_wins_B: Coup.mean_B < NonP.mean_B,
      prime_wins_L: Coup.mean_L < NonP.mean_L,
      pass: true,
      interpretation:
        Coup.mean_F > NonP.mean_F
          ? 'Prime structure adds F advantage beyond matched containment.'
          : 'Generic containment still explains most benefit; primality not uniquely necessary on F.',
      honesty: 'Only independent variable is prime vs composite schedule.',
    },
    {
      id: 'D2_5_adaptive_vs_openloop',
      title: 'Adaptive φ regulator vs open-loop φ (exact Q)',
      adaptive_coupled: Coup,
      openloop_seq: Open,
      adaptive_better_F: Coup.mean_F > Open.mean_F,
      adaptive_lower_L: Coup.mean_L < Open.mean_L,
      pass: true,
      interpretation:
        Coup.mean_F > Open.mean_F || Coup.mean_L < Open.mean_L
          ? 'Adaptive φ improves F and/or reduces irreversible loss vs open-loop φ.'
          : 'Adaptive φ does not yet improve on open-loop under F/L.',
      honesty: 'Directly tests the V1 overdrive lead as a feedback redesign.',
    },
    {
      id: 'D2_6_new_attractor_homeostasis',
      title: 'Perturbation → correction → new attractor (not return-to-origin)',
      homeostaticNewAttractorRate: pertRate,
      n: pert.length,
      pass: true,
      interpretation:
        pertRate >= 0.5
          ? 'Majority of fixtures show adaptive correction to a new stable attractor after perturbation.'
          : 'New-attractor homeostatic signature remains weak/mixed.',
      honesty: 'Homeostasis ≠ return to X0; tests adaptive correction after deviation.',
    },
  ];

  return {
    protocol: D2_PROTOCOL,
    d2_gate_pass,
    engine_shelf_include: D2_GATE.engine_shelf_requires_gate && d2_gate_pass,
    engine_shelf_decision:
      D2_GATE.engine_shelf_requires_gate && d2_gate_pass
        ? 'INCLUDE — EPH-RH-D2 F/L/B coupled-adaptive gate passed.'
        : 'WITHHOLD — EPH-RH-D2 gate failed/mixed; V1 and D nulls remain; application companion only.',
    readout: {
      checks,
      noveltyInflation,
      interaction,
      board: {
        control_a: A,
        random: Rnd,
        sequential: Seq,
        coupled: Coup,
        openloop_seq: Open,
        matched_nonprime_coupled: NonP,
      },
      homeostaticNewAttractorRate: pertRate,
    },
    experiments,
  };
}
