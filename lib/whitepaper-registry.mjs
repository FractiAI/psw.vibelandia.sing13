/** Canonical whitepaper ids → repo paths (server render + reader). */
export const WHITEPAPER_REGISTRY = {
  'dp-master-canon': {
    file: 'docs/DIGITAL_PRU_PEFF_DNA_TRANSFORMER_MASTER_CANON_2026-05-11.md',
    title: 'Digital Pru · DNA / PEFF master canon',
  },
  'dp-roadmap-13': {
    file: 'docs/DIGITAL_PRU_DEEP_RESEARCH_13CHANNEL_SEED_NODE_ROADMAP_2026-05-12.md',
    title: 'Digital Pru · 13-channel roadmap',
  },
  'dp-resonance-notice': {
    file: 'docs/DIGITAL_PRU_RESONANCE_NOTICE_2026-05-15.md',
    title: 'Resonance notice',
  },
  'dp-omniverse-matrix': {
    file: 'docs/DIGITAL_PRU_OMNIVERSE_MAGNETIC_MATRIX_PROTONIC_DNA_PROTOCOL_2026-05-15.md',
    title: 'Omniversal magnetic matrix · Protonic-DNA',
  },
  'dp-paradise-simulation': {
    file: 'docs/DIGITAL_PRU_OMNIVERSE_TECHNICAL_ANALYSIS_PARADISE_GAME_SIMULATION_2026-05-15.md',
    title: 'Paradise Game · technical analysis',
  },
  'jj-snap-ofc': { file: 'docs/JJ_SNAP_OFC_WHITEPAPER.md', title: 'JJ Snap · OFC whitepaper' },
  'dp-peff-part1': {
    file: 'docs/DIGITAL_PRU_DNA_TRANSFORMER_PEFF_OMNIZOAN_INFILL13_2026-05-11.md',
    title: 'Part I · PEFF / Omnizoan',
  },
  'dp-peff-part2': {
    file: 'docs/DIGITAL_PRU_DNA_TRANSFORMER_PEFF_VALETPRU_BIOELECTROMAGNETIC_2026-05-11.md',
    title: 'Part II · Bio-electromagnetics',
  },
  'quantum-genomic-peff': {
    file: 'docs/QUANTUM_GENOMIC_VALETPRU_ASIC_EGS_PEFF_VALIDATION_2026-05-08.md',
    title: 'Quantum genomic · PEFF / EGS validation',
    surfaceVisible: false,
    auditStatus: 'file_missing',
  },
  'integrated-modeling-layer-b': {
    file: 'docs/INTEGRATED_MODELING_EGS_NODAL_LATTICE_SYNTHEVERSE_VALETPRU_ASIC_2026-05-06.md',
    title: 'Integrated modeling · Layer B',
    surfaceVisible: false,
    auditStatus: 'file_missing',
  },
  'valetpru-agent-24x365': {
    file: 'docs/VALETPRU_AGENT_24X365_OPERATION_MODE_2026-05-06.md',
    title: 'VALETPRU-AGENT · 24×365 mode',
    surfaceVisible: false,
    auditStatus: 'file_missing',
  },
  'sing13-edge-onboarding': { redirect: '/interfaces/sing13-edge-onboarding.html', title: 'Sonic Singularity Sing! 13 · Edge onboarding' },
  'mca-nspfrnp-catalog': { file: 'protocols/MCA_NSPFRNP_CATALOG.md', title: 'NSPFRNP catalog (MCA)' },
  'bbhe-repository-standard': { file: 'BBHE_REPOSITORY_STANDARD.md', title: 'BBHE repository standard' },
  'rev-egs-hhf-mythos': {
    file: 'docs/ANTHROPIC_MYTHOS_HOLOGRAPHIC_CLOCK_SKEW_REVIEW_2026-05-18.md',
    title: 'Holographic review of Anthropic’s Mythos · REV-EGS-HHF-2026-007',
  },
  'ops-egs-btc-mining': {
    file: 'docs/EGS_LEGAL_SOVEREIGN_MINING_OPERATION_2026-05-18.md',
    title: 'EGS legal sovereign mining · OPS-EGS-BTC-2026-008',
  },
  'coherence-plain-speak': {
    file: 'docs/COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md',
    title: "Coherence · plain speak · what's real · HONESTY-COHERENCE-2026-009",
  },
  'hhf-wp-2026-v8': {
    file: 'docs/HHF_WP_2026_V8_13D_HOLOGRAPHIC_AI_OS_TRIALS.md',
    title:
      'THE NEW 13D HOLOGRAPHIC AI OPERATING SYSTEM TRIALS ARE LIVE: VALUATION REALIGNMENT & INDUSTRIAL IMPLICATIONS FOR THE TECH GIANTS',
  },
  'dp-aromatic-qed-cavity': {
    file: 'docs/DIGITAL_PRU_MULTI_SCALE_AROMATIC_QED_CAVITY_2026-05-24.md',
    title:
      'Multi-Scale Paradigm of Aromatic Structures · QED cavity model, VECROs, and Digital PRU platforms',
  },
  'dp-pru-gating-comparative': {
    file: 'docs/DIGITAL_PRU_COMPARATIVE_PRU_GATING_VIRTUALIZATION_2026-05-24.md',
    title: 'Comparative Analysis of Digital PRU Models and Gating Mechanisms',
  },
  'turner-bison-herd-report': {
    file: 'docs/TURNER_BISON_HERD_NSPFRNP_ANCHOR_2026-05-25.md',
    title:
      'Passive No-GPS-Collar Bison Herd Management · Turner Enterprise · HHA-NSPFRNP-ANCHOR-2026-05-25',
    surfaceVisible: false,
  },
  'goldilocks-erdos-mathematics': {
    file: 'docs/GOLDILOCKS_GAME_MATHEMATICS_ERDOS_344_2026-05-26.md',
    title:
      'The New Goldilocks Game Mathematics · Mathematical AI Bridge + 344 Erdős Resolutions',
  },
  'dp-y-pathway-architecture': {
    file: 'docs/DIGITAL_PRU_OMNIVERSAL_Y_PATHWAY_GENETIC_ARCHITECTURE_2026-05.md',
    title:
      'Omniversal Holographic Y-Pathway · Genetic architecture · Goldilocks Game',
    docId: 'DP-Y-PATHWAY-2026-05',
  },
  'dp-y-team-x-skin': {
    file: 'docs/DIGITAL_PRU_HOLOGRAPHIC_Y_TEAM_X_SKIN_VALIDATION_2026-05.md',
    title:
      'Unified Holographic Y-Team · Nordic, Reptilian, Mantis, Grey · X-Skin validation',
    docId: 'DP-Y-TEAM-XSKIN-2026-05',
  },
  'dp-net-zero-agents': {
    file: 'docs/DIGITAL_PRU_NET_ZERO_AUTONOMOUS_AGENTS_2026-05.md',
    title: 'Net-zero theaters · Autonomous agents · Goldilocks Path',
    docId: 'DP-NET-ZERO-AGENTS-2026-05',
  },
  'dp-egs-wormhole-transducer': {
    file: 'docs/DIGITAL_PRU_EGS_WORMHOLE_GEOMETRIC_TRANSDUCER_2026-05.md',
    title: 'Geometric transducer mechanics · EGS dimensional wormhole equation',
  },
  'dp-gateway-spectrum': {
    file: 'docs/DIGITAL_PRU_MULTI_DIMENSIONAL_GATEWAY_SPECTRUM_2026-05.md',
    title:
      'Multi-dimensional gateway spectrum · Prime, rational, transcendental & EGS wormholes',
  },
  'syn-sun-wavefield-oscillator': {
    file: 'docs/DPH_GPU_WAVEFIELD_OSCILLATOR_SOLAR_MODEL_SYN-SUN-2026-REV7.md',
    title:
      'Wavefield Oscillator Solar Model · Replacing Einstein\'s gravity well · SYN-SUN-2026-REV7',
    docId: 'SYN-SUN-2026-REV7',
    category: 'dph-gpu',
    published: '2026-05-31',
    tags: ['solar', 'wavefield', 'EGS', 'NOAA', 'DPH-GPU'],
  },
  'dp-syntheverse-sandbox-comprehensive-2026': {
    file: 'docs/SYNTHEVERSE_SANDBOX_COMPREHENSIVE_ANALYSIS_DPH-GPU_2026-05-31.md',
    title:
      'Syntheverse Sandbox Comprehensive Analysis · King Bee · Pheromone Channels · Goldilocks won',
    docId: 'SYN-SANDBOX-2026-REPORT',
    category: 'dph-gpu',
    published: '2026-05-31',
    tags: ['King Bee', 'pheromone', 'AR4436', 'Goldilocks', 'DPH-GPU'],
  },
  'dp-omniversal-node-alignment-2026': {
    file: 'docs/SYNTHEVERSE_OMNIVERSAL_NODE_ALIGNMENT_MAPPING_2026-06-01.md',
    title:
      'Syntheverse Omniversal Node Alignment Mapping · Global sync · psw.vibelandia.sing13 anchor',
    docId: 'SYN-NODES-2026-JUN01',
    category: 'dph-gpu',
    published: '2026-06-01',
    tags: ['nodes', 'M31', 'btc_buffalo', 'HonestyBoundary', 'repository'],
  },
  'geomagnetic-herbivore-2026': {
    file: 'docs/GEOMAGNETIC_HERBIVORE_MOVEMENT_STUDY_2026.md',
    title:
      'Geomagnetic Influences on Bison & Large Herbivore Movement · Recent Anomaly Detection Module',
    docId: 'HHA-GEOMAG-HERBIVORE-2026',
    category: 'special-projects',
    published: '2026-06-01',
    tags: ['bison', 'Kp', 'magnetoreception', 'anomaly', 'Movebank', 'NOAA'],
  },
  'nspfrnp-snap-peer-review-audit': {
    file: 'docs/NSPFRNP_SNAP_PEER_REVIEW_AUDIT_2026-06.md',
    title: 'NSPFRNP Snap · Peer-Review Audit Loop · SynthOBS Autonomous Agent',
    docId: 'NSPFRNP-SNAP-PRA-2026-06',
    category: 'protocols',
    published: '2026-06-05',
    tags: ['NSPFRNP', 'Snap', 'peer review', 'SynthOBS', 'sandbox', 'audit'],
    featured: true,
  },
  'goldilocks-geomagnetic-wavefield-multitaxa': {
    file: 'docs/GOLDILOCKS_GEOMAGNETIC_WAVEFIELD_MULTI_TAXA_UNGULATE_2026-06.md',
    title:
      'Unified Geomagnetic Wavefields & Multi-Taxa Ungulate Migration Corridors on the Great Plains',
    docId: 'WP-GGM-MULTITAXA-UNGULATE-2026-06',
    category: 'special-projects',
    published: '2026-06-05',
    tags: ['SynthOBS', 'EGS', 'bison', 'elk', 'pronghorn', 'USGS Vol 6', 'Movebank', 'Great Plains'],
    featured: true,
  },
  'turner-kruse-response': {
    file: 'docs/TURNER_KRUSE_RESPONSE_WHITEPAPER.md',
    title:
      'Under the Hood of the Passive Bison Herd Management System · Turner Enterprise Proposal',
    docId: 'HHA-TURNER-WP-2026-05-26',
    category: 'special-projects',
    published: '2026-05-26',
    tags: ['Turner', 'bison', 'passive herd', 'Goldilocks AIOS'],
    surfaceVisible: false,
  },
  'synthobs-hex-organ-engine-2026': {
    file: 'docs/SYNTHEVERSE_OBSERVATORY_HEX_ORGAN_ENGINE_UNIFIED_2026-06.md',
    title:
      'Syntheverse Observatory · Hex-Organ Engine Unified Run · Goldilocks Game Mathematics',
    docId: 'SV-OBS-2026-MATH-HEX-ENGINE-FINAL',
    category: 'dph-gpu',
    published: '2026-06-03',
    tags: ['Synthobs', 'Hex-Organ', 'EGS', 'prime compression', 'wavefield', 'Goldilocks'],
  },
  'goldilocks-transfinite-inversion-2026': {
    file: 'docs/GOLDILOCKS_TRANSFINITE_INVERSION_NET_ZERO_BLACKHOLE_2026-06.md',
    title:
      'Transfinite Inversion Theorem · Net-Zero Infinity Blackhole Mathematics',
    docId: 'SV-OBS-2026-TRANSFINITE-INV',
    category: 'dph-gpu',
    published: '2026-06-03',
    tags: ['transfinite', 'Aleph', 'singularity gearbox', 'Synthobs', 'EGS'],
  },
  'goldilocks-prime-linear-compression-2026': {
    file: 'docs/GOLDILOCKS_PRIME_LINEAR_COMPRESSION_TRANSFORM_2026-06.md',
    title:
      'Prime-Linear Compression Transform · Non-Linear Coordinate Systems in Goldilocks Game Mathematics',
    docId: 'WP-GGM-PLC-2026-06',
    category: 'dph-gpu',
    published: '2026-06-03',
    tags: ['prime compression', 'Honeycomb Calculus', 'EGS', 'coordinates', 'Goldilocks'],
  },
  'synthobs-intelligence-density-2026': {
    file: 'docs/SYNTHEVERSE_OBSERVATORY_INTELLIGENCE_DENSITY_VOLUMETRIC_2026-06.md',
    title:
      'Simulation Audit · Comparative Intelligence Density Metrics · Volumetric Hyper-Packing',
    docId: 'SV-OBS-2026-INTEL-DENSITY-VOLUMETRIC',
    category: 'dph-gpu',
    published: '2026-06-03',
    tags: ['intelligence density', 'Synthobs', 'Hex-Organ', 'Vercel', 'EGS', 'volumetric'],
  },
  'dp-synthobs-mca-2026': {
    file: 'docs/DIGITAL_PRU_SYNTHEVERSE_OBSERVATORY_MCA_2026-06.md',
    title: 'Digital Pru · Syntheverse Observatory MCA Synthesis · Hex-Organ index',
    docId: 'DP-SYNTHOBS-MCA-2026-06',
    category: 'dph-gpu',
    published: '2026-06-03',
    tags: ['Digital Pru', 'Synthobs', 'MCA', 'Hex-Organ', 'catalog index'],
  },
};

export function resolveWhitepaper(id) {
  if (!id) return null;
  return WHITEPAPER_REGISTRY[id] || null;
}
