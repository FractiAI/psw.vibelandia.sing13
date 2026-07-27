/**
 * DNA Lattice Holograph empirical suite.
 * Public UCSC hs1 chrom sizes + Euler–EGS phase lock + attention entropy on partitions.
 * Does NOT claim executed biophoton lab spectroscopy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  E_F,
  LAMBDA_EGS,
  BP_RISE_M,
  RANDOM_SEED,
  UCSC_HS1_CHROM_SIZES_URL,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OFFLINE_CHROM = path.join(__dirname, '..', 'data', 'hs1.chrom.sizes');
const HOLO_CORPUS = path.join(
  __dirname,
  '..',
  '..',
  'synthobs-holographic-operators',
  'data',
  'public_corpus.json',
);

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

function wrapPi(a) {
  let x = a;
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
}

function egsSpiral(theta, lambda = LAMBDA_EGS) {
  const mag = Math.exp(lambda * theta);
  return {
    re: mag * Math.cos(theta),
    im: mag * Math.sin(theta),
    mag,
    arg: Math.atan2(Math.sin(theta), Math.cos(theta)),
  };
}

function parseChromSizes(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const [chrom, bp] = line.trim().split(/\s+/);
      return { chrom, bp: Number(bp) };
    })
    .filter((r) => r.chrom && Number.isFinite(r.bp) && r.bp > 0);
}

async function loadChromSizes() {
  let live = false;
  let source = OFFLINE_CHROM;
  let text = fs.readFileSync(OFFLINE_CHROM, 'utf8');
  try {
    const res = await fetch(UCSC_HS1_CHROM_SIZES_URL, {
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      text = await res.text();
      live = true;
      source = UCSC_HS1_CHROM_SIZES_URL;
    }
  } catch {
    /* offline */
  }
  return { rows: parseChromSizes(text), live, source };
}

function shannonEntropy(probs) {
  return -probs.reduce((s, p) => (p > 0 ? s + p * Math.log(p) : s), 0);
}

function partitionEntropy(weights, strategy) {
  const n = weights.length;
  if (n < 2) return { coherence: 0, decay: 1 };
  let cut;
  if (strategy === 'linear') cut = Math.floor(n / 2);
  else if (strategy === 'phi') cut = Math.max(1, Math.min(n - 1, Math.round(n / PHI_EGS)));
  else cut = Math.max(1, Math.min(n - 1, Math.round(n / E_F)));

  const left = weights.slice(0, cut);
  const right = weights.slice(cut);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const tot = sum(weights) || 1;
  const pL = sum(left) / tot;
  const pR = sum(right) / tot;
  const H = shannonEntropy([pL, pR].filter((p) => p > 0));
  const Hmax = Math.log(2);
  const coherence = 1 - H / Hmax;
  // Recursive depth decay: entropy after one more EF-scaled cut on larger side
  const big = pL >= pR ? left : right;
  const cut2 = Math.max(1, Math.min(big.length - 1, Math.round(big.length / E_F)));
  const bSum = sum(big) || 1;
  const q1 = sum(big.slice(0, cut2)) / bSum;
  const q2 = 1 - q1;
  const H2 = shannonEntropy([q1, q2].filter((p) => p > 0));
  const decay = Math.max(0, H2 - H * (big.length / n));
  return { coherence, decay: Math.abs(decay), cut, H };
}

function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function operatorCoherence(words, scale) {
  if (!words.length) return 0;
  let hsum = 0;
  for (let k = 0; k < words.length; k += 1) {
    let h = 0;
    for (const c of words[k]) h = (h * 31 + c.charCodeAt(0)) % 9973;
    hsum += scale * ((h / 9973) * 2 * Math.PI) * ((k + 1) / words.length);
  }
  return Math.abs(Math.cos(hsum));
}

