/**
 * Honeycomb Lattice — hex-grid relationships / dependencies / pathways.
 * Implemented as an axial hex graph (not decorative).
 */
const HEX_DIRS = Object.freeze([
  [+1, 0],
  [+1, -1],
  [0, -1],
  [-1, 0],
  [-1, +1],
  [0, +1],
]);

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function parseHexKey(k) {
  const [q, r] = k.split(',').map(Number);
  return { q, r };
}

export function createHoneycomb({ radius = 3, nodePayload = null } = {}) {
  const nodes = new Map();
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) > radius) continue;
      const key = hexKey(q, r);
      nodes.set(key, {
        q,
        r,
        key,
        payload: nodePayload ? nodePayload(q, r) : null,
        neighbors: [],
      });
    }
  }
  for (const node of nodes.values()) {
    for (const [dq, dr] of HEX_DIRS) {
      const nk = hexKey(node.q + dq, node.r + dr);
      if (nodes.has(nk)) node.neighbors.push(nk);
    }
  }
  return { kind: 'HoneycombLattice', radius, nodes, size: nodes.size };
}

export function hexDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

/** BFS shortest pathway between two hex keys. */
export function shortestPathway(lattice, fromKey, toKey) {
  if (!lattice.nodes.has(fromKey) || !lattice.nodes.has(toKey)) return null;
  if (fromKey === toKey) return [fromKey];
  const q = [fromKey];
  const prev = new Map([[fromKey, null]]);
  while (q.length) {
    const cur = q.shift();
    const node = lattice.nodes.get(cur);
    for (const n of node.neighbors) {
      if (prev.has(n)) continue;
      prev.set(n, cur);
      if (n === toKey) {
        const path = [toKey];
        let p = cur;
        while (p != null) {
          path.push(p);
          p = prev.get(p);
        }
        return path.reverse();
      }
      q.push(n);
    }
  }
  return null;
}

export function attachPayload(lattice, key, payload) {
  const n = lattice.nodes.get(key);
  if (!n) return false;
  n.payload = payload;
  return true;
}

export function gatherNeighborhood(lattice, key, ring = 1) {
  const origin = lattice.nodes.get(key);
  if (!origin) return [];
  const out = [];
  for (const n of lattice.nodes.values()) {
    if (hexDistance(origin, n) <= ring) out.push(n);
  }
  return out;
}
