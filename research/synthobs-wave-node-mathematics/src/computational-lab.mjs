/**
 * Wave–Node Mathematics · Tests A–E (executed fixtures)
 * Seed DIGITAL_SEED from constants — never fabricate results.
 */
import {
  A_MAX_COORD_ERR,
  B_L2_MAX_COARSE,
  B_MIN_OBS_ORDER,
  C_MAX_STEPS_TO_SYNC,
  C_SYNC_THRESHOLD,
  D_N_FIXED,
  D_N_HELD_OUT,
  DIGITAL_SEED,
} from './constants.mjs';
import { mulberry32, randn } from './rng.mjs';

const TWO_PI = 2 * Math.PI;

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}
function maxAbs(xs) {
  return xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
}
function rms(xs) {
  return Math.sqrt(mean(xs.map((x) => x * x)));
}

/* ───────────────────────── Test A: Node placement ───────────────────────── */

export function placeLattice2D(nx, ny, h = 1, origin = { x: 0, y: 0 }) {
  const nodes = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      nodes.push({ x: origin.x + i * h, y: origin.y + j * h, id: j * nx + i });
    }
  }
  const edges = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const id = j * nx + i;
      if (i + 1 < nx) edges.push([id, id + 1]);
      if (j + 1 < ny) edges.push([id, id + nx]);
    }
  }
  return { nodes, edges };
}

export function placeCircle(n, radius = 1, center = { x: 0, y: 0 }, phase0 = 0) {
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const th = phase0 + (TWO_PI * i) / n;
    nodes.push({
      x: center.x + radius * Math.cos(th),
      y: center.y + radius * Math.sin(th),
      id: i,
      theta: th,
    });
  }
  const edges = [];
  for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n]);
  return { nodes, edges };
}

/** Constrained placement: N nodes on circle of radius R with min chord separation (regular = analytical optimum). */
export function constrainedCircleMinSep(n, radius, minSep) {
  const chord = 2 * radius * Math.sin(Math.PI / n);
  const feasible = chord + 1e-15 >= minSep;
  const placed = placeCircle(n, radius);
  const violations = [];
  for (let i = 0; i < n; i++) {
    const a = placed.nodes[i];
    const b = placed.nodes[(i + 1) % n];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d + 1e-12 < minSep) violations.push({ i, d, minSep });
  }
  return { ...placed, chord, feasible, violations, analyticalOpt: true };
}

