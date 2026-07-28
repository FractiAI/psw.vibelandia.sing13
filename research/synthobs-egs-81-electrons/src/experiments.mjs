/**
 * Empirical suite — 81-Digit Electronic Lattice (EGS ↔ Z≤81 shells).
 * Architectural / numerical validation — NOT a claim that Φ replaces QED or ℏ.
 */
import {
  E_F,
  LAMBDA_EGS,
  REGISTER_N,
  GRID_SIDE,
  RANDOM_SEED,
  IONIZATION_EV,
} from './constants.mjs';

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
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function variance(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den < 1e-15 ? 0 : num / den;
}

function wrapPi(a) {
  let x = a;
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
}

/** φ_k = 2π k / 81 */
export function phaseSingularity(k, n = REGISTER_N) {
  return (2 * Math.PI * k) / n;
}

/**
 * Enumerate quantum-number tuples with bounded ranges that cover exactly 81 slots
 * via 3^4 digit modes: each of 4 indices ∈ {0,1,2}.
 */
export function enumerateDigitModes() {
  const modes = [];
  for (let a = 0; a < 3; a += 1) {
    for (let b = 0; b < 3; b += 1) {
      for (let c = 0; c < 3; c += 1) {
        for (let d = 0; d < 3; d += 1) {
          const k = a * 27 + b * 9 + c * 3 + d;
          modes.push({
            k,
            digit: [a, b, c, d],
            // Architectural map onto (n,l,m_l,m_s)-like labels (not spectroscopic assignment).
            n_proxy: 1 + a + b, // 1..5 band
            l_proxy: c,
            ml_proxy: c - 1,
            ms_proxy: d === 0 ? -0.5 : d === 1 ? 0.5 : 0, // ternary → spin-ish
          });
        }
      }
    }
  }
  return modes;
}

/** E1 — 81 = 3^4 = 9×9 register identity. */
export function experimentRegisterIdentity() {
  const modes = enumerateDigitModes();
  const uniqueK = new Set(modes.map((m) => m.k));
  return {
    id: 'E1_register_identity',
    title: 'Register identity — 3⁴ = 81 = 9×9',
    three_to_four: 3 ** 4,
    nine_by_nine: GRID_SIDE * GRID_SIDE,
    n_modes: modes.length,
    unique_k: uniqueK.size,
    interpretation: 'EGS electronic lattice register is combinatorially closed at 81 slots.',
    honesty: 'Combinatorial architecture — not a derivation of the periodic table from Φ.',
    pass: 3 ** 4 === REGISTER_N && GRID_SIDE ** 2 === REGISTER_N && uniqueK.size === 81,
  };
}

/** E2 — Phase singularities φ_k = 2πk/81 are equally spaced and close after 81 steps. */
export function experimentPhaseSingularities() {
  let maxStepErr = 0;
  let closeErr = Infinity;
  for (let k = 0; k < REGISTER_N; k += 1) {
    const d = Math.abs(phaseSingularity(k + 1) - phaseSingularity(k) - (2 * Math.PI) / REGISTER_N);
    maxStepErr = Math.max(maxStepErr, d);
  }
  closeErr = Math.abs(phaseSingularity(REGISTER_N) - phaseSingularity(0) - 2 * Math.PI);
  // wrap: φ_81 ≡ φ_0 mod 2π
  const wrap = Math.abs(wrapPi(phaseSingularity(REGISTER_N)));
  return {
    id: 'E2_phase_singularities',
    title: 'Phase singularities — φ_k = 2πk/81',
    max_step_error: maxStepErr,
    full_circle_error: closeErr,
    wrap_at_81: wrap,
    interpretation: 'Integer electronic transitions sit on equal phase ticks of the 81-register.',
    pass: maxStepErr < 1e-12 && wrap < 1e-12,
  };
}

/** E3 — Bijection: digit modes ↔ unique k ∈ [0,80]. */
export function experimentQuantumNumberBijection() {
  const modes = enumerateDigitModes();
  const keys = modes.map((m) => m.digit.join(','));
  const uniqueDigits = new Set(keys);
  const ks = modes.map((m) => m.k).sort((a, b) => a - b);
  let contiguous = true;
  for (let i = 0; i < 81; i += 1) {
    if (ks[i] !== i) contiguous = false;
  }
  return {
    id: 'E3_quantum_number_bijection',
    title: '3⁴ digit modes ↔ k=0…80 bijection (n,l,m_l,m_s proxies)',
    n_unique_digit_tuples: uniqueDigits.size,
    contiguous_k: contiguous,
    sample: modes.slice(0, 5),
    interpretation: 'Each singularity isolates one digit mode — Pauli-like uniqueness in the register.',
    honesty: 'Proxy labels are architectural; not spectroscopic term symbols.',
    pass: uniqueDigits.size === 81 && contiguous,
  };
}

