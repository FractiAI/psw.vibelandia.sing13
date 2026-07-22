import type {
  LatticeAgentSlot,
  LatticeExecution,
  LatticeSelfTalkStep,
  LatticeTokenSavings,
} from '@/types';

/** ~4 chars ≈ 1 token (estimate; not a billed meter). */
export function estimateTokens(text: string): number {
  const n = String(text || '').length;
  return Math.max(1, Math.ceil(n / 4));
}

const NAIVE_CORPUS_DUMP_TOKENS = 72_000; // “paste half the docs/protocols into context”
const LATTICE_RAG_POINTER_TOKENS = 1_800; // catalog pointers + rule shells, not full files
const LATTICE_NEST_OVERHEAD_TOKENS = 420; // parent↔child briefings (peer-firewall)
const HISTORY_WINDOW = 16;

type BuildArgs = {
  message: string;
  history?: Array<{ role?: string; content?: string }>;
  mode: 'edge' | 'cloud';
  resumed?: boolean;
  reply?: string;
  runId?: string | null;
  agentId?: string | null;
  usageTokens?: number | null;
};

function classifyIntent(message: string): {
  needsDocs: boolean;
  needsEdge: boolean;
  needsPipes: boolean;
  substantial: boolean;
} {
  const m = message.toLowerCase();
  const needsDocs =
    /doc|protocol|nspfrnp|paper|research|architecture|mca|seed|rag|lattice|egs|synthobs/.test(
      m,
    ) || m.length > 80;
  const needsEdge = /ui|chat|interface|vite|react|css|rail|composer|edge|brand/.test(m);
  const needsPipes = /api|sdk|cursor|vercel|server|auth|secret|token|cloud/.test(m);
  const substantial =
    needsDocs || needsEdge || needsPipes || m.split(/\s+/).length > 12 || m.length > 60;
  return { needsDocs, needsEdge, needsPipes, substantial };
}

function buildAgents(message: string, mode: 'edge' | 'cloud'): LatticeAgentSlot[] {
  const intent = classifyIntent(message);
  const agents: LatticeAgentSlot[] = [
    {
      id: 'phi-parent',
      name: 'Φ-Parent',
      role: 'Meta-optimizer · MCA outer loop',
      scale: 'Φ_EGS / outer',
      status: 'complete',
      progress: 100,
      note: 'Metabolize → crystallize children → synthesize',
    },
  ];

  if (!intent.substantial) {
    agents[0].note = 'Trivial ask — parent alone (no nest burn)';
    agents.push({
      id: 'edge-ui',
      name: 'Edge UI',
      role: 'Local history + composer (this device)',
      scale: 'edge / device',
      status: 'complete',
      progress: 100,
      note: mode === 'edge' ? 'On-device only' : 'SPA surface',
    });
    return agents;
  }

  if (intent.needsDocs) {
    agents.push({
      id: 'seed-rag',
      name: 'Seed·RAG',
      role: 'docs/ + protocols/ + research/ pointers',
      scale: 'seed / corpus',
      status: 'complete',
      progress: 100,
      note: 'Pointers not full-file dumps',
    });
  }
  if (intent.needsEdge) {
    agents.push({
      id: 'edge-ui',
      name: 'Edge UI',
      role: 'apps/ + interfaces/ (experience band)',
      scale: 'edge / UI',
      status: 'complete',
      progress: 100,
      note: 'Cytographic edge band',
    });
  }
  if (intent.needsPipes) {
    agents.push({
      id: 'pipe-runtime',
      name: 'Pipe Runtime',
      role: 'api/ + lib/ + SDK pipe',
      scale: 'center / pipes',
      status: 'complete',
      progress: 100,
      note: 'Keys stay server-side',
    });
  }
  if (agents.length < 3) {
    agents.push({
      id: 'explore-map',
      name: 'Explore Map',
      role: 'Repo cartography (explore child)',
      scale: 'inner / map',
      status: 'complete',
      progress: 100,
      note: 'Narrow paths before loading bulk context',
    });
  }

  agents.push({
    id: 'squeeze',
    name: 'Squeeze',
    role: 'Fold nested results · scale-to-zero',
    scale: 'MCA / squeeze',
    status: 'complete',
    progress: 100,
    note: 'Children report only to parent (peer-firewall)',
  });

  return agents;
}

function buildSelfTalk(args: BuildArgs, tokens: LatticeTokenSavings, agents: LatticeAgentSlot[]): LatticeSelfTalkStep[] {
  const intent = classifyIntent(args.message);
  const childNames = agents
    .filter((a) => a.id !== 'phi-parent')
    .map((a) => a.name)
    .join(', ');

  return [
    {
      id: 'metabolize',
      phase: 'Metabolize',
      voice: 'Φ-Parent',
      detail: `Ingest ask (${estimateTokens(args.message)} tok). Intent bands: docs=${intent.needsDocs} · edge=${intent.needsEdge} · pipes=${intent.needsPipes}. Mode=${args.mode}.`,
    },
    {
      id: 'crystallize',
      phase: 'Crystallize',
      voice: 'Lattice shell',
      detail: intent.substantial
        ? `Spawn nested lattice: ${childNames || 'minimal'}. Peer-firewall on — children do not mesh-sync.`
        : 'Ask is thin — skip nest burn; parent executes alone to save tokens.',
    },
    {
      id: 'rag',
      phase: 'RAG squeeze',
      voice: 'Seed·RAG',
      detail: `Refuse naive corpus dump (~${NAIVE_CORPUS_DUMP_TOKENS.toLocaleString()} tok). Use catalog pointers + rule shells (~${LATTICE_RAG_POINTER_TOKENS.toLocaleString()} tok).`,
    },
    {
      id: 'animate',
      phase: 'Animate',
      voice: args.resumed ? 'Resume pipe' : 'Fresh pipe',
      detail: args.resumed
        ? 'Resume prior agent thread — skip re-injecting full transcript preamble.'
        : `Window last ${HISTORY_WINDOW} turns only; older chat stays on the edge device.`,
    },
    {
      id: 'tokens',
      phase: 'Token ledger',
      voice: 'Lattice engine',
      detail: `Naive path ≈ ${tokens.naiveTokens.toLocaleString()} tok · Lattice path ≈ ${tokens.latticeTokens.toLocaleString()} tok · Saved ≈ ${tokens.savedTokens.toLocaleString()} tok (${tokens.savedPercent}%).`,
    },
    {
      id: 'squeeze',
      phase: 'Squeeze',
      voice: 'Φ-Parent',
      detail: `Fold child notes into one reply. Scale-to-zero idle agents. ${args.runId ? `runId=${args.runId}` : 'edge execution'} → ∞¹³`,
    },
  ];
}