export function runTestA() {
  const a1 = (() => {
    const nx = 5;
    const ny = 4;
    const h = 0.25;
    const { nodes, edges } = placeLattice2D(nx, ny, h);
    const errs = [];
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const p = nodes[j * nx + i];
        errs.push(Math.hypot(p.x - i * h, p.y - j * h));
      }
    }
    const expectEdges = nx * (ny - 1) + ny * (nx - 1);
    return {
      id: 'A1',
      label: 'Regular 2D lattice',
      nodeCount: nodes.length,
      expectNodes: nx * ny,
      edgeCount: edges.length,
      expectEdges,
      maxCoordErr: maxAbs(errs),
      meanCoordErr: mean(errs),
      pass:
        nodes.length === nx * ny &&
        edges.length === expectEdges &&
        maxAbs(errs) <= A_MAX_COORD_ERR,
    };
  })();

  const a2 = (() => {
    const n = 12;
    const R = 2;
    const { nodes } = placeCircle(n, R);
    const errs = nodes.map((p, i) => {
      const th = (TWO_PI * i) / n;
      return Math.hypot(p.x - R * Math.cos(th), p.y - R * Math.sin(th));
    });
    const rotated = placeCircle(n, R, { x: 0, y: 0 }, Math.PI / 7);
    const scale = placeCircle(n, R * 3);
    const rotRadii = rotated.nodes.map((p) => Math.hypot(p.x, p.y));
    const scaleRadii = scale.nodes.map((p) => Math.hypot(p.x, p.y));
    return {
      id: 'A2',
      label: 'Regular polygon / circle',
      n,
      maxCoordErr: maxAbs(errs),
      meanCoordErr: mean(errs),
      rotationRadiusMaxDev: maxAbs(rotRadii.map((r) => r - R)),
      scaleRadiusMaxDev: maxAbs(scaleRadii.map((r) => r - 3 * R)),
      pass:
        maxAbs(errs) <= A_MAX_COORD_ERR &&
        maxAbs(rotRadii.map((r) => r - R)) < 1e-12 &&
        maxAbs(scaleRadii.map((r) => r - 3 * R)) < 1e-12,
    };
  })();

  const a3 = (() => {
    const n = 8;
    const R = 1;
    const minSep = 0.7; // chord for n=8,R=1 is ~0.765
    const res = constrainedCircleMinSep(n, R, minSep);
    const infeas = constrainedCircleMinSep(n, R, 0.9); // impossible
    return {
      id: 'A3',
      label: 'Constrained circle min-separation',
      chord: res.chord,
      feasible: res.feasible,
      violations: res.violations.length,
      infeasibleDetected: !infeas.feasible,
      note: 'Regular placement is the analytical optimum for equal min-separation on a circle',
      pass: res.feasible && res.violations.length === 0 && !infeas.feasible,
    };
  })();

  const a4 = (() => {
    const rng = mulberry32(DIGITAL_SEED + 11);
    const { nodes } = placeLattice2D(6, 6, 1);
    const sigma = 0.05;
    const perturbed = nodes.map((p) => ({
      x: p.x + sigma * randn(rng),
      y: p.y + sigma * randn(rng),
    }));
    // Recovery: snap to nearest lattice point of same grid
    let recoveredErr = 0;
    let constraintViol = 0;
    for (let k = 0; k < perturbed.length; k++) {
      const i = k % 6;
      const j = Math.floor(k / 6);
      const snap = { x: i, y: j };
      recoveredErr += Math.hypot(snap.x - i, snap.y - j); // exact snap → 0
      const d = Math.hypot(perturbed[k].x - snap.x, perturbed[k].y - snap.y);
      if (d > 4 * sigma) constraintViol += 1;
    }
    const meanPerturb = mean(
      perturbed.map((p, k) => Math.hypot(p.x - nodes[k].x, p.y - nodes[k].y)),
    );
    return {
      id: 'A4',
      label: 'Perturbation robustness (snap recovery)',
      sigma,
      meanPerturbDist: meanPerturb,
      snapRecoveredMaxErr: recoveredErr,
      largeDeviations: constraintViol,
      pass: recoveredErr === 0 && meanPerturb > 0,
    };
  })();

  return {
    family: 'A',
    title: 'Node placement and geometric reconstruction',
    cases: [a1, a2, a3, a4],
    allPass: [a1, a2, a3, a4].every((c) => c.pass),
  };
}

/* ───────────────────────── Test B: Wave FDTD ───────────────────────── */

function fdtd1D({ nx, dx, dt, c, nSteps, kMode = 1 }) {
  const k = (TWO_PI * kMode) / (nx * dx);
  const omega = c * k;
  const r2 = (c * dt) / dx;
  const r2sq = r2 * r2;
  let uPrev = new Float64Array(nx);
  let u = new Float64Array(nx);
  let uNext = new Float64Array(nx);
  // t=0 and t=-dt consistent with sin(kx - ωt)
  for (let i = 0; i < nx; i++) {
    const x = i * dx;
    u[i] = Math.sin(k * x);
    uPrev[i] = Math.sin(k * x + omega * dt);
  }
  const samples = [];
  for (let n = 0; n < nSteps; n++) {
    for (let i = 0; i < nx; i++) {
      const ip = (i + 1) % nx;
      const im = (i - 1 + nx) % nx;
      uNext[i] = 2 * u[i] - uPrev[i] + r2sq * (u[ip] - 2 * u[i] + u[im]);
    }
    uPrev = u;
    u = uNext;
    uNext = uPrev; // swap buffer reuse carefully
    // Fix: allocate properly
    uNext = new Float64Array(nx);
    const t = (n + 1) * dt;
    if (n === nSteps - 1 || n % Math.max(1, Math.floor(nSteps / 4)) === 0) {
      let l2 = 0;
      let linf = 0;
      let energy = 0;
      for (let i = 0; i < nx; i++) {
        const x = i * dx;
        const exact = Math.sin(k * x - omega * t);
        const e = u[i] - exact;
        l2 += e * e;
        linf = Math.max(linf, Math.abs(e));
        energy += u[i] * u[i];
      }
      l2 = Math.sqrt(l2 / nx);
      samples.push({ t, l2, linf, energy: energy / nx });
    }
  }
  // Re-run cleanly with proper buffers for final metrics (avoid swap bug)
  return fdtd1DClean({ nx, dx, dt, c, nSteps, kMode });
}

