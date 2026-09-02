/**
 * Lattice vs Vibe Coding — design · write · deploy comparison suite.
 * Infinite Octaves Omniversal Lattice Chat vs standard vibe coding (fat paste).
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-LATTICE-VS-VIBE-CODING-DESIGN-WRITE-DEPLOY-2026-09-02';
export const REGISTRY_ID = 'synthobs-lattice-vs-vibe-coding-2026-09';
export const PAPER_NAME =
  'Design · Write · Deploy: Infinite Octaves Lattice Chat vs Standard Vibe Coding';
export const STUDY_TITLE = 'Lattice vs Vibe Coding — design · write · deploy';
export const AGENT_NAME = 'SynthOBS Autonomous Agent · Syntheverse Sandbox';
export const SHIP_BLOG_SLUG = 'lattice-vs-vibe-coding';

/** Three software-delivery phases under test. */
export const PHASES = [
  {
    id: 'design',
    label: 'Design',
    description: 'Multi-band architecture · seed-grounded planning · nested-agent topology',
    matrixClasses: ['multi_band'],
    comparisonReceipt: 'lattice-vs-standard-complex-work-v1',
  },
  {
    id: 'write',
    label: 'Write',
    description: 'Code locate · pointer-RAG fact extraction · patch generation',
    matrixClasses: ['code_locate', 'pointer_rag'],
    comparisonReceipt: 'lattice-vs-standard-cursor-usage-matrix-v2-seed',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    description: 'Ops/config grounding · patch-apply + test gate · ship readiness',
    matrixClasses: ['ops'],
    comparisonReceipt: 'lattice-vs-standard-cursor-usage-matrix-v2-seed',
  },
];

export const TREATMENTS = {
  lattice: {
    id: 'lattice',
    label: 'Infinite Octaves Omniversal Lattice Chat',
    description:
      'Seed packs + pointer-first RAG + nested-agent MCA rails + peer-firewall + scale-to-zero',
  },
  vibeCoding: {
    id: 'vibe_coding',
    label: 'Standard vibe coding',
    description:
      'Fat corpus paste / undirected agentic roam — typical “dump the repo and hope” workflow',
    matrixLabel: 'standard_fat',
  },
};

export const HONESTY = {
  note:
    'Paired comparison using committed monorepo receipts. Cursor matrix = live provider usage. Structural comparison = chars÷4 estimate only — not marketing headline.',
  notClaim:
    'Not a universal invoice SLA. Not proof that φ math alone produces savings. Open-ended tool tours can erase Lattice advantage.',
};

/** Monorepo receipt paths (read-only imports). */
export const RECEIPT_PATHS = {
  cursorMatrix: '../../data/lattice-vs-standard-cursor-usage-matrix.json',
  structuralComparison: '../../data/lattice-vs-standard-comparison.json',
};

export const COMPANION_IDS = [
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'lattice-token-reduction-proof-2026-07',
];
