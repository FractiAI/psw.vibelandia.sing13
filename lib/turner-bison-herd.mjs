/**
 * Turner Bison Herd — live ingest → EGS scale → passive radar fuse → synthesis (NSPFRNP).
 * Fence-line PLL (1420 MHz waveguide) cross-referenced with satellite soil-moisture pass.
 * NOAA SWPC (ionospheric correction), OpenWebRX RF (real), public registry baseline (cited).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';
import { turnerAllowSynthetic } from './turner-data-policy.mjs';
import { spectrumChunksFromIqBase64 } from './sdr-fence-spectrum.mjs';

export const EGS_PHI = 1.618;
export const HYDROGEN_LINE_MHZ = 1420.405751768;
export const REDIS_KEY = 'qv:turner-bison:stream:v1';
export const MAX_MATRIX = 48;

const mem = globalThis.__qvTurnerBison || (globalThis.__qvTurnerBison = { matrix: [], latest: null });

const NOAA = {
  f107: 'https://services.swpc.noaa.gov/json/f107_cm_flux.json',
  kp1m: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
  regions: 'https://services.swpc.noaa.gov/json/solar_regions.json',
  radioFlux: 'https://services.swpc.noaa.gov/json/solar-radio-flux.json',
};

async function fetchJson(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerBison/1.0' },
    });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function lastRow(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const last = rows[rows.length - 1];
  if (Array.isArray(last) && rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    const keys = Object.keys(rows[0]);
    const obj = {};
    keys.forEach((k, i) => {
      obj[k] = last[i];
    });
    return obj;
  }
  return last;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function loadPublicRegistry() {
  const raw = await readFile(join(process.cwd(), 'data/turner-public-registry.json'), 'utf8');
  return JSON.parse(raw);
}

export async function fetchNoaaSpaceWeather() {
  const out = {
    fetchedAt: new Date().toISOString(),
    sources: { f107: NOAA.f107, kp1m: NOAA.kp1m, regions: NOAA.regions },
    f107Sfu: null,
    f107Time: null,
    kpIndex: null,
    kpTime: null,
    sunspotRegions: [],
    sunspotCount: null,
    activeArea: null,
    error: null,
  };

  try {
    const [f107Raw, kpRaw, regionsRaw] = await Promise.all([
      fetchJson(NOAA.f107).catch(() => fetchJson(NOAA.radioFlux)),
      fetchJson(NOAA.kp1m),
      fetchJson(NOAA.regions),
    ]);

    const fRow = lastRow(f107Raw);
    if (fRow) {
      out.f107Sfu =
        num(fRow.flux) ??
        num(fRow.observed) ??
        num(fRow.f107) ??
        num(fRow.flux_10cm) ??
        num(fRow.radio_flux);
      out.f107Time = fRow.time_tag || fRow.date || null;
    }

    const kRow = lastRow(kpRaw);
    if (kRow) {
      out.kpIndex =
        num(kRow.estimated_kp) ??
        num(kRow.kp_index) ??
        num(kRow.kp) ??
        num(kRow.planetary_k_index);
      out.kpTime = kRow.time_tag || null;
    }

    if (Array.isArray(regionsRaw)) {
      const active = regionsRaw.filter((r) => {
        const spots = num(r.num_spots) ?? num(r.number_spots) ?? 0;
        return spots > 0 || String(r.location || '').includes('N') || String(r.location || '').includes('S');
      });
      out.sunspotRegions = active.slice(-12).map((r) => ({
        region: r.region ?? r.region_number ?? r.number,
        location: r.location,
        numSpots: num(r.num_spots) ?? num(r.number_spots),
        status: r.status,
      }));
      const sorted = [...active].sort(
        (a, b) => (num(b.num_spots) ?? 0) - (num(a.num_spots) ?? 0),
      );
      const top = sorted[0];
      if (top) {
        out.sunspotCount = num(top.num_spots) ?? num(top.number_spots);
        const rn = top.region ?? top.region_number ?? top.number;
        out.activeArea = rn != null ? `AR${rn}` : null;
      }
    }
  } catch (e) {
    out.error = e.message || 'NOAA fetch failed';
  }

  return out;
}

export function iqRmsFromBase64(iqBase64) {
  if (!iqBase64) return null;
  const buf = Buffer.from(iqBase64, 'base64');
  if (buf.byteLength < 8) return null;
  const view = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i + 1 < view.length; i += 2) {
    const iVal = view[i];
    const qVal = view[i + 1];
    sum += iVal * iVal + qVal * qVal;
    pairs += 1;
  }
  if (!pairs) return null;
  return Math.sqrt(sum / pairs);
}

export function wirePhaseMicroseconds(rms, kpLive) {
  if (!turnerAllowSynthetic()) {
    const r = num(rms);
    const k = num(kpLive);
    if (r == null && k == null) return null;
    const base = r != null ? r * 420 : 0;
    const kpAdj = k != null ? k * 0.35 : 0;
    return Number((base + kpAdj).toFixed(2));
  }
  const base = 8.2 + (rms ?? 0) * 420;
  const kpAdj = (kpLive ?? 1) * 0.35;
  return Number((base + kpAdj).toFixed(2));
}

export function egsSquashKp(kpLive, floor = 1.0) {
  if (!turnerAllowSynthetic()) {
    const k = num(kpLive);
    return k != null ? Number(k.toFixed(2)) : floor;
  }
  const k = num(kpLive);
  if (k == null) return floor;
  const scaled = k / EGS_PHI;
  const squashed = floor + (scaled % 0.12) * 0.02;
  return Math.min(floor + 0.08, Math.max(floor, Number(squashed.toFixed(2))));
}

export function turnerSdrIngestEnv() {
  const wss = process.env.TURNER_SDR_WSS_URL?.trim();
  const endpoints =
    wss && /^wss:\/\//i.test(wss)
      ? [{ url: wss, label: process.env.TURNER_SDR_LABEL?.trim() || 'operator-sdr' }]
      : undefined;
  let tuneHz;
  const tz = process.env.TURNER_SDR_TUNE_HZ?.trim();
  if (tz && /^\d+$/.test(tz)) tuneHz = Number(tz);
  const live =
    process.env.TURNER_OPENWEBRX_LIVE === '1' ||
    process.env.TURNER_OPENWEBRX_LIVE === 'true' ||
    process.env.TURNER_SDR_LIVE === '1' ||
    process.env.TURNER_SDR_LIVE === 'true';
  const preferSpectrum =
    process.env.TURNER_SDR_FFT === '1' ||
    process.env.TURNER_SDR_FFT === 'true' ||
    (!!wss && process.env.TURNER_SDR_FFT !== '0' && process.env.TURNER_SDR_FFT !== 'false');
  return { endpoints, tuneHz, live, preferSpectrum };
}

export async function fetchRfHydrogenProxy() {
  const { getWebSdrFrame, HYDROGEN_TUNE_HZ } = await import('./openwebrx-ingest.mjs');
  const sdr = turnerSdrIngestEnv();
  const tuneHz = sdr.tuneHz ?? HYDROGEN_TUNE_HZ;
  try {
    const { frame, live, stale, captureError } = await getWebSdrFrame({
      live: sdr.live,
      endpoints: sdr.endpoints,
      tuneHz,
      preferSpectrum: sdr.preferSpectrum,
    });
    const rms = frame?.iqBase64 ? iqRmsFromBase64(frame.iqBase64) : null;
    const spectrumChunkRmss = frame?.iqBase64 ? spectrumChunksFromIqBase64(frame.iqBase64) : null;
    return {
      ok: !!frame,
      live,
      stale,
      captureError: captureError || null,
      tuneHz,
      carrierMhz: HYDROGEN_LINE_MHZ,
      capturedAt: frame?.capturedAt || null,
      endpointLabel: frame?.endpointLabel || null,
      frameType: frame?.frameType || null,
      iqRms: rms,
      sampleCount: frame?.sampleCount || null,
      spectrumChunkRmss,
      spectrumChunkCount: spectrumChunkRmss?.length ?? null,
      source: 'openwebrx-1420mhz',
    };
  } catch (e) {
    return { ok: false, error: e.message, source: 'openwebrx-1420mhz' };
  }
}

function synthesisFromRegistry(registry, noaa, rf, ingest) {
  const b = registry.operationalBaseline;
  const dailyPct = b.metabolicPct * 100;
  const kpLive = noaa.kpIndex;
  const kpEgs = egsSquashKp(kpLive, b.kpFloorTarget);

  return {
    herd: {
      headCount: b.headCount,
      meanWeightLbs: b.meanWeightLbs,
      velocity: `${b.velocityMph} mph (${b.velocityKmh} km/h)`,
      source: 'public-registry-baseline',
    },
    biomass: {
      admLbsPerAcre: b.admLbsPerAcre,
      metabolic: `${dailyPct}% body weight / day`,
      dailyForageLbs: b.dailyForageLbs,
      dailyForageTons: b.dailyForageTons,
      source: 'public-registry-baseline',
    },
    environment: {
      f107LiveSfu: noaa.f107Sfu,
      f107AnchorSfu: b.solarFluxAnchorSfu,
      f107Delta: noaa.f107Sfu != null ? Number((noaa.f107Sfu - b.solarFluxAnchorSfu).toFixed(1)) : null,
      sunspotLiveCount: noaa.sunspotCount,
      sunspotAnchorCount: b.sunspotAnchorCount,
      activeAreaLive: noaa.activeArea,
      activeAreaAnchor: b.activeAreaAnchor,
      kpLive,
      kpEgsFloor: kpEgs,
      kpAnchor: b.kpFloorTarget,
    },
    wire: {
      pllMicroseconds: ingest.wirePhaseUs,
      iqRms: rf.iqRms,
      rfSource: rf.source,
      rfCapturedAt: rf.capturedAt,
      passiveSdrSpectrumChunks: rf.spectrumChunkCount ?? null,
    },
  };
}

export async function runTurnerBisonPipeline() {
  const registry = await loadPublicRegistry();
  const { runPassiveRadarFusion } = await import('./turner-radar-fusion.mjs');
  const [noaa, rf] = await Promise.all([fetchNoaaSpaceWeather(), fetchRfHydrogenProxy()]);

  const kpLive = noaa.kpIndex;
  const wirePhaseUs = wirePhaseMicroseconds(rf.iqRms, kpLive);
  const ingestAt = new Date().toISOString();

  const ingest = {
    at: ingestAt,
    stage: 'INGEST',
    wirePhaseUs,
    noaa,
    rf,
    registryDocumentRef: registry.documentRef,
  };

  const scale = {
    at: new Date().toISOString(),
    stage: 'SCALE',
    egsPhi: EGS_PHI,
    kpLive,
    kpEgsFloor: egsSquashKp(kpLive, registry.operationalBaseline.kpFloorTarget),
  };

  const { fence, satellite, lstPass, steelPack, magnetic, powerGrid, radar, laiPass } =
    await runPassiveRadarFusion({
      wirePhaseUs,
      iqRms: rf.iqRms,
      kpLive,
      ingestAt,
      spectrumChunks: rf.spectrumChunkRmss ?? null,
      syntheticDataAllowed: turnerAllowSynthetic(),
    });

  const synthesis = {
    at: new Date().toISOString(),
    stage: 'SYNTHESIS',
    ...synthesisFromRegistry(registry, noaa, rf, ingest),
    radar: {
      fidelityPct: radar.fidelityPct,
      correlationMean: radar.correlationMean,
      method: radar.method,
      analogy: radar.analogy,
      placementSeed: radar.placementSeed,
      pastures: radar.pastures,
      crossSource: radar.crossSource ?? null,
      collarGradeProximityPct: radar.collarGradeProximityPct ?? null,
      individualAnimalProximityPct: radar.individualAnimalProximityPct ?? null,
    },
  };

  const stream = {
    schema: 'turner-bison-stream/v2',
    dataPolicy: turnerAllowSynthetic() ? 'mixed_synthetic_allowed' : 'real_sources_only',
    syntheticDataAllowed: turnerAllowSynthetic(),
    honestyNote: turnerAllowSynthetic()
      ? 'TURNER_ALLOW_SYNTHETIC is set: legacy synthetic soil fallback, φ-squashed Kp floor, and spatial fence phase may be used when feeds are missing.'
      : 'Dynamic inputs are remote APIs only (NOAA SWPC, Open-Meteo soil, OpenWebRX IQ, HIFLD, geomagnetic). No synthetic soil placeholders. Fence gate strengths are uniform from live Kp / IQ only (no fabricated spatial phase). Registry baselines are static published inputs, not live animal measurements. Default passive RF: internet OpenWebRX mapped to live fence coordinates — no on-premise Turner SDR required. Optional on-premise receive-only SDR can upgrade ability and fidelity when deployed. Accuracy improves when tuned with Turner teams on the ground (boundaries, fence truth, seasonal baselines).',
    groundCollaborationNote:
      'Accuracy and operational usefulness can be significantly improved by tuning in collaboration with Turner Enterprise teams on the ground — pasture boundaries, fence and gate corrections, SDR placement, and ranch-specific baselines — without requiring a full perimeter re-walk when public or prior survey data already exist.',
    humanInterventionRequired: false,
    publicAccess: true,
    documentRef: registry.documentRef,
    methodology: registry.operationalBaseline.methodology,
    positioning: 'passive-radar-synthesis',
    pipeline: { ingest, scale, radar, synthesis, magnetic, powerGrid, fence, satellite, lstPass, steelPack, laiPass },
    matrixRow: {
      at: synthesis.at,
      ingest,
      scale,
      synthesis,
    },
    fairExchange:
      'Fair Exchange Clause active — settlement may adjust in part depending on overall delivery, like tipping.',
  };

  mem.matrix.push(stream.matrixRow);
  if (mem.matrix.length > MAX_MATRIX) mem.matrix = mem.matrix.slice(-MAX_MATRIX);
  mem.latest = stream;

  if (upstashConfigured()) {
    await redisSetJson(REDIS_KEY, { latest: stream, matrix: mem.matrix }, 3600);
  }

  return stream;
}

export async function getTurnerBisonStream({ refresh = false } = {}) {
  if (!refresh && upstashConfigured()) {
    const cached = await redisGetJson(REDIS_KEY);
    if (cached?.latest) {
      mem.latest = cached.latest;
      mem.matrix = cached.matrix || [];
      const age = Date.now() - new Date(cached.latest.pipeline?.synthesis?.at || 0).getTime();
      if (age < 120_000) return cached.latest;
    }
  }

  if (!refresh && mem.latest) {
    const age = Date.now() - new Date(mem.latest.pipeline?.synthesis?.at || 0).getTime();
    if (age < 90_000) return mem.latest;
  }

  return runTurnerBisonPipeline();
}
