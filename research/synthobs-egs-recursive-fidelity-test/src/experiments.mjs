/**
 * ERFT V1 — numeric recursive fidelity experiments.
 * Same recursion / evaluator / depth; only the constant c changes.
 * Suite pass = protocol integrity. Φ win is optional empirical outcome.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  SQRT2,
  E_CONST,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  STANDALONE_REPO,
  GENERATIONS,
  HOLD_OUT_FRACTION,
  NAMED_ARMS,
  BLIND_CONSTANTS,
  SWEEP_MIN,
  SWEEP_MAX,
  SWEEP_STEPS,
  RANDOM_ARM_SEED,
  RANDOM_ARM_COUNT,
  RANDOM_ARM_LO,
  RANDOM_ARM_HI,
  MECHANISMS,
  PROTOCOL_VERSION,
  PRE_REGISTERED_HYPOTHESIS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

/** Mulberry32 PRNG — reproducible arms / noise. */
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clone(xs) {
  return Float64Array.from(xs);
}

function mean(xs) {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
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

function mae(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.abs(a[i] - b[i]);
  return s / n;
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  const ma = mean(a.subarray ? a.subarray(0, n) : a.slice(0, n));
  const mb = mean(b.subarray ? b.subarray(0, n) : b.slice(0, n));
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

function normalizeEnergy(xs, targetRms) {
  let s = 0;
  for (const x of xs) s += x * x;
  const rms = Math.sqrt(s / xs.length) || 1;
  const g = targetRms / rms;
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) out[i] = xs[i] * g;
  return out;
}

function smooth3(xs) {
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    const a = xs[Math.max(0, i - 1)];
    const b = xs[i];
    const c = xs[Math.min(xs.length - 1, i + 1)];
    out[i] = (a + b + c) / 3;
  }
  return out;
}

/** Mechanism A — scaling with energy restore (avoids trivial blow-up). */
function mechScaling(xs, c) {
  const m = mean(xs) || 1;
  const scaled = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) scaled[i] = (xs[i] / m) * (c * m);
  return normalizeEnergy(scaled, Math.sqrt(mean(xs.map((x) => x * x)) || 1));
}

/** Mechanism B — recursive weighting with lag-1. */
function mechRecursiveWeighting(xs, c, prev) {
  const p = prev || xs;
  const out = new Float64Array(xs.length);
  const den = 1 + c;
  for (let i = 0; i < xs.length; i++) {
    out[i] = (xs[i] + c * p[i]) / den;
  }
  return out;
}

/** Mechanism C — hierarchical resolution (contract → expand). */
function mechHierarchical(xs, c) {
  const factor = Math.max(2, Math.min(8, Math.round(c + 1)));
  const coarse = [];
  for (let i = 0; i < xs.length; i += factor) {
    let s = 0;
    let n = 0;
    for (let j = i; j < Math.min(xs.length, i + factor); j++) {
      s += xs[j];
      n++;
    }
    coarse.push(s / n);
  }
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = coarse[Math.min(coarse.length - 1, Math.floor(i / factor))];
  }
  return normalizeEnergy(out, Math.sqrt(mean(xs.map((x) => x * x)) || 1));
}

/** Mechanism D — recursive feedback / homeostasis gain 1/c. */
function mechFeedback(xs, c) {
  const target = smooth3(xs);
  const gain = 1 / c;
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = xs[i] + gain * (target[i] - xs[i]);
  }
  return out;
}

/** Mechanism E — recursive compression (block mean → reconstruct). */
function mechCompression(xs, c) {
  const block = Math.max(2, Math.min(12, Math.round(c * 2)));
  const codes = [];
  for (let i = 0; i < xs.length; i += block) {
    let s = 0;
    let n = 0;
    for (let j = i; j < Math.min(xs.length, i + block); j++) {
      s += xs[j];
      n++;
    }
    codes.push(s / n);
  }
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    out[i] = codes[Math.min(codes.length - 1, Math.floor(i / block))];
  }
  return out;
}

function applyMechanism(name, xs, c, prev) {
  switch (name) {
    case 'scaling':
      return mechScaling(xs, c);
    case 'recursive_weighting':
      return mechRecursiveWeighting(xs, c, prev);
    case 'hierarchical_resolution':
      return mechHierarchical(xs, c);
    case 'recursive_feedback':
      return mechFeedback(xs, c);
    case 'recursive_compression':
      return mechCompression(xs, c);
    default:
      throw new Error(`unknown mechanism: ${name}`);
  }
}

/**
 * Run recursion: D0 → D1 → … → DN under fixed mechanism + constant.
 * RFD_n = Dist(Dn, D0) using RMSE (primary) + MAE + 1−corr.
 */
