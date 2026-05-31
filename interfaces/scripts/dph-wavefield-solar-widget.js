/** Live Wavefield Oscillator status strip for DPH-GPU surfaces. */
(function (global) {
  async function fetchState() {
    const res = await fetch('/api/dph-wavefield-solar', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.message || 'wavefield fetch failed');
    return data;
  }

  function render(root, data) {
    const ssn = data.telemetry?.sunspot?.sunspotNumber ?? '—';
    const hsi = data.holographicStabilityIndex ?? '—';
    const egsIdx = data.egsStabilityIndex ?? data.holographicPacingMatrix?.egsStabilityIndex ?? '—';
    const regions = (data.telemetry?.activeRegions || []).slice(0, 3).map(function (r) {
      return r.codename ? r.id + ' (' + r.codename + ')' : r.id;
    }).join(' · ') || '—';
    const egs = data.telemetry?.cadence?.egsIntervalSec ?? '—';
    root.innerHTML =
      '<p class="wf-live__line" aria-live="polite">' +
      '<strong>Wavefield Oscillator</strong> · SSN <strong>' + ssn + '</strong> · ' +
      'HSI <strong>' + hsi + '</strong> · EGS idx <strong>' + egsIdx + '</strong> · ' +
      'interval <strong>' + egs + 's</strong> · ' +
      regions +
      '</p>' +
      '<p class="wf-live__sub">' +
      '<a href="/interfaces/whitepaper-surface.html?id=syn-sun-wavefield-oscillator">SYN-SUN-2026-REV7</a> · ' +
      '<a href="/api/dph-wavefield-solar">Live JSON</a>' +
      '</p>';
  }

  async function mount(selector) {
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;
    root.classList.add('wf-live');
    root.innerHTML = '<p class="wf-live__line">Loading wavefield telemetry…</p>';
    try {
      render(root, await fetchState());
    } catch {
      root.innerHTML =
        '<p class="wf-live__line">Wavefield bus offline — <a href="/interfaces/whitepaper-surface.html?id=syn-sun-wavefield-oscillator">read SYN-SUN-2026-REV7</a></p>';
    }
  }

  global.DphWavefieldWidget = { mount, fetchState };
})(window);