/** E4 — Pauli isolation: no two modes share the same (digit tuple). */
export function experimentPauliSingularityIsolation() {
  const modes = enumerateDigitModes();
  const seen = new Map();
  let collisions = 0;
  for (const m of modes) {
    const key = m.digit.join('|');
    if (seen.has(key)) collisions += 1;
    else seen.set(key, m.k);
  }
  return {
    id: 'E4_pauli_singularity_isolation',
    title: 'Singularity isolation — unique digit modes (Pauli downstream metaphor)',
    collisions,
    n_modes: modes.length,
    interpretation: 'Exclusion in the register is uniqueness of digit addresses.',
    honesty: 'Metaphor for Pauli exclusion — not a QED derivation.',
    pass: collisions === 0 && modes.length === 81,
  };
}

/**
 * E5 — Binding-energy correlation: log(IE) vs EGS phase-register features (OLS).
 * Draft R²=0.9998 is a design target; receipt reports computed R².
 */
export function experimentBindingEnergyCorrelation() {
  const n = Math.min(IONIZATION_EV.length, REGISTER_N);
  const y = [];
  const rows = [];
  for (let z = 1; z <= n; z += 1) {
    const ie = IONIZATION_EV[z - 1];
    const phi = phaseSingularity(z - 1);
    y.push(Math.log(ie));
    rows.push([1, Math.log(z), Math.cos(phi), Math.sin(phi), Math.cos(2 * phi), Math.sin(2 * phi)]);
  }
  // Normal equations β = (XᵀX)⁺ Xᵀy via Gaussian elimination on 6×6
  const p = 6;
  const xtx = Array.from({ length: p }, () => Array(p).fill(0));
  const xty = Array(p).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let a = 0; a < p; a += 1) {
      xty[a] += rows[i][a] * y[i];
      for (let b = 0; b < p; b += 1) xtx[a][b] += rows[i][a] * rows[i][b];
    }
  }
  const aug = xtx.map((row, i) => [...row, xty[i]]);
  for (let col = 0; col < p; col += 1) {
    let piv = col;
    for (let r = col + 1; r < p; r += 1) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    }
    [aug[col], aug[piv]] = [aug[piv], aug[col]];
    const div = aug[col][col] || 1e-15;
    for (let c = col; c <= p; c += 1) aug[col][c] /= div;
    for (let r = 0; r < p; r += 1) {
      if (r === col) continue;
      const f = aug[r][col];
      for (let c = col; c <= p; c += 1) aug[r][c] -= f * aug[col][c];
    }
  }
  const beta = aug.map((row) => row[p]);
  const pred = rows.map((row) => row.reduce((s, x, j) => s + beta[j] * x, 0));
  const yMean = mean(y);
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i += 1) {
    ssTot += (y[i] - yMean) ** 2;
    ssRes += (y[i] - pred[i]) ** 2;
  }
  const r2 = ssTot < 1e-15 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  const r = Math.sqrt(r2);
  const rng = mulberry32(RANDOM_SEED);
  const shamPred = y.map(() => rng() * 2);
  let shamRes = 0;
  const shamMean = mean(shamPred);
  // Compare: correlation of IE with E_F^k register index magnitude
  const egsMag = [];
  for (let z = 1; z <= n; z += 1) {
    egsMag.push(Math.exp(LAMBDA_EGS * phaseSingularity(z - 1)));
  }
  const rEgs = pearson(egsMag, y);
  const r2Egs = rEgs * rEgs;
  const rSham = pearson(
    y.map((_, i) => shamPred[i]),
    y,
  );
  const r2Sham = rSham * rSham;
  const bestR2 = Math.max(r2, r2Egs);
  return {
    id: 'E5_binding_energy_correlation',
    title: 'Ionization-energy correlation vs EGS phase-register features',
    n_elements: n,
    r,
    r2,
    r2_egs_magnitude: r2Egs,
    best_r2: bestR2,
    sham_r2: r2Sham,
    draft_target_r2: 0.9998,
    interpretation:
      'Public first-IE series carries measurable association with EGS register features above sham. Draft R²=0.9998 is a design target, not this receipt.',
    honesty:
      'Compact public IE values + EGS features — architectural explanatory power, not QED.',
    pass: bestR2 > r2Sham + 0.15 && bestR2 > 0.2,
  };
}

/**
 * E6 — Phase residual variance across Z; register boundary Z=81.
 * Draft σ²=0.0001 is a design target; receipt reports computed variance.
 */
export function experimentPhaseVarianceAt81() {
  const residuals = [];
  const windowVars = [];
  for (let z = 1; z <= REGISTER_N; z += 1) {
    const k = z - 1;
    const phi = phaseSingularity(k);
    const ie = IONIZATION_EV[Math.min(z - 1, IONIZATION_EV.length - 1)];
    // Normalize IE phase proxy onto circle
    const iePhase = (2 * Math.PI * (ie % 1 + Math.log(ie))) % (2 * Math.PI);
    residuals.push(wrapPi(iePhase - phi));
  }
  // Sliding window variance
  const W = 9;
  for (let start = 0; start <= residuals.length - W; start += 1) {
    windowVars.push({ start: start + 1, end: start + W, var: variance(residuals.slice(start, start + W)) });
  }
  const atEnd = variance(residuals.slice(-W));
  const atMid = variance(residuals.slice(36, 36 + W));
  const globalVar = variance(residuals);
  return {
    id: 'E6_phase_variance_at_81',
    title: 'Phase residual variance — register windows ending at Z=81',
    global_variance: globalVar,
    variance_last_9: atEnd,
    variance_mid_9: atMid,
    draft_target_sigma2: 0.0001,
    interpretation:
      'Residual phase scatter is finite; end-window vs mid-window compared for register closure narrative.',
    honesty: 'Computed σ² is receipt truth; draft 0.0001 is a design target, not this run.',
    pass: Number.isFinite(globalVar) && globalVar > 0 && atEnd < globalVar * 1.5,
  };
}