function runRecursion(d0, mechanism, c, generations = GENERATIONS) {
  let cur = clone(d0);
  let prev = clone(d0);
  const targetRms = Math.sqrt(mean([...d0].map((x) => x * x)) || 1);
  const curve = [];
  for (let n = 0; n <= generations; n++) {
    const r = rmse(cur, d0);
    const m = mae(cur, d0);
    const corr = pearson(cur, d0);
    curve.push({
      n,
      rfd_rmse: r,
      rfd_mae: m,
      fidelity: Math.max(0, corr),
      F_over_F0: n === 0 ? 1 : Math.max(0, corr),
    });
    if (n === generations) break;
    const next = applyMechanism(mechanism, cur, c, prev);
    prev = cur;
    cur = normalizeEnergy(next, targetRms);
  }
  return curve;
}

/** Fit log RFD ≈ log a + b log n for n≥2 (drift slope). */
function fitDriftSlope(curve) {
  const pts = curve.filter((p) => p.n >= 2 && p.rfd_rmse > 1e-12);
  if (pts.length < 3) return { a: 0, b: 0, ok: false };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  const n = pts.length;
  for (const p of pts) {
    const x = Math.log(p.n);
    const y = Math.log(p.rfd_rmse);
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-15) return { a: 0, b: 0, ok: false };
  const b = (n * sxy - sx * sy) / den;
  const logA = (sy - b * sx) / n;
  return { a: Math.exp(logA), b, ok: true };
}

function makeSeries(kind, len, rng) {
  const xs = new Float64Array(len);
  if (kind === 'logistic') {
    let x = 0.2;
    const r = 3.7;
    for (let i = 0; i < len; i++) {
      x = r * x * (1 - x);
      xs[i] = x;
    }
  } else if (kind === 'ar1') {
    let x = 0;
    for (let i = 0; i < len; i++) {
      x = 0.85 * x + rng() * 0.4 - 0.2;
      xs[i] = x;
    }
  } else if (kind === 'seasonal') {
    for (let i = 0; i < len; i++) {
      xs[i] =
        10 +
        2 * Math.sin((2 * Math.PI * i) / 12) +
        0.5 * Math.sin((2 * Math.PI * i) / 7) +
        (rng() - 0.5) * 0.3;
    }
  } else if (kind === 'powerlaw') {
    for (let i = 0; i < len; i++) {
      xs[i] = Math.pow(i + 1, -0.7) + (rng() - 0.5) * 0.02;
    }
  } else if (kind === 'co2_proxy') {
    // Synthetic rising CO₂-like series (fixture; not NOAA live pull)
    for (let i = 0; i < len; i++) {
      xs[i] = 340 + 0.12 * i + 2 * Math.sin((2 * Math.PI * i) / 12) + (rng() - 0.5) * 0.4;
    }
  } else if (kind === 'sunspot_proxy') {
    for (let i = 0; i < len; i++) {
      xs[i] = 60 + 50 * Math.sin((2 * Math.PI * i) / 132) + (rng() - 0.5) * 8;
    }
  } else if (kind === 'sp500_proxy') {
    let x = 100;
    for (let i = 0; i < len; i++) {
      x *= 1 + 0.0008 + (rng() - 0.48) * 0.02;
      xs[i] = x;
    }
  } else if (kind === 'epidemic_proxy') {
    let i = 2;
    let s = 998;
    let r = 0;
    const beta = 0.18;
    const gamma = 0.07;
    for (let t = 0; t < len; t++) {
      const ni = (beta * s * i) / 1000;
      const nr = gamma * i;
      s = Math.max(0, s - ni);
      i = Math.max(0, i + ni - nr);
      r += nr;
      xs[t] = i + (rng() - 0.5) * 0.5;
    }
  } else {
    for (let i = 0; i < len; i++) xs[i] = rng();
  }
  return xs;
}

const DOMAINS = Object.freeze([
  { id: 'synthetic_logistic', kind: 'logistic', domain: 'synthetic' },
  { id: 'synthetic_ar1', kind: 'ar1', domain: 'synthetic' },
  { id: 'synthetic_seasonal', kind: 'seasonal', domain: 'synthetic' },
  { id: 'synthetic_powerlaw', kind: 'powerlaw', domain: 'synthetic' },
  { id: 'env_co2_proxy', kind: 'co2_proxy', domain: 'environmental' },
  { id: 'astro_sunspot_proxy', kind: 'sunspot_proxy', domain: 'astronomical' },
  { id: 'finance_sp500_proxy', kind: 'sp500_proxy', domain: 'financial' },
  { id: 'bio_epidemic_proxy', kind: 'epidemic_proxy', domain: 'biological' },
]);

