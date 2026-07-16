/**
 * Harmonopoly · flat vs nested agent token simulation
 * 100,000 concurrent players — model only (not live LLM billing).
 *
 * Honesty: counts are derived from explicit assumptions below.
 * They compare topology cost, not measured OpenAI/Anthropic invoices.
 *
 * Run: node scripts/harmonopoly-token-sim.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const PHI = 1.618033988749895;
const PLAYERS = 100_000;
const TABLE_SIZE = 4; // hot-seat Goldilocks table
const TABLES = PLAYERS / TABLE_SIZE;
const ROUNDS = 1; // one full “everyone takes a Check the Sun” wave

/** Tokens assumed per agent message (in = prompt+context, out = completion). */
const FLAT = {
  /** Each of T players has 3 peer agents (solar/trade/surge) that sync with every other agent. */
  agentsPerPlayer: 3,
  /** Context stuffed with peer history — typical flat multi-agent tax. */
  tokensInPerLink: 900,
  tokensOutPerLink: 180,
};

const NESTED = {
  /** Outer Table Master + at most 1 awake leaf (Goldilocks). */
  outerIn: 140,
  outerOut: 48,
  leafIn: 220,
  leafOut: 90,
  /** Frozen micro-snapshots: metadata only — no LLM tokens. */
  frozenTokenCost: 0,
  maxChildren: Math.round(PHI + 1), // 3
};

function flatLinks(agentCount) {
  return (agentCount * (agentCount - 1)) / 2;
}

function simulate() {
  const flatAgentsPerTable = TABLE_SIZE * FLAT.agentsPerPlayer;
  const flatLinksPerTable = flatLinks(flatAgentsPerTable);
  /** One sync round: every undirected link fires once each direction ≈ ×2 for in/out accounting per hop. */
  const flatMessagesPerTablePerRound = flatLinksPerTable * 2;

  const flatInPerTable = flatMessagesPerTablePerRound * FLAT.tokensInPerLink;
  const flatOutPerTable = flatMessagesPerTablePerRound * FLAT.tokensOutPerLink;
  const flatInTotal = flatInPerTable * TABLES * ROUNDS;
  const flatOutTotal = flatOutPerTable * TABLES * ROUNDS;

  /** Nested: per player turn = 1 outer + 1 leaf; one wave = TABLE_SIZE turns per table. */
  const nestCallsPerTablePerRound = TABLE_SIZE; // each player Checks the Sun once
  const nestInPerTurn = NESTED.outerIn + NESTED.leafIn;
  const nestOutPerTurn = NESTED.outerOut + NESTED.leafOut;
  const nestInPerTable = nestCallsPerTablePerRound * nestInPerTurn;
  const nestOutPerTable = nestCallsPerTablePerRound * nestOutPerTurn;
  const nestInTotal = nestInPerTable * TABLES * ROUNDS;
  const nestOutTotal = nestOutPerTable * TABLES * ROUNDS;

  const flatTotal = flatInTotal + flatOutTotal;
  const nestTotal = nestInTotal + nestOutTotal;
  const saveRatio = flatTotal / nestTotal;
  const savePct = (1 - nestTotal / flatTotal) * 100;

  return {
    schema: 'harmonopoly-token-sim/v1',
    issuedAt: new Date().toISOString(),
    honestyBoundary: {
      tier: 'simulation_model',
      claims:
        'Token totals are topology estimates from documented assumptions — not live vendor invoices or instrumented LLM traces.',
      notClaimed: [
        'Production latency ms from §5 of nested-agent papers',
        'Exact OpenAI/Anthropic billing for 100k concurrent sessions',
      ],
    },
    assumptions: {
      concurrentPlayers: PLAYERS,
      tableSize: TABLE_SIZE,
      tables: TABLES,
      rounds: ROUNDS,
      phi: PHI,
      nestedMaxChildren: NESTED.maxChildren,
      flat: FLAT,
      nested: NESTED,
      narrative:
        'One wave = every concurrent player takes one Check-the-Sun equivalent. Flat = 12 peer agents per 4-player table fully mesh-sync. Nested = Table Master + one awake leaf per turn; other leaves frozen at 0 LLM tokens.',
    },
    flat: {
      agentsPerTable: flatAgentsPerTable,
      undirectedLinksPerTable: flatLinksPerTable,
      messagesPerTablePerRound: flatMessagesPerTablePerRound,
      tokensInPerTable: flatInPerTable,
      tokensOutPerTable: flatOutPerTable,
      tokensInTotal: flatInTotal,
      tokensOutTotal: flatOutTotal,
      tokensTotal: flatTotal,
      formulaLinks: 'C_flat = N_agents(N_agents - 1)/2',
    },
    nested: {
      awakeAgentsPerTurn: 2,
      frozenLeaves: NESTED.maxChildren - 1,
      tokensInPerTurn: nestInPerTurn,
      tokensOutPerTurn: nestOutPerTurn,
      tokensInPerTable: nestInPerTable,
      tokensOutPerTable: nestOutPerTable,
      tokensInTotal: nestInTotal,
      tokensOutTotal: nestOutTotal,
      tokensTotal: nestTotal,
      scaleLaw: 'Scale_parent = φ · Scale_child',
      flatPeerLinks: 0,
    },
    comparison: {
      nestedVsFlatTotalRatio: Number((nestTotal / flatTotal).toFixed(6)),
      flatVsNestedSavingsFactor: Number(saveRatio.toFixed(2)),
      percentTokensSavedVsFlat: Number(savePct.toFixed(2)),
      tokensSaved: flatTotal - nestTotal,
      plainSpeak: `At ${PLAYERS.toLocaleString()} concurrent players (tables of ${TABLE_SIZE}), one full wave: nested uses about ${saveRatio.toFixed(0)}× fewer tokens than a flat peer mesh — helpers sleep when idle.`,
    },
  };
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

const report = simulate();
const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, '../research/harmonopoly-nested-token-sim/data');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'token_sim_100k.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('Harmonopoly token sim · 100k concurrent players');
console.log('Flat  in/out/total:', fmt(report.flat.tokensInTotal), fmt(report.flat.tokensOutTotal), fmt(report.flat.tokensTotal));
console.log('Nest  in/out/total:', fmt(report.nested.tokensInTotal), fmt(report.nested.tokensOutTotal), fmt(report.nested.tokensTotal));
console.log('Savings factor (flat/nest):', report.comparison.flatVsNestedSavingsFactor);
console.log('Wrote', outPath);
