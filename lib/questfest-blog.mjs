/**
 * QUESTFEST landing blog — plain-language blurbs for the N most recent featured papers.
 * Ongoing: re-run `npm run sync:questfest-blog` after registering new papers.
 */
import { WHITEPAPER_REGISTRY, whitepaperSurfaceHref } from './whitepaper-registry.mjs';
import { PLAIN_SURFACE_LINES } from './plain-surface-lines.mjs';

const SKIP_IDS = new Set([
  'lattice-omni-complete-layer-guide-2026-07', // living TOC — not a research monograph blog
]);

/**
 * @param {number} [limit=6]
 * @returns {{ id: string, title: string, published: string, href: string, blurb: string }[]}
 */
export function listRecentPaperBlogPosts(limit = 6) {
  const rows = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, e]) => {
      if (SKIP_IDS.has(id)) return false;
      if (e.featured === false || e.surfaceVisible === false) return false;
      if (!e.file || !e.published || !e.title) return false;
      if (e.auditStatus === 'file_missing') return false;
      return true;
    })
    .map(([id, e]) => ({
      id,
      title: e.title,
      published: String(e.published),
      href: whitepaperSurfaceHref(id),
      blurb:
        PLAIN_SURFACE_LINES[id] ||
        'A FractiAI / SynthOBS technical note — open the paper for the full honesty boundary.',
    }))
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) || a.id.localeCompare(b.id),
    );

  return rows.slice(0, Math.max(1, limit));
}

/** HTML fragment for vibelandia-questfest.html injection. */
export function renderQuestfestBlogHtml(posts = listRecentPaperBlogPosts(6)) {
  const items = posts
    .map(
      (p) => `      <article class="qf-blog-card">
        <p class="qf-blog-date">${escapeHtml(p.published)}</p>
        <h3 class="qf-blog-title">${escapeHtml(shortTitle(p.title))}</h3>
        <p class="qf-blog-blurb">${escapeHtml(p.blurb)}</p>
        <a class="qf-blog-link" href="${escapeAttr(p.href)}">Read the paper →</a>
      </article>`,
    )
    .join('\n');

  return `  <section class="qf-blog" id="ship-blog" aria-labelledby="qf-blog-h2">
    <span class="bulletin-kicker">Ship blog · plain speak</span>
    <h2 id="qf-blog-h2">Six newest papers</h2>
    <p class="qf-blog-lead">
      Short, human notes on what just landed in the library. Technical claims stay in the papers —
      each link opens the honesty-bounded whitepaper.
    </p>
    <div class="qf-blog-grid">
${items}
    </div>
  </section>
`;
}

function shortTitle(title) {
  const t = String(title || '');
  if (t.length <= 96) return t;
  return `${t.slice(0, 93)}…`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