function buildTokenSavings(args: BuildArgs): LatticeTokenSavings {
  const history = Array.isArray(args.history) ? args.history.slice(-HISTORY_WINDOW) : [];
  const historyText = history
    .map((m) => `${m.role || ''}: ${m.content || ''}`)
    .join('\n');
  const msgTok = estimateTokens(args.message);
  const histTok = estimateTokens(historyText);
  const replyTok = args.reply ? estimateTokens(args.reply) : 0;

  // Naive: full history (unbounded) + dump docs/protocols into every turn + answer
  const naiveHistory = Array.isArray(args.history)
    ? estimateTokens(args.history.map((m) => `${m.role}: ${m.content}`).join('\n'))
    : histTok;
  const naiveTokens =
    naiveHistory +
    NAIVE_CORPUS_DUMP_TOKENS +
    msgTok +
    Math.max(replyTok, 400);

  // Lattice: windowed history + RAG pointers + nest overhead (+ optional measured usage)
  const resumeDiscount = args.resumed ? Math.floor(histTok * 0.55) : 0;
  let latticeTokens =
    histTok +
    msgTok +
    LATTICE_RAG_POINTER_TOKENS +
    LATTICE_NEST_OVERHEAD_TOKENS +
    replyTok -
    resumeDiscount;

  if (typeof args.usageTokens === 'number' && args.usageTokens > 0) {
    // Prefer measured usage for lattice side when SDK reports it
    latticeTokens = Math.min(latticeTokens, args.usageTokens);
  }

  latticeTokens = Math.max(msgTok + 200, Math.round(latticeTokens));
  const savedTokens = Math.max(0, naiveTokens - latticeTokens);
  const savedPercent =
    naiveTokens > 0 ? Math.round((savedTokens / naiveTokens) * 1000) / 10 : 0;

  return {
    naiveTokens,
    latticeTokens,
    savedTokens,
    savedPercent,
    method:
      'Estimate: chars÷4. Naive = unbounded history + ~72k corpus dump. Lattice = 16-turn window + RAG pointers + nest briefs (resume discounts re-preamble).',
    assumptions: [
      '~4 characters ≈ 1 token (heuristic, not vendor billing)',
      `Naive corpus dump modeled at ${NAIVE_CORPUS_DUMP_TOKENS.toLocaleString()} tokens`,
      `Lattice RAG pointer budget ${LATTICE_RAG_POINTER_TOKENS.toLocaleString()} tokens`,
      `Nested briefing overhead ${LATTICE_NEST_OVERHEAD_TOKENS} tokens`,
      args.resumed ? 'Agent resume avoided re-sending full preamble' : 'Fresh agent included preamble once',
      typeof args.usageTokens === 'number' && args.usageTokens > 0
        ? `SDK usage hint: ${args.usageTokens} tokens`
        : 'No SDK usage meter on this run — estimate only',
    ],
  };
}

export function buildLatticeExecution(args: BuildArgs): LatticeExecution {
  const agents = buildAgents(args.message, args.mode);
  const tokens = buildTokenSavings(args);
  const selfTalk = buildSelfTalk(args, tokens, agents);

  return {
    engine: 'Lattice V1.618 · Nested Agent Lattice',
    mode: args.mode,
    cycle: 'Metabolize → Crystallize → Animate → Squeeze (MCA)',
    selfTalk,
    agents,
    tokens,
    organization: [
      'Edge UI holds chat history on-device (no server history store)',
      'Parent crystallizes children by scale band (seed / edge / pipes)',
      'RAG uses catalog pointers — not full docs/protocols pastes',
      'Peer-firewall: children report only to Φ-Parent',
      'Squeeze folds results; idle agents scale-to-zero',
      'Token ledger compares naive dump vs lattice path each turn',
    ],
    closedAt: new Date().toISOString(),
  };
}

/** Progressive roster while a request is in flight (edge animation). */
export function buildLiveAgentRoster(message: string, tick: number): LatticeAgentSlot[] {
  const base = buildAgents(message, 'edge');
  const phase = tick % (base.length + 1);
  return base.map((a, i) => {
    if (i < phase) {
      return { ...a, status: 'complete' as const, progress: 100 };
    }
    if (i === phase) {
      return {
        ...a,
        status: 'running' as const,
        progress: Math.min(95, 20 + (tick * 17) % 70),
        note: 'Active…',
      };
    }
    return { ...a, status: 'queued' as const, progress: 0, note: 'Waiting' };
  });
}