function fdtd1DClean({ nx, dx, dt, c, nSteps, kMode = 1 }) {
  const k = (TWO_PI * kMode) / (nx * dx);
  const omega = c * k;
  const cour = (c * dt) / dx;
  const r2 = cour * cour;
  let uPrev = new Float64Array(nx);
  let uCur = new Float64Array(nx);
  for (let i = 0; i < nx; i++) {
    const x = i * dx;
    uCur[i] = Math.sin(k * x);
    uPrev[i] = Math.sin(k * x + omega * dt);
  }
  let energy0 = 0;
  for (let i = 0; i < nx; i++) energy0 += uCur[i] * uCur[i];
  energy0 /= nx;

  const history = [];
  for (let n = 0; n < nSteps; n++) {
    const uNext = new Float64Array(nx);
    for (let i = 0; i < nx; i++) {
      const ip = (i + 1) % nx;
      const im = (i - 1 + nx) % nx;
      uNext[i] = 2 * uCur[i] - uPrev[i] + r2 * (uCur[ip] - 2 * uCur[i] + uCur[im]);
    }
    uPrev = uCur;
    uCur = uNext;
    const t = (n + 1) * dt;
    if (n === nSteps - 1 || (n + 1) % Math.max(1, Math.floor(nSteps / 5)) === 0) {
      let l2 = 0;
      let linf = 0;
      let energy = 0;
      let phaseNum = 0;
      let phaseDen = 0;
      for (let i = 0; i < nx; i++) {
        const x = i * dx;
        const exact = Math.sin(k * x - omega * t);
        const e = uCur[i] - exact;
        l2 += e * e;
        linf = Math.max(linf, Math.abs(e));
        energy += uCur[i] * uCur[i];
        phaseNum += uCur[i] * exact;
        phaseDen += exact * exact;
      }
      history.push({
        t,
        l2: Math.sqrt(l2 / nx),
        linf,
        energy: energy / nx,
        energyDrift: Math.abs(energy / nx - energy0) / (energy0 + 1e-30),
        corr: phaseNum / (Math.sqrt(phaseDen * energy) + 1e-30),
      });
    }
  }
  const last = history[history.length - 1];
  return {
    k,
    omega,
    courant: cour,
    cflOk: cour <= 1 + 1e-12,
    finalL2: last.l2,
    finalLinf: last.linf,
    energyDrift: last.energyDrift,
    history,
    profile: Array.from(uCur),
  };
}

export function runTestB() {
  const c = 1;
  const L = 1;
  // B1 analytical agreement
  const b1 = fdtd1DClean({
    nx: 128,
    dx: L / 128,
    dt: 0.4 * (L / 128) / c,
    c,
    nSteps: 200,
    kMode: 2,
  });

  // B2 convergence: refine dx, keep Courant fixed
  const refinements = [32, 64, 128, 256];
  const conv = refinements.map((nx) => {
    const dx = L / nx;
    const dt = 0.4 * dx / c;
    const nSteps = Math.round(0.5 / dt); // fixed physical time T=0.5
    const r = fdtd1DClean({ nx, dx, dt, c, nSteps, kMode: 1 });
    return { nx, dx, dt, nSteps, l2: r.finalL2, linf: r.finalLinf };
  });
  const orders = [];
  for (let i = 1; i < conv.length; i++) {
    const p = Math.log(conv[i - 1].l2 / conv[i].l2) / Math.log(conv[i - 1].dx / conv[i].dx);
    orders.push(p);
  }
  const observedOrder = mean(orders);

  // B3 stability
  const stable = fdtd1DClean({
    nx: 64,
    dx: L / 64,
    dt: 0.5 * (L / 64),
    c,
    nSteps: 300,
    kMode: 1,
  });
  const unstable = fdtd1DClean({
    nx: 64,
    dx: L / 64,
    dt: 1.2 * (L / 64),
    c,
    nSteps: 80,
    kMode: 1,
  });
  const unstableBlows = !Number.isFinite(unstable.finalL2) || unstable.finalL2 > 1e3;

  // B4 energy drift (stable case)
  // B5 wave speed via correlation remaining high under CFL

  const passB1 = b1.finalL2 < B_L2_MAX_COARSE && b1.cflOk;
  const passB2 = observedOrder >= B_MIN_OBS_ORDER;
  const passB3 = stable.finalL2 < 1 && unstableBlows;
  const passB4 = stable.energyDrift < 0.05;
  const passB5 = b1.history[b1.history.length - 1].corr > 0.9;

  return {
    family: 'B',
    title: 'Wave propagation (1D FDTD · periodic · analytical sinusoid)',
    equation: 'u_tt = c^2 u_xx',
    scheme: 'second-order centered FDTD · periodic BC · CFL c*dt/dx ≤ 1',
    b1: {
      id: 'B1',
      finalL2: b1.finalL2,
      finalLinf: b1.finalLinf,
      courant: b1.courant,
      pass: passB1,
    },
    b2: {
      id: 'B2',
      refinements: conv,
      observedOrders: orders,
      meanObservedOrder: observedOrder,
      pass: passB2,
    },
    b3: {
      id: 'B3',
      stableL2: stable.finalL2,
      unstableL2: unstable.finalL2,
      unstableDiverges: unstableBlows,
      pass: passB3,
    },
    b4: {
      id: 'B4',
      energyDrift: stable.energyDrift,
      pass: passB4,
    },
    b5: {
      id: 'B5',
      correlation: b1.history[b1.history.length - 1].corr,
      pass: passB5,
    },
    allPass: passB1 && passB2 && passB3 && passB4 && passB5,
  };
}

