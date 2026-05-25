/**
 * Turner Enterprise Rangeland — executive Layer 1 + telescope detail.
 * Live stream: /api/turner-bison-telemetry
 */
(function () {
  'use strict';

  const API = '/api/turner-bison-telemetry';
  const POLL_MS = 45_000;

  const $ = (sel, root) => (root || document).querySelector(sel);

  let mapInstance = null;

  function mapStreamFromPipeline(stream) {
    const env = stream.pipeline?.synthesis?.environment || {};
    const herd = stream.pipeline?.synthesis?.herd || {};
    const bio = stream.pipeline?.synthesis?.biomass || {};
    const wire = stream.pipeline?.synthesis?.wire || {};
    const radarStage = stream.pipeline?.radar;
    const radar = radarStage || stream.pipeline?.synthesis?.radar || null;
    const pll = wire.pllMicroseconds ?? stream.pipeline?.ingest?.wirePhaseUs;
    const magnetic = stream.pipeline?.magnetic;
    const powerGrid = stream.pipeline?.powerGrid;
    return {
      radar,
      magnetic,
      powerGrid,
      radarFence: radarStage?.fenceChannel?.label || radar?.fenceChannel?.label,
      radarSatellite: radarStage?.satelliteChannel?.label || radar?.satelliteChannel?.label,
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
            : 0.5,
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

    if (mapInstance) mapInstance.updateStream(mapStreamFromPipeline(stream));

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
        ? `Passive radar fuse ${radar.fidelityPct}% · fence-line × satellite → herd map`
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
        ? `Passive radar locked — ${radar.fidelityPct}% fidelity · fence-line cross-referenced with satellite pass.`
        : noaa.error
          ? 'Stream active — NOAA degraded; fence radar and satellite fuse retrying.'
          : 'Stream locked — passive radar ingest live for Turner Enterprise Rangeland.';
    }
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
      mapInstance = new TurnerRangelandMap(root, {});
      await mapInstance.load();
    } catch (e) {
      root.innerHTML = `<p class="tb-fetch-err">Map load failed: ${e.message}</p>`;
    }
  }

  function init() {
    initTelescope();
    initMap().then(() => tick(true));
    setInterval(() => tick(false), POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
