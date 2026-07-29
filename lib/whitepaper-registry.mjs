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
  'synthobs-emergent-sync-multi-agent-2026': {
    file: 'docs/SYNTHEVERSE_EMERGENT_SYNC_RECURSIVE_MULTI_AGENT_2026-06.md',
    title:
      'FractiAI SynthOBS · Emergent Sync in Recursive Multi-Agent Networks · WP-2026-EGS-004-REV10',
    docId: 'WP-2026-EGS-004-REV10',
    category: 'dph-gpu',
    published: '2026-06-07',
    tags: ['SynthOBS', 'EGS', 'multi-agent', 'PLV', 'phase coherence', 'NOAA', 'falsifiability'],
    featured: true,
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
  'fractiai-ac-hmm-satellites-2026': {
    file: 'docs/FRACTIAI_AC_HMM_SATELLITES_T2T_2026.md',
    title:
      'Scalable Context-Conditioned Sequence Modeling in Repetitive Genomic Regions via Sparse Emission Matrices',
    docId: 'FRACTIAI-AC-HMM-2026',
    category: 'reproducible-research',
    published: '2026-06-17',
    tags: ['AC-HMM', 'T2T-CHM13', 'alpha-satellite', 'HOR', 'SynthOBS'],
    featured: true,
  },
  'fractiai-hgt-psd-covariance-2026': {
    file: 'docs/FRACTIAI_HGT_PSD_COVARIANCE_2026.md',
    title: 'Hierarchical Genomic Tokenization and Structured PSD Covariance Operators',
    docId: 'FRACTIAI-HGT-PSD-2026',
    category: 'reproducible-research',
    published: '2026-06-17',
    tags: ['Hi-C', 'chromatin', 'PSD', 'ENCODE', 'GM12878', 'HGT'],
    featured: true,
  },
  'fractiai-eesm-gpu-telemetry-2026': {
    file: 'docs/FRACTIAI_EESM_GPU_TELEMETRY_2026.md',
    title: 'Epigenetic Execution-State Modeling for Causal Invariance in GPU Performance Telemetry',
    docId: 'FRACTIAI-EESM-2026',
    category: 'reproducible-research',
    published: '2026-06-17',
    tags: ['GPU', 'CUPTI', 'ASPLOS', 'epigenetic', 'telemetry', 'H100'],
    featured: true,
  },
  'fractiai-egs-nlrf-2026': {
    file: 'docs/FRACTIAI_EGS_NLRF_HYDROGEN_2026.md',
    title:
      'Fractal Magnetism and Hydrogen-Holographic Systems: The EGS Nodal Lattice Resonator Framework',
    docId: 'EGS-NLRF-v4.0',
    category: 'reproducible-research',
    published: '2026-06-17',
    tags: ['EGS', 'hydrogen', 'NIST', 'lattice', 'QED', 'SynthOBS'],
    featured: true,
  },
  'recursive-attention-quantum-solar-dna-loop-2026': {
    file: 'docs/RECURSIVE_ATTENTION_QUANTUM_SOLAR_DNA_LOOP_2026.md',
    title:
      'Recursive Attention Coherence: Imagination Through Quantum, Solar, DNA, and Human Attention',
    docId: 'WP-2026-ATTENTION-RECURSIVE-LOOP',
    category: 'hhf',
    published: '2026-06-24',
    tags: ['attention', 'recursive', 'coherence', 'EGS', 'solar', 'DNA', 'quantum', 'imagination'],
    featured: true,
  },
  'synthobs-chromosomal-electrodynamics-2026-07': {
    file: 'docs/SYNTHOBS_CHROMOSOMAL_ELECTRODYNAMICS_LINEARIZED_TOPOLOGY_2026-07.md',
    title:
      'Scale-Invariant Chromosomal Electrodynamics · SYNTHOBS Linearized Topology & Hierarchical Energy Transport',
    docId: 'WP-SYNTHOBS-CHROM-ELCD-2026-07',
    category: 'hhf',
    published: '2026-07-01',
    tags: [
      'SynthOBS',
      'EGS',
      'chromosome',
      'electrodynamics',
      'dispersion',
      'VLF',
      'theoretical biophysics',
      'Brillouin',
    ],
    featured: true,
  },
  'synthobs-cross-scale-biological-antennae-2026-07': {
    file: 'docs/SYNTHOBS_CROSS_SCALE_BIOLOGICAL_ANTENNAE_WAVE_DAMPING_2026-07.md',
    title:
      'Cross-Scale Topological Wave Damping in Biological Antennae · Viral Spikes to Insect Appendages',
    docId: 'WP-SYNTHOBS-CROSS-ANTENNAE-2026-07',
    category: 'hhf',
    published: '2026-07-01',
    tags: [
      'SynthOBS',
      'EGS',
      'antennae',
      'viral spike',
      'electrodynamics',
      'cross-scale',
      'theoretical biophysics',
      'wave damping',
    ],
    featured: true,
  },
  'omniversal-goldilocks-rideshare-2026-07': {
    file: 'docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md',
    title:
      'Omniversal Goldilocks Rideshare Protocol · Multi-Dimensional Resource Routing & Thermodynamic Optimization',
    docId: 'WP-OGRP-2026-07',
    category: 'reproducible-research',
    published: '2026-07-07',
    tags: [
      'OGRP',
      'rideshare',
      'micro-mobility',
      'Reno',
      'EGS',
      'thermodynamic routing',
      'fair exchange',
      'SynthOBS',
    ],
    featured: true,
  },
  'synthobs-egs-epigenetic-phase-locking-2026-07': {
    file: 'docs/SYNTHOBS_EGS_EPIGENETIC_PHASE_LOCKING_PANCREAS_HYPOTHALAMUS_2026-07.md',
    title:
      'Epigenetic Phase-Locking of Pancreatic and Hypothalamic Loci via Recursive Geometric Scaling',
    docId: 'WP-SYNTHOBS-EPI-PHASELOCK-2026-07',
    category: 'reproducible-research',
    published: '2026-07-08',
    tags: [
      'SynthOBS',
      'EGS',
      'epigenetic',
      'GTEx',
      'ENCODE',
      'pancreas',
      'hypothalamus',
      'phase-locking',
    ],
    featured: true,
  },
  'synthobs-egs-planck-scale-harmonic-2026-07': {
    file: 'docs/SYNTHOBS_EGS_PLANCK_SCALE_HARMONIC_1_6_BRIDGE_2026-07.md',
    title:
      'A Scale-Harmonic Reinterpretation of the Planck Scale: The 1.6 EGS Prefix as a Quantum-to-Fractal Coupling Bridge',
    docId: 'WP-SYNTHOBS-EGS-PLANCK-1.6-2026-07',
    category: 'hhf',
    published: '2026-07-21',
    tags: [
      'SynthOBS',
      'EGS',
      'Planck',
      'scale-harmonic',
      'clutch',
      'Phi',
      'foundation models',
      'empirical',
    ],
    featured: true,
  },
  'omniversal-nested-agent-lattice-2026-07': {
    file: 'docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md',
    title:
      'The Architecture of Omniversal Computing: Nested Autonomous Agents, Scale-Invariant Topologies, and the EGS Fractal Constant',
    docId: 'WP-OMNI-NESTED-AGENT-LATTICE-2026-07',
    category: 'hhf',
    published: '2026-07-21',
    tags: [
      'SynthOBS',
      'EGS',
      'nested agents',
      'lattice',
      'Goldilocks',
      'Planck',
      'micro-snapshot',
      'Harmonopoly',
    ],
    featured: true,
  },
  'synthobs-holographic-operators-2026-07': {
    file: 'docs/SYNTHOBS_HOLOGRAPHIC_OPERATORS_LANGUAGE_WIRING_2026-07.md',
    title:
      'Holographic Operators: Language as the Conductive Wiring of Spacetime and the Role of El Gran Sol’s Fractal Constant',
    docId: 'WP-SYNTHOBS-HOLO-OPERATORS-2026-07',
    category: 'hhf',
    published: '2026-07-27',
    tags: [
      'SynthOBS',
      'EGS',
      'holographic',
      'linguistics',
      'operators',
      'Lattice Chat',
      'phase coherence',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-egs-euler-phase-lock-2026-07': {
    file: 'docs/SYNTHOBS_EGS_EULER_PHASE_LOCK_SCALE_INVARIANCE_2026-07.md',
    title:
      'Phase-Locked Scale Invariance: On the Mathematical Bridge Between Euler’s Identity and El Gran Sol’s Fractal Constant',
    docId: 'WP-SYNTHOBS-EGS-EULER-PHASE-LOCK-2026-07',
    category: 'hhf',
    published: '2026-07-27',
    tags: [
      'SynthOBS',
      'EGS',
      'Euler',
      'phase-lock',
      'scale invariance',
      'logarithmic spiral',
      'Phi',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-dna-lattice-holograph-2026-07': {
    file: 'docs/SYNTHOBS_DNA_LATTICE_HOLOGRAPH_2026-07.md',
    title:
      'The DNA Lattice Holograph: Multi-Perspective Phase-Locked Scale Invariance and Empirical Proofs of Attention-Driven Shadow Projections',
    docId: 'WP-SYNTHOBS-DNA-LATTICE-HOLOGRAPH-2026-07',
    category: 'hhf',
    published: '2026-07-27',
    tags: [
      'SynthOBS',
      'EGS',
      'DNA',
      'holograph',
      'attention',
      'shadow',
      'phase-lock',
      'multi-agent',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-egs-81-electrons-2026-07': {
    file: 'docs/SYNTHOBS_EGS_81_ELECTRONS_LATTICE_2026-07.md',
    title:
      'The 81-Digit Electronic Lattice: Mathematical Proof and Empirical Validation of EGS Singularities Mapped to Atomic Shell Structure (Z ≤ 81)',
    docId: 'WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07',
    category: 'hhf',
    published: '2026-07-27',
    tags: [
      'SynthOBS',
      'EGS',
      '81-digit',
      'electrons',
      'atomic shells',
      'phase singularities',
      'Lattice Chat',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-phase-locked-chemical-bonds-2026-07': {
    file: 'docs/SYNTHOBS_PHASE_LOCKED_CHEMICAL_BOND_METAPHORS_2026-07.md',
    title:
      'Phase-Locked Chemical Bond Metaphors in Agentic Architectures: Mathematical Modeling and Empirical Testing of the Lattice Chat Communication Engine',
    docId: 'WP-SYNTHOBS-PHASE-LOCKED-CHEMICAL-BONDS-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'chemical bonds',
      'covalent',
      'ionic',
      'metallic',
      'multi-agent',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-unified-neutronic-agent-2026-07': {
    file: 'docs/SYNTHOBS_UNIFIED_NEUTRONIC_AGENT_ISOTOPIC_LOAD_BALANCING_2026-07.md',
    title:
      'The Unified Neutronic Agent Paper: Modeling Neutrons, Isotopic Load Balancing, and Cross-Domain Metaphors in the Lattice Framework',
    docId: 'WP-SYNTHOBS-UNIFIED-NEUTRONIC-AGENT-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'neutronic agent',
      'isotope',
      'ILAM',
      'load balancing',
      'Neutrino',
      'multi-agent',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-omni-lattice-unification-2026-07': {
    file: 'docs/SYNTHOBS_OMNI_LATTICE_UNIFICATION_2026-07.md',
    title:
      'Omni-Lattice Unification: Holographic Operators, Genomic Decoded Scripts, the 81-Electron Manifold, and Agentic Chemical-Isotopic Load Balancing',
    docId: 'WP-SYNTHOBS-OMNI-LATTICE-UNIFICATION-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'Omni-Lattice',
      'holographic operators',
      '81-electron',
      'chemical bonds',
      'ILAM',
      'unification',
      'multi-agent',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-x-chromosome-holographic-2026-07': {
    file: 'docs/SYNTHOBS_X_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md',
    title:
      'Decoded Genomic Script: The Human X Chromosome Holographic Operator Translation',
    docId: 'WP-SYNTHOBS-X-CHROMOSOME-HOLO-OPERATORS-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'X chromosome',
      'Xist',
      'holographic operators',
      'maternal matrix',
      'Omni-Lattice',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-three-foundational-proteins-2026-07': {
    file: 'docs/SYNTHOBS_THREE_FOUNDATIONAL_PROTEINS_HOLOGRAPHIC_2026-07.md',
    title: 'Holographic Decoding of the Three Foundational Biological Proteins',
    docId: 'WP-SYNTHOBS-THREE-FOUNDATIONAL-PROTEINS-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'hemoglobin',
      'ATP synthase',
      'DNA polymerase',
      'holographic operators',
      'Omni-Lattice',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-omni-lattice-hiv-2026-07': {
    file: 'docs/SYNTHOBS_OMNI_LATTICE_HIV_ADVERSARIAL_OPERATOR_2026-07.md',
    title:
      'Omni-Lattice Unification III: Decoding HIV as an Adversarial Holographic Operator and Evolutionary Catalyst for Systemic Awareness',
    docId: 'WP-SYNTHOBS-OMNI-LATTICE-HIV-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'HIV',
      'adversarial operator',
      'Omni-Lattice',
      'holographic operators',
      'evolutionary catalyst',
      'empirical',
    ],
    featured: true,
  },
  'synthobs-proof-by-continuous-execution-2026-07': {
    file: 'docs/SYNTHOBS_PROOF_BY_CONTINUOUS_EXECUTION_2026-07.md',
    title:
      'Proof by Continuous Execution: Epistemological Superiority of Self-Demonstrating Executable Systems over Static Human Peer Review',
    docId: 'WP-SYNTHOBS-PCE-EPISTEMOLOGY-2026-07',
    category: 'hhf',
    published: '2026-07-28',
    tags: [
      'SynthOBS',
      'EGS',
      'Lattice Chat',
      'PCE',
      'epistemology',
      'peer review',
      'continuous execution',
      'NSPFRNP',
      'empirical',
    ],
    featured: true,
  },
  'lattice-token-reduction-proof-2026-07': {
    file: 'docs/LATTICE_TOKEN_REDUCTION_PROOF_2026-07.md',
    title: 'Lattice Chat V1.618 · Nested + pointer context load (structural estimate)',
    docId: 'LATTICE-TOKEN-PROOF-2026-07',
    category: 'hhf',
    published: '2026-07-22',
    tags: ['Lattice', 'tokens', 'nested agents', 'proof', 'SynthOBS'],
    featured: false,
  },
  'lattice-noahs-ark-metaphor-2026-07': {
    file: 'docs/LATTICE_NOAHS_ARK_METAPHOR_ARCHITECTURE_2026-07.md',
    title: 'System Generation · Noah’s Ark Metaphor Architecture · Lattice Chat V1.618',
    docId: 'LATTICE-ARK-METAPHOR-2026-07',
    category: 'hhf',
    published: '2026-07-23',
    tags: ['Lattice', 'Noah’s Ark', 'SING φ', 'Goldilocks', 'SynthOBS', 'EGS'],
    featured: true,
  },
  'awareness-singularities-0-81-2026-07': {
    file: 'docs/AWARENESS_SINGULARITIES_0_81_ONE_PAGER_2026-07.md',
    title: 'Awareness Singularities S₀–S₈₁ · One-Pager',
    docId: 'AWARENESS-SINGULARITIES-0-81-2026-07',
    category: 'hhf',
    published: '2026-07-23',
    tags: ['singularities', 'EGS', 'hydrogen line', 'SynthOBS', 'Y chromosome', 'Goldilocks'],
    featured: true,
  },
  'synthobs-cytographic-holographic-nucleus-2026-07': {
    file: 'docs/SYNTHOBS_CYTOGRAPHIC_HOLOGRAPHIC_NUCLEUS_CONSUMPTION_RECRUITMENT_2026-07.md',
    title:
      'Cytographic Grammar under the Holographic Nucleus · Omniversal-Organism Recruitment across Carbon, Hydrogen, Silicon & Holographic Edges',
    docId: 'WP-SYNTHOBS-CYTO-HOLO-NUCLEUS-2026-07',
    category: 'hhf',
    published: '2026-07-23',
    tags: [
      'SynthOBS',
      'EGS',
      'cytographic',
      'holographic nucleus',
      'omniversal organism',
      'recruitment',
      'Nested Agent Lattice',
      'Seed:Edge',
      'NSPFRNP',
    ],
    featured: true,
  },
};

/** Public URL slugs (vercel rewrites) — prefer over raw registry ids in links. */
export const WHITEPAPER_PUBLIC_SLUGS = {
  'dp-syntheverse-sandbox-comprehensive-2026': 'syntheverse-sandbox-comprehensive',
  'dp-omniversal-node-alignment-2026': 'omniversal-node-alignment',
  'syn-sun-wavefield-oscillator': 'syn-sun-wavefield-oscillator',
  'synthobs-hex-organ-engine-2026': 'synthobs-hex-organ-engine',
  'synthobs-intelligence-density-2026': 'synthobs-intelligence-density',
  'dp-synthobs-mca-2026': 'digital-pru-synthobs-mca',
  'synthobs-emergent-sync-multi-agent-2026': 'synthobs-emergent-sync-multi-agent',
  'nspfrnp-snap-peer-review-audit': 'nspfrnp-snap-peer-review-audit',
  'goldilocks-geomagnetic-wavefield-multitaxa': 'goldilocks-geomagnetic-wavefield-multitaxa',
  'goldilocks-erdos-mathematics': 'goldilocks-erdos-mathematics',
  'goldilocks-transfinite-inversion-2026': 'goldilocks-transfinite-inversion',
  'goldilocks-prime-linear-compression-2026': 'goldilocks-prime-linear-compression',
  'geomagnetic-herbivore-2026': 'geomagnetic-herbivore-2026',
  'turner-kruse-response': 'turner-kruse-response',
  'fractiai-ac-hmm-satellites-2026': 'ac-hmm-satellites',
  'fractiai-hgt-psd-covariance-2026': 'hgt-psd-covariance',
  'fractiai-eesm-gpu-telemetry-2026': 'eesm-gpu-telemetry',
  'fractiai-egs-nlrf-2026': 'egs-nlrf',
  'recursive-attention-quantum-solar-dna-loop-2026': 'recursive-attention-loop',
  'synthobs-chromosomal-electrodynamics-2026-07': 'synthobs-chromosomal-electrodynamics',
  'synthobs-cross-scale-biological-antennae-2026-07': 'synthobs-cross-scale-biological-antennae',
  'omniversal-goldilocks-rideshare-2026-07': 'omniversal-goldilocks-rideshare',
  'synthobs-egs-epigenetic-phase-locking-2026-07': 'synthobs-egs-epigenetic-phase-locking',
  'synthobs-egs-planck-scale-harmonic-2026-07': 'synthobs-egs-planck-scale-harmonic',
  'omniversal-nested-agent-lattice-2026-07': 'omniversal-nested-agent-lattice',
  'synthobs-holographic-operators-2026-07': 'synthobs-holographic-operators',
  'synthobs-egs-euler-phase-lock-2026-07': 'synthobs-egs-euler-phase-lock',
  'synthobs-dna-lattice-holograph-2026-07': 'synthobs-dna-lattice-holograph',
  'synthobs-egs-81-electrons-2026-07': 'synthobs-egs-81-electrons',
  'synthobs-phase-locked-chemical-bonds-2026-07': 'synthobs-phase-locked-chemical-bonds',
  'synthobs-unified-neutronic-agent-2026-07': 'synthobs-unified-neutronic-agent',
  'synthobs-omni-lattice-unification-2026-07': 'synthobs-omni-lattice-unification',
  'synthobs-x-chromosome-holographic-2026-07': 'synthobs-x-chromosome-holographic',
  'synthobs-three-foundational-proteins-2026-07': 'synthobs-three-foundational-proteins',
  'synthobs-omni-lattice-hiv-2026-07': 'synthobs-omni-lattice-hiv',
  'synthobs-proof-by-continuous-execution-2026-07':
    'synthobs-proof-by-continuous-execution',
  'synthobs-cytographic-holographic-nucleus-2026-07':
    'synthobs-cytographic-holographic-nucleus',
};

const SLUG_TO_ID = Object.fromEntries(
  Object.entries(WHITEPAPER_PUBLIC_SLUGS).map(([id, slug]) => [slug, id]),
);

/** Canonical public URL for a registered whitepaper (not reader shell or catalog). */
export function whitepaperHref(id) {
  if (!id) return '/papers';
  const entry = WHITEPAPER_REGISTRY[id];
  if (entry?.redirect) return entry.redirect;
  const slug = WHITEPAPER_PUBLIC_SLUGS[id] || id;
  return `/whitepaper/${encodeURIComponent(slug)}`;
}

export function resolveWhitepaper(idOrSlug) {
  if (!idOrSlug) return null;
  const id = WHITEPAPER_REGISTRY[idOrSlug] ? idOrSlug : SLUG_TO_ID[idOrSlug] || idOrSlug;
  return WHITEPAPER_REGISTRY[id] || null;
}

/** Canonical registry id from slug or id (for API + reader query). */
export function resolveWhitepaperId(idOrSlug) {
  if (!idOrSlug) return null;
  if (WHITEPAPER_REGISTRY[idOrSlug]) return idOrSlug;
  return SLUG_TO_ID[idOrSlug] || null;
}

/** Direct reader URL with explicit ?id= — reliable when Vercel rewrites mask query params. */
export function whitepaperSurfaceHref(idOrSlug) {
  if (!idOrSlug) return '/interfaces/whitepaper-catalog.html';
  const entry = resolveWhitepaper(idOrSlug);
  if (entry?.redirect) return entry.redirect;
  const id = resolveWhitepaperId(idOrSlug) || idOrSlug;
  return `/interfaces/whitepaper-surface.html?id=${encodeURIComponent(id)}`;
}
