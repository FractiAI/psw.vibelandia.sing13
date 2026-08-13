/**
 * Real CPU Bloch / GRE-train kernel for Synthio live wall-clock benches.
 * Hard-pulse + free-precession + T1/T2 relaxation — not a log-scaled busy-loop proxy.
 * Simulator math only (Syntheverse Sandbox). Not a clinical magnet.
 */

import { createHash } from 'node:crypto';
import { PHI_EGS } from './constants.mjs';

const GAMMA = 267.52218744e6; // rad/s/T (proton)

/**
 * Build a deterministic multi-compartment phantom (Mx,My,Mz,T1,T2,df).
 * @param {{ nx:number, ny:number, nz:number }} shape
 */
export function buildPhantom({ nx, ny, nz }) {
  const n = nx * ny * nz;
  const Mx = new Float64Array(n);
  const My = new Float64Array(n);
  const Mz = new Float64Array(n);
  const T1 = new Float64Array(n);
  const T2 = new Float64Array(n);
  const df = new Float64Array(n); // off-resonance Hz
  let i = 0;
  for (let z = 0; z < nz; z++) {
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++, i++) {
        const r = Math.hypot(x - nx / 2, y - ny / 2, z - nz / 2) / Math.max(nx, ny, nz);
        Mx[i] = 0;
        My[i] = 0;
        Mz[i] = 1 - 0.15 * r;
        T1[i] = 0.8 + 0.4 * ((x + y) % 5) * 0.1; // s
        T2[i] = 0.08 + 0.04 * ((y + z) % 3) * 0.1;
        df[i] = (x - nx / 2) * 12 + (y - ny / 2) * 7 + (z - nz / 2) * 3;
      }
    }
  }
  return { nx, ny, nz, n, Mx, My, Mz, T1, T2, df };
}

function tipHardPulse(Mx, My, Mz, n, flipRad) {
  const c = Math.cos(flipRad);
  const s = Math.sin(flipRad);
  for (let i = 0; i < n; i++) {
    const my = My[i];
    const mz = Mz[i];
    My[i] = my * c - mz * s;
    Mz[i] = my * s + mz * c;
    // Mx unchanged for x-axis tip
  }
}

function freePrecessRelax(Mx, My, Mz, T1, T2, df, n, dt) {
  for (let i = 0; i < n; i++) {
    const e2 = Math.exp(-dt / Math.max(1e-6, T2[i]));
    const e1 = Math.exp(-dt / Math.max(1e-6, T1[i]));
    const phi = 2 * Math.PI * df[i] * dt;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const mx = Mx[i];
    const my = My[i];
    const mx2 = (mx * c - my * s) * e2;
    const my2 = (mx * s + my * c) * e2;
    Mx[i] = mx2;
    My[i] = my2;
    Mz[i] = Mz[i] * e1 + (1 - e1);
  }
}

/**
 * Run a short GRE-like train over the phantom (real Bloch updates).
 * @returns {{ signal: Float64Array, checksum: string, voxels: number, steps: number }}
 */
export function simulateGreTrain(phantom, { nTr = 24, flipDeg = 15, tr = 0.008, te = 0.003 } = {}) {
  const { n, Mx, My, Mz, T1, T2, df } = phantom;
  // clone magnetization so repeated runs are independent
  const mx = Float64Array.from(Mx);
  const my = Float64Array.from(My);
  const mz = Float64Array.from(Mz);
  const flip = (flipDeg * Math.PI) / 180;
  const signal = new Float64Array(nTr * 2);
  const teDt = te;
  const trRest = Math.max(1e-6, tr - te);

  for (let trI = 0; trI < nTr; trI++) {
    tipHardPulse(mx, my, mz, n, flip);
    freePrecessRelax(mx, my, mz, T1, T2, df, n, teDt);
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      sx += mx[i];
      sy += my[i];
    }
    signal[trI * 2] = sx / n;
    signal[trI * 2 + 1] = sy / n;
    freePrecessRelax(mx, my, mz, T1, T2, df, n, trRest);
    // spoil transverse
    for (let i = 0; i < n; i++) {
      mx[i] = 0;
      my[i] = 0;
    }
  }

  const checksum = createHash('sha256')
    .update(Buffer.from(signal.buffer))
    .digest('hex')
    .slice(0, 16);

  return { signal, checksum, voxels: n, steps: nTr, gamma: GAMMA, phiEgs: PHI_EGS };
}

/**
 * Lightweight nested phase-ack update on a shared signal packet (MRI arm).
 * Real float work + hash — not a no-op label.
 */
export function phaseAckUpdate(sharedSignal, edgeIndex, packetChars) {
  const out = Float64Array.from(sharedSignal);
  const depthFactor = 1 / Math.max(1, Math.ceil(Math.log(edgeIndex + 2) / Math.log(PHI_EGS)));
  for (let i = 0; i < out.length; i++) {
    const phase = ((edgeIndex + 1) * PHI_EGS + i) * 0.017;
    out[i] = out[i] * Math.cos(phase) * depthFactor + Math.sin(phase) * 1e-6;
  }
  const packet = Buffer.alloc(packetChars, 0);
  for (let i = 0; i < packetChars; i++) {
    packet[i] = (edgeIndex * 31 + i * 17 + (out[i % out.length] * 1e6)) & 0xff;
  }
  const checksum = createHash('sha256').update(packet).update(Buffer.from(out.buffer)).digest('hex').slice(0, 16);
  return { checksum, bytes: packetChars, samples: out.length };
}

/**
 * Legacy full-context dump processing (real buffer touch + hash per edge).
 */
export function processFullContextDump(contextChars, edgeIndex, signal) {
  const buf = Buffer.alloc(contextChars, 0);
  for (let i = 0; i < contextChars; i++) {
    const s = signal[(i + edgeIndex) % signal.length];
    buf[i] = (i * 13 + edgeIndex * 29 + Math.floor((s + 1) * 1000)) & 0xff;
  }
  const checksum = createHash('sha256').update(buf).digest('hex').slice(0, 16);
  return { checksum, bytes: contextChars };
}

export function hrtimeMs(startNs) {
  return Number(process.hrtime.bigint() - startNs) / 1e6;
}
