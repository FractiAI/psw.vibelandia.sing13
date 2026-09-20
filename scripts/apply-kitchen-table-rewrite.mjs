#!/usr/bin/env node
/**
 * Apply kitchen-table body rewrites to ship-blog HTML files.
 * Preserves: DOCTYPE/head/CSS, nav, honesty, Fair Exchange, CTA, footer, scripts.
 * Replaces: header + article prose before honesty (or lead→honesty when no header inside article).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';
import { BODIES as A } from './_rewrite_batch_a_bodies.mjs';
import { BODIES as B } from './_rewrite_batch_b_bodies.mjs';
import { BODIES as B2 } from './_rewrite_batch_b2_bodies.mjs';
import { BODIES as C } from './_rewrite_batch_c_bodies.mjs';

const BODIES = { ...A, ...B, ...B2, ...C };
const DIR = join(process.cwd(), 'interfaces');

function applyOne(name, bodyHtml) {
  const path = join(DIR, name);
  let html = readFileSync(path, 'utf8');
  const honestyRe = /<p[^>]*class="[^"]*honesty[^"]*"[^>]*>[\s\S]*?<\/p>/i;
  const honestyMatch = html.match(honestyRe);
  if (!honestyMatch) throw new Error(`No honesty in ${name}`);

  // Special: frontiersman — article starts after outer header; replace from <p class="lead"> to honesty
  if (name === 'blog-frontiersman-voyage-2026-08.html') {
    const artIdx = html.indexOf('<article');
    const honestyIdx = html.indexOf(honestyMatch[0]);
    if (artIdx < 0 || honestyIdx < 0) throw new Error('frontiersman markers missing');
    const beforeArt = html.slice(0, artIdx);
    // Keep article open tag
    const artOpenEnd = html.indexOf('>', artIdx) + 1;
    const afterHonestyStart = honestyIdx;
    const rest = html.slice(afterHonestyStart);
    // Also refresh eyebrow/title in outer header lightly — keep structure
    html = beforeArt + html.slice(artIdx, artOpenEnd) + '\n' + bodyHtml + '\n' + rest;
  } else {
    // Replace from first <header> inside article (or first lead) through honesty
    const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
    if (!articleMatch) throw new Error(`No article in ${name}`);
    let art = articleMatch[0];
    const navMatch = art.match(/<nav[\s\S]*?<\/nav>/i);
    if (!navMatch) throw new Error(`No nav in ${name}`);
    const afterNav = art.indexOf(navMatch[0]) + navMatch[0].length;
    const honestyInArt = art.match(honestyRe);
    if (!honestyInArt) throw new Error(`No honesty in article ${name}`);
    const honIdx = art.indexOf(honestyInArt[0]);
    const newArt =
      art.slice(0, afterNav) +
      '\n' +
      bodyHtml.trim() +
      '\n\n' +
      art.slice(honIdx);
    html = html.replace(articleMatch[0], newArt);
  }

  // Fix double honesty Fair Exchange class on everything-is-connected
  if (name === 'blog-everything-is-connected-2026-08.html') {
    html = html.replace(
      /<p class="honesty"><strong>Fair Exchange Notice:<\/strong>[\s\S]*?<\/p>/i,
      '<p><em>Fair Exchange:</em> a portion of transaction value remains subject to refund or adjustment depending on resonance, utility, and depth of delivery.</p>',
    );
  }

  writeFileSync(path, html);
  const a = auditShipBlogFile(path);
  return {
    file: name,
    words: a.words,
    passesLength: a.passesLength,
    honestyEnd: a.honestyEnd,
    voice: a.voice.passes,
    soft: a.voice.softStory,
    empty: a.voice.emptyWorkshopMetaphor,
    everyday: a.voice.everydayAnchors,
    dnc: a.voice.doesNotClaim,
    refusal: a.voice.refusalH2,
    meta: a.voice.metaJargon,
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
  };
}

const results = [];
for (const [name, body] of Object.entries(BODIES)) {
  try {
    results.push(applyOne(name, body));
  } catch (e) {
    results.push({ file: name, error: String(e), ok: false });
  }
}

const fails = results.filter((r) => !r.ok);
console.log(JSON.stringify({ rewritten: results.length, fails: fails.length, results }, null, 2));
