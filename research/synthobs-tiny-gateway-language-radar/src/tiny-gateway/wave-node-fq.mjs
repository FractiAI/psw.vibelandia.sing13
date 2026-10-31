/**
 * Wave–Node–Fq — activation, propagation, phase/timing, template selection, execution cue.
 * Grounded in Wave–Node Mathematics peer grammar (ENGINE_SHELF #49) as a digital selector,
 * not a claim of physical wave hardware.
 */
import { PHI_EGS } from '../constants.mjs';

export function phaseOf(step, omega = (2 * Math.PI) / PHI_EGS) {
  return (step * omega) % (2 * Math.PI);
}

export function waveActivation(features, step) {
  const phase = phaseOf(step);
  let wave = 0;
  let node = 0;
  let fq = 0;
  for (let i = 0; i < features.length; i++) {
    const v = features[i];
    wave += v * Math.cos(phase + i * 0.37);
    node += v * Math.sin(phase * 0.5 + i * 0.19);
    fq += v * Math.cos(phase * PHI_EGS + i);
  }
  const n = Math.max(1, features.length);
  return {
    wave: wave / n,
    node: node / n,
    fq: fq / n,
    phase,
    channel: pickChannel(wave / n, node / n, fq / n),
  };
}

export function pickChannel(wave, node, fq) {
  const a = Math.abs(wave);
  const b = Math.abs(node);
  const c = Math.abs(fq);
  if (a >= b && a >= c) return 'wave';
  if (b >= a && b >= c) return 'node';
  return 'fq';
}

/**
 * Select a template index from a scored list using wave–node–fq soft argmax.
 */
export function selectTemplate(scoredTemplates, step = 0) {
  if (!scoredTemplates.length) return null;
  const feats = scoredTemplates.map((t) => t.score);
  const act = waveActivation(feats, step);
  // Weight scores by channel bias
  const bias =
    act.channel === 'wave' ? act.wave : act.channel === 'node' ? act.node : act.fq;
  let best = scoredTemplates[0];
  let bestScore = -Infinity;
  for (const t of scoredTemplates) {
    const s = t.score + 0.15 * bias + (t.phaseBoost ?? 0) * Math.cos(act.phase);
    if (s > bestScore) {
      bestScore = s;
      best = t;
    }
  }
  return { template: best.template ?? best, score: bestScore, activation: act };
}

export function propagateAlongPath(pathKeys, seedValue = 1) {
  const out = [];
  let v = seedValue;
  for (let i = 0; i < pathKeys.length; i++) {
    const act = waveActivation([v, i + 1], i);
    v = 0.7 * v + 0.3 * (act.wave + act.node + act.fq) / 3;
    out.push({ key: pathKeys[i], value: v, channel: act.channel, phase: act.phase });
  }
  return out;
}
