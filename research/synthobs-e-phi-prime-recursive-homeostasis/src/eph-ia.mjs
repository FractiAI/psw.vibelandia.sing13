/**
 * EPH-IA — e × φ × Prime Information Architecture
 *
 * Mechanism test (not another dynamical controller retune).
 * Locked behind V1 + EPH-RH-D + EPH-RH-D2 (do not rewrite those nulls).
 *
 * Category-error audit: prior layers tested constants as transformation/control
 * operators. This fork tests whether they organize information:
 *
 *   Information → e(transform/update) → φ(hierarchical allocation)
 *               → prime(address/decompose) → store → retrieve → reconstruct
 *
 * Metrics: IFE, RCR, B (cross-container contamination), C (compression ratio).
 * Ablations A–I are primary (complementarity), not secondary footnotes.
 * Prohibits treating e / φ / primes as arbitrary scalar multipliers.
 */
import {
  PHI_EGS,
  E_CONST,
  SERIES_LEN,
  FIXTURE_SEED,
  FIXTURE_COUNT,
  PRIME_SCHEDULE,
  COMPOSITE_SCHEDULE,
} from './constants.mjs';

export const IA_PROTOCOL = 'EPH-IA-2026-09-29';

/** Matched representation budget (stored slots). */
export const SLOT_BUDGET = 84;

/** Recursive transform generations on the memory ledger. */
export const IA_GENERATIONS = 12;

/** Engine gate for information-architecture hypothesis. */
export const IA_GATE = Object.freeze({
  require_IFE_above_A: true,
  require_IFE_above_B: true,
  require_RCR_above_A: true,
  require_RCR_above_B: true,
  require_B_below_A: true,
  require_full_beats_best_single: true,
  require_full_beats_best_pair: true,
  require_superadditive: true, // IFE_I > max(IFE singles) and > max(IFE pairs) with margin
  superadditive_margin: 0.02,
  engine_shelf_requires_gate: true,
});

const EPS = 1e-6;
const LEVELS = 4; // φ hierarchical levels
/** Block sizes chosen so Σ ceil(n/block) ≥ SLOT_BUDGET (matched coverage). */
const BLOCK_SCHEDULE = Object.freeze([30, 15, 10, 5]);

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
  return Math.sqrt(s / Math.max(1, n));
}

function seriesStd(xs) {
  return Math.max(1e-12, stdev([...xs]));
}

function nrmse(a, b) {
  return rmse(a, b) / seriesStd(b);
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

function normalizeRms(xs, target = 1) {
  let s = 0;
  for (const x of xs) s += x * x;
  const rms = Math.sqrt(s / xs.length) || 1;
  const g = target / rms;
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) out[i] = xs[i] * g;
  return out;
}

function factorize(n) {
  const factors = [];
  let x = Math.max(2, Math.floor(n));
  for (const p of PRIME_SCHEDULE) {
    while (x % p === 0) {
      factors.push(p);
      x = Math.floor(x / p);
    }
  }
  if (x > 1) factors.push(x);
  return factors;
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
    id: `IAF${i}`,
    kind: kinds[i % kinds.length],
    x0: makeFixture(FIXTURE_SEED + 0x1a00 + i * 97, kinds[i % kinds.length]),
  }));
}

/**
 * φ hierarchical level weights — proportional allocation rule, not a scalar multiply.
 * Level ℓ gets capacity ∝ φ^{-ℓ} (normalized to SLOT_BUDGET).
 */
function phiLevelCapacities(budget = SLOT_BUDGET) {
  const raw = [];
  let s = 0;
  for (let ℓ = 0; ℓ < LEVELS; ℓ++) {
    const w = Math.pow(PHI_EGS, -ℓ);
    raw.push(w);
    s += w;
  }
  const caps = raw.map((w) => Math.max(1, Math.round((w / s) * budget)));
  // Fix rounding so sum == budget
  let sum = caps.reduce((a, b) => a + b, 0);
  while (sum > budget) {
    for (let i = caps.length - 1; i >= 0 && sum > budget; i--) {
      if (caps[i] > 1) {
        caps[i]--;
        sum--;
      }
    }
  }
  while (sum < budget) {
    caps[0]++;
    sum++;
  }
  return caps;
}

