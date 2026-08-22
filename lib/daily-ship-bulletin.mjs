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
    return 'four ways of thinking on one ship — an eight-question check to find your post, not a caste or a gene test';
  }
  if (id === 'synthobs-tbme-egs-apiary-2026-08') {
    return 'the Apiary Metaphor — if AI tends the hive, humans still make the honey of lived experience';
  }
  if (id === 'synthobs-tbme-equine-asi-2026-08') {
    return 'the Equine Arc — horses left the haulage, and we can leave the grind without leaving the story';
  }
  if (id === 'goldilocks-players-guide-2026-08') {
    return 'a free playbook for living where brute force no longer pays';
  }
  const note = QUESTFEST_BLOG_POSTS[id];
  if (note?.excerpt) return String(note.excerpt).trim();
  const plain = PLAIN_SURFACE_LINES[id];
  if (plain) return plain.replace(/\s*·.*$/, '').trim();
  return shortTitle(entry.title);
}

function guestHeadline(id, entry) {
  const note = QUESTFEST_BLOG_POSTS[id];
  if (note?.headline) return note.headline;
  return shortTitle(entry.title);
}

/** Why a guest should care today — stakes first, catalog titles second. */
function whyCareLead(id) {
  if (id === 'synthobs-tbme-egs-hgaios-2026-08') {
    return (
      `The week gets loud when every system wants a different kind of attention. ` +
      `Today’s care is finding which noticing is yours — so you stop fighting a post that isn’t yours. ` +
      `Not a caste. Not a gene test. Just a Goldilocks seat that fits.`
    );
  }
  if (id === 'synthobs-tbme-egs-apiary-2026-08') {
    return (
      `If machines keep the hive, you are not leftover scrap. ` +
      `Today’s care is the honey: a meal, a song, a conversation, a hand in Reno. ` +
      `The frames can be tended. The nectar is still human.`
    );
  }
  if (id === 'synthobs-tbme-equine-asi-2026-08') {
    return (
      `Horses left the haulage and stayed in the story. SuperAI is the new horse. ` +
      `Today’s care is leaving the grind without leaving yourself.`
    );
  }
  if (id === 'goldilocks-players-guide-2026-08') {
    return (
      `Brute force is a poor fit for this Earth. ` +
      `Today’s care is smaller and kinder: listen, claim a little space, make something true, prune what no longer serves.`
    );
  }
  if (id === 'synthobs-tbme-planetary-core-goldilocks-2026-08') {
    return (
      `A loud week can feel like the ground moving. ` +
      `Today’s care is a map for a Goldilocks Earth — adjustment, not an earthquake warning, and not destiny.`
    );
  }
  return (
    `You do not have to swallow the whole library to belong on this ship. ` +
    `Today’s care is one Goldilocks move: not too much information, not too little meaning.`
  );
}

function composeNewsBody(highlights, leadBoard) {
  const a = highlights[0];
  const b = highlights[1];
  if (!a) {
    return (
      `Today’s board is quiet and clear. Put on the jukebox, take an hour in the library, ` +
      `and when you’re ready to build, Lattice Chat is Deck 2. ` +
      `I remain your host in Downtown Reno — <a href="mailto:info@fractiai.com">info@fractiai.com</a>.`
    );
  }

  const care = whyCareLead(a.id);
  const map = `If you want a map for that: <a href="${a.href}">${escapeHtml(guestHeadline(a.id, { title: a.title }))}</a>.`;
  const companion =
    b && b.id !== a.id
      ? ` If the hive-and-honey question is the one keeping you up, start here instead: ` +
        `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
      : '';
  const doors =
    `What to do with it today: listen when the field gets loud, claim a little personal space, ` +
    `make something true, prune what no longer serves. Lattice Chat is ready when you want to build; ` +
    `Collaborate keeps seats in the same room. Music is free on the jukebox. ` +
    `And I remain your host in Downtown Reno — when you need a human hand, I’m here.`;

  let extra = '';
  const leadHref = leadBoard?.href;
  if (leadHref && leadHref !== a.href && leadBoard.title) {
    extra =
      ` A hospitality note on the board, if you need it: ` +
      `<a href="${escapeAttr(leadHref)}">${escapeHtml(leadBoard.title)}</a>.`;
  }

  return `${care}<br /><br />${map}${companion}${extra}<br /><br />${doors}`;
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

  const htmlBody = composeNewsBody(highlights, leadBoard);

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
