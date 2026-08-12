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
