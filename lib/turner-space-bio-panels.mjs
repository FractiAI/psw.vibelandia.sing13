/**
 * Optional "ranch instrumentation" readouts: real public proxies only.
 * Always invoked from the live Turner pipeline (no feature flag) — each channel fails gracefully if its upstream drops.
 *
 * Honesty (NSPFRNP):
 * - CYGNSS / GNSS-R L1 DDM pasture products are NOT available as a simple live REST feed here;
 *   Panel A surfaces existing OpenWebRX + fence fuse metrics as reflectivity/coupling proxies.
 * - GOES ABI / sounder retrievals are NOT ingested; Panel B uses Open-Meteo blended forecast
 *   (surface / column-ish proxies) — not a herd "respiration plume" detector.
 * - Sentinel-2 red-edge stack is NOT decoded; Panel C uses STAC catalog metadata (Earth Search)
 *   plus existing Open-Meteo LAI + soil moisture from the main pipeline — no synthetic gap-fill.
 * - EGS φ is a display scalar only; we do NOT claim fractal clutter rejection or Kp = 1.00 lock.
 */
/** Display-only φ (same as fuse narrative); not used to assert clutter rejection. */
const EGS_PHI = 1.618;

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const EARTH_SEARCH_STAC = 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function networkCentroid(pastures) {
  const pts = (pastures || []).filter((p) => p.lat != null && p.lon != null);
  if (!pts.length) return null;
  let slat = 0;
  let slon = 0;
  for (const p of pts) {
    slat += p.lat;
    slon += p.lon;
  }
  return { lat: slat / pts.length, lon: slon / pts.length, count: pts.length };
}

function bboxFromPastures(pastures, pad = 0.35) {
  const pts = (pastures || []).filter((p) => p.lat != null && p.lon != null);
  if (!pts.length) return null;
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const p of pts) {
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }
  return [
    minLon - pad,
    minLat - pad,
    maxLon + pad,
    maxLat + pad,
  ];
}

async function fetchOpenMeteoMoistureColumn({ lat, lon }) {
  const out = {
    ok: false,
    source: 'Open-Meteo v1 forecast (blended models — not GOES sounder L2)',
    endpoint: OPEN_METEO,
    fetchedAt: new Date().toISOString(),
    dewpointC: null,
    rhPct: null,
    tempC: null,
    timeUtc: null,
    error: null,
  };
  if (lat == null || lon == null) {
    out.error = 'no_centroid';
    return out;
  }
  try {
    const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&hourly=dew_point_2m,relative_humidity_2m,temperature_2m&forecast_hours=6`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'SS-Vibelandia-SpaceBio/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = await res.json();
    const times = data?.hourly?.time || [];
    const dew = data?.hourly?.dew_point_2m || [];
    const rh = data?.hourly?.relative_humidity_2m || [];
    const tc = data?.hourly?.temperature_2m || [];
    const i = times.length - 1;
    if (i < 0) throw new Error('no_hourly');
    out.ok = true;
    out.timeUtc = times[i] ?? null;
    out.dewpointC = num(dew[i]);
    out.rhPct = num(rh[i]);
    out.tempC = num(tc[i]);
  } catch (e) {
    out.error = e.message || 'open_meteo_failed';
  }
  return out;
}

async function fetchSentinel2StacHead(bbox) {
  const out = {
    ok: false,
    source: 'Element 84 Earth Search · STAC Sentinel-2 L2A (metadata only)',
    endpoint: EARTH_SEARCH_STAC,
    fetchedAt: new Date().toISOString(),
    sceneDatetime: null,
    sceneId: null,
    cloudCover: null,
    bbox,
    error: null,
  };
  if (!bbox || bbox.length !== 4) {
    out.error = 'no_bbox';
    return out;
  }
  const [w, s, e, n] = bbox;
  const url = `${EARTH_SEARCH_STAC}?limit=1&bbox=${encodeURIComponent(`${w},${s},${e},${n}`)}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 14000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/geo+json', 'User-Agent': 'SS-Vibelandia-SpaceBio/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`stac ${res.status}`);
    const gj = await res.json();
    const feat = gj?.features?.[0];
    if (!feat) throw new Error('no_features');
    out.ok = true;
    out.sceneId = feat.id || feat.properties?.id || null;
    out.sceneDatetime = feat.properties?.datetime || feat.properties?.created || null;
    out.cloudCover = num(feat.properties?.['eo:cloud_cover']);
  } catch (e) {
    out.error = e.message || 'stac_failed';
  }
  return out;
}

function linesReflectivity({ rf, fence, radar }) {
  const lines = [];
  lines.push('CYGNSS / GNSS-R L1 DDM: NOT INGESTED (no live pasture REST in this build).');
  lines.push('NASA CYGNSS science products require Earthdata + granule processing — future hook.');
  lines.push('—');
  lines.push(`OpenWebRX carrier: ${rf?.carrierMhz != null ? `${Number(rf.carrierMhz).toFixed(3)} MHz` : '—'} · label: ${rf?.source || '—'}`);
  lines.push(`IQ RMS (buffer): ${rf?.iqRms != null ? Number(rf.iqRms).toFixed(6) : '—'} · chunks: ${rf?.spectrumChunkCount ?? '—'}`);
  lines.push(`PLL proxy µs: ${radar?.fenceChannel?.wirePhaseUs ?? '—'} · spectrum→gates: ${radar?.fenceChannel?.passiveSdrSpectrumMapping ? 'YES' : 'NO'}`);
  const means = (fence?.pastures || []).map((p) => p.meanReturn).filter((x) => num(x) != null);
  if (means.length) {
    const avg = means.reduce((a, b) => a + b, 0) / means.length;
    lines.push(`Fence-line mean coupling (pastures n=${means.length}): ${avg.toFixed(4)} (model, not CYGNSS RCS)`);
  } else {
    lines.push('Fence-line mean coupling: —');
  }
  return lines;
}

