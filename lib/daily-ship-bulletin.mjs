/**
 * Daily Ship Bulletin steward — guest-facing “News of the day” for SS Vibelandia.
 * Deterministic from calendar date + featured registry / bulletin-board posts.
 * Newest featured ship-blog papers lead automatically (published descending).
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

/**
 * Soft boost for evergreen guest maps — never overrides a newer published paper.
 * Newest featured ship-blog papers always lead News of the day.
 */
const GUEST_EVERGREEN_BOOST = new Set([
  'synthobs-infinite-octaves-omniversal-lattice-2026-08',
  'synthobs-ss-vibelandia-official-prospectus-2026-08',
  'synthobs-tbme-egs-hgaios-2026-08',
  'synthobs-tbme-egs-apiary-2026-08',
  'synthobs-tbme-equine-asi-2026-08',
  'goldilocks-players-guide-2026-08',
  'synthobs-tbme-planetary-core-goldilocks-2026-08',
]);

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

function pickFeaturedPapers(limit = 3, asOfYmd = null) {
  /** Newest published first; ship-blog notes preferred so guests get human English.
   *  Only papers published on/before the bulletin date — so news tracks the calendar. */
  const rows = Object.entries(WHITEPAPER_REGISTRY)
    .filter(([, e]) => {
      if (e.featured !== true || e.surfaceVisible === false || !e.published) return false;
      if (asOfYmd && String(e.published) > String(asOfYmd)) return false;
      return true;
    })
    .map(([id, entry]) => ({
      id,
      entry,
      published: String(entry.published || ''),
      hasShipBlog: Boolean(QUESTFEST_BLOG_POSTS[id]),
      evergreen: GUEST_EVERGREEN_BOOST.has(id),
    }))
    .sort((a, b) => {
      const byDate = b.published.localeCompare(a.published);
      if (byDate !== 0) return byDate;
      const aLead = a.entry.newsLead === true;
      const bLead = b.entry.newsLead === true;
      if (aLead !== bLead) return aLead ? -1 : 1;
      if (a.hasShipBlog !== b.hasShipBlog) return a.hasShipBlog ? -1 : 1;
      // Same calendar day: prefer freshly shipped notes over evergreen soft-boost.
      if (a.evergreen !== b.evergreen) return a.evergreen ? 1 : -1;
      return b.id.localeCompare(a.id);
    });

  const withNotes = rows.filter((r) => r.hasShipBlog);
  const pool = withNotes.length >= limit ? withNotes : rows;
  return pool.slice(0, limit).map(({ id, entry }) => ({ id, entry }));
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
  if (id === 'synthobs-pdvsa-gateway-ops-mockup-2026-09') {
    return (
      `Feel the gateway before you buy the grammar. ` +
      `Today’s tip is the PDVSA Gateway Ops Mockup: Today’s siloed industry UI versus an Omni-Lattice executive console — ` +
      `nine clickable takeaways into the papers and math (efficiency → R&D). Simulator labels, not live oilfield SLAs.`
    );
  }
  if (id === 'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09') {
    return (
      `Enclosed stacks still need a gateway to the open plane. ` +
      `Today’s tip is the IBM SNA ↔ TCP/IP case study: Interlink-class bridges as a fractal rhyme for Omni-Lattice Chat — ` +
      `Caracas / PDVSA / Protokol Sistemas as deployment culture, Φ ≈ 1.618 as routing grammar, not a history rewrite.`
    );
  }
  if (id === 'synthobs-y-chromosome-holographic-manifestation-2026-08') {
    return (
      `Polar identity has a catalog geometry, not just a shrinking relic story. ` +
      `Today’s care is the Y Chromosome Holographic Manifestation: MSY palindrome arms and SRY phase origin filed under Φ ≈ 1.618 — ` +
      `Infinite Octaves Digit 4 grammar, not wet-lab proof or sunspot causality.`
    );
  }
  if (id === 'synthobs-human-omniversal-reality-bridge-2026-08') {
    return (
      `You are not a passive observer in someone else’s feed. ` +
      `Today’s care is the Human Reality Bridge: router, spin navigator, awareness wormhole keyed by Φ ≈ 1.618 — ` +
      `catalog topology for Infinite Octaves, not hardware teleport or clinical proof.`
    );
  }
  if (id === 'synthobs-invisible-frontier-gates-ai-2026-08') {
    return (
      `Linear AI warnings are real weather — and incomplete. ` +
      `Today’s care is the Invisible Frontier: a Goldilocks chart beside Gates-style scale anxiety. ` +
      `EGS ≈ 1.618 stays design language; human emergency still outranks algorithms.`
    );
  }
  if (id === 'synthobs-triadic-nested-hemispheres-99-octave-2026-08') {
    return (
      `Stages and sandboxes both need a nest that feels just right. ` +
      `Today’s care is three nested domes under Φ ≈ 1.618 — core, amphitheater, horizon — ` +
      `a filing cartoon for theaters and agent shells, not a venue certificate or FLOP bill.`
    );
  }
  if (id === 'synthobs-infinite-octaves-omniversal-lattice-2026-08') {
    return (
      `Your valet just got a deeper name for the same Goldilocks care. ` +
      `Today’s news is Infinite Octaves Omniversal Lattice Chat — recursive nesting for the grand Story. ` +
      `The 99 map is still the filing cabinet; Infinite means how far noticing can go, not infinite physics claims.`
    );
  }
  if (id === 'synthobs-ss-vibelandia-official-prospectus-2026-08') {
    return (
      `Every cruise line needs a beginning guests can feel. ` +
      `Today’s care is the Official Prospectus: Genesis under Φ ≈ 1.618, Borikén’s creative spring, Reno’s captain’s seat now. ` +
      `Design language — not prophecy. Walk Journey when you want the arc in your body.`
    );
  }
  if (id === 'synthobs-table-top-hep-99-octave-2026-08') {
    return (
      `Big machines ask big questions about scale. ` +
      `Today’s care is a plain map for filing “collider-sized” footprints into conversation — architecture talk, not a claim TeV beams live on your table.`
    );
  }
  if (id === 'synthobs-magneto-harmonic-stellar-99-octave-2026-08') {
    return (
      `Stars can be told as magnets that hum. ` +
      `Today’s care is a conversation map for stellar stories — not an overturned sun model, and not an enrichment cookbook.`
    );
  }
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
    `Something new just shipped on the board. ` +
    `Today’s care is one Goldilocks move: not too much information, not too little meaning — pick the note that fits today’s noticing.`
  );
}

