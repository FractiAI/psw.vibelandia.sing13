/**
 * Live MRI-interference vs legacy full-mesh workloads.
 * Every arm executes real Bloch + buffer work; timings are wall-clock.
 */
import {
  NODE_SCALES,
  PHANTOM,
  LEGACY_FULL_CONTEXT_CHARS,
  MRI_PHASE_PACKET_CHARS,
  TRIALS_PER_SCALE,
  PHI_EGS,
} from './constants.mjs';
import {
  buildPhantom,
  simulateGreTrain,
  phaseAckUpdate,
  processFullContextDump,
  hrtimeMs,
} from './bloch_cpu.mjs';

function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function std(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

export function meshEdges(n) {
  return (n * (n - 1)) / 2;
}

export function treeEdges(n) {
  return n - 1;
}

export function nestedDepth(n) {
  return Math.max(1, Math.ceil(Math.log(n) / Math.log(PHI_EGS)));
}

/**
 * Legacy arm: for each flat-mesh edge, re-run the full Bloch GRE train
 * and process a full-context dump. Measured live.
 */
export function runLegacyLive(n, phantom = buildPhantom(PHANTOM)) {
  const edges = meshEdges(n);
  const greOpts = {
    nTr: PHANTOM.nTr,
    flipDeg: PHANTOM.flipDeg,
    tr: PHANTOM.tr,
    te: PHANTOM.te,
  };
  let voxelsProcessed = 0;
  let bytesProcessed = 0;
  let sink = 0;
  let lastChecksum = '';
  const t0 = process.hrtime.bigint();
  for (let e = 0; e < edges; e++) {
    const sim = simulateGreTrain(phantom, greOpts);
    voxelsProcessed += sim.voxels * sim.steps;
    sink += sim.signal[0] + sim.checksum.charCodeAt(0);
    const dump = processFullContextDump(LEGACY_FULL_CONTEXT_CHARS, e, sim.signal);
    bytesProcessed += dump.bytes;
    sink += dump.checksum.charCodeAt(0);
    lastChecksum = dump.checksum;
  }
  const ms = hrtimeMs(t0);
  return {
    arm: 'legacy_full_mesh_recompute',
    n,
    edges,
    ms,
    voxelsProcessed,
    bytesProcessed,
    checksum: lastChecksum,
    sink,
  };
}

/**
 * MRI arm: one shared holographic Bloch field + nested tree phase-acks.
 * Measured live.
 */
export function runMriLive(n, phantom = buildPhantom(PHANTOM)) {
  const edges = treeEdges(n);
  const depth = nestedDepth(n);
  const greOpts = {
    nTr: PHANTOM.nTr,
    flipDeg: PHANTOM.flipDeg,
    tr: PHANTOM.tr,
    te: PHANTOM.te,
  };
  let voxelsProcessed = 0;
  let bytesProcessed = 0;
  let sink = 0;
  let lastChecksum = '';
  const t0 = process.hrtime.bigint();
  const shared = simulateGreTrain(phantom, greOpts);
  voxelsProcessed += shared.voxels * shared.steps;
  bytesProcessed += MRI_PHASE_PACKET_CHARS;
  sink += shared.signal[0] + shared.checksum.charCodeAt(0);
  for (let e = 0; e < edges; e++) {
    const ack = phaseAckUpdate(shared.signal, e, MRI_PHASE_PACKET_CHARS);
    bytesProcessed += ack.bytes;
    sink += ack.checksum.charCodeAt(0);
    lastChecksum = ack.checksum;
  }
  const ms = hrtimeMs(t0);
  return {
    arm: 'mri_interference_phase_shared_field',
    n,
    edges,
    depth,
    ms,
    voxelsProcessed,
    bytesProcessed,
    checksum: lastChecksum,
    sharedChecksum: shared.checksum,
    sink,
  };
}

/**
 * Run TRIALS_PER_SCALE live trials for both arms at each node scale.
 */
export function measureAllScales({ trials = TRIALS_PER_SCALE, scales = NODE_SCALES } = {}) {
  const phantom = buildPhantom(PHANTOM);
  const rows = scales.map((n) => {
    const legacyTrials = [];
    const mriTrials = [];
    let legacySample = null;
    let mriSample = null;
    for (let t = 0; t < trials; t++) {
      legacySample = runLegacyLive(n, phantom);
      mriSample = runMriLive(n, phantom);
      legacyTrials.push(legacySample.ms);
      mriTrials.push(mriSample.ms);
    }
    const legacyMs = mean(legacyTrials);
    const mriMs = mean(mriTrials);
    const speedup = legacyMs / Math.max(1e-9, mriMs);
    return {
      n,
      trials,
      legacyEdges: meshEdges(n),
      mriEdges: treeEdges(n),
      edgeReduction: meshEdges(n) / Math.max(1, treeEdges(n)),
      legacyMs,
      mriMs,
      legacyStd: std(legacyTrials),
      mriStd: std(mriTrials),
      speedup,
      legacyVoxelsProcessed: legacySample.voxelsProcessed,
      mriVoxelsProcessed: mriSample.voxelsProcessed,
      legacyBytesProcessed: legacySample.bytesProcessed,
      mriBytesProcessed: mriSample.bytesProcessed,
      voxelReduction:
        1 - mriSample.voxelsProcessed / Math.max(1, legacySample.voxelsProcessed),
      byteReduction: 1 - mriSample.bytesProcessed / Math.max(1, legacySample.bytesProcessed),
      pass: mriMs < legacyMs && mriSample.voxelsProcessed < legacySample.voxelsProcessed,
      host: {
        backend: 'node_bloch_cpu',
        timedWith: 'process.hrtime.bigint',
        phantom: { ...PHANTOM, voxels: phantom.n },
      },
    };
  });
  return {
    rows,
    meanSpeedup: mean(rows.map((r) => r.speedup)),
    meanEdgeReduction: mean(rows.map((r) => r.edgeReduction)),
    meanVoxelReduction: mean(rows.map((r) => r.voxelReduction)),
    meanByteReduction: mean(rows.map((r) => r.byteReduction)),
    allPass: rows.every((r) => r.pass),
  };
}
