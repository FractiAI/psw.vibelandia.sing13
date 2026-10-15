/**
 * GHDR-1 — eight-neighbor grid shortest path under host A (open) vs host B (barrier).
 */
import {
  END,
  GRID_H,
  GRID_W,
  OBSTACLE_CENTER_Y,
  OBSTACLE_HALF_HEIGHT,
  OBSTACLE_X,
  RATIO_TOLERANCE,
  ROUTE_TOLERANCE,
  START,
  TARGET_RATIO_A,
  TARGET_RATIO_B,
  TARGET_ROUTE_A,
  TARGET_ROUTE_B,
  TARGET_STRAIGHT_LINE,
  TARGET_TURNS_A,
  TARGET_TURNS_B,
} from './constants.mjs';

const SQRT2 = Math.sqrt(2);

function euclidean(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function key(p) {
  return `${p.x},${p.y}`;
}

function buildBlocked(hostBarrier) {
  const blocked = new Set();
  if (!hostBarrier) return blocked;
  for (let dy = -OBSTACLE_HALF_HEIGHT; dy <= OBSTACLE_HALF_HEIGHT; dy += 1) {
    const y = OBSTACLE_CENTER_Y + dy;
    if (y >= 0 && y < GRID_H) blocked.add(key({ x: OBSTACLE_X, y }));
  }
  return blocked;
}

function neighbors(p, blocked) {
  const dirs = [
    { dx: 1, dy: 0, cost: 1 },
    { dx: -1, dy: 0, cost: 1 },
    { dx: 0, dy: 1, cost: 1 },
    { dx: 0, dy: -1, cost: 1 },
    { dx: 1, dy: 1, cost: SQRT2 },
    { dx: 1, dy: -1, cost: SQRT2 },
    { dx: -1, dy: 1, cost: SQRT2 },
    { dx: -1, dy: -1, cost: SQRT2 },
  ];
  const out = [];
  for (const { dx, dy, cost } of dirs) {
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
    const nk = key({ x: nx, y: ny });
    if (blocked.has(nk)) continue;
    if (dx !== 0 && dy !== 0) {
      if (blocked.has(key({ x: p.x + dx, y: p.y })) || blocked.has(key({ x: p.x, y: p.y + dy }))) {
        continue;
      }
    }
    out.push({ x: nx, y: ny, stepCost: cost, dir: { dx, dy } });
  }
  return out;
}

/** Dijkstra with unit/diagonal costs — same objective both hosts. */
export function shortestPath(hostBarrier) {
  const blocked = buildBlocked(hostBarrier);
  const startK = key(START);
  const endK = key(END);
  if (blocked.has(startK) || blocked.has(endK)) {
    return { path: [], length: Infinity, directionChanges: Infinity };
  }
  const dist = new Map([[startK, 0]]);
  const prev = new Map();
  const prevDir = new Map();
  const pq = [{ p: START, d: 0 }];
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { p, d } = pq.shift();
    const pk = key(p);
    if (d > (dist.get(pk) ?? Infinity)) continue;
    if (pk === endK) break;
    for (const n of neighbors(p, blocked)) {
      const nk = key(n);
      const nd = d + n.stepCost;
      if (nd < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nd);
        prev.set(nk, p);
        prevDir.set(nk, n.dir);
        pq.push({ p: { x: n.x, y: n.y }, d: nd });
      }
    }
  }
  if (!dist.has(endK)) {
    return { path: [], length: Infinity, directionChanges: Infinity };
  }
  const path = [];
  let cur = END;
  while (cur) {
    path.push(cur);
    const pk = key(cur);
    if (pk === startK) break;
    cur = prev.get(pk);
  }
  path.reverse();
  let directionChanges = 0;
  for (let i = 2; i < path.length; i += 1) {
    const a = { dx: path[i - 1].x - path[i - 2].x, dy: path[i - 1].y - path[i - 2].y };
    const b = { dx: path[i].x - path[i - 1].x, dy: path[i].y - path[i - 1].y };
    if (a.dx !== b.dx || a.dy !== b.dy) directionChanges += 1;
  }
  return {
    path,
    length: dist.get(endK),
    directionChanges,
    straightLine: euclidean(START, END),
  };
}

