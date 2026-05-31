/** SS Vibelandia Bulletin Board — loads posts from /api/bulletin-board */
(function () {
  'use strict';

  const list = document.getElementById('bb-posts');
  const title = document.getElementById('bb-board-title');
  const lead = document.getElementById('bb-board-lead');

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function card(post) {
    const pill = post.pill
      ? `<span class="deck-paper-card__pill${post.featured ? ' deck-paper-card__pill--featured' : ''}">${esc(post.pill)}</span>`
      : '';
    const sub = [post.subtitle, post.docRef].filter(Boolean).join(' · ');
    return `<li class="deck-plain-item">
      <h3>${esc(post.title)}</h3>
      <p>${esc(post.summary || '')}</p>
      <a class="deck-paper-card" href="${esc(post.href)}">
        ${pill}
        <span class="deck-paper-card__title">${esc(post.title)}</span>
        <span class="deck-paper-card__sub">${esc(sub)}</span>
        <span class="deck-paper-card__cta">Open posting →</span>
      </a>
    </li>`;
  }

  async function load() {
    try {
      const res = await fetch('/api/bulletin-board');
      const data = await res.json();
      if (!data.ok) throw new Error('board load failed');
      if (title) title.textContent = data.boardTitle || 'SS Vibelandia Bulletin Board';
      if (lead) {
        lead.textContent =
          'Community bulletins, fan events, and special projects on the QUESTFEST nest. Click any posting — no codes or extra steps.';
      }
      if (list && Array.isArray(data.posts)) {
        list.innerHTML = data.posts.map(card).join('');
      }
    } catch (_) {
      if (list) {
        list.innerHTML =
          '<li class="deck-plain-item"><p>Could not load postings. <a href="/interfaces/vibelandia-questfest.html">Return to QUESTFEST top deck</a></p></li>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
