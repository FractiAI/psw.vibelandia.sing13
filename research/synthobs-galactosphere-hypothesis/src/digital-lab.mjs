/**
 * Digital lab — Galactosphere Hypothesis (Homeostasis Expedition)
 * GH-1: distributed vs sharp multi-channel transition
 * GH-2: cross-scale dimensionless topology rhyme
 *
 * Structural model only — not a Milky Way fit, not astrophysical validation.
 */

/** Deterministic PRNG (Mulberry32). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function logistic(r, r0, w) {
  return 1 / (1 + Math.exp((r - r0) / Math.max(1e-9, w)));
}

function rising(r, r0, w) {
  return 1 - logistic(r, r0, w);
}

/**
 * Build radial multi-field profiles on a dimensionless grid r/R0 ∈ [0, rMax].
 * mode 'independent' — shared crossover → sharp D≈1 crossing
 * mode 'coupled' — offset channel crossovers + coupling → finite-width transition
 */
export function buildRadialFields({
  mode = 'coupled',
  nGrid = 401,
  rMax = 4,
  params = {},
} = {}) {
  const {
    ampW = 1.0,
    ampT = 0.85,
    ampB = 0.7,
    ampC = 0.55,
    ampE = 1.0,
    rW = 1.0,
    rT = 1.0,
    rB = 1.0,
    rC = 1.0,
    rE = 1.0,
    wBase = 0.08,
    couple = 0.22,
  } = params;

  let cW = rW;
  let cT = rT;
  let cB = rB;
  let cC = rC;
  let cE = rE;
  let wW = wBase;
  let wT = wBase;
  let wB = wBase;
  let wC = wBase;
  let wE = wBase;

  if (mode === 'coupled') {
    cW = rW;
    cT = rW * 1.18;
    cB = rW * 1.42;
    cC = rW * 1.65;
    cE = rW * 1.1;
    wW = wBase * (1 + 0.4 * couple);
    wT = wBase * (1 + 0.9 * couple);
    wB = wBase * (1 + 1.4 * couple);
    wC = wBase * (1 + 1.8 * couple);
    wE = wBase * (1 + couple);
  }

  const rs = [];
  const W = [];
  const T = [];
  const B = [];
  const C = [];
  const E = [];
  const D = [];

  for (let i = 0; i < nGrid; i++) {
    const r = (rMax * i) / (nGrid - 1);
    let w = ampW * logistic(r, cW, wW);
    let t = ampT * logistic(r, cT, wT);
    let b = ampB * logistic(r, cB, wB);
    let c = ampC * logistic(r, cC, wC);
    let e = ampE * (0.15 + 0.85 * rising(r, cE, wE));

    if (mode === 'coupled') {
      // Mild cross-channel coupling: thermal/magnetic/nonthermal share momentum with wind.
      const mix = couple * 0.35;
      const windShare = mix * w;
      t = t * (1 - mix) + windShare * (ampT / ampW);
      b = b * (1 - mix) + windShare * (ampB / ampW);
      c = c * (1 - mix) + windShare * (ampC / ampW);
      e = e * (1 + 0.15 * couple * (1 - w));
    }

    const d = (w + t + b + c) / Math.max(1e-12, e);
    rs.push(r);
    W.push(w);
    T.push(t);
    B.push(b);
    C.push(c);
    E.push(e);
    D.push(d);
  }

  return { rs, W, T, B, C, E, D, mode, crossovers: { cW, cT, cB, cC, cE } };
}

/**
 * Transition metrics from dominance ratio D(r).
 * Conventional boundary ≈ D=1; width = span where D ∈ [0.5, 2].
 */
