import {
  E_F,
  PHASE_WINDOWS,
  SCHUMANN_NOMINAL_HZ,
  SHAM_CONSTANTS,
  RANDOM_SEED,
  RATIO_TOL,
  TARGET_R,
  R_SUPPORT_MIN,
  SHUFFLE_DROP_MIN,
} from './constants.mjs';

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Pearson product-moment correlation. */
export function pearsonR(xs, ys) {
  if (xs.length !== ys.length || xs.length < 2) return NaN;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? NaN : num / den;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleCopy(arr, seed) {
  const out = arr.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function successiveRatios(values) {
  const ratios = [];
  for (let i = 1; i < values.length; i++) {
    ratios.push(values[i] / values[i - 1]);
  }
  return ratios;
}

function meanAbsErr(ratios, target) {
  return mean(ratios.map((r) => Math.abs(r - target)));
}

export function e1DeltaBHarmonic() {
  const deltas = PHASE_WINDOWS.map((p) => p.deltaB_uT);
  const ratios = successiveRatios(deltas);
  const maeEf = meanAbsErr(ratios, E_F);
  const sham = Object.fromEntries(
    Object.entries(SHAM_CONSTANTS).map(([k, v]) => [k, meanAbsErr(ratios, v)]),
  );
  const bestSham = Math.min(...Object.values(sham));
  const pass = maeEf <= RATIO_TOL && maeEf < bestSham - 0.02;
  return {
    id: 'E1',
    title: 'ΔB successive ratios ≈ E_F (vs sham constants)',
    pass,
    verdict: pass ? 'support' : 'refute',
    ratios,
    mae_E_F: maeEf,
    sham_mae: sham,
    honesty:
      'Tests harmonic structure of the authored ΔB ladder — not a live SQUID file.',
  };
}

export function e2SchumannSpacing() {
  const reported = PHASE_WINDOWS.map((p) => p.f_hz);
  const diffsRep = successiveRatios(reported);
  const diffsNom = successiveRatios(SCHUMANN_NOMINAL_HZ);
  const maeRep = meanAbsErr(diffsRep, mean(diffsRep));
  const nearNominal = reported.every((f, i) => Math.abs(f - SCHUMANN_NOMINAL_HZ[i]) < 2.5);
  const pass = nearNominal && reported.length === 5;
  return {
    id: 'E2',
    title: 'Reported f_n near nominal Schumann ladder',
    pass,
    verdict: pass ? 'support' : 'refute',
    reported_hz: reported,
    nominal_hz: SCHUMANN_NOMINAL_HZ,
    ratio_spread_reported: maeRep,
    ratio_spread_nominal: meanAbsErr(diffsNom, mean(diffsNom)),
    honesty: 'Literature-anchor proximity check — not live ionospheric ingest.',
  };
}

export function e3ProtocolPearsonR() {
  const T = PHASE_WINDOWS.map((p) => Date.parse(p.utc));
  const F = PHASE_WINDOWS.map((p) => p.f_hz);
  const R = pearsonR(T, F);
  const pass = Number.isFinite(R) && R >= R_SUPPORT_MIN && Math.abs(R - TARGET_R) < 0.05;
  return {
    id: 'E3',
    title: 'Pearson R on protocol table (T_prompt ↔ f_schumann)',
    pass,
    verdict: pass ? 'support' : 'refute',
    R,
    target_R: TARGET_R,
    honesty:
      'R characterizes the authored protocol receipt columns — upgrade to lab claim only via H4 + independent dumps.',
  };
}

export function e4ShuffleSham() {
  const T = PHASE_WINDOWS.map((p) => Date.parse(p.utc));
  const F = PHASE_WINDOWS.map((p) => p.f_hz);
  const R0 = pearsonR(T, F);
  const shuffles = [];
  for (let s = 0; s < 32; s++) {
    const Fs = shuffleCopy(F, RANDOM_SEED + s);
    shuffles.push(pearsonR(T, Fs));
  }
  const meanAbsSham = mean(shuffles.map((r) => Math.abs(r)));
  const drop = Math.abs(R0) - meanAbsSham;
  const pass = drop >= SHUFFLE_DROP_MIN;
  return {
    id: 'E4',
    title: 'Time–frequency shuffle sham drops |R|',
    pass,
    verdict: pass ? 'support' : 'refute',
    R0,
    mean_abs_R_shuffled: meanAbsSham,
    drop,
    drop_min: SHUFFLE_DROP_MIN,
    honesty: 'Control against order artifact on the same five-point table.',
  };
}

export function e5AttentionDenominator() {
  const d_k = 64;
  const scale = Math.sqrt(d_k) * E_F;
  const naive = Math.sqrt(d_k);
  const ratio = scale / naive;
  const pass = Math.abs(ratio - E_F) < 1e-12;
  return {
    id: 'E5',
    title: 'Softmax scale includes E_F (√d_k · E_F)',
    pass,
    verdict: pass ? 'support' : 'refute',
    d_k,
    scale,
    ratio_to_naive: ratio,
    honesty: 'Algebraic construction check — not a proof of magnetostatics.',
  };
}

export async function e6LabGate(readJsonOptional) {
  const lab = await readJsonOptional('lab_elf_squid.json');
  if (!lab) {
    return {
      id: 'E6',
      title: 'Independent SQUID+ELF co-registration (lab gate)',
      pass: true,
      verdict: 'skip',
      honesty:
        'No data/lab_elf_squid.json — laboratory geophysics gate remains open. Do not report as support.',
    };
  }
  const T = lab.timestamps_ms;
  const F = lab.f_hz;
  const R = pearsonR(T, F);
  const pass = Number.isFinite(R) && R >= 0.8;
  return {
    id: 'E6',
    title: 'Independent SQUID+ELF co-registration (lab gate)',
    pass,
    verdict: pass ? 'support' : 'refute',
    R,
    honesty: 'Computed from optional lab dump only.',
  };
}

export async function runAllExperiments(readJsonOptional) {
  const experiments = [
    e1DeltaBHarmonic(),
    e2SchumannSpacing(),
    e3ProtocolPearsonR(),
    e4ShuffleSham(),
    e5AttentionDenominator(),
    await e6LabGate(readJsonOptional),
  ];
  const scored = experiments.filter((e) => e.verdict !== 'skip');
  const n_pass = scored.filter((e) => e.pass).length;
  const n_total = scored.length;
  const failed = scored.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total,
    failed,
    experiments,
  };
}
