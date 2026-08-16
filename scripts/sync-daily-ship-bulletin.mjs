#!/usr/bin/env node
/**
 * Sync Daily Ship Bulletin into static guest surfaces.
 * - Refreshes host news in vibelandia-questfest.html
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
const BOARD = path.join(ROOT, 'data', 'bulletin-board-posts.json');
const RECEIPT = path.join(ROOT, 'data', 'daily-ship-bulletin.json');

function replaceBetween(html, startMarker, endMarker, inner) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`Markers not found: ${startMarker} … ${endMarker}`);
  }
  return html.slice(0, start + startMarker.length) + inner + html.slice(end);
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