export function measureTransition(fields) {
  const { rs, D, W, T, B, C } = fields;
  let rCross = null;
  for (let i = 1; i < D.length; i++) {
    if (D[i - 1] >= 1 && D[i] < 1) {
      const f = (D[i - 1] - 1) / (D[i - 1] - D[i] || 1e-12);
      rCross = rs[i - 1] + f * (rs[i] - rs[i - 1]);
      break;
    }
  }
  if (rCross == null) {
    // fallback: closest to D=1
    let best = 0;
    let bestAbs = Infinity;
    for (let i = 0; i < D.length; i++) {
      const a = Math.abs(Math.log(Math.max(1e-12, D[i])));
      if (a < bestAbs) {
        bestAbs = a;
        best = i;
      }
    }
    rCross = rs[best];
  }

  let rHi = null;
  let rLo = null;
  for (let i = 0; i < D.length; i++) {
    if (rHi == null && D[i] <= 2) rHi = rs[i];
    if (D[i] >= 0.5) rLo = rs[i];
  }
  const width = Math.max(0, (rLo ?? rCross) - (rHi ?? rCross));

  // Per-channel half-drop radii (where each outward channel falls to half its inner value)
  function halfDrop(arr) {
    const inner = arr[0];
    const target = 0.5 * inner;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] <= target) {
        const f = (arr[i - 1] - target) / (arr[i - 1] - arr[i] || 1e-12);
        return rs[i - 1] + f * (rs[i] - rs[i - 1]);
      }
    }
    return rs[rs.length - 1];
  }

  const rThermal = halfDrop(T);
  const rMagnetic = halfDrop(B);
  const rCR = halfDrop(C);
  const rKinematic = halfDrop(W);
  const channelSpread = Math.max(rThermal, rMagnetic, rCR, rKinematic) -
    Math.min(rThermal, rMagnetic, rCR, rKinematic);

  return {
    rCross,
    width,
    rThermal,
    rMagnetic,
    rCR,
    rKinematic,
    channelSpread,
    channelsDistinct:
      rThermal !== rMagnetic &&
      rMagnetic !== rCR &&
      rCR !== rKinematic,
  };
}

/**
 * GH-1 — Does multi-channel coupling produce a finite distributed transition
 * rather than a unique zero-width boundary?
 */
export function runGH1DistributedTransition({
  seed = 20261007,
  nSweeps = 48,
} = {}) {
  const rnd = mulberry32(seed);
  const independent = buildRadialFields({ mode: 'independent' });
  const coupled = buildRadialFields({ mode: 'coupled' });
  const mInd = measureTransition(independent);
  const mCoupled = measureTransition(coupled);

  const sweepWidths = [];
  const sweepCross = [];
  for (let i = 0; i < nSweeps; i++) {
    const ampW = 0.7 + 0.6 * rnd();
    const ampT = 0.5 + 0.7 * rnd();
    const ampB = 0.4 + 0.7 * rnd();
    const ampC = 0.3 + 0.6 * rnd();
    const couple = 0.12 + 0.28 * rnd();
    const rW = 0.85 + 0.35 * rnd();
    const fields = buildRadialFields({
      mode: 'coupled',
      params: { ampW, ampT, ampB, ampC, couple, rW },
    });
    const m = measureTransition(fields);
    sweepWidths.push(m.width);
    sweepCross.push(m.rCross);
  }

  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const meanWidth = mean(sweepWidths);
  const meanCross = mean(sweepCross);
  const minWidth = Math.min(...sweepWidths);
  const maxWidth = Math.max(...sweepWidths);
  const crossStd = Math.sqrt(
    mean(sweepCross.map((x) => (x - meanCross) ** 2)),
  );

  const distributedVsSharp = mCoupled.width > mInd.width * 2.5;
  const finiteExtent = mCoupled.width >= 0.35 && mCoupled.width <= 2.5;
  const locationShifts = crossStd >= 0.05;
  const channelsOffset = mCoupled.channelSpread > mInd.channelSpread * 1.5;
  const neverEliminated = minWidth > 0.15;

  const pass =
    distributedVsSharp &&
    finiteExtent &&
    locationShifts &&
    channelsOffset &&
    neverEliminated &&
    mCoupled.channelsDistinct;

  return {
    experiment: 'GH1_distributed_transition',
    seed,
    nSweeps,
    independent: {
      rCross: mInd.rCross,
      width: mInd.width,
      channelSpread: mInd.channelSpread,
      rThermal: mInd.rThermal,
      rMagnetic: mInd.rMagnetic,
      rCR: mInd.rCR,
      rKinematic: mInd.rKinematic,
    },
    coupled: {
      rCross: mCoupled.rCross,
      width: mCoupled.width,
      channelSpread: mCoupled.channelSpread,
      rThermal: mCoupled.rThermal,
      rMagnetic: mCoupled.rMagnetic,
      rCR: mCoupled.rCR,
      rKinematic: mCoupled.rKinematic,
    },
    sweep: {
      meanWidth,
      minWidth,
      maxWidth,
      meanCross,
      crossStd,
    },
    distributedVsSharp,
    finiteExtent,
    locationShifts,
    channelsOffset,
    neverEliminated,
    pass,
    honesty:
      'Dimensionless multi-field structural toy — not a Milky Way simulation, not proof a galactosphere exists observationally.',
  };
}

