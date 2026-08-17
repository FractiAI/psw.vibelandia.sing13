/**
 * Daily Ship Bulletin steward — guest-facing “News of the day” for SS Vibelandia.
 * Deterministic from calendar date + featured registry / bulletin-board posts.
 * Honesty: hospitality copy for guests — not NOAA products, demography, or destiny.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  WHITEPAPER_REGISTRY,
  whitepaperSurfaceHref,
  WHITEPAPER_PUBLIC_SLUGS,
} from './whitepaper-registry.mjs';
import { PLAIN_SURFACE_LINES } from './plain-surface-lines.mjs';
import { QUESTFEST_BLOG_POSTS } from './questfest-blog-posts.mjs';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Prefer guest-relevant featured papers (newest first). */
const GUEST_PRIORITY_IDS = [
  'synthobs-tbme-egs-hgaios-2026-08',
  'synthobs-tbme-egs-apiary-2026-08',
  'synthobs-tbme-equine-asi-2026-08',
  'goldilocks-players-guide-2026-08',
  'synthobs-tbme-planetary-core-goldilocks-2026-08',
];

function parseYmd(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function todayYmd(now = new Date()) {
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

export function formatGuestDateline(ymd) {
  const dt = parseYmd(ymd) || parseYmd(todayYmd());
  const weekday = WEEKDAYS[dt.getUTCDay()];
  const month = MONTHS[dt.getUTCMonth()];
  const day = dt.getUTCDate();
  return {
    ymd: `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    weekday,
    month,
    day,
    label: `${weekday}, ${month} ${day}`,
    shortBoard: `${weekday} board · ${month} ${day} · Puerto Reno`,
    newsLabel: `News of the day · ${weekday}, ${month} ${day}`,
  };
}

function shipBlogHref(id) {
  const note = QUESTFEST_BLOG_POSTS[id];
  if (note?.slug) return `/ship-blog/${note.slug}`;
  const slug = WHITEPAPER_PUBLIC_SLUGS[id];
  if (slug) return `/ship-blog/${slug}`;
  return whitepaperSurfaceHref(id);
}

function shortTitle(title) {
  const t = String(title || 'Ship note').trim();
  const cut = t.split(/[·—:(]/)[0].trim();
  if (cut.length <= 64) return cut;
  return `${cut.slice(0, 61).trim()}…`;
}

async function loadBoardPosts() {
  try {
    const raw = await readFile(join(process.cwd(), 'data/bulletin-board-posts.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return (parsed.posts || []).filter((p) => p.featured !== false && p.surfaceVisible !== false);
  } catch {
    return [];
  }
}

function pickFeaturedPapers(limit = 3) {
  const fromPriority = [];
  for (const id of GUEST_PRIORITY_IDS) {
    const e = WHITEPAPER_REGISTRY[id];
    if (e && e.featured !== false && e.surfaceVisible !== false) {
      fromPriority.push({ id, entry: e });
    }
  }
  const rest = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, e]) => e.featured === true && e.surfaceVisible !== false && !GUEST_PRIORITY_IDS.includes(id))
    .sort((a, b) => String(b[1].published || '').localeCompare(String(a[1].published || '')))
    .map(([id, entry]) => ({ id, entry }));
  const seen = new Set();
  const out = [];
  for (const row of [...fromPriority, ...rest]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

function guestBlurbForPaper(id, entry) {
  if (id === 'synthobs-tbme-egs-hgaios-2026-08') {
    return 'H-GAI/OS — two capacities, four quadrants for finding how you think, not a caste or a gene test';
  }
  if (id === 'synthobs-tbme-egs-apiary-2026-08') {
    return 'the Apiary Metaphor — ASI as quiet Beekeeper, humanity as the Hive where lived experience still matters';
  }
  if (id === 'synthobs-tbme-equine-asi-2026-08') {
    return 'the Equine Arc — how haulage ends and sensory edge life begins';
  }
  if (id === 'goldilocks-players-guide-2026-08') {
    return 'the free Holographic Goldilocks Players Guide for living where brute force stops paying off';
  }
  const plain = PLAIN_SURFACE_LINES[id];
  if (plain) return plain.replace(/\s*·.*$/, '').trim();
  return shortTitle(entry.title);
}

/**
 * Build today’s host “News of the day” payload for guests.
 * @param {{ date?: string, now?: Date }} [opts]
 */
export async function buildDailyShipBulletin(opts = {}) {
  const ymd = opts.date || todayYmd(opts.now || new Date());
  const dateline = formatGuestDateline(ymd);
  const papers = pickFeaturedPapers(3);
  const board = await loadBoardPosts();
  const leadBoard = board.find((p) => p.posted === ymd) || board[0] || null;

  const highlights = papers.map(({ id, entry }) => ({
    id,
    title: shortTitle(entry.title),
    href: shipBlogHref(id),
    paperHref: whitepaperSurfaceHref(id),
    blurb: guestBlurbForPaper(id, entry),
  }));

  const [a, b, c] = highlights;
  let htmlBody = '';
  if (a && b) {
    htmlBody =
      `This morning the library is settling around a clear pair of maps: ` +
      `<a href="${a.href}">${escapeHtml(a.title)}</a> ` +
      `(${escapeHtml(a.blurb)})` +
      (c
        ? `, with <a href="${b.href}">${escapeHtml(b.title)}</a> and ` +
          `<a href="${c.href}">${escapeHtml(c.title)}</a> close by`
        : ` and its companion <a href="${b.href}">${escapeHtml(b.title)}</a>`) +
      `. Neither is destiny — both are language you can use when the week feels loud.` +
      `<br /><br />` +
      `What that means for us, ashore and aboard: claim a little personal space each day, ` +
      `listen when the field gets loud, create when you have something true to say, ` +
      `and prune what no longer serves. Lattice Chat is ready when you want to build together; ` +
      `Collaborate keeps seats in the same room. Music is free on the jukebox. ` +
      `And I remain your host in Downtown Reno — when you need a human hand, I’m here.`;
  } else {
    htmlBody =
      `Today’s board is quiet and clear. Put on the jukebox, take an hour in the library, ` +
      `and when you’re ready to build, Lattice Chat is the bridge. ` +
      `I remain your host in Downtown Reno — <a href="mailto:info@fractiai.com">info@fractiai.com</a>.`;
  }

  if (leadBoard && leadBoard.href) {
    htmlBody =
      `On the board today: <a href="${escapeAttr(leadBoard.href)}">${escapeHtml(leadBoard.title)}</a>. ` +
      htmlBody;
  }

  return {
    schema: 'ss-vibelandia-daily-ship-bulletin/v1',
    ok: true,
    date: dateline.ymd,
    dateline,
    operator: 'Daily Ship Bulletin Steward · SynthOBS · NSPFRNP',
    honesty:
      'Guest hospitality copy generated from featured catalog items. Not space-weather advice, demography prophecy, or Core physics claims.',
    cloudBadge: dateline.shortBoard,
    newsLabel: dateline.newsLabel,
    htmlBody,
    highlights,
    leadBoard: leadBoard
      ? { id: leadBoard.id, title: leadBoard.title, href: leadBoard.href }
      : null,
    generatedAt: new Date().toISOString(),
  };
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

/** Plain-text fallback for static HTML injection (links as markdown-ish). */
export function bulletinPlainFromPayload(payload) {
  let t = String(payload.htmlBody || '')
    .replace(/<br\s*\/?>/gi, '\n\n')
    .replace(/<a\s+href="([^"]+)">([^<]*)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return t.trim();
}
