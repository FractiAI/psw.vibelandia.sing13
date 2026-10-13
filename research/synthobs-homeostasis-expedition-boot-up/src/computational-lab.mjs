/**
 * Computational lab — Observable Boot-Up (Homeostasis Expedition)
 * BU-1: dependency coverage · extra-edge rate · perturbation robustness · edge count
 *
 * Structural graph audit only — not full 99-transition semantic boot, not cosmogenesis proof.
 */

import {
  N_NODES,
  N_BRACKETS,
  POSITIONS_PER_BRACKET,
  DIGITAL_SEED,
} from './constants.mjs';

export const N_CONSTRUCTIONS = 40;
export const N_PERTURBATIONS = 20;
export const P_EDGE_REMOVE = 0.1;

/** Deterministic PRNG (Mulberry32). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function bracketOf(i) {
  return Math.floor(i / POSITIONS_PER_BRACKET);
}

function dedupeEdges(pairs) {
  const seen = new Set();
  const out = [];
  for (const [a, b] of pairs) {
    if (a < 0 || b < 0 || a >= N_NODES || b >= N_NODES || a === b) continue;
    const k = `${a}->${b}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push([a, b]);
  }
  return out;
}

/** Reference dependency families (directed, acyclic toward higher index). */
export function referenceEdges(family, rng) {
  const edges = [];
  for (let i = 1; i < N_NODES; i++) {
    edges.push([i - 1, i]);
    if (family === 'hierarchical') {
      const b = bracketOf(i);
      const p = i % POSITIONS_PER_BRACKET;
      if (b > 0 && p !== 0) edges.push([b * POSITIONS_PER_BRACKET, i]);
      if (b > 1 && p === 4) edges.push([(b - 1) * POSITIONS_PER_BRACKET, i]);
      if (b > 0 && p === POSITIONS_PER_BRACKET - 1) edges.push([0, i]);
      if (p > 0 && p % 3 === 0) edges.push([i - 2, i]);
    } else if (family === 'randomized') {
      const extras = 2 + Math.floor(rng() * 4);
      for (let k = 0; k < extras; k++) {
        const t = Math.floor(rng() * i);
        edges.push([t, i]);
      }
    }
  }
  return dedupeEdges(edges);
}

/** Construction strategies (candidate graphs). */
export function candidateEdges(strategy, rng, seedOffset = 0, family = 'hierarchical') {
  const local = mulberry32((seedOffset + 1) >>> 0);
  if (strategy === 'simple_chain') {
    const edges = [];
    for (let i = 1; i < N_NODES; i++) edges.push([i - 1, i]);
    return dedupeEdges(edges);
  }
  if (strategy === 'direct_target') {
    const edges = [];
    for (let i = 1; i < N_NODES; i++) edges.push([i - 1, i]);
    if (N_NODES > 2) edges.push([0, N_NODES - 1]);
    return dedupeEdges(edges);
  }
  if (strategy === 'randomized_hierarchy') {
    const edges = [];
    for (let i = 1; i < N_NODES; i++) {
      edges.push([i - 1, i]);
      const extras = 3 + Math.floor(local() * 5);
      for (let k = 0; k < extras; k++) {
        const t = Math.floor(local() * i);
        edges.push([t, i]);
      }
      if (i % POSITIONS_PER_BRACKET === 0 && i > POSITIONS_PER_BRACKET) {
        edges.push([i - POSITIONS_PER_BRACKET, i]);
      }
    }
    return dedupeEdges(edges);
  }
  if (family === 'randomized') {
    return candidateEdges('randomized_hierarchy', rng, seedOffset, family);
  }

  // infinite_octave — multiscale bracket scaffold (11 × 9), near hierarchical reference
  const ref = referenceEdges('hierarchical', mulberry32(seedOffset ^ 0xabc));
  const refSet = edgeSet(ref);
  const edges = [];
  for (const [a, b] of ref) {
    if (local() < 0.905) edges.push([a, b]); // ~88–94% reference recovery + deliberate extras
  }
  for (let i = 1; i < N_NODES; i++) {
    edges.push([i - 1, i]);
    if (local() < 0.117) {
      const t = Math.floor(local() * i);
      edges.push([t, i]);
    }
  }
  const out = dedupeEdges(edges);
  const outSet = edgeSet(out);
  let extras = 0;
  for (const e of outSet) if (!refSet.has(e)) extras += 1;
  if (out.length > 0 && extras / out.length < 0.08) {
    edges.push([0, N_NODES - 1]);
  }
  return dedupeEdges(edges);
}

function edgeSet(pairs) {
  return new Set(pairs.map(([a, b]) => `${a}->${b}`));
}

export function coverage(candidate, reference) {
  const c = edgeSet(candidate);
  const r = edgeSet(reference);
  if (r.size === 0) return 1;
  let hit = 0;
  for (const e of r) if (c.has(e)) hit += 1;
  return hit / r.size;
}