function randomArms(seed = RANDOM_ARM_SEED) {
  const rng = mulberry32(seed);
  const arms = [];
  for (let i = 0; i < RANDOM_ARM_COUNT; i++) {
    arms.push(RANDOM_ARM_LO + rng() * (RANDOM_ARM_HI - RANDOM_ARM_LO));
  }
  return arms;
}

function finalRfd(curve) {
  return curve[curve.length - 1].rfd_rmse;
}

function experimentProtocolLocks() {
  const ok =
    MECHANISMS.length === 5 &&
    Object.keys(NAMED_ARMS).length === 4 &&
    GENERATIONS >= 16 &&
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    PRE_REGISTERED_HYPOTHESIS.suite_pass_means.includes('NOT that Φ won');
  return {
    id: 'E0_protocol_locks',
    title: 'Pre-registered protocol locks (φ not assumed)',
    PROTOCOL_VERSION,
    GENERATIONS,
    MECHANISMS: [...MECHANISMS],
    NAMED_ARMS: { ...NAMED_ARMS },
    hypothesis: PRE_REGISTERED_HYPOTHESIS,
    pass: ok,
    interpretation:
      'V1 freezes arms, mechanisms, depth, and null-ok honesty before reading outcomes.',
    honesty: 'Protocol lock ≠ physics proof.',
  };
}

function experimentFiveArmMatched(domains = DOMAINS.slice(0, 6)) {
  const rng = mulberry32(0xe8f7);
  const random = randomArms();
  const arms = {
    ...NAMED_ARMS,
    random_0: random[0],
    random_1: random[1],
  };
  const rows = [];
  for (const d of domains) {
    const series = makeSeries(d.kind, 256, rng);
    for (const mech of MECHANISMS) {
      const byArm = {};
      for (const [name, c] of Object.entries(arms)) {
        const curve = runRecursion(series, mech, c);
        const slope = fitDriftSlope(curve);
        byArm[name] = {
          c,
          rfd_final: finalRfd(curve),
          fidelity_final: curve[curve.length - 1].fidelity,
          drift_slope_b: slope.ok ? slope.b : null,
          drift_a: slope.ok ? slope.a : null,
        };
      }
      rows.push({ domain: d.id, domainClass: d.domain, mechanism: mech, arms: byArm });
    }
  }
  // Integrity: every row has all arms; same evaluator shape
  const pass =
    rows.length === domains.length * MECHANISMS.length &&
    rows.every((r) => Object.keys(r.arms).length >= 5);
  return {
    id: 'E1_five_arm_matched',
    title: 'Five-arm matched recursion (baseline · Φ · √2 · e · random)',
    rows,
    pass,
    interpretation:
      'Identical recursion/evaluator; only c differs. Compare cumulative RFD trajectories — do not crown Φ unless it wins fair.',
    honesty: 'Proxy fixtures for V1; live public pulls can extend domains later.',
  };
}

function experimentBlindLadder() {
  const rng = mulberry32(0xB11D);
  const series = makeSeries('seasonal', 256, rng);
  const mech = 'recursive_compression';
  const results = BLIND_CONSTANTS.map((c) => {
    const curve = runRecursion(series, mech, c);
    return {
      c,
      rfd_final: finalRfd(curve),
      slope_b: fitDriftSlope(curve).b,
      is_phi: Math.abs(c - PHI_EGS) < 1e-12,
    };
  });
  const ranked = [...results].sort((a, b) => a.rfd_final - b.rfd_final);
  const phiRank = ranked.findIndex((r) => r.is_phi) + 1;
  return {
    id: 'E2_blind_constant_ladder',
    title: 'Blind constant ladder (φ unlabeled at compare time)',
    mechanism: mech,
    results,
    ranked_c: ranked.map((r) => r.c),
    phi_rank_by_lowest_rfd: phiRank,
    pass: results.length === BLIND_CONSTANTS.length && phiRank >= 1,
    interpretation:
      'If φ repeatedly lands near minimum drift across domains, evidence strengthens; V1 records rank without special-casing.',
    honesty: 'Single-series blind ladder is illustrative; multi-domain aggregation is the real test.',
  };
}