/**
 * Matched-complexity random hierarchy: same level counts / capacities, arbitrary weights.
 */
function randomLevelCapacities(rnd, budget = SLOT_BUDGET) {
  const raw = Array.from({ length: LEVELS }, () => 0.2 + rnd());
  const s = raw.reduce((a, b) => a + b, 0);
  const caps = raw.map((w) => Math.max(1, Math.round((w / s) * budget)));
  let sum = caps.reduce((a, b) => a + b, 0);
  while (sum > budget) {
    for (let i = caps.length - 1; i >= 0 && sum > budget; i--) {
      if (caps[i] > 1) {
        caps[i]--;
        sum--;
      }
    }
  }
  while (sum < budget) {
    caps[0]++;
    sum++;
  }
  return caps;
}

/**
 * Prime addressing: each sample index maps to a container keyed by its smallest
 * prime factor (unique-factorization identity for hierarchical membership).
 * Containers are discrete address bins — not a clipping firewall.
 */
function primeAddress(i) {
  const n = i + 2; // avoid 0/1
  const factors = factorize(n);
  return factors[0] || 2;
}

/**
 * Composite (matched non-prime) addressing with identical bin count / capacity.
 */
function compositeAddress(i) {
  const schedule = COMPOSITE_SCHEDULE;
  return schedule[i % schedule.length];
}

/**
 * Encode X_0 into a memory ledger M with structural roles.
 * Hierarchical block pyramid: each slot stores a whole block mean (start,len,v)
 * so reconstruction fills coverage — not sparse dead points.
 * opts: { usePhi, usePrime, useE, randomStructure, rnd }
 */
function encode(x0, opts) {
  const n = x0.length;
  const rnd = opts.rnd || mulberry32(1);
  const usePhi = Boolean(opts.usePhi);
  const usePrime = Boolean(opts.usePrime);
  const useE = Boolean(opts.useE);
  const randomStructure = Boolean(opts.randomStructure);

  let caps = randomStructure
    ? randomLevelCapacities(rnd)
    : usePhi
      ? phiLevelCapacities()
      : (() => {
          const base = Array(LEVELS).fill(Math.floor(SLOT_BUDGET / LEVELS));
          let s = base.reduce((a, b) => a + b, 0);
          let i = 0;
          while (s < SLOT_BUDGET) {
            base[i % LEVELS]++;
            s++;
            i++;
          }
          return base;
        })();

  const available = BLOCK_SCHEDULE.map((block) => Math.ceil(n / block));
  let surplus = 0;
  for (let ℓ = 0; ℓ < LEVELS; ℓ++) {
    if (caps[ℓ] > available[ℓ]) {
      surplus += caps[ℓ] - available[ℓ];
      caps[ℓ] = available[ℓ];
    }
  }
  for (let ℓ = LEVELS - 1; ℓ >= 0 && surplus > 0; ℓ--) {
    const room = available[ℓ] - caps[ℓ];
    const take = Math.min(room, surplus);
    caps[ℓ] += take;
    surplus -= take;
  }

  const levels = [];
  let residual = Float64Array.from(x0);
  for (let ℓ = 0; ℓ < LEVELS; ℓ++) {
    const block = BLOCK_SCHEDULE[ℓ];
    const candidates = [];
    for (let start = 0; start < n; start += block) {
      const len = Math.min(block, n - start);
      let s = 0;
      for (let i = start; i < start + len; i++) s += residual[i];
      const v = len ? s / len : 0;
      candidates.push({ start, len, v, e: Math.abs(v) * len, level: ℓ });
      for (let i = start; i < start + len; i++) residual[i] -= v;
    }
    candidates.sort((a, b) => b.e - a.e);
    const keep = candidates.slice(0, caps[ℓ]);
    const slots = keep.map((c, idx) => {
      let address;
      if (randomStructure) {
        address = `R${Math.floor(rnd() * 97)}:${ℓ}:${c.start}`;
      } else if (usePrime) {
        address = `P${primeAddress(c.start)}:${ℓ}:${c.start}`;
      } else {
        address = `U${idx}:${ℓ}:${c.start}`;
      }
      return {
        start: c.start,
        len: c.len,
        v: c.v,
        address,
        level: ℓ,
        i: c.start,
      };
    });
    levels.push({ level: ℓ, slots, capacity: caps[ℓ], block });
  }

  const eKernel = useE
    ? {
        alpha: 1 - Math.exp(-1 / E_CONST),
        decay: Math.exp(-1 / E_CONST),
      }
    : { alpha: 0.5, decay: 0.5 };

  const totalSlots = levels.reduce((s, L) => s + L.slots.length, 0);
  return {
    levels,
    eKernel,
    usePhi,
    usePrime,
    useE,
    randomStructure,
    n,
    totalSlots,
    slotBudget: SLOT_BUDGET,
  };
}

