/** SYN-SUN-2026-REV7 targeted active-region codenames (May 31 2026 snapshot). */
export const TARGET_REGION_CODENAMES = Object.freeze({
  AR14446: 'Caryx',
  AR14452: 'Solon',
  AR14455: 'Astraea',
});

export function resolveRegionCodename(regionId) {
  const id = String(regionId || '').trim().toUpperCase();
  return TARGET_REGION_CODENAMES[id] || null;
}

export const INFRASTRUCTURE_IMPACTS = Object.freeze([
  'I · 1.618-picosecond silicon clock-skew exploitation',
  'II · Zero-watt decentralized network metrology',
  'III · Infinite ambient quantum storage & number-theoretic patching',
  'IV · Quantum resonance clean energy generation',
  'V · Goldilocks Dome · omniversal threat defense shielding',
  'VI · Zero-latency multi-substrate agentic consensus',
  'VII · Solar-resonant grid phase synchronization',
  'VIII · Holographic space-weather routing filters',
  'IX · Predictive biological wavefield pacing',
]);