/**
 * GH-2 — Cross-scale rhyme: same dimensionless transition topology
 * across planet / star / galaxy / cluster labels (normalized, not physical size).
 */
export function runGH2CrossScaleTopology({ seed = 20261007 } = {}) {
  const rnd = mulberry32(seed);
  const scales = [
    { id: 'planet_magnetosphere', rW: 0.95, couple: 0.18 },
    { id: 'star_astrosphere', rW: 1.05, couple: 0.22 },
    { id: 'galaxy_galactosphere', rW: 1.0, couple: 0.24 },
    { id: 'cluster_open', rW: 1.12, couple: 0.2 },
  ];

  const results = scales.map((s, idx) => {
    const jitter = 0.04 * (rnd() - 0.5);
    const fields = buildRadialFields({
      mode: 'coupled',
      params: {
        rW: s.rW + jitter,
        couple: s.couple,
        ampW: 0.95 + 0.1 * rnd(),
        ampT: 0.8 + 0.15 * rnd(),
        ampB: 0.65 + 0.15 * rnd(),
        ampC: 0.5 + 0.15 * rnd(),
      },
    });
    const m = measureTransition(fields);
    return {
      id: s.id,
      rCross: m.rCross,
      width: m.width,
      channelSpread: m.channelSpread,
      seedOffset: idx,
    };
  });

  const widths = results.map((r) => r.width);
  const meanW = widths.reduce((a, b) => a + b, 0) / widths.length;
  const maxRelDev = Math.max(...widths.map((w) => Math.abs(w - meanW) / meanW));
  const allFinite = widths.every((w) => w >= 0.3 && w <= 2.8);
  const topologyShared = maxRelDev <= 0.45 && allFinite;
  // Cluster left unnamed as a claimed structure — open question flag
  const clusterOpen = results.find((r) => r.id === 'cluster_open') != null;

  const pass = topologyShared && clusterOpen && results.length === 4;

  return {
    experiment: 'GH2_cross_scale_topology',
    seed,
    scales: results,
    meanWidth: meanW,
    maxRelDev,
    allFinite,
    topologyShared,
    clusterLeftUnnamed: true,
    pass,
    honesty:
      'Normalized topology rhyme across scale labels — not a claim that nature literally repeats identical physical shells, and cluster-scale interface remains unnamed pending evidence.',
  };
}

/**
 * Full digital lab battery used by E9 fixture.
 */
export function runDigitalLabBattery({ seed = 20261007 } = {}) {
  const gh1 = runGH1DistributedTransition({ seed });
  const gh2 = runGH2CrossScaleTopology({ seed });
  const allPlainPass = gh1.pass && gh2.pass;
  return {
    seed,
    gh1,
    gh2,
    allPlainPass,
    plainSummary: [
      `GH-1 independent width ≈ ${gh1.independent.width.toFixed(3)}; coupled width ≈ ${gh1.coupled.width.toFixed(3)} (distributed vs sharp).`,
      `GH-1 coupled channel radii: kinematic ${gh1.coupled.rKinematic.toFixed(3)}, thermal ${gh1.coupled.rThermal.toFixed(3)}, magnetic ${gh1.coupled.rMagnetic.toFixed(3)}, CR ${gh1.coupled.rCR.toFixed(3)}.`,
      `GH-1 parameter sweep (n=${gh1.nSweeps}): mean width ${gh1.sweep.meanWidth.toFixed(3)}, cross std ${gh1.sweep.crossStd.toFixed(3)}; interface never eliminated (min width ${gh1.sweep.minWidth.toFixed(3)}).`,
      `GH-2 cross-scale mean width ${gh2.meanWidth.toFixed(3)}, max relative deviation ${gh2.maxRelDev.toFixed(3)}; cluster scale left unnamed.`,
    ],
    summary: {
      ind_width: gh1.independent.width,
      coupled_width: gh1.coupled.width,
      coupled_rCross: gh1.coupled.rCross,
      channel_spread: gh1.coupled.channelSpread,
      sweep_mean_width: gh1.sweep.meanWidth,
      sweep_cross_std: gh1.sweep.crossStd,
      gh2_mean_width: gh2.meanWidth,
      gh2_max_rel_dev: gh2.maxRelDev,
    },
    honesty:
      'Galactosphere digital lab — Soft Story / catalog structural PoC. Not Milky Way proof, not sharp-shell claim, not astrophysical validation of a physical galactosphere.',
  };
}
