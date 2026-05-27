/**
 * Turner Enterprise Rangeland — executive Layer 1 + telescope detail.
 * Live stream: /api/turner-bison-telemetry
 */
(function () {
  'use strict';

  const API = '/api/turner-bison-telemetry';
  const POLL_MS = 45_000;
  let pollTimer = null;
  let rangeSeries = null;
  let historicalActive = false;

  const $ = (sel, root) => (root || document).querySelector(sel);

  let mapInstance = null;
  let mapReady = false;
  let pendingMapStream = null;

  function mapStreamFromPipeline(stream) {
    const env = stream.pipeline?.synthesis?.environment || {};
    const herd = stream.pipeline?.synthesis?.herd || {};
    const bio = stream.pipeline?.synthesis?.biomass || {};
    const wire = stream.pipeline?.synthesis?.wire || {};
    const radar = stream.pipeline?.radar || stream.pipeline?.synthesis?.radar || null;
    const pll = wire.pllMicroseconds ?? stream.pipeline?.ingest?.wirePhaseUs;
    const magnetic = stream.pipeline?.magnetic;
    const powerGrid = stream.pipeline?.powerGrid;
    return {
      radar,
      magnetic,
      powerGrid,
      dataPolicy: stream.dataPolicy,
      syntheticDataAllowed: stream.syntheticDataAllowed,
      radarFence: radar?.fenceChannel?.label,
      radarSatellite: radar?.satelliteChannel?.label,
      baseline: {
        headCount: herd.headCount ?? 45000,
        canvasAcres: 2000000,
        velocityMph: herd.velocity ? parseFloat(herd.velocity) : 0.24,
        velocityKmh: 0.38,
        dailyForageTons: bio.dailyForageTons ?? 585,
        admLbsPerAcre: bio.admLbsPerAcre ?? 1450,
      },
      live: {
        fluxSfu: env.f107LiveSfu ?? env.f107AnchorSfu,
        sunspotCount: env.sunspotLiveCount ?? env.sunspotAnchorCount,
        kp: env.kpEgsFloor ?? env.kpLive ?? env.kpAnchor,
      },
      ingest: {
        pllMicroseconds: pll,
        pllProxy:
          pll != null && Number.isFinite(Number(pll))
            ? Math.min(1, Math.max(0, (Number(pll) - 8) / 30))
            : stream.syntheticDataAllowed
              ? 0.5
              : 0,
      },
    };
  }

  function render(stream) {
    if (!stream?.pipeline) return;
    const { ingest, synthesis } = stream.pipeline;
    const noaa = ingest?.noaa || {};
    const radar = stream.pipeline?.radar;
    const mapped = mapStreamFromPipeline(stream);
    if (mapInstance && mapReady) mapInstance.updateStream(mapped);
    else pendingMapStream = mapped;

    const lockMean = radar?.triangulatedLock?.meanLockIn;
    const collarProx = radar?.collarGradeProximityPct ?? radar?.crossSource?.collarGradeProximityPct;
    const status = $('#tb-exec-status');
    if (status) {
      if (radar) {
        const lockPct = lockMean != null ? `${(lockMean * 100).toFixed(0)}%` : '—';
        status.textContent = `Live · fuse ${radar.fidelityPct}% · collar-agreement ${collarProx ?? '—'}% (not GPS) · lock ${lockPct} · modeled map`;
      } else {
        status.textContent = noaa.error
          ? 'Live stream degraded — retrying…'
          : 'Live stream — building fuse…';
      }
    }
  }

  async function pull(refresh) {
    const url = refresh ? `${API}?refresh=1` : API;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 55000);
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`telemetry ${res.status}`);
      const data = await res.json();
      if (!data.ok || !data.stream) throw new Error('invalid stream');
      return data.stream;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('telemetry timeout (try refresh)');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPoll() {
    stopPoll();
    pollTimer = setInterval(() => tick(false), POLL_MS);
  }

  function isoDateUTC(d) {
    return d.toISOString().slice(0, 10);
  }

  function setDefaultRangeInputs() {
    const end = document.getElementById('tb-range-end');
    const start = document.getElementById('tb-range-start');
    if (!end || !start) return;
    const now = new Date();
    const e = isoDateUTC(now);
    const sDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14));
    const s = isoDateUTC(sDate);
    end.value = e;
    start.value = s;
  }

  function buildAnimalsForDayIndex(series, dayIndex) {
    const cumulative = new Map();
    for (let i = 0; i <= dayIndex; i++) {
      const d = series.daily[i];
      if (!d?.animals) continue;
      for (const a of d.animals) {
        const trail = cumulative.get(a.id) || [];
        trail.push({ x: a.x, y: a.y });
        cumulative.set(a.id, trail);
      }
    }
    const day = series.daily[dayIndex];
    if (!day?.animals) return [];
    const trailCap = 16;
    return day.animals.map((a) => {
      const full = cumulative.get(a.id) || [{ x: a.x, y: a.y }];
      const trailXY = full.slice(-trailCap);
      return {
        id: a.id,
        x: a.x,
        y: a.y,
        sex: a.sex,
        pastureId: a.pastureId,
        pastureName: a.pastureName,
        weightLbs: a.weightLbs,
        trailXY,
      };
    });
  }

  function applyRangeDayIndex(idx) {
    if (!rangeSeries || !mapInstance || !mapReady) return;
    const animals = buildAnimalsForDayIndex(rangeSeries, idx);
    mapInstance.applyHistoricalSample(animals);
    const day = rangeSeries.daily[idx];
    const label = document.getElementById('tb-range-day-label');
    if (label) label.textContent = `${day.date} · mean est. ${day.herdMeanWeightLbs ?? '—'} lbs`;
    const st = document.getElementById('tb-range-status');
    if (st) {
      st.textContent = `Showing day ${idx + 1}/${rangeSeries.daily.length} · ${rangeSeries.soilHistory?.source || 'soil'} · sample ${rangeSeries.sampleCount} heads`;
    }
  }

  function plainField(s) {
    return String(s ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\|/g, '/');
  }

  function downloadRangeTxt() {
    if (!rangeSeries?.daily?.length) return;
    const lines = [
      '# Turner date-range herd sample — MODELED OUTPUT (not collar GPS or scale weights)',
      '# Collaboration with Turner (pastures, fence truth, baselines, validation) could greatly improve accuracy.',
      `# Range: ${rangeSeries.range.start} to ${rangeSeries.range.end}`,
      '# Fields separated by " | "',
      '# date | id | pastureId | pastureName | schematicX | schematicY | lat_deg | lng_deg | estWeightLbs | radarFidelityPct',
    ];
    for (const d of rangeSeries.daily) {
      const fid = d.radar?.fidelityPct ?? '';
      for (const a of d.animals || []) {
        lines.push(
          [
            d.date,
            plainField(a.id),
            plainField(a.pastureId),
            plainField(a.pastureName),
            String(a.x),
            String(a.y),
            a.lat != null ? String(a.lat) : '',
            a.lng != null ? String(a.lng) : '',
            String(a.weightLbs),
            String(fid),
          ].join(' | '),
        );
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turner-range-${rangeSeries.range.start}_to_${rangeSeries.range.end}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function loadRange() {
    const errEl = document.getElementById('tb-range-err');
    const st = document.getElementById('tb-range-status');
    const startEl = document.getElementById('tb-range-start');
    const endEl = document.getElementById('tb-range-end');
    const sampleEl = document.getElementById('tb-range-sample');
    if (!startEl || !endEl) return;
    if (!mapReady || !mapInstance) {
      if (st) st.textContent = 'Wait for the map to finish loading, then try again.';
      if (errEl) {
        errEl.textContent = 'Map not ready.';
        errEl.hidden = false;
      }
      return;
    }
    const start = startEl.value;
    const end = endEl.value;
    let sample = parseInt(String(sampleEl?.value || '96'), 10);
    if (!Number.isFinite(sample)) sample = 96;
    if (errEl) errEl.hidden = true;
    if (st) st.textContent = 'Loading historical synthesis (may take up to a minute)…';
    stopPoll();
    historicalActive = true;
    try {
      const url = `${API}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&sample=${encodeURIComponent(String(sample))}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120000);
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.mode !== 'range' || !data.series?.daily?.length) throw new Error('Invalid range response');
      rangeSeries = data.series;
      const wrap = document.getElementById('tb-range-slider-wrap');
      const slider = document.getElementById('tb-range-day');
      const txtBtn = document.getElementById('tb-range-txt');
      if (wrap && slider) {
        wrap.hidden = false;
        slider.max = String(rangeSeries.daily.length - 1);
        slider.value = String(rangeSeries.daily.length - 1);
        slider.min = '0';
      }
      if (txtBtn) txtBtn.disabled = false;
      if (st) {
        st.textContent = `Range loaded · ${rangeSeries.daily.length} days · sample ${rangeSeries.sampleCount} heads · ${rangeSeries.soilHistory?.source || 'soil'}`;
      }
      applyRangeDayIndex(rangeSeries.daily.length - 1);
    } catch (e) {
      historicalActive = false;
      if (errEl) {
        errEl.textContent = e.message || 'Range load failed';
        errEl.hidden = false;
      }
      if (st) st.textContent = '';
      startPoll();
      void tick(false);
    }
  }

  function backToLive() {
    historicalActive = false;
    rangeSeries = null;
    const wrap = document.getElementById('tb-range-slider-wrap');
    const txtBtn = document.getElementById('tb-range-txt');
    const st = document.getElementById('tb-range-status');
    if (wrap) wrap.hidden = true;
    if (txtBtn) txtBtn.disabled = true;
    if (st) st.textContent = '';
    if (mapInstance && typeof mapInstance.exitHistoricalMode === 'function') {
      mapInstance.exitHistoricalMode();
    }
    startPoll();
    void tick(true);
  }

  function bindRangeControls() {
    setDefaultRangeInputs();
    const load = document.getElementById('tb-range-load');
    const live = document.getElementById('tb-range-live');
    const slider = document.getElementById('tb-range-day');
    const txt = document.getElementById('tb-range-txt');
    if (load) load.addEventListener('click', () => void loadRange());
    if (live) live.addEventListener('click', () => backToLive());
    if (slider) {
      slider.addEventListener('input', () => {
        const idx = parseInt(slider.value, 10) || 0;
        applyRangeDayIndex(idx);
      });
    }
    if (txt) txt.addEventListener('click', () => downloadRangeTxt());
  }

  async function tick(first) {
    if (historicalActive) return;
    const errEl = $('#tb-fetch-err');
    try {
      const stream = await pull(first);
      render(stream);
      if (errEl) errEl.hidden = true;
    } catch (e) {
      if (errEl) {
        errEl.textContent = `Telemetry: ${e.message}. Retrying…`;
        errEl.hidden = false;
      }
    }
    const clock = $('#tb-clock');
    if (clock) clock.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }

  async function initMap() {
    const root = document.getElementById('tb-map-root');
    if (!root || typeof TurnerRangelandMap !== 'function') return;
    try {
      mapInstance = new TurnerRangelandMap(root);
      await mapInstance.load();
      mapReady = true;
      if (pendingMapStream) {
        mapInstance.updateStream(pendingMapStream);
        pendingMapStream = null;
      }
    } catch (e) {
      mapReady = false;
      root.innerHTML = `<p class="tb-fetch-err">Map load failed: ${e.message}</p>`;
    }
  }

  function init() {
    bindRangeControls();
    void initMap();
    void tick(true);
    startPoll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
