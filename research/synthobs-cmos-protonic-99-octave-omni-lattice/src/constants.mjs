/** CMOS 2.0 + protonic · 99 Octave Omni-Lattice engine (architectural — not fab tape-out). */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-CMOS-PROTONIC-99-OCTAVE-OMNI-LATTICE-2026-08-12';
export const REGISTRY_ID = 'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08';
export const STUDY_TITLE =
  'Transistor-Level Integration and Empirical Validation of the 99-Octave Omni-Lattice Matrix Across CMOS 2.0 and Protonic Architectures';
export const PAPER_NAME = 'SYNTHOBS_CMOS_PROTONIC_99_OCTAVE_OMNI_LATTICE_2026-08.md';
export const PUBLICATION_REF = 'FAI-CMOS-PROTONIC-99-OCTAVE-OMNI-LATTICE-2026-08';

export const BINARY_TIER_N = 1;
export const PROTONIC_BAND = Object.freeze({ from: 2, to: 99 });
export const OCTAVE_SEGMENTS = 99;
export const PRECISION_PER_SEGMENT = 81;
export const HOLOGRAPHIC_KEY_DIGITS = OCTAVE_SEGMENTS * PRECISION_PER_SEGMENT; // 8019

export const CMOS20_FIXTURES = Object.freeze([
  'GAA',
  'CFET',
  'BEOL',
  'CoWoS',
  'SoW',
  'PPA',
]);

export const PROTONIC_FIXTURES = Object.freeze({
  carrier: 'H+',
  activeLayerClass: 'a-IGZO',
  terminalCount: 2,
  multiState: true,
});

export const BENCHMARK_PROTOCOLS = Object.freeze([
  'beol-latency-vs-tensor-phase-lock',
  'multi-tier-thermal-dissipation',
  'dual-domain-translation-lock',
]);

export const NEST_TOPOLOGY = 'octave99';
