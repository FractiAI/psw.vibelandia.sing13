/**
 * QUESTFEST ship-blog magazine snap — feature-length prose helpers.
 * Canonical voice peer: ERFT research intro
 * (`interfaces/blog-erft-recursive-fidelity-2026-09.html` —
 * *When Information Rewrites Itself, Does φ Reduce the Drift?*).
 * Honesty rails belong at the end; body = one-page research introduction,
 * not a legal brief or ship/board theater.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Minimum article prose words (nav / honesty / footer / CTA excluded). */
export const SHIP_BLOG_MIN_ARTICLE_WORDS = 800;

/**
 * Canonical voice peer — Player 1 lock 2026-09-27.
 * Form: problem → experiment → hypothesis → results → qualifications → framework → invite.
 */
export const SHIP_BLOG_ERFT_VOICE_PEER_FILE =
  'blog-erft-recursive-fidelity-2026-09.html';

export const SHIP_BLOG_ERFT_VOICE_PEER_PATH = join(
  process.cwd(),
  'interfaces',
  SHIP_BLOG_ERFT_VOICE_PEER_FILE,
);

/**
 * Max "Soft Story" mentions in article body (honesty rail excluded).
 * ERFT research-intro peer: Soft Story label = 0 in body.
 * Honesty rail may still name the catalog tier.
 */
export const SHIP_BLOG_MAX_SOFT_STORY = 0;

/** Max meta/protocol jargon hits in body (CODATA / PRA Snap / ENGINE_SHELF). */
export const SHIP_BLOG_MAX_META_JARGON = 2;

/**
 * Min everyday-life anchors in article body (ERFT research-intro snap).
 * Jobs, rent, family, school, neighbors, paychecks — not lab-circuit stand-ins.
 */
export const SHIP_BLOG_MIN_EVERYDAY_ANCHORS = 2;

const BLOG_DIR = join(process.cwd(), 'interfaces');

const REFUSAL_H2_RE =
  /<h2[^>]*>\s*(What (this|builders|guests|readers|you) .{0,40}(should )?not|What (it|this) (is|isn.?t)|What validates|Goldilocks squeeze|Honesty rail|Working the rhyme without|What .* refuse)\s*<\/h2>/gi;

const DOES_NOT_CLAIM_RE =
  /does not claim|do not conclude that|not a claim\b|what this does not/gi;

/** Soft Story / Soft Stories — ERFT peer: zero in article body. */
const SOFT_STORY_RE = /Soft Stor(?:y|ies)\b/gi;

const META_JARGON_RE = /\bCODATA\b|\bPRA Snap\b|\bENGINE_SHELF\b|\bregistry id\b|\bstructural rubric\b/gi;

/**
 * Empty-workshop / empty-room metaphors used as unemployment stand-ins.
 * Prefer paychecks, jobs, rent, laid off — ERFT research-intro peer.
 */
const EMPTY_WORKSHOP_METAPHOR_RE =
  /empty workshops?|empty rooms?|quieter benches?|benches (?:are |still )?empty|fill the (?:room|workshops?)|shop floor (?:stays |still )?empty|empty of people who actually ship/gi;

/**
 * Ship/board theater gimmicks forbidden in ERFT research-intro voice
 * (recent-window shape lock only — not full corpus; voyage posts may name the ship).
 */
const SHIP_BOARD_THEATER_RE =
  /\b(?:Main Street|architecture theater|Closing pier)\b/gi;

/** Everyday life anchors — jobs, home, school, neighbors, people at work (ERFT peer). */
const EVERYDAY_LIFE_ANCHOR_RE =
  /\b(?:paycheck|paychecks|rent|grocery|groceries|unemploy(?:ed|ment)|underemploy(?:ed|ment)|laid off|job board|jobs?\b|kitchen table|living room|neighbors?|household|families|family|kids?\b|school|Main Street|side hustle|hours get cut|dinner table|first (?:job|foothold)|earn a living|people|guests?|builders?|home|work\b|street|doors?|classroom|friends?|town|city|parents?|children|wage|salary|commute|neighbors?|compliance|safety margins?|callback|callbacks|summarizer|policy document)\b/gi;

