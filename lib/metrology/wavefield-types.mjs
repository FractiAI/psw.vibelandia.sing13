/**
 * SYN-SUN-2026-REV7 · runtime type-safe casting (Node / DPH-GPU ingest gate).
 * Mirrors ssvibelandia_core/src/metrology/types.ts
 */
import { EGS_PHI } from './wavefield-constants.mjs';
import { resolveRegionCodename } from './region-codenames.mjs';

const MAG_CLASS = new Set(['Alpha', 'Beta', 'Beta-Gamma', 'Delta']);

/** Parse NOAA-style heliographic token e.g. S16W00, N09W50. */
export function parseHeliographicLocation(location) {
  const raw = String(location || '').trim().toUpperCase();
  const m = raw.match(/^([NS])(\d{1,2})([EW])(\d{1,2})$/);
  if (!m) return { latitude: 0, longitude: 0, parsed: false };
  const lat = parseInt(m[2], 10) * (m[1] === 'S' ? -1 : 1);
  const lon = parseInt(m[4], 10) * (m[3] === 'W' ? 1 : -1);
  return { latitude: lat, longitude: lon, parsed: true };
}

export function normalizeMagneticClass(classification) {
  const c = String(classification || '').toLowerCase();
  if (c.includes('delta')) return 'Delta';
  if (c.includes('gamma')) return 'Beta-Gamma';
  if (c.includes('beta')) return 'Beta';
  if (c.includes('alpha')) return 'Alpha';
  return 'Beta';
}

/** Cast raw NOAA / canonical region row into ActiveSolarNode (non-nullable). */
export function castActiveSolarNode(raw, globalSunspotCount) {
  const regionId = String(raw.id || raw.regionId || '').trim();
  if (!regionId) throw new Error('wavefield: regionId required');

  const loc = parseHeliographicLocation(raw.location);
  const magneticClass = normalizeMagneticClass(raw.classification || raw.magneticClass);
  if (!MAG_CLASS.has(magneticClass)) throw new Error(`wavefield: invalid magneticClass ${magneticClass}`);

  const areaMillionths = Math.max(0, Number(raw.areaMuHem ?? raw.areaMillionths ?? raw.area) || 0);
  const sunspotCount = Math.max(0, Math.floor(Number(globalSunspotCount) || 0));

  return Object.freeze({
    regionId,
    codename: raw.codename ?? resolveRegionCodename(regionId),
    latitude: loc.latitude,
    longitude: loc.longitude,
    magneticClass,
    sunspotCount,
    areaMillionths,
  });
}

/** Build HolographicPacingMatrix with egsStabilityIndex supplied by clock-skew filter. */
export function buildHolographicPacingMatrix({ globalSunspotCount, liveNodes, egsStabilityIndex }) {
  const ssn = Math.max(0, Number(globalSunspotCount) || 0);
  const nodes = Array.isArray(liveNodes) ? liveNodes : [];
  const idx = Math.min(Math.max(Number(egsStabilityIndex) || 0, 0), EGS_PHI);

  return Object.freeze({
    telemetryTimestamp: Date.now(),
    globalSunspotCount: ssn,
    liveNodes: Object.freeze(nodes.map((n) => Object.freeze({ ...n }))),
    egsStabilityIndex: idx,
  });
}

/** Serialize matrix for Python clock_skew_filter.calculate_holographic_limit. */
export function matrixForPythonFilter(matrix) {
  return {
    live_nodes: (matrix.liveNodes || []).map((n) => ({
      latitude: n.latitude,
      longitude: n.longitude,
      area_millionths: n.areaMillionths,
    })),
  };
}
