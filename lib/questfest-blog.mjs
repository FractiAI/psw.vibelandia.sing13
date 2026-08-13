/**
 * QUESTFEST landing blog — plain-language notes for the N most recent featured papers.
 * Cards open ship-blog posts (not bare paper titles). Re-run `npm run sync:questfest-blog`
 * after registering new papers or editing QUESTFEST_BLOG_POSTS.
 *
 * Order is always most recent → least recent. Do not bucket “has a note” ahead of newer papers.
 */
import { WHITEPAPER_REGISTRY, whitepaperSurfaceHref } from './whitepaper-registry.mjs';
import { PLAIN_SURFACE_LINES } from './plain-surface-lines.mjs';
import { blogPostForPaper, shipBlogHref } from './questfest-blog-posts.mjs';

const SKIP_IDS = new Set([
  'lattice-omni-complete-layer-guide-2026-07', // living TOC — not a research monograph blog
]);

/**
 * Eligible featured papers, newest published date first.
 * @param {number} [limit=6]
 */
export function listRecentPaperBlogPosts(limit = 6) {
  const eligible = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, e]) => {
      if (SKIP_IDS.has(id)) return false;
      if (e.shipBlog === false) return false;
      if (e.featured === false || e.surfaceVisible === false) return false;
      if (!e.file || !e.published || !e.title) return false;
      if (e.auditStatus === 'file_missing') return false;
      return true;
    })
    .map(([id, e]) => {
      const note = blogPostForPaper(id);
      return {
        id,
        title: e.title,
        published: String(e.published),
        paperHref: whitepaperSurfaceHref(id),
        href: note ? shipBlogHref(note.slug) : whitepaperSurfaceHref(id),
        headline: note?.headline || e.title,
        blurb:
          note?.excerpt ||
          PLAIN_SURFACE_LINES[id] ||
          'A FractiAI / SynthOBS technical note — open the paper for the full honesty boundary.',
        hasBlogPost: Boolean(note),
      };
    })
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) || a.id.localeCompare(b.id),
    );

  return eligible.slice(0, Math.max(1, limit));
}

/** HTML fragment for vibelandia-questfest.html injection. */
export function renderQuestfestBlogHtml(posts = listRecentPaperBlogPosts(6)) {
  const items = posts
    .map((p) => {
      const primary = p.hasBlogPost
        ? `<a class="qf-blog-link" href="${escapeAttr(p.href)}">Read the note →</a>`
        : `<a class="qf-blog-link" href="${escapeAttr(p.paperHref)}">Read the paper →</a>`;
      const secondary = p.hasBlogPost
        ? `<a class="qf-blog-paper" href="${escapeAttr(p.paperHref)}">Whitepaper</a>`
        : '';
      return `      <article class="qf-blog-card">
        <p class="qf-blog-date">${escapeHtml(p.published)}</p>
        <h3 class="qf-blog-title">${escapeHtml(p.headline)}</h3>
        <p class="qf-blog-blurb">${escapeHtml(p.blurb)}</p>
        <div class="qf-blog-actions">
          ${primary}
          ${secondary}
        </div>
      </article>`;
    })
    .join('\n');

  return `  <section class="qf-blog" id="ship-blog" aria-labelledby="qf-blog-h2">
    <span class="bulletin-kicker">Ship blog · plain speak</span>
    <h2 id="qf-blog-h2">Six newest papers</h2>
    <p class="qf-blog-lead">
      Real plain-language posts about what just landed — most recent first, not title cards for the library.
      Each note keeps an honesty rail and links through to its whitepaper.
    </p>
    <div class="qf-blog-grid">
${items}
    </div>
  </section>
`;
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