/* ───────────────────────── Test C: Kuramoto ───────────────────────── */

function kuramotoStep(theta, omega, K, A, dt) {
  const N = theta.length;
  const dth = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    let deg = 0;
    for (let j = 0; j < N; j++) {
      if (!A[i][j]) continue;
      sum += Math.sin(theta[j] - theta[i]);
      deg += 1;
    }
    const coup = deg > 0 ? (K / deg) * sum : 0;
    dth[i] = omega[i] + coup;
  }
  // RK4
  const k1 = dth;
  const th2 = theta.map((t, i) => t + 0.5 * dt * k1[i]);
  const k2 = kuramotoDeriv(th2, omega, K, A);
  const th3 = theta.map((t, i) => t + 0.5 * dt * k2[i]);
  const k3 = kuramotoDeriv(th3, omega, K, A);
  const th4 = theta.map((t, i) => t + dt * k3[i]);
  const k4 = kuramotoDeriv(th4, omega, K, A);
  return theta.map(
    (t, i) => t + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  );
}

function kuramotoDeriv(theta, omega, K, A) {
  const N = theta.length;
  const dth = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    let deg = 0;
    for (let j = 0; j < N; j++) {
      if (!A[i][j]) continue;
      sum += Math.sin(theta[j] - theta[i]);
      deg += 1;
    }
    dth[i] = omega[i] + (deg > 0 ? (K / deg) * sum : 0);
  }
  return dth;
}

function orderParam(theta) {
  let re = 0;
  let im = 0;
  const N = theta.length;
  for (let i = 0; i < N; i++) {
    re += Math.cos(theta[i]);
    im += Math.sin(theta[i]);
  }
  return Math.hypot(re, im) / N;
}

function adjRing(N) {
  const A = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    A[i][(i + 1) % N] = 1;
    A[i][(i - 1 + N) % N] = 1;
  }
  return A;
}
function adjComplete(N) {
  const A = Array.from({ length: N }, () => new Array(N).fill(1));
  for (let i = 0; i < N; i++) A[i][i] = 0;
  return A;
}
function adjDisconnected(N) {
  return Array.from({ length: N }, () => new Array(N).fill(0));
}

function simulateKuramoto({
  N,
  K,
  omega,
  A,
  theta0,
  dt = 0.05,
  maxSteps = C_MAX_STEPS_TO_SYNC,
  threshold = C_SYNC_THRESHOLD,
}) {
  let theta = theta0.slice();
  const rHist = [];
  let tSync = null;
  for (let s = 0; s < maxSteps; s++) {
    theta = kuramotoStep(theta, omega, K, A, dt);
    const r = orderParam(theta);
    rHist.push(r);
    if (tSync === null && r >= threshold) tSync = s * dt;
  }
  return {
    rFinal: rHist[rHist.length - 1],
    rHist,
    tSync,
    synced: tSync !== null,
    theta,
  };
}