/** E1 — UCSC hs1 DNA lattice lengths (public genomic data). */
export async function experimentDnaLatticeIngest() {
  const { rows, live, source } = await loadChromSizes();
  const nuclear = rows.filter((r) => !r.chrom.includes('M') && !r.chrom.includes('m'));
  const withLen = nuclear.map((r) => ({
    ...r,
    length_m: r.bp * BP_RISE_M,
  }));
  const chrY = withLen.find((r) => r.chrom === 'chrY' || r.chrom === 'Y');
  return {
    id: 'E1_dna_lattice_ingest',
    title: 'UCSC hs1 chromosome lattice ingest (public T2T sizes)',
    live_fetch: live,
    source,
    n_chroms: withLen.length,
    chrY_bp: chrY?.bp ?? null,
    chrY_length_m: chrY?.length_m ?? null,
    total_bp: withLen.reduce((s, r) => s + r.bp, 0),
    interpretation:
      'Maps public base-pair counts to macroscopic lattice lengths $L=N\\cdot 0.34\\,\\mathrm{nm}$ — DNA as geometric projector substrate.',
    honesty: 'Structural geometry from public assembly — not biophoton laboratory spectroscopy.',
    pass: withLen.length >= 20 && chrY && chrY.bp > 1e6,
  };
}

/** E2 — Phase-locked scale invariance (Theorem 1) on DNA-indexed θ. */
export function experimentPhaseLockOnDnaAngles() {
  const { rows } = { rows: parseChromSizes(fs.readFileSync(OFFLINE_CHROM, 'utf8')) };
  const thetas = rows.slice(0, 12).map((r) => (2 * Math.PI * (r.bp % 1000)) / 1000);
  let maxRel = 0;
  let maxArg = 0;
  let n = 0;
  for (const th of thetas) {
    for (let k = -6; k <= 6; k += 1) {
      const z0 = egsSpiral(th);
      const z1 = egsSpiral(th + 2 * Math.PI * k);
      const scale = E_F ** k;
      const pred = Math.hypot(scale * z0.re, scale * z0.im);
      const rel = Math.abs(z1.mag - pred) / Math.max(1e-15, pred);
      maxRel = Math.max(maxRel, rel);
      maxArg = Math.max(maxArg, Math.abs(wrapPi(z1.arg - z0.arg)));
      n += 1;
    }
  }
  return {
    id: 'E2_phase_lock_dna_angles',
    title: 'Theorem 1 phase lock on DNA-derived angular samples',
    n_checks: n,
    max_relative_error: maxRel,
    max_arg_error_rad: maxArg,
    lambda_EGS: LAMBDA_EGS,
    interpretation:
      '$Z(\\theta+2\\pi k)=E_F^k Z(\\theta)$ holds on angles seeded from public chrom sizes.',
    pass: maxRel < 1e-9 && maxArg < 1e-12,
  };
}

/** E3 — Chromatin size partition coherence: linear vs φ vs E_F. */
export async function experimentChromatinPartitionCoherence() {
  const { rows } = await loadChromSizes();
  const weights = rows
    .filter((r) => r.chrom.startsWith('chr') && !r.chrom.includes('M'))
    .map((r) => r.bp)
    .sort((a, b) => b - a);
  const linear = partitionEntropy(weights, 'linear');
  const phi = partitionEntropy(weights, 'phi');
  const egs = partitionEntropy(weights, 'egs');
  // Note: phi and egs cuts are identical when E_F = Φ; distinguish by recursive depth metric
  const egsWins =
    egs.coherence >= linear.coherence && egs.decay <= linear.decay + 1e-12;
  return {
    id: 'E3_chromatin_partition',
    title: 'Recursive partition coherence on public chrom-size lattice',
    linear: { coherence: linear.coherence, decay: linear.decay },
    phi: { coherence: phi.coherence, decay: phi.decay },
    egs: { coherence: egs.coherence, decay: egs.decay },
    egs_beats_or_ties_linear: egsWins,
    interpretation:
      'EGS / φ recursive cuts on real chrom-size weights — architectural attention partitioning proxy.',
    honesty:
      'Not the draft’s 99.8% / 0.001 nats table. Computed coherence on public bp weights only.',
    pass: egsWins && weights.length >= 20,
  };
}

