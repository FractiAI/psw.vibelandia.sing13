/**
 * IBM SNA TCP-IP Gateway · Omni-Lattice case study — constants.
 * Fractal template empirics; Interlink/PDVSA/Protokol Sistemas are narrative analogues only.
 */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

/** Architectural Planck mantissa (l_P × 10^35) — clutch shelf, not CODATA rewrite. */
export const PLANCK_MANTISSA = 1.616255;

/** Clutch / slip |Φ_EGS − Planck mantissa|. */
export const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA);

export const DOC_ID = 'WP-SYNTHOBS-IBM-SNA-TCPIP-GATEWAY-OMNI-LATTICE-2026-09-03';
export const REGISTRY_ID = 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09';
export const PAPER_NAME =
  'Case Study: The IBM SNA TCP-IP Gateway as a Repeating Fractal Moment — Scaling to Omni-Lattice Chat Deployments';
export const STUDY_TITLE =
  'IBM SNA TCP-IP Gateway · Omni-Lattice fractal template empirics';
export const AGENT_NAME = 'SynthOBS Autonomous Agent · Syntheverse Sandbox';
export const SHIP_BLOG_SLUG = 'sna-tcpip-gateway-omni-lattice';
export const GITHUB_URL =
  'https://github.com/FractiAI/synthobs-ibm-sna-tcpip-gateway-omni-lattice';

export const HONESTY = {
  note:
    'Fractal template / catalog grammar. Deterministic math fixtures back architectural claims about multi-octave Lattice Chat vs flat vibe/linear chat.',
  notClaim:
    'Does not claim wet-lab results. Does not re-prove historical Interlink / PDVSA / Protokol Sistemas facts — those are narrative analogues only.',
};

/**
 * Three nested shells: historical SNA gateway rhyme ↔ Omni-Lattice Core/Amphitheater/Horizon.
 * scaleRatio = Φ_EGS^shellIndex (architectural, not measured network RTT).
 */
export const GATEWAY_SHELLS = Object.freeze([
  {
    id: 'core',
    historical: 'SNA / mainframe enclosure',
    lattice: 'Core · seed · octave-0 intent',
    seedPipesEdge: 'seed',
    shellIndex: 0,
    scaleRatio: PHI_EGS ** 0,
  },
  {
    id: 'amphitheater',
    historical: 'Gateway (Interlink-class bridge)',
    lattice: 'Amphitheater · pipes · nested agents / MCA',
    seedPipesEdge: 'pipes',
    shellIndex: 1,
    scaleRatio: PHI_EGS ** 1,
  },
  {
    id: 'horizon',
    historical: 'TCP/IP open plane',
    lattice: 'Horizon · edge · field / guest surfaces',
    seedPipesEdge: 'edge',
    shellIndex: 2,
    scaleRatio: PHI_EGS ** 2,
  },
]);

/** E2 octave-routing simulation parameters. */
export const OCTAVE_ROUTING = Object.freeze({
  nDomains: 9,
  domainDumpTokens: 8000,
  seedPackTokens: 2000,
  pointerBaseK: 500,
  /** Lattice must be under this fraction of flat for N >= 6. */
  maxLatticeFractionOfFlat: 0.15,
  minDomainsForPass: 6,
});

/** E3 cross-domain coherence simulation. */
export const COHERENCE = Object.freeze({
  switches: 12,
  start: 1.0,
  flatDecayPerSwitch: 0.05,
  latticeDecayPerSwitch: 0.01,
  latticeMinFinal: 0.85,
  flatMaxFinal: 0.5,
});

/** Companion structural receipt (monorepo root data/). Soft if missing. */
export const RECEIPT_PATHS = Object.freeze({
  structuralComparison: '../../data/lattice-vs-standard-comparison.json',
});

export const COMPANION_IDS = Object.freeze([
  'synthobs-lattice-vs-vibe-coding-2026-09',
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'lattice-token-reduction-proof-2026-07',
]);

/**
 * Fair Exchange / transparency notice — engagements may use performance-weighted
 * reciprocal balancing. Not a guaranteed refund schedule or legal warranty.
 */
export const FAIR_EXCHANGE_CLAUSE =
  'Fair Exchange: platform credits and operational allocations remain subject to ' +
  'dynamic reciprocal balancing based on verified scale-harmonic alignment and ' +
  'net-zero execution metrics. Transparency notice required; not a guaranteed ' +
  'refund schedule or legal warranty.';

export const EXPECTED_PHI = 1.618033988749895;
export const EXPECTED_CLUTCH = 0.001779;
