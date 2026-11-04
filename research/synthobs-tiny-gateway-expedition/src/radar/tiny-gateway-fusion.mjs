/**
 * Tiny Gateway radar-fusion prototype.
 * Boundary (airspace) → tree (sensor/track hierarchy) → φ scale bridge →
 * honeycomb pathways among sensors → Wave–Node–Fq template select →
 * bind observation → execute track-update / anomaly templates.
 */
import { createTinyGateway } from '../tiny-gateway/gateway.mjs';
import { createTemplate } from '../tiny-gateway/template-binding.mjs';
import { hexKey } from '../tiny-gateway/honeycomb-lattice.mjs';

export function runTinyGatewayFusion(scenario, opts = {}) {
  const gate = opts.gateKm ?? 3.5;
  const anomalyThreshold = opts.anomalyThreshold ?? 2.2;
  const ablation = opts.ablation || {};

  const gw = createTinyGateway({
    domain: 'civilian_airspace',
    task: 'multisensor_fusion',
    honeycombRadius: 3,
    treeLayers: [
      scenario.sensors.map((s) => ({ id: `sensor-${s.id}` })),
      [{ id: 'tracks' }, { id: 'anomalies' }],
    ],
    ablation,
  });

  // Map sensors onto honeycomb cells
  const sensorHex = new Map();
  scenario.sensors.forEach((s, i) => {
    const q = (i % 3) - 1;
    const r = Math.floor(i / 3) - 1;
    sensorHex.set(s.id, hexKey(q, r));
  });

  const trackState = new Map();
  let nextId = 0;

  gw.registerTemplate(
    createTemplate({
      id: 'radar:new_track',
      kind: 'track_update',
      slots: ['x', 'y', 'alt', 'trackId', 'anomalousTruth'],
      execute: (b) => {
        const id = nextId++;
        trackState.set(id, {
          x: b.x,
          y: b.y,
          alt: b.alt,
          n: 1,
          speedEMA: 0,
          lastX: b.x,
          lastY: b.y,
          anomalyScore: 0,
          truthTrack: b.trackId,
          truthAnom: b.anomalousTruth ? 1 : 0,
        });
        return { action: 'new', id };
      },
    }),
  );

  gw.registerTemplate(
    createTemplate({
      id: 'radar:update_track',
      kind: 'track_update',
      slots: ['estId', 'x', 'y', 'alt', 'trackId', 'anomalousTruth'],
      execute: (b) => {
        const tr = trackState.get(b.estId);
        if (!tr) return { action: 'miss' };
        const sp = Math.hypot(b.x - tr.lastX, b.y - tr.lastY);
        tr.speedEMA = tr.n === 1 ? sp : 0.8 * tr.speedEMA + 0.2 * sp;
        tr.x = (tr.x * tr.n + b.x) / (tr.n + 1);
        tr.y = (tr.y * tr.n + b.y) / (tr.n + 1);
        tr.alt = (tr.alt * tr.n + b.alt) / (tr.n + 1);
        tr.n += 1;
        tr.lastX = b.x;
        tr.lastY = b.y;
        tr.truthAnom += b.anomalousTruth ? 1 : 0;
        const score = tr.speedEMA / 0.4 + Math.abs(tr.alt - 5) / 2;
        tr.anomalyScore = Math.max(tr.anomalyScore, score);
        return { action: 'update', id: b.estId, score };
      },
    }),
  );

  const byStep = new Map();
  for (const o of scenario.observations) {
    if (!byStep.has(o.step)) byStep.set(o.step, []);
    byStep.get(o.step).push(o);
  }

  const t0 = performance.now();
  let templateHits = { new: 0, update: 0 };

  for (let step = 0; step < scenario.params.timeSteps; step++) {
    const obs = byStep.get(step) || [];
    const fused = fuseNearObservations(obs, 1.2);

    for (const f of fused) {
      let bestId = null;
      let bestD = Infinity;
      for (const [id, tr] of trackState) {
        const d = Math.hypot(tr.x - f.x, tr.y - f.y);
        if (d < bestD) {
          bestD = d;
          bestId = id;
        }
      }

      const fromHex = sensorHex.get(f.sensorId ?? 0) || '0,0';
      const toHex = bestId != null ? hexKey((bestId % 5) - 2, (Math.floor(bestId / 5) % 5) - 2) : '1,0';

      const isNew = bestId == null || bestD > gate;
      const scored = isNew
        ? [{ template: gw.registry.get('radar:new_track'), score: 0.9 }]
        : [{ template: gw.registry.get('radar:update_track'), score: 0.9 + Math.min(0.2, 1 / (1 + bestD)) }];

      const data = isNew
        ? { x: f.x, y: f.y, alt: f.alt, trackId: f.trackId, anomalousTruth: f.anomalousTruth, kind: 'track_update' }
        : {
            estId: bestId,
            x: f.x,
            y: f.y,
            alt: f.alt,
            trackId: f.trackId,
            anomalousTruth: f.anomalousTruth,
            kind: 'track_update',
          };

      const out = gw.run({
        data,
        scored,
        pathway: { from: fromHex, to: toHex },
        targetScale: isNew ? 1 : 3,
      });
      if (out.result?.action === 'new') templateHits.new++;
      if (out.result?.action === 'update') templateHits.update++;
    }
  }

  const runtimeMs = performance.now() - t0;
  const truthAnomTracks = new Set(scenario.anomalyIds);
  const caughtTruth = new Set();
  let fp = 0;
  let predCount = 0;
  for (const [, tr] of trackState) {
    const isPred = tr.anomalyScore >= anomalyThreshold;
    if (isPred) {
      predCount++;
      if (truthAnomTracks.has(tr.truthTrack)) caughtTruth.add(tr.truthTrack);
      else fp++;
    }
  }
  const tp = caughtTruth.size;
  const fn = [...truthAnomTracks].filter((t) => !caughtTruth.has(t)).length;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    kind: 'tiny_gateway',
    runtimeMs,
    nEstTracks: trackState.size,
    templateHits,
    gateway: gw.describe(),
    metrics: {
      precision,
      recall,
      f1,
      falsePositives: fp,
      missedDetections: fn,
      truePositives: tp,
    },
    predictedAnomCount: predCount,
    peakMemoryEstimateBytes: trackState.size * 160 + JSON.stringify(gw.describe()).length,
    ablation,
  };
}

function fuseNearObservations(obs, radius) {
  const used = new Array(obs.length).fill(false);
  const out = [];
  for (let i = 0; i < obs.length; i++) {
    if (used[i]) continue;
    let sx = 0;
    let sy = 0;
    let sa = 0;
    let n = 0;
    let anom = false;
    let trackId = obs[i].trackId;
    let sensorId = obs[i].sensorId;
    for (let j = i; j < obs.length; j++) {
      if (used[j]) continue;
      if (obs[j].step !== obs[i].step) continue;
      const d = Math.hypot(obs[i].x - obs[j].x, obs[i].y - obs[j].y);
      if (d <= radius) {
        used[j] = true;
        sx += obs[j].x;
        sy += obs[j].y;
        sa += obs[j].alt;
        n++;
        anom = anom || obs[j].anomalousTruth;
        trackId = obs[j].trackId;
        sensorId = obs[j].sensorId;
      }
    }
    out.push({
      x: sx / n,
      y: sy / n,
      alt: sa / n,
      anomalousTruth: anom,
      trackId,
      sensorId,
      step: obs[i].step,
    });
  }
  return out;
}
