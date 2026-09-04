/**
 * PDVSA Gateway Ops Mockup — constants.
 * Simulator + takeaway→paper map; PDVSA/Protokol are narrative analogues only.
 */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const PLANCK_MANTISSA = 1.616255;
export const CLUTCH_DELTA = Math.abs(PHI_EGS - PLANCK_MANTISSA);

export const DOC_ID = 'WP-SYNTHOBS-PDVSA-GATEWAY-OPS-MOCKUP-2026-09-04';
export const REGISTRY_ID = 'synthobs-pdvsa-gateway-ops-mockup-2026-09';
export const PAPER_NAME =
  'PDVSA Gateway Ops Mockup — Today’s Industry UI vs EGS Lattice-Linear Gateway';
export const STUDY_TITLE = 'PDVSA Gateway Ops Mockup · Lattice-Linear takeaway→paper empirics';
export const AGENT_NAME = 'SynthOBS Autonomous Agent · Syntheverse Sandbox';
export const SHIP_BLOG_SLUG = 'pdvsa-gateway-ops-mockup';
export const LIVE_SIMULATOR_PATH = '/special-projects/pdvsa-gateway-ops';
export const GITHUB_URL =
  'https://github.com/FractiAI/synthobs-pdvsa-gateway-ops-mockup';

export const HONESTY = {
  note:
    'Interactive EGS Lattice-Linear Gateway simulator + deterministic takeaway→paper map. IBM SNA↔TCP/IP is the historical rhyme. Companion empirics back architectural claims — not live PDVSA telemetry.',
  notClaim:
    'Does not claim production oilfield A/B, SCADA truth, or re-proof of historical PDVSA / Protokol Sistemas contracts.',
};

/** Nine executive takeaways → primary backing papers (registry ids + public hrefs). */
export const EXECUTIVE_TAKEAWAYS = Object.freeze([
  {
    id: 'efficiency',
    label: 'Efficiency',
    registryId: 'lattice-token-reduction-proof-2026-07',
    secondaryRegistryId: 'omniversal-nested-agent-lattice-2026-07',
    href: '/interfaces/whitepaper-surface.html?id=lattice-token-reduction-proof-2026-07',
    shipBlog: null,
  },
  {
    id: 'immediacy',
    label: 'Immediacy',
    registryId: 'synthobs-infinite-octaves-omniversal-lattice-2026-08',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-infinite-octaves-omniversal-lattice-2026-08',
    shipBlog: '/ship-blog/infinite-octaves-omniversal',
  },
  {
    id: 'harmony',
    label: 'Harmony',
    registryId: 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    shipBlog: '/ship-blog/sna-tcpip-gateway-omni-lattice',
  },
  {
    id: 'savings',
    label: 'Savings',
    registryId: 'synthobs-lattice-vs-vibe-coding-2026-09',
    secondaryRegistryId: 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-lattice-vs-vibe-coding-2026-09',
    shipBlog: '/ship-blog/lattice-vs-vibe-coding',
  },
  {
    id: 'uptime',
    label: 'Uptime',
    registryId: 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    shipBlog: '/ship-blog/sna-tcpip-gateway-omni-lattice',
  },
  {
    id: 'accuracy',
    label: 'Accuracy',
    registryId: 'synthobs-infinite-octaves-omniversal-lattice-2026-08',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-infinite-octaves-omniversal-lattice-2026-08',
    shipBlog: '/ship-blog/infinite-octaves-omniversal',
  },
  {
    id: 'predictions',
    label: 'Predictions',
    registryId: 'omniversal-nested-agent-lattice-2026-07',
    secondaryRegistryId: 'synthobs-proof-by-continuous-execution-2026-07',
    href: '/interfaces/whitepaper-surface.html?id=omniversal-nested-agent-lattice-2026-07',
    shipBlog: '/ship-blog/omniversal-nested-agent-lattice',
  },
  {
    id: 'exploration',
    label: 'Exploration',
    registryId: 'omniversal-nested-agent-lattice-2026-07',
    href: '/interfaces/whitepaper-surface.html?id=omniversal-nested-agent-lattice-2026-07',
    shipBlog: '/ship-blog/omniversal-nested-agent-lattice',
  },
  {
    id: 'rd',
    label: 'New R&D applications',
    registryId: 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    secondaryRegistryId: 'synthobs-constructive-morphogenesis-99-octave-2026-08',
    href: '/interfaces/whitepaper-surface.html?id=synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    shipBlog: '/ship-blog/sna-tcpip-gateway-omni-lattice',
  },
]);

export const REQUIRED_TAKEAWAY_IDS = Object.freeze([
  'efficiency',
  'immediacy',
  'harmony',
  'savings',
  'uptime',
  'accuracy',
  'predictions',
  'exploration',
  'rd',
]);

export const MOCK_HTML_RELATIVE = 'interfaces/pdvsa-gateway-ops.html';
export const LIVE_MOCK_MONOREPO = 'interfaces/special-projects/pdvsa-gateway-ops.html';

export const COMPANION_SNA_REGISTRY =
  'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09';

export const FAIR_EXCHANGE_CLAUSE =
  'Fair Exchange: platform credits and operational allocations remain subject to ' +
  'dynamic reciprocal balancing based on verified scale-harmonic alignment and ' +
  'net-zero execution metrics. Transparency notice required; not a guaranteed ' +
  'refund schedule or legal warranty.';

export const EXPECTED_PHI = 1.618033988749895;
export const EXPECTED_CLUTCH = 0.001779;
