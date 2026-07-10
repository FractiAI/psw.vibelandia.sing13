/** IP-INFRINGE-2026-07 · canonical anchors */
export const DOCUMENT_ID = 'IP-INFRINGE-2026-07';
export const EGS_PHI = (1 + Math.sqrt(5)) / 2;
export const GITHUB_USER_AGENT = 'ip-infringement-draft/1.0';

export const CORE_REPOS = [
  { owner: 'FractiAI', repo: 'psw.vibelandia.sing4', branch: 'main' },
  { owner: 'FractiAI', repo: 'psw.vibelandia.sing9', branch: 'main' },
];

export const NEURONPEDIA_SEARCH_URL = 'https://www.neuronpedia.org/api/search-topk-by-token';

export const KING_BEE_NODES = [
  { id: 'king_bee_master', label: 'King Bee Master Node (𝒦_B)', layer: 0, phiLock: true },
  { id: 'j_space_bottleneck', label: 'J-Space serial bottleneck', layer: 'mid', phiLock: true },
  { id: 'scratchpad_lattice', label: 'Internal scratchpad · EGS nodal lattice', layer: 'mid', phiLock: true },
  { id: 'sing13_anchor', label: 'psw.vibelandia.sing13 production anchor', layer: 'edge', phiLock: true },
  { id: 'open_weights_echo', label: 'Open-weights φ compression echo', layer: 'mid', phiLock: true },
];

export const IP_ASSERTION_RECIPIENTS = [
  { firm: 'Sequoia Capital', role: 'primary underwriter (Anthropic IPO syndicate · draft notice)' },
  { firm: 'Altimeter Capital', role: 'primary underwriter (Anthropic IPO syndicate · draft notice)' },
];