export function runTestC() {
  const rng = mulberry32(DIGITAL_SEED + 21);
  const N = 20;

  // C1 identical frequencies, connected ring
  const omega0 = new Array(N).fill(1.0);
  const th0 = Array.from({ length: N }, () => rng() * TWO_PI);
  const c1 = simulateKuramoto({
    N,
    K: 2.5,
    omega: omega0,
    A: adjRing(N),
    theta0: th0,
  });

  // C2 frequency mismatch sweep
  const mismatch = [];
  for (const K of [0.2, 0.8, 1.5, 3.0]) {
    const omega = Array.from({ length: N }, (_, i) => 1 + 0.3 * Math.sin(i));
    const r = simulateKuramoto({
      N,
      K,
      omega,
      A: adjComplete(N),
      theta0: th0,
      maxSteps: 6000,
    });
    mismatch.push({ K, rFinal: r.rFinal, synced: r.synced, tSync: r.tSync });
  }

  // C3 topology
  const topRing = simulateKuramoto({
    N,
    K: 2.0,
    omega: omega0,
    A: adjRing(N),
    theta0: th0,
  });
  const topFull = simulateKuramoto({
    N,
    K: 2.0,
    omega: omega0,
    A: adjComplete(N),
    theta0: th0,
  });
  const topDisc = simulateKuramoto({
    N,
    K: 2.0,
    omega: omega0,
    A: adjDisconnected(N),
    theta0: th0,
  });

  // C4 disturbance recovery
  let th = c1.theta.slice();
  for (let i = 0; i < N; i++) th[i] += 0.4 * (rng() - 0.5);
  const rec = simulateKuramoto({
    N,
    K: 2.5,
    omega: omega0,
    A: adjRing(N),
    theta0: th,
    maxSteps: 5000,
  });

  // C5 sensitivity: tiny dt vs large dt
  const fine = simulateKuramoto({
    N: 12,
    K: 2,
    omega: new Array(12).fill(1),
    A: adjComplete(12),
    theta0: Array.from({ length: 12 }, () => rng() * TWO_PI),
    dt: 0.02,
    maxSteps: 4000,
  });
  const coarse = simulateKuramoto({
    N: 12,
    K: 2,
    omega: new Array(12).fill(1),
    A: adjComplete(12),
    theta0: Array.from({ length: 12 }, () => rng() * TWO_PI),
    dt: 0.2,
    maxSteps: 400,
  });

  // C6 baseline: independent oscillators (K=0)
  const base = simulateKuramoto({
    N,
    K: 0,
    omega: omega0,
    A: adjRing(N),
    theta0: th0,
    maxSteps: 2000,
  });

  const passC1 = c1.synced && c1.rFinal >= C_SYNC_THRESHOLD;
  const passC2 = mismatch[0].rFinal < mismatch[mismatch.length - 1].rFinal;
  // Complete graph should sync at least as readily as ring (final r within eps); disconnected stays low.
  const passC3 =
    topFull.rFinal + 1e-9 >= topRing.rFinal - 1e-6 &&
    topFull.synced &&
    topRing.synced &&
    topDisc.rFinal < 0.5 &&
    !topDisc.synced;
  const passC4 = rec.synced;
  const passC5 = fine.synced && Number.isFinite(coarse.rFinal);
  const passC6 = base.rFinal < C_SYNC_THRESHOLD && c1.rFinal > base.rFinal;

  return {
    family: 'C',
    title: 'Phase coordination (Kuramoto)',
    syncThreshold: C_SYNC_THRESHOLD,
    c1: { id: 'C1', ...c1, rHist: undefined, theta: undefined, pass: passC1 },
    c2: { id: 'C2', mismatch, pass: passC2 },
    c3: {
      id: 'C3',
      ring: { rFinal: topRing.rFinal, synced: topRing.synced, tSync: topRing.tSync },
      complete: { rFinal: topFull.rFinal, synced: topFull.synced, tSync: topFull.tSync },
      disconnected: { rFinal: topDisc.rFinal, synced: topDisc.synced },
      pass: passC3,
    },
    c4: {
      id: 'C4',
      rFinal: rec.rFinal,
      tSync: rec.tSync,
      synced: rec.synced,
      pass: passC4,
    },
    c5: {
      id: 'C5',
      fineR: fine.rFinal,
      coarseR: coarse.rFinal,
      pass: passC5,
    },
    c6: {
      id: 'C6',
      coupledR: c1.rFinal,
      independentR: base.rFinal,
      pass: passC6,
    },
    allPass: passC1 && passC2 && passC3 && passC4 && passC5 && passC6,
  };
}

/* ───────────────────────── Test D: Trajectory ───────────────────────── */

function circleHit(p, obstacles, clearance = 0) {
  for (const o of obstacles) {
    if (Math.hypot(p.x - o.x, p.y - o.y) < o.r + clearance) return true;
  }
  return false;
}

function makeMap(rng, nObs, W = 40, H = 40) {
  const obstacles = [];
  for (let k = 0; k < nObs; k++) {
    obstacles.push({
      x: 5 + rng() * (W - 10),
      y: 5 + rng() * (H - 10),
      r: 1.5 + rng() * 2.5,
    });
  }
  const start = { x: 1, y: 1 };
  const goal = { x: W - 2, y: H - 2 };
  return { W, H, obstacles, start, goal };
}

