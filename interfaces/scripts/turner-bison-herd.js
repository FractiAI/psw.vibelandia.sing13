/**
 * Turner Enterprise Rangeland — live chart + date-range herd export (dialog).
 * Live stream: /api/turner-bison-telemetry
 */
(function () {
  'use strict';

  const API = '/api/turner-bison-telemetry';
  const POLL_MS = 45_000;
  let pollTimer = null;

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
    const { ingest } = stream.pipeline;
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
        status.textContent = ingest?.noaa?.error
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

  /** Default range: yesterday → today (UTC), one-day span ending today. */
  function setDefaultDateInputs(startEl, endEl) {
    if (!endEl || !startEl) return;
    const now = new Date();
    endEl.value = isoDateUTC(now);
    const sDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    startEl.value = isoDateUTC(sDate);
  }

  /** Avoid mobile auto-opening the native date picker when the dialog opens. */
  function armDateInputNoAutoPicker(el) {
    if (!el || el.type !== 'date') return;
    el.readOnly = true;
    el.setAttribute('inputmode', 'none');
    const unlock = () => {
      el.readOnly = false;
    };
    el.addEventListener('pointerdown', unlock, { passive: true });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') unlock();
    });
  }

  function lockDateInputsForDialog(startEl, endEl) {
    for (const el of [startEl, endEl]) {
      if (el) el.readOnly = true;
    }
  }

  function sexLabel(sex) {
    if (sex === 0) return 'Male';
    if (sex === 1) return 'Female';
    if (sex === 2) return 'Calf';
    return 'Unknown';
  }

  function calfFlag(sex) {
    return sex === 2 ? 'yes' : 'no';
  }

  function plainField(s) {
    return String(s ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\|/g, '/');
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function snapshotLabel(series, dayDate) {
    if (series.range?.start === series.range?.end) return 'snapshot';
    if (dayDate === series.range?.start) return 'start';
    if (dayDate === series.range?.end) return 'end';
    return dayDate;
  }

  function buildRangeTxtBlob(series) {
    const snapshots = series.daily || [];
    const lines = [
      '# Turner Enterprise herd report — MODELED OUTPUT (not collar GPS or scale weights)',
      '# Positions and weights are generated from public feeds + registry baselines.',
      '# Collaboration with Turner (pastures, fence truth, baselines, validation) could greatly improve accuracy.',
      `# Range: ${series.range.start} to ${series.range.end}`,
      `# Export: location and estimated weight at range start and end only (not each day in between).`,
      `# Sample: ${series.sampleCount} heads per snapshot · soil: ${series.soilHistory?.source || '—'}`,
      '# Fields separated by " | "',
      '# snapshot | utc_date | id | sex | calf | est_weight_lbs | est_lat_deg | est_lng_deg | pasture',
    ];
    for (const d of snapshots) {
      const snap = snapshotLabel(series, d.date);
      lines.push(`# --- ${snap.toUpperCase()} ${d.date} · mean est. ${d.herdMeanWeightLbs ?? '—'} lbs ---`);
      for (const a of d.animals || []) {
        lines.push(
          [
            snap,
            d.date,
            plainField(a.id),
            plainField(sexLabel(a.sex)),
            calfFlag(a.sex),
            a.weightLbs != null ? String(Math.round(a.weightLbs)) : '',
            a.lat != null ? String(a.lat) : '',
            a.lng != null ? String(a.lng) : '',
            plainField(a.pastureName || a.pastureId || ''),
          ].join(' | '),
        );
      }
    }
    return new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  }

  async function fetchRangeSeries(start, end, sample) {
    const url = `${API}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&sample=${encodeURIComponent(String(sample))}&snapshots=1`;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 120000);
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.mode !== 'range' || !data.series?.daily?.length) throw new Error('Invalid range response');
      return data.series;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function downloadRangeForDates(start, end, sample, statusEl, errEl) {
    if (errEl) errEl.hidden = true;
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = 'Building herd report (may take up to a minute)…';
    }
    const series = await fetchRangeSeries(start, end, sample);
    const blob = buildRangeTxtBlob(series);
    triggerBlobDownload(blob, `turner-herd-${series.range.start}_to_${series.range.end}.txt`);
    if (statusEl) {
      const snapN = series.daily?.length ?? 0;
      const snapLabel =
        series.range?.start === series.range?.end
          ? '1 snapshot (start = end)'
          : `${snapN} snapshots (start + end)`;
      statusEl.textContent = `Downloaded · ${snapLabel} · ${series.sampleCount} heads each.`;
    }
    const live = $('#tb-exec-status');
    if (live) {
      live.textContent = `Report saved · ${series.range.start}–${series.range.end} · live chart still updating`;
    }
    return series;
  }

  function bindDownloadDialog() {
    const dialog = document.getElementById('tb-download-dialog');
    const form = document.getElementById('tb-download-form');
    const startEl = document.getElementById('tb-dl-start');
    const endEl = document.getElementById('tb-dl-end');
    const sampleEl = document.getElementById('tb-dl-sample');
    const cancel = document.getElementById('tb-dl-cancel');
    const submit = document.getElementById('tb-dl-submit');
    const statusEl = document.getElementById('tb-download-status');
    const errEl = document.getElementById('tb-download-err');

    if (!dialog || !form) return;

    setDefaultDateInputs(startEl, endEl);
    armDateInputNoAutoPicker(startEl);
    armDateInputNoAutoPicker(endEl);

    dialog.addEventListener('close', () => {
      lockDateInputsForDialog(startEl, endEl);
    });

    cancel?.addEventListener('click', () => {
      dialog.close('cancel');
    });

    dialog.addEventListener('cancel', () => {
      if (errEl) errEl.hidden = true;
      if (statusEl) statusEl.hidden = true;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void (async () => {
        const start = startEl?.value;
        const end = endEl?.value;
        if (!start || !end) {
          if (errEl) {
            errEl.textContent = 'Choose start and end dates.';
            errEl.hidden = false;
          }
          return;
        }
        if (start > end) {
          if (errEl) {
            errEl.textContent = 'Start date must be on or before end date.';
            errEl.hidden = false;
          }
          return;
        }
        let sample = parseInt(String(sampleEl?.value || '96'), 10);
        if (!Number.isFinite(sample)) sample = 96;
        sample = Math.min(128, Math.max(8, sample));
        if (submit) submit.disabled = true;
        if (cancel) cancel.disabled = true;
        try {
          await downloadRangeForDates(start, end, sample, statusEl, errEl);
          window.setTimeout(() => dialog.close('ok'), 600);
        } catch (err) {
          if (errEl) {
            errEl.textContent = err.message || 'Download failed';
            errEl.hidden = false;
          }
          if (statusEl) statusEl.hidden = true;
        } finally {
          if (submit) submit.disabled = false;
          if (cancel) cancel.disabled = false;
        }
      })();
    });
  }

  /** Open date-range prompt — used by map toolbar Download herd button. */
  function openDownloadDialog() {
    const dialog = document.getElementById('tb-download-dialog');
    const startEl = document.getElementById('tb-dl-start');
    const endEl = document.getElementById('tb-dl-end');
    const errEl = document.getElementById('tb-download-err');
    const statusEl = document.getElementById('tb-download-status');
    if (!dialog) {
      window.alert('Download dialog is not available on this page.');
      return;
    }
    setDefaultDateInputs(startEl, endEl);
    lockDateInputsForDialog(startEl, endEl);
    if (errEl) errEl.hidden = true;
    if (statusEl) statusEl.hidden = true;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      const focusBtn = document.getElementById('tb-dl-submit');
      requestAnimationFrame(() => {
        focusBtn?.focus({ preventScroll: true });
      });
    } else {
      window.alert('Your browser does not support the download dialog. Try a current Chrome, Edge, Firefox, or Safari.');
    }
  }

  window.TurnerRangelandUI = {
    openDownloadDialog,
    downloadRangeForDates,
  };

  async function tick(first) {
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
    bindDownloadDialog();
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
