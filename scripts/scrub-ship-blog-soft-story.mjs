#!/usr/bin/env node
/**
 * Mechanical first pass toward vitality-peer journalism voice:
 * - Soft Story label → 0 in article body (honesty rail kept)
 * - Mid-body "does not claim" / "do not conclude" litigation softened
 * Does NOT rewrite narrative voice — agents finish feature prose after this scrub.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  listShipBlogHtmlFiles,
  journalismVoiceSmell,
  extractArticleBodyHtml,
} from '../lib/ship-blog-magazine.mjs';

function scrubBodySegment(body) {
  let b = body;
  // Soft Story phrase variants → plain English / omit
  b = b.replace(/\bSoft Story only\b/gi, '');
  b = b.replace(/\bSoft Story status\b/gi, 'status');
  b = b.replace(/\bSoft Story path\b/gi, 'path');
  b = b.replace(/\bSoft Story reading\b/gi, 'reading');
  b = b.replace(/\bSoft Story end-state\b/gi, 'end-state');
  b = b.replace(/\bSoft Story window\b/gi, 'window');
  b = b.replace(/\bSoft Story pacing\b/gi, 'pacing');
  b = b.replace(/\bSoft Story\b/gi, '');
  // Clean doubled spaces / empty emphasis leftovers from deletions
  b = b.replace(/[ \t]{2,}/g, ' ');
  b = b.replace(/ \( \)/g, '');
  b = b.replace(/\(\s*\)/g, '');
  b = b.replace(/\s+([.,;:])/g, '$1');
  b = b.replace(/\s+(<\/)/g, '$1');
  // Mid-body litigation phrases → softer feature language
  b = b.replace(/\bdoes not claim\b/gi, 'is not trying to prove');
  b = b.replace(/\bdo not conclude that\b/gi, 'do not treat as proven that');
  b = b.replace(/\bnot a claim that\b/gi, 'not the same as saying');
  b = b.replace(/\bwhat this does not\b/gi, 'what this leaves aside');
  return b;
}

function renameRefusalH2(html) {
  return html
    .replace(
      /<h2([^>]*)>\s*What (this|builders|guests|readers|you) .{0,40}(should )?not[\s\S]*?<\/h2>/gi,
      '<h2$1>What to keep in proportion</h2>',
    )
    .replace(
      /<h2([^>]*)>\s*What (it|this) (is|isn.?t)[\s\S]*?<\/h2>/gi,
      '<h2$1>What people think this is — and what it means</h2>',
    )
    .replace(/<h2([^>]*)>\s*What validates[\s\S]*?<\/h2>/gi, '<h2$1>What holds up in the room</h2>')
    .replace(/<h2([^>]*)>\s*Goldilocks squeeze[\s\S]*?<\/h2>/gi, '<h2$1>The workable middle</h2>')
    .replace(/<h2([^>]*)>\s*Honesty rail[\s\S]*?<\/h2>/gi, '<h2$1>Seatbelts at the pier</h2>')
    .replace(
      /<h2([^>]*)>\s*Working the rhyme without[\s\S]*?<\/h2>/gi,
      '<h2$1>Working the rhyme in practice</h2>',
    )
    .replace(/<h2([^>]*)>\s*What .* refuse[\s\S]*?<\/h2>/gi, '<h2$1>Where the brakes still matter</h2>');
}

let changed = 0;
const stillFail = [];
for (const file of listShipBlogHtmlFiles()) {
  const html = readFileSync(file, 'utf8');
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!articleMatch) continue;
  const article = articleMatch[0];
  const honestyMatch = article.match(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i);
  let before = article;
  let honesty = '';
  let after = '';
  if (honestyMatch) {
    const idx = article.indexOf(honestyMatch[0]);
    before = article.slice(0, idx);
    honesty = honestyMatch[0];
    after = article.slice(idx + honestyMatch[0].length);
  }
  // Scrub only pre-honesty body (keep Soft Story in honesty if present)
  let newBefore = scrubBodySegment(before);
  newBefore = renameRefusalH2(newBefore);
  const newArticle = honesty ? newBefore + honesty + after : newBefore;
  if (newArticle === article) {
    const v = journalismVoiceSmell(html);
    if (!v.passes) stillFail.push(file.split('/').pop());
    continue;
  }
  const next = html.replace(article, newArticle);
  writeFileSync(file, next);
  changed++;
  const v = journalismVoiceSmell(next);
  if (!v.passes) {
    stillFail.push(
      `${file.split('/').pop()}: soft=${v.softStory} r=${v.refusalH2} c=${v.doesNotClaim} m=${v.metaJargon}`,
    );
  }
}

console.log(JSON.stringify({ changed, stillFailCount: stillFail.length, stillFail: stillFail.slice(0, 40) }, null, 2));
