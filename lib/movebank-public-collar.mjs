/**
 * Public Movebank GPS collar fetch (no auth).
 * Used by geomagnetic herbivore live report — not Turner synthesis.
 */

const MOVEBANK_PUBLIC_JSON = 'https://www.movebank.org/movebank/service/public/json';

export const MOVEBANK_PREFERRED_STUDY_IDS = [
  2548892515,
  1764627,
  302664172,
  178994931,
  143848765,
];

const HERBIVORE_RE =
  /bison|buffalo|moose|elk|deer|cattle|pronghorn|wapiti|caribou|reindeer|antelope|zebra|giraffe|goat|sheep|ungulate|grazing/i;

function isoFromMs(ms) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function addDays(dateStr, delta) {
  const t = new Date(`${dateStr}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + delta);
  return t.toISOString().slice(0, 10);
}

export async function listPublicStudies() {
  const res = await fetch(`${MOVEBANK_PUBLIC_JSON}?entity_type=study`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Movebank studies ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function rankHerbivoreStudies(studies) {
  const byId = new Map(studies.filter((s) => s.id != null).map((s) => [Number(s.id), s]));
  const ordered = [];
  const seen = new Set();

  const hasGps = (s) => String(s.sensor_type_ids || '').toLowerCase().includes('gps');

  for (const sid of MOVEBANK_PREFERRED_STUDY_IDS) {
    const s = byId.get(sid);
    if (s && hasGps(s)) {
      ordered.push(s);
      seen.add(sid);
    }
  }
  for (const s of studies) {
    const sid = Number(s.id);
    if (seen.has(sid) || !hasGps(s)) continue;
    if (HERBIVORE_RE.test(s.name || '')) {
      ordered.push(s);
      seen.add(sid);
    }
  }
  return ordered;
}

export async function fetchStudyGps(studyId, maxEventsPerIndividual = 4000) {
  const url = `${MOVEBANK_PUBLIC_JSON}?study_id=${studyId}&sensor_type=gps&max_events_per_individual=${maxEventsPerIndividual}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Movebank GPS ${studyId}: ${res.status}`);
  const payload = await res.json();
  const individuals = payload?.individuals;
  if (!Array.isArray(individuals) || !individuals.length) {
    return { points: [], meta: { studyId, error: 'no_individuals' } };
  }

  const points = [];
  const taxa = new Set();
  for (const ind of individuals) {
    const localId = ind.individual_local_identifier ?? ind.individual_id;
    const taxon = ind.individual_taxon_canonical_name || '';
    taxa.add(taxon);
    for (const loc of ind.locations || []) {
      if (loc.location_lat == null || loc.location_long == null || loc.timestamp == null) continue;
      points.push({
        individualId: `mb-${studyId}-${localId}`,
        timestamp: isoFromMs(loc.timestamp),
        lat: loc.location_lat,
        lon: loc.location_long,
        taxon,
      });
    }
  }

  let trajectoryStart = null;
  let trajectoryEnd = null;
  if (points.length) {
    const times = points.map((p) => new Date(p.timestamp).getTime()).sort((a, b) => a - b);
    trajectoryStart = isoFromMs(times[0]).slice(0, 10);
    trajectoryEnd = isoFromMs(times[times.length - 1]).slice(0, 10);
  }

  return {
    points,
    meta: {
      studyId,
      individuals: individuals.length,
      points: points.length,
      taxa: [...taxa],
      trajectoryStart,
      trajectoryEnd,
    },
  };
}

export function selectAnalysisWindow(points, focusDays = 90) {
  if (!points.length) {
    const end = new Date().toISOString().slice(0, 10);
    return {
      analysisEnd: end,
      analysisStart90: addDays(end, -(focusDays - 1)),
      note: 'empty_trajectory_fallback_calendar',
    };
  }
  const endMs = Math.max(...points.map((p) => new Date(p.timestamp).getTime()));
  const end = new Date(endMs).toISOString().slice(0, 10);
  const start90 = addDays(end, -(focusDays - 1));
  return { analysisEnd: end, analysisStart90: start90, note: 'collar_observation_window' };
}

export function filterPointsToWindow(points, window) {
  const startMs = new Date(`${window.analysisStart90}T00:00:00Z`).getTime();
  const endMs = new Date(`${window.analysisEnd}T23:59:59Z`).getTime();
  return points.filter((p) => {
    const t = new Date(p.timestamp).getTime();
    return t >= startMs && t <= endMs;
  });
}

/** Daily herd positions: last fix per individual per UTC day. */
export function dailyAnimalPositions(points) {
  const byDayInd = new Map();
  for (const p of points) {
    const day = p.timestamp.slice(0, 10);
    const key = `${day}|${p.individualId}`;
    const prev = byDayInd.get(key);
    if (!prev || p.timestamp > prev.timestamp) {
      byDayInd.set(key, { day, ...p });
    }
  }
  const byDay = new Map();
  for (const row of byDayInd.values()) {
    if (!byDay.has(row.day)) byDay.set(row.day, []);
    byDay.get(row.day).push({
      id: row.individualId,
      lat: row.lat,
      lng: row.lon,
    });
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, animals]) => ({ date, animals }));
}

/**
 * Fetch best available public collar study and return daily positions for anomaly module.
 */
export async function fetchPublicCollarDaily(opts = {}) {
  const maxEvents = opts.maxEventsPerIndividual ?? 4000;
  const studies = await listPublicStudies();
  const ranked = rankHerbivoreStudies(studies);
  const attempts = [];

  for (const study of ranked.slice(0, opts.maxStudies ?? 3)) {
    const sid = Number(study.id);
    let result;
    try {
      result = await fetchStudyGps(sid, maxEvents);
    } catch (err) {
      attempts.push({ studyId: sid, error: String(err.message || err) });
      continue;
    }
    const meta = {
      ...result.meta,
      studyName: study.name,
    };
    attempts.push(meta);
    if (!result.points.length) continue;

    const window = selectAnalysisWindow(result.points, opts.focusDays ?? 90);
    const filtered = filterPointsToWindow(result.points, window);
    const use = filtered.length ? filtered : result.points;
    const daily = dailyAnimalPositions(use);

    return {
      ok: true,
      daily,
      window,
      selectedStudy: meta,
      attempts,
      honesty: {
        source: 'movebank_gps',
        note: `Public GPS collar data — Movebank study ${sid} (${study.name}). Not Turner synthesis.`,
        taxa: meta.taxa,
        bisonCollarAvailable: (meta.taxa || []).some((t) => /bison/i.test(t)),
      },
    };
  }

  return {
    ok: false,
    daily: [],
    attempts,
    honesty: {
      source: null,
      note: 'No public Movebank GPS collar study returned fixes in this pass.',
    },
  };
}
