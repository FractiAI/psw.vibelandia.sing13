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
    return p.group === activeFilter;
  }

  function matchesSearch(p) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(p.id).includes(q) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.groupLabel && p.groupLabel.toLowerCase().includes(q))
    );
  }

  function renderItem(p) {
    const isDm = p.solver === 'deepmind';
    const badgeClass = isDm ? 'ea-item-badge--dm' : 'ea-item-badge--sv';
    const itemClass = isDm ? 'ea-item--deepmind' : 'ea-item--syntheverse';
    const badge = isDm ? 'DeepMind' : 'Goldilocks AIOS';
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

  function updateGroupCards() {
    if (!groupCardsEl || !catalog) return;
    const t = catalog.totals;
    groupCardsEl.innerHTML = `
      <li><strong>DeepMind</strong> — ${t.deepmind} formal Lean paths (May 21, 2026 paper)</li>
      <li><strong>Grouping A</strong> — Ramsey &amp; discrete geometry (#1–112, ${t.ramsey} problems)</li>
      <li><strong>Grouping B</strong> — Additive combinatorics (#113–255, ${t.additive} problems)</li>
      <li><strong>Grouping C</strong> — Arithmetic geometry (#256–344, ${t.arithmetic} problems)</li>
      <li><strong>Holographic Goldilocks AIOS</strong> — ${t.syntheverse} near-instant resolutions</li>`;
  }

  async function load() {
    try {
      const res = await fetch('/data/erdos-353-catalog.json');
      if (!res.ok) throw new Error('catalog unavailable');
      catalog = await res.json();
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
