/**
 * DPH-GPU Wavefield Oscillator Solar Model (SYN-SUN-2026-REV7).
 * Live NOAA ingest → E_s(θ) harmonic field → Holographic Stability Index.
 */
import {
  EGS_PHI,
  CLOCK_SKEW_PS,
  HYDROGEN_LINE_MHZ,
  HYDROGEN_LINE_GHZ,
  PULSE_CADENCE_SEC,
  TEST_COVERAGE_FLOOR,
} from './metrology/wavefield-constants.mjs';
import { castActiveSolarNode, buildHolographicPacingMatrix } from './metrology/wavefield-types.mjs';
import { calculateHolographicLimit } from './metrology/clock-skew-filter.mjs';
import { INFRASTRUCTURE_IMPACTS, resolveRegionCodename } from './metrology/region-codenames.mjs';

export {
  EGS_PHI,
  CLOCK_SKEW_PS,
  HYDROGEN_LINE_MHZ,
  HYDROGEN_LINE_GHZ,
  PULSE_CADENCE_SEC,
} from './metrology/wavefield-constants.mjs';

export const DOCUMENT_ID = 'SYN-SUN-2026-REV7';
export const DPH_GPU_VERSION = '2026.5';

/** Canonical May 31 2026 snapshot — used when NOAA AR feed is unavailable. */
export const CANONICAL_ACTIVE_REGIONS = [
  {
    id: 'AR14446',
    codename: 'Caryx',
    location: 'S16W00',
    classification: 'beta-gamma',
    areaMuHem: 300,
    role: 'High-frequency signal node / C-class flare engine',
  },
  {
    id: 'AR14452',
    codename: 'Solon',
    location: 'N09W50',
    classification: 'beta-gamma',
    areaMuHem: 210,
    role: 'Topological knot / High-gradient spatial stress point',
  },
  {
    id: 'AR14455',
    codename: 'Astraea',
    location: 'N15E49',
    classification: 'beta',
    areaMuHem: 380,
    role: 'Raw energy injection node / Transforming limb boundary',
  },
];

export const CANONICAL_SUNSPOT_NUMBER = 133;

const mem = globalThis.__qvWavefieldSolar || (globalThis.__qvWavefieldSolar = { latest: null, at: 0 });
const CACHE_MS = 60_000;

function round(n, d = 6) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

/** Ideal continuous boundary layer E_s(θ) = Σ sin(kθ) / φ^k (truncated). */
export function wavefieldIdeal(thetaRad, terms = 24) {
  let sum = 0;
  for (let k = 1; k <= terms; k += 1) {
    sum += Math.sin(k * thetaRad) / EGS_PHI ** k;
  }
  return sum;
}

/** Sample field at meridian nodes for stability readout. */
export function sampleWavefieldRing( nodes = 36, terms = 24) {
  const samples = [];
  for (let i = 0; i < nodes; i += 1) {
    const theta = (2 * Math.PI * i) / nodes;
    samples.push({ theta, value: wavefieldIdeal(theta, terms) });
  }
  return samples;
}

/** Live stress modulation from sunspot count + active-region area weights. */
export function modulateWavefieldParams({ sunspotNumber, activeRegions }) {
  const ssn = Math.max(0, Number(sunspotNumber) || 0);
  const regions = Array.isArray(activeRegions) ? activeRegions : [];
  const areaSum = regions.reduce((a, r) => a + (Number(r.areaMuHem) || 0), 0);
  const betaGammaCount = regions.filter((r) =>
    String(r.classification || '').toLowerCase().includes('gamma'),
  ).length;

  const stressFactor = 1 + ssn / (200 * EGS_PHI) + areaSum / 5000;
  const gradientKnot = betaGammaCount * (1 / EGS_PHI);

  return {
    sunspotNumber: ssn,
    areaSumMuHem: areaSum,
    betaGammaNodes: betaGammaCount,
    stressFactor: round(stressFactor, 4),
    gradientKnot: round(gradientKnot, 4),
    modulationGain: round(1 / EGS_PHI ** (ssn / 100), 6),
  };
}