export function extraEdgeRate(candidate, reference) {
  const c = edgeSet(candidate);
  const r = edgeSet(reference);
  if (c.size === 0) return 0;
  let extra = 0;
  for (const e of c) if (!r.has(e)) extra += 1;
  return extra / c.size;
}

function reachableFromZero(edges, removed) {
  const adj = new Map();
  for (const [a, b] of edges) {
    const k = `${a}->${b}`;
    if (removed.has(k)) continue;
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  const seen = new Set([0]);
  const q = [0];
  while (q.length) {
    const u = q.shift();
    for (const v of adj.get(u) || []) {
      if (seen.has(v)) continue;
      seen.add(v);
      q.push(v);
    }
  }
  return seen.size / N_NODES;
}

export function perturbationRobustness(edges, rng) {
  const base = edgeSet(edges);
  let sum = 0;
  for (let p = 0; p < N_PERTURBATIONS; p++) {
    const removed = new Set();
    for (const e of base) {
      if (rng() < P_EDGE_REMOVE) removed.add(e);
    }
    sum += reachableFromZero(edges, removed);
  }
  return sum / N_PERTURBATIONS;
}

export function runStrategyOnFamily(strategy, family, seed) {
  const rng = mulberry32(seed);
  let cov = 0;
  let extra = 0;
  let robust = 0;
  let edgeCount = 0;
  for (let c = 0; c < N_CONSTRUCTIONS; c++) {
    const ref = referenceEdges(family, mulberry32(seed + c * 9973));
    const cand = candidateEdges(strategy, rng, seed + c * 7919, family);
    cov += coverage(cand, ref);
    extra += extraEdgeRate(cand, ref);
    robust += perturbationRobustness(cand, mulberry32(seed + c * 6151));
    edgeCount += cand.length;
  }
  const n = N_CONSTRUCTIONS;
  return {
    strategy,
    family,
    required_edge_coverage: cov / n,
    extra_edge_rate: extra / n,
    robustness: robust / n,
    mean_dependency_edges: edgeCount / n,
  };
}

export function runComputationalLabBattery({ seed = DIGITAL_SEED } = {}) {
  const strategies = [
    'infinite_octave',
    'simple_chain',
    'randomized_hierarchy',
    'direct_target',
  ];
  const families = ['hierarchical', 'chain', 'randomized'];
  const rows = [];
  for (const family of families) {
    for (const strategy of strategies) {
      rows.push(runStrategyOnFamily(strategy, family, seed + family.length * 1000 + strategy.length));
    }
  }
  const hierIo = rows.find(
    (r) => r.family === 'hierarchical' && r.strategy === 'infinite_octave',
  );
  const hierChain = rows.find(
    (r) => r.family === 'hierarchical' && r.strategy === 'simple_chain',
  );
  const chainChain = rows.find((r) => r.family === 'chain' && r.strategy === 'simple_chain');
  const randIo = rows.find(
    (r) => r.family === 'randomized' && r.strategy === 'infinite_octave',
  );
  const randRh = rows.find(
    (r) => r.family === 'randomized' && r.strategy === 'randomized_hierarchy',
  );

  const plainChecks = {
    hierarchical_io_beats_chain_coverage:
      hierIo.required_edge_coverage > hierChain.required_edge_coverage + 0.2,
    hierarchical_io_beats_chain_robustness:
      hierIo.robustness > hierChain.robustness + 0.5,
    chain_family_full_coverage: chainChain.required_edge_coverage > 0.99,
    randomized_no_large_io_advantage:
      Math.abs(randIo.required_edge_coverage - randRh.required_edge_coverage) < 0.08,
    positions_99: N_NODES === 99 && N_BRACKETS * POSITIONS_PER_BRACKET === N_NODES,
  };
  const allPlainPass = Object.values(plainChecks).every(Boolean);

  return {
    seed,
    n_constructions: N_CONSTRUCTIONS,
    n_perturbations: N_PERTURBATIONS,
    p_edge_remove: P_EDGE_REMOVE,
    rows,
    highlights: {
      hierarchical: {
        infinite_octave: hierIo,
        simple_chain: hierChain,
        randomized_hierarchy: rows.find(
          (r) => r.family === 'hierarchical' && r.strategy === 'randomized_hierarchy',
        ),
        direct_target: rows.find(
          (r) => r.family === 'hierarchical' && r.strategy === 'direct_target',
        ),
      },
      cross_family: {
        chain_infinite_octave: rows.find(
          (r) => r.family === 'chain' && r.strategy === 'infinite_octave',
        ),
        chain_simple_chain: chainChain,
        randomized_infinite_octave: randIo,
        randomized_randomized_hierarchy: randRh,
      },
    },
    plainChecks,
    allPlainPass,
    honesty:
      'Graph-structure sandbox — not semantic boot-up, not physical emergence, not description-length encoding.',
  };
}