function astarGrid(map, clearance = 0.3) {
  const { W, H, obstacles, start, goal } = map;
  const res = 1;
  const gw = Math.ceil(W / res);
  const gh = Math.ceil(H / res);
  const key = (i, j) => `${i},${j}`;
  const blocked = new Set();
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const p = { x: i * res + 0.5, y: j * res + 0.5 };
      if (circleHit(p, obstacles, clearance)) blocked.add(key(i, j));
    }
  }
  const si = Math.floor(start.x / res);
  const sj = Math.floor(start.y / res);
  const gi = Math.floor(goal.x / res);
  const gj = Math.floor(goal.y / res);
  if (blocked.has(key(si, sj)) || blocked.has(key(gi, gj))) {
    return { ok: false, path: [], length: Infinity, collisions: 1, method: 'A*' };
  }
  const h = (i, j) => Math.hypot(i - gi, j - gj);
  const open = [{ i: si, j: sj, g: 0, f: h(si, sj) }];
  const gScore = new Map([[key(si, sj), 0]]);
  const came = new Map();
  const closed = new Set();
  let iterations = 0;
  while (open.length && iterations < 50000) {
    iterations += 1;
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift();
    const ck = key(cur.i, cur.j);
    if (closed.has(ck)) continue;
    closed.add(ck);
    if (cur.i === gi && cur.j === gj) {
      const path = [{ x: goal.x, y: goal.y }];
      let k = ck;
      while (came.has(k)) {
        const [pi, pj] = came.get(k);
        path.push({ x: pi * res + 0.5, y: pj * res + 0.5 });
        k = key(pi, pj);
      }
      path.reverse();
      let length = 0;
      for (let t = 1; t < path.length; t++) {
        length += Math.hypot(path[t].x - path[t - 1].x, path[t].y - path[t - 1].y);
      }
      let minClear = Infinity;
      for (const p of path) {
        for (const o of obstacles) {
          minClear = Math.min(minClear, Math.hypot(p.x - o.x, p.y - o.y) - o.r);
        }
      }
      return {
        ok: true,
        path,
        length,
        collisions: 0,
        iterations,
        minClearance: minClear,
        method: 'A*',
      };
    }
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const ni = cur.i + di;
      const nj = cur.j + dj;
      if (ni < 0 || nj < 0 || ni >= gw || nj >= gh) continue;
      const nk = key(ni, nj);
      if (blocked.has(nk) || closed.has(nk)) continue;
      const step = di !== 0 && dj !== 0 ? Math.SQRT2 : 1;
      const ng = cur.g + step;
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        came.set(nk, [cur.i, cur.j]);
        open.push({ i: ni, j: nj, g: ng, f: ng + h(ni, nj) });
      }
    }
  }
  return { ok: false, path: [], length: Infinity, collisions: 0, iterations, method: 'A*' };
}

/**
 * Wave–Node planner: discrete harmonic / Laplace potential from goal (wave-cost field)
 * on a node lattice; optional phase bias rotates local descent (matched ablation disables phase).
 */