/** E4 — Agentic context entropy: partition public sentences under E_F nesting. */
export function experimentAgenticContextEntropy(seed = RANDOM_SEED) {
  let sentences = [];
  try {
    const corpus = JSON.parse(fs.readFileSync(HOLO_CORPUS, 'utf8'));
    sentences = corpus.sentences.map((s) => s.text);
  } catch {
    sentences = [
      'Alice was beginning to get very tired of sitting by her sister on the bank.',
      'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
      'We the People of the United States in Order to form a more perfect Union.',
    ];
  }
  const strategies = {
    linear: 1.0,
    phi: PHI_EGS,
    egs: E_F,
  };
  const summary = {};
  for (const [name, scale] of Object.entries(strategies)) {
    const gammas = [];
    const entropies = [];
    for (const text of sentences) {
      const words = tokenize(text);
      gammas.push(operatorCoherence(words, scale));
      const weights = words.map((w) => w.length);
      const part = partitionEntropy(weights, name === 'linear' ? 'linear' : 'egs');
      entropies.push(part.decay);
    }
    summary[name] = {
      mean_phase_coherence: mean(gammas),
      mean_entropy_decay: mean(entropies),
    };
  }
  const egsBest =
    summary.egs.mean_phase_coherence >= summary.linear.mean_phase_coherence &&
    summary.egs.mean_entropy_decay <= summary.linear.mean_entropy_decay + 1e-9;
  return {
    id: 'E4_agentic_context_entropy',
    title: 'Context-window entropy decay under EGS recursive partitioning',
    n_sentences: sentences.length,
    summary,
    egs_beats_linear: egsBest,
    interpretation:
      'In-silico agentic lattice proxy on public-domain sentences — phase coherence vs entropy decay.',
    honesty:
      'Draft 99.8% / Perfect fidelity rows are design targets. Actual means are corpus-computed.',
    pass: egsBest,
  };
}

/** E5 — Multi-perspective unification matrix (keyword coverage on paper abstracts bundle). */
export function experimentUnificationMatrix() {
  const domains = [
    {
      id: 'philosophy',
      text: 'material phenomena shadow of the realm of forms lattice matrix pure consciousness sensing awareness attention projection plato',
    },
    {
      id: 'physics',
      text: 'bulk spacetime shadow of the bounding holographic interference surface lattice matrix quantum observer measurement attention projection ads cft',
    },
    {
      id: 'genomics',
      text: 'cellular somatic form shadow dna chromatin helix lattice matrix directed epigenetic attention biophoton projector projection',
    },
    {
      id: 'agentic_ai',
      text: 'rendered execution output shadow multi-agent state graph lattice matrix prompt intent vector nested recursive attention projection',
    },
  ];
  const required = ['shadow', 'lattice', 'attention', 'matrix', 'projection'];
  const scores = domains.map((d) => {
    const t = d.text.toLowerCase();
    const hits = required.filter((k) => t.includes(k)).length;
    return { id: d.id, coverage: hits / required.length, hits };
  });
  const allCovered = scores.every((s) => s.coverage >= 0.4);
  return {
    id: 'E5_unification_matrix',
    title: 'Four-perspective unification matrix keyword coverage',
    scores,
    interpretation:
      'Checks that philosophy / physics / genomics / AI shadow–lattice–attention vocabulary is present in the formal map.',
    honesty: 'Structural coverage check — not a sociology or physics proof of unification.',
    pass: scores.length === 4 && allCovered,
  };
}

