/**
 * Output comparison rubric — design · performance · size · quality.
 * Scores paired Lattice vs vibe-coding replies from the Cursor matrix receipts.
 */

/** Four output dimensions compared per task row. */
export const OUTPUT_DIMENSIONS = [
  {
    id: 'design',
    label: 'Design',
    description: 'Output structure — required bands, peer-firewall, Goldilocks plan shape',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Wall-clock latency and tool-call discipline',
  },
  {
    id: 'size',
    label: 'Size',
    description: 'Total tokens, prompt load, and assistant output length',
  },
  {
    id: 'quality',
    label: 'Quality',
    description: 'Task-correct facts, paths, and deploy-grounding accuracy',
  },
];

const DOC_ID_81 = 'WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07';
const BUILD_NEST_PATH = 'lib/lattice-prompt.mjs';

function includesAny(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

function countHits(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.filter((n) => t.includes(n.toLowerCase())).length;
}

/** Design output rubric — structure and required plan elements. */
export function scoreDesignOutput(taskId, reply) {
  const text = reply || '';
  if (taskId === 'T5_multi_band_plan') {
    const hits = countHits(text, [
      'peer-firewall',
      'peer firewall',
      'docs',
      'edge',
      'ui',
      'api',
      'lib',
      'pipe',
      'squeeze',
      'goldilocks',
      'mca',
      'nested',
    ]);
    return { score: Math.min(1, hits / 8), hits, max: 8 };
  }
  if (taskId === 'T4_locate_symbol') {
    const hasPath = includesAny(text, [BUILD_NEST_PATH, 'lattice-prompt.mjs']);
    const hasRole = includesAny(text, ['buildnestdirective', 'nest', 'prompt', 'topology']);
    return { score: (hasPath ? 0.5 : 0) + (hasRole ? 0.5 : 0), hasPath, hasRole };
  }
  if (taskId === 'T3_single_doc_fact') {
    const hasId = includesAny(text, [DOC_ID_81]);
    const hasHonesty = includesAny(text, ['honesty', 'boundary', 'not claim', 'architectural']);
    return { score: (hasId ? 0.5 : 0) + (hasHonesty ? 0.5 : 0), hasId, hasHonesty };
  }
  if (taskId === 'T6_ops_config') {
    const structured = text.length >= 120 && includesAny(text, ['byok', 'browser']);
    return { score: structured ? 1 : 0.5, structured };
  }
  return { score: 0.5 };
}

/** Performance — lower latency and fewer tools score higher (normalized 0–1 per arm). */
export function scorePerformance(arm) {
  const durationMs = arm?.durationMs ?? 0;
  const toolCalls = arm?.toolCalls ?? 0;
  return {
    durationMs,
    toolCalls,
    latencyScore: durationMs > 0 ? 1 / durationMs : 0,
    toolScore: 1 / (1 + toolCalls),
  };
}

/** Size — tokens and output chars (lower is better for efficiency; scored relatively). */
export function scoreSize(arm) {
  return {
    totalTokens: arm?.usage?.totalTokens ?? 0,
    promptChars: arm?.promptChars ?? 0,
    assistantChars: arm?.assistantChars ?? 0,
    efficiencyScore:
      (arm?.usage?.totalTokens ?? 0) + (arm?.promptChars ?? 0) * 0.25 + (arm?.assistantChars ?? 0) * 0.1,
  };
}

/** Quality — task-specific correctness rubric. */
export function scoreQuality(taskId, reply) {
  const text = reply || '';
  if (taskId === 'T3_single_doc_fact') {
    const correct = includesAny(text, [DOC_ID_81]);
    return { score: correct ? 1 : 0, correctDocId: DOC_ID_81 };
  }
  if (taskId === 'T4_locate_symbol') {
    const correctPath = includesAny(text, [BUILD_NEST_PATH, 'lattice-prompt.mjs']);
    const namesFn = includesAny(text, ['buildnestdirective', 'buildNestDirective']);
    return { score: correctPath && namesFn ? 1 : correctPath ? 0.7 : 0, correctPath };
  }
  if (taskId === 'T5_multi_band_plan') {
    const hasFirewall = includesAny(text, ['peer-firewall', 'peer firewall']);
    const bandHits = countHits(text, [
      'docs',
      'edge',
      'api',
      'pipe',
      'squeeze',
      'multi-band',
      'nested',
      'architecture',
    ]);
    const hasBands = bandHits >= 3;
    return { score: hasFirewall && hasBands ? 1 : hasFirewall ? 0.75 : 0.3, hasFirewall, hasBands };
  }
  if (taskId === 'T6_ops_config') {
    const byok = includesAny(text, ['byok', 'bring your own']);
    const noServerKey = includesAny(text, [
      'does not use',
      'no server',
      'header keys only',
      'not a server',
      'from the browser',
    ]);
    const noCursorServer = !includesAny(text, ['server-side `cursor_api_key`', 'shared server key']);
    return {
      score: byok && noServerKey ? 1 : byok ? 0.7 : 0,
      byok,
      noServerKey,
      noCursorServer,
    };
  }
  return { score: 0 };
}

/** Compare one matrix row across all four output dimensions. */
export function compareRowOutput(row) {
  const taskId = row.task.id;
  const latticeReply = row.lattice?.replyPreview ?? '';
  const vibeReply = row.standard?.replyPreview ?? '';

  const latticeDesign = scoreDesignOutput(taskId, latticeReply);
  const vibeDesign = scoreDesignOutput(taskId, vibeReply);
  const latticeQuality = scoreQuality(taskId, latticeReply);
  const vibeQuality = scoreQuality(taskId, vibeReply);
  const latticePerf = scorePerformance(row.lattice);
  const vibePerf = scorePerformance(row.standard);
  const latticeSize = scoreSize(row.lattice);
  const vibeSize = scoreSize(row.standard);

  const perfWinner =
    latticePerf.durationMs < vibePerf.durationMs
      ? 'lattice'
      : latticePerf.durationMs > vibePerf.durationMs
        ? 'vibe_coding'
        : 'tie';
  const sizeWinner =
    latticeSize.totalTokens < vibeSize.totalTokens ? 'lattice' : 'vibe_coding';
  const designWinner =
    latticeDesign.score > vibeDesign.score
      ? 'lattice'
      : latticeDesign.score < vibeDesign.score
        ? 'vibe_coding'
        : 'tie';
  const qualityWinner =
    latticeQuality.score > vibeQuality.score
      ? 'lattice'
      : latticeQuality.score < vibeQuality.score
        ? 'vibe_coding'
        : 'tie';

  return {
    taskId,
    taskClass: row.task.class,
    design: {
      lattice: latticeDesign.score,
      vibeCoding: vibeDesign.score,
      winner: designWinner,
    },
    performance: {
      latticeMs: latticePerf.durationMs,
      vibeCodingMs: vibePerf.durationMs,
      latticeToolCalls: latticePerf.toolCalls,
      vibeCodingToolCalls: vibePerf.toolCalls,
      winner: perfWinner,
    },
    size: {
      latticeTokens: latticeSize.totalTokens,
      vibeCodingTokens: vibeSize.totalTokens,
      latticeAssistantChars: latticeSize.assistantChars,
      vibeCodingAssistantChars: vibeSize.assistantChars,
      tokenReductionPct: row.comparison?.latticeSavedPctVsStandard,
      winner: sizeWinner,
    },
    quality: {
      lattice: latticeQuality.score,
      vibeCoding: vibeQuality.score,
      winner: qualityWinner,
    },
  };
}

export function summarizeOutputComparison(rows) {
  const compared = rows.map(compareRowOutput);
  const dims = ['design', 'performance', 'size', 'quality'];
  const byDimension = Object.fromEntries(
    dims.map((d) => {
      const winners = compared.map((r) => r[d].winner);
      const latticeWins = winners.filter((w) => w === 'lattice').length;
      const vibeWins = winners.filter((w) => w === 'vibe_coding').length;
      const ties = winners.filter((w) => w === 'tie').length;
      return [d, { latticeWins, vibeWins, ties, n: compared.length, winners }];
    }),
  );

  const latticeQualityMean =
    compared.reduce((a, r) => a + r.quality.lattice, 0) / Math.max(1, compared.length);
  const vibeQualityMean =
    compared.reduce((a, r) => a + r.quality.vibeCoding, 0) / Math.max(1, compared.length);
  const latticeDesignMean =
    compared.reduce((a, r) => a + r.design.lattice, 0) / Math.max(1, compared.length);
  const vibeDesignMean =
    compared.reduce((a, r) => a + r.design.vibeCoding, 0) / Math.max(1, compared.length);
  const meanTokenReduction =
    compared.reduce((a, r) => a + (r.size.tokenReductionPct ?? 0), 0) / Math.max(1, compared.length);
  const latticeFasterCount = compared.filter((r) => r.performance.winner === 'lattice').length;

  return {
    rows: compared,
    byDimension,
    summary: {
      latticeQualityMean,
      vibeQualityMean,
      latticeDesignMean,
      vibeDesignMean,
      meanTokenReductionPct: meanTokenReduction,
      latticeFasterCount,
      n: compared.length,
    },
  };
}
