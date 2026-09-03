/**
 * IBM SNA ↔ TCP/IP Gateway Fractal Moment — Omni-Lattice Chat deployments.
 * Architectural / numerical suite — not IBM/PDVSA affiliation or plant proof.
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const LAMBDA_EGS = Math.log(PHI_EGS) / (2 * Math.PI);

export const DOC_ID = 'WP-SYNTHOBS-IBM-SNA-TCP-IP-GATEWAY-FRACTAL-MOMENT-2026-09-03';
export const REGISTRY_ID = 'synthobs-ibm-sna-tcp-ip-gateway-fractal-moment-2026-09';
export const PAPER_NAME =
  'Case Study: The IBM SNA ↔ TCP/IP Gateway as a Repeating Fractal Moment — Scaling to Omni-Lattice Chat Deployments';
export const STUDY_TITLE = 'SNA/TCP-IP Gateway Fractal Moment · Omni-Lattice Chat';
export const AGENT_NAME = 'SynthOBS Autonomous Agent · Syntheverse Sandbox';
export const SHIP_BLOG_SLUG = 'ibm-sna-fractal-moment';
export const PUBLIC_SLUG = 'ibm-sna-fractal-moment';

export const RESEARCH_QUESTION =
  'Does the historical SNA↔TCP/IP gateway threshold structurally echo Omni-Lattice Chat deployments, and do multi-octave Lattice routes beat flat vibe windows on coherence and resource metrics?';

/** Topology feature axes shared by historical gateway and Lattice Chat (0–1 scores). */
export const GATEWAY_FEATURES = {
  labels: [
    'enclosed_to_open_plane',
    'protocol_impedance_match',
    'session_vs_datagram',
    'local_integrator_edge',
    'control_plane_preserve',
    'multi_domain_fanout',
    'scale_self_similarity',
    'lite_edge_keys',
  ],
  /** Historical SNA↔IP gateway pattern (catalog grammar scores). */
  snaTcpIp: [0.95, 0.92, 0.9, 0.85, 0.88, 0.7, 0.75, 0.55],
  /** Omni-Lattice Chat deployment pattern. */
  omniLattice: [0.93, 0.9, 0.86, 0.88, 0.91, 0.94, 0.92, 0.96],
  /** Flat vibe-coding station (poor gateway analog — low impedance match). */
  vibeFlat: [0.2, 0.12, 0.1, 0.15, 0.25, 0.55, 0.08, 0.18],
};

/** Industrial / enterprise domains for multi-octave coherence sim. */
export const ENTERPRISE_DOMAINS = [
  'electrical_grid',
  'fluid_dynamics',
  'legal_compliance',
  'extraction_ops',
  'refining_telemetry',
  'integrator_runbooks',
  'security_keys',
  'token_economics',
];

export const OCTAVE_BANDS = 9; // 9× self-similar bands in sim
export const FLAT_WINDOW_DECAY = 0.62; // retention multiplier per domain hop (flat)
export const LATTICE_BASE_RETENTION = 0.97; // per-band retention under Φ routing
/** Soft Φ decay exponent divisor — keeps multi-band floors Goldilocks-high. */
export const LATTICE_DECAY_DIVISOR = PHI_EGS * 6;

export const COMPANION_IDS = [
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'synthobs-lattice-vs-vibe-coding-2026-09',
  'synthobs-egs-planck-scale-harmonic-2026-07',
];

export const CEO_TIP = {
  surface: 'interfaces/omniverse-canvas.html',
  selector: 'aside.canvas-ceo-announcement',
  shipBlog: `/ship-blog/${SHIP_BLOG_SLUG}`,
  whitepaper: `/whitepaper/${PUBLIC_SLUG}`,
};

export const HONESTY = {
  note:
    'Structural fractal template + deterministic suite metrics. Historical names are deployment grammar — not affiliation or procurement claims.',
  notClaim:
    'Not IBM/Interlink/PDVSA endorsement. Not SCADA autonomy proof. Φ_EGS is architectural scale key — not a replacement for ℏ, c, or G.',
};
