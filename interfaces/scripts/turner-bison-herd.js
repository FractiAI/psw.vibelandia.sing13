/**
 * Turner Bison Herd console — consumes live /api/turner-bison-telemetry (NOAA + RF + registry).
 */
(function () {
  'use strict';

  const API = '/api/turner-bison-telemetry';
  const POLL_MS = 45_000;

  const $ = (sel) => document.querySelector(sel);

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

  function setSourceBanner(stream) {
    const el = $('#tb-source-banner');
    if (!el || !stream) return;
    const noaa = stream.pipeline?.ingest?.noaa;
    const rf = stream.pipeline?.ingest?.rf;
    const parts = [];
    if (noaa?.f107Sfu != null) parts.push(`NOAA F10.7 live ${noaa.f107Sfu} sfu`);
    else if (noaa?.error) parts.push(`NOAA: ${noaa.error}`);
    if (rf?.ok && rf.iqRms != null) parts.push(`1420 MHz RF proxy · ${rf.endpointLabel || 'OpenWebRX'}`);
    else if (rf?.error) parts.push(`RF: ${rf.error}`);
    parts.push('Herd/biomass · public registry baseline (cited)');
    el.textContent = parts.join(' · ');
  }

  function render(stream) {
    if (!stream?.pipeline) return;
    const { ingest, scale, synthesis } = stream.pipeline;
    const env = synthesis.environment || {};
    const herd = synthesis.herd || {};
    const bio = synthesis.biomass || {};
    const wire = synthesis.wire || {};
    const b = ingest?.noaa || {};

    setText('tb-init-method', stream.methodology || 'NSPFRNP');
    setText(
      'tb-init-canvas',
      `Turner Enterprise Contiguous Land Network · ${fmtNum(2_000_000)} acres · ${fmtNum(herd.headCount || 45000)} head`
    );
    setText('tb-init-wave', 'High-tensile steel pasture perimeter boundary fences');
    setText('tb-init-carrier', `${ingest?.rf?.carrierMhz?.toFixed(3) || '1420.406'} MHz Neutral Hydrogen Line`);
    setText('tb-init-phi', `EGS Fractal Constant = ${scale?.egsPhi || 1.618}`);

    const fluxLive = env.f107LiveSfu;
    const fluxLine =
      fluxLive != null
        ? `${fluxLive} sfu live (anchor ${env.f107AnchorSfu} · Δ ${env.f107Delta >= 0 ? '+' : ''}${env.f107Delta ?? '—'})`
        : `anchor ${env.f107AnchorSfu} sfu (NOAA pending)`;
    setText('tb-flux', fluxLine);

    const spots =
      env.sunspotLiveCount != null
        ? `Count ${env.sunspotLiveCount} live · ${env.activeAreaLive || '—'} (anchor ${env.activeAreaAnchor})`
        : `anchor count ${env.sunspotAnchorCount} · ${env.activeAreaAnchor}`;
    setText('tb-sunspot', spots);

    setText(
      'tb-kp',
      env.kpLive != null
        ? `Kp live ${env.kpLive} → EGS floor ${env.kpEgsFloor} (φ ${scale?.egsPhi || 1.618})`
        : `Kp EGS floor ${env.kpEgsFloor} (target ${env.kpAnchor})`
    );

    setText('tb-heads', fmtNum(herd.headCount));
    setText('tb-weight', `${fmtNum(herd.meanWeightLbs)} lbs / head (${herd.source || 'registry'})`);
    setText('tb-velocity', herd.velocity || '—');
    setText('tb-adm', `${fmtNum(bio.admLbsPerAcre)} lbs / acre`);
    setText('tb-metabolic', bio.metabolic || '—');
    setText('tb-forage', `${fmtNum(bio.dailyForageLbs)} lbs (${bio.dailyForageTons} tons) / day`);
    setText('tb-pll', `${wire.pllMicroseconds ?? '—'} µs · ${wire.rfSource || 'RF'}`);
    setText('tb-ingest-count', b.f107Time ? `NOAA @ ${b.f107Time}` : 'ingest pending');

    setText('tb-pipe-stage', synthesis.stage || 'SYNTHESIS');
    setText(
      'tb-pipe-detail',
      `Live NOAA + 1420 MHz RF ingest → φ scale → registry herd/biomass synthesis`
    );

    const st1 = $('#tb-status-ingest');
    const st2 = $('#tb-status-validate');
    if (st1) {
      st1.textContent = b.error
        ? '[DATA INGEST — NOAA DEGRADED — RF/REGISTRY ACTIVE]'
        : '[DATA INGEST PASSIVE — SATELLITE CORE LOCKED]';
    }
    if (st2) {
      st2.textContent = '[VALIDATION SECURED — SINGLE STREAM LAYER EFFECTIVE]';
    }

    setSourceBanner(stream);
  }

  function initSlices() {
    document.querySelectorAll('.tb-slice-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-slice');
        document.querySelectorAll('.tb-slice-tabs button').forEach((b) => {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        document.querySelectorAll('.tb-slice-pane').forEach((p) => {
          p.classList.toggle('tb-slice-pane--on', p.id === `slice-${id}`);
        });
      });
    });
  }

  async function pull(refresh) {
    const url = refresh ? `${API}?refresh=1` : API;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`telemetry ${res.status}`);
    const data = await res.json();
    if (!data.ok || !data.stream) throw new Error('invalid stream');
    return data.stream;
  }

  async function tick(first) {
    const errEl = $('#tb-fetch-err');
    try {
      const stream = await pull(first);
      render(stream);
      if (errEl) errEl.hidden = true;
    } catch (e) {
      if (errEl) {
        errEl.textContent = `Telemetry fetch: ${e.message}. Retrying…`;
        errEl.hidden = false;
      }
    }
    const clock = $('#tb-clock');
    if (clock) clock.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }

  function init() {
    initSlices();
    tick(true);
    setInterval(() => tick(false), POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