/** Holographic Stability Index — 0..1 from ideal vs modulated field variance. */
export function computeHolographicStabilityIndex(modulation) {
  const raw = 1 - Math.min(1, (modulation.stressFactor - 1) * EGS_PHI * 0.15 + modulation.gradientKnot * 0.08);
  return round(Math.max(0, Math.min(1, raw)), 4);
}

/** EGS cadence transform for block N+1 phase window (seconds). */
export function computeEgsInterval(medianBlockSec) {
  const median = Math.max(1, Number(medianBlockSec) || PULSE_CADENCE_SEC);
  return Math.round(median / EGS_PHI + median / EGS_PHI ** 2);
}

async function fetchJson(url, ms = 8000) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-WavefieldSolar/1.0' },
      signal: ctrl?.signal,
    });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return res.json();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchText(url, ms = 8000) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'text/plain', 'User-Agent': 'SS-Vibelandia-WavefieldSolar/1.0' },
      signal: ctrl?.signal,
    });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return res.text();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Parse latest daily sunspot number from SWPC daily-solar-indices.txt */
export function parseSwpcDailySunspot(text) {
  const lines = String(text).split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith(':') || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length >= 4 && /^\d{4}$/.test(parts[0])) {
      const ssn = parseInt(parts[3], 10);
      if (Number.isFinite(ssn)) {
        return { date: `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`, sunspotNumber: ssn };
      }
    }
  }
  return null;
}

async function fetchLiveSunspotNumber() {
  try {
    const txt = await fetchText('https://services.swpc.noaa.gov/text/daily-solar-indices.txt');
    const parsed = parseSwpcDailySunspot(txt);
    if (parsed) return { ...parsed, source: 'NOAA SWPC daily-solar-indices' };
  } catch (err) {
    console.warn('[wavefield-solar] sunspot fetch', err.message);
  }
  return {
    date: null,
    sunspotNumber: CANONICAL_SUNSPOT_NUMBER,
    source: 'canonical snapshot SYN-SUN-2026-REV7',
  };
}

async function fetchLiveActiveRegions() {
  try {
    const rows = await fetchJson('https://services.swpc.noaa.gov/json/solar_regions.json');
    if (!Array.isArray(rows) || !rows.length) throw new Error('empty regions');
    const mapped = rows
      .filter((r) => r && r.region)
      .slice(0, 12)
      .map((r) => ({
        id: `AR${r.region}`,
        codename: resolveRegionCodename(`AR${r.region}`),
        location: r.location || '—',
        classification: String(r.mag_class || r.magnetic_class || 'unknown').toLowerCase(),
        areaMuHem: Number(r.area) || 0,
        role: 'Live NOAA SWPC solar region',
      }));
    if (mapped.length) return { regions: mapped, source: 'NOAA SWPC solar_regions.json' };
  } catch (err) {
    console.warn('[wavefield-solar] AR fetch', err.message);
  }
  return { regions: CANONICAL_ACTIVE_REGIONS, source: 'canonical snapshot SYN-SUN-2026-REV7' };
}

async function fetchBlockCadence() {
  try {
    const blocks = await fetchJson('https://mempool.space/api/blocks');
    if (!Array.isArray(blocks) || blocks.length < 2) throw new Error('insufficient blocks');
    const intervals = [];
    for (let i = 0; i < Math.min(blocks.length - 1, 12); i += 1) {
      intervals.push(blocks[i].timestamp - blocks[i + 1].timestamp);
    }
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    return {
      medianBlockSec: median,
      egsIntervalSec: computeEgsInterval(median),
      tipHeight: blocks[0].height,
      source: 'mempool.space/api/blocks',
    };
  } catch (err) {
    console.warn('[wavefield-solar] block cadence', err.message);
    return {
      medianBlockSec: PULSE_CADENCE_SEC,
      egsIntervalSec: computeEgsInterval(PULSE_CADENCE_SEC),
      tipHeight: null,
      source: 'EGS default cadence',
    };
  }
}