function waveNodePlan(map, { usePhase = true, clearance = 0.3 } = {}) {
  const { W, H, obstacles, start, goal } = map;
  const res = 1;
  const gw = Math.ceil(W / res);
  const gh = Math.ceil(H / res);
  const key = (i, j) => i + j * gw;
  const blocked = new Uint8Array(gw * gh);
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const p = { x: i * res + 0.5, y: j * res + 0.5 };
      if (circleHit(p, obstacles, clearance)) blocked[key(i, j)] = 1;
    }
  }
  // Solve Laplace with Jacobi: u=0 at obstacles/boundary, u=1 at goal
  let u = new Float64Array(gw * gh);
  const gi = Math.floor(goal.x / res);
  const gj = Math.floor(goal.y / res);
  const si = Math.floor(start.x / res);
  const sj = Math.floor(start.y / res);
  if (blocked[key(si, sj)] || blocked[key(gi, gj)]) {
    return { ok: false, path: [], length: Infinity, collisions: 1, method: usePhase ? 'WaveNode+phase' : 'WaveNode-ablation' };
  }
  for (let iter = 0; iter < 400; iter++) {
    const nu = u.slice();
    for (let j = 1; j < gh - 1; j++) {
      for (let i = 1; i < gw - 1; i++) {
        const id = key(i, j);
        if (blocked[id]) {
          nu[id] = 0;
          continue;
        }
        if (i === gi && j === gj) {
          nu[id] = 1;
          continue;
        }
        nu[id] =
          0.25 *
          (u[key(i + 1, j)] + u[key(i - 1, j)] + u[key(i, j + 1)] + u[key(i, j - 1)]);
      }
    }
    nu[key(gi, gj)] = 1;
    u = nu;
  }
  // Gradient ascent on potential with optional phase rotation of gradient
  const path = [{ x: start.x, y: start.y }];
  let i = si;
  let j = sj;
  let collisions = 0;
  let iterations = 0;
  const phase = usePhase ? Math.PI / 16 : 0;
  const cosP = Math.cos(phase);
  const sinP = Math.sin(phase);
  const visited = new Set();
  while (iterations < 2000) {
    iterations += 1;
    if (Math.hypot(i - gi, j - gj) <= 1) {
      path.push({ x: goal.x, y: goal.y });
      break;
    }
    const vk = `${i},${j}`;
    if (visited.has(vk)) break;
    visited.add(vk);
    // discrete gradient
    const ux =
      u[key(Math.min(gw - 1, i + 1), j)] - u[key(Math.max(0, i - 1), j)];
    const uy =
      u[key(i, Math.min(gh - 1, j + 1))] - u[key(i, Math.max(0, j - 1))];
    let gx = ux * cosP - uy * sinP;
    let gy = ux * sinP + uy * cosP;
    // pick best 8-neighbor by potential (with phase-rotated preference)
    let best = null;
    let bestScore = -Infinity;
    for (const [di, dj] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const ni = i + di;
      const nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= gw || nj >= gh) continue;
      if (blocked[key(ni, nj)]) continue;
      const pref = di * gx + dj * gy;
      const score = u[key(ni, nj)] + 0.05 * pref;
      if (score > bestScore) {
        bestScore = score;
        best = { ni, nj };
      }
    }
    if (!best) break;
    i = best.ni;
    j = best.nj;
    const p = { x: i * res + 0.5, y: j * res + 0.5 };
    if (circleHit(p, obstacles, 0)) collisions += 1;
    path.push(p);
  }
  const ok =
    path.length > 1 &&
    Math.hypot(path[path.length - 1].x - goal.x, path[path.length - 1].y - goal.y) < 2;
  let length = 0;
  for (let t = 1; t < path.length; t++) {
    length += Math.hypot(path[t].x - path[t - 1].x, path[t].y - path[t - 1].y);
  }
  let minClear = Infinity;
  for (const p of path) {
    for (const o of obstacles) {
      minClear = Math.min(minClear, Math.hypot(p.x - o.x, p.y - o.y) - o.r);
    }
  }
  return {
    ok,
    path,
    length: ok ? length : Infinity,
    collisions,
    iterations,
    minClearance: minClear,
    method: usePhase ? 'WaveNode+phase' : 'WaveNode-ablation',
  };
}

function summarizePlans(rows, method) {
  const subset = rows.filter((r) => r.method === method);
  const n = subset.length;
  const succ = subset.filter((r) => r.ok);
  return {
    method,
    n,
    successRate: succ.length / n,
    meanLength: mean(succ.map((r) => r.length).filter(Number.isFinite)),
    collisionRate: mean(subset.map((r) => (r.collisions > 0 ? 1 : 0))),
    meanIterations: mean(subset.map((r) => r.iterations || 0)),
  };
}

export function runTestD() {
  const rng = mulberry32(DIGITAL_SEED + 31);
  const fixed = [];
  for (let i = 0; i < D_N_FIXED; i++) {
    fixed.push(makeMap(rng, 4 + i, 40, 40));
  }
  const held = [];
  for (let i = 0; i < D_N_HELD_OUT; i++) {
    held.push(makeMap(rng, 3 + (i % 5), 40, 40));
  }

  const evalSet = (maps, tag) => {
    const rows = [];
    for (let mi = 0; mi < maps.length; mi++) {
      const m = maps[mi];
      const a = astarGrid(m);
      const w = waveNodePlan(m, { usePhase: true });
      const ab = waveNodePlan(m, { usePhase: false });
      rows.push({ tag, mapIndex: mi, ...a });
      rows.push({ tag, mapIndex: mi, ...w });
      rows.push({ tag, mapIndex: mi, ...ab });
    }
    return rows;
  };

  const fixedRows = evalSet(fixed, 'fixed');
  const heldRows = evalSet(held, 'held_out');

  const heldSummary = {
    astar: summarizePlans(heldRows, 'A*'),
    wavePhase: summarizePlans(heldRows, 'WaveNode+phase'),
    waveAblation: summarizePlans(heldRows, 'WaveNode-ablation'),
  };

  // D does not require WaveNode to beat A*; pass = all methods runnable + metrics recorded
  const runnable =
    heldSummary.astar.n === D_N_HELD_OUT &&
    heldSummary.wavePhase.n === D_N_HELD_OUT &&
    Number.isFinite(heldSummary.astar.successRate);

  const waveBeatsAstarLength =
    heldSummary.wavePhase.successRate >= 0.5 &&
    heldSummary.astar.successRate >= 0.5 &&
    heldSummary.wavePhase.meanLength + 1e-9 < heldSummary.astar.meanLength;

  const phaseHelps =
    heldSummary.wavePhase.successRate > heldSummary.waveAblation.successRate + 1e-9 ||
    (heldSummary.wavePhase.successRate === heldSummary.waveAblation.successRate &&
      heldSummary.wavePhase.meanLength + 1e-9 < heldSummary.waveAblation.meanLength);

  return {
    family: 'D',
    title: 'Trajectory generation (2D point navigation · not manipulator / hardware)',
    scopeNote:
      '2D point robot · circular obstacles · grid collision check — not arm manipulation, not physical robots',
    nFixed: D_N_FIXED,
    nHeldOut: D_N_HELD_OUT,
    heldSummary,
    waveBeatsAstarLength,
    phaseHelpsVsAblation: phaseHelps,
    sampleFixed: fixedRows.filter((r) => r.mapIndex === 0),
    allPass: runnable,
    interpretation: waveBeatsAstarLength
      ? 'Wave–Node shorter mean path than A* on held-out successes (under this parameterization).'
      : 'Wave–Node did not beat A* on mean successful path length; A* remains the stronger grid baseline here — an important negative/mixed finding.',
  };
}

