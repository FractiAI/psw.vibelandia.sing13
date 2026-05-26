/**
 * Erdős 353 catalogue — expandable formal proof certificates.
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

  let catalog = null;
  let activeFilter = 'all';
  let searchQuery = '';

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function matchesFilter(p) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'syntheverse') return p.solver === 'syntheverse';
    if (activeFilter === 'bridge' || activeFilter === 'deepmind') return p.solver === 'bridge';
    return p.group === activeFilter;
  }

  function matchesSearch(p) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(p.id).includes(q) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.groupLabel && p.groupLabel.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q)) ||
      (p.bridge?.verdict && p.bridge.verdict.toLowerCase().includes(q))
    );
  }

  function renderItem(p) {
    const isBridge = p.solver === 'bridge';
    const badgeClass = isBridge ? 'ea-item-badge--bridge' : 'ea-item-badge--sv';
    const itemClass = isBridge ? 'ea-item--bridge' : 'ea-item--syntheverse';
    const badge = isBridge ? 'AI Bridge' : 'Goldilocks AIOS';
    const bridgeMeta = isBridge && p.bridge
      ? `<ul class="ea-bridge-detail">
          <li><strong>Bridge type</strong> ${esc(p.bridge.bridgeType || 'Mathematical AI Bridge')}</li>
          <li><strong>Verdict</strong> ${esc(p.bridge.verdict)} · paradigm map</li>
          <li><strong>Leg A paradigm</strong> ${esc(p.bridge.paradigmA || p.bridge.legA || '')}</li>
          <li><strong>Leg B paradigm</strong> ${esc(p.bridge.paradigmB || p.bridge.legB || '')}</li>
          <li><strong>Leg A</strong> ${esc(p.bridge.legA || '')} · ${esc(p.bridge.deepmindDate)}</li>
          <li><strong>Leg B</strong> ${esc(p.bridge.legB || '')} · ${esc(p.bridge.aiOSDate)}</li>
          <li><strong>Bridge to remaining</strong> ${esc(p.bridge.bridgeToRemaining || '')}</li>
          <li>${esc(p.bridge.note)}</li>
        </ul>`
      : '';
    const symptomMeta =
      p.symptomOf
        ? `<li><strong>Manifold</strong> ${esc(p.symptomOf)} · ${esc(p.symptomRole || 'symptom projection')}</li>`
        : '';
    return `<li class="ea-item ${itemClass}" data-id="${p.id}">
      <button type="button" class="ea-item-trigger" aria-expanded="false" aria-controls="ea-proof-${p.id}">
        <span class="ea-item-num">#${p.id}</span>
        <span class="ea-item-title">${esc(p.title)}</span>
        <span class="ea-item-badge ${badgeClass}">${badge}</span>
        <span class="ea-item-badge">${esc(p.status)}</span>
      </button>
      <div class="ea-item-panel" id="ea-proof-${p.id}" hidden>
        <ul class="ea-item-meta">
          <li><strong>Solver</strong> ${esc(p.solverLabel)}</li>
          <li><strong>Grouping</strong> ${esc(p.groupLabel)}</li>
          <li><strong>Operational key</strong> ${esc(p.operationalKey)}</li>
          ${symptomMeta}
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
      statusEl.textContent = `Showing ${visible.length.toLocaleString()} of ${catalog.problems.length.toLocaleString()} problems · click a row to expand proof`;
    }
    bindItems();
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
        <li><strong>${bs.valid} / ${bs.count}</strong> Mathematical AI Bridges valid</li>
        <li><strong>${bs.invalid}</strong> contradictions between paradigms</li>
        <li>9 anchors calibrate multimath instrument → ${catalog.unifiedTheorem?.remainingSymptoms ?? 344} symptoms on one solve</li>`;
    }
  }

  function updateUnifiedPanel() {
    const ut = catalog?.unifiedTheorem;
    const inst = catalog?.multimathInstrument;
    if (instrumentDimsEl && inst?.dimensions) {
      instrumentDimsEl.innerHTML = inst.dimensions
        .map((d) => `<li>${esc(d)}</li>`)
        .join('');
    }
    if (instrumentOpEl && inst) {
      instrumentOpEl.textContent = `${inst.calibration || ''}. ${inst.operation || ''}`;
    }
    if (unifiedProofEl && catalog?.unifiedProof) {
      unifiedProofEl.innerHTML = `<code>${esc(catalog.unifiedProof)}</code>`;
    }
    if (ut) {
      const h = document.getElementById('ea-unified-h');
      if (h) {
        h.textContent = `One problem · ${ut.symptomCount} symptoms · Google-AIOS multimath instrument`;
      }
    }
  }

  function updateGroupCards() {
    if (!groupCardsEl || !catalog) return;
    const t = catalog.totals;
    const b = catalog.bridgeSummary?.count ?? t.bridge ?? 9;
    const ut = catalog.unifiedTheorem;
    const manifoldLine = ut
      ? `<li><strong>${esc(ut.id)}</strong> — ${ut.symptomCount} symptom projections · ${ut.solveMode?.replace(/_/g, ' ') || 'unified solve'}</li>`
      : '';
    groupCardsEl.innerHTML = `
      ${manifoldLine}
      <li><strong>Mathematical AI Bridge</strong> — ${b} calibration anchors (Lean → AIOS · tunes instrument for remaining field)</li>
      <li><strong>Grouping A</strong> — Ramsey &amp; discrete geometry (#1–112, ${t.ramsey} problems)</li>
      <li><strong>Grouping B</strong> — Additive combinatorics (#113–255, ${t.additive} problems)</li>
      <li><strong>Grouping C</strong> — Arithmetic geometry (#256–344, ${t.arithmetic} problems)</li>
      <li><strong>AIOS-native</strong> — ${t.syntheverse} near-instant resolutions (no prior Lean certificate)</li>`;
  }

  async function load() {
    try {
      const res = await fetch('/data/erdos-353-catalog.json');
      if (!res.ok) throw new Error('catalog unavailable');
      catalog = await res.json();
      updateBridgePanel();
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