export function honestyBoundary() {
  return {
    module: 'btc_buffalo.honesty.HonestyBoundary',
    mined_block: false,
    readOnlyVerification: true,
    zeroWattMetrology: true,
    narrative: 'Zero-watt alignment receipts — not live network mining',
  };
}

export async function runWavefieldOscillatorPipeline({ force = false } = {}) {
  if (!force && mem.latest && Date.now() - mem.at < CACHE_MS) return mem.latest;

  const [ssnRow, arRow, cadence] = await Promise.all([
    fetchLiveSunspotNumber(),
    fetchLiveActiveRegions(),
    fetchBlockCadence(),
  ]);

  const modulation = modulateWavefieldParams({
    sunspotNumber: ssnRow.sunspotNumber,
    activeRegions: arRow.regions,
  });

  const liveNodes = arRow.regions.map((r) =>
    castActiveSolarNode(r, ssnRow.sunspotNumber),
  );
  const egsStabilityIndex = calculateHolographicLimit({
    live_nodes: liveNodes.map((n) => ({
      latitude: n.latitude,
      longitude: n.longitude,
      area_millionths: n.areaMillionths,
    })),
  });
  const holographicPacingMatrix = buildHolographicPacingMatrix({
    globalSunspotCount: ssnRow.sunspotNumber,
    liveNodes,
    egsStabilityIndex,
  });

  const holographicStabilityIndex = computeHolographicStabilityIndex(modulation);
  const fieldSamples = sampleWavefieldRing(36, 24);

  const payload = {
    schema: 'dph-wavefield-solar/v2',
    documentId: DOCUMENT_ID,
    dphGpuVersion: DPH_GPU_VERSION,
    issuedAt: new Date().toISOString(),
    framework: 'Syntheverse Core Framework Architecture',
    dataBus: {
      hydrogenLineGhz: HYDROGEN_LINE_GHZ,
      hydrogenLineMhz: HYDROGEN_LINE_MHZ,
    },
    egsPhi: EGS_PHI,
    clockSkewPs: CLOCK_SKEW_PS,
    equation: {
      ideal: 'E_s(θ) = Σ sin(k·θ) / φ^k',
      terms: 24,
    },
    telemetry: {
      sunspot: ssnRow,
      activeRegions: arRow.regions,
      activeRegionsSource: arRow.source,
      cadence,
    },
    modulation,
    holographicStabilityIndex,
    egsStabilityIndex,
    holographicPacingMatrix,
    implementation: {
      typeContract: 'ssvibelandia_core/src/metrology/types.ts',
      phaseFilter: 'ssvibelandia_core/src/hardware/clock_skew_filter.py',
      runtimeGate: 'lib/metrology/wavefield-types.mjs',
      clockSkewFilter: 'lib/metrology/clock-skew-filter.mjs',
      testCoverageFloor: TEST_COVERAGE_FLOOR,
    },
    fieldSample: {
      nodes: fieldSamples.length,
      min: round(Math.min(...fieldSamples.map((s) => s.value)), 6),
      max: round(Math.max(...fieldSamples.map((s) => s.value)), 6),
      meridian0: round(fieldSamples[0].value, 6),
    },
    honestyBoundary: honestyBoundary(),
    downstream: {
      clockSkewMitigation: true,
      btcBuffaloZeroWatt: true,
      erdosFractalLattice: true,
      revision: 'SYN-SUN-2026-REV7',
      impactCount: 9,
      infrastructureImpacts: [...INFRASTRUCTURE_IMPACTS],
    },
    api: '/api/dph-wavefield-solar',
    whitepaperId: 'syn-sun-wavefield-oscillator',
  };

  mem.latest = payload;
  mem.at = Date.now();
  return payload;
}

export async function getWavefieldSolarState() {
  return runWavefieldOscillatorPipeline();
}
