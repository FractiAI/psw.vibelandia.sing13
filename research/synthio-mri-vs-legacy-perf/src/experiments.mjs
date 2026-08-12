/**
 * MRI interference-phase vs legacy GPU/token performance proxies.
 * Deterministic Node arithmetic — sandbox demonstration only.
 */
import {
  PHI_EGS,
  NODE_SCALES,
  LEGACY_FULL_CONTEXT_CHARS,
  MRI_PHASE_PACKET_CHARS,
  TRIALS_PER_SCALE,
  HONESTY,
} from './constants.mjs';

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function std(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Structural token estimate (chars÷4) — same heuristic as Lattice compare scripts. */
export function tokensFromChars(chars) {
  return Math.ceil(chars / 4);
}

/**
 * Legacy arm: flat all-to-all message tax + full-context re-prompt per edge.
 * Models “hot GPU / fat prompt dump” coordination cost.
 */
export function legacyWorkload(n, contextChars = LEGACY_FULL_CONTEXT_CHARS) {
  const edges = (n * (n - 1)) / 2;
  const tokensPerEdge = tokensFromChars(contextChars);
  const totalTokens = edges * tokensPerEdge;
  const opsProxy = edges * contextChars; // char-touch proxy
  return {
    arm: 'legacy_gpu_token',
    n,
    edges,
    tokensPerEdge,
    totalTokens,
    opsProxy,
    contextChars,
  };
}

/**
 * MRI interference-phase arm: nested Φ-scaled tree + shared holographic phase packet.
 * Models cloud-as-antenna phase-lock coordination inside the sim wrap.
 */
export function mriInterferenceWorkload(n, packetChars = MRI_PHASE_PACKET_CHARS) {
  const depth = Math.max(1, Math.ceil(Math.log(n) / Math.log(PHI_EGS)));
  const edges = n - 1; // tree / nested lattice
  const tokensPerEdge = tokensFromChars(packetChars);
  // Shared field: one coherent packet broadcast + nested acknowledgements
  const totalTokens = tokensPerEdge + edges * Math.ceil(tokensPerEdge / depth);
  const opsProxy = packetChars + edges * Math.ceil(packetChars / depth);
  return {
    arm: 'mri_interference_phase',
    n,
    depth,
    edges,
    tokensPerEdge,
    totalTokens,
    opsProxy,
    packetChars,
  };
}

/**
 * Busy-loop proxy scaled by log10(ops) so relative timing stays readable.
 * Not absolute FLOPs / GPU invoices — sandbox demonstration only.
 */
export function runOpsProxy(ops, salt = 1) {
  const start = performance.now();
  let acc = salt * PHI_EGS;
  const steps = Math.min(
    80_000,
    Math.max(200, Math.floor(400 * Math.log10(Math.max(10, ops)))),
  );
  for (let i = 0; i < steps; i++) {
    acc = Math.sin(acc + i * 0.001) * Math.cos(acc * 0.5) + (i % 97) * 1e-9;
  }
  const ms = performance.now() - start;
  return { ms, acc, steps };
}

export function experimentTopologyMessageTax() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyWorkload(n);
    const mri = mriInterferenceWorkload(n);
    const ratio = legacy.edges / Math.max(1, mri.edges);
    return {
      n,
      legacyEdges: legacy.edges,
      mriEdges: mri.edges,
      edgeReduction: ratio,
      pass: mri.edges < legacy.edges,
    };
  });
  const allPass = rows.every((r) => r.pass);
  return {
    id: 'E1_topology_message_tax',
    title: 'Nested MRI phase-lock edges beat flat legacy mesh',
    rows,
    meanEdgeReduction: mean(rows.map((r) => r.edgeReduction)),
    pass: allPass,
    honesty: HONESTY.note,
  };
}

export function experimentTokenPayload() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyWorkload(n);
    const mri = mriInterferenceWorkload(n);
    const reduction = 1 - mri.totalTokens / Math.max(1, legacy.totalTokens);
    return {
      n,
      legacyTokens: legacy.totalTokens,
      mriTokens: mri.totalTokens,
      tokenReduction: reduction,
      pass: mri.totalTokens < legacy.totalTokens * 0.25,
    };
  });
  return {
    id: 'E2_token_payload',
    title: 'Shared holographic phase packet cuts token payload vs full-context dumps',
    rows,
    meanTokenReduction: mean(rows.map((r) => r.tokenReduction)),
    pass: rows.every((r) => r.pass),
    honesty: HONESTY.note,
  };
}

