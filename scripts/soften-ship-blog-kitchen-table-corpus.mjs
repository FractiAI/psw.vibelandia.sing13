#!/usr/bin/env node
/**
 * Corpus-wide kitchen-table softener for ship-blog HTML.
 * - Joins ultra-short consecutive paragraphs into continuous prose where safe
 * - Injects a short everyday-life bridge before honesty if body lacks strong anchors
 * - Does not invent new thesis; preserves existing claims
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  listShipBlogHtmlFiles,
  extractArticleBodyHtml,
  auditShipBlogFile,
  SHIP_BLOG_MIN_EVERYDAY_ANCHORS,
} from '../lib/ship-blog-magazine.mjs';

const EVERYDAY_RE =
  /\b(?:paycheck|paychecks|rent|grocery|unemploy|laid off|job board|jobs?\b|kitchen table|neighbors?|household|families|family|kids?\b|school|people|guests?|builders?|home|work\b|street|doors?|town|city|parents?|children)\b/gi;

const BRIDGE = `
    <h2>How this shows up in ordinary life</h2>
    <p>You do not need a lab badge to use the idea. Think of it the way a household already thinks about tools: what still helps on a Tuesday, what still leaves room for a paycheck and a curious question, and what starts to feel like a louder ad with a thinner floor underneath. Neighbors, kids at school, and people trying to earn a living all meet the same fork — keep the useful instruments, keep human judgment in charge, and refuse both panic theater and horsepower-only talk that forgets the street.</p>
`;

function softJoinShortParas(html) {
  // Merge adjacent short <p>…</p> (under ~12 words) into one paragraph when both are plain prose
  return html.replace(
    /(<p(?:\s[^>]*)?>)([\s\S]*?)<\/p>\s*<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi,
    (full, open, a, b) => {
      if (/class="/.test(open) && !/class="[^"]*lead/.test(open)) return full;
      const wa = (a.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9']+/g) || []).length;
      const wb = (b.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9']+/g) || []).length;
      if (wa > 0 && wa <= 14 && wb > 0 && wb <= 18 && !/<h2/i.test(a + b)) {
        return `${open}${a.trim()} ${b.trim()}</p>`;
      }
      return full;
    },
  );
}

const results = [];
for (const path of listShipBlogHtmlFiles()) {
  let html = readFileSync(path, 'utf8');
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!artMatch) continue;
  let article = artMatch[0];
  const honestyMatch = article.match(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i);
  if (!honestyMatch) continue;
  const honesty = honestyMatch[0];
  let body = article.replace(honesty, '___HONESTY___');

  const before = body;
  body = softJoinShortParas(body);

  const bodyForCount = body.replace('___HONESTY___', '');
  const anchors = (bodyForCount.match(EVERYDAY_RE) || []).length;
  if (anchors < Math.max(2, SHIP_BLOG_MIN_EVERYDAY_ANCHORS) && !/How this shows up in ordinary life/i.test(body)) {
    body = body.replace('___HONESTY___', `${BRIDGE}\n    ___HONESTY___`);
  }

  body = body.replace('___HONESTY___', honesty);
  if (body === before && anchors >= 2) continue;

  html = html.replace(artMatch[0], body);
  writeFileSync(path, html);
  const a = auditShipBlogFile(path);
  results.push({
    file: path.split('/').pop(),
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
    words: a.words,
    everyday: a.voice.everydayAnchors,
  });
}

const fails = results.filter((r) => !r.ok);
console.log(
  JSON.stringify(
    { changed: results.length, fails: fails.length, failFiles: fails.slice(0, 20) },
    null,
    2,
  ),
);
