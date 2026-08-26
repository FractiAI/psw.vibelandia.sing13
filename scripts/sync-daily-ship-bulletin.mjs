#!/usr/bin/env node
/**
 * Sync Daily Ship Bulletin into static guest surfaces.
 * - Refreshes host news in vibelandia-questfest.html
 * - Injects newest highlights into omniverse-canvas.html (#ship-news)
 * - Upserts today’s featured post into data/bulletin-board-posts.json
 * - Writes data/daily-ship-bulletin.json receipt
 *
 * Run daily (GH Action / cloud agent steward): npm run sync:daily-ship-bulletin
 * Live guests also load /api/daily-ship-bulletin (no commit required).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDailyShipBulletin, todayYmd } from '../lib/daily-ship-bulletin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QF = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');
const CANVAS = path.join(ROOT, 'interfaces', 'omniverse-canvas.html');
const BOARD = path.join(ROOT, 'data', 'bulletin-board-posts.json');
const RECEIPT = path.join(ROOT, 'data', 'daily-ship-bulletin.json');

const CANVAS_START = '<!-- CANVAS_SHIP_NEWS_BEGIN -->';
const CANVAS_END = '<!-- CANVAS_SHIP_NEWS_END -->';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function renderCanvasNewsList(payload) {
  const items = (payload.highlights || []).slice(0, 3);
  if (!items.length) {
    return `\n      <ul class="ship-news-list" id="canvas-news-list"></ul>\n      `;
  }
  const lis = items
    .map(
      (h) => `        <li>
          <a href="${escapeAttr(h.href)}">
            <p class="ship-news-date">${escapeHtml(payload.date)}</p>
            <p class="ship-news-title">${escapeHtml(h.title)}</p>
            <p class="ship-news-blurb">${escapeHtml(h.blurb)}</p>
          </a>
        </li>`,
    )
    .join('\n');
  return `\n      <ul class="ship-news-list" id="canvas-news-list">\n${lis}\n      </ul>\n      `;
}

function injectCanvasNews(html, payload) {
  const start = html.indexOf(CANVAS_START);
  const end = html.indexOf(CANVAS_END);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('CANVAS_SHIP_NEWS markers not found in omniverse-canvas.html');
  }
  const inner = renderCanvasNewsList(payload);
  let next =
    html.slice(0, start + CANVAS_START.length) + inner + html.slice(end);
  const labelRe =
    /(<p class="news-kicker" id="canvas-news-label">)([\s\S]*?)(<\/p>)/;
  if (labelRe.test(next)) {
    next = next.replace(labelRe, `$1${escapeHtml(payload.newsLabel)}$3`);
  }
  const scriptTag =
    '  <script src="/interfaces/daily-ship-bulletin.js" defer></script>\n';
  if (!next.includes('daily-ship-bulletin.js')) {
    next = next.replace('</body>', `${scriptTag}</body>`);
  }
  return next;
}

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

  // Omniversal Canvas front door — newest highlights, auto
  let canvas = fs.readFileSync(CANVAS, 'utf8');
  canvas = injectCanvasNews(canvas, payload);
  fs.writeFileSync(CANVAS, canvas, 'utf8');

  // Upsert board post for today’s lead highlight
  const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
  const lead = payload.highlights?.[0];
  if (lead) {
    const id = `daily-${payload.date}-${lead.id}`;
    board.updated = payload.date;
    board.posts = (board.posts || []).filter((p) => p.id !== id && !String(p.id).startsWith(`daily-${payload.date}-`));
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
        receipt: 'data/daily-ship-bulletin.json',
        canvas: 'interfaces/omniverse-canvas.html#ship-news',
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
