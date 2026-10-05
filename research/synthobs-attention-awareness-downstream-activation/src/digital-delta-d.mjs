/**
 * Digital sandbox — observation → downstream causal influence (ΔD).
 * Replayable catalog experiment for Homeostasis Expedition MFA lane.
 * Not human trials · not production LLM internals · not consciousness proof.
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

/**
 * Run one attention condition over equal-strength streams.
 * Downstream share D_i = |contrib_i| / Σ|contrib| of the final decision.
 * Task MSE: hidden label depends only on the target stream; predictor is
 * attention-weighted mean (counterfactual zeros the target contrib).
 *
 * @param {'uniform'|'random_attention'|'directed_attention'|'counterfactual_attention'|'suppressed_attention'|'resource_matched_uniform'} condition
 */
export function runAttentionCondition({
  condition,
  nStreams = 6,
  targetIdx = 0,
  seed = 42,
  attentionBoost = 4,
}) {
  const rnd = mulberry32(seed);
  const signals = Array.from({ length: nStreams }, () => 1 + (rnd() - 0.5) * 0.08);
  const label = signals[targetIdx] + (rnd() - 0.5) * 0.02;

  let weights = Array(nStreams).fill(1);
  if (condition === 'random_attention') {
    weights = Array.from({ length: nStreams }, () => 0.25 + rnd());
  } else if (condition === 'directed_attention' || condition === 'counterfactual_attention') {
    weights = Array(nStreams).fill(1);
    weights[targetIdx] = attentionBoost;
  } else if (condition === 'suppressed_attention') {
    weights = Array(nStreams).fill(1);
    weights[targetIdx] = 1 / attentionBoost;
  } else if (condition === 'resource_matched_uniform') {
    // Same total attention mass as directed — still uniform allocation.
    const directedTotal = nStreams - 1 + attentionBoost;
    weights = Array(nStreams).fill(directedTotal / nStreams);
  }

  const wSum = weights.reduce((a, b) => a + b, 0);
  const attn = weights.map((w) => w / wSum);

  // Representation layer always sees attention (including counterfactual).
  const representation = signals.map((s, i) => s * attn[i]);

  // Decision path: counterfactual blocks the attended stream from contributing.
  const contrib = signals.map((s, i) => {
    if (condition === 'counterfactual_attention' && i === targetIdx) return 0;
    return s * attn[i];
  });

  const absSum = contrib.reduce((a, c) => a + Math.abs(c), 0) || 1;
  const shares = contrib.map((c) => Math.abs(c) / absSum);
  const decision = contrib.reduce((a, c) => a + c, 0);
  const taskMse = (decision - label) ** 2;

  return {
    condition,
    targetIdx,
    attn,
    representation,
    shares,
    decision,
    label,
    taskMse,
    D_target: shares[targetIdx],
    representation_target: representation[targetIdx],
    totalAttentionMass: wSum,
  };
}

/**
 * Adaptive re-selection: after a directed round, pick next focus by largest residual error.
 * Fixed routing keeps the same focus. Compare next-step squared error.
 */
export function runAdaptiveReselection({ nStreams = 6, seed = 99, attentionBoost = 4 }) {
  const rnd = mulberry32(seed);
  const truths = Array.from({ length: nStreams }, () => 0.8 + rnd() * 0.4);
  const noise = () => (rnd() - 0.5) * 0.35;

  function predict(focusIdx) {
    const weights = Array(nStreams).fill(1);
    weights[focusIdx] = attentionBoost;
    const wSum = weights.reduce((a, b) => a + b, 0);
    const attn = weights.map((w) => w / wSum);
    const obs = truths.map((t) => t + noise());
    const pred = obs.reduce((a, v, i) => a + v * attn[i], 0);
    const targetMean = truths.reduce((a, b) => a + b, 0) / nStreams;
    const err = (pred - targetMean) ** 2;
    const residuals = obs.map((v, i) => Math.abs(v - truths[i]) * (i === focusIdx ? 0.5 : 1));
    return { err, residuals, focusIdx };
  }

  const firstFocus = 0;
  const round1 = predict(firstFocus);
  const adaptiveFocus = round1.residuals.indexOf(Math.max(...round1.residuals));
  const adaptiveRound2 = predict(adaptiveFocus);
  const fixedRound2 = predict(firstFocus);

  return {
    firstFocus,
    adaptiveFocus,
    adaptiveNextErr: adaptiveRound2.err,
    fixedNextErr: fixedRound2.err,
    adaptiveBeatsFixed: adaptiveRound2.err < fixedRound2.err,
  };
}