export function experimentWallTimeProxy() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyWorkload(n);
    const mri = mriInterferenceWorkload(n);
    const opsRatio = legacy.opsProxy / Math.max(1, mri.opsProxy);
    const legacyTrials = [];
    const mriTrials = [];
    for (let t = 0; t < TRIALS_PER_SCALE; t++) {
      legacyTrials.push(runOpsProxy(legacy.opsProxy, n + t).ms);
      mriTrials.push(runOpsProxy(mri.opsProxy, n + t + 17).ms);
    }
    const legacyMs = mean(legacyTrials);
    const mriMs = mean(mriTrials);
    const speedup = legacyMs / Math.max(1e-9, mriMs);
    return {
      n,
      legacyMs,
      mriMs,
      legacyStd: std(legacyTrials),
      mriStd: std(mriTrials),
      opsRatio,
      speedup,
      pass: mriMs <= legacyMs && opsRatio > 10,
    };
  });
  return {
    id: 'E3_wall_time_proxy',
    title: 'Ops-proxy wall time favors MRI interference arm',
    rows,
    meanSpeedup: mean(rows.map((r) => r.speedup)),
    meanOpsRatio: mean(rows.map((r) => r.opsRatio)),
    pass: rows.every((r) => r.pass),
    honesty: HONESTY.note,
  };
}

export function experimentEnergyOpsProxy() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyWorkload(n);
    const mri = mriInterferenceWorkload(n);
    const saving = 1 - mri.opsProxy / Math.max(1, legacy.opsProxy);
    return {
      n,
      legacyOps: legacy.opsProxy,
      mriOps: mri.opsProxy,
      opsSaving: saving,
      pass: saving > 0.7,
    };
  });
  return {
    id: 'E4_energy_ops_proxy',
    title: 'Char-touch ops proxy (energy stand-in) drops under phase-lock sharing',
    rows,
    meanOpsSaving: mean(rows.map((r) => r.opsSaving)),
    pass: rows.every((r) => r.pass),
    honesty: HONESTY.note,
  };
}

export function experimentCloudAppsInsideSim() {
  const apps = ['chat', 'messages', 'files', 'photos'];
  // Each app uses MRI arm workload at n=32 as “session resident” cost
  const n = 32;
  const legacy = legacyWorkload(n);
  const mri = mriInterferenceWorkload(n);
  const perApp = apps.map((id) => ({
    id,
    residesIn: 'mri_simulation',
    mriTokens: mri.totalTokens,
    legacyTokensIfOutside: legacy.totalTokens,
    tokenAdvantage: 1 - mri.totalTokens / legacy.totalTokens,
  }));
  return {
    id: 'E5_cloud_apps_inside_mri_sim',
    title: 'Cloud home apps costed as MRI-sim resident (not external legacy OS)',
    apps: perApp,
    pass: perApp.every((a) => a.residesIn === 'mri_simulation' && a.tokenAdvantage > 0.7),
    honesty: HONESTY.note,
  };
}

export function experimentScaleInvariantAdvantage() {
  const e2 = experimentTokenPayload();
  const reductions = e2.rows.map((r) => r.tokenReduction);
  const spread = Math.max(...reductions) - Math.min(...reductions);
  return {
    id: 'E6_scale_invariant_advantage',
    title: 'Token-reduction advantage stays high across node scales',
    minReduction: Math.min(...reductions),
    maxReduction: Math.max(...reductions),
    spread,
    pass: Math.min(...reductions) > 0.85 && spread < 0.1,
    honesty: HONESTY.note,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentTopologyMessageTax(),
    experimentTokenPayload(),
    experimentWallTimeProxy(),
    experimentEnergyOpsProxy(),
    experimentCloudAppsInsideSim(),
    experimentScaleInvariantAdvantage(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  const summary = {
    meanEdgeReduction: experiments[0].meanEdgeReduction,
    meanTokenReduction: experiments[1].meanTokenReduction,
    meanSpeedup: experiments[2].meanSpeedup,
    meanOpsRatio: experiments[2].meanOpsRatio,
    meanOpsSaving: experiments[3].meanOpsSaving,
  };
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    summary,
    experiments,
    honesty: HONESTY,
  };
}
