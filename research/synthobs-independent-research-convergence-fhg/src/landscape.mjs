/** Panel landscapes — same grammar as Agentic Convergence (multiscale planted structure). */
import { SERIES_LEN } from '../../synthobs-agentic-convergence-experiment/src/constants.mjs';

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeLandscapeForSeed(seed, noiseScale = 0.35) {
  const rnd = mulberry32(seed);
  const n = SERIES_LEN;
  const signal = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const coarse = Math.sin(2 * Math.PI * x);
    const mid = 0.45 * Math.sin(2 * Math.PI * 4 * x + 0.3);
    const fine = 0.2 * Math.sin(2 * Math.PI * 16 * x + 1.1);
    const envelope = 0.15 * Math.sin(2 * Math.PI * x * 0.5);
    const localGlobal = envelope * Math.sin(2 * Math.PI * 8 * x);
    signal[i] = coarse + mid + fine + localGlobal;
  }
  const obs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    obs[i] = signal[i] + (rnd() * 2 - 1) * noiseScale;
  }
  const target = new Float64Array(n);
  for (let i = 0; i < n - 1; i++) target[i] = signal[i + 1];
  target[n - 1] = signal[n - 1];
  return {
    id: `panel_${seed.toString(16)}`,
    seed,
    noiseScale,
    observations: obs,
    target,
  };
}
