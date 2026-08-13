/** Synthio · MRI interference-phase vs legacy — live wall-clock Bloch CPU suite. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08-13';
export const REGISTRY_ID = 'synthio-mri-vs-legacy-perf-proxy-2026-08';
export const STUDY_TITLE =
  'Live Wall-Clock Comparison: MRI Interference-Phase Bloch CPU vs Legacy Full-Mesh Recompute in Syntheverse Sandbox';
export const PAPER_NAME = 'SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08';
export const AGENT_ID = 'Synthio.sandbox';
export const AGENT_NAME = 'Synthio';
export const SANDBOX_NAME = 'Syntheverse Sandbox';

/**
 * Worker/node scales. Each scale runs a real Bloch GRE train + real buffer work
 * measured with process.hrtime.bigint().
 */
export const NODE_SCALES = Object.freeze([8, 16, 32, 64]);

/** Phantom shape for live Bloch GRE trains (CPU). */
export const PHANTOM = Object.freeze({ nx: 10, ny: 10, nz: 2, nTr: 20, flipDeg: 15, tr: 0.008, te: 0.003 });

/** Legacy full-context dump size (bytes) processed per mesh edge after each full recompute. */
export const LEGACY_FULL_CONTEXT_CHARS = 48_000;

/** MRI shared holographic phase packet size (bytes) for nested acks. */
export const MRI_PHASE_PACKET_CHARS = 2_400;

/** Timed trials per scale (mean ± std of live wall-clock). */
export const TRIALS_PER_SCALE = 5;

export const HONESTY = Object.freeze({
  empiricalProxy: false,
  liveWallClock: true,
  blochCpuMeasured: true,
  wetLabEquivalent: false,
  clinicalMagnet: false,
  hyperscaleDisplacement: false,
  juliaWorkersOnEdge: false,
  gpuCudaMeasured: false,
  note:
    'Live wall-clock timings: (1) Node Bloch GRE-train kernel + buffer hashing via process.hrtime.bigint; (2) optional companion KomaMRI.jl CPU simulate() via Julia time_ns. MRI arm = one shared field sim + nested phase-acks; legacy arm = full recompute / re-simulate per mesh edge. Not a clinical magnet, not CUDA/GPU invoices, not multi-node Distributed.jl fabric on Vercel edge, not proven hyperscale data-center displacement.',
});