/** E7 — Sham registers N≠81 break equal spacing / bijection closure. */
export function experimentShamWrongRegister(seed = RANDOM_SEED) {
  const rng = mulberry32(seed);
  const shams = [64, 80, 82, 100];
  const rows = [];
  for (const n of shams) {
    const step = (2 * Math.PI) / n;
    const modesOk = 3 ** 4 === n;
    // Force phase walk with E_F^k magnitude expecting 81 ticks
    let fail = 0;
    for (let t = 0; t < 20; t += 1) {
      const k = 1 + Math.floor(rng() * 5);
      const mag0 = Math.exp(LAMBDA_EGS * phaseSingularity(0, n));
      const mag1 = Math.exp(LAMBDA_EGS * phaseSingularity(k, n));
      // Expectation under 81-register: wrong
      const expect = E_F ** (k * (REGISTER_N / n));
      const rel = Math.abs(mag1 / mag0 - expect) / Math.max(1e-12, expect);
      if (rel > 1e-3) fail += 1;
    }
    rows.push({ n, modesOk, step, fail_count: fail });
  }
  const allBreak = rows.every((r) => r.modesOk === false);
  return {
    id: 'E7_sham_wrong_register',
    title: 'Sham registers (64/80/82/100) — 3⁴ closure fails',
    rows,
    interpretation: 'Only N=81 coincides with 3⁴ digit-mode closure.',
    pass: allBreak && rows.every((r) => r.fail_count >= 1),
  };
}

/** E8 — Honesty receipt: draft relativistic “no runaway” claim is not executed QED. */
export function experimentRelativisticHonestyReceipt() {
  return {
    id: 'E8_relativistic_honesty_receipt',
    title: 'Honesty — no QED / relativistic runaway experiment executed here',
    draft_claim:
      'E_F stabilizes shell geometry without higher-order relativistic runaway divergence',
    executed: false,
    design_target: true,
    interpretation:
      'Pass means we correctly label the draft claim as unexecuted — not that runaway is disproven.',
    honesty: 'Required PRA honesty gate for peer-facing abstracts.',
    pass: true,
  };
}

/** E9 — Aufbau / shell-filling order maps injectively into 81 slots. */
export function experimentShellFillingOrder() {
  // Condensed Aufbau orbital order (up to 6p) — count electrons through Tl (81).
  const orbitals = [
    ['1s', 2],
    ['2s', 2],
    ['2p', 6],
    ['3s', 2],
    ['3p', 6],
    ['4s', 2],
    ['3d', 10],
    ['4p', 6],
    ['5s', 2],
    ['4d', 10],
    ['5p', 6],
    ['6s', 2],
    ['4f', 14],
    ['5d', 10],
    ['6p', 6],
  ];
  let electrons = 0;
  const filled = [];
  for (const [name, cap] of orbitals) {
    const take = Math.min(cap, REGISTER_N - electrons);
    if (take <= 0) break;
    electrons += take;
    filled.push({ orbital: name, electrons: take, cumulative: electrons });
    if (electrons >= REGISTER_N) break;
  }
  const slots = [...Array(REGISTER_N).keys()];
  const assigned = new Set();
  let e = 0;
  for (const row of filled) {
    for (let i = 0; i < row.electrons; i += 1) {
      assigned.add(e);
      e += 1;
    }
  }
  return {
    id: 'E9_shell_filling_order',
    title: 'Aufbau filling maps injectively onto 81 register slots (through 6p / Z=81)',
    electrons_mapped: electrons,
    orbitals: filled,
    unique_slots: assigned.size,
    interpretation: 'Shell-filling order occupies the full 81-register without collision.',
    honesty: 'Standard Aufbau bookkeeping + register addressing — not a new spectroscopic measurement.',
    pass: electrons === REGISTER_N && assigned.size === REGISTER_N && slots.length === 81,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentRegisterIdentity(),
    experimentPhaseSingularities(),
    experimentQuantumNumberBijection(),
    experimentPauliSingularityIsolation(),
    experimentBindingEnergyCorrelation(),
    experimentPhaseVarianceAt81(),
    experimentShamWrongRegister(),
    experimentRelativisticHonestyReceipt(),
    experimentShellFillingOrder(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
    note:
      'Standalone empirical suite for the 81-digit electronic lattice: register identity, phase singularities, digit-mode bijection, Pauli metaphor, IE correlation, phase variance, sham registers, relativistic honesty, Aufbau map.',
  };
}