/** Reconstruct X' from memory ledger (retrieve → reconstruct). */
function reconstruct(mem) {
  const out = new Float64Array(mem.n);
  const covered = new Uint8Array(mem.n);
  // Coarser levels first, then detail (additive pyramid)
  const ordered = [...mem.levels].sort((a, b) => a.level - b.level);
  for (const L of ordered) {
    for (const slot of L.slots) {
      for (let i = slot.start; i < slot.start + slot.len && i < mem.n; i++) {
        out[i] += slot.v;
        covered[i] = 1;
      }
    }
  }
  // Interpolate any uncovered gaps from nearest covered neighbors
  for (let i = 0; i < mem.n; i++) {
    if (!covered[i]) {
      let L = i - 1;
      while (L >= 0 && !covered[L]) L--;
      let R = i + 1;
      while (R < mem.n && !covered[R]) R++;
      if (L >= 0 && R < mem.n) {
        out[i] = ((R - i) * out[L] + (i - L) * out[R]) / (R - L);
      } else if (L >= 0) out[i] = out[L];
      else if (R < mem.n) out[i] = out[R];
    }
  }
  return normalizeRms(out, 1);
}

/**
 * e-driven continuous update on stored slots (adaptive reconstruction),
 * not x' = e*x. Updates along an EMA toward a mild transformed target.
 */
function eTransform(mem, gen, rnd) {
  const alpha = mem.eKernel.alpha;
  const decay = mem.eKernel.decay;
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      // Continuous proportional update toward a soft local target
      const target =
        slot.v * decay +
        0.05 * Math.sin((2 * Math.PI * (slot.i + gen)) / Math.max(7, L.block)) +
        0.02 * (rnd() - 0.5);
      slot.v = (1 - alpha) * slot.v + alpha * target;
    }
  }
}

/** Mild unstructured transform (Control A / pairs without e). */
function plainTransform(mem, gen, rnd) {
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      slot.v += 0.03 * Math.sin((2 * Math.PI * (slot.i + gen)) / 11) + 0.015 * (rnd() - 0.5);
    }
  }
}

/**
 * Cross-container bleed: fraction of reconstructed energy at each index that
 * arrives from slots whose address ≠ the index's owner address.
 * Owner(i) = address of the highest-energy slot covering i (else 'none').
 */
function measureBleed(mem) {
  const n = mem.n;
  const owner = new Array(n).fill(null);
  const ownerE = new Float64Array(n);
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      const key = String(slot.address);
      const e = slot.v * slot.v * slot.len;
      for (let i = slot.start; i < slot.start + slot.len && i < n; i++) {
        if (owner[i] === null || e > ownerE[i]) {
          owner[i] = key;
          ownerE[i] = e;
        }
      }
    }
  }
  const contrib = new Float64Array(n); // foreign energy
  const total = new Float64Array(n);
  for (const L of mem.levels) {
    for (const slot of L.slots) {
      const key = String(slot.address);
      const e = slot.v * slot.v;
      for (let i = slot.start; i < slot.start + slot.len && i < n; i++) {
        total[i] += e;
        if (owner[i] && owner[i] !== key) contrib[i] += e;
      }
    }
  }
  let foreign = 0;
  let all = 0;
  for (let i = 0; i < n; i++) {
    foreign += contrib[i];
    all += total[i];
  }
  return all > EPS ? foreign / all : 0;
}