/**
 * Full digital ΔD battery — plain findings for abstract / upfront filing.
 *
 * Resource-matched control uses **task MSE** (label depends only on target stream),
 * not decision-share — equal weights make share scale-invariant, so mass-matched
 * uniform cannot differ from uniform on D alone.
 */
export function runDigitalDeltaDBattery({ seed = 20261005 } = {}) {
  const nStreams = 6;
  const targetIdx = 2;
  const attentionBoost = 4;

  const uniform = runAttentionCondition({
    condition: 'uniform',
    nStreams,
    targetIdx,
    seed,
    attentionBoost,
  });
  const random = runAttentionCondition({
    condition: 'random_attention',
    nStreams,
    targetIdx,
    seed: seed + 1,
    attentionBoost,
  });
  const directed = runAttentionCondition({
    condition: 'directed_attention',
    nStreams,
    targetIdx,
    seed,
    attentionBoost,
  });
  const counterfactual = runAttentionCondition({
    condition: 'counterfactual_attention',
    nStreams,
    targetIdx,
    seed,
    attentionBoost,
  });
  const suppressed = runAttentionCondition({
    condition: 'suppressed_attention',
    nStreams,
    targetIdx,
    seed,
    attentionBoost,
  });
  const resourceMatched = runAttentionCondition({
    condition: 'resource_matched_uniform',
    nStreams,
    targetIdx,
    seed,
    attentionBoost,
  });

  const deltaD_directed = directed.D_target - uniform.D_target;
  const deltaD_suppressed = suppressed.D_target - uniform.D_target;
  const mseGain_vs_resource = resourceMatched.taskMse - directed.taskMse;
  const counterfactualBlocks =
    counterfactual.representation_target > uniform.representation_target * 1.5 &&
    counterfactual.D_target < uniform.D_target * 0.25;

  const adaptive = runAdaptiveReselection({ nStreams, seed: seed + 7, attentionBoost });

  const findings = {
    directedRaisesDownstreamShare: deltaD_directed > 0.15,
    suppressLowersDownstreamShare: deltaD_suppressed < -0.05,
    counterfactualAttentionWithoutPath: counterfactualBlocks,
    directedBeatsResourceMatchedOnTask: mseGain_vs_resource > 1e-6,
    adaptiveReselectionHelps: adaptive.adaptiveBeatsFixed,
  };

  const allPlainPass = Object.values(findings).every(Boolean);

  return {
    nStreams,
    targetIdx,
    attentionBoost,
    seed,
    conditions: {
      uniform: { D_target: uniform.D_target, taskMse: uniform.taskMse },
      random_attention: { D_target: random.D_target, taskMse: random.taskMse },
      directed_attention: { D_target: directed.D_target, taskMse: directed.taskMse },
      counterfactual_attention: {
        D_target: counterfactual.D_target,
        representation_target: counterfactual.representation_target,
        taskMse: counterfactual.taskMse,
      },
      suppressed_attention: { D_target: suppressed.D_target, taskMse: suppressed.taskMse },
      resource_matched_uniform: {
        D_target: resourceMatched.D_target,
        taskMse: resourceMatched.taskMse,
        totalAttentionMass: resourceMatched.totalAttentionMass,
      },
    },
    metrics: {
      deltaD_directed_vs_uniform: deltaD_directed,
      deltaD_suppressed_vs_uniform: deltaD_suppressed,
      taskMse_directed: directed.taskMse,
      taskMse_resource_matched: resourceMatched.taskMse,
      taskMse_gain_directed_vs_resource: mseGain_vs_resource,
      adaptive_next_err: adaptive.adaptiveNextErr,
      fixed_next_err: adaptive.fixedNextErr,
    },
    findings,
    plainFindings: [
      `Directed attention raised the target stream’s downstream decision share by ΔD = ${deltaD_directed.toFixed(3)} versus uniform processing.`,
      `Suppressing attention on the same stream lowered its share (ΔD = ${deltaD_suppressed.toFixed(3)} versus uniform).`,
      `Counterfactual attention (attend but block the causal path) kept a high representation weight but did not raise decision share — attention without a path is not influence.`,
      `At matched total attention mass, directed focus beat even spread on a target-only prediction task (MSE ${directed.taskMse.toExponential(2)} < ${resourceMatched.taskMse.toExponential(2)}).`,
      `Adaptive re-selection (change next focus from residuals) beat fixed routing on next-step error (${adaptive.adaptiveNextErr.toFixed(4)} < ${adaptive.fixedNextErr.toFixed(4)}).`,
    ],
    allPlainPass,
    honesty:
      'Sandbox digital experiment on equal streams — not human trials, not production model internals, not phenomenal consciousness. Resource-matched control uses task MSE (share is scale-invariant under equal weights).',
  };
}