export function listShipBlogHtmlFiles(dir = BLOG_DIR) {
  return readdirSync(dir)
    .filter((name) => /^blog-.*\.html$/i.test(name))
    .map((name) => join(dir, name))
    .sort();
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function wordCount(text) {
  const words = text.match(/[A-Za-z0-9']+/g);
  return words ? words.length : 0;
}

/**
 * Article body HTML with nav / honesty / footer / CTA stripped (tags kept for pattern scans).
 */
export function extractArticleBodyHtml(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) return '';
  let art = articleMatch[0];
  art = art.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
  art = art.replace(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/gi, ' ');
  art = art.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  art = art.replace(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/gi, ' ');
  art = art.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  return art;
}

/**
 * Extract article prose used for the magazine length bar.
 * Excludes nav, honesty rail, footer, and CTA row.
 */
export function extractArticleProse(html) {
  return stripTags(extractArticleBodyHtml(html));
}

export function countArticleProseWords(html) {
  return wordCount(extractArticleProse(html));
}

/**
 * Journalism voice smell — legal-brief patterns that belong only in the end honesty rail.
 */
export function journalismVoiceSmell(html) {
  const body = extractArticleBodyHtml(html);
  SOFT_STORY_RE.lastIndex = 0;
  REFUSAL_H2_RE.lastIndex = 0;
  DOES_NOT_CLAIM_RE.lastIndex = 0;
  META_JARGON_RE.lastIndex = 0;
  EMPTY_WORKSHOP_METAPHOR_RE.lastIndex = 0;
  SHIP_BOARD_THEATER_RE.lastIndex = 0;
  EVERYDAY_LIFE_ANCHOR_RE.lastIndex = 0;
  const softStory = (body.match(SOFT_STORY_RE) || []).length;
  const refusalH2 = (body.match(REFUSAL_H2_RE) || []).length;
  const doesNotClaim = (body.match(DOES_NOT_CLAIM_RE) || []).length;
  const metaJargon = (body.match(META_JARGON_RE) || []).length;
  const tables = (body.match(/<table\b/gi) || []).length;
  const emptyWorkshopMetaphor = (body.match(EMPTY_WORKSHOP_METAPHOR_RE) || []).length;
  const shipBoardTheater = (body.match(SHIP_BOARD_THEATER_RE) || []).length;
  const everydayAnchors = (body.match(EVERYDAY_LIFE_ANCHOR_RE) || []).length;
  return {
    softStory,
    refusalH2,
    doesNotClaim,
    metaJargon,
    tables,
    emptyWorkshopMetaphor,
    shipBoardTheater,
    everydayAnchors,
    passesSoftStory: softStory <= SHIP_BLOG_MAX_SOFT_STORY,
    passesRefusalH2: refusalH2 === 0,
    passesDoesNotClaim: doesNotClaim === 0,
    passesMetaJargon: metaJargon <= SHIP_BLOG_MAX_META_JARGON,
    passesTables: tables === 0,
    passesEmptyWorkshopMetaphor: emptyWorkshopMetaphor === 0,
    passesShipBoardTheater: shipBoardTheater === 0,
    passesEverydayAnchors: everydayAnchors >= SHIP_BLOG_MIN_EVERYDAY_ANCHORS,
    passes:
      softStory <= SHIP_BLOG_MAX_SOFT_STORY &&
      refusalH2 === 0 &&
      doesNotClaim === 0 &&
      metaJargon <= SHIP_BLOG_MAX_META_JARGON &&
      tables === 0 &&
      emptyWorkshopMetaphor === 0 &&
      everydayAnchors >= SHIP_BLOG_MIN_EVERYDAY_ANCHORS,
  };
}

/**
 * ERFT research-intro shape — positive structure lock for new / recent posts.
 * Peer: problem-focused lead · ≥2 H2 · FractiAI Research dateline · honesty at end ·
 * no Closing-pier / Main Street theater.
 */
export function erftResearchIntroShape(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) {
    return {
      hasLead: false,
      h2Count: 0,
      hasFractiAiDateline: false,
      hasHonesty: false,
      shipBoardTheater: 0,
      passes: false,
    };
  }
  const art = articleMatch[0];
  const body = extractArticleBodyHtml(html);
  const hasLead = /<p[^>]*class="[^"]*lead[^"]*"/.test(art);
  const h2Count = (art.match(/<h2\b/gi) || []).length;
  const hasFractiAiDateline =
    /<p[^>]*class="[^"]*dateline[^"]*"[^>]*>[\s\S]*?FractiAI Research/i.test(art);
  const hasHonesty = /<p[^>]*class="[^"]*honesty[^"]*"/.test(art);
  SHIP_BOARD_THEATER_RE.lastIndex = 0;
  const shipBoardTheater = (body.match(SHIP_BOARD_THEATER_RE) || []).length;
  return {
    hasLead,
    h2Count,
    hasFractiAiDateline,
    hasHonesty,
    shipBoardTheater,
    passes:
      hasLead &&
      h2Count >= 2 &&
      hasFractiAiDateline &&
      hasHonesty &&
      shipBoardTheater === 0,
  };
}

/**
 * Honesty rail must appear after the body — last major prose block before CTA/footer.
 * Returns true when an honesty paragraph exists and ≥70% of article prose words precede it.
 */
export function honestyIsAtEnd(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) return false;
  const art = articleMatch[0];
  const honestyMatch = art.match(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i);
  if (!honestyMatch) return false;
  const idx = art.indexOf(honestyMatch[0]);
  const before = art.slice(0, idx);
  const after = art.slice(idx + honestyMatch[0].length);
  const beforeWords = wordCount(
    stripTags(
      before
        .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' '),
    ),
  );
  const afterProse = stripTags(
    after
      .replace(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' '),
  );
  const afterWords = wordCount(afterProse);
  if (beforeWords < 200) return false;
  if (afterWords > 120) return false;
  return true;
}

