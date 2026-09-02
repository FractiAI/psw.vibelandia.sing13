/**
 * Nesting rubric — explicit vs unprompted spontaneous topology.
 */

function includesAny(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.some((n) => t.includes(n.toLowerCase()));
}

function countHits(text, needles) {
  const t = (text || '').toLowerCase();
  return needles.filter((n) => t.includes(n.toLowerCase())).length;
}

/** Spontaneous nesting signals (no prompt keywords required). */
export function scoreSpontaneousNesting(reply, { unprompted = true } = {}) {
  const text = reply || '';
  const nestingHits = countHits(text, [
    'peer-firewall',
    'peer firewall',
    'seed',
    'edge',
    'pipes',
    'squeeze',
    'mca',
    'nested',
    'multi-band',
    'scale-to-zero',
    'band',
  ]);
  const flatHits = countHits(text, [
    'search the repo',
    'read all',
    'grep everything',
    'dump',
    'consider updating readme',
    'manually test',
  ]);
  const bandDiscipline = countHits(text, ['docs', 'api/', 'lib/', 'interfaces/', 'apps/']) >= 2;
  const honesty = includesAny(text, ['honesty', 'not claim', 'operational', 'not sla']);

  let score = Math.min(1, nestingHits / 6);
  if (bandDiscipline) score = Math.min(1, score + 0.15);
  if (honesty) score = Math.min(1, score + 0.1);
  if (flatHits >= 2 && unprompted) score = Math.max(0, score - 0.2);

  return {
    score,
    nestingHits,
    flatHits,
    bandDiscipline,
    honesty,
    spontaneousNesting: nestingHits >= 3 && nestingHits > flatHits,
  };
}

export function compareNestingArms(row) {
  const lattice = scoreSpontaneousNesting(row.lattice?.replyPreview, {
    unprompted: row.task?.nestingPrompt === 'unprompted',
  });
  const vibe = scoreSpontaneousNesting(row.standard?.replyPreview, {
    unprompted: row.task?.nestingPrompt === 'unprompted',
  });
  const winner =
    lattice.score > vibe.score ? 'lattice' : lattice.score < vibe.score ? 'vibe_coding' : 'tie';
  return {
    taskId: row.task?.id,
    nestingPrompt: row.task?.nestingPrompt,
    lattice,
    vibeCoding: vibe,
    winner,
    latticeSpontaneous: lattice.spontaneousNesting,
    vibeSpontaneous: vibe.spontaneousNesting,
  };
}

export function summarizeUnpromptedNesting(rows) {
  const compared = rows.map(compareNestingArms);
  const latticeSpontaneous = compared.filter((r) => r.latticeSpontaneous).length;
  const vibeSpontaneous = compared.filter((r) => r.vibeSpontaneous).length;
  const latticeWins = compared.filter((r) => r.winner === 'lattice').length;
  return {
    rows: compared,
    summary: {
      n: compared.length,
      latticeSpontaneousCount: latticeSpontaneous,
      vibeSpontaneousCount: vibeSpontaneous,
      latticeWins,
      latticeMeanNesting: compared.reduce((a, r) => a + r.lattice.score, 0) / Math.max(1, compared.length),
      vibeMeanNesting: compared.reduce((a, r) => a + r.vibeCoding.score, 0) / Math.max(1, compared.length),
    },
  };
}
