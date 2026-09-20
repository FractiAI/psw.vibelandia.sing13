#!/usr/bin/env node
/**
 * Kitchen-table phrase pass for ship-blog HTML.
 * Softens empty-workshop unemployment metaphors; does NOT invent thesis.
 * Deep rewrites still belong to authors / agents.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { listShipBlogHtmlFiles, auditShipBlogFile } from '../lib/ship-blog-magazine.mjs';

const REPLACEMENTS = [
  [/empty workshops?/gi, 'empty paychecks'],
  [/empty rooms?/gi, 'quiet job boards'],
  [/quieter benches?/gi, 'thinner paychecks'],
  [/benches (?:are |still )?empty/gi, 'paychecks are thinner'],
  [/fill the (?:room|workshops?)/gi, 'put food on the table'],
  [/shop floor (?:stays |still )?empty/gi, 'job board stays thin'],
  [/empty of people who actually ship/gi, 'empty of people with steady work'],
  [/the workshops are still empty/gi, 'the paychecks are still thinning'],
  [/Keep the benches open/gi, 'Keep people able to work'],
  [/keep the benches open/gi, 'keep people able to work'],
];

const results = [];
for (const path of listShipBlogHtmlFiles()) {
  let html = readFileSync(path, 'utf8');
  // Only rewrite article body (leave honesty rail Soft Story alone)
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (!artMatch) continue;
  let article = artMatch[0];
  const honesty = article.match(/<p[^>]*class="[^"]*honesty[^"]*"[\s\S]*?<\/p>/i);
  let body = article;
  let honestyHtml = '';
  if (honesty) {
    honestyHtml = honesty[0];
    body = article.replace(honestyHtml, '___HONESTY___');
  }
  let changed = false;
  for (const [re, to] of REPLACEMENTS) {
    const next = body.replace(re, to);
    if (next !== body) {
      changed = true;
      body = next;
    }
  }
  if (!changed) continue;
  if (honestyHtml) body = body.replace('___HONESTY___', honestyHtml);
  html = html.replace(artMatch[0], body);
  writeFileSync(path, html);
  const a = auditShipBlogFile(path);
  results.push({
    file: path.split('/').pop(),
    ok: a.passesLength && a.honestyEnd && a.voice.passes,
    empty: a.voice.emptyWorkshopMetaphor,
    everyday: a.voice.everydayAnchors,
  });
}

console.log(JSON.stringify({ changed: results.length, results }, null, 2));
