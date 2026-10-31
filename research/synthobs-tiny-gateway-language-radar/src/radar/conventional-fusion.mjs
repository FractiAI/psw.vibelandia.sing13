/**
 * Conventional multisensor fusion baseline:
 * nearest-neighbor association · incremental mean track update · speed/alt anomaly score.
 * Optimized-enough for fair Node comparison (not claiming industrial tracker quality).
 */
export function runConventionalFusion(scenario, opts = {}) {
  const gate = opts.gateKm ?? 3.5;
  const anomalyThreshold = opts.anomalyThreshold ?? 2.2;

  // Hide ground-truth trackId from association — use spatial NN only
  const byStep = new Map();
  for (const o of scenario.observations) {
    if (!byStep.has(o.step)) byStep.set(o.step, []);
    byStep.get(o.step).push(o);
  }

  const tracks = new Map(); // estId -> {x,y,alt,n,speedEMA,scores,truthVotes}
  let nextId = 0;
  const associations = [];
  const t0 = performance.now();

  for (let step = 0; step < scenario.params.timeSteps; step++) {
    const obs = byStep.get(step) || [];
    // Fuse per-sensor clusters first: average observations that are near each other
    const fused = fuseNearObservations(obs, 1.2);

    for (const f of fused) {
      let bestId = null;
      let bestD = Infinity;
      for (const [id, tr] of tracks) {
        const d = Math.hypot(tr.x - f.x, tr.y - f.y);
        if (d < bestD) {
          bestD = d;
          bestId = id;
        }
      }
      if (bestId == null || bestD > gate) {
        bestId = nextId++;
        tracks.set(bestId, {
          x: f.x,
          y: f.y,
          alt: f.alt,
          n: 1,
          speedEMA: 0,
          lastX: f.x,
          lastY: f.y,
          anomalyScore: 0,
          truthAnom: f.anomalousTruth ? 1 : 0,
          truthTrack: f.trackId,
        });
      } else {
        const tr = tracks.get(bestId);
        const sp = Math.hypot(f.x - tr.lastX, f.y - tr.lastY);
        tr.speedEMA = tr.n === 1 ? sp : 0.8 * tr.speedEMA + 0.2 * sp;
        tr.x = (tr.x * tr.n + f.x) / (tr.n + 1);
        tr.y = (tr.y * tr.n + f.y) / (tr.n + 1);
        tr.alt = (tr.alt * tr.n + f.alt) / (tr.n + 1);
        tr.n += 1;
        tr.lastX = f.x;
        tr.lastY = f.y;
        tr.truthAnom += f.anomalousTruth ? 1 : 0;
        // anomaly: high speed EMA or alt variance proxy
        const score = tr.speedEMA / 0.4 + Math.abs(tr.alt - 5) / 2;
        tr.anomalyScore = Math.max(tr.anomalyScore, score);
      }
      associations.push({ step, estId: bestId, obsTrackId: f.trackId, dist: bestD });
    }
  }

  const runtimeMs = performance.now() - t0;

  // Label anomalies on estimated tracks
  const predictedAnom = [];
  const truthAnomTracks = new Set(scenario.anomalyIds);
  let tp = 0;
  let fp = 0;
  let fn = 0;

  // Map estimated tracks back to majority truth track id
  const estToTruth = new Map();
  for (const [id, tr] of tracks) {
    estToTruth.set(id, tr.truthTrack);
    const isPred = tr.anomalyScore >= anomalyThreshold;
    const isTruth = truthAnomTracks.has(tr.truthTrack);
    if (isPred) predictedAnom.push(id);
    if (isPred && isTruth) tp++;
    else if (isPred && !isTruth) fp++;
  }
  // missed: truth anomaly tracks that never got an est track above threshold
  const caughtTruth = new Set();
  for (const [id, tr] of tracks) {
    if (tr.anomalyScore >= anomalyThreshold && truthAnomTracks.has(tr.truthTrack)) {
      caughtTruth.add(tr.truthTrack);
    }
  }
  fn = [...truthAnomTracks].filter((t) => !caughtTruth.has(t)).length;
  // Recompute tp as |caughtTruth|
  tp = caughtTruth.size;
  fp = predictedAnom.filter((id) => !truthAnomTracks.has(estToTruth.get(id))).length;

  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    kind: 'conventional',
    runtimeMs,
    nEstTracks: tracks.size,
    nAssociations: associations.length,
    metrics: {
      precision,
      recall,
      f1,
      falsePositives: fp,
      missedDetections: fn,
      truePositives: tp,
    },
    predictedAnomCount: predictedAnom.length,
    peakMemoryEstimateBytes: tracks.size * 128 + scenario.observations.length * 8,
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
      }
    }
    out.push({ x: sx / n, y: sy / n, alt: sa / n, anomalousTruth: anom, trackId, step: obs[i].step });
  }
  return out;
}