export function auditShipBlogFile(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const words = countArticleProseWords(html);
  const honestyEnd = honestyIsAtEnd(html);
  const voice = journalismVoiceSmell(html);
  const passesLength = words >= SHIP_BLOG_MIN_ARTICLE_WORDS;
  return {
    file: filePath,
    words,
    honestyEnd,
    voice,
    passesLength,
    passesVoice: voice.passes,
    passes: passesLength && honestyEnd,
  };
}

export function auditAllShipBlogs(dir = BLOG_DIR) {
  return listShipBlogHtmlFiles(dir).map(auditShipBlogFile);
}

/**
 * Journalism voice locks the full eligible corpus (Player 1 ERFT research-intro snap).
 * Infinity = audit every registered ship-blog note, not only a recent window.
 */
export const SHIP_BLOG_JOURNALISM_WINDOW = Number.POSITIVE_INFINITY;

/** Recent window for positive ERFT research-intro shape lock (newest first). */
export const SHIP_BLOG_ERFT_SHAPE_WINDOW = 25;

/**
 * Resolve the N most recent ship-blog HTML paths from QUESTFEST_BLOG_POSTS + registry dates.
 * Journalism-voice CI applies to the full eligible corpus (ERFT research-intro peer snap).
 * Pass a finite `limit` only for tooling that still wants a recent slice.
 */
export async function listRecentShipBlogHtmlFiles(limit = SHIP_BLOG_JOURNALISM_WINDOW, dir = BLOG_DIR) {
  const { QUESTFEST_BLOG_POSTS } = await import('./questfest-blog-posts.mjs');
  const { WHITEPAPER_REGISTRY } = await import('./whitepaper-registry.mjs');
  const rows = Object.entries(QUESTFEST_BLOG_POSTS)
    .map(([id, post]) => {
      const wp = WHITEPAPER_REGISTRY[id] || {};
      if (wp.shipBlog === false) return null;
      return {
        id,
        file: join(dir, post.file),
        published: wp.published || '0000-00-00',
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) || a.id.localeCompare(b.id),
    );
  if (!Number.isFinite(limit) || limit >= rows.length) return rows;
  return rows.slice(0, limit);
}