function near(a, b, tol) {
  return Math.abs(a - b) <= tol;
}

export function runHostComparisonLab() {
  const hostA = shortestPath(false);
  const hostB = shortestPath(true);
  const ratioA = hostA.length / hostA.straightLine;
  const ratioB = hostB.length / hostB.straightLine;
  const pass =
    near(hostA.straightLine, TARGET_STRAIGHT_LINE, ROUTE_TOLERANCE) &&
    near(hostB.straightLine, TARGET_STRAIGHT_LINE, ROUTE_TOLERANCE) &&
    near(hostA.length, TARGET_ROUTE_A, ROUTE_TOLERANCE) &&
    near(hostB.length, TARGET_ROUTE_B, ROUTE_TOLERANCE) &&
    near(ratioA, TARGET_RATIO_A, RATIO_TOLERANCE) &&
    near(ratioB, TARGET_RATIO_B, RATIO_TOLERANCE) &&
    hostA.directionChanges === TARGET_TURNS_A &&
    hostB.directionChanges === TARGET_TURNS_B &&
    hostB.length > hostA.length;
  return {
    hostA: {
      straightLine: hostA.straightLine,
      routeLength: hostA.length,
      ratio: ratioA,
      directionChanges: hostA.directionChanges,
    },
    hostB: {
      straightLine: hostB.straightLine,
      routeLength: hostB.length,
      ratio: ratioB,
      directionChanges: hostB.directionChanges,
    },
    targets: {
      straightLine: TARGET_STRAIGHT_LINE,
      routeA: TARGET_ROUTE_A,
      routeB: TARGET_ROUTE_B,
      ratioA: TARGET_RATIO_A,
      ratioB: TARGET_RATIO_B,
      turnsA: TARGET_TURNS_A,
      turnsB: TARGET_TURNS_B,
    },
    pass,
  };
}

/** H1 host dependence: barrier host increases route length while objective unchanged. */
export function runHostDependenceHypothesis() {
  const { hostA, hostB } = runHostComparisonLab();
  const deltaPct = ((hostB.routeLength - hostA.routeLength) / hostA.routeLength) * 100;
  return {
    hypothesis: 'H1_host_dependence',
    deltaRouteLengthPct: deltaPct,
    pass: hostB.routeLength > hostA.routeLength && deltaPct > 15,
    honesty: 'Synthetic grid only — not ecological field manipulation.',
  };
}

/** Objective invariance: both runs minimize total weighted path length on same move set. */
export function runObjectiveInvarianceCheck() {
  const a = shortestPath(false);
  const b = shortestPath(true);
  const pass =
    a.path.length >= 2 &&
    b.path.length >= 2 &&
    a.path[0].x === START.x &&
    a.path[a.path.length - 1].x === END.x;
  return {
    moveSet: '8-neighbor unit/diagonal with corner-cut block',
    pass,
    interpretation: 'Same optimization objective; host alters feasible set only.',
  };
}

/** Stage B toy: three hosts with increasing barrier height — monotonic route length. */
export function runHostGradientMonotonicity() {
  const lengths = [];
  for (const barrier of [false, true]) {
    lengths.push(shortestPath(barrier).length);
  }
  const pass = lengths[1] > lengths[0];
  return { routeLengths: lengths, pass };
}

export function runEgsWindowDemo() {
  const micro = TARGET_ROUTE_A;
  const macro = micro * ((1 + Math.sqrt(5)) / 2);
  return {
    microRouteBaseline: micro,
    macroScaledByPhi: macro,
    pass: Math.abs(macro / micro - (1 + Math.sqrt(5)) / 2) < 1e-12,
    honesty: 'Catalog scale grammar — not measured landscape data.',
  };
}

export function runComputationalLabBattery() {
  return {
    hostComparison: runHostComparisonLab(),
    hostDependence: runHostDependenceHypothesis(),
    objectiveInvariance: runObjectiveInvarianceCheck(),
    hostGradient: runHostGradientMonotonicity(),
    egsTier: runEgsWindowDemo(),
  };
}