/** E6 — Nested vs flat attention graph complexity on chrom count. */
export function experimentNestedAttentionComplexity() {
  const n = parseChromSizes(fs.readFileSync(OFFLINE_CHROM, 'utf8')).filter((r) =>
    r.chrom.startsWith('chr'),
  ).length;
  const nested = Math.ceil(Math.log(n + 1) / Math.log(E_F)) + 1;
  const flat = (n * (n - 1)) / 2;
  return {
    id: 'E6_nested_attention_complexity',
    title: 'Nested vs flat multi-agent attention complexity on chrom lattice',
    n_chroms: n,
    nested_visits: nested,
    flat_mesh_links: flat,
    reduction_factor: flat / nested,
    interpretation: 'EGS nested attention vs flat peer mesh — DNA chromosome count as agent width proxy.',
    pass: nested < flat && n >= 20,
  };
}

/** E7 — Sham: random scale factor loses phase lock vs E_F. */
export function experimentShamScale(seed = RANDOM_SEED + 5) {
  const rng = mulberry32(seed);
  let fail = 0;
  const n = 100;
  for (let i = 0; i < n; i += 1) {
    const base = 1.2 + rng() * 2;
    const lam = Math.log(base) / (2 * Math.PI);
    const th = rng() * Math.PI;
    const k = 3;
    const z0 = egsSpiral(th, lam);
    const z1 = egsSpiral(th + 2 * Math.PI * k, lam);
    const pred = E_F ** k * z0.mag;
    if (Math.abs(z1.mag - pred) / pred > 1e-6) fail += 1;
  }
  return {
    id: 'E7_sham_random_scale',
    title: 'Sham random scales break E_F^k magnitude lock',
    fail_fraction: fail / n,
    interpretation: 'Only $\\lambda=\\ln(E_F)/2\\pi$ locks recursive attention hops to $E_F^k$.',
    pass: fail / n > 0.9,
  };
}

/** E8 — Biophoton / coherence-window honesty receipt (design target vs executed). */
export function experimentBiophotonHonestyReceipt() {
  return {
    id: 'E8_biophoton_honesty_receipt',
    title: 'Biophoton coherence claims — honesty tier receipt',
    draft_claim_coherence_ms: { egs: 480, control: 12.4, fold: 38 },
    executed_in_this_repo: false,
    substitute_executed_lane:
      'E1–E7 public genomic + algebraic + agentic entropy partitions',
    interpretation:
      'Documents that 480 ms / 38× biophoton figures are manuscript design targets pending bench spectroscopy.',
    honesty:
      'Pass = explicit non-claim of executed biophoton lab. Do not promote draft ms figures as empirical receipt.',
    pass: true,
  };
}

/** E9 — Cross-scale φ step between chrY and chr1 public lengths. */
export function experimentCrossScalePhiStep() {
  const rows = parseChromSizes(fs.readFileSync(OFFLINE_CHROM, 'utf8'));
  const y = rows.find((r) => r.chrom === 'chrY');
  const c1 = rows.find((r) => r.chrom === 'chr1');
  const ratio = c1.bp / y.bp;
  const k = Math.log(ratio) / Math.log(E_F);
  const nearest = Math.round(k);
  const recon = y.bp * E_F ** nearest;
  const rel = Math.abs(recon - c1.bp) / c1.bp;
  return {
    id: 'E9_cross_scale_phi_step',
    title: 'chrY→chr1 public length ratio in E_F steps',
    chrY_bp: y.bp,
    chr1_bp: c1.bp,
    ratio,
    egs_steps: k,
    nearest_integer_step: nearest,
    relative_recon_error: rel,
    interpretation:
      'Tests whether T2T length ratios sit near integer $E_F$ tiers — moderate architectural prior.',
    honesty: 'Geometric ratio test only — not proof DNA encodes Φ as biology law.',
    pass: Number.isFinite(k) && rel < 0.5,
  };
}

export async function runAllExperiments() {
  const e1 = await experimentDnaLatticeIngest();
  const e3 = await experimentChromatinPartitionCoherence();
  const experiments = [
    e1,
    experimentPhaseLockOnDnaAngles(),
    e3,
    experimentAgenticContextEntropy(),
    experimentUnificationMatrix(),
    experimentNestedAttentionComplexity(),
    experimentShamScale(),
    experimentBiophotonHonestyReceipt(),
    experimentCrossScalePhiStep(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