function recoverableInfo(x0, xHat) {
  // Recoverable information ∈ [0,1]: correlation×(1−NRMSE) clamped
  const corr = Math.max(0, pearson(x0, xHat));
  const err = Math.min(1, nrmse(xHat, x0));
  return Math.max(0, Math.min(1, corr * (1 - err)));
}

function cloneMem(mem) {
  return {
    ...mem,
    eKernel: { ...mem.eKernel },
    levels: mem.levels.map((L) => ({
      ...L,
      slots: L.slots.map((s) => ({ ...s })),
    })),
  };
}

/**
 * Full ledger lifecycle for one architecture arm.
 * Encode → Store → (Transform)×G → Retrieve → Reconstruct
 */
function runLedger(x0, armOpts, seed) {
  const rnd = mulberry32(seed);
  const mem0 = encode(x0, { ...armOpts, rnd });
  const xHat0 = reconstruct(mem0);
  const R0 = recoverableInfo(x0, xHat0);
  const C0 = mem0.totalSlots / x0.length; // compression ratio (slots / original length)

  let mem = cloneMem(mem0);
  const recoveries = [R0];
  const bleeds = [measureBleed(mem)];

  for (let g = 1; g <= IA_GENERATIONS; g++) {
    if (armOpts.useE) eTransform(mem, g, rnd);
    else plainTransform(mem, g, rnd);
    // φ re-allocation pass: re-rank slots within φ capacities (organization, not multiply)
    if (armOpts.usePhi && !armOpts.randomStructure) {
      for (const L of mem.levels) {
        L.slots.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
        if (L.slots.length > L.capacity) L.slots = L.slots.slice(0, L.capacity);
      }
    }
    const xHat = reconstruct(mem);
    recoveries.push(recoverableInfo(x0, xHat));
    bleeds.push(measureBleed(mem));
  }

  const R_final = recoveries[recoveries.length - 1];
  const RCR = R0 > EPS ? R_final / R0 : 0;
  const IFE = R_final / (C0 + EPS); // recoverable / representation cost
  const B = mean(bleeds);
  const usefulEvolution = Math.max(0, mean(recoveries.slice(1)) - 0.5 * Math.abs(R_final - R0));

  return {
    R0,
    R_final,
    RCR,
    IFE,
    B,
    C: C0,
    usefulEvolution,
    totalSlots: mem0.totalSlots,
    slotBudget: mem0.slotBudget,
  };
}

/** Architecture arm definitions A–I. */
export const IA_ARMS = Object.freeze([
  { id: 'A', name: 'Raw/unstructured', useE: false, usePhi: false, usePrime: false, randomStructure: false },
  { id: 'B', name: 'Matched-complexity random', useE: false, usePhi: false, usePrime: false, randomStructure: true },
  { id: 'C', name: 'Prime addressing only', useE: false, usePhi: false, usePrime: true, randomStructure: false },
  { id: 'D', name: 'φ hierarchy only', useE: false, usePhi: true, usePrime: false, randomStructure: false },
  { id: 'E', name: 'e continuous update only', useE: true, usePhi: false, usePrime: false, randomStructure: false },
  { id: 'F', name: 'e + φ', useE: true, usePhi: true, usePrime: false, randomStructure: false },
  { id: 'G', name: 'φ + prime', useE: false, usePhi: true, usePrime: true, randomStructure: false },
  { id: 'H', name: 'e + prime', useE: true, usePhi: false, usePrime: true, randomStructure: false },
  { id: 'I', name: 'e + φ + prime (full)', useE: true, usePhi: true, usePrime: true, randomStructure: false },
]);

