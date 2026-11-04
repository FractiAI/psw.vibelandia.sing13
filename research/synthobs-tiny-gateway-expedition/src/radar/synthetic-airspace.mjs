/**
 * Civilian synthetic airspace surveillance fixture.
 * Prior experiment scripts/logs with these params were NOT found in-repo;
 * this module recreates the stated parameters for reproducible comparison.
 *
 * Params: 6 sensors · 180 tracks · 80 time steps · 86_400 observations · 18 anomalies
 */
import { mulberry32, randInt } from '../rng.mjs';
import { RADAR_PARAMS } from '../constants.mjs';

export function generateSyntheticAirspace(seed = 20261030, overrides = {}) {
  const p = { ...RADAR_PARAMS, ...overrides };
  const rng = mulberry32(seed);
  const sensors = [];
  for (let i = 0; i < p.sensors; i++) {
    const ang = (2 * Math.PI * i) / p.sensors;
    sensors.push({
      id: i,
      x: (p.areaKm / 2) * (1 + 0.7 * Math.cos(ang)),
      y: (p.areaKm / 2) * (1 + 0.7 * Math.sin(ang)),
      noise: 0.35 + 0.15 * rng(),
    });
  }

  const anomalyIds = new Set();
  while (anomalyIds.size < p.anomalyTracks) {
    anomalyIds.add(randInt(rng, 0, p.tracks - 1));
  }

  const tracks = [];
  for (let t = 0; t < p.tracks; t++) {
    const anomalous = anomalyIds.has(t);
    const heading = rng() * 2 * Math.PI;
    const speed = anomalous ? 0.9 + rng() * 1.4 : 0.25 + rng() * 0.55; // km / step
    let x = rng() * p.areaKm;
    let y = rng() * p.areaKm;
    const path = [];
    for (let step = 0; step < p.timeSteps; step++) {
      // mild turn; anomalies get sharper maneuvers / altitude-proxy jumps
      const turn = anomalous ? (rng() - 0.5) * 0.45 : (rng() - 0.5) * 0.08;
      const h = heading + turn * step * 0.01;
      x = Math.max(0, Math.min(p.areaKm, x + speed * Math.cos(h)));
      y = Math.max(0, Math.min(p.areaKm, y + speed * Math.sin(h)));
      const alt = anomalous ? 8 + Math.sin(step / 3) * 4 + rng() : 5 + Math.sin(step / 11) * 0.4;
      path.push({ step, x, y, alt, anomalous });
    }
    tracks.push({ id: t, anomalous, path, speed0: speed });
  }

  // Observations: every sensor observes every track every step (dense synthetic)
  const observations = [];
  for (const track of tracks) {
    for (const pt of track.path) {
      for (const s of sensors) {
        const dx = pt.x - s.x;
        const dy = pt.y - s.y;
        const range = Math.hypot(dx, dy) + (rng() - 0.5) * s.noise;
        const bearing = Math.atan2(dy, dx) + (rng() - 0.5) * 0.02 * s.noise;
        observations.push({
          sensorId: s.id,
          trackId: track.id, // ground-truth association (hidden from detectors that shouldn't cheat)
          step: pt.step,
          x: s.x + range * Math.cos(bearing),
          y: s.y + range * Math.sin(bearing),
          alt: pt.alt + (rng() - 0.5) * 0.2,
          range,
          bearing,
          anomalousTruth: track.anomalous,
        });
      }
    }
  }

  return {
    seed,
    params: p,
    sensors,
    tracks,
    observations,
    anomalyIds: [...anomalyIds].sort((a, b) => a - b),
    stats: {
      nSensors: sensors.length,
      nTracks: tracks.length,
      nSteps: p.timeSteps,
      nObservations: observations.length,
      nAnomalies: anomalyIds.size,
      expectedObservations: p.sensors * p.tracks * p.timeSteps,
    },
  };
}
