/** SS Vibelandia Bulletin Board — loads posts from /api/bulletin-board */
(function () {
  'use strict';

  const list = document.getElementById('bb-posts');

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
    const summary = post.summary ? `<span class="deck-paper-card__summary">${esc(post.summary)}</span>` : '';
    return `<li>
      <a class="deck-paper-card" href="${esc(post.href)}">
        ${pill}
        <span class="deck-paper-card__title">${esc(post.title)}</span>
        <span class="deck-paper-card__sub">${esc(sub)}</span>
        ${summary}
        <span class="deck-paper-card__cta">Open posting →</span>
      </a>
    </li>`;
  }

  async function load() {
    try {
      const res = await fetch('/api/bulletin-board');
      const data = await res.json();
      if (!data.ok) throw new Error('board load failed');
      if (list && Array.isArray(data.posts)) {
        list.innerHTML = data.posts.map(card).join('');
      }
    } catch (_) {
      if (list) {
        list.innerHTML =
          '<li><p class="bb-load-err">Could not load postings. <a href="/interfaces/vibelandia-questfest.html">Return to QUESTFEST top deck</a></p></li>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