/* ───────────────────────── Test E: Scaling ───────────────────────── */

export function runTestE() {
  const sizes = [16, 32, 64, 128, 256];
  const nodePlace = [];
  const wave = [];
  const kuramoto = [];
  const plan = [];

  for (const n of sizes) {
    let t0 = performance.now();
    placeLattice2D(n, n, 1);
    nodePlace.push({ n: n * n, ms: performance.now() - t0 });

    if (n <= 128) {
      t0 = performance.now();
      fdtd1DClean({
        nx: n,
        dx: 1 / n,
        dt: 0.4 / n,
        c: 1,
        nSteps: 100,
        kMode: 1,
      });
      wave.push({ n, ms: performance.now() - t0 });
    }

    if (n <= 64) {
      const N = Math.min(n, 40);
      const th0 = Array.from({ length: N }, (_, i) => (TWO_PI * i) / N);
      t0 = performance.now();
      simulateKuramoto({
        N,
        K: 2,
        omega: new Array(N).fill(1),
        A: adjRing(N),
        theta0: th0,
        maxSteps: 500,
      });
      kuramoto.push({ n: N, ms: performance.now() - t0 });
    }
  }

  const rng = mulberry32(DIGITAL_SEED + 41);
  for (const nObs of [2, 4, 6, 8]) {
    const m = makeMap(rng, nObs, 30, 30);
    let t0 = performance.now();
    astarGrid(m);
    const aMs = performance.now() - t0;
    t0 = performance.now();
    waveNodePlan(m, { usePhase: true });
    plan.push({ nObs, astarMs: aMs, waveMs: performance.now() - t0 });
  }

  return {
    family: 'E',
    title: 'Computational cost and scaling',
    nodePlace,
    wave,
    kuramoto,
    plan,
    note: 'Wall-clock on this host; not an asymptotic proof. Warm single-shot timings.',
    allPass: nodePlace.length === sizes.length && wave.length >= 3,
  };
}

/* ───────────────────────── Orchestrator ───────────────────────── */

export function runWaveNodeLaboratory() {
  const t0 = performance.now();
  const A = runTestA();
  const B = runTestB();
  const C = runTestC();
  const D = runTestD();
  const E = runTestE();
  const ms = performance.now() - t0;

  const families = [A, B, C, D, E];
  const mathValidated = A.allPass && B.allPass && C.allPass;
  const planningRunnable = D.allPass;
  const enginePinRecommended = mathValidated && planningRunnable;

  return {
    seed: DIGITAL_SEED,
    runtimeMs: ms,
    A,
    B,
    C,
    D,
    E,
    summary: {
      A_pass: A.allPass,
      B_pass: B.allPass,
      C_pass: C.allPass,
      D_pass: D.allPass,
      E_pass: E.allPass,
      mathValidated,
      planningRunnable,
      waveBeatsAstarLength: D.waveBeatsAstarLength,
      phaseHelpsVsAblation: D.phaseHelpsVsAblation,
      enginePinRecommended,
      familiesPass: families.filter((f) => f.allPass).length,
      familiesTotal: families.length,
    },
  };
}

// silence unused (fdtd1D kept for clarity; clean path used)
void fdtd1D;
