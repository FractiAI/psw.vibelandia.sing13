/**
 * Erdős 353 catalogue — Goldilocks sweet-spot queue UI.
 * G_VERIFIED / G_WITNESS rows vs WAITING for everything else.
 */
(function () {
  'use strict';

  const listEl = document.getElementById('ea-list');
  const statusEl = document.getElementById('ea-status');
  const searchEl = document.getElementById('ea-search');
  const filtersEl = document.getElementById('ea-filters');
  const groupCardsEl = document.getElementById('ea-group-cards');
  const bridgeStatsEl = document.getElementById('ea-bridge-stats');
  const instrumentDimsEl = document.getElementById('ea-instrument-dims');
  const instrumentOpEl = document.getElementById('ea-instrument-op');
  const unifiedProofEl = document.getElementById('ea-unified-proof');
  const progressStatsEl = document.getElementById('ea-progress-stats');
  const queueEl = document.getElementById('ea-queue');
  const witnessListEl = document.getElementById('ea-witness-list');

  let catalog = null;
  let activeFilter = 'all';
  let searchQuery = '';

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function statusBadge(p) {
    const gs = p.goldilocksStatus || p.status || 'WAITING';
    if (gs === 'G_VERIFIED') return { cls: 'ea-item-badge--gverified', text: 'G-Verified' };
    if (gs === 'G_WITNESS') return { cls: 'ea-item-badge--gwitness', text: 'G-Witness' };
    return { cls: 'ea-item-badge--waiting', text: 'Waiting' };
  }

  function matchesFilter(p) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return p.goldilocksStatus === 'G_VERIFIED';
    if (activeFilter === 'waiting') return p.goldilocksStatus === 'WAITING';
    if (activeFilter === 'bridge') return p.solver === 'bridge';
    if (activeFilter === 'syntheverse') return p.solver === 'syntheverse';
    return p.group === activeFilter;
  }

  function matchesSearch(p) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(p.id).includes(q) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.groupLabel && p.groupLabel.toLowerCase().includes(q)) ||
      (p.goldilocksStatus && p.goldilocksStatus.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  }

  function kernelMeta(p) {
    const k = p.kernelVerified;
    if (!k) {
      return `<li><strong>Goldilocks</strong> <span class="ea-waiting-tag">WAITING</span> — not yet in kernel queue overlap</li>`;
    }
    return `<li><strong>Lean module</strong> ${esc(k.leanModule)}</li>
      <li><strong>Theorem</strong> ${esc(k.theorem || k.linear || '—')}</li>
      <li><strong>Axioms</strong> ${esc((k.axioms || []).join(', '))}</li>
      <li><strong>Overlap</strong> ${esc(k.overlap || k.note || '')}</li>
      <li><strong>Path</strong> <code>${esc(k.leanPath)}</code></li>`;
  }

  function renderItem(p) {
    const isBridge = p.solver === 'bridge';
    const badge = statusBadge(p);
    const itemClass =
      p.goldilocksStatus === 'G_VERIFIED'
        ? 'ea-item--verified'
        : isBridge
          ? 'ea-item--bridge'
          : 'ea-item--waiting';
    const bridgeMeta =
      isBridge && p.bridge
        ? `<ul class="ea-bridge-detail">
          <li><strong>Bridge</strong> ${esc(p.bridge.verdict)} · ${esc(p.bridge.note || '')}</li>
          <li><strong>Leg A</strong> ${esc(p.bridge.legA || '')}</li>
          <li><strong>Leg B</strong> ${esc(p.bridge.legB || '')}</li>
        </ul>`
        : '';
    const symptomMeta = p.symptomOf
      ? `<li><strong>Manifold</strong> ${esc(p.symptomOf)} · ${esc(p.symptomRole || '')}</li>`
      : '';
    return `<li class="ea-item ${itemClass}" data-id="${p.id}">
      <button type="button" class="ea-item-trigger" aria-expanded="false" aria-controls="ea-proof-${p.id}">
        <span class="ea-item-num">#${p.id}</span>
        <span class="ea-item-title">${esc(p.title)}</span>
        <span class="ea-item-badge ${badge.cls}">${badge.text}</span>
      </button>
      <div class="ea-item-panel" id="ea-proof-${p.id}" hidden>
        <ul class="ea-item-meta">
          <li><strong>Solver</strong> ${esc(p.solverLabel)}</li>
          <li><strong>Grouping</strong> ${esc(p.groupLabel)}</li>
          <li><strong>Operational key</strong> ${esc(p.operationalKey)}</li>
          ${symptomMeta}
          ${kernelMeta(p)}
        </ul>
        ${bridgeMeta}
        <pre class="ea-proof">${esc(p.proof)}</pre>
      </div>
    </li>`;
  }

  function renderList() {
    if (!catalog || !listEl) return;
    const visible = catalog.problems.filter((p) => matchesFilter(p) && matchesSearch(p));
    listEl.innerHTML = visible.map(renderItem).join('');
    if (statusEl) {
      const verified = catalog.problems.filter((p) => p.goldilocksStatus === 'G_VERIFIED').length;
      const waiting = catalog.problems.length - verified;
      statusEl.textContent = `Showing ${visible.length.toLocaleString()} of ${catalog.problems.length.toLocaleString()} · ${verified} G-Verified · ${waiting} Waiting · click a row to expand`;
    }
    bindItems();
    updateFilterCounts();
  }

  function updateFilterCounts() {
    if (!catalog || !filtersEl) return;
    const verified = catalog.problems.filter((p) => p.goldilocksStatus === 'G_VERIFIED').length;
    const waiting = catalog.problems.length - verified;
    const bridge = catalog.problems.filter((p) => p.solver === 'bridge').length;
    filtersEl.querySelectorAll('[data-filter]').forEach((btn) => {
      const f = btn.getAttribute('data-filter');
      if (f === 'verified') btn.textContent = `G-Verified (${verified})`;
      if (f === 'waiting') btn.textContent = `Waiting (${waiting})`;
      if (f === 'bridge') btn.textContent = `Bridge queue (${bridge})`;
      if (f === 'all') btn.textContent = `All (${catalog.problems.length})`;
    });
  }

  function bindItems() {
    listEl.querySelectorAll('.ea-item-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.ea-item');
        const panel = item.querySelector('.ea-item-panel');
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.hidden = !open;
      });
    });
  }

  function updateBridgePanel() {
    const bs = catalog?.bridgeSummary;
    if (bridgeStatsEl && bs) {
      bridgeStatsEl.innerHTML = `
        <li><strong>${bs.waiting ?? bs.count} / ${bs.count}</strong> bridge rows waiting for kernel overlap</li>
        <li><strong>${bs.valid ?? 0}</strong> bridge rows G-verified</li>
        <li>DeepMind anchors enter the queue one at a time — not bulk-resolved</li>`;
    }
  }

  function updateProgressPanel() {
    const gp = catalog?.goldilocksProgress;
    if (!gp) return;
    if (progressStatsEl) {
      progressStatsEl.innerHTML = `
        <div class="ea-stat"><span class="ea-stat-n">${gp.doneCount}</span><span class="ea-stat-l">Queue items done</span></div>
        <div class="ea-stat"><span class="ea-stat-n">${gp.partialCount ?? 0}</span><span class="ea-stat-l">Queue items partial</span></div>
        <div class="ea-stat"><span class="ea-stat-n">${gp.waitingCount}</span><span class="ea-stat-l">Queue items waiting</span></div>
        <div class="ea-stat"><span class="ea-stat-n">${gp.verifiedCatalogRows?.length ?? 0}</span><span class="ea-stat-l">Catalog rows G-Verified</span></div>
        <div class="ea-stat"><span class="ea-stat-n">${gp.waitingCatalogRows ?? 352}</span><span class="ea-stat-l">Catalog rows Waiting</span></div>`;
    }
    if (queueEl && gp.queue) {
      queueEl.innerHTML = gp.queue
        .map((q) => {
          const cls =
            q.status === 'done'
              ? 'ea-queue-item--done'
              : q.status === 'partial'
                ? 'ea-queue-item--partial'
                : 'ea-queue-item--waiting';
          const tag =
            q.status === 'done' ? 'DONE' : q.status === 'partial' ? 'PARTIAL' : 'WAITING';
          const row = q.rowId != null ? `#${q.rowId}` : 'system';
          return `<li class="ea-queue-item ${cls}">
            <span class="ea-queue-tag">${tag}</span>
            <strong>${esc(q.label)}</strong>
            <span class="ea-queue-meta">${esc(row)} · ${esc(q.note || '')}</span>
            ${q.linear ? `<code class="ea-queue-code">${esc(q.linear)}</code>` : ''}
          </li>`;
        })
        .join('');
    }
    if (witnessListEl && catalog.kernelWitnesses) {
      witnessListEl.innerHTML = Object.values(catalog.kernelWitnesses)
        .map(
          (w) => `<li class="ea-witness-item">
            <span class="ea-item-badge ea-item-badge--gwitness">G-Witness</span>
            <strong>${esc(w.label || w.id)}</strong>
            <code>${esc(w.leanModule)}</code>
            <span class="ea-queue-meta">${esc(w.note || '')}</span>
          </li>`
        )
        .join('');
    }
  }

  function updateUnifiedPanel() {
    const ut = catalog?.unifiedTheorem;
    const inst = catalog?.multimathInstrument;
    if (instrumentDimsEl && inst?.dimensions) {
      instrumentDimsEl.innerHTML = inst.dimensions.map((d) => `<li>${esc(d)}</li>`).join('');
    }
    if (instrumentOpEl && inst) {
      instrumentOpEl.textContent = `Queue mode: ${catalog.goldilocksProgress?.model || 'overlap'}. ${inst.calibration || ''}`;
    }
    if (unifiedProofEl && catalog?.unifiedProof) {
      unifiedProofEl.innerHTML = `<code>${esc(catalog.unifiedProof)}</code>`;
    }
    if (ut) {
      const h = document.getElementById('ea-unified-h');
      if (h) h.textContent = `One manifold · ${ut.symptomCount} projections · queue-driven kernel build`;
    }
  }

  function updateGroupCards() {
    if (!groupCardsEl || !catalog) return;
    const t = catalog.totals;
    const gp = catalog.goldilocksProgress;
    const verified = gp?.verifiedCatalogRows?.length ?? 1;
    const waiting = gp?.waitingCatalogRows ?? 352;
    groupCardsEl.innerHTML = `
      <li><strong>Goldilocks queue</strong> — ${gp?.doneCount ?? 0} done · ${gp?.waitingCount ?? 0} waiting in pipeline</li>
      <li><strong>Catalog G-Verified</strong> — ${verified} row(s) in kernel overlap</li>
      <li><strong>Catalog Waiting</strong> — ${waiting} rows awaiting proof</li>
      <li><strong>Grouping A</strong> — Ramsey (#1–112, ${t.ramsey})</li>
      <li><strong>Grouping B</strong> — Additive (#113–255, ${t.additive})</li>
      <li><strong>Grouping C</strong> — Arithmetic (#256–344, ${t.arithmetic})</li>
      <li><strong>Bridge queue</strong> — ${t.bridge} DeepMind rows · all waiting until linear import</li>`;
  }

  async function load() {
    try {
      const res = await fetch('/data/erdos-353-catalog.json');
      if (!res.ok) throw new Error('catalog unavailable');
      catalog = await res.json();
      updateBridgePanel();
      updateProgressPanel();
      updateUnifiedPanel();
      updateGroupCards();
      renderList();
    } catch (e) {
      if (statusEl) statusEl.textContent = `Could not load catalogue: ${e.message}`;
      if (listEl) listEl.innerHTML = '';
    }
  }

  if (filtersEl) {
    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.getAttribute('data-filter');
      filtersEl.querySelectorAll('.ea-filter').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
      });
      renderList();
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim();
      renderList();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