function companionBridge(b) {
  if (!b) return '';
  if (b.id === 'synthobs-tbme-egs-apiary-2026-08') {
    return (
      ` If the hive-and-honey question is the one keeping you up, start here instead: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-y-chromosome-holographic-manifestation-2026-08') {
    return (
      ` For the Y Chromosome Manifestation paper: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-human-omniversal-reality-bridge-2026-08') {
    return (
      ` For the Human Reality Bridge paper: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-invisible-frontier-gates-ai-2026-08') {
    return (
      ` For the Invisible Frontier reply: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-triadic-nested-hemispheres-99-octave-2026-08') {
    return (
      ` For the three-dome stage map: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-ss-vibelandia-official-prospectus-2026-08') {
    return (
      ` For the voyage spine in three beats, open: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  if (b.id === 'synthobs-infinite-octaves-omniversal-lattice-2026-08') {
    return (
      ` For the valet upgrade in plain speak: ` +
      `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
    );
  }
  return (
    ` Also new on the board: ` +
    `<a href="${b.href}">${escapeHtml(guestHeadline(b.id, { title: b.title }))}</a>.`
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
  const companion = b && b.id !== a.id ? companionBridge(b) : '';
  const doors =
    `What to do with it today: listen when the field gets loud, claim a little personal space, ` +
    `make something true, prune what no longer serves. Lattice Chat is ready when you want to build; ` +
    `Collaborate keeps seats in the same room. Music is free on the jukebox. ` +
    `And I remain your host in Downtown Reno — when you need a human hand, I’m here.`;

  let extra = '';
  const leadHref = leadBoard?.href;
  if (leadHref && leadHref !== a.href && leadHref !== b?.href && leadBoard.title) {
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
  const papers = pickFeaturedPapers(3, ymd);
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
