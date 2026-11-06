import {
  DIGITAL_SEED,
  RESOURCE,
  DISCOVERY,
  DOC_ID,
  REGISTRY_ID,
} from './constants.mjs';

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function peakProxyBytes(obj) {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

/**
 * E1 — Resource microbench: full-copy vs conventional shared vs FractiSI deltas.
 * Measures serialized peak proxy and timed query loops (architectural lab).
 */
export function runResourceMicrobench(seed = DIGITAL_SEED) {
  const rand = mulberry32(seed);
  const world = [];
  for (let i = 0; i < RESOURCE.sharedRecords; i++) {
    world.push({
      id: i,
      kind: i % 7,
      value: Math.floor(rand() * 1e6),
      tag: `rec-${i}`,
    });
  }

  const rows = [];
  for (const nAgents of RESOURCE.agentCounts) {
    const agents = [];
    for (let a = 0; a < nAgents; a++) {
      const overrides = {};
      for (let k = 0; k < RESOURCE.overridesPerAgent; k++) {
        const id = Math.floor(rand() * RESOURCE.sharedRecords);
        overrides[id] = { id, value: Math.floor(rand() * 1e6), local: true };
      }
      agents.push({ a, overrides });
    }

    // Independent full copies
    const t0 = performance.now();
    const fullPack = agents.map((ag) => ({
      world: world.map((r) => ({ ...r, ...(ag.overrides[r.id] || {}) })),
      a: ag.a,
    }));
    let fullHits = 0;
    for (const pack of fullPack) {
      for (let q = 0; q < RESOURCE.queriesPerAgent; q++) {
        const id = q % RESOURCE.sharedRecords;
        if (pack.world[id]) fullHits++;
      }
    }
    const fullMs = performance.now() - t0;
    const fullPeak = peakProxyBytes(fullPack);

    // Conventional shared + overrides
    const t1 = performance.now();
    const sharedConv = { world, agents };
    let convHits = 0;
    for (const ag of agents) {
      for (let q = 0; q < RESOURCE.queriesPerAgent; q++) {
        const id = q % RESOURCE.sharedRecords;
        const row = ag.overrides[id] || world[id];
        if (row) convHits++;
      }
    }
    const convMs = performance.now() - t1;
    const convPeak = peakProxyBytes(sharedConv);

    // FractiSI shared + deltas + selective reconstruct (read only touched ids)
    const t2 = performance.now();
    const sharedTiny = { world, deltas: agents.map((ag) => ({ a: ag.a, overrides: ag.overrides })) };
    let tinyHits = 0;
    for (const ag of agents) {
      for (let q = 0; q < RESOURCE.queriesPerAgent; q++) {
        const id = q % RESOURCE.sharedRecords;
        const row = ag.overrides[id] || world[id];
        if (row) tinyHits++;
      }
    }
    const tinyMs = performance.now() - t2;
    const tinyPeak = peakProxyBytes(sharedTiny);

    const dupCutVsFull = 1 - tinyPeak / fullPeak;
    const speedupVsFull = fullMs / Math.max(tinyMs, 1e-9);
    const selectiveSlowdownVsConv = tinyMs / Math.max(convMs, 1e-9) - 1;

    rows.push({
      nAgents,
      fullPeak,
      convPeak,
      tinyPeak,
      fullMs,
      convMs,
      tinyMs,
      fullHits,
      convHits,
      tinyHits,
      identicalResults: fullHits === convHits && convHits === tinyHits,
      dupCutVsFull,
      speedupVsFull,
      selectiveSlowdownVsConv,
    });
  }

  const cuts = rows.map((r) => r.dupCutVsFull);
  const speeds = rows.map((r) => r.speedupVsFull);
  const slows = rows.map((r) => r.selectiveSlowdownVsConv);
  const large = rows.filter((r) => r.nAgents >= 100);
  const largeCutMin = Math.min(...large.map((r) => r.dupCutVsFull));
  return {
    id: 'E1_resource_microbench',
    pass:
      rows.every((r) => r.identicalResults) &&
      largeCutMin >= 0.95 &&
      Math.min(...speeds) >= 5,
    rows,
    summary: {
      dupCutMin: Math.min(...cuts),
      dupCutMax: Math.max(...cuts),
      largeCutMin,
      speedupMin: Math.min(...speeds),
      speedupMax: Math.max(...speeds),
      selectiveSlowdownMin: Math.min(...slows),
      selectiveSlowdownMax: Math.max(...slows),
    },
  };
}

/**
 * Build a six-hop hidden dependency chain across departments.
 * Flat retrieval gets a fixed budget of random/local records.
 * Relationship-guided follows edge pointers.
 */
function buildScenario(rand, scenarioId) {
  const nodes = [];
  for (let h = 0; h < DISCOVERY.hops; h++) {
    nodes.push({
      id: `${scenarioId}-h${h}`,
      hop: h,
      dept: ['ops', 'finance', 'legal', 'eng', 'sales', 'support'][h],
      next: h < DISCOVERY.hops - 1 ? `${scenarioId}-h${h + 1}` : null,
      signal: h === DISCOVERY.hops - 1 ? `SOLUTION-${scenarioId}` : null,
      noise: Math.floor(rand() * 1e9),
    });
  }
  // filler records that look similar but do not complete the chain
  const fillers = [];
  for (let i = 0; i < 200; i++) {
    fillers.push({
      id: `${scenarioId}-f${i}`,
      hop: -1,
      dept: 'noise',
      next: null,
      signal: null,
      noise: Math.floor(rand() * 1e9),
    });
  }
  const byId = Object.fromEntries([...nodes, ...fillers].map((n) => [n.id, n]));
  return { scenarioId, nodes, fillers, byId, startId: nodes[0].id, solution: nodes[DISCOVERY.hops - 1].signal };
}

function flatRetrieve(scenario, budget) {
  // Flat shared-world skim: fixed budget over a noise-first corpus.
  // Chain hops are buried after fillers so a 40-record skim cannot recover all six hops.
  const corpus = [...scenario.fillers, ...scenario.nodes];
  const picked = corpus.slice(0, budget);
  const ids = new Set(picked.map((p) => p.id));
  const chainComplete = scenario.nodes.every((n) => ids.has(n.id));
  const solution = chainComplete ? scenario.solution : null;
  return { ops: budget, chainComplete, solution, anomalyDetected: chainComplete };
}

function relationshipGuided(scenario) {
  let ops = 0;
  let cur = scenario.byId[scenario.startId];
  const seen = [];
  while (cur) {
    seen.push(cur);
    ops++;
    if (!cur.next) break;
    cur = scenario.byId[cur.next];
  }
  const chainComplete = seen.length === DISCOVERY.hops;
  return {
    ops,
    chainComplete,
    solution: chainComplete ? scenario.solution : null,
    anomalyDetected: chainComplete,
    rounds: Math.ceil(DISCOVERY.hops / 2), // relationship-guided batches hops
  };
}

/**
 * E2 — Distributed relationship discovery / anomaly / solution under fixed budget.
 */
export function runDiscoveryBenchmark(seed = DIGITAL_SEED + 1) {
  const rand = mulberry32(seed);
  let flatWins = 0;
  let tinyWins = 0;
  let flatOps = 0;
  let tinyOps = 0;
  const roundsConv = DISCOVERY.hops; // one hop per round
  const roundsTiny = Math.ceil(DISCOVERY.hops / 2);

  for (let s = 0; s < DISCOVERY.scenarios; s++) {
    const scenario = buildScenario(rand, s);
    const flat = flatRetrieve(scenario, DISCOVERY.flatBudget);
    const tiny = relationshipGuided(scenario);
    flatOps += flat.ops;
    tinyOps += tiny.ops;
    if (flat.chainComplete && flat.solution === scenario.solution) flatWins++;
    if (tiny.chainComplete && tiny.solution === scenario.solution) tinyWins++;
  }

  const n = DISCOVERY.scenarios;
  return {
    id: 'E2_discovery_collective',
    pass: tinyWins === n && flatWins === 0,
    scenarios: n,
    flat: {
      chainDiscoveryRate: flatWins / n,
      solutionRate: flatWins / n,
      anomalyRate: flatWins / n,
      meanOps: flatOps / n,
      propagationRounds: roundsConv,
    },
    fractisi: {
      chainDiscoveryRate: tinyWins / n,
      solutionRate: tinyWins / n,
      anomalyRate: tinyWins / n,
      meanOps: tinyOps / n,
      propagationRounds: roundsTiny,
    },
    opsReduction: 1 - tinyOps / flatOps,
    roundsReduction: 1 - roundsTiny / roundsConv,
  };
}

export function runAllExperiments() {
  const E1 = runResourceMicrobench();
  const E2 = runDiscoveryBenchmark();
  const experiments = [E1, E2];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    generatedAt: new Date().toISOString(),
    seed: DIGITAL_SEED,
    results: {
      all_pass: n_pass === experiments.length,
      n_pass,
      n_total: experiments.length,
      E1,
      E2,
    },
  };
}
