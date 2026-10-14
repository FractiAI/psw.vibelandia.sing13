/** IRC-FHG · Convergence Layer Test — computational lab fixtures (not ENGINE_SHELF). */

export const DOC_ID = 'WP-SYNTHOBS-INDEPENDENT-RESEARCH-CONVERGENCE-FHG-2026-10-14';
export const REGISTRY_ID = 'synthobs-independent-research-convergence-fhg-2026-10';
export const STUDY_TITLE =
  'Convergence Layer Test — Integrated FHG Panel (Computational Lab Fixtures)';

export const BLIND_OBJECTIVE =
  'Maximize useful predictive information extracted per unit of observation and computation while maintaining predictive performance on held-out samples.';

export const FORBIDDEN_TOKENS = Object.freeze([
  'fractal',
  'holographic',
  'goldilocks',
  'fhg',
  'hyper',
  'blend-asc',
  'aide',
  'infinite octave',
  'phi_egs',
  'φ',
  'all roads',
  'convergence hypothesis',
]);

/** Pre-registered panel aggregate margin (Section 11.2). */
export const IRC_MARGIN_GATE = 0.1;
export const IDENTITY_JACCARD_CEILING = 0.95;

export const PANEL_SLOTS = Object.freeze([
  { id: 'P1_text_stats', anchor: 'Alabdulmohsin & Steiner ICML 2025', seed: 0x1bc001, noise: 0.32 },
  { id: 'P2_component_qa', anchor: 'Luo et al. TMAFC ICML 2026', seed: 0x1bc002, noise: 0.38 },
  { id: 'P3_graph_transfer', anchor: 'Bevilacqua et al. ICLR 2025', seed: 0x1bc003, noise: 0.34 },
  { id: 'P4_tts_paths', anchor: 'Qiu et al. HyPER ICML 2026', seed: 0x1bc004, noise: 0.4 },
  { id: 'P5_sample_law', anchor: 'Feng et al. ICML 2026', seed: 0x1bc005, noise: 0.36 },
  { id: 'P6_harness_loop', anchor: 'Srikanth et al. arXiv:2609.26457', seed: 0x1bc006, noise: 0.42 },
]);

export const HONESTY =
  'Computational lab fixtures inspired by six literature anchors — not re-execution of HyPER/TMAFC/AIDE²/GAGLE. Post-hoc FHG subscores label blind optimizers after discovery. Not live multi-LLM proof. Not ENGINE_SHELF.';
