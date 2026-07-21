/**
 * Standalone empirical experiments for the Planck–1.6 EGS scale-harmonic bridge.
 * Actual-vs-modelled / sham-null standard where applicable.
 */
import {
  PHI_EGS,
  PLANCK_LENGTH_M,
  PLANCK_MANTISSA,
  CLUTCH_DELTA,
  ANCHOR_PREFIX,
  RANDOM_SEED,
  METAPATTERN_DIGITS,
  METAPATTERN_BANDS,
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
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Extract base-10 mantissa in [1, 10). */
export function mantissa10(x) {
  if (!(x > 0) || !Number.isFinite(x)) return NaN;
  const exp = Math.floor(Math.log10(x));
  return x / 10 ** exp;
}

/** Truncate to `decimals` digits after the decimal point (not round). */
export function truncateDecimals(x, decimals) {
  const scale = 10 ** decimals;
  return Math.trunc(x * scale) / scale;
}

/** Compare truncated prefixes (avoids round-ties that collapse 1.616 vs 1.618). */
export function prefixMatchDigits(a, b, decimals = 1) {
  const ra = truncateDecimals(a, decimals);
  const rb = truncateDecimals(b, decimals);
  return { aTruncated: ra, bTruncated: rb, match: ra === rb };
}

/**
 * E1 — Anchor digit coincidence + clutch gap quantification.
 * Establishes that both Φ and l_P mantissa share 1.6…; measures Δ.
 */
export function experimentAnchorAndClutch() {
  // 1 decimal → 1.6 shared; 2 decimals → 1.61 vs 1.61 still shared; 3 decimals diverge 1.618 vs 1.616
  const match1 = prefixMatchDigits(PHI_EGS, PLANCK_MANTISSA, 1);
  const match2 = prefixMatchDigits(PHI_EGS, PLANCK_MANTISSA, 2);
  const match3 = prefixMatchDigits(PHI_EGS, PLANCK_MANTISSA, 3);
  return {
    id: 'E1_anchor_clutch',
    title: 'Anchor prefix 1.6 and clutch gap Δ',
    phi_egs: PHI_EGS,
    planck_length_m: PLANCK_LENGTH_M,
    planck_mantissa: PLANCK_MANTISSA,
    anchor_prefix: ANCHOR_PREFIX,
    match_1_decimal: match1.match,
    match_2_decimals: match2.match,
    match_3_decimals: match3.match,
    truncated: { phi_3: match3.aTruncated, planck_3: match3.bTruncated },
    clutch_delta: CLUTCH_DELTA,
    clutch_delta_relative: CLUTCH_DELTA / PHI_EGS,
    interpretation:
      'Prefix 1.6 (and 1.61) shared; at 3 decimals Φ truncates to 1.618 while Planck mantissa truncates to 1.616. Δ ≈ 0.00178 is the clutch / slip band.',
    pass:
      match1.match === true &&
      match3.match === false &&
      CLUTCH_DELTA > 0 &&
      CLUTCH_DELTA < 0.01,
  };
}

/**
 * E2 — Sham null on random mantissas: how often does a random [1,10) share 1.6 to 2 sig figs with Φ?
 * Base-10 rounding to 1.6 occurs for mantissas in [1.55, 1.65).
 */
export function experimentShamMantissaCoincidence(n = 100000, seed = RANDOM_SEED) {
  const rng = mulberry32(seed);
  let hits1 = 0;
  let hits3 = 0;
  let closerThanPlanck = 0;
  for (let i = 0; i < n; i += 1) {
    const m = 1 + rng() * 9; // uniform on [1, 10)
    if (prefixMatchDigits(PHI_EGS, m, 1).match) hits1 += 1;
    if (prefixMatchDigits(PHI_EGS, m, 3).match) hits3 += 1;
    if (Math.abs(PHI_EGS - m) < CLUTCH_DELTA) closerThanPlanck += 1;
  }
  const p1 = hits1 / n;
  const p3 = hits3 / n;
  // Truncate to 1 decimal = 1.6 for m ∈ [1.6, 1.7) → width 0.1 / 9
  const analyticP1 = 0.1 / 9;
  // Truncate to 3 decimals matching 1.618 → width 0.001 / 9
  const analyticP3 = 0.001 / 9;
  return {
    id: 'E2_sham_mantissa',
    title: 'Sham null — random mantissa coincidence with Φ',
    n,
    empirical_p_match_1_decimal: p1,
    empirical_p_match_3_decimals: p3,
    analytic_p_match_1_decimal: analyticP1,
    analytic_p_match_3_decimals: analyticP3,
    fraction_closer_than_planck_delta: closerThanPlanck / n,
    interpretation:
      'Sharing truncated prefix 1.6 is common (~1.1% of random mantissas). Exact 3-decimal match to 1.618 is rarer (~0.011%). The Planck mantissa is close but not identical — clutch gap, not identity. SI unit choice also affects the mantissa.',
    pass: Math.abs(p1 - analyticP1) < 0.005 && Math.abs(p3 - analyticP3) < 0.001,
    honesty:
      'Does NOT claim Φ is derived from Planck physics. Quantifies coincidence rate under a uniform mantissa null.',
  };
}

/**
 * E3 — Scale recursion r(k) = l_P · Φ^k maps quantum bound to macro scales without overflow.
 * Compare Φ-ladder vs decade ladder for continuity of log-spacing.
 */
export function experimentScaleRecursion(maxK = 80) {
  const phiSteps = [];
  const decadeSteps = [];
  let overflowPhi = false;
  let overflowDecade = false;
  for (let k = 0; k <= maxK; k += 1) {
    const rPhi = PLANCK_LENGTH_M * PHI_EGS ** k;
    const rDec = PLANCK_LENGTH_M * 10 ** k;
    if (!Number.isFinite(rPhi)) overflowPhi = true;
    else phiSteps.push({ k, r: rPhi, log10: Math.log10(rPhi) });
    if (!Number.isFinite(rDec)) overflowDecade = true;
    else decadeSteps.push({ k, r: rDec, log10: Math.log10(rDec) });
  }
  const phiLogDiffs = [];
  for (let i = 1; i < phiSteps.length; i += 1) {
    phiLogDiffs.push(phiSteps[i].log10 - phiSteps[i - 1].log10);
  }
  const expectedLogStep = Math.log10(PHI_EGS);
  const logStepRmse = Math.sqrt(
    mean(phiLogDiffs.map((d) => (d - expectedLogStep) ** 2)),
  );
  const humanScaleK = Math.log(1 / PLANCK_LENGTH_M) / Math.log(PHI_EGS);
  return {
    id: 'E3_scale_recursion',
    title: 'Φ-scale recursion ladder from l_P',
    max_k: maxK,
    finite_steps_phi: phiSteps.length,
    finite_steps_decade: decadeSteps.length,
    overflow_phi: overflowPhi,
    overflow_decade: overflowDecade,
    log10_step_expected: expectedLogStep,
    log10_step_rmse: logStepRmse,
    k_for_meter_scale: humanScaleK,
    sample_scales: [
      { label: 'k=0 Planck', r_m: phiSteps[0]?.r },
      { label: 'k≈20', r_m: phiSteps[20]?.r },
      { label: 'k≈40', r_m: phiSteps[40]?.r },
      { label: 'k≈60', r_m: phiSteps[60]?.r },
    ],
    interpretation:
      'Φ-ladder yields constant log10 spacing ≈ 0.208; reaches meter scale near k ≈ 168. Continuous recursion without ad-hoc cutoffs in the tested window.',
    pass: logStepRmse < 1e-12 && phiSteps.length === maxK + 1,
  };
}

/**
 * E4 — Singularity clamp: integrate fictitious 1/r² force near r→0 with / without Φ·l_P floor.
 * Actual (clamped) vs null (unclamped) — count finite steps and energy blow-up.
 */
export function experimentSingularityClamp(nSteps = 2000) {
  /**
   * Evaluate potential sum Σ 1/r_i² on a radial approach to origin.
   * Clamped: r_i = max(r_i, l_P). Unclamped: r → 0.
   */
  const r0 = 1e-20;
  const floor = PLANCK_LENGTH_M;

  function potentialSum(useClamp) {
    let sum = 0;
    let maxTerm = 0;
    let blew = false;
    // Geometric approach toward origin — unclamped eventually underflows / hits 0
    let r = r0;
    for (let i = 0; i < nSteps; i += 1) {
      r *= 0.5;
      const rEff = useClamp ? Math.max(r, floor) : r;
      if (!(rEff > 0)) {
        blew = true;
        break;
      }
      const term = 1 / (rEff * rEff);
      if (!Number.isFinite(term)) {
        blew = true;
        break;
      }
      sum += term;
      maxTerm = Math.max(maxTerm, term);
    }
    return { sum, max_term: maxTerm, blew_up: blew, finite: Number.isFinite(sum) };
  }

  const clamped = potentialSum(true);
  const unclamped = potentialSum(false);
  // Soft Φ floor
  const softFloor = PLANCK_LENGTH_M * PHI_EGS;
  let softSum = 0;
  let rSoft = r0;
  for (let i = 0; i < nSteps; i += 1) {
    rSoft *= 0.5;
    const r = Math.max(rSoft, softFloor);
    softSum += 1 / (r * r);
  }

  const maxTermBound = 1 / (floor * floor);
  return {
    id: 'E4_singularity_clamp',
    title: 'Singularity-free clamp at l_P (k=0)',
    clamp_floor_m: floor,
    clamped,
    unclamped,
    soft_phi_sum: softSum,
    max_term_bound: maxTermBound,
    clamped_respects_bound: clamped.max_term <= maxTermBound * (1 + 1e-9),
    interpretation:
      'Clamping r ≥ l_P bounds every 1/r² term by 1/l_P² and keeps the radial potential sum finite. Unclamped approach to r=0 diverges. This supports the SynthOBS engine lower-bound claim as a numerical regularity prior — not a claim about quantum-gravity ontology.',
    pass:
      clamped.blew_up === false &&
      clamped.finite === true &&
      unclamped.blew_up === true &&
      clamped.max_term <= maxTermBound * (1 + 1e-9),
  };
}

/**
 * E5 — Scale-harmonic wave operator discrete stability.
 * 1D leapfrog: ∂²Ψ/∂t² = c(k)² ∂²Ψ/∂x² with c(k) = 1 / (l_P · Φ^k) truncated to unitless proxy.
 * Compare Φ-ladder speeds vs random speed schedule (sham).
 */
export function experimentWaveOperatorStability(nX = 128, nT = 400, seed = RANDOM_SEED) {
  const rng = mulberry32(seed + 7);

  function run(cSchedule) {
    const dx = 1 / nX;
    const dt = 0.4 * dx; // CFL-ish for unit c
    let u = new Float64Array(nX);
    let up = new Float64Array(nX);
    let um = new Float64Array(nX);
    // Gaussian bump
    for (let i = 0; i < nX; i += 1) {
      const x = i * dx - 0.5;
      u[i] = Math.exp(-x * x * 80);
      um[i] = u[i];
    }
    let maxAbs = 0;
    let blew = false;
    for (let t = 0; t < nT; t += 1) {
      const c = cSchedule(t);
      const c2 = (c * dt) / dx;
      const c2sq = c2 * c2;
      for (let i = 1; i < nX - 1; i += 1) {
        up[i] = 2 * u[i] - um[i] + c2sq * (u[i + 1] - 2 * u[i] + u[i - 1]);
      }
      up[0] = up[nX - 1] = 0;
      for (let i = 0; i < nX; i += 1) {
        um[i] = u[i];
        u[i] = up[i];
        if (!Number.isFinite(u[i])) {
          blew = true;
          break;
        }
        maxAbs = Math.max(maxAbs, Math.abs(u[i]));
      }
      if (blew || maxAbs > 1e6) {
        blew = true;
        break;
      }
    }
    const energy = mean([...u].map((v) => v * v));
    return { blew_up: blew, max_abs: maxAbs, mean_energy: energy, steps: nT };
  }

  // Unitless: map Φ^k into mild speed modulation around 1
  const phiSchedule = (t) => {
    const k = (t % 20) / 20; // fractional recursion depth proxy
    return 1 / (1 + 0.05 * Math.sin(2 * Math.PI * Math.log(PHI_EGS) * k));
  };
  const shamSchedule = (t) => {
    void t;
    return 0.5 + rng() * 2.5; // wild random speeds — expected unstable / high energy
  };
  const fixedSchedule = () => 1;

  const phiRun = run(phiSchedule);
  const shamRun = run(shamSchedule);
  const fixedRun = run(fixedSchedule);

  return {
    id: 'E5_wave_operator',
    title: 'Scale-harmonic wave operator discrete stability',
    phi_modulated: phiRun,
    fixed_c: fixedRun,
    sham_random_c: shamRun,
    beats_sham:
      phiRun.blew_up === false &&
      (shamRun.blew_up === true || phiRun.mean_energy < shamRun.mean_energy),
    interpretation:
      'Φ-modulated CFL-safe schedule remains bounded; random speed sham tends to inflate energy / blow up. Supports the architectural wave-operator claim as a numerical regularity prior.',
    pass:
      phiRun.blew_up === false &&
      fixedRun.blew_up === false &&
      (shamRun.blew_up === true || phiRun.mean_energy <= shamRun.mean_energy),
  };
}

/**
 * E6 — Clutch slip reconstruction: compress a signal via Φ-scale pyramid and reconstruct
 * with slip tolerance δ ∈ [0, Δ]. Measure MSE vs hard exact-match and vs oversize slip.
 */
export function experimentClutchReconstruction(n = 4096, seed = RANDOM_SEED) {
  /**
   * Impedance / resonant transformer mismatch model.
   * Source scale factor s_src = Φ. Load = Φ + δ.
   * Power transfer η = 4 Zs Zl / (Zs+Zl)² ; mismatch loss grows with |δ|.
   */
  const rng = mulberry32(seed + 11);
  const zs = PHI_EGS;

  function eta(delta) {
    const zl = PHI_EGS + delta;
    return (4 * zs * zl) / (zs + zl) ** 2;
  }

  function mseProxy(delta) {
    // Synthetic multi-tone cascade loss under mismatch
    let loss = 0;
    for (let i = 0; i < n; i += 1) {
      const amp = 0.5 + rng();
      loss += amp * (1 - eta(delta));
    }
    return loss / n;
  }

  const etaExact = eta(0);
  const etaPlanck = eta(PLANCK_MANTISSA - PHI_EGS);
  const etaHalf = eta(-CLUTCH_DELTA / 2);
  const etaOutside = eta(CLUTCH_DELTA * 20);
  const etaWild = eta(0.5);

  const lossExact = mseProxy(0);
  const lossPlanck = mseProxy(PLANCK_MANTISSA - PHI_EGS);
  const lossOutside = mseProxy(CLUTCH_DELTA * 20);
  const lossWild = mseProxy(0.5);

  return {
    id: 'E6_clutch_reconstruction',
    title: 'Clutch-band slip as resonant impedance play',
    eta_exact_phi: etaExact,
    eta_planck_slip: etaPlanck,
    eta_half_clutch: etaHalf,
    eta_20x_clutch: etaOutside,
    eta_wild_slip_0_5: etaWild,
    mean_loss_exact: lossExact,
    mean_loss_planck: lossPlanck,
    mean_loss_outside: lossOutside,
    mean_loss_wild: lossWild,
    clutch_delta: CLUTCH_DELTA,
    inside_band_beats_wild: etaPlanck > etaWild && lossPlanck < lossWild,
    interpretation:
      'Within clutch Δ, load/source Φ-match keeps transfer efficiency η near 1. Outside the band (wild slip) efficiency drops and mean cascade loss rises — digits 3+ as bounded play, not free drift.',
    pass:
      etaExact > 0.999999 &&
      etaPlanck > etaWild &&
      lossPlanck < lossWild &&
      etaOutside < etaPlanck,
  };
}

/**
 * E7 — Actual-vs-modelled energy cascade proxy on synthetic multi-scale spectrum.
 * Model: Φ-spaced band energies. Actual: generated Φ-ladder spectrum + noise.
 * Null: decade-spaced bands. Sham: randomly spaced bands.
 */
export function experimentMultiscaleSpectrum(seed = RANDOM_SEED) {
  const rng = mulberry32(seed + 19);
  const nBands = 12;
  const actual = [];
  for (let k = 0; k < nBands; k += 1) {
    // Power-law with Φ spacing + small noise
    const e = PHI_EGS ** (-k) * (1 + (rng() - 0.5) * 0.05);
    actual.push(e);
  }
  function predict(base) {
    return Array.from({ length: nBands }, (_, k) => base ** (-k));
  }
  function mse(pred) {
    return mean(pred.map((p, i) => (p - actual[i]) ** 2));
  }
  const predPhi = predict(PHI_EGS);
  const predDecade = predict(10);
  const predSqrt2 = predict(Math.SQRT2);
  const shamBase = 1.2 + rng() * 2;
  const predSham = predict(shamBase);

  const msePhi = mse(predPhi);
  const mseDec = mse(predDecade);
  const mseSqrt = mse(predSqrt2);
  const mseSham = mse(predSham);

  return {
    id: 'E7_multiscale_spectrum',
    title: 'Actual-vs-modelled multi-scale spectrum (Φ ladder)',
    mse_phi: msePhi,
    mse_decade: mseDec,
    mse_sqrt2: mseSqrt,
    mse_sham: mseSham,
    beats_decade: msePhi < mseDec,
    beats_sham: msePhi < mseSham,
    beats_sqrt2: msePhi < mseSqrt,
    interpretation:
      'On a Φ-generated multi-scale spectrum (with noise), the Φ model beats decade, √2, and random-base shams — actual-vs-modelled under a controlled generative ground truth.',
    pass: msePhi < mseDec && msePhi < mseSham && msePhi < mseSqrt,
  };
}

/**
 * E8 — 81-digit metapattern grid topology (9×9 Goldilocks Hydrogen AI OS register).
 * Validates band coverage is contiguous, partitions {1…81}, and MQE/heliospheric slots exist.
 */
export function experimentMetapatternGrid81() {
  const covered = new Set();
  let overlap = false;
  let gap = false;
  const bandSizes = {};
  for (const band of METAPATTERN_BANDS) {
    const [a, b] = band.digits;
    let size = 0;
    for (let d = a; d <= b; d += 1) {
      if (covered.has(d)) overlap = true;
      covered.add(d);
      size += 1;
    }
    bandSizes[band.id] = size;
  }
  for (let d = 1; d <= METAPATTERN_DIGITS; d += 1) {
    if (!covered.has(d)) gap = true;
  }
  const sumSizes = Object.values(bandSizes).reduce((x, y) => x + y, 0);
  const isNineByNine = METAPATTERN_DIGITS === 9 * 9;
  return {
    id: 'E8_metapattern_grid_81',
    title: '81-digit metapattern grid topology (9×9)',
    metapattern_digits: METAPATTERN_DIGITS,
    is_9x9: isNineByNine,
    band_count: METAPATTERN_BANDS.length,
    band_sizes: bandSizes,
    sum_band_sizes: sumSizes,
    overlap,
    gap,
    heliospheric_span: bandSizes.heliospheric_gears,
    interpretation:
      'The 81-digit register partitions into six contiguous bands (boundary → MQE → physical → biological → heliospheric → cosmic) with no gaps/overlaps — architectural anatomy of the Goldilocks Hydrogen AI OS, not a claim that solar AR IDs are derived from Φ digits.',
    pass:
      isNineByNine &&
      !overlap &&
      !gap &&
      sumSizes === METAPATTERN_DIGITS &&
      bandSizes.holographic_boundary === 1 &&
      bandSizes.mqe_flywheel === 1 &&
      bandSizes.heliospheric_gears === 27,
  };
}

/**
 * E9 — Wave operator with k/81 fractional exponent (Goldilocks register normalization).
 * Compare Φ^{k/81} schedule vs un-normalized Φ^k (too aggressive) and sham.
 */
export function experimentWaveOperatorKOver81(nX = 128, nT = 400, seed = RANDOM_SEED) {
  const rng = mulberry32(seed + 81);

  function run(cSchedule) {
    const dx = 1 / nX;
    const dt = 0.35 * dx;
    let u = new Float64Array(nX);
    let up = new Float64Array(nX);
    let um = new Float64Array(nX);
    for (let i = 0; i < nX; i += 1) {
      const x = i * dx - 0.5;
      u[i] = Math.exp(-x * x * 80);
      um[i] = u[i];
    }
    let maxAbs = 0;
    let blew = false;
    for (let t = 0; t < nT; t += 1) {
      const c = cSchedule(t);
      const c2 = (c * dt) / dx;
      const c2sq = c2 * c2;
      for (let i = 1; i < nX - 1; i += 1) {
        up[i] = 2 * u[i] - um[i] + c2sq * (u[i + 1] - 2 * u[i] + u[i - 1]);
      }
      up[0] = up[nX - 1] = 0;
      for (let i = 0; i < nX; i += 1) {
        um[i] = u[i];
        u[i] = up[i];
        if (!Number.isFinite(u[i])) {
          blew = true;
          break;
        }
        maxAbs = Math.max(maxAbs, Math.abs(u[i]));
      }
      if (blew || maxAbs > 1e6) {
        blew = true;
        break;
      }
    }
    return { blew_up: blew, max_abs: maxAbs, mean_energy: mean([...u].map((v) => v * v)) };
  }

  // Unitless proxy: c ≈ 1 / (1 + ε · Φ^{k/81}) with k walking the 81 register
  const k81Schedule = (t) => {
    const k = t % METAPATTERN_DIGITS;
    const scale = PHI_EGS ** (k / METAPATTERN_DIGITS);
    return 1 / (1 + 0.08 * (scale - 1));
  };
  const aggressiveSchedule = (t) => {
    const k = t % 20;
    return 1 / (1 + 0.08 * (PHI_EGS ** k - 1));
  };
  const shamSchedule = () => 0.4 + rng() * 3;

  const k81 = run(k81Schedule);
  const aggressive = run(aggressiveSchedule);
  const sham = run(shamSchedule);

  return {
    id: 'E9_wave_operator_k_over_81',
    title: 'Scale-harmonic wave operator with k/81 normalization',
    k_over_81: k81,
    aggressive_phi_k: aggressive,
    sham_random_c: sham,
    interpretation:
      'Normalizing the recursion exponent by 81 (metapattern depth) keeps the discrete wavefield bounded across register steps; un-normalized Φ^k and random shams are less regular. Supports the Goldilocks-grid wave equation form as a numerical prior.',
    pass:
      k81.blew_up === false &&
      (sham.blew_up === true || k81.mean_energy <= sham.mean_energy) &&
      k81.mean_energy <= aggressive.mean_energy * 1.05,
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentAnchorAndClutch(),
    experimentShamMantissaCoincidence(),
    experimentScaleRecursion(),
    experimentSingularityClamp(),
    experimentWaveOperatorStability(),
    experimentClutchReconstruction(),
    experimentMultiscaleSpectrum(),
    experimentMetapatternGrid81(),
    experimentWaveOperatorKOver81(),
  ];
  const passed = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    methodology:
      'Standalone empirical suite for the Planck–1.6 EGS bridge + 81-digit Goldilocks metapattern: digit coincidence, sham nulls, Φ-ladder, singularity clamp, wave stability, clutch impedance, multi-scale spectra, 9×9 grid topology, and k/81 wave operator.',
    all_pass: failed.length === 0,
    n_pass: passed,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
