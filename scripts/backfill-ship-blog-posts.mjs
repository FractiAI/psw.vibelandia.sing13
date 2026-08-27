#!/usr/bin/env node
/**
 * Backfill ship-blog HTML + questfest-blog-posts entries for eligible registry papers.
 * Idempotent: skips papers that already have a note.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  WHITEPAPER_REGISTRY,
  WHITEPAPER_PUBLIC_SLUGS,
} from '../lib/whitepaper-registry.mjs';
import { QUESTFEST_BLOG_POSTS } from '../lib/questfest-blog-posts.mjs';
import { CATEGORY_PLAIN, PLAIN_SURFACE_LINES } from '../lib/plain-surface-lines.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INTERFACES = path.join(ROOT, 'interfaces');
const POSTS_FILE = path.join(ROOT, 'lib', 'questfest-blog-posts.mjs');
const VERCEL_FILE = path.join(ROOT, 'vercel.json');

const SKIP_IDS = new Set(['lattice-omni-complete-layer-guide-2026-07']);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugFor(id) {
  if (WHITEPAPER_PUBLIC_SLUGS[id]) return WHITEPAPER_PUBLIC_SLUGS[id];
  return id
    .replace(/^synthobs-tbme-/, 'tbme-')
    .replace(/^synthobs-/, '')
    .replace(/-2026(-\d+)?$/, '')
    .slice(0, 64);
}

function headlineFor(title) {
  const t = String(title || 'Ship blog note').trim();
  const cut = t.split(/[·—:]/)[0].trim();
  if (cut.length <= 88) return cut;
  return `${cut.slice(0, 85).trim()}…`;
}

function excerptFor(id, entry) {
  if (PLAIN_SURFACE_LINES[id]) return PLAIN_SURFACE_LINES[id];
  const cat = CATEGORY_PLAIN[entry.category] || 'FractiAI / SynthOBS technical note';
  return `${cat} — open the whitepaper for the full honesty boundary and receipts.`;
}

function kickerFor(entry) {
  const cat = entry.category || 'SynthOBS';
  if (cat === 'tbme') return 'Ship blog · TBME · catalog grammar';
  if (cat === 'hhf') return 'Ship blog · HHF · 99 Octave engine';
  if (cat === 'protocols') return 'Ship blog · Protocol';
  return `Ship blog · ${cat}`;
}

function renderBlogHtml({ id, entry, slug, headline, excerpt }) {
  const published = entry.published || '2026-07-01';
  const paperHref = `/interfaces/whitepaper-surface.html?id=${encodeURIComponent(id)}`;
  const canonical = `https://www.ssvibelandiaquestfest24x365.com/ship-blog/${slug}`;
  const desc = escapeHtml(excerpt);
  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(headline)} · Ship blog · QUESTFEST</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(headline)}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="article" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body>
  <article class="wrap">
    <nav class="nav" aria-label="Site">
      <a href="/questfest">QUESTFEST</a>
      <a href="/ship-blog/">All ship blogs</a>
      <a href="/questfest#ship-blog">Latest six</a>
      <a href="/papers">Papers</a>
      <a href="${paperHref}">Whitepaper</a>
    </nav>
    <header>
      <p class="kicker">${escapeHtml(kickerFor(entry))}</p>
      <h1>${escapeHtml(headline)}</h1>
      <p class="dateline"><strong>SS Vibelandia</strong> — ${escapeHtml(published)} — plain speak · Fair Exchange</p>
    </header>

    <p class="lead">${escapeHtml(excerpt)} This quick read is a plain-language entry point — not a substitute for the full paper, and not clinical, financial, or space-weather advice unless the paper explicitly says so.</p>

    <p class="honesty"><strong>Honesty first:</strong> architectural maps, catalog labels, and simulator grammar stay in their tier tables. We do not upgrade narrative filing cabinets into finished physics proofs, medical guidance, or prophecy engines.</p>

    <h2>What this paper is for</h2>
    <p>Use it to orient on QUESTFEST and in Lattice Chat — a readable on-ramp before you open the technical whitepaper. Run the linked research pipeline when the paper ships one; otherwise treat receipts inside the doc as the authority.</p>

    <h2>Next step</h2>
    <p>Open the whitepaper for Document ID, honesty boundary, and SynthOBS operator line. Pair with nest <strong>99 Octave</strong> when the topic sits on the Omni-Lattice engine shelf.</p>

    <div class="cta-row">
      <a class="btn btn-gold" href="${paperHref}">Open the whitepaper</a>
      <a class="btn btn-ghost" href="/ship-blog/">See all ship blogs</a>
      <a class="btn btn-ghost" href="/questfest#ship-blog">Back to latest six</a>
    </div>
    <footer>
      Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP · → ∞^∞
    </footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>
`;
}

function eligibleMissing() {
  return Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, e]) => {
      if (SKIP_IDS.has(id)) return false;
      if (QUESTFEST_BLOG_POSTS[id]) return false;
      if (e.shipBlog === false) return false;
      if (e.featured === false || e.surfaceVisible === false) return false;
      if (!e.file || !e.published || !e.title) return false;
      if (e.auditStatus === 'file_missing') return false;
      return true;
    })
    .sort((a, b) => b[1].published.localeCompare(a[1].published) || a[0].localeCompare(b[0]));
}

function patchQuestfestBlogPosts(newEntries) {
  let src = fs.readFileSync(POSTS_FILE, 'utf8');
  const marker = '\n};\n\n/** Companion ship-blog notes';
  const insertAt = src.indexOf(marker);
  if (insertAt < 0) throw new Error('Could not find QUESTFEST_BLOG_POSTS closing brace');
  const lines = newEntries.map(({ id, slug, file, headline, excerpt }) => {
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `  '${id}': {
    slug: '${esc(slug)}',
    file: '${esc(file)}',
    headline: '${esc(headline)}',
    excerpt:
      '${esc(excerpt)}',
  },`;
  });
  const block = `\n${lines.join('\n')}`;
  src = `${src.slice(0, insertAt)}${block}${src.slice(insertAt)}`;
  fs.writeFileSync(POSTS_FILE, src);
}

function patchVercelRewrites(newSlugs, filesBySlug) {
  const vercel = JSON.parse(fs.readFileSync(VERCEL_FILE, 'utf8'));
  const existing = new Set(
    (vercel.rewrites || []).map((r) => r.source.replace(/\/$/, '')),
  );
  const additions = [];
  for (const slug of newSlugs) {
    const dest = `/interfaces/${filesBySlug[slug]}`;
    for (const source of [`/ship-blog/${slug}`, `/ship-blog/${slug}/`]) {
      if (!existing.has(source.replace(/\/$/, ''))) {
        additions.push({ source, destination: dest });
        existing.add(source.replace(/\/$/, ''));
      }
    }
  }
  if (!additions.length) return 0;
  const anchor = vercel.rewrites.findIndex((r) => r.source === '/ship-blog/quakes-and-solar-weather');
  const idx = anchor >= 0 ? anchor : vercel.rewrites.length;
  vercel.rewrites.splice(idx, 0, ...additions);
  fs.writeFileSync(VERCEL_FILE, `${JSON.stringify(vercel, null, 2)}\n`);
  return additions.length;
}

const missing = eligibleMissing();
const usedSlugs = new Set(Object.values(QUESTFEST_BLOG_POSTS).map((p) => p.slug));
const newEntries = [];
const filesBySlug = {};
const newSlugs = [];

for (const [id, entry] of missing) {
  let slug = slugFor(id);
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${slugFor(id)}-${n}`;
    n += 1;
  }
  usedSlugs.add(slug);

  const headline = headlineFor(entry.title);
  const excerpt = excerptFor(id, entry);
  const file = `blog-${slug}.html`;
  const html = renderBlogHtml({ id, entry, slug, headline, excerpt });
  fs.writeFileSync(path.join(INTERFACES, file), html);

  newEntries.push({ id, slug, file, headline, excerpt });
  filesBySlug[slug] = file;
  newSlugs.push(slug);
}

if (newEntries.length) {
  patchQuestfestBlogPosts(newEntries);
  const rewriteCount = patchVercelRewrites(newSlugs, filesBySlug);
  console.log(
    JSON.stringify(
      {
        ok: true,
        created: newEntries.length,
        rewritesAdded: rewriteCount,
        sample: newEntries.slice(0, 3).map((e) => e.id),
      },
      null,
      2,
    ),
  );
} else {
  console.log(JSON.stringify({ ok: true, created: 0, message: 'Nothing to backfill' }, null, 2));
}
