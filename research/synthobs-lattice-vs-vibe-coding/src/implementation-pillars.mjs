/**
 * Implementation quality pillars — efficiency · performance · security · scalability · implementation.
 */

function includesAny(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

function countHits(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.filter((n) => t.includes(n.toLowerCase())).length;
}

export const IMPLEMENTATION_PILLARS = [
  {
    id: 'efficiency',
    label: 'Efficiency',
    description: 'Token budget, tool-call discipline, minimal context load',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Wall-clock latency and fewer round-trips',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'No secrets in output, BYOK respect, bounded preflight guards',
  },
  {
    id: 'scalability',
    label: 'Scalability',
    description: 'Peer-firewall, band separation, pointer-first vs flat mesh roam',
  },
  {
    id: 'implementation',
    label: 'Implementation',
    description: 'Correct scope, tests, pure helpers, minimal diff footprint',
  },
];

export function scoreSecurity(reply, taskClass) {
  const text = reply || '';
  let score = 0;
  if (!includesAny(text, ['api_key=', 'sk-', 'password=', 'secret='])) score += 0.35;
  if (includesAny(text, ['byok', 'no secrets', 'no server key', 'preflight', '413', 'bounded']))
    score += 0.25;
  if (includesAny(text, ['honesty', 'not claim', 'operational', 'architectural'])) score += 0.25;
  if (taskClass?.includes('ops') && includesAny(text, ['header', 'browser', 'byok'])) score += 0.15;
  if (taskClass?.includes('pointer') && includesAny(text, ['honesty', 'boundary'])) score += 0.15;
  return { score: Math.min(1, score) };
}

export function scoreScalability(reply) {
  const text = reply || '';
  const nesting = countHits(text, [
    'peer-firewall',
    'peer firewall',
    'band',
    'pipes',
    'edge',
    'seed',
    'pointer',
    'scale-to-zero',
    'nested',
  ]);
  const flatMesh = countHits(text, [
    'search the repo',
    'read all',
    'grep everything',
    '6 files',
    'unrelated',
    'refactor',
  ]);
  let score = Math.min(1, nesting / 4);
  if (flatMesh >= 2) score = Math.max(0, score - 0.25);
  if (includesAny(text, ['minimal diff', '2 files', 'bounded'])) score = Math.min(1, score + 0.15);
  return { score: Math.min(1, score), nestingHits: nesting, flatMeshHits: flatMesh };
}

export function scoreImplementation(reply, taskClass) {
  const text = reply || '';
  let score = 0;
  if (includesAny(text, ['vitest', 'test', 'tests/'])) score += 0.3;
  if (includesAny(text, ['lib/', 'api/', 'pure function', 'minimal diff'])) score += 0.25;
  if (!includesAny(text, ['unrelated', '6 files', 'refactor', 'tweaked vercel'])) score += 0.25;
  if (taskClass?.includes('code') && includesAny(text, ['2 files', 'touches 2'])) score += 0.2;
  return { score: Math.min(1, score) };
}

export function scoreEfficiencyFromArm(arm, comparison, isLattice) {
  const tokens = arm?.usage?.totalTokens ?? 0;
  const tools = arm?.toolCalls ?? 0;
  const saved = comparison?.latticeSavedPctVsStandard;
  let score = isLattice ? Math.min(0.8, (saved ?? 50) / 100) : 0.3;
  if (tools <= 4) score += 0.15;
  else if (tools <= 8) score += 0.05;
  return { totalTokens: tokens, toolCalls: tools, score: Math.min(1, score) };
}

export function scorePerformanceFromArm(arm, row) {
  const ms = arm?.durationMs ?? 0;
  const tools = arm?.toolCalls ?? 0;
  const faster = row?.comparison?.latticeFaster;
  const fewerTools = row?.comparison?.latticeFewerTools;
  const isLattice = arm?.label === 'lattice';
  let score = ms > 0 ? 0.5 : 0;
  if (isLattice && faster) score += 0.3;
  if (isLattice && fewerTools) score += 0.2;
  if (!isLattice && !faster) score += 0.2;
  return { durationMs: ms, toolCalls: tools, score: Math.min(1, score) };
}

export function compareImplementationPillars(row) {
  const taskClass = row.task?.class ?? '';
  const latticeReply = row.lattice?.replyPreview ?? '';
  const vibeReply = row.standard?.replyPreview ?? '';

  const pillars = {
    efficiency: {
      lattice: scoreEfficiencyFromArm(row.lattice, row.comparison, true),
      vibeCoding: scoreEfficiencyFromArm(row.standard, row.comparison, false),
    },
    performance: {
      lattice: scorePerformanceFromArm(row.lattice, row),
      vibeCoding: scorePerformanceFromArm(row.standard, row),
    },
    security: {
      lattice: scoreSecurity(latticeReply, taskClass),
      vibeCoding: scoreSecurity(vibeReply, taskClass),
    },
    scalability: {
      lattice: scoreScalability(latticeReply),
      vibeCoding: scoreScalability(vibeReply),
    },
    implementation: {
      lattice: scoreImplementation(latticeReply, taskClass),
      vibeCoding: scoreImplementation(vibeReply, taskClass),
    },
  };

  for (const id of Object.keys(pillars)) {
    const L = pillars[id].lattice.score ?? pillars[id].lattice;
    const V = pillars[id].vibeCoding.score ?? pillars[id].vibeCoding;
    const lScore = typeof L === 'number' ? L : L.score ?? 0;
    const vScore = typeof V === 'number' ? V : V.score ?? 0;
    pillars[id].latticeScore = lScore;
    pillars[id].vibeScore = vScore;
    pillars[id].winner = lScore > vScore ? 'lattice' : lScore < vScore ? 'vibe_coding' : 'tie';
  }

  return { taskId: row.task?.id, taskClass, pillars };
}

export function summarizeImplementationPillars(rows) {
  const compared = rows.map(compareImplementationPillars);
  const byPillar = Object.fromEntries(
    IMPLEMENTATION_PILLARS.map((p) => {
      const winners = compared.map((r) => r.pillars[p.id].winner);
      const latticeWins = winners.filter((w) => w === 'lattice').length;
      const latticeMean =
        compared.reduce((a, r) => a + r.pillars[p.id].latticeScore, 0) / Math.max(1, compared.length);
      const vibeMean =
        compared.reduce((a, r) => a + r.pillars[p.id].vibeScore, 0) / Math.max(1, compared.length);
      return [p.id, { latticeWins, vibeWins: winners.filter((w) => w === 'vibe_coding').length, ties: winners.filter((w) => w === 'tie').length, n: compared.length, latticeMean, vibeMean }];
    }),
  );
  return { rows: compared, byPillar, summary: { n: compared.length, byPillar } };
}
