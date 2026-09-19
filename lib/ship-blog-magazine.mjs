/**
 * QUESTFEST ship-blog magazine snap — feature-length prose helpers.
 * Honesty rails belong at the end; body must read like a full article, not a bite.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Minimum article prose words (nav / honesty / footer / CTA excluded). */
export const SHIP_BLOG_MIN_ARTICLE_WORDS = 900;

const BLOG_DIR = join(process.cwd(), 'interfaces');

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
 * Extract article prose used for the magazine length bar.
 * Excludes nav, honesty rail, footer, and CTA row.
 */
export function extractArticleProse(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) return '';
  let art = articleMatch[0];
  art = art.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
  art = art.replace(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/gi, ' ');
  art = art.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  art = art.replace(/<div[^>]*class="[^"]*cta-row[^"]*"[\s\S]*?<\/div>/gi, ' ');
  art = art.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  return stripTags(art);
}

export function countArticleProseWords(html) {
  return wordCount(extractArticleProse(html));
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
  return {
    file: filePath,
    words,
    honestyEnd,
    passesLength: words >= SHIP_BLOG_MIN_ARTICLE_WORDS,
    passes: words >= SHIP_BLOG_MIN_ARTICLE_WORDS && honestyEnd,
  };
}

export function auditAllShipBlogs(dir = BLOG_DIR) {
  return listShipBlogHtmlFiles(dir).map(auditShipBlogFile);
}
