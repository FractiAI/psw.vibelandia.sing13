/**
 * Multi-source cross-reference for Turner passive herd synthesis.
 * Maximizes *honest* operational fidelity toward collar-grade truth by requiring
 * independent feeds to agree — never claims GPS collar fixes without collar/VHR inputs.
 */
import { turnerFusionSurfaceCalibEnabled } from './turner-fusion-calibration.mjs';

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

/** Hard cap without animal-level sensors (collar, VHR optical census, aerial ML). */
export const COLLAR_GRADE_CEILING_PCT = 48;
export const INDIVIDUAL_ANIMAL_CEILING_PCT = 8;

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function sign(v) {
  if (v == null || !Number.isFinite(v)) return 0;
  if (v > 0.15) return 1;
  if (v < -0.15) return -1;
  return 0;
}

/** Grid weight entropy 0–1 (higher = more spatial structure in fuse field). */
function gridEntropy(weights) {
  if (!weights?.length) return 0;
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  let h = 0;
  for (const w of weights) {
    const p = w / sum;
    if (p > 1e-12) h -= p * Math.log(p);
  }
  const maxH = Math.log(weights.length);
  return maxH > 0 ? h / maxH : 0;
}

/** Optional Open-Meteo leaf area index (vegetation structure proxy). */
export async function fetchOpenMeteoLaiPass(pastures) {
  const withGeo = pastures.filter((p) => p.lat != null && p.lon != null);
  const out = {
    fetchedAt: new Date().toISOString(),
    source: 'Open-Meteo · ECMWF leaf area index (vegetation structure proxy)',
    endpoint: FORECAST_API,
    variable: 'leaf_area_index',
    pastures: [],
    error: null,
  };
  if (!withGeo.length) {
    out.error = 'no pasture coordinates';
    return out;
  }
  try {
    const lat = withGeo.map((p) => p.lat).join(',');
    const lon = withGeo.map((p) => p.lon).join(',');
    const url = `${FORECAST_API}?latitude=${lat}&longitude=${lon}&hourly=leaf_area_index&forecast_days=1`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 14000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-TurnerXRef/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`lai ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [data];
    withGeo.forEach((pasture, i) => {
      const block = list[i] || list[0];
      const series = block?.hourly?.leaf_area_index || [];
      const valid = series.filter((v) => v != null);
      const latest = valid.length ? valid[valid.length - 1] : null;
      const mean = valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        leafAreaIndex: latest,
        leafAreaIndexMean: mean,
      });
    });
  } catch (e) {
    out.error = e.message || 'lai_fetch_failed';
    withGeo.forEach((pasture) => {
      out.pastures.push({
        id: pasture.id,
        name: pasture.name,
        leafAreaIndex: null,
        leafAreaIndexMean: null,
      });
    });
  }
  return out;
}

function laiZScore(lai, meanNetwork) {
  const v = num(lai);
  if (v == null) return null;
  const m = num(meanNetwork) ?? 1.2;
  const sd = 0.85;
  const z = (v - m) / sd;
  return Math.max(-2.5, Math.min(2.5, z));
}

/**
 * Score one pasture across independent source families.
 */
function scorePastureCrossRef(pasture, ctx) {
  const sat = ctx.satById[pasture.id] || {};
  const lst = ctx.lstById[pasture.id] || {};
  const fenceP = ctx.fenceById[pasture.id] || {};
  const lai = ctx.laiById[pasture.id];

  const soilM = num(sat.soilMoistureM3M3 ?? sat.soilMoistureMean);
  const soilZ = soilM != null ? (0.22 - soilM) / 0.08 : null;
  const lstZ = num(lst.skinTempZ);
  const et0Z = num(sat.et0Z);
  const laiZ = laiZScore(lai?.leafAreaIndex ?? lai?.leafAreaIndexMean, ctx.laiNetworkMean);

  const forageSigns = [sign(soilZ), sign(lstZ), sign(et0Z), sign(laiZ)].filter((s) => s !== 0);
  let forageAgreement = 0;
  if (forageSigns.length >= 2) {
    const same = forageSigns.every((s) => s === forageSigns[0]);
    forageAgreement = same ? 0.85 : 0.35;
  } else if (forageSigns.length === 1) {
    forageAgreement = 0.5;
  }

  const geometrySources = [];
  if (fenceP.gateSource === 'gps-steel') geometrySources.push(1);
  if (ctx.steelPack?.osmWayCount > 0) geometrySources.push(1);
  if (ctx.fence?.usedSteelGates) geometrySources.push(1);
  const geometryAgreement = geometrySources.length >= 2 ? 0.9 : geometrySources.length === 1 ? 0.55 : 0.2;

  const rfSources = [];
  if (ctx.fence?.passiveSdrSpectrumMapping) rfSources.push(1);
  if (num(ctx.iqRms) != null) rfSources.push(1);
  if (num(fenceP.lockIn) != null && fenceP.lockIn > 0.5) rfSources.push(1);
  const rfAgreement = rfSources.length >= 2 ? 0.88 : rfSources.length === 1 ? 0.5 : 0.15;

  const sources = [];

  function addSource(id, label, present, contribution, detail) {
    sources.push({ id, label, present: !!present, contribution: Number(contribution.toFixed(3)), detail });
  }

  addSource('soil_moisture', 'Open-Meteo soil moisture', soilM != null, soilM != null ? 0.09 : 0, soilM);
  addSource(
    'skin_temp',
    'NASA POWER skin temperature z',
    lstZ != null,
    lstZ != null ? 0.07 : 0,
    lst.skinTempC,
  );
  if (turnerFusionSurfaceCalibEnabled()) {
    addSource('et0', 'Open-Meteo ET₀ z', et0Z != null, et0Z != null ? 0.05 : 0, et0Z);
  }
  addSource('lai', 'Open-Meteo leaf area index', laiZ != null, laiZ != null ? 0.06 : 0, lai?.leafAreaIndex);
  addSource(
    'sdr_spectrum',
    'OpenWebRX per-gate spectrum',
    ctx.fence?.passiveSdrSpectrumMapping === true,
    ctx.fence?.passiveSdrSpectrumMapping ? 0.1 : 0,
    ctx.spectrumChunkCount,
  );
  addSource('sdr_rms', 'OpenWebRX IQ RMS', num(ctx.iqRms) != null, num(ctx.iqRms) != null ? 0.05 : 0, ctx.iqRms);
  addSource(
    'fence_steel',
    'GPS / OSM fence geometry',
    fenceP.gateSource === 'gps-steel' || ctx.steelPack?.localFeatureCount > 0,
    fenceP.gateSource === 'gps-steel' ? 0.09 : ctx.steelPack?.osmWayCount ? 0.05 : 0,
    fenceP.gateSource,
  );
  addSource(
    'magnetic',
    'NOAA geomagnetic stack',
    ctx.magnetic?.couplingIndex != null,
    ctx.magnetic?.couplingIndex != null ? 0.04 : 0,
    ctx.magnetic?.couplingIndex,
  );
  addSource(
    'power_grid',
    'HIFLD transmission leverage',
    (ctx.powerGrid?.lineCount ?? 0) > 0,
    (ctx.powerGrid?.lineCount ?? 0) > 0 ? 0.04 : 0,
    ctx.powerGrid?.lineCount,
  );
  addSource('noaa_kp', 'NOAA Kp / space weather', num(ctx.kpLive) != null, num(ctx.kpLive) != null ? 0.03 : 0, ctx.kpLive);

  const presentCount = sources.filter((s) => s.present).length;
  const contributionSum = sources.reduce((a, s) => a + (s.present ? s.contribution : 0), 0);

  const entropy = gridEntropy(pasture.weights);
  const spatialStructure = entropy > 0.55 ? 0.08 : entropy > 0.35 ? 0.04 : 0;

  const agreementMean = (forageAgreement + geometryAgreement + rfAgreement) / 3;
  const placementConfidence = Math.min(
    1,
    Math.max(0.12, contributionSum * 2.2 + agreementMean * 0.35 + spatialStructure),
  );

  const pasturePlacementPct = Math.min(
    COLLAR_GRADE_CEILING_PCT,
    Math.round((contributionSum * 100 + agreementMean * 22 + spatialStructure * 100) * 10) / 10,
  );

  return {
    id: pasture.id,
    name: pasture.name,
    placementConfidence: Number(placementConfidence.toFixed(3)),
    pasturePlacementGradePct: pasturePlacementPct,
    sourceCount: presentCount,
    forageAgreement: Number(forageAgreement.toFixed(3)),
    geometryAgreement: Number(geometryAgreement.toFixed(3)),
    rfAgreement: Number(rfAgreement.toFixed(3)),
    gridEntropy: Number(entropy.toFixed(3)),
    sources,
    signals: { soilZ, lstZ, et0Z, laiZ, lockIn: fenceP.lockIn },
  };
}

/**
 * Cross-reference all feeds; compute collar-grade *proximity* (not collar equivalence).
 */
export function computeCrossSourceFidelity(ctx) {
  const pastures = ctx.pastures || [];
  const perPasture = pastures.map((p) => scorePastureCrossRef(p, ctx));

  const meanPlacement =
    perPasture.reduce((s, p) => s + p.pasturePlacementGradePct, 0) / Math.max(1, perPasture.length);
  const meanConfidence =
    perPasture.reduce((s, p) => s + p.placementConfidence, 0) / Math.max(1, perPasture.length);

  const globalSources = new Map();
  for (const p of perPasture) {
    for (const s of p.sources) {
      if (!globalSources.has(s.id)) {
        globalSources.set(s.id, { ...s, pasturesPresent: 0 });
      }
      if (s.present) globalSources.get(s.id).pasturesPresent += 1;
    }
  }

  const fusePct = num(ctx.fuseFidelityPct) ?? 0;
  let collarGradeProximityPct = Math.min(
    COLLAR_GRADE_CEILING_PCT,
    Number((meanPlacement * 0.72 + meanConfidence * 18 + Math.min(fusePct, 100) * 0.08).toFixed(1)),
  );

  if (ctx.syntheticDataAllowed) {
    collarGradeProximityPct = Math.min(COLLAR_GRADE_CEILING_PCT, collarGradeProximityPct * 0.65);
  }

  const individualAnimalProximityPct = Math.min(
    INDIVIDUAL_ANIMAL_CEILING_PCT,
    Number((collarGradeProximityPct * 0.14 + (ctx.fence?.passiveSdrSpectrumMapping ? 1.5 : 0)).toFixed(1)),
  );

  const forageAgMean =
    perPasture.reduce((s, p) => s + p.forageAgreement, 0) / Math.max(1, perPasture.length);
  const geometryAgMean =
    perPasture.reduce((s, p) => s + p.geometryAgreement, 0) / Math.max(1, perPasture.length);
  const rfAgMean = perPasture.reduce((s, p) => s + p.rfAgreement, 0) / Math.max(1, perPasture.length);

  return {
    at: new Date().toISOString(),
    method: 'multi-source-cross-reference',
    collarGradeProximityPct,
    individualAnimalProximityPct,
    meanPasturePlacementGradePct: Number(meanPlacement.toFixed(1)),
    meanPlacementConfidence: Number(meanConfidence.toFixed(3)),
    fuseChannelPct: fusePct,
    ceilings: {
      collarGradeWithoutCollarOrVhr: COLLAR_GRADE_CEILING_PCT,
      individualAnimalWithoutVhr: INDIVIDUAL_ANIMAL_CEILING_PCT,
    },
    crossReference: {
      forageAgreementMean: Number(forageAgMean.toFixed(3)),
      geometryAgreementMean: Number(geometryAgMean.toFixed(3)),
      rfAgreementMean: Number(rfAgMean.toFixed(3)),
    },
    globalSources: [...globalSources.values()],
    perPasture,
    honesty:
      'Collar-grade proximity = independent feeds agree (soil, LST, LAI, ET₀, SDR, fence geometry, magnetic, grid). It is NOT GPS collar position or per-animal identity. Ceiling ~48% without collars or sub-meter census imagery.',
    note:
      'Placement field weights are boosted where forage and RF families agree; low-confidence pastures spread herd samples more uniformly.',
  };
}

/** Boost normalized placement weights when cross-source confidence is high. */
export function applyCrossSourceWeightBoost(radar, crossSource) {
  if (!radar?.pastures?.length || !crossSource?.perPasture) return radar;
  const byId = Object.fromEntries(crossSource.perPasture.map((p) => [p.id, p]));
  for (const pasture of radar.pastures) {
    const xref = byId[pasture.id];
    if (!xref || !pasture.weights?.length) continue;
    pasture.crossSource = {
      placementConfidence: xref.placementConfidence,
      pasturePlacementGradePct: xref.pasturePlacementGradePct,
      sourceCount: xref.sourceCount,
      forageAgreement: xref.forageAgreement,
      geometryAgreement: xref.geometryAgreement,
      rfAgreement: xref.rfAgreement,
    };
    const boost = 0.85 + xref.placementConfidence * 0.35;
    const forageBias = 0.92 + xref.forageAgreement * 0.18;
    const scaled = pasture.weights.map((w) => w * boost * forageBias);
    const sum = scaled.reduce((a, b) => a + b, 0) || 1;
    pasture.weights = scaled.map((w) => Number((w / sum).toFixed(6)));
  }
  return radar;
}

/**
 * Run LAI fetch + cross-reference in one call (used from live pipeline).
 */
export async function enrichRadarWithCrossSource(radar, ctx) {
  let laiPass = ctx.laiPass ?? null;
  if (!laiPass?.pastures?.length && ctx.geography?.pastures) {
    laiPass = await fetchOpenMeteoLaiPass(ctx.geography.pastures);
  }
  const laiVals = (laiPass?.pastures || []).map((p) => p.leafAreaIndex ?? p.leafAreaIndexMean).filter((v) => v != null);
  const laiNetworkMean = laiVals.length ? laiVals.reduce((a, b) => a + b, 0) / laiVals.length : 1.2;
  const laiById = Object.fromEntries((laiPass?.pastures || []).map((p) => [p.id, p]));

  const satById = Object.fromEntries((ctx.satellite?.pastures || []).map((p) => [p.id, p]));
  const lstById = Object.fromEntries((ctx.lstPass?.pastures || []).map((p) => [p.id, p]));
  const fenceById = Object.fromEntries((ctx.fence?.pastures || []).map((p) => [p.id, p]));

  const crossSource = computeCrossSourceFidelity({
    pastures: radar.pastures,
    satById,
    lstById,
    laiById,
    laiNetworkMean,
    fenceById,
    fence: ctx.fence,
    magnetic: ctx.magnetic,
    powerGrid: ctx.powerGrid,
    steelPack: ctx.steelPack,
    iqRms: ctx.iqRms,
    spectrumChunkCount: ctx.spectrumChunkCount,
    kpLive: ctx.kpLive,
    fuseFidelityPct: radar.fidelityPct,
    syntheticDataAllowed: ctx.syntheticDataAllowed,
  });

  applyCrossSourceWeightBoost(radar, crossSource);
  radar.crossSource = crossSource;
  radar.collarGradeProximityPct = crossSource.collarGradeProximityPct;
  radar.individualAnimalProximityPct = crossSource.individualAnimalProximityPct;
  return { radar, crossSource, laiPass };
}
