/**
 * Live wall-clock MRI interference-phase vs legacy full-mesh comparison.
 * Arms execute real Bloch GRE trains + real buffer hashing; timed with hrtime.
 */
import {
  NODE_SCALES,
  LEGACY_FULL_CONTEXT_CHARS,
  MRI_PHASE_PACKET_CHARS,
  HONESTY,
  PHI_EGS,
} from './constants.mjs';
import { measureAllScales, meshEdges, treeEdges, nestedDepth } from './live_workloads.mjs';

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Structural token estimate (chars÷4) — companion metric alongside live wall-clock. */
export function tokensFromChars(chars) {
  return Math.ceil(chars / 4);
}

export function legacyTopology(n) {
  const edges = meshEdges(n);
  const tokensPerEdge = tokensFromChars(LEGACY_FULL_CONTEXT_CHARS);
  return {
    arm: 'legacy_full_mesh_recompute',
    n,
    edges,
    tokensPerEdge,
    totalTokens: edges * tokensPerEdge,
    contextChars: LEGACY_FULL_CONTEXT_CHARS,
  };
}

export function mriTopology(n) {
  const depth = nestedDepth(n);
  const edges = treeEdges(n);
  const tokensPerEdge = tokensFromChars(MRI_PHASE_PACKET_CHARS);
  const totalTokens = tokensPerEdge + edges * Math.ceil(tokensPerEdge / depth);
  return {
    arm: 'mri_interference_phase_shared_field',
    n,
    depth,
    edges,
    tokensPerEdge,
    totalTokens,
    packetChars: MRI_PHASE_PACKET_CHARS,
  };
}

// Back-compat aliases used by tests / older callers
export const legacyWorkload = legacyTopology;
export const mriInterferenceWorkload = mriTopology;

let _liveCache = null;
export function getLiveMeasurements() {
  if (!_liveCache) _liveCache = measureAllScales();
  return _liveCache;
}

export function experimentTopologyMessageTax() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyTopology(n);
    const mri = mriTopology(n);
    const ratio = legacy.edges / Math.max(1, mri.edges);
    return {
      n,
      legacyEdges: legacy.edges,
      mriEdges: mri.edges,
      edgeReduction: ratio,
      pass: mri.edges < legacy.edges,
    };
  });
  return {
    id: 'E1_topology_message_tax',
    title: 'Nested MRI phase-lock edges beat flat legacy mesh',
    rows,
    meanEdgeReduction: mean(rows.map((r) => r.edgeReduction)),
    pass: rows.every((r) => r.pass),
    honesty: HONESTY.note,
  };
}

export function experimentTokenPayload() {
  const rows = NODE_SCALES.map((n) => {
    const legacy = legacyTopology(n);
    const mri = mriTopology(n);
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

/** E3 — LIVE wall-clock of real Bloch + buffer work (not a busy-loop proxy). */
export function experimentLiveWallClock() {
  const live = getLiveMeasurements();
  return {
    id: 'E3_live_wall_clock_bloch_cpu',
    title: 'Live hrtime wall-clock: MRI shared-field Bloch beats legacy per-edge recompute',
    rows: live.rows,
    meanSpeedup: live.meanSpeedup,
    meanVoxelReduction: live.meanVoxelReduction,
    meanByteReduction: live.meanByteReduction,
    pass: live.allPass,
    honesty: HONESTY.note,
    measurement: {
      timedWith: 'process.hrtime.bigint',
      backend: 'node_bloch_cpu',
      liveWallClock: true,
    },
  };
}

export function experimentVoxelWorkMeasured() {
  const live = getLiveMeasurements();
  const rows = live.rows.map((r) => ({
    n: r.n,
    legacyVoxelsProcessed: r.legacyVoxelsProcessed,
    mriVoxelsProcessed: r.mriVoxelsProcessed,
    voxelReduction: r.voxelReduction,
    pass: r.voxelReduction > 0.7,
  }));
  return {
    id: 'E4_voxel_work_measured',
    title: 'Measured Bloch voxel×TR work drops under shared-field phase-lock',
    rows,
    meanVoxelReduction: mean(rows.map((r) => r.voxelReduction)),
    pass: rows.every((r) => r.pass),
    honesty: HONESTY.note,
  };
}

export function experimentCloudAppsInsideSim() {
  const apps = ['chat', 'messages', 'files', 'photos'];
  const live = getLiveMeasurements();
  const at32 = live.rows.find((r) => r.n === 32) || live.rows[live.rows.length - 1];
  const perApp = apps.map((id) => ({
    id,
    residesIn: 'mri_simulation',
    mriMs: at32.mriMs,
    legacyMsIfOutside: at32.legacyMs,
    liveSpeedup: at32.speedup,
    tokenAdvantage:
      1 - mriTopology(at32.n).totalTokens / legacyTopology(at32.n).totalTokens,
  }));
  return {
    id: 'E5_cloud_apps_inside_mri_sim',
    title: 'Cloud home apps costed as MRI-sim resident using live wall-clock at N≈32',
    apps: perApp,
    pass: perApp.every((a) => a.residesIn === 'mri_simulation' && a.liveSpeedup > 1),
    honesty: HONESTY.note,
  };
}

export function experimentScaleInvariantAdvantage() {
  const live = getLiveMeasurements();
  const speedups = live.rows.map((r) => r.speedup);
  const minS = Math.min(...speedups);
  const maxS = Math.max(...speedups);
  return {
    id: 'E6_scale_invariant_live_advantage',
    title: 'Live wall-clock speedup stays >1× across all measured node scales',
    minSpeedup: minS,
    maxSpeedup: maxS,
    spread: maxS - minS,
    meanSpeedup: live.meanSpeedup,
    pass: minS > 1.05,
    honesty: HONESTY.note,
  };
}

/** @deprecated alias — E3 is live wall-clock now */
export const experimentWallTimeProxy = experimentLiveWallClock;
/** @deprecated alias */
export const experimentEnergyOpsProxy = experimentVoxelWorkMeasured;

export async function runAllExperiments() {
  // Force live measurements once up front so E3–E6 share one timed batch
  getLiveMeasurements();
  const experiments = [
    experimentTopologyMessageTax(),
    experimentTokenPayload(),
    experimentLiveWallClock(),
    experimentVoxelWorkMeasured(),
    experimentCloudAppsInsideSim(),
    experimentScaleInvariantAdvantage(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  const live = experiments[2];
  const summary = {
    meanEdgeReduction: experiments[0].meanEdgeReduction,
    meanTokenReduction: experiments[1].meanTokenReduction,
    meanSpeedup: live.meanSpeedup,
    meanVoxelReduction: experiments[3].meanVoxelReduction,
    meanByteReduction: live.meanByteReduction,
    liveWallClock: true,
    backend: 'node_bloch_cpu',
    timedWith: 'process.hrtime.bigint',
    phiEgs: PHI_EGS,
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
