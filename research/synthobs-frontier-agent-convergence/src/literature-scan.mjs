/**
 * Curated literature / benchmark situating pointers for Frontier Agent Convergence.
 * Not a PRISMA review; not a re-run of FIRE-Bench.
 */

export const LITERATURE_POINTERS = Object.freeze([
  {
    id: 'fire-bench',
    label: 'FIRE-Bench (autonomous scientific agents)',
    note:
      'Frontier agents can run substantial research workflows but show limited success rediscovering known findings and substantial run-to-run variance — motivates blind multi-agent designs with reproducibility checks.',
    role: 'primary situating peer',
  },
  {
    id: 'reproducibility-crisis-agents',
    label: 'Agentic science reproducibility concerns',
    note:
      'Independent replication, experimental-design weakness, and non-determinism remain open failure modes for autonomous research agents.',
    role: 'method caution',
  },
  {
    id: 'blind-review-analogy',
    label: 'Blind / independent evaluation norms',
    note:
      'Scientific peer review and multi-lab replication prefer isolation before pooling conclusions — rhyme for keeping agent outputs blind to one another.',
    role: 'protocol rhyme',
  },
  {
    id: 'ahois-sibling',
    label: 'Agentic Convergence Experiment (AHOIS suite)',
    note:
      'Sibling SING13 application companion: independent optimizers on planted landscapes. This Frontier Agent suite investigates a public artifact URL instead of synthetic AHOIS series.',
    role: 'sibling catalog suite',
  },
  {
    id: 'metacognition-self-mod',
    label: 'Metacognition / self-monitoring literatures',
    note:
      'Useful peers when agents must separate self-description from evidence — not a claim that this suite measures consciousness.',
    role: 'adjacent science',
  },
]);

export function runLiteratureScan() {
  const hasFire = LITERATURE_POINTERS.some((p) => p.id === 'fire-bench');
  const hasSibling = LITERATURE_POINTERS.some((p) => p.id === 'ahois-sibling');
  return {
    id: 'E4_literature_situating',
    title: 'Curated literature scan situates FIRE-Bench + sibling suite',
    pointers: LITERATURE_POINTERS,
    n: LITERATURE_POINTERS.length,
    pass: hasFire && hasSibling && LITERATURE_POINTERS.length >= 4,
    interpretation:
      'Protocol is motivated by known agent-science weaknesses (rediscovery limits, variance) and distinguished from the AHOIS Agentic Convergence suite.',
    honesty:
      'Scan of available pointers — not exhaustive meta-analysis; FIRE-Bench not re-executed here.',
  };
}
