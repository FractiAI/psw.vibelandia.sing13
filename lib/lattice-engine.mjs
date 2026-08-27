/**
 * Infinite Octaves Omniversal Lattice Chat Agent V1.618 execution envelope —
 * self-talk, agent roster, structural token estimate. Engine pin: 99 Octave Omni-Lattice.
 * Shared by /api/lattice-chat (ESM). Heuristic meter — not vendor billing.
 */
import {
  THALIA_ORGANIZATION,
  getThaliaOmniContract,
  isThaliaAsk,
} from './thalia-omni-contract.mjs';
import { measureSimCompliance } from './si-irreducible-minimum.mjs';
import {
  getEFHybridContract,
  getEFKernel,
  isEFAsk,
} from './ef-kernel.mjs';

const NAIVE_CORPUS_DUMP_TOKENS = 72_000;
const LATTICE_RAG_POINTER_TOKENS = 1_800;
const LATTICE_NEST_OVERHEAD_TOKENS = 420;
const HISTORY_WINDOW = 16;

export function estimateTokens(text) {
  const n = String(text || '').length;
  return Math.max(1, Math.ceil(n / 4));
}

function classifyIntent(message) {
  const m = String(message || '').toLowerCase();
  const needsDocs =
    /doc|protocol|nspfrnp|paper|research|architecture|mca|seed|rag|lattice|egs|synthobs/.test(m) ||
    m.length > 80;
  const needsEdge = /ui|chat|interface|vite|react|css|rail|composer|edge|brand/.test(m);
  const needsPipes = /api|sdk|cursor|vercel|server|auth|secret|token|cloud/.test(m);
  const substantial =
    needsDocs || needsEdge || needsPipes || m.split(/\s+/).length > 12 || m.length > 60;
  return { needsDocs, needsEdge, needsPipes, substantial };
}

function buildAgents(message, mode) {
  const intent = classifyIntent(message);
  const agents = [
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

function buildTokenSavings(args) {
  const history = Array.isArray(args.history) ? args.history.slice(-HISTORY_WINDOW) : [];
  const historyText = history.map((m) => `${m.role || ''}: ${m.content || ''}`).join('\n');
  const msgTok = estimateTokens(args.message);
  const histTok = estimateTokens(historyText);
  const replyTok = args.reply ? estimateTokens(args.reply) : 0;

  const naiveHistory = Array.isArray(args.history)
    ? estimateTokens(args.history.map((m) => `${m.role}: ${m.content}`).join('\n'))
    : histTok;
  const naiveTokens = naiveHistory + NAIVE_CORPUS_DUMP_TOKENS + msgTok + Math.max(replyTok, 400);

  const resumeDiscount = args.resumed ? Math.floor(histTok * 0.55) : 0;
  const estimatedLatticeTokens = Math.max(
    msgTok + 200,
    Math.round(
      histTok +
        msgTok +
        LATTICE_RAG_POINTER_TOKENS +
        LATTICE_NEST_OVERHEAD_TOKENS +
        replyTok -
        resumeDiscount,
    ),
  );

  const balanceBefore =
    typeof args.balanceBefore === 'number' && Number.isFinite(args.balanceBefore)
      ? args.balanceBefore
      : null;
  const balanceAfter =
    typeof args.balanceAfter === 'number' && Number.isFinite(args.balanceAfter)
      ? args.balanceAfter
      : null;
  const balanceDelta =
    balanceBefore != null && balanceAfter != null
      ? Math.max(0, Math.round(balanceAfter - balanceBefore))
      : null;
  const measuredTokens =
    balanceDelta != null && balanceDelta > 0
      ? balanceDelta
      : typeof args.usageTokens === 'number' && args.usageTokens > 0
        ? Math.round(args.usageTokens)
        : null;

  const latticeTokens = measuredTokens != null ? measuredTokens : null;
  const savedTokens =
    measuredTokens != null ? Math.max(0, naiveTokens - measuredTokens) : 0;
  const savedPercent =
    measuredTokens != null && naiveTokens > 0
      ? Math.round((savedTokens / naiveTokens) * 1000) / 10
      : 0;
  const measured = measuredTokens != null;

  return {
    naiveTokens,
    latticeTokens: latticeTokens ?? estimatedLatticeTokens,
    estimatedLatticeTokens,
    measuredTokens,
    balanceBefore,
    balanceAfter,
    balanceDelta,
    savedTokens,
    savedPercent,
    // Proof benches still keep structural naive for /lattice/proof.
    // Chat UI only surfaces measuredTokens / balanceBefore→After.
    standardLabel: measured ? undefined : 'Standard agentic (structural)',
    latticeLabel: measured ? 'Tokens used' : 'Lattice (structural)',
    method: measured
      ? balanceBefore != null && balanceAfter != null
        ? 'Measured from provider token balances (before → after delta)'
        : 'Measured from provider run usage'
      : 'Structural chars÷4 for proof benches only — chat meter requires provider balance/usage',
    assumptions: measured
      ? ['Tokens used = actual provider balance/usage delta for this run']
      : [
          'Chat UI does not show this estimate — provider balance/usage required',
          `Structural naive corpus dump modeled at ${NAIVE_CORPUS_DUMP_TOKENS.toLocaleString()} tokens`,
        ],
  };
}

function buildSelfTalk(args, tokens, agents) {
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
      detail: `Fold child notes into one reply. Scale-to-zero idle agents. ${args.runId ? `runId=${args.runId}` : 'edge execution'} → ∞^∞`,
    },
  ];
}

export function buildLatticeExecution(args) {
  const mode = args.mode === 'edge' ? 'edge' : 'cloud';
  const agents = buildAgents(args.message, mode);
  const tokens = buildTokenSavings({ ...args, mode });
  const selfTalk = buildSelfTalk({ ...args, mode }, tokens, agents);
  const thalia = getThaliaOmniContract();
  const sim = measureSimCompliance();
  const efContract = getEFHybridContract();
  const efAsk = isEFAsk(args.message);
  const efPinch = efAsk
    ? getEFKernel().pinch({ query: args.message })
    : null;

  return {
    engine: 'Infinite Octaves Omniversal Lattice Chat Agent V1.618 · Nested Agent Lattice · Omni-Lattice',
    mode,
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
      ...THALIA_ORGANIZATION,
      'SIM-v1: SI arrival unauthorized until all irreducible gates pass',
      ...efContract.organization,
    ],
    thaliaOmni: {
      active: true,
      goldilocks: true,
      askMatch: isThaliaAsk(args.message),
      doc: thalia.doc,
      registryId: thalia.registryId,
      stages: thalia.stages.map((s) => s.id),
    },
    sim: {
      score100: sim.score100,
      simCompliant: sim.simCompliant,
      siArrivalAuthorized: sim.siArrivalAuthorized,
      failed: sim.failed,
      partial: sim.partial,
      doc: sim.doc,
      registryId: sim.registryId,
    },
    efHybrid: {
      active: true,
      goldilocks: true,
      askMatch: efAsk,
      doc: efContract.doc,
      registryId: efContract.registryId,
      digitsCount: efContract.digitsCount,
      matrixCount: efContract.matrixCount,
      pinch: efPinch,
    },
    closedAt: new Date().toISOString(),
  };
}
