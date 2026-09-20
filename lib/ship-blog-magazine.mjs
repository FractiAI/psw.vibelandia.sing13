/**
 * QUESTFEST ship-blog magazine snap — feature-length prose helpers.
 * Honesty rails belong at the end; body must read like journalism, not a legal brief.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Minimum article prose words (nav / honesty / footer / CTA excluded). */
export const SHIP_BLOG_MIN_ARTICLE_WORDS = 900;

/**
 * Max "Soft Story" mentions in article body (honesty rail excluded).
 * Journalism voice: tell the story; do not litigate the label.
 */
export const SHIP_BLOG_MAX_SOFT_STORY = 3;

/** Max meta/protocol jargon hits in body (CODATA / PRA Snap / ENGINE_SHELF). */
export const SHIP_BLOG_MAX_META_JARGON = 2;

const BLOG_DIR = join(process.cwd(), 'interfaces');

const REFUSAL_H2_RE =
  /<h2[^>]*>\s*(What (this|builders|guests|readers|you) .{0,40}(should )?not|What (it|this) (is|isn.?t)|What validates|Goldilocks squeeze|Honesty rail|Working the rhyme without|What .* refuse)\s*<\/h2>/gi;

const DOES_NOT_CLAIM_RE = /does not claim|do not conclude that|not a claim that|what this does not/gi;

const SOFT_STORY_RE = /Soft Story/gi;

const META_JARGON_RE = /\bCODATA\b|\bPRA Snap\b|\bENGINE_SHELF\b|\bregistry id\b|\bstructural rubric\b/gi;

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
  const softStory = (body.match(SOFT_STORY_RE) || []).length;
  const refusalH2 = (body.match(REFUSAL_H2_RE) || []).length;
  const doesNotClaim = (body.match(DOES_NOT_CLAIM_RE) || []).length;
  const metaJargon = (body.match(META_JARGON_RE) || []).length;
  const tables = (body.match(/<table\b/gi) || []).length;
  return {
    softStory,
    refusalH2,
    doesNotClaim,
    metaJargon,
    tables,
    passesSoftStory: softStory <= SHIP_BLOG_MAX_SOFT_STORY,
    passesRefusalH2: refusalH2 === 0,
    passesDoesNotClaim: doesNotClaim === 0,
    passesMetaJargon: metaJargon <= SHIP_BLOG_MAX_META_JARGON,
    passesTables: tables === 0,
    passes:
      softStory <= SHIP_BLOG_MAX_SOFT_STORY &&
      refusalH2 === 0 &&
      doesNotClaim === 0 &&
      metaJargon <= SHIP_BLOG_MAX_META_JARGON &&
      tables === 0,
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
  // Strip non-prose after honesty (CTA / footer / Fair Exchange one-liner OK)
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
  // After honesty: allow short Fair Exchange line only (≤120 words)
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
    // Length + honesty for the whole corpus; journalism voice audited on the recent window.
    passes: passesLength && honestyEnd,
  };
}

export function auditAllShipBlogs(dir = BLOG_DIR) {
  return listShipBlogHtmlFiles(dir).map(auditShipBlogFile);
}

/**
 * Resolve the N most recent ship-blog HTML paths from QUESTFEST_BLOG_POSTS + registry dates.
 * Journalism-voice CI applies to this window only (older notes keep length/honesty locks).
 */
export async function listRecentShipBlogHtmlFiles(limit = 21, dir = BLOG_DIR) {
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
  return rows.slice(0, limit);
}

/** Default window Player 1 asked to revoice. */
export const SHIP_BLOG_JOURNALISM_WINDOW = 21;