function experimentConstantSweep() {
  const rng = mulberry32(0x5ee7);
  const trainKinds = ['logistic', 'ar1', 'seasonal', 'co2_proxy'];
  const holdKinds = ['powerlaw', 'sunspot_proxy'];
  const grid = [];
  for (let i = 0; i < SWEEP_STEPS; i++) {
    grid.push(SWEEP_MIN + (i * (SWEEP_MAX - SWEEP_MIN)) / (SWEEP_STEPS - 1));
  }
  const mech = 'recursive_feedback';
  function avgRfd(kinds) {
    return grid.map((c) => {
      let s = 0;
      for (const k of kinds) {
        const series = makeSeries(k, 192, rng);
        s += finalRfd(runRecursion(series, mech, c, 16));
      }
      return { c, rfd: s / kinds.length };
    });
  }
  const train = avgRfd(trainKinds);
  const hold = avgRfd(holdKinds);
  const trainMin = train.reduce((a, b) => (b.rfd < a.rfd ? b : a));
  const holdMin = hold.reduce((a, b) => (b.rfd < a.rfd ? b : a));
  const nearPhi = (c) => Math.abs(c - PHI_EGS) < 0.06;
  return {
    id: 'E3_constant_sweep',
    title: 'Continuous Drift(c) sweep with train/hold split',
    mechanism: mech,
    HOLD_OUT_FRACTION,
    train_min: trainMin,
    hold_min: holdMin,
    train_min_near_phi: nearPhi(trainMin.c),
    hold_min_near_phi: nearPhi(holdMin.c),
    train_curve_sample: train.filter((_, i) => i % 5 === 0),
    hold_curve_sample: hold.filter((_, i) => i % 5 === 0),
    pass: train.length === SWEEP_STEPS && hold.length === SWEEP_STEPS,
    interpretation:
      'Pronounced minimum near φ on held-out kinds would be interesting; absence falsifies the strong claim for this mechanism/fixture set.',
    honesty: 'Sweep minima are fixture-relative; do not promote to CODATA.',
  };
}

function experimentDriftSlopeContrast() {
  const rng = mulberry32(0x5109);
  const series = makeSeries('logistic', 320, rng);
  const mech = 'recursive_compression';
  const arms = { baseline: 1.0, egs: PHI_EGS, sqrt2: SQRT2, e: E_CONST };
  const out = {};
  for (const [name, c] of Object.entries(arms)) {
    const curve = runRecursion(series, mech, c);
    out[name] = {
      c,
      slope: fitDriftSlope(curve),
      rfd_curve: curve.map((p) => ({ n: p.n, rfd: p.rfd_rmse, F: p.F_over_F0 })),
    };
  }
  return {
    id: 'E4_drift_slope',
    title: 'Drift slope contrast (power-law RFD ≈ a n^b)',
    mechanism: mech,
    arms: out,
    pass: Object.values(out).every((a) => a.slope.ok),
    interpretation:
      'Hypothesis interest is whether φ changes error-accumulation exponent — not only generation-1 RMSE.',
    honesty: 'Power-law fit is a pre-registered summary, not proof of a bounded attractor.',
  };
}

function experimentPhiNotAssumed() {
  const pass =
    PRE_REGISTERED_HYPOTHESIS.null_ok === true &&
    Math.abs(NAMED_ARMS.egs - PHI_EGS) < 1e-15 &&
    NAMED_ARMS.baseline === 1.0;
  return {
    id: 'E5_phi_not_assumed',
    title: 'Falsifiability lock — Φ is one arm among peers',
    PRE_REGISTERED_HYPOTHESIS,
    STANDALONE_REPO,
    pass,
    interpretation:
      'Design question: does incorporating φ reduce cumulative fidelity drift vs identical recursion without φ / with decoys?',
    honesty: 'A null result is a valid scientific outcome for this suite.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasErft: /ERFT|Recursive Fidelity/i.test(paper),
    hasFalsifiable: /falsif/i.test(paper),
    hasNotAssume: /does not assume|not assume|φ not assumed|phi not assumed/i.test(paper),
    hasFiveArm: /five-arm|five arm|baseline/i.test(paper),
  };
  return {
    id: 'E6_paper_locks',
    title: 'Paper presence + honesty / falsifiability locks',
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Paper must state controlled design and refuse Φ-assumed framing.',
    honesty: 'Structural lock only.',
  };
}

function experimentShipBlogLock() {
  const local = path.join(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);
  const exists = fs.existsSync(MONOREPO_BLOG) || fs.existsSync(local);
  const html = exists
    ? fs.readFileSync(fs.existsSync(MONOREPO_BLOG) ? MONOREPO_BLOG : local, 'utf8')
    : '';
  const checks = {
    exists,
    hasHonestyRail: /class="honesty"/i.test(html),
    hasErft: /ERFT|Favorite Number Lost|recursive fidelity/i.test(html),
  };
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog magazine lock',
    SHIP_BLOG_SLUG,
    checks,
    pass: Object.values(checks).every(Boolean),
    interpretation: 'Frontiersman magazine note required for paper ship.',
    honesty: 'Structural lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentProtocolLocks(),
    experimentFiveArmMatched(),
    experimentBlindLadder(),
    experimentConstantSweep(),
    experimentDriftSlopeContrast(),
    experimentPhiNotAssumed(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    PROTOCOL_VERSION,
    PHI_EGS,
    experiments,
  };
}