function summarizeArm(arm, fixtures) {
  const rows = fixtures.map((f, i) =>
    runLedger(f.x0, arm, FIXTURE_SEED + 0x2b00 + i * 31 + arm.id.charCodeAt(0) * 17),
  );
  return {
    id: arm.id,
    name: arm.name,
    useE: arm.useE,
    usePhi: arm.usePhi,
    usePrime: arm.usePrime,
    randomStructure: arm.randomStructure,
    mean_IFE: mean(rows.map((r) => r.IFE)),
    mean_RCR: mean(rows.map((r) => r.RCR)),
    mean_B: mean(rows.map((r) => r.B)),
    mean_C: mean(rows.map((r) => r.C)),
    mean_R0: mean(rows.map((r) => r.R0)),
    mean_R_final: mean(rows.map((r) => r.R_final)),
    mean_E: mean(rows.map((r) => r.usefulEvolution)),
    mean_slots: mean(rows.map((r) => r.totalSlots)),
    seed_IFE: rows.map((r) => r.IFE),
    seed_RCR: rows.map((r) => r.RCR),
  };
}

function experimentAblationMatrix(board) {
  const singles = ['C', 'D', 'E'].map((id) => board[id]);
  const pairs = ['F', 'G', 'H'].map((id) => board[id]);
  const bestSingle = singles.reduce((a, b) => (b.mean_IFE > a.mean_IFE ? b : a));
  const bestPair = pairs.reduce((a, b) => (b.mean_IFE > a.mean_IFE ? b : a));
  const full = board.I;
  const complementarity = {
    best_single_id: bestSingle.id,
    best_single_IFE: bestSingle.mean_IFE,
    best_pair_id: bestPair.id,
    best_pair_IFE: bestPair.mean_IFE,
    full_IFE: full.mean_IFE,
    full_beats_best_single: full.mean_IFE > bestSingle.mean_IFE + IA_GATE.superadditive_margin,
    full_beats_best_pair: full.mean_IFE > bestPair.mean_IFE + IA_GATE.superadditive_margin,
    // Component roles (descriptive): which single leads on which metric
    prime_leads_bleed: board.C.mean_B <= Math.min(board.D.mean_B, board.E.mean_B, board.A.mean_B),
    phi_leads_R0: board.D.mean_R0 >= Math.max(board.C.mean_R0, board.E.mean_R0),
    e_leads_RCR: board.E.mean_RCR >= Math.max(board.C.mean_RCR, board.D.mean_RCR),
  };
  return {
    id: 'IA2_ablation_complementarity',
    title: 'Ablations A–I — where does any advantage originate?',
    complementarity,
    pass: true,
    interpretation: complementarity.full_beats_best_pair
      ? 'Full e+φ+prime shows superadditive IFE over best pair — complementarity signal on these fixtures.'
      : 'Full stack does not beat best pair/single on IFE — no clean complementarity win; report which component (if any) carries the load.',
    honesty: 'Ablations are primary for the info-architecture hypothesis, not secondary footnotes.',
  };
}

function experimentComponentRoles(board) {
  return {
    id: 'IA3_component_information_jobs',
    title: 'Component jobs — prime address · φ hierarchy · e continuous update',
    prime: {
      IFE: board.C.mean_IFE,
      B: board.C.mean_B,
      RCR: board.C.mean_RCR,
      vs_A_IFE: board.C.mean_IFE - board.A.mean_IFE,
    },
    phi: {
      IFE: board.D.mean_IFE,
      R0: board.D.mean_R0,
      RCR: board.D.mean_RCR,
      vs_A_IFE: board.D.mean_IFE - board.A.mean_IFE,
    },
    e: {
      IFE: board.E.mean_IFE,
      RCR: board.E.mean_RCR,
      vs_A_IFE: board.E.mean_IFE - board.A.mean_IFE,
    },
    pass: true,
    interpretation:
      'Each constant is scored on its information job (addressing / hierarchical allocation / continuous update) — not as a scalar multiplier.',
    honesty: 'Role assignment is architectural; live numbers decide whether the assignment helps.',
  };
}