function linesTroposphere({ openMeteo, registry }) {
  const lines = [];
  if (!openMeteo?.ok) {
    lines.push(`ATMOSPHERIC PROXY: UNAVAILABLE (${openMeteo?.error || 'unknown'})`);
    lines.push('No synthetic fill — channel blank per real_sources_only discipline.');
    return lines;
  }
  lines.push(`Open-Meteo time (UTC): ${openMeteo.timeUtc || '—'}`);
  lines.push(`T₂m: ${openMeteo.tempC != null ? `${openMeteo.tempC.toFixed(1)} °C` : '—'}`);
  lines.push(`RH: ${openMeteo.rhPct != null ? `${openMeteo.rhPct.toFixed(0)} %` : '—'}`);
  lines.push(`Dewpoint: ${openMeteo.dewpointC != null ? `${openMeteo.dewpointC.toFixed(1)} °C` : '—'}`);
  lines.push('—');
  lines.push('NOT GOES sounder retrieval — blended forecast only.');
  const lbs = registry?.operationalBaseline?.dailyForageLbs;
  if (lbs != null) {
    lines.push(`Registry daily forage drawdown (baseline): ${Number(lbs).toLocaleString()} lbs/day — narrative cross-ref only.`);
  }
  return lines;
}

function linesVegetation({ stac, laiPass, satellite }) {
  const lines = [];
  if (stac?.ok) {
    lines.push(`S2 L2A latest scene (STAC id): ${stac.sceneId || '—'}`);
    lines.push(`Scene time: ${stac.sceneDatetime || '—'}`);
    lines.push(`eo:cloud_cover: ${stac.cloudCover != null ? `${stac.cloudCover}%` : '—'}`);
  } else {
    lines.push(`S2 STAC HEAD: UNAVAILABLE (${stac?.error || 'unknown'})`);
  }
  lines.push('—');
  lines.push('Red-edge B5–B7 decode: NOT IN THIS BUILD (no band math on COGs).');
  const laiVals = (laiPass?.pastures || []).map((p) => p.leafAreaIndex ?? p.leafAreaIndexMean).filter((v) => num(v) != null);
  if (laiVals.length) {
    const m = laiVals.reduce((a, b) => a + b, 0) / laiVals.length;
    lines.push(`Open-Meteo LAI (ECMWF hourly proxy) mean over pastures: ${m.toFixed(3)}`);
  } else {
    lines.push('Open-Meteo LAI: —');
  }
  const soils = (satellite?.pastures || []).map((p) => p.soilMoistureM3M3 ?? p.soilMoistureMean).filter((v) => num(v) != null);
  if (soils.length) {
    const mn = Math.min(...soils);
    const mx = Math.max(...soils);
    lines.push(`Soil moisture m³/m³ min/max (network spread): ${mn.toFixed(3)} … ${mx.toFixed(3)}`);
  } else {
    lines.push('Soil moisture spread: —');
  }
  lines.push('"Trophic scar" boundary: NOT auto-traced — use pilot GIS vs model field.');
  return lines;
}

/**
 * @param {object} ctx
 * @param {object} ctx.geography — from `runPassiveRadarFusion` (pastures with lat/lon).
 */
export async function buildSpaceBioPanels(ctx) {
  const pastures = ctx.geography?.pastures || [];
  const centroid = networkCentroid(pastures);
  const bbox = bboxFromPastures(pastures);

  const [openMeteo, stac] = await Promise.all([
    fetchOpenMeteoMoistureColumn(centroid || {}),
    fetchSentinel2StacHead(bbox),
  ]);

  const registry = ctx.registry || {};
  const rf = ctx.rf || {};
  const fence = ctx.fence || {};
  const radar = ctx.radar || {};
  const laiPass = ctx.laiPass || null;
  const satellite = ctx.satellite || null;

  const disclaimer =
    'Fair Exchange Clause unchanged on stream. Space-bio panels: public proxies + catalog metadata only — not verified herd biophysics. EGS φ = display scalar; no Kp=1.00 clutter lock.';

  return {
    at: new Date().toISOString(),
    egsPhi: EGS_PHI,
    disclaimer,
    channels: {
      reflectivity: {
        code: 'gnss_r_proxy',
        title: '[LIVE INSTRUMENTATION: REFLECTIVITY / COUPLING PROXIES]',
        lines: linesReflectivity({ rf, fence, radar }),
        honesty:
          'CYGNSS delay-Doppler maps are not ingested. Readouts are OpenWebRX + fence fuse metrics (receive-only + GIS), not space-borne GNSS-R bistatic RCS of bison.',
      },
      troposphere: {
        code: 'moisture_column_proxy',
        title: '[LIVE ATMOSPHERIC COLUMN: BLENDED FORECAST LOG]',
        lines: linesTroposphere({ openMeteo, registry }),
        honesty:
          'Open-Meteo surface / near-surface humidity family — not GOES ABI/Sounder Level-2 at pasture native resolution. Not a metabolic respiration plume detector.',
        raw: openMeteo,
      },
      vegetation: {
        code: 'vegetation_proxy',
        title: '[LIVE FIELD LOG: LAI + SOIL + S2 CATALOG]',
        lines: linesVegetation({ stac, laiPass, satellite }),
        honesty:
          'Sentinel-2 STAC returns latest scene metadata only (no red-edge step-function ingest). LAI/soil from Open-Meteo paths already in the fuse.',
        raw: { stacHead: stac },
      },
    },
  };
}
