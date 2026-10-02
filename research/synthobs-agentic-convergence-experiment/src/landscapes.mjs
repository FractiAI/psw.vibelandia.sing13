/**
 * Phase 1 — identical raw landscapes for every agent.
 * Structure is planted; agents receive only float series + prediction targets.
 */
import { LANDSCAPE_SEED, HELD_OUT_SEED, SERIES_LEN } from './constants.mjs';

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeries(seed, noiseScale) {
  const rnd = mulberry32(seed);
  const n = SERIES_LEN;
  const signal = new Float64Array(n);
  // Multiscale nested pulses (coarse → fine) without naming the structure to agents.
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const coarse = Math.sin(2 * Math.PI * x);
    const mid = 0.45 * Math.sin(2 * Math.PI * 4 * x + 0.3);
    const fine = 0.2 * Math.sin(2 * Math.PI * 16 * x + 1.1);
    // Local patch that also carries a global envelope (part↔whole rhyme).
    const envelope = 0.15 * Math.sin(2 * Math.PI * x * 0.5);
    const localGlobal = envelope * Math.sin(2 * Math.PI * 8 * x);
    signal[i] = coarse + mid + fine + localGlobal;
  }
  const obs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    obs[i] = signal[i] + (rnd() * 2 - 1) * noiseScale;
  }
  // Next-step prediction target from clean signal (agents never see this array as "truth label name").
  const target = new Float64Array(n);
  for (let i = 0; i < n - 1; i++) target[i] = signal[i + 1];
  target[n - 1] = signal[n - 1];
  return {
    id: `landscape_${seed.toString(16)}`,
    seed,
    noiseScale,
    observations: obs,
    target,
    // Evaluator-only metadata (not passed to agents).
    _meta: {
      planted: ['multiscale_pulses', 'local_global_envelope', 'bounded_amplitude'],
    },
  };
}

export function makeTrainLandscape() {
  return buildSeries(LANDSCAPE_SEED, 0.35);
}

export function makeHeldOutLandscape() {
  return buildSeries(HELD_OUT_SEED, 0.55);
}

/** Public agent view — strips evaluator metadata. */
export function agentView(landscape) {
  return {
    id: landscape.id,
    observations: landscape.observations,
    target: landscape.target,
  };
}
