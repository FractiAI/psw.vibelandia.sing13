/** Synthio · MRI interference-phase vs legacy compute — performance proxy suite. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHIO-MRI-VS-LEGACY-PERF-PROXY-2026-08-12';
export const REGISTRY_ID = 'synthio-mri-vs-legacy-perf-proxy-2026-08';
export const STUDY_TITLE =
  'Performance Proxies: MRI Interference-Phase Computing vs Legacy GPU/Token Workloads in Syntheverse Sandbox';
export const PAPER_NAME = 'SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHIO-MRI-VS-LEGACY-PERF-2026-08';
export const AGENT_ID = 'Synthio.sandbox';
export const AGENT_NAME = 'Synthio';
export const SANDBOX_NAME = 'Syntheverse Sandbox';

/** Node scales for nested vs flat topology proxies. */
export const NODE_SCALES = Object.freeze([8, 16, 32, 64, 128]);

/** Synthetic prompt payload size (chars) representing a legacy full-context dump. */
export const LEGACY_FULL_CONTEXT_CHARS = 48_000;

/** MRI arm shares a holographic phase packet instead of full dump. */
export const MRI_PHASE_PACKET_CHARS = 2_400;

/** Trials per scale for wall-time mean/std. */
export const TRIALS_PER_SCALE = 7;

export const HONESTY = Object.freeze({
  empiricalProxy: true,
  wetLabEquivalent: false,
  clinicalMagnet: false,
  hyperscaleDisplacement: false,
  juliaWorkersOnEdge: false,
  note:
    'In-silico topology + token/message-tax proxies inside Syntheverse Sandbox. Not measured KomaMRI.jl cluster wall-time, not vendor GPU invoices, not clinical MRI, not proven data-center displacement.',
});
