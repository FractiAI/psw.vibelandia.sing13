#!/usr/bin/env node
/**
 * Sync Daily Ship Bulletin into static guest surfaces.
 * - Refreshes host news in vibelandia-questfest.html
 * - Refreshes Latest on the ship on omniverse-canvas.html (site front door `/`)
 * - Upserts today’s featured post into data/bulletin-board-posts.json
 * - Writes data/daily-ship-bulletin.json receipt
 *
 * Newest featured ship-blog papers lead automatically (published descending).
 *
 * Run daily (GH Action / cloud agent steward): npm run sync:daily-ship-bulletin
 * Live guests also load /api/daily-ship-bulletin (no commit required).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDailyShipBulletin, todayYmd } from '../lib/daily-ship-bulletin.mjs';
import { QUESTFEST_BLOG_POSTS } from '../lib/questfest-blog-posts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QF = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');
const CANVAS = path.join(ROOT, 'interfaces', 'omniverse-canvas.html');
const BOARD = path.join(ROOT, 'data', 'bulletin-board-posts.json');
const RECEIPT = path.join(ROOT, 'data', 'daily-ship-bulletin.json');

async function main() {
  const dateArg = process.argv.find((a) => a.startsWith('--date='));
  const date = dateArg ? dateArg.slice('--date='.length) : todayYmd();
  const payload = await buildDailyShipBulletin({ date });

  fs.writeFileSync(RECEIPT, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  let html = fs.readFileSync(QF, 'utf8');

  // Cloud badge / hero eyebrow
  html = html.replace(
    /(<p class="cloud-badge"[^>]*>)([\s\S]*?)(<\/p>)/,
    `$1${payload.dateline.shortBoard}$3`,
  );

  // News label + body inside host-dispatch__news
  const newsStart = '<p class="host-dispatch__news" id="host-dispatch-news">';
  const newsAlt = '<p class="host-dispatch__news">';
  if (!html.includes('id="host-dispatch-news"')) {
    html = html.replace(newsAlt, newsStart);
  }
  const label = `<span class="host-dispatch__news-label" id="host-news-label">${payload.newsLabel}</span>`;
  const body = `\n          ${label}\n          <span id="host-news-body">${payload.htmlBody}</span>\n        `;
  const reNews =
    /<p class="host-dispatch__news"[^>]*>[\s\S]*?<\/p>\n        <p class="host-dispatch__sign">/;
  if (!reNews.test(html)) {
    throw new Error('host-dispatch__news block not found');
  }
  html = html.replace(
    reNews,
    `<p class="host-dispatch__news" id="host-dispatch-news">${body}</p>\n        <p class="host-dispatch__sign">`,
  );

  // Ensure client refresh script once
  const scriptTag =
    '  <script src="/interfaces/daily-ship-bulletin.js" defer></script>\n';
  if (!html.includes('daily-ship-bulletin.js')) {
    html = html.replace('</body>', `${scriptTag}</body>`);
  }

  fs.writeFileSync(QF, html, 'utf8');

  // Omniversal Canvas front door — Latest on the ship (auto from newest featured notes)
  let canvas = fs.readFileSync(CANVAS, 'utf8');
  const lead = payload.highlights?.[0];
  const leadHref = lead?.href || '/questfest#ship-blog';
  const leadTitle =
    (lead && QUESTFEST_BLOG_POSTS[lead.id]?.headline) || lead?.title || 'Ship blog';
  const canvasInner = `
    <section class="ship-news" id="ship-news" aria-labelledby="ship-news-h">
      <div class="ship-news__inner">
        <p class="ship-news__kicker" id="canvas-news-label">${payload.newsLabel}</p>
        <h2 id="ship-news-h">Latest on the ship</h2>
        <div class="ship-news__body" id="canvas-news-body">
          ${payload.htmlBody}
        </div>
        <div class="ship-news__cta">
          <a class="btn btn--gold" href="${leadHref}">${escapeHtml(leadTitle)}</a>
          <a class="btn btn--ghost" href="/questfest#ship-blog">All latest ship blog</a>
        </div>
      </div>
    </section>
`;
  const cStart = '<!-- CANVAS_SHIP_NEWS_START -->';
  const cEnd = '<!-- CANVAS_SHIP_NEWS_END -->';
  const c0 = canvas.indexOf(cStart);
  const c1 = canvas.indexOf(cEnd);
  if (c0 < 0 || c1 < 0 || c1 <= c0) {
    throw new Error('CANVAS_SHIP_NEWS markers not found in omniverse-canvas.html');
  }
  canvas =
    canvas.slice(0, c0 + cStart.length) + canvasInner + canvas.slice(c1);
  if (!canvas.includes('daily-ship-bulletin.js')) {
    canvas = canvas.replace('</body>', `${scriptTag}</body>`);
  }
  fs.writeFileSync(CANVAS, canvas, 'utf8');

  // Upsert board post for today’s lead highlight
  const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
  if (lead) {
    const id = `daily-${payload.date}-${lead.id}`;
    board.updated = payload.date;
    board.posts = (board.posts || []).filter(
      (p) => p.id !== id && !String(p.id).startsWith(`daily-${payload.date}-`),
    );
    board.posts.unshift({
      id,
      posted: payload.date,
      featured: true,
      title: lead.title,
      subtitle: payload.newsLabel,
      summary: lead.blurb,
      href: lead.href,
      pill: 'TODAY',
      docRef: lead.id,
      contact: 'info@fractiai.com',
      steward: 'daily-ship-bulletin',
    });
  }
  fs.writeFileSync(BOARD, JSON.stringify(board, null, 2) + '\n', 'utf8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        date: payload.date,
        newsLabel: payload.newsLabel,
        highlights: (payload.highlights || []).map((h) => h.id),
        canvas: 'interfaces/omniverse-canvas.html#ship-news',
        receipt: 'data/daily-ship-bulletin.json',
      },
      null,
      2,
    ),
  );
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