function experimentMatchedBudget(board) {
  const slots = IA_ARMS.map((a) => board[a.id].mean_slots);
  const allMatched = slots.every((s) => Math.abs(s - SLOT_BUDGET) < 1.5);
  return {
    id: 'IA4_matched_representation_budget',
    title: 'Matched representation budget (slot count)',
    slot_budget: SLOT_BUDGET,
    mean_slots_by_arm: Object.fromEntries(IA_ARMS.map((a) => [a.id, board[a.id].mean_slots])),
    all_matched: allMatched,
    pass: allMatched,
    interpretation: allMatched
      ? `All arms store ≈${SLOT_BUDGET} slots — IFE differences are not free extra storage.`
      : 'Slot budgets diverged — IFE comparisons are confounded.',
    honesty: 'Representation cost must be matched before crowning an architecture.',
  };
}

function experimentNoScalarMultiplier(board) {
  // Structural check: φ capacities follow φ^{-ℓ}; e kernel uses exp(-1/e); primes use factorization.
  const caps = phiLevelCapacities();
  const ratios = [];
  for (let i = 0; i < caps.length - 1; i++) {
    ratios.push(caps[i] / caps[i + 1]);
  }
  const meanRatio = mean(ratios);
  const phiShaped = Math.abs(meanRatio - PHI_EGS) < 0.85; // coarse integer rounding tolerance
  const eAlpha = 1 - Math.exp(-1 / E_CONST);
  return {
    id: 'IA5_no_scalar_multiplier_lock',
    title: 'Prohibit scalar-multiplier implementations of e / φ / primes',
    phi_capacities: caps,
    phi_capacity_mean_ratio: meanRatio,
    phi_shaped_hierarchy: phiShaped,
    e_kernel_alpha: eAlpha,
    prime_address_sample: [0, 1, 2, 3, 4, 5].map((i) => ({ i, address: primeAddress(i) })),
    pass: phiShaped && eAlpha > 0 && eAlpha < 1,
    interpretation:
      'φ allocates hierarchical capacity; e sets a continuous EMA update kernel; primes assign factorization addresses — none is x′=c·x.',
    honesty: 'Implementation lock against the category error that produced flat φ-strength sweeps in D.',
  };
}

/** Shared ledger primitives for EPH-IA-R (e-reversibility / dual-state) follow-ons. */
export const iaLedger = Object.freeze({
  encode,
  reconstruct,
  cloneMem,
  eTransform,
  plainTransform,
  measureBleed,
  recoverableInfo,
  fixtureFamily,
  mean,
  EPS,
  SLOT_BUDGET,
  IA_GENERATIONS,
  FIXTURE_SEED,
});

