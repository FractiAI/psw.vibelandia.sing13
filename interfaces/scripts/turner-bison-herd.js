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

  function fmtNum(n, digits) {
    return Number(n).toLocaleString('en-US', {
      maximumFractionDigits: digits ?? 0,
      minimumFractionDigits: digits ?? 0,
    });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function initTelescope() {
    document.querySelectorAll('.tb-card-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        const card = btn.closest('.tb-card');

        document.querySelectorAll('.tb-card-trigger').forEach((other) => {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          const pid = other.getAttribute('aria-controls');
          const p = pid ? document.getElementById(pid) : null;
          if (p) p.hidden = true;
          other.closest('.tb-card')?.classList.remove('is-open');
        });

        const next = !expanded;
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
        if (panel) panel.hidden = !next;
        card?.classList.toggle('is-open', next);
      });
    });
  }

  function render(stream) {
    if (!stream?.pipeline) return;
    const { ingest, scale, synthesis } = stream.pipeline;
    const env = synthesis.environment || {};
    const herd = synthesis.herd || {};
    const bio = synthesis.biomass || {};
    const wire = synthesis.wire || {};
    const noaa = ingest?.noaa || {};

    const headCount = herd.headCount ?? 45000;
    const acres = '2,000,000';

    const mapped = mapStreamFromPipeline(stream);
    if (mapInstance && mapReady) mapInstance.updateStream(mapped);
    else pendingMapStream = mapped;

    setText('tb-preview-environment', env.f107LiveSfu != null ? `${env.f107LiveSfu} sfu · Kp ${env.kpEgsFloor ?? '—'}` : 'NOAA ingest active');
    setText('tb-preview-herd', `${fmtNum(headCount)} head · ${fmtNum(herd.meanWeightLbs ?? 1100)} lbs mean`);
    setText('tb-preview-forage', `${fmtNum(bio.admLbsPerAcre ?? 1450)} ADM/ac · ${bio.dailyForageTons ?? 585} tons/day`);
    setText('tb-preview-audit', 'TIE · TESF public registry cross-check');
    setText('tb-preview-system', `${stream.methodology || 'NSPFRNP'} · φ ${scale?.egsPhi || 1.618}`);

    setText('tb-init-method', stream.methodology || 'NSPFRNP');
    setText(
      'tb-init-canvas',
      `Turner Enterprise Contiguous Land Network · ${acres} acres · ${fmtNum(headCount)} head`
    );
    setText('tb-init-wave', 'High-tensile steel pasture perimeter boundary fences');
    setText('tb-init-carrier', `${ingest?.rf?.carrierMhz?.toFixed(3) || '1420.406'} MHz · neutral hydrogen line`);
    setText('tb-init-phi', `El Gran Sol EGS = ${scale?.egsPhi || 1.618}`);

    const fluxLine =
      env.f107LiveSfu != null
        ? `${env.f107LiveSfu} sfu live (anchor ${env.f107AnchorSfu} · Δ ${env.f107Delta >= 0 ? '+' : ''}${env.f107Delta ?? '—'})`
        : `Anchor ${env.f107AnchorSfu} sfu`;
    setText('tb-flux', fluxLine);

    setText(
      'tb-sunspot',
      env.sunspotLiveCount != null
        ? `Count ${env.sunspotLiveCount} · ${env.activeAreaLive || '—'}`
        : `Anchor ${env.activeAreaAnchor} · count ${env.sunspotAnchorCount}`
    );

    setText(
      'tb-kp',
      env.kpLive != null
        ? `Live ${env.kpLive} → floor ${env.kpEgsFloor} (φ ${scale?.egsPhi || 1.618})`
        : `Floor ${env.kpEgsFloor}`
    );

    setText('tb-heads', fmtNum(headCount));
    setText('tb-weight', `${fmtNum(herd.meanWeightLbs ?? 1100)} lbs · ${herd.source || 'TESF registry'}`);
    setText('tb-velocity', herd.velocity || '—');
    setText('tb-adm', `${fmtNum(bio.admLbsPerAcre ?? 1450)} lbs / acre`);
    setText('tb-metabolic', bio.metabolic || '—');
    setText('tb-forage', `${fmtNum(bio.dailyForageLbs ?? 1170000)} lbs (${bio.dailyForageTons ?? 585} tons) / day`);
    setText('tb-pll', `${wire.pllMicroseconds ?? '—'} µs · ${wire.rfSource || 'RF'}`);
    setText('tb-ingest-count', noaa.f107Time ? noaa.f107Time : 'pending');

    const radar = stream.pipeline?.radar;
    setText('tb-pipe-stage', radar ? 'RADAR' : synthesis.stage || 'SYNTHESIS');
    setText(
      'tb-pipe-detail',
      radar
        ? `Radar fuse ${radar.fidelityPct}% · fence × satellite → model herd map`
        : 'INGEST → SCALE → RADAR → SYNTHESIS'
    );

    const sources = [];
    sources.push('Fence-line radar · OpenWebRX 1420 MHz PLL gates');
    sources.push('Satellite pass · Open-Meteo assimilated soil moisture');
    sources.push('Magnetic layers · NOAA Boulder K · Dst · L1 Bz');
    if (stream.pipeline?.powerGrid?.lineCount) {
      sources.push(`HIFLD grid · ${stream.pipeline.powerGrid.lineCount} transmission lines`);
    }
    if (noaa.f107Sfu != null) sources.push(`NOAA F10.7 ${noaa.f107Sfu} sfu`);
    else if (noaa.error) sources.push(`NOAA: ${noaa.error}`);
    sources.push('Turner Institute · TESF public registry');
    setText('tb-source-banner', sources.join(' · '));
    setText(
      'tb-radar-summary',
      radar
        ? `${radar.fidelityPct}% fidelity · correlation ${radar.correlationMean ?? '—'} · ${radar.method || 'passive-radar-synthesis'}`
        : 'Awaiting radar fuse…'
    );

    const status = $('#tb-exec-status');
    if (status) {
      status.textContent = radar
        ? `Synthesis locked to ingest snapshot — ${radar.fidelityPct}% modeled fuse · fence × satellite (see honesty note).`
        : noaa.error
          ? 'Stream active — NOAA degraded; radar fuse retrying.'
          : 'Live ingest active — passive radar synthesis for Turner-scale registry (model layer).';
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

  function downloadRangeCsv() {
    if (!rangeSeries?.daily?.length) return;
    const lines = [
      'date,id,pastureId,pastureName,schematicX,schematicY,lat_deg,lng_deg,estWeightLbs,radarFidelityPct',
    ];
    for (const d of rangeSeries.daily) {
      const fid = d.radar?.fidelityPct ?? '';
      for (const a of d.animals || []) {
        lines.push(
          [
            d.date,
            a.id,
            a.pastureId,
            String(a.pastureName || '').replace(/,/g, ';'),
            String(a.x),
            String(a.y),
            a.lat != null ? String(a.lat) : '',
            a.lng != null ? String(a.lng) : '',
            String(a.weightLbs),
            String(fid),
          ].join(','),
        );
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turner-range-${rangeSeries.range.start}_to_${rangeSeries.range.end}.csv`;
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
      const csvBtn = document.getElementById('tb-range-csv');
      if (wrap && slider) {
        wrap.hidden = false;
        slider.max = String(rangeSeries.daily.length - 1);
        slider.value = String(rangeSeries.daily.length - 1);
        slider.min = '0';
      }
      if (csvBtn) csvBtn.disabled = false;
      if (st) {
        st.textContent = `${rangeSeries.honesty?.note || ''} Soil: ${rangeSeries.soilHistory?.source || '—'}`;
      }
      applyRangeDayIndex(rangeSeries.daily.length - 1);
      bindManagerActions();
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
    const csvBtn = document.getElementById('tb-range-csv');
    const st = document.getElementById('tb-range-status');
    if (wrap) wrap.hidden = true;
    if (csvBtn) csvBtn.disabled = true;
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
    const csv = document.getElementById('tb-range-csv');
    if (load) load.addEventListener('click', () => void loadRange());
    if (live) live.addEventListener('click', () => backToLive());
    if (slider) {
      slider.addEventListener('input', () => {
        const idx = parseInt(slider.value, 10) || 0;
        applyRangeDayIndex(idx);
      });
    }
    if (csv) csv.addEventListener('click', () => downloadRangeCsv());
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

  function bindManagerActions() {
    const dl = document.getElementById('tb-page-download-herd');
    const report = document.getElementById('tb-page-herd-report');
    const hint = document.getElementById('tb-manager-hint');
    const ready = mapReady && mapInstance;

    if (dl) {
      dl.disabled = !ready;
      if (ready && !dl.dataset.bound) {
        dl.dataset.bound = '1';
        dl.addEventListener('click', () => mapInstance.downloadHerdReport());
      }
    }
    if (report) {
      report.disabled = !ready;
      if (ready && !report.dataset.bound) {
        report.dataset.bound = '1';
        report.addEventListener('click', () => mapInstance.showHerdReport());
      }
    }
    if (hint && ready) {
      const n = mapInstance.bison?.length ?? 0;
      if (historicalActive && rangeSeries) {
        hint.textContent = `${n.toLocaleString()} sample heads (date range) · use “Download range CSV” for all days`;
      } else {
        hint.textContent = n
          ? `${n.toLocaleString()} heads · CSV includes every animal by ranch + ranch summary rows`
          : 'Herd roster ready — download or open report';
      }
    }
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
      bindManagerActions();
    } catch (e) {
      mapReady = false;
      root.innerHTML = `<p class="tb-fetch-err">Map load failed: ${e.message}</p>`;
      const hint = document.getElementById('tb-manager-hint');
      if (hint) hint.textContent = 'Map unavailable — export disabled until chart loads.';
    }
  }

  function init() {
    initTelescope();
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
