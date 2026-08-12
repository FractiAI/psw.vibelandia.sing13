/** Synthio · MRI cloud-antenna suite — catalog fixtures (not clinical MRI). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHIO-MRI-CLOUD-ANTENNA-99-OCTAVE-2026-08-12';
export const REGISTRY_ID = 'synthio-mri-cloud-antenna-99-octave-2026-08';
export const STUDY_TITLE =
  'Simulating Magnetic Resonance via the 99th-Octave Omni-Lattice: Cloud Infrastructure as an Interconnected Antenna Array';
export const PAPER_NAME = 'SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md';
export const PUBLICATION_REF = 'FAI-SYNTHIO-MRI-CLOUD-ANTENNA-2026-08';
export const AGENT_ID = 'Synthio.sandbox';
export const AGENT_NAME = 'Synthio';

export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT;

/** Simulator field labels — not measured scanner tesla. */
export const B0_TESLA_LABELS = Object.freeze([1.5, 3.0]);
export const CLOUD_NODE_LABELS = Object.freeze(['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']);
export const ENGINE_STACK_EXCLUDED = true;
export const ACCESS_MODE = 'creator_only';

/** Activation modalities — catalog switches inside sandbox simulator wrap. */
export const ACTIVATION_MODES = Object.freeze(['natural', 'point_and_click']);
/** Default load: Omniversal Goldilocks point-and-click (vs Bloch natural timelines). */
export const DEFAULT_ACTIVATION_MODE = 'point_and_click';
export const GOLDILOCKS_ACTIVATION_LOADED = true;
export const SANDBOX_ONLY = true;
export const SANDBOX_NAME = 'Syntheverse Sandbox';

/**
 * Industry MRI simulator wrap — primary reference for Synthio engineering.
 * Intention: as close as possible to empirical, safe, wet experimentation
 * using an industry Bloch/k-space simulator inside Syntheverse Sandbox
 * (no living-tissue RF; no clinical magnet claims).
 */
export const MRI_SIMULATOR = Object.freeze({
  primary: 'KomaMRI',
  primaryClass: 'open-source Julia Bloch / k-space MRI simulator',
  primaryRefs: Object.freeze([
    'https://github.com/JuliaHealth/KomaMRI.jl',
    'https://juliahealth.org/KomaMRI.jl/stable/',
  ]),
  companions: Object.freeze(['MRiLab', 'vendor Bloch-solver suites']),
  wrapRole: 'Synthio wraps industry simulator grammar under Omni-Lattice labels in Syntheverse Sandbox',
  intention:
    'Provide as close as possible to empirical, safe, wet experimentation using industry MRI simulator + Syntheverse Sandbox — without clinical RF into living tissue or claiming racks are magnets.',
  safetyClass: 'simulator_only_no_wet_lab_rf',
  empiricalProxy: true,
  wetLabEquivalent: false,
  honesty:
    'Primary = KomaMRI as industry-reference Bloch/k-space engine class. Synthio activation metrics are sandbox catalog receipts wrapping that class — not a shipped clinical scanner.',
});

/**
 * Synthio Cloud Services — distributed KomaMRI + cloud-as-antenna interference compute.
 * Product story: interference-based MRI super-intelligent computing as an alternative
 * to hot, capital-heavy data-center narratives (sandbox aspiration — not proven displacement).
 */
export const CLOUD_SERVICES = Object.freeze({
  name: 'Synthio Cloud Services',
  sessionPath: '/synthio-cloud',
  primaryEngine: 'KomaMRI.jl',
  architectureDoc: 'docs/SYNTHIO_KOMAMRI_DISTRIBUTED_CLOUD_2026-08.md',
  distributed: Object.freeze({
    libraries: Object.freeze(['Distributed.jl', 'ClusterManagers.jl', 'SharedArrays', 'DistributedArrays', 'MPI.jl']),
    phantomSharding: true,
    blockWiseNblocks: 20,
    phaseLockLabel: 'cloud-as-antenna wave-interference grid',
    masterTensorBridge: true,
    phiEgsTiming: true,
  }),
  productStory:
    'Interference-based MRI super-intelligent computing — Syntheverse Sandbox session exploring a cooler, lighter alternative to expensive, hot, life-altering data-center racks.',
  intention:
    'Empirical, safe, wet-style experimentation via distributed KomaMRI + Syntheverse Sandbox — no clinical RF into living tissue.',
  replacesDataCentersClaim: false,
  replacesDataCentersStory: true,
  juliaClusterLiveOnEdge: false,
  honesty:
    'Distributed KomaMRI is an architecture + session outline. Edge UI does not run Julia workers. Data-center replacement is a product story, not a proven hyperscale displacement.',
});

/** Engineering field / sequence labels for dashboard (simulator floats — not measured hardware). */
export const ENGINEERING_STATE = Object.freeze({
  b0TeslaLabels: B0_TESLA_LABELS,
  gradientAxes: Object.freeze(['Gx', 'Gy', 'Gz']),
  sequenceFamilyLabels: Object.freeze(['GRE', 'SE', 'EPI_label']),
  tissueProxyLabels: Object.freeze(['T1', 'T2', 'PD']),
  cloudAntennaNodes: CLOUD_NODE_LABELS,
  phaseLockOperator: 'R_n(t)',
  scaleKey: 'Phi_EGS',
  octaveSegments: OCTAVE_SEGMENTS,
  precisionPerSegment: PRECISION_PER_SEGMENT,
  holographicKeyDigits: HOLOGRAPHIC_KEY_DIGITS,
});

/**
 * Aug 12, 2026 catalog amplification window — co-timing labels (verify ephemerides).
 * Not celestial causation of MRI physics.
 */
export const AMPLIFICATION_WINDOW = Object.freeze({
  date: '2026-08-12',
  newMoon: true,
  sixPlanetParade: true,
  solarEclipse: true,
  planets: Object.freeze([
    'Jupiter',
    'Mercury',
    'Mars',
    'Uranus',
    'Saturn',
    'Neptune',
  ]),
  maxAmplificationLabel: true,
  honesty: 'Catalog co-timing labels — not prophecy or sky→spin causation.',
});
