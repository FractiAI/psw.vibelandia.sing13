/**
 * QUESTFEST landing blog — plain-language notes for the N most recent featured papers.
 * Cards open ship-blog posts (not bare paper titles). Re-run `npm run sync:questfest-blog`
 * after registering new papers or editing QUESTFEST_BLOG_POSTS.
 *
 * Order is always most recent → least recent. Do not bucket “has a note” ahead of newer papers.
 */
import { WHITEPAPER_REGISTRY, whitepaperSurfaceHref } from './whitepaper-registry.mjs';
import { PLAIN_SURFACE_LINES } from './plain-surface-lines.mjs';
import { blogPostForPaper, shipBlogHref, SHIP_BLOG_COMPANIONS } from './questfest-blog-posts.mjs';

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

/**
 * All ship-blog notes (registry papers + companions), newest first.
 * @param {number} [limit]
 */
export function listAllShipBlogPosts(limit) {
  const fromRegistry = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, e]) => {
      if (SKIP_IDS.has(id)) return false;
      if (e.shipBlog === false) return false;
      if (e.featured === false || e.surfaceVisible === false) return false;
      if (!e.file || !e.published || !e.title) return false;
      if (e.auditStatus === 'file_missing') return false;
      return Boolean(blogPostForPaper(id));
    })
    .map(([id, e]) => {
      const note = blogPostForPaper(id);
      return {
        id,
        title: e.title,
        published: String(e.published),
        paperHref: whitepaperSurfaceHref(id),
        href: shipBlogHref(note.slug),
        headline: note.headline || e.title,
        blurb: note.excerpt || PLAIN_SURFACE_LINES[id] || '',
        pinned: Boolean(note.pinned),
        pinLabel: note.pinLabel || '',
      };
    });

  const companions = SHIP_BLOG_COMPANIONS.map((c) => {
    const paperHref = c.paperId ? whitepaperSurfaceHref(c.paperId) : '/papers';
    return {
      id: `companion:${c.slug}`,
      title: c.headline,
      published: String(c.published || '2026-08-11'),
      paperHref,
      href: shipBlogHref(c.slug),
      headline: c.headline,
      blurb: c.excerpt || '',
      pinned: false,
      pinLabel: '',
    };
  });

  const merged = [...fromRegistry, ...companions].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.published.localeCompare(a.published) || a.id.localeCompare(b.id);
  });

  return limit ? merged.slice(0, Math.max(1, limit)) : merged;
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
    <p class="qf-blog-see-all">
      <a href="/ship-blog/">See all ship blog notes →</a>
      · <a href="/ship-blog/everything-is-connected">The Big Picture</a>
      · <a href="/frontiersman-voyage">Frontiersman Voyage</a>
    </p>
  </section>
`;
}

/** Full HTML page listing every ship-blog note. */
export function renderShipBlogIndexPageHtml(posts = listAllShipBlogPosts()) {
  const items = posts
    .map((p) => {
      const pin = p.pinned
        ? `<span class="index-pin">${escapeHtml(p.pinLabel || 'Pinned')}</span> `
        : '';
      return `      <article class="index-card">
        <p class="index-date">${escapeHtml(p.published)}</p>
        <h2 class="index-title">${pin}<a href="${escapeAttr(p.href)}">${escapeHtml(p.headline)}</a></h2>
        <p class="index-blurb">${escapeHtml(p.blurb)}</p>
        <div class="index-actions">
          <a href="${escapeAttr(p.href)}">Read the note →</a>
          <a class="index-paper" href="${escapeAttr(p.paperHref)}">Whitepaper</a>
        </div>
      </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Ship blog · All plain-language notes · QUESTFEST</title>
  <meta name="description" content="Every QUESTFEST ship-blog note in plain language — newest first, honesty rails, links to whitepapers." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/ship-blog/" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <style>
    html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}
    .index-lead{margin:0.75rem 0 1.5rem;color:var(--soft);max-width:38rem}
    .index-list{display:flex;flex-direction:column;gap:1rem}
    .index-card{border:1px solid var(--line);border-radius:12px;padding:1rem 1.1rem;background:rgba(20,16,12,.85)}
    .index-date{font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:0.35rem}
    .index-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.35rem;line-height:1.2;margin:0 0 0.45rem}
    .index-title a{color:var(--gold-hi);font-weight:600;text-decoration:none}
    .index-title a:hover{text-decoration:underline;color:var(--champagne)}
    .index-pin{font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold);font-family:'Source Sans 3',sans-serif;font-weight:800}
    .index-blurb{color:var(--soft);font-size:0.95rem;margin:0 0 0.65rem}
    .index-actions{display:flex;flex-wrap:wrap;gap:0.75rem 1rem;font-size:0.88rem}
    .index-paper{color:var(--muted);font-weight:600}
  </style>
</head>
<body>
  <article class="wrap">
    <nav class="nav" aria-label="Site">
      <a href="/questfest">QUESTFEST</a>
      <a href="/questfest#ship-blog">Latest six</a>
      <a href="/papers">Papers</a>
    </nav>
    <header>
      <p class="kicker">Ship blog · plain speak</p>
      <h1>All ship blog notes</h1>
      <p class="index-lead">Selectable plain-language posts for every registered note — pinned Big Picture first, then newest first. Each card links to its quick read and whitepaper.</p>
    </header>
    <div class="index-list">
${items}
    </div>
    <footer style="margin-top:2rem">
      Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP · → ∞¹³
    </footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>
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