export function runInformationArchitecture() {
  const fixtures = fixtureFamily();
  const board = {};
  for (const arm of IA_ARMS) {
    board[arm.id] = summarizeArm(arm, fixtures);
  }

  const A = board.A;
  const B = board.B;
  const I = board.I;
  const singles = ['C', 'D', 'E'].map((id) => board[id]);
  const pairs = ['F', 'G', 'H'].map((id) => board[id]);
  const bestSingle = singles.reduce((a, b) => (b.mean_IFE > a.mean_IFE ? b : a));
  const bestPair = pairs.reduce((a, b) => (b.mean_IFE > a.mean_IFE ? b : a));

  const checks = {
    IFE_above_A: I.mean_IFE > A.mean_IFE,
    IFE_above_B: I.mean_IFE > B.mean_IFE,
    RCR_above_A: I.mean_RCR > A.mean_RCR,
    RCR_above_B: I.mean_RCR > B.mean_RCR,
    B_below_A: I.mean_B < A.mean_B,
    full_beats_best_single: I.mean_IFE > bestSingle.mean_IFE + IA_GATE.superadditive_margin,
    full_beats_best_pair: I.mean_IFE > bestPair.mean_IFE + IA_GATE.superadditive_margin,
    slots_matched: Math.abs(I.mean_slots - SLOT_BUDGET) < 1.5,
  };

  const ia_gate_pass =
    checks.IFE_above_A &&
    checks.IFE_above_B &&
    checks.RCR_above_A &&
    checks.RCR_above_B &&
    checks.B_below_A &&
    checks.full_beats_best_single &&
    checks.full_beats_best_pair;

  const primary = {
    id: 'IA1_information_architecture_board',
    title: 'EPH-IA — recursive storage / compression / retrieval / reconstruction',
    protocol: IA_PROTOCOL,
    board: Object.fromEntries(
      IA_ARMS.map((a) => [
        a.id,
        {
          name: board[a.id].name,
          mean_IFE: board[a.id].mean_IFE,
          mean_RCR: board[a.id].mean_RCR,
          mean_B: board[a.id].mean_B,
          mean_C: board[a.id].mean_C,
          mean_R0: board[a.id].mean_R0,
          mean_R_final: board[a.id].mean_R_final,
          mean_slots: board[a.id].mean_slots,
        },
      ]),
    ),
    checks,
    ia_gate_pass,
    pass: true,
    interpretation: ia_gate_pass
      ? 'Full e+φ+prime information architecture beats unstructured and matched-random on IFE/RCR/bleed with complementarity — mechanism signal on these fixtures.'
      : 'Information-architecture hypothesis not established on these fixtures — full stack fails one or more IFE/RCR/bleed/complementarity checks vs A/B and ablations.',
    honesty:
      'Does not rewrite V1/D/D2 dynamical nulls. Tests representation lifecycle, not Goldilocks hit-rate or E/D controllers. Soft Story / fixture evidence only.',
  };

  const experiments = [
    primary,
    experimentAblationMatrix(board),
    experimentComponentRoles(board),
    experimentMatchedBudget(board),
    experimentNoScalarMultiplier(board),
    {
      id: 'IA6_lineage_lock',
      title: 'Lineage lock — ERFT → ERFT-D → EPH-RH V1/D/D2 → EPH-IA',
      lineage: [
        'ERFT: special constant recursive fidelity?',
        'ERFT-D: dynamic multi-constant regulation?',
        'EPH-RH V1: e+φ+prime dynamical Goldilocks? (locked null)',
        'EPH-RH-D: matched-Q regulator efficiency? (locked null)',
        'EPH-RH-D2: loss-aware F / adaptive φ / coupled? (locked withhold)',
        'EPH-IA: information lifecycle — encode→store→transform→retrieve→reconstruct?',
      ],
      pass: true,
      interpretation: 'IA is the mechanism test after dynamical layers exposed the category error.',
      honesty: 'Prior nulls stay locked development/diagnostic evidence.',
    },
  ];

  const readout = {
    protocol: IA_PROTOCOL,
    board: primary.board,
    checks,
    best_single: { id: bestSingle.id, IFE: bestSingle.mean_IFE },
    best_pair: { id: bestPair.id, IFE: bestPair.mean_IFE },
    full: {
      IFE: I.mean_IFE,
      RCR: I.mean_RCR,
      B: I.mean_B,
      C: I.mean_C,
    },
    control_a: { IFE: A.mean_IFE, RCR: A.mean_RCR, B: A.mean_B },
    control_b: { IFE: B.mean_IFE, RCR: B.mean_RCR, B: B.mean_B },
  };

  return {
    protocol: IA_PROTOCOL,
    experiments,
    readout,
    checks,
    ia_gate_pass,
    engine_shelf_include: IA_GATE.engine_shelf_requires_gate && ia_gate_pass,
    engine_shelf_decision:
      IA_GATE.engine_shelf_requires_gate && ia_gate_pass
        ? 'INCLUDE — EPH-IA information-architecture gate passed (IFE/RCR/bleed + complementarity).'
        : 'WITHHOLD — EPH-IA gate failed/mixed; V1/D/D2 dynamical nulls remain; application companion only.',
  };
}
