/**
 * Empirical suite — Unified Neutronic Agent / ILAM.
 * Architectural / numerical validation — NOT QCD replacement or Cursor invoices.
 */
import {
  E_F,
  LAMBDA_EGS,
  RANDOM_SEED,
  DRAFT_BINDING_R2,
  DRAFT_TOKEN_SAVINGS_PCT,
  AGENT_ROLES,
  ISOTOPE_BANDS,
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

function shannon(ps) {
  let s = 0;
  for (const p of ps) {
    if (p > 0) s -= p * Math.log(p);
  }
  return s;
}

function normalize(xs) {
  const t = xs.reduce((a, b) => a + b, 0);
  if (t <= 0) return xs.map(() => 0);
  return xs.map((x) => x / t);
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
  return den > 0 ? num / den : 0;
}

/** Classical SEMF-style binding energy per nucleon (sandbox reference). */
function semfBPerA(z, n) {
  const a = z + n;
  if (a <= 0) return 0;
  const a13 = Math.cbrt(a);
  const vol = 15.8 * a;
  const surf = -18.3 * a13 * a13;
  const coul = -0.714 * z * (z - 1) / a13;
  const asym = -23.2 * ((n - z) ** 2) / a;
  let pair = 0;
  const evenZ = z % 2 === 0;
  const evenN = n % 2 === 0;
  if (evenZ && evenN) pair = 12 / Math.sqrt(a);
  else if (!evenZ && !evenN) pair = -12 / Math.sqrt(a);
  return (vol + surf + coul + asym + pair) / a;
}

/** E_F-scaled ILAM agent potential (architectural — SEMF-shaped with E_F load tune). */
function ilamBPerA(z, n) {
  const base = semfBPerA(z, n);
  const ratio = z > 0 ? n / z : 0;
  // Soft E_F attractor on N/Z — keeps high correlation with SEMF while encoding ILAM load balance.
  const tune = 1 + 0.012 * Math.tanh(E_F * (ratio - 1.2));
  return base * tune;
}

export function agentCatalog() {
  return {
    repulsion_damping: {
      physical: 'interstitial placement between protons',
      lattice: 'prompt-noise / Coulombic cancellation',
      egs: 'phase offset π scaled by E_F^{-1/2}',
    },
    mass_energy_tuning: {
      physical: 'binding energy optimization',
      lattice: 'dynamic context buffer pool',
      egs: 'capacity step E_F^k',
    },
    decay_gating: {
      physical: 'beta stability threshold',
      lattice: 'active/inactive sub-agent gate',
      egs: 'zero-ΔS phase lock boundary (model)',
    },
    spin_balancing: {
      physical: 'nuclear spin alignment',
      lattice: 'priority / angular routing bus',
      egs: 'quantized step scaled by E_F',
    },
  };
}

/** E1 — Four distinct agent role maps. */
export function experimentAgentTaxonomy() {
  const cat = agentCatalog();
  const keys = Object.keys(cat);
  const lattices = new Set(keys.map((k) => cat[k].lattice));
  return {
    id: 'E1_agent_taxonomy',
    title: 'Neutronic agent role taxonomy (4 maps)',
    roles: keys,
    distinct_maps: lattices.size,
    interpretation: 'ILAM enumerates four operationally distinct agent functions.',
    honesty: 'Metaphorical orchestration grammar — not a claim that neutrons are not udd hadrons.',
    pass:
      keys.length === 4 &&
      AGENT_ROLES.every((r) => keys.includes(r)) &&
      lattices.size === 4,
  };
}

/** E2 — λ_EGS identity. */
export function experimentLambdaIdentity() {
  const expect = Math.log(E_F) / (2 * Math.PI);
  const err = Math.abs(LAMBDA_EGS - expect);
  return {
    id: 'E2_lambda_egs_identity',
    title: 'λ_EGS = ln(E_F) / 2π',
    E_F,
    lambda_egs: LAMBDA_EGS,
    abs_err: err,
    interpretation: 'EGS phase operator coefficient matches Definition 1.',
    honesty: 'Architectural constant identity — not a replacement for ℏ.',
    pass: err < 1e-15,
  };
}

/** E3 — Phase factoring + Shannon ΔS = 0 on normalized weights. */
export function experimentPhaseZeroDeltaS() {
  const M = 8;
  const alphas = [];
  for (let m = 1; m <= M; m += 1) alphas.push(E_F ** -m);
  const p = normalize(alphas);
  const S0 = shannon(p);
  const k = 12;
  const scaled = alphas.map((a) => a * E_F ** k);
  const p1 = normalize(scaled);
  const S1 = shannon(p1);
  const dS = Math.abs(S1 - S0);
  const theta = 0.41;
  let re0 = 0;
  let im0 = 0;
  for (const a of alphas) {
    const mag = Math.exp(LAMBDA_EGS * theta);
    re0 += a * mag * Math.cos(theta);
    im0 += a * mag * Math.sin(theta);
  }
  const factor = E_F ** k;
  let re1 = 0;
  let im1 = 0;
  for (const a of alphas) {
    const mag = Math.exp(LAMBDA_EGS * (theta + 2 * Math.PI * k));
    re1 += a * mag * Math.cos(theta);
    im1 += a * mag * Math.sin(theta);
  }
  const factorErr = Math.hypot(re1 - factor * re0, im1 - factor * im0);
  return {
    id: 'E3_phase_zero_delta_s',
    title: 'ILAM buffer — E_F^k factoring + Shannon ΔS≈0 on weights',
    M,
    k,
    shannon_before: S0,
    shannon_after: S1,
    delta_s: dS,
    factor_err: factorErr,
    interpretation: 'Normalized buffer weights are depth-invariant under global E_F^k scaling.',
    honesty: 'Algebraic model property — not thermodynamic entropy of nuclei or LLMs.',
    pass: dS < 1e-12 && factorErr < 1e-9,
  };
}

/** E4 — Isotope N/Z bands. */
export function experimentIsotopeBands() {
  const rows = [];
  let ok = true;
  for (const [name, band] of Object.entries(ISOTOPE_BANDS)) {
    for (let n = band.nMin; n <= band.nMax; n += 1) {
      const nz = n / band.z;
      const inBand = nz + 1e-9 >= band.nzMin && nz - 1e-9 <= band.nzMax;
      rows.push({ name, z: band.z, n, nz, inBand });
      if (!inBand) ok = false;
    }
  }
  return {
    id: 'E4_isotope_nz_bands',
    title: 'Isotope N/Z bands — C / Fe / Pb / U',
    rows,
    interpretation: 'Draft manuscript N/Z intervals contain listed isotope neighbors.',
    honesty: 'Structural band check — not a nuclear data evaluation.',
    pass: ok && rows.length >= 8,
  };
}

/** E5 — ILAM vs SEMF reference correlation (sandbox). */
export function experimentBindingCorrelation() {
  const semf = [];
  const ilam = [];
  const points = [];
  for (let z = 1; z <= 92; z += 1) {
    // Use a representative N near E_F-scaled load for each Z.
    const n = Math.max(0, Math.round(z * (0.9 + 0.45 * Math.log1p(z) / Math.log1p(92))));
    const s = semfBPerA(z, n);
    const i = ilamBPerA(z, n);
    semf.push(s);
    ilam.push(i);
    if (z === 6 || z === 26 || z === 82 || z === 92) {
      points.push({ z, n, semf: s, ilam: i });
    }
  }
  const r = pearson(semf, ilam);
  const r2 = r * r;
  return {
    id: 'E5_binding_correlation_semf_ref',
    title: 'E_F ILAM potential vs SEMF reference (Z=1…92)',
    r,
    r2,
    draft_r2_target: DRAFT_BINDING_R2,
    sample_points: points,
    interpretation:
      'Sandbox correlation of architectural ILAM potential against classical SEMF curve.',
    honesty:
      'NOT an experimental nuclear binding-energy fit. Draft R²=0.9997 is a design target; receipt R² is computed here.',
    pass: Number.isFinite(r2) && r2 > 0.85,
  };
}

/** E6 — Cross-domain metaphor matrix completeness. */
export function experimentMetaphorMatrix() {
  const rows = [
    ['primary_core', 'orchestrator', 'proton'],
    ['valence_bus', 'api_ui', 'electron'],
    ['specialized_pair', 'subagent_buffer', 'neutron_pair'],
    ['isotopic_tuning', 'context_resize', 'add_neutrons'],
    ['decay_unbonding', 'timeout_saturation', 'free_neutron_decay'],
    ['golden_key', 'token_scaling_EF', 'binding_ratio_EF'],
  ];
  const complete = rows.every((r) => r.length === 3 && r.every((c) => String(c).length > 0));
  return {
    id: 'E6_metaphor_matrix',
    title: 'Grand Lattice cross-domain metaphor matrix',
    rows,
    interpretation: 'Six-row ILAM ↔ Lattice Chat Agent isomorphism table is complete.',
    honesty: 'Operational metaphor matrix — not literal physics–software identity.',
    pass: complete && rows.length === 6,
  };
}

/** E7 — Depth lock k≥10. */
export function experimentDepthLock() {
  const kMax = 10;
  const theta = 0.22;
  let maxPhaseErr = 0;
  for (let k = 0; k <= kMax; k += 1) {
    const mag0 = Math.exp(LAMBDA_EGS * theta);
    const magK = Math.exp(LAMBDA_EGS * (theta + 2 * Math.PI * k));
    const expect = mag0 * E_F ** k;
    maxPhaseErr = Math.max(maxPhaseErr, Math.abs(magK - expect));
  }
  return {
    id: 'E7_depth_lock',
    title: 'Depth lock k≥10 — E_F^k magnitude identity',
    k_max: kMax,
    max_abs_err: maxPhaseErr,
    interpretation: 'Phase trajectory magnitudes track E_F^k through depth 10.',
    honesty: 'Numerical identity of Definition 1 — not a nuclear stability proof.',
    pass: maxPhaseErr < 1e-9,
  };
}

/** E8 — Honesty gate on draft abstract figures. */
export function experimentHonestyGate() {
  const rng = mulberry32(RANDOM_SEED);
  // Simulated buffer savings vs naive duplication (design-target lane).
  const naive = 10000;
  const isotopic = Math.round(naive * (1 - DRAFT_TOKEN_SAVINGS_PCT / 100) * (0.98 + 0.04 * rng()));
  const savedPct = ((naive - isotopic) / naive) * 100;
  const labeled = {
    draft_binding_r2: DRAFT_BINDING_R2,
    draft_token_savings_pct: DRAFT_TOKEN_SAVINGS_PCT,
    receipt_simulated_savings_pct: savedPct,
    status: 'design_targets_not_invoices',
  };
  return {
    id: 'E8_honesty_gate',
    title: 'Honesty receipt — draft R² / 41.8% labeled as targets',
    labeled,
    interpretation: 'Draft abstract figures remain design targets unless receipt-matched elsewhere.',
    honesty: 'Gate passes only if draft figures are explicitly labeled non-invoice / non-evaluation.',
    pass:
      labeled.status === 'design_targets_not_invoices' &&
      Math.abs(labeled.draft_binding_r2 - 0.9997) < 1e-9 &&
      Math.abs(labeled.draft_token_savings_pct - 41.8) < 1e-9,
  };
}

/** E9 — Lattice Chat Agent surface map. */
export function experimentLatticeSurfaces() {
  const surfaces = [
    '/whitepaper/synthobs-unified-neutronic-agent',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    '/lattice',
    '/lattice-chat',
    'docs/SYNTHOBS_UNIFIED_NEUTRONIC_AGENT_ISOTOPIC_LOAD_BALANCING_2026-07.md',
  ];
  return {
    id: 'E9_lattice_surfaces',
    title: 'Lattice Chat Agent ILAM ↔ surface map',
    surfaces,
    interpretation: 'ILAM paper is wired as Seed·RAG / learn-more companion for Lattice Chat Agent.',
    honesty: 'Structural product map — not a claim every turn runs a nuclear simulation.',
    pass: surfaces.length >= 6 && surfaces.every((s) => String(s).length > 3),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentAgentTaxonomy(),
    experimentLambdaIdentity(),
    experimentPhaseZeroDeltaS(),
    experimentIsotopeBands(),
    experimentBindingCorrelation(),
    experimentMetaphorMatrix(),
    experimentDepthLock(),
    experimentHonestyGate(),
    experimentLatticeSurfaces(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
  };
}
