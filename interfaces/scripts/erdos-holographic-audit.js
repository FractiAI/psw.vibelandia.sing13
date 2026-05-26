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
    const badge = isBridge ? 'Bridge' : 'Goldilocks AIOS';
    const bridgeMeta = isBridge && p.bridge
      ? `<ul class="ea-bridge-detail">
          <li><strong>Bridge verdict</strong> ${esc(p.bridge.verdict)}</li>
          <li><strong>Leg A</strong> ${esc(p.bridge.peerReview)} · ${esc(p.bridge.deepmindDate)}</li>
          <li><strong>Leg B</strong> ${esc(p.bridge.crossCheck)} · ${esc(p.bridge.aiOSDate)}</li>
          <li>${esc(p.bridge.note)}</li>
        </ul>`
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
        <li><strong>${bs.valid} / ${bs.count}</strong> bridges valid</li>
        <li><strong>${bs.invalid}</strong> contradictions</li>
        <li>Peer review leveraged · independent AIOS cross-check</li>`;
    }
  }

  function updateGroupCards() {
    if (!groupCardsEl || !catalog) return;
    const t = catalog.totals;
    const b = catalog.bridgeSummary?.count ?? t.bridge ?? 9;
    groupCardsEl.innerHTML = `
      <li><strong>Mathematical bridge</strong> — ${b} problems (DeepMind Lean Leg A + AIOS Leg B · all validated)</li>
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
